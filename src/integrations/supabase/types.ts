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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          description: string | null
          edit_type: string
          edited_by: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          edit_type: string
          edited_by: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          edit_type?: string
          edited_by?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      product_groups: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      table_items: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          product_id: string
          product_name: string
          product_price: number | null
          quantity: number
          table_id: number
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          product_name: string
          product_price?: number | null
          quantity?: number
          table_id: number
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          product_name?: string
          product_price?: number | null
          quantity?: number
          table_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "table_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_items_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_operations: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          operation_type: string
          table_id: number | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation_type: string
          table_id?: number | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation_type?: string
          table_id?: number | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_operations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_operations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          created_at: string | null
          id: number
          is_occupied: boolean | null
          last_modified_by: string | null
          name: string
          opened_at: string | null
          opened_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: number
          is_occupied?: boolean | null
          last_modified_by?: string | null
          name: string
          opened_at?: string | null
          opened_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_occupied?: boolean | null
          last_modified_by?: string | null
          name?: string
          opened_at?: string | null
          opened_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_audit_logs: {
        Row: {
          created_at: string | null
          description: string | null
          edit_type: string
          edited_by: string
          id: string
          new_value: Json | null
          old_value: Json | null
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edit_type: string
          edited_by: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edit_type?: string
          edited_by?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_audit_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          closed_by: string | null
          completed_at: string | null
          id: string
          items: Json
          items_added_by: Json | null
          opened_by: string | null
          table_id: number
          table_name: string
          total_amount: number
        }
        Insert: {
          closed_by?: string | null
          completed_at?: string | null
          id?: string
          items: Json
          items_added_by?: Json | null
          opened_by?: string | null
          table_id: number
          table_name: string
          total_amount: number
        }
        Update: {
          closed_by?: string | null
          completed_at?: string | null
          id?: string
          items?: Json
          items_added_by?: Json | null
          opened_by?: string | null
          table_id?: number
          table_name?: string
          total_amount?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: number
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_with_password: {
        Args: { password: string; username: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_password: {
        Args: { new_password: string; user_id: string }
        Returns: boolean
      }
      verify_admin_password: {
        Args: { pw: string }
        Returns: boolean
      }
      verify_user_password: {
        Args: { pw: string; uname: string }
        Returns: {
          is_valid: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
