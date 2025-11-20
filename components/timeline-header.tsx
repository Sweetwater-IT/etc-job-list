'use client'

type ViewType = 'week' | 'month' | 'year'

interface TimelineHeaderProps {
  viewType: ViewType
  startDate: Date
}

export default function TimelineHeader({ viewType, startDate }: TimelineHeaderProps) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const renderWeekView = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push(
        <div key={i} className="flex-1 text-center border-r border-border last:border-r-0 py-1.5 bg-muted/50">
          <div className="text-[10px] font-medium text-muted-foreground">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
          <div className="text-xs font-semibold text-foreground">
            {date.getDate()}
          </div>
        </div>
      )
    }
    return days
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(startDate)
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <div key={i} className="flex-shrink-0 w-10 text-center border-r border-border last:border-r-0 py-1.5 bg-muted/50">
          <div className="text-[10px] font-medium text-foreground">{i}</div>
        </div>
      )
    }
    return days
  }

  const renderYearView = () => {
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate.getFullYear(), i, 1)
      months.push(
        <div key={i} className="flex-1 text-center border-r border-border last:border-r-0 py-1.5 bg-muted/50">
          <div className="text-xs font-medium text-foreground">
            {date.toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>
      )
    }
    return months
  }

  return (
    <div className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex overflow-x-auto">
        {viewType === 'week' && renderWeekView()}
        {viewType === 'month' && renderMonthView()}
        {viewType === 'year' && renderYearView()}
      </div>
    </div>
  )
}
