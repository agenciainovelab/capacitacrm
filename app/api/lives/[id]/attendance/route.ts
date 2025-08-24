
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Buscar presenças de uma live específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { liveId: BigInt(params.id) },
      include: {
        Student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Serialize BigInt fields
    const serializedAttendance = attendance.map(record => ({
      ...record,
      id: record.id.toString(),
      studentId: record.studentId.toString(),
      liveId: record.liveId.toString(),
      Student: {
        ...record.Student,
        id: record.Student.id.toString()
      }
    }))

    return NextResponse.json(serializedAttendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
