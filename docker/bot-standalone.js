#!/usr/bin/env node

/**
 * Standalone Bot Instance for Docker Container
 * Runs a single bot with VPN connection
 */

const BotInstance = require('../src/BotInstance');
const VPNManager = require('../src/VPNManager');
const ScriptEngine = require('../src/ScriptEngine');
const Logger = require('../src/utils/Logger');

const logger = new Logger('DOCKER_BOT');

class DockerBot {
    constructor() {
        this.botId = process.env.BOT_ID || 'bot-unknown';
        this.botName = process.env.BOT_NAME || 'Unknown Bot';
        this.vpnConfig = process.env.VPN_CONFIG;
        this.scriptDelay = parseInt(process.env.SCRIPT_DELAY) || 60000;
        
        this.initializeBot();
    }

    initializeBot() {
        // Create bot configuration from environment
        const config = {
            id: this.botId,
            name: this.botName,
            vpnConfig: {
                configFile: this.vpnConfig,
                server: 'docker-vpn-server',
                expectedIP: 'dynamic'
            },
            userAgent: this.generateUserAgent(),
            viewport: this.generateViewport(),
            scriptDelay: this.scriptDelay,
            scripts: this.getScriptConfig()
        };

        logger.info(`Initializing Docker bot: ${this.botName} (${this.botId})`);
        this.bot = new BotInstance(config);
    }

    generateUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    generateViewport() {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1440, height: 900 },
            { width: 1600, height: 900 },
            { width: 768, height: 1024 }
        ];
        return viewports[Math.floor(Math.random() * viewports.length)];
    }

    getScriptConfig() {
        // Define scripts based on bot type
        const scriptConfigs = {
            'bot-001': [
                { name: 'social-media', file: 'user-behaviors/social-media.js', weight: 3 },
                { name: 'entertainment', file: 'user-behaviors/entertainment.js', weight: 2 }
            ],
            'bot-002': [
                { name: 'ecommerce', file: 'user-behaviors/ecommerce.js', weight: 4 },
                { name: 'research', file: 'user-behaviors/research.js', weight: 1 }
            ],
            'bot-003': [
                { name: 'news-browsing', file: 'user-behaviors/news-browsing.js', weight: 5 },
                { name: 'research', file: 'user-behaviors/research.js', weight: 2 }
            ],
            'bot-004': [
                { name: 'research', file: 'user-behaviors/research.js', weight: 4 },
                { name: 'news-browsing', file: 'user-behaviors/news-browsing.js', weight: 1 }
            ],
            'bot-005': [
                { name: 'entertainment', file: 'user-behaviors/entertainment.js', weight: 5 },
                { name: 'social-media', file: 'user-behaviors/social-media.js', weight: 2 }
            ]
        };

        return scriptConfigs[this.botId] || [
            { name: 'research', file: 'user-behaviors/research.js', weight: 1 }
        ];
    }

    async start() {
        try {
            logger.info('Starting Docker bot instance...');
            
            // Wait a bit to ensure VPN is fully established
            await this.sleep(10000);
            
            // Start the bot
            await this.bot.start();
            
            logger.info('Docker bot started successfully');
            
            // Keep the process running
            this.keepAlive();
            
        } catch (error) {
            logger.error('Failed to start Docker bot:', error);
            process.exit(1);
        }
    }

    async stop() {
        logger.info('Stopping Docker bot...');
        if (this.bot) {
            await this.bot.stop();
        }
        process.exit(0);
    }

    keepAlive() {
        // Keep the process alive and monitor bot status
        setInterval(() => {
            const status = this.bot.getStatus();
            logger.info(`Bot status: ${status.status}, Uptime: ${Math.floor(status.uptime / 1000)}s`);
            
            if (status.status === 'error') {
                logger.warn('Bot in error state, attempting restart...');
                setTimeout(() => {
                    this.restartBot();
                }, 30000);
            }
        }, 300000); // Check every 5 minutes
    }

    async restartBot() {
        try {
            logger.info('Restarting bot...');
            await this.bot.stop();
            await this.sleep(5000);
            await this.bot.start();
            logger.info('Bot restarted successfully');
        } catch (error) {
            logger.error('Failed to restart bot:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    if (dockerBot) {
        await dockerBot.stop();
    }
});

process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    if (dockerBot) {
        await dockerBot.stop();
    }
});

// Start the Docker bot
const dockerBot = new DockerBot();
dockerBot.start();