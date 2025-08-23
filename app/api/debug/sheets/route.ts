

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { GoogleSheetsService } from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SHEETS-DEBUG] Starting Google Sheets debug...')
    
    // Verificar se é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    // Verificar variáveis de ambiente
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const range = process.env.GOOGLE_SHEETS_RANGE

    console.log('🔍 [SHEETS-DEBUG] Environment variables check:')
    console.log('- GOOGLE_SERVICE_ACCOUNT_KEY:', serviceAccountKey ? `SET (length: ${serviceAccountKey.length})` : 'NOT SET')
    console.log('- GOOGLE_SHEETS_SPREADSHEET_ID:', spreadsheetId || 'NOT SET')
    console.log('- GOOGLE_SHEETS_RANGE:', range || 'NOT SET')

    // Verificar cada variável individualmente
    const missingVars = []
    if (!serviceAccountKey) missingVars.push('GOOGLE_SERVICE_ACCOUNT_KEY')
    if (!spreadsheetId) missingVars.push('GOOGLE_SHEETS_SPREADSHEET_ID')  
    if (!range) missingVars.push('GOOGLE_SHEETS_RANGE')

    if (missingVars.length > 0) {
      console.error('❌ [SHEETS-DEBUG] Missing environment variables:', missingVars)
      return NextResponse.json({
        error: 'Missing environment variables',
        missingVariables: missingVars,
        details: {
          GOOGLE_SERVICE_ACCOUNT_KEY: !!serviceAccountKey,
          GOOGLE_SHEETS_SPREADSHEET_ID: !!spreadsheetId,
          GOOGLE_SHEETS_RANGE: !!range
        },
        help: 'Please check your .env file and make sure all Google Sheets variables are set'
      }, { status: 400 })
    }

    // Testar parsing do service account
    let credentials
    try {
      credentials = JSON.parse(serviceAccountKey!.replace(/\\n/g, '\n'))
      console.log('✅ [DEBUG] Service account key parsed successfully')
      console.log('- Client email:', credentials.client_email)
      console.log('- Project ID:', credentials.project_id)
    } catch (error) {
      console.error('❌ [DEBUG] Failed to parse service account key:', error)
      return NextResponse.json({
        error: 'Invalid service account key format',
        details: String(error)
      }, { status: 400 })
    }

    // Tentar inicializar Google Sheets service
    let sheetsService
    try {
      sheetsService = new GoogleSheetsService({
        serviceAccountKey: serviceAccountKey!,
        spreadsheetId: spreadsheetId!,
        range: range!
      })
      console.log('✅ [DEBUG] Google Sheets service initialized')
    } catch (error) {
      console.error('❌ [DEBUG] Failed to initialize Google Sheets service:', error)
      return NextResponse.json({
        error: 'Failed to initialize Google Sheets service',
        details: String(error)
      }, { status: 500 })
    }

    // Tentar buscar dados da planilha
    let sheetData
    try {
      console.log('🔍 [DEBUG] Fetching data from spreadsheet...')
      console.log('- Spreadsheet ID:', spreadsheetId)
      console.log('- Range:', range)
      
      sheetData = await sheetsService.getSheetData()
      console.log('✅ [DEBUG] Sheet data fetched successfully')
      console.log('- Total rows:', sheetData.length)
      console.log('- First few rows:', sheetData.slice(0, 3))
    } catch (error) {
      console.error('❌ [DEBUG] Failed to fetch sheet data:', error)
      return NextResponse.json({
        error: 'Failed to fetch sheet data',
        details: String(error),
        spreadsheetId,
        range
      }, { status: 500 })
    }

    if (!sheetData || sheetData.length === 0) {
      return NextResponse.json({
        error: 'No data found in spreadsheet',
        spreadsheetId,
        range,
        sheetData
      }, { status: 404 })
    }

    // Analisar cabeçalhos
    const [headers, ...rows] = sheetData
    console.log('🔍 [DEBUG] Headers analysis:')
    console.log('- Headers found:', headers)
    console.log('- Number of headers:', headers.length)
    console.log('- Data rows:', rows.length)

    // Criar mapeamento
    const columnMapping = GoogleSheetsService.createColumnMapping(headers)
    console.log('🔍 [DEBUG] Column mapping:', Object.fromEntries(columnMapping))

    // Analisar primeira linha de dados
    if (rows.length > 0) {
      const firstRow = rows[0]
      console.log('🔍 [DEBUG] First data row:', firstRow)
      
      // Testar processamento da primeira linha
      const emailIndex = columnMapping.get('email')
      const emailValue = emailIndex !== undefined ? firstRow[emailIndex] : 'NOT_FOUND'
      const normalizedEmail = GoogleSheetsService.normalizeEmail(emailValue || '')
      
      console.log('🔍 [DEBUG] Email processing:')
      console.log('- Email index:', emailIndex)
      console.log('- Raw email value:', emailValue)
      console.log('- Normalized email:', normalizedEmail)

      // Testar processamento de telefone
      const phoneIndex = columnMapping.get('phone')
      const phoneValue = phoneIndex !== undefined ? firstRow[phoneIndex] : 'NOT_FOUND'
      const normalizedPhone = GoogleSheetsService.normalizePhone(phoneValue || '')
      
      console.log('🔍 [DEBUG] Phone processing:')
      console.log('- Phone index:', phoneIndex)
      console.log('- Raw phone value:', phoneValue)
      console.log('- Normalized phone:', normalizedPhone)
    }

    return NextResponse.json({
      success: true,
      debug: {
        environmentVariables: {
          serviceAccountKey: !!serviceAccountKey,
          spreadsheetId: !!spreadsheetId,
          range: !!range
        },
        credentials: {
          clientEmail: credentials.client_email,
          projectId: credentials.project_id
        },
        sheetData: {
          totalRows: sheetData.length,
          headers,
          dataRows: rows.length,
          firstDataRow: rows[0] || null,
          columnMapping: Object.fromEntries(columnMapping)
        }
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: String(error)
    }, { status: 500 })
  }
}

