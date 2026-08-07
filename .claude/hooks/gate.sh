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
# SAF TASIMA LISTESI — dongunun ONUNDE, bir kez.
# Neden burada: git bir rename'i ancak TUM diff'e bakarken eslestirir. `-- <tek yol>` verilirse
# esini goremez ve saf tasimayi "999 satir eklendi" diye raporlar — bu satir once o yanlisla
# yazildi ve elemedi. Numstat'in `0 0` satirlari icerigi degismeyen dosyalardir.
# Bicim iki turlu gelir: `dir/{eski => yeni}/ad` ya da `eski => yeni`; ikisi de yeni yola indirilir.
# ⚠ TERS YON: `{Biten => }` gibi BOS yeni segment cift egik cizgi birakir
# (`COMMAND-INBOX//5. Sinif...`) ve eslesme kacar. Bu satir once yalniz ileri yonu (dosya
# Biten/ altina giderken) onardi; is Biten'den GERI alinunca ayni kapi yeniden kirmizi verdi.
# Son sed cift egik cizgiyi tekile indirir — iki yon de ayni yola cikar.
# Rename+DUZENLEME bu listeye GIRMEZ (numstat sifirdan buyuk cikar) — gercek duzenleme olculmeye
# devam eder. Olcut ad degil SAYI.
# ⚠ `-l0` = YENIDEN-ADLANDIRMA LIMITI YOK (2026-08-05'te olculdu).
# `-M` varsayilan olarak sinirli sayida dosyayi eslestirmeye calisir; bir PROJE KLASORU
# `Biten/` altina tasininca (100+ dosya) limit asiliyor, git rename ciftlerini kuramiyor ve
# saf tasima "yeni dosya" gibi gorunuyor. Sonuc: bitmis bir projenin DEGISMEMIS dosyalari
# yeniden lint'lenip commit'i bloke etti. Kapinin kendi MOVED_ONLY mekanizmasi vardi ve
# tam da isini goremiyordu. `-l0` limiti kaldirir; maliyeti tek seferlik ve olculebilir.
MOVED_ONLY="|$(
  git -c core.quotepath=false diff --cached -M -l0 --numstat 2>/dev/null \
    | awk -F'\t' '$1 == "0" && $2 == "0" { print $3 }' \
    | sed -e 's/{[^}]* => \([^}]*\)}/\1/g' -e 's/.* => //' -e 's|//*|/|g' \
    | tr '\n' '|'
)"

if [ "${MAMILAS_LINT_SKIP:-0}" = "1" ]; then
  # Kacisin IZ BIRAKMAMASI kabul edilemez: sessizce atlanan kapi, olmayan kapidir.
  # Mesaj PROMPT + MOTION der: bayrak ikisini birden atliyor ama metin yalniz prompt diyordu,
  # yani makbuz eksik bilgi veriyordu (Terra 5.6 ikinci goz).
  printf '\n🟡 PROMPT VE MOTION LINT ATLANDI — MAMILAS_LINT_SKIP=1 verildi.\n' >&2
  printf '   Atlanan teslim dosyalari (prompt + motion):\n' >&2
  # Makbuz calisma agacini DA sayar: `git commit -a` ile atlandiginda index bos olur ve
  # makbuz eskiden BOS satir basardi — yani atlanan dosya kayitsiz kalirdi (2026-08-02).
  {
    git -c core.quotepath=false diff --cached --name-only --diff-filter=ACMR -z 2>/dev/null
    git -c core.quotepath=false diff --name-only --diff-filter=ACMR -z 2>/dev/null
  } | sort -z -u | tr '\0' '\n' \
    | grep -E 'COMMAND-INBOX/.*(_PROMPTLAR.*|_MOTION.*)\.(txt|md)$|COMMAND-INBOX/.*/(PROMPTLAR|MOTION)/[^/]*\.(txt|md)$' \
    | sed 's/^/     · /' >&2
  printf '   Gerekcesi commit mesajina YAZILMALI.\n\n' >&2
else
  # TURKCE YOL TUZAGI (2026-07-31, kapi kurulurken kapinin KENDISINDE yakalandi):
  # `git diff --cached --name-only` Turkce karakterli yolu TIRNAK icinde ve \304\261 gibi
  # kacis dizisiyle basar. Satir basinda `agents/` arayan bir grep hicbir sey bulamaz ve
  # kapi SESSIZCE gecer — butun proje adlarimiz Turkce oldugu icin her seferinde.
  # `-c core.quotepath=false` ham UTF-8 verir; `-z` ile NUL ayrac, bosluklu ad da bolunmez.
  while IFS= read -r -d '' PF; do
    # SECIM ARTIK ADA DEGIL ICERIGE BAKAR (2026-08-02, olculdu).
    # Eski desen `agents/COMMAND-INBOX/*_PROMPTLAR*.(txt|md)` idi ve teslimin GERCEK
    # yerlesimini gormuyordu: 146 prompt dosyasinin yalniz 18'i o ada uyuyor, kalan 128'i
    # `<proje>/PROMPTLAR/01.txt` ya da `PROMPTLAR/A-K01-K14.txt` biciminde yasiyor.
    # Yani Destek ve Hareket'in 41, Eseyli'nin 50 karesi duvardan HIC olculmeden geciyordu
    # ve kapi her seferinde "✅ Gate yesil" yaziyordu. MOTION dali (asagisi) klasor bicimini
    # 2026-08-02'de almisti, prompt dali almamisti — ayni hata iki dosyada iki kez.
    # Imza `prompt-lint.mjs:813-826` walk()'un AYNISI: ^STYLE: / ^NEGATIVE: / FRAME NEGATIVE.
    # Ikinci kopya yazilmiyor, ayni sozlesme okunuyor — iki yerde olculen yasa iki gercek uretir.
    case "$PF" in
      agents/COMMAND-INBOX/*.txt|agents/COMMAND-INBOX/*.md) : ;;
      *) continue ;;
    esac
    [ -f "$PF" ] || continue
    # SAF TASIMA OLCULMEZ (2026-08-03, kapinin kendisinde yakalandi).
    # `MOVED_ONLY` listesi dongunun ONUNDE bir kez hesaplanir (bkz. yukarisi): git rename'i
    # ancak TUM diff'e bakarken eslestirebilir; `-- <tek yol>` verilirse esini goremez ve saf
    # tasimayi "999 satir eklendi" diye raporlar. Bu satir once o yanlisla yazildi ve elemedi.
    case "$MOVED_ONLY" in
      *"|$PF|"*) continue ;;
    esac
    # Teslim setinin PROMPT OLMAYAN parcalari (prompt-lint walk'un ad elemesiyle ayni liste).
    # `MOTION/` klasoru de burada elenir: o dosyalar asagidaki motion dalinin isidir, iki
    # dal ayni dosyaya iki farkli lehceyle hukum vermez.
    case "$PF" in
      # `*MOTION*` alt tiresiz: `_CANARY-MOTION.txt` bu elemeden de kaciyordu (2026-08-05).
      *MOTION*|*_EDIT-PLAN*|*_SESLENDIRME*|*_SUNO*|*_REFERANSLAR*|*/MOTION/*) continue ;;
      # Uretim ceteleleri: icinde prompt ALINTISI gecer ama kare basmazlar. 2026-08-03'te
      # "Farkli Kulturler" Biten/ altina tasininca kapi bir NOT satirini kare sanip commit'i
      # bloke etti. `prompt-lint.mjs:901` walk() ile AYNI liste — iki yerde ayrisirsa iki
      # gercek dogar; degistiren ikisini birden degistirir.
      *_KALAN-URETIM*|*_YAPILACAK-REVIZE*|*_revize*) continue ;;
      # ⚠ REVIZE KLASOR BICIMI (2026-08-05). Eleme yalniz AD ariyordu (`*_revize*`) ve
      # `REVIZE/S1-YENI.txt` yerlesimini gormuyordu: revize NOTU, kare prompt'u sanilip
      # sekiz kirmizi verdi ve bitmis bir projenin tasinmasini bloke etti. `current-work.mjs`
      # KIT tanimi bu klasoru zaten biliyor (`dir: 'revize'`) — kapi onu bilmiyordu.
      # Ad degil YERLESIM elenir; buyuk/kucuk harf iki bicimde de yasiyor.
      */REVIZE/*|*/revize/*|*/Revize/*) continue ;;
    esac
    # `*_PROMPTLAR*` ADIYLA sozlesmeyi ustlenmis dosyadir; digerleri ICERIKLE secilir.
    ADLI=0
    case "$PF" in
      agents/COMMAND-INBOX/*_PROMPTLAR*.txt|agents/COMMAND-INBOX/*_PROMPTLAR*.md) ADLI=1 ;;
    esac
    if [ "$ADLI" = 0 ]; then
      grep -qiE '^STYLE:|^NEGATIVE:|FRAME NEGATIVE' "$PF" || continue
    fi
    # Register ayraci ARTIK iki nokta ZORUNLU DEGIL: canli olcum (2026-08-02) teslim
    # basliklarinin `Dunya: pixar_3d_edu · register EDU · Image: ...` diye yazildigini
    # gosterdi — iki nokta arayan desen o dosyalarin hicbirini okuyamiyordu.
    if grep -qiE 'register[[:space:]:]+real' "$PF"; then REG=real
    elif grep -qiE 'register[[:space:]:]+sty' "$PF"; then REG=sty
    elif grep -qiE 'register[[:space:]:]+edu' "$PF"; then REG=edu
    elif [ "$ADLI" = 1 ]; then
      # KOR KAPI YASAGI: register okunamiyorsa olcum yapilamaz, ve olculemeyen sey
      # SESSIZCE GECMEZ. Eskiden burada `continue` vardi — yani basligi bozuk her dosya
      # kapidan hic denetlenmeden geciyordu. Tek satirlik duzeltmesi olan bir sey icin
      # kapinin kor kalmasi kabul edilemez.
      fail "TESLIM DOSYASININ REGISTER'I OKUNAMADI — $PF

Dosyanin ilk satirlarinda su ifadelerden biri gecmeli:
  register: EDU   |   register: REAL   |   register: STY

Olculemeyen dosya basilirsa eksigi krediyle odenir. Basliga tek satir ekle."
    else
      # ICERIKLE secilen dosyada register YOKSA: olcum EDU ile yapilir ve bu SOYLENIR.
      # Neden fail degil: canli repoda icerikle secilen 146 dosyanin 111'inde register satiri
      # hic yok. Onlari hard-fail yapmak, korlugu kaldirirken commit'i tamamen kilitlerdi —
      # yani olcmemekten daha kotu bir sonuc. EDU varsayimi uydurma degil, `prompt-lint.mjs`
      # kendi belgelenmis varsayilani (bugune kadarki 181 karenin 181'i EDU).
      REG=edu
      printf '🟡 register satiri yok, EDU varsayildi: %s\n' "$PF" >&2
    fi
    # ⚠ `prompt-lint.mjs` KIRMIZI bulsa da `exit 0` verir — bir raporlayicidir, kapi degil.
    # Kapiyi cikis koduna baglamak, kapiyi doguran gun no-op yapardi (2026-07-31'de tam bu
    # oldu: bilerek bozuk bir dosyaya kapi "yesil" dedi). Hukum CIKTIDAN okunur.
    LINT_OUT=$(node scripts/prompt-lint.mjs "$PF" --register="$REG" 2>&1) || true
    # 2026-08-04 olcumu: `prompt-lint.mjs` ozet satirini `toplam kırmızı blok: N` diye basiyor;
    # bu parser yalnizca `kırmızı: N` ariyordu ve ARADAKI "blok" kelimesi yuzunden HICBIR prompt
    # dosyasinda eslesmiyordu — yani kapi bu daldan her zaman KIRMIZI veriyordu. Fark edilmemesinin
    # sebebi son commit'lerin MOTION stage etmesi (motion-lint `kırmızı: 0/43` basiyor, o esliyor).
    # Iki bicim de kabul edilir; parser tek bir lint bicimine bagli kalmaz.
    KIRMIZI=$(printf '%s' "$LINT_OUT" | grep -oE 'kırmızı( blok)?: [0-9]+' | grep -oE '[0-9]+' | head -1)
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
  done < <(
    # ÜÇ SIZINTI birden kapatiliyor:
    # (a) --diff-filter'a R eklendi: `git mv` ile yeniden adlandirilan teslim dosyasi
    #     eskiden filtreden dusuyor ve hic denetlenmiyordu.
    # (b) `git commit -a` ve `git commit <dosya>` hook ANINDA index'i doldurmamis olur;
    #     `diff --cached` bos doner ve kapi sessizce baypas edilirdi. O yuzden calisma
    #     agacindaki degismis izlenen dosyalar da listeye giriyor.
    # (c) ikisi birlestiginde ayni dosya iki kez gelebilir → sort -u -z ile tekillestirilir.
    {
      git -c core.quotepath=false diff --cached --name-only --diff-filter=ACMR -z 2>/dev/null
      git -c core.quotepath=false diff --name-only --diff-filter=ACMR -z 2>/dev/null
    } | sort -z -u
  )

  # --- 6a. MOTION LINT — prompt-lint dongusunun IKIZI ---
  #
  # 2026-08-02 olcumu: `motion-lint.mjs` 490 satir, 14 kural, kendi testi VAR — ve
  # HICBIR KAPIYA BAGLI DEGILDI. `grep motion-lint .claude/hooks/gate.sh` → 0 eslesme.
  # Dahasi `motion-lint.mjs:403` yorumu "kırmızı: N/M satirini gate.sh parse ediyor" diyordu;
  # yorum var olmayan bir bagi anlatiyordu. Hattin yarisi olculuyor, yarisi olculmuyordu —
  # ve olculmeyen yari KLIP KREDISI yakan yari: start-frame hatasi bir kareyi bozar,
  # motion hatasi bir klibi.
  #
  # Register YOK ve bu bilerek: motion-lint register parametresi almiyor (§3R olculemiyor,
  # yasa bunu :743'te kendisi soyluyor). Uydurma bir bayrak eklemek kapiyi yalanci yapardi.
  while IFS= read -r -d '' MF; do
    case "$MF" in
      # ALT TIRE SARTI KALKTI (2026-08-05, olculdu): desen `*_MOTION*` idi ve
      # `Destek ve Hareket_CANARY-MOTION.txt` icinde `_MOTION` gecmiyor (once `-` var).
      # Dosya bu daldan kacti; prompt dali da onu `*_MOTION*` elemesiyle gecemedi ve
      # icerik grep'inde (^STYLE:/^NEGATIVE:) elendi. Yani 3 kliplik gercek bir motion
      # teslimi IKI DALDAN DA sessizce dustu ve kapi "✅ Gate yesil" yazdi.
      agents/COMMAND-INBOX/*MOTION*.txt|agents/COMMAND-INBOX/*MOTION*.md) : ;;
      agents/COMMAND-INBOX/*/MOTION/*.txt|agents/COMMAND-INBOX/*/MOTION/*.md) : ;;
      *) continue ;;
    esac
    # MOTION/ ALTINDAKI ALT KLASORLER TESLIM DEGILDIR — calisma alanidir.
    #
    # Ilk yazimda burada bir KARA LISTE vardi (`_ESKI-SURUM/`, `_ONCEKI-TUR/`) ve bir gun
    # sonra `_BLOK-KAYNAK/OKUMA.txt` acilinca kapi bir OKUMA dosyasini klip sanip commit'i
    # bloke etti. Kara liste, uretimin bir sonraki klasorunu asla bilemez.
    #
    # Sozlesme: teslim edilen motion dosyalari `MOTION/` KOKUNDE yasar (`S1-...txt`).
    # Alt klasor ne olursa olsun (karantina, kaynak, not) olculmez. Ayni kural 6a2'de
    # zaten boyle: orada sadece kok glob'u taranir. Iki dal ayni gercegi konusur.
    case "$MF" in
      */MOTION/*/*) continue ;;
    esac
    # `.md` de sayilir: ilk yazimda MOTION/ dali yalnizca `.txt` esliyordu ve degismis bir
    # `MOTION/01.md` lint gormeden geciyordu (Terra 5.6 ikinci goz, KRITIK). Ayni sinif
    # md.3'un motion tarafiydi — ayni hata iki dosyada iki kez yapildi.
    [ -f "$MF" ] || continue
    # prompt-lint ile ayni gerekce: hukum CIKIS KODUNDAN degil CIKTIDAN okunur.
    MOUT=$(node scripts/motion-lint.mjs "$MF" 2>&1) || true
    MKIRMIZI=$(printf '%s' "$MOUT" | grep -oE 'kırmızı: [0-9]+' | grep -oE '[0-9]+' | head -1)
    if [ -z "$MKIRMIZI" ]; then
      fail "MOTION LINT OKUNAMADI — $MF
Cikti 'kırmızı: N' satirini icermiyor; lint ciktisi degismis olabilir.
Kapi kor kalamaz — dogrulanamayan kapi sessizce gecmez, bloke eder."
    fi
    if [ "$MKIRMIZI" -gt 0 ] 2>/dev/null; then
      fail "MOTION LINT KIRMIZI ($MKIRMIZI klip) — $MF

$(printf '%s' "$MOUT" | grep -E '✗|▸|kırmızı' | head -30)

Kirmizi = KANITLI eksik. Bu dosyayla klip basilirsa o eksik krediyle odenir.
Duzelt, ya da bilerek geciyorsan:
  MAMILAS_LINT_SKIP=1 git commit ...  (gerekcesini commit mesajina yaz)"
    fi
    printf '✅ motion-lint yesil: %s\n' "$MF" >&2
  done < <(
    {
      git -c core.quotepath=false diff --cached --name-only --diff-filter=ACMR -z 2>/dev/null
      git -c core.quotepath=false diff --name-only --diff-filter=ACMR -z 2>/dev/null
    } | sort -z -u
  )

  # --- 6a2. CANLI MOTION KLASORU — DIFF DEGIL DURUM OLCULUR ---
  #
  # 2026-08-05 olcumu, kapinin en buyuk korlugu: yukaridaki dal girdisini `git diff`ten
  # alir. Ama canli motion dosyalari `.gitignore:69` ile IZLENMIYOR:
  #     agents/COMMAND-INBOX/*/MOTION/S*.txt
  # Izlenmeyen dosya ne `--cached` ne calisma agaci diff'ine girer. Yani KLING'E GIDEN
  # motion metni bu kapi icin YAPISAL OLARAK GORUNMEZDI. Kapi bugune kadar yalniz
  # `_ESKI-SURUM/`, `_ONCEKI-TUR/` ve `Biten/` kopyalarini olctu — yani onemsiz olani.
  # Kanit: aktif projede 55 blok, motion-lint 55/55 kirmizi, ve hicbir commit bloke olmadi.
  #
  # Cozum ADI DEGIL KAYNAGI degistirmek: diff yerine DURUM olculur. Aktif projenin
  # MOTION/ klasoru dogrudan taranir, dosya git'te olsun olmasin.
  #
  # TASLAK dosyalar olculmez ama SAYILIR ve BASILIR: `TASLAK` basligi tasiyan dosya bir
  # teslim degil, canary onayi bekleyen musveddedir (T0 baseline). Sessiz muafiyet
  # muafiyet degildir — kac dosyanin olcum disinda kaldigi her commit'te goze sokulur.
  # ⚠ SESSIZ KACIS KAPATILDI (Codex Sol, NARROW hukmu). Ilk yazimda state okunamazsa
  # `MOTION_DIR` bos kaliyor ve dal HIC KOSMUYORDU — yani kaydi bozmak, kapiyi kapatmanin
  # en kolay yoluydu. Bu repoda "kapi kendini dogrulayamiyorsa SESSIZCE GECMEZ" yazili bir
  # yasa (gate.sh:17-18). Ayrim: kayit YOK/KAPANDI ise gecmek dogru (olculecek is yok);
  # kayit VAR ama OKUNAMIYOR ise bloke edilir.
  MOTION_DIR=$(node -e "try{const s=require('./artifacts/current-work.json');const p=s.projectId||'';if(p&&s.status!=='kapandi')process.stdout.write('agents/COMMAND-INBOX/'+p+'/MOTION')}catch{process.exit(9)}" 2>/dev/null)
  MOTION_RC=$?
  if [ "$MOTION_RC" = "9" ] && [ -f artifacts/current-work.json ]; then
    fail "DURUM KAYDI OKUNAMADI — artifacts/current-work.json bozuk.
Canli motion olcumu bu kayittan tureyen bir yolla calisir; kayit okunamazsa
olcum SESSIZCE atlanirdi. Kor kapi, kapali kapidan tehlikelidir."
  fi
  if [ -n "$MOTION_DIR" ] && [ -d "$MOTION_DIR" ]; then
    MTASLAK=0
    MTASLAK_ADLAR=''
    for MF in "$MOTION_DIR"/*.txt "$MOTION_DIR"/*.md; do
      [ -f "$MF" ] || continue
      # Yalnizca ILK SATIR bakilir; emoji/tire kodlamasina bagimli olmamak icin duz
      # `TASLAK` aranir (Windows Git Bash'te em-dash eslesmesi guvenilmez).
      if head -n 1 "$MF" 2>/dev/null | grep -q 'TASLAK'; then
        MTASLAK=$((MTASLAK + 1))
        MTASLAK_ADLAR="$MTASLAK_ADLAR
     · $(basename "$MF")"
        continue
      fi
      MOUT=$(node scripts/motion-lint.mjs "$MF" 2>&1) || true
      MKIRMIZI=$(printf '%s' "$MOUT" | grep -oE 'kırmızı: [0-9]+' | grep -oE '[0-9]+' | head -1)
      if [ -z "$MKIRMIZI" ]; then
        fail "MOTION LINT OKUNAMADI (canli klasor) — $MF
Cikti 'kırmızı: N' satirini icermiyor. Kapi kor kalamaz."
      fi
      if [ "$MKIRMIZI" -gt 0 ] 2>/dev/null; then
        fail "CANLI MOTION KIRMIZI ($MKIRMIZI klip) — $MF

$(printf '%s' "$MOUT" | grep -E '✗|▸|kırmızı' | head -30)

Bu dosya AKTIF projenin MOTION klasorunde ve TASLAK isareti tasimiyor —
yani teslim sayiliyor. Kling'e bu haliyle giderse eksik krediyle odenir.
Duzelt, ya da canary onayi alana kadar dosyanin ILK SATIRINA su basligi koy:
  🔴 TASLAK — CANARY ONAYSIZ"
      fi
      printf '✅ canli motion yesil: %s\n' "$MF" >&2
    done
    if [ "$MTASLAK" -gt 0 ]; then
      # ⚠ MUAFIYET KIMLIKLI OLMAK ZORUNDA (Codex Sol, NARROW): once yalniz SAYI
      # basiliyordu. Sayi bir muafiyeti gorunur kilmaz — hangi dosyanin olcum disinda
      # kaldigi bilinmezse, muafiyet sessizce kalicilesabilir. Adlar ve faz basilir.
      printf '🟡 CANLI MOTION: %s dosya TASLAK isaretli — olcum disinda:%s\n' \
        "$MTASLAK" "$MTASLAK_ADLAR" >&2
      MFAZ=$(node -e "try{process.stdout.write(require('./artifacts/current-work.json').phase||'?')}catch{process.stdout.write('?')}" 2>/dev/null || printf '?')
      printf '   faz: %s — canary PASS alinca baslik kaldirilir ve kapi bunlari olcmeye baslar.\n' "$MFAZ" >&2
      if [ "$MFAZ" = "uretim" ]; then
        fail "TASLAK MOTION URETIM FAZINDA — $MTASLAK dosya olcum disinda ama faz 'uretim'.
Taslak, canary onayi bekleyen musveddedir; uretim fazinda taslak olamaz.
Ya baslik kaldirilip dosya olculur, ya faz geri alinir."
      fi
    fi
  fi

  # --- 6a3. SHOT CARD — prompttan ONCEKI dusunce ---
  #
  # `MOTION_DIR` ile ayni state'ten tureyen SHOTS/ klasoru olculur. Neden kapiya bagli:
  # bu repoda "yazildi ama hicbir kapi cagirmiyor" olculmus bir kusur sinifidir
  # (motion-lint 490 satir/14 kural yazildi ve 2026-08-02'ye kadar hicbir kapiya bagli
  # degildi). Yeni bir olcen ekleyip cagirmamak ayni hatayi ucuncu kez yapmak olurdu.
  #
  # SHOTS/ yoksa dal hic calismaz — Shot Card zorunlu bir teslim parcasi DEGIL, canary
  # ve paket akisinin araci. Var olduğu an sozlesmesine uymak zorunda.
  if [ -n "${MOTION_DIR:-}" ]; then
    SHOTS_DIR="${MOTION_DIR%/MOTION}/SHOTS"
    if [ -d "$SHOTS_DIR" ]; then
      # VO dosyasi bulunursa baslikTAKI VO cumlesi kaynakla karsilastirilir; yoksa o kural
      # sessizce atlanir (uydurma bir karsilastirma yapmaktansa olcmemek dogru).
      VO_FILE=$(ls "${MOTION_DIR%/MOTION}"/*_SESLENDIRME.txt 2>/dev/null | head -1)
      if [ -n "$VO_FILE" ]; then
        SOUT=$(node scripts/shot-card-lint.mjs "$SHOTS_DIR" --vo "$VO_FILE" 2>&1) || true
      else
        SOUT=$(node scripts/shot-card-lint.mjs "$SHOTS_DIR" 2>&1) || true
      fi
      SKIRMIZI=$(printf '%s' "$SOUT" | grep -oE 'kırmızı: [0-9]+' | grep -oE '[0-9]+' | head -1)
      if [ -z "$SKIRMIZI" ]; then
        fail "SHOT CARD LINT OKUNAMADI — $SHOTS_DIR
Cikti 'kırmızı: N' satirini icermiyor. Kapi kor kalamaz."
      fi
      if [ "$SKIRMIZI" -gt 0 ] 2>/dev/null; then
        fail "SHOT CARD KIRMIZI ($SKIRMIZI kart) — $SHOTS_DIR

$(printf '%s' "$SOUT" | grep -E '✗|kırmızı' | head -20)

Kart prompttan ONCEKI dusuncedir. Bos ya da kendini yalanlayan bir kart, prompt
asamasinda uydurmaya donusur — motorun morph uretmesiyle ayni mekanizma.
Sablon: agents/SHOT-CARD-SABLONU.md"
      fi
      printf '✅ shot-card yesil: %s\n' "$SHOTS_DIR" >&2
    fi
  fi
fi

# --- 6c. BELGE BAG DENETIMI (BLOKE EDER) ---
#
# Neden bloke ediyor: bir belgedeki `dosya:satir` atfi bir SOZLESMEDIR ve tek yonlu kayar —
# kod tasinir, atif donar, okuyan ajan yanlis yere bakar. Olculdu (2026-08-02): tek bir
# katmanda 10 kirik atif, canli taramada 28. Ikisi de kimseye gorunmuyordu.
# 0.06 saniye suruyor; ucuz ve deterministik, o yuzden uyari degil DUVAR.
# Bilerek var olmayan hedef gosteren atif icin gerekce yazilir:  <!-- bag-yok: neden -->
# Gerekcesiz istisna kabul edilmez, gerekceliler ayri sayilir ve basilir.
if ! BAG_OUT=$(node scripts/baglar.mjs --strict --kisa 2>&1); then
  fail "BELGE BAGLARI KIRIK

$BAG_OUT

Bir belge var olmayan bir dosyaya ya da olmayan bir satira atifta bulunuyor.
Duzelt, ya da bilerek gosteriyorsan o satirin ustune gerekce yaz:
  <!-- bag-yok: neden var olmayan bir seyi gosteriyor -->"
fi

# --- 6b. DURUM KAYDI SAPMASI (UYARI — bloke etmez) ---
# `scripts/current-work.mjs --check` diskle kaydı karsilastirir ve sapma varsa exit 1 verir.
# Kendi yorumunda "kapiya BAGLANMAZ" yaziyordu ve hicbir sey onu cagirmiyordu — yani sapma
# olcen bir arac vardi ve olcum hic okunmuyordu. 2026-07-31 arkeolojisi: dokuz hafiza sistemi
# kuruldu, ortalama omru bir haftanin alti, ve HEPSI ayni sekilde oldu — kayit diskle koptu,
# yalan soylemeye basladi, arsive atildi, yenisi kuruldu. Bunu goren tek sey bu satirdir.
#
# Bloke ETMEZ: yarim is sirasinda sapma dogaldir (kareler basiliyor, kit henuz eksik).
# Kapi burada yon vermez, sadece KAYDIN YALAN SOYLEMEYE BASLADIGINI gorunur kilar.
if ! WORK_OUT=$(node scripts/current-work.mjs --check 2>&1); then
  printf '⚠️  DURUM KAYDI SAPMIS — artifacts/current-work.json diskle ortusmuyor.\n' >&2
  printf '%s\n' "$WORK_OUT" | grep -E 'DRİFT|DRIFT|⚠' | head -4 >&2
  printf '   `node scripts/current-work.mjs ilerle --bitti "..." --sirada "..."` ile guncelle.\n' >&2
fi

# --- 6d. TESLIM BICIM DENETIMI (UYARI — bloke etmez) ---
# `scripts/teslim-denetim.mjs` 463 satirlik bir olcen ve HICBIR KAPIYA BAGLI DEGILDI
# (`grep -rl teslim-denetim .claude/` → 0). Prompt-lint ve motion-lint ile ayni sinif:
# olcen var, olcum okunmuyor. Bu olcum digerlerinin gormedigini gorur — kare SAYISI ile VO
# cumle sayisi ortusuyor mu. Ornek: Destek ve Hareket'te 41 kare yazilmis, VO 52 cumleydi;
# K42-K52 hic yoktu ve prompt-lint bunu goremez (var olan kareyi olcer, OLMAYANI degil).
#
# Neden UYARI, neden duvar degil: 2026-08-02 canli olcumu — 20 projenin 1'i KIRMIZI
# (Destek ve Hareket, VO ortulmemis). Var olan kirmiziyi duvara cevirmek HER commit'i
# kilitlerdi; kapinin isi isi durdurmak degil, korlugu bitirmek. Kirmizi 0'a inince duvara
# cevirmek tek satir — ama o karar Mami'nin, kapinin kendi kendine sikilastirmasi degil.
# 0.1 saniye suruyor.
if ! TESLIM_OUT=$(node scripts/teslim-denetim.mjs --all --strict 2>&1); then
  printf '⚠️  TESLIM BICIMI KIRMIZI — teslim seti kendi sozlesmesine uymuyor.\n' >&2
  printf '%s\n' "$TESLIM_OUT" | grep -E '^\[teslim\]|🔴' | head -8 >&2
  printf '   `node scripts/teslim-denetim.mjs --all` ile tam raporu gor.\n' >&2
fi

# --- 7. claude senkronu (UYARI — bloke etmez) ---
# Sistemin akli (hafiza, kullanici skill'leri, global CLAUDE.md) repo DISINDA, ~/.claude
# altinda yasiyor; git onu tasimaz. Sapma commit aninda gorunur olsun diye burada.
# Bloke ETMEZ: oturum icinde hafiza dogal olarak degisir, her commit'i durdurmak dogru degil.
# CATISMA da bloke etmez ama farkli konusur — yon karari Mami'nindir, kapinin degil.
# 🔴 2026-08-07 · ARTIK UYARMIYOR, KOSUYOR. Mami: "her sohbette diskte olmasi gerekiyor
# diyorsun, lutfen su senkron sorununu coz." Olculdu: bu kapi HER commit'te uyariyordu,
# tek bir oturumda 6 kez, ve kimse senkronu kosmuyordu — cunku uyari bir is degil, bir not.
# `claude-sync.mjs` yapisi geregi GUVENLI: hicbir kosulda SILMEZ, yon tahmin ETMEZ, iki
# taraf da degistiyse CATISMA deyip durur. Yani catisma yokken elle onay beklemek kazanilmis
# bir ihtiyat degil, sadece bir aliskanlikti. Catismasiz sapma artik kendiliginden akar;
# CATISMA hala durur ve Mami'ye gider — yon karari kapinin degil.
if ! SYNC_OUT=$(node scripts/claude-sync.mjs --check 2>&1); then
  if printf '%s' "$SYNC_OUT" | grep -q 'ÇATIŞMA'; then
    printf '🔴 claude senkronu CATISMALI — iki makine ayni dosyayi ayri degistirmis.\n' >&2
    printf '   `node scripts/claude-sync.mjs` calistir, hangi surum dogru MAMI secer.\n' >&2
    printf '   (Catismada hicbir sey yazilmaz; otomatik akis burada BILEREK durur.)\n' >&2
  else
    if SYNC_RUN=$(node scripts/claude-sync.mjs 2>&1); then
      # Repo tarafina dosya tasindiysa bu commit'e katilsin; yoksa bir sonraki commit'e
      # kadar unstaged kalir ve "diskte var ama git'te yok" sinifini uretir.
      if [ -d docs/ai/sync ] && ! git diff --quiet -- docs/ai/sync 2>/dev/null; then
        git add docs/ai/sync 2>/dev/null || true
        printf 'ℹ️  claude senkronu kendiliginden kosuldu; repo tarafi bu commit e eklendi.\n' >&2
      else
        printf 'ℹ️  claude senkronu kendiliginden kosuldu (canli taraf guncellendi).\n' >&2
      fi
    else
      printf '⚠️  claude senkronu kosuldu ama tamamlanamadi — `node scripts/claude-sync.mjs` elle bak.\n' >&2
    fi
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
