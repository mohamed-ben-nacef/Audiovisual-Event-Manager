"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  Package, 
  Wrench, 
  Truck, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Clock, 
  Layers,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    equipmentInRental: 0,
    equipmentInMaintenance: 0,
    availableVehicles: 0,
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const eventsRes = await api.getEvents({ status: "PLANIFIE", limit: 5 })
      const equipmentRes = await api.getEquipment({ status: "EN_LOCATION", limit: 1 })
      const maintenanceRes = await api.getEquipment({ status: "EN_MAINTENANCE", limit: 1 })
      const vehiclesRes = await api.getVehicles({ status: "DISPONIBLE" })

      setUpcomingEvents(eventsRes.data?.events || [])
      setStats({
        upcomingEvents: eventsRes.data?.total || 0,
        equipmentInRental: equipmentRes.data?.total || 0,
        equipmentInMaintenance: maintenanceRes.data?.total || 0,
        availableVehicles: vehiclesRes.data?.vehicles?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Événements Planifiés",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/events",
      description: "À confirmer"
    },
    {
      title: "Matériel Déployé",
      value: stats.equipmentInRental,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/equipment?status=EN_LOCATION",
      description: "Sur site"
    },
    {
      title: "Unités en Atelier",
      value: stats.equipmentInMaintenance,
      icon: Wrench,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/maintenance",
      description: "Maintenance"
    },
    {
      title: "Logistique Active",
      value: stats.availableVehicles,
      icon: Truck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/transport",
      description: "Disponibles"
    },
  ]

  return (
    <div className="w-full space-y-12 py-6">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Zap className="h-3 w-3" />
              Intelligence Opérationnelle
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Bonjour, Med</h1>
           <p className="text-slate-500 font-medium">Voici un résumé de l'activité de votre parc aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/events/new">
              <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold active:scale-95">
                 <Plus className="h-5 w-5 mr-2" />
                 Créer un Projet
              </Button>
           </Link>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="group relative border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 rounded-[2.5rem] bg-white overflow-hidden transform hover:-translate-y-1">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-xl", stat.bgColor, stat.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-200 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">
                      {loading ? "..." : stat.value}
                    </p>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{stat.title}</p>
                      <p className="text-xs text-slate-400 font-medium">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed: Upcoming Events */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Agenda de Production</CardTitle>
                <CardDescription className="font-medium">Vos 5 prochaines missions planifiées</CardDescription>
              </div>
              <Link href="/events">
                 <Button variant="ghost" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50">
                    Voir le Planning <ChevronRight className="h-4 w-4 ml-1" />
                 </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-10 space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                   <Calendar className="h-12 w-12 text-slate-100 mx-auto" />
                   <p className="text-slate-400 font-medium italic">Aucun événement à l'horizon.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center justify-between p-10 hover:bg-blue-50/20 transition-all group"
                    >
                      <div className="flex items-center gap-8">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white font-black shrink-0 group-hover:bg-blue-600 transition-colors">
                           <span className="text-[9px] uppercase opacity-60 mb-0.5">{new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                           <span className="text-xl leading-none">{new Date(event.event_date).getDate()}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate max-w-[250px] md:max-w-md">
                            {event.event_name}
                          </h3>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{event.client_name}</span>
                             <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg border-slate-100 text-slate-400">{event.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Execution</span>
                           <span className="text-xs font-bold text-slate-600">{formatDate(event.event_date)}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-blue-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets - Refined */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-slate-50 overflow-hidden relative group">
              <CardHeader className="p-8 pb-4">
                 <div className="flex items-center gap-2 text-indigo-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Disponibilité Stock</span>
                 </div>
                 <CardTitle className="text-xl font-black mt-2 text-slate-900 uppercase">Capacité Actuelle</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                          <span className="text-slate-400">Projection & Vidéo</span>
                          <span className="text-blue-600">{stats.equipmentInRental}%</span>
                       </div>
                       <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, stats.equipmentInRental)}%` }}></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                          <span className="text-slate-400">Sonorisation</span>
                          <span className="text-emerald-600">{stats.equipmentInMaintenance}%</span>
                       </div>
                       <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, stats.equipmentInMaintenance)}%` }}></div>
                       </div>
                    </div>
                 </div>
                 
                 <Link href="/equipment">
                    <Button className="w-full h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:text-blue-600 hover:border-blue-200 font-bold transition-all text-sm">
                       Inventaire Complet
                    </Button>
                 </Link>
              </CardContent>
           </Card>

           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                       <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Vigilance Logistique</h3>
                 </div>
                 <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                       <span className="text-[9px] font-black text-blue-600 uppercase">Urgent</span>
                       <p className="text-xs font-bold text-slate-700 leading-relaxed">Contrôler les lampes du projecteur PT-RZ21 avant départ Salle Pleyel.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                       <span className="text-[9px] font-black text-emerald-600 uppercase">Infos</span>
                       <p className="text-xs font-bold text-slate-700 leading-relaxed">Équipe technique confirmée pour le montage de Vendredi.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
