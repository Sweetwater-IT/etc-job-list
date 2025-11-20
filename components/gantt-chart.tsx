"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import JobList from "./job-list"
import TimelineHeader from "./timeline-header"
import TimelineBody from "./timeline-body"
import JobsDataTable from "./jobs-data-table"
import EquipmentSummary from "./equipment-summary"
import AddJobDialog from "./add-job-dialog"
import { getJobs } from '@/lib/jobs'
import type { Job } from '@/lib/types'      
import { LayoutList, GanttChartSquare, Plus, Package } from "lucide-react"

type ViewType = "week" | "month" | "year"
type DisplayMode = "gantt" | "list" | "equipment-summary"

export default function GanttChart() {
  const [viewType, setViewType] = useState<ViewType>("month")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("gantt")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>(["ONGOING", "COMPLETE", "PENDING START"])
  const [projectManagerFilter, setProjectManagerFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [signStatusFilter, setSignStatusFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState(new Date(2024, 10, 1))
  const { data: jobs, mutate } = useSWR('jobs', getJobs, { fallbackData: [] })
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false)

const filteredJobs = useMemo(() => {
  return jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      job.job_number.toLowerCase().includes(searchLower) ||
      job.job_location?.toLowerCase().includes(searchLower) ||
      job.contractor?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter.includes(job.job_status.toLowerCase())
    const matchesPM = projectManagerFilter === "all" || job.pm?.toUpperCase() === projectManagerFilter.toUpperCase()
    const matchesOffice = branchFilter === "all" || job.office?.toLowerCase() === branchFilter.toLowerCase()
    const matchesSignStatus = signStatusFilter === "all" || job.sign_status === signStatusFilter

    return matchesSearch && matchesStatus && matchesPM && matchesOffice && matchesSignStatus
  }).sort((a, b) => new Date(b.start_date || '').getTime() - new Date(a.start_date || '').getTime())
}, [jobs, searchTerm, statusFilter, projectManagerFilter, branchFilter, signStatusFilter])

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return dateB - dateA
    })
  }, [jobs, searchTerm, statusFilter, projectManagerFilter, branchFilter, signStatusFilter])

  const handleAddJob = (newJob: Omit<Job, "id">) => {
    const jobWithId: Job = {
      ...newJob,
      id: `job-${Date.now()}`,
    }
    setJobs((prev) => [...prev, jobWithId])
  }

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
  }

  const handlePrevious = () => {
    const newDate = new Date(startDate)
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1)
    }
    setStartDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(startDate)
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setStartDate(newDate)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Traffic Control Jobs</h1>
              <p className="text-xs text-muted-foreground">{filteredJobs.length} jobs displayed</p>
            </div>
            <Button size="sm" onClick={() => setIsAddJobDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 mt-2">
          {displayMode === "list" && (
            <Input
              placeholder="Search by job name, location, or contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background h-8 text-sm"
            />
          )}

          {displayMode !== "equipment-summary" && (
            <>
              <div className="flex flex-wrap gap-2">
                <Select value={projectManagerFilter} onValueChange={setProjectManagerFilter}>
                  <SelectTrigger className="w-[160px] bg-background h-8 text-xs">
                    <SelectValue placeholder="Project Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Managers</SelectItem>
                    <SelectItem value="john nelson">John Nelson</SelectItem>
                    <SelectItem value="larry long">Larry Long</SelectItem>
                    <SelectItem value="jim redden">Jim Redden</SelectItem>
                    <SelectItem value="richard gresh">Richard Gresh</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[140px] bg-background h-8 text-xs">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="hatfield">Hatfield</SelectItem>
                    <SelectItem value="turbotville">Turbotville</SelectItem>
                    <SelectItem value="bedford">Bedford</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={signStatusFilter} onValueChange={setSignStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-background h-8 text-xs">
                    <SelectValue placeholder="Sign Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sign Status</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="in process">In Process</SelectItem>
                    <SelectItem value="not received">Not Received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="not in process">Not In Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["on-going", "complete", "pending start"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter((prev) =>
                        prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
                      )
                    }
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      statusFilter.includes(status)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {status === "on-going" ? "On-going" : status === "complete" ? "Complete" : "Pending Start"}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* View Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1.5">
              <Button
                variant={displayMode === "gantt" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("gantt")}
                className="h-7 text-xs"
              >
                <GanttChartSquare className="h-3.5 w-3.5 mr-1.5" />
                Gantt
              </Button>
              <Button
                variant={displayMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("list")}
                className="h-7 text-xs"
              >
                <LayoutList className="h-3.5 w-3.5 mr-1.5" />
                List
              </Button>
              <Button
                variant={displayMode === "equipment-summary" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("equipment-summary")}
                className="h-7 text-xs"
              >
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Equipment Summary
              </Button>
            </div>

            {displayMode === "gantt" && (
              <>
                <div className="flex gap-1.5">
                  {(["week", "month", "year"] as ViewType[]).map((view) => (
                    <Button
                      key={view}
                      variant={viewType === view ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewType(view)}
                      className="capitalize h-7 text-xs px-3"
                    >
                      {view}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-7 text-xs px-2 bg-transparent"
                  >
                    ← Prev
                  </Button>
                  <span className="text-xs font-medium min-w-24 text-center text-muted-foreground">
                    {startDate.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNext} className="h-7 text-xs px-2 bg-transparent">
                    Next →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {displayMode === "gantt" ? (
        <div className="flex flex-1 overflow-hidden">
          <JobList jobs={filteredJobs} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <div className="flex-1 flex flex-col overflow-hidden border-l border-border">
            <TimelineHeader viewType={viewType} startDate={startDate} />
            <TimelineBody jobs={filteredJobs} viewType={viewType} startDate={startDate} />
          </div>
        </div>
      ) : displayMode === "list" ? (
        <div className="flex-1 overflow-hidden">
          <JobsDataTable jobs={filteredJobs} onUpdateJob={handleUpdateJob} />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <EquipmentSummary jobs={jobs} />
        </div>
      )}

      {/* Dialog for adding new job */}
      <AddJobDialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen} onAddJob={handleAddJob} />
    </div>
  )
}
