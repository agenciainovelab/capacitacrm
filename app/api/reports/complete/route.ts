
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Relatório completo do sistema
export async function GET(request: NextRequest) {
  try {
    // Get comprehensive student data with attendance info
    const students = await prisma.student.findMany({
      include: {
        _count: {
          select: { Attendance: true }
        },
        Attendance: {
          orderBy: { joinedAt: 'desc' },
          take: 1,
          select: {
            joinedAt: true,
            watchedSec: true,
            LiveEvent: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })

    // Get live events data
    const lives = await prisma.liveEvent.findMany({
      include: {
        _count: {
          select: { Attendance: true }
        }
      },
      orderBy: { startsAt: 'desc' }
    })

    // Calculate total watch time for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const totalStats = await prisma.attendance.aggregate({
          where: { studentId: student.id },
          _sum: { watchedSec: true }
        })

        return {
          ...student,
          id: student.id.toString(),
          totalWatched: totalStats._sum.watchedSec || 0,
          lastAttendance: student.Attendance[0]?.joinedAt || null,
          lastLiveTitle: student.Attendance[0]?.LiveEvent.title || null
        }
      })
    )

    // System statistics
    const stats = {
      totalStudents: students.length,
      totalLives: lives.length,
      totalAttendanceRecords: await prisma.attendance.count(),
      averageAttendancePerLive: lives.length > 0 ? 
        Math.round((await prisma.attendance.count()) / lives.length) : 0,
      studentsWithPhones: students.filter(s => s.phone).length,
      modalityDistribution: {
        presencial: students.filter(s => s.studyStyle === 'Presencial').length,
        online: students.filter(s => s.studyStyle === 'Online').length,
        hibrido: students.filter(s => s.studyStyle === 'Híbrido').length
      },
      genderDistribution: {
        masculino: students.filter(s => s.sex === 'Masculino').length,
        feminino: students.filter(s => s.sex === 'Feminino').length,
        outro: students.filter(s => s.sex === 'Outro').length
      }
    }

    // Headers anti-cache
    const response = NextResponse.json({
      students: studentsWithStats,
      lives: lives.map(live => ({
        ...live,
        id: live.id.toString()
      })),
      stats,
      generatedAt: new Date().toISOString()
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', '*')
    
    return response
  } catch (error) {
    console.error('Error generating complete report:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
