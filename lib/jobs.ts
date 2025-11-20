// lib/jobs.ts
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/etc-job-types'   // ← ONLY CHANGE: correct path!

type DbJob = Database['public']['Tables']['etc_master_jobs']['Row']

// Frontend shape (camelCase, nice names)
export type Job = {
  id: number
  jobNumber: string
  bidNumber: string | null
  jobName: string
  location: string | null
  contractor: string | null
  projectManager: string
  branch: string
  startDate: string
  endDate: string | null
  status: 'on-going' | 'complete' | 'pending start'
  signStatus?: string
  equipment: Record<string, number>
  signList?: Array<{ code: string; description: string; quantity: number }>
}

// Convert raw DB row → nice frontend object
const mapDbToJob = (db: DbJob): Job => ({
  id: db.id,
  jobNumber: db.job_number,
  bidNumber: db.bid_number,
  jobName: db.job_location || db.job_number,
  location: db.job_location,
  contractor: db.contractor || '',
  projectManager: (db.pm || 'NELSON').toUpperCase(),
  branch: (db.office || 'Hatfield').toLowerCase(),
  startDate: db.start_date || '',
  endDate: db.end_date || null,
  status:
    db.job_status === 'ONGOING' ? 'on-going' :
    db.job_status === 'COMPLETE' ? 'complete' :
    'pending start',
  signStatus: db.sign_status || undefined,
  equipment: {
    "4' TYPE III": db["4_type_3"] ?? 0,
    "6' TYPE III": db["6_type_3"] ?? 0,
    "8' TYPE III": db["8_type_3"] ?? 0,
    'SQ POST': db.sq_post ?? 0,
    'H STAND': db.h_stand ?? 0,
    VP: db.vp ?? 0,
    SHARPS: db.sharps ?? 0,
    'Y/B LITE': db.y_b_lite ?? 0,
    'R/B LITE': db.r_b_lite ?? 0,
    'W/B LITE': db.w_b_lite ?? 0,
    TMA: db.tma ?? 0,
    'C LITE': db.c_lite ?? 0,
    'S. TRL': db.speed_trailer ?? 0,
    'A. BOARD': db.arrow_board ?? 0,
    'M. BOARD': db.message_board ?? 0,
    'UC POST': db.uc_post ?? 0,
    'SEQ LIGHT': db.seq_light ?? 0,
  },
  signList: [], // fill later if you add a signs table
})

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('etc_master_jobs')
    .select('*')
    .order('start_date', { ascending: false, nullsLast: true } as any)

  if (error) {
    console.error('Supabase error:', error)
    throw error
  }

  return data.map(mapDbToJob)
}
