export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      crew_members: {
        Row: {
          active: boolean | null
          created_at: string | null
          crew_id: string | null
          hourly_rate: number | null
          id: string
          name: string
          role: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          crew_id?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          role: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          crew_id?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          active: boolean | null
          company_id: string | null
          created_at: string | null
          crew_name: string
          equipment_assigned: string[] | null
          id: string
          storm_event_id: string | null
          supervisor_id: string | null
          utility_contract_id: string | null
        }
        Insert: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          crew_name: string
          equipment_assigned?: string[] | null
          id?: string
          storm_event_id?: string | null
          supervisor_id?: string | null
          utility_contract_id?: string | null
        }
        Update: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          crew_name?: string
          equipment_assigned?: string[] | null
          id?: string
          storm_event_id?: string | null
          supervisor_id?: string | null
          utility_contract_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_storm_event_id_fkey"
            columns: ["storm_event_id"]
            isOneToOne: false
            referencedRelation: "storm_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_utility_contract_id_fkey"
            columns: ["utility_contract_id"]
            isOneToOne: false
            referencedRelation: "utility_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      exceptions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          flagged_by: string
          id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          time_entry_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          flagged_by: string
          id?: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          time_entry_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          flagged_by?: string
          id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          time_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exceptions_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      hours_breakdown: {
        Row: {
          breakdown_type: string
          created_at: string | null
          description: string | null
          end_time: string | null
          hours: number
          id: string
          member_id: string | null
          start_time: string | null
          time_entry_id: string | null
        }
        Insert: {
          breakdown_type: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          hours?: number
          id?: string
          member_id?: string | null
          start_time?: string | null
          time_entry_id?: string | null
        }
        Update: {
          breakdown_type?: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          hours?: number
          id?: string
          member_id?: string | null
          start_time?: string | null
          time_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hours_breakdown_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hours_breakdown_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      storm_events: {
        Row: {
          active: boolean | null
          actual_cost: number | null
          created_at: string | null
          end_date: string | null
          estimated_cost: number | null
          event_type: string
          id: string
          phase: string
          start_date: string
          status: string
          storm_name: string
          utility_contract_id: string | null
        }
        Insert: {
          active?: boolean | null
          actual_cost?: number | null
          created_at?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          event_type?: string
          id?: string
          phase?: string
          start_date: string
          status?: string
          storm_name: string
          utility_contract_id?: string | null
        }
        Update: {
          active?: boolean | null
          actual_cost?: number | null
          created_at?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          event_type?: string
          id?: string
          phase?: string
          start_date?: string
          status?: string
          storm_name?: string
          utility_contract_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storm_events_utility_contract_id_fkey"
            columns: ["utility_contract_id"]
            isOneToOne: false
            referencedRelation: "utility_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          comments: string | null
          created_at: string | null
          crew_id: string | null
          date: string
          end_time: string
          gps_locations: Json | null
          hours_overtime: number | null
          hours_regular: number | null
          id: string
          location: string | null
          member_id: string | null
          start_time: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          work_description: string | null
          work_package_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          crew_id?: string | null
          date: string
          end_time: string
          gps_locations?: Json | null
          hours_overtime?: number | null
          hours_regular?: number | null
          id?: string
          location?: string | null
          member_id?: string | null
          start_time: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          work_description?: string | null
          work_package_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          crew_id?: string | null
          date?: string
          end_time?: string
          gps_locations?: Json | null
          hours_overtime?: number | null
          hours_regular?: number | null
          id?: string
          location?: string | null
          member_id?: string | null
          start_time?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          work_description?: string | null
          work_package_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          role: string
          username: string
        }
        Insert: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          last_login?: string | null
          role: string
          username: string
        }
        Update: {
          active?: boolean | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_contracts: {
        Row: {
          active: boolean | null
          company_id: string | null
          contract_number: string
          created_at: string | null
          end_date: string | null
          id: string
          region: string
          start_date: string
          storm_event: string
          utility_name: string
        }
        Insert: {
          active?: boolean | null
          company_id?: string | null
          contract_number: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          region: string
          start_date: string
          storm_event: string
          utility_name: string
        }
        Update: {
          active?: boolean | null
          company_id?: string | null
          contract_number?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          region?: string
          start_date?: string
          storm_event?: string
          utility_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
