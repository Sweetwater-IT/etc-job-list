'use client'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Calendar, Package, FileText, FileSpreadsheet, Download, Search } from 'lucide-react'
import type { Job } from '@/lib/jobs'

interface EquipmentSummaryProps {
  jobs: Job[]
}

export default function EquipmentSummary({ jobs }: EquipmentSummaryProps) {
  const today = new Date().toISOString().split('T')[0]
  const [masterDate, setMasterDate] = useState(today)

  const thirtyDaysOut = new Date()
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30)
  const [forecastDate, setForecastDate] = useState(thirtyDaysOut.toISOString().split('T')[0])

  const [summaryTab, setSummaryTab] = useState<'equipment' | 'signs'>('equipment')
  const [equipmentSearch, setEquipmentSearch] = useState('')
  const [signSearch, setSignSearch] = useState('')

  // ← START EMPTY — this is correct!
  const [equipmentInventory, setEquipmentInventory] = useState<Record<string, number>>({})
  const [signsInventory, setSignsInventory] = useState<Record<string, number>>({})

  const [editingEquipment, setEditingEquipment] = useState<string | null>(null)
  const [editingSign, setEditingSign] = useState<string | null>(null)
  const [showNeedToOrderReport, setShowNeedToOrderReport] = useState(false)
  const [reportTab, setReportTab] = useState<'equipment' | 'signs'>('equipment')

  const masterDateObj = new Date(masterDate)
  const forecastDateObj = new Date(forecastDate)
  const daysBetween = Math.round((forecastDateObj.getTime() - masterDateObj.getTime()) / (1000 * 60 * 60 * 24))

  const equipmentSummary = useMemo(() => {
    const summary: {
      name: string
      inUse: number
      goingOut: number
      returning: number
      currentInventory: number
      needToOrder: number
    }[] = []
  
    // Collect every equipment type from ALL jobs (not just first job!)
    const allEquipmentKeys = Array.from(
      new Set(jobs.flatMap(job => Object.keys(job.equipment)))
    )
  
    allEquipmentKeys.forEach((key) => {
      let inUse = 0      // deployed as of Master Date
      let goingOut = 0   // starting after Master Date, before Forecast
      let returning = 0  // ending after Master Date, before Forecast
  
      jobs.forEach((job) => {
        const qty = job.equipment[key] ?? 0
        if (qty === 0) return
  
        const jobStart = new Date(job.startDate)
        const jobEnd = job.endDate ? new Date(job.endDate) : new Date(2099, 11, 31)  // ongoing forever
  
        // IN USE: active on Master Date
        if (jobStart <= masterDateObj && jobEnd >= masterDateObj && job.status === 'on-going') {
          inUse += qty
        }
  
        // GOING OUT: starts after Master Date, by Forecast Date
        if (jobStart > masterDateObj && jobStart <= forecastDateObj) {
          goingOut += qty
        }
  
        // RETURNING: ends after Master Date, by Forecast Date
        if (jobEnd > masterDateObj && jobEnd <= forecastDateObj) {
          returning += qty
        }
      })
  
      const currentInventory = equipmentInventory[key] ?? 0
      const projectedAvailable = currentInventory + returning - inUse - goingOut
      const needToOrder = projectedAvailable < 0 ? Math.abs(projectedAvailable) : 0
  
      summary.push({
        name: key,
        inUse,
        goingOut,
        returning,
        currentInventory,
        needToOrder,
      })
    })
  
    return summary.sort((a, b) => a.name.localeCompare(b.name))
  }, [jobs, masterDateObj, forecastDateObj, equipmentInventory])

  const filteredEquipmentSummary = useMemo(() => {
    if (!equipmentSearch.trim()) return equipmentSummary
    const lower = equipmentSearch.toLowerCase()
    return equipmentSummary.filter(item => item.name.toLowerCase().includes(lower))
  }, [equipmentSummary, equipmentSearch])

  // Signs logic stays the same — but starts empty
  const signsSummary = useMemo(() => {
    const summary: {
      code: string
      description: string
      inUse: number
      goingOut: number
      returning: number
      currentInventory: number
      needToOrder: number
    }[] = []

    const signMap = new Map<string, { description: string; inUse: number; goingOut: number; returning: number }>()

    jobs.forEach((job) => {
      if (!job.signList) return
      const jobStart = new Date(job.startDate)
      const jobEnd = job.endDate ? new Date(job.endDate) : new Date(2099, 11, 31)

      job.signList.forEach((sign) => {
        if (!signMap.has(sign.code)) {
          signMap.set(sign.code, { description: sign.description, inUse: 0, goingOut: 0, returning: 0 })
        }
        const current = signMap.get(sign.code)!

        if (jobStart <= masterDateObj && jobEnd >= masterDateObj && job.status === 'on-going') {
          current.inUse += sign.quantity
        }
        if (jobStart >= masterDateObj && jobStart <= forecastDateObj) {
          current.goingOut += sign.quantity
        }
        if (jobEnd >= masterDateObj && jobEnd <= forecastDateObj && (job.status === 'on-going' || job.status === 'complete')) {
          current.returning += sign.quantity
        }
      })
    })

    signMap.forEach((value, code) => {
      const currentInventory = signsInventory[code] ?? 0
      const availableAfterProjection = currentInventory + value.returning - value.inUse - value.goingOut
      const needToOrder = availableAfterProjection < 0 ? Math.abs(availableAfterProjection) : 0

      summary.push({
        code,
        description: value.description,
        inUse: value.inUse,
        goingOut: value.goingOut,
        returning: value.returning,
        currentInventory,
        needToOrder,
      })
    })

    return summary.sort((a, b) => a.code.localeCompare(b.code))
  }, [jobs, masterDateObj, forecastDateObj, signsInventory])

  const filteredSignsSummary = useMemo(() => {
    if (!signSearch.trim()) return signsSummary
    const lower = signSearch.toLowerCase()
    return signsSummary.filter(item =>
      item.code.toLowerCase().includes(lower) || item.description.toLowerCase().includes(lower)
    )
  }, [signsSummary, signSearch])

  const handleEquipmentInventoryChange = (name: string, value: number) => {
    setEquipmentInventory(prev => ({ ...prev, [name]: value }))
    setEditingEquipment(null)
  }

  const handleSignInventoryChange = (code: string, value: number) => {
    setSignsInventory(prev => ({ ...prev, [code]: value }))
    setEditingSign(null)
  }

  const needToOrderEquipment = useMemo(() => equipmentSummary.filter(i => i.needToOrder > 0), [equipmentSummary])
  const needToOrderSigns = useMemo(() => signsSummary.filter(i => i.needToOrder > 0), [signsSummary])

  const exportToExcel = () => {
    const items = reportTab === 'equipment' ? needToOrderEquipment : needToOrderSigns
  
    if (items.length === 0) {
      alert('No items to export')
      return
    }
  
    let csvContent = ''
  
    if (reportTab === 'equipment') {
      csvContent = 'Equipment,Current Inventory,In Use,Going Out,Returning,Need to Order\n'
      items.forEach((item) => {
        const eq = item as { name: string; currentInventory: number; inUse: number; goingOut: number; returning: number; needToOrder: number }
        csvContent += `${eq.name},${eq.currentInventory},${eq.inUse},${eq.goingOut},${eq.returning},${eq.needToOrder}\n`
      })
    } else {
      csvContent = 'MUTCD Code,Description,Current Inventory,In Use,Going Out,Returning,Need to Order\n'
      items.forEach((item) => {
        const sign = item as { code: string; description: string; currentInventory: number; inUse: number; goingOut: number; returning: number; needToOrder: number }
        csvContent += `${sign.code},${sign.description},${sign.currentInventory},${sign.inUse},${sign.goingOut},${sign.returning},${sign.needToOrder}\n`
      })
    }
  
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `need-to-order-${reportTab}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Equipment & Signs Summary</h2>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowNeedToOrderReport(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              size="sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Need to Order Report
            </Button>
            
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={summaryTab === 'equipment' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSummaryTab('equipment')}
                className={`gap-2 ${summaryTab === 'equipment' ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Package className="w-4 h-4" />
                Equipment
              </Button>
              <Button
                variant={summaryTab === 'signs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSummaryTab('signs')}
                className={`gap-2 ${summaryTab === 'signs' ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FileText className="w-4 h-4" />
                Signs
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <label className="text-xs text-muted-foreground whitespace-nowrap">Master Date:</label>
            <Input
              type="date"
              value={masterDate}
              onChange={(e) => setMasterDate(e.target.value)}
              className="w-40 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <label className="text-xs text-muted-foreground whitespace-nowrap">Forecast Through:</label>
            <Input
              type="date"
              value={forecastDate}
              onChange={(e) => setForecastDate(e.target.value)}
              className="w-40 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">({daysBetween} days)</span>
          </div>
          {summaryTab === 'equipment' ? (
            <div className="flex items-center gap-2 ml-auto">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search equipment..."
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                className="w-80 h-8 text-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search MUTCD codes or descriptions..."
                value={signSearch}
                onChange={(e) => setSignSearch(e.target.value)}
                className="w-80 h-8 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">  {/* ← Side padding + top/bottom breathing room */}
        <div className="overflow-x-auto border border-border rounded-lg bg-card">
          {summaryTab === 'equipment' ? (
            <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-64 sticky top-0 bg-muted/40 z-10 font-semibold">Equipment</TableHead>
                <<TableHead className="w-32 text-right sticky top-0 bg-muted/40 z-10 h-14 flex items-center justify-end">
                  Current Inventory
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  In Use<br />
                  <span className="text-xs font-normal text-muted-foreground">(on {masterDate})</span>
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  Going Out<br />
                  <span className="text-xs font-normal text-muted-foreground">(by {forecastDate})</span>
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  Returning<br />
                  <span className="text-xs font-normal text-muted-foreground">(by {forecastDate})</span>
                </TableHead>
                <TableHead className="w-32 text-right sticky top-0 bg-muted/40 z-10 font-bold">Need to Order</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {filteredEquipmentSummary.length > 0 ? (
                  filteredEquipmentSummary.map((item) => (
                    <TableRow key={item.name} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium truncate" title={item.name}>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingEquipment === item.name ? (
                          <Input
                            type="number"
                            min={0}
                            autoFocus
                            defaultValue={item.currentInventory}
                            onBlur={(e) => handleEquipmentInventoryChange(item.name, parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEquipmentInventoryChange(item.name, parseInt(e.currentTarget.value) || 0)}
                            className="w-20 h-8 text-right"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingEquipment(item.name)}
                            className="flex items-center justify-end gap-1 hover:text-foreground"
                          >
                            {item.currentInventory}
                            <Pencil className="w-3.5 h-3.5 opacity-50" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.inUse}</TableCell>
                      <TableCell className="text-right text-amber-700 font-medium">{item.goingOut}</TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">{item.returning}</TableCell>
                      <TableCell className="text-right font-bold">
                        {item.needToOrder > 0 ? (
                          <span className="text-red-600">{item.needToOrder}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No equipment found matching "{equipmentSearch}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table className="min-w-[1400px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-32 sticky top-0 bg-muted/40 z-10">MUTCD Code</TableHead>
                <TableHead className="w-96 sticky top-0 bg-muted/40 z-10">Description</TableHead>
                <TableHead className="w-32 text-right sticky top-0 bg-muted/40 z-10 h-14 flex items-center justify-end">
                  Current Inventory
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  In Use<br />
                  <span className="text-xs font-normal text-muted-foreground">(on {masterDate})</span>
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  Going Out<br />
                  <span className="text-xs font-normal text-muted-foreground">(by {forecastDate})</span>
                </TableHead>
                <TableHead className="w-40 text-right sticky top-0 bg-muted/40 z-10">
                  Returning<br />
                  <span className="text-xs font-normal text-muted-foreground">(by {forecastDate})</span>
                </TableHead>
                <TableHead className="w-32 text-right sticky top-0 bg-muted/40 z-10 font-bold">Need to Order</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {filteredSignsSummary.length > 0 ? (
                  filteredSignsSummary.map((item) => (
                    <TableRow key={item.code} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-medium">{item.code}</TableCell>
                      <TableCell className="truncate" title={item.description}>
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingSign === item.code ? (
                          <Input
                            type="number"
                            min={0}
                            autoFocus
                            defaultValue={item.currentInventory}
                            onBlur={(e) => handleSignInventoryChange(item.code, parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSignInventoryChange(item.code, parseInt(e.currentTarget.value) || 0)}
                            className="w-20 h-8 text-right"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingSign(item.code)}
                            className="flex items-center justify-end gap-1 hover:text-foreground"
                          >
                            {item.currentInventory}
                            <Pencil className="w-3.5 h-3.5 opacity-50" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.inUse}</TableCell>
                      <TableCell className="text-right text-amber-700 font-medium">{item.goingOut}</TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">{item.returning}</TableCell>
                      <TableCell className="text-right font-bold">
                        {item.needToOrder > 0 ? (
                          <span className="text-red-600">{item.needToOrder}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No signs found matching "{signSearch}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={showNeedToOrderReport} onOpenChange={setShowNeedToOrderReport}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Need to Order Report</span>
              <Button
                onClick={exportToExcel}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Report Based On:</span>
                <span className="ml-2 font-semibold">{new Date(masterDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Forecast Through:</span>
                <span className="ml-2 font-semibold">{new Date(forecastDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
            <Button
              variant={reportTab === 'equipment' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReportTab('equipment')}
              className={`gap-2 ${reportTab === 'equipment' ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="w-4 h-4" />
              Equipment ({needToOrderEquipment.length})
            </Button>
            <Button
              variant={reportTab === 'signs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setReportTab('signs')}
              className={`gap-2 ${reportTab === 'signs' ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <FileText className="w-4 h-4" />
              Signs ({needToOrderSigns.length})
            </Button>
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            {reportTab === 'equipment' ? (
              needToOrderEquipment.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Equipment</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Current Inventory</TableHead>
                      <TableHead className="text-xs font-semibold text-right">In Use</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Going Out</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Returning</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Need to Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {needToOrderEquipment.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-right">{item.currentInventory}</TableCell>
                        <TableCell className="text-xs text-right">{item.inUse}</TableCell>
                        <TableCell className="text-xs text-right text-amber-700">{item.goingOut}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-700">{item.returning}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className="text-red-700 font-bold">{item.needToOrder}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No equipment needs to be ordered
                </div>
              )
            ) : (
              needToOrderSigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold">MUTCD Code</TableHead>
                      <TableHead className="text-xs font-semibold">Description</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Current Inventory</TableHead>
                      <TableHead className="text-xs font-semibold text-right">In Use</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Going Out</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Returning</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Need to Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {needToOrderSigns.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell className="text-xs font-medium">{item.code}</TableCell>
                        <TableCell className="text-xs">{item.description}</TableCell>
                        <TableCell className="text-xs text-right">{item.currentInventory}</TableCell>
                        <TableCell className="text-xs text-right">{item.inUse}</TableCell>
                        <TableCell className="text-xs text-right text-amber-700">{item.goingOut}</TableCell>
                        <TableCell className="text-xs text-right text-emerald-700">{item.returning}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className="text-red-700 font-bold">{item.needToOrder}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No signs need to be ordered
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
