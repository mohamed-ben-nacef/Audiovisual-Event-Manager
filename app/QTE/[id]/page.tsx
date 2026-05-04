"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Settings2, 
  Truck, 
  Info,
  ShieldCheck,
  Tag,
  Factory,
  Wrench
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Equipment } from "@/types"
import { cn } from "@/lib/utils"

export default function PublicEquipmentPage() {
  const params = useParams()
  const equipmentId = params.id as string
  const [equipment, setEquipment] = useState<Equipment | null>(null)
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
      const res = await api.getEquipmentById(equipmentId)
      setEquipment(res.data?.equipment || null)
    } catch (err: any) {
      setError("Impossible de charger les données. Veuillez contacter l'administrateur.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#F8FAFC] space-y-8 p-10">
        <div className="relative">
          <div className="h-20 w-20 border-[6px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-6 w-6 text-slate-300" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronisation Cloud</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Veuillez patienter...</p>
        </div>
      </div>
    )
  }

  if (error || !equipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#F8FAFC] p-6 text-center">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-12 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500 mb-8 rotate-3">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Accès Refusé</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">{error || "Cet équipement n'existe pas ou a été retiré de l'inventaire."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 pb-20">
      {/* Header Overlay */}
      <div className="h-64 bg-slate-900 w-full absolute top-0 left-0">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="relative px-4 pt-12 max-w-xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 p-8 pt-10 text-center space-y-6 border border-white/50 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Produit Authentifié</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none uppercase">
              {equipment.name}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <span className="text-slate-300 text-[10px] uppercase font-black tracking-widest">Reference:</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-widest">{equipment.reference}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-slate-50 rounded-2xl flex items-center gap-2 border border-slate-100">
              <Factory className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{equipment.brand || 'No Brand'}</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-2xl flex items-center gap-2 border border-slate-100">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{equipment.model || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Quantities Section */}
        <div className="space-y-4">
          <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden transition-transform hover:scale-[1.02] duration-500 border-2 border-emerald-500">
            <CardContent className="p-10 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100 ring-8 ring-emerald-50">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">Disponible Immédiatement</span>
                  <p className="text-6xl font-black text-slate-900 tracking-tighter">{equipment.quantity_available}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <StatSmall label="En Maintenance" value={equipment.quantity_in_maintenance} icon={<Wrench className="h-4 w-4" />} color="orange" />
            <StatSmall label="En Sortie" value={equipment.quantity_in_rental} icon={<Truck className="h-4 w-4" />} color="purple" />
            <StatSmall label="Stock Total" value={equipment.quantity_total} icon={<Package className="h-4 w-4" />} color="slate" />
          </div>
        </div>

        {/* Technical specs table */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-2">
            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Fiche Technique</h3>
          </div>
          
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <TableDetailRow label="Marque / Brand" value={equipment.brand || "Standard"} />
                  <TableDetailRow label="Modèle / Model" value={equipment.model || "N/A"} />
                  <TableDetailRow label="Catégorie" value={equipment.category?.name || "Général"} isLast={false} />
                  <TableDetailRow label="Sous-Catégorie" value={equipment.subcategory?.name || "---"} isLast={false} />
                  <TableDetailRow label="Poids net" value={equipment.weight_kg ? `${equipment.weight_kg} kg` : "N/A"} isLast={false} />
                  <TableDetailRow label="Type Unité" value={equipment.is_lot_based ? `Pack de ${equipment.items_per_lot}` : "Individuel"} isLast={true} />
                </tbody>
              </table>
            </div>
            {equipment.description && (
              <div className="p-8 pt-2 bg-slate-50/50 border-t border-slate-50">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Info className="h-3 w-3" /> Description
                 </p>
                 <p className="text-[11px] text-slate-600 font-medium leading-relaxed leading-snug tracking-tight italic">
                   "{equipment.description}"
                 </p>
              </div>
            )}
          </Card>
        </div>

        {/* Status Indicator Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-lg shadow-slate-100 flex items-center justify-between border border-slate-100">
           <div className="flex items-center gap-3">
              <div className={cn(
                "h-2 w-2 rounded-full",
                equipment.quantity_available > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {equipment.quantity_available > 0 ? 'Opérationnel' : 'Stock Épuisé'}
              </span>
           </div>
           <Settings2 className="h-4 w-4 text-slate-200" />
        </div>

        {/* Footer */}
        <div className="pt-4 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Inventory Monitoring System</p>
        </div>
      </div>
    </div>
  )
}

function StatSmall({ label, value, icon, color }: any) {
  const themes: any = {
    slate: "bg-slate-50 text-slate-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  }

  return (
    <div className={cn("p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-3", themes[color])}>
      <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">{label}</p>
        <p className="text-xl font-black tracking-tighter text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function TableDetailRow({ label, value, isLast }: { label: string, value: string, isLast?: boolean }) {
  return (
    <tr className={cn(!isLast && "border-b border-slate-50")}>
      <td className="py-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</td>
      <td className="py-4 px-8 text-[11px] font-black text-slate-900 text-right tracking-tight">{value}</td>
    </tr>
  )
}
