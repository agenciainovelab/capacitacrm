
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock } from "lucide-react"

interface YoutubeCardProps {
  youtubeId: string
  title?: string
  duration?: string
  className?: string
}

export function YoutubeCard({ 
  youtubeId, 
  title = "Live Capacita DF",
  duration = "2:30:00",
  className = ""
}: YoutubeCardProps) {
  const thumbnail = "https://i.ytimg.com/vi/z5NObURCxO4/maxresdefault.jpg" + youtubeId + "/maxresdefault.jpg"
  const youtubeUrl = "https://www.youtube.com/watch?v=" + youtubeId
  
  const cardClasses = "overflow-hidden hover:shadow-lg transition-all duration-200 " + className

  return (
    <Card className={cardClasses}>
      <div className="relative aspect-video bg-black group cursor-pointer">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://i.ytimg.com/vi/qod7eBE0mTk/hqdefault.jpg" + youtubeId + "/hqdefault.jpg"
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {duration}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3">{title}</h3>
        
        <div className="text-center p-4 bg-muted/50 rounded-md">
          <Play className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Prévia da live - Acesse pelos detalhes
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
