
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Users } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface StudentFiltersProps {
  totalStudents: number
  filteredCount: number
}

export function StudentFilters({ totalStudents, filteredCount }: StudentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    sex: searchParams.get("sex") || "",
    studyStyle: searchParams.get("studyStyle") || "",
  })

  const [appliedFilters, setAppliedFilters] = useState(0)

  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== "").length
    setAppliedFilters(count)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    const queryString = params.toString()
    router.push(`/admin/alunos${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "",
      sex: "",
      studyStyle: "",
    })
    router.push("/admin/alunos")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {filteredCount} de {totalStudents} alunos
            {appliedFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {appliedFilters} filtro{appliedFilters > 1 ? "s" : ""} ativo{appliedFilters > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Busca por texto */}
        <div className="space-y-2">
          <Label htmlFor="search">Busca Geral</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por nome, email ou telefone..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 rounded-xl"
            />
          </div>
        </div>

        {/* Filtros específicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                <SelectItem value="Brasília">Brasília</SelectItem>
                <SelectItem value="Gama">Gama</SelectItem>
                <SelectItem value="Taguatinga">Taguatinga</SelectItem>
                <SelectItem value="Ceilândia">Ceilândia</SelectItem>
                <SelectItem value="Samambaia">Samambaia</SelectItem>
                <SelectItem value="Planaltina">Planaltina</SelectItem>
                <SelectItem value="Santa Maria">Santa Maria</SelectItem>
                <SelectItem value="Recanto das Emas">Recanto das Emas</SelectItem>
                <SelectItem value="Águas Claras">Águas Claras</SelectItem>
                <SelectItem value="Vicente Pires">Vicente Pires</SelectItem>
                <SelectItem value="Guará">Guará</SelectItem>
                <SelectItem value="São Sebastião">São Sebastião</SelectItem>
                <SelectItem value="Sobradinho">Sobradinho</SelectItem>
                <SelectItem value="Riacho Fundo">Riacho Fundo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sexo</Label>
            <Select value={filters.sex} onValueChange={(value) => handleFilterChange("sex", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todos os sexos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os sexos</SelectItem>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modalidade de Estudo</Label>
            <Select value={filters.studyStyle} onValueChange={(value) => handleFilterChange("studyStyle", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todas as modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as modalidades</SelectItem>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-2">
          <Button onClick={applyFilters} className="flex-1 rounded-xl">
            <Search className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
          {appliedFilters > 0 && (
            <Button variant="outline" onClick={clearFilters} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
