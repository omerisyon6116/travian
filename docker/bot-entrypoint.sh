#!/bin/bash

# Bot Container Entrypoint Script
# Handles VPN connection and bot startup

set -e

echo "Starting Bot Container: $BOT_ID"
echo "Bot Name: $BOT_NAME"
echo "VPN Config: $VPN_CONFIG"

# Function to check if VPN is connected
check_vpn_connection() {
    if pgrep openvpn > /dev/null; then
        echo "VPN process is running"
        return 0
    else
        echo "VPN process not found"
        return 1
    fi
}

# Function to start VPN connection
start_vpn() {
    echo "Starting VPN connection..."
    
    # Check if config file exists
    if [ ! -f "$VPN_CONFIG" ]; then
        echo "ERROR: VPN config file not found: $VPN_CONFIG"
        exit 1
    fi
    
    # Check if auth file exists
    if [ ! -f "$VPN_AUTH_FILE" ]; then
        echo "ERROR: VPN auth file not found: $VPN_AUTH_FILE"
        exit 1
    fi
    
    # Start OpenVPN in background
    echo "Connecting to VPN using config: $VPN_CONFIG"
    sudo openvpn --config "$VPN_CONFIG" --auth-user-pass "$VPN_AUTH_FILE" --daemon --log /tmp/openvpn.log
    
    # Wait for VPN connection
    echo "Waiting for VPN connection..."
    for i in {1..60}; do
        if check_vpn_connection; then
            echo "VPN connected successfully"
            sleep 5  # Give extra time for routes to be established
            break
        fi
        
        if [ $i -eq 60 ]; then
            echo "ERROR: VPN connection timeout"
            cat /tmp/openvpn.log
            exit 1
        fi
        
        echo "Waiting for VPN... ($i/60)"
        sleep 2
    done
    
    # Verify IP change
    echo "Checking public IP..."
    CURRENT_IP=$(curl -s https://ipinfo.io/ip || echo "unknown")
    echo "Current public IP: $CURRENT_IP"
}

# Function to cleanup on exit
cleanup() {
    echo "Cleaning up..."
    if pgrep openvpn > /dev/null; then
        echo "Stopping VPN..."
        sudo pkill openvpn
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGTERM SIGINT EXIT

# Start VPN connection
start_vpn

# Verify VPN is working
if ! check_vpn_connection; then
    echo "ERROR: VPN connection failed"
    exit 1
fi

echo "Bot container ready. Starting bot application..."

# Execute the main command
exec "$@"