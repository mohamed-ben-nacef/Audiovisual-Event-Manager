"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Category } from "@/types"

const equipmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category_id: z.string().min(1, "La catégorie est requise"),
  subcategory_id: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  technical_specs: z.string().optional(),
  quantity_total: z.number().min(1, "La quantité doit être au moins 1"),
  purchase_price: z.number().optional(),
  daily_rental_price: z.number().optional(),
  purchase_date: z.string().optional(),
  warranty_end_date: z.string().optional(),
  supplier: z.string().optional(),
  weight_kg: z.number().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      quantity_total: 1,
    },
  })

  const selectedCategoryId = watch("category_id")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId)
      setSubcategories(category?.subcategories || [])
    } else {
      setSubcategories([])
    }
  }, [selectedCategoryId, categories])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories(true)
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      setLoading(true)
      setError("")
      const response = await api.createEquipment(data)
      if (response.success) {
        router.push(`/equipment/${response.data.equipment.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création du matériel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/equipment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau matériel</h1>
          <p className="text-gray-600 mt-2">Ajoutez un nouvel équipement à l'inventaire</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Remplissez les informations de base du matériel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du matériel *
                </label>
                <Input {...register("name")} className={errors.name ? "border-red-500" : ""} />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  {...register("category_id")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-catégorie
                </label>
                <select
                  {...register("subcategory_id")}
                  disabled={!selectedCategoryId || subcategories.length === 0}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Sélectionner une sous-catégorie</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                <Input {...register("brand")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modèle</label>
                <Input {...register("model")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité totale *
                </label>
                <Input
                  type="number"
                  {...register("quantity_total", { valueAsNumber: true })}
                  className={errors.quantity_total ? "border-red-500" : ""}
                />
                {errors.quantity_total && (
                  <p className="text-sm text-red-600 mt-1">{errors.quantity_total.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("weight_kg", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix d'achat (TND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("purchase_price", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de location/jour (TND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("daily_rental_price", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                <Input {...register("supplier")} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécifications techniques
                </label>
                <textarea
                  {...register("technical_specs")}
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/equipment">
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer le matériel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
