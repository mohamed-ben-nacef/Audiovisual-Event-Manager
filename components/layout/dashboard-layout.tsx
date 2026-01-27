"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Loader2 } from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and no tokens, don't render (will redirect)
  if (!isAuthenticated && !tokens) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
