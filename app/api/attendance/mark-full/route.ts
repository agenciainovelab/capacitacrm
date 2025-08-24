
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { liveId } = await request.json()
    const studentId = BigInt(session.user.id)
    const liveIdBigInt = BigInt(liveId)

    const attendance = await prisma.attendance.update({
      where: {
        studentId_liveId: {
          studentId,
          liveId: liveIdBigInt
        }
      },
      data: {
        fullWatched: true
      }
    })

    return NextResponse.json({
      ...attendance,
      id: attendance.id.toString(),
      studentId: attendance.studentId.toString(),
      liveId: attendance.liveId.toString()
    })
  } catch (error) {
    console.error('Error marking full watched:', error)
    return NextResponse.json({ error: 'Failed to mark as fully watched' }, { status: 500 })
  }
}
