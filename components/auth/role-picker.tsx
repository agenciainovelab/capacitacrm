
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { School, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function RolePicker() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-8 mb-8">
            <div className="relative w-48 h-48">
              <Image
                src="/images/logo-capacita.png"
                alt="Logo CAPACITA"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-48 h-48">
              <Image
                src="/images/logo-reciclando.png"
                alt="Logo Reciclando o Futuro"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EAD CAPACITA
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Ensino à Distância com controle de presença
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <School className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Escola</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Acesse como administrador para gerenciar lives, alunos e ver relatórios de presença
              </p>
              <Button className="w-full" size="lg" onClick={() => router.push("/login/escola")}>
                Acessar como Escola
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Aluno</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Acesse para participar das lives e marcar sua presença
              </p>
              <Button className="w-full" variant="outline" size="lg" onClick={() => router.push("/login/aluno")}>
                Acessar como Aluno
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
