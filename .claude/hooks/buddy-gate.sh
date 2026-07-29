#!/bin/bash
# MAMILAS BUDDY KAPISI — İNCE DELEGATÖR.
#
# Mantığın tamamı `.claude/hooks/buddy.mjs`'e taşındı (cross-platform Node; Windows birincil
# ortamda `.sh` + çıplak $CLAUDE_PROJECT_DIR ikisi de kırılgandı). Bu dosya artık yalnız
# KAYIT YÜZEYİdir: settings.json'ın PostToolUse dalı buradan geçer ve meta-duvar
# (src/core/docsContract.test.ts) hook kaydını `.sh` yolu üzerinden ölçer.
#
# ÖLÇEMEDİ ≠ TEMİZ — node yoksa buddy protokolü hiç yüklenmez; sessiz geçme, söyle.
set -uo pipefail
command -v node >/dev/null 2>&1 || {
  printf '%s\n' "[buddy] node yok — hayat katmanı YÜKLENEMEDİ (temiz demek değil)." >&2
  exit 0
}
# ORTAM YASASI: kardeş betiği ENV üzerinden arama — kendi konumundan çöz. $CLAUDE_PROJECT_DIR
# boş/yanlış gelirse (PowerShell'de $null okunuyor) `node <boş>/.claude/hooks/buddy.mjs` her
# PostToolUse'ta MODULE_NOT_FOUND stack'i kusar. Ölçüldü (2026-07-29 sentetik test).
HERE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]:-$0}")" && pwd)
BUDDY="$HERE/buddy.mjs"
[ -f "$BUDDY" ] || {
  printf '%s\n' "[buddy] buddy.mjs bulunamadı ($BUDDY) — hayat katmanı YÜKLENEMEDİ (temiz demek değil)." >&2
  exit 0
}
exec node "$BUDDY"
