#!/usr/bin/env bash
# nginx cutover to Angular SSR — run with: sudo bash /tmp/roaya-nginx-cutover.sh
#
# Backs up the live config, installs the new one, tests it, and reloads ONLY if
# the test passes. If the test fails, the backup is restored automatically so
# the host is never left holding a config that nginx rejected.
set -uo pipefail

LIVE=/etc/nginx/sites-available/roaya-website
NEW=/tmp/roaya-website.conf.new
# Timestamped per run. A fixed filename is a trap: the second run overwrites
# the first run's backup, so the original pre-migration config is lost exactly
# when you would most want it. (That happened on 2026-08-24; the original is
# archived in the repo at deploy/nginx/roaya-website.pre-ssr-static.conf.bak.)
BAK="/etc/nginx/sites-available/roaya-website.bak.$(date +%Y%m%d-%H%M%S)"

say() { printf '\n== %s\n' "$1"; }

[ "$(id -u)" -eq 0 ] || { echo "FATAL: run with sudo." >&2; exit 1; }
[ -f "$NEW" ]  || { echo "FATAL: $NEW not found." >&2; exit 1; }
[ -f "$LIVE" ] || { echo "FATAL: $LIVE not found." >&2; exit 1; }

say "1/5 Backing up the live config"
cp -p "$LIVE" "$BAK"
echo "    $BAK ($(stat -c%s "$BAK") bytes)"

say "2/5 Verifying the SSR upstream is healthy BEFORE moving traffic"
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:4000/about || echo 000)
if [ "$CODE" != "200" ]; then
  echo "    FATAL: SSR on 127.0.0.1:4000 returned $CODE, expected 200." >&2
  echo "    Not touching nginx. Check: pm2 jlist | grep roaya-ssr ; pm2 logs roaya-ssr" >&2
  exit 1
fi
echo "    SSR /about -> 200 OK"

say "3/5 Installing the new config"
cp "$NEW" "$LIVE"

say "4/5 Testing nginx config"
if ! nginx -t; then
  echo "    nginx -t FAILED — restoring the backup, nothing was reloaded." >&2
  cp -p "$BAK" "$LIVE"
  nginx -t && echo "    Backup restored and verified. Live site unchanged." >&2
  exit 1
fi

say "5/5 Reloading nginx"
systemctl reload nginx
sleep 2
systemctl is-active nginx | sed 's/^/    nginx: /'

say "Post-reload origin checks"
printf '    unknown route      -> %s (want 404)\n' \
  "$(curl -skI -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/no-such-route-xyz | head -1 | awk '{print $2}')"
printf '    /about             -> %s (want 200)\n' \
  "$(curl -sk -o /dev/null -w '%{http_code}' -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/about)"
printf '    /robots.txt type   -> %s (want text/plain; charset=utf-8)\n' \
  "$(curl -skI -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/robots.txt | grep -i '^content-type:' | cut -d' ' -f2- | tr -d '\r')"
printf '    /sitemap.xml type  -> %s (want application/xml; charset=utf-8)\n' \
  "$(curl -skI -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/sitemap.xml | grep -i '^content-type:' | cut -d' ' -f2- | tr -d '\r')"
printf '    /llms.txt type     -> %s (want text/plain; charset=utf-8)\n' \
  "$(curl -skI -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/llms.txt | grep -i '^content-type:' | cut -d' ' -f2- | tr -d '\r')"
printf '    API health         -> %s\n' \
  "$(curl -sk -H 'Host: roaya.co' --max-time 10 https://127.0.0.1/api/v1/health | head -c 90)"
printf '    www redirect       -> %s (want 301)\n' \
  "$(curl -skI -H 'Host: www.roaya.co' --max-time 10 https://127.0.0.1/about | head -1 | awk '{print $2}')"

cat <<EOF

== Done. If anything above looks wrong, roll back with:
     sudo cp -p $BAK /etc/nginx/sites-available/roaya-website
     sudo nginx -t && sudo systemctl reload nginx

   Next: purge the Cloudflare cache (Caching -> Configuration -> Purge Everything),
   then the public site reflects this change.
EOF
