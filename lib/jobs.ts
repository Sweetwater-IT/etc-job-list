const API_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

export async function getJobs() {
  const res = await fetch(`${API_URL}/api/jobs`, {
    next: { revalidate: 60 }, // optional caching
  })
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}

export async function addJob(job: any) {
  const res = await fetch(`${API_URL}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  })
  if (!res.ok) throw new Error('Failed to add job')
  return res.json()
}

export async function updateJob(id: number, updates: Partial<any>) {
  const res = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Failed to update job')
  return res.json()
}
