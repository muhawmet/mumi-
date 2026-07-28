#!/bin/bash
# MAMILAS KAPANIŞ HASADI KAPISI — biten video sistemin zekâsına dönüşmeden oturum açılmaz.
#
# Neden DURUMA bakıyor, olaya değil: Mami klasörü Explorer'da sürüklüyor, `mv` yazmıyor.
# Bash komut metnine bakan bir hook bu makinede sessiz no-op olurdu — gate.sh'ın python3
# kusurunun aynısı (POSIX varsayımı = Windows'ta hiç ateşlemeyen kapı). Bu yüzden kapı
# "taşındı mı" diye sormaz, "hasat edilmemiş proje var mı" diye sorar. Taşıma biçimi önemsiz.
#
# Bloke etmez, GÖRÜNÜR kılar: hasat Mami'nin onayına giden ADAY üretir, otomatik ders yazmaz
# (M7). Blokesi olan bir kapı burada yanlış olurdu — ama sessiz geçen bir kapı daha yanlış.
set -uo pipefail

command -v node >/dev/null 2>&1 || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
[ -f scripts/kapanis-hasadi.mjs ] || exit 0

OUT=$(node scripts/kapanis-hasadi.mjs --check 2>&1) || {
  printf '%s\n' "[hasat] $OUT"
  printf '%s\n' "[hasat] Kapanış hasadı yapılmadan biten video sadece bir klasördür. Çıktı ADAY —"
  printf '%s\n' "        APPROVED.md'ye yalnız Mami taşır."
}
exit 0
