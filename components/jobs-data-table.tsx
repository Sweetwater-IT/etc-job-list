"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EditJobDialog from "./edit-job-dialog"
import JobDetailDialog from "./job-detail-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface JobsDataTableProps {
  jobs: Job[]
  onUpdateJob: (job: Job) => void
}

type SortField =
  | "jobName"
  | "location"
  | "contractor"
  | "projectManager"
  | "branch"
  | "startDate"
  | "endDate"
  | "status"
type SortDirection = "asc" | "desc" | null

export default function JobsDataTable({ jobs, onUpdateJob }: JobsDataTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewingJob, setViewingJob] = useState<Job | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const itemsPerPage = 50

  const getStatusBadge = (status: string) => {
    const styles = {
      "on-going": "bg-green-50 text-green-700 border border-green-200",
      complete: "bg-red-50 text-red-700 border border-red-200",
      "pending start": "bg-gray-100 text-gray-800 border border-gray-200",
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getSignStatusBadge = (status: string) => {
    const styles = {
      complete: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      "in process": "bg-blue-50 text-blue-700 border border-blue-200",
      "not received": "bg-red-50 text-red-700 border border-red-200",
      received: "bg-green-50 text-green-700 border border-green-200",
      "not in process": "bg-gray-100 text-gray-800 border border-gray-200",
    }

    return (
      <Badge
        variant="outline"
        className={`text-xs ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setEditDialogOpen(true)
  }

  const handleRowClick = (job: Job) => {
    setViewingJob(job)
    setDetailDialogOpen(true)
  }

  const handleSaveJob = (updatedJob: Job) => {
    onUpdateJob(updatedJob)
    setEditDialogOpen(false)
  }

  const handleRowHover = (job: Job | null, event?: React.MouseEvent) => {
    setHoveredJob(job)
    if (event && job) {
      const tooltipHeight = 400 // approximate max height
      const tooltipWidth = 350
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let x = event.clientX + 20
      let y = event.clientY + 20

      // If tooltip would go off bottom of screen, position it above cursor
      if (y + tooltipHeight > viewportHeight) {
        y = event.clientY - tooltipHeight - 20
      }

      // If tooltip would go off right of screen, position it to the left
      if (x + tooltipWidth > viewportWidth) {
        x = event.clientX - tooltipWidth - 20
      }

      // Make sure tooltip doesn't go off top of screen
      if (y < 0) {
        y = 20
      }

      // Make sure tooltip doesn't go off left of screen
      if (x < 0) {
        x = 20
      }

      setTooltipPosition({ x, y })
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "startDate" || sortField === "endDate") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = sortedJobs.slice(startIndex, endIndex)

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="sticky top-0 bg-card z-10">
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 hover:bg-transparent font-semibold text-xs"
      >
        {children}
        <span className="ml-1 inline-block w-4">
          {sortField === field && sortDirection === "asc" && <ArrowUp className="h-3 w-3" />}
          {sortField === field && sortDirection === "desc" && <ArrowDown className="h-3 w-3" />}
          {sortField !== field && <ArrowUpDown className="h-3 w-3 opacity-30" />}
        </span>
      </Button>
    </TableHead>
  )

  const JobTooltipContent = ({ job }: { job: Job }) => {
    const equipmentWithQuantity = Object.entries(job.equipment).filter(([_, qty]) => qty > 0)
    const hasSignList =
      (job.status === "on-going" || job.status === "complete") && job.signList && job.signList.length > 0

    const getSignStatusBadgeClass = (signStatus: string) => {
      switch (signStatus) {
        case "complete":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "in process":
          return "bg-blue-50 text-blue-700 border-blue-200"
        case "not received":
          return "bg-red-50 text-red-700 border-red-200"
        case "received":
          return "bg-amber-50 text-amber-700 border-amber-200"
        case "not in process":
          return "bg-slate-50 text-slate-700 border-slate-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }

    return (
      <div className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Job #{job.jobNumber}</span>
            <span className="text-muted-foreground">Bid #{job.bidNumber}</span>
          </div>
          <div className="text-sm font-medium text-foreground">{job.jobName}</div>
          <div className="text-muted-foreground">{job.contractor}</div>
          <div className="text-muted-foreground">{job.location}</div>
        </div>

        <div className="flex justify-between pt-1 border-t border-border">
          <div>
            <div className="text-muted-foreground">Start</div>
            <div className="font-medium text-foreground">{formatDate(job.startDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">End</div>
            <div className="font-medium text-foreground">{formatDate(job.endDate)}</div>
          </div>
        </div>

        <div className="pt-1 border-t border-border">
          <div className="text-muted-foreground mb-1">PM: {job.projectManager}</div>
          <div className="text-muted-foreground">Branch: {job.branch}</div>
        </div>

        {job.status === "pending start" && job.signStatus && (
          <div className="pt-1 border-t border-border">
            <div className="text-muted-foreground mb-1">Sign Status</div>
            <Badge variant="outline" className={`text-[10px] capitalize ${getSignStatusBadgeClass(job.signStatus)}`}>
              {job.signStatus}
            </Badge>
          </div>
        )}

        {equipmentWithQuantity.length > 0 && (
          <div className="pt-1 border-t border-border">
            <div className="font-medium text-foreground mb-1">Equipment</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {equipmentWithQuantity.map(([name, qty]) => (
                <div key={name} className="flex justify-between text-muted-foreground">
                  <span>{name}:</span>
                  <span className="font-medium text-foreground">{qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSignList && (
          <div className="pt-1 border-t border-border">
            <div className="font-medium text-foreground mb-1">Signs on Job</div>
            <div className="space-y-0.5">
              {job.signList!.map((sign, idx) => (
                <div key={idx} className="flex justify-between text-muted-foreground">
                  <span className="text-[10px]">
                    {sign.code} - {sign.description}
                  </span>
                  <span className="font-medium text-foreground">×{sign.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full relative">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <SortableHeader field="jobName">Job Name</SortableHeader>
                <SortableHeader field="location">Location</SortableHeader>
                <SortableHeader field="contractor">Contractor</SortableHeader>
                <SortableHeader field="projectManager">Project Manager</SortableHeader>
                <SortableHeader field="branch">Branch</SortableHeader>
                <SortableHeader field="startDate">Start Date</SortableHeader>
                <SortableHeader field="endDate">End Date</SortableHeader>
                <SortableHeader field="status">Status</SortableHeader>
                <TableHead className="sticky top-0 bg-card z-10 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.map((job) => (
                <TableRow
                  key={job.id}
                  onClick={() => handleRowClick(job)}
                  onMouseEnter={(e) => handleRowHover(job, e)}
                  onMouseLeave={() => handleRowHover(null)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium py-3">{job.jobName}</TableCell>
                  <TableCell className="py-3">{job.location}</TableCell>
                  <TableCell className="py-3">{job.contractor}</TableCell>
                  <TableCell className="capitalize py-3">{job.projectManager}</TableCell>
                  <TableCell className="capitalize py-3">{job.branch}</TableCell>
                  <TableCell className="py-3">{formatDate(job.startDate)}</TableCell>
                  <TableCell className="py-3">{formatDate(job.endDate)}</TableCell>
                  <TableCell className="py-3">{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditJob(job)
                          }}
                        >
                          Edit Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {hoveredJob && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <Card className="shadow-lg border-border/50 min-w-[280px] max-w-[350px] max-h-[70vh] overflow-y-auto">
              <CardContent className="p-3">
                <JobTooltipContent job={hoveredJob} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedJobs.length)} of {sortedJobs.length} jobs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <JobDetailDialog
        job={viewingJob}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={(job) => {
          setEditingJob(job)
          setEditDialogOpen(true)
        }}
      />

      <EditJobDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        job={editingJob}
        onSaveJob={handleSaveJob}
      />
    </>
  )
}
