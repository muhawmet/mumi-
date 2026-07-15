# TASK 2 — Canonical veri sözleşmesi · TASARIM

- Handoff §5 + Mami'nin onayladığı `DeliveryPromise` eki.
- **Bu tasarım icat değil.** `DeliveryPromise`'in şekli Mami'nin çalışan altın prompt'undan
  **ölçülerek** çıkarıldı (`artifacts/baseline-frames/prompts/GOLDEN-0{1,2,3}*.txt`).

---

## 1. `DeliveryPromise` — sözün tipi

Altın prompt'un `== ON-SCREEN TEXT ==` bandı **iki modda** çalışıyor ve **ikisi de ölçülebilir söz**:

| Mod | Altın prompt kanıtı | Kare kanıtı |
|---|---|---|
| `bake` | GOLDEN-01: *"Reads EXACTLY (Turkish, character-for-character): **"ÇOCUK / KARDEŞ"**. Surface: two small wooden tags…"* | Karede etiketlerde **ÇOCUK / KARDEŞ** yazıyor, Ç/Ş glifleri doğru ✅ |
| `clean_plate` | GOLDEN-02/03: *"CLEAN PLATE — no lettering of any language."* | Karede **hiç yazı yok** ✅ |

> **Codex REJECT düzeltmesi (2026-07-15):** yalın `bake(exact, surface) | clean_plate` **yetersiz.**
> Eksikler: çoklu string/yüzey · source span+hash · Unicode/glyph kilidi · **client-brand yetkisi** ·
> `bake` ↔ `clean_plate` **karşılıklı dışlama kapısı** · ve **`AUTO` heuristiği promise'i SEÇEMEZ.**

```ts
/** Karar anında KİLİTLENİR, çıktıya karşı ÖLÇÜLÜR, ihlalde DURDURUR. */
export type DeliveryPromise =
  | { kind: 'clean_plate'; reason: CleanPlateReason }
  | { kind: 'baked_text'; items: BakedTextItem[] };   // ← ÇOKLU

export type CleanPlateReason =
  | 'source_asks_none'   // kaynak metin istemiyor
  | 'world_forbids'      // dünya yasası metni yasaklıyor
  | 'mami_lock';         // Mami açıkça temiz plaka dedi

export interface BakedTextItem {
  /** Karakter karakter. ASLA scrub, ASLA çeviri, ASLA kısaltma. */
  exactText: string;
  /** Metnin PİŞECEĞİ gerçek nesne. Yüzey yoksa bu overlay'dir → ihlal. */
  surface: string;
  /** Glif kilidi. 'tr' → ç Ç ğ ı İ ö Ö ş Ş ü Ü karakter karakter korunur. */
  language: 'tr' | 'en';
  /** Unicode normalizasyonu — hash ve karşılaştırma için tek biçim. */
  normalization: 'NFC';
  /** Bu metin bir MARKA mı? Öyleyse IP firewall'un marka yasağını EZER. */
  brandAuthority: null | {
    /** Mami'nin kendi markası / müşterisinin markası → yasak DEĞİL, KİLİT. */
    kind: 'client_brand' | 'mami_brand';
    /** Kim yetkilendirdi — makbuz. */
    grantedBy: 'source' | 'mami_lock';
  };
  /** Kaynağın TAM YERİ — makbuz. Uydurulamaz. */
  sourceSpan: { sourceId: string; start: number; end: number; exactText: string; hash: string };
}
```

### Karşılıklı dışlama kapısı

`clean_plate` ve `baked_text` **aynı sahnede birlikte olamaz.** İkisi de üretilirse
→ `BLOCKED` (`DELIVERY_PROMISE_CONFLICT`). Bugün bu çelişki **sessizce** yaşıyor:
prompt hem `clean plate` diyor hem kaynak metin istiyor.

### `AUTO` heuristiği promise SEÇMEZ

`deriveOnScreenText()` bir **öneri** üretir, **söz** değil. Söz yalnız iki yerden doğar:
**kaynağın açık isteği** (`sourceSpan` ile) veya **Mami kilidi**.
Kaynak sessizse `clean_plate('source_asks_none')` — bu Mami'nin 2026-07-05 kararının kod hâlidir.

### `MAMILAS THERMO` neden bugün düşüyor — ve nasıl kurtulacak

Bugün: marka-adı negatifleri (`NO real product-brand logo or identifiable branded design`)
kaynağın istediği markayı da yasaklıyor. **Ayrım yok:** "başka markaların logosunu koyma"
ile "MÜŞTERİNİN kendi markasını bas" aynı kefeye giriyor.

`brandAuthority` bu ayrımı yapar: **kendi markan yasak değil, kilit.**
IP firewall yabancı markayı bloklamaya devam eder; yetkili markayı **korur**.

### P0'ın KÖK NEDENİ — bug değil, EKSİK (kodla doğrulandı)

`deriveOnScreenText()` (`pure.ts:628-645`) ekran metnini **kaynağın isteğinden** değil,
**pedagoji sezgisinden** türetiyor:

```ts
if (mode === 'CLEAN') return null;
if (phaseName === 'Build-up') return null;
const wordCount = clean.split(/\s+/u).filter(Boolean).length;
if (wordCount > 3) return null;      // ← beat 3 kelimeden uzunsa METİN YOK
return kw;                            // ← yoksa beat'ten "anahtar kelime" kesilir
```

Termos beat'i 9 kelime → **`null`**. Mami'nin *"ürün üzerindeki 'MAMILAS THERMO' yazısı baked-in
görünsün"* cümlesi sisteme **bir istek olarak hiç ulaşmıyor** — yalnızca anlatılacak bir beat sanılıyor.

**Sistemin "kaynak şu yüzeye şu metni istedi" diye bir kavramı YOK.**
Var olan tek şey: *"beat kısaysa ondan anahtar kelime çıkar."*

### ⚠️ MAMİ'NİN 2026-07-05 KİLİDİ KORUNUR

`pure.ts:636-639` bir **Mami kararı** taşıyor: *"AUTO: temiz plaka + VO. Anlatı beat'ine metin BASMA —
uzun cümlenin ilk 2 kelimesini kesip başlık yapmak YASAK."* **Bu doğru ve kalacak.**

Değişen tek şey: kaynak **açıkça** metin + yüzey istediğinde bu bir **`DeliveryPromise`** olur ve
pedagoji sezgisini **yener** — çünkü alan otoritesinde **Source/Mami en üsttedir.**
Kaynak istemiyorsa `clean_plate` varsayılanı aynen yaşar. Mami'nin kilidi ezilmez, **kapsanır.**

### İhlal = BLOCKED, prose değil

**Bugünkü davranış (gerçek `generateBatch` ile ölçüldü):** kaynak baked-text istiyor,
prompt üç yerde iptal ediyor, `contractGate = PASS`, `qa.imageScore = 100`.

**Yeni davranış:** `promise.kind === 'baked_text'` iken üretilen prompt
`exactText`'i **taşımıyorsa** ya da onu iptal eden bir cümle **içeriyorsa**
→ `validateBriefCompatibility` deseniyle **`BLOCKED`**, `generateBatch` **sıfır sahne**.

Kod: `pure.ts:860-966` → `pure.ts:1188` deseni izlenir. **Prompt'un içine "DUR" cümlesi yazmak
kapı değildir** (`PERIOD REQUIRED` bunu yapıyor ve string yine return ediliyor —
`brain.ts:2045-2047`).

Yeni blocker kodu: **`DELIVERY_PROMISE_BROKEN`**.

**P0 regresyon testi (kabul şartı):** termos source'u (`rawHash ba24888a`) verilir;
prompt `MAMILAS THERMO`'yu iptal ederse test **BLOCKED bekler**. Bugün `PASS` dönüyor → test **kırmızı**.

---

## 2. Canonical hash — determinizm

**Bugünkü kırık:** `commandExport.ts:164` `new Date().toISOString()` → `:173`
`commandId: mamilas-${sourceHash(topic|generatedAt)}` = **timestamp türevi**, içerik hash'i değil.

**Yeni:**
- `commandId` = **karar setinin içerik hash'i**. Aynı kararlar → **aynı byte, aynı hash**.
- Stabil anahtar sırası · UTF-8 · **açık Unicode normalizasyonu** (NFC — Türkçe glifler için şart) ·
  SHA-256 · **timestamp hariç**.
- `generatedAt` **ayrı audit manifestine** taşınır, karar nesnesinden çıkar.
- Dizi sırası yalnız **semantikse** korunur (beat sırası semantik; ref sırası değil → sıralanır).

---

## 3. Şemalar (handoff §5)

`mamilas.base-decision.v1` · `mamilas.storyboard-proposal.v1` · `mamilas.decision.v1` ·
`mamilas.receipt.v1` · `mamilas.state.v1` · `mamilas.closeout.v1`

### `base-decision` sınırı

**Taşır:** exact raw source + `rawHash` · beat sırası · amaç/izleyici/görünür kanıt ·
path/world/material/palette/ref/model · **brand/identity/product/exact-text kilitleri**
(← `DeliveryPromise` burada yaşar) · engine window/aspect · Mami non-negotiable'ları ·
eksik gerçekler ve compatibility.

**Taşımaz:** final image prompt · motion taslağı · **agent TODO** (← `[DIRECTOR TASK]` buraya
asla girmez) · timestamp · QA kişiliği · uzun provider talimatı.

---

## 4. Alan-bazlı otorite (doğrusal liste değil)

| Alan | Neyin son sözü |
|---|---|
| Source / Mami | **anlam ve değişmez gerçek** |
| Path / engine | üretilebilirlik |
| World | **görünüş fiziği** (render_law'ın fizik yarısı — verbatim) |
| Material / ref / palette | world içinde **uyumlu** davranış |
| Onaylı storyboard | somut yaratıcı shot |
| Onaylı frame | **yalnız motion başlangıcı** |

**Her ezilen directive makbuz bırakır.** Bugün kaybeden directive **sessizce eziliyor**
(tek makbuz ref susturmada — `pure.ts:1020, 1117`).

Eski doğrusal `AUTHORITY_HIERARCHY` (`brain.ts:2288`) yalnız **V2026 importer uyumluluğunda** yaşar.

---

## 5. Kabul (handoff §5)

1. **Determinizm:** aynı karar → aynı byte + aynı hash. (Test)
2. **Timestamp exclusion:** `generatedAt` hash'e girmiyor. (Test)
3. **Yetki sınırları:** source/world/ref/frame. (Test)
4. **Exact text korunumu:** kaynağın metni karakter karakter korunuyor, scrub edilmiyor. (Test)
5. **P0 regresyon:** baked-text isteği iptal edilirse **BLOCKED**. (Test — bugün kırmızı olmalı)

## 6. Bu task'ta YAPILMAYACAK

- `brain.ts`'in prompt üretimi **değişmez** (o TASK 4).
- 46 dünyaya dokunulmaz (o TASK 7, A/B'ye bağlı).
- `render_law` fiziği **verbatim kalır** — A2 kanıtı.
