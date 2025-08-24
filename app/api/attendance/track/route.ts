
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { attendanceTrackSchema } from '@/data/schemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { liveId, delta } = attendanceTrackSchema.parse(body)

    const studentId = BigInt(session.user.id)
    const liveIdBigInt = BigInt(liveId)

    // Upsert attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_liveId: {
          studentId,
          liveId: liveIdBigInt
        }
      },
      update: {
        lastPingAt: new Date(),
        watchedSec: {
          increment: delta
        }
      },
      create: {
        studentId,
        liveId: liveIdBigInt,
        watchedSec: delta,
        joinedAt: new Date(),
        lastPingAt: new Date()
      }
    })

    return NextResponse.json({
      ...attendance,
      id: attendance.id.toString(),
      studentId: attendance.studentId.toString(),
      liveId: attendance.liveId.toString()
    })
  } catch (error) {
    console.error('Error tracking attendance:', error)
    return NextResponse.json({ error: 'Failed to track attendance' }, { status: 500 })
  }
}
