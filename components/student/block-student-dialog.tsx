
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
import { Ban, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface BlockStudentDialogProps {
  student: any
  onSuccess: () => void
  children?: React.ReactNode
}

export function BlockStudentDialog({ student, onSuccess, children }: BlockStudentDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleBlock = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/students/${student.id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ blocked: true }),
        cache: 'no-store'
      })

      if (response.ok) {
        toast.success('Aluno bloqueado com sucesso!')
        onSuccess()
      } else {
        throw new Error('Erro ao bloquear aluno')
      }
    } catch (error) {
      console.error('Error blocking student:', error)
      toast.error('Erro ao bloquear aluno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" disabled={loading}>
            <Ban className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <AlertDialogTitle>Bloquear Aluno</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Tem certeza que deseja bloquear o aluno <strong>"{student?.name || student?.email}"</strong>?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 my-4">
          <div className="flex items-start gap-2">
            <Ban className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">⚠️ Ação de segurança!</p>
              <ul className="text-sm space-y-1">
                <li>• O aluno não conseguirá fazer login</li>
                <li>• Não aparecerá nos relatórios ativos</li>
                <li>• Pode ser desbloqueado posteriormente</li>
              </ul>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlock} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Bloqueando...' : 'Sim, bloquear'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
