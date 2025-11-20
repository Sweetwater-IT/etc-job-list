// lib/supabase/types.ts
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
      etc_master_jobs: {
        Row: {
          id: number
          job_number: string
          bid_number: string | null
          job_location: string | null
          contractor: string | null
          rate: number | null
          fringe: number | null
          is_rated: boolean | null
          start_date: string | null // date → ISO string
          end_date: string | null   // date → ISO string
          type: string | null
          office: string | null
          pm: string | null
          job_status: string | null
          sign_status: string | null
          "4_type_3": number | null
          "6_type_3": number | null
          "8_type_3": number | null
          sq_post: number | null
          h_stand: number | null
          vp: number | null
          sharps: number | null
          y_b_lite: number | null
          r_b_lite: number | null
          w_b_lite: number | null
          tma: number | null
          c_lite: number | null
          speed_trailer: number | null
          arrow_board: number | null
          message_board: number | null
          uc_post: number | null
          seq_light: number | null
          remarks: string | null
          last_updated_by: string | null
          last_updated_at: string | null // timestamptz → ISO string
          created_at: string | null     // timestamptz → ISO string
        }
        Insert: {
          // same as Row but id is optional/auto-generated
          id?: number
          job_number: string
          bid_number?: string | null
          job_location?: string | null
          contractor?: string | null
          rate?: number | null
          fringe?: number | null
          is_rated?: boolean | null
          start_date?: string | null
          end_date?: string | null
          type?: string | null
          office?: string | null
          pm?: string | null
          job_status?: string | null
          sign_status?: string | null
          "4_type_3"?: number | null
          "6_type_3"?: number | null
          "8_type_3"?: number | null
          sq_post?: number | null
          h_stand?: number | null
          vp?: number | null
          sharps?: number | null
          y_b_lite?: number | null
          r_b_lite?: number | null
          w_b_lite?: number | null
          tma?: number | null
          c_lite?: number | null
          speed_trailer?: number | null
          arrow_board?: number | null
          message_board?: number | null
          uc_post?: number | null
          seq_light?: number | null
          remarks?: string | null
          last_updated_by?: string | null
          last_updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          // all fields optional for PATCH
          id?: number
          job_number?: string
          bid_number?: string | null
          job_location?: string | null
          contractor?: string | null
          rate?: number | null
          fringe?: number | null
          is_rated?: boolean | null
          start_date?: string | null
          end_date?: string | null
          type?: string | null
          office?: string | null
          pm?: string | null
          job_status?: string | null
          sign_status?: string | null
          "4_type_3"?: number | null
          "6_type_3"?: number | null
          "8_type_3"?: number | null
          sq_post?: number | null
          h_stand?: number | null
          vp?: number | null
          sharps?: number | null
          y_b_lite?: number | null
          r_b_lite?: number | null
          w_b_lite?: number | null
          tma?: number | null
          c_lite?: number | null
          speed_trailer?: number | null
          arrow_board?: number | null
          message_board?: number | null
          uc_post?: number | null
          seq_light?: number | null
          remarks?: string | null
          last_updated_by?: string | null
          last_updated_at?: string | null
          created_at?: string | null
        }
      }
    }
  }
}
