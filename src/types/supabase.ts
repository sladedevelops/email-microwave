export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          subject: string
          content: string
          from_email: string
          to_email: string
          status: 'PENDING' | 'SENT' | 'FAILED'
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          content: string
          from_email: string
          to_email: string
          status?: 'PENDING' | 'SENT' | 'FAILED'
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          content?: string
          from_email?: string
          to_email?: string
          status?: 'PENDING' | 'SENT' | 'FAILED'
          sent_at?: string | null
          created_at?: string
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