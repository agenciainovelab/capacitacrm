
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test the environment variables
    const hasSecret = !!process.env.NEXTAUTH_SECRET
    const hasUrl = !!process.env.NEXTAUTH_URL
    
    return NextResponse.json({
      success: true,
      config: {
        hasSecret,
        hasUrl,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, type } = body
    
    if (type === 'admin') {
      // Test admin credentials
      if (username === 'reciclando' && password === 'capacita') {
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin',
            email: 'admin@capacita.com',
            name: 'Admin',
            role: 'admin'
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid credentials'
    }, { status: 401 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
