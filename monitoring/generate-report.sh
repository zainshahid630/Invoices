#!/bin/bash

# ============================================
# Generate Performance Report
# Sends summary email every 6 hours
# ============================================

EMAIL="your-email@example.com"  # Will be updated by setup script
METRICS_LOG="/var/www/inovices/logs/metrics.log"
REPORT_FILE="/tmp/invoicefbr-report.txt"

# Generate report
cat > "$REPORT_FILE" << EOF
InvoiceFBR Performance Report
Generated: $(date)
========================================

SYSTEM METRICS (Last 6 Hours)
========================================

CPU Usage:
$(tail -72 "$METRICS_LOG" 2>/dev/null | awk -F',' '{sum+=$2; count++} END {printf "Average: %.2f%%\nMax: %.2f%%\n", sum/count, max}' max=0)

Memory Usage:
$(tail -72 "$METRICS_LOG" 2>/dev/null | awk -F',' '{sum+=$3; count++} END {printf "Average: %.2f%%\n", sum/count}')

Disk Usage:
$(tail -1 "$METRICS_LOG" 2>/dev/null | awk -F',' '{print "Current: "$4"%"}')

PM2 STATUS
========================================
$(pm2 list)

NGINX STATUS
========================================
Active Connections: $(curl -s http://localhost/nginx_status 2>/dev/null | grep "Active" || echo "N/A")

RECENT ALERTS
========================================
$(tail -20 /var/www/inovices/logs/alerts.log 2>/dev/null || echo "No recent alerts")

TOP PROCESSES
========================================
$(ps aux --sort=-%mem | head -10)

DISK SPACE
========================================
$(df -h /var/www)

RECOMMENDATIONS
========================================
EOF

# Add recommendations based on metrics
AVG_CPU=$(tail -72 "$METRICS_LOG" 2>/dev/null | awk -F',' '{sum+=$2; count++} END {print sum/count}')
AVG_MEM=$(tail -72 "$METRICS_LOG" 2>/dev/null | awk -F',' '{sum+=$3; count++} END {print sum/count}')

if (( $(echo "$AVG_CPU > 70" | bc -l) )); then
    echo "⚠️  High CPU usage detected. Consider scaling PM2 instances or upgrading server." >> "$REPORT_FILE"
fi

if (( $(echo "$AVG_MEM > 80" | bc -l) )); then
    echo "⚠️  High memory usage detected. Consider adding more RAM or optimizing application." >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "End of Report" >> "$REPORT_FILE"

# Send email
mail -s "InvoiceFBR Performance Report - $(date +%Y-%m-%d)" "$EMAIL" < "$REPORT_FILE"

# Cleanup
rm -f "$REPORT_FILE"
