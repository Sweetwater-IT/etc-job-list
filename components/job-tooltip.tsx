'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useRef, useState } from 'react'
import type { Job } from '@/lib/jobs'

interface JobTooltipProps {
  job: Job
  position: { x: number; y: number }
}

export default function JobTooltip({ job, position }: JobTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y })

  useEffect(() => {
    if (!tooltipRef.current) return

    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 10

    let x = position.x
    let y = position.y

    // Calculate vertical position - prefer showing above cursor
    if (position.y - tooltipRect.height - 10 > padding) {
      // Enough space above - show above cursor
      y = position.y - tooltipRect.height - 10
    } else if (position.y + tooltipRect.height + 20 < viewportHeight - padding) {
      // Not enough space above, but space below - show below cursor
      y = position.y + 20
    } else {
      // Not enough space either way - show at top with small padding
      y = padding
    }

    // Calculate horizontal position
    if (position.x + tooltipRect.width / 2 > viewportWidth - padding) {
      // Too far right, align to right edge
      x = viewportWidth - tooltipRect.width - padding
    } else if (position.x - tooltipRect.width / 2 < padding) {
      // Too far left, align to left edge
      x = padding
    } else {
      // Center it on cursor
      x = position.x - tooltipRect.width / 2
    }

    setAdjustedPosition({ x, y })
  }, [position])

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const equipmentWithQuantity = Object.entries(job.equipment).filter(([_, qty]) => qty > 0)

  const hasSignList = (job.status === 'on-going' || job.status === 'complete') && job.signList && job.signList.length > 0

  const getSignStatusBadgeClass = (signStatus: string) => {
    switch (signStatus) {
      case 'complete':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'in process':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'not received':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'received':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'not in process':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <Card className="shadow-lg border-border/50 min-w-[280px] max-w-[350px] max-h-[70vh] overflow-y-auto">
        <CardContent className="p-3 space-y-2 text-xs">
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

          {job.status === 'pending start' && job.signStatus && (
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
                {job.signList!.map((sign) => (
                  <div key={sign.code} className="flex justify-between text-muted-foreground">
                    <span className="text-[10px]">{sign.code} - {sign.description}</span>
                    <span className="font-medium text-foreground">×{sign.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
