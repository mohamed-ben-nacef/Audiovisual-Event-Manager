"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, tokens } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for persist to hydrate
    const timer = setTimeout(() => {
      setIsChecking(false)
      if (!isLoading) {
        if (isAuthenticated || tokens) {
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading, tokens, router])

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  )
}
