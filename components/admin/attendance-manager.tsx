
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX, User, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  studyStyle?: string
}

interface AttendanceRecord {
  Student: Student
}

interface AttendanceManagerProps {
  liveId: string
  liveTitle: string
  presentStudents: AttendanceRecord[]
  allStudents: Student[]
  onUpdate: () => void
}

export function AttendanceManager({ 
  liveId, 
  liveTitle, 
  presentStudents, 
  allStudents, 
  onUpdate 
}: AttendanceManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const presentStudentIds = presentStudents.map(p => p.Student.id)
  const absentStudents = allStudents.filter(s => !presentStudentIds.includes(s.id))

  const toggleAttendance = async (studentId: string, markAsPresent: boolean) => {
    setLoading(studentId)
    
    try {
      const response = await fetch('/api/attendance/admin-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveEventId: liveId,
          studentId: studentId,
          markAsPresent
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        onUpdate()
      } else {
        throw new Error('Erro ao atualizar presença')
      }
    } catch (error) {
      console.error('Error toggling attendance:', error)
      toast.error('Erro ao atualizar presença. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Alunos Presentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            Presentes ({presentStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {presentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum aluno presente
            </p>
          ) : (
            presentStudents.map((record) => (
              <div 
                key={record.Student.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{record.Student.name}</div>
                  <div className="text-xs text-muted-foreground">{record.Student.email}</div>
                  {record.Student.studyStyle && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {record.Student.studyStyle}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAttendance(record.Student.id, false)}
                  disabled={loading === record.Student.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {loading === record.Student.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserX className="w-4 h-4 mr-1" />
                      Ausente
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Alunos Ausentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            Ausentes ({absentStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {absentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Todos os alunos estão presentes! 🎉
            </p>
          ) : (
            absentStudents.slice(0, 20).map((student) => (
              <div 
                key={student.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.email}</div>
                  {student.studyStyle && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {student.studyStyle}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAttendance(student.id, true)}
                  disabled={loading === student.id}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  {loading === student.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Presente
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
          {absentStudents.length > 20 && (
            <div className="text-center text-sm text-muted-foreground py-2">
              ... e mais {absentStudents.length - 20} alunos ausentes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
