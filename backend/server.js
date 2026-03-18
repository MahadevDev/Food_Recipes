// server/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const registerRoutes = require('./routes/Register');
const recipeRoutes = require('./routes/recipeRoutes');
const loginRoutes = require('./routes/Login');
const forgotPasswordRoutes = require('./routes/forgotpassword');

const app = express();

// === CORS Middleware ===

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : [
      '',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://food-recipes-2-u6ck.onrender.com'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log for debugging
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests safely
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
});

// === Built-in Middleware ===

app.use(express.json()); // Parse incoming JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files with absolute path

// === Test Route ===

app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Backend Running' });
});

// === Connect to MongoDB ===

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(mongoURI)
.then(() => console.log(' MongoDB connected'))
.catch(err => {
  console.error(' MongoDB connection error:', err.message);
});

// === API Routes ===

app.use('/auth', registerRoutes);
app.use('/auth', loginRoutes);
app.use('/auth', forgotPasswordRoutes);
app.use('/auth', recipeRoutes);

// === Start Server ===

const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(` Port ${PORT} is already in use`);
    console.log(` Trying to find process using port ${PORT}...`);
    
    // Try to find and kill process using port
    const { exec } = require('child_process');
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.includes(`:${PORT}`)) {
              const parts = line.trim().split(/\s+/);
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(pid)) {
                console.log(` Found process ${pid} using port ${PORT}, terminating...`);
                exec(`taskkill /PID ${pid} /F`, (killErr) => {
                  if (!killErr) {
                    console.log(` Process ${pid} terminated. Restarting server...`);
                    setTimeout(() => {
                      server.listen(PORT);
                    }, 1000);
                  } else {
                    console.error(` Failed to terminate process ${pid}`);
                  }
                });
                return;
              }
            }
          }
        }
        console.error(` No process found using port ${PORT}. Please check manually.`);
      });
    }
  } else {
    console.error(' Server error:', error);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});