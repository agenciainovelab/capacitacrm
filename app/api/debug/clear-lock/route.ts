

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SYNC_LOCK_KEY = 123456789

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    console.log('🔓 [CLEAR-LOCK] Clearing sync lock...')
    
    // Limpar o lock
    await prisma.$executeRaw`SELECT pg_advisory_unlock(${SYNC_LOCK_KEY})`
    
    // Limpar todos os locks se necessário
    await prisma.$executeRaw`SELECT pg_advisory_unlock_all()`
    
    console.log('✅ [CLEAR-LOCK] Lock cleared successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Sync lock cleared successfully'
    })

  } catch (error) {
    console.error('❌ [CLEAR-LOCK] Error clearing lock:', error)
    return NextResponse.json({
      error: 'Failed to clear lock',
      details: String(error)
    }, { status: 500 })
  }
}

