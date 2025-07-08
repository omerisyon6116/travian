let currentBotId = null;
let systemStatus = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    loadSystemStatus();
    
    // Refresh data every 5 seconds
    setInterval(loadSystemStatus, 5000);
});

async function loadSystemStatus() {
    try {
        const response = await fetch('/api/status');
        systemStatus = await response.json();
        
        updateOverviewCards();
        updateBotGrid();
        
    } catch (error) {
        console.error('Failed to load system status:', error);
        showError('Failed to connect to bot system');
    }
}

function updateOverviewCards() {
    if (!systemStatus) return;
    
    document.getElementById('totalBots').textContent = systemStatus.totalBots;
    document.getElementById('runningBots').textContent = systemStatus.running;
    document.getElementById('stoppedBots').textContent = systemStatus.stopped;
    document.getElementById('errorBots').textContent = systemStatus.error;
}

function updateBotGrid() {
    if (!systemStatus) return;
    
    const botGrid = document.getElementById('botGrid');
    botGrid.innerHTML = '';
    
    systemStatus.bots.forEach(bot => {
        const botCard = createBotCard(bot);
        botGrid.appendChild(botCard);
    });
}

function createBotCard(bot) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-3';
    
    const statusColor = getStatusColor(bot.status);
    const statusIcon = getStatusIcon(bot.status);
    const vpnIcon = bot.vpnConnected ? 'shield' : 'shield-off';
    const vpnColor = bot.vpnConnected ? 'text-success' : 'text-danger';
    
    col.innerHTML = `
        <div class="card bot-card" onclick="openBotDetails('${bot.id}')">
            <div class="card-header d-flex justify-content-between align-items-center">
                <strong>${bot.name}</strong>
                <span class="badge bg-${statusColor}">
                    <i data-feather="${statusIcon}" style="width: 14px; height: 14px;"></i>
                    ${bot.status}
                </span>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-4">
                        <div class="metric">
                            <i data-feather="${vpnIcon}" class="${vpnColor}"></i>
                            <small class="d-block">VPN</small>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="metric">
                            <strong>${formatUptime(bot.uptime)}</strong>
                            <small class="d-block">Uptime</small>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="metric">
                            <i data-feather="code" class="text-primary"></i>
                            <small class="d-block">Script</small>
                        </div>
                    </div>
                </div>
                ${bot.currentScript ? `
                    <div class="mt-2">
                        <small class="text-muted">Current: ${bot.currentScript}</small>
                    </div>
                ` : ''}
                <div class="mt-2">
                    <small class="text-muted">
                        Last activity: ${formatTime(bot.lastActivity)}
                    </small>
                </div>
            </div>
            <div class="card-footer">
                <div class="btn-group w-100">
                    <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); startBot('${bot.id}')" ${bot.status === 'running' ? 'disabled' : ''}>
                        <i data-feather="play" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); stopBot('${bot.id}')" ${bot.status === 'stopped' ? 'disabled' : ''}>
                        <i data-feather="stop-circle" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-info btn-sm" onclick="event.stopPropagation(); openBotDetails('${bot.id}')">
                        <i data-feather="info" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Replace feather icons
    setTimeout(() => feather.replace(), 0);
    
    return col;
}

function getStatusColor(status) {
    switch (status) {
        case 'running': return 'success';
        case 'stopped': return 'secondary';
        case 'starting': return 'warning';
        case 'stopping': return 'warning';
        case 'error': return 'danger';
        default: return 'secondary';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'running': return 'play-circle';
        case 'stopped': return 'pause-circle';
        case 'starting': return 'loader';
        case 'stopping': return 'loader';
        case 'error': return 'alert-circle';
        default: return 'circle';
    }
}

function formatUptime(uptime) {
    if (!uptime) return '0s';
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function formatTime(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
        return 'Just now';
    } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}m ago`;
    } else {
        return date.toLocaleTimeString();
    }
}

async function startBot(botId) {
    try {
        const response = await fetch(`/api/start-bot/${botId}`, { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            loadSystemStatus();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to start bot');
    }
}

async function stopBot(botId) {
    try {
        const response = await fetch(`/api/stop-bot/${botId}`, { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            loadSystemStatus();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to stop bot');
    }
}

async function startAllBots() {
    try {
        const response = await fetch('/api/start-all', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            loadSystemStatus();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to start all bots');
    }
}

async function stopAllBots() {
    try {
        const response = await fetch('/api/stop-all', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message);
            loadSystemStatus();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Failed to stop all bots');
    }
}

async function openBotDetails(botId) {
    currentBotId = botId;
    const bot = systemStatus.bots.find(b => b.id === botId);
    
    if (!bot) return;
    
    document.getElementById('botModalTitle').textContent = `${bot.name} (${bot.id})`;
    
    // Update bot details
    const detailsContainer = document.getElementById('botDetails');
    detailsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <strong>Status:</strong> 
                <span class="badge bg-${getStatusColor(bot.status)}">${bot.status}</span>
            </div>
            <div class="col-md-6">
                <strong>VPN:</strong> 
                <span class="badge bg-${bot.vpnConnected ? 'success' : 'danger'}">
                    ${bot.vpnConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6">
                <strong>Uptime:</strong> ${formatUptime(bot.uptime)}
            </div>
            <div class="col-md-6">
                <strong>Current Script:</strong> ${bot.currentScript || 'None'}
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-12">
                <strong>Last Activity:</strong> ${formatTime(bot.lastActivity)}
            </div>
        </div>
    `;
    
    // Load bot logs
    await loadBotLogs(botId);
    
    // Update modal buttons
    const startBtn = document.getElementById('startBotBtn');
    const stopBtn = document.getElementById('stopBotBtn');
    
    startBtn.disabled = bot.status === 'running';
    stopBtn.disabled = bot.status === 'stopped';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('botModal'));
    modal.show();
}

async function loadBotLogs(botId) {
    try {
        const response = await fetch(`/api/logs/${botId}`);
        const result = await response.json();
        
        const logsContainer = document.getElementById('botLogs');
        
        if (result.logs && result.logs.length > 0) {
            logsContainer.innerHTML = result.logs.map(log => `
                <div class="log-entry log-${log.level.toLowerCase()}">
                    <span class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="log-level">[${log.level}]</span>
                    <span class="log-message">${log.message}</span>
                </div>
            `).join('');
        } else {
            logsContainer.innerHTML = '<div class="text-muted">No logs available</div>';
        }
        
        // Scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
        
    } catch (error) {
        document.getElementById('botLogs').innerHTML = '<div class="text-danger">Failed to load logs</div>';
    }
}

function startSelectedBot() {
    if (currentBotId) {
        startBot(currentBotId);
    }
}

function stopSelectedBot() {
    if (currentBotId) {
        stopBot(currentBotId);
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'danger');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}
