"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Package, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { EventEquipment, Equipment } from "@/types"
import { QRScanner } from "@/components/QRScanner"
import { useAuthStore } from "@/stores/auth-store"

export default function EventEquipmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const eventId = params.id as string
  const [eventEquipment, setEventEquipment] = useState<EventEquipment[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<EventEquipment | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [returnQty, setReturnQty] = useState(0)
  const [brokenQty, setBrokenQty] = useState(0)

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

  const handleAddEquipment = async (equipmentId: string, quantity: number, lots?: number) => {
    try {
      const payload: any = {
        equipment_id: equipmentId,
        quantity_reserved: quantity,
      }
      if (lots !== undefined) {
        payload.lots_reserved = lots
      }
      await api.addEventEquipment(eventId, payload)
      fetchData()
      setShowAddModal(false)
    } catch (error) {
      console.error("Error adding equipment:", error)
      alert("Erreur lors de l'ajout du matériel")
    }
  }

  const handleReturnEquipment = async () => {
    if (!selectedItem) return
    try {
      await api.updateEquipmentReservation(eventId, selectedItem.id, {
        status: "RETOURNE",
        quantity_returned: returnQty,
        items_broken: brokenQty,
      })
      alert("Retour enregistré avec succès")
      fetchData()
      setShowReturnModal(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error returning equipment:", error)
      alert("Erreur lors de l'enregistrement du retour")
    }
  }

  const handleScan = async (scannedText: string) => {
    const item = eventEquipment.find((e) => e.equipment?.reference === scannedText)

    if (item) {
      if (item.status === "RESERVE") {
        try {
          await api.updateEquipmentReservation(eventId, item.id, { status: "LIVRE" })
          alert(`Produit ${item.equipment?.name} marqué comme LIVRÉ !`)
          fetchData()
        } catch (error) {
          console.error("Error updating status:", error)
          alert("Erreur lors de la validation du produit")
        }
      } else if (item.status === "LIVRE") {
        setSelectedItem(item)
        setReturnQty(item.quantity_reserved)
        setBrokenQty(0)
        setShowReturnModal(true)
      }
    } else {
      alert(`Produit avec la référence ${scannedText} non trouvé dans cet événement.`)
    }
    setShowScanner(false)
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowScanner(true)}>
            <Scan className="h-4 w-4 mr-2" />
            Scanner QR
          </Button>
          {user?.role !== 'TECHNICIEN' && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter du matériel
            </Button>
          )}
        </div>
      </div>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

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
                    <Badge variant="outline" className="mt-2 block w-fit ml-auto">
                      {item.status}
                    </Badge>
                    {item.status === 'LIVRE' && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="mt-2 h-8"
                        onClick={() => {
                          setSelectedItem(item);
                          setReturnQty(item.quantity_reserved);
                          setBrokenQty(0);
                          setShowReturnModal(true);
                        }}
                      >
                        Enregistrer Retour
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Ajouter du matériel</CardTitle>
              <CardDescription>Sélectionnez le matériel à ajouter à l'événement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {availableEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 uppercase tracking-tight">{eq.name}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                        Disp: {eq.quantity_available} / {eq.quantity_total} 
                        {eq.is_lot_based && ` - Lot de ${eq.items_per_lot}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder={eq.is_lot_based ? "Lots" : "Qté"}
                          className="h-9 text-xs"
                          defaultValue={1}
                          id={`qty-${eq.id}`}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`qty-${eq.id}`) as HTMLInputElement;
                          const val = parseInt(input.value) || 1;
                          if (eq.is_lot_based) {
                            handleAddEquipment(eq.id, val * eq.items_per_lot, val);
                          } else {
                            handleAddEquipment(eq.id, val);
                          }
                        }}
                        disabled={eq.quantity_available === 0}
                        className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold text-[10px] uppercase tracking-widest">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReturnModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] overflow-hidden border-none">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Retour de Matériel</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                {selectedItem.equipment?.name} ({selectedItem.quantity_reserved} unités réservées)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unités Retournées en Bon État</label>
                  <Input 
                    type="number" 
                    value={returnQty} 
                    onChange={(e: any) => setReturnQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 italic">Unités Cassées / Perdues</label>
                  <Input 
                    type="number" 
                    value={brokenQty} 
                    onChange={(e: any) => setBrokenQty(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="h-14 rounded-2xl bg-red-50/50 border-red-100 font-bold text-red-600 focus:ring-red-600"
                  />
                  <p className="text-[9px] text-red-400 font-bold mt-2 uppercase tracking-tighter">⚠️ Ces unités seront déduites de l'inventaire total.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleReturnEquipment}
                  disabled={returnQty + brokenQty === 0}
                  className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 font-black text-[10px] uppercase tracking-widest"
                >
                  Valider
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
