const BotInstance = require('./BotInstance');
const Logger = require('./utils/Logger');
const fs = require('fs').promises;
const path = require('path');

class BotManager {
    constructor() {
        this.bots = new Map();
        this.logger = new Logger('BOT_MANAGER');
        this.configs = null;
    }

    async initialize() {
        try {
            // Load bot configurations
            const configData = await fs.readFile('configs/bot-configs.json', 'utf8');
            this.configs = JSON.parse(configData);
            
            this.logger.info(`Loaded ${this.configs.bots.length} bot configurations`);
            
            // Initialize bot instances
            for (const config of this.configs.bots) {
                const bot = new BotInstance(config);
                this.bots.set(config.id, bot);
                this.logger.info(`Initialized bot: ${config.id} (${config.name})`);
            }
            
        } catch (error) {
            this.logger.error('Failed to initialize bot manager:', error);
            throw error;
        }
    }

    async startBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }
        
        this.logger.info(`Starting bot: ${botId}`);
        await bot.start();
    }

    async stopBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }
        
        this.logger.info(`Stopping bot: ${botId}`);
        await bot.stop();
    }

    async startAllBots() {
        this.logger.info('Starting all bots...');
        const promises = Array.from(this.bots.values()).map(bot => bot.start());
        await Promise.allSettled(promises);
    }

    async stopAllBots() {
        this.logger.info('Stopping all bots...');
        const promises = Array.from(this.bots.values()).map(bot => bot.stop());
        await Promise.allSettled(promises);
    }

    getStatus() {
        const status = {
            totalBots: this.bots.size,
            running: 0,
            stopped: 0,
            error: 0,
            bots: []
        };

        for (const [id, bot] of this.bots) {
            const botStatus = bot.getStatus();
            status.bots.push({
                id,
                name: bot.config.name,
                status: botStatus.status,
                uptime: botStatus.uptime,
                lastActivity: botStatus.lastActivity,
                vpnConnected: botStatus.vpnConnected,
                currentScript: botStatus.currentScript
            });

            if (botStatus.status === 'running') status.running++;
            else if (botStatus.status === 'error') status.error++;
            else status.stopped++;
        }

        return status;
    }

    getBotLogs(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            return [];
        }
        return bot.getLogs();
    }
}

module.exports = BotManager;
