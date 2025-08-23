
"use client"

import { EnhancedLoading } from "./enhanced-loading"
import { Card, CardContent } from "./card"

interface LoadingPageProps {
  title?: string
  subtitle?: string
  type?: "login" | "sync" | "loading" | "export"
  fullScreen?: boolean
}

export function LoadingPage({ 
  title = "Carregando...",
  subtitle,
  type = "loading",
  fullScreen = false 
}: LoadingPageProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <EnhancedLoading type={type} showSteps />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <EnhancedLoading type={type} showProgress />
      </CardContent>
    </Card>
  )
}
