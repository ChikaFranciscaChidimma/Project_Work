export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_id: number
          alert_message: string
          alert_type: string
          branch_id: number | null
          created_at: string | null
          is_read: boolean | null
          related_id: number | null
          related_table: string | null
        }
        Insert: {
          alert_id?: number
          alert_message: string
          alert_type: string
          branch_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          related_id?: number | null
          related_table?: string | null
        }
        Update: {
          alert_id?: number
          alert_message?: string
          alert_type?: string
          branch_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          related_id?: number | null
          related_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_id: number
          branch_id: number
          clock_in: string | null
          clock_out: string | null
          date: string
          duration: unknown | null
          notes: string | null
          status: string | null
          user_id: number
        }
        Insert: {
          attendance_id?: number
          branch_id: number
          clock_in?: string | null
          clock_out?: string | null
          date: string
          duration?: unknown | null
          notes?: string | null
          status?: string | null
          user_id: number
        }
        Update: {
          attendance_id?: number
          branch_id?: number
          clock_in?: string | null
          clock_out?: string | null
          date?: string
          duration?: unknown | null
          notes?: string | null
          status?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      branches: {
        Row: {
          branch_id: number
          branch_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          location: string
        }
        Insert: {
          branch_id?: number
          branch_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          location: string
        }
        Update: {
          branch_id?: number
          branch_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          location?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          branch_id: number
          inventory_id: number
          last_restocked: string | null
          product_id: number
          quantity: number
        }
        Insert: {
          branch_id: number
          inventory_id?: number
          last_restocked?: string | null
          product_id: number
          quantity?: number
        }
        Update: {
          branch_id?: number
          inventory_id?: number
          last_restocked?: string | null
          product_id?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_items: {
        Row: {
          item_id: number
          order_id: number
          product_id: number
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          item_id?: number
          order_id: number
          product_id: number
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          item_id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: number
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          notes: string | null
          order_id: number
          order_number: string
          order_status: string | null
          payment_method: string
          payment_status: string | null
          total_amount: number
          user_id: number
        }
        Insert: {
          branch_id: number
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          order_id?: number
          order_number: string
          order_status?: string | null
          payment_method: string
          payment_status?: string | null
          total_amount: number
          user_id: number
        }
        Update: {
          branch_id?: number
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          order_id?: number
          order_number?: string
          order_status?: string | null
          payment_method?: string
          payment_status?: string | null
          total_amount?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          min_stock_level: number | null
          name: string
          product_code: string
          product_id: number
          purchase_price: number
          selling_price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          min_stock_level?: number | null
          name: string
          product_code: string
          product_id?: number
          purchase_price: number
          selling_price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          min_stock_level?: number | null
          name?: string
          product_code?: string
          product_id?: number
          purchase_price?: number
          selling_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          branch_id: number | null
          created_at: string | null
          email: string
          full_name: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          role: string
          user_id: number
          username: string
        }
        Insert: {
          branch_id?: number | null
          created_at?: string | null
          email: string
          full_name: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          role: string
          user_id?: number
          username: string
        }
        Update: {
          branch_id?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          role?: string
          user_id?: number
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
