'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import JobList from "./job-list"
import TimelineHeader from "./timeline-header"
import TimelineBody from "./timeline-body"
import JobsDataTable from "./jobs-data-table"
import EquipmentSummary from "./equipment-summary"
import AddJobDialog from "./add-job-dialog"
import { getJobs } from '@/lib/jobs'
import type { Job } from '@/lib/types'
import useSWR from 'swr'
import { LayoutList, GanttChartSquare, Plus, Package } from "lucide-react"

const fetcher = () => getJobs()

type ViewType = "week" | "month" | "year"
type DisplayMode = "gantt" | "list" | "equipment-summary"

export default function GanttChart() {
  const [viewType, setViewType] = useState<ViewType>("month")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("gantt")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>(["ONGOING", "COMPLETE", "PENDING START"])
  const [pmFilter, setPmFilter] = useState<string>("all")
  const [officeFilter, setOfficeFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState(new Date(2025, 10, 1)) // Nov 2025
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false)

  const { data: jobs = [], mutate } = useSWR<Job[]>('jobs', fetcher, { fallbackData: [] })

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          job.job_number.toLowerCase().includes(search) ||
          (job.job_location || "").toLowerCase().includes(search) ||
          (job.contractor || "").toLowerCase().includes(search)

        const matchesStatus = statusFilter.includes(job.job_status)
        const matchesPM = pmFilter === "all" || job.pm === pmFilter
        const matchesOffice = officeFilter === "all" || job.office === officeFilter

        return matchesSearch && matchesStatus && matchesPM && matchesOffice
      })
      .sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0
        return dateB - dateA
      })
  }, [jobs, searchTerm, statusFilter, pmFilter, officeFilter])

  const handleAddJob = async (newJob: any) => {
    await mutate(async () => {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      })
      return getJobs()
    }, { revalidate: true })
  }

  const handlePrevious = () => {
    const newDate = new Date(startDate)
    if (viewType === "week") newDate.setDate(newDate.getDate() - 7)
    else if (viewType === "month") newDate.setMonth(newDate.getMonth() - 1)
    else newDate.setFullYear(newDate.getFullYear() - 1)
    setStartDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(startDate)
    if (viewType === "week") newDate.setDate(newDate.getDate() + 7)
    else if (viewType === "month") newDate.setMonth(newDate.getMonth() + 1)
    else newDate.setFullYear(newDate.getFullYear() + 1)
    setStartDate(newDate)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">ETC Traffic Control Jobs</h1>
            <p className="text-sm text-muted-foreground">{filteredJobs.length} jobs displayed</p>
          </div>
          <Button onClick={() => setIsAddJobDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Job
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <Input
            placeholder="Search job number, location, contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-96"
          />
          <Select value={pmFilter} onValueChange={setPmFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PMs</SelectItem>
              <SelectItem value="NELSON">Nelson</SelectItem>
              <SelectItem value="GRESH">Gresh</SelectItem>
              <SelectItem value="LONG">Long</SelectItem>
              <SelectItem value="REDDEN">Redden</SelectItem>
            </SelectContent>
          </Select>
          <Select value={officeFilter} onValueChange={setOfficeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              <SelectItem value="Hatfield">Hatfield</SelectItem>
              <SelectItem value="Turbotville">Turbotville</SelectItem>
              <SelectItem value="Bedford">Bedford</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mt-4">
          {["ONGOING", "COMPLETE", "PENDING START", "NOT STARTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(prev =>
                prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
              )}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                statusFilter.includes(status)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View tabs */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Button
              variant={displayMode === "gantt" ? "default" : "outline"}
              onClick={() => setDisplayMode("gantt")}
            >
              <GanttChartSquare className="mr-2 h-4 w-4" /> Gantt
            </Button>
            <Button
              variant={displayMode === "list" ? "default" : "outline"}
              onClick={() => setDisplayMode("list")}
            >
              <LayoutList className="mr-2 h-4 w-4" /> List
            </Button>
            <Button
              variant={displayMode === "equipment-summary" ? "default" : "outline"}
              onClick={() => setDisplayMode("equipment-summary")}
            >
              <Package className="mr-2 h-4 w-4" /> Equipment
            </Button>
          </div>

          {displayMode === "gantt" && (
            <div className="flex items-center gap-3">
              <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious}>←</Button>
                <span className="text-sm font-medium min-w-32 text-center">
                  {startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline" size="sm" onClick={handleNext}>→</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {displayMode === "gantt" && (
          <div className="flex h-full">
            <JobList jobs={filteredJobs} />
            <div className="flex-1 flex flex-col overflow-hidden border-l">
              <TimelineHeader viewType={viewType} startDate={startDate} />
              <TimelineBody jobs={filteredJobs} viewType={viewType} startDate={startDate} />
            </div>
          </div>
        )}
        {displayMode === "list" && <JobsDataTable jobs={filteredJobs} />}
        {displayMode === "equipment-summary" && <EquipmentSummary jobs={jobs} />}
      </div>

      <AddJobDialog
        open={isAddJobDialogOpen}
        onOpenChange={setIsAddJobDialogOpen}
        onAddJob={handleAddJob}
      />
    </div>
  )
}
