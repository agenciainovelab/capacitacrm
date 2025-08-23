
"use client"

import { Button } from "@/components/ui/button"
import { LogOut, School, GraduationCap } from "lucide-react"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function AppHeader() {
  const [mounted, setMounted] = useState(false)
  const session = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  // Não renderizar até estar montado para evitar hydration errors
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex gap-2 md:gap-3">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/images/logo-capacita.png"
                  alt="Logo CAPACITA"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/images/logo-reciclando.png"
                  alt="Logo Reciclando o Futuro"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold truncate">EAD CAPACITA</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Carregando...</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 rounded bg-muted animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex gap-2 md:gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/logo-capacita.png"
                alt="Logo CAPACITA"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/logo-reciclando.png"
                alt="Logo Reciclando o Futuro"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">EAD CAPACITA</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {session?.data?.user?.role === 'admin' ? 'Administração' : 'Área do Aluno'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {session?.data?.user && (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {session.data.user.role === 'admin' ? (
                  <School className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none">
                  {session.data.user.name || session.data.user.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex-shrink-0">
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
