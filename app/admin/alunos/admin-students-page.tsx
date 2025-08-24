
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Search, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { StudentFormDialog } from "@/components/student/student-form-dialog"
import { DeleteStudentDialog } from "@/components/student/delete-student-dialog"

interface Student {
  id: string
  name: string | null
  email: string
  phone: string | null
  city: string | null
  fullAddress: string | null
  cep: string | null
  sex: string | null
  studyStyle: string | null
  addressCompleted: boolean
  createdAt: string
  _count: {
    Attendance: number
  }
}

interface ApiResponse {
  students: Student[]
  total: number
  page: number
  totalPages: number
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchStudents = async (page: number = 1, searchTerm: string = "") => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await fetch(`/api/students?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()
        setStudents(data.students)
        setTotal(data.total)
        setCurrentPage(data.page)
        setTotalPages(data.totalPages)
      } else {
        throw new Error('Erro ao carregar alunos')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Erro ao carregar alunos')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
    fetchStudents(1, value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchStudents(page, search)
  }

  const refreshData = () => {
    fetchStudents(currentPage, search)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Renderizar números de página
  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 7
    let start = Math.max(1, currentPage - 3)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      )
    }

    return pages
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administração de Alunos</h1>
          <p className="text-muted-foreground">Gerenciar alunos cadastrados</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando alunos...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administração de Alunos</h1>
          <p className="text-muted-foreground">
            {total} alunos cadastrados • Página {currentPage} de {totalPages}
          </p>
        </div>
        <StudentFormDialog mode="create" onSuccess={refreshData} />
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md"
            />
            {search && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSearch("")}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Alunos ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground">
                {search ? "Tente ajustar o termo de busca" : "Nenhum aluno cadastrado"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">
                        {student.name || "Nome não informado"}
                      </div>
                      
                      {/* Status do primeiro acesso */}
                      {student.addressCompleted ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          ✅ Primeiro acesso feito
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          ⏳ Primeiro acesso pendente
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      📧 {student.email}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                      {student.phone && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          📱 {student.phone}
                        </span>
                      )}
                      {student.sex && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          👤 {student.sex}
                        </span>
                      )}
                      {student.studyStyle && (
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                          📚 {student.studyStyle}
                        </span>
                      )}
                      {student.city && (
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          📍 {student.city}
                        </span>
                      )}
                      <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded">
                        ✅ {student._count.Attendance} presenças
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <StudentFormDialog 
                      mode="edit" 
                      student={student} 
                      onSuccess={refreshData}
                    >
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </StudentFormDialog>
                    
                    <DeleteStudentDialog 
                      studentId={student.id}
                      studentName={student.name || student.email}
                      onDeleted={refreshData}
                    >
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteStudentDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              <div className="flex gap-1">
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="min-w-[40px]"
                  >
                    1
                  </Button>
                )}
                
                {currentPage > 3 && <span className="px-2 py-1">...</span>}
                
                {renderPageNumbers()}
                
                {currentPage < totalPages - 2 && <span className="px-2 py-1">...</span>}
                
                {currentPage < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="min-w-[40px]"
                  >
                    {totalPages}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
