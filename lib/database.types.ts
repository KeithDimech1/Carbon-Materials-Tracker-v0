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
          project_status_id?: string | null
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
      locations: {
        Row: {
          location_id: number
          project_id: number | null
          location_name: string
          description: string | null
          location_number: string | null
          latitude: number | null
          longitude: number | null
          location_type_id: string | null
        }
        Insert: {
          location_id?: number
          project_id?: number | null
          location_name: string
          description?: string | null
          location_number?: string | null
          latitude?: number | null
          longitude?: number | null
          location_type_id?: string | null
        }
        Update: {
          location_id?: number
          project_id?: number | null
          location_name?: string
          description?: string | null
          location_number?: string | null
          latitude?: number | null
          longitude?: number | null
          location_type_id?: string | null
        }
      }
      location_types: {
        Row: {
          id: string
          LocationType: string
        }
        Insert: {
          id?: string
          LocationType: string
        }
        Update: {
          id?: string
          LocationType?: string
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
      raw_deliveries: {
        Row: {
          id: string
          project_id: string
          contractor_name: string | null
          contractor_id: string | null
          delivery_date: string | null
          location_name: string | null
          location_id: string | null
          cost_code_name: string | null
          cost_code_id: string | null
          docket_number: string | null
          material_type_name: string | null
          material_type_id: string | null
          supplier_name: string | null
          supplier_id: string | null
          material_name: string | null
          material_id: string | null
          unit_name: string | null
          unit_id: string | null
          quantity: number | null
          total_cost: number | null
          material_description: string | null
          origin_postcode: string | null
          validation_errors: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          contractor_name?: string | null
          contractor_id?: string | null
          delivery_date?: string | null
          location_name?: string | null
          location_id?: string | null
          cost_code_name?: string | null
          cost_code_id?: string | null
          docket_number?: string | null
          material_type_name?: string | null
          material_type_id?: string | null
          supplier_name?: string | null
          supplier_id?: string | null
          material_name?: string | null
          material_id?: string | null
          unit_name?: string | null
          unit_id?: string | null
          quantity?: number | null
          total_cost?: number | null
          material_description?: string | null
          origin_postcode?: string | null
          validation_errors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          contractor_name?: string | null
          contractor_id?: string | null
          delivery_date?: string | null
          location_name?: string | null
          location_id?: string | null
          cost_code_name?: string | null
          cost_code_id?: string | null
          docket_number?: string | null
          material_type_name?: string | null
          material_type_id?: string | null
          supplier_name?: string | null
          supplier_id?: string | null
          material_name?: string | null
          material_id?: string | null
          unit_name?: string | null
          unit_id?: string | null
          quantity?: number | null
          total_cost?: number | null
          material_description?: string | null
          origin_postcode?: string | null
          validation_errors?: string[] | null
          updated_at?: string
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
