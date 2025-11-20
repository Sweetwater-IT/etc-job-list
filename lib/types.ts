// lib/types.ts
export type Job = {
  id: number
  job_number: string
  bid_number: string | null
  job_location: string | null
  contractor: string | null
  rate: number | null
  fringe: number | null
  is_rated: boolean
  start_date: string | null
  end_date: string | null
  type: 'Public' | 'Private'
  office: string
  pm: string | null
  job_status: string
  sign_status: string | null
  "4_type_3": number
  "6_type_3": number
  "8_type_3": number
  sq_post: number
  h_stand: number
  vp: number
  sharps: number
  y_b_lite: number
  r_b_lite: number
  w_b_lite: number
  tma: number
  c_lite: number
  speed_trailer: number
  arrow_board: number
  message_board: number
  uc_post: number
  seq_light: number
  remarks: string | null
  last_updated_by: string | null
  created_at: string
  last_updated_at: string
}
