"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Package, CheckCircle, Wrench, AlertCircle, QrCode, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Equipment, EquipmentStatusHistory } from "@/types"

const statusConfig: Record<string, { label: string; color: "default" | "success" | "warning" | "danger"; icon: any }> = {
  DISPONIBLE: { label: "Disponible", color: "success", icon: CheckCircle },
  EN_LOCATION: { label: "En location", color: "default", icon: Package },
  EN_MAINTENANCE: { label: "En maintenance", color: "warning", icon: Wrench },
  MANQUANT: { label: "Manquant", color: "danger", icon: AlertCircle },
}

export default function EquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const equipmentId = params.id as string
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [history, setHistory] = useState<EquipmentStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (equipmentId) {
      fetchEquipmentData()
    }
  }, [equipmentId])

  const fetchEquipmentData = async () => {
    try {
      setLoading(true)
      setError("")
      const [equipmentRes, historyRes] = await Promise.all([
        api.getEquipmentById(equipmentId),
        api.getEquipmentHistory(equipmentId),
      ])
      setEquipment(equipmentRes.data?.equipment || null)
      setHistory(historyRes.data?.history || [])
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement du matériel")
      console.error("Error fetching equipment:", err)
    } finally {
      setLoading(false)
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

  if (error || !equipment) {
    return (
      <div className="space-y-6">
        <Link href="/equipment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error || "Matériel non trouvé"}</p>
            <Link href="/equipment">
              <Button className="mt-4">Retour à la liste</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = equipment.status ? statusConfig[equipment.status] : statusConfig.DISPONIBLE
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/equipment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-500 font-mono mt-1">{equipment.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
          <Link href={`/equipment/${equipmentId}/edit`}>
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
          {/* Photos */}
          {equipment.photos && equipment.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {equipment.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${equipment.name} - Photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du matériel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {equipment.category && (
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <Badge variant="outline">{equipment.category.name}</Badge>
                  </div>
                )}
                {equipment.subcategory && (
                  <div>
                    <p className="text-sm text-gray-500">Sous-catégorie</p>
                    <p className="font-medium">{equipment.subcategory.name}</p>
                  </div>
                )}
                {equipment.brand && (
                  <div>
                    <p className="text-sm text-gray-500">Marque</p>
                    <p className="font-medium">{equipment.brand}</p>
                  </div>
                )}
                {equipment.model && (
                  <div>
                    <p className="text-sm text-gray-500">Modèle</p>
                    <p className="font-medium">{equipment.model}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Quantité totale</p>
                  <p className="text-lg font-semibold">{equipment.quantity_total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantité disponible</p>
                  <p className="text-lg font-semibold text-green-600">
                    {equipment.quantity_available}
                  </p>
                </div>
              </div>

              {equipment.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{equipment.description}</p>
                </div>
              )}

              {equipment.technical_specs && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Spécifications techniques</p>
                  <p className="text-sm whitespace-pre-wrap">{equipment.technical_specs}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
                <CardDescription>Historique des changements de statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((item) => {
                    const itemStatus = statusConfig[item.status] || statusConfig.DISPONIBLE
                    const ItemIcon = itemStatus.icon
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <div className={`p-2 rounded-full bg-${itemStatus.color}-50`}>
                          <ItemIcon className={`h-4 w-4 text-${itemStatus.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge variant={itemStatus.color}>{itemStatus.label}</Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.changed_at)}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipment.daily_rental_price && (
                <div>
                  <p className="text-sm text-gray-500">Prix de location/jour</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(equipment.daily_rental_price)}
                  </p>
                </div>
              )}
              {equipment.purchase_price && (
                <div>
                  <p className="text-sm text-gray-500">Prix d'achat</p>
                  <p className="font-medium">{formatCurrency(equipment.purchase_price)}</p>
                </div>
              )}
              {equipment.weight_kg && (
                <div>
                  <p className="text-sm text-gray-500">Poids</p>
                  <p className="font-medium">{equipment.weight_kg} kg</p>
                </div>
              )}
              {equipment.supplier && (
                <div>
                  <p className="text-sm text-gray-500">Fournisseur</p>
                  <p className="font-medium">{equipment.supplier}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          {equipment.qr_code_url && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Code QR du matériel</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <img
                  src={equipment.qr_code_url}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto border border-gray-200 rounded-lg p-4"
                />
                <Button variant="outline" className="mt-4 w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Télécharger QR Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Voir l'historique complet
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                Créer une maintenance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
