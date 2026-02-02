const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const visibilityRoutes = require('./routes/visibilityRoutes');
require('dotenv').config();

// Database connection
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const recordsRoutes = require('./routes/recordsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const remindersRoutes = require('./routes/remindersRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    // In development reflect the requesting origin so mobile devices on the LAN can call the API
    origin: process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || 'http://localhost:3000') : true,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/visibility', visibilityRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Smart Health Vault API'
    });
});

// Emergency public view route (lightweight)
app.get('/emergency/:hash', (req, res) => {
    // This route will be served by frontend for public emergency access
    // Backend only needs to provide the API endpoint
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/${req.params.hash}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});