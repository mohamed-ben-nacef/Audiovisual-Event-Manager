"use client"

import { useEffect, useState } from "react"
import { Search, QrCode, ArrowLeft, Package, CheckCircle, AlertCircle, Sparkles, Badge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Equipment } from "@/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import QRCode from "qrcode"

export default function ShareEquipmentPage() {
   const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
   const [loading, setLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState("")
   const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
   const [showQR, setShowQR] = useState(false)

   useEffect(() => {
      fetchEquipment()
   }, [])

   const fetchEquipment = async () => {
      try {
         setLoading(true)
         const res = await api.getEquipment({ limit: 100 })
         setEquipmentList(res.data?.equipment || [])
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   const filteredList = equipmentList.filter(e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.reference.toLowerCase().includes(searchTerm.toLowerCase())
   )

   useEffect(() => {
      if (showQR && selectedEquipment) {
         const canvas = document.getElementById('share-qr-canvas') as HTMLCanvasElement;
         if (canvas) {
            const publicUrl = `${window.location.origin}/QTE/${selectedEquipment.id}`;
            QRCode.toCanvas(canvas, publicUrl, {
               width: 300,
               margin: 2,
               color: {
                  dark: '#0f172a',
                  light: '#ffffff',
               },
            });
         }
      }
   }, [showQR, selectedEquipment])

   return (
      <div className="w-full space-y-12 py-10 pb-32">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <Link href="/equipment" className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors group text-[10px] font-black uppercase tracking-widest">
                  <ArrowLeft className="h-3 w-3 mr-2" />
                  Retour
               </Link>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Générateur de QR Public</h1>
               <p className="text-slate-500 font-medium">Sélectionnez un matériel pour générer son étiquette de statut public.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-12 space-y-8">
               <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-2">
                  <CardContent className="p-4">
                     <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                           placeholder="Chercher un équipement par nom ou référence..."
                           className="h-16 border-none shadow-none text-lg font-bold pl-16 focus-visible:ring-0 rounded-3xl"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </CardContent>
               </Card>

               {loading ? (
                  <div className="flex items-center justify-center py-20">
                     <div className="h-12 w-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {filteredList.map((item) => (
                        <Card
                           key={item.id}
                           className={cn(
                              "relative group border border-slate-100 shadow-sm hover:shadow-xl rounded-[2.5rem] bg-white cursor-pointer transition-all duration-300 overflow-hidden",
                              selectedEquipment?.id === item.id && "ring-4 ring-blue-600 border-transparent scale-[1.02]"
                           )}
                           onClick={() => {
                              setSelectedEquipment(item);
                              setShowQR(true);
                           }}
                        >
                           <div className="p-8 space-y-6">
                              <div className="flex justify-between items-start">
                                 <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <Package className="h-7 w-7" />
                                 </div>
                                 {item.quantity_broken > 0 && (
                                    <Badge className="bg-red-50 text-red-500 font-black text-[8px] uppercase tracking-widest border-none">
                                       {item.quantity_broken} Cassé(s)
                                    </Badge>
                                 )}
                              </div>
                              <div className="space-y-1">
                                 <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{item.name}</h3>
                                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.reference}</p>
                              </div>
                              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                 <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Disponible</span>
                                    <span className="text-xl font-black text-slate-900">{item.quantity_available} / {item.quantity_total}</span>
                                 </div>
                                 <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                    <QrCode className="h-5 w-5" />
                                 </div>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {showQR && selectedEquipment && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
               <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                  <div className="flex flex-col md:flex-row h-full">
                     <div className="bg-slate-900 md:w-2/5 p-12 text-white flex flex-col justify-between">
                        <div className="space-y-4">
                           <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                              <Sparkles className="h-6 w-6" />
                           </div>
                           <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Étiquette de Statut Public</h2>
                        </div>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Équipement</p>
                              <p className="text-lg font-bold truncate">{selectedEquipment.name}</p>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center"><CheckCircle className="h-4 w-4" /></div>
                                 <span className="text-sm font-bold">{selectedEquipment.quantity_available} Disponibles</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center"><AlertCircle className="h-4 w-4" /></div>
                                 <span className="text-sm font-bold">{selectedEquipment.quantity_broken} Hors-service</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 p-12 flex flex-col items-center justify-center space-y-10">
                        <div className="p-8 bg-white rounded-[3rem] border-2 border-slate-50 shadow-inner">
                           <canvas id="share-qr-canvas"></canvas>
                        </div>
                        <div className="text-center space-y-6 w-full">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien Public Permanent</p>
                              <p className="text-xs font-mono text-blue-600 bg-blue-50 py-3 px-6 rounded-2xl truncate">{window.location.origin}/QTE/{selectedEquipment.id}</p>
                           </div>
                           <div className="flex gap-4">
                              <Button
                                 variant="ghost"
                                 onClick={() => setShowQR(false)}
                                 className="flex-1 h-16 rounded-[2rem] font-black text-[10px] uppercase tracking-widest"
                              >
                                 Quitter
                              </Button>
                              <Button
                                 onClick={() => {
                                    const canvas = document.getElementById('share-qr-canvas') as HTMLCanvasElement;
                                    const link = document.createElement('a');
                                    link.href = canvas.toDataURL();
                                    link.download = `QR_PUBLIC_${selectedEquipment.reference}.png`;
                                    link.click();
                                 }}
                                 className="flex-1 h-16 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl"
                              >
                                 Télécharger
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
         )}
      </div>
   )
}
