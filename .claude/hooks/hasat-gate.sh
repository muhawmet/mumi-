#!/bin/bash
# MAMILAS KAPANIŞ HASADI KAPISI — İNCE LAUNCHER.
#
# Mantık artık burada DEĞİL: `.claude/hooks/hasat-gate.mjs` (cross-platform Node).
# Bu dosya silinmedi çünkü Mac launcher sözleşmesi korunur (.claude/rules/launcher-parity.md:
# launcher'lar ince kalır, Windows/macOS birlikte korunur). Bash MANTIĞI ise Windows'ta
# sessiz no-op'tu — ORTAM YASASI'nın beşinci tekrarı olacaktı, o yüzden Node'a taşındı.
#
# Bloke etmez, GÖRÜNÜR kılar. ÖLÇEMEDİ ≠ TEMİZ.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# stdout, stderr DEĞİL: SessionStart'ta modele yalnız stdout girer (2026-08-02 ölçümü).
# Bu iki satır stderr'e gidiyordu, yani "node yok" hâli "kapı temiz" hâlinden ayırt edilemiyordu.
command -v node >/dev/null 2>&1 || { printf '%s\n' "[hasat] node yok — kapı ÖLÇEMEDİ (temiz demek değil)."; exit 0; }
[ -f "$HERE/hasat-gate.mjs" ] || { printf '%s\n' "[hasat] hasat-gate.mjs yok — kapı ÖLÇEMEDİ."; exit 0; }

node "$HERE/hasat-gate.mjs"
exit 0
