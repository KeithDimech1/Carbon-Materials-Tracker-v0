export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          project_id: number
          name: string
          Description: string | null
          latitude: number | null
          longitude: number | null
          start_date: string | null
          end_date: string | null
          principal_id: number | null
          project_number: string | null
          created_date: string | null
          project_status_id: number | null
        }
        Insert: {
          project_id?: number
          name: string
          Description?: string | null
          latitude?: number | null
          longitude?: number | null
          start_date?: string | null
          end_date?: string | null
          principal_id?: number | null
          project_number?: string | null
          created_date?: string | null
          project_status_id?: number | null
        }
        Update: {
          project_id?: number
          name?: string
          Description?: string | null
          latitude?: number | null
          longitude?: number | null
          start_date?: string | null
          end_date?: string | null
          principal_id?: number | null
          project_number?: string | null
          created_date?: string | null
          project_status_id?: number | null
        }
      }
      project_cost_codes: {
        Row: {
          cost_code_id: number
          project_id: number | null
          cost_code_name: string
          description: string | null
          cost_code_number: string | null
        }
        Insert: {
          cost_code_id?: number
          project_id?: number | null
          cost_code_name: string
          description?: string | null
          cost_code_number?: string | null
        }
        Update: {
          cost_code_id?: number
          project_id?: number | null
          cost_code_name?: string
          description?: string | null
          cost_code_number?: string | null
        }
      }
      design_packages: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          generic_material_id: string
          material_type: string
          unit: string
          emission_factor: number
          strength: string | null
          recycled_content: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_material_id: string
          material_type: string
          unit: string
          emission_factor: number
          strength?: string | null
          recycled_content?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_material_id?: string
          material_type?: string
          unit?: string
          emission_factor?: number
          strength?: string | null
          recycled_content?: number | null
          updated_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          project_id: string
          material_id: string
          supplier_id: string
          contractor_id: string
          cost_code_id: string | null
          location_id: string | null
          quantity: number
          delivery_date: string
          embodied_co2: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          material_id: string
          supplier_id: string
          contractor_id: string
          cost_code_id?: string | null
          location_id?: string | null
          quantity: number
          delivery_date: string
          embodied_co2: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          material_id?: string
          supplier_id?: string
          contractor_id?: string
          cost_code_id?: string | null
          location_id?: string | null
          quantity?: number
          delivery_date?: string
          embodied_co2?: number
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          updated_at?: string
        }
      }
      contractors: {
        Row: {
          id: string
          name: string
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          updated_at?: string
        }
      }
      cost_codes: {
        Row: {
          id: string
          project_id: string
          code: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          code: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          code?: string
          description?: string | null
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          coordinates: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          coordinates?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          coordinates?: string | null
          updated_at?: string
        }
      }
      project_statuses: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
