"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Package, 
  CheckCircle, 
  Wrench, 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  Tag, 
  Filter, 
  LayoutGrid, 
  List as ListIcon,
  Box,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatCurrency, cn } from "@/lib/utils"
import { Equipment, EquipmentStatus } from "@/types"

const statusConfig: Record<EquipmentStatus, { label: string; color: string; bg: string; icon: any }> = {
  DISPONIBLE: { label: "Disponible", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
  EN_LOCATION: { label: "En location", color: "text-blue-600", bg: "bg-blue-50", icon: Package },
  EN_MAINTENANCE: { label: "Maintenance", color: "text-amber-600", bg: "bg-amber-50", icon: Wrench },
  MANQUANT: { label: "Manquant", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categories, setCategories] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchCategories()
    fetchEquipment()
  }, [categoryFilter, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (categoryFilter !== "all") params.category_id = categoryFilter
      if (statusFilter !== "all") params.status = statusFilter
      if (searchTerm) params.search = searchTerm
      const response = await api.getEquipment(params)
      setEquipment(response.data?.equipment || [])
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchEquipment()
  }

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Box className="h-3 w-3" />
              Ressources & Matériel
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Inventaire Technique</h1>
           <p className="text-slate-500 font-medium max-w-lg">Supervisez l'état, la disponibilité et les tarifs de votre parc audiovisuel.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Link href="/equipment/categories">
              <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold active:scale-95 transition-all">
                <Layers className="h-5 w-5 mr-2" />
                Catégories
              </Button>
           </Link>
           <Link href="/equipment/new">
              <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all font-bold active:scale-95">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau Matériel
              </Button>
           </Link>
        </div>
      </div>

      {/* Control Bar - Multi-layer filtering */}
      <div className="space-y-4">
         <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
            <div className="relative group flex-1 w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
               <Input
                  placeholder="Rechercher par nom, marque, référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 border-none bg-transparent pl-12 shadow-none focus:ring-0 text-md font-medium placeholder:text-slate-300"
               />
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

         <div className="flex flex-wrap items-center gap-3 px-2">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
               <Filter className="h-3.5 w-3.5 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrer :</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
               <button 
                  onClick={() => setCategoryFilter("all")}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", categoryFilter === "all" ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" : "bg-white text-slate-500 border-slate-100 hover:border-slate-300")}
               >
                  TOUS
               </button>
               {categories.map(cat => (
                  <button 
                     key={cat.id}
                     onClick={() => setCategoryFilter(cat.id)}
                     className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all border", categoryFilter === cat.id ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" : "bg-white text-slate-500 border-slate-100 hover:border-slate-300")}
                  >
                     {cat.name.toUpperCase()}
                  </button>
               ))}
            </div>

            <div className="flex-1"></div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
               {Object.keys(statusConfig).map(s => (
                  <button 
                     key={s}
                     onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                     className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                        statusFilter === s ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                     )}
                  >
                     {statusConfig[s as EquipmentStatus].label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className="h-80 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
           ))}
        </div>
      ) : equipment.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200 p-24 text-center">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto text-slate-300 mb-6">
               <Package className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aucun matériel trouvé</h3>
            <p className="text-slate-400 font-medium mt-2">Affinez votre recherche ou ajoutez un nouvel équipement.</p>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {equipment.map((item) => {
            const status = (item.status && statusConfig[item.status as EquipmentStatus]) || statusConfig.DISPONIBLE
            return (
              <Link key={item.id} href={`/equipment/${item.id}`}>
                <Card className="group border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden h-full flex flex-col">
                  <div className="p-0 flex flex-col h-full">
                    {/* Visual Area */}
                    <div className="relative h-52 bg-slate-50 overflow-hidden">
                       {item.photos && item.photos.length > 0 ? (
                         <img 
                            src={item.photos[0]} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <Package className="h-12 w-12" />
                         </div>
                       )}
                       <div className="absolute top-4 left-4">
                          <Badge className={cn("px-4 py-2 rounded-xl font-black border-none text-[9px] uppercase tracking-widest leading-none shadow-sm", status.bg, status.color)}>
                            {status.label}
                          </Badge>
                       </div>
                    </div>

                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{item.reference}</span>
                             <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                             <span className="text-[10px] font-bold text-blue-600/60 uppercase">{item.category?.name}</span>
                          </div>
                       </div>

                       <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between">
                          <div className="space-y-1">
                             <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block leading-none">Disponibilité</span>
                             <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-slate-900">{item.quantity_available}</span>
                                <span className="text-[10px] font-bold text-slate-300">/ {item.quantity_total} UNITS</span>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block leading-none mb-1">Prix Jour</span>
                             <span className="text-lg font-black text-blue-600">
                               {formatCurrency(typeof item.daily_rental_price === 'number' ? item.daily_rental_price : parseFloat(String(item.daily_rental_price)) || 0)}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
           <CardContent className="p-0">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                          <th className="px-10 py-6">Équipement & Référence</th>
                          <th className="px-10 py-6">Catégorie</th>
                          <th className="px-10 py-6 text-center">Stock Actuel</th>
                          <th className="px-10 py-6 text-center">Prêt à Louer</th>
                          <th className="px-10 py-6 text-right">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {equipment.map((item) => {
                          const status = (item.status && statusConfig[item.status as EquipmentStatus]) || statusConfig.DISPONIBLE
                          return (
                             <tr 
                              key={item.id} 
                              className="group cursor-pointer hover:bg-blue-50/20 transition-all font-medium"
                              onClick={() => window.location.href = `/equipment/${item.id}`}
                             >
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                         {item.photos && item.photos.length > 0 ? (
                                           <img src={item.photos[0]} className="w-full h-full object-cover" />
                                         ) : (
                                           <div className="w-full h-full flex items-center justify-center text-slate-200"><Box className="h-5 w-5" /></div>
                                         )}
                                      </div>
                                      <div>
                                         <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</p>
                                         <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest">{item.reference}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <Badge variant="outline" className="border-slate-100 rounded-lg py-1 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category?.name}</Badge>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <span className="font-black text-slate-700">{item.quantity_total}</span>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <span className="font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl">{item.quantity_available}</span>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <Badge className={cn("px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-sm border-none", status.bg, status.color)}>
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
