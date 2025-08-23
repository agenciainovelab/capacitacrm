

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    console.log('🔍 [ENV-DEBUG] Starting environment debug...')
    
    // Verificar todas as variáveis importantes
    const envVars = {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        preview: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT SET'
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT SET'
      },
      GOOGLE_SERVICE_ACCOUNT_KEY: {
        exists: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        length: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.length || 0,
        isValidJSON: false,
        parsed: null as any
      },
      GOOGLE_SHEETS_SPREADSHEET_ID: {
        exists: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        value: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'NOT SET'
      },
      GOOGLE_SHEETS_RANGE: {
        exists: !!process.env.GOOGLE_SHEETS_RANGE,
        value: process.env.GOOGLE_SHEETS_RANGE || 'NOT SET'
      },
      SYNC_SECRET: {
        exists: !!process.env.SYNC_SECRET,
        length: process.env.SYNC_SECRET?.length || 0
      }
    }

    // Testar parsing do Service Account Key
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'))
        envVars.GOOGLE_SERVICE_ACCOUNT_KEY.isValidJSON = true
        envVars.GOOGLE_SERVICE_ACCOUNT_KEY.parsed = {
          client_email: parsed.client_email,
          project_id: parsed.project_id,
          type: parsed.type
        }
      } catch (error) {
        console.error('❌ [ENV-DEBUG] Service account key parse error:', error)
        envVars.GOOGLE_SERVICE_ACCOUNT_KEY.parsed = { error: String(error) }
      }
    }

    console.log('🔍 [ENV-DEBUG] Environment variables check:', envVars)

    return NextResponse.json({
      success: true,
      environment: envVars,
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version
    })

  } catch (error) {
    console.error('❌ [ENV-DEBUG] Environment debug error:', error)
    return NextResponse.json({
      error: 'Environment debug failed',
      details: String(error)
    }, { status: 500 })
  }
}

