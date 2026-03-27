require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'AI Chat App API is running.' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error.' });
});

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`\n🚀 AI Chat Server running on port ${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/`);
        console.log(`   Auth:   http://localhost:${PORT}/auth`);
        console.log(`   Chats:  http://localhost:${PORT}/chats`);
        console.log(`   Stream: http://localhost:${PORT}/messages/chat/stream\n`);
    });
};

startServer();
