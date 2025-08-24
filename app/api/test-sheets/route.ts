

import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Testing Google Sheets connection...')
    
    // URL params para testar com diferentes IDs
    const { searchParams } = new URL(request.url)
    const testSpreadsheetId = searchParams.get('id') || process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const testRange = searchParams.get('range') || process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z'
    
    console.log('🧪 [TEST] Using parameters:')
    console.log('- Spreadsheet ID:', testSpreadsheetId)
    console.log('- Range:', testRange)
    
    if (!testSpreadsheetId) {
      return NextResponse.json({
        error: 'No spreadsheet ID provided. Use ?id=YOUR_SPREADSHEET_ID'
      }, { status: 400 })
    }
    
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      return NextResponse.json({
        error: 'GOOGLE_SERVICE_ACCOUNT_KEY not configured'
      }, { status: 400 })
    }

    // Testar com diferentes formatos de URL de planilha
    const extractedId = extractSpreadsheetId(testSpreadsheetId)
    console.log('🧪 [TEST] Extracted ID:', extractedId)

    const sheetsService = new GoogleSheetsService({
      serviceAccountKey,
      spreadsheetId: extractedId,
      range: testRange
    })

    const data = await sheetsService.getSheetData()
    
    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful!',
      data: {
        spreadsheetId: extractedId,
        range: testRange,
        totalRows: data.length,
        headers: data[0] || [],
        sampleData: data.slice(1, 4), // Primeiras 3 linhas de dados
        fullData: data // Para debug
      }
    })

  } catch (error) {
    console.error('❌ [TEST] Google Sheets test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Google Sheets connection failed',
      details: String(error)
    }, { status: 500 })
  }
}

function extractSpreadsheetId(input: string): string {
  // Se já é um ID (não contém /), retorna como está
  if (!input.includes('/')) {
    return input
  }
  
  // Extrair ID da URL completa
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (match) {
    return match[1]
  }
  
  // Fallback: assumir que é o próprio ID
  return input
}

