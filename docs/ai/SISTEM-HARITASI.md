# SİSTEM HARİTASI — ölçülmüş hâl (2026-08-02)

> **Bu dosya YORUMSUZDUR.** Ne olduğu yazılı, ne olması gerektiği değil. Hüküm ve tavsiye
> `docs/ai/OPUS5-TAVSIYELER.md`'de. Her satırın yanında dosya:satır kanıtı var; kanıtı
> olmayan satır "ölçülmedi" der.
>
> Ölçüm yöntemi: 6 paralel ajan, her biri tek katman, çıktı biçimi önceden şart koşulmuş.
> Ana bağlamda büyük dosya okunmadı.

---

## 0. KATMANLAR VE BÜYÜKLÜKLER

| Katman | Yüzey | Büyüklük |
|---|---|---|
| Yasa | 9 dosya | `PROMPT-YASASI.md` 917 · `PROTOCOL.md` 88 · `CLAUDE.md` 106 · `faz-icraat.md` 82 · `PROJECT_CONTRACT.md` 73 · `.claude/rules/` 3 dosya 180 |
| Script | 24 çalışır script | 8.0K satır (`mamilas-command.mjs` 1864 · `kapanis-hasadi` 969 · `dunya-kilidi` 940 · `prompt-lint` 846) |
| Hook | 6 dosya | `gate.sh` 242 · `buddy.mjs` ~260 · `hasat-gate.mjs` 62 · `oturum-durumu.mjs` 35 |
| Skill | 10 proje ikizi + 6 kullanıcı skill'i | proje 914 satır · kullanıcı 491 satır |
| Hafıza | 48 dosya | 2179 satır, `~/.claude/projects/-Users-…-mamilas-modern/memory/` |
| Ders | `APPROVED.md` 7 ders · 10 CANDIDATES + 10 HASAT | ~1.858 satır aday |
| Teslim | 17 proje dizini | `COMMAND-INBOX/` — 5 aktif, 10 biten, 5 deneme |
| Arşiv | `artifacts/` 12 dizin | 31.297 satır |

---

## 1. YASA KATMANI

### 1.1 PROMPT-YASASI.md bölüm haritası (917 satır, 27 bölüm)

`§0 (15-35)` STYLE ≤90 kelime — **ölçülüyor** ·
`§0.5 (36-64)` REAL/EDU/STY register — **ölçülüyor** ·
`§0.6 (65-81)` sistem sessizce EDU üretti kanıtı — ölçülmüyor ·
`§1 (88-164)` yapı/kesim/kare içeriği/teslim/denetim — **kısmen** ·
`§2 (167-195)` 9 slotlu start-frame template — **ölçülüyor** ·
`§2ø (196-236)` FİKİR sınavı (VO'suz ne oluyor) — **ölçülmüyor** ·
`§2b (237-273)` motor geometriyi dinler, tonu dinlemez — **ölçülmüyor** ·
`§2c (274-300)` her karede bir şey feda edilir — **ölçülmüyor** ·
`§2a (301-340)` PLAN dört kararı — **ölçülmüyor (yasa bunu :318'de kendisi itiraf ediyor)** ·
`§2d (341-398)` 8 revize sınıfı — kısmen ·
`(399-477)` slot kanıtları · kavram izi · kalıcı kilitler · @tag disiplini — kısmen ·
`§2R (480-535)` REAL slot farkları — kısmen ·
`§3 (538-608)` motion tek paragraf, 7 iç sıra — **ölçülüyor** ·
`§3ø (609-633)` Kling yazamaz/konuşamaz — **ölçülüyor** ·
`§3a (634-706)` klipte bir şey değişmeli — kısmen ·
`§3b (707-740)` kamera gerekçeli — **ölçülüyor** ·
`§3R (741-753)` REAL motion kısıtı — **ölçülmüyor (yasa :743'te itiraf ediyor)** ·
`(754-775)` konuşan klip — ölçülmüyor ·
`§4 (778-830)` referans template + envanter — **ölçülmüyor** ·
`§5 (833-904)` teslim seti biçimi — **ölçülmüyor** (yalnız SESLENDIRME'nin aracı var, `:881`) ·
`§6 (907-917)` yasa nasıl büyür — ölçülmüyor.

### 1.2 Ölçenler

**`prompt-lint.mjs` — 26 kural:** `lens · handle · ten · ten-real · fstop · karsi-terim · canli ·
derinlik · temas · style · text · text-hece · text-tasiyici · neg · tekduzelik-yazi · saffron ·
bloom-cicek · sheen-tende · void · clean-table · real-stil-sifati · refedit · tip · style-uzun ·
kare-ozel · neg-ozel`

**`motion-lint.mjs` — 14 kural:** `saat · kamera-yok · kuyruk · kuyruk-agiz · kelime-bandi ·
metronom · at-first · yazma-fiili · donmus-govde · yay-yok · kilit-uzun · refleks-kamera ·
cicek · kesik-figur`

**Toplam 40 kural, 27 yasa bölümü.** Ölçülmeyen hüküm sınıfları: fikir sınavı (§2ø),
feda (§2c), PLAN dört kararı (§2a), ışık coğrafisi (§2b.1), VO-kare eşliği (§1.7 — VO metni
lint'e hiç girmiyor), anlatıcı oranı (§1.9), yazı taşıyan kare oranı (§11c), kavrama tarifi
(§2d.5), ardışık durum kilidi (§2d.7), referans envanteri (§4a), EDIT-PLAN/SUNO biçimi (§5),
REAL motion (§3R — `motion-lint` register parametresi almıyor).

### 1.3 Metin kayması — aynı hüküm, farklı sayı/cümle

| Hüküm | Nerede | Durum |
|---|---|---|
| **motion kelime bandı** | `PROMPT-YASASI:546` = **190-215** · `PROMPT-YASASI:561` = **210-260** · `motion-lint.mjs:137-138` = kırmızı 160-250 / sarı 180-225 | **üç ayrı sayı**, ikisi aynı yasa dosyasında |
| motion görmeden yazılmaz | `PROMPT-YASASI:540` · `faz-icraat:51` · `PROJECT_CONTRACT:37` · `core-prompt-path:33` | kaymış — ilk ikisi "revize kare dahil" der, son ikisi demez |
| `FACT REQUIRED` token | `PROTOCOL:86` = `FACT_REQUIRED` · `CLAUDE.md:84` = `FACT REQUIRED` · `core-prompt-path:35` = boşluklu | kaymış — makine eşleşmesi kırılır |
| arşiv kıstas değil | `CLAUDE.md:72-75` · `faz-icraat:63-66` | kaymış — farklı sonuç cümlesi |
| katı nesne + hızlı kamera = warp | `PROMPT-YASASI:726` ve `:730` | aynı bölümde iki ayrı madde |

Birebir aynı (sağlıklı): otomatik promote yok · sekans sekans teslim · kurgu kiti motion ile ·
tek geçiş denetimi · palet ham hex girmez · test yeşili görsel kanıt değil (5 dosyada) ·
ajan tavanı 6.

### 1.4 Ders bankası

- `APPROVED.md`: **7 ders**, hepsi tek kaynaktan (Birlikte Daha Güçlüyüz, 2026-07-31). Tavan 20.
- `CANDIDATES-*` 10 dosya: 16 · 7 · 16 · 5 · 0 · 3 · 4 · 0 · 0 · 8 aday
- `HASAT-*` 10 dosya: 19 · 11 · 0 · 15 · 25 · 24 · 0 · 0 · 0 · 5 aday
- `agents/lessons/ONAY-BEKLEYEN.md` (80 satır, 16 madde) — hangi akışa ait olduğu **ölçülmedi**;
  `:3` satırı hâlâ *"APPROVED.md bugün 0 ders taşıyor"* diyor, gerçek 7.

---

## 2. SCRIPT PARKI

### 2.1 Çağrılma durumu

**Bir hook/skill/yasa tarafından çağrılan (14):** `mamilas-command` · `kapanis-hasadi` ·
`dunya-kilidi` · `prompt-lint` · `kaba-kurgu` · `current-work` · `claude-sync` · `agents-sync` ·
`brain-workbench` · `jury-audit` · `seslendirme-tek-blok` · `motion-qc` (yalnız belge) ·
`memory-sync` (yalnız belge) · `motion-lint` (yalnız README).

**Hiçbir yerden çağrılmayan (10):** `teslim-denetim.mjs` · `birlestir.mjs` ·
`ureme-birlestir.mjs` · `ureme-motion-birlestir.mjs` · `t4-recipe-shots.mjs` ·
`t5-scenes-shots.mjs` · `t6-shots.mjs` · `check-assets3d.mjs` · `project-loot.mjs` ·
`vo-nefes-kirp.mjs`.

**Testi olmayan (14/24):** brain-workbench · jury-audit · birlestir · memory-sync ·
vo-nefes-kirp · t4/t5/t6-shots · check-assets3d · motion-qc · teslim-denetim ·
seslendirme-tek-blok · ureme-birlestir · ureme-motion-birlestir.

### 2.2 `teslim-denetim.mjs` — doğrulayıcının kendisi kırık

- `grep -c 'process.argv'` = **0**. Hiçbir argüman kabul etmiyor.
- `:4` hedef proje **mutlak string sabit**: `…/5. Sınıf - Farklı Kültürler, Ortak Bir Yaşam`
- `:92` çıktı yolu da sabit: `artifacts/denetim-2026-07-31/…`
- Sonuç: `node scripts/teslim-denetim.mjs "<herhangi proje>"` → **her zaman Farklı Kültürler'i ölçer.**

| Proje | Denetim ne sayıyor | Dizinde gerçekte |
|---|---|---|
| Farklı Kültürler | 53 | 53 ✅ (tek doğru, rastlantı değil — hedef bu) |
| Hücre ve Organelleri | 53 (başka projeden) | 53 🔴 rastlantı |
| Bitkilerde Üreme | 53 (başka projeden) | 54 🔴 |
| Destek ve Hareket | 53 (başka projeden) | 41 🔴 |
| Bileşke Kuvvet | 53 (başka projeden) | 16 🔴 |
| Biten/* + DENEME/* (15 proje) | 53 | çeşitli 🔴 |

Hardcode kaldırılsa bile `:26` regexi `^### K\d+` — BİÇİM 2 dosyalarıyla **hiç eşleşmez**,
o üç derste 0 dönerdi.

### 2.3 Kodda gömülü tek-proje script'leri

`ureme-birlestir.mjs:7` ve `ureme-motion-birlestir.mjs:12` — proje yolu ve sekans sınırları
**koda gömülü**. Tek kullanımlık araçlar repoda kalıcı script olarak duruyor.

### 2.4 Çakışan girdi sözleşmeleri

| Dosya türü | Bekleyen A | Bekleyen B |
|---|---|---|
| `_PROMPTLAR` blok başlığı | `teslim-denetim:26` tam `### K\d+` | `prompt-lint:546` `#` opsiyonel, K/KARE/SAHNE/SHOT, tire varyantı |
| `MOTION/` dosyaları | `teslim-denetim:27` `NN.txt` sıfır-dolgulu | `motion-lint:474` klasördeki her `.txt` · `birlestir:44` dolgusuz da olur |
| Teslim uzantısı | `birlestir:25` `.md`→`.txt` **isteğe bağlı** | `prompt-lint:819` ikisini de tarar · `gate.sh:123` **yalnız `.txt`** |
| Proje kökü | `birlestir:32` + `prompt-lint:815` cwd-göreli | `kapanis-hasadi:51` script konumundan · `teslim-denetim:4` mutlak |

### 2.5 Platform varsayımları

- CRLF/BOM soyan (sağlıklı): `agents-sync:24` · `mamilas-command:346` · `motion-lint:62` ·
  `project-loot:58` · `kaba-kurgu:44` · `seslendirme-tek-blok:36` · `current-work:75`
- **Soymayan:** `prompt-lint.mjs` ve `teslim-denetim.mjs` — `\r?\n` split'e güveniyor, BOM soymuyor.
- `kaba-kurgu.mjs:252,255,276` — `execSync` kabuk stringi + `rm -f` → **POSIX kabuk varsayımı,
  Windows'ta kırılır**, doğrulayıcı yok.
- `vo-nefes-kirp.mjs:44` ffmpeg kontrolsüz (motion-qc'de kontrol var, `:19` exit 2).

---

## 3. HOOK / KAPI / ORTAM

### 3.1 Kanal envanteri — **bu turun en büyük tek bulgusu**

| Hook | Event | stdout | stderr | Modele ulaşır mı |
|---|---|---|---|---|
| `gate.sh` | PreToolUse/Bash | **0** | **16** | **exit 2'de EVET · exit 0'da HAYIR** |
| `hasat-gate.mjs` | SessionStart | **0** | **12 çağrı** | **HAYIR — hiçbiri** |
| `buddy.mjs` | SessionStart | 2 | 0 | EVET |
| `buddy.mjs` | PostToolUse | 0 | 0 | tasarım gereği sessiz muhasebe |
| `oturum-durumu.mjs` | SessionStart | 5 | 0 | EVET |

**Ölçülen sonuç:** kapı yeşilken ürettiği her şey — `✅ Gate yesil` (`:241`), doküman drift
uyarısı (`:197-199`), sync uyarısı (`:209-212`), push uyarısı (`:230-231`), lint-skip makbuzu
(`:120-124`) — **modele hiç ulaşmıyor.** Hasat kapısının 12 çıktı çağrısının tamamı da öyle.

### 3.2 `Stop` hook'u kayıtlı değil

`buddy.mjs:193-197` `Stop` eventini işliyor ama `.claude/settings.json`'da kayıt **yok** →
bütün state dosyalarında `"turns":0`. Ölçüm hiç toplanmıyor.
Canlı state kanıtı: `.claude/.buddy-state/3a570c66….json` → `"batches":423,"offers":8,"turns":0`.

### 3.3 Kapı (gate.sh) adımları

`L31-34` ön filtre (ham stdin'de "git commit" yoksa exit 0) → `L39` node → `L42-44` JSON parse →
`L46-49` ikinci "git commit" kontrolü → `L51` cd → `L56` tsc → `L62` vitest → `L70-82` test sayısı
≥ baseline (2382) → `L85` build → `L93-104` launcher syntax → `L118-124` lint-skip makbuzu →
`L131-184` `*_PROMPTLAR*.txt` döngüsü + prompt-lint → `L196-200` current-work `--check` (UYARI) →
`L207-214` claude-sync `--check` (UYARI) → `L227-233` push uyarısı → `L236-239` baseline güncelle →
`L241` yeşil.

**Bypass:** `MAMILAS_LINT_SKIP=1` (`:118`) yalnız prompt-lint adımını atlar; tsc/test/build kalır.
**Makbuz:** var ama `:122` yalnız `diff --cached`'ten üretiliyor; döngünün kullandığı working-tree
kolu (`:182`) makbuzda yok → `git commit -a` ile atlandığında makbuz **boş satır** basar.

### 3.4 Sessiz no-op yolları

```
gate.sh:31-34  stdin'de "git commit" dizgisi yok (alias, script, MCP git aracı) → hiç ölçüm yok
gate.sh:51     cd başarısız → `|| exit 0`, adım 1-7 hiç koşmaz, HİÇ mesaj yok
gate.sh:181-182 git hata ya da eşleşen dosya yok → döngü 0 kez döner, prompt-lint HİÇ koşmaz,
               kapı yine "✅ Gate yesil" der
gate.sh:133    teslim dosyası COMMAND-INBOX/ dışındaysa → continue, denetimsiz commit
gate.sh:123    `.md` teslim dosyası → desen `*_PROMPTLAR*.txt`, .md hiç görülmez
hasat-gate.*   node/mjs yok → stderr + exit 0 → tamamen görünmez
buddy.mjs:167  j.agent_id dolu (alt ajan) → return 0; alt ajanlar buddy katmanını hiç görmez
buddy.mjs:108  state yazımı başarısız → catch boş, sayaç ilerlemez, teklif eşiği asla dolmaz
docsContract.test.ts:254  regex yalnız `.claude/hooks/*.sh` eşliyor → buddy.mjs ve
               oturum-durumu.mjs meta-duvarda HİÇ doğrulanmıyor, silinseler testler yeşil kalır
```

### 3.5 Windows kaydı

```
settings.json:12  "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/gate.sh"        (PreToolUse)
settings.json:23  "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/buddy-gate.sh"  (SessionStart)
settings.json:34  "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/hasat-gate.sh"  (SessionStart)
settings.json:28  "node" + args ["${CLAUDE_PROJECT_DIR}/.claude/hooks/oturum-durumu.mjs"]
settings.json:45  "node" + args ["${CLAUDE_PROJECT_DIR}/.claude/hooks/buddy.mjs"]
```
Üç `.sh` kaydının hiçbirinde `bash ` ön eki yok — shebang + exec bitine dayanıyor.
`.mjs` kayıtları exec-form olduğu için bu tuzaktan muaf. **Windows canlı ölçüm: yapılmadı.**

---

## 4. SKILL PARKI

### 4.1 İkizler sağlam

`diff -rq .claude/skills .agents/skills` → **tek fark** `mamilas-ref/SKILL.md` (5 satır,
`CLAUDE.md`↔`AGENTS.md` kelimesi). Bu fark **kasıtlı ve test-onaylı**
(`docsContract.test.ts:215` normalize ediyor). Diğer 9 skill byte-eş.

### 4.2 Gölgeleme — kullanıcı skill'i proje skill'ini eziyor

Üç ad iki yüzeyde birden yaşıyor ve içerikleri ayrı:

| Skill | proje | `~/.claude` | diff | Runtime'da yüklenen |
|---|---|---|---|---|
| mamilas-buddy | 178 | **324** | 504 satır | `~/.claude` sürümü |
| mamilas-gate | 16 | 53 | 71 satır | `~/.claude` sürümü |
| mamilas-audit | 20 | 17 | 39 satır | `~/.claude` sürümü |

Kanıt: runtime skill listesindeki description'lar `~/.claude/skills` sürümüyle bire bir eşleşiyor.
`mamilas-checkpoint · mamilas-studio · mamilas-world` yalnız kullanıcı seviyesinde var;
`docsContract.test.ts:309` ikiz kuralı bunları **hiç görmüyor**.

**Zıt hüküm örneği:** proje `mamilas-gate:3` *"commit etmeden önce kapıyı çalıştırmak için
kullan"* ↔ global `mamilas-gate:3` *"Do NOT use it merely to run the four commands"*.

### 4.3 Ölü yönlendirme

```
mamilas-ref:33,8   → skill `mamilas-world`      → proje skills'inde YOK (yalnız ~/.claude)
mamilas-ref:61     → skill `mamilas-checkpoint` → proje skills'inde YOK (yalnız ~/.claude)
mamilas-ref:41     → brain.ts:971 SYMMETRY_LOCK_REFS → YANLIŞ SATIR (gerçek 1343)
mamilas-ref:50     → brain.ts:386 dnaDirectives     → YANLIŞ SATIR (gerçek 506)
mamilas-ref:45     → public/refs/ "boş"             → dizin hiç YOK
mamilas-enzim:91 + director:61 → ENZIM-KILITLERI.json → kökte YOK, tek nüsha bir Biten/ projesinde
mamilas-buddy:15   → "silinirse docsContract kırmızı verir" → YANLIŞ, test buddy'yi beklemiyor
mamilas-uret:29    → SAHNE-PROMPTLAR.md → repoda YOK
~/.claude/mamilas-checkpoint:9  → memory yolu YANLIŞ PROJE (-Users-Muhammet/, gerçek -…-mamilas-modern/)
~/.claude/mamilas-checkpoint:16 → skill `mamilas-antigravity` → hiçbir yüzeyde YOK
```

### 4.4 İş çakışması

`mamilas-director §3.5` ↔ `mamilas-denetim` — **aynı işi tarif ediyorlar** (kare denetimi +
revize.txt + motion, tek geçiş). Ayrışma ölçüldü:
- tarama kıstasları: `director:158-165` 7 maddeli, **VO-uyumuyla başlar**;
  `denetim:38-40` **0. FİKİR maddesiyle başlar** (yasa §2ø) ve sıra farklı.
- `denetim:14-22` sekans-başına-ajan + tavan 6; `director` bunu hiç bilmiyor, tek kafada yürütüyor.

`revize.txt` biçimi iki yerde ayrı tanımlı: `director:171-186` ve `denetim:72`.

### 4.5 Hafıza ↔ skill kayması (tez (b)'nin ölçümü)

Mami'nin İngilizce seviyesi hükmü:
- hafıza `mami-kisisel.md:134` = "C1, okuduğunu anlamada sorun yok" ✓
- **proje** `.claude/skills/mamilas-buddy/SKILL.md:22-24` = aynı ✓
- **yüklenen** `~/.claude/skills/mamilas-buddy/SKILL.md` (324 satır) = **hüküm YOK**
  (grep "C1/İngiliz/seviye" → 0 isabet); `:20-23` işi memory'ye devrediyor ve
  "çakışırsa memory kazanır" diyor.

Yani düzeltilmiş hüküm (a) hafızada ve (b) **gölgelenen** proje skill'inde yaşıyor;
her oturumda yüklenen dosyada yok. **Kusurun yapısal koşulu duruyor.**

---

## 5. TESLİM HATTI

### 5.1 İki biçim, tek sistem, aynı hafta

**BİÇİM 1 — `### K<n> | VO…` başlıklı, tek birleşik `_PROMPTLAR.txt`**
```
### K01 | VO1 "Bu Mira; okul bahçesi yarınki 23 Nisan şenliği için süsleniyor." · yazı: "23 NİSAN" · KARAKTER
```
Projeler: Farklı Kültürler (53) · Bileşke Kuvvet (16). Ayraç `-----`, kare başına 2.
Her ikisinde **hem** birleşik dosya **hem** `PROMPTLAR/` blokları var — aynı kareler iki kez.

**BİÇİM 2 — `# K<n> — "VO"` blok dosyaları, `### K` başlığı 0 eşleşme**
```
# K01 — "Mira'nın bahçesinde usta, sabahtan beri bir duvar örüyordu."
**yazı:** "ÇİMENTO" — dolu kraft çimento torbasının baskılı yüzü
```
Projeler: Hücre (53) · Bitkilerde Üreme (54) · Destek ve Hareket (41).
Birleşik `_PROMPTLAR.txt` **yok**, `_EDIT-PLAN.txt` **yok**.

### 5.2 Biçim 2 içinde de üç sapma

1. **Destek sıfır-dolgusuz**: içerik `# K1 —`…`# K9 —`, dosya adı `A-K01-K14.txt` — **ad ile
   içerik çelişiyor**. Hücre ve Bitkilerde `# K01` kullanıyor.
2. **Destek eksik**: 41 kare yazılmış, `_SESLENDIRME.txt` 52 cümle → **K42–K52 hiç yok.**
3. **Destek ayraç yarı**: Hücre/Bitkilerde kare başına 2×`-----`, Destek'te 1×.

### 5.3 Kare ↔ numara sözleşmesi

- `N.png = KN` **yalnız metinde** yazılı, bir insana talimat olarak:
  `Farklı Kültürler_KALAN-URETIM.txt:20` → `KAYDEDECEĞİN AD: 3.png (K03)`
- Hücre / Destek / Bitkilerde teslim setlerinde `.png` geçen **tek satır yok** — bu üç projede
  sözleşme hiç yazılmamış.
- Doğrulayan script/test **YOK**. Tek dolaylı kontrol `teslim-denetim.mjs:34` (numara varlığı,
  içerik değil) ve o da tek projeye hardcode.
- Üretim tarafı `kaba-kurgu.mjs:546` `K01` (2 hane sıfır-dolgu) basıyor, dizindeki dosyalar
  dolgusuz (`3.png`). İki kural birbirini doğrulamıyor.

### 5.4 Teslim seti bütünlüğü — 17 proje

Tam set (7 parça + XML): **1 proje** (Biten/Birlikte Daha Güçlüyüz — tek `KABA-KURGU.xml` sahibi).
`_PROMPTLAR` hiç yok: `Biten/Kuvvet MİRA`.
`PROMPTLAR/` dizini boş ama `_PROMPTLAR` dolu: `Biten/Eşeyli ve Eşeysiz Üreme`.
`_REFERANSLAR` yok: Biten/5. Sürtünme · Bizi Bir Arada Tutan Değerler · Sabit Sürat ve Hız · Kuvvet MİRA.

---

## 6. KAYIT · HAFIZA · SENKRON

### 6.1 Senkron — şu an sağlıklı

`node scripts/claude-sync.mjs --dry-run` → `eşit: 57 dosya · ✅ güncel · ÇATIŞMA yok`, exit 0.
İş listesindeki "4 çatışma" ölçümü **artık geçersiz**.

İki script yan yana duruyor: `memory-sync.mjs` (135 satır, tek yönlü, yalnız memory) ve
`claude-sync.mjs` (248 satır, iki yönlü, memory+skills+global CLAUDE.md).
`claude-sync.mjs:8-11` memory-sync'i **açıkça zararlı ilan ediyor** (2026-07-28'de 21+9 dosya
arşive gitti). memory-sync gate'te çağrılmıyor, yalnız `faz-insa.md:52`'de belge olarak anılıyor.

### 6.2 Hafıza

48 dosya, 2179 satır. **Öksüz (dosya var, MEMORY.md'de yok):**
`mamilas-motor-gercekleri.md` (5.2K) · `mamilas-seslendirme-tek-blok.md` (31 satır).
Ters yön (indekste var, dosyası yok): **yok**.

### 6.3 Arşiv — okunmamış rapor yükü

`artifacts/` 12 dizin, 31.297 satır. Repo içinden **hiç referansı olmayan**:
`brain-audit-2026-07-25/` (215 satır) · `duration-bug/` (34 satır).
Tek referanslı sınır vakalar: `codex-69-prompts/` (3888) · `archive-scripts-2026-07-29/` (3974).

---

## 7. İŞ LİSTESİ — 17 maddenin bugünkü geçerliliği

**Doğrulandı, hâlâ kırık (13):** md.1 (hasat stderr) · md.2 (kapat→Biten zinciri) ·
md.3 (`.md` teslim lint atlıyor) · md.4 (motion-lint kapıya bağlı değil) · md.5 (bypass makbuzu) ·
md.6 (stale protocolHash mühürlenebiliyor) · md.7 (matrix testi `catch { continue }`) ·
md.8 (studio motion taslağı kendi linterine kırmızı) · md.10 (dunya-kilidi sessiz fallback) ·
md.11 (migration bozuk dosyayı yutuyor) · md.12 (triage makbuzu yok) · md.13/14 (Windows `.sh`) ·
md.17 (ONAY-BEKLEYEN "0 ders" diyor, gerçek 7).

**Kısmen geçersiz (1):** md.9 — ölü skill atıfları duruyor ama iki skill `~/.claude/skills/`
altında **kurulu**; sorun "yok" değil, **yanlış yüzeyde**.

**Geçersiz (2):** md.15 — sync çatışması yok (0), yalnız yapısal bağ eksik ·
md.16 — `current-work.mjs --check` exit **0**, kayıt geride değil.

**Ölçülmedi (1):** md.13/14'ün Windows canlı davranışı.

---

## 8. BU HARİTANIN KENDİ SINIRLARI

- Windows canlı hook davranışı ölçülmedi (bu makine darwin).
- `teslim-denetim.mjs` yazma yaptığı için koşturulmadı; sayılar statik okumayla türetildi.
- `agents/lessons/ONAY-BEKLEYEN.md`'nin hangi akışa ait olduğu ölçülmedi.
- `src/` (site) bu turun konusu değil, yalnız kütüphane olarak okundu.
- Prompt **kalitesi** ölçülmedi — bu harita biçim ve hat haritasıdır, içerik yargısı değil.
