
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

// Parse Brazilian date (dd/mm/yyyy) to Date
function parseBrazilianDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // JavaScript months are 0-based
  const year = parseInt(parts[2])
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  return new Date(year, month, day)
}

// Parse Brazilian timestamp (dd/mm/yyyy hh:mm:ss)
function parseBrazilianTimestamp(timestampStr: string): Date | null {
  if (!timestampStr) return null
  
  try {
    // Handle formats like "22/08/2024 14:30:15" or "22/08/2024 14:30"
    const parts = timestampStr.split(' ')
    if (parts.length < 2) return null
    
    const datePart = parts[0]
    const timePart = parts[1]
    
    const dateParts = datePart.split('/')
    if (dateParts.length !== 3) return null
    
    const day = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1
    const year = parseInt(dateParts[2])
    
    const timeParts = timePart.split(':')
    const hour = parseInt(timeParts[0]) || 0
    const minute = parseInt(timeParts[1]) || 0
    const second = parseInt(timeParts[2]) || 0
    
    return new Date(year, month, day, hour, minute, second)
  } catch (error) {
    console.error('Error parsing timestamp:', timestampStr, error)
    return null
  }
}

// Clean phone number (keep only digits)
function cleanPhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

// Normalize email
function normalizeEmail(email: string): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

async function getGoogleSheetsData(): Promise<any[][]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const range = process.env.GOOGLE_SHEETS_RANGE

  if (!spreadsheetId || !range) {
    throw new Error('Missing Google Sheets configuration')
  }

  // Load credentials from file
  const credentialsPath = path.join(process.cwd(), 'google-credentials.json')
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))

  // Create JWT client
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })

  // Authenticate
  await jwtClient.authorize()

  // Create Sheets API client
  const sheets = google.sheets({ version: 'v4', auth: jwtClient })

  // Get data from spreadsheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  return response.data.values || []
}

async function syncSheetsToPostgreSQL(): Promise<{ ok: boolean; inserted: number; skipped: number; error?: string }> {
  try {
    console.log('📊 [SYNC] Fetching data from Google Sheets...')
    const rows = await getGoogleSheetsData()
    
    if (rows.length === 0) {
      return { ok: true, inserted: 0, skipped: 0 }
    }

    // First row is header
    const headers = rows[0].map(h => h?.toLowerCase().trim())
    const dataRows = rows.slice(1)

    console.log('📋 [SYNC] Headers found:', headers)
    console.log(`📊 [SYNC] Processing ${dataRows.length} data rows...`)

    // Map headers to indices
    const headerMap = {
      timestamp: headers.findIndex(h => h.includes('carimbo') || h.includes('data/hora')),
      name: headers.findIndex(h => h.includes('nome completo')),
      sex: headers.findIndex(h => h.includes('sexo')),
      phone: headers.findIndex(h => h.includes('telefone') || h.includes('whatsapp')),
      birthDate: headers.findIndex(h => h.includes('nascimento')),
      email: headers.findIndex(h => h.includes('email')),
      city: headers.findIndex(h => h.includes('cidade')),
      fullAddress: headers.findIndex(h => h.includes('endereço')),
      howFoundUs: headers.findIndex(h => h.includes('oportunidade') || h.includes('soube')),
      studyStyle: headers.findIndex(h => h.includes('estudar') || h.includes('prefere'))
    }

    console.log('🗺️ [SYNC] Header mapping:', headerMap)

    let inserted = 0
    let skipped = 0

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      
      try {
        // Extract data from row
        const studentData = {
          timestamp: headerMap.timestamp >= 0 ? parseBrazilianTimestamp(row[headerMap.timestamp]) : undefined,
          name: headerMap.name >= 0 ? row[headerMap.name]?.trim() : '',
          sex: headerMap.sex >= 0 ? row[headerMap.sex]?.trim() : undefined,
          phone: headerMap.phone >= 0 ? cleanPhone(row[headerMap.phone]) : undefined,
          birthDate: headerMap.birthDate >= 0 ? 
            parseBrazilianDate(row[headerMap.birthDate])?.toISOString().split('T')[0] : undefined,
          email: headerMap.email >= 0 ? normalizeEmail(row[headerMap.email]) : '',
          city: headerMap.city >= 0 ? row[headerMap.city]?.trim() : undefined,
          fullAddress: headerMap.fullAddress >= 0 ? row[headerMap.fullAddress]?.trim() : undefined,
          howFoundUs: headerMap.howFoundUs >= 0 ? row[headerMap.howFoundUs]?.trim() : undefined,
          studyStyle: headerMap.studyStyle >= 0 ? row[headerMap.studyStyle]?.trim() : undefined
        }

        // Validate required fields
        if (!studentData.name || !studentData.email) {
          console.log(`⚠️ [SYNC] Skipping row ${i + 2}: missing name or email`)
          skipped++
          continue
        }

        // Try to create student with Prisma (upsert to handle duplicates)
        const student = await prisma.student.upsert({
          where: { email: studentData.email },
          update: {
            // Only update if timestamp is newer
            ...(studentData.timestamp && {
              timestamp: studentData.timestamp,
              name: studentData.name || undefined,
              sex: studentData.sex,
              phone: studentData.phone,
              birthDate: studentData.birthDate,
              city: studentData.city,
              fullAddress: studentData.fullAddress,
              howFoundUs: studentData.howFoundUs,
              studyStyle: studentData.studyStyle
            })
          },
          create: {
            email: studentData.email,
            name: studentData.name || undefined,
            timestamp: studentData.timestamp,
            sex: studentData.sex,
            phone: studentData.phone,
            birthDate: studentData.birthDate,
            city: studentData.city,
            fullAddress: studentData.fullAddress,
            howFoundUs: studentData.howFoundUs,
            studyStyle: studentData.studyStyle
          }
        })

        if (student) {
          // Check if this was a creation (new record) by looking at createdAt
          const isNew = new Date(student.createdAt).getTime() > Date.now() - 5000 // Created within last 5 seconds
          if (isNew) {
            inserted++
            console.log(`✅ [SYNC] Created student: ${studentData.name} (${studentData.email})`)
          } else {
            skipped++
            console.log(`⚠️ [SYNC] Updated existing: ${studentData.email}`)
          }
        }

      } catch (rowError) {
        console.error(`❌ [SYNC] Error processing row ${i + 2}:`, rowError)
        skipped++
      }
    }

    console.log(`📊 [SYNC] Sync completed: ${inserted} inserted, ${skipped} skipped`)
    
    return { ok: true, inserted, skipped }

  } catch (error) {
    console.error('❌ [SYNC] Sync error:', error)
    return { 
      ok: false, 
      inserted: 0, 
      skipped: 0, 
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function GET(request: NextRequest) {
  const syncSecret = request.headers.get('x-sync-key')
  
  if (syncSecret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncSheetsToPostgreSQL()
  
  if (!result.ok && result.error === 'Sync already in progress') {
    return NextResponse.json(result, { status: 409 })
  }
  
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    // Para admin, não verificar sync secret (remover auth)
    console.log('🔄 [SYNC] Starting manual sync from admin interface...')
    
    const result = await syncSheetsToPostgreSQL()
    
    if (!result.ok && result.error === 'Sync already in progress') {
      return NextResponse.json({ 
        success: false,
        error: 'Sincronização já está em andamento. Tente novamente em alguns minutos.'
      }, { status: 409 })
    }
    
    if (!result.ok) {
      return NextResponse.json({ 
        success: false,
        error: result.error || 'Erro desconhecido durante a sincronização'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      inserted: result.inserted,
      skipped: result.skipped,
      message: `Sincronização concluída: ${result.inserted} novos alunos, ${result.skipped} existentes`
    })
  } catch (error) {
    console.error('❌ [SYNC] POST error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
