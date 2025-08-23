
"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="md:hidden p-4 border-b">
          <div className="w-full h-9 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="flex relative">
          <aside className="hidden md:block w-64 min-h-[calc(100vh-4rem)] border-r bg-background">
            <div className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </aside>
          <main className="flex-1 min-w-0 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Mobile menu button */}
      <div className="md:hidden p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-start"
        >
          <Menu className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </div>

      <div className="flex relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 
          w-64 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] 
          border-r bg-background
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile close button */}
          <div className="md:hidden p-4 border-b flex justify-between items-center">
            <span className="font-semibold">Menu</span>
            <Button variant="ghost" size="sm" onClick={closeSidebar}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
