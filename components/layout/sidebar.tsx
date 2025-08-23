
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Video, 
  BarChart3,
  FileText
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/escola/dashboard",
    icon: BarChart3,
  },
  {
    title: "Lives",
    href: "/escola/lives",
    icon: Video,
  },
  {
    title: "Alunos",
    href: "/escola/alunos",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/escola/relatorios",
    icon: FileText,
  },
]



export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="pb-12 w-full md:w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  pathname === item.href && "bg-muted font-medium"
                )}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </Button>
            ))}
          </div>
        </div>


      </div>
    </div>
  )
}
