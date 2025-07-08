const puppeteer = require('puppeteer');
const VPNManager = require('./VPNManager');
const ScriptEngine = require('./ScriptEngine');
const Logger = require('./utils/Logger');

class BotInstance {
    constructor(config) {
        this.config = config;
        this.logger = new Logger(`BOT_${config.id}`);
        this.vpnManager = new VPNManager(config.vpnConfig);
        this.scriptEngine = new ScriptEngine(config.scripts);
        this.browser = null;
        this.page = null;
        this.status = 'stopped';
        this.startTime = null;
        this.lastActivity = null;
        this.logs = [];
        this.currentScript = null;
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) {
            this.logger.warn('Bot is already running');
            return;
        }

        try {
            this.status = 'starting';
            this.startTime = new Date();
            this.isRunning = true;
            
            this.logger.info('Starting bot instance...');
            
            // Step 1: Connect to VPN
            this.logger.info('Connecting to VPN...');
            await this.vpnManager.connect();
            this.logger.info('VPN connected successfully');
            
            // Step 2: Launch headless browser
            this.logger.info('Launching headless browser...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
            
            this.page = await this.browser.newPage();
            
            // Set user agent and viewport
            await this.page.setUserAgent(this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await this.page.setViewport({ 
                width: this.config.viewport?.width || 1920, 
                height: this.config.viewport?.height || 1080 
            });
            
            this.logger.info('Browser launched successfully');
            
            // Step 3: Start script execution loop
            this.status = 'running';
            this.runScriptLoop();
            
        } catch (error) {
            this.logger.error('Failed to start bot:', error);
            this.status = 'error';
            await this.cleanup();
            throw error;
        }
    }

    async stop() {
        this.logger.info('Stopping bot instance...');
        this.isRunning = false;
        this.status = 'stopping';
        
        await this.cleanup();
        this.status = 'stopped';
        this.logger.info('Bot stopped successfully');
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.page = null;
            }
            
            await this.vpnManager.disconnect();
            
        } catch (error) {
            this.logger.error('Error during cleanup:', error);
        }
    }

    async runScriptLoop() {
        while (this.isRunning) {
            try {
                // Get next script to run
                const script = this.scriptEngine.getNextScript();
                if (!script) {
                    this.logger.warn('No scripts available, waiting...');
                    await this.sleep(30000); // Wait 30 seconds
                    continue;
                }
                
                this.currentScript = script.name;
                this.lastActivity = new Date();
                
                this.logger.info(`Executing script: ${script.name}`);
                
                // Execute the script
                await this.scriptEngine.executeScript(script, this.page);
                
                this.logger.info(`Script completed: ${script.name}`);
                
                // Wait before next script
                const delay = this.config.scriptDelay || 60000; // Default 1 minute
                const randomDelay = delay + Math.random() * delay; // Add randomness
                await this.sleep(randomDelay);
                
            } catch (error) {
                this.logger.error('Error in script loop:', error);
                this.status = 'error';
                
                // Wait before retrying
                await this.sleep(30000);
                
                if (this.isRunning) {
                    this.status = 'running';
                }
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            status: this.status,
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
            lastActivity: this.lastActivity,
            vpnConnected: this.vpnManager.isConnected(),
            currentScript: this.currentScript
        };
    }

    getLogs() {
        return this.logs.slice(-100); // Return last 100 log entries
    }

    addLog(level, message) {
        this.logs.push({
            timestamp: new Date(),
            level,
            message
        });
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
    }
}

module.exports = BotInstance;
