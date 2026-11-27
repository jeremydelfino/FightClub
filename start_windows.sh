#!/usr/bin/env bash
# Lance FightClub : installe les dépendances si besoin, démarre le serveur
# et ouvre l'écran de jeu dans le navigateur Windows (Git Bash).
# Usage : ./start_windows.sh            (port 3000)
#         PORT=3001 ./start_windows.sh

set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-3000}"
export PORT

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js n'est pas installé. Installe-le depuis https://nodejs.org (version 18 ou plus)."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installation des dépendances…"
  npm install --silent
fi

# Ouvre l'écran une fois le serveur prêt
(
  for _ in $(seq 1 50); do
    if curl -s -o /dev/null "http://localhost:${PORT}/screen"; then
      start "" "http://localhost:${PORT}/screen"
      exit 0
    fi
    sleep 0.2
  done
) &

exec node server.js
