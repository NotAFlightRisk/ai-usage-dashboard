#!/usr/bin/env bash
# Installs the dashboard as a systemd user service. Pass a port, or take 4747.
set -euo pipefail

port="${1:-4747}"
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node="$(command -v node)"
unit="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user/ai-usage-dashboard.service"

[ -d "$dir/build" ] || { echo "No build/ yet. Run: npm ci && npm run build" >&2; exit 1; }

mkdir -p "$(dirname "$unit")"
sed -e "s|__DIR__|$dir|g" -e "s|__NODE__|$node|g" -e "s|__PORT__|$port|g" \
  "$dir/scripts/ai-usage-dashboard.service" > "$unit"

systemctl --user daemon-reload
systemctl --user enable --now ai-usage-dashboard.service
loginctl enable-linger "$USER" 2>/dev/null || true

echo "Running on http://127.0.0.1:$port"
echo "Logs: journalctl --user -u ai-usage-dashboard -f"
