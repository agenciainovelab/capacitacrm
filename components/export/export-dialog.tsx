
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Download, Loader2, FileText, Users, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface LiveEvent {
  id: string
  title: string
  startsAt: string
}

interface ExportDialogProps {
  children?: React.ReactNode
}

export function ExportDialog({ children }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState("all")
  const [selectedLive, setSelectedLive] = useState("")
  const [lives, setLives] = useState<LiveEvent[]>([])
  const [loadingLives, setLoadingLives] = useState(false)

  const fetchLives = async () => {
    try {
      setLoadingLives(true)
      const response = await fetch('/api/lives', {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setLives(data || [])
        
        // Selecionar a live mais recente por padrão
        if (data && data.length > 0) {
          const mostRecent = data.sort((a: LiveEvent, b: LiveEvent) => 
            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
          )[0]
          setSelectedLive(mostRecent.id)
        }
      }
    } catch (error) {
      console.error('Error fetching lives:', error)
      toast.error('Erro ao carregar lives')
    } finally {
      setLoadingLives(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchLives()
    }
  }, [open])

  const handleExport = async () => {
    try {
      setLoading(true)
      
      let endpoint = '/api/export/students'
      const params = new URLSearchParams()
      
      if (exportType === 'present' && selectedLive) {
        params.append('type', 'present')
        params.append('liveId', selectedLive)
      } else if (exportType === 'absent' && selectedLive) {
        params.append('type', 'absent')
        params.append('liveId', selectedLive)
      } else {
        params.append('type', 'all')
      }
      
      const response = await fetch(`${endpoint}?${params.toString()}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        let filename = 'alunos.xlsx'
        if (exportType === 'present') {
          const live = lives.find(l => l.id === selectedLive)
          filename = `alunos-presentes-${live?.title || 'aula'}.xlsx`
        } else if (exportType === 'absent') {
          const live = lives.find(l => l.id === selectedLive)
          filename = `alunos-ausentes-${live?.title || 'aula'}.xlsx`
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success('Arquivo exportado com sucesso!')
        setOpen(false)
      } else {
        throw new Error('Erro na exportação')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro ao exportar arquivo')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedLiveTitle = () => {
    const live = lives.find(l => l.id === selectedLive)
    return live?.title || 'Aula selecionada'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exportar Alunos
          </DialogTitle>
          <DialogDescription>
            Escolha o tipo de exportação desejado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <RadioGroup value={exportType} onValueChange={setExportType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Todos os alunos cadastrados
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="present" id="present" />
              <Label htmlFor="present" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                Alunos presentes na aula
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="absent" id="absent" />
              <Label htmlFor="absent" className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-600" />
                Alunos ausentes na aula
              </Label>
            </div>
          </RadioGroup>

          {(exportType === 'present' || exportType === 'absent') && (
            <div className="space-y-2">
              <Label>Selecione a aula:</Label>
              {loadingLives ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando aulas...
                </div>
              ) : (
                <Select value={selectedLive} onValueChange={setSelectedLive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {lives.map((live) => (
                      <SelectItem key={live.id} value={live.id}>
                        {live.title} - {new Date(live.startsAt).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Preview da exportação */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Resumo da exportação:</h4>
            <p className="text-sm text-muted-foreground">
              {exportType === 'all' && "Exportar todos os alunos cadastrados no sistema"}
              {exportType === 'present' && `Exportar alunos que marcaram presença na aula: ${getSelectedLiveTitle()}`}
              {exportType === 'absent' && `Exportar alunos que não compareceram na aula: ${getSelectedLiveTitle()}`}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={loading || (exportType !== 'all' && !selectedLive)}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
