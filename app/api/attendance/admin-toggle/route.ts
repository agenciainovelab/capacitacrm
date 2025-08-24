
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { liveEventId, studentId, markAsPresent } = body

    if (markAsPresent) {
      // Marcar como presente - criar registro de attendance
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: BigInt(studentId),
          liveId: BigInt(liveEventId)
        }
      })

      if (!existingAttendance) {
        await prisma.attendance.create({
          data: {
            studentId: BigInt(studentId),
            liveId: BigInt(liveEventId),
            joinedAt: new Date(),
            watchedSec: 0 // Admin marcou manualmente
          }
        })
      }
    } else {
      // Marcar como ausente - remover registro de attendance
      await prisma.attendance.deleteMany({
        where: {
          studentId: BigInt(studentId),
          liveId: BigInt(liveEventId)
        }
      })
    }

    // Headers anti-cache
    const response = NextResponse.json({ 
      success: true, 
      message: markAsPresent ? 'Aluno marcado como presente' : 'Aluno marcado como ausente'
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error toggling attendance:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
