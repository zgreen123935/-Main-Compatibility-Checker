export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      training_data: {
        Row: {
          id: string
          created_at: string
          image_hash: string
          image_url: string
          user_verified_connections: Json
          jumper_connections: Json
          ai_detected_connections: Json
          system_type: string
          thermostat_brand: string | null
          thermostat_model: string | null
          image_quality: string
          user_feedback: string | null
          is_complete: boolean
          correction_type: string | null
          confidence_score: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          image_hash: string
          image_url: string
          user_verified_connections: Json
          jumper_connections?: Json
          ai_detected_connections: Json
          system_type: string
          thermostat_brand?: string | null
          thermostat_model?: string | null
          image_quality: string
          user_feedback?: string | null
          is_complete: boolean
          correction_type?: string | null
          confidence_score?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          image_hash?: string
          image_url?: string
          user_verified_connections?: Json
          jumper_connections?: Json
          ai_detected_connections?: Json
          system_type?: string
          thermostat_brand?: string | null
          thermostat_model?: string | null
          image_quality?: string
          user_feedback?: string | null
          is_complete?: boolean
          correction_type?: string | null
          confidence_score?: number | null
          metadata?: Json | null
        }
      }
      similar_configurations: {
        Row: {
          id: string
          created_at: string
          configuration_hash: string
          terminals: string[]
          system_type: string
          training_data_ids: string[]
          frequency: number
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          configuration_hash: string
          terminals: string[]
          system_type: string
          training_data_ids: string[]
          frequency: number
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          configuration_hash?: string
          terminals?: string[]
          system_type?: string
          training_data_ids?: string[]
          frequency?: number
          metadata?: Json | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
