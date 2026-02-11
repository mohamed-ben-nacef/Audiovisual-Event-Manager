"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  CheckCircle, 
  Wrench, 
  AlertCircle, 
  QrCode, 
  History,
  Box,
  Tag,
  BadgeEuro,
  Scale,
  Hammer,
  ChevronRight,
  Printer,
  FileText,
  Info,
  Layers,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Equipment, EquipmentStatusHistory } from "@/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DISPONIBLE: { label: "Disponible", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
  EN_LOCATION: { label: "En location", color: "text-blue-600", bg: "bg-blue-50", icon: Package },
  EN_MAINTENANCE: { label: "Atelier", color: "text-amber-600", bg: "bg-amber-50", icon: Wrench },
  MANQUANT: { label: "Manquant", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
}

export default function EquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const equipmentId = params.id as string
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [history, setHistory] = useState<EquipmentStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (equipmentId) {
      fetchEquipmentData()
    }
  }, [equipmentId])

  const fetchEquipmentData = async () => {
    try {
      setLoading(true)
      setError("")
      const [equipmentRes, historyRes] = await Promise.all([
        api.getEquipmentById(equipmentId),
        api.getEquipmentHistory(equipmentId),
      ])
      setEquipment(equipmentRes.data?.equipment || null)
      setHistory(historyRes.data?.history || [])
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement du matériel")
      console.error("Error fetching equipment:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Scan Asset Database...</p>
      </div>
    )
  }

  if (error || !equipment) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-8">
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
          <CardContent className="p-16 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Info className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Équipement Introuvable</h2>
              <p className="text-slate-400 font-medium italic">{error || "Cet asset n'est plus référencé dans notre inventaire."}</p>
            </div>
            <Link href="/equipment">
              <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'Inventaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = equipment.status ? statusConfig[equipment.status] : statusConfig.DISPONIBLE
  const StatusIcon = statusInfo.icon

  return (
    <div className="w-full space-y-12 py-6 pb-24">
      {/* High-End Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-6 border-b border-slate-100">
        <div className="space-y-6 flex-1 min-w-0">
           <Link 
              href="/equipment" 
              className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
              Catalogue Technique
            </Link>

            <div className="space-y-4">
               <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn("px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-none shadow-sm", statusInfo.bg, statusInfo.color)}>
                    <StatusIcon className="h-3 w-3 mr-2" />
                    {statusInfo.label}
                  </Badge>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">REF: {equipment.reference}</span>
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase truncate">
                 {equipment.name}
               </h1>
               <div className="flex flex-wrap items-center gap-8 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600">
                       <Box className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catégorie</span>
                       <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{equipment.category?.name || "Standard"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                       <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marque / Modèle</span>
                       <span className="font-bold text-slate-500 text-sm truncate max-w-[200px]">{equipment.brand} {equipment.model}</span>
                    </div>
                  </div>
               </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href={`/equipment/${equipmentId}/edit`}>
              <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all font-bold active:scale-95">
                 <Edit className="h-4 w-4 mr-3" />
                 Mettre à jour
              </Button>
           </Link>
           <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-orange-600 border border-slate-100 hover:border-orange-100 transition-all">
              <QrCode className="h-5 w-5" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Details Area */}
        <div className="lg:col-span-8 space-y-10">
           {/* Visual & Summary Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {equipment.photos && equipment.photos.length > 0 ? (
                 <Card className="border border-slate-100 shadow-sm rounded-[3rem] overflow-hidden bg-white h-[400px]">
                    <img 
                       src={equipment.photos[0]} 
                       alt={equipment.name} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                 </Card>
              ) : (
                 <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-slate-50 h-[400px] flex items-center justify-center">
                    <Package className="h-20 w-20 text-slate-100" />
                 </Card>
              )}

              <div className="space-y-6">
                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Disponibilité Temps Réel</span>
                       <div className="flex items-end gap-3">
                          <p className="text-5xl font-black text-slate-900">{equipment.quantity_available}</p>
                          <p className="text-xl font-bold text-slate-300 pb-1">/ {equipment.quantity_total} UNITÉS</p>
                       </div>
                    </div>
                    
                    <div className="h-[1px] bg-slate-50"></div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tarif Location / J</span>
                          <p className="text-xl font-black text-blue-600">{formatCurrency(equipment.daily_rental_price || 0)}</p>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Valeur Assurée</span>
                          <p className="text-xl font-black text-slate-900">{formatCurrency(equipment.purchase_price || 0)}</p>
                       </div>
                    </div>
                 </div>

                 <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-slate-900 text-white overflow-hidden p-8 space-y-4">
                    <div className="flex items-center gap-3 text-blue-400">
                       <Scale className="h-5 w-5" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logistique</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Poids</p>
                          <p className="text-lg font-black">{equipment.weight_kg ? `${equipment.weight_kg} kg` : "N/A"}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Fournisseur</p>
                          <p className="text-lg font-black truncate">{equipment.supplier || "Standard"}</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>

           {/* Technical Specs & Description */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Fiche Technique</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Spécifications et descriptif complet</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                 {equipment.description && (
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Résumé de l'Asset</h4>
                       <p className="text-slate-600 font-medium leading-relaxed italic text-lg">{equipment.description}</p>
                    </div>
                 )}
                 {equipment.technical_specs && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Données Ingénierie</h4>
                       <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                          <pre className="text-sm font-bold text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">{equipment.technical_specs}</pre>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* History Timeline */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">Cycle de Vie</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Historique des mouvements et maintenance</CardDescription>
                 </div>
                 <History className="h-6 w-6 text-slate-200" />
              </CardHeader>
              <CardContent className="p-0">
                 {history.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                       <History className="h-10 w-10 text-slate-100 mx-auto" />
                       <p className="text-slate-400 font-medium">Aucun événement enregistré.</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-slate-50">
                       {history.map((record) => {
                          const itemStatus = statusConfig[record.status] || statusConfig.DISPONIBLE
                          return (
                             <div key={record.id} className="p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-6">
                                   <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", itemStatus.bg, itemStatus.color)}>
                                      <itemStatus.icon className="h-5 w-5" />
                                   </div>
                                   <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                         <p className="font-black text-slate-900 uppercase tracking-tight">{itemStatus.label}</p>
                                         {record.notes && <span className="text-[10px] text-slate-400 font-medium italic">"{record.notes}"</span>}
                                      </div>
                                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatDate(record.changed_at)}</p>
                                   </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-slate-200 group-hover:text-blue-600 transition-colors" />
                             </div>
                          )
                       })}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-8">
           {/* Contextual Actions */}
           <Card className="border-none shadow-xl rounded-[3rem] bg-blue-600 text-white overflow-hidden p-10 space-y-8">
              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tight">Gestion Asset</h3>
                 <p className="text-blue-200 text-xs font-medium">Actions prioritaires sur cet équipement.</p>
              </div>
              <div className="space-y-3">
                 <Button className="w-full h-14 justify-between px-6 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-xs uppercase tracking-widest transition-all">
                    <span>Ouvrir Maintenance</span>
                    <Hammer className="h-4 w-4" />
                 </Button>
                 <Button className="w-full h-14 justify-between px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all border border-white/10">
                    <span>Imprimer Catalogue</span>
                    <Printer className="h-4 w-4" />
                 </Button>
              </div>
           </Card>

           {/* QR Detail Card */}
           {equipment.qr_code_url && (
              <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white p-8 space-y-6 text-center">
                 <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identification Digitale</h4>
                    <p className="text-sm font-bold text-slate-900">QR Code d'Asset</p>
                 </div>
                 <div className="relative group mx-auto w-48 h-48 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center transition-all hover:shadow-2xl hover:border-blue-100">
                    <img src={equipment.qr_code_url} alt="QR Code" className="w-full h-full object-contain" />
                 </div>
                 <Button variant="ghost" className="w-full text-blue-600 font-bold hover:bg-blue-50 rounded-xl">Télécharger l'étiquette</Button>
              </Card>
           )}

           {/* Quick Stats Widget */}
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-slate-50 p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                    <Info className="h-5 w-5" />
                 </div>
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Aperçu Performance</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between group cursor-help">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Taux d'utilisation</span>
                    <span className="text-sm font-black text-emerald-600">84%</span>
                 </div>
                 <div className="flex items-center justify-between group cursor-help">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Dernier Checkup</span>
                    <span className="text-sm font-black text-slate-900">24/01/24</span>
                 </div>
                 <div className="flex items-center justify-between group cursor-help">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">ROI Estimé</span>
                    <span className="text-sm font-black text-blue-600">High</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
