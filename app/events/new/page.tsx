"use client"

import { useState } from "react"
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
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const eventSchema = z.object({
  event_name: z.string().min(1, "Le nom de l'événement est requis"),
  client_name: z.string().min(1, "Le nom du client est requis"),
  contact_person: z.string().min(1, "La personne à contacter est requise"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().min(1, "L'adresse est requise"),
  installation_date: z.string().min(1, "La date d'installation est requise"),
  event_date: z.string().min(1, "La date de l'événement est requise"),
  dismantling_date: z.string().min(1, "La date de démontage est requise"),
  category: z.enum(["SON", "VIDEO", "LUMIERE", "MIXTE"]),
  notes: z.string().optional(),
  budget: z.number().optional(),
  participant_count: z.number().optional(),
  event_type: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: "MIXTE",
    },
  })

  const installationDate = watch("installation_date")
  const eventDate = watch("event_date")
  const dismantlingDate = watch("dismantling_date")

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true)
      setError("")
      const response = await api.createEvent(data)
      if (response.success) {
        router.push(`/events/${response.data.event.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'événement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvel événement</h1>
          <p className="text-gray-600 mt-2">Créez un nouvel événement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Remplissez les informations de base de l'événement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'événement *
                </label>
                <Input {...register("event_name")} className={errors.event_name ? "border-red-500" : ""} />
                {errors.event_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.event_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <Input {...register("client_name")} className={errors.client_name ? "border-red-500" : ""} />
                {errors.client_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personne à contacter *
                </label>
                <Input {...register("contact_person")} className={errors.contact_person ? "border-red-500" : ""} />
                {errors.contact_person && (
                  <p className="text-sm text-red-600 mt-1">{errors.contact_person.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <Input {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="SON">Son</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="LUMIERE">Lumière</option>
                  <option value="MIXTE">Mixte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'installation *
                </label>
                <DatePicker
                  selected={installationDate ? new Date(installationDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) setValue("installation_date", date.toISOString())
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  wrapperClassName="w-full"
                />
                {errors.installation_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.installation_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement *
                </label>
                <DatePicker
                  selected={eventDate ? new Date(eventDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) setValue("event_date", date.toISOString())
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  wrapperClassName="w-full"
                />
                {errors.event_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.event_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de démontage *
                </label>
                <DatePicker
                  selected={dismantlingDate ? new Date(dismantlingDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) setValue("dismantling_date", date.toISOString())
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  wrapperClassName="w-full"
                />
                {errors.dismantling_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.dismantling_date.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <Input {...register("address")} className={errors.address ? "border-red-500" : ""} />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (TND)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("budget", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de participants
                </label>
                <Input
                  type="number"
                  {...register("participant_count", { valueAsNumber: true })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register("notes")}
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/events">
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer l'événement"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
