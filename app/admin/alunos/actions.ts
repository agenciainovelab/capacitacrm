
'use server'

import { revalidatePath } from 'next/cache'

export async function syncStudentsAction() {
  try {
    // Make internal request to sync endpoint with secret
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/sync/sheets-to-pg`, {
      method: 'POST',
      headers: {
        'x-sync-key': process.env.SYNC_SECRET!,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        ok: false,
        error: result.error || 'Sync failed',
        inserted: 0,
        skipped: 0
      }
    }

    // Revalidate the students page to show updated data
    revalidatePath('/admin/alunos')

    return result
  } catch (error) {
    console.error('Server action sync error:', error)
    return {
      ok: false,
      error: 'Internal server error',
      inserted: 0,
      skipped: 0
    }
  }
}
