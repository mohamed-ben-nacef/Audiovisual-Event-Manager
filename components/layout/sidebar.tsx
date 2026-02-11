"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  Wrench,
  Truck,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Star,
  Settings as SettingsIcon
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MAINTENANCE", "TECHNICIEN"] },
  { href: "/events", label: "Événements", icon: Calendar, roles: ["ADMIN", "TECHNICIEN"] },
  { href: "/equipment", label: "Inventaire", icon: Package, roles: ["ADMIN", "MAINTENANCE", "TECHNICIEN"] },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["ADMIN", "MAINTENANCE"] },
  { href: "/transport", label: "Logistique", icon: Truck, roles: ["ADMIN"] },
  { href: "/users", label: "Équipe", icon: Users, roles: ["ADMIN"] },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageSquare, roles: ["ADMIN"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const filteredMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  )

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Mobile menu button */}
      {!isMobileOpen && (
        <button
          className="lg:hidden fixed top-6 left-6 z-50 p-3 rounded-2xl bg-white border border-gray-100 shadow-xl text-slate-900 transition-all active:scale-95"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-slate-100",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Close button for mobile */}
          <button 
             onClick={() => setIsMobileOpen(false)}
             className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
             <X className="h-6 w-6" />
          </button>

          {/* Logo Section */}
          <div className="p-8 pb-12">
            <Link href="/dashboard" className="flex items-center gap-3 group">
               <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition-all duration-300">
                  <Star className="h-5 w-5 fill-current" />
               </div>
               <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Med</h1>
                  <span className="text-[9px] font-bold text-blue-600/60 uppercase tracking-[0.2em]">Events Pro</span>
               </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 no-scrollbar">
            <p className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 opacity-70">Main Menu</p>
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isActive ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-transparent text-slate-400 group-hover:text-slate-900"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Refined */}
          <div className="p-6 mt-auto">
            <div className="bg-slate-50 rounded-3xl p-5 space-y-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-sm shadow-sm">
                   {user?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.role}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                 <button
                    onClick={handleLogout}
                    className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all text-[11px] font-bold flex items-center justify-center gap-2"
                 >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                 </button>
                 <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center">
                    <SettingsIcon className="h-4 w-4" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
