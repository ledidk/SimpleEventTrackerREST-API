import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar({ events, onDateClick, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate

  // Create calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.start_date), day)
      )

      days.push(
        <div
          key={day}
          className={`calendar-day cursor-pointer ${
            !isSameMonth(day, monthStart) ? 'other-month' : ''
          } ${isToday(day) ? 'today' : ''}`}
          onClick={() => onDateClick(cloneDay)}
        >
          <span className={`text-sm font-medium ${
            isToday(day) ? 'text-primary-700' : 
            !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-gray-900'
          }`}>
            {format(day, dateFormat)}
          </span>
          
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onEventClick(event)
                }}
                className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded truncate hover:bg-primary-200 transition-colors cursor-pointer"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div key={day} className="calendar-grid">
        {days}
      </div>
    )
    days = []
  }

  return (
    <div className="card p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {rows}
      </div>
    </div>
  )
}