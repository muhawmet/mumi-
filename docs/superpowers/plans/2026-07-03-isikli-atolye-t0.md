# Işıklı Atölye T0 — Zanaat Pürüzleri + Toast Islahı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alıcı gözü denetiminin 8 zanaat kusurunu (envanter 4, 9, 10, 11, 12, 13, 16, 18) kapatmak: bitişik kicker'lar, kırpık eyebrow'lar, 1-3-4-5 sidebar, taşan Çizim Ekranı etiketleri, kesik WORLD select'i, kesik Harry alıntısı, düşmanca toast sistemi, en batan EN CTA'lar.

**Architecture:** Salt kabuk işi — beyin (core/, store aksiyonları) dokunulmaz. CSS otoritesi `design_v3.css`/`design_v2.css`'te kalır; davranış değişikliği yalnız `thoughtQueue.ts`'te (TDD). Padding otoritesi `.ml-v3-screen`'e taşınır (tek doğruluk kaynağı ilkesi).

**Tech Stack:** React 19 + zustand + framer-motion + vitest. Gate: `mamilas-gate` skill (tsc + vitest + build). Kanıt: playwright screenshot (scratchpad'deki `design-tour-shots.mjs` bu planla `scripts/`e taşınır).

**Bağlam (üst plan):** `~/.claude/plans/inherited-humming-petal.md` — onaylı "Işıklı Atölye" dönüşümü, bu onun T0'ı. Kurallar: 5180'e dokunma, push yok, TDD, her task sonrası commit.

---

### Task 1: Verdict band kicker bitişikliği (envanter 9)

Kanıt: Sahneler'de "CABINET READ5 beat masada", Timeline'da "PRODUCTION READÖnce packet compile." — `.studio-verdict-kicker` (span) ve `strong` ikisi de inline aktığı için bitişik.

**Files:**
- Modify: `src/styles/design_v2.css` (satır ~531 `.dashboard-decision-kicker, .studio-verdict-kicker` bloğu)

- [ ] **Step 1: CSS fix**

`src/styles/design_v2.css` içinde mevcut bloğu bul:

```css
.dashboard-decision-kicker,
.studio-verdict-kicker {
  color: var(--m2-amber);
  font: 900 10px/1 var(--m2-font-mono);
  letter-spacing: 2px;
}
```

Şuna çevir (kicker ve strong blok akışına iner; dashboard `h2` zaten blok, etkilenmez):

```css
.dashboard-decision-kicker,
.studio-verdict-kicker {
  display: block;
  color: var(--m2-amber);
  font: 900 10px/1 var(--m2-font-mono);
  letter-spacing: 2px;
}

.studio-verdict-band strong {
  display: block;
}
```

NOT: `.studio-verdict-band strong` için ayrı kural ekle; mevcut `.dashboard-decision-band h2, .studio-verdict-band strong` kuralındaki `margin: 9px 0 0` artık blokta işler.

- [ ] **Step 2: Görsel doğrulama**

Run: `npm run dev -- --port 5177 --strictPort` + tarayıcıda `http://localhost:5177/?scene=force`, Sahneler ve Timeline'a git (state seed etmek için console'da `window.__mamilas.getState().setRawSource('test kaynak metni burada'); window.__mamilas.getState().decodeRawSource(); window.__mamilas.getState().ingestRawSource()`).
Expected: "CABINET READ" ayrı satırda küçük altın etiket, altında başlık.

- [ ] **Step 3: Commit**

```bash
git add src/styles/design_v2.css
git commit -m "fix(t0): verdict band kicker bitişikliği — kicker+strong blok akışına indi"
```

---

### Task 2: Stage padding otoritesi → .ml-v3-screen (envanter 10)

Kanıt: "TAGE 3 · SAHNELER" — Scenes/Timeline/Director/QA kök div'lerinde padding yok, içerik `.ml-v3-screen`'in (overflow: clip) kenarına yapışıp kırpılıyor. Dashboard/Recipe ise `.mamilas-design-v2`/`.recipe-step-v2`'den `padding: var(--m2-space-8)` alıyor (çifte otorite).

**Files:**
- Modify: `src/styles/design_v3.css` (`.ml-v3-screen` bloğu, satır ~156)
- Modify: `src/styles/design_v2.css` (`.recipe-step-v2, .mamilas-design-v2` bloğu, satır ~35)

- [ ] **Step 1: Padding'i cam panele taşı**

`design_v3.css` `.ml-v3-screen` bloğuna ekle (overflow: clip satırının üstüne):

```css
  padding: 28px 32px 36px;
```

- [ ] **Step 2: Sayfa kökünden padding'i sök**

`design_v2.css` satır ~35 bloğunda `padding: var(--m2-space-8);` satırını ve `min-height: 100vh;` satırını SİL (padding artık camdan gelir; min-height cam içinde anlamsız, alt boşluğu şişirir):

```css
.recipe-step-v2, .mamilas-design-v2 {
  font-family: var(--m2-font-body);
  background-color: var(--m2-ink);
  color: var(--m2-paper);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
```

DİKKAT: `background-color: var(--m2-ink)` opak — cam panelin içini boyuyor olabilir; tarayıcıda kontrol et. Eğer dashboard/recipe köklerinde bu opak zemin cam hissini öldürüyorsa `background-color: transparent`'a çevir (DashboardStep.tsx inline'ında zaten `background: 'transparent'` var, Recipe'de kontrol et).

- [ ] **Step 3: 900px altı responsive kontrolü**

`design_v3.css` ~437'deki `.ml-v3-screen { margin: 10px; ... }` mobil kuralına `padding: 16px;` ekle.

- [ ] **Step 4: Görsel doğrulama — 6 stage**

Dev server'da 6 stage'i de gez. Expected: her stage'de "STAGE N · ..." eyebrow'u tam okunur, içerik kenara yapışmaz, dashboard/recipe'de padding İKİ KAT DEĞİL (eski görünümle karşılaştır: içerik genişliği benzer kalmalı).

- [ ] **Step 5: Commit**

```bash
git add src/styles/design_v3.css src/styles/design_v2.css
git commit -m "fix(t0): padding otoritesi .ml-v3-screen'e — eyebrow kırpılması bitti, çifte padding söküldü"
```

---

### Task 3: Sidebar numaralaması kompakt (envanter 11)

Kanıt: Yönetmen (presetOnly) gizliyken sidebar 1-3-4-5 gösteriyor — `s.index` sabit. Görünen listede sıra numarası pozisyondan gelmeli.

**Files:**
- Modify: `src/components/Layout/AppLayout.tsx:94`
- Test: `src/components/Layout/appLayoutSteps.test.ts` (yeni — saf yardımcı fonksiyon çıkar)

- [ ] **Step 1: Saf yardımcıyı çıkar + failing test yaz**

`AppLayout.tsx`'te filtre mantığını dışa alınabilir saf fonksiyon yap (component dışında export):

```tsx
export function visibleSteps(all: typeof BASE_STEPS, opts: { phase0PresetId: string | null; currentStep: Step }) {
  return all
    .filter((step) => !step.presetOnly || opts.phase0PresetId || opts.currentStep === step.id)
    .map((step, i) => ({ ...step, displayIndex: i + 1 }));
}
```

`src/components/Layout/appLayoutSteps.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { visibleSteps, BASE_STEPS } from './AppLayout';

describe('visibleSteps', () => {
  it('yönetmen gizliyken numaralar kompakt akar (1,2,3,4 — 1,3,4,5 değil)', () => {
    const steps = visibleSteps(BASE_STEPS, { phase0PresetId: null, currentStep: 'dashboard' });
    expect(steps.map((s) => s.displayIndex)).toEqual([1, 2, 3, 4]);
    expect(steps.find((s) => s.id === 'director')).toBeUndefined();
  });
  it('preset seçiliyken yönetmen görünür ve sıra 1..5', () => {
    const steps = visibleSteps(BASE_STEPS, { phase0PresetId: 'egitim', currentStep: 'dashboard' });
    expect(steps.map((s) => s.displayIndex)).toEqual([1, 2, 3, 4, 5]);
    expect(steps[1].id).toBe('director');
  });
});
```

NOT: `BASE_STEPS`'i de export etmek gerekir. QA_STEP eklendiğinde (currentStep==='qa') displayIndex akışı bozulmasın: QA eklemesi de `visibleSteps` içine alınabilir ya da AppLayout'ta sona eklenip `displayIndex: steps.length + 1` verilir — implementer mevcut `steps` birleşimini koruyarak karar versin, test QA durumunu da kapsasın.

- [ ] **Step 2: Testin FAIL ettiğini gör** — `npx vitest run src/components/Layout/appLayoutSteps.test.ts`

- [ ] **Step 3: AppLayout'u yardımcıya bağla**

Render'da `{done ? <Check .../> : s.index}` → `{done ? <Check .../> : s.displayIndex}`.

- [ ] **Step 4: Test PASS + tam suite** — `npx vitest run` (358 taban düşmez, yeni 2+ test eklenir)

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout/AppLayout.tsx src/components/Layout/appLayoutSteps.test.ts
git commit -m "fix(t0): sidebar numaraları görünen listeden akar — 1-3-4-5 bitti (TDD)"
```

---

### Task 4: Çizim Ekranı etiket taşmaları (envanter 12)

Kanıt: boş durumda alt overlay'deki `{state.matName}` ("world-native") kart sınırından taşıyor; sarı ref chip'i canvas kenarına biniyor.

**Files:**
- Modify: `src/components/PreviewStage.tsx` (satır ~188-198 alt overlay; ~160-168 üst-sağ chip)

- [ ] **Step 1: Alt overlay'i taşmaz yap**

```tsx
        ) : !activeRef ? (
          <div style={{
            position: 'absolute', bottom: 8, left: 10, right: 10,
            fontSize: 11, fontWeight: 800, color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 8, overflow: 'hidden',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{state.worldName}</span>
            <span style={{ fontSize: 9, opacity: 0.55, flexShrink: 0, whiteSpace: 'nowrap' }}>{state.matName}</span>
          </div>
        ) : null}
```

- [ ] **Step 2: Üst-sağ ref chip'ini sınırla** — mevcut `maxWidth: 130`'u koru ama `maxWidth: 'calc(50% - 14px)'` yap (dar rayda kategori chip'iyle çarpışmasın).

- [ ] **Step 3: Görsel doğrulama** — dev server'da boş durum (localStorage.clear) + seed'li durum; Expected: hiçbir etiket kart/canvas sınırından taşmıyor.

- [ ] **Step 4: Commit**

```bash
git add src/components/PreviewStage.tsx
git commit -m "fix(t0): çizim ekranı etiket taşmaları — overlay ellipsis + chip sınırı"
```

---

### Task 5: WORLD select kesiği (envanter 13)

Kanıt: Yönetmen açık hâlinde "ANIMATION_EDU · Pixar 3D" seçeneği select genişliğinden taşıp kesiliyor.

**Files:**
- Modify: `src/pages/Director/DirectorStep.tsx` (CANLI İNCE AYAR bölümündeki WORLD select'i — `grep -n "WORLD" src/pages/Director/DirectorStep.tsx` ile bul)

- [ ] **Step 1:** Select'e `width: '100%', minWidth: 0, textOverflow: 'ellipsis'` ver; içinde bulunduğu grid hücresine `minWidth: 0`. Değer metni yine uzunsa option metnini kısaltma — select genişliği kolonu doldursun yeter.

- [ ] **Step 2: Görsel doğrulama** — Yönetmen'de "Eğitim / Açıklayıcı" kartını aç, CANLI İNCE AYAR'daki WORLD select'inin tam okunduğunu gör.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Director/DirectorStep.tsx
git commit -m "fix(t0): yönetmen WORLD select kesiği — kolon genişliğine oturdu"
```

---

### Task 6: INLAND REVIEW alıntı kesiği (envanter 18)

Kanıt: Harry kutusundaki alıntı hep "..." ile kesik ("Şimdi onu delille..."). CSS `.ml-harry-quote` clamp'ı dar.

**Files:**
- Modify: `src/styles/design_v3.css` (`.ml-harry-quote` kuralı — `grep -n "ml-harry-quote" src/styles/design_v3.css`)

- [ ] **Step 1:** `-webkit-line-clamp` değerini 5'e çıkar (yoksa ekle); `max-height`/sabit `height` varsa kaldır. Kutu içeriğe göre nefes alsın; sidebar flex'i zaten alta itiyor.

- [ ] **Step 2: Görsel doğrulama** — dashboard'da Harry alıntısının tam cümle bittiğini gör (uzun verdict'te en fazla 5 satır + ellipsis kabul).

- [ ] **Step 3: Commit**

```bash
git add src/styles/design_v3.css
git commit -m "fix(t0): inland review alıntısı nefes aldı — clamp 5 satır, sabit yükseklik yok"
```

---

### Task 7: Toast dock sağ-alt köşeye (envanter 4a)

Kanıt: dock `left: 50%` bottom-center — toast'lar form alanlarının ve KAYDET/İLERİ CTA'larının üstüne oturuyor.

**Files:**
- Modify: `src/styles/design_v3.css` (`.thought-dock` + `.thought-dock.is-hidden`, satır ~482)
- Check: `e2e/aquarium.spec.ts` (dock görünürlük assert'leri konuma bağlı mı — `grep -n "thought" e2e/aquarium.spec.ts`)

- [ ] **Step 1: CSS**

```css
.thought-dock {
  position: fixed;
  right: 384px; /* sağ ray 340 + 2×padding + nefes: ray içeriğini örtmez */
  left: auto;
  bottom: 26px;
  transform: none;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
  transition: opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), visibility var(--dur-2) var(--ease);
}
.thought-dock.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: scale(0.985); /* HIDDEN_CHROME reçetesi; translateX artık yok */
}
```

Ve 900px altı mevcut responsive bloğuna: `.thought-dock { right: 16px; }`.

- [ ] **Step 2: Görsel + e2e doğrulama**

Dev'de toast tetikle (localStorage.clear + reload → fail toast'ları). Expected: toast sağ-altta, ana panelin CTA'larını örtmüyor. Run: `npx playwright test e2e/aquarium.spec.ts` — akvaryum dock kanunu yeşil kalmalı.

- [ ] **Step 3: Commit**

```bash
git add src/styles/design_v3.css
git commit -m "fix(t0): thought dock sağ-alt köşeye — form/CTA örtmesi bitti"
```

---

### Task 8: Sakin mod — taze kullanıcıya FAIL toast'u atılmaz (envanter 4b, TDD)

Kanıt: localStorage temiz açılışta kullanıcı hiçbir şey yapmadan DIRECTOR/VOLITION kırmızı FAIL toast'ları yiyor. Kural: kullanıcı bir eylem yapana kadar fail'ler rozete düşer (badge), toast açılmaz. Eylem sinyali: `projectTopic || rawSource || selectedWorldId || phase0PresetId` dolu.

**Files:**
- Modify: `src/components/ThoughtBubble/thoughtQueue.ts`
- Modify: `src/components/ThoughtBubble/ThoughtDock.tsx`
- Test: `src/components/ThoughtBubble/thoughtQueue.test.ts`

- [ ] **Step 1: Failing testler**

`thoughtQueue.test.ts`'e ekle (mevcut describe yapısına uy):

```ts
describe('sakin mod (taze kullanıcı)', () => {
  const failVerdict = { voice: 'Director', title: 'World yok', text: 'x', tone: 'fail' as const, evidence: '' };

  it('calm=true iken fail rozete düşer, toast açılmaz', () => {
    const merged = mergeThoughts([], [failVerdict], 1000, { calm: true });
    expect(merged[0].behavior).toBe('badge');
    expect(openToastsFor(merged, false)).toHaveLength(0);
  });

  it('calm=false olunca aynı fail auto-open olur (davranış yeniden hesaplanır)', () => {
    const calm = mergeThoughts([], [failVerdict], 1000, { calm: true });
    const active = mergeThoughts(calm, [failVerdict], 2000, { calm: false });
    expect(active[0].behavior).toBe('auto-open');
    expect(active[0].seenAt).toBe(1000); // kimlik korunur
  });

  it('dismissed fail, calm kalkınca yeniden açılmaz (ton değişmedi)', () => {
    const calm = mergeThoughts([], [failVerdict], 1000, { calm: true });
    const dismissed = calm.map((t) => ({ ...t, dismissed: true }));
    const active = mergeThoughts(dismissed, [failVerdict], 2000, { calm: false });
    expect(active[0].dismissed).toBe(true);
  });

  it('opts verilmezse eski davranış (fail → auto-open) korunur', () => {
    const merged = mergeThoughts([], [failVerdict], 1000);
    expect(merged[0].behavior).toBe('auto-open');
  });
});
```

InnerVoiceVerdict alan adları gerçek tipe göre ayarlanır (`src/components/innerVoices.ts`'e bak; verdict objesini tipten birebir kur).

- [ ] **Step 2: FAIL gör** — `npx vitest run src/components/ThoughtBubble/thoughtQueue.test.ts`

- [ ] **Step 3: Implementasyon**

`thoughtQueue.ts`:

```ts
export interface MergeOpts { calm?: boolean }

export function behaviorFor(tone: InnerVoiceTone, calm = false): ThoughtBehavior {
  if (tone === 'fail') return calm ? 'badge' : 'auto-open';
  if (tone === 'warn' || tone === 'spark') return 'badge';
  return 'silent';
}

export function mergeThoughts(
  previous: Thought[],
  verdicts: InnerVoiceVerdict[],
  now: number,
  opts: MergeOpts = {},
): Thought[] {
  const calm = opts.calm ?? false;
  const known = new Map(previous.map((t) => [t.key, t]));
  return verdicts.map((verdict) => {
    const key = thoughtKey(verdict);
    const existing = known.get(key);
    if (existing) {
      if (existing.tone !== verdict.tone) {
        return { ...existing, ...verdict, key, behavior: behaviorFor(verdict.tone, calm), dismissed: false };
      }
      return { ...existing, ...verdict, key, behavior: behaviorFor(verdict.tone, calm) };
    }
    return { ...verdict, key, behavior: behaviorFor(verdict.tone, calm), seenAt: now, dismissed: false };
  });
}
```

`ThoughtDock.tsx`: useShallow seçimine `phase0PresetId: s.phase0PresetId` ekle; merge effect'inde:

```tsx
  const calm = !(
    state.projectTopic?.trim() ||
    state.rawSource?.trim() ||
    state.selectedWorldId ||
    state.phase0PresetId
  );

  useEffect(() => {
    setThoughts(mergeThoughts(thoughtsRef.current, verdicts, Date.now(), { calm }));
  }, [verdicts, calm]);
```

- [ ] **Step 4: PASS + tam suite** — `npx vitest run`

- [ ] **Step 5: Canlı doğrulama** — localStorage temiz açılış: toast YOK, sağ-altta `! N` rozeti VAR; konu yazınca/preset seçince fail toast'ları gelir.

- [ ] **Step 6: Commit**

```bash
git add src/components/ThoughtBubble/thoughtQueue.ts src/components/ThoughtBubble/ThoughtDock.tsx src/components/ThoughtBubble/thoughtQueue.test.ts
git commit -m "feat(t0): sakin mod — taze kullanıcıya FAIL toast'u atılmaz, rozete düşer (TDD)"
```

---

### Task 9: En batan EN CTA'lar Türkçe (envanter 16, dar dilim)

Kapsam SINIRLI: yalnız Timeline'daki `COMPILE AGENT PACKET` / `RE-COMPILE PACKET` / `COMPILING…` ve Sahneler/Timeline'daki `PERSONAL MOD`. GATES/mono makine etiketleri (BRIEF/DNA/PACK, hash'ler) T5 dil politikasına kalır — DOKUNMA.

**Files:**
- Modify: `src/pages/Timeline/TimelineStep.tsx` (satır ~143 ve ~199)
- Modify: `PERSONAL MOD` nerede geçiyorsa (`grep -rn "PERSONAL MOD" src/`)

- [ ] **Step 1: Selector taraması** — `grep -rn "COMPILE AGENT PACKET\|RE-COMPILE PACKET\|COMPILING\|PERSONAL MOD" src/ e2e/ scripts/` — e2e/test/script bir metne bağlıysa onları da güncelleme listesine al.

- [ ] **Step 2: Metinleri değiştir** — `COMPILE AGENT PACKET` → `AJAN PAKETİNİ DERLE`; `RE-COMPILE PACKET` → `PAKETİ YENİDEN DERLE`; `COMPILING…` → `DERLENİYOR…`; `PERSONAL MOD` → `KİŞİSEL MOD`.

- [ ] **Step 3: Suite + görsel** — `npx vitest run` + Timeline boş/dolu iki durumda buton metinleri.

- [ ] **Step 4: Commit**

```bash
git add -A src/ e2e/
git commit -m "fix(t0): en batan İngilizce CTA'lar Türkçe — derleme düğmeleri + kişisel mod"
```

---

### Task 10: Tur script'i repoya + T0 kanıt seti

**Files:**
- Create: `scripts/design-tour-shots.mjs` (scratchpad `design-tour-shots.mjs`'in repo-uyumlu hâli)
- Create: `reports/t0-*.png` kanıtları

- [ ] **Step 1: Script'i taşı** — scratchpad'deki `/private/tmp/claude-502/-Users-Muhammet-Desktop-mamilas-modern/6acbe820-c16d-4844-baaa-1bbe0c2981c8/scratchpad/design-tour-shots.mjs` içeriğini `scripts/design-tour-shots.mjs`'e al; şu uyarlamalarla: `createRequire` hack'i yerine düz `import { chromium } from 'playwright'` (repo içinden koşar), `OUT` → `process.env.TOUR_OUT || 'output/design-tour'`, PORT çakışmaması için 5178.

- [ ] **Step 2: Koş** — `node scripts/design-tour-shots.mjs`. Expected: 8+ kare `output/design-tour/`e düşer, konsol `✓` satırları.

- [ ] **Step 3: Önce/sonra kanıt çiftleri** — şu kareleri `reports/`e kopyala: `t0-scenes-kicker.jpg` (bitişik kicker fixi görünür), `t0-dashboard-fresh.jpg` (toast yok + rozet var + numaralar kompakt), `t0-director-select.jpg`, `t0-drawer.png`. "Önce" hâli zaten scratchpad denetim setinde — rapora gerek yok, commit mesajına not düş.

- [ ] **Step 4: Commit**

```bash
git add scripts/design-tour-shots.mjs reports/t0-*.jpg reports/t0-*.png
git commit -m "feat(t0): tasarım turu script'i repoda + T0 kanıt seti"
```

---

### Task 11: T0 kapanış — tam gate

- [ ] **Step 1:** mamilas-gate skill'ini koş (tsc + vitest + build + .command syntax). Expected: hepsi PASS, test sayısı ≥ 358 + yeni testler.
- [ ] **Step 2:** `npx playwright test e2e/aquarium.spec.ts e2e/scene-smoke.spec.ts` — 3/3 yeşil (preset/director kaynaklı bilinen kırmızılar kapsam dışı).
- [ ] **Step 3:** Kanıt karelerini galeri artifact'ine ekleyip Mami'ye sun; sözlü onay olmadan T1'e geçme.
- [ ] **Step 4:** Memory checkpoint (mamilas-checkpoint skill).

## Self-Review Notları
- Spec kapsaması: envanter 4 (Task 7+8), 9 (Task 1), 10 (Task 2), 11 (Task 3), 12 (Task 4), 13 (Task 5), 16-dar (Task 9), 18 (Task 6). ✓
- Tip tutarlılığı: `mergeThoughts(prev, verdicts, now, opts?)` imzası Task 8'de tek yerde tanımlı; ThoughtDock çağrısı aynı imzayı kullanıyor. `visibleSteps` yalnız Task 3'te. ✓
- Placeholder taraması: her code step gerçek kod içeriyor; "TBD" yok. Task 5'te satır numarası verilmedi çünkü select'in tam yeri grep ile bulunacak — arama komutu verildi. ✓
