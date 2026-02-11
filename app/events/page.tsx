"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  User, 
  MapPin, 
  Layers,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Event, EventStatus } from "@/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<EventStatus, { label: string; color: string; bg: string }> = {
  PLANIFIE: { label: "Planifié", color: "text-blue-600", bg: "bg-blue-50" },
  EN_COURS: { label: "En cours", color: "text-amber-600", bg: "bg-amber-50" },
  TERMINE: { label: "Terminé", color: "text-emerald-600", bg: "bg-emerald-50" },
  ANNULE: { label: "Annulé", color: "text-red-600", bg: "bg-red-50" },
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchEvents()
  }, [statusFilter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      const response = await api.getEvents(params)
      setEvents(response.data?.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header - Replaces the big dark box */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="h-3 w-3" />
              Management des Prestations
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Espace Événements</h1>
           <p className="text-slate-500 font-medium max-w-lg">Gérez vos productions audiovisuelles, le staff et le déploiement matériel.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Link href="/events/new">
              <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold active:scale-95">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau Projet
              </Button>
           </Link>
        </div>
      </div>

      {/* Advanced Filter Stack - Professional Look */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
         <div className="relative group flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
               placeholder="Rechercher par projet, client, lieu..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="h-14 border-none bg-transparent pl-12 shadow-none focus:ring-0 text-md font-medium placeholder:text-slate-300"
            />
         </div>
         
         <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>

         <div className="flex items-center gap-2 p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['all', 'PLANIFIE', 'EN_COURS', 'TERMINE'].map((s) => (
               <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                     "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     statusFilter === s 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
               >
                  {s === 'all' ? 'Tous' : s.replace('_', ' ')}
               </button>
            ))}
         </div>

         <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>

         <div className="flex items-center gap-1 p-1">
            <button 
               onClick={() => setViewMode("grid")}
               className={cn("p-3 rounded-xl transition-all", viewMode === "grid" ? "bg-slate-100 text-blue-600 shadow-inner" : "text-slate-400 hover:bg-slate-50")}
            >
               <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
               onClick={() => setViewMode("list")}
               className={cn("p-3 rounded-xl transition-all", viewMode === "list" ? "bg-slate-100 text-blue-600 shadow-inner" : "text-slate-400 hover:bg-slate-50")}
            >
               <ListIcon className="h-4 w-4" />
            </button>
         </div>
      </div>

      {/* Main Results Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
           ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200">
          <CardContent className="p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto text-slate-300">
               <CalendarIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-slate-800 tracking-tight">Aucun projet trouvé</h3>
               <p className="text-slate-400 font-medium">Réessayez avec d'autres filtres ou créez votre première prestation.</p>
            </div>
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-white" onClick={() => {setSearchTerm(""); setStatusFilter("all")}}>Effacer la recherche</Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const status = statusConfig[event.status] || statusConfig.PLANIFIE
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="group relative border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden h-full flex flex-col">
                  {/* Subtle hover reveal indicator */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <CardContent className="p-8 flex-1 flex flex-col space-y-8">
                    <div className="flex items-start justify-between">
                       <Badge className={cn("px-4 py-2 rounded-xl font-black border-none text-[9px] uppercase tracking-widest leading-none shadow-sm", status.bg, status.color)}>
                         {status.label}
                       </Badge>
                       <div className="p-2.5 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all duration-300">
                          <ArrowUpRight className="h-4 w-4" />
                       </div>
                    </div>

                    <div className="space-y-2 flex-1">
                       <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate uppercase tracking-tight">
                         {event.event_name}
                       </h3>
                       <div className="flex items-center text-slate-400 gap-2 font-bold px-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                          <span className="truncate text-[10px] uppercase tracking-widest">{event.client_name}</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.1em] block">Date Prestation</span>
                          <div className="flex items-center gap-2 text-slate-700 font-black">
                             <CalendarIcon className="h-4 w-4 text-blue-500" />
                             <span className="text-sm">{formatDate(event.event_date)}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.1em] block">Domaine</span>
                          <div className="flex items-center gap-2 text-slate-700 font-black">
                             <Layers className="h-4 w-4 text-indigo-400" />
                             <span className="text-sm truncate">{event.category}</span>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
           <CardContent className="p-0">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                          <th className="px-10 py-6">Fiche Projet</th>
                          <th className="px-10 py-6">Client / Corporate</th>
                          <th className="px-10 py-6">Calendrier</th>
                          <th className="px-10 py-6">Spécialité</th>
                          <th className="px-10 py-6 text-right">Statut Mission</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredEvents.map((event) => {
                          const status = statusConfig[event.status] || statusConfig.PLANIFIE
                          return (
                             <tr 
                               key={event.id} 
                               className="group cursor-pointer hover:bg-blue-50/20 transition-all"
                               onClick={() => window.location.href = `/events/${event.id}`}
                             >
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-blue-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all">
                                         <Clock className="h-5 w-5" />
                                      </div>
                                      <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{event.event_name}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <span className="text-slate-600 font-bold text-sm">{event.client_name}</span>
                                </td>
                                <td className="px-10 py-6 font-bold text-slate-500 text-sm">
                                   {formatDate(event.event_date)}
                                </td>
                                <td className="px-10 py-6">
                                   <Badge variant="outline" className="border-slate-100 rounded-lg py-1 px-3 text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-500 transition-colors">{event.category}</Badge>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-sm border-none whitespace-nowrap", status.bg, status.color)}>
                                     {status.label}
                                   </Badge>
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
           </CardContent>
        </Card>
      )}
    </div>
  )
}
