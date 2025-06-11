const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async initialize() {
    if (!this.db) {
      await this.connect();
    }

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create events table
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        location VARCHAR(255),
        all_day BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createEventsTable, (err) => {
          if (err) {
            console.error('Error creating events table:', err);
            reject(err);
            return;
          }
          console.log('Database tables created successfully');
          resolve();
        });
      });
    });
  }

  // User methods
  createUser(userData) {
    const { username, email, password } = userData;
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [username, email, password], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email });
        }
      });
    });
  }

  getUserByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getUserById(id) {
    const sql = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Event methods
  createEvent(eventData) {
    const { user_id, title, description, start_date, end_date, location, all_day } = eventData;
    const sql = `
      INSERT INTO events (user_id, title, description, start_date, end_date, location, all_day) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [user_id, title, description, start_date, end_date, location, all_day], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...eventData });
        }
      });
    });
  }

  getEventsByUserId(userId, filters = {}) {
    let sql = `SELECT * FROM events WHERE user_id = ?`;
    const params = [userId];

    // Add date filters if provided
    if (filters.start_date) {
      sql += ` AND start_date >= ?`;
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ` AND start_date <= ?`;
      params.push(filters.end_date);
    }

    sql += ` ORDER BY start_date ASC`;
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getEventById(eventId, userId) {
    const sql = `SELECT * FROM events WHERE id = ? AND user_id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [eventId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  updateEvent(eventId, userId, eventData) {
    const { title, description, start_date, end_date, location, all_day } = eventData;
    const sql = `
      UPDATE events 
      SET title = ?, description = ?, start_date = ?, end_date = ?, location = ?, all_day = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [title, description, start_date, end_date, location, all_day, eventId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  deleteEvent(eventId, userId) {
    const sql = `DELETE FROM events WHERE id = ? AND user_id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [eventId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

// Create and export database instance
const database = new Database();

async function initializeDatabase() {
  await database.initialize();
}

module.exports = {
  database,
  initializeDatabase
};