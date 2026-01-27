"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { EventEquipment, Equipment } from "@/types"

export default function EventEquipmentPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [eventEquipment, setEventEquipment] = useState<EventEquipment[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (eventId) {
      fetchData()
    }
  }, [eventId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [equipmentRes, availableRes] = await Promise.all([
        api.getEventEquipment(eventId),
        api.getEquipment({ limit: 100 }),
      ])
      setEventEquipment(equipmentRes.data?.equipment || [])
      setAvailableEquipment(availableRes.data?.equipment || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEquipment = async (equipmentId: string, quantity: number) => {
    try {
      await api.addEventEquipment(eventId, {
        equipment_id: equipmentId,
        quantity_reserved: quantity,
      })
      fetchData()
      setShowAddModal(false)
    } catch (error) {
      console.error("Error adding equipment:", error)
      alert("Erreur lors de l'ajout du matériel")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matériel de l'événement</h1>
            <p className="text-gray-600 mt-2">Gérez le matériel réservé pour cet événement</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter du matériel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matériel réservé</CardTitle>
          <CardDescription>
            Liste du matériel assigné à cet événement ({eventEquipment.length} articles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun matériel réservé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventEquipment.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.equipment?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Référence: {item.equipment?.reference}
                    </p>
                    {item.equipment?.category && (
                      <Badge variant="outline" className="mt-2">
                        {item.equipment.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {item.quantity_reserved} {item.quantity_reserved > 1 ? "unités" : "unité"}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>Ajouter du matériel</CardTitle>
              <CardDescription>Sélectionnez le matériel à ajouter à l'événement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{eq.name}</p>
                      <p className="text-sm text-gray-500">
                        Disponible: {eq.quantity_available} / {eq.quantity_total}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddEquipment(eq.id, 1)}
                      disabled={eq.quantity_available === 0}
                    >
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
