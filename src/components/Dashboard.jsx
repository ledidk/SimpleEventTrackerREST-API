import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Calendar from './Calendar'
import EventModal from './EventModal'
import EventList from './EventList'
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react'

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [view, setView] = useState('calendar') // 'calendar' or 'list'
  const { getAuthHeaders } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events')
      }

      setEvents(data.events || [])
      setError('')
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = (date = null) => {
    setSelectedEvent(null)
    setSelectedDate(date)
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setShowEventModal(true)
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete event')
      }

      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      setError('Failed to delete event')
    }
  }

  const handleEventSaved = () => {
    setShowEventModal(false)
    fetchEvents()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="mt-1 text-gray-600">
              {events.length} {events.length === 1 ? 'event' : 'events'} total
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>

            <button
              onClick={() => handleCreateEvent()}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        <div className="animate-fade-in">
          {view === 'calendar' ? (
            <Calendar
              events={events}
              onDateClick={handleCreateEvent}
              onEventClick={handleEditEvent}
            />
          ) : (
            <EventList
              events={events}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </div>

        {showEventModal && (
          <EventModal
            event={selectedEvent}
            selectedDate={selectedDate}
            onClose={() => setShowEventModal(false)}
            onSave={handleEventSaved}
          />
        )}
      </div>
    </div>
  )
}