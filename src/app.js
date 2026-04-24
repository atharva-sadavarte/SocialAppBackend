const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to the database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for health check
app.get('/', (req, res) => {
  res.send('Social App API is running...');
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));

module.exports = app;
