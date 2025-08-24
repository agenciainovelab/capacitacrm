
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
import { ArrowLeft, School, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const adminLoginSchema = z.object({
  email: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export function AdminLoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema)
  })

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true)
    setError(null)
    setShowLoadingScreen(true)

    try {
      const result = await signIn('admin', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        setError("Credenciais inválidas. Use usuário 'reciclando' e senha 'capacita'")
        setShowLoadingScreen(false)
      } else if (result?.ok) {
        // Aguarda um pouco para a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push("/escola/dashboard")
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
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <School className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Entrando no Sistema</h2>
              <p className="text-sm text-muted-foreground">Aguarde enquanto preparamos seu dashboard</p>
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
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <School className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Login Escola</CardTitle>
            <CardDescription>
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Usuário</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Digite seu usuário"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
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
