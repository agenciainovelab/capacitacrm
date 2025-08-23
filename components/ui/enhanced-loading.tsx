
"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Loader2, Check, Users, Calendar, Database, Wifi } from "lucide-react"

interface EnhancedLoadingProps {
  type?: 'login' | 'sync' | 'loading' | 'export'
  showSteps?: boolean
  showProgress?: boolean
  className?: string
}

const loadingSteps = {
  login: [
    { label: 'Verificando credenciais...', icon: Loader2, duration: 800 },
    { label: 'Carregando permissões...', icon: Users, duration: 600 },
    { label: 'Preparando dashboard...', icon: Calendar, duration: 700 },
    { label: 'Finalizando...', icon: Check, duration: 500 }
  ],
  sync: [
    { label: 'Conectando com Google Sheets...', icon: Wifi, duration: 1000 },
    { label: 'Baixando dados da planilha...', icon: Database, duration: 1200 },
    { label: 'Processando informações...', icon: Loader2, duration: 800 },
    { label: 'Salvando no banco de dados...', icon: Database, duration: 900 },
    { label: 'Concluído!', icon: Check, duration: 500 }
  ],
  loading: [
    { label: 'Carregando dados...', icon: Loader2, duration: 800 },
    { label: 'Processando informações...', icon: Database, duration: 600 },
    { label: 'Quase pronto...', icon: Check, duration: 400 }
  ],
  export: [
    { label: 'Coletando dados...', icon: Database, duration: 700 },
    { label: 'Formatando relatório...', icon: Loader2, duration: 600 },
    { label: 'Gerando arquivo...', icon: Check, duration: 500 }
  ]
}

export function EnhancedLoading({ 
  type = 'loading', 
  showSteps = false, 
  showProgress = false,
  className = "" 
}: EnhancedLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const steps = loadingSteps[type]
  const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0)

  useEffect(() => {
    if (showSteps || showProgress) {
      let elapsed = 0
      let stepIndex = 0

      const interval = setInterval(() => {
        elapsed += 50

        // Atualizar progresso (máximo 100%)
        if (showProgress) {
          const currentProgress = Math.min((elapsed / totalDuration) * 100, 100)
          setProgress(currentProgress)
        }

        // Atualizar step atual
        if (showSteps) {
          let accumulatedTime = 0
          for (let i = 0; i < steps.length; i++) {
            accumulatedTime += steps[i].duration
            if (elapsed <= accumulatedTime) {
              setCurrentStep(i)
              break
            }
          }
        }

        // Verificar se completou
        if (elapsed >= totalDuration) {
          setIsComplete(true)
          if (showProgress) setProgress(100)
          if (showSteps) setCurrentStep(steps.length - 1)
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    }
  }, [showSteps, showProgress, steps, totalDuration])

  const CurrentIcon = showSteps ? steps[currentStep]?.icon : Loader2

  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Ícone principal */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CurrentIcon className={`w-8 h-8 text-primary ${isComplete ? '' : 'animate-spin'}`} />
        </div>
      </div>

      {/* Mensagem do step atual */}
      {showSteps && (
        <div>
          <p className="text-lg font-medium text-foreground">
            {steps[currentStep]?.label}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Etapa {currentStep + 1} de {steps.length}
          </p>
        </div>
      )}

      {/* Barra de progresso */}
      {showProgress && (
        <div className="w-full max-w-xs mx-auto space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% concluído
          </p>
        </div>
      )}

      {/* Lista de steps */}
      {showSteps && (
        <div className="space-y-2 mt-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isCurrentStep = index === currentStep
            const isCompletedStep = index < currentStep
            const isPendingStep = index > currentStep

            return (
              <div 
                key={index}
                className={`flex items-center gap-3 text-sm p-2 rounded-md transition-all ${
                  isCurrentStep 
                    ? 'bg-primary/5 text-primary font-medium' 
                    : isCompletedStep
                      ? 'text-muted-foreground/80'
                      : 'text-muted-foreground/50'
                }`}
              >
                <StepIcon className={`w-4 h-4 ${
                  isCurrentStep && !isComplete ? 'animate-spin' : ''
                } ${isCompletedStep ? 'text-green-500' : ''}`} />
                <span>{step.label}</span>
                {isCompletedStep && (
                  <Check className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
