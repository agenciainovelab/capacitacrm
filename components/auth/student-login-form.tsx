
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { EnhancedLoading } from "@/components/ui/enhanced-loading"
import { ArrowLeft, GraduationCap, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const studentLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos")
})

type StudentLoginForm = z.infer<typeof studentLoginSchema>

export function StudentLoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema)
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setValue('phone', rawValue)
  }

  const onSubmit = async (data: StudentLoginForm) => {
    setLoading(true)
    setError(null)
    setShowLoadingScreen(true)

    try {
      const result = await signIn('student', {
        email: data.email,
        password: data.phone,
        redirect: false
      })

      if (result?.error) {
        setError("Email ou telefone inválidos. Verifique suas credenciais.")
        setShowLoadingScreen(false)
      } else if (result?.ok) {
        // Aguarda um pouco para a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push("/aluno/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Erro interno. Tente novamente.")
      setShowLoadingScreen(false)
    } finally {
      setLoading(false)
    }
  }

  if (showLoadingScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Entrando como Aluno</h2>
              <p className="text-sm text-muted-foreground">Preparando seu dashboard personalizado</p>
            </div>
            <EnhancedLoading 
              type="login" 
              showSteps
              showProgress
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="absolute top-4 left-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Login Aluno</CardTitle>
            <CardDescription>
              Entre com seu email e telefone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu.email@exemplo.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (Senha)</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="61999999999"
                  onChange={handlePhoneChange}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Digite apenas números (DDD + número)
                </p>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <LoadingButton 
                type="submit" 
                className="w-full" 
                loading={loading}
                loadingText="Verificando..."
              >
                Entrar
              </LoadingButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
