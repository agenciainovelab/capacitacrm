
import { SimpleLogin } from "@/components/auth/simple-login"

export default function AlunoLoginPage() {
  return (
    <SimpleLogin 
      type="student"
      title="Login Aluno"
      description="Entre com seu email e telefone"
    />
  )
}
