"use client"

import { useEffect, useState } from "react"
import { 
  Plus, 
  Truck, 
  MapPin, 
  Navigation, 
  Calendar, 
  ChevronRight, 
  Settings, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Milestone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Vehicle, Transport } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const vehicleStatusConfig: Record<string, { bg: string; color: string; label: string }> = {
  DISPONIBLE: { bg: "bg-emerald-50", color: "text-emerald-600", label: "Opérationnel" },
  EN_SERVICE: { bg: "bg-blue-50", color: "text-blue-600", label: "En Mission" },
  EN_MAINTENANCE: { bg: "bg-amber-50", color: "text-amber-600", label: "Check-up" },
}

export default function TransportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, transportsRes] = await Promise.all([
        api.getVehicles(),
        api.getTransports(),
      ])
      setVehicles(vehiclesRes.data?.vehicles || [])
      setTransports(transportsRes.data?.transports || [])
    } catch (error) {
      console.error("Error fetching transport data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Truck className="h-3 w-3" />
              Logistique & Déploiement
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Gestion de Flotte</h1>
           <p className="text-slate-500 font-medium max-w-lg">Supervisez vos véhicules et coordonnez les flux logistiques vers vos sites d'événements.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold active:scale-95">
              <Plus className="h-5 w-5 mr-3" />
              Nouveau Véhicule
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Vehicles Column */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                 Flotte Active ({vehicles.length})
              </h2>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
             </div>
           ) : vehicles.length === 0 ? (
             <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50 border border-dashed border-slate-200 p-20 text-center">
                <Truck className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-medium italic">Aucun véhicule enregistré dns le parc.</p>
             </Card>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((v) => {
                  const status = vehicleStatusConfig[v.status] || vehicleStatusConfig.DISPONIBLE
                  return (
                    <Card key={v.id} className="group relative border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden">
                       <CardContent className="p-8 space-y-6">
                          <div className="flex items-start justify-between">
                             <div className="h-14 w-14 rounded-2xl bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-slate-100 transition-all duration-300">
                                <Truck className="h-6 w-6" />
                             </div>
                             <Badge className={cn("px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-none shadow-sm", status.bg, status.color)}>
                                {status.label}
                             </Badge>
                          </div>
                          
                          <div className="space-y-1">
                             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight truncate">{v.brand} {v.model}</h3>
                             <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">{v.registration_number}</p>
                          </div>

                          <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-black text-slate-300 tracking-widest block">Type de Fret</span>
                                <p className="text-sm font-bold text-slate-700">{v.type}</p>
                             </div>
                             <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-black text-slate-300 tracking-widest block">Capacité Max</span>
                                <p className="text-sm font-bold text-slate-700">{v.load_capacity_kg ? `${v.load_capacity_kg} KG` : "Sur mesure"}</p>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  )
                })}
             </div>
           )}
        </div>

        {/* Transports Timeline Column */}
        <div className="lg:col-span-4 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                 Flux & Trajets
              </h2>
           </div>

           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-8 pb-4 border-b border-slate-50">
                 <CardTitle className="text-[11px] font-black tracking-widest uppercase text-slate-400">Monitoring Logistique</CardTitle>
                 <CardDescription className="text-[10px] font-medium uppercase tracking-widest">En temps réel</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 {loading ? (
                   <div className="p-8 space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>)}
                   </div>
                 ) : transports.length === 0 ? (
                   <div className="p-16 text-center text-slate-300 italic font-medium">Aucun trajet planifié pour le moment.</div>
                 ) : (
                   <div className="divide-y divide-slate-50">
                      {transports.map((t) => (
                        <div key={t.id} className="p-8 space-y-5 hover:bg-slate-50 transition-all group">
                           <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[9px] font-black text-blue-600 bg-blue-50 border-none px-3 py-1 rounded-full uppercase tracking-widest">{t.status}</Badge>
                              <span className="text-[9px] font-black text-slate-300 uppercase">{formatDate(t.departure_date)}</span>
                           </div>
                           <div className="space-y-3">
                              <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm leading-tight">{t.event?.event_name || "Transfert Entrepôt"}</h4>
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                    <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                                    <span className="truncate">{t.departure_address}</span>
                                 </div>
                                 <div className="h-4 w-[1px] bg-slate-100 ml-1"></div>
                                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-900">
                                    <MapPin className="h-3 w-3 text-blue-500" />
                                    <span className="truncate">{t.arrival_address}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>

           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-blue-600 text-white overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                 <div className="flex items-center gap-3 text-blue-200">
                    <Milestone className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Rappel Sécurité</span>
                 </div>
                 <p className="text-xs font-bold leading-relaxed opacity-90">
                    Vérifiez systématiquement le calage du matériel et la pression des pneus avant tout départ sur autoroute.
                 </p>
                 <Button variant="ghost" className="w-full h-12 rounded-xl bg-white/10 hover:bg-white text-white hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2 border border-white/10 transition-all">
                    Télécharger la Checklist
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
