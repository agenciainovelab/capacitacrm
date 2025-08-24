
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveFormDialog } from "@/components/live/live-form-dialog"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { YoutubeCard } from "@/components/live/youtube-card"
import { ExportButton } from "@/components/reports/export-button"
import { DeleteLiveDialog } from "@/components/live/delete-live-dialog"
import { Video, Calendar, Users, Clock, RefreshCw, Play, Eye, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"

interface LiveEvent {
  id: string
  title: string
  slug: string
  youtubeId: string
  startsAt: string
  endsAt: string
  durationMin: number
  isActive: boolean
  _count: {
    Attendance: number
  }
}

export default function LivesPage() {
  const [lives, setLives] = useState<LiveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Carregando lives...")

  const fetchLives = async (showToast = false) => {
    try {
      setLoading(true)
      setLoadingMessage("Carregando lives...")
      
      if (showToast) {
        toast.loading("Atualizando lista de lives...")
      }

      // Cache invalidation
      const timestamp = Date.now()
      const randomParam = Math.random().toString(36).substring(7)
      
      const response = await fetch(`/api/lives?t=${timestamp}&r=${randomParam}`, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })
      
      if (response.ok) {
        setLoadingMessage("Processando dados...")
        const data = await response.json()
        
        setLives(data.map((live: any) => ({
          ...live,
          id: live.id.toString()
        })))
        
        if (showToast) {
          toast.dismiss()
          toast.success(`${data.length} lives carregadas com sucesso!`)
        }
      } else {
        throw new Error('Falha ao carregar lives')
      }
    } catch (error) {
      console.error('Error fetching lives:', error)
      const errorMessage = 'Erro ao carregar lives'
      
      if (showToast) {
        toast.dismiss()
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  useEffect(() => {
    fetchLives()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <LoadingSkeleton 
          message={loadingMessage || "Carregando lives..."} 
          showProgress={true}
          className="py-8"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lives</h1>
          <p className="text-muted-foreground">
            Gerencie suas lives do YouTube
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchLives(true)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <LiveFormDialog onLiveCreated={() => fetchLives(true)} />
        </div>
      </div>

      {lives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma live criada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira live para começar a gerenciar presenças
            </p>
            <LiveFormDialog onLiveCreated={() => fetchLives(true)} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lives.map((live) => {
            const liveDate = new Date(live.startsAt)
            const isLive = liveDate <= new Date() && live.isActive
            const isUpcoming = liveDate > new Date()
            const isFinished = liveDate < new Date() && !live.isActive

            return (
              <div key={live.id} className="space-y-4">
                <YoutubeCard 
                  youtubeId={live.youtubeId}
                  title={live.title}
                  duration={live.durationMin + " min"}
                />
                
                <Card className="border-t-4 border-t-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {live.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          {isLive && (
                            <Badge className="bg-red-600 hover:bg-red-700">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                              AO VIVO
                            </Badge>
                          )}
                          {isUpcoming && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              AGENDADA
                            </Badge>
                          )}
                          {isFinished && (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              FINALIZADA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <div>{liveDate.toLocaleDateString('pt-BR')}</div>
                          <div>{liveDate.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{live._count.Attendance}</div>
                          <div>participantes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1" variant="outline">
                          <Link href={`/escola/lives/${live.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </Button>
                        <ExportButton 
                          liveId={live.id} 
                          liveTitle={live.title}
                          type="attendance"
                        />
                      </div>
                      <div className="flex gap-2">
                        <LiveFormDialog live={live} onLiveCreated={() => fetchLives(true)} />
                        <DeleteLiveDialog 
                          liveId={live.id} 
                          liveTitle={live.title}
                          onDeleted={() => fetchLives(true)} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
