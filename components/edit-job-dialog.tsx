"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X } from "lucide-react"

interface EditJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
  onSaveJob: (job: Job) => void
}

export default function EditJobDialog({ open, onOpenChange, job, onSaveJob }: EditJobDialogProps) {
  const [formData, setFormData] = useState<Job | null>(job)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleConfirmedSave = () => {
    if (formData) {
      onSaveJob(formData)
      onOpenChange(false)
    }
    setShowConfirmation(false)
  }

  if (job && formData?.id !== job.id) {
    setFormData(job)
  }

  if (!formData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleEquipmentChange = (key: string, value: number) => {
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        [key]: value,
      },
    })
  }

  const handleSignChange = (index: number, field: "code" | "description" | "quantity", value: string | number) => {
    const updatedSigns = [...(formData.signList || [])]
    updatedSigns[index] = {
      ...updatedSigns[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      signList: updatedSigns,
    })
  }

  const handleAddSign = () => {
    const newSign: SignItem = { code: "", description: "", quantity: 1 }
    setFormData({
      ...formData,
      signList: [...(formData.signList || []), newSign],
    })
  }

  const handleRemoveSign = (index: number) => {
    const updatedSigns = formData.signList?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      signList: updatedSigns,
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update the details for {formData.jobName}</DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6">
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin">Admin Info</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="signs">Signs</TabsTrigger>
                </TabsList>

                {/* Admin Info Tab */}
                <TabsContent value="admin" className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-jobName">Job Name</Label>
                    <Input
                      id="edit-jobName"
                      value={formData.jobName}
                      onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-jobNumber">Job Number</Label>
                      <Input
                        id="edit-jobNumber"
                        value={formData.jobNumber}
                        onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-bidNumber">Bid Number</Label>
                      <Input
                        id="edit-bidNumber"
                        value={formData.bidNumber}
                        onChange={(e) => setFormData({ ...formData, bidNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-contractor">Contractor</Label>
                    <Input
                      id="edit-contractor"
                      value={formData.contractor}
                      onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-projectManager">Project Manager</Label>
                      <Select
                        value={formData.projectManager}
                        onValueChange={(value) => setFormData({ ...formData, projectManager: value })}
                      >
                        <SelectTrigger id="edit-projectManager">
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
                      <Label htmlFor="edit-branch">Branch</Label>
                      <Select
                        value={formData.branch}
                        onValueChange={(value) => setFormData({ ...formData, branch: value })}
                      >
                        <SelectTrigger id="edit-branch">
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
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input
                        id="edit-startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-endDate">End Date</Label>
                      <Input
                        id="edit-endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Job["status"] })}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending start">Pending Start</SelectItem>
                        <SelectItem value="on-going">On-going</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status === "pending start" && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-signStatus">Sign Status</Label>
                      <Select
                        value={formData.signStatus || "not received"}
                        onValueChange={(value) => setFormData({ ...formData, signStatus: value as Job["signStatus"] })}
                      >
                        <SelectTrigger id="edit-signStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complete">Complete</SelectItem>
                          <SelectItem value="in process">In Process</SelectItem>
                          <SelectItem value="not received">Not Received</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="not in process">Not In Process</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                {/* Equipment Tab */}
                <TabsContent value="equipment" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {Object.entries(formData.equipment).map(([key, value]) => (
                      <div key={key} className="grid gap-2">
                        <Label htmlFor={`equipment-${key}`}>{key}</Label>
                        <Input
                          id={`equipment-${key}`}
                          type="number"
                          min="0"
                          value={value}
                          onChange={(e) => handleEquipmentChange(key, Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Signs Tab */}
                <TabsContent value="signs" className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <Label>Sign List ({formData.signList?.length || 0})</Label>
                    <Button type="button" size="sm" onClick={handleAddSign}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Sign
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {formData.signList && formData.signList.length > 0 ? (
                      formData.signList.map((sign, index) => (
                        <div key={index} className="grid grid-cols-[1fr_2fr_100px_40px] gap-2 items-end">
                          <div className="grid gap-1">
                            <Label htmlFor={`sign-code-${index}`} className="text-xs">
                              Code
                            </Label>
                            <Input
                              id={`sign-code-${index}`}
                              value={sign.code}
                              onChange={(e) => handleSignChange(index, "code", e.target.value)}
                              placeholder="W20-2"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`sign-desc-${index}`} className="text-xs">
                              Description
                            </Label>
                            <Input
                              id={`sign-desc-${index}`}
                              value={sign.description}
                              onChange={(e) => handleSignChange(index, "description", e.target.value)}
                              placeholder="Road Closed"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`sign-qty-${index}`} className="text-xs">
                              Qty
                            </Label>
                            <Input
                              id={`sign-qty-${index}`}
                              type="number"
                              min="1"
                              value={sign.quantity}
                              onChange={(e) =>
                                handleSignChange(index, "quantity", Number.parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSign(index)}
                            className="h-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No signs added yet. Click "Add Sign" to get started.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background border-t px-6 py-4 mt-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save the changes to this job? This action will update the job details, equipment,
              and signs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
