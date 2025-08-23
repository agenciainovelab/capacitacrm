
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🧪 [TEST] Testing Google Sheets connection...')
    
    // Check environment variables
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const range = process.env.GOOGLE_SHEETS_RANGE

    if (!serviceAccountKey || !spreadsheetId || !range) {
      return NextResponse.json({
        ok: false,
        error: 'Missing environment variables',
        details: {
          hasServiceAccountKey: !!serviceAccountKey,
          hasSpreadsheetId: !!spreadsheetId,
          hasRange: !!range
        }
      }, { status: 400 })
    }

    console.log('✅ [TEST] Environment variables found')

    // Parse the service account key
    let credentials
    try {
      credentials = JSON.parse(serviceAccountKey)
      console.log('✅ [TEST] Service account key parsed successfully')
    } catch (parseError) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid JSON in service account key',
        details: parseError
      }, { status: 400 })
    }

    // Create JWT client
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    console.log('✅ [TEST] JWT client created')

    // Test authentication
    try {
      await jwtClient.authorize()
      console.log('✅ [TEST] Authentication successful')
    } catch (authError) {
      return NextResponse.json({
        ok: false,
        error: 'Authentication failed',
        details: authError
      }, { status: 401 })
    }

    // Create Sheets API client
    const sheets = google.sheets({ version: 'v4', auth: jwtClient })

    // Test spreadsheet access
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:J1', // Just get first row to test
      })

      const values = response.data.values || []
      
      return NextResponse.json({
        ok: true,
        message: 'Google Sheets connection successful',
        details: {
          spreadsheetId,
          range,
          headersFound: values.length > 0 ? values[0] : [],
          rowsAvailable: values.length
        }
      })

    } catch (sheetsError) {
      return NextResponse.json({
        ok: false,
        error: 'Failed to access spreadsheet',
        details: sheetsError
      }, { status: 403 })
    }

  } catch (error) {
    console.error('❌ [TEST] Connection test failed:', error)
    return NextResponse.json({
      ok: false,
      error: 'Unexpected error during test',
      details: error
    }, { status: 500 })
  }
}
