"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package, Wrench, Truck } from "lucide-react"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    equipmentInRental: 0,
    equipmentInMaintenance: 0,
    availableVehicles: 0,
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch upcoming events
      const eventsRes = await api.getEvents({
        status: "PLANIFIE",
        limit: 5,
      })

      // Fetch equipment stats
      const equipmentRes = await api.getEquipment({ status: "EN_LOCATION", limit: 1 })
      const maintenanceRes = await api.getEquipment({ status: "EN_MAINTENANCE", limit: 1 })

      // Fetch vehicles
      const vehiclesRes = await api.getVehicles({ status: "DISPONIBLE" })

      setUpcomingEvents(eventsRes.data?.events || [])
      setStats({
        upcomingEvents: eventsRes.data?.total || 0,
        equipmentInRental: equipmentRes.data?.total || 0,
        equipmentInMaintenance: maintenanceRes.data?.total || 0,
        availableVehicles: vehiclesRes.data?.vehicles?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Événements à venir",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/events",
    },
    {
      title: "Matériel en location",
      value: stats.equipmentInRental,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/equipment?status=EN_LOCATION",
    },
    {
      title: "Matériel en maintenance",
      value: stats.equipmentInMaintenance,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/equipment?status=EN_MAINTENANCE",
    },
    {
      title: "Véhicules disponibles",
      value: stats.availableVehicles,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/transport",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Événements à venir</CardTitle>
          <CardDescription>Prochains événements planifiés</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-gray-500">Aucun événement à venir</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.event_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(event.event_date)}
                      </p>
                      <p className="text-xs text-gray-500">{event.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {upcomingEvents.length >= 5 && (
                <Link
                  href="/events"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  Voir tous les événements →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
