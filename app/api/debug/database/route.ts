

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  let dbConnected = false
  
  try {
    console.log('🔍 [DB-DEBUG] Starting database debug...')
    
    // Verificar se é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    // Verificar variável de ambiente DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL
    console.log('🔍 [DB-DEBUG] DATABASE_URL check:', {
      exists: !!databaseUrl,
      length: databaseUrl?.length || 0,
      preview: databaseUrl?.substring(0, 50) + '...' || 'NOT SET'
    })

    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL environment variable not set',
        environment: {
          DATABASE_URL: 'NOT SET'
        }
      }, { status: 500 })
    }

    // Testar conexão com o banco
    try {
      console.log('🔌 [DB-DEBUG] Testing database connection...')
      await prisma.$connect()
      dbConnected = true
      console.log('✅ [DB-DEBUG] Database connection successful')
    } catch (error) {
      console.error('❌ [DB-DEBUG] Database connection failed:', error)
      return NextResponse.json({
        error: 'Database connection failed',
        details: String(error),
        databaseUrl: databaseUrl?.substring(0, 50) + '...'
      }, { status: 500 })
    }

    // Contar total de estudantes
    const studentCount = await prisma.student.count()
    console.log('🔍 [DEBUG] Total students in database:', studentCount)

    // Buscar alguns estudantes de exemplo
    const sampleStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        timestamp: true,
        createdAt: true,
      }
    })
    console.log('🔍 [DEBUG] Sample students:', sampleStudents)

    // Verificar estrutura da tabela
    const tableInfo = await prisma.$executeRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    console.log('🔍 [DEBUG] Students table structure:', tableInfo)

    // Verificar se há dados recentes (últimas 24h)
    const recentStudents = await prisma.student.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    console.log('🔍 [DEBUG] Recent students (last 24h):', recentStudents)

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        totalStudents: studentCount,
        recentStudents,
        sampleStudents,
        tableStructure: tableInfo
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Database debug error:', error)
    return NextResponse.json({
      error: 'Database debug failed',
      details: String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

