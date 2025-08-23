
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  name: string | null
  email: string
  phone: string | null
  city: string | null
  fullAddress: string | null
  cep: string | null
  studyStyle: string | null
  sex: string | null
  addressCompleted: boolean
}

interface StudentFormDialogProps {
  mode: "create" | "edit"
  student?: Student
  onSuccess: () => void
  children?: React.ReactNode
}

export function StudentFormDialog({ mode, student, onSuccess, children }: StudentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    city: student?.city || "",
    fullAddress: student?.fullAddress || "",
    cep: student?.cep || "",
    studyStyle: student?.studyStyle || "",
    sex: student?.sex || ""
  })

  // Atualizar formData quando student mudar
  useEffect(() => {
    if (student && mode === "edit") {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        city: student.city || "",
        fullAddress: student.fullAddress || "",
        cep: student.cep || "",
        studyStyle: student.studyStyle || "",
        sex: student.sex || ""
      })
    }
  }, [student, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === "create" ? "/api/students" : `/api/students/${student?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      })

      if (response.ok) {
        toast.success(mode === "create" ? "Aluno criado com sucesso!" : "Aluno atualizado com sucesso!")
        setOpen(false)
        if (mode === "create") {
          setFormData({
            name: "",
            email: "",
            phone: "",
            city: "",
            fullAddress: "",
            cep: "",
            studyStyle: "",
            sex: ""
          })
        }
        onSuccess()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("Error saving student:", error)
      toast.error(`Erro ao ${mode === "create" ? "criar" : "atualizar"} aluno`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
          mode === "create" ? (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo Aluno" : "Editar Aluno"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Preencha os dados do novo aluno"
              : "Edite as informações do aluno"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Digite o nome completo"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="exemplo@email.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(61) 99999-9999"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="sex">Sexo</Label>
              <Select value={formData.sex} onValueChange={(value) => setFormData({...formData, sex: value})} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="studyStyle">Como prefere estudar?</Label>
              <Select value={formData.studyStyle} onValueChange={(value) => setFormData({...formData, studyStyle: value})} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos de endereço apenas na edição */}
            {mode === "edit" && (
              <>
                <div className="col-span-2">
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      📍 Informações de Endereço
                      {student?.addressCompleted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          ✅ Preenchido pelo aluno
                        </span>
                      )}
                      {!student?.addressCompleted && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          ⏳ Aguardando primeiro acesso
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                {student?.addressCompleted && (
                  <>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        placeholder="Ex: 72135-240"
                        disabled
                        readOnly
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Preenchido automaticamente via CEP
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        placeholder="Ex: Brasília"
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="fullAddress">Endereço Completo</Label>
                      <Input
                        id="fullAddress"
                        value={formData.fullAddress}
                        placeholder="Endereço completo obtido via CEP"
                        disabled
                        readOnly
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "create" ? "Criar Aluno" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
