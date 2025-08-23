
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Buscar resumo de presença (presentes vs ausentes)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const liveId = BigInt(params.id)
    
    // Get all attendance records for this live
    const attendance = await prisma.attendance.findMany({
      where: { liveId },
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
      }
    })

    // Get all students
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true
      }
    })

    // Students who attended
    const attendedStudentIds = attendance.map(a => a.studentId.toString())
    const presentStudents = attendance.map(a => ({
      ...a.Student,
      id: a.Student.id.toString(),
      watchedSec: a.watchedSec,
      fullWatched: a.fullWatched,
      joinedAt: a.joinedAt
    }))

    // Students who didn't attend
    const absentStudents = allStudents
      .filter(student => !attendedStudentIds.includes(student.id.toString()))
      .map(student => ({
        ...student,
        id: student.id.toString()
      }))

    return NextResponse.json({
      liveId: params.id,
      totalStudents: allStudents.length,
      present: presentStudents,
      absent: absentStudents,
      presentCount: presentStudents.length,
      absentCount: absentStudents.length,
      attendanceRate: allStudents.length > 0 ? 
        Math.round((presentStudents.length / allStudents.length) * 100) : 0
    })
  } catch (error) {
    console.error('Error fetching attendance summary:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
