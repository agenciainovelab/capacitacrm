
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { syncStudentsAction } from './actions'

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    toast.loading('Sincronizando com Google Sheets...', { id: 'sync' })

    try {
      const result = await syncStudentsAction()

      toast.dismiss('sync')

      if (!result.ok) {
        if (result.error === 'Sync already in progress') {
          toast.error('Sincronização já está em andamento. Tente novamente em alguns instantes.')
        } else {
          toast.error(`Erro na sincronização: ${result.error}`)
        }
        return
      }

      // Success
      const { inserted, skipped } = result
      const message = `Sincronização concluída: ${inserted} novos alunos, ${skipped} já existiam`
      
      if (inserted > 0) {
        toast.success(message)
      } else {
        toast.info(message)
      }

    } catch (error) {
      console.error('Sync error:', error)
      toast.dismiss('sync')
      toast.error('Erro interno na sincronização')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={isSyncing}
      className="rounded-xl"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
    </Button>
  )
}
