'use client'

import { useState } from 'react'
import { type Job } from '@/lib/dummy-data'
import JobDetailDialog from './job-detail-dialog'
import JobTooltip from './job-tooltip'

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
    const jobStart = new Date(job.startDate)
    const jobEnd = new Date(job.endDate)
    
    let startUnit = 0
    let endUnit = 0
    let unitWidth = 0

    if (viewType === 'week') {
      unitWidth = 100 / 7
      const weekStart = new Date(startDate)
      startUnit = Math.floor((jobStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
      endUnit = Math.floor((jobEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
    } else if (viewType === 'month') {
      unitWidth = 48
      startUnit = jobStart.getDate() - 1
      endUnit = jobEnd.getDate() - 1
    } else {
      unitWidth = 100 / 12
      startUnit = jobStart.getMonth()
      endUnit = jobEnd.getMonth()
    }

    const left = viewType === 'month' ? startUnit * unitWidth : startUnit * unitWidth
    const width = viewType === 'month' 
      ? (endUnit - startUnit + 1) * unitWidth 
      : (endUnit - startUnit + 1) * unitWidth

    return { left: `${left}${viewType === 'month' ? 'px' : '%'}`, width: `${Math.max(width, 20)}${viewType === 'month' ? 'px' : '%'}` }
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
