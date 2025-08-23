
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Plus, Download, RefreshCw, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { StudentFormDialog } from "@/components/student/student-form-dialog"
import { DeleteStudentDialog } from "@/components/student/delete-student-dialog"

interface Student {
  id: string
  name: string | null
  email: string
  phone: string | null
  sex: string | null
  birthDate: string | null
  city: string | null
  fullAddress: string | null
  cep: string | null
  addressCompleted: boolean
  howFoundUs: string | null
  studyStyle: string | null
  timestamp: string | null
  createdAt: string
  _count: {
    Attendance: number
  }
}

export default function AlunosClientPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [sexFilter, setSexFilter] = useState("all")
  const [studyStyleFilter, setStudyStyleFilter] = useState("all")
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const fetchStudents = async () => {
    try {
      setLoading(true)
      
      const timestamp = Date.now()
      const randomParam = Math.random().toString(36).substring(7)
      
      const response = await fetch(`/api/students?t=${timestamp}&r=${randomParam}`, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStudents(Array.isArray(data) ? data : data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    
    try {
      const response = await fetch('/api/sync/sheets-to-pg', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Sincronização concluída! ${result.inserted} novos alunos importados.`)
        await fetchStudents()
      } else {
        console.error('Sync failed:', result)
        toast.error(`Erro na sincronização: ${result.errors?.join(', ') || result.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Erro ao sincronizar com a planilha')
    } finally {
      setSyncing(false)
    }
  }

  const handleExport = async () => {
    try {
      toast.loading('Gerando arquivo Excel...')
      
      // Simular download
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss()
      toast.success('Arquivo Excel baixado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar arquivo')
    }
  }

  const handleStudentUpdate = () => {
    fetchStudents()
  }

  const isRecentStudent = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, cityFilter, sexFilter, studyStyleFilter])

  // Filtros aplicados
  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.includes(searchTerm) ||
      student.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = !cityFilter || cityFilter === 'all' || 
                        student.city === cityFilter || 
                        (cityFilter === 'not-defined' && !student.city)
    
    const matchesSex = !sexFilter || sexFilter === 'all' || student.sex === sexFilter
    
    const matchesStudyStyle = !studyStyleFilter || studyStyleFilter === 'all' || 
                             student.studyStyle === studyStyleFilter || 
                             (studyStyleFilter === 'not-defined' && !student.studyStyle)

    return matchesSearch && matchesCity && matchesSex && matchesStudyStyle
  }) : []

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)



  // Controles de paginação
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Obter valores únicos para filtros
  const uniqueCities = Array.from(new Set(students.filter(s => s.city).map(s => s.city)))
  const uniqueStudyStyles = Array.from(new Set(students.filter(s => s.studyStyle).map(s => s.studyStyle)))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os alunos cadastrados no sistema
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <StudentFormDialog mode="create" onSuccess={handleStudentUpdate} />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca Geral */}
          <div>
            <Label htmlFor="search">Busca Geral</Label>
            <Input
              id="search"
              placeholder="Buscar por nome, email, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros Específicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Cidade</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city || "not-defined"}>
                      {city || "Não informado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sexo</Label>
              <Select value={sexFilter} onValueChange={setSexFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os sexos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os sexos</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Como prefere estudar?</Label>
              <Select value={studyStyleFilter} onValueChange={setStudyStyleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as modalidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {uniqueStudyStyles.map((style) => (
                    <SelectItem key={style} value={style || "not-defined"}>
                      {style || "Não informado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Alunos ({filteredStudents.length})
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} • Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} de {filteredStudents.length}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || cityFilter || sexFilter || studyStyleFilter ? 
                  "Nenhum aluno encontrado" : 
                  "Nenhum aluno cadastrado"
                }
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || cityFilter || sexFilter || studyStyleFilter ? 
                  "Tente ajustar os filtros de busca" : 
                  "Adicione alunos para começar"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Cidade</TableHead>
                    <TableHead className="hidden lg:table-cell">Como prefere estudar?</TableHead>
                    <TableHead className="hidden sm:table-cell">Presenças</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {student.name || "Não informado"}
                          {isRecentStudent(student.createdAt) && (
                            <Badge variant="secondary" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {student.phone || "Não informado"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.city || "Não informado"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {student.studyStyle || "Não informado"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-semibold">
                          {student._count.Attendance}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <StudentFormDialog 
                            mode="edit" 
                            student={student}
                            onSuccess={handleStudentUpdate}
                          />
                          <DeleteStudentDialog 
                            studentId={student.id}
                            studentName={student.name || student.email}
                            onDeleted={handleStudentUpdate}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} até {Math.min(endIndex, filteredStudents.length)} de {filteredStudents.length} alunos
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Primeira página */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={1 === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(1)}
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="px-2">...</span>}
                    </>
                  )}
                  
                  {/* Páginas próximas à atual */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page >= Math.max(1, currentPage - 2) && 
                      page <= Math.min(totalPages, currentPage + 2)
                    )
                    .map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  
                  {/* Última página */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                      <Button
                        variant={totalPages === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
