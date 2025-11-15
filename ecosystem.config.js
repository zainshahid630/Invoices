module.exports = {
  apps: [{
    name: 'saas-invoices',
    script: 'npm',
    args: 'run start:prod',
    cwd: '/Users/zain/Documents/augment-projects/Saas-Invoices',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};

