
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppHeader } from "@/components/layout/app-header"

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
