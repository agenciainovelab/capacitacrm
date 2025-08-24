
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface DeleteLiveDialogProps {
  liveId: string
  liveTitle: string
  onDeleted: () => void
}

export function DeleteLiveDialog({ liveId, liveTitle, onDeleted }: DeleteLiveDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/lives/${liveId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      if (response.ok) {
        toast.success('Live excluída com sucesso!')
        onDeleted()
      } else {
        throw new Error('Erro ao excluir live')
      }
    } catch (error) {
      console.error('Error deleting live:', error)
      toast.error('Erro ao excluir live. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={loading}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Excluir Live</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Tem certeza que deseja excluir a live <strong>"{liveTitle}"</strong>?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-md p-3 my-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Ação irreversível!</p>
              <ul className="text-sm space-y-1">
                <li>• Todos os registros de presença serão perdidos</li>
                <li>• Os dados não poderão ser recuperados</li>
                <li>• Relatórios relacionados ficarão incompletos</li>
              </ul>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
