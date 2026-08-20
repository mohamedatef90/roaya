module.exports = {
  apps: [
    {
      name: 'roaya-api',
      script: 'dist/index.js',
      // Fork mode required: WebSocket server binds to a single HTTP server
      // and cannot be shared across cluster workers without sticky sessions.
      // The email worker and analytics cleanup cron run within this process.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown: send SIGINT first, wait 5s before SIGKILL
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
