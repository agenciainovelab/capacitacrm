
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const lives = await prisma.liveEvent.findMany({
      include: {
        _count: {
          select: { Attendance: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert BigInt to string for JSON serialization
    const serializedLives = lives.map(live => ({
      ...live,
      id: live.id.toString()
    }))

    // Headers anti-cache
    const response = NextResponse.json(serializedLives)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', '*')
    
    return response
  } catch (error) {
    console.error('Error fetching lives:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received live data:', body)
    
    // Validação básica
    if (!body.title || !body.slug || !body.startsAt) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando: title, slug, startsAt' }, { status: 400 })
    }
    
    // Verificar campos obrigatórios adicionais
    if (!body.youtubeId?.trim()) {
      return NextResponse.json({ error: 'ID do YouTube é obrigatório' }, { status: 400 })
    }
    
    if (!body.durationMin || isNaN(parseInt(body.durationMin))) {
      return NextResponse.json({ error: 'Duração em minutos é obrigatória' }, { status: 400 })
    }
    
    // Preparar dados com cálculo de endsAt
    const startsAt = new Date(body.startsAt)
    const durationMin = parseInt(body.durationMin)
    const endsAt = new Date(startsAt.getTime() + (durationMin * 60 * 1000)) // Adicionar minutos em ms
    
    const liveData = {
      title: body.title.trim(),
      slug: body.slug.trim(),
      youtubeId: body.youtubeId.trim(),
      startsAt: startsAt,
      endsAt: endsAt,
      durationMin: durationMin,
      isActive: Boolean(body.isActive ?? true)
    }

    console.log('Formatted live data:', liveData)

    const live = await prisma.liveEvent.create({
      data: liveData
    })

    // Convert BigInt to string for JSON serialization
    const responseData = {
      ...live,
      id: live.id.toString()
    }

    console.log('Live created successfully:', live)

    // Headers anti-cache
    const response = NextResponse.json(responseData)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error creating live:', error)
    
    // Melhor tratamento de erros
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
