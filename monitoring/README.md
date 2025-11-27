# 📊 InvoiceFBR Monitoring System

Complete monitoring solution with email alerts for performance issues.

## 🚀 Quick Setup

### 1. Upload Monitoring Files

Upload the entire `monitoring/` folder to your server:

```bash
# From your local machine
scp -r monitoring root@157.173.121.26:/var/www/inovices/
```

### 2. Run Setup Script

```bash
# On your server
ssh root@157.173.121.26
cd /var/www/inovices/monitoring
chmod +x setup-monitoring.sh
sudo ./setup-monitoring.sh
```

Follow the prompts to configure email alerts.

### 3. Test Monitoring

```bash
# Run manual check
sudo ./server-monitor.sh

# Check logs
tail -f /var/www/inovices/logs/monitor.log
tail -f /var/www/inovices/logs/alerts.log
```

---

## 📧 Email Configuration

### Using Gmail:

1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use these settings:
   - SMTP Server: `smtp.gmail.com:587`
   - Username: `your-email@gmail.com`
   - Password: `your-app-password`

### Using Other Providers:

- **Outlook:** `smtp-mail.outlook.com:587`
- **Yahoo:** `smtp.mail.yahoo.com:587`
- **Custom:** Ask your email provider

---

## 🔔 Alert Thresholds

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| CPU Usage | >80% | CRITICAL |
| Memory Usage | >85% | CRITICAL |
| Disk Usage | >85% | WARNING |
| PM2 Instances | <6 online | CRITICAL |
| Response Time | >2000ms | WARNING |
| Error Rate | >50 errors | WARNING |
| Nginx Down | Not running | CRITICAL |

---

## 📊 What Gets Monitored

### System Metrics:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Disk space
- ✅ Network connections

### Application:
- ✅ PM2 instance status
- ✅ PM2 restart count
- ✅ Nginx status
- ✅ Response times
- ✅ Error rates

### Logs:
- ✅ Application errors
- ✅ PM2 logs
- ✅ Nginx access/error logs

---

## 📈 Monitoring Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Health Check | Every 5 minutes | Checks all metrics |
| Performance Report | Every 6 hours | Email summary |
| Log Cleanup | Daily | Removes old logs |
| Metrics Logging | Every 5 minutes | Records metrics |

---

## 🎯 Email Alerts You'll Receive

### CRITICAL Alerts:
- 🔴 High CPU usage (>80%)
- 🔴 High memory usage (>85%)
- 🔴 PM2 instances down
- 🔴 Nginx service down
- 🔴 Health check failed

### WARNING Alerts:
- ⚠️ High disk usage (>85%)
- ⚠️ Slow response times (>2s)
- ⚠️ High error rate
- ⚠️ High PM2 restart count

### INFO Reports:
- 📊 Performance summary (every 6 hours)
- 📈 Metrics trends
- 💡 Optimization recommendations

---

## 📁 Log Files

| File | Purpose | Retention |
|------|---------|-----------|
| `monitor.log` | All monitoring output | 7 days |
| `alerts.log` | Alert history | 7 days |
| `metrics.log` | Performance metrics | 7 days |
| `pm2-error.log` | Application errors | 7 days |
| `pm2-out.log` | Application output | 7 days |

---

## 🔧 Customization

### Change Alert Thresholds:

Edit `server-monitor.sh`:

```bash
# Line 12-17
CPU_THRESHOLD=80        # Change to 70 for earlier alerts
MEMORY_THRESHOLD=85     # Change to 80 for earlier alerts
DISK_THRESHOLD=85
PM2_MIN_INSTANCES=6     # Minimum PM2 instances
RESPONSE_TIME_THRESHOLD=2000  # milliseconds
```

### Change Monitoring Frequency:

Edit crontab:

```bash
crontab -e

# Change from every 5 minutes to every 2 minutes:
*/2 * * * * /var/www/inovices/monitoring/server-monitor.sh
```

### Add Custom Checks:

Add to `server-monitor.sh`:

```bash
check_custom() {
    # Your custom check here
    if [ condition ]; then
        send_alert "Custom Alert" "Your message" "WARNING"
        return 1
    fi
    return 0
}

# Add to main() function
check_custom || ((issues++))
```

---

## 📊 View Metrics

### Real-time Monitoring:

```bash
# Watch live metrics
watch -n 5 'tail -1 /var/www/inovices/logs/metrics.log'

# View PM2 status
pm2 monit

# View system resources
htop
```

### Historical Data:

```bash
# Last hour CPU usage
tail -12 /var/www/inovices/logs/metrics.log | awk -F',' '{print $1, $2"%"}'

# Last day memory usage
tail -288 /var/www/inovices/logs/metrics.log | awk -F',' '{print $1, $3"%"}'
```

---

## 🚨 Troubleshooting

### Not Receiving Emails:

```bash
# Test email
echo "Test email" | mail -s "Test" your-email@example.com

# Check mail logs
tail -f /var/log/mail.log

# Check postfix status
systemctl status postfix
```

### Monitoring Not Running:

```bash
# Check cron jobs
crontab -l

# Check if scripts are executable
ls -lh /var/www/inovices/monitoring/*.sh

# Run manually to see errors
sudo /var/www/inovices/monitoring/server-monitor.sh
```

### High False Alerts:

```bash
# Increase thresholds in server-monitor.sh
nano /var/www/inovices/monitoring/server-monitor.sh

# Or reduce monitoring frequency
crontab -e
```

---

## 💡 Best Practices

1. **Check emails regularly** - Don't ignore alerts
2. **Review reports** - Look for trends
3. **Act on warnings** - Don't wait for critical alerts
4. **Keep logs** - Useful for debugging
5. **Test alerts** - Make sure emails work

---

## 📞 Support

If you need help:
- Check logs: `/var/www/inovices/logs/`
- Test manually: `sudo ./server-monitor.sh`
- Check email config: `cat /etc/postfix/main.cf`

---

**Your monitoring system is now active! You'll receive email alerts for any issues.** 🎉
