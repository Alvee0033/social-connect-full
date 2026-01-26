require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/db');
const { setupSocketHandlers } = require('./src/sockets/chat.socket');

// Connect to Database and sync models
const initializeDatabase = async () => {
    await connectDB();
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
};

initializeDatabase();

let server;

// Check if SSL certificates exist, use HTTPS if they do, otherwise use HTTP
if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
    const options = {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert'),
    };
    server = https.createServer(options, app);
    console.log('Starting with HTTPS');
} else {
    server = http.createServer(app);
    console.log('Starting with HTTP (no SSL certificates found)');
}

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Setup socket handlers for real-time messaging
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

