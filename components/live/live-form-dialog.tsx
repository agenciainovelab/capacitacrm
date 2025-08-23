
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2, Save, Edit } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { liveEventSchema } from "@/data/schemas"
import { z } from "zod"
import { toast } from "sonner"

type LiveEventForm = z.infer<typeof liveEventSchema>

interface LiveFormDialogProps {
  onLiveCreated?: () => void
  live?: any // For editing
}

export function LiveFormDialog({ onLiveCreated, live }: LiveFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  // Helper function to format date for datetime-local input
  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date)
    // Format: YYYY-MM-DDTHH:mm
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(liveEventSchema),
    defaultValues: live ? {
      title: live.title || '',
      slug: live.slug || '',
      youtubeId: live.youtubeId || '',
      startsAt: formatDateForInput(live.startsAt),
      durationHours: live.durationMin ? live.durationMin / 60 : 1
    } : {
      title: '',
      slug: '',
      youtubeId: '',
      startsAt: '',
      durationHours: 1 // Default 1 hour
    }
  })

  // Auto-generate slug from title
  const watchTitle = watch("title")
  useEffect(() => {
    if (watchTitle && !live) {
      const slug = watchTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      setValue("slug", slug)
    }
  }, [watchTitle, setValue, live])

  const onSubmit = async (formData: any) => {
    setLoading(true)
    setLoadingMessage("Validando dados...")
    
    console.log('📺 [FORM] Submitting live form data:', formData)

    try {
      // Prepare the data for submission
      setLoadingMessage("Preparando dados...")
      
      const submitData = {
        title: formData.title,
        slug: formData.slug,
        youtubeId: formData.youtubeId,
        startsAt: formData.startsAt,
        durationMin: Math.round(parseFloat(formData.durationHours.toString()) * 60),
        isActive: true
      }

      console.log('📺 [FORM] Formatted data for submission:', submitData)

      setLoadingMessage(live ? "Atualizando live..." : "Criando live...")
      
      const url = live ? `/api/lives/${live.id}` : '/api/lives'
      const method = live ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const responseData = await response.json()
      console.log('📺 [FORM] Server response:', responseData)

      if (!response.ok) {
        console.error('❌ [FORM] Server error:', responseData)
        
        // Show specific error message if available
        const errorMessage = responseData.error || 'Erro ao salvar live'
        const errorDetails = responseData.details
        
        if (errorDetails && Array.isArray(errorDetails)) {
          // Validation errors from Zod
          const validationMessages = errorDetails.map((err: any) => 
            `${err.path.join('.')}: ${err.message}`
          ).join(', ')
          toast.error(`Erro de validação: ${validationMessages}`)
        } else {
          toast.error(errorMessage)
        }
        return
      }

      setLoadingMessage("Finalizando...")
      
      // Simulate some final processing time
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ [FORM] Live saved successfully')
      toast.success(live ? 'Live atualizada com sucesso!' : 'Live criada com sucesso!')
      setOpen(false)
      reset()
      onLiveCreated?.()
    } catch (error) {
      console.error('❌ [FORM] Client error:', error)
      toast.error(`Erro ao salvar live: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={live ? "outline" : "default"} size={live ? "sm" : "default"}>
          {live ? (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Nova Live
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{live ? 'Editar Live' : 'Nova Live'}</DialogTitle>
          <DialogDescription>
            {live ? 'Edite os detalhes da live' : 'Crie uma nova live no YouTube'}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <LoadingSkeleton 
            message={loadingMessage || "Processando..."} 
            showProgress={true}
            className="py-8"
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Nome da live"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{String(errors.title.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="url-amigavel"
                disabled={loading}
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{String(errors.slug.message)}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeId">ID do YouTube</Label>
            <Input
              id="youtubeId"
              {...register("youtubeId")}
              placeholder="dQw4w9WgXcQ"
              disabled={loading}
            />
            {errors.youtubeId && (
              <p className="text-sm text-red-600">{String(errors.youtubeId.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Data e Hora de Início</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...register("startsAt")}
                disabled={loading}
              />
              {errors.startsAt && (
                <p className="text-sm text-red-600">{String(errors.startsAt.message)}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationHours">Duração (horas)</Label>
              <Input
                id="durationHours"
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                {...register("durationHours", { valueAsNumber: true })}
                placeholder="1.5"
                disabled={loading}
              />
              {errors.durationHours && (
                <p className="text-sm text-red-600">{String(errors.durationHours.message)}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Exemplo: 1.5 = 1 hora e 30 minutos
              </p>
            </div>
          </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {live ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
