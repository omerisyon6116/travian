# Multi-Bot Automation System

## Overview

This is a sophisticated multi-bot automation system that simulates Docker Compose behavior with multiple bot instances. Each bot connects to a VPN and runs Puppeteer automation scripts to simulate realistic user behaviors across different websites. The system includes a web-based dashboard for monitoring and controlling bot instances.

## System Architecture

### Core Components
- **Node.js Backend**: Express.js server providing REST API and serving the web dashboard
- **Bot Management System**: Orchestrates multiple bot instances with individual configurations
- **Puppeteer Integration**: Headless browser automation for realistic web interaction
- **VPN Management**: Each bot connects through different VPN configurations for anonymity
- **Script Engine**: Weighted random selection and execution of user behavior scripts
- **Web Dashboard**: Real-time monitoring and control interface

### Architecture Pattern
The system follows a microservices-inspired architecture where each bot operates as an independent instance with its own VPN connection, browser session, and behavior scripts. The central BotManager coordinates all instances while maintaining isolation between them.

## Key Components

### BotManager (`src/BotManager.js`)
- **Purpose**: Centralized orchestration of all bot instances
- **Responsibilities**: Load configurations, initialize bots, manage lifecycle operations
- **Configuration Source**: `configs/bot-configs.json`

### BotInstance (`src/BotInstance.js`)
- **Purpose**: Individual bot lifecycle management
- **Key Features**: VPN connection, browser launch, script execution, status tracking
- **Isolation**: Each instance operates independently with its own resources

### VPNManager (`src/VPNManager.js`)
- **Purpose**: Handle VPN connections for geographic distribution
- **Current Implementation**: Simulated VPN connections (ready for real OpenVPN integration)
- **Future Enhancement**: Full OpenVPN client integration in containerized environment

### ScriptEngine (`src/ScriptEngine.js`)
- **Purpose**: Load and execute user behavior scripts with weighted selection
- **Script Types**: Social media, e-commerce, news browsing, research, entertainment
- **Selection Algorithm**: Weighted random selection based on script importance

### Web Dashboard (`web/`)
- **Technology**: Bootstrap 5, Vanilla JavaScript, Feather Icons
- **Features**: Real-time status monitoring, individual bot control, system overview metrics
- **API Integration**: RESTful communication with backend

## Data Flow

1. **Initialization**: BotManager loads configurations from JSON file
2. **Bot Startup**: Individual bots connect to VPN, launch browser, load scripts
3. **Script Execution**: ScriptEngine selects and runs behavior scripts with delays
4. **Monitoring**: Web dashboard polls system status every 5 seconds
5. **Control**: Users can start/stop individual bots or all bots via dashboard

## External Dependencies

### Core Technologies
- **Express.js**: Web server and API framework
- **Puppeteer**: Headless browser automation
- **Bootstrap 5**: Frontend UI framework
- **Feather Icons**: Icon library for dashboard

### Infrastructure Requirements
- **OpenVPN**: VPN client for production deployment (currently simulated)
- **Docker**: Container orchestration (system designed for containerization)
- **Node.js Runtime**: Version 14+ recommended

### Bot Behavior Scripts
- **Social Media**: Reddit browsing simulation
- **E-commerce**: Amazon shopping patterns
- **News**: BBC, Reuters, CNN browsing
- **Research**: Google academic searches
- **Entertainment**: YouTube, Twitch interaction

## Deployment Strategy

### Current Setup
- **Development Mode**: Local execution with simulated VPN connections
- **Web Interface**: Accessible on port 5000 (configurable via PORT environment variable)
- **Logging**: File-based logging with console output

### Production Considerations
- **Containerization**: Docker Compose setup for multi-container deployment
- **VPN Integration**: Real OpenVPN configurations required
- **Resource Management**: CPU and memory limits per bot instance
- **Scaling**: Horizontal scaling through additional bot configurations

### Security Measures
- **VPN Isolation**: Each bot uses different geographic endpoints
- **User Agent Rotation**: Diverse browser fingerprints per bot
- **Request Timing**: Randomized delays to avoid detection
- **Headless Operation**: No GUI dependencies for server deployment

## Changelog

```
Changelog:
- July 08, 2025. Initial setup complete with full Docker Compose architecture
- July 08, 2025. Added complete Docker orchestration with 5 bot containers and dashboard
- July 08, 2025. Implemented real OpenVPN integration for each bot container
- July 08, 2025. Created advanced Tampermonkey-like behavior scripts
- July 08, 2025. Added automated setup script (run-setup.sh) for easy deployment
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```