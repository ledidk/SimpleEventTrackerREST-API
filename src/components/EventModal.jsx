import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react'

export default function EventModal({ event, selectedDate, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getAuthHeaders } = useAuth()

  useEffect(() => {
    if (event) {
      // Editing existing event
      setTitle(event.title)
      setDescription(event.description || '')
      setLocation(event.location || '')
      setAllDay(event.all_day)

      const startDateTime = new Date(event.start_date)
      setStartDate(format(startDateTime, 'yyyy-MM-dd'))
      setStartTime(format(startDateTime, 'HH:mm'))

      if (event.end_date) {
        const endDateTime = new Date(event.end_date)
        setEndDate(format(endDateTime, 'yyyy-MM-dd'))
        setEndTime(format(endDateTime, 'HH:mm'))
      }
    } else if (selectedDate) {
      // Creating new event for selected date
      setStartDate(format(selectedDate, 'yyyy-MM-dd'))
      setEndDate(format(selectedDate, 'yyyy-MM-dd'))
      setStartTime('09:00')
      setEndTime('10:00')
    } else {
      // Creating new event for today
      const today = new Date()
      setStartDate(format(today, 'yyyy-MM-dd'))
      setEndDate(format(today, 'yyyy-MM-dd'))
      setStartTime('09:00')
      setEndTime('10:00')
    }
  }, [event, selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Construct ISO date strings
      let startDateTime, endDateTime

      if (allDay) {
        startDateTime = new Date(`${startDate}T00:00:00`).toISOString()
        endDateTime = endDate ? new Date(`${endDate}T23:59:59`).toISOString() : null
      } else {
        startDateTime = new Date(`${startDate}T${startTime}`).toISOString()
        endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`).toISOString() : null
      }

      const eventData = {
        title,
        description: description || undefined,
        start_date: startDateTime,
        end_date: endDateTime || undefined,
        location: location || undefined,
        all_day: allDay
      }

      const url = event ? `/api/events/${event.id}` : '/api/events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save event')
      }

      onSave()
    } catch (error) {
      console.error('Error saving event:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                required
                className="input pl-10"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="description"
                rows={3}
                className="input pl-10 resize-none"
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              All day event
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                required
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {!allDay && (
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    required={!allDay}
                    className="input pl-10"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {!allDay && endDate && (
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    className="input pl-10"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                className="input pl-10"
                placeholder="Add location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                event ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}