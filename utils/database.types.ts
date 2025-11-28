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
      cards: {
        Row: {
          id: string
          text: string
          author: 'ziji' | 'xu'
          x: number
          y: number
          rotation: number
          timestamp: number
          date_key: string
          width: number | null
          height: number | null
          reply_to: string | null
          emoji_reactions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          author: 'ziji' | 'xu'
          x: number
          y: number
          rotation: number
          timestamp: number
          date_key: string
          width?: number | null
          height?: number | null
          reply_to?: string | null
          emoji_reactions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          author?: 'ziji' | 'xu'
          x?: number
          y?: number
          rotation?: number
          timestamp?: number
          date_key?: string
          width?: number | null
          height?: number | null
          reply_to?: string | null
          emoji_reactions?: Json | null
          created_at?: string
        }
      }
    }
  }
}
