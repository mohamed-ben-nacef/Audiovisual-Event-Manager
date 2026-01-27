"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { WhatsAppMessage } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)

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

  const statusColors: Record<string, "default" | "success" | "warning" | "danger"> = {
    ENVOYE: "default",
    LIVRE: "success",
    LU: "success",
    ECHOUE: "danger",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-gray-600 mt-2">Gérez les messages WhatsApp</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Envoyer un message
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun message trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {message.recipient_name || message.recipient_phone}
                        </span>
                        <Badge variant="outline">{message.message_type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{message.message_content}</p>
                      {message.event && (
                        <p className="text-xs text-gray-500 mt-1">
                          Événement: {message.event.event_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={statusColors[message.status] || "default"}>
                        {message.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(message.sent_at)}
                      </p>
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
