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

interface AddJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddJob: (job: any) => void
}

export default function AddJobDialog({ open, onOpenChange, onAddJob }: AddJobDialogProps) {
  const [formData, setFormData] = useState({
    job_number: '',
    bid_number: '',
    job_location: '',
    contractor: '',
    rate: '',
    fringe: '',
    is_rated: true,
    start_date: '',
    end_date: '',
    type: 'Public',
    office: 'Hatfield',
    pm: 'NELSON',
    job_status: 'ONGOING',
    "4_type_3": 0,
    "6_type_3": 0,
    "8_type_3": 0,
    sq_post: 0,
    h_stand: 0,
    vp: 0,
    sharps: 0,
    y_b_lite: 0,
    r_b_lite: 0,
    w_b_lite: 0,
    tma: 0,
    c_lite: 0,
    speed_trailer: 0,
    arrow_board: 0,
    message_board: 0,
    uc_post: 0,
    seq_light: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onAddJob(formData)

    setFormData({
      job_number: '',
      bid_number: '',
      job_location: '',
      contractor: '',
      rate: '',
      fringe: '',
      is_rated: true,
      start_date: '',
      end_date: '',
      type: 'Public',
      office: 'Hatfield',
      pm: 'NELSON',
      job_status: 'ONGOING',
      "4_type_3": 0,
      "6_type_3": 0,
      "8_type_3": 0,
      sq_post: 0,
      h_stand: 0,
      vp: 0,
      sharps: 0,
      y_b_lite: 0,
      r_b_lite: 0,
      w_b_lite: 0,
      tma: 0,
      c_lite: 0,
      speed_trailer: 0,
      arrow_board: 0,
      message_board: 0,
      uc_post: 0,
      seq_light: 0,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
          <DialogDescription>
            Enter the details for the new traffic control job.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Number *</Label>
              <Input
                value={formData.job_number}
                onChange={(e) => setFormData({ ...formData, job_number: e.target.value })}
                placeholder="22-2025123"
                required
              />
            </div>
            <div>
              <Label>Bid Number</Label>
              <Input
                value={formData.bid_number}
                onChange={(e) => setFormData({ ...formData, bid_number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Location *</Label>
            <Input
              value={formData.job_location}
              onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
              placeholder="SR 202 Section 61N Montgomery County"
              required
            />
          </div>

          <div>
            <Label>Contractor *</Label>
            <Input
              value={formData.contractor}
              onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
              placeholder="James D. Morrissey"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Project Manager</Label>
              <Select value={formData.pm} onValueChange={(v) => setFormData({ ...formData, pm: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NELSON">Nelson</SelectItem>
                  <SelectItem value="GRESH">Gresh</SelectItem>
                  <SelectItem value="LONG">Long</SelectItem>
                  <SelectItem value="REDDEN">Redden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Office</Label>
              <Select value={formData.office} onValueChange={(v) => setFormData({ ...formData, office: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hatfield">Hatfield</SelectItem>
                  <SelectItem value="Turbotville">Turbotville</SelectItem>
                  <SelectItem value="Bedford">Bedford</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.job_status} onValueChange={(v) => setFormData({ ...formData, job_status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETE">Complete</SelectItem>
                <SelectItem value="PENDING START">Pending Start</SelectItem>
                <SelectItem value="NOT STARTED">Not Started</SelectItem>
              </SelectContent>
            </Select>
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
