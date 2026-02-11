// User Types
export type UserRole = "ADMIN" | "MAINTENANCE" | "TECHNICIEN"

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
  profile_picture?: string
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    tokens: AuthTokens
  }
}

// Category Types
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  subcategories?: Subcategory[]
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Equipment Types
export type EquipmentStatus = "DISPONIBLE" | "EN_LOCATION" | "EN_MAINTENANCE" | "MANQUANT"

export interface Equipment {
  id: string
  name: string
  reference: string
  category_id: string
  subcategory_id?: string
  category?: Category
  subcategory?: Subcategory
  brand?: string
  model?: string
  description?: string
  technical_specs?: string
  quantity_total: number
  quantity_available: number
  purchase_price?: number
  daily_rental_price?: number
  purchase_date?: string
  warranty_end_date?: string
  supplier?: string
  qr_code_url?: string
  photos?: string[]
  manual_url?: string
  weight_kg?: number
  status?: EquipmentStatus
  created_at: string
  updated_at: string
}

export interface EquipmentStatusHistory {
  id: string
  equipment_id: string
  equipment?: Equipment
  status: EquipmentStatus
  quantity: number
  related_event_id?: string
  maintenance_id?: string
  notes?: string
  changed_by?: string
  changed_at: string
}

// Event Types
export type EventCategory = "SON" | "VIDEO" | "LUMIERE" | "MIXTE"
export type EventStatus = "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE"

export interface Event {
  id: string
  event_name: string
  client_name: string
  contact_person: string
  phone: string
  email?: string
  address: string
  installation_date: string
  event_date: string
  dismantling_date: string
  category: EventCategory
  status: EventStatus
  notes?: string
  budget?: number
  participant_count?: number
  event_type?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventEquipment {
  id: string
  event_id: string
  equipment_id: string
  event?: Event
  equipment?: Equipment
  quantity_reserved: number
  quantity_returned: number
  status: "RESERVE" | "LIVRE" | "RETOURNE"
  notes?: string
  created_at: string
}

export interface EventTechnician {
  id: string
  event_id: string
  technician_id: string
  event?: Event
  technician?: User
  role?: string
  created_at: string
}

// Maintenance Types
export type MaintenancePriority = "BASSE" | "MOYENNE" | "HAUTE"
export type MaintenanceStatus = "EN_ATTENTE" | "EN_COURS" | "TERMINE"

export interface Maintenance {
  id: string
  equipment_id: string
  equipment?: Equipment
  problem_description: string
  technician_id?: string
  technician?: User
  priority: MaintenancePriority
  start_date: string
  expected_end_date?: string
  actual_end_date?: string
  cost?: number
  status: MaintenanceStatus
  solution_description?: string
  photos?: string[]
  logs?: MaintenanceLog[]
  created_at: string
  updated_at: string
}

export interface MaintenanceLog {
  id: string
  maintenance_id: string
  user_id: string
  user?: User
  content: string
  photos?: string[]
  type: 'COMMENT' | 'STATUS_CHANGE'
  created_at: string
  updated_at: string
}

// Vehicle Types
export type VehicleType = "Camion" | "Utilitaire" | "Voiture"
export type VehicleStatus = "DISPONIBLE" | "EN_SERVICE" | "EN_MAINTENANCE"

export interface Vehicle {
  id: string
  registration_number: string
  type: VehicleType
  brand?: string
  model?: string
  load_capacity_kg?: number
  cargo_dimensions?: string
  photo_url?: string
  insurance_expiry?: string
  technical_inspection_expiry?: string
  fuel_type?: string
  current_mileage?: number
  status: VehicleStatus
  created_at: string
  updated_at: string
}

export type TransportStatus = "PLANIFIE" | "EN_ROUTE" | "LIVRE" | "RETOUR" | "TERMINE"

export interface Transport {
  id: string
  event_id: string
  vehicle_id: string
  driver_id?: string
  event?: Event
  vehicle?: Vehicle
  driver?: User
  departure_address: string
  arrival_address: string
  departure_date: string
  return_date?: string
  departure_mileage?: number
  arrival_mileage?: number
  fuel_cost?: number
  total_weight_kg?: number
  status: TransportStatus
  incidents?: string
  notes?: string
  created_at: string
  updated_at: string
}

// WhatsApp Types
export type WhatsAppMessageType = "INVITATION" | "RAPPEL" | "NOTIFICATION" | "AUTRE"
export type WhatsAppMessageStatus = "ENVOYE" | "LIVRE" | "LU" | "ECHOUE"

export interface WhatsAppMessage {
  id: string
  recipient_phone: string
  recipient_name?: string
  message_content: string
  message_type: WhatsAppMessageType
  event_id?: string
  event?: Event
  status: WhatsAppMessageStatus
  sent_by: string
  sent_at: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  user_id: string
  user?: User
  action: string
  entity_type: string
  entity_id?: string
  description?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
  phone: string
  role?: UserRole
}

export interface EventForm {
  event_name: string
  client_name: string
  contact_person: string
  phone: string
  email?: string
  address: string
  installation_date: string
  event_date: string
  dismantling_date: string
  category: EventCategory
  notes?: string
  budget?: number
  participant_count?: number
  event_type?: string
}

export interface EquipmentForm {
  name: string
  category_id: string
  subcategory_id?: string
  brand?: string
  model?: string
  description?: string
  technical_specs?: string
  quantity_total: number
  purchase_price?: number
  daily_rental_price?: number
  purchase_date?: string
  warranty_end_date?: string
  supplier?: string
  weight_kg?: number
}
