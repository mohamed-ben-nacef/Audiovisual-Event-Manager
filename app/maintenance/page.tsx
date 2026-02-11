"use client"

import { useEffect, useState } from "react"
import { 
  Plus, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search,
  ArrowUpRight,
  ShieldAlert,
  Info,
  PenTool,
  History,
  Check,
  Play,
  X
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Maintenance } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const statusConfig: Record<string, { bg: string; color: string; label: string; icon: any }> = {
  EN_ATTENTE: { bg: "bg-slate-50", color: "text-slate-500", label: "En Attente", icon: Clock },
  EN_COURS: { bg: "bg-amber-50", color: "text-amber-600", label: "Sur le Banc", icon: Wrench },
  TERMINE: { bg: "bg-emerald-50", color: "text-emerald-600", label: "Réparé", icon: CheckCircle2 },
}

const priorityConfig: Record<string, { bg: string; color: string; label: string }> = {
  BASSE: { bg: "bg-blue-50 text-blue-600", color: "text-blue-700", label: "Basse" },
  MOYENNE: { bg: "bg-orange-50 text-orange-600", color: "text-orange-700", label: "Moyenne" },
  HAUTE: { bg: "bg-red-50 text-red-600", color: "text-red-700", label: "Critique" },
}

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog State
  const [actionDialog, setActionDialog] = useState<{ isOpen: boolean; type: 'START' | 'COMPLETE' | null; maintenanceId: string | null }>({ isOpen: false, type: null, maintenanceId: null })
  const [statusNote, setStatusNote] = useState("")
  const [statusFiles, setStatusFiles] = useState<File[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setStatusFiles(Array.from(e.target.files))
      }
  }

  const removeStatusFile = (index: number) => {
      setStatusFiles(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    fetchMaintenances()
  }, [])

  const fetchMaintenances = async () => {
    try {
      setLoading(true)
      const response = await api.getMaintenances()
      setMaintenances(response.data?.maintenances || [])
    } catch (error) {
      console.error("Error fetching maintenances:", error)
    } finally {
      setLoading(false)
    }
  }

  const openActionDialog = (id: string, type: 'START' | 'COMPLETE') => {
      setActionDialog({ isOpen: true, type, maintenanceId: id })
      setStatusNote("")
      setStatusFiles([])
  }

  const handleActionSubmit = async () => {
      if (!actionDialog.maintenanceId || !actionDialog.type) return
      
      try {
          setActionLoading(true)
          const m = maintenances.find(item => item.id === actionDialog.maintenanceId)
          if (!m) return

          if (actionDialog.type === 'START') {
              await api.updateMaintenance(actionDialog.maintenanceId, { status: 'EN_COURS' })
              
              const note = statusNote.trim() || "L'intervention a été démarrée."
              const logData = new FormData()
              logData.append('content', `[STATUT]: ${note}`)
              logData.append('type', 'STATUS_CHANGE')
              await api.addMaintenanceLog(actionDialog.maintenanceId, logData)
          } else {
              const formData = new FormData()
              formData.append('solution_description', statusNote || "Réparation effectuée.")
              statusFiles.forEach(file => formData.append('photos', file))
              await api.completeMaintenance(actionDialog.maintenanceId, formData)

              const logData = new FormData()
              logData.append('content', `[CLÔTURE]: ${statusNote || "Maintenance terminée."}`)
              logData.append('type', 'STATUS_CHANGE')
              statusFiles.forEach(file => logData.append('photos', file))
              await api.addMaintenanceLog(actionDialog.maintenanceId, logData)
          }
          
          setActionDialog({ isOpen: false, type: null, maintenanceId: null })
          fetchMaintenances()
      } catch (error) {
          console.error("Error performing action:", error)
          alert("Une erreur est survenue.")
      } finally {
          setActionLoading(false)
      }
  }

  const filteredMaintenances = maintenances.filter(m => 
    m.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.problem_description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = maintenances.filter(m => m.status !== 'TERMINE').length

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <PenTool className="h-3 w-3" />
              Service Après-Vente & Qualité
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Atelier Technique</h1>
           <p className="text-slate-500 font-medium max-w-lg">Supervisez les réparations et assurez l'intégrité de vos actifs audiovisuels.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Link href="/maintenance/new">
             <Button className="h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100 transition-all font-bold active:scale-95">
                <Plus className="h-5 w-5 mr-3" />
                Ouvrir un Dossier
             </Button>
           </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
        <div className="relative group flex-1 w-full">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
           <Input
             placeholder="Rechercher par équipement, problème ou technicien..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="h-14 border-none bg-transparent pl-12 shadow-none focus:ring-0 text-md font-medium placeholder:text-slate-300"
           />
        </div>
        <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-2"></div>
        <div className="flex items-center gap-1 p-1">
           <Button variant="ghost" className="h-12 px-6 rounded-xl text-orange-600 font-bold bg-orange-50">
              En cours
           </Button>
           <Button variant="ghost" className="h-12 px-6 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
              Historique
           </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse"></div>)}
        </div>
      ) : filteredMaintenances.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200 p-24 text-center">
           <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto text-slate-300 mb-6">
              <Wrench className="h-8 w-8" />
           </div>
           <h3 className="text-xl font-bold text-slate-800">Aucune maintenance</h3>
           <p className="text-slate-400 font-medium">Tout votre parc matériel est actuellement opérationnel.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMaintenances.map((m) => {
            const status = statusConfig[m.status] || statusConfig.EN_ATTENTE
            const priority = priorityConfig[m.priority] || priorityConfig.MOYENNE
            const StatusIcon = status.icon
            
            return (
              <Card key={m.id} className="group relative border border-slate-100 shadow-sm hover:shadow-2xl hover:border-orange-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer">
                 <div className={cn("h-1.5 w-full", m.priority === 'HAUTE' ? "bg-red-500" : (m.priority === 'MOYENNE' ? "bg-orange-500" : "bg-blue-500"))}></div>
                    <Link href={`/maintenance/${m.id}`} className="flex-1 flex flex-col">
                    <CardContent className="p-8 pb-0 space-y-6 flex-1 flex flex-col">
                       <div className="flex items-start justify-between">
                          <Badge className={cn("px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-none shadow-sm", status.bg, status.color)}>
                             <StatusIcon className="h-3 w-3 mr-1.5" />
                             {status.label}
                          </Badge>
                          <Badge variant="outline" className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-none", priority.bg)}>
                             {priority.label}
                          </Badge>
                       </div>

                       <div className="space-y-2 flex-1">
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight truncate leading-tight">
                            {m.equipment?.name || "Matériel Inconnu"}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed italic pr-4">
                            "{m.problem_description}"
                          </p>
                       </div>

                       <div className="pt-6 border-t border-slate-50 flex items-center justify-between pb-6">
                          <div className="space-y-1">
                             <span className="text-[9px] uppercase font-bold text-slate-300 tracking-widest block">Entrée</span>
                             <div className="flex items-center gap-1.5 text-slate-600 font-black text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(m.start_date)}
                             </div>
                          </div>
                          {m.expected_end_date && (
                             <div className="space-y-1 text-right">
                                <span className="text-[9px] uppercase font-bold text-slate-300 tracking-widest block">Estimation</span>
                                <div className="flex items-center gap-1.5 text-orange-600 font-black text-xs justify-end">
                                   <AlertTriangle className="h-3.5 w-3.5" />
                                   {formatDate(m.expected_end_date)}
                                </div>
                             </div>
                          )}
                       </div>
                    </CardContent>
                  </Link>

                  <div className="px-8 pb-8 flex flex-col gap-2">
                      {m.status === 'EN_ATTENTE' && (
                        <Button 
                          onClick={() => openActionDialog(m.id, 'START')}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-none h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest w-full shadow-lg shadow-blue-100"
                        >
                          <Play className="h-3 w-3 mr-2 fill-current" />
                          Démarrer
                        </Button>
                      )}
                      
                      {m.status === 'EN_COURS' && (
                        <Button 
                          onClick={() => openActionDialog(m.id, 'COMPLETE')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest w-full shadow-lg shadow-emerald-100"
                        >
                          <Check className="h-3 w-3 mr-2" />
                          Terminer
                        </Button>
                      )}

                      {m.status === 'TERMINE' && (
                        <Link href={`/maintenance/${m.id}`} className="w-full">
                          <Button 
                            variant="outline"
                            className="border-slate-100 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest w-full text-slate-400 group-hover:border-orange-200 group-hover:text-orange-600"
                          >
                            Voir Détails
                          </Button>
                        </Link>
                      )}
                  </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modern Advisory Section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative group shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="h-20 w-20 rounded-[2rem] bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-3xl shadow-orange-500/20">
               <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="space-y-2 flex-1">
               <h3 className="text-3xl font-black tracking-tight uppercase italic text-orange-400">Centre de Service Qualité</h3>
               <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
                  Maximisez la durée de vie de votre parc. Un contrôle systématique réduit les défaillances critiques en prestation de 85%.
               </p>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
               <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-orange-50 font-black transition-all shadow-xl">
                  Consulter les Protocoles
               </Button>
               <Button variant="ghost" className="text-slate-400 hover:text-white font-bold text-sm">
                  Voir l'historique SAV
               </Button>
            </div>
         </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, isOpen: false, maintenanceId: null })}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{actionDialog.type === 'START' ? "Démarrer l'intervention" : "Terminer la maintenance"}</DialogTitle>
                  <DialogDescription>
                      {actionDialog.type === 'START' 
                          ? "Ajoutez une note optionnelle pour commencer." 
                          : "Décrivez la solution et ajoutez des photos si nécessaire."}
                  </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                          {actionDialog.type === 'START' ? "Note de démarrage" : "Description de la solution"}
                      </label>
                      <Textarea 
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="..."
                          className="min-h-[100px]"
                      />
                  </div>

                  {actionDialog.type === 'COMPLETE' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 block">Preuves / Photos (Optionnel)</label>
                              <Input 
                                  type="file" 
                                  multiple 
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="..."
                              />
                          </div>
                          
                          {statusFiles.length > 0 && (
                              <div className="grid grid-cols-4 gap-2">
                                  {statusFiles.map((file, idx) => (
                                      <div key={idx} className="relative aspect-square">
                                          <img 
                                              src={URL.createObjectURL(file)} 
                                              className="w-full h-full object-cover rounded-lg border border-slate-200"
                                          />
                                          <button 
                                              type="button"
                                              onClick={() => removeStatusFile(idx)}
                                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                                          >
                                              <X className="h-2.5 w-2.5" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>

              <DialogFooter>
                  <Button variant="outline" onClick={() => setActionDialog({ ...actionDialog, isOpen: false, maintenanceId: null })}>
                      Annuler
                  </Button>
                  <Button onClick={handleActionSubmit} disabled={actionLoading} className={actionDialog.type === 'START' ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}>
                      {actionLoading ? "Traitement..." : "Confirmer"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
