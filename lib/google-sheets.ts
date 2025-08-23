

import { google } from 'googleapis'

interface GoogleSheetsConfig {
  serviceAccountKey: string
  spreadsheetId: string
  range: string
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig
  private sheets: any

  constructor(config: GoogleSheetsConfig) {
    this.config = config
    this.initializeAuth()
  }

  private initializeAuth() {
    try {
      const credentials = JSON.parse(
        this.config.serviceAccountKey.replace(/\\n/g, '\n')
      )

      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      })

      this.sheets = google.sheets({ version: 'v4', auth })
    } catch (error) {
      throw new Error(`Failed to initialize Google Sheets auth: ${error}`)
    }
  }

  async getSheetData(): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
      })

      return response.data.values || []
    } catch (error) {
      throw new Error(`Failed to fetch sheet data: ${error}`)
    }
  }

  static normalizeColumnName(name: string): string {
    return name.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
  }

  static createColumnMapping(headers: string[]): Map<string, number> {
    const mapping = new Map<string, number>()
    
    // Mapeamento de sinônimos
    const synonyms: { [key: string]: string[] } = {
      timestamp: ['carimbo de data/hora', 'carimbo', 'timestamp', 'data_hora'],
      name: ['nome completo', 'nome', 'name'],
      sex: ['sexo', 'gender', 'genero'],
      phone: ['telefone (whatsapp)', 'telefone', 'whatsapp', 'phone'],
      birthDate: ['data de nascimento', 'nascimento', 'birth_date', 'aniversario'],
      email: ['melhor email', 'email', 'e-mail'],
      city: ['cidade', 'city'],
      fullAddress: ['endereco completo', 'endereco', 'address'],
      howFoundUs: ['como soube dessa oportunidade?', 'como soube', 'discovery_source'],
      studyStyle: ['como voce prefere estudar?', 'como prefere estudar', 'study_preference']
    }

    headers.forEach((header, index) => {
      const normalizedHeader = GoogleSheetsService.normalizeColumnName(header)
      
      for (const [dbField, headerSynonyms] of Object.entries(synonyms)) {
        if (headerSynonyms.some(synonym => 
          GoogleSheetsService.normalizeColumnName(synonym) === normalizedHeader
        )) {
          mapping.set(dbField, index)
          break
        }
      }
    })

    return mapping
  }

  static normalizePhone(phone: string): string {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  }

  static normalizeEmail(email: string): string {
    if (!email) return ''
    const normalized = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(normalized) ? normalized : ''
  }

  static parseBirthDate(dateStr: string): string | null {
    if (!dateStr) return null
    
    // Tenta formatos dd/mm/aaaa, dd-mm-aaaa, etc.
    const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
    const match = dateStr.match(dateRegex)
    
    if (match) {
      const [, day, month, year] = match
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      if (date.getFullYear() == parseInt(year) && 
          date.getMonth() == parseInt(month) - 1 && 
          date.getDate() == parseInt(day)) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
      }
    }
    
    return null
  }

  static parseTimestamp(timestampStr: string): Date | null {
    if (!timestampStr) return null
    
    try {
      // Tenta diferentes formatos
      const formats = [
        // dd/mm/aaaa hh:mm:ss
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
        // dd/mm/aaaa hh:mm
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
        // dd/mm/aaaa
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      ]

      for (const format of formats) {
        const match = timestampStr.match(format)
        if (match) {
          const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match
          const date = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
          )
          
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
      
      // Fallback: tenta new Date
      const fallbackDate = new Date(timestampStr)
      return !isNaN(fallbackDate.getTime()) ? fallbackDate : null
    } catch {
      return null
    }
  }
}

