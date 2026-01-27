"use client"

import { useEffect, useState } from "react"
import { Plus, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Maintenance } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaintenances()
  }, [])

  const fetchMaintenances = async () => {
    try {
      setLoading(true)
      const response = await api.getMaintenances()
      setMaintenances(response.data?.maintenances || [])
    } catch (error) {
      console.error("Error fetching maintenances:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, "default" | "warning" | "success"> = {
    EN_ATTENTE: "default",
    EN_COURS: "warning",
    TERMINE: "success",
  }

  const priorityColors: Record<string, "default" | "warning" | "danger"> = {
    BASSE: "default",
    MOYENNE: "warning",
    HAUTE: "danger",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600 mt-2">Gérez les maintenances du matériel</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle maintenance
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune maintenance trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {maintenance.equipment?.name || "Matériel"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {maintenance.problem_description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={statusColors[maintenance.status] || "default"}>
                          {maintenance.status}
                        </Badge>
                        <Badge variant={priorityColors[maintenance.priority] || "default"}>
                          {maintenance.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Début: {formatDate(maintenance.start_date)}</p>
                      {maintenance.expected_end_date && (
                        <p>Fin prévue: {formatDate(maintenance.expected_end_date)}</p>
                      )}
                    </div>
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
