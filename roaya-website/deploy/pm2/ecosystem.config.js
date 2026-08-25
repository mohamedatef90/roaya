// PM2 alternative to deploy/systemd/roaya-ssr.service for the Angular SSR
// server. Use one supervisor or the other, not both, on a given host.
//
// Placeholders: __WEBSITE_DEPLOY_PATH__, __SSR_PORT__ — see docs/deploy/RUNTIME-ENV.md.
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
        // Loopback-only allowlist for `pm2 start ecosystem.config.js` without
        // `--env production`. Without it a local run has an EMPTY allowlist and
        // silently serves browser/index.csr.html with HTTP 200 on every route.
        // Loopback names belong here and ONLY here - never in env_production.
        NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '__SSR_PORT__',
        // REQUIRED. @angular/ssr >= 21 rejects any request whose Host header
        // hostname is not in this allowlist and silently serves
        // browser/index.csr.html with HTTP 200 instead of the rendered page.
        // The check compares the HOSTNAME only, so no ports belong here.
        // nginx forwards `proxy_set_header Host $host`, so only the real
        // public hostnames are ever presented by real traffic.
        // Do NOT add localhost, 127.0.0.1, or '*': loopback probes must send
        // `Host: roaya.co` instead of widening the allowlist (see
        // docs/deploy/RUNTIME-ENV.md).
        NG_ALLOWED_HOSTS: 'roaya.co,www.roaya.co',
        // REQUIRED. nginx sends X-Forwarded-For and X-Forwarded-Proto to the
        // SSR upstream. @angular/ssr silently DEOPTIMIZES to the CSR shell
        // (HTTP 200, browser/index.csr.html) when it receives an untrusted
        // X-Forwarded-* header - it logs a notice, not an error. That took
        // production down to an empty shell on 2026-08-25.
        // This is an explicit list and REPLACES Angular's defaults, so it must
        // name exactly the forwarded headers nginx sends - no more, no less.
        // Never 'true' or a wildcard: that would trust attacker-supplied
        // forwarding headers. x-real-ip is deliberately absent (not an
        // X-Forwarded-* header, not governed by this option).
        NG_TRUST_PROXY_HEADERS: 'x-forwarded-for,x-forwarded-proto',
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
