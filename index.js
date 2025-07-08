#!/usr/bin/env node

/**
 * Multi-Bot Automation System
 * Simulates Docker Compose behavior with multiple bot instances
 * Each bot connects to VPN and runs Puppeteer automation scripts
 */

const BotManager = require('./src/BotManager');
const Logger = require('./src/utils/Logger');
const express = require('express');
const path = require('path');

const logger = new Logger('MAIN');

class AutomationSystem {
    constructor() {
        this.botManager = new BotManager();
        this.app = express();
        this.setupWebInterface();
    }

    setupWebInterface() {
        // Serve static files for dashboard
        this.app.use(express.static('web'));
        this.app.use(express.json());

        // API endpoints
        this.app.get('/api/status', (req, res) => {
            res.json(this.botManager.getStatus());
        });

        this.app.post('/api/start-bot/:id', async (req, res) => {
            try {
                await this.botManager.startBot(req.params.id);
                res.json({ success: true, message: `Bot ${req.params.id} started` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/stop-bot/:id', async (req, res) => {
            try {
                await this.botManager.stopBot(req.params.id);
                res.json({ success: true, message: `Bot ${req.params.id} stopped` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/start-all', async (req, res) => {
            try {
                await this.botManager.startAllBots();
                res.json({ success: true, message: 'All bots started' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/stop-all', async (req, res) => {
            try {
                await this.botManager.stopAllBots();
                res.json({ success: true, message: 'All bots stopped' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/logs/:botId', (req, res) => {
            const logs = this.botManager.getBotLogs(req.params.botId);
            res.json({ logs });
        });
    }

    async start() {
        try {
            logger.info('Starting Multi-Bot Automation System...');
            
            // Initialize bot manager
            await this.botManager.initialize();
            
            // Start web interface
            this.app.listen(5000, '0.0.0.0', () => {
                logger.info('Web dashboard available at http://0.0.0.0:5000');
            });

            // Handle graceful shutdown
            process.on('SIGINT', async () => {
                logger.info('Shutting down system...');
                await this.botManager.stopAllBots();
                process.exit(0);
            });

            logger.info('System initialized successfully');
            
        } catch (error) {
            logger.error('Failed to start system:', error);
            process.exit(1);
        }
    }
}

// Start the system
const system = new AutomationSystem();
system.start();
