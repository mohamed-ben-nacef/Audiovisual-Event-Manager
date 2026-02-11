"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  ArrowLeft, 
  Save, 
  Wrench, 
  AlertTriangle, 
  Info, 
  Calendar as CalendarIcon,
  User,
  Package,
  Clock,
  CheckCircle2,
  PenTool,
  Camera,
  X,
  Plus,
  Upload
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/lib/api"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

const maintenanceSchema = z.object({
  equipment_id: z.string().min(1, "L'équipement est requis"),
  technician_id: z.string().min(1, "Le technicien est requis"),
  problem_description: z.string().min(10, "La description du problème doit être détaillée (min 10 car.)"),
  priority: z.enum(["BASSE", "MOYENNE", "HAUTE"]),
  start_date: z.date(),
  expected_end_date: z.date().optional(),

  photos: z.any().optional(),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export default function NewMaintenancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      priority: "MOYENNE",
      start_date: new Date(),
    },
  })

  const priorityColors = {
    BASSE: "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800",
    MOYENNE: "bg-gradient-to-r from-orange-600 via-orange-700 to-red-800",
    HAUTE: "bg-gradient-to-r from-red-600 via-red-700 to-pink-800"
  }

  const priorityButtonColors = {
     BASSE: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
     MOYENNE: "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
     HAUTE: "bg-red-600 hover:bg-red-700 shadow-red-100"
  }

  const priorityLineColors = {
    BASSE: "bg-blue-500",
    MOYENNE: "bg-orange-500",
    HAUTE: "bg-red-500"
  }

  const priorityIconBgColors = {
    BASSE: "bg-blue-50",
    MOYENNE: "bg-orange-50",
    HAUTE: "bg-red-50"
  }

  const priorityIconColors = {
    BASSE: "text-blue-600",
    MOYENNE: "text-orange-600",
    HAUTE: "text-red-600"
  }

  const currentPriority = watch("priority")

  // New state for hierarchical selection
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch categories first as they are critical for the UI structure
      try {
        const categoriesRes = await api.getCategories(true)
        setCategories(categoriesRes.data?.categories || [])
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }

      // Fetch equipment
      try {
        const equipRes = await api.getEquipment({ limit: 1000 })
        setEquipmentList(equipRes.data?.equipment || [])
        setFilteredEquipment([]) 
      } catch (err) {
        console.error("Failed to fetch equipment:", err)
      }

      // Fetch technicians
      try {
        const usersRes = await api.getUsers({})
        const allUsers = usersRes.data?.users || []
        // Filter for technicians but fallback to all users if none found with explicit role
        const techUsers = allUsers.filter((u: any) => u.role === 'TECHNICIEN' || u.role === 'MAINTENANCE')
        setTechnicians(techUsers.length > 0 ? techUsers : allUsers)
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
      
    } catch (error) {
      console.error("Critical error loading data:", error)
    }
  }

  // ... (fetchData implementation)

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...filesArray])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle Category Change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryId("")
    setValue("equipment_id", "") // Reset selected equipment
    
    // Update subcategories
    const category = categories.find(c => c.id === categoryId)
    setSubcategories(category?.subcategories || [])
    
    // Filter equipment by category only (if no subcategory selected yet)
    if (categoryId) {
       const filtered = equipmentList.filter(e => e.category_id === categoryId)
       setFilteredEquipment(filtered)
    } else {
       setFilteredEquipment([])
    }
  }

  // Handle Subcategory Change
  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId)
    setValue("equipment_id", "")
    
    if (subcategoryId) {
      const filtered = equipmentList.filter(e => e.subcategory_id === subcategoryId)
      setFilteredEquipment(filtered)
    } else if (selectedCategoryId) {
      // Fallback to category filter
      const filtered = equipmentList.filter(e => e.category_id === selectedCategoryId)
      setFilteredEquipment(filtered)
    }
  }

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('equipment_id', data.equipment_id)
      formData.append('technician_id', data.technician_id)
      formData.append('problem_description', data.problem_description)
      formData.append('priority', data.priority)
      formData.append('start_date', data.start_date.toISOString().split('T')[0])
      
      if (data.expected_end_date) {
        formData.append('expected_end_date', data.expected_end_date.toISOString().split('T')[0])
      }
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append('photos', file)
      })

      console.log("Submitting maintenance form data")

      await api.createMaintenance(formData)
      router.push("/maintenance")
    } catch (error: any) {
      console.error("Error creating maintenance:", error)
      if (error.response) {
        console.error("Server Error Response:", error.response.data)
        alert(`Erreur: ${error.response.data.message || "Impossible de créer le dossier"}`)
      } else {
        alert("Une erreur est survenue lors de la création du dossier.")
      }
    } finally {
      setLoading(false)
    }
  }

  const watchedEquipmentId = watch("equipment_id")
  
  useEffect(() => {
    if (watchedEquipmentId) {
      const eq = equipmentList.find(e => e.id === watchedEquipmentId)
      setSelectedEquipment(eq)
    }
  }, [watchedEquipmentId, equipmentList])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header with Gradient Background */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-2xl transition-all duration-500",
        priorityColors[currentPriority] || priorityColors.MOYENNE
      )}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/maintenance" 
              className="inline-flex items-center text-orange-100 hover:text-white transition-colors group"
            >
              <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">Retour à l'atelier</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ouvrir un Dossier</h1>
              <p className="text-orange-100/80 text-lg max-w-xl font-light">
                Signalez une panne ou planifiez une maintenance préventive.
              </p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
               <Wrench className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="md:col-span-2 space-y-8">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
               <div className={cn("h-2 transition-colors duration-500", priorityLineColors[currentPriority] || priorityLineColors.MOYENNE)}></div>
               <CardHeader className="p-8">
                 <div className="flex items-center gap-4 mb-2">
                   <div className={cn(
                     "p-3 rounded-2xl transition-colors duration-500",
                     priorityIconBgColors[currentPriority] || priorityIconBgColors.MOYENNE,
                     priorityIconColors[currentPriority] || priorityIconColors.MOYENNE
                   )}>
                     <AlertTriangle className="h-6 w-6" />
                   </div>
                   <div>
                     <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Diagnostic & Panne</CardTitle>
                     <CardDescription className="text-slate-500 font-medium">Détails de l'incident et équipement concerné</CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                
                {/* Hierarchical Selection */}
                
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Catégorie</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Sous-Catégorie</label>
                  <select
                    value={selectedSubcategoryId}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    disabled={!selectedCategoryId}
                    className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none disabled:opacity-50"
                  >
                    <option value="">Sélectionner une sous-catégorie...</option>
                    {subcategories.map((sub) => {
                      // Calculate equipment count for this subcategory
                      const count = equipmentList.filter(e => e.subcategory_id === sub.id).length
                      return (
                        <option 
                          key={sub.id} 
                          value={sub.id} 
                          className={count === 0 ? "text-red-500 font-bold" : "text-slate-900"}
                          style={count === 0 ? { color: 'red' } : {}}
                        >
                          {sub.name} {count === 0 ? "(Aucun équipement)" : `(${count})`}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Equipment Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Équipement Concerné</label>
                  <select
                    {...register("equipment_id")}
                    disabled={!selectedCategoryId}
                    className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none disabled:opacity-50"
                  >
                    <option value="">Sélectionner un équipement...</option>
                    {filteredEquipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.reference}) - Stock: {item.quantity_available}/{item.quantity_total}
                      </option>
                    ))}
                  </select>
                  {errors.equipment_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.equipment_id.message}</p>}
                </div>

                {selectedEquipment && (
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-blue-900 font-bold text-sm">{selectedEquipment.name}</p>
                       <p className="text-blue-700/80 text-xs mt-1">
                         Réf: {selectedEquipment.reference} • Marque: {selectedEquipment.brand}
                       </p>
                    </div>
                  </div>
                )}

                {/* Problem Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Description du Problème</label>
                  <Textarea 
                    {...register("problem_description")}
                    placeholder="Décrivez en détail la panne, les symptômes observés, ou la raison de la maintenance..."
                    className="min-h-[150px] bg-slate-50 border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  />
                  {errors.problem_description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.problem_description.message}</p>}
                 </div>

                 {/* Photos Section */}
                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Photos & Pièces Jointes</label>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Images (.jpg, .png)</span>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       <input 
                          type="file"
                          id="file-upload"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                       />
                       <label 
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group"
                       >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="p-3 bg-slate-100 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                              </div>
                              <p className="mb-1 text-sm text-slate-500 font-bold"><span className="text-blue-600">Cliquez pour ajouter</span> ou glissez-déposez</p>
                              <p className="text-xs text-slate-400">PNG, JPG jusqu'à 5MB</p>
                          </div>
                       </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {selectedFiles.map((file, index) => (
                           <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                              <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>

               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden">
               <div className="h-2 bg-slate-700"></div>
               <CardHeader className="p-8">
                 <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                     <PenTool className="h-6 w-6" />
                   </div>
                   <div>
                     <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Affectation & Planning</CardTitle>
                     <CardDescription className="text-slate-500 font-medium">Technicien responsable et délais</CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                 
                 {/* Technician */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Technicien Responsable</label>
                    <select
                      {...register("technician_id")}
                      className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none"
                    >
                      <option value="">Attribuer à...</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.full_name}
                        </option>
                      ))}
                    </select>
                    {errors.technician_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.technician_id.message}</p>}
                 </div>

                 {/* Dates Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Date de Début</label>
                       <DatePicker
                          selected={watch("start_date")}
                          onChange={(date: Date | null) => date && setValue("start_date", date)}
                          dateFormat="dd/MM/yyyy"
                          className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-slate-500 outline-none cursor-pointer"
                          placeholderText="Sélectionner une date"
                       />
                       {errors.start_date && <p className="text-red-500 text-xs mt-1 font-bold">{errors.start_date.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Estimation Fin</label>
                       <DatePicker
                          selected={watch("expected_end_date")}
                          onChange={(date: Date | null) => date ? setValue("expected_end_date", date) : setValue("expected_end_date", undefined)}
                          dateFormat="dd/MM/yyyy"
                          className="w-full h-14 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-slate-500 outline-none cursor-pointer"
                          placeholderText="Optionnel"
                          minDate={watch("start_date")}
                       />
                    </div>
                 </div>

               </CardContent>
            </Card>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl bg-white overflow-hidden sticky top-8">
              <CardHeader className="p-6 border-b border-slate-50">
                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Priorité</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-4">
                    <label className={cn(
                        "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                        watch("priority") === "BASSE" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-blue-200"
                    )}>
                       <input type="radio" value="BASSE" {...register("priority")} className="sr-only" />
                       <div className="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                       <span className="font-bold text-sm text-slate-700">Normale</span>
                    </label>

                    <label className={cn(
                        "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                        watch("priority") === "MOYENNE" ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-orange-200"
                    )}>
                       <input type="radio" value="MOYENNE" {...register("priority")} className="sr-only" />
                       <div className="h-3 w-3 rounded-full bg-orange-500 mr-3"></div>
                       <span className="font-bold text-sm text-slate-700">Moyenne</span>
                    </label>

                    <label className={cn(
                        "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                        watch("priority") === "HAUTE" ? "border-red-500 bg-red-50" : "border-slate-100 hover:border-red-200"
                    )}>
                       <input type="radio" value="HAUTE" {...register("priority")} className="sr-only" />
                       <div className="h-3 w-3 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                       <span className="font-bold text-sm text-slate-700">Urgence Critique</span>
                    </label>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full h-14 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95",
                        priorityButtonColors[currentPriority] || priorityButtonColors.MOYENNE
                      )}
                      disabled={loading}
                    >
                       {loading ? (
                         <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                       ) : (
                         <span className="flex items-center gap-2">
                           <Save className="h-5 w-5" />
                           Créer le Dossier
                         </span>
                       )}
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  )
}
