"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const installationDate = watch("installation_date")
  const eventDate = watch("event_date")
  const dismantlingDate = watch("dismantling_date")

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
        setValue("category", event.category)
        setValue("notes", event.notes || "")
        setValue("budget", event.budget)
        setValue("participant_count", event.participant_count)
        setValue("event_type", event.event_type || "")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'événement")
    } finally {
      setFetching(false)
    }
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true)
      setError("")
      const response = await api.updateEvent(eventId, data)
      if (response.success) {
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
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'événement</h1>
          <p className="text-gray-600 mt-2">Modifiez les informations de l'événement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Modifiez les informations de base de l'événement</CardDescription>
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
              <Link href={`/events/${eventId}`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
