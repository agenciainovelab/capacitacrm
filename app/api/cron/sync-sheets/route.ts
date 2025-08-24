

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Construir URL para o endpoint de sync com a chave secreta
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const syncUrl = `${baseUrl}/api/sync/sheets-to-pg?key=${process.env.SYNC_SECRET}`
    
    console.log('🕐 Cron job: Starting scheduled Google Sheets sync...')
    
    // Chamar o endpoint de sincronização
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'CapacitaCRM-Cron/1.0',
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Cron sync completed successfully:', result)
      return NextResponse.json({
        success: true,
        message: 'Scheduled sync completed successfully',
        ...result
      })
    } else {
      console.error('❌ Cron sync failed:', result)
      return NextResponse.json({
        success: false,
        message: 'Scheduled sync failed',
        ...result
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: 'Cron job failed',
      message: String(error)
    }, { status: 500 })
  }
}

