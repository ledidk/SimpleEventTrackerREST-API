# Event Tracker REST API

A simple REST API for tracking personal events, built with Node.js, Express, and SQLite. This API provides user authentication and full CRUD operations for managing personal calendar events.

## Features

- **User Authentication**: JWT-based registration and login
- **Event Management**: Full CRUD operations for personal events
- **User Isolation**: Users can only access their own events
- **Date/Time Handling**: Proper validation and filtering by date ranges
- **Input Validation**: Comprehensive validation for all endpoints
- **SQLite Database**: Lightweight, file-based database
- **RESTful Design**: Clean, intuitive API endpoints

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the API:**
   - Base URL: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Events (Requires Authentication)

**Note**: All event endpoints require the `Authorization: Bearer <token>` header.

#### Get All Events
```http
GET /api/events
Authorization: Bearer <your-jwt-token>

# Optional query parameters:
# ?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z
```

#### Get Event by ID
```http
GET /api/events/:id
Authorization: Bearer <your-jwt-token>
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "start_date": "2024-01-15T10:00:00Z",
  "end_date": "2024-01-15T11:00:00Z",
  "location": "Conference Room A",
  "all_day": false
}
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Team Meeting",
  "description": "Updated weekly team sync meeting",
  "start_date": "2024-01-15T14:00:00Z",
  "end_date": "2024-01-15T15:00:00Z",
  "location": "Conference Room B",
  "all_day": false
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <your-jwt-token>
```

## Event Data Model

```javascript
{
  "id": 1,
  "user_id": 1,
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "start_date": "2024-01-15T10:00:00Z",
  "end_date": "2024-01-15T11:00:00Z",
  "location": "Conference Room A",
  "all_day": false,
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-10T08:00:00Z"
}
```

## Field Validation

### User Registration/Login
- **username**: 3-50 characters (registration only)
- **email**: Valid email format
- **password**: Minimum 6 characters

### Events
- **title**: Required, max 255 characters
- **description**: Optional, max 1000 characters
- **start_date**: Required, ISO 8601 format
- **end_date**: Optional, ISO 8601 format, must be after start_date
- **location**: Optional, max 255 characters
- **all_day**: Optional boolean, defaults to false

## Error Responses

The API returns consistent error responses:

```javascript
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [] // Additional validation details when applicable
}
```

## Example Usage with curl

### Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create and Manage Events
```bash
# Create event (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "Doctor Appointment",
    "description": "Annual checkup",
    "start_date": "2024-02-01T09:00:00Z",
    "end_date": "2024-02-01T10:00:00Z",
    "location": "Medical Center"
  }'

# Get all events
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer TOKEN"

# Get events in date range
curl -X GET "http://localhost:3000/api/events?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z" \
  -H "Authorization: Bearer TOKEN"
```

## Development

### Project Structure
```
├── server.js              # Main server file
├── models/
│   └── database.js        # Database models and queries
├── routes/
│   ├── auth.js           # Authentication routes
│   └── events.js         # Event CRUD routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── package.json          # Dependencies and scripts
├── .env                  # Environment configuration
└── README.md            # This file
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `NODE_ENV`: Environment (development/production)

### Database
The SQLite database (`database.sqlite`) is created automatically when the server starts. It includes:
- **users** table: User accounts with authentication
- **events** table: User events with foreign key relationships

## Security Features

- Password hashing using bcrypt
- JWT-based authentication with expiration
- User isolation (users can only access their own data)
- Input validation and sanitization
- SQL injection protection through parameterized queries
- CORS enabled for web client integration

## Next Steps

This API provides a solid foundation for an event tracking system. Potential enhancements:

- Add recurring events support
- Implement event categories/tags
- Add reminder/notification system
- Include timezone handling
- Add event sharing between users
- Implement event search functionality
- Add event export (iCal format)
- Add rate limiting for production use