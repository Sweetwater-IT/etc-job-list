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
  
    let left = '0%'
    let width = '0%'
  
    if (viewType === 'week') {
      const weekStart = new Date(startDate)
      weekStart.setHours(0, 0, 0, 0)
      const dayOfWeek = weekStart.getDay()
      weekStart.setDate(weekStart.getDate() - dayOfWeek) // Sunday start
  
      const msPerDay = 1000 * 60 * 60 * 24
      const daysFromStart = Math.floor((jobStart.getTime() - weekStart.getTime()) / msPerDay)
      const endTime = jobEnd ? jobEnd.getTime() : jobStart.getTime() + 365 * msPerDay
      const daysFromEnd = Math.floor((endTime - weekStart.getTime()) / msPerDay)
  
      const startDay = Math.max(0, daysFromStart)
      const endDay = Math.min(7, daysFromEnd + 1)
  
      if (startDay < 7) {
        left = `${(startDay / 7) * 100}%`
        width = `${Math.max((endDay - startDay) / 7 * 100, 8)}%`
      }
    }
    else if (viewType === 'month') {
      const viewStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const viewEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      const daysInMonth = viewEnd.getDate()
  
      const jobStartTime = jobStart.getTime()
      const jobEndTime = jobEnd ? jobEnd.getTime() : Infinity
  
      const viewStartTime = viewStart.getTime()
      const viewEndTime = viewEnd.getTime() + 24 * 60 * 60 * 1000 - 1
  
      if (jobStartTime > viewEndTime || jobEndTime < viewStartTime) {
        return { left: '0%', width: '0%' }
      }
  
      const startOffset = Math.max(0, Math.ceil((jobStartTime - viewStartTime) / (1000 * 60 * 60 * 24)))
      const endOffset = jobEnd 
        ? Math.min(daysInMonth, Math.floor((jobEndTime - viewStartTime) / (1000 * 60 * 60 * 24)) + 1)
        : daysInMonth + 1
  
      const pixelPerDay = 48
      left = `${startOffset * pixelPerDay}px`
      width = `${Math.max((endOffset - startOffset) * pixelPerDay, 60)}px`
    }
    else if (viewType === 'year') {
      const viewYear = startDate.getFullYear()
      if (jobStart.getFullYear() > viewYear + 1 || (jobEnd && jobEnd.getFullYear() < viewYear - 1)) {
        return { left: '0%', width: '0%' }
      }
  
      const startMonth = jobStart.getFullYear() === viewYear ? jobStart.getMonth() : 0
      const endMonth = jobEnd && jobEnd.getFullYear() === viewYear ? jobEnd.getMonth() : 11
  
      left = `${(startMonth / 12) * 100}%`
      width = `${Math.max(((endMonth - startMonth + 1) / 12) * 100, 8)}%`
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
