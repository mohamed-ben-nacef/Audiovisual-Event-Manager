"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, MapPin, Phone, Mail, Package, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Event, EventEquipment } from "@/types"

const statusColors: Record<string, "default" | "success" | "warning" | "danger"> = {
  PLANIFIE: "default",
  EN_COURS: "success",
  TERMINE: "default",
  ANNULE: "danger",
}

const statusLabels: Record<string, string> = {
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [equipment, setEquipment] = useState<EventEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      setLoading(true)
      setError("")
      const [eventRes, equipmentRes] = await Promise.all([
        api.getEvent(eventId),
        api.getEventEquipment(eventId),
      ])
      setEvent(eventRes.data?.event || null)
      setEquipment(equipmentRes.data?.equipment || [])
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'événement")
      console.error("Error fetching event:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDocument = async (type: string) => {
    try {
      const blob = await api.getEventDocuments(eventId, type)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${event?.event_name}-${type}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Erreur lors du téléchargement du document")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error || "Événement non trouvé"}</p>
            <Link href="/events">
              <Button className="mt-4">Retour à la liste</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.event_name}</h1>
            <p className="text-gray-600 mt-1">{event.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[event.status] || "default"}>
            {statusLabels[event.status]}
          </Badge>
          <Link href={`/events/${eventId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date d'installation</p>
                  <p className="font-medium">{formatDate(event.installation_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de l'événement</p>
                  <p className="font-medium">{formatDate(event.event_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de démontage</p>
                  <p className="font-medium">{formatDate(event.dismantling_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
              </div>

              {event.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">{event.address}</p>
                  </div>
                </div>
              )}

              {event.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{event.phone}</span>
              </div>
              {event.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{event.email}</span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Personne à contacter</p>
                <p className="font-medium">{event.contact_person}</p>
              </div>
            </CardContent>
          </Card>

          {/* Equipment List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Matériel réservé</CardTitle>
                  <CardDescription>Liste du matériel assigné à cet événement</CardDescription>
                </div>
                <Link href={`/events/${eventId}/equipment`}>
                  <Button variant="outline" size="sm">
                    Gérer le matériel
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Aucun matériel réservé</p>
                  <Link href={`/events/${eventId}/equipment`}>
                    <Button variant="outline">Ajouter du matériel</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipment.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.equipment?.name}</p>
                        <p className="text-sm text-gray-500">
                          Référence: {item.equipment?.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.quantity_reserved} {item.quantity_reserved > 1 ? "unités" : "unité"}
                        </p>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {equipment.length > 5 && (
                    <Link href={`/events/${eventId}/equipment`}>
                      <Button variant="outline" className="w-full mt-2">
                        Voir tout le matériel ({equipment.length} articles)
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.budget && (
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-lg font-semibold">{formatCurrency(event.budget)}</p>
                </div>
              )}
              {event.participant_count && (
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="text-lg font-semibold">{event.participant_count}</p>
                </div>
              )}
              {event.event_type && (
                <div>
                  <p className="text-sm text-gray-500">Type d'événement</p>
                  <p className="font-medium">{event.event_type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Télécharger les documents de l'événement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownloadDocument("plan-de-feu")}
              >
                <Download className="h-4 w-4 mr-2" />
                Plan de feu
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownloadDocument("picking-list")}
              >
                <Download className="h-4 w-4 mr-2" />
                Liste de préparation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownloadDocument("bon-sortie")}
              >
                <Download className="h-4 w-4 mr-2" />
                Bon de sortie
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownloadDocument("bon-retour")}
              >
                <Download className="h-4 w-4 mr-2" />
                Bon de retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
