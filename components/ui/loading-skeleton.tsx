

"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  message?: string
  showProgress?: boolean
  duration?: number
  className?: string
}

export function LoadingSkeleton({ 
  message = "Carregando...", 
  showProgress = true,
  duration = 2000,
  className 
}: LoadingSkeletonProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95
        const increment = Math.random() * 15 + 5 // 5-20% increment
        return Math.min(prev + increment, 95)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px] animate-pulse" />
          <Skeleton className="h-4 w-[200px] animate-pulse" />
        </div>
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground animate-pulse">{message}</span>
            <span className="text-muted-foreground animate-pulse">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full animate-pulse" />
        </div>
      )}
    </div>
  )
}

