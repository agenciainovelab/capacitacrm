"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Users, Clock, Calendar, ExternalLink, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface YouTubePreviewProps {
  youtubeId: string
  title?: string
  startDate?: string
  className?: string
  showStats?: boolean
}

interface VideoData {
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: string
  likeCount?: string
  duration: string
  description: string
}

export function YoutubePreview({ 
  youtubeId, 
  title,
  startDate,
  className = "",
  showStats = true 
}: YouTubePreviewProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const mockData: VideoData = {
          title: title || `Live: ${youtubeId}`,
          thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hq720.jpg`,
          channelTitle: "Capacita DF",
          publishedAt: startDate || new Date().toISOString(),
          viewCount: "1,234",
          likeCount: "89",
          duration: "2:30:15",
          description: "Live educativa sobre capacitação profissional e oportunidades de emprego no Distrito Federal."
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        setVideoData(mockData)
      } catch (err) {
        setError("Erro ao carregar dados do vídeo")
      } finally {
        setLoading(false)
      }
    }

    if (youtubeId) {
      fetchVideoData()
    }
  }, [youtubeId, title, startDate])

  if (loading) {
    const cardClasses = `overflow-hidden ${className}`
    return (
      <Card className={cardClasses}>
        <div className="aspect-video bg-muted relative">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    const errorCardClasses = `overflow-hidden border-destructive/20 ${className}`
    return (
      <Card className={errorCardClasses}>
        <div className="aspect-video bg-destructive/5 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 text-destructive/60 mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!videoData) return null

  const publishedDate = new Date(videoData.publishedAt)
  const timeAgo = formatDistanceToNow(publishedDate, { 
    addSuffix: true, 
    locale: ptBR 
  })

  const mainCardClasses = `overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`
  return (
    <Card className={mainCardClasses}>
      <div className="relative aspect-video bg-black group cursor-pointer">
        <img
          src={videoData.thumbnail}
          alt={videoData.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = `https://i.ytimg.com/vi/vx5dSS3BBOk/hq720.jpg`
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {videoData.duration}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
            {videoData.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {videoData.channelTitle}
          </p>
        </div>

        {showStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {videoData.viewCount} visualizações
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {timeAgo}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">
          {videoData.description}
        </p>

        <div className="flex gap-2 pt-2">
          <Button 
            asChild 
            size="sm" 
            className="flex-1"
          >
            <a 
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play className="w-4 h-4 mr-2" />
              Assistir no YouTube
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a 
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
