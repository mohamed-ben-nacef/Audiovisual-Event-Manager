"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar, 
  FileText,
  DollarSign,
  Camera,
  MoreVertical,
  Play,
  Check,
  History,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { Maintenance } from "@/types"
import { formatDate, formatCurrency, cn } from "@/lib/utils"

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

export default function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Unwrap params using React.use() for Next.js 15+ compatibility
  const { id } = use(params)
  
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  
  // Dialog State
  const [actionDialog, setActionDialog] = useState<{ isOpen: boolean; type: 'START' | 'COMPLETE' | null }>({ isOpen: false, type: null })
  const [statusNote, setStatusNote] = useState("")
  const [statusFiles, setStatusFiles] = useState<File[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  
  // Log State
  const [isAddingLog, setIsAddingLog] = useState(false)
  const [logContent, setLogContent] = useState("")
  const [logFiles, setLogFiles] = useState<File[]>([])

  useEffect(() => {
    if (id) {
      fetchMaintenance(id)
    }
  }, [id])

  const fetchMaintenance = async (maintenanceId: string) => {
    try {
      console.log("Fetching maintenance with ID:", maintenanceId)
      
      const response = await api.getMaintenance(maintenanceId)
      console.log("API Response:", response)
      
      if (response.data && response.data.maintenance) {
          setMaintenance(response.data.maintenance)
          setDescription(response.data.maintenance.problem_description)
      } else {
          console.error("Maintenance data missing", response.data)
      }
    } catch (error) {
      console.error("Error fetching maintenance:", error)
    } finally {
      setLoading(false)
    }
  }

  const openActionDialog = (type: 'START' | 'COMPLETE') => {
      setActionDialog({ isOpen: true, type })
      setStatusNote("")
      setStatusFiles([])
  }

  const handleActionSubmit = async () => {
      if (!maintenance || !actionDialog.type) return
      
      try {
          setActionLoading(true)
          
          if (actionDialog.type === 'START') {
              // Start Maintenance
              await api.updateMaintenance(maintenance.id, { status: 'EN_COURS' })
              
              const note = statusNote.trim() || "L'intervention a été démarrée."
              const formData = new FormData()
              formData.append('content', `[STATUT]: ${note}`)
              formData.append('type', 'STATUS_CHANGE')
              await api.addMaintenanceLog(maintenance.id, formData)
          } else {
              // Complete Maintenance
              const formData = new FormData()
              formData.append('solution_description', statusNote || "Réparation effectuée.")
              statusFiles.forEach(file => formData.append('photos', file))
              await api.completeMaintenance(maintenance.id, formData)
              
              // Also add a log for completion
              const logData = new FormData()
              logData.append('content', `[CLÔTURE]: ${statusNote || "Maintenance terminée."}`)
              logData.append('type', 'STATUS_CHANGE')
              statusFiles.forEach(file => logData.append('photos', file))
              await api.addMaintenanceLog(maintenance.id, logData)
          }
          
          setActionDialog({ isOpen: false, type: null })
          fetchMaintenance(maintenance.id)
      } catch (error) {
          console.error("Error performing action:", error)
          alert("Une erreur est survenue.")
      } finally {
          setActionLoading(false)
      }
  }

  const handleAddLog = async () => {
    if (!maintenance || !logContent.trim()) return
    try {
        setUploading(true)
        const formData = new FormData()
        formData.append('content', logContent)
        logFiles.forEach(f => formData.append('photos', f))
        
        await api.addMaintenanceLog(maintenance.id, formData)
        setIsAddingLog(false)
        setLogContent("")
        setLogFiles([])
        fetchMaintenance(maintenance.id)
    } catch (e) {
        console.error(e)
        alert("Erreur lors de l'ajout du log")
    } finally {
        setUploading(false)
    }
  }

  const handleLogFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setLogFiles(Array.from(e.target.files))
      }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setStatusFiles(Array.from(e.target.files))
      }
  }

  const removeStatusFile = (index: number) => {
      setStatusFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeLogFile = (index: number) => {
      setLogFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleValuesUpdate = async (field: string, value: any) => {
      if(!maintenance) return
      try {
          const formData = new FormData()
          formData.append(field, value)
          await api.updateMaintenance(maintenance.id, formData)
          setIsEditingDesc(false)
          fetchMaintenance(maintenance.id)
      } catch (e) {
          console.error(e)
          alert("Erreur mise à jour")
      }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!maintenance || !e.target.files?.length) return
      
      try {
          setUploading(true)
          const file = e.target.files[0]
          const formData = new FormData()
          
          // Append existing photos to keep them
          if (maintenance.photos && maintenance.photos.length > 0) {
              maintenance.photos.forEach(p => formData.append('photos', p))
          }
          
          formData.append('photos', file)
          
          await api.updateMaintenance(maintenance.id, formData)
          fetchMaintenance(maintenance.id)
      } catch (err) {
          console.error(err)
          alert("Erreur lors de l'upload")
      } finally {
          setUploading(false)
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!maintenance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Maintenance introuvable</h2>
        <Link href="/maintenance">
          <Button>Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  const status = statusConfig[maintenance.status] || statusConfig.EN_ATTENTE
  const priority = priorityConfig[maintenance.priority] || priorityConfig.MOYENNE
  const StatusIcon = status.icon

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex items-center justify-between py-6">
        <Link 
            href="/maintenance" 
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors group font-bold text-sm"
        >
            <div className="bg-slate-100 p-2 rounded-full mr-3 group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            </div>
            Retour à l'atelier
        </Link>
        
        <div className="flex items-center gap-3">
            {maintenance.status === 'EN_ATTENTE' && (
                          <Button 
                            onClick={() => openActionDialog('START')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-none h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest flex-1"
                          >
                            <Play className="h-3 w-3 mr-2 fill-current" />
                            Démarrer
                          </Button>
                        )}
                        
                        {maintenance.status === 'EN_COURS' && (
                          <Button 
                            onClick={() => openActionDialog('COMPLETE')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-none h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest flex-1"
                          >
                            <Check className="h-3 w-3 mr-2" />
                            Terminer
                          </Button>
                        )}   
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200">
                <MoreVertical className="h-5 w-5 text-slate-500" />
            </Button>
        </div>
      </div>

       {/* Title & Status Block */}
       <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
             <div className="flex flex-wrap items-center gap-4">
                <Badge className={cn("px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-none", status.bg, status.color)}>
                    <StatusIcon className="h-3.5 w-3.5 mr-2" />
                    {status.label}
                </Badge>
                <Badge variant="outline" className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2", priority.bg)}>
                    Priorité {priority.label}
                </Badge>
                <span className="text-slate-400 font-mono text-xs font-bold uppercase tracking-widest ml-auto">
                    ID: {maintenance.id.split('-')[0]}
                </span>
             </div>
             
             <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {maintenance.equipment?.name || "Équipement Inconnu"}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono font-bold text-slate-600">
                        {maintenance.equipment?.reference}
                    </span>
                    <span>•</span>
                    <span>Dossier ouvert le {formatDate(maintenance.created_at)}</span>
                </div>
             </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-slate-50 rounded-full blur-3xl -z-0"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
             {/* Problem Description */}
             <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                 <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Le Problème</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(!isEditingDesc)}>
                            {isEditingDesc ? "Annuler" : "Modifier"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    {isEditingDesc ? (
                        <div className="space-y-4">
                            <Textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[150px]"
                            />
                            <Button onClick={() => handleValuesUpdate('problem_description', description)}>
                                Enregistrer
                            </Button>
                        </div>
                    ) : (
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {maintenance.problem_description}
                        </p>
                    )}
                </CardContent>
             </Card>

             {/* Solution (if exists) */}
             {maintenance.solution_description && (
                 <Card className="border-none shadow-lg bg-emerald-50/50 border-2 border-emerald-100 overflow-hidden rounded-[2rem]">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">La Solution</h3>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-emerald-800 leading-relaxed text-lg">
                            {maintenance.solution_description}
                        </p>
                    </CardContent>
                 </Card>
             )}

              {/* Journal d'Intervention (Timeline) */}
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <History className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Journal d'Intervention</h3>
                    </div>
                    <Button 
                        variant={isAddingLog ? "ghost" : "outline"}
                        size="sm" 
                        onClick={() => setIsAddingLog(!isAddingLog)}
                        className="rounded-xl font-bold"
                    >
                        {isAddingLog ? "Annuler" : "Ajouter un point"}
                    </Button>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    {isAddingLog && (
                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Votre message</label>
                                <Textarea 
                                    value={logContent}
                                    onChange={(e) => setLogContent(e.target.value)}
                                    placeholder="Décrivez l'avancement ou les pièces changées..."
                                    className="bg-white border-slate-200 min-h-[100px]"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        id="log-photos" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleLogFilesSelect}
                                    />
                                    <label htmlFor="log-photos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 cursor-pointer">
                                        <Camera className="h-4 w-4" />
                                        <span>Ajouter des photos</span>
                                    </label>
                                </div>
                                <Button onClick={handleAddLog} disabled={!logContent.trim() || uploading} className="bg-indigo-600 hover:bg-indigo-700">
                                    {uploading ? "Envoi..." : "Publier la mise à jour"}
                                </Button>
                            </div>
                            
                            {logFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 pt-2">
                                    {logFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square group">
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                className="w-full h-full object-cover rounded-xl border border-slate-200"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeLogFile(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-8">
                        {maintenance.logs && maintenance.logs.length > 0 ? (
                            maintenance.logs.map((log, i) => (
                                <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2 last:pb-0">
                                    <div className={cn(
                                        "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                                        log.type === 'STATUS_CHANGE' ? "bg-orange-400" : "bg-indigo-400"
                                    )}></div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.user?.full_name}</span>
                                            {log.type === 'STATUS_CHANGE' && (
                                                <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-orange-200 text-orange-600 bg-orange-50 font-black">STATUT</Badge>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(log.created_at)}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-md whitespace-pre-wrap">{log.content}</p>
                                    
                                    {log.photos && log.photos.length > 0 && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                            {log.photos.map((p, idx) => (
                                                <a key={idx} href={p} target="_blank" rel="noopener noreferrer" className="block relative group">
                                                    <img src={p} className="rounded-xl w-full h-24 object-cover bg-slate-50 transition-transform group-hover:scale-105 shadow-sm" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <History className="h-12 w-12 text-slate-100 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Aucun historique enregistré pour ce dossier.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>

              {/* Photos Gallery Placeholer */}
             <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                 <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                <Camera className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Photos & Pièces Jointes</h3>
                        </div>
                        <div className="relative">
                            <input 
                                type="file" 
                                id="photo-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                disabled={uploading}
                            />
                            <label htmlFor="photo-upload">
                                <Button variant="outline" size="sm" type="button" className="cursor-pointer pointer-events-none">
                                    <span>{uploading ? "..." : "Ajouter"}</span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-3 gap-4">
                        {maintenance.photos && maintenance.photos.length > 0 ? (
                            maintenance.photos.map((photo, i) => (
                                <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block relative group">
                                    <img src={photo} className="rounded-xl w-full h-32 object-cover bg-slate-100 transition-transform group-hover:scale-105" />
                                </a>
                            ))
                        ) : (
                            <div className="col-span-3 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Camera className="h-8 w-8" />
                                <span className="font-medium text-sm">Aucune photo jointe</span>
                            </div>
                        )}
                    </div>
                </CardContent>
             </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {/* Technician Card */}
             <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                <CardHeader className="p-6 pb-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Technicien Affecté</h3>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{maintenance.technician?.full_name}</p>
                            <p className="text-xs font-medium text-slate-500">{maintenance.technician?.email}</p>
                        </div>
                    </div>
                </CardContent>
             </Card>

             {/* Timeline Card */}
             <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                <CardHeader className="p-6 pb-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Calendrier</h3>
                </CardHeader>
                <CardContent className="p-6 pt-4 space-y-6">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-slate-400 block">Date de début</span>
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDate(maintenance.start_date)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-slate-400 block">Estimation de fin</span>
                        <div className="flex items-center gap-2 text-orange-600 font-bold">
                            <AlertTriangle className="h-4 w-4" />
                            {maintenance.expected_end_date ? formatDate(maintenance.expected_end_date) : "Non définie"}
                        </div>
                    </div>

                    {maintenance.actual_end_date && (
                        <div className="space-y-1 pt-4 border-t border-slate-50">
                            <span className="text-xs font-medium text-emerald-600 block">Terminé le</span>
                            <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                <CheckCircle2 className="h-4 w-4" />
                                {formatDate(maintenance.actual_end_date)}
                            </div>
                        </div>
                    )}
                </CardContent>
             </Card>
             
             {/* Cost Card (only if completed or cost added) */}
             {(maintenance.cost || maintenance.status === 'TERMINE') && (
                <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[2rem]">
                    <CardHeader className="p-6 pb-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Coût Intervention</h3>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                        <div className="flex items-center gap-2 text-2xl font-black text-slate-900">
                            <DollarSign className="h-6 w-6 text-slate-300" />
                            {formatCurrency(maintenance.cost || 0)}
                        </div>
                    </CardContent>
                </Card>
             )}
          </div>
       </div>

        {/* Action Dialog */}
        <Dialog open={actionDialog.isOpen} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, isOpen: false })}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{actionDialog.type === 'START' ? "Démarrer l'intervention" : "Terminer la maintenance"}</DialogTitle>
                    <DialogDescription>
                        {actionDialog.type === 'START' 
                            ? "Vous êtes sur le point de commencer les travaux. Ajoutez une note optionnelle." 
                            : "Veuillez décrire la solution apportée et ajouter des photos finales si nécessaire."}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {actionDialog.type === 'START' ? "Note de démarrage (Optionnel)" : "Description de la solution"}
                        </label>
                        <Textarea 
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder={actionDialog.type === 'START' ? "Observations initiales..." : "Détails de la réparation..."}
                            className="min-h-[100px]"
                        />
                    </div>

                    {actionDialog.type === 'COMPLETE' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 block">Preuves / Photos (Optionnel)</label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                </div>
                            </div>
                            
                            {statusFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {statusFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square group">
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
                    <Button variant="outline" onClick={() => setActionDialog({ ...actionDialog, isOpen: false })}>
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
