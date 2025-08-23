
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

interface AddressData {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  fullAddress: string
}

interface AddressFormDialogProps {
  open: boolean
  onComplete: () => void
  studentEmail: string
}

export function AddressFormDialog({ open, onComplete, studentEmail }: AddressFormDialogProps) {
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState<AddressData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 5) {
      return cleaned
    }
    return cleaned.replace(/^(\d{5})(\d{1,3})$/, '$1-$2')
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
    
    // Reset address when CEP changes
    if (address) {
      setAddress(null)
    }
  }

  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    
    if (cleanCep.length !== 8) {
      toast.error('CEP deve ter 8 dígitos')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/cep?cep=${cleanCep}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar CEP')
      }

      setAddress(data)
      toast.success('Endereço encontrado!')
    } catch (error) {
      console.error('CEP search error:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao buscar CEP')
    } finally {
      setLoading(false)
    }
  }

  const saveAddress = async () => {
    if (!address) return

    setSaving(true)
    
    try {
      const requestData = {
        email: studentEmail.trim(),
        city: address.city?.trim() || null,
        fullAddress: address.fullAddress?.trim() || null,
        cep: address.cep?.trim() || null
      }
      
      console.log('Sending address update:', requestData)
      
      const response = await fetch('/api/students/update-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.error || 'Erro ao salvar endereço')
      }

      const result = await response.json()
      console.log('Address saved successfully:', result)
      
      toast.success('Endereço salvo com sucesso!')
      onComplete()
    } catch (error) {
      console.error('Save address error:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar endereço')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Complete seu endereço
          </DialogTitle>
          <DialogDescription>
            Para uma melhor experiência, precisamos do seu endereço. 
            Digite seu CEP para preenchermos automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchCep} 
                disabled={loading || cep.replace(/\D/g, '').length !== 8}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Buscar
              </Button>
            </div>
          </div>

          {address && (
            <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Check className="w-4 h-4" />
                Endereço encontrado
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>CEP:</strong> {address.cep}
                </div>
                <div>
                  <strong>Endereço:</strong> {address.street}
                </div>
                <div>
                  <strong>Bairro:</strong> {address.neighborhood}
                </div>
                <div>
                  <strong>Cidade:</strong> {address.city}
                </div>
                <div>
                  <strong>Estado:</strong> {address.state}
                </div>
              </div>

              <Button 
                onClick={saveAddress} 
                disabled={saving}
                className="w-full"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? 'Salvando...' : 'Confirmar e continuar'}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            * Esta informação será solicitada apenas uma vez e é usada apenas para estatísticas regionais.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
