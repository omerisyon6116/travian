const fs = require('fs').promises;
const path = require('path');
const Logger = require('./utils/Logger');

class ScriptEngine {
    constructor(scriptConfigs) {
        this.scriptConfigs = scriptConfigs || [];
        this.logger = new Logger('SCRIPT_ENGINE');
        this.loadedScripts = new Map();
        this.currentScriptIndex = 0;
    }

    async loadScripts() {
        for (const scriptConfig of this.scriptConfigs) {
            try {
                const scriptPath = path.join('scripts', scriptConfig.file);
                const scriptContent = await fs.readFile(scriptPath, 'utf8');
                
                // Create script function
                const scriptFunction = new Function('page', 'config', 'logger', scriptContent);
                
                this.loadedScripts.set(scriptConfig.name, {
                    name: scriptConfig.name,
                    function: scriptFunction,
                    config: scriptConfig,
                    weight: scriptConfig.weight || 1
                });
                
                this.logger.info(`Loaded script: ${scriptConfig.name}`);
                
            } catch (error) {
                this.logger.error(`Failed to load script ${scriptConfig.name}:`, error);
            }
        }
    }

    getNextScript() {
        if (this.loadedScripts.size === 0) {
            return null;
        }

        // Weighted random selection
        const scripts = Array.from(this.loadedScripts.values());
        const totalWeight = scripts.reduce((sum, script) => sum + script.weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (const script of scripts) {
            random -= script.weight;
            if (random <= 0) {
                return script;
            }
        }
        
        // Fallback to first script
        return scripts[0];
    }

    async executeScript(script, page) {
        try {
            this.logger.info(`Executing script: ${script.name}`);
            
            // Execute the script function
            await script.function(page, script.config, this.logger);
            
            this.logger.info(`Script executed successfully: ${script.name}`);
            
        } catch (error) {
            this.logger.error(`Script execution failed: ${script.name}`, error);
            throw error;
        }
    }
}

module.exports = ScriptEngine;
