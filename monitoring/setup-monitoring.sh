#!/bin/bash

# ============================================
# Setup Monitoring for InvoiceFBR
# ============================================

echo "🔧 Setting up monitoring for InvoiceFBR..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Install required packages
echo "📦 Installing required packages..."
apt-get update
apt-get install -y mailutils jq sysstat curl

# Configure email
echo ""
echo "📧 Email Configuration"
read -p "Enter your email address for alerts: " EMAIL
read -p "Enter your SMTP server (e.g., smtp.gmail.com): " SMTP_SERVER
read -p "Enter your SMTP username: " SMTP_USER
read -sp "Enter your SMTP password: " SMTP_PASS
echo ""

# Configure postfix for email
echo "Configuring email..."
debconf-set-selections <<< "postfix postfix/mailname string invoicefbr.com"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt-get install -y postfix

# Update monitoring script with email
sed -i "s/your-email@example.com/$EMAIL/" /var/www/inovices/monitoring/server-monitor.sh

# Make scripts executable
chmod +x /var/www/inovices/monitoring/*.sh

# Create logs directory
mkdir -p /var/www/inovices/logs
chown -R www-data:www-data /var/www/inovices/logs

# Setup cron jobs
echo ""
echo "⏰ Setting up cron jobs..."

# Add monitoring cron jobs
(crontab -l 2>/dev/null; echo "# InvoiceFBR Monitoring") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/inovices/monitoring/server-monitor.sh >> /var/www/inovices/logs/monitor.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 */6 * * * /var/www/inovices/monitoring/generate-report.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 0 * * * /var/www/inovices/monitoring/cleanup-logs.sh") | crontab -

echo "✅ Cron jobs added:"
echo "   - Monitor every 5 minutes"
echo "   - Generate report every 6 hours"
echo "   - Cleanup logs daily"

# Setup PM2 monitoring
echo ""
echo "📊 Setting up PM2 monitoring..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Create monitoring dashboard
echo ""
echo "📈 Creating monitoring dashboard..."
cat > /var/www/inovices/monitoring/dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>InvoiceFBR Monitoring Dashboard</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; }
        .metric-value { font-size: 32px; font-weight: bold; }
        .metric-label { color: #666; font-size: 14px; }
        .status-ok { color: #22c55e; }
        .status-warning { color: #f59e0b; }
        .status-critical { color: #ef4444; }
        h1 { color: #333; }
        .timestamp { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 InvoiceFBR Monitoring Dashboard</h1>
        <p class="timestamp">Last updated: <span id="timestamp"></span></p>
        
        <div class="card">
            <h2>System Metrics</h2>
            <div class="metric">
                <div class="metric-value status-ok" id="cpu">--</div>
                <div class="metric-label">CPU Usage</div>
            </div>
            <div class="metric">
                <div class="metric-value status-ok" id="memory">--</div>
                <div class="metric-label">Memory Usage</div>
            </div>
            <div class="metric">
                <div class="metric-value status-ok" id="disk">--</div>
                <div class="metric-label">Disk Usage</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Application Status</h2>
            <div class="metric">
                <div class="metric-value status-ok" id="pm2">--</div>
                <div class="metric-label">PM2 Instances</div>
            </div>
            <div class="metric">
                <div class="metric-value status-ok" id="nginx">--</div>
                <div class="metric-label">Nginx Status</div>
            </div>
            <div class="metric">
                <div class="metric-value status-ok" id="response">--</div>
                <div class="metric-label">Response Time (ms)</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Recent Alerts</h2>
            <pre id="alerts">Loading...</pre>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
EOF

echo ""
echo "✅ Monitoring setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test monitoring: sudo /var/www/inovices/monitoring/server-monitor.sh"
echo "2. Check logs: tail -f /var/www/inovices/logs/monitor.log"
echo "3. View alerts: tail -f /var/www/inovices/logs/alerts.log"
echo "4. Dashboard: http://your-server-ip/monitoring/dashboard.html"
echo ""
echo "📧 Email alerts will be sent to: $EMAIL"
echo ""
