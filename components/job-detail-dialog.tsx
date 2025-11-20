"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

interface JobDetailDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (job: Job) => void
}

export default function JobDetailDialog({ job, open, onOpenChange, onEdit }: JobDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("equipment")

  if (!job) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-going":
        return "bg-green-50 text-green-700 border border-green-200"
      case "complete":
        return "bg-red-50 text-red-700 border border-red-200"
      case "pending start":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const hasSignList =
    (job.status === "on-going" || job.status === "complete") && job.signList && job.signList.length > 0

  const handleEdit = () => {
    onOpenChange(false)
    if (onEdit) {
      onEdit(job)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-3">
              {job.jobName}
              <Badge className={getStatusColor(job.status)}>
                {job.status === "on-going" ? "ON-GOING" : job.status === "complete" ? "COMPLETE" : "PENDING START"}
              </Badge>
            </DialogTitle>
            <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Pencil className="h-4 w-4" />
              Edit Job
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4 overflow-y-auto flex-1">
          {/* Job Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Job Number</p>
              <p className="font-semibold">{job.jobNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bid Number</p>
              <p className="font-semibold">{job.bidNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contractor</p>
              <p className="font-semibold">{job.contractor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-semibold">{job.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project Manager</p>
              <p className="font-semibold capitalize">{job.projectManager}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Branch</p>
              <p className="font-semibold capitalize">{job.branch}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <p className="font-semibold">{formatDate(job.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Date</p>
              <p className="font-semibold">{formatDate(job.endDate)}</p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="signs" disabled={!hasSignList}>
                  Signs ({job.signList?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(job.equipment).map(([name, quantity]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-foreground">{name}</span>
                      <span className="text-lg font-bold text-primary">{quantity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="signs" className="mt-4">
                {hasSignList ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                    {job.signList!.map((sign) => (
                      <div key={sign.code} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{sign.code}</span>
                          <span className="text-xs text-muted-foreground">{sign.description}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">×{sign.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No signs on this job</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
