
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { YoutubeCard } from "@/components/live/youtube-card"
import { ExportButton } from "@/components/reports/export-button"
import { EnhancedLoading } from "@/components/ui/enhanced-loading"
import { AttendanceManager } from "@/components/admin/attendance-manager"
import { AttendanceReport } from "@/components/reports/attendance-report"
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Clock, 
  Play, 
  UserCheck, 
  UserX,
  Activity,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface LiveEvent {
  id: string
  title: string
  slug: string
  youtubeId: string
  startsAt: string
  endsAt: string
  durationMin: number
  isActive: boolean
}

interface AttendanceRecord {
  id: string
  studentId: string
  joinedAt: string
  lastPingAt: string
  watchedSec: number
  fullWatched: boolean
  Student: {
    id: string
    name: string
    email: string
    phone: string
    city: string
  }
}

export default function LiveDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const liveId = params.id as string

  const [live, setLive] = useState<LiveEvent | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeStudents, setActiveStudents] = useState(0)

  const fetchLiveData = async (showToast = false) => {
    try {
      setLoading(true)
      
      // Cache invalidation
      const timestamp = Date.now()
      const randomParam = Math.random().toString(36).substring(7)
      
      const [liveResponse, attendanceResponse, studentsResponse] = await Promise.all([
        fetch(`/api/lives/${liveId}?t=${timestamp}&r=${randomParam}`, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        }),
        fetch(`/api/lives/${liveId}/attendance?t=${timestamp}&r=${randomParam}`, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        }),
        fetch(`/api/students?t=${timestamp}&r=${randomParam}`, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        })
      ])

      if (!liveResponse.ok) {
        throw new Error('Live não encontrada')
      }

      const liveData = await liveResponse.json()
      setLive(liveData)

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setAttendance(attendanceData)
        
        // Count active students (joined in last 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
        const activeCount = attendanceData.filter((record: AttendanceRecord) => 
          new Date(record.lastPingAt).getTime() > fiveMinutesAgo
        ).length
        setActiveStudents(activeCount)
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setAllStudents(studentsData.students || [])
      }

      if (showToast) {
        toast.success('Dados atualizados com sucesso!')
      }

    } catch (error) {
      console.error('Error fetching live data:', error)
      if (showToast) {
        toast.error('Erro ao carregar dados da live')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchLiveData(true)
    setRefreshing(false)
  }

  useEffect(() => {
    if (liveId) {
      fetchLiveData()
    }
  }, [liveId])

  // Auto refresh every 30 seconds if live is active
  useEffect(() => {
    if (live?.isActive) {
      const interval = setInterval(() => {
        fetchLiveData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [live?.isActive])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/escola/lives">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
        <EnhancedLoading 
          type="loading" 
          showSteps
          showProgress
        />
      </div>
    )
  }

  if (!live) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/escola/lives">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live não encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              A live solicitada não existe ou foi removida.
            </p>
            <Button asChild>
              <Link href="/escola/lives">
                Voltar para Lives
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const liveDate = new Date(live.startsAt)
  const isLive = liveDate <= new Date() && live.isActive
  const isUpcoming = liveDate > new Date()
  const isFinished = liveDate < new Date() && !live.isActive

  const totalWatchTime = attendance.reduce((sum, record) => sum + record.watchedSec, 0)
  const averageWatchTime = attendance.length > 0 ? totalWatchTime / attendance.length : 0
  const completionRate = attendance.length > 0 ? 
    (attendance.filter(r => r.fullWatched).length / attendance.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/escola/lives">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{live.title}</h1>
            <div className="flex gap-2 mt-2">
              {isLive && (
                <Badge className="bg-red-600 hover:bg-red-700">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  AO VIVO - {activeStudents} online agora
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
        
        <div className="flex gap-2">
          <LoadingButton 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            loading={refreshing}
            loadingText="Atualizando..."
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </LoadingButton>
          <ExportButton 
            liveId={live.id} 
            liveTitle={live.title}
            type="attendance"
          />
        </div>
      </div>

      {/* YouTube Preview and Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <YoutubeCard 
            youtubeId={live.youtubeId}
            title={live.title}
            duration={live.durationMin + " min"}
          />
        </div>

        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{attendance.length}</div>
                  <div className="text-xs text-muted-foreground">Total de participantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
                  <div className="text-xs text-muted-foreground">Online agora</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tempo médio:</span>
                  <span className="text-sm font-medium">
                    {Math.round(averageWatchTime / 60)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de conclusão:</span>
                  <span className="text-sm font-medium">
                    {completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duração:</span>
                  <span className="text-sm font-medium">
                    {live.durationMin} min
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Data e Hora</div>
                <div className="text-sm text-muted-foreground">
                  {liveDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {liveDate.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium">ID do YouTube</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {live.youtubeId}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gerenciamento de Presenças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciamento de Presenças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceManager 
            liveId={liveId}
            liveTitle={live.title}
            presentStudents={attendance}
            allStudents={allStudents}
            onUpdate={fetchLiveData}
          />
        </CardContent>
      </Card>

      {/* Relatório Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório por Modalidade de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceReport liveId={liveId} />
        </CardContent>
      </Card>
    </div>
  )
}
