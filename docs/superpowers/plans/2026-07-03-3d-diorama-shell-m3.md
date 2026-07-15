<!-- DURUM: AKTİF — mockup onayı Mami tarafından WAIVE edildi (2026-07-03: "boşver sana güvenim tam,
     en kötü sileriz yeniden yaparız"); onay yerine her task'ta gerçek uygulamadan ekran kanıtı geçer.
     Kaynak: M3 plan ajanı (Fable), 2026-07-03. Merge sonrası main = 8312d17. -->

# 3D Diorama Kabuğu — M3 Implementation Plan: Panel Giydirme + Kamera Koreografisi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stage panellerini dioramanın önünde asılı cam/parşömen yüzeylere dönüştürmek (onaylı mockup reçeteleriyle birebir), stage başına kamera pozlarını cilalayıp koreografiyi hissedilir kılmak; üç borcu kapatmak: (a) M2 Task 9'un bıraktığı yamuk iki-kolonlu band'lar, (b) akvaryum modunda gizlenmeyen ThoughtDock, (c) tüm kanıt snippet'lerinde `?scene=force`.

**Architecture:** Cam giydirme TEK backdrop-blur yüzeyiyle yapılır: `.ml-v3-screen` mockup'taki `.panel--glass` reçetesini alır (blur 30 + saturate 1.15, `color-mix(s2 42%)` dolgu, altın hairline). İç kartlar (PanelKit `Panel`, band'lar) blur'süz translucent dolgu alır — mockup'ın `.mini-card` / `.parchment` reçeteleri, **backdrop-filter'sız** (V3 §3b: "cam içine cam KONMAZ"; ata cam zaten dioramayı blur'lüyor, blur bütçesi 1'de kalır). PanelKit'e `variant: 'glass' | 'parchment'` gelir — tek dosya değişikliği tüm sayfaları giydirir. ThoughtDock `hidden` prop'u alır (toast'lar unmount → auto-open hakkı korunur, rozet CSS ile gizlenir → çıkışta sayaç günceldir). Kamera işi yalnız `lookConfig.CAMERA_POSES` değer cilası — CameraRig'e dokunulmaz. WebGL fallback'te cam `AntigravityBackground`'ı blur'ler; hiçbir panel canvas'ın varlığına bağımlı değildir.

**Tech Stack:** Mevcut — React 19, Vite 8, zustand 5, R3F, vitest, Playwright. **Yeni bağımlılık yok.**

**Spec:** `docs/superpowers/specs/2026-07-03-3d-diorama-shell-design.md` (M3). **Kanun:** `DESIGN_LANGUAGE_V3.md` (repo kökü). **Onay mockup'ı:** `mockup-m3-panels.html` (repo kökü) — panel chrome CSS'i buradan birebir alınır.

**Mockup ↔ Anayasa çelişki kararları (baştan kilitlendi):**
1. **Blur/dolgu:** Mockup cam gövdede `blur(30px) saturate(1.15)` + `color-mix(s2 42%)` der; V3 §2 z1'de `blur(18px)` + %72–78 der. Kullanıcının onayladığı görsel mockup'tır → mockup değerleri uygulanır, Task 2 anayasayı buna göre tadil eder (V3 zaten kendi tadilini öngörür: belge-kod çelişkisi giderilir).
2. **Parşömen blur 26px:** Mockup'ta parşömen çıplak diorama üstünde durduğu için blur'lüdür; uygulamada her parşömen bir cam atanın (screen blur30 / rail blur30) İÇİNDE oturur → blur'süz uygulanır. Blur sözlüğü {10,14,16,18,30} değişmez.
3. **Parşömen radius:** Mockup 18px; V3 §3b sözlüğü "parşömen --r-md–16" → **16px** (radius sözlüğü kanundur).
4. **Karşı-ışık rengi:** Mockup `--v3-tealline` kullanır; V3 §3a/§7 bunu buz-çeliğine (`rgba(143,163,194,0.22)`) migre eder → **buz** uygulanır, tek token olduğu için kullanıcı camda teal isterse tek satır geri döner.

**Ön koşul:** Muhammet `mockup-m3-panels.html`'i tarayıcıda açıp cam/parşömen görünümünü ONAYLAMADAN Task 2'ye başlanmaz.

**Parallel lanes:** Task 1 herkesten önce. Sonra Lane A (Task 2→3→4, giydirme), Lane B (Task 5, dock), Lane C (Task 6, kamera) paralel koşabilir. Task 7 kapanıştır.

---

### Task 1: Token köprüsü + tasarım-kanunu testleri (TDD)

**Files:**
- Modify: `src/styles/tokens.css` (parşömen token'ları)
- Modify: `src/styles/design_v3.css` (`:root`'a buz token'ları)
- Test: `src/styles/designLaws.test.ts`

- [ ] **Step 1: Failing test yaz**

`src/styles/designLaws.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOOK } from '../scene/lookConfig';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const v3 = readFileSync('src/styles/design_v3.css', 'utf8');

describe('DESIGN_LANGUAGE_V3 kanunları gate\'te', () => {
  it('--parch, lookConfig.palette.paper ile aynı değeri tutar (V3 §3b)', () => {
    const m = tokens.match(/--parch:\s*(#[0-9a-fA-F]{6})/);
    expect(m, 'tokens.css --parch tanımı eksik').toBeTruthy();
    expect(m![1].toLowerCase()).toBe(LOOK.palette.paper.toLowerCase());
  });

  it('backdrop-blur sözlük dışına çıkamaz: 10/14/16/18/30 (V3 §7.3)', () => {
    const allowed = new Set(['10', '14', '16', '18', '30']);
    for (const css of [tokens, v3]) {
      for (const m of css.matchAll(/backdrop-filter:\s*blur\((\d+)px\)/g)) {
        expect(allowed.has(m[1]), `blur(${m[1]}px) sözlükte yok`).toBe(true);
      }
    }
  });

  it('doygun teal design_v3.css\'ten tamamen migre edildi (V3 §7.1)', () => {
    expect(v3).not.toMatch(/37e2d5/i);
    expect(v3).not.toMatch(/55,\s*226,\s*213/);
  });

  it('buz-çeliği karşı-ışık token\'ları tanımlı', () => {
    expect(v3).toMatch(/--v3-ice:\s*#8fa3c2/);
    expect(v3).toMatch(/--v3-iceline:\s*rgba\(143,\s*163,\s*194,\s*0\.22\)/);
  });
});
```

- [ ] **Step 2: FAIL gör** — `npx vitest run src/styles/designLaws.test.ts` (parch yok, teal hâlâ var → FAIL)

- [ ] **Step 3: Token'ları ekle**

`src/styles/tokens.css` — `--text-dim` bloğunun altına:

```css
  /* — Parşömen (M3 · lookConfig.palette.paper ile senkron; designLaws.test.ts korur) — */
  --parch:      #e8ddc8;
  --parch-tint: rgba(232, 221, 200, 0.07);
  --parch-line: rgba(232, 221, 200, 0.16);
```

`src/styles/design_v3.css` `:root` — teal token'larının YERİNE (üçünü sil):

```css
  /* buz-çeliği karşı-ışık — teal mirasının V3 halefi (§7.1); vurgu değil, dolgu */
  --v3-ice: #8fa3c2;
  --v3-icesoft: rgba(143, 163, 194, 0.08);
  --v3-iceline: rgba(143, 163, 194, 0.22);
```

Not: Teal token'ları silinince design_v3.css içindeki kullanıcıları da bu task'ta migre et (aksi halde tanımsız var kullanılır): `.ml-shell::after` → `var(--v3-icesoft)`; `.ml-v3-floor` 90deg çizgiler → `rgba(143, 163, 194, 0.12)`; `.ml-spotlight` ikinci radial → `rgba(143, 163, 194, 0.06)`; `.ml-v3-screen::before` → `var(--v3-iceline)`; `.ml-v3-node.is-done` → `border-color: var(--v3-iceline); color: var(--v3-ice); box-shadow: 0 0 14px -4px rgba(143, 163, 194, 0.5)`; `.ml-v3-monitor` gradient → `rgba(143, 163, 194, 0.05)`; `.ml-v3-kicker` → `color: var(--v3-ice);` ve **text-shadow satırı silinir** (V3 §4 neon yasağı).

- [ ] **Step 4: PASS gör** — `npx vitest run src/styles/designLaws.test.ts` + `npx vitest run` (tam süit) + gözle dev server: sahne kimliği bozulmadı, soğuk vurgular desatüre buza döndü.

- [ ] **Step 5: Commit** — `git commit -m "feat(design): parşömen+buz token'ları, teal migrasyonu, tasarım kanunları vitest'te"`

---

### Task 2: Cam reçetesi — `.ml-v3-screen` mockup'a eşitlenir + iç kart sınıfları

**Files:**
- Modify: `src/styles/design_v3.css` (screen restyle + `.ml-v3-panel-glass` + `.ml-v3-parchment`)
- Modify: `DESIGN_LANGUAGE_V3.md` (§2 z1 satırı + §3 reçeteleri as-built değerlere tadil — mockup onayına dayanır)

- [ ] **Step 1: `.ml-v3-screen`'i mockup `.panel--glass` reçetesine çek**

design_v3.css'te mevcut `.ml-v3-screen` bloğunu şununla değiştir (mockup satır 277-301 birebir; karşı-ışık buz):

```css
.ml-v3-screen {
  position: relative;
  margin: 26px 28px 34px;
  border-radius: var(--r-lg);
  animation: v3-screen-breathe 9s ease-in-out infinite alternate;
  background:
    linear-gradient(172deg, rgba(255, 255, 255, 0.05), transparent 30%),
    color-mix(in srgb, var(--s2) 42%, transparent);
  backdrop-filter: blur(30px) saturate(1.15);
  -webkit-backdrop-filter: blur(30px) saturate(1.15);
  border: 1px solid var(--v3-edge);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.5),
    var(--v3-shadow-near);
  overflow: clip;
}
.ml-v3-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(60% 26px at 18% 0%, var(--v3-edge), transparent 70%),
    radial-gradient(40% 20px at 92% 100%, var(--v3-iceline), transparent 75%);
  opacity: 0.85;
}
```

`v3-screen-breathe` keyframe'lerinin `from` seti yeni box-shadow dizisiyle eşitlenir (yalnız box-shadow animate olur — transform yasağı sürer).

- [ ] **Step 2: İç kart + parşömen sınıflarını ekle** (dosya sonuna, thought-dock bloğundan önce)

```css
/* ── M3 panel giydirme: cam iç kart + parşömen (mockup-m3-panels.html) ──
   İkisi de backdrop-filter TAŞIMAZ: her zaman blur'lü bir cam atanın
   (.ml-v3-screen blur30 / .ml-right-rail blur30) içinde otururlar.
   V3 §3b: cam içine cam konmaz; blur bütçesi bakış hattında 1 kalır. */
.ml-v3-panel-glass {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background:
    linear-gradient(170deg, rgba(255, 255, 255, 0.045), transparent 35%),
    color-mix(in srgb, var(--s2) 55%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.ml-v3-parchment {
  position: relative;
  border: 1px solid var(--parch-line);
  border-radius: 16px; /* mockup 18 → radius sözlüğü §3b: parşömen ≤16 */
  background:
    linear-gradient(168deg, var(--parch-tint), transparent 34%),
    color-mix(in srgb, #2a2418 30%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 240, 210, 0.12),
    var(--v3-shadow-near);
}
.ml-v3-parchment::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(70% 30px at 20% 0%, rgba(246, 200, 98, 0.14), transparent 72%);
}
```

- [ ] **Step 3: Anayasayı as-built'e tadil et** — `DESIGN_LANGUAGE_V3.md`: §2 z1 satırı `blur(18px)` → `blur(30px) saturate(1.15)`, doluluk bütçesi "%72–78" → "üst ışık gradyanı + color-mix(s2 42%) — okunurluğu blur taşır (mockup onayı 2026-07-0X)"; §3a reçetesi Step 1'deki final CSS ile değiştirilir; §3b parşömen reçetesi Step 2'deki final hali + "cam ata varken blur yok" notu. Tadil gerekçesi tek satır dipnotla mockup'a bağlanır.

- [ ] **Step 4: Derleme + test + gözle** — `npx tsc --noEmit && npx vitest run` (designLaws blur taraması yeni değerleri onaylar: 30 sözlükte). Dev server'da `?scene=force` ile bak: panelin arkasından diorama kartları/lamba yumuşamış hâlde okunuyor mu, metin kontrastı düşmüş mü. Ayrıca `?scene=off` ile bak: cam, AntigravityBackground üstünde de doğru görünmeli (**fallback kanunu**).

- [ ] **Step 5: Commit** — `git commit -m "feat(design): panel camı mockup reçetesine eşitlendi + cam-kart/parşömen sınıfları — anayasa tadili dahil"`

---

### Task 3: PanelKit variant — tüm sayfalar tek dosyayla giyinir

**Files:**
- Modify: `src/components/Layout/PanelKit.tsx` (Panel'e variant + inline görsel stiller sınıfa taşınır)
- Modify: `src/components/Layout/AppLayout.tsx:123` (SOURCE GATE kartı parşömen — mockup'taki parşömen örneğinin kendisi)

- [ ] **Step 1: Panel'i variant'lı yap**

`PanelKit.tsx` — Panel bileşeninin imza ve section açılışı şöyle değişir (başlık/`aside`/children gövdesi aynen kalır):

```tsx
export const Panel: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  /** 'glass' yazar, 'parchment' okur (DESIGN_LANGUAGE_V3 §3). */
  variant?: 'glass' | 'parchment';
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, children, aside, variant = 'glass', className, style }) => (
  <section
    className={[
      't5-elevate',
      variant === 'parchment' ? 'ml-v3-parchment' : 'ml-v3-panel-glass',
      className,
    ].filter(Boolean).join(' ')}
    style={{ padding: '24px', position: 'relative', overflow: 'hidden', ...style }}
  >
```

Eski inline `background: 'transparent'`, `border`, `borderRadius: '8px'` satırları SİLİNİR — görsel dili artık sınıf taşır (tek görsel otorite zinciri: tokens → design_v3.css). `overflow: hidden` kalır (::before radius'u kırpar, sorun değil).

- [ ] **Step 2: SOURCE GATE kartını parşömene çevir**

`AppLayout.tsx:123`: `<section className="ml-v3-card">` → `<section className="ml-v3-card ml-v3-parchment">`. design_v3.css'teki `.ml-v3-card` bloğundan `background` ve `box-shadow` satırları silinir (padding/radius kalır; görseli parşömen sınıfı verir). Bu kart rail camının (blur 30) içindedir — parşömen blur'süz kuralı tam burada işler.

- [ ] **Step 3: Derleme + tam test + gözle** — `npx tsc --noEmit && npx vitest run && npx playwright test`. Dev server'da 6 stage'i gez: her Panel cam iç kart; form input'ları hâlâ okunur; hiçbir hit-target kaymadı. Beğenmediğin kontrast varsa TEK ayar düğmesi `color-mix` yüzdesidir (42/55) — komponentlere dokunma.

- [ ] **Step 4: Commit** — `git commit -m "feat(panels): PanelKit variant'landı — tüm stage panelleri cam, SOURCE GATE parşömen"`

---

### Task 4: Band borcu (debt a) — yamuk iki kolon → tek kolon parşömen

M2 Task 9 `InnerVoicePanel`'i söktü ama `dashboard-decision-band` / `studio-verdict-band` grid'i `minmax(0,0.8fr) minmax(320px,1.35fr)` kaldı → içerik sol %40'a sıkışıyor, sağ boş. Band'lar tanım gereği verdict/okuma alanıdır → parşömen (V3 §3b "CABINET READ kartı" örneği).

**Files:**
- Modify: `src/styles/design_v2.css:531-588` (band görsel bloğu silinir; tipografi kuralları kalır)
- Modify: `src/styles/design_v3.css` (band layout'u v3'e taşınır)
- Modify: `src/index.css:280-289` (ölü `.inner-voice-panel` band kuralları + artık gereksiz band tek-kolon override'ları silinir)
- Modify: `src/pages/Dashboard/DashboardStep.tsx:63`, `src/pages/Scenes/ScenesStep.tsx:62,86`, `src/pages/Timeline/TimelineStep.tsx:166`

- [ ] **Step 1: CSS'i taşı** — design_v2.css'ten `.dashboard-decision-band, .studio-verdict-band { display:grid; grid-template-columns:...; background:...; border:...; box-shadow:... }` bloğu ve `... > div:first-child`, `... .inner-voice-panel`, `... .inner-voice-list.compact` kuralları silinir (kicker/h2/p tipografi kuralları v2'de kalır). design_v3.css'e eklenir:

```css
/* Band'lar: M2'de panel söküldü — tek kolon parşömen verdict şeridi */
.dashboard-decision-band,
.studio-verdict-band {
  display: grid;
  grid-template-columns: 1fr;
  padding: 20px 24px;
}
```

index.css 280-289'daki band selektörleri responsive listeden ve `.inner-voice-panel` kurallarından çıkarılır (ölü kod).

- [ ] **Step 2: Sayfalara parşömen sınıfını ekle** — dört kullanım noktasında `className="dashboard-decision-band"` → `className="dashboard-decision-band ml-v3-parchment"` (studio-verdict-band'larda aynı kompozisyon; `timeline-verdict-band` eki korunur).

- [ ] **Step 3: Doğrula + commit** — `npx vitest run && npx playwright test`; gözle: band'lar tam genişlik, sıcak kâğıt tonlu, kicker altın. `git commit -m "fix(bands): M2'nin yamuk iki-kolon band'ları tek kolon parşömene döndü"`

---

### Task 5: ThoughtDock akvaryumda gizlenir (debt b) — TDD

Davranış sözleşmesi (V3 §6): akvaryumda toast + rozet görünmez, açık drawer kapanır; **kuyruk yaşar** (kabinet değerlendirmeye devam eder), çıkışta rozet sayacı günceldir ve auto-open hakkı kaybolmaz (toast'lar unmount edildiği için 9sn auto-dismiss sayacı gizliyken İŞLEMEZ; çıkışta yeniden açılırlar).

**Files:**
- Modify: `src/components/ThoughtBubble/thoughtQueue.ts` (+ saf `openToastsFor`)
- Test: `src/components/ThoughtBubble/thoughtQueue.test.ts` (mevcut dosyaya describe eklenir)
- Modify: `src/components/ThoughtBubble/ThoughtDock.tsx` (`hidden` prop)
- Modify: `src/components/Layout/AppLayout.tsx:146` (`<ThoughtDock hidden={aquariumMode} />`)
- Modify: `src/styles/design_v3.css` (`.thought-dock.is-hidden`)
- Create: `e2e/aquarium.spec.ts`

- [ ] **Step 1: Failing test** — thoughtQueue.test.ts'e ekle:

```ts
describe('openToastsFor (akvaryum kanunu, V3 §6)', () => {
  it('hidden=true → hiç toast (ama düşünceler listede yaşar)', () => {
    const merged = mergeThoughts([], [v('fail', 'A'), v('fail', 'B')], 1000);
    expect(openToastsFor(merged, true)).toHaveLength(0);
    expect(merged).toHaveLength(2);
  });
  it('hidden=false → dismiss edilmemiş auto-open, en fazla 2', () => {
    const merged = mergeThoughts([], [v('fail', 'A'), v('fail', 'B'), v('fail', 'C'), v('warn', 'D')], 1000);
    const open = openToastsFor(merged, false);
    expect(open).toHaveLength(2);
    expect(open.every((t) => t.behavior === 'auto-open')).toBe(true);
  });
});
```

- [ ] **Step 2: FAIL gör → saf fonksiyonu yaz**

thoughtQueue.ts sonuna:

```ts
/** Akvaryum kanunu (V3 §6): gizliyken toast açılmaz ama kuyruk yaşar.
 *  Toast'lar render edilmediği için auto-dismiss sayacı gizliyken işlemez —
 *  çıkışta auto-open hakkı korunur. */
export function openToastsFor(thoughts: Thought[], hidden: boolean): Thought[] {
  if (hidden) return [];
  return thoughts.filter((t) => t.behavior === 'auto-open' && !t.dismissed).slice(0, 2);
}
```

- [ ] **Step 3: ThoughtDock'u bağla**

```tsx
export const ThoughtDock: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
```

Değişiklikler: `const openToasts = openToastsFor(thoughts, hidden);` (eski satır silinir); drawer'ı kapatan efekt: `useEffect(() => { if (hidden) setDrawerOpen(false); }, [hidden]);`; dock sarmalayıcısı `className={hidden ? 'thought-dock is-hidden' : 'thought-dock'}` (rozet mount kalır — sayaç çıkışta tazedir). design_v3.css:

```css
.thought-dock {
  transition: opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), visibility var(--dur-2) var(--ease);
}
.thought-dock.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(-50%) scale(0.985); /* HIDDEN_CHROME reçetesi; translateX korunur */
}
```

AppLayout.tsx:146: `<ThoughtDock />` → `<ThoughtDock hidden={aquariumMode} />`.

- [ ] **Step 4: e2e** — `e2e/aquarium.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('akvaryum modu thought dock dahil tüm chrome\'u gizler, çıkışta haklar korunur', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('thought-toast').first()).toBeVisible(); // boş proje → Logic FAIL
  await page.getByRole('button', { name: 'AKVARYUM MODU' }).click();
  await expect(page.getByTestId('thought-toast')).toHaveCount(0);       // toast unmount
  await expect(page.getByTestId('thought-dock')).not.toBeVisible();     // rozet dahil görünmez
  await expect(page.getByTestId('source-right-rail')).not.toBeVisible();
  await page.getByRole('button', { name: 'MENÜLERİ AÇ' }).click();
  await expect(page.getByTestId('thought-toast').first()).toBeVisible(); // auto-open hakkı geri geldi
});
```

- [ ] **Step 5: Koş + commit** — `npx vitest run && npx playwright test e2e/aquarium.spec.ts` → `git commit -m "feat(thoughts): dock akvaryum kanununa uydu — gizlenir, kuyruk yaşar, haklar korunur"`

---

### Task 6: Stage başına kamera koreografi cilası

Tek dosya: `lookConfig.ts`. CameraRig, damp 2.2, FOV bandı 30–36 aynen kalır (V3 §5). Amaç: her stage'de panelin yanındaki/arkasındaki görünür diorama diliminde AYIRT EDİLİR bir kadraj — dashboard geniş establish, director kart fanına yakın, recipe masaya sol omuz, scenes kartların arkasından, timeline tepeden vinç, qa karşı alçak açı.

**Files:**
- Modify: `src/scene/lookConfig.ts` (CAMERA_POSES değerleri)
- Modify: `src/scene/lookConfig.test.ts` (koreografi sözleşmesi)

- [ ] **Step 1: Testi sıkılaştır** — lookConfig.test.ts'e ekle (önce FAIL etmesi için Step 2'deki pozlarla birlikte gelir; mevcut pozlar dashboard→director mesafesi ~3.3 olduğundan 2.0 eşiği bugünü de geçer — eşik, gelecek regresyonu yakalamak içindir):

```ts
it('FOV bandı 30–36 (V3 §5 kamera kanunu)', () => {
  for (const step of ALL_STEPS) {
    expect(CAMERA_POSES[step].fov).toBeGreaterThanOrEqual(30);
    expect(CAMERA_POSES[step].fov).toBeLessThanOrEqual(36);
  }
});

it('ardışık stage pozları hissedilir farklı — koreografi gerçekten oynar', () => {
  const dist = (a: readonly number[], b: readonly number[]) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 1; i < ALL_STEPS.length; i++) {
    const prev = CAMERA_POSES[ALL_STEPS[i - 1]].position;
    const next = CAMERA_POSES[ALL_STEPS[i]].position;
    expect(dist(prev, next), `${ALL_STEPS[i - 1]}→${ALL_STEPS[i]} kamera neredeyse durdu`).toBeGreaterThan(2);
  }
});
```

- [ ] **Step 2: Pozları cilala** — başlangıç önerisi (görsel turda ayarlanır; niyet yorum satırında sabitlenir):

```ts
export const CAMERA_POSES: Record<Step, CameraPose> = {
  /* geniş establish: masa + lamba + kart fanı tek karede */
  dashboard: { position: [6.5, 4.2, 8.5], target: [0, 1.1, 0], fov: 34 },
  /* kart fanına alçak yakın plan: karar masası hissi */
  director:  { position: [2.6, 2.2, 5.6], target: [-0.6, 2.0, -1.6], fov: 32 },
  /* masaya sol omuz: reçete = zanaat tezgâhı */
  recipe:    { position: [-5.8, 2.6, 5.2], target: [-0.6, 0.9, 0.4], fov: 34 },
  /* kartların arkasından sahneye bakış: storyboard perspektifi */
  scenes:    { position: [4.6, 2.6, -6.9], target: [-0.8, 2.0, -1.2], fov: 36 },
  /* tepeden vinç: zaman çizgisi kuşbakışı okunur */
  timeline:  { position: [0.4, 6.4, 8.6], target: [0, 0.6, 0], fov: 30 },
  /* karşı alçak açı: lamba kadrajda, sorgu odası ışığı */
  qa:        { position: [-6.0, 3.2, -5.6], target: [0.8, 1.8, -0.4], fov: 33 },
};
```

- [ ] **Step 3: Görsel tur + ince ayar** — dev server açıkken kanıt döngüsü (debt c: `?scene=force`):

```bash
node -e "
const { chromium } = require('playwright');
const STEPS = ['dashboard','director','recipe','scenes','timeline','qa'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173/?scene=force', { waitUntil: 'networkidle' }); // headless yazılımsal-GL fallback'ini aşmak için force
  await p.waitForTimeout(2500);
  for (const s of STEPS) {
    await p.evaluate((step) => window.__mamilas.setState({ currentStep: step }), s);
    await p.waitForTimeout(1800); // damp otursun
    await p.screenshot({ path: 'reports/m3-camera-' + s + '.png' });
  }
  await b.close();
})();
"
```

Altı screenshot'ı **Read ile aç, gözle karşılaştır**: her stage ayırt edilir kadrajda mı, lamba hiçbir pozda bloom patlatmıyor mu, panel camının arkasında anlamlı diorama var mı. Gerekirse pozları düzelt, testleri tekrar koş.

- [ ] **Step 4: Commit** — `git add src/scene/lookConfig.ts src/scene/lookConfig.test.ts reports/m3-camera-*.png && git commit -m "feat(scene): stage başına kamera koreografi cilası — FOV bandı ve ayrıklık teste bağlandı"`

---

### Task 7: M3 kapanışı — tam kapı + çift kanıt (3D + fallback) + checkpoint

- [ ] **Step 1: Tam kalite kapısı** — `mamilas-gate` skill'ini koş. Expected: tsc + vitest + build + syntax tümü yeşil (mevcut 336 + yeni testler).

- [ ] **Step 2: 3D kanıt** — Task 6 Step 3 snippet'i son pozlarla tekrar koşulur; ek olarak akvaryum kanıtı:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173/?scene=force', { waitUntil: 'networkidle' }); // debt c: headless'ta daima ?scene=force
  await p.waitForTimeout(2500);
  await p.getByRole('button', { name: 'AKVARYUM MODU' }).click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'reports/m3-aquarium-proof.png' });
  await b.close();
})();
"
```

Gözle: yalnız diorama + dönüş pili; dock/toast/rozet YOK.

- [ ] **Step 3: Fallback kanıtı (kanun §7.10)** — `?scene=force` OLMADAN (headless'ta sahne otomatik kapanır):

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  console.log('scene-layer yok (fallback):', (await p.getByTestId('scene-layer').count()) === 0);
  await p.screenshot({ path: 'reports/m3-fallback-proof.png' });
  await b.close();
})();
"
```

Gözle: cam paneller AntigravityBackground üstünde de doğru — boş cam, kırık kontrast, "eksik arka plan" hissi yok.

- [ ] **Step 4: final-shots + commit + checkpoint** — `node scripts/final-shots.mjs` hatasız; `git add reports/m3-*.png && git commit -m "feat(ui-3d): M3 tamam — cam/parşömen giydirme + kamera koreografisi, gate yeşil"`; sonra `mamilas-checkpoint` skill'i (memory güncellemesi dahil).

---

## Riskler

1. **Okunurluk (en büyük risk):** `color-mix(s2 42%)` dolgu eski %72-78'den çok daha şeffaf. Blur 30 + koyu sahne kontrastı taşıyor (mockup kanıtı) ama parlak lamba bir stage pozunda panelin tam arkasına gelirse metin yıkanabilir. Tek ayar düğmesi: color-mix yüzdesi (Task 2) ve/veya kamera pozu (Task 6) — komponent bazlı yamaya gidilmez, anayasa tadili güncellenir.
2. **Nested backdrop-filter maliyeti:** blur 18→30 GPU maliyetini artırır; parşömen/iç kartların blur'süz olması bunu dengeler. `final-shots` süresi belirgin uzarsa DPR bütçesi kontrol edilir (V3 §7.14).
3. **1px border kayması:** `.ml-v3-screen` border 0→1px; içerik 1px içeri kayar. e2e locator'lar role/testid bazlı — kırılma beklenmez, yine de tam Playwright süiti Task 3'te koşulur.
4. **`e2e/screenshots.spec.ts`:** görsel yakalama yapıyorsa yeni giydirmeyle çıktıları değişir; baseline karşılaştırması varsa güncellenmesi gerekir (Task 3 Step 3'te görülür).
5. **Teal token silme yayılımı:** `--v3-teal*` yalnız design_v3.css'te tanımlı-ve-kullanımlı doğrulandı; yine de Task 1'de `grep -rn "v3-teal" src/` ile son kontrol yap.
6. **Panel variant'ının görsel şoku:** tüm sayfalar aynı anda değişir; bu bilinçli (mockup onayı ön koşul). Sayfa-bazlı istisna isteği gelirse `variant` prop'u zaten kaçış yoludur.

## NE YAPILMAYACAK

- **Beyin/çekirdek dokunuşu yok:** `src/core/`, `src/store/` (yeni alan dahil), kabinet/`innerVoices` mantığı, Final Brief/export — hiçbiri değişmez. Akvaryum gizlemesi bile store'a yazılmaz (AppLayout local state kalır).
- **Mühürlü reçetelere dokunma:** toast/drawer CSS'i (ink 88/94 + blur 14/18), TONE_COLOR beşlisi, spring sabitleri, daktilo 45cps/9000ms — M3 kapsamı dışı (V3 §3b/§4/§5 mühürleri).
- **Kamera:** CameraRig'e kod ekleme; idle drift, scroll parallax, hover itmesi, akvaryuma özel poz YOK (V3 §5/§6). Yalnız `CAMERA_POSES` değerleri.
- **`.ml-v3-floor` grid'ini kaldırma:** o iş M4'ün (gerçek zemin dokusu gelince, yalnız sahne açıkken).
- **Yeni bağımlılık, yeni z-band, 4. blur katmanı, `#000`, neon, `--r-xl` üstü radius yok.**
- **InnerVoicePanel silinmez** (drawer kullanıyor); `AntigravityBackground` ve 2D `CanvasPreview` (M5) ellenmez.
- **World paletleri UI'yı boyamaz** — parşömen/cam renkleri token'lardan gelir, dünya paletinden asla.

---

**Uygulayıcıya not (repo bulguları):** `DESIGN_LANGUAGE_V3.md` ve `mockup-m3-panels.html` repo KÖKÜNDE (docs/ altında değil). Band CSS'i `src/styles/design_v2.css:531-588` + ölü kurallar `src/index.css:280-289`. Band kullanım noktaları: `DashboardStep.tsx:63`, `ScenesStep.tsx:62,86`, `TimelineStep.tsx:166`. SOURCE GATE kartı `AppLayout.tsx:123`. ThoughtDock mount'u `AppLayout.tsx:146`; akvaryum sınıfı `.ml-aquarium-mode` shell'de zaten var (AppLayout.tsx:49). `?scene=force` mantığı `src/scene/webglSupport.ts:46-62`'de hazır — M3 hiçbir sahne-mount kodu değiştirmez.