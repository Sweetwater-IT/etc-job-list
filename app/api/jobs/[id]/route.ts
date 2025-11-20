import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PATCH – update job
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   // ← this is the fix
) {
  const { id } = await params   // ← await the promise
  const updates = await request.json()

  const { data, error } = await supabase
    .from('etc_master_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE – delete job
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   // ← same fix here
) {
  const { id } = await params   // ← await it

  const { error } = await supabase
    .from('etc_master_jobs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
