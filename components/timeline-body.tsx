'use client'

import { useState } from 'react'
import JobDetailDialog from './job-detail-dialog'
import JobTooltip from './job-tooltip'
import type { Job } from '@/lib/jobs'
import { parseLocalDate } from '@/lib/date-utils'

interface TimelineBodyProps {
  jobs: Job[]
  viewType: ViewType
  startDate: Date
}

type ViewType = 'week' | 'month' | 'year'

export default function TimelineBody({ jobs, viewType, startDate }: TimelineBodyProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getBarPosition = (job: Job) => {
    if (!job.startDate) return { left: '0%', width: '10%' }
  
    const jobStart = parseLocalDate(job.startDate)!
    const jobEnd = job.endDate ? parseLocalDate(job.endDate) : null
  
    const msPerDay = 24 * 60 * 60 * 1000
    let left = '0%'
    let width = '10%'  // minimum visible
  
    if (viewType === 'week') {
      // ---- FORCE SUNDAY AS DAY 0 (this is the key fix) ----
      const weekStart = new Date(startDate)
      weekStart.setHours(0, 0, 0, 0)
      const dayOfWeek = weekStart.getDay()
      weekStart.setDate(weekStart.getDate() - dayOfWeek)  // ← NOW Sunday
    
      const msPerDay = 24 * 60 * 60 * 1000
    
      const jobStartMs = jobStart.getTime()
      const jobEndMs = jobEnd ? jobEnd.getTime() : jobStartMs + msPerDay * 365
    
      // Use the CORRECT weekStart (Sunday), not the original startDate
      let startDay = Math.floor((jobStartMs - weekStart.getTime()) / msPerDay)
      let endDay = Math.floor((jobEndMs - weekStart.getTime()) / msPerDay)
    
      // Clamp to visible week
      startDay = Math.max(0, Math.min(6, startDay))
      endDay = Math.max(startDay, Math.min(6, endDay))
    
      const visibleDays = endDay - startDay + 1
    
      left = `${(startDay / 7) * 100}%`
      width = `${Math.max((visibleDays / 7) * 100, 12)}%`
    }
    else if (viewType === 'month') {
      const viewYear = startDate.getFullYear()
      const viewMonth = startDate.getMonth()
    
      const monthStart = new Date(viewYear, viewMonth, 1)  // local midnight
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    
      const msPerDay = 24 * 60 * 60 * 1000
    
      const jobStartMs = jobStart.getTime()               // ← safe because parseLocalDate
      const jobEndMs = jobEnd ? jobEnd.getTime() : Infinity
    
      const monthStartMs = monthStart.getTime()
      const monthEndMs = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999).getTime()
    
      // Hide if no overlap (should already be filtered, but safe)
      if (jobStartMs > monthEndMs || jobEndMs < monthStartMs) {
        return { left: '0%', width: '0%' }
      }
    
      let startDay = Math.ceil((jobStartMs - monthStartMs) / msPerDay)
      let endDay = jobEnd
        ? Math.floor((jobEndMs - monthStartMs) / msPerDay)
        : daysInMonth - 1
    
      startDay = Math.max(0, startDay)
      endDay = Math.min(daysInMonth - 1, endDay)
    
      const visibleDays = endDay - startDay + 1
    
      if (visibleDays > 0) {
        left = `${startDay * 48}px`
        width = `${Math.max(visibleDays * 48, 60)}px`
      }
    }
    else if (viewType === 'year') {
      const year = startDate.getFullYear()
      const startMonth = jobStart.getFullYear() === year ? jobStart.getMonth() : 0
      const endMonth = jobEnd && jobEnd.getFullYear() === year ? jobEnd.getMonth() : 11
  
      left = `${(startMonth / 12) * 100}%`
      width = `${Math.max((endMonth - startMonth + 1) / 12 * 100, 8)}%`
    }
  
    return { left, width }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-going':
        return 'bg-green-50 border border-green-200'
      case 'complete':
        return 'bg-red-50 border border-red-200'
      case 'pending start':
        return 'bg-gray-100 border border-gray-300'
      default:
        return 'bg-gray-100 border border-gray-300'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'on-going':
        return 'text-green-700'
      case 'complete':
        return 'text-red-700'
      case 'pending start':
        return 'text-gray-800'
      default:
        return 'text-gray-800'
    }
  }

  const renderTimelineGrid = () => {
    if (viewType === 'week') {
      return Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 border-r border-border last:border-r-0" />
      ))
    } else if (viewType === 'month') {
      const days = getDaysInMonth(startDate)
      return Array.from({ length: days }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-12 border-r border-border last:border-r-0" />
      ))
    } else {
      return Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex-1 border-r border-border last:border-r-0" />
      ))
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsDialogOpen(true)
  }

  const handleJobMouseEnter = (job: Job, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
    setHoveredJob(job)
  }

  const handleJobMouseLeave = () => {
    setHoveredJob(null)
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-background">
        <div className="relative">
          {jobs.map((job) => {
            const { left, width } = getBarPosition(job)
            return (
              <div key={job.id} className="relative border-b border-border" style={{ height: '28px' }}>
                <div className="absolute inset-0 flex">
                  {renderTimelineGrid()}
                </div>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-5 ${getStatusColor(job.status)} rounded flex items-center px-2 text-[10px] font-medium ${getStatusTextColor(job.status)} hover:brightness-95 transition-all cursor-pointer z-10`}
                  style={{ left, width }}
                  onClick={() => handleJobClick(job)}
                  onMouseEnter={(e) => handleJobMouseEnter(job, e)}
                  onMouseLeave={handleJobMouseLeave}
                >
                  <span className="truncate">{job.jobName}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {hoveredJob && (
        <JobTooltip job={hoveredJob} position={tooltipPosition} />
      )}

      <JobDetailDialog
        job={selectedJob}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
