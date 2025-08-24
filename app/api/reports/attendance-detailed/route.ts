
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Relatório detalhado de presença por modalidade de estudo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const liveId = searchParams.get('liveId')

    let whereClause = {}
    let liveInfo = null

    if (liveId) {
      whereClause = { id: parseInt(liveId) }
      liveInfo = await prisma.liveEvent.findUnique({
        where: { id: parseInt(liveId) },
        select: { title: true, startsAt: true }
      })
    }

    // Get all students with their attendance info
    const lives = await prisma.liveEvent.findMany({
      where: whereClause,
      include: {
        Attendance: {
          include: {
            Student: {
              select: {
                id: true,
                name: true,
                email: true,
                studyStyle: true,
                city: true,
                sex: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { startsAt: 'desc' }
    })

    // Get all students for comparison
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        studyStyle: true,
        city: true,
        sex: true,
        phone: true
      }
    })

    const report: any[] = []

    for (const live of lives) {
      const presentStudents = live.Attendance.map(a => a.Student)
      const presentIds = presentStudents.map(s => s.id)
      const absentStudents = allStudents.filter(s => !presentIds.includes(s.id))

      // Categorize by study style
      const categorizedData = {
        presencial: {
          present: presentStudents.filter(s => s.studyStyle === 'Presencial'),
          absent: absentStudents.filter(s => s.studyStyle === 'Presencial')
        },
        online: {
          present: presentStudents.filter(s => s.studyStyle === 'Online'),
          absent: absentStudents.filter(s => s.studyStyle === 'Online')
        },
        hibrido: {
          present: presentStudents.filter(s => s.studyStyle === 'Híbrido'),
          absent: absentStudents.filter(s => s.studyStyle === 'Híbrido')
        },
        indefinido: {
          present: presentStudents.filter(s => !s.studyStyle || s.studyStyle === ''),
          absent: absentStudents.filter(s => !s.studyStyle || s.studyStyle === '')
        }
      }

      report.push({
        live: {
          id: live.id.toString(),
          title: live.title,
          startsAt: live.startsAt,
          totalAttendees: live.Attendance.length
        },
        attendance: categorizedData,
        summary: {
          totalPresent: presentStudents.length,
          totalAbsent: absentStudents.length,
          totalStudents: allStudents.length,
          attendanceRate: ((presentStudents.length / allStudents.length) * 100).toFixed(1),
          byModalityPresent: {
            presencial: categorizedData.presencial.present.length,
            online: categorizedData.online.present.length,
            hibrido: categorizedData.hibrido.present.length,
            indefinido: categorizedData.indefinido.present.length
          },
          byModalityAbsent: {
            presencial: categorizedData.presencial.absent.length,
            online: categorizedData.online.absent.length,
            hibrido: categorizedData.hibrido.absent.length,
            indefinido: categorizedData.indefinido.absent.length
          }
        }
      })
    }

    // Headers anti-cache
    const response = NextResponse.json({
      report,
      liveInfo,
      generatedAt: new Date().toISOString(),
      totalLives: report.length
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', '*')
    
    return response
  } catch (error) {
    console.error('Error generating attendance report:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
