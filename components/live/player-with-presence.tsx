
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Play, Clock } from "lucide-react"
import YouTube from "react-youtube"
import { toast } from "sonner"

interface PlayerWithPresenceProps {
  liveEvent: {
    id: string
    title: string
    youtubeId: string
    durationMin: number
  }
}

export function PlayerWithPresence({ liveEvent }: PlayerWithPresenceProps) {
  const [marked, setMarked] = useState(false)
  const [watchedSeconds, setWatchedSeconds] = useState(0)
  const [player, setPlayer] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const progress = Math.min((watchedSeconds / (liveEvent.durationMin * 60)) * 100, 100)

  const markPresence = async () => {
    try {
      const response = await fetch('/api/attendance/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liveId: parseInt(liveEvent.id),
          delta: 0
        }),
      })

      if (response.ok) {
        setMarked(true)
        toast.success('Presença marcada!')
        
        // Iniciar heartbeat
        startHeartbeat()
      } else {
        toast.error('Erro ao marcar presença')
      }
    } catch (error) {
      toast.error('Erro ao marcar presença')
    }
  }

  const startHeartbeat = () => {
    intervalRef.current = setInterval(async () => {
      try {
        await fetch('/api/attendance/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            liveId: parseInt(liveEvent.id),
            delta: 15
          }),
        })
        
        setWatchedSeconds(prev => prev + 15)
      } catch (error) {
        console.error('Heartbeat error:', error)
      }
    }, 15000)
  }

  const onPlayerEnd = async () => {
    try {
      await fetch('/api/attendance/mark-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liveId: parseInt(liveEvent.id)
        }),
      })
      
      toast.success('Aula completa assistida!')
    } catch (error) {
      console.error('Mark full error:', error)
    }
  }

  const onPlayerReady = (event: any) => {
    setPlayer(event.target)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Check if should mark as full watched
  useEffect(() => {
    const toleranceSeconds = liveEvent.durationMin * 60 - 60
    if (watchedSeconds >= toleranceSeconds && marked) {
      onPlayerEnd()
    }
  }, [watchedSeconds, liveEvent.durationMin, marked])

  const youtubeOptions = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            {liveEvent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!marked ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Marque sua presença para assistir
              </h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para marcar presença e iniciar o player
              </p>
              <Button onClick={markPresence} size="lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Marcar Presença
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <YouTube
                  videoId={liveEvent.youtubeId}
                  opts={youtubeOptions}
                  onReady={onPlayerReady}
                  onEnd={onPlayerEnd}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Progresso da Aula</span>
                  </div>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {Math.floor(watchedSeconds / 60)}:{String(watchedSeconds % 60).padStart(2, '0')} 
                  / {liveEvent.durationMin}:00 minutos
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
