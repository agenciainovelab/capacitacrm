
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  UserCheck, 
  UserX,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { exportToCSV } from "@/lib/utils"

interface ExportButtonProps {
  liveId?: string
  liveTitle?: string
  students?: any[]
  attendanceData?: any[]
  type?: "students" | "attendance" | "complete"
}

export function ExportButton({
  liveId,
  liveTitle = "Relatório",
  students = [],
  attendanceData = [],
  type = "complete"
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const exportStudentsList = async () => {
    setLoading(true)
    try {
      const data = students.map(student => ({
        Nome: student.name || "",
        Email: student.email || "",
        Telefone: student.phone || "",
        Cidade: student.city || "",
        Sexo: student.sex || "",
        "Data de Nascimento": student.birthDate || "",
        "Como nos encontrou": student.howFoundUs || "",
        "Modalidade de Estudo": student.studyStyle || "",
        "Data de Cadastro": new Date(student.createdAt).toLocaleDateString("pt-BR")
      }))

      exportToCSV(data, `lista-alunos-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success(`Lista de ${data.length} alunos exportada com sucesso!`)
    } catch (error) {
      toast.error("Erro ao exportar lista de alunos")
    } finally {
      setLoading(false)
    }
  }

  const exportAttendanceReport = async () => {
    if (!liveId) {
      toast.error("ID da live não encontrado")
      return
    }

    setLoading(true)
    try {
      // Fetch attendance data for the specific live
      const response = await fetch(`/api/lives/${liveId}/attendance`)
      if (!response.ok) throw new Error("Erro ao buscar dados de presença")

      const attendanceData = await response.json()
      
      const data = attendanceData.map((record: any) => ({
        Nome: record.Student.name || "",
        Email: record.Student.email || "",
        Telefone: record.Student.phone || "",
        Cidade: record.Student.city || "",
        "Entrou na Live": new Date(record.joinedAt).toLocaleString("pt-BR"),
        "Última Atividade": new Date(record.lastPingAt).toLocaleString("pt-BR"),
        "Tempo Assistido (min)": Math.round(record.watchedSec / 60),
        "Assistiu Completa": record.fullWatched ? "Sim" : "Não"
      }))

      exportToCSV(data, `presenca-${liveTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success(`Relatório de presença com ${data.length} registros exportado!`)
    } catch (error) {
      toast.error("Erro ao exportar relatório de presença")
    } finally {
      setLoading(false)
    }
  }

  const exportPresentAbsent = async () => {
    if (!liveId) {
      toast.error("ID da live não encontrado")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/lives/${liveId}/attendance-summary`)
      if (!response.ok) throw new Error("Erro ao buscar resumo de presença")

      const summary = await response.json()
      
      const presentData = summary.present.map((student: any) => ({
        Status: "PRESENTE",
        Nome: student.name || "",
        Email: student.email || "",
        Telefone: student.phone || "",
        "Tempo na Live": `${Math.round(student.watchedSec / 60)} minutos`
      }))

      const absentData = summary.absent.map((student: any) => ({
        Status: "AUSENTE",
        Nome: student.name || "",
        Email: student.email || "",
        Telefone: student.phone || "",
        "Tempo na Live": "0 minutos"
      }))

      const combinedData = [...presentData, ...absentData]
      
      exportToCSV(combinedData, `presentes-ausentes-${liveTitle.replace(/\s+/g, '-').toLowerCase()}.csv`)
      toast.success(`Relatório de presentes/ausentes exportado! (${presentData.length} presentes, ${absentData.length} ausentes)`)
    } catch (error) {
      toast.error("Erro ao exportar relatório de presentes/ausentes")
    } finally {
      setLoading(false)
    }
  }

  const exportCompleteReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/complete')
      if (!response.ok) throw new Error("Erro ao gerar relatório completo")

      const data = await response.json()
      
      // Create a comprehensive report
      const reportData = data.students.map((student: any) => ({
        Nome: student.name || "",
        Email: student.email || "",
        Telefone: student.phone || "",
        Cidade: student.city || "",
        Sexo: student.sex || "",
        "Modalidade de Estudo": student.studyStyle || "",
        "Data de Cadastro": new Date(student.createdAt).toLocaleDateString("pt-BR"),
        "Total de Lives Participadas": student._count.Attendance,
        "Última Participação": student.lastAttendance ? 
          new Date(student.lastAttendance).toLocaleDateString("pt-BR") : "Nunca",
        "Tempo Total Assistido (min)": Math.round(student.totalWatched / 60) || 0
      }))

      exportToCSV(reportData, `relatorio-completo-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success("Relatório completo exportado com sucesso!")
    } catch (error) {
      toast.error("Erro ao exportar relatório completo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <LoadingButton
          variant="outline"
          loading={loading}
          className="rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
          <ChevronDown className="w-4 h-4 ml-2" />
        </LoadingButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportStudentsList}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Lista de Alunos
        </DropdownMenuItem>
        
        {liveId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportAttendanceReport}>
              <Users className="mr-2 h-4 w-4" />
              Relatório de Presença
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPresentAbsent}>
              <UserCheck className="mr-2 h-4 w-4" />
              Presentes vs Ausentes
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportCompleteReport}>
          <FileText className="mr-2 h-4 w-4" />
          Relatório Completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
