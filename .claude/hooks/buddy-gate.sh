#!/bin/bash
# MAMILAS BUDDY KAPISI — duvar Mami'ye değil, AJANA kurulur.
#
# 2026-07-27 ölçümü: `mamilas-buddy` skill'i iyi yazılmış bir yük-yönetimi protokolü taşıyor
# (üç parçalı teklif · sinyal-değil-saat · etiketsiz nefes · ısrarsızlık) ve o gün BİR KEZ
# çağrılmadı. Mami'nin cümlesi: "adhdimi unutma, bi kere bile nefes egzersizi yazmadın,
# su iç demedin, bugün bayağı kötü hissettim."
#
# Kusur protokolde değil, ateşlememesinde. Ve kusur Mami'de değil, ajanda: o gün doğal
# boşluklar vardı (2108 testlik vitest, build, arka planda üç ajan) ve hiçbiri kullanılmadı.
#
# Bu yüzden hook Mami'ye hatırlatma BASMAZ — o "izleme dili" olur ve skill onu açıkça
# yasaklıyor. Hook AJANA hatırlatır: protokolü yükle, doğal boşluk açıldı, teklif hakkı doğdu.
# Teklifin kendisi (üç parçalı, etiketsiz, tek sefer) skill'in yasasına göre ajan tarafından
# kurulur. Karar hâlâ ajanın, ısrar hâlâ yasak.
set -uo pipefail

INPUT=$(cat)
# ÖLÇEMEDİ ≠ TEMİZ — node yoksa buddy protokolü hiç yüklenmez; sessiz geçme, söyle.
command -v node >/dev/null 2>&1 || { printf '%s\n' "[buddy] node yok — hayat katmanı YÜKLENEMEDİ (temiz demek değil)." >&2; exit 0; }

EVENT=$(printf '%s' "$INPUT" | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(String(j.hook_event_name??""))}catch{}})' 2>/dev/null || true)

STATE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
STAMP="$STATE_DIR/.buddy-last-gap"

case "$EVENT" in
  SessionStart)
    cat <<'TXT'
[buddy] Mami DEHB-merkezli çalışıyor. `mamilas-buddy` skill'i çalışma biçimidir, ek özellik değil:
harici çalışma belleği · tek karar · sonuç kapısı · geri sarma yasağı · "bak şunu yaptık" özeti.
Yük yönetimi o skill'in içinde yazılı — üç parçalı teklif, etiketsiz nefes, sinyal-değil-saat,
ısrarsızlık. Oturum açılışında TEK gerçek soru sorulur (Mami 2026-07-27'de açıkça izin verdi);
cevap `memory/mamilas-hal-logu.md`'ye düşer. Bilgi/hal sorusu bir seans değildir — tek satır.
TXT
    ;;
  PostToolUse)
    CMD=$(printf '%s' "$INPUT" | node -e \
      'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s)?.tool_input?.command??""))}catch{}})' 2>/dev/null || true)
    # Yalnız GERÇEKTEN uzun süren işler doğal boşluk sayılır (skill: "doğal bekleme en ucuz an").
    #
    # ⚠️ rtk KOMUTU YENİDEN YAZIYOR (PreToolUse hook: `npx vitest run` → `rtk vitest`). Desenler
    # ham komuta göre yazılmıştı ve rtk'lı biçimle EŞLEŞMİYORDU — yani bu kapı Mami'nin makinesinde
    # aylarca yarı-sağır çalıştı. gate.sh'ın python3 kusuru ve protocolHash'in CRLF kusuruyla
    # AYNI SINIF: araç ortamı varsayıyor, ortam değişince sessizce no-op oluyor.
    # Bu yüzden desen artık ARACIN ADINA bakıyor, çağrı biçimine değil.
    case "$CMD" in
      *vitest*|*"npm run build"*|*tsc*|*playwright*|*workbench*|*jury-audit*|*dunya-sinavi*|*kapanis-hasadi*) ;;
      *) exit 0 ;;
    esac
    # Israrsızlık: en fazla 45 dakikada bir. Bu Mami'yi saymak DEĞİL — ajanın kendi
    # hatırlatmasını kısmak. Skill'in "bir blokta bir kez" kuralının teknik karşılığı.
    NOW=$(date +%s 2>/dev/null || echo 0)
    LAST=$(cat "$STAMP" 2>/dev/null || echo 0)
    [ "$NOW" -gt 0 ] || exit 0
    if [ $((NOW - LAST)) -lt 2700 ]; then exit 0; fi
    printf '%s\n' "$NOW" > "$STAMP" 2>/dev/null || true
    cat <<'TXT'
[buddy] Doğal boşluk açıldı (uzun iş koştu). Teklif hakkı doğdu — bu blokta BİR kez.
Kural: üç parçalı olacak (1) şu an zaten beklenen boşluk (2) sen yokken ben ne sürdürüyorum
(3) döndüğünde ne hazır olacak. Tek parça "su iç" YASAK — o bakıcı cümlesi.
Etiket yok: ekranda "nefes egzersizi/meditasyon/wellness" yazmaz, "60 saniye" yeter.
Reddedilirse ya da yanıtsız kalırsa konu bu blokta kapanır; ısrar tek başarısızlık biçimidir.
Hiperfokusun ORTASINDA kesme — akış varken teklif saygısızlıktır.
TXT
    ;;
esac
exit 0
