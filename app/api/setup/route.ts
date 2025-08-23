
import { NextResponse } from 'next/server'
import { setupDatabase } from '@/lib/setup'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const success = await setupDatabase()
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ success: false, error: 'Setup failed' }, { status: 500 })
  }
}
