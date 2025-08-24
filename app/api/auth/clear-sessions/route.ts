

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing all NextAuth sessions and cookies...')
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'All sessions cleared successfully' 
    })

    // Lista de cookies do NextAuth que precisam ser limpos
    const authCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token'
    ]

    // Limpar todos os cookies de autenticação
    authCookies.forEach(cookieName => {
      response.cookies.delete(cookieName)
      response.cookies.delete({
        name: cookieName,
        path: '/',
      })
    })

    console.log('✅ All NextAuth cookies cleared')
    
    return response

  } catch (error) {
    console.error('❌ Error clearing sessions:', error)
    return NextResponse.json({
      error: 'Failed to clear sessions',
      details: String(error)
    }, { status: 500 })
  }
}

