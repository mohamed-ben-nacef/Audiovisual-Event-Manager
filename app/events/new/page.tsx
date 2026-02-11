"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Info, 
  Truck, 
  Package, 
  Users, 
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Layers
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

const eventSchema = z.object({
  event_name: z.string().min(1, "Le nom de l'événement est requis"),
  client_name: z.string().min(1, "Le nom du client est requis"),
  contact_person: z.string().min(1, "La personne à contacter est requise"),
  phone: z.string().min(8, "Le numéro de téléphone doit avoir au moins 8 chiffres"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().min(1, "L'adresse est requise"),
  installation_date: z.string().min(1, "La date d'installation est requise"),
  event_date: z.string().min(1, "La date de l'événement est requise"),
  dismantling_date: z.string().min(1, "La date de démontage est requise"),
  notes: z.string().optional(),
  budget: z.number().optional(),
  participant_count: z.number().optional(),
  event_type: z.string().optional(),
  products: z.array(z.object({
    category_id: z.string().min(1, "Catégorie requise"),
    subcategory_id: z.string().optional(),
    equipment_id: z.string().min(1, "Produit requis"),
    quantity: z.number().min(1, "Quantité invalide"),
  })).optional(),
  staff: z.array(z.object({
    technician_id: z.string().min(1, "Technicien requis"),
    role: z.string().optional(),
  })).optional(),
})

type EventFormData = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      products: [{ category_id: "", equipment_id: "", quantity: 1 }],
      staff: [],
    },
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [catsRes, techsRes] = await Promise.all([
        api.getCategories(true),
        api.getUsers({ role: ["TECHNICIEN", "MAINTENANCE"] }),
      ])
      setCategories(catsRes.data?.categories || [])
      setTechnicians(techsRes.data?.users || [])
    } catch (err: any) {
      console.error("Frontend: Error fetching new event data:", err)
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

  const installationDate = watch("installation_date")
  const eventDate = watch("event_date")
  const dismantlingDate = watch("dismantling_date")
  const watchedProducts = watch("products")

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true)
      setError("")
      
      const { products, staff, ...eventData } = data
      const response = await api.createEvent({ ...eventData, category: "MIXTE" })
      
      if (response.success) {
        const eventId = response.data.event.id
        
        if (products && products.length > 0) {
          await Promise.all(
            products
              .filter(p => p.equipment_id && p.quantity > 0)
              .map(p => api.addEventEquipment(eventId, {
                equipment_id: p.equipment_id,
                quantity_reserved: p.quantity
              }))
          )
        }
        
        if (staff && staff.length > 0) {
          await Promise.all(
            staff
              .filter(s => s.technician_id)
              .map(s => api.assignTechnician(eventId, {
                technician_id: s.technician_id,
                role: s.role
              }))
          )
        }
        
        router.push(`/events/${eventId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'événement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/events" 
              className="inline-flex items-center text-blue-100 hover:text-white transition-colors group"
            >
              <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">Retour aux événements</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Nouvel Événement</h1>
              <p className="text-blue-100/80 text-lg max-w-xl font-light">
                Configurez les détails, le matériel et l'équipe pour votre prochaine prestation audiovisuelle.
              </p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className={cn("px-4 py-2 rounded-lg transition-all", step === 1 ? "bg-white text-blue-900 shadow-lg scale-105" : "text-white/60")}>1. Détails</div>
                <ChevronRight className="h-4 w-4 text-white/40" />
                <div className={cn("px-4 py-2 rounded-lg transition-all", step === 2 ? "bg-white text-blue-900 shadow-lg scale-105" : "text-white/60")}>2. Matériel</div>
                <ChevronRight className="h-4 w-4 text-white/40" />
                <div className={cn("px-4 py-2 rounded-lg transition-all", step === 3 ? "bg-white text-blue-900 shadow-lg scale-105" : "text-white/60")}>3. Équipe</div>
              </div>
            </div>
          </div>
        </div>
        {/* Animated Background Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Information Section */}
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <CardHeader className="p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Informations Générales</CardTitle>
                <CardDescription className="text-gray-500">Détails de contact et localisation de l'événement.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {error && (
              <div className="col-span-full bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="bg-red-500 p-1 rounded-full text-white">
                  <Trash2 className="h-4 w-4" />
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Nom de l'événement</label>
                <div className="relative">
                  <Input 
                    {...register("event_name")} 
                    placeholder="Ex: Gala Annuel des Entreprises"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.event_name && "border-red-500 bg-red-50"
                    )} 
                  />
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.event_name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.event_name.message}</p>}
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Client / Entreprise</label>
                <div className="relative">
                  <Input 
                    {...register("client_name")} 
                    placeholder="Nom de l'entreprise ou client"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.client_name && "border-red-500 bg-red-50"
                    )} 
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.client_name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.client_name.message}</p>}
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Personne de contact</label>
                <div className="relative">
                  <Input 
                    {...register("contact_person")} 
                    placeholder="Prénom et Nom"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.contact_person && "border-red-500 bg-red-50"
                    )} 
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.contact_person && <p className="text-xs text-red-600 mt-1 font-medium">{errors.contact_person.message}</p>}
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Téléphone</label>
                <div className="relative">
                  <Input 
                    {...register("phone")} 
                    placeholder="+216 -- --- ---"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.phone && "border-red-500 bg-red-50"
                    )} 
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.phone && <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone.message}</p>}
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Adresse Email</label>
                <div className="relative">
                  <Input 
                    type="email" 
                    {...register("email")} 
                    placeholder="contact@client.com"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.email && "border-red-500 bg-red-50"
                    )} 
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email.message}</p>}
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Lieu / Adresse</label>
                <div className="relative">
                  <Input 
                    {...register("address")} 
                    placeholder="Lieu de l'événement"
                    className={cn(
                      "pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all",
                      errors.address && "border-red-500 bg-red-50"
                    )} 
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {errors.address && <p className="text-xs text-red-600 mt-1 font-medium">{errors.address.message}</p>}
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Budget Estimé (TND)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...register("budget", { valueAsNumber: true })} 
                    placeholder="0.00"
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Nombre de Participants</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    {...register("participant_count", { valueAsNumber: true })} 
                    placeholder="0"
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Type d'événement</label>
                <div className="relative">
                  <Input 
                    {...register("event_type")} 
                    placeholder="Ex: Conférence, Concert..."
                    className="pl-10 h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logistics Section */}
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <CardHeader className="p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Planification & Logistique</CardTitle>
                <CardDescription className="text-gray-500">Dates clés pour l'installation, l'événement et le démontage.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-emerald-600 transition-colors">Installation</label>
              <div className="relative">
                <DatePicker
                  selected={installationDate ? new Date(installationDate) : null}
                  onChange={(date: Date | null) => date && setValue("installation_date", date.toISOString())}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Date d'installation"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-10 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none",
                    errors.installation_date && "border-red-500 bg-red-50"
                  )}
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              {errors.installation_date && <p className="text-xs text-red-600 mt-1 font-medium">{errors.installation_date.message}</p>}
            </div>

            <div className="group text-blue-600">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Jour J (Événement)</label>
              <div className="relative">
                <DatePicker
                  selected={eventDate ? new Date(eventDate) : null}
                  onChange={(date: Date | null) => date && setValue("event_date", date.toISOString())}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Date de l'événement"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-blue-100 bg-blue-50/30 px-10 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition-all outline-none",
                    errors.event_date && "border-red-500 bg-red-50"
                  )}
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              {errors.event_date && <p className="text-xs text-red-600 mt-1 font-medium">{errors.event_date.message}</p>}
            </div>

            <div className="group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-emerald-600 transition-colors">Démontage</label>
              <div className="relative">
                <DatePicker
                  selected={dismantlingDate ? new Date(dismantlingDate) : null}
                  onChange={(date: Date | null) => date && setValue("dismantling_date", date.toISOString())}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Date de démontage"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-10 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none",
                    errors.dismantling_date && "border-red-500 bg-red-50"
                  )}
                  wrapperClassName="w-full"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              {errors.dismantling_date && <p className="text-xs text-red-600 mt-1 font-medium">{errors.dismantling_date.message}</p>}
            </div>

            <div className="col-span-full group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-emerald-600 transition-colors">Notes & Instructions Spécifiques</label>
              <textarea
                {...register("notes")}
                rows={4}
                placeholder="Indiquez ici toute information utile pour l'équipe (accès, contraintes techniques, demandes spéciales)..."
                className="flex w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Equipment Table Section */}
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-600"></div>
          <CardHeader className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Matériel & Équipements</CardTitle>
                  <CardDescription className="text-gray-500">Sélectionnez le matériel nécessaire en vérifiant la disponibilité en temps réel.</CardDescription>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-all"
                onClick={() => appendProduct({ category_id: "", subcategory_id: "", equipment_id: "", quantity: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500">
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Catégorie</th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Sous-catégorie</th>
                    <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Produit</th>
                    <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-[10px]">Dispo</th>
                    <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-[10px] w-32">Qté</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productFields.map((field, index) => {
                    const categoryId = watchedProducts?.[index]?.category_id
                    const subcategories = categories.find(c => c.id === categoryId)?.subcategories || []
                    
                    return (
                      <tr key={field.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <select
                            {...register(`products.${index}.category_id` as const)}
                            className="w-full h-10 rounded-xl border-gray-100 bg-white shadow-sm text-xs focus:ring-orange-500 outline-none transition-all px-3"
                            onChange={(e) => {
                              const val = e.target.value;
                              setValue(`products.${index}.category_id`, val);
                              setValue(`products.${index}.subcategory_id`, "");
                              setValue(`products.${index}.equipment_id`, "");
                              if (val) fetchEquipment(val);
                            }}
                          >
                            <option value="">Sélectionner</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            {...register(`products.${index}.subcategory_id` as const)}
                            className="w-full h-10 rounded-xl border-gray-100 bg-white shadow-sm text-xs focus:ring-orange-500 outline-none transition-all px-3 disabled:opacity-50"
                            disabled={!categoryId}
                            onChange={(e) => {
                              setValue(`products.${index}.subcategory_id`, e.target.value);
                              setValue(`products.${index}.equipment_id`, "");
                            }}
                          >
                            <option value="">Toutes</option>
                            {subcategories.map((sc: any) => (
                              <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            {...register(`products.${index}.equipment_id` as const)}
                            className="w-full h-10 rounded-xl border-gray-100 bg-white shadow-sm font-semibold text-xs focus:ring-orange-500 outline-none transition-all px-3 disabled:opacity-50"
                            disabled={!categoryId}
                          >
                            <option value="">Sél. un produit</option>
                            {categoryId && (equipmentByCategory[categoryId] || [])
                              .filter((e: any) => !watchedProducts?.[index]?.subcategory_id || e.subcategory_id === watchedProducts?.[index]?.subcategory_id)
                              .map((e: any) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                              ))
                            }
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(() => {
                            const eqId = watchedProducts?.[index]?.equipment_id
                            if (!eqId || !categoryId) return <span className="text-gray-300">-</span>
                            const eq = (equipmentByCategory[categoryId] || []).find(e => e.id === eqId)
                            const dispo = eq ? eq.quantity_available : 0
                            return (
                              <div className={cn(
                                "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-[10px]",
                                dispo > 10 ? "bg-green-100 text-green-700" : (dispo > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")
                              )}>
                                {dispo}
                              </div>
                            )
                          })()}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <Input
                            type="number"
                            {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                            className="h-10 text-center font-bold bg-white rounded-xl border-gray-100 shadow-sm w-full"
                            min={1}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(index)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {productFields.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        Aucun matériel ajouté pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Staff Section */}
        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
          <CardHeader className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Staff & Équipe</CardTitle>
                  <CardDescription className="text-gray-500">Assignez les techniciens et définissez leurs rôles pour cet événement.</CardDescription>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all"
                onClick={() => appendStaff({ technician_id: "", role: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Désigner un staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {staffFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 p-6 border border-gray-100 rounded-3xl items-start bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="bg-purple-100 p-3 rounded-2xl text-purple-700">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-4 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Technicien</label>
                    <select
                      {...register(`staff.${index}.technician_id` as const)}
                      className="w-full h-10 rounded-xl border-gray-100 bg-gray-50 text-sm focus:ring-purple-500 outline-none transition-all px-3"
                    >
                      <option value="">Sélectionner un membre</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Rôle / Mission</label>
                    <Input
                      {...register(`staff.${index}.role` as const)}
                      placeholder="Ex: Chef de projet, Mixeur Audio..."
                      className="h-10 bg-gray-50 border-gray-100 rounded-xl focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStaff(index)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {staffFields.length === 0 && (
              <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-medium italic">
                Aucun membre d'équipe désigné.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="sticky bottom-8 left-0 right-0 z-50 px-4 md:px-0">
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50 flex items-center justify-between gap-6">
            <Link href="/events" className="hidden sm:block">
              <Button type="button" variant="ghost" className="h-12 px-6 rounded-2xl text-gray-500 hover:text-gray-900 transition-all font-medium">Annuler les modifications</Button>
            </Link>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link href="/events" className="sm:hidden flex-1">
                <Button type="button" variant="ghost" className="w-full h-12 rounded-2xl text-gray-500">Annuler</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 sm:w-64 h-12 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-95 font-bold text-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Création...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>Créer l'Événement</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
