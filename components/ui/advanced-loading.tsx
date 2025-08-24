
"use client"

import { useState, useEffect } from "react"
import { Progress } from "./progress"
import { Loader2 } from "lucide-react"

interface AdvancedLoadingProps {
  message?: string
  showProgress?: boolean
  duration?: number
}

export function AdvancedLoading({ 
  message = "Carregando...", 
  showProgress = false,
  duration = 3000 
}: AdvancedLoadingProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{message}</p>
        {showProgress && (
          <div className="w-64">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
