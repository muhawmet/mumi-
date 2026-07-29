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
command -v node >/dev/null 2>&1 || { printf '%s\n' "[hasat] node yok — kapı ÖLÇEMEDİ (temiz demek değil)." >&2; exit 0; }
[ -f "$HERE/hasat-gate.mjs" ] || { printf '%s\n' "[hasat] hasat-gate.mjs yok — kapı ÖLÇEMEDİ." >&2; exit 0; }

node "$HERE/hasat-gate.mjs"
exit 0
