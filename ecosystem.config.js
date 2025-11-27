module.exports = {
  apps: [
    {
      name: 'invoicefbr',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/inovices',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Performance optimizations
        NODE_OPTIONS: '--max-old-space-size=2048', // Increase heap size
      },
      // OPTIMIZED: Performance tuning
      max_memory_restart: '1500M', // Increased from 1G
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      
      // OPTIMIZED: Better instance management
      instance_var: 'INSTANCE_ID',
      increment_var: 'PORT',
      
      // Logging
      error_file: '/var/www/inovices/logs/pm2-error.log',
      out_file: '/var/www/inovices/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // OPTIMIZED: Graceful shutdown and reload
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // OPTIMIZED: Exponential backoff for restarts
      exp_backoff_restart_delay: 100,
      
      // OPTIMIZED: Health check
      max_memory_restart: '1500M',
      min_uptime: '10s',
    },
  ],
};
