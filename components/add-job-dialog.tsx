'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Job } from '@/lib/dummy-data'

interface AddJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddJob: (job: Omit<Job, 'id'>) => void
}

export default function AddJobDialog({ open, onOpenChange, onAddJob }: AddJobDialogProps) {
  const [formData, setFormData] = useState({
    jobName: '',
    jobNumber: '',
    bidNumber: '',
    location: '',
    contractor: '',
    projectManager: 'john nelson',
    branch: 'hatfield',
    startDate: '',
    endDate: '',
    status: 'scheduled' as Job['status'],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.jobName || !formData.location || !formData.contractor || !formData.startDate || !formData.endDate) {
      return
    }

    const newJob: Omit<Job, 'id'> = {
      jobName: formData.jobName,
      jobNumber: formData.jobNumber,
      bidNumber: formData.bidNumber,
      location: formData.location,
      contractor: formData.contractor,
      projectManager: formData.projectManager,
      branch: formData.branch,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      equipment: {
        '4\' TYPE III': 0,
        '6\' TYPE III': 0,
        '8\' TYPE III': 0,
        'SQ POST': 0,
        'H STAND': 0,
        'VP': 0,
        'SHARPS': 0,
        'Y/B LITE': 0,
        'R/B LITE': 0,
        'W/B LITE': 0,
        'TMA': 0,
        'C LITE': 0,
        'S. TRL': 0,
        'A. BOARD': 0,
        'M. BOARD': 0,
        'UC POST': 0,
        'SEQ LIGHT': 0,
      }
    }

    onAddJob(newJob)
    
    // Reset form
    setFormData({
      jobName: '',
      jobNumber: '',
      bidNumber: '',
      location: '',
      contractor: '',
      projectManager: 'john nelson',
      branch: 'hatfield',
      startDate: '',
      endDate: '',
      status: 'scheduled',
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
          <DialogDescription>
            Enter the details for the new traffic control job.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobName">Job Name</Label>
              <Input
                id="jobName"
                value={formData.jobName}
                onChange={(e) => setFormData(prev => ({ ...prev, jobName: e.target.value }))}
                placeholder="Enter job name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobNumber">Job Number</Label>
                <Input
                  id="jobNumber"
                  value={formData.jobNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobNumber: e.target.value }))}
                  placeholder="JOB-0001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bidNumber">Bid Number</Label>
                <Input
                  id="bidNumber"
                  value={formData.bidNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, bidNumber: e.target.value }))}
                  placeholder="BID-0001"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contractor">Contractor</Label>
              <Input
                id="contractor"
                value={formData.contractor}
                onChange={(e) => setFormData(prev => ({ ...prev, contractor: e.target.value }))}
                placeholder="Enter contractor name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectManager">Project Manager</Label>
                <Select
                  value={formData.projectManager}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectManager: value }))}
                >
                  <SelectTrigger id="projectManager">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john nelson">John Nelson</SelectItem>
                    <SelectItem value="larry long">Larry Long</SelectItem>
                    <SelectItem value="jim redden">Jim Redden</SelectItem>
                    <SelectItem value="richard gresh">Richard Gresh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}
                >
                  <SelectTrigger id="branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hatfield">Hatfield</SelectItem>
                    <SelectItem value="turbotville">Turbotville</SelectItem>
                    <SelectItem value="bedford">Bedford</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Job['status'] }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
