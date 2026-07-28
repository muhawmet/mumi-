#!/bin/bash
# MAMILAS KALITE KAPISI — `git commit`'ten ONCE kosar.
#
# Neden hook, neden skill degil: bir skill RICA'dir. Yorulunca atlanir — ve atlandi
# (fb18033 tsc kirmiziyken gecti). Bir PreToolUse hook DUVAR'dir: exit 2 verirse
# commit gerceklesmez, --dangerously-skip-permissions modunda bile.
#
# FILTRE BURADA, settings.json'da DEGIL: `if: "Bash(git commit *)"` alanina
# guvenildi ve o alan HER bash komutunda atesledi. Kapi kendi kapisini kendi tutar.
#
# TASINABILIRLIK (2026-07-27 zeka runu): kapi `/usr/bin/python3` ve `zsh` istiyordu.
# Mami'nin BIRINCIL ortami Windows'ta ikisi de YOK → komut adi hic ayristirilamadi,
# `case` eslesmedi ve kapi HER commit'te sessizce `exit 0` verdi. Kanit: .claude/test-baseline
# 2026-07-25'ten beri 2062'de dondu, oysa test sayisi 2108'e cikmisti — yani kapi 46 test
# boyunca hic atesnemedi. Duvar sandigimiz sey no-op'tu.
#
# Bu yuzden iki yasa: (1) araclar tasinabilir olacak, (2) kapi kendini dogrulayamiyorsa
# SESSIZCE GECMEYECEK — yuksek sesle blokolayacak. Kor kapi, kapali kapidan tehlikelidir.
set -uo pipefail

fail() {
  printf '\n❌ GATE KIRMIZI — commit BLOKE edildi.\n\n%s\n' "$1" >&2
  exit 2
}

INPUT=$(cat)

# --- 0a. UCUZ ON-FILTRE ---
# Ham girdide "git commit" hic gecmiyorsa bu bir commit degildir: node'u bile calistirma.
# (Hook HER Bash cagrisinda atesleniyor; buradaki maliyet her komuta binecekti.)
case "$INPUT" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# --- 0b. KESIN AYRISTIRMA ---
# On-filtre ham metne bakar; commit mesaji icinde "git commit" gecen bir `echo` da tutar.
# Karari yalnizca tool_input.command alani verir. Ayristirici yoksa SESSIZ GECIS YOK.
command -v node >/dev/null 2>&1 || fail "node bulunamadi — kapi girdiyi ayristiramiyor.
Kapi kendini dogrulayamadigi icin commit'i bloke ediyor (sessiz gecis yasak)."

CMD=$(printf '%s' "$INPUT" | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s)?.tool_input?.command??""))}catch{process.exit(3)}})' \
  ) || fail "hook girdisi ayristirilamadi (bozuk JSON). Kapi kor kalamaz."

case "$CMD" in
  *"git commit"*) ;;      # kapi burada acilir
  *) exit 0 ;;            # baska her sey serbest
esac

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

BASELINE_FILE=".claude/test-baseline"

# --- 1. tip kontrolu ---
if ! OUT=$(npx tsc --noEmit 2>&1); then
  fail "tsc hatasi:
$(printf '%s' "$OUT" | head -25)"
fi

# --- 2. testler ---
if ! OUT=$(npx vitest run 2>&1); then
  fail "vitest KIRMIZI:
$(printf '%s' "$OUT" | grep -E '✕|FAIL|Tests ' | head -25)"
fi

# --- 3. test sayisi DUSTU mu? Test silmek yasak. ---
# Baseline dosyada durur, kodda degil: koda gomulen sayi bayatlar ve sessizce gevser.
# (Kanit: MEMORY.md 1838 diyordu, gercek 1845'ti — sayi zaten bayatlamisti.)
COUNT=$(printf '%s' "$OUT" | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
BASELINE=$(tr -d '[:space:]' < "$BASELINE_FILE" 2>/dev/null || true)

if [ -z "$COUNT" ]; then
  fail "Test sayisi OKUNAMADI — vitest ciktisi degismis olabilir. Kapi kor kalamaz."
fi

if [ -n "$BASELINE" ] && [ "$COUNT" -lt "$BASELINE" ]; then
  fail "TEST SAYISI DUSTU: $COUNT < $BASELINE

Test silmek yasak. Bir test bilerek kaldirildiysa $BASELINE_FILE'i
elle guncelle ve NEDEN'ini commit mesajina yaz."
fi

# --- 4. build ---
if ! OUT=$(npm run build 2>&1); then
  fail "build KIRIK:
$(printf '%s' "$OUT" | tail -20)"
fi

# --- 5. launcher syntax (iki serit de) ---
# zsh Mac'te var, Windows'ta yok. Yoklugunda `bash -n` ile sozdizimi yine denetlenir
# (launcher'lar ince kabuk; zsh'e ozgu `print`/`read "?..."` calisma-zamani, sozdizimi degil).
if command -v zsh >/dev/null 2>&1; then
  SYNTAX="zsh -n"; SYNTAX_LABEL="zsh"
elif command -v bash >/dev/null 2>&1; then
  SYNTAX="bash -n"; SYNTAX_LABEL="bash (zsh yok — yedek denetim)"
else
  fail "ne zsh ne bash bulundu — launcher sozdizimi denetlenemiyor. Sessiz gecis yasak."
fi

if ! OUT=$($SYNTAX agents/MOTION-CALISTIR.command 2>&1 && $SYNTAX agents/production/MOTION-CALISTIR.command 2>&1); then
  fail "launcher syntax hatasi ($SYNTAX_LABEL):
$OUT"
fi

# --- 6. claude senkronu (UYARI — bloke etmez) ---
# Sistemin akli (hafiza, kullanici skill'leri, global CLAUDE.md) repo DISINDA, ~/.claude
# altinda yasiyor; git onu tasimaz. Sapma commit aninda gorunur olsun diye burada.
# Bloke ETMEZ: oturum icinde hafiza dogal olarak degisir, her commit'i durdurmak dogru degil.
# CATISMA da bloke etmez ama farkli konusur — yon karari Mami'nindir, kapinin degil.
if ! SYNC_OUT=$(node scripts/claude-sync.mjs --check 2>&1); then
  if printf '%s' "$SYNC_OUT" | grep -q 'ÇATIŞMA'; then
    printf '🔴 claude senkronu CATISMALI — iki makine ayni dosyayi ayri degistirmis.\n' >&2
    printf '   `node scripts/claude-sync.mjs` calistir, hangi surum dogru MAMI secer.\n' >&2
  else
    printf '⚠️  claude senkronu sapmis — `node scripts/claude-sync.mjs` calistir.\n' >&2
  fi
fi

# Testler arttiysa baseline'i ilerlet — gate zamanla SIKILASIR, gevsemez.
if [ -n "$BASELINE" ] && [ "$COUNT" -gt "$BASELINE" ]; then
  printf '%s\n' "$COUNT" > "$BASELINE_FILE"
  printf '📈 baseline ilerledi: %s → %s\n' "$BASELINE" "$COUNT" >&2
fi

printf '✅ Gate yesil — tsc 0 · vitest %s · build OK · launcher OK (%s)\n' "$COUNT" "$SYNTAX_LABEL" >&2
exit 0
