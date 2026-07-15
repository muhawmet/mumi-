# T5 — Sahneler + Timeline Şöleni Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Storyboard beat kartları beat'e özgü STATİK painterly thumb'lara döner (CanvasPreview/rAF emekli — piksel asla); Timeline film şeridi gerçek şerit metaforuna büyür; boş durum çelişkisi ölür (başlık duruma uyar, tek CTA), export düğmeleri ikincil çubuğa iner; PHASE_COLORS mor kaçağı sage/buz ailesine döner; EN teknik değerler "TEKNİK KANIT · EN" etiketli mono blokta toplanır.

**Architecture:** Yeni `BeatThumb` = TEK SEFERLİK çizilen `<canvas>` (rAF yok) — beat/scene id'sinden mulberry32 seed'li deterministik painterly yıkama (dünya paletinin renkleriyle katmanlı gradyan + fırça yayları + vinyet). BeatCard 60px kare, Timeline detay 16:9 varyantı aynı bileşen. RecipeThumb'ın Scenes/Timeline kullanımları ölür; başka kullanıcısı kalmazsa dosya SİLİNİR (yarım emeklilik yok). FilmStrip çift sıra zımba deliği + selüloit çerçeve + 96px kare yüksekliğiyle gerçek şerit olur.

**Tech Stack:** Vite + React + TS + Zustand; vitest (pure paint fonksiyonu mock-ctx ile testli — REF_SCENES smoke deseni + fs-sözleşme); Playwright screenshot kanıtı.

**Değişmezler:** UI Türkçe · sage #93c9a8, NEON/MOR YASAK · hit-target oynatan animasyon yasak · test sayısı 391'den DÜŞMEZ · beyin dosyalarına (src/core pure/brain/source/qa) DOKUNMA · 5180'e dokunma · push yok · e2e metin sözleşmeleri KORUNUR: `Beat Planner & Storyboard` başlığı, `SAHNE 1 · INTRO`, `5/5 üretildi`, `PACING ARCI` — bu string'leri DEĞİŞTİRME.

---

## File Structure

- **Create** `src/components/BeatThumb.tsx` — statik painterly thumb (pure `paintBeatThumb` + bileşen).
- **Create** `src/components/beatThumb.test.ts` — pure paint testi (mock ctx, determinizm + rAF yasağı fs kontrolü).
- **Modify** `src/pages/Scenes/ScenesStep.tsx` — BeatCard RecipeThumb→BeatThumb.
- **Modify** `src/pages/Timeline/TimelineStep.tsx` — detay+boş durum thumb'ları, PHASE_COLORS mor fix, başlık/CTA, export ikincil çubuk, KANIT bloğu.
- **Delete (koşullu)** `src/components/RecipeThumb.tsx` — başka kullanıcı kalmazsa.
- **Create** `scripts/t5-scenes-shots.mjs` — kanıt kareleri.

---

### Task 1: BeatThumb — pure paint + bileşen (TDD)

**Files:**
- Create: `src/components/BeatThumb.tsx`
- Test: `src/components/beatThumb.test.ts`

- [x] **Step 1: Failing test**

```ts
// src/components/beatThumb.test.ts
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { paintBeatThumb } from './BeatThumb';

function mockCtx() {
  const calls: string[] = [];
  const grad = { addColorStop: vi.fn() };
  return {
    calls,
    ctx: {
      createLinearGradient: vi.fn(() => grad),
      createRadialGradient: vi.fn(() => grad),
      fillRect: vi.fn(function () { calls.push('fillRect'); }),
      beginPath: vi.fn(),
      arc: vi.fn(function () { calls.push('arc'); }),
      stroke: vi.fn(function (this: unknown) { calls.push('stroke'); }),
      fill: vi.fn(function () { calls.push('fill'); }),
      set fillStyle(_v: unknown) {}, get fillStyle() { return ''; },
      set strokeStyle(_v: unknown) {}, get strokeStyle() { return ''; },
      set lineWidth(_v: unknown) {}, get lineWidth() { return 0; },
      set lineCap(_v: unknown) {}, get lineCap() { return ''; },
      set globalAlpha(_v: unknown) {}, get globalAlpha() { return 1; },
    } as unknown as CanvasRenderingContext2D,
  };
}

describe('paintBeatThumb', () => {
  it('4 saniyede kare boyar: zemin + en az 3 fırça yayı + vinyet, hata fırlatmaz', () => {
    const { ctx, calls } = mockCtx();
    paintBeatThumb(ctx, 120, 120, ['#2b2117', '#6b5636', '#f7c948', '#93c9a8'], 'source-001');
    expect(calls.filter((c) => c === 'fillRect').length).toBeGreaterThanOrEqual(2);
    expect(calls.filter((c) => c === 'stroke').length).toBeGreaterThanOrEqual(3);
  });

  it('aynı seed aynı çizim yolunu üretir (determinizm)', () => {
    const a = mockCtx(); const b = mockCtx();
    paintBeatThumb(a.ctx, 100, 60, ['#111', '#222', '#333', '#444'], 'beat-7');
    paintBeatThumb(b.ctx, 100, 60, ['#111', '#222', '#333', '#444'], 'beat-7');
    expect(a.calls).toEqual(b.calls);
  });

  it('bileşen rAF kullanmaz — statik tek çizim sözleşmesi', () => {
    const src = readFileSync(new URL('./BeatThumb.tsx', import.meta.url), 'utf8');
    expect(src).not.toContain('requestAnimationFrame');
    expect(src).toContain('paintBeatThumb');
  });
});
```

- [x] **Step 2: Koş, FAIL gör** — `npx vitest run src/components/beatThumb.test.ts`

- [x] **Step 3: Implementasyon**

```tsx
// src/components/BeatThumb.tsx
import React from 'react';

/* Beat'e özgü STATİK painterly kare — CanvasPreview/rAF emekli (V3.1: piksel asla, animasyon thumb'da israf).
 * Seed = beat/scene kimliği; aynı beat her zaman aynı kareyi alır (mulberry32). */

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h ^= h >>> 15; // kısa inputta alt-bit bias'ı katla (FNV dersi)
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function paintBeatThumb(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  seed: string,
): void {
  const rnd = mulberry32(hash32(seed));
  const [deep = '#211a10', mid = '#4a3b22', accent = '#f7c948', counter = '#93c9a8'] = colors;

  // Zemin: diyagonal sıcak yıkama
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, deep);
  wash.addColorStop(1, mid);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // Fırça yayları: 3-5 yarı saydam süpürme (accent + counter dönüşümlü)
  const sweeps = 3 + Math.floor(rnd() * 3);
  ctx.lineCap = 'round';
  for (let i = 0; i < sweeps; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.12 + rnd() * 0.14;
    ctx.strokeStyle = i % 2 === 0 ? accent : counter;
    ctx.lineWidth = h * (0.1 + rnd() * 0.16);
    const cx = w * (0.15 + rnd() * 0.7);
    const cy = h * (0.2 + rnd() * 0.6);
    const r = Math.min(w, h) * (0.3 + rnd() * 0.5);
    const a0 = rnd() * Math.PI * 2;
    ctx.arc(cx, cy, r, a0, a0 + Math.PI * (0.4 + rnd() * 0.5));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Işık göbeği + vinyet: atölye lambası dili
  const glow = ctx.createRadialGradient(w * 0.42, h * 0.35, 0, w * 0.42, h * 0.35, Math.max(w, h) * 0.75);
  glow.addColorStop(0, 'rgba(247, 201, 72, 0.10)');
  glow.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  glow.addColorStop(1, 'rgba(5, 4, 2, 0.42)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

interface BeatThumbProps {
  seed: string;
  colors: string[];
  height: number;
  width?: number | string;
  radius?: number;
  label?: string;
  style?: React.CSSProperties;
}

export const BeatThumb: React.FC<BeatThumbProps> = ({ seed, colors, height, width, radius = 10, label, style }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || (typeof width === 'number' ? width : height);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    paintBeatThumb(ctx, canvas.width / dpr, canvas.height / dpr, colors, seed);
  }, [seed, height, width, colors.join('|')]);
  return (
    <div style={{ position: 'relative', width: width ?? height, height, borderRadius: radius, overflow: 'hidden', border: '1px solid var(--m2-line)', background: 'rgba(0,0,0,0.25)', flexShrink: 0, ...style }}>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden />
      {label && (
        <span style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 9, fontWeight: 800, letterSpacing: 0.8, color: 'rgba(242,238,230,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.8)', fontFamily: 'var(--m2-font-mono)' }}>{label}</span>
      )}
    </div>
  );
};
```

NOT: `colors.join('|')` dep — dizi kimliği değil içerik değişince yeniden çizsin. eslint exhaustive-deps uyarısı gelirse satır-içi disable yerine `const colorKey = colors.join('|')` çıkar, dep'e onu koy.

- [x] **Step 4: Koş, PASS gör** — 3 passed
- [x] **Step 5: Commit** — `git add src/components/BeatThumb.tsx src/components/beatThumb.test.ts && git commit -m "feat(t5): BeatThumb — beat'e özgü statik painterly kare, rAF'sız, seed-deterministik (testli)"`

---

### Task 2: BeatCard thumb'ı beat'e özgü olur

**Files:**
- Modify: `src/pages/Scenes/ScenesStep.tsx` (BeatCard, ~201-311: `<RecipeThumb size={60} radius={10} />`)

- [x] **Step 1:** RecipeThumb import'unu BeatThumb ile değiştir. BeatCard'da thumb şu olur (beat objesi scope'ta, world paleti için `paletteColors` zaten pure'dan alınabilir — dosyanın MEVCUT import/store kullanımını oku; `selectedWorldId`/`selectedPaletteId` store'dan geliyorsa `paletteColors(DATA.palettes.find(p=>p.id===selectedPaletteId), DATA.worlds.find(w=>w.id===selectedWorldId))` deseniyle renkleri türet — RecipeThumb'ın buildPreviewState çağrısındaki renk kaynağıyla eşdeğer; gerekirse `buildPreviewState` kullan, o da serbest):

```tsx
<BeatThumb seed={beat.id} colors={thumbColors} height={60} width={60} radius={10} label={String(index + 1).padStart(2, '0')} />
```

`thumbColors` BeatCard'ların ORTAK üstünde BİR kez hesaplanır (her kartta find çağrısı tekrarlanmaz).

- [x] **Step 2:** Doğrula — `npx tsc --noEmit && npx vitest run` yeşil; dev server'da Sahneler: her beat kartı FARKLI painterly kare taşır (seed=beat.id), kare sol-altta 01/02/... etiketi.
- [x] **Step 3: Commit** — `git commit -m "feat(t5): storyboard beat kartları beat'e özgü painterly thumb — canlı canvas emekli"`

---

### Task 3: Timeline thumb'ları + RecipeThumb emekliliği

**Files:**
- Modify: `src/pages/Timeline/TimelineStep.tsx` (boş durum ~RecipeThumb 200×116 + detay paneli 16:9 RecipeThumb)
- Delete (koşullu): `src/components/RecipeThumb.tsx`

- [x] **Step 1:** Detay paneli thumb'ı: `<BeatThumb seed={\`scene-${selected.id}\`} colors={thumbColors} height={200} width="100%" radius={14} />` — mevcut overlay'ler (faz noktası, süre rozeti) AYNEN üstünde kalır (BeatThumb relative container, çocuklar absolute konumlanabilir — overlay'leri BeatThumb'ı saran mevcut div'de tut).
- [x] **Step 2:** Boş durum görseli: `<BeatThumb seed="timeline-empty" colors={thumbColors} height={116} width={200} radius={20} />` + mevcut Clapperboard overlay kalır.
- [x] **Step 3:** `grep -rn "RecipeThumb" src/` — Scenes+Timeline dışında kullanıcı kalmadıysa `src/components/RecipeThumb.tsx` SİL ve import'ları temizle. Başka kullanıcı VARSA silme, raporda belirt.
- [x] **Step 4:** Doğrula — tsc + vitest yeşil.
- [x] **Step 5: Commit** — `git commit -m "feat(t5): Timeline thumb'ları statik painterly + RecipeThumb emekli (kullanıcısı kalmadı)"`

---

### Task 4: PHASE_COLORS mor kaçağı + FilmStrip gerçek şerit

**Files:**
- Modify: `src/pages/Timeline/TimelineStep.tsx` (PHASE_COLORS + FilmStrip)

- [x] **Step 1:** `PHASE_COLORS.Resolution: '#8b5cf6'` (MOR — yasak) → `'#8fb4c9'` (buz ailesi; ham hex kalmalı — `${phase}22` alpha concat kullanılıyor). Diğer fazlar dokunulmaz.
- [x] **Step 2:** FilmStrip gerçek şerit metaforu:
  - Kare yüksekliği 72→96, minWidth 44→56.
  - Zımba delikleri İKİ sıra olur (üst + alt): mevcut tek sprocket satırını karelerin ÜSTÜNE ve ALTINA koy (aynı render, iki kez — `<Sprockets />` küçük iç bileşene çıkar).
  - Kare çerçevesi selüloit dili: kare butonlarına `border: '1px solid rgba(0,0,0,0.55)'` + iç görsel alanına 2px koyu padding hissi (background: 'rgba(5,4,2,0.6)' çerçeve, içte mevcut intensity fill).
  - Şerit konteynerine yatay film tabanı: `background: 'linear-gradient(180deg, rgba(5,4,2,0.72), rgba(12,10,7,0.6))'`, borderRadius 10.
  - Aktif kare gold ring KORUNUR. Hit-target boyutları hover'da OYNAMAZ.
- [x] **Step 3:** Doğrula — tsc + vitest; e2e smoke'un geçen 6'sı hâlâ geçer mi HIZLI kontrol: `npx playwright test e2e/aquarium.spec.ts e2e/scene-smoke.spec.ts` (2/2 + 1/1 beklenir; smoke tam koşusu Task 7'de).
- [x] **Step 4: Commit** — `git commit -m "fix(t5): Resolution moru buz ailesine + FilmStrip gerçek selüloit şerit (çift zımba, 96px kare)"`

---

### Task 5: Boş durum çelişkisi + export ikincil çubuğu

**Files:**
- Modify: `src/pages/Timeline/TimelineStep.tsx` (header + boş durum)

- [x] **Step 1:** Başlık duruma uyar: `scenes.length === 0` iken H1 `'Üretime hazır'` DEĞİL → `'Motor bekliyor'`; alt metin mevcut kalır. Dolu durumda mevcut `${scenes.length} sahne · ${totalDuration}s` kalır.
- [x] **Step 2:** Boş durumda TEK CTA: header sağ blokta yalnız `← Reçete` (ghost) + `AJAN PAKETİNİ DERLE` (primary) görünür — zaten export'lar scenes>0 koşullu; Cabinet/COPY butonlarının da scenes>0 koşullu olduğunu DOĞRULA, değilse koşula al.
- [x] **Step 3:** Export ikincil çubuğu: scenes>0 iken header'daki export düğmeleri (JSON, CSV, Markdown, Komut JSON, ⬇ Üretim Paketi, Handoff) header'dan çıkar, FilmStrip'in HEMEN ALTINDA ince bir çubuğa iner:

```tsx
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--m2-line)', background: 'rgba(255,255,255,0.02)' }}>
  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)', marginRight: 4 }}>EXPORT</span>
  {/* mevcut export Button'ları buraya taşınır — onClick'lerine DOKUNMA */}
</div>
```

Header'da kalanlar: ← Reçete, Director's Cabinet →, COPY FINAL BRIEF, AJAN PAKETİNİ DERLE.
- [x] **Step 4:** Doğrula — tsc + vitest; dev'de boş durum başlığı "Motor bekliyor" + tek CTA; dolu durumda export çubuğu şeridin altında.
- [x] **Step 5: Commit** — `git commit -m "feat(t5): Timeline boş durum çelişkisi öldü + export'lar ikincil çubuğa indi"`

---

### Task 6: TEKNİK KANIT · EN bloğu

**Files:**
- Modify: `src/pages/Timeline/TimelineStep.tsx` (detay paneli DetailRow bölgesi)

- [x] **Step 1:** EN teknik değer satırlarını (Beat / Dominant subject / Vantage / Fingerprint DetailRow'ları) tek sarmalayıcıya al:

```tsx
<div style={{ border: '1px solid var(--m2-line)', borderRadius: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.25)' }}>
  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: 'var(--m2-muted)', fontFamily: 'var(--m2-font-mono)', marginBottom: 8 }}>TEKNİK KANIT · EN</div>
  {/* mevcut 4 DetailRow buraya — props DOKUNMA */}
</div>
```

VOICE OVER (zaten Türkçe etiketli) ve EKRAN METNİ blokları DIŞARIDA kalır.
- [x] **Step 2:** Doğrula — tsc + vitest.
- [x] **Step 3: Commit** — `git commit -m "feat(t5): EN teknik değerler TEKNİK KANIT etiketli mono blokta — dil politikası"`

---

### Task 7: Kapanış — kanıt + tam gate

**Files:**
- Create: `scripts/t5-scenes-shots.mjs` (t4-recipe-shots deseni)

- [x] **Step 1:** Kanıt script'i — akış: localStorage temizle → Reçete'ye SIDEBAR'dan git → world seç (.recipe-world-button ilk kart) → Brief'e dön, kaynak yapıştır + `Decode + Kayıpsız Ingest` (raw-source-input testid; PASS bekle) → Sahneler'e SIDEBAR'dan git → `reports/t5-storyboard.png` → Timeline'a git → BOŞ durum karesi `reports/t5-timeline-empty.png` → `AJAN PAKETİNİ DERLE` tıkla → `reports/t5-timeline-strip.png` (şerit + export çubuğu) → bir kareye tıkla → `reports/t5-timeline-detail.png` (KANIT bloğu). Panel başlıkları DOM'da toUpperCase'li — locator'ları role/testid ile yaz.
- [x] **Step 2:** Koş + kareleri Read ile GÖZLE incele (beat thumb'ları farklı mı, şerit selüloit mü, mor kalmadı mı, boş başlık doğru mu).
- [x] **Step 3:** Tam gate — `npx tsc --noEmit && npx vitest run && npm run build && zsh -n start-mamilas.command agents/MOTION-CALISTIR.command agents/production/MOTION-CALISTIR.command && npm run test:e2e`
Expected: vitest ≥394 (391+3) · e2e bilinen 6 kırık dışında YENİ kırık yok (baseline: smoke:28/93/138/163 + beat-planner:15 + screenshots:4).
- [x] **Step 4: Commit** — plan doc işaretli + reports/t5-* + script.

---

## Doğrulama (milestone kapanışı, plan dışı süreç)
Bütün-tur bağımsız review + alıcı-gözü tasarım yargıcı (T3/T4 deseni). Yargıç kanıtı: t5-*.png.

---

## Kapanış Kaydı (2026-07-04, Termius crash sonrası oturum)

- **Commit zinciri:** cd79083 (plan) → c16c9cf (T1 BeatThumb TDD) → babed9f (T2 BeatCard) → a43de6d (T3 Timeline thumb + RecipeThumb emekli) → 0afd521 (T4 mor fix + selüloit şerit) → 72f12b0 (T5 boş durum + export çubuğu) → 33d0f8d + 6da4573 (T6 TEKNİK KANIT bloğu + Event satırı) → 9ed67d7 (smoke başlık hizası) → 700a524 (ölü kod temizliği) → e910c77 (T7 kanıt kareleri + t5-scenes-shots.mjs).
- **Tam gate (crash sonrası yeniden koşuldu):** tsc 0 · vitest **394/394** (391+3, beklenen) · build OK · 3 .command syntax OK · tree temiz.
- **Kanıt kareleri gözle incelendi (Fable):** storyboard'da her beat FARKLI painterly kare + 01/02 etiketleri; FilmStrip gerçek selüloit (çift zımba, 96px kareler) + export'lar şerit altı ikincil çubukta; boş durum 'Motor bekliyor' + tek CTA; detay panelinde 16:9 thumb + TEKNİK KANIT · EN bloğu. Mor kaçağı yok — Resolution buz ailesinde.
- **e2e:** bilinen 6 baseline kırık (preset/director bug ailesi) dışında yeni kırık yok; 9ed67d7 smoke beklentisini yeni başlığa hizaladı (test zaten baseline kırığıydı).

## Doğrulama Kaydı (milestone kapanışı)

- **Bütün-tur kod review (bağımsız ajan):** 0 CRITICAL. 3 IMPORTANT bulgu Fable doğrulamasıyla REDDEDİLDİ: (1) 'ctx.scale birikimi' — canvas.width ataması HTML spec gereği aynı değerde bile bitmap+context state'i sıfırlar, transform birikemez; (2) 'pacingFill global SVG id çakışması' — PacingArc tek instance render ediliyor, spekülatif; (3) 'clientWidth=0 ilk mount' — useEffect DOM commit sonrası koşar, clientWidth okuma senkron layout tetikler; kanıt karesinde thumb 16:9 doğru. SAFE listesi: RecipeThumb yetimsiz silindi, seed determinizmi saf, rAF yok, export'lar scenes>0 korumalı, src/core dokunulmadı, e2e metin sözleşmeleri yerinde.
- **Tasarım yargıcı tur 1:** 8.4/10 ŞARTLI ONAY — (1) thumb'ların hepsi altın-somon ailesi, (2) FilmStrip 8-9 ahududu (#f54d6b Climax) pembe yasağının kıyısı.
- **Şart fix'leri (f175872):** paintBeatThumb fırça çifti seed-deterministik 4 hue ailesi arasında döner (altın+sage / buz+altın / sage+buz / tuğla+altın; zemin palet kimliğinde); PHASE_COLORS.Climax → #c9573f tuğla. Kanıt kareleri yeniden üretildi. Gate: tsc 0 · vitest 394/394.
- **Tasarım yargıcı tur 2:** **8.8/10 ONAYLA** — şart 1 KAPANDI (≥3 renk ailesi piksel taramasıyla ayrışıyor), şart 2 KAPANDI (şeritte pembe/ahududu bandında sıfır piksel, Climax desatüre tuğla). Backlog notu (zorunlu değil): sage yayı satürasyonu ≈.09→.15-.18 olursa 4. aile de görünür olur.
