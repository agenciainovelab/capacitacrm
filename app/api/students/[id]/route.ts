
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = BigInt(params.id)
    const body = await request.json()
    console.log('Updating student with data:', body, 'ID:', params.id)
    
    // Validação básica
    if (!body.email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }
    
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: body.name?.trim() || null,
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.replace(/\D/g, '') || null,
        city: body.city?.trim() || null,
        sex: body.sex?.trim() || null,
        studyStyle: body.studyStyle?.trim() || null
      },
      include: {
        _count: {
          select: { Attendance: true }
        }
      }
    })

    console.log('Student updated:', student)

    // Headers anti-cache
    const response = NextResponse.json({
      ...student,
      id: student.id.toString()
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error updating student:', error)
    const errorResponse = NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = BigInt(params.id)
    
    // Primeiro deletar os registros de attendance
    await prisma.attendance.deleteMany({
      where: { studentId: studentId }
    })
    
    // Depois deletar o aluno
    await prisma.student.delete({
      where: { id: studentId }
    })

    // Headers anti-cache
    const response = NextResponse.json({ message: 'Aluno excluído com sucesso' })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error deleting student:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
