// PM2 alternative to deploy/systemd/roaya-ssr.service for the Angular SSR
// server. Use one supervisor or the other, not both, on a given host.
//
// Placeholders: __WEBSITE_DEPLOY_PATH__, __SSR_PORT__ — see docs/deploy/RUNBOOK.md.
module.exports = {
  apps: [
    {
      name: 'roaya-ssr',
      script: 'dist/roaya-website/server/server.mjs',
      cwd: '__WEBSITE_DEPLOY_PATH__',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '__SSR_PORT__',
      },
      error_file: './logs/pm2-ssr-error.log',
      out_file: './logs/pm2-ssr-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};

// The backend already ships its own PM2 file at backend/ecosystem.config.js
// (app name "roaya-api", port 3001, fork mode — required because its
// WebSocket server binds to a single HTTP server). To run both apps under
// one PM2 daemon, either:
//   pm2 start backend/ecosystem.config.js --env production
//   pm2 start roaya-website/deploy/pm2/ecosystem.config.js --env production
// or merge both `apps` arrays into a single ecosystem file if preferred.
