#!/bin/bash

# ============================================
# InvoiceFBR - Server Monitoring Script
# Monitors CPU, Memory, Disk, PM2, Nginx
# Sends email alerts when thresholds exceeded
# ============================================

# Configuration
EMAIL="zainshahid630@gmail.com"  # CHANGE THIS!
ALERT_LOG="/var/www/inovices/logs/alerts.log"
METRICS_LOG="/var/www/inovices/logs/metrics.log"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=85
PM2_MIN_INSTANCES=6
RESPONSE_TIME_THRESHOLD=2000  # milliseconds

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Create logs directory
mkdir -p /var/www/inovices/logs

# Function to send email alert
send_alert() {
    local subject="$1"
    local message="$2"
    local priority="$3"
    
    echo "$(date): $subject - $message" >> "$ALERT_LOG"
    
    # Send email using mail command
    echo "$message" | mail -s "[$priority] InvoiceFBR Alert: $subject" "$EMAIL"
    
    # Also log to syslog
    logger -t invoicefbr-monitor "$subject: $message"
}

# Function to check CPU usage
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local cpu_int=${cpu_usage%.*}
    
    echo "CPU: ${cpu_usage}%"
    
    if [ "$cpu_int" -gt "$CPU_THRESHOLD" ]; then
        send_alert "High CPU Usage" "CPU usage is at ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)" "CRITICAL"
        return 1
    fi
    return 0
}

# Function to check memory usage
check_memory() {
    local mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    local mem_int=${mem_usage%.*}
    
    echo "Memory: ${mem_usage}%"
    
    if [ "$mem_int" -gt "$MEMORY_THRESHOLD" ]; then
        local mem_details=$(free -h | grep Mem)
        send_alert "High Memory Usage" "Memory usage is at ${mem_usage}% (threshold: ${MEMORY_THRESHOLD}%)\n${mem_details}" "CRITICAL"
        return 1
    fi
    return 0
}

# Function to check disk usage
check_disk() {
    local disk_usage=$(df -h /var/www | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo "Disk: ${disk_usage}%"
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        local disk_details=$(df -h /var/www)
        send_alert "High Disk Usage" "Disk usage is at ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)\n${disk_details}" "WARNING"
        return 1
    fi
    return 0
}

# Function to check PM2 status
check_pm2() {
    local online_instances=$(pm2 jlist | jq '[.[] | select(.pm2_env.status=="online")] | length')
    local total_instances=$(pm2 jlist | jq 'length')
    
    echo "PM2: ${online_instances}/${total_instances} instances online"
    
    if [ "$online_instances" -lt "$PM2_MIN_INSTANCES" ]; then
        local pm2_status=$(pm2 list)
        send_alert "PM2 Instances Down" "Only ${online_instances} PM2 instances online (minimum: ${PM2_MIN_INSTANCES})\n${pm2_status}" "CRITICAL"
        return 1
    fi
    
    # Check for high restart count
    local restarts=$(pm2 jlist | jq '[.[] | .pm2_env.restart_time] | add')
    if [ "$restarts" -gt 50 ]; then
        send_alert "High PM2 Restart Count" "PM2 instances have restarted ${restarts} times. Check for issues." "WARNING"
    fi
    
    return 0
}

# Function to check Nginx status
check_nginx() {
    if ! systemctl is-active --quiet nginx; then
        send_alert "Nginx Down" "Nginx service is not running!" "CRITICAL"
        return 1
    fi
    
    echo "Nginx: Running"
    return 0
}

# Function to check response time
check_response_time() {
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    echo "Response Time: ${response_time}ms (Status: ${response})"
    
    if [ "$response" != "200" ]; then
        send_alert "Health Check Failed" "Health endpoint returned status ${response}" "CRITICAL"
        return 1
    fi
    
    if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
        send_alert "Slow Response Time" "Health endpoint took ${response_time}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)" "WARNING"
        return 1
    fi
    
    return 0
}

# Function to check error rate in logs
check_error_rate() {
    local error_count=$(tail -1000 /var/www/inovices/logs/pm2-error.log 2>/dev/null | grep -c "Error" || echo 0)
    
    echo "Recent Errors: ${error_count} (last 1000 lines)"
    
    if [ "$error_count" -gt 50 ]; then
        local recent_errors=$(tail -20 /var/www/inovices/logs/pm2-error.log)
        send_alert "High Error Rate" "Found ${error_count} errors in recent logs\n\nRecent errors:\n${recent_errors}" "WARNING"
        return 1
    fi
    
    return 0
}

# Function to log metrics
log_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local cpu=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local mem=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
    local disk=$(df -h /var/www | tail -1 | awk '{print $5}' | sed 's/%//')
    local pm2_online=$(pm2 jlist | jq '[.[] | select(.pm2_env.status=="online")] | length')
    
    echo "${timestamp},${cpu},${mem},${disk},${pm2_online}" >> "$METRICS_LOG"
}

# Main monitoring function
main() {
    echo "=========================================="
    echo "InvoiceFBR Server Monitor"
    echo "Time: $(date)"
    echo "=========================================="
    echo ""
    
    local issues=0
    
    # Run all checks
    check_cpu || ((issues++))
    check_memory || ((issues++))
    check_disk || ((issues++))
    check_pm2 || ((issues++))
    check_nginx || ((issues++))
    check_response_time || ((issues++))
    check_error_rate || ((issues++))
    
    # Log metrics
    log_metrics
    
    echo ""
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed!${NC}"
    else
        echo -e "${RED}❌ Found ${issues} issue(s)${NC}"
    fi
    echo "=========================================="
}

# Run main function
main
