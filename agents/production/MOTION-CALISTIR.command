#!/bin/zsh
# MAMILAS — çift tıkla. İNCE KABUK: bütün mantık runner.mjs'te, bütün yasa kick/'te.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  print "\n❌  node bulunamadı. Kur: https://nodejs.org\n"
  read "?Enter: " _; exit 1
fi
exec node runner.mjs
