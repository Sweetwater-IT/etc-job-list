export interface Equipment {
  '4\' TYPE III': number
  '6\' TYPE III': number
  '8\' TYPE III': number
  'SQ POST': number
  'H STAND': number
  'VP': number
  'SHARPS': number
  'Y/B LITE': number
  'R/B LITE': number
  'W/B LITE': number
  'TMA': number
  'C LITE': number
  'S. TRL': number
  'A. BOARD': number
  'M. BOARD': number
  'UC POST': number
  'SEQ LIGHT': number
}

export interface SignItem {
  code: string
  description: string
  quantity: number
}

export interface Job {
  id: string
  jobName: string
  jobNumber: string
  bidNumber: string
  location: string
  contractor: string
  startDate: string
  endDate: string
  status: 'on-going' | 'complete' | 'pending start'
  projectManager: string
  branch: string
  equipment: Equipment
  signStatus?: 'complete' | 'in process' | 'not received' | 'received' | 'not in process'
  signList?: SignItem[]
}

function generateRandomEquipment(): Equipment {
  return {
    '4\' TYPE III': Math.floor(Math.random() * 20),
    '6\' TYPE III': Math.floor(Math.random() * 15),
    '8\' TYPE III': Math.floor(Math.random() * 10),
    'SQ POST': Math.floor(Math.random() * 50),
    'H STAND': Math.floor(Math.random() * 30),
    'VP': Math.floor(Math.random() * 25),
    'SHARPS': Math.floor(Math.random() * 40),
    'Y/B LITE': Math.floor(Math.random() * 12),
    'R/B LITE': Math.floor(Math.random() * 12),
    'W/B LITE': Math.floor(Math.random() * 12),
    'TMA': Math.floor(Math.random() * 3),
    'C LITE': Math.floor(Math.random() * 8),
    'S. TRL': Math.floor(Math.random() * 2),
    'A. BOARD': Math.floor(Math.random() * 3),
    'M. BOARD': Math.floor(Math.random() * 2),
    'UC POST': Math.floor(Math.random() * 35),
    'SEQ LIGHT': Math.floor(Math.random() * 15),
  }
}

function generateRandomSignList(): SignItem[] {
  const signs = [
    { code: 'W20-2', description: 'Road Closed' },
    { code: 'R1-1', description: 'Stop Sign' },
    { code: 'W1-1', description: 'Turn' },
    { code: 'W3-1', description: 'Stop Ahead' },
    { code: 'W20-1', description: 'Road Work Ahead' },
    { code: 'W21-1', description: 'Detour' },
    { code: 'W4-2', description: 'Lane Ends' },
    { code: 'R2-1', description: 'Yield' },
    { code: 'W11-1', description: 'Bicycle Warning' },
    { code: 'W20-7', description: 'Flagger Ahead' },
  ]
  
  const numSigns = Math.floor(Math.random() * 5) + 3
  const selectedSigns: SignItem[] = []
  
  for (let i = 0; i < numSigns; i++) {
    const sign = signs[Math.floor(Math.random() * signs.length)]
    const existing = selectedSigns.find(s => s.code === sign.code)
    if (existing) {
      existing.quantity += Math.floor(Math.random() * 3) + 1
    } else {
      selectedSigns.push({
        ...sign,
        quantity: Math.floor(Math.random() * 4) + 1
      })
    }
  }
  
  return selectedSigns
}

export function generateDummyJobs(count: number): Job[] {
  const locations = [
    'Highway 101 - Mile 45',
    'Main St & 5th Ave',
    'Interstate 5 - Exit 23',
    'Broadway & Oak St',
    'Route 66 - Mile 120',
    'Pacific Coast Hwy',
    'Downtown District',
    'Airport Access Road',
    'Harbor Blvd',
    'Industrial Park Entrance'
  ]

  const contractors = [
    'SafeZone Traffic Control',
    'RoadGuard Services',
    'Metro Traffic Solutions',
    'Coastal Traffic Management',
    'Highway Safety Corp',
    'Urban Traffic Control',
    'Premier Flagging Services',
    'Summit Traffic Safety',
    'Pacific Traffic Control',
    'Elite Road Services'
  ]

  const statuses: ('on-going' | 'complete' | 'pending start')[] = ['on-going', 'complete', 'pending start']
  
  const signStatuses: ('complete' | 'in process' | 'not received' | 'received' | 'not in process')[] = [
    'complete', 'in process', 'not received', 'received', 'not in process'
  ]
  
  const projectManagers = ['john nelson', 'larry long', 'jim redden', 'richard gresh']
  const branches = ['hatfield', 'turbotville', 'bedford']

  const jobs: Job[] = []
  
  const today = new Date()
  
  for (let i = 0; i < count; i++) {
    // Generate start dates ranging from 60 days ago to 60 days in the future
    const daysOffset = Math.floor(Math.random() * 120) - 60
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + daysOffset)
    
    // Job duration between 3 and 30 days
    const duration = Math.floor(Math.random() * 28) + 3
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration)

    // Determine status based on dates
    let status: 'on-going' | 'complete' | 'pending start'
    if (startDate > today) {
      status = 'pending start'
    } else if (endDate < today) {
      status = 'complete'
    } else {
      status = 'on-going'
    }

    jobs.push({
      id: `job-${i + 1}`,
      jobName: `TTC Job ${i + 1}`,
      jobNumber: `JOB-${(i + 1).toString().padStart(4, '0')}`,
      bidNumber: `BID-${(i + 1).toString().padStart(4, '0')}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      contractor: contractors[Math.floor(Math.random() * contractors.length)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: status,
      projectManager: projectManagers[Math.floor(Math.random() * projectManagers.length)],
      branch: branches[Math.floor(Math.random() * branches.length)],
      equipment: generateRandomEquipment(),
      signStatus: status === 'pending start' 
        ? signStatuses[Math.floor(Math.random() * signStatuses.length)]
        : undefined,
      signList: status === 'on-going' || status === 'complete' 
        ? generateRandomSignList()
        : undefined,
    })
  }

  return jobs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
}
