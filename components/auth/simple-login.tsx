
"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, School, GraduationCap, AlertCircle, Loader2 } from "lucide-react"

interface SimpleLoginProps {
  type: "admin" | "student"
  title: string
  description: string
}

export function SimpleLogin({ type, title, description }: SimpleLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError(null)

    try {
      const result = await signIn(type, {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(type === "admin" 
          ? "Credenciais inválidas. Use 'reciclando' e 'capacita'"
          : "Email ou telefone inválidos")
        setLoading(false)
        return
      }

      if (result?.ok) {
        // Aguarda sessão ser estabelecida
        let attempts = 0
        const maxAttempts = 10
        
        const checkSession = async () => {
          const session = await getSession()
          if (session?.user) {
            const redirectUrl = type === "admin" ? "/escola/dashboard" : "/aluno/dashboard"
            window.location.href = redirectUrl // Force navigation
            return true
          }
          return false
        }

        // Tenta verificar a sessão várias vezes
        while (attempts < maxAttempts) {
          if (await checkSession()) {
            return
          }
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Se chegou aqui, algo deu errado
        setError("Erro ao estabelecer sessão. Tente novamente.")
      }
    } catch (err) {
      setError("Erro interno. Tente novamente.")
    } finally {
      setLoading(false)
    }
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
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              type === "admin" ? "bg-blue-100" : "bg-green-100"
            }`}>
              {type === "admin" ? (
                <School className="w-10 h-10 text-blue-600" />
              ) : (
                <GraduationCap className="w-10 h-10 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {type === "admin" ? "Usuário" : "Email"}
                </Label>
                <Input
                  id="email"
                  type={type === "admin" ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={type === "admin" ? "Digite seu usuário" : "seu.email@exemplo.com"}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {type === "admin" ? "Senha" : "Telefone (Senha)"}
                </Label>
                <Input
                  id="password"
                  type={type === "admin" ? "password" : "text"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={type === "admin" ? "Digite sua senha" : "61999999999"}
                  disabled={loading}
                />
                {type === "student" && (
                  <p className="text-xs text-gray-500">
                    Digite apenas números (DDD + número)
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Verificando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
