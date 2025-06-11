const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { database } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation middleware
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('all_day')
    .optional()
    .isBoolean()
    .withMessage('All day must be a boolean value')
];

const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

// Get all events for the authenticated user
router.get('/', validateDateRange, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const filters = {};
    
    if (req.query.start_date) {
      filters.start_date = req.query.start_date;
    }
    
    if (req.query.end_date) {
      filters.end_date = req.query.end_date;
    }

    const events = await database.getEventsByUserId(userId, filters);

    res.json({
      message: 'Events retrieved successfully',
      count: events.length,
      events: events.map(event => ({
        ...event,
        all_day: Boolean(event.all_day)
      }))
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to retrieve events',
      message: 'Internal server error'
    });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!eventId || eventId <= 0) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a positive integer'
      });
    }

    const event = await database.getEventById(eventId, userId);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'Event does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Event retrieved successfully',
      event: {
        ...event,
        all_day: Boolean(event.all_day)
      }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: 'Failed to retrieve event',
      message: 'Internal server error'
    });
  }
});

// Create a new event
router.post('/', validateEvent, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, start_date, end_date, location, all_day } = req.body;
    const userId = req.user.id;

    // Validate date logic
    if (end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'End date cannot be before start date'
      });
    }

    const eventData = {
      user_id: userId,
      title,
      description: description || null,
      start_date,
      end_date: end_date || null,
      location: location || null,
      all_day: all_day || false
    };

    const newEvent = await database.createEvent(eventData);

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        ...newEvent,
        all_day: Boolean(newEvent.all_day)
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Failed to create event',
      message: 'Internal server error'
    });
  }
});

// Update an existing event
router.put('/:id', validateEvent, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!eventId || eventId <= 0) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a positive integer'
      });
    }

    const { title, description, start_date, end_date, location, all_day } = req.body;

    // Validate date logic
    if (end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'End date cannot be before start date'
      });
    }

    // Check if event exists and belongs to user
    const existingEvent = await database.getEventById(eventId, userId);
    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'Event does not exist or you do not have access to it'
      });
    }

    const eventData = {
      title,
      description: description || null,
      start_date,
      end_date: end_date || null,
      location: location || null,
      all_day: all_day || false
    };

    const result = await database.updateEvent(eventId, userId, eventData);

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Event not found or no changes made'
      });
    }

    res.json({
      message: 'Event updated successfully',
      event: {
        id: eventId,
        user_id: userId,
        ...eventData,
        all_day: Boolean(eventData.all_day)
      }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Failed to update event',
      message: 'Internal server error'
    });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!eventId || eventId <= 0) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a positive integer'
      });
    }

    const result = await database.deleteEvent(eventId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'Event does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Event deleted successfully',
      deleted_event_id: eventId
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Failed to delete event',
      message: 'Internal server error'
    });
  }
});

module.exports = router;