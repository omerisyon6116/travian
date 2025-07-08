#!/usr/bin/env node

/**
 * Standalone Dashboard for Docker Container
 * Monitors Docker bot containers via Docker API
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const Logger = require('../src/utils/Logger');

const logger = new Logger('DASHBOARD');

class DockerDashboard {
    constructor() {
        this.app = express();
        this.bots = new Map();
        this.setupRoutes();
        this.initializeBotMonitoring();
    }

    setupRoutes() {
        // Serve static files
        this.app.use(express.static('web'));
        this.app.use(express.json());

        // API endpoints
        this.app.get('/api/status', (req, res) => {
            res.json(this.getSystemStatus());
        });

        this.app.post('/api/start-bot/:id', async (req, res) => {
            try {
                await this.startDockerBot(req.params.id);
                res.json({ success: true, message: `Bot ${req.params.id} start requested` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/stop-bot/:id', async (req, res) => {
            try {
                await this.stopDockerBot(req.params.id);
                res.json({ success: true, message: `Bot ${req.params.id} stop requested` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/start-all', async (req, res) => {
            try {
                await this.startAllBots();
                res.json({ success: true, message: 'All bots start requested' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/stop-all', async (req, res) => {
            try {
                await this.stopAllBots();
                res.json({ success: true, message: 'All bots stop requested' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/logs/:botId', async (req, res) => {
            try {
                const logs = await this.getBotLogs(req.params.botId);
                res.json({ logs });
            } catch (error) {
                res.json({ logs: [] });
            }
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Root route
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'web', 'dashboard.html'));
        });
    }

    async initializeBotMonitoring() {
        // Initialize bot status tracking
        const botConfigs = [
            { id: 'bot-001', name: 'Social Media Explorer', container: 'social-media-bot' },
            { id: 'bot-002', name: 'E-commerce Shopper', container: 'ecommerce-bot' },
            { id: 'bot-003', name: 'News Reader', container: 'news-bot' },
            { id: 'bot-004', name: 'Research Assistant', container: 'research-bot' },
            { id: 'bot-005', name: 'Entertainment Seeker', container: 'entertainment-bot' }
        ];

        for (const config of botConfigs) {
            this.bots.set(config.id, {
                id: config.id,
                name: config.name,
                container: config.container,
                status: 'stopped',
                startTime: null,
                lastActivity: null,
                vpnConnected: false,
                currentScript: null,
                logs: []
            });
        }

        // Start monitoring containers
        this.startContainerMonitoring();
    }

    startContainerMonitoring() {
        // Monitor container status every 10 seconds
        setInterval(async () => {
            await this.updateContainerStatus();
        }, 10000);

        // Initial status check
        setTimeout(() => this.updateContainerStatus(), 2000);
    }

    async updateContainerStatus() {
        try {
            for (const [botId, bot] of this.bots) {
                const containerStatus = await this.getContainerStatus(bot.container);
                
                if (containerStatus) {
                    bot.status = containerStatus.running ? 'running' : 'stopped';
                    bot.startTime = containerStatus.startTime;
                    bot.vpnConnected = containerStatus.running; // Assume VPN is connected if container is running
                    
                    if (containerStatus.running && !bot.lastActivity) {
                        bot.lastActivity = new Date();
                    }
                    
                    // Update current script based on container logs
                    bot.currentScript = await this.getCurrentScript(bot.container);
                }
            }
        } catch (error) {
            logger.error('Error updating container status:', error);
        }
    }

    async getContainerStatus(containerName) {
        try {
            // Use docker command to check container status
            const { exec } = require('child_process');
            
            return new Promise((resolve) => {
                exec(`docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.RunningFor}}" | grep ${containerName}`, (error, stdout) => {
                    if (error || !stdout.trim()) {
                        resolve({ running: false, startTime: null });
                        return;
                    }
                    
                    const isRunning = stdout.includes('Up');
                    const startTime = isRunning ? new Date(Date.now() - 60000) : null; // Approximate
                    
                    resolve({ running: isRunning, startTime });
                });
            });
        } catch (error) {
            logger.error(`Error checking container ${containerName}:`, error);
            return { running: false, startTime: null };
        }
    }

    async getCurrentScript(containerName) {
        try {
            // Try to get current script from container logs
            const { exec } = require('child_process');
            
            return new Promise((resolve) => {
                exec(`docker logs --tail 5 ${containerName} 2>/dev/null | grep "Executing script" | tail -1`, (error, stdout) => {
                    if (error || !stdout.trim()) {
                        resolve(null);
                        return;
                    }
                    
                    const match = stdout.match(/Executing script: (.+)/);
                    resolve(match ? match[1] : null);
                });
            });
        } catch (error) {
            return null;
        }
    }

    async startDockerBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }

        logger.info(`Starting Docker container: ${bot.container}`);
        
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec(`docker start ${bot.container}`, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Failed to start container ${bot.container}:`, error);
                    reject(error);
                } else {
                    logger.info(`Container ${bot.container} start requested`);
                    resolve();
                }
            });
        });
    }

    async stopDockerBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }

        logger.info(`Stopping Docker container: ${bot.container}`);
        
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec(`docker stop ${bot.container}`, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Failed to stop container ${bot.container}:`, error);
                    reject(error);
                } else {
                    logger.info(`Container ${bot.container} stop requested`);
                    resolve();
                }
            });
        });
    }

    async startAllBots() {
        const promises = Array.from(this.bots.keys()).map(botId => this.startDockerBot(botId));
        await Promise.allSettled(promises);
    }

    async stopAllBots() {
        const promises = Array.from(this.bots.keys()).map(botId => this.stopDockerBot(botId));
        await Promise.allSettled(promises);
    }

    async getBotLogs(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            return [];
        }

        try {
            const { exec } = require('child_process');
            
            return new Promise((resolve) => {
                exec(`docker logs --tail 50 ${bot.container} 2>/dev/null`, (error, stdout) => {
                    if (error || !stdout) {
                        resolve([]);
                        return;
                    }
                    
                    const logs = stdout.split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                            const match = line.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?)\] \[(\w+)\] \[(.+?)\] (.+)/);
                            if (match) {
                                return {
                                    timestamp: match[1],
                                    level: match[2],
                                    component: match[3],
                                    message: match[4]
                                };
                            }
                            return {
                                timestamp: new Date().toISOString(),
                                level: 'INFO',
                                component: 'CONTAINER',
                                message: line
                            };
                        })
                        .slice(-20); // Last 20 logs
                    
                    resolve(logs);
                });
            });
        } catch (error) {
            logger.error(`Error getting logs for ${botId}:`, error);
            return [];
        }
    }

    getSystemStatus() {
        const status = {
            totalBots: this.bots.size,
            running: 0,
            stopped: 0,
            error: 0,
            bots: []
        };

        for (const [id, bot] of this.bots) {
            const botStatus = {
                id,
                name: bot.name,
                status: bot.status,
                uptime: bot.startTime ? Date.now() - bot.startTime.getTime() : 0,
                lastActivity: bot.lastActivity,
                vpnConnected: bot.vpnConnected,
                currentScript: bot.currentScript
            };

            status.bots.push(botStatus);

            if (bot.status === 'running') status.running++;
            else if (bot.status === 'error') status.error++;
            else status.stopped++;
        }

        return status;
    }

    start() {
        const PORT = process.env.PORT || 5000;
        this.app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Docker Dashboard running on http://0.0.0.0:${PORT}`);
        });
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('Dashboard received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Dashboard received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start the dashboard
const dashboard = new DockerDashboard();
dashboard.start();