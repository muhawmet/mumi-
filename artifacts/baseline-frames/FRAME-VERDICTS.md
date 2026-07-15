# BASELINE KARE VERDICT'LERİ — söz vs piksel

- TASK 1B · 2026-07-14/15
- Kaynak: Mami'nin **çalışan ajan hattı** (site değil). Prompt + kare çiftleri Mami tarafından verildi.
- Hüküm sahibi: **Mami.** Aşağıdaki "Claude gözlemi" satırları ölçümdür, verdict değildir.
- Dünya: `pixar_3d_edu` (KARE-BULGULARI'nda ✅ geçen dünya).
- Kimlik taşıyıcısı: **Magnific `@`-handle** (`@[uuid:mira:output]`, `@[uuid:efe:output]`).

> **Bu dosya A/B'nin REFERANS ayağıdır.** TASK 5'te sitenin (TASK 4 sonrası) **aynı kararla**
> ürettiği prompt bu karelerin karşısına konur. Mami pikselleri yan yana görüp hüküm verir.

---

## GOLDEN-01 — mutfak · Mira · kardeş · ahşap etiketler
`prompts/GOLDEN-01-pixar_3d_edu-mira-mutfak.txt`

**Prompt'un verdiği söz (`== ON-SCREEN TEXT ==`):**
> DIEGETIC — baked into the frame as a real object… Surface: two small wooden tags…
> Reads EXACTLY (Turkish, character-for-character): **"ÇOCUK / KARDEŞ"** … Turkish characters exact incl. Ç, Ş.

**Claude gözlemi (kare açıldı, bakıldı):**
- ✅ **SÖZ TUTULDU.** Duvardaki iki ahşap etikette **ÇOCUK** ve **KARDEŞ** yazıyor.
  **Ç ve Ş glifleri doğru.** Harfler ahşabın eğimini ve odanın safran ışığını almış;
  overlay/caption değil, **gerçek nesne** olarak pişmiş.
- ✅ Kardeş yüzü kameraya dönük değil (frame-specific negatif tutmuş).
- ✅ Baskın öğe teslim: Mira bağcığı ilmekliyor, kardeş elini omzuna dayamış.
- ✅ Dünya kilidi: SSS'li ten, konturzuz siluet, pişmiş AO, sıcak motive key.

### ⚡ BU KARE P0'IN PİKSEL KANITIDIR
Aynı sahne **sitenin** promptuyla üretilseydi: site her sahneye sabit
`Text/logo: clean plate — this scene carries no on-screen text` yazıyor.
→ **Etiketler BOŞ tahta olarak çıkardı.** Kaynak ne isterse istesin.
Ölçüm: `site-output/SITE-02-*.image-prompt.txt` (gerçek `generateBatch`, `contractGate=PASS`).

---

## GOLDEN-02 — hilal Ay · Efe silueti · CLEAN PLATE
`prompts/GOLDEN-02-pixar_3d_edu-efe-hilal.txt`

**Söz:** `== ON-SCREEN TEXT == CLEAN PLATE — no lettering of any language.`
Dominant: ince hilal, Efe'nin küçük silueti kenarda. Physics: keskin ışıklı kenar (anchor) ·
ucunda göz kırpan yıldız (micro) · derin mavi gece gradyanı (pressure).

**Claude gözlemi:**
- ✅ **CLEAN PLATE tutuldu** — karede hiçbir dilde tek harf yok.
- ✅ Üç fizik detayının üçü de karede: keskin hilal kenarı, ucunda parlayan yıldız, derin mavi gradyan.
- ✅ Ölçek karakter olmuş: devasa hilale karşı minik siluet.
- ✅ Palet ışık davranışı olarak okunuyor (safran ışık / derin kozmik mavi), düz dolgu değil.

**Not:** CLEAN PLATE de bir **sözdür** — "hiç yazı yok" ölçülebilir bir vaattir.
`DeliveryPromise` bu yüzden iki modlu olmalı: `bake(exact string, surface)` **veya** `clean_plate`.

---

## GOLDEN-03 — kask · Efe · vizörde Ay yansıması
`prompts/GOLDEN-03-pixar_3d_edu-efe-kask.txt`

**Söz:** Dominant: Efe kaskı indiriyor, Ay vizörde yansıyor. Physics: vizör kapanıp buğulanıp
açılıyor (micro) · Ay vizör camında eğri yansıyor (anchor) · fırçalanmış kask metali + kumaş (pressure).
CAST LOCK: *"No real astronaut likenesses, **no agency insignia**… **NOT a real-agency suit**"*
NEGATIVE (frame-specific): *"a real-agency suit/logo"* · (baseline): *"real spacecraft/**agency logos**"*

**Claude gözlemi:**
- ✅ Vizörde Ay'ın eğri yansıması var (anchor teslim).
- ✅ Göğüsteki hilal-güneş amblemi **özgün** tasarım; lacivert+safran+domates paleti tutmuş.
- ✅ Kimlik Efe olarak sabit (drift yok). CLEAN PLATE tutuldu.
- ❌ **İHLAL — NEGATİF KAÇAĞI:** sağ omuzda küçük bir **bayrak yaması** var
  (kırmızı-beyaz şeritli, mavi köşeli — ABD bayrağına benziyor).
  Prompt bunu **iki ayrı bantta açıkça yasaklamış** (CAST LOCK + NEGATIVE) ve motor **yine de bastı.**

### ⚡ BU KARENİN DERSİ — negatif garanti DEĞİLDİR
Prompt kusursuzdu. Kusur **pikselde**. Prompt QA bu kareye 100 verirdi.

KARE-BULGULARI'nın yasası birebir doğrulandı:
> *"QA bir string okudu, motor bir resim çizdi."*

**Sonuçlar:**
1. **Frame gate KOD olmalı** (TASK 6). Bugün `runner.mjs` içinde `FRAME_PASS` → sıfır eşleşme.
2. **IP firewall yalnız prompt'a bakarak yetmez.** `pure.ts:241-256` veri kapısı sağlam ama
   motorun kareye koyduğu ajans/bayrak amblemini hiçbir şey görmüyor. Bu bir **export riski**:
   kare müşteri reklamına gidiyor.
3. Bu, "yasak yaz, geçsin" yaklaşımının sınırıdır. Yasak **ölçülmeli**, sadece yazılmamalı.

---

## Eksik olan tek şey

**Piksel dosyaları henüz diskte değil** — kareler sohbete yapıştırıldı, `artifacts/baseline-frames/frames/`
altına PNG olarak düşmedi. Claude sohbetteki görseli diske yazamaz.

**Mami:** üç PNG'yi `artifacts/baseline-frames/frames/` altına bırak
(`GOLDEN-01-mira-mutfak.png`, `GOLDEN-02-efe-hilal.png`, `GOLDEN-03-efe-kask.png`).
SHA-256 manifesti çıkarılır, TASK 1B kapanır.
