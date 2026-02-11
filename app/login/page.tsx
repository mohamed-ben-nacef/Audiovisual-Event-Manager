"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, Loader2, Star, ShieldCheck, Mail, Lock, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [error, setError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("")
      await login(data.email, data.password)
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfe] relative overflow-hidden p-6 font-inter">
      {/* Refined Background Elements - Ultra subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] left-[15%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[10%] right-[15%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
        {/* Left Side: Brand & Visuals - High contrast light version */}
        <div className="hidden lg:flex flex-col justify-center space-y-10">
           <div className="space-y-6">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-100">
                 <Star className="h-6 w-6 text-white fill-current" />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.3em] text-[11px]">
                    <Sparkles className="h-4 w-4" />
                    System Management v4.0
                 </div>
                 <h1 className="text-6xl font-black tracking-tighter leading-[0.9] text-slate-900">
                    EXCELLENCE <br />
                    <span className="text-blue-600">PRODUCTION</span> <br />
                    PRO.
                 </h1>
              </div>
              <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed border-l-4 border-slate-100 pl-6">
                 Pilotez vos ressources événementielles avec une précision chirurgicale et une interface de classe mondiale.
              </p>
           </div>
           
           <div className="flex items-center gap-10 pt-10">
              <div className="flex flex-col gap-1">
                 <span className="text-3xl font-black text-slate-900 tracking-tighter">99.9%</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime Garanti</span>
              </div>
              <div className="h-10 w-[1px] bg-slate-200"></div>
              <div className="flex flex-col gap-1">
                 <span className="text-3xl font-black text-slate-900 tracking-tighter">12k+</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assets Gérés</span>
              </div>
           </div>
        </div>

        {/* Right Side: Specialized Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-[460px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 md:p-14 space-y-10">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Espace Collaborateur</h2>
                  <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full"></div>
               </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block">
                      Email Professionnel
                    </label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="nom@Med.pro"
                        {...register("email")}
                        className={cn(
                          "h-14 bg-slate-50 border-slate-200 rounded-2xl pl-12 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all",
                          errors.email && "border-red-200"
                        )}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
                         Mot de Passe
                       </label>
                       <span className="text-[9px] font-bold text-blue-600 uppercase cursor-pointer hover:underline tracking-widest">Oublié ?</span>
                    </div>
                    <div className="relative group">
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...register("password")}
                        className={cn(
                          "h-14 bg-slate-50 border-slate-200 rounded-2xl pl-12 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all",
                          errors.password && "border-red-200"
                        )}
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>

                <Button 
                   type="submit" 
                   className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden group" 
                   disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                       Accéder au Dashboard
                       <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="pt-4 border-t border-slate-50 text-center">
                 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    Infrastructure Sécurisée par Med Cloud
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Corporate Line */}
      <div className="absolute bottom-10 left-0 w-full text-center flex items-center justify-center gap-6">
         <ShieldCheck className="h-4 w-4 text-slate-200" />
         <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">© 2026 Med EVENTS PRO • SECURE HUB v4.1</p>
      </div>
    </div>
  )
}
