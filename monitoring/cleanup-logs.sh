#!/bin/bash

# ============================================
# Cleanup Old Logs
# Runs daily to prevent disk space issues
# ============================================

LOG_DIR="/var/www/inovices/logs"
RETENTION_DAYS=7

echo "🧹 Cleaning up logs older than ${RETENTION_DAYS} days..."

# Clean up old monitor logs
find "$LOG_DIR" -name "monitor.log.*" -mtime +$RETENTION_DAYS -delete
find "$LOG_DIR" -name "alerts.log.*" -mtime +$RETENTION_DAYS -delete
find "$LOG_DIR" -name "metrics.log.*" -mtime +$RETENTION_DAYS -delete

# Rotate current logs if they're too large
if [ -f "$LOG_DIR/monitor.log" ] && [ $(stat -f%z "$LOG_DIR/monitor.log" 2>/dev/null || stat -c%s "$LOG_DIR/monitor.log") -gt 10485760 ]; then
    mv "$LOG_DIR/monitor.log" "$LOG_DIR/monitor.log.$(date +%Y%m%d)"
    touch "$LOG_DIR/monitor.log"
fi

if [ -f "$LOG_DIR/alerts.log" ] && [ $(stat -f%z "$LOG_DIR/alerts.log" 2>/dev/null || stat -c%s "$LOG_DIR/alerts.log") -gt 10485760 ]; then
    mv "$LOG_DIR/alerts.log" "$LOG_DIR/alerts.log.$(date +%Y%m%d)"
    touch "$LOG_DIR/alerts.log"
fi

# Clean up PM2 logs
pm2 flush

# Clean up nginx logs older than 30 days
find /var/log/nginx -name "*.log.*" -mtime +30 -delete

echo "✅ Cleanup complete!"
