#!/bin/zsh
set -e

cd "/Users/Muhammet/Desktop/mamilas-modern"

HOST="127.0.0.1"
PORT="5173"

if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  PORT="5174"
fi

echo "MAMILAS Modern baslatiliyor..."
echo "Adres: http://$HOST:$PORT/"
echo ""

npm run dev -- --host "$HOST" --port "$PORT"
