
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, Wifi, WifiOff, LogOut, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface InternalPlayerProps {
  youtubeId: string
  liveTitle: string
  liveId: string
  startsAt: string
  endsAt: string
  studentId?: string
  isStudent?: boolean
}

export function InternalPlayer({ 
  youtubeId, 
  liveTitle, 
  liveId, 
  startsAt, 
  endsAt, 
  studentId, 
  isStudent = false 
}: InternalPlayerProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [timeWatched, setTimeWatched] = useState(0)
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false)
  const [liveEnded, setLiveEnded] = useState(false)
  const router = useRouter()

  const startTime = new Date(startsAt)
  const endTime = new Date(endsAt)
  const now = new Date()
  const isLiveActive = now >= startTime && now <= endTime
  const isLiveFinished = now > endTime
  const isLiveNotStarted = now < startTime

  useEffect(() => {
    // Verificar se a live acabou
    const checkLiveStatus = () => {
      const currentTime = new Date()
      if (currentTime > endTime) {
        setLiveEnded(true)
      }
    }

    const interval = setInterval(checkLiveStatus, 30000) // Verifica a cada 30s
    checkLiveStatus() // Verifica imediatamente

    return () => clearInterval(interval)
  }, [endTime])

  useEffect(() => {
    // Para estudantes: marcar presença automaticamente se ainda não marcou
    if (isStudent && studentId && isLiveActive && !hasMarkedAttendance) {
      markAttendance()
    }
  }, [isStudent, studentId, isLiveActive, hasMarkedAttendance])

  useEffect(() => {
    // Contador de tempo assistido e heartbeat
    if (isLiveActive && !liveEnded && hasMarkedAttendance) {
      const interval = setInterval(async () => {
        setTimeWatched(prev => prev + 1)
        
        // A cada 15 segundos, enviar heartbeat para o servidor
        if (timeWatched > 0 && timeWatched % 15 === 0) {
          try {
            await fetch('/api/attendance/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                liveId: parseInt(liveId),
                delta: 15 // Adiciona 15 segundos assistidos
              })
            })
          } catch (error) {
            console.error('Heartbeat error:', error)
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLiveActive, liveEnded, hasMarkedAttendance, timeWatched, liveId])

  useEffect(() => {
    // Para estudantes: dar falta se não marcar presença em 10 minutos
    if (isStudent && isLiveActive && !hasMarkedAttendance) {
      const timeout = setTimeout(() => {
        if (!hasMarkedAttendance) {
          toast.error("⏰ Você não marcou presença a tempo e ganhou falta!")
        }
      }, 10 * 60 * 1000) // 10 minutos

      return () => clearTimeout(timeout)
    }
  }, [isStudent, isLiveActive, hasMarkedAttendance])

  const markAttendance = async () => {
    try {
      const response = await fetch('/api/attendance/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveId: parseInt(liveId),
          delta: 0 // Primeira marcação, 0 segundos adicionais
        })
      })

      const result = await response.json()

      if (response.ok) {
        setHasMarkedAttendance(true)
        toast.success("✅ Presença marcada com sucesso!")
      } else {
        console.error('Attendance error:', result)
        toast.error("❌ Erro ao marcar presença: " + (result.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error("❌ Erro de conexão ao marcar presença")
    }
  }

  const handleExitClass = () => {
    if (isStudent && !hasMarkedAttendance && isLiveActive) {
      toast.error("❌ Você saiu da aula sem marcar presença e ganhou falta!")
    }
    router.back()
  }

  // Se a live acabou, mostrar mensagem triste
  if (liveEnded || isLiveFinished) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="text-center py-12">
          <div className="mb-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900 mb-2">😢 Uma pena!</h3>
            <p className="text-lg text-orange-800 mb-1">Você perdeu a última aula</p>
            <p className="text-orange-700">Fique atento à próxima aula!</p>
          </div>
          <Badge variant="secondary" className="bg-orange-200 text-orange-800">
            Aula finalizada em {endTime.toLocaleString('pt-BR')}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  // Se a live ainda não começou
  if (isLiveNotStarted) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="text-center py-12">
          <div className="mb-4">
            <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Aula ainda não começou</h3>
            <p className="text-blue-700">
              A aula começará em {startTime.toLocaleString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Player da live */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={liveTitle}
            />
            
            {/* Status da conexão */}
            <div className="absolute top-4 left-4">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    CONECTADO
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    DESCONECTADO
                  </>
                )}
              </Badge>
            </div>

            {/* Status ao vivo */}
            {isLiveActive && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-600 hover:bg-red-700">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  AO VIVO
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controles e informações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                {Math.floor(timeWatched / 60)}:{(timeWatched % 60).toString().padStart(2, '0')}
              </div>
              
              {isStudent && (
                <div className="text-sm">
                  {hasMarkedAttendance ? (
                    <Badge variant="default" className="bg-green-600">
                      ✅ Presença marcada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      ⏳ Aguardando presença
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isStudent && isLiveActive && !hasMarkedAttendance && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={markAttendance}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✅ Marcar Presença
                </Button>
              )}
              
              {isStudent && isLiveActive && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExitClass}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da aula
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso para estudantes */}
      {isStudent && !hasMarkedAttendance && isLiveActive && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">⚠️ Importante!</p>
                <p>Você tem 10 minutos para marcar presença, caso contrário ganhará falta automaticamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
