"use client"

import { useEffect, useState } from "react"
import { Plus, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Vehicle, Transport } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export default function TransportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, transportsRes] = await Promise.all([
        api.getVehicles(),
        api.getTransports(),
      ])
      setVehicles(vehiclesRes.data?.vehicles || [])
      setTransports(transportsRes.data?.transports || [])
    } catch (error) {
      console.error("Error fetching transport data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, "default" | "success" | "warning"> = {
    DISPONIBLE: "success",
    EN_SERVICE: "default",
    EN_MAINTENANCE: "warning",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport</h1>
          <p className="text-gray-600 mt-2">Gérez les véhicules et transports</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau véhicule
        </Button>
      </div>

      {/* Vehicles */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Véhicules</h2>
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun véhicule trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {vehicle.registration_number}
                      </p>
                    </div>
                    <Badge variant={statusColors[vehicle.status] || "default"}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Type: {vehicle.type}</p>
                    {vehicle.load_capacity_kg && (
                      <p>Capacité: {vehicle.load_capacity_kg} kg</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transports */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transports planifiés</h2>
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : transports.length === 0 ? (
            <p className="text-gray-500">Aucun transport trouvé</p>
          ) : (
            <div className="space-y-4">
              {transports.map((transport) => (
                <div
                  key={transport.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {transport.event?.event_name || "Événement"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {transport.departure_address} → {transport.arrival_address}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Date: {formatDate(transport.departure_date)}
                      </p>
                    </div>
                    <Badge>{transport.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
