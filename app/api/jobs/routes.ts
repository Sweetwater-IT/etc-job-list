import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET – fetch all jobs
export async function GET() {
  const { data, error } = await supabase
    .from('etc_master_jobs')
    .select('*')
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST – add new job
export async function POST(request: Request) {
  const job = await request.json()

  const { data, error } = await supabase
    .from('etc_master_jobs')
    .insert(job)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
