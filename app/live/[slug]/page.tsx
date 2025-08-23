
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect, notFound } from "next/navigation"
import { InternalPlayer } from "@/components/live/internal-player"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    slug: string
  }
}

async function getLiveEvent(slug: string) {
  try {
    const live = await prisma.liveEvent.findUnique({
      where: { slug }
    })
    
    if (!live) return null
    
    return {
      ...live,
      id: live.id.toString()
    }
  } catch (error) {
    console.error('Error fetching live:', error)
    return null
  }
}

export default async function LivePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'student') {
    redirect('/login/aluno')
  }

  const live = await getLiveEvent(params.slug)

  if (!live) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">{live.title}</h1>
            <p className="text-muted-foreground text-center">
              {new Date(live.startsAt).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <InternalPlayer 
            youtubeId={live.youtubeId}
            liveTitle={live.title}
            liveId={live.id}
            startsAt={live.startsAt.toISOString()}
            endsAt={live.endsAt.toISOString()}
            studentId={session.user.id}
            isStudent={true}
          />
        </div>
      </div>
    </div>
  )
}
