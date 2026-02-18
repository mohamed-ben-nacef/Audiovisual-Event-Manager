import axios, { AxiosError, AxiosInstance } from "axios"
import { AuthTokens, User } from "@/types"

const API_URL = "https://events-se67.onrender.com/api"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const tokens = this.getTokens()
        if (tokens?.access_token) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`
          console.log(`API: Adding token to ${config.method?.toUpperCase()} ${config.url}`)
        } else {
          console.warn(`API: No token found for ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const tokens = this.getTokens()
            if (tokens?.refresh_token) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: tokens.refresh_token,
              })

              const newTokens = response.data.data.tokens
              this.setTokens(newTokens)

              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Only clear tokens, don't redirect automatically
            // Let the component handle the redirect
            this.clearTokens()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null
    const tokens = localStorage.getItem("auth_tokens")
    return tokens ? JSON.parse(tokens) : null
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_tokens", JSON.stringify(tokens))
    }
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_tokens")
      localStorage.removeItem("user")
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", { email, password })
    return response.data
  }

  async register(data: {
    email: string
    password: string
    full_name: string
    phone: string
    role?: string
  }) {
    const response = await this.client.post("/auth/register", data)
    return response.data
  }

  async logout() {
    const response = await this.client.post("/auth/logout")
    this.clearTokens()
    return response.data
  }

  async getMe() {
    const response = await this.client.get("/auth/me")
    return response.data
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post("/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  }

  // Events endpoints
  async getEvents(params?: {
    status?: string
    category?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get("/events", { params })
    return response.data
  }

  async getEvent(id: string) {
    const response = await this.client.get(`/events/${id}`)
    return response.data
  }

  async createEvent(data: any) {
    const response = await this.client.post("/events", data)
    return response.data
  }

  async updateEvent(id: string, data: any) {
    const response = await this.client.put(`/events/${id}`, data)
    return response.data
  }

  async deleteEvent(id: string) {
    const response = await this.client.delete(`/events/${id}`)
    return response.data
  }

  async getEventEquipment(eventId: string) {
    const response = await this.client.get(`/events/${eventId}/equipment`)
    return response.data
  }

  async addEventEquipment(eventId: string, data: any) {
    const response = await this.client.post(`/events/${eventId}/equipment`, data)
    return response.data
  }

  async updateEquipmentReservation(eventId: string, reservationId: string, data: any) {
    const response = await this.client.put(`/events/${eventId}/equipment/${reservationId}`, data)
    return response.data
  }

  async removeEventEquipment(eventId: string, reservationId: string) {
    const response = await this.client.delete(`/events/${eventId}/equipment/${reservationId}`)
    return response.data
  }

  async assignTechnician(eventId: string, data: { technician_id: string; role?: string }) {
    const response = await this.client.post(`/events/${eventId}/technicians`, data)
    return response.data
  }

  async removeTechnician(eventId: string, assignmentId: string) {
    const response = await this.client.delete(`/events/${eventId}/technicians/${assignmentId}`)
    return response.data
  }

  async getEventDocuments(eventId: string, type: string) {
    const response = await this.client.get(`/events/${eventId}/documents/${type}`, {
      responseType: "blob",
    })
    return response.data
  }

  // Equipment endpoints
  async getEquipment(params?: {
    search?: string
    category_id?: string
    subcategory_id?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get("/equipment", { params })
    return response.data
  }

  async getEquipmentById(id: string) {
    const response = await this.client.get(`/equipment/${id}`)
    return response.data
  }

  async createEquipment(data: any) {
    const response = await this.client.post("/equipment", data)
    return response.data
  }

  async updateEquipment(id: string, data: any) {
    const response = await this.client.put(`/equipment/${id}`, data)
    return response.data
  }

  async deleteEquipment(id: string) {
    const response = await this.client.delete(`/equipment/${id}`)
    return response.data
  }

  async getEquipmentAvailability(id: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/equipment/${id}/availability`, {
      params: { start_date: startDate, end_date: endDate },
    })
    return response.data
  }

  async getEquipmentHistory(id: string) {
    const response = await this.client.get(`/equipment/${id}/history`)
    return response.data
  }

  async scanQRCode(qrData: string) {
    const response = await this.client.post("/equipment/scan-qr", { qr_data: qrData })
    return response.data
  }

  async bulkQRExport(equipmentIds: string[]) {
    const response = await this.client.post("/equipment/bulk-qr-export", {
      equipment_ids: equipmentIds,
    })
    return response.data
  }

  // Categories endpoints
  async getCategories(includeSubcategories: boolean = true) {
    const response = await this.client.get("/categories", {
      params: { includeSubcategories },
    })
    return response.data
  }

  async getCategory(id: string) {
    const response = await this.client.get(`/categories/${id}`)
    return response.data
  }

  async createCategory(data: any) {
    const response = await this.client.post("/categories", data)
    return response.data
  }

  async updateCategory(id: string, data: any) {
    const response = await this.client.put(`/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: string) {
    const response = await this.client.delete(`/categories/${id}`)
    return response.data
  }

  // Subcategories
  async createSubcategory(data: any) {
    const response = await this.client.post("/subcategories", data)
    return response.data
  }

  async updateSubcategory(id: string, data: any) {
    const response = await this.client.put(`/subcategories/${id}`, data)
    return response.data
  }

  async deleteSubcategory(id: string) {
    const response = await this.client.delete(`/subcategories/${id}`)
    return response.data
  }

  // Users endpoints
  async getUsers(params?: { role?: string | string[]; is_active?: boolean; page?: number; limit?: number }) {
    const response = await this.client.get("/users", { params })
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async createUser(data: any) {
    const response = await this.client.post("/users", data)
    return response.data
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`)
    return response.data
  }

  // Maintenance endpoints
  async getMaintenances(params?: {
    equipment_id?: string
    technician_id?: string
    status?: string
    priority?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get("/maintenances", { params })
    return response.data
  }

  async getMaintenance(id: string) {
    const response = await this.client.get(`/maintenances/${id}`)
    return response.data
  }

  async createMaintenance(data: any) {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    const response = await this.client.post("/maintenances", data, config)
    return response.data
  }

  async updateMaintenance(id: string, data: any) {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    const response = await this.client.put(`/maintenances/${id}`, data, config)
    return response.data
  }

  async completeMaintenance(id: string, data: any) {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    const response = await this.client.post(`/maintenances/${id}/complete`, data, config)
    return response.data
  }

  async addMaintenanceLog(id: string, data: any) {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    const response = await this.client.post(`/maintenances/${id}/logs`, data, config)
    return response.data
  }

  // Vehicles endpoints
  async getVehicles(params?: { status?: string; type?: string }) {
    const response = await this.client.get("/vehicles", { params })
    return response.data
  }

  async getVehicle(id: string) {
    const response = await this.client.get(`/vehicles/${id}`)
    return response.data
  }

  async createVehicle(data: any) {
    const response = await this.client.post("/vehicles", data)
    return response.data
  }

  async updateVehicle(id: string, data: any) {
    const response = await this.client.put(`/vehicles/${id}`, data)
    return response.data
  }

  async deleteVehicle(id: string) {
    const response = await this.client.delete(`/vehicles/${id}`)
    return response.data
  }

  // Transport endpoints
  async getTransports(params?: { event_id?: string; vehicle_id?: string; status?: string }) {
    const response = await this.client.get("/transports", { params })
    return response.data
  }

  async getTransport(id: string) {
    const response = await this.client.get(`/transports/${id}`)
    return response.data
  }

  async createTransport(data: any) {
    const response = await this.client.post("/transports", data)
    return response.data
  }

  async updateTransport(id: string, data: any) {
    const response = await this.client.put(`/transports/${id}`, data)
    return response.data
  }

  async updateTransportStatus(id: string, status: string) {
    const response = await this.client.put(`/transports/${id}/status`, { status })
    return response.data
  }

  // WhatsApp endpoints
  async sendWhatsAppMessage(data: any) {
    const response = await this.client.post("/whatsapp-messages/send", data)
    return response.data
  }

  async sendEventInvitation(eventId: string, data?: any) {
    const response = await this.client.post(`/whatsapp-messages/event-invitation`, {
      event_id: eventId,
      ...data,
    })
    return response.data
  }

  async getWhatsAppHistory(params?: {
    event_id?: string
    recipient_phone?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get("/whatsapp-messages", { params })
    return response.data
  }

  // Activity Logs endpoints
  async getActivityLogs(params?: {
    user_id?: string
    action?: string
    entity_type?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get("/activity-logs", { params })
    return response.data
  }
}

export const api = new ApiClient()
