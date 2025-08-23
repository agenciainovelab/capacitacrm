
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received address update data:', body)
    
    const { email, city, fullAddress, cep } = body

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Preparar dados de forma segura
    const updateData = {
      city: city ? String(city).trim() : null,
      fullAddress: fullAddress ? String(fullAddress).trim() : null,
      cep: cep ? String(cep).trim() : null,
      addressCompleted: true
    }
    
    console.log('Update data prepared:', updateData)
    
    // Atualizar o endereço do aluno
    const student = await prisma.student.update({
      where: { email: email.toLowerCase().trim() },
      data: updateData
    })

    console.log('Address updated for student:', email)

    const response = NextResponse.json({
      success: true,
      student: {
        ...student,
        id: student.id.toString()
      }
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error updating student address:', error)
    const errorResponse = NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
