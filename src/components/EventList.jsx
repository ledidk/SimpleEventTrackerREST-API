import React from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react'

export default function EventList({ events, onEditEvent, onDeleteEvent }) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_date) - new Date(b.start_date)
  )

  if (events.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600">Create your first event to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div key={event.id} className="card-hover p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
              
              {event.description && (
                <p className="text-gray-600 mb-3">{event.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(parseISO(event.start_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {!event.all_day && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(parseISO(event.start_date), 'h:mm a')}
                      {event.end_date && (
                        ` - ${format(parseISO(event.end_date), 'h:mm a')}`
                      )}
                    </span>
                  </div>
                )}

                {event.all_day && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>All day</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEditEvent(event)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit event"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteEvent(event.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}