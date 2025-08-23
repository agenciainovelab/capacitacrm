
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const liveId = BigInt(params.id) // Use BigInt instead of parseInt
    
    const live = await prisma.liveEvent.findUnique({
      where: { id: liveId },
      include: {
        Attendance: {
          include: {
            Student: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                studyStyle: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        },
        _count: {
          select: { Attendance: true }
        }
      }
    })

    if (!live) {
      return NextResponse.json({ error: 'Live não encontrada' }, { status: 404 })
    }

    // Convert BigInt to string for JSON serialization
    const serializedLive = {
      ...live,
      id: live.id.toString(),
      Attendance: live.Attendance.map(att => ({
        ...att,
        id: att.id.toString(),
        studentId: att.studentId.toString(),
        liveId: att.liveId.toString(),
        Student: {
          ...att.Student,
          id: att.Student.id.toString()
        }
      }))
    }

    // Headers anti-cache
    const response = NextResponse.json(serializedLive)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', '*')
    
    return response
  } catch (error) {
    console.error('Error fetching live:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const liveId = BigInt(params.id) // Use BigInt
    const body = await request.json()
    
    // Validação básica
    if (!body.title || !body.slug || !body.startsAt) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando: title, slug, startsAt' }, { status: 400 })
    }
    
    if (!body.youtubeId?.trim()) {
      return NextResponse.json({ error: 'ID do YouTube é obrigatório' }, { status: 400 })
    }
    
    if (!body.durationMin || isNaN(parseInt(body.durationMin))) {
      return NextResponse.json({ error: 'Duração em minutos é obrigatória' }, { status: 400 })
    }
    
    // Calcular endsAt baseado em startsAt + durationMin
    const startsAt = new Date(body.startsAt)
    const durationMin = parseInt(body.durationMin)
    const endsAt = new Date(startsAt.getTime() + (durationMin * 60 * 1000))
    
    const live = await prisma.liveEvent.update({
      where: { id: liveId },
      data: {
        title: body.title.trim(),
        slug: body.slug.trim(),
        youtubeId: body.youtubeId.trim(),
        startsAt: startsAt,
        endsAt: endsAt,
        durationMin: durationMin,
        isActive: Boolean(body.isActive ?? true)
      }
    })

    console.log('Live updated successfully:', live)

    // Convert BigInt to string for JSON serialization
    const responseData = {
      ...live,
      id: live.id.toString()
    }

    // Headers anti-cache
    const response = NextResponse.json(responseData)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error updating live:', error)
    
    let errorMessage = 'Erro interno'
    let details = error instanceof Error ? error.message : 'Unknown error'
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      errorMessage = 'Já existe uma live com esse slug'
      details = 'Tente usar um título diferente ou altere o slug manualmente'
    }
    
    const errorResponse = NextResponse.json({ 
      error: errorMessage, 
      details: details
    }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // PATCH funciona igual ao PUT neste caso
  return PUT(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const liveId = BigInt(params.id) // Use BigInt consistently
    
    // Primeiro deletar os registros de attendance
    await prisma.attendance.deleteMany({
      where: { liveId: liveId }
    })
    
    // Depois deletar a live
    await prisma.liveEvent.delete({
      where: { id: liveId }
    })

    // Headers anti-cache
    const response = NextResponse.json({ message: 'Live excluída com sucesso' })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error deleting live:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
