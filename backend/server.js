const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// DNS Configuration for MongoDB connection
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ==================== MIDDLEWARE ====================
// CORS Configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://albuera-emergency-system.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON and URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================
async function connectDB() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📦 Database: ${mongoose.connection.db.getName()}`);
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'Connected' : 'Disconnected',
        uptime: process.uptime()
    });
});

// ==================== TEST ENDPOINT ====================
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'This is a test endpoint.',
        apiVersion: '1.0.0',
        service: 'Albuera Emergency Management System'
    });
});

// ==================== API ROUTES ====================
try {
    const authRoutes = require('./routes/authroutes');
    const newsRoutes = require('./routes/newsroutes');
    const reportRoutes = require('./routes/reportroutes');
    const notificationRoutes = require('./routes/notificationroutes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/news', newsRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/notifications', notificationRoutes);
    
    console.log('✅ All routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
}

// ==================== 404 HANDLER ====================
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The requested endpoint ${req.method} ${req.path} does not exist`,
        availableEndpoints: {
            health: 'GET /health',
            test: 'GET /test',
            auth: 'POST /api/auth/*',
            news: 'GET/POST /api/news/*',
            reports: 'GET/POST /api/reports/*',
            notifications: 'GET/POST /api/notifications/*'
        }
    });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error('❌ Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
        error: 'Internal Server Error',
        message: isDevelopment ? err.message : 'Something went wrong',
        ...(isDevelopment && { stack: err.stack })
    });
});

// ==================== SERVER STARTUP ====================
async function startServer() {
    try {
        // Connect to database first
        const dbConnected = await connectDB();
        
        if (!dbConnected) {
            console.warn('⚠️  Warning: Server starting without database connection');
        }

        // Start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════');
            console.log('🚀 Albuera Emergency Management System');
            console.log('═══════════════════════════════════════════════════');
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`📍 API Base URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log('═══════════════════════════════════════════════════');
            console.log('');
            
            // Database Status
            if (mongoose.connection.readyState === 1) {
                console.log('✅ Database Connection: Active');
                console.log(`📊 Database: ${mongoose.connection.db.getName()}`);
            } else {
                console.log('❌ Database Connection: Inactive');
            }
            
            console.log('');
        });
    } catch (error) {
        console.error('❌ Server Startup Error:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    mongoose.connection.close();
    process.exit(0);
});

module.exports = app;