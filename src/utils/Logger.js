const fs = require('fs');
const path = require('path');

class Logger {
    constructor(component) {
        this.component = component;
        this.logDir = 'logs';
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${level}] [${this.component}] ${message}`;
        
        if (data) {
            return `${formatted} ${JSON.stringify(data)}`;
        }
        
        return formatted;
    }

    writeToFile(level, message, data = null) {
        const formatted = this.formatMessage(level, message, data);
        const logFile = path.join(this.logDir, `${this.component.toLowerCase()}.log`);
        
        fs.appendFileSync(logFile, formatted + '\n');
    }

    info(message, data = null) {
        const formatted = this.formatMessage('INFO', message, data);
        console.log('\x1b[36m%s\x1b[0m', formatted); // Cyan
        this.writeToFile('INFO', message, data);
    }

    warn(message, data = null) {
        const formatted = this.formatMessage('WARN', message, data);
        console.log('\x1b[33m%s\x1b[0m', formatted); // Yellow
        this.writeToFile('WARN', message, data);
    }

    error(message, data = null) {
        const formatted = this.formatMessage('ERROR', message, data);
        console.log('\x1b[31m%s\x1b[0m', formatted); // Red
        this.writeToFile('ERROR', message, data);
    }

    debug(message, data = null) {
        const formatted = this.formatMessage('DEBUG', message, data);
        console.log('\x1b[90m%s\x1b[0m', formatted); // Gray
        this.writeToFile('DEBUG', message, data);
    }
}

module.exports = Logger;
