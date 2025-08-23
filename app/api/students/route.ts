
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache invalidation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const sex = searchParams.get('sex') || ''
    const studyStyle = searchParams.get('studyStyle') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (city && city !== 'all') {
      where.city = { contains: city, mode: 'insensitive' }
    }
    
    if (sex && sex !== 'all') {
      where.sex = sex
    }
    
    if (studyStyle && studyStyle !== 'all') {
      where.studyStyle = studyStyle
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          _count: {
            select: { Attendance: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.student.count({ where })
    ])

    // Headers anti-cache
    const response = NextResponse.json({
      students: students.map(s => ({
        ...s,
        id: s.id.toString()
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', '*')
    
    return response
  } catch (error) {
    console.error('Error fetching students:', error)
    const errorResponse = NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating student with data:', body)
    
    // Validação básica
    if (!body.email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }
    
    const student = await prisma.student.create({
      data: {
        name: body.name?.trim() || null,
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.replace(/\D/g, '') || null,
        birthDate: body.birthDate || null,
        city: body.city?.trim() || null,
        fullAddress: body.fullAddress?.trim() || null,
        sex: body.sex?.trim() || null,
        studyStyle: body.studyStyle?.trim() || null,
        howFoundUs: body.howFoundUs?.trim() || null
      },
      include: {
        _count: {
          select: { Attendance: true }
        }
      }
    })

    console.log('Student created:', student)

    // Headers anti-cache
    const response = NextResponse.json({
      ...student,
      id: student.id.toString()
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error creating student:', error)
    const errorResponse = NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return errorResponse
  }
}
