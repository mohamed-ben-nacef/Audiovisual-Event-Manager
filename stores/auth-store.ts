import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User, AuthTokens } from "@/types"
import { api } from "@/lib/api"

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    full_name: string
    phone: string
    role?: string
  }) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.login(email, password)
          if (response.success && response.data) {
            const { user, tokens } = response.data
            // Store tokens in localStorage for API client
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_tokens", JSON.stringify(tokens))
              localStorage.setItem("user", JSON.stringify(user))
            }
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await api.register(data)
          if (response.success && response.data) {
            const { user, tokens } = response.data
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_tokens", JSON.stringify(tokens))
              localStorage.setItem("user", JSON.stringify(user))
            }
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await api.logout()
        } catch (error) {
          // Continue with logout even if API call fails
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_tokens")
            localStorage.removeItem("user")
          }
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const response = await api.getMe()
          if (response.success && response.data) {
            const user = response.data.user
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(user))
            }
            set({ user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          // If fetch fails, clear auth state
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_tokens")
            localStorage.removeItem("user")
          }
          set({ user: null, tokens: null, isAuthenticated: false })
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens })
        if (tokens && typeof window !== "undefined") {
          localStorage.setItem("auth_tokens", JSON.stringify(tokens))
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check localStorage for tokens
        if (typeof window !== "undefined" && state) {
          const storedTokens = localStorage.getItem("auth_tokens")
          const storedUser = localStorage.getItem("user")
          if (storedTokens && storedUser) {
            try {
              const tokens = JSON.parse(storedTokens)
              const user = JSON.parse(storedUser)
              state.setTokens(tokens)
              state.setUser(user)
            } catch (e) {
              console.error("Error rehydrating auth:", e)
            }
          }
        }
      },
    }
  )
)
