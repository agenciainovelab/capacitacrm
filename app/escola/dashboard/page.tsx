
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Users, Video, CheckCircle, TrendingUp } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  try {
    const [
      totalStudents,
      totalLives,
      totalAttendance,
      recentLives
    ] = await Promise.all([
      prisma.student.count(),
      prisma.liveEvent.count(),
      prisma.attendance.count({
        where: {
          fullWatched: true
        }
      }),
      prisma.liveEvent.findMany({
        take: 5,
        orderBy: { startsAt: 'desc' },
        include: {
          _count: {
            select: { Attendance: true }
          }
        }
      })
    ])

    const averageAttendance = totalStudents > 0 ? 
      Math.round((totalAttendance / totalStudents) * 100) : 0

    return {
      totalStudents,
      totalLives,
      totalAttendance,
      averageAttendance,
      recentLives: recentLives.map(live => ({
        ...live,
        id: live.id.toString()
      }))
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return {
      totalStudents: 0,
      totalLives: 0,
      totalAttendance: 0,
      averageAttendance: 0,
      recentLives: []
    }
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema EAD CAPACITA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              alunos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Lives
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLives}</div>
            <p className="text-xs text-muted-foreground">
              lives criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aulas Completas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendance}</div>
            <p className="text-xs text-muted-foreground">
              assistidas até o final
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              de presença
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lives Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentLives.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma live criada ainda</p>
          ) : (
            <div className="space-y-4">
              {stats.recentLives.map((live) => (
                <div key={live.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-medium">{live.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(live.startsAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-sm">
                    {live._count.Attendance} presenças
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
