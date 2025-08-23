
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  RefreshCw, 
  Calendar,
  GraduationCap,
  Monitor,
  Building,
  HelpCircle,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"
import { ExportDialog } from "@/components/export/export-dialog"

interface AttendanceData {
  live: {
    id: string
    title: string
    startsAt: string
    totalAttendees: number
  }
  attendance: {
    presencial: { present: any[], absent: any[] }
    online: { present: any[], absent: any[] }
    hibrido: { present: any[], absent: any[] }
    indefinido: { present: any[], absent: any[] }
  }
  summary: {
    totalPresent: number
    totalAbsent: number
    totalStudents: number
    attendanceRate: string
  }
}

const modalityIcons = {
  presencial: Building,
  online: Monitor,
  hibrido: GraduationCap,
  indefinido: HelpCircle
}

const modalityLabels = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
  indefinido: 'Não definido'
}

export default function RelatoriosPage() {
  const [data, setData] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [liveInfo, setLiveInfo] = useState<any>(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      
      const timestamp = Date.now()
      const randomParam = Math.random().toString(36).substring(7)
      
      const response = await fetch(`/api/reports/attendance-detailed?t=${timestamp}&r=${randomParam}`, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.report || [])
        setLiveInfo(result.liveInfo)
      } else {
        throw new Error('Erro ao carregar relatório')
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error)
      toast.error('Erro ao carregar relatório de presenças')
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchReport()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada de presenças por modalidade de estudo
          </p>
          {liveInfo && (
            <p className="text-muted-foreground mt-1">
              {liveInfo.title} • {new Date(liveInfo.startsAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <ExportDialog>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar Alunos
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Report Cards */}
      {data.map((liveData) => (
        <Card key={liveData.live.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{liveData.live.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(liveData.live.startsAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {liveData.summary.totalPresent} presentes de {liveData.summary.totalStudents}
                  </div>
                </div>
              </div>
              <Badge variant={parseFloat(liveData.summary.attendanceRate) >= 70 ? "default" : "secondary"}>
                {liveData.summary.attendanceRate}% presença
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(liveData.attendance).map(([modality, data]) => {
                const Icon = modalityIcons[modality as keyof typeof modalityIcons]
                const label = modalityLabels[modality as keyof typeof modalityLabels]
                const present = data.present.length
                const absent = data.absent.length
                const total = present + absent

                return (
                  <Card key={modality} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-green-700">
                            <UserCheck className="w-4 h-4" />
                            Presentes
                          </div>
                          <span className="font-bold">{present}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-red-700">
                            <UserX className="w-4 h-4" />
                            Ausentes
                          </div>
                          <span className="font-bold">{absent}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>Total</span>
                            <span>{total}</span>
                          </div>
                          {total > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${(present / total) * 100}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Detailed Lists */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Alunos Presentes ({liveData.summary.totalPresent})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(liveData.attendance).map(([modality, data]) => 
                    data.present.slice(0, 10).map((student: any) => (
                      <div key={`${modality}-${student.id}`} className="flex items-center justify-between p-2 bg-green-50 rounded-md text-sm">
                        <div>
                          <div className="font-medium">{student.name || 'Nome não informado'}</div>
                          <div className="text-muted-foreground">{student.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {modalityLabels[modality as keyof typeof modalityLabels]}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Alunos Ausentes ({liveData.summary.totalAbsent})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(liveData.attendance).map(([modality, data]) => 
                    data.absent.slice(0, 10).map((student: any) => (
                      <div key={`${modality}-${student.id}`} className="flex items-center justify-between p-2 bg-red-50 rounded-md text-sm">
                        <div>
                          <div className="font-medium">{student.name || 'Nome não informado'}</div>
                          <div className="text-muted-foreground">{student.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {modalityLabels[modality as keyof typeof modalityLabels]}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {data.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground">
              Ainda não há lives com dados de presença no sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
