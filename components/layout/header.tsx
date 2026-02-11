"use client"

import { Bell, Search, Settings, HelpCircle, Activity, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="h-20 flex items-center justify-between px-8 lg:px-12 bg-white/40 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center gap-8 flex-1">
         {/* Page Context or Breadcrumb can go here */}
         <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
            <Command className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workflow Central</span>
         </div>

         {/* Focused Search */}
         <div className="relative group max-w-sm w-full hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Recherche globale..." 
               className="h-10 w-full pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
         </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Indicators */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 pr-6 border-r border-slate-100">
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Live
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 border-2 border-white rounded-full"></span>
           </Button>
           
           <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
              <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs uppercase">
                 {user?.full_name?.charAt(0)}
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}
