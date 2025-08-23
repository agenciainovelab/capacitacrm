
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "student"
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = "/" 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (status === "loading") return // Ainda carregando

    if (!session) {
      // Não autenticado
      const loginPath = requiredRole === "admin" ? "/login/escola" : "/login/aluno"
      router.push(loginPath)
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      // Papel incorreto
      const correctPath = session.user.role === "admin" ? "/escola/dashboard" : "/aluno/dashboard"
      router.push(correctPath)
      return
    }

    setIsChecking(false)
  }, [session, status, router, requiredRole])

  // Tela de carregamento enquanto verifica
  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se chegou aqui, está autenticado corretamente
  return <>{children}</>
}
