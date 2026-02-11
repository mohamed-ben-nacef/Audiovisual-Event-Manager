"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Info, 
  Package, 
  Users, 
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Layers,
  Clock
} from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

const eventSchema = z.object({
  event_name: z.string().min(1, "Le nom de l'événement est requis"),
  client_name: z.string().min(1, "Le nom du client est requis"),
  contact_person: z.string().min(1, "La personne à contacter est requise"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().min(1, "L'adresse est requise"),
  installation_date: z.string().min(1, "La date d'installation est requise"),
  event_date: z.string().min(1, "La date de l'événement est requise"),
  dismantling_date: z.string().min(1, "La date de démontage est requise"),
  status: z.enum(["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"]),
  notes: z.string().optional(),
  budget: z.number().optional(),
  participant_count: z.number().optional(),
  event_type: z.string().optional(),
  products: z.array(z.object({
    id: z.string().optional(), // Existing reservation ID
    category_id: z.string().optional(),
    subcategory_id: z.string().optional(),
    equipment_id: z.string().min(1, "Produit requis"),
    quantity: z.number().min(1, "Quantité invalide"),
  })).optional(),
  staff: z.array(z.object({
    id: z.string().optional(), // Existing assignment ID
    technician_id: z.string().min(1, "Technicien requis"),
    role: z.string().optional(),
  })).optional(),
})

type EventFormData = z.infer<typeof eventSchema>

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PLANIFIE: { label: "Planifié", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  EN_COURS: { label: "En cours", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  TERMINE: { label: "Terminé", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  ANNULE: { label: "Annulé", color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
}

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: "products",
  })

  const { fields: staffFields, append: appendStaff, remove: removeStaff } = useFieldArray({
    control,
    name: "staff",
  })

  const [categories, setCategories] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [equipmentByCategory, setEquipmentByCategory] = useState<Record<string, any[]>>({})
  const [originalProducts, setOriginalProducts] = useState<any[]>([])
  const [originalStaff, setOriginalStaff] = useState<any[]>([])

  const installationDate = watch("installation_date")
  const eventDate = watch("event_date")
  const dismantlingDate = watch("dismantling_date")
  const currentStatus = watch("status")
  const watchedProducts = watch("products")

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setFetching(true)
      const response = await api.getEvent(eventId)
      const event = response.data?.event
      if (event) {
        setValue("event_name", event.event_name)
        setValue("client_name", event.client_name)
        setValue("contact_person", event.contact_person)
        setValue("phone", event.phone)
        setValue("email", event.email || "")
        setValue("address", event.address)
        setValue("installation_date", event.installation_date)
        setValue("event_date", event.event_date)
        setValue("dismantling_date", event.dismantling_date)
        setValue("status", event.status)
        setValue("notes", event.notes || "")
        setValue("budget", event.budget)
        setValue("participant_count", event.participant_count)
        setValue("event_type", event.event_type || "")

        // Set products
        if (event.equipment_reservations) {
          const mappedProducts = event.equipment_reservations.map((res: any) => ({
            id: res.id,
            category_id: res.equipment?.category_id,
            subcategory_id: res.equipment?.subcategory_id,
            equipment_id: res.equipment_id,
            quantity: res.quantity_reserved,
          }))
          setValue("products", mappedProducts)
          setOriginalProducts(mappedProducts)
          
          // Fetch equipment for each category used
          const categoryIds = Array.from(new Set(mappedProducts.map((p: any) => p.category_id).filter(Boolean))) as string[]
          categoryIds.forEach(id => fetchEquipment(id))
        }

        // Set staff
        if (event.technician_assignments) {
          const mappedStaff = event.technician_assignments.map((ass: any) => ({
            id: ass.id,
            technician_id: ass.technician_id,
            role: ass.role || "",
          }))
          setValue("staff", mappedStaff)
          setOriginalStaff(mappedStaff)
        }
      }
      
      // Fetch categories and technicians
      const [catsRes, techsRes] = await Promise.all([
        api.getCategories(true),
        api.getUsers({ role: "TECHNICIEN" }),
      ])
      setCategories(catsRes.data?.categories || [])
      setTechnicians(techsRes.data?.users || [])
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'événement")
    } finally {
      setFetching(false)
    }
  }

  const fetchEquipment = async (categoryId: string) => {
    if (equipmentByCategory[categoryId]) return
    try {
      const response = await api.getEquipment({ category_id: categoryId, limit: 100 })
      setEquipmentByCategory(prev => ({
        ...prev,
        [categoryId]: response.data?.equipment || []
      }))
    } catch (err) {
      console.error("Error fetching equipment:", err)
    }
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true)
      setError("")
      
      const { products, staff, ...eventData } = data
      
      // 1. Update Event
      const response = await api.updateEvent(eventId, { ...eventData, category: "MIXTE" })
      
      if (response.success) {
        // 2. Sync Equipment
        if (products) {
          // Add new ones
          const newProducts = products.filter(p => !p.id && p.equipment_id)
          const addPromises = newProducts.map(p => api.addEventEquipment(eventId, {
            equipment_id: p.equipment_id,
            quantity_reserved: p.quantity
          }))
          
          // Update existing ones (if quantity changed)
          const updatePromises = products
            .filter(p => p.id)
            .map(p => {
              const original = originalProducts.find(op => op.id === p.id)
              if (original && original.quantity !== p.quantity && p.id) {
                return api.updateEquipmentReservation(eventId, p.id, {
                  quantity_reserved: p.quantity
                })
              }
              return null
            })
            .filter(Boolean)

          // Delete removed ones
          const deletedProducts = originalProducts.filter(op => !products.find(p => p.id === op.id))
          const deletePromises = deletedProducts.map(p => api.removeEventEquipment(eventId, p.id))

          await Promise.all([...addPromises, ...updatePromises, ...deletePromises])
        }
        
        // 3. Sync Staff
        if (staff) {
          // Add new ones
          const newStaff = staff.filter(s => !s.id && s.technician_id)
          const addPromises = newStaff.map(s => api.assignTechnician(eventId, {
            technician_id: s.technician_id,
            role: s.role
          }))
          
          // Delete removed ones
          const deletedStaff = originalStaff.filter(os => !staff.find(s => s.id === os.id))
          const deletePromises = deletedStaff.map(s => api.removeTechnician(eventId, s.id))

          await Promise.all([...addPromises, ...deletePromises])
        }

        router.push(`/events/${eventId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'événement")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Récupération des données...</p>
        </div>
      </div>
    )
  }

  const status = statusConfig[currentStatus] || statusConfig.PLANIFIE

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-4">
          <Link 
            href={`/events/${eventId}`} 
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors group mb-2"
          >
            <div className="bg-slate-800 p-2 rounded-full mr-3 group-hover:bg-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium text-sm">Retour aux détails</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className={cn("px-3 py-1 rounded-full font-bold border-none", status.bg, status.color)}>
                  <Clock className="h-3 w-3 mr-1.5" />
                  {status.label}
                </Badge>
                <span className="text-slate-500 font-mono text-xs">#{eventId.slice(0, 8)}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Modifier le Projet</h1>
              <p className="text-slate-400 text-lg font-light max-w-xl">
                Mettez à jour les paramètres, le matériel réservé ou l'équipe technique assignée.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section - Statut & Infos de Base */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <CardHeader className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Identité du Projet</CardTitle>
                <CardDescription>Informations essentielles et état d'avancement.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {error && (
              <div className="col-span-full bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3">
                <span className="text-red-700 font-bold">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Nom de l'événement</label>
                <div className="relative">
                  <Input 
                    {...register("event_name")} 
                    className={cn(
                      "pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500",
                      errors.event_name && "border-red-500"
                    )} 
                  />
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Nom du Client</label>
                <div className="relative">
                  <Input 
                    {...register("client_name")} 
                    className={cn(
                      "pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500",
                      errors.client_name && "border-red-500"
                    )} 
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Statut Actuel</label>
                <select
                  {...register("status")}
                  className="w-full h-12 rounded-xl border-slate-100 bg-slate-50 px-4 text-sm font-bold focus:ring-blue-500 outline-none"
                >
                  <option value="PLANIFIE">Planifié</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Interlocuteur</label>
                <div className="relative">
                  <Input 
                    {...register("contact_person")} 
                    className={cn(
                      "pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500",
                      errors.contact_person && "border-red-500"
                    )} 
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Téléphone Direct</label>
                <div className="relative">
                  <Input 
                    {...register("phone")} 
                    className={cn(
                      "pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500",
                      errors.phone && "border-red-500"
                    )} 
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Adresse de Prestation</label>
                <div className="relative">
                  <Input 
                    {...register("address")} 
                    className={cn(
                      "pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500",
                      errors.address && "border-red-500"
                    )} 
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Budget (TND)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...register("budget", { valueAsNumber: true })} 
                    className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500"
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Participants</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    {...register("participant_count", { valueAsNumber: true })} 
                    className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-blue-500"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600">Notes Internes</label>
                <textarea
                  {...register("notes")}
                  rows={1}
                  className="w-full min-h-[48px] rounded-xl border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section - Calendrier */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-emerald-500"></div>
          <CardHeader className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Calendrier Logistique</CardTitle>
                <CardDescription>Planification des mouvements de stock et dates clés.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Installation</label>
                <DatePicker
                  selected={installationDate ? new Date(installationDate) : null}
                  onChange={(date: Date | null) => date && setValue("installation_date", date.toISOString())}
                  className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm focus:ring-emerald-500 outline-none"
                  dateFormat="dd/MM/yyyy"
                />
            </div>
            <div className="group">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block italic">Événement Principal</label>
                <DatePicker
                  selected={eventDate ? new Date(eventDate) : null}
                  onChange={(date: Date | null) => date && setValue("event_date", date.toISOString())}
                  className="w-full h-12 bg-blue-50/50 border-blue-100 rounded-xl px-4 text-sm focus:ring-blue-500 outline-none font-bold text-blue-900"
                  dateFormat="dd/MM/yyyy"
                />
            </div>
            <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Démontage</label>
                <DatePicker
                  selected={dismantlingDate ? new Date(dismantlingDate) : null}
                  onChange={(date: Date | null) => date && setValue("dismantling_date", date.toISOString())}
                  className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm focus:ring-emerald-500 outline-none"
                  dateFormat="dd/MM/yyyy"
                />
            </div>
          </CardContent>
        </Card>

        {/* Section - Matériel */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-orange-500"></div>
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Inventaire Technique</CardTitle>
              </div>
            </div>
            <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl border-orange-100 text-orange-700 h-10 px-6 font-bold"
                onClick={() => appendProduct({ category_id: "", subcategory_id: "", equipment_id: "", quantity: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400">
                    <th className="px-8 py-4 text-left font-black uppercase tracking-widest text-[10px]">Catégorie</th>
                    <th className="px-8 py-4 text-left font-black uppercase tracking-widest text-[10px]">Sous-Cat.</th>
                    <th className="px-8 py-4 text-left font-black uppercase tracking-widest text-[10px]">Désignation</th>
                    <th className="px-8 py-4 text-center font-black uppercase tracking-widest text-[10px]">Stock</th>
                    <th className="px-8 py-4 text-center font-black uppercase tracking-widest text-[10px] w-28">Qté</th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {productFields.map((field, index) => {
                    const categoryId = watchedProducts?.[index]?.category_id
                    const subcategories = categories.find(c => c.id === categoryId)?.subcategories || []
                    
                    return (
                      <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <select
                            {...register(`products.${index}.category_id` as const)}
                            className="bg-white border-slate-100 rounded-lg text-xs font-medium focus:ring-orange-500 h-9 w-full px-2"
                            onChange={(e) => {
                              setValue(`products.${index}.category_id`, e.target.value);
                              setValue(`products.${index}.subcategory_id`, "");
                              setValue(`products.${index}.equipment_id`, "");
                              if (e.target.value) fetchEquipment(e.target.value);
                            }}
                          >
                            <option value="">Sél.</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-8 py-4">
                          <select
                            {...register(`products.${index}.subcategory_id` as const)}
                            className="bg-white border-slate-100 rounded-lg text-xs focus:ring-orange-500 h-9 w-full px-2 disabled:opacity-30"
                            disabled={!categoryId}
                          >
                            <option value="">Toutes</option>
                            {subcategories.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                          </select>
                        </td>
                        <td className="px-8 py-4">
                          <select
                            {...register(`products.${index}.equipment_id` as const)}
                            className="bg-white border-slate-100 rounded-lg text-xs font-bold focus:ring-orange-500 h-9 w-full px-2 disabled:opacity-30"
                            disabled={!categoryId}
                          >
                            <option value="">Produit...</option>
                            {categoryId && (equipmentByCategory[categoryId] || [])
                                .filter((e: any) => !watchedProducts?.[index]?.subcategory_id || e.subcategory_id === watchedProducts?.[index]?.subcategory_id)
                                .map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)
                            }
                          </select>
                        </td>
                        <td className="px-8 py-4 text-center font-black">
                          {(() => {
                            const eqId = watchedProducts?.[index]?.equipment_id
                            if (!eqId || !categoryId) return "-"
                            const eq = (equipmentByCategory[categoryId] || []).find(e => e.id === eqId)
                            const dispo = eq ? eq.quantity_available : 0
                            return (
                               <Badge variant="outline" className={cn(
                                   "rounded-full px-2 h-6 border-none",
                                   dispo > 5 ? "bg-emerald-100 text-emerald-700" : (dispo > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")
                               )}>
                                   {dispo}
                               </Badge>
                            )
                          })()}
                        </td>
                        <td className="px-2 py-4">
                          <Input
                            type="number"
                            {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                            className="bg-white border-slate-100 rounded-lg text-center font-bold focus:ring-orange-500 h-9 w-full shadow-sm"
                            min={1}
                          />
                        </td>
                        <td className="px-8 py-4 text-right">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-300 hover:text-red-500 rounded-lg"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section - Équipe */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-purple-500"></div>
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-black">Membres Assignés</CardTitle>
            </div>
            <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl border-purple-100 text-purple-700 h-10 px-6 font-bold"
                onClick={() => appendStaff({ technician_id: "", role: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Désigner
              </Button>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {staffFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 p-6 border border-slate-50 rounded-[2rem] bg-slate-50/50 relative group transition-all hover:bg-white hover:shadow-lg">
                <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl">
                  {technicians.find(t => t.id === watch(`staff.${index}.technician_id`))?.full_name?.charAt(0) || <User className="h-6 w-6" />}
                </div>
                <div className="flex-1 space-y-3">
                  <select
                    {...register(`staff.${index}.technician_id` as const)}
                    className="w-full bg-white border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:ring-purple-500 outline-none"
                  >
                    <option value="">Collaborateur...</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                  <Input
                    {...register(`staff.${index}.role` as const)}
                    className="bg-white border-slate-100 rounded-xl px-3 py-2 text-xs font-medium italic focus:ring-purple-500"
                    placeholder="Rôle (ex: Chef plateau)"
                  />
                </div>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-200 hover:text-red-500 absolute top-4 right-4"
                    onClick={() => removeStaff(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="sticky bottom-8 z-50">
          <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-white/10">
            <Link href={`/events/${eventId}`}>
              <Button type="button" variant="ghost" className="text-slate-400 hover:text-white font-bold h-12 rounded-2xl px-8 transition-colors">
                Abandonner
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-lg h-14 rounded-2xl px-12 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
            >
              {loading ? "Mise à jour..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </div>
      </form>
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
