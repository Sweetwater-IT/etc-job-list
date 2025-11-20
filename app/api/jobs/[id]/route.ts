export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    const updates = await request.json()

    const { data, error } = await supabase
      .from('etc_master_jobs')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
  const { error } = await supabase
    .from('etc_master_jobs')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
