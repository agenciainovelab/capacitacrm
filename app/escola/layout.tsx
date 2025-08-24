
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"

export default function EscolaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <ResponsiveLayout>{children}</ResponsiveLayout>
    </ProtectedRoute>
  )
}
