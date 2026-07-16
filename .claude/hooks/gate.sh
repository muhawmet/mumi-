#!/bin/bash
# MAMILAS KALITE KAPISI — `git commit`'ten ONCE kosar.
#
# Neden hook, neden skill degil: bir skill RICA'dir. Yorulunca atlanir — ve atlandi
# (fb18033 tsc kirmiziyken gecti). Bir PreToolUse hook DUVAR'dir: exit 2 verirse
# commit gerceklesmez, --dangerously-skip-permissions modunda bile.
#
# FILTRE BURADA, settings.json'da DEGIL: `if: "Bash(git commit *)"` alanina
# guvenildi ve o alan HER bash komutunda atesledi. Kapi kendi kapisini kendi tutar.
set -uo pipefail

# stdin'den tool girdisini oku; komut `git commit` degilse SESSIZCE gec.
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | /usr/bin/python3 -c \
  'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)

case "$CMD" in
  *"git commit"*) ;;      # kapi burada acilir
  *) exit 0 ;;            # baska her sey serbest
esac

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

BASELINE_FILE=".claude/test-baseline"

fail() {
  printf '\n❌ GATE KIRMIZI — commit BLOKE edildi.\n\n%s\n' "$1" >&2
  exit 2
}

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
if ! OUT=$(zsh -n agents/MOTION-CALISTIR.command 2>&1 && zsh -n agents/production/MOTION-CALISTIR.command 2>&1); then
  fail "launcher syntax hatasi:
$OUT"
fi

# Testler arttiysa baseline'i ilerlet — gate zamanla SIKILASIR, gevsemez.
if [ -n "$BASELINE" ] && [ "$COUNT" -gt "$BASELINE" ]; then
  printf '%s\n' "$COUNT" > "$BASELINE_FILE"
  printf '📈 baseline ilerledi: %s → %s\n' "$BASELINE" "$COUNT" >&2
fi

printf '✅ Gate yesil — tsc 0 · vitest %s · build OK · zsh OK\n' "$COUNT" >&2
exit 0
