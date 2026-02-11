"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Download, 
  User, 
  Info, 
  Clock, 
  Users, 
  DollarSign, 
  ChevronRight,
  Printer,
  FileText,
  Briefcase,
  Share2,
  Trash2,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Event, EventEquipment } from "@/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PLANIFIE: { label: "Planifié", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  EN_COURS: { label: "En cours", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  TERMINE: { label: "Terminé", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ANNULE: { label: "Annulé", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [equipment, setEquipment] = useState<EventEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      setLoading(true)
      setError("")
      const [eventRes, equipmentRes] = await Promise.all([
        api.getEvent(eventId),
        api.getEventEquipment(eventId),
      ])
      setEvent(eventRes.data?.event || null)
      setEquipment(equipmentRes.data?.equipment || [])
    } catch (err: any) {
      console.error("Frontend: Error fetching event details:", err)
      setError(err.response?.data?.message || "Erreur lors du chargement de l'événement")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = async (type: string) => {
    try {
      const blob = await api.getEventDocuments(eventId, type)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${event?.event_name}-${type}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Erreur lors du téléchargement du document")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Synchronisation Dossier...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-8">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
          <CardContent className="p-16 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Info className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Dossier Introuvable</h2>
              <p className="text-slate-400 font-medium italic">{error || "Cet événement n'existe pas ou a été archivé."}</p>
            </div>
            <Link href="/events">
              <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Catalogue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[event.status] || statusConfig.PLANIFIE

  return (
    <div className="w-full space-y-12 py-6 pb-24">
      {/* Refined Pro Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-6 border-b border-slate-100">
        <div className="space-y-6 flex-1 min-w-0">
           <Link 
              href="/events" 
              className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
              Prestations
            </Link>

            <div className="space-y-4">
               <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn("px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-none shadow-sm", status.bg, status.color)}>
                    {status.label}
                  </Badge>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {eventId.slice(0, 8)}</span>
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase truncate">
                 {event.event_name}
               </h1>
               <div className="flex flex-wrap items-center gap-8 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600">
                       <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client / Corporate</span>
                       <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{event.client_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                       <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Localisation</span>
                       <span className="font-bold text-slate-500 text-sm truncate max-w-[200px]">{event.address || "Non renseigné"}</span>
                    </div>
                  </div>
               </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
           {event.status !== 'TERMINE' && (
              <Link href={`/events/${eventId}/edit`}>
                 <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 transition-all font-bold active:scale-95">
                    <Edit className="h-4 w-4 mr-3" />
                    Modifier la Fiche
                 </Button>
              </Link>
           )}
           <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 transition-all">
              <Share2 className="h-5 w-5" />
           </Button>
           <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 border border-slate-100 hover:border-red-100 transition-all">
              <Printer className="h-5 w-5" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Info */}
        <div className="lg:col-span-8 space-y-10">
           {/* Financial & Status Summary */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                 { label: "Budget Total", val: event.budget ? formatCurrency(event.budget) : "N/A", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
                 { label: "Pax Attendu", val: event.participant_count || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                 { label: "Unités Matériel", val: equipment.length, icon: Package, color: "text-amber-500", bg: "bg-amber-50" },
                 { label: "Spécialité", val: event.category, icon: Layers, color: "text-indigo-500", bg: "bg-indigo-50" }
              ].map((s, i) => (
                 <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>
                       <s.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">{s.label}</span>
                       <p className="text-xl font-black text-slate-900 tracking-tight">{s.val}</p>
                    </div>
                 </div>
              ))}
           </div>

           {/* Planning Roadmap */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Roadmap Logistique</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Chronologie des phases</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                    <div className="p-10 space-y-4">
                       <div className="flex items-center gap-3 text-slate-400">
                          <Truck className="h-5 w-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Phase 01: Setup</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-slate-900">{formatDate(event.installation_date)}</p>
                          <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg inline-block uppercase">Montage Technique</p>
                       </div>
                    </div>
                    <div className="p-10 space-y-4 bg-blue-50/20">
                       <div className="flex items-center gap-3 text-blue-600">
                          <Zap className="h-5 w-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Phase 02: Showtime</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-blue-900">{formatDate(event.event_date)}</p>
                          <p className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-lg inline-block uppercase italic">Exploitation Live</p>
                       </div>
                    </div>
                    <div className="p-10 space-y-4">
                       <div className="flex items-center gap-3 text-slate-400">
                          <History className="h-5 w-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Phase 03: Exit</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-slate-900">{formatDate(event.dismantling_date)}</p>
                          <p className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg inline-block uppercase">Démontage & Retours</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Equipment & Services */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Manifest Matériel</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Unités et services mobilisés</CardDescription>
                 </div>
                 <Link href={`/events/${eventId}/equipment`}>
                    <Button variant="ghost" className="h-10 rounded-xl px-4 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50">Modifier l'inventaire <ChevronRight className="h-4 w-4 ml-1" /></Button>
                 </Link>
              </CardHeader>
              <CardContent className="p-0">
                 {equipment.length === 0 ? (
                    <div className="p-24 text-center space-y-4">
                       <Package className="h-12 w-12 text-slate-100 mx-auto" />
                       <p className="text-slate-400 font-medium italic">Aucun équipement réservé.</p>
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                <th className="px-10 py-6">Élément Technique</th>
                                <th className="px-10 py-6">Catégorie</th>
                                <th className="px-10 py-6 text-center">Quantité</th>
                                <th className="px-10 py-6 text-right">Statut Livraison</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {equipment.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                   <td className="px-10 py-6">
                                      <p className="font-black text-slate-900 uppercase tracking-tight truncate">{item.equipment?.name}</p>
                                      <p className="text-[9px] text-slate-400 font-mono tracking-widest font-bold">{item.equipment?.reference}</p>
                                   </td>
                                   <td className="px-10 py-6">
                                      <Badge variant="outline" className="border-slate-100 rounded-lg text-slate-400 font-black text-[9px] uppercase tracking-widest">{item.equipment?.category?.name}</Badge>
                                   </td>
                                   <td className="px-10 py-6 text-center">
                                      <span className="font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl text-sm">{item.quantity_reserved}</span>
                                   </td>
                                   <td className="px-10 py-6 text-right">
                                      <Badge className={cn(
                                         "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border-none",
                                         item.status === 'RESERVE' ? "bg-blue-50 text-blue-600" : (item.status === 'LIVRE' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")
                                      )}>
                                         {item.status}
                                      </Badge>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Action Widgets & Sidebar Details */}
        <div className="lg:col-span-4 space-y-8">
           {/* Primary Actions Card */}
           <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white overflow-hidden p-10 space-y-8">
              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tight">Espace Documents</h3>
                 <p className="text-slate-500 text-xs font-medium">Exportez la documentation technique officielle.</p>
              </div>
              <div className="space-y-3">
                 {[
                    { type: "picking-list", label: "Générer la Picking List", icon: "📦" },
                    { type: "plan-de-feu", label: "Exporter le Plan de Feu", icon: "✨" },
                    { type: "bon-sortie", label: "Créer le Bon de Sortie", icon: "🚛" },
                    { type: "BON_RETOUR", label: "Créer le Bon de Retour", icon: "🔄" }
                 ].map(doc => (
                    <Button 
                       key={doc.type}
                       onClick={() => handleDownloadDocument(doc.type)}
                       className="w-full h-14 justify-between px-6 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                    >
                       <span className="flex items-center gap-3">
                          <span className="text-lg">{doc.icon}</span>
                          {doc.label}
                       </span>
                       <Download className="h-4 w-4 opacity-50" />
                    </Button>
                 ))}
              </div>
           </Card>

           {/* Pro Team Widget */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-8 pb-4 border-b border-slate-50">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Team Assignée</h4>
                    <Users className="h-4 w-4 text-blue-600" />
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 {!event || !(event as any).technician_assignments || (event as any).technician_assignments.length === 0 ? (
                    <p className="text-[11px] font-bold text-slate-400 italic">Aucun technicien assigné.</p>
                 ) : (
                    <div className="space-y-4">
                       {(event as any).technician_assignments.map((assignment: any) => (
                          <div key={assignment.id} className="flex items-center gap-4 group">
                             <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {assignment.technician?.full_name?.charAt(0)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 leading-none truncate uppercase tracking-tight">{assignment.technician?.full_name}</p>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{assignment.role || "Expert"}</span>
                             </div>
                             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          </div>
                       ))}
                    </div>
                 )}
                 <Button className="w-full h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs mt-2 border border-slate-100 transition-all">
                    Modifier l'Équipe
                 </Button>
              </CardContent>
           </Card>

           {/* Critical Notes */}
           {event.notes && (
              <Card className="border border-red-100 bg-red-50 text-red-900 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                 <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Alerte Dossier</span>
                 </div>
                 <p className="text-sm font-bold leading-relaxed italic opacity-80">
                    "{event.notes}"
                 </p>
              </Card>
           )}
        </div>
      </div>
    </div>
  )
}

function Truck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-5h-4v5a1 1 0 0 0 1 1Z" />
      <path d="M16 8h4l2 3v2h-6V8Z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

function History(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ShieldAlert(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
       <path d="M12 8v4" />
       <path d="M12 16h.01" />
     </svg>
   )
}
