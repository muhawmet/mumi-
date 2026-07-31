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

# --- 6. TESLIM PROMPTLARI (BLOKE EDER) ---
# 2026-07-31 olcumu: `scripts/prompt-lint.mjs` 48 KB'lik bir olcen ve HICBIR kapiya bagli
# degildi. COMMAND-INBOX altindaki prompt dosyalari lint gormeden commit ediliyordu; lint
# elle cagrilan bir sey kaldigi surece unutuluyor. Ayni gun olculdu: emilen uc dersin
# ucunde de bir OLCEN vardi (STYLE tavani, kirmizi cizgiler, Turkce hero imlasi); duzyazi
# kalan bes ders tekrar etti — motion tempo dersi 29 Tem yazildi, 30 Tem 54 klibin
# 54'unde tekrar etti. Olculen ders emiliyor, yazilan ders buharlasiyor. Kapi bu yuzden var.
#
# Yalniz TESLIM dosyasina bakar (`*_PROMPTLAR*.txt`) — calisma dosyalari serbest kalir.
# Register dosyanin kendi basligindan okunur; okunamazsa UYARIR ama bloke ETMEZ (kor olcum
# yanlis kirmizi uretir, o da kapiyi guvenilmez yapar).
# Acil kacis: MAMILAS_LINT_SKIP=1 git commit ...  (gerekcesi commit mesajina yazilir)
if [ "${MAMILAS_LINT_SKIP:-0}" != "1" ]; then
  # TURKCE YOL TUZAGI (2026-07-31, kapi kurulurken kapinin KENDISINDE yakalandi):
  # `git diff --cached --name-only` Turkce karakterli yolu TIRNAK icinde ve \304\261 gibi
  # kacis dizisiyle basar. Satir basinda `agents/` arayan bir grep hicbir sey bulamaz ve
  # kapi SESSIZCE gecer — butun proje adlarimiz Turkce oldugu icin her seferinde.
  # `-c core.quotepath=false` ham UTF-8 verir; `-z` ile NUL ayrac, bosluklu ad da bolunmez.
  while IFS= read -r -d '' PF; do
    case "$PF" in
      agents/COMMAND-INBOX/*_PROMPTLAR*.txt) : ;;
      *) continue ;;
    esac
    [ -f "$PF" ] || continue
    if grep -qiE 'register:[[:space:]]*real' "$PF"; then REG=real
    elif grep -qiE 'register:[[:space:]]*sty' "$PF"; then REG=sty
    elif grep -qiE 'register:[[:space:]]*edu' "$PF"; then REG=edu
    else
      printf '⚠️  %s — register okunamadi, lint atlandi. Basliga `register: EDU` yaz.\n' "$PF" >&2
      continue
    fi
    # ⚠ `prompt-lint.mjs` KIRMIZI bulsa da `exit 0` verir — bir raporlayicidir, kapi degil.
    # Kapiyi cikis koduna baglamak, kapiyi doguran gun no-op yapardi (2026-07-31'de tam bu
    # oldu: bilerek bozuk bir dosyaya kapi "yesil" dedi). Hukum CIKTIDAN okunur.
    LINT_OUT=$(node scripts/prompt-lint.mjs "$PF" --register="$REG" 2>&1) || true
    KIRMIZI=$(printf '%s' "$LINT_OUT" | grep -oE 'kırmızı: [0-9]+' | grep -oE '[0-9]+' | head -1)
    if [ -z "$KIRMIZI" ]; then
      fail "PROMPT LINT OKUNAMADI — $PF
Cikti 'kırmızı: N' satirini icermiyor; lint ciktisi degismis olabilir.
Kapi kor kalamaz (2026-07 dersi: dogrulanamayan kapi sessizce gecmez, bloke eder)."
    fi
    if [ "$KIRMIZI" -gt 0 ] 2>/dev/null; then
      fail "PROMPT LINT KIRMIZI ($KIRMIZI kare) — $PF (register: $REG)

$(printf '%s' "$LINT_OUT" | grep -E '✗|▸|kırmızı' | head -30)

Kirmizi = KANITLI eksik, zevk meselesi degil. Bu dosyayla kare basilirsa
o eksik krediyle odenir. Duzelt, ya da bilerek geciyorsan:
  MAMILAS_LINT_SKIP=1 git commit ...  (gerekcesini commit mesajina yaz)"
    fi
    printf '✅ prompt-lint yesil: %s (register: %s)\n' "$PF" "$REG" >&2
  done < <(git -c core.quotepath=false diff --cached --name-only --diff-filter=ACM -z 2>/dev/null)
fi

# --- 7. claude senkronu (UYARI — bloke etmez) ---
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

# GONDERILMEMIS IS — 2026-07-29'da olculdu, iki kez ve ikisi de pahaliya patladi.
# 28 Tem gecesi yasaya §11a-c/§3a/§3b yazildi, commit edildi, PUSH EDILMEDI. Ertesi gun
# Mac o yasalar olmadan bir videonun motion'ini yazdi: 13/34 klipte refleks yavas push-in
# (§3b onu yasakliyordu), 141 saniye uretilmis video cope gitti, ve Mami sabaha sifirdan
# basladi. Kapi o gece YESILDI — tsc, test, build hepsi geciyordu. Yesil kapi "is teslim
# edildi" demek degilmis; bunu olcen hicbir satir yoktu.
#
# Bloke ETMEZ: yerel commit yigmak mesru (yarim is, deneme dali). Sadece GORUNUR kilar,
# cunku sessiz kalan sey unutuluyor.
# Ortam notu: upstream yoksa `@{u}` hata verir — bastirilir, kapi patlamaz (Windows/Git Bash'te
# de ayni yol calisir, POSIX varsayimi yok).
if UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
  AHEAD=$(git rev-list --count "$UPSTREAM"..HEAD 2>/dev/null || printf '0')
  if [ "${AHEAD:-0}" -gt 0 ] 2>/dev/null; then
    printf '📤 GONDERILMEMIS: %s commit bu makinede duruyor (%s ilerisi).\n' "$AHEAD" "$UPSTREAM" >&2
    printf '   `git push` — yazilan yasa gonderilmezse obur makine onsuz calisiyor.\n' >&2
  fi
fi

# Testler arttiysa baseline'i ilerlet — gate zamanla SIKILASIR, gevsemez.
if [ -n "$BASELINE" ] && [ "$COUNT" -gt "$BASELINE" ]; then
  printf '%s\n' "$COUNT" > "$BASELINE_FILE"
  printf '📈 baseline ilerledi: %s → %s\n' "$BASELINE" "$COUNT" >&2
fi

printf '✅ Gate yesil — tsc 0 · vitest %s · build OK · launcher OK (%s)\n' "$COUNT" "$SYNTAX_LABEL" >&2
exit 0
