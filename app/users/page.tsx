"use client"

import { useEffect, useState } from "react"
import { 
  Plus, 
  Users as UsersIcon, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  Activity,
  MoreVertical,
  Filter,
  ArrowUpRight,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { User } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const roleColors: Record<string, { bg: string; color: string; label: string }> = {
  ADMIN: { bg: "bg-blue-50", color: "text-blue-600", label: "Administrateur" },
  MAINTENANCE: { bg: "bg-amber-50", color: "text-amber-600", label: "Technicien SAV" },
  TECHNICIEN: { bg: "bg-indigo-50", color: "text-indigo-600", label: "Expert Terrain" },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers()
      setUsers(response.data?.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <UsersIcon className="h-3 w-3" />
              Ressources Humaines
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Équipe & Talents</h1>
           <p className="text-slate-500 font-medium max-w-lg">Gérez les accès de vos collaborateurs et supervisez les compétences disponibles.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold active:scale-95">
              <UserPlus className="h-5 w-5 mr-3" />
              Inviter un Membre
           </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
        <div className="relative group flex-1 w-full">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
           <Input
             placeholder="Rechercher par nom, email, rôle..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="h-14 border-none bg-transparent pl-12 shadow-none focus:ring-0 text-md font-medium placeholder:text-slate-300"
           />
        </div>
        <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-2"></div>
        <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-50">
           <Filter className="h-4 w-4 mr-2" />
           Filtrer par rôle
        </Button>
      </div>

      {/* Modern Grid of Users */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200 p-20 text-center">
           <UsersIcon className="h-16 w-16 text-slate-200 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-slate-800">Aucun collaborateur</h3>
           <p className="text-slate-400 font-medium">Réessayez avec d'autres termes de recherche.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map((user) => {
            const role = roleColors[user.role] || { bg: "bg-slate-50", color: "text-slate-600", label: user.role }
            return (
              <Card key={user.id} className="group relative border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden">
                 <CardContent className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                       <div className="h-14 w-14 rounded-2xl bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-100 transition-all duration-300">
                          {user.full_name.charAt(0)}
                       </div>
                       <Badge className={cn("px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-none shadow-sm", role.bg, role.color)}>
                          {role.label}
                       </Badge>
                    </div>
                    
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate uppercase tracking-tight">{user.full_name}</h3>
                       <div className="flex items-center text-slate-400 gap-2">
                          {user.is_active ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                               Actif maintenant
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                               <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                               Inactif
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50 font-medium">
                       <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                             <Mail className="h-4 w-4" />
                          </div>
                          <span className="text-sm truncate font-bold">{user.email}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                             <Phone className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold">{user.phone || "Non renseigné"}</span>
                       </div>
                    </div>
                    
                    <Button variant="ghost" className="w-full h-12 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] mt-2 group/btn">
                       Gérer les permissions
                       <ArrowUpRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                 </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
