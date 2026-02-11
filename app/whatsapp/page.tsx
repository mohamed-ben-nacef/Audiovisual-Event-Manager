"use client"

import { useEffect, useState } from "react"
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Check, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter,
  ArrowUpRight,
  User,
  Activity,
  Smartphone,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { WhatsAppMessage } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, cn } from "@/lib/utils"

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  ENVOYE: { color: "text-slate-500", bg: "bg-slate-50", icon: Check, label: "Envoyé" },
  LIVRE: { color: "text-blue-500", bg: "bg-blue-50", icon: CheckCheck, label: "Livré" },
  LU: { color: "text-emerald-500", bg: "bg-emerald-50", icon: CheckCheck, label: "Lu" },
  ECHOUE: { color: "text-red-500", bg: "bg-red-50", icon: Clock, label: "Échoué" },
}

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await api.getWhatsAppHistory()
      setMessages(response.data?.messages || [])
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = messages.filter(m => 
    m.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.recipient_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message_content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full space-y-12 py-6">
      {/* Refined Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Smartphone className="h-3 w-3" />
              Communication & CRM
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Flux WhatsApp</h1>
           <p className="text-slate-500 font-medium max-w-lg">Automatisez vos notifications clients et coordonnez vos équipes via WhatsApp API.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all font-bold active:scale-95">
              <Send className="h-5 w-5 mr-3" />
              Diffuser un Message
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Messages List Feed */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
              <div className="relative group flex-1 w-full">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                    placeholder="Rechercher une conversation, un contact ou contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 border-none bg-transparent pl-12 shadow-none focus:ring-0 text-md font-medium placeholder:text-slate-300"
                 />
              </div>
           </div>

           {loading ? (
             <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse"></div>)}
             </div>
           ) : filteredMessages.length === 0 ? (
             <Card className="border-none shadow-sm rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200 p-24 text-center">
                <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-800">Aucun message</h3>
                <p className="text-slate-400 font-medium">Votre historique de messagerie est actuellement vide.</p>
             </Card>
           ) : (
             <div className="space-y-4">
                {filteredMessages.map((m) => {
                  const status = statusConfig[m.status] || statusConfig.ENVOYE
                  const StatusIcon = status.icon
                  return (
                    <Card key={m.id} className="group relative border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden">
                       <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                             <div className="flex gap-6 flex-1 min-w-0">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 group-hover:bg-emerald-600 flex items-center justify-center text-slate-300 group-hover:text-white shrink-0 shadow-sm transition-all duration-300">
                                   <User className="h-6 w-6" />
                                </div>
                                <div className="space-y-2 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">
                                        {m.recipient_name || m.recipient_phone}
                                      </h3>
                                      <Badge variant="outline" className="px-3 py-1 rounded-lg border-slate-100 text-slate-400 bg-slate-50 group-hover:text-emerald-600 transition-colors text-[9px] font-black uppercase tracking-widest">
                                        {m.message_type}
                                      </Badge>
                                   </div>
                                   <p className="text-slate-600 font-medium text-sm leading-relaxed line-clamp-2 pr-6">
                                      {m.message_content}
                                   </p>
                                   {m.event && (
                                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pt-2">
                                        <Activity className="h-3 w-3 text-emerald-500" />
                                        CONTEXTE: <span className="text-slate-900">{m.event.event_name}</span>
                                     </div>
                                   )}
                                </div>
                             </div>
                             
                             <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                                <div className={cn("inline-flex items-center px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm", status.bg, status.color)}>
                                   <StatusIcon className="h-3 w-3 mr-2" />
                                   {status.label}
                                </div>
                                <span className="text-[9px] font-black text-slate-300 whitespace-nowrap uppercase">
                                   {formatDateTime(m.sent_at)}
                                </span>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                  )
                })}
             </div>
           )}
        </div>

        {/* Sidebar Info Panels */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-white overflow-hidden group">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-slate-50">
                 <div className="space-y-1">
                    <CardTitle className="text-[11px] font-black tracking-[0.2em] uppercase text-emerald-600">Automations</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Workflows Actifs</CardDescription>
                 </div>
                 <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 rounded-lg">ON</Badge>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-3">
                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100 cursor-pointer">
                       <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Confirmation J-7</p>
                          <p className="text-xs text-slate-500 font-medium italic">Envoi automatique du récapitulatif client.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100 cursor-pointer">
                       <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Rappel Staff H-24</p>
                          <p className="text-xs text-slate-500 font-medium italic">Alerte convocation pour l'équipe technique.</p>
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest transition-all">
                    Gérer les Flux
                 </Button>
              </CardContent>
           </Card>

           <Card className="border border-slate-100 shadow-sm rounded-[3rem] bg-slate-50 overflow-hidden p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                    <MessageSquare className="h-5 w-5" />
                 </div>
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Bibliothèque Templates</h4>
              </div>
              <nav className="space-y-1">
                 {['Confirmation Location', 'Bon de Livraison', 'Fiche de Retour', 'Satisfaction Client'].map(t => (
                   <div key={t} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-emerald-50">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{t}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-200 group-hover:text-emerald-500" />
                   </div>
                 ))}
              </nav>
           </Card>
        </div>
      </div>
    </div>
  )
}
