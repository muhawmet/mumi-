#!/bin/zsh
# MAMILAS — çift tıkla. İNCE KABUK: bütün mantık runner.mjs'te, bütün yasa kick/'te.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  print "\n❌  node bulunamadı. Kur: https://nodejs.org\n"
  read "?Enter: " _; exit 1
fi
# Çift tık = BATCH (Mami mandası): tüm sahneler tek koşuda, frame kapısına kadar.
# Sahne-sahne titiz mod isteyen terminalden `node runner.mjs --scene <id>` koşar.
exec node runner.mjs --batch "$@"
