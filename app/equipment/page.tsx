"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search, Package, CheckCircle, Wrench, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Equipment, EquipmentStatus } from "@/types"

const statusConfig: Record<EquipmentStatus, { label: string; color: "default" | "success" | "warning" | "danger"; icon: any }> = {
  DISPONIBLE: { label: "Disponible", color: "success", icon: CheckCircle },
  EN_LOCATION: { label: "En location", color: "default", icon: Package },
  EN_MAINTENANCE: { label: "En maintenance", color: "warning", icon: Wrench },
  MANQUANT: { label: "Manquant", color: "danger", icon: AlertCircle },
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
    fetchEquipment()
  }, [categoryFilter, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (categoryFilter !== "all") {
        params.category_id = categoryFilter
      }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await api.getEquipment(params)
      setEquipment(response.data?.equipment || [])
    } catch (error) {
      console.error("Error fetching equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchEquipment()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matériel</h1>
          <p className="text-gray-600 mt-2">Gérez votre inventaire de matériel</p>
        </div>
        <Link href="/equipment/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau matériel
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_LOCATION">En location</option>
              <option value="EN_MAINTENANCE">En maintenance</option>
              <option value="MANQUANT">Manquant</option>
            </select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Chargement...</p>
          </CardContent>
        </Card>
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun matériel trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => {
            const statusInfo = item.status ? statusConfig[item.status] : statusConfig.DISPONIBLE
            const StatusIcon = statusInfo.icon
            return (
              <Link key={item.id} href={`/equipment/${item.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">{item.reference}</p>
                      </div>
                      <Badge variant={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {item.photos && item.photos.length > 0 && (
                      <div className="mb-4">
                        <img
                          src={item.photos[0]}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {item.category && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Catégorie:</span>
                          <Badge variant="outline">{item.category.name}</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quantité totale:</span>
                        <span className="font-semibold">{item.quantity_total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-semibold text-green-600">
                          {item.quantity_available}
                        </span>
                      </div>
                      {item.daily_rental_price && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Prix/jour:</span>
                          <span className="font-semibold">
                            {formatCurrency(typeof item.daily_rental_price === 'number'
                              ? item.daily_rental_price
                              : parseFloat(String(item.daily_rental_price)) || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
