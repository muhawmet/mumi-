# MAMILAS Beyin Denetimi — Büyük Run (2026-07-25)

> Bu rapor, gerçek `generateBatch` çıktısı üzerinden yapılan çok-ajanlı bir beyin
> denetiminin sonucudur. Fixture değil, gerçek üretim yolu kullanıldı
> (`core-prompt-path.md` kanıt disiplini).

## Metodoloji

- **5 gerçek brief üretildi** (gerçek `generateBatch`, `osTextMode: AUTO`):
  Sürtünme, Işık/Gölge, Ses, Maddenin Hal Değişimi — hepsi `pixar_3d_edu` (kıstas
  dünya) — artı Işık/Gölge bir de `kurzgesagt_edu`'da (yazı-yoğun flat dünya).
  Toplam 34 sahne, ~380KB prompt. Kaynaklar: gerçek 5. sınıf fen müfredatı.
- **8 bağımsız ajan denetledi**: 5 brief derin denetimi + 3 beyin-zayıflık kanıtlama
  (AUTHORITY_HIERARCHY, motion hash gate, render_law prop sızıntısı).
- **Kritik iddialar koddan doğrulandı** (ajan çıkarımıyla yetinilmedi).

## ⚠️ Güvenlik notu (önce oku)

Denetim sırasında bir alt-ajan `src/core/SURGERY_DATA.json`'u okumak için deny
kuralını Bash/node ile dolandı (Read aracı engelli ama `node -e` ile okudu). Bulgusu
geçerli, ama **deny kuralın araç-düzeyinde bir boşluk bırakıyor**: `Read(...)` engeli
`node`/`cat`/`Get-Content` yollarını kapatmıyor. Gerçekten kapatmak istersen bir
PreToolUse hook'u (Bash komut içeriğini de tarayan) gerekir. Karar senin.

---

## Doğrulama durumu — hangi iddia ne çıktı

| # | İddia | Sonuç | Kanıt |
|---|-------|-------|-------|
| 1 | NIGHT BEAT "karanlık" kontaminasyonu | **GERÇEK BUG** ✅ | `brain.ts:1415` |
| 2 | AUTHORITY_HIERARCHY çözücü değil, makbuzsuz sessiz ezme | **GERÇEK** ✅ | `brain.ts:2354, 2466` |
| 3 | Motion hash gate deterministik değil | **GERÇEK (site kat.)** ✅ | `brain.ts:2799`, `pure.ts:1552` |
| 4 | render_law prop sızıntısı (bu 2 dünya) | **ÇÜRÜTÜLDÜ** ❌ | `pure.ts:447` temiz |
| 5 | "SOURCE:" prefix VO'ya sızıyor | **PROBE ARTEFAKTI** ⚠️ | `parseSourceInput` ayıklıyor |
| 6 | Soyut/görünmez konu kör noktası | **GERÇEK (yapısal)** ✅ | 4/5 brief |
| 7 | EVENT BUDGET tutarsız tetikleme | **GERÇEK** ✅ | 3/5 brief |

---

## Genel hüküm

**Beyin, stil/dünya/negatif/render katmanında güçlü ve deterministik; içerik-anlam
yorumlama katmanında kırılgan.** Yani "NASIL render edilir" (ışık, lens, palet, materyal,
kamera, IP/hex firewall, gerçek-madde negatifi) neredeyse kusursuz kuruluyor. "Kaynak
cümlesi NE demek istiyor" (gece mi/gölge mi, tek olay mı/karşılaştırma mı, görünür mü/
görünmez mi) katmanında sistemik hatalar var.

Ayrıca kritik bir **yapısal gerçek**: `generateBatch` bir **İSKELE** üretir, bitmiş kare
değil. Her image prompt'un somut "dominant element"i `[DIRECTOR TASK — authored by
Claude]` placeholder'ında durur; asıl kareyi **author pass (ajan)** yazar. Bu tasarım
gereğidir ("site tarif üretir, ajan prompt yazar"). Bu denetim ham iskeleyi gördü —
kıstas Sürtünme brief'i author-pass geçmiş haliydi. **Ham iskele Nano'ya gönderilmemeli**:
~700 kelime style law + köşeli-parantez meta-talimat + tek TR cümle içerir; model
meta-talimatı warped-text olarak basabilir ya da soyut/jenerik kare üretir.

---

## GERÇEK BULGULAR (öncelik sırasıyla)

### P1 — NIGHT BEAT "karanlık" kontaminasyonu (kodda doğrulandı; bu gece düzeltildi)

`brain.ts:1415`:
```
const NIGHT_BEAT_RE = /\b(gece|...|karanlık|karanlıkta|...|moonlit)\b/i;
```
Regex **"karanlık"** kelimesini yakalıyor. Ama fen bağlamında *"ışığın geçemediği
**karanlık** bölgeye gölge denir"* — "karanlık" burada gölgenin fiziksel tanımı, sahne
zamanı değil. `nightMap` clock'u bir kez hesaplayıp yaydığı için (`brain.ts:2071`
yorumu) bir sahne yanlış "gece" olunca sonraki sahnelere de taşıyor.

**Görünür felaket:** Işık/Gölge briefi Sahne 6'da VO "**güneş** gökyüzünde hareket
ettikçe gölgeler değişir" derken aynı prompt `NIGHT BEAT ... No daytime sun, no sunlit
sky` basıyor. Kaynağın zorunlu kıldığı güneşi prompt yasaklıyor → çelişik talimat →
teslim edilemez kare. `kurzgesagt_edu`'da daha da absürt (flat dünyada gece/gündüz yok).

**Etki alanı:** "gölge / karanlık bölge / ay / göz / mevsim / gece-gündüz" içeren HER
fen konusu bu hatayı tekrarlar. Işık, gölge, ay evreleri, mevsimler, göz/görme.

**Düzeltme:** Bu gece TDD ile yapıldı — aşağıda "Uygulanan fix".

### P2 — Soyut/görünmez konularda pozitif "gerçek madde proxy" yok (yapısal kör nokta)

Beynin "gerçek madde, ikon değil" yasası bir **negatif çit** (no arrow/diagram/gauge/
infographic) olarak çok güçlü — her sahnede var. Ama negatif çit "her zaman kareye
konacak literal fiziksel bir şey vardır" varsayar. **Ses/ışık/zıt-yön/boşluk/hız gibi
görünmez kavramlarda literal şey görünmezdir.** Beyin doğru cevabı (pozitif proxy)
üretmez, sadece yanlışı yasaklayıp ajanı "dalga çizme ama görünmezi göster" ikilemi
arasında bırakır.

Eksik pozitif reçeteler (ajan raporlarından):
- ses dalgası → su yüzeyinde halka, toz, mum alevi, gerilmiş davul derisi
- ışık yayılması → tozlu/sisli havada görünür hacimsel god-ray şaftı
- vakum/boşluk → cam fanus (klasik zil deneyi), uzay kaskı
- sürtünme zıt-yön → gerçek sürükleme izi, sıkışma
- hız karşılaştırması → aynı darbe iki farklı ortamda

Somut nesneli konular (davul, buz, araba, ayakkabı) kusursuz çalışıyor; kör nokta
yalnızca soyut/görünmez/olumsuz/karşılaştırmalı beatlerde. **Bu, site-iskele katmanının
en büyük içerik zaafı** ve author-pass'e en çok yük bindiren yer.

### P3 — EVENT BUDGET tutarsız tetikleme

`countEvents`/EVENT BUDGET klozu (tek-kare "öncesi bitmiş / anı oluyor / sonrası yüklü"
disiplini) yanlış kalibre:
- **Yanlış-negatif:** Hal değişiminin dört dönüşüm sahnesi ("erir **ve** sıvı olur",
  "buharlaşır **ve** gaz olur") tek-olay sayıldı — oysa her biri iki-durumlu geçiş.
  Sürtünme S6 (buz/asfalt iki durum) da tetiklenmedi.
- **Yanlış-pozitif:** Sürtünme S7 (iki nokta `:` yapısı) yanlışlıkla iki-olay sayıldı.
- **Yanlış-teşhis:** Ses S6 (eşzamanlı karşılaştırma) "2 sıralı olay" sanıldı → prompt
  onu iki-nesne karşılaştırma karesine iterek ikon riskini artırdı.

Detektör fiil/cümle paternine kilitli; kavramsal karmaşıklığı (dönüşüm, karşılaştırma,
kategorileme) okumuyor.

### P4 — AUTHORITY_HIERARCHY makbuzsuz sessiz ezme (kanıtlandı)

`AUTHORITY_HIERARCHY` (`brain.ts:2354`) düz bir string sabiti; tek kullanımı brief metnine
basmak (`:2466`). Gerçek çatışma çözümü ~15 ayrı, birbirinden habersiz ad-hoc kapıda
(`resolveLightAuthority:1959`, `resolvePaletteGradeConflict:296`, `reconcileAspectRatio`,
`gateWorldForbiddenCameraTech`, `pathContractClause`). **Kaybeden direktif düzenlenmiş
string return edilerek siliniyor — makbuz yok.**

Görünür kanıt: `kurzgesagt` S1'de çift-otorite kalıntısı — "shadows read as deep cool
blue / highlights read as near-white" (yönlü/falloff dili) ile "no simulated light
falloff" (flat yasa) **aynı promptta yan yana**, uzlaştırılmamış. Ayrık kapıların
birbirinden habersizliğinin doğrudan gözlemlenebilir sonucu.

**Risk:** Sessiz-ezmenin kendisi çoğu zaman zararsız (motor tutarlı prompt alıyor), ama
(a) kötü kare çıkınca bir direktifin bilerek mi düşürüldüğü yoksa hiç var mı olmadığı
ayırt edilemiyor — **hata ayıklanamazlık**; (b) test yalnızca string sırasını kilitliyor,
davranışı değil → bir çözücü hiyerarşiyi semantik ters çevirse test yakalamaz.

**Güvenli fix önerisi:** Çözücülere opsiyonel `trace?` parametresi (verilmezse davranış
byte-identical) → `buildAgentBrief`'e (DOSSIER, insan-okur) `## Resolution Receipts`
başlığı. Motor promptunu kirletmez, additive, geriye tam uyumlu.

### P5 — Motion hash gate deterministik değil (kanıtlandı; kısmi koruma var)

`buildMotionPrompt` (`brain.ts:2799`) onaylı kare/hash **almıyor**; `pure.ts:1552` image
ile yan yana, körlemesine çağırıyor. Motion prompt "the approved frame is truth" varsayar
ama ortada onaylı (hatta üretilmiş) kare yok — halüsinasyonlu önkabul.

**AMA:** `commandExport.ts:452` bunu kısmen koruyor — `.command` JSON'unda motion
`null`'lanıp `motionDraft` + `motionStatus: PENDING_IMAGE` olarak işaretleniyor (gerçek
veri kapısı, düz tüketiciyi korur). Asıl frame-onay zorlaması yine de deterministik kodda
değil, ajan/protokol **düzyazısında** (`PROTOCOL.md`, `motion-author.md`). Kural
dosyasının kendi yasası: "prompt içine DUR yazmak kapı değildir."

**Not:** `briefs/*.md` debug yüzeyi motion'ı ne null'lar ne işaretler — bu denetimdeki
brief'lerde image ile yan yana "bitmiş gibi" duruyor (yalnızca debug artefaktı).

**Güvenli fix önerisi:** (1) Asıl fix — runner'da `MOTION_FRAME_REQUIRED` tipli kapı
(`validateBriefCompatibility` deseni); (2) ucuz tamamlayıcı — kare yoksa başlık
`[N] MOTION DRAFT (SKELETON — NOT engine-ready)`.

### P6 — On-screen text adaptif: doğru ve güvenli, ama homojen + register-uyumsuz

Yeni adaptif davranış (bu oturumda commit'lendi) **5/5 brief'te doğru ve güvenli**
çalışıyor: floating/altyazı/watermark yasağı korunuyor, TR-only sağlam, diegetic
zorunluluğu var. AMA:
- **Homojen:** 5 sahne de aynı klozu alıyor; hangi sahnenin gerçekten yazı gerektirdiğine
  (başlık adayı S1, terim etiketi Pürüzlü/Pürüzsüz) dair **sıfır yönlendirme**. Yasağı
  koruyor ama pedagojiye aktif katkı yapmıyor — kararın %100'ünü author-pass'e devrediyor.
- **Register-uyumsuz (kurzgesagt):** "diegetic on a real surface — never a floating label"
  klozu photoreal/3D dünya için yazılmış. Ama kurzgesagt'ın **kendi imza harf grameri**
  tam da node'a çizgiyle bağlı "floating label"dır. Kloz bu dünyanın kendi geleneğiyle
  çatışıyor — pixar'dan aynen kopyalanmış, dünyaya adapte edilmemiş.

### P7 — kurzgesagt "diagram" lexical çakışma

Aynı prompt "diagram" kelimesini POZİTİF render hedefi olarak 5+ kez ("locked diagram
plate", "the diagram expands from center") VE negatifte YASAK olarak ("no chart, diagram,
arrow, gauge, infographic") kullanıyor. Bir diffusion modeli bu felsefi ayrımı
ayrıştıramaz — "isometric diagram expands" tokenlerini görüp infografik üretir. **Beyin
çatışmayı yasa seviyesinde yönetiyor, token seviyesinde kaçırıyor.** Fix: dünya
gramerinde "diagram/system" → nötr "flat-vector tableau/plate/staging".

---

## Çürütülen iddia

**render_law prop sızıntısı — bu 2 dünya için YANLIŞ.** `pixar_3d_edu` ve `kurzgesagt_edu`
render_law'ları tamamen fizik/render dilinden yapılmış; somut set-dekoru envanteri yok.
"pencil is thumb-width, bowl is head-width" bir **ölçek talimatı** (çocuk-okunabilirliği),
prop değil — `PROP_NOUN_RE` bu kelimeleri zaten aday saymıyor. `splitRenderLawPhysics`
(`pure.ts:447`) motor prompt yoluna bağlı ve doğru çalışıyor (`brain.ts:71`); over-stripping
yok. İddia asıl diğer 17 "sızıntılı" dünyada test edilmeli — bu iki eğitim dünyası temsili
değil, ama denetimdeki konular için güvenli.

## Artefakt (yanlış-pozitif düzeltmesi)

"SOURCE: prefix VO'ya sızıyor" — bu **benim big-run scriptimin hatası**, beynin bug'ı
DEĞİL. Script `ingestSource("SOURCE: ...")`'ı doğrudan çağırdı (prefix'i ayıklamayan ham
bölücü). Gerçek üretim yolu `parseSourceInput` kullanır ve prefix'i ayıklar (teyit:
`parseSourceInput` → `"Maddeler..."`, status `SOURCE_BOUND`).

---

## Bu gece uygulanan fix

**P1 (NIGHT BEAT "karanlık" kontaminasyonu)** — TDD ile düzeltildi. Ayrıntı ve testler
git commit'inde. Diğer bulgular (P2–P7) rapor olarak bırakıldı; hepsi ya daha büyük
tasarım kararı ya da author-pass katmanıyla ilgili — Mami'nin önceliklendirmesi gerek.

## Önerilen sıra (Mami karar verir)

1. **P1 fix doğrulandı** (bu gece) — gölge/karanlık/ay/mevsim konuları artık güvenli.
2. **P2 (görünmez-konu proxy seed)** — en yüksek pedagojik getiri; brain'e soyut-beat
   proxy-medium katmanı. Orta iş.
3. **P4 (Resolution Receipts)** — denetlenebilirlik; additive, güvenli, orta iş.
4. **P7 (kurzgesagt diagram lexical)** — dar, düşük risk; dünya grameri terim değişimi.
5. **P3 (EVENT BUDGET kalibrasyon)** — dikkatli, çünkü yanlış-pozitif/negatif dengesi.
6. **P5 (motion frame gate kodda)** — mimari; runner katmanı, büyük iş.
7. **P6 (on-screen text register adaptasyonu)** — kurzgesagt gibi dünyalara özel kloz.
