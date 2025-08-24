
import { SimpleLogin } from "@/components/auth/simple-login"

export default function EscolaLoginPage() {
  return (
    <SimpleLogin 
      type="admin"
      title="Login Escola"
      description="Entre com suas credenciais de administrador"
    />
  )
}
