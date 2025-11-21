'use client'

import { useState } from 'react'
import JobDetailDialog from './job-detail-dialog'
import JobTooltip from './job-tooltip'
import type { Job } from '@/lib/jobs'

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
    if (!job.startDate) return { left: '0%', width: '0%' }
  
    const jobStart = new Date(job.startDate)
    const jobEnd = job.endDate ? new Date(job.endDate) : null
  
    const jobStartMs = jobStart.getTime()
    const jobEndMs = jobEnd ? jobEnd.getTime() : Infinity
  
    let left = '0%'
    let width = '0%'
  
    const msPerDay = 24 * 60 * 60 * 1000
  
    if (viewType === 'week') {
      // Visible week: Sunday to Saturday
      const weekStart = new Date(startDate)
      weekStart.setHours(0, 0, 0, 0)
      const dayOfWeek = weekStart.getDay()
      weekStart.setDate(weekStart.getDate() - dayOfWeek)
  
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
  
      // Hide if job has no overlap with this week
      if (jobStartMs > weekEnd.getTime() || jobEndMs < weekStart.getTime()) {
        return { left: '0%', width: '0%' }
      }
  
      const startDay = Math.max(0, Math.floor((jobStartMs - weekStart.getTime()) / msPerDay))
      const endDay = jobEnd ? Math.min(6, Math.floor((jobEndMs - weekStart.getTime()) / msPerDay)) : 6
  
      if (startDay <= 6) {
        const visibleStart = Math.max(0, startDay)
        const visibleEnd = Math.min(6, endDay)
        const daysVisible = visibleEnd - visibleStart + 1
  
        left = `${(visibleStart / 7) * 100}%`
        width = `${Math.max(daysVisible / 7 * 100, 10)}%`
      }
    }
    else if (viewType === 'month') {
      const viewYear = startDate.getFullYear()
      const viewMonth = startDate.getMonth()
  
      const monthStart = new Date(viewYear, viewMonth, 1, 0, 0, 0, 0)
      const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999)
      const daysInMonth = monthEnd.getDate()
  
      // Hide if no overlap with this month
      if (jobStartMs > monthEnd.getTime() || jobEndMs < monthStart.getTime()) {
        return { left: '0%', width: '0%' }
      }
  
      const startDay = Math.max(0, Math.ceil((jobStartMs - monthStart.getTime()) / msPerDay))
      const endDay = jobEnd
        ? Math.min(daysInMonth - 1, Math.floor((jobEndMs - monthStart.getTime()) / msPerDay))
        : daysInMonth - 1
  
      const visibleDays = end581Day - startDay + 1
      if (visibleDays > 0) {
        left = `${startDay * 48}px`
        width = `${Math.max(visibleDays * 48, 60)}px`
      }
    }
    else if (viewType === 'year') {
      const viewYear = startDate.getFullYear()
  
      const jobStartYear = jobStart.getFullYear()
      const jobEndYear = jobEnd ? jobEnd.getFullYear() : Infinity
  
      // In year view: show if job touches this year or the adjacent ones (so ongoing jobs show)
      if (jobStartYear > viewYear + 1 || jobEndYear < viewYear - 1) {
        return { left: '0%', width: '0%' }
      }
  
      const startMonth = jobStartYear === viewYear ? jobStart.getMonth() : 0
      const endMonth = jobEnd && jobEndYear === viewYear ? jobEnd.getMonth() : 11
  
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
