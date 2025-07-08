const express = require('express');
const path = require('path');
const Logger = require('./src/utils/Logger');

const logger = new Logger('SERVER');

const app = express();

// Serve static files from web directory
app.use(express.static('web'));
app.use(express.json());

// Root route - serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'dashboard.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Dashboard server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
