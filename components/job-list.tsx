'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface JobListProps {
  jobs: Job[]
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function JobList({ jobs, searchTerm, onSearchChange }: JobListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 50
  
  useEffect(() => {
    setCurrentPage(1)
  }, [jobs.length, searchTerm])
  
  const totalPages = Math.ceil(jobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = startIndex + jobsPerPage
  const paginatedJobs = jobs.slice(startIndex, endIndex)
  
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-going':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'complete':
        return 'bg-red-50 text-red-700 border border-red-200'
      case 'pending start':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getSignStatusColor = (signStatus: string) => {
    switch (signStatus) {
      case 'complete':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'in process':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'not received':
        return 'bg-red-50 text-red-700 border border-red-200'
      case 'received':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'not in process':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-2">
        <h2 className="font-semibold text-sm text-foreground mb-2">Jobs</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 bg-background h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {paginatedJobs.map((job) => (
          <div
            key={job.id}
            className="p-2 hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-xs text-foreground">
                  {job.jobNumber}
                </h3>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-shrink-0 ${getStatusColor(job.status)}`}
                >
                  {job.status === 'on-going' ? 'ON-GOING' : 
                   job.status === 'complete' ? 'COMPLETE' : 
                   'PENDING START'}
                </span>
              </div>
              {job.status === 'pending start' && job.signStatus && (
                <div className="flex items-center gap-1 pt-0.5">
                  <span className="text-[9px] text-muted-foreground">Sign Status:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getSignStatusColor(job.signStatus)}`}
                  >
                    {job.signStatus.toUpperCase()}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground truncate">
                {job.contractor}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {job.location}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Bid: {job.bidNumber}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                PM: {job.projectManager}
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 border-t border-border">
                <span>{formatDate(job.startDate)}</span>
                <span>→</span>
                <span>{formatDate(job.endDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="border-t border-border p-2 bg-card">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-foreground font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-7 px-2 text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
