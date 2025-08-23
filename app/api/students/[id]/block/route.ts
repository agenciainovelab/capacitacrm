
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Bloquear aluno
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()

    const updatedStudent = await prisma.student.update({
      where: { id: BigInt(params.id) },
      data: {
        // Adding a blocked status to the model would be needed
        // For now, we'll add a note to the fullAddress field as a workaround
        fullAddress: `[BLOQUEADO: ${reason}] ${await prisma.student.findUnique({
          where: { id: BigInt(params.id) },
          select: { fullAddress: true }
        }).then(s => s?.fullAddress || '')}`
      }
    })

    const serializedStudent = {
      ...updatedStudent,
      id: updatedStudent.id.toString()
    }

    return NextResponse.json(serializedStudent)
  } catch (error) {
    console.error('Error blocking student:', error)
    return NextResponse.json({ error: 'Erro ao bloquear aluno' }, { status: 500 })
  }
}
