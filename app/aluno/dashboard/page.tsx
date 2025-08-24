
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Calendar, Clock, Play } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { AddressFormDialog } from "@/components/student/address-form-dialog"

interface LiveEvent {
  id: string
  title: string
  slug: string
  startsAt: string
  endsAt: string
  durationMin: number
  isActive: boolean
}

export default function AlunoDashboardPage() {
  const [lives, setLives] = useState<LiveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [checkingAddress, setCheckingAddress] = useState(true)
  const { data: session } = useSession()

  const checkStudentAddress = async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch(`/api/students?search=${session.user.email}&limit=1`)
      if (response.ok) {
        const data = await response.json()
        const students = data.students || data
        const student = Array.isArray(students) ? students[0] : students
        
        // Se o aluno existe e não tem endereço preenchido, mostrar modal
        if (student && !student.addressCompleted) {
          setShowAddressModal(true)
        }
      }
    } catch (error) {
      console.error('Error checking student address:', error)
    } finally {
      setCheckingAddress(false)
    }
  }

  const fetchLives = async () => {
    try {
      const response = await fetch('/api/lives')
      if (response.ok) {
        const data = await response.json()
        setLives(data.map((live: any) => ({
          ...live,
          id: live.id.toString()
        })).filter((live: any) => live.isActive))
      }
    } catch (error) {
      console.error('Error fetching lives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressComplete = () => {
    setShowAddressModal(false)
  }

  useEffect(() => {
    fetchLives()
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      checkStudentAddress()
    }
  }, [session?.user?.email])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Área do Aluno</h1>
        <p className="text-muted-foreground">
          Acesse suas lives e marque sua presença
        </p>
      </div>

      {lives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma live disponível</h3>
            <p className="text-muted-foreground text-center">
              Aguarde novas lives serem criadas pela escola
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lives.map((live) => {
            const now = new Date()
            const startDate = new Date(live.startsAt)
            const endDate = new Date(live.endsAt)
            const isLive = now >= startDate && now <= endDate
            const isUpcoming = now < startDate
            const isPast = now > endDate

            return (
              <Card key={live.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    {live.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(live.startsAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {new Date(live.startsAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(live.endsAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    {isLive && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-600">AO VIVO</span>
                      </div>
                    )}
                    
                    {isUpcoming && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-yellow-600">EM BREVE</span>
                      </div>
                    )}
                    
                    {isPast && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">FINALIZADA</span>
                      </div>
                    )}

                    <Button asChild className="w-full" disabled={isPast}>
                      <Link href={`/live/${live.slug}`}>
                        <Play className="w-4 h-4 mr-2" />
                        {isLive ? "Assistir Agora" : isPast ? "Live Finalizada" : "Acessar Live"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de preenchimento de endereço */}
      {session?.user?.email && (
        <AddressFormDialog 
          open={showAddressModal}
          onComplete={handleAddressComplete}
          studentEmail={session.user.email}
        />
      )}
    </div>
  )
}
