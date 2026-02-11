"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Loader2, Sparkles } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchUser, tokens } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for persist to hydrate
      await new Promise(resolve => setTimeout(resolve, 100))

      // If we have tokens but no user, try to fetch user
      if (tokens && !user && !isLoading) {
        try {
          await fetchUser()
        } catch (error) {
          // If fetch fails, user is not authenticated
          console.error("Failed to fetch user:", error)
        }
      }

      setIsChecking(false)

      // Only redirect if we're sure user is not authenticated
      if (!isLoading && !isAuthenticated && !tokens) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [isAuthenticated, isLoading, user, router, fetchUser, tokens])

  // Show loading only if we're still checking or loading
  if (isChecking || (isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white animate-pulse">
                <Sparkles className="h-8 w-8 text-blue-400" />
             </div>
             <div className="absolute -inset-4 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Authentification...</h3>
             <p className="text-sm text-slate-400 font-medium">Préparation de votre espace premium</p>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated and no tokens, don't render (will redirect)
  if (!isAuthenticated && !tokens) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <div className="flex-1 lg:pl-80 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}
