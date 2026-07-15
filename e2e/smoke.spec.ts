import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to root with a clean persisted state, BUT keep localStorage
 * intact on subsequent reloads (so we can test the persistence itself).
 */
async function freshGoto(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.removeItem('mamilas-studio-v1');
    } catch {
      /* ignore */
    }
  });
  await page.reload();
}

test('app boots and renders Brief stage with Phase 0 cards', async ({ page }) => {
  await freshGoto(page);
  await expect(page.getByText('STAGE 1 · BRIEF')).toBeVisible();
  // PanelKit artık başlığı .toUpperCase() ETMİYOR (ham render) ve Phase 0 paneli
  // "Açılış reçetesi" adını aldı. İDDİA AYNI: Phase 0 slate'i Brief ekranında duruyor.
  await expect(page.getByText('Phase 0 — Açılış reçetesi')).toBeVisible();
  await expect(page.getByText('Ürün / Marka Filmi')).toBeVisible();
  await expect(page.getByText('Eğitim / Açıklayıcı')).toBeVisible();
});

test('Phase 0 preset wires world and lets us complete the full flow', async ({ page }) => {
  await freshGoto(page);

  // Preset click → DirectorStep.
  await page.getByText('Eğitim / Açıklayıcı').click();

  // "wires world" — testin ADININ iddiası. Daha önce hiç ölçülmüyordu: akış yürüyor
  // diye geçiyordu. Preset'in world + ref DNA'yı GERÇEKTEN store'a yazdığını doğrula
  // (main'deki preset/director bug ailesi tam olarak burayı kaçırıyor).
  const wired = await page.evaluate(() => {
    const s = (window as unknown as { __mamilas: { getState: () => Record<string, unknown> } }).__mamilas.getState();
    return {
      worldId: s.selectedWorldId,
      paletteId: s.selectedPaletteId,
      refIds: s.selectedRefIds,
      presetId: s.phase0PresetId,
    };
  });
  expect(wired.presetId).toBe('edu_explainer');
  expect(wired.worldId).toBeTruthy();
  expect(wired.paletteId).toBeTruthy();
  expect(wired.refIds).toHaveLength(3);

  // 'Reçeteye geç' in DirectorStep → RecipeStep.
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  // Preset seçiliyken Yönetmen adımı araya girer (presetOnly) → Reçete STAGE 3 olur.
  // Bu numaralandırma kasıtlı ve appLayoutSteps.test.ts'te kilitli.
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();

  // The aquarium-toggle (position: fixed, right: 364, top: 18) overlaps the
  // RecipeStep and ScenesStep header CTAs at the top-right of the viewport.
  // Regular clicks time out because the toggle intercepts the pointer event.
  // Use the sidebar step-buttons (inside nav, never overlapped) to navigate.
  await page.locator('.ml-step-btn').filter({ hasText: 'Sahneler' }).click();
  await expect(page.getByText('STAGE 4 · SAHNELER')).toBeVisible();

  await page.locator('.ml-step-btn').filter({ hasText: 'Timeline' }).click();
  await expect(page.getByText('STAGE 5 · TIMELINE')).toBeVisible();
  await expect(page.getByText(/Motor bekliyor/i)).toBeVisible();

  // Meta+Enter on timeline calls generateScenes() directly.
  await page.keyboard.press('Meta+Enter');

  // After generation: scenes list + pacing arc + first-scene detail are visible.
  // Panel başlığı artık ham render (uppercase yok): 'SAHNELER (5)' → 'Sahneler (5)'.
  await expect(page.getByText('Sahneler (5)')).toBeVisible();
  await expect(page.getByText('SAHNE 1 · INTRO', { exact: true })).toBeVisible();
  await expect(page.getByText('5/5 üretildi')).toBeVisible();

  // PACING ARCI is always visible in the Sahneler panel after generation.
  await expect(page.getByText('PACING ARCI')).toBeVisible();

  // TEKNİK KANIT detail rows prove the prompt engine ran.
  await expect(page.getByText('TEKNİK KANIT · EN')).toBeVisible();
});

test('SOURCE: prefix triggers the live beat preview', async ({ page }) => {
  await freshGoto(page);
  const topic = page.getByLabel('Proje konusu');
  await topic.fill('SOURCE:\nilk beat\nikinci beat\nüçüncü beat');
  await expect(page.getByText(/SOURCE BOUND · 3 BEAT/i)).toBeVisible();
  await expect(page.getByText('source-001')).toBeVisible();
  await expect(page.getByText('source-003')).toBeVisible();
});

test('Phase A decodes and losslessly ingests a curriculum brief', async ({ page }) => {
  await freshGoto(page);
  const raw = 'Öğrenciler için su döngüsü dersi. Buhar yükselir!';
  await page.getByTestId('raw-source-input').fill(raw);

  // Plain source içeriktir; yalnız explicit MAMILAS dossier metadata'sı decode summary
  // ve yaratıcı seçim restore'u üretebilir.
  await expect(page.getByTestId('decode-summary')).toHaveCount(0);

  await page.getByRole('button', { name: 'Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-integrity-report')).toContainText('100%');
  await expect(page.getByTestId('source-beat')).toHaveCount(2);
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');
  await expect(page.getByTestId('source-right-rail')).toContainText('100%');
});

test('Phase A invalidates stale ingest and blocks progression after source edits', async ({ page }) => {
  await freshGoto(page);
  await page.getByTestId('raw-source-input').fill('Birinci kaynak cümlesi. İkinci kaynak cümlesi.');
  await page.getByRole('button', { name: 'Kayıpsız Ingest' }).click();
  await expect(page.getByTestId('source-right-rail')).toContainText('PASS');

  await page.getByTestId('raw-source-input').fill('Kaynak sonradan değiştirildi.');
  await expect(page.getByTestId('source-right-rail')).toContainText('INGEST BEKLİYOR');
  await expect(page.getByRole('button', { name: /Reçeteye geç/ })).toBeDisabled();
});

test('keyboard shortcut ⌘/Ctrl+Enter advances the step', async ({ page }) => {
  await freshGoto(page);
  await page.getByText('Eğitim / Açıklayıcı').click();
  await page.keyboard.press('Meta+Enter');
  // Preset açıkken Yönetmen 2, Reçete 3 (appLayoutSteps.test.ts'te kilitli).
  // İDDİA AYNI: kısayol Yönetmen'den Reçete'ye ilerletir.
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();
});

test('per-scene override persists across reloads', async ({ page }) => {
  await freshGoto(page);
  // Preset → DirectorStep → Reçeteye geç → RecipeStep → sidebar to Timeline.
  // The inline DÜZENLE/KAYDET UI was removed from TimelineStep; test the override
  // contract via store-level injection and localStorage assertion.
  await page.getByText('Eğitim / Açıklayıcı').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  // Preset açıkken Yönetmen araya girer → Reçete 3, Timeline 5.
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();

  // Navigate via sidebar to avoid the aquarium-toggle overlay on header CTAs.
  await page.locator('.ml-step-btn').filter({ hasText: 'Timeline' }).click();
  await expect(page.getByText('STAGE 5 · TIMELINE')).toBeVisible();

  // Generate scenes via keyboard shortcut.
  await page.keyboard.press('Meta+Enter');
  await expect(page.getByText('SAHNE 1 · INTRO', { exact: true })).toBeVisible();

  // Set a per-scene override through the REAL store (main.tsx `window.__mamilas`).
  // Eskiden burada `__MAMILAS_STORE__` aranıyordu — o handle HİÇ var olmadı, yani
  // test her seferinde fallback'e düşüp override'ı localStorage'a KENDİ ELİYLE yazıp
  // sonra onu okuyordu: kendi yazdığını doğrulayan bir ayna. Artık gerçek
  // setSceneOverride çağrılıyor, yani persist yolu FİİLEN kanıtlanıyor.
  await page.evaluate(() => {
    const store = (window as unknown as {
      __mamilas: { getState: () => { scenes: Array<{ id: number }>; setSceneOverride: (id: number, v: string) => void } };
    }).__mamilas;
    const { scenes, setSceneOverride } = store.getState();
    setSceneOverride(scenes[0].id, 'MY CUSTOM PROMPT — locked by the user');
  });

  // Zustand persist yazdı mı? (reload'dan ÖNCE — fallback yok, geçerse gerçekten geçti.)
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const stored = localStorage.getItem('mamilas-studio-v1');
        if (!stored) return false;
        const data = JSON.parse(stored);
        const scenes = data?.state?.scenes ?? [];
        return scenes.some((s: { userImagePrompt?: string }) => s.userImagePrompt === 'MY CUSTOM PROMPT — locked by the user');
      }),
    )
    .toBe(true);

  // Reload WITHOUT wiping localStorage — persist should restore the override.
  await page.goto('/');
  await page.waitForLoadState('load');

  // After reload the persisted scene should carry the override.
  const overrideRestored = await page.evaluate(() => {
    const stored = localStorage.getItem('mamilas-studio-v1');
    if (!stored) return false;
    try {
      const data = JSON.parse(stored);
      const scenes = data?.state?.scenes ?? [];
      return scenes.some((s: any) => s.userImagePrompt === 'MY CUSTOM PROMPT — locked by the user');
    } catch {
      return false;
    }
  });
  expect(overrideRestored).toBe(true);
});

test('Proje Kasası saves the active project and restores it after a change + reload', async ({ page }) => {
  await freshGoto(page);

  await page.getByLabel('Proje konusu').fill('Kasa Test Konusu');
  await page.getByTestId('vault-name').fill('Kayıt #1');
  await page.getByTestId('vault-save').click();

  const list = page.getByTestId('vault-list');
  await expect(list).toContainText('Kayıt #1');

  // mutate the live project, then restore from the vault
  await page.getByLabel('Proje konusu').fill('Bambaşka Konu');
  await page.getByRole('button', { name: 'Yükle' }).first().click();
  await expect(page.getByLabel('Proje konusu')).toHaveValue('Kasa Test Konusu');

  // vault survives a reload (persisted)
  await page.reload();
  await expect(page.getByTestId('vault-list')).toContainText('Kayıt #1');

  // delete clears it
  await page.getByRole('button', { name: 'Sil' }).first().click();
  await expect(page.getByText('Kasa boş — kaydettiğin projeler burada listelenir.')).toBeVisible();
});

test('v5 localStorage fixture ile acilis ve ref migration dogrulama', async ({ page }) => {
  // Store a near-v5 payload that uses the new selectedRefIds array format (plural)
  // so the migration path normalises it to exactly 1 ref.
  await page.goto('/');
  await page.evaluate(() => {
    const fixture = {
      state: {
        projectTopic: 'V5 Proje',
        selectedWorldId: 'clay',
        selectedPaletteId: 'vibrant_clean_education',
        selectedRefIds: ['pixar_dimensional'],
        subject: 'V5 Proje',
        recipeScenes: [{ id: 1, vo: 'test', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [] }],
        scenes: [],
      },
      version: 5,
    };
    localStorage.setItem('mamilas-studio-v1', JSON.stringify(fixture));
  });
  await page.reload();

  // With no source and no phase0PresetId, the dashboard bottom button says 'Reçeteye geç'.
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();

  // RecipeStep command strip shows 'X/3 kilit' for selectedRefIds count.
  // Fixture set 1 ref so we expect '1/3 kilit'.
  await expect(page.getByText('STAGE 2 · REÇETE')).toBeVisible();
  await expect(page.getByText(/1\/3 kilit/)).toBeVisible();

  // The SEÇİLİ DNA box shows the selected ref name (not 'Path-native').
  // 'pixar_dimensional' → 'Dimensional Character-Object Clarity'.
  // Use the store state for a reliable assertion: check that exactly 1 refId is active.
  const refIds = await page.evaluate(() => {
    const stored = localStorage.getItem('mamilas-studio-v1');
    if (!stored) return [];
    try {
      return JSON.parse(stored)?.state?.selectedRefIds ?? [];
    } catch { return []; }
  });
  expect(refIds).toHaveLength(1);
  expect(refIds[0]).toBe('pixar_dimensional');
});

test('Reference DNA complete E2E workflow', async ({ page }, testInfo) => {
  await freshGoto(page);

  // 1. Navigate to RecipeStep via preset → DirectorStep → Reçeteye geç.
  // The Eğitim/Açıklayıcı preset pre-selects 3 refs (pixar_dimensional,
  // arcane_clay_hybrid, kurzgesagt_clarity) and sets world + palette.
  await page.getByText('Eğitim / Açıklayıcı').click();
  await page.getByRole('button', { name: /Reçeteye geç/ }).click();
  // Preset açıkken Yönetmen araya girer → Reçete STAGE 3.
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();

  // 2. Verify 3 refs are pre-selected (command strip shows 'X/3 kilit').
  await expect(page.getByText(/3\/3 kilit/)).toBeVisible();

  // 3. Deselect one ref (kurzgesagt_clarity) by clicking its starter-pack
  // toggle button (the simple button in the left column; accessible name = exact name).
  // Both the starter-pack and the sorted-list buttons call toggleRef — use first().
  // AD DEĞİŞTİ: telif firewall'u eser/marka adlarını söktü —
  // 'Kurzgesagt System Clarity' → 'Flat-Vector System Clarity'
  // (aynı aile: arcane_clay_hybrid → 'Painterly Clay Hybrid'). Ref'in KENDİSİ aynı.
  await page.getByRole('button', { name: /Flat-Vector System Clarity/ }).first().click();
  await expect(page.getByText(/2\/3 kilit/)).toBeVisible();

  // 4. Re-add it — now back to 3/3.
  await page.getByRole('button', { name: /Flat-Vector System Clarity/ }).first().click();
  await expect(page.getByText(/3\/3 kilit/)).toBeVisible();

  // 5. A 4th ref cannot be added when 3 are already selected — the 4th button is disabled.
  // We verify by checking that a non-selected ref button is disabled (opacity 0.45 is
  // a styling cue; the disabled attribute is the reliable contract).
  const extraRef = page.getByRole('button', { name: /Open-Sea Adventure Rhythm/ });
  await expect(extraRef).toBeDisabled();

  // 6. Reload: refs persist.
  await page.reload();
  await expect(page.getByText('STAGE 3 · REÇETE')).toBeVisible();
  await expect(page.getByText(/3\/3 kilit/)).toBeVisible();

  // 7. Go to Timeline via sidebar (avoids aquarium-toggle overlay on header CTAs).
  await page.locator('.ml-step-btn').filter({ hasText: 'Timeline' }).click();
  await expect(page.getByText('STAGE 5 · TIMELINE')).toBeVisible();

  // Generate via Meta+Enter (keyboard shortcut that calls generateScenes directly).
  await page.keyboard.press('Meta+Enter');
  await expect(page.getByText('SAHNE 1 · INTRO', { exact: true })).toBeVisible();

  // 8. Verify that the generated scene imagePrompt contains reference DNA influences.
  // The TEKNİK KANIT section proves the pipeline ran; check the first scene's
  // stored imagePrompt in the store for the ref-DNA-specific text.
  const firstPromptText = await page.evaluate(() => {
    const stored = localStorage.getItem('mamilas-studio-v1');
    if (!stored) return '';
    try {
      const data = JSON.parse(stored);
      const scenes = data?.state?.scenes ?? [];
      return scenes[0]?.imagePrompt ?? '';
    } catch {
      return '';
    }
  });
  // Telif firewall'unun prompt'un NEGATIVE bölümüne aktığını doğrula.
  // İDDİA AYNI, METİN DEĞİŞTİ: ref avoid'ları hâlâ generic FRANCHISE FIREWALL diline
  // çevriliyor, ama kanonik cümle artık brain.ts IP_GENERIC_NEG (eski
  // 'NO named franchise characters' + 'original subjects only' çifti değil).
  // Ayrıca eskiden düz string aranıyordu; 'original subjects only' POZİTİF bölümde de
  // geçtiği için test Negative'i gerçekten ölçmüyordu — şimdi Negative'i ayırıp bakıyoruz.
  const negative = firstPromptText.split('Negative:')[1] ?? '';
  expect(negative).not.toBe('');
  expect(negative).toContain('no recognizable franchise or real-person characters, logos, brand names');

  // Firewall'un ASIL işi: ref'ler tanınabilir ESER adı taşımadan prompt'a girmeli.
  // Bu üç ref (pixar_dimensional / arcane_clay_hybrid / kurzgesagt_clarity) tam olarak
  // bu sınıftan türedi — eser/marka adı sızarsa export telif ihlali taşır.
  // (STÜDYO adı meşru kalır: 'Pixar RenderMan' pipeline soyu olarak geçer.)
  for (const leak of ['Arcane', 'Kurzgesagt', 'Spider-Verse']) {
    expect(firstPromptText).not.toContain(leak);
  }

  // 8b. MACRO 4 — Shot authoring paneli + Mami onayı + readiness-birincil export gate.
  //     Timeline'da sol listeden bir sahne seç → ShotAuthoringPanel (ajan geri-alım + onay) görünür.
  await page.getByRole('button', { name: 'Sahne 1 seç' }).click();
  await expect(page.getByText('AJAN FINAL PROMPT · SHOT ONAYI')).toBeVisible();
  await expect(page.getByText('ONAY BEKLİYOR').first()).toBeVisible();

  //     Site scaffold prompt değildir: current ajan receipt gelmeden canonical readiness prompt
  //     aşamasında kalır ve Timeline canonical command export'u devre dışıdır.
  await expect(page.getByText(/shot current ajan prompt receipt’i bekliyor/).first()).toBeVisible();
  await expect(page.getByText(/READY/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Komut JSON' })).toBeDisabled();

  // 8c. MACRO 5 — gerçek storyboard approval → frame byte import/hash → Mami APPROVE
  //     → motion open zinciri. Frame yükleme storyboard onayından önce açılamaz.
  await expect(page.getByText('GERÇEK FRAME · MOTION KAPISI')).toBeVisible();
  await expect(page.getByText(/Önce yukarıdaki storyboard shot/)).toBeVisible();
  await expect(page.locator('input[accept="image/*"]')).toHaveCount(0);

  const authorPanel = page.getByText('AJAN FINAL PROMPT · SHOT ONAYI').locator('..');
  await expect(authorPanel.getByRole('button', { name: 'Onayla' })).toBeDisabled();
  await authorPanel.getByRole('button', { name: 'Reddet' }).click();
  await expect(authorPanel.getByRole('button', { name: 'Onayla' })).toBeDisabled();
  await authorPanel.getByPlaceholder(/Ajanın.*final image prompt/).fill(
    'A single translucent water droplet rises through a tactile educational world; clean plate, no text.',
  );
  await authorPanel.getByRole('button', { name: /Ajan prompt'unu geri al/ }).click();
  await authorPanel.getByRole('button', { name: 'Onayla' }).click();
  await expect(authorPanel.getByText(/MAMİ ONAYLADI/)).toBeVisible();

  const framePanel = page.getByText('GERÇEK FRAME · MOTION KAPISI').locator('..');
  await framePanel.locator('input[accept="image/*"]').setInputFiles('screenshots/01-dashboard.png');
  await expect(framePanel.getByText(/01-dashboard\.png/)).toBeVisible();
  await expect(framePanel.getByText(/SHA-256:/)).toBeVisible();
  await expect(framePanel.getByText('HÜKÜM BEKLİYOR')).toBeVisible();
  await framePanel.getByRole('button', { name: 'Onayla' }).click();
  await expect(framePanel.getByText(/ONAYLI — MOTION AÇIK/)).toBeVisible();
  await expect(framePanel.getByText('▶ MOTION BRIEF AÇIK')).toBeVisible();

  const frameEvidence = await page.evaluate(() => {
    const store = (window as any).__mamilas.getState();
    const receipt = store.scenes[0].frameReceipt;
    return { hash: receipt?.frameHash, verdict: receipt?.verdict, width: receipt?.width, height: receipt?.height };
  });
  expect(frameEvidence.hash).toMatch(/^[0-9a-f]{64}$/);
  expect(frameEvidence.verdict).toBe('APPROVE');
  expect(frameEvidence.width).toBeGreaterThan(0);
  expect(frameEvidence.height).toBeGreaterThan(0);

  // 8d. Gerçek browser Project Pack round-trip: download → reset → file input import. Prompt,
  //     frame SHA/dimensions/verdict ve scene-1 motion gate aynı sonucu vermeli.
  const packDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Proje Paketi/ }).click();
  const packDownload = await packDownloadPromise;
  const packPath = testInfo.outputPath('phase-2-roundtrip.mamilas-project.json');
  await packDownload.saveAs(packPath);
  const gateBeforeRoundTrip = await page.evaluate(() => {
    const store = (window as any).__mamilas.getState();
    return {
      hash: store.scenes[0].frameReceipt?.frameHash,
      verdict: store.scenes[0].frameReceipt?.verdict,
      width: store.scenes[0].frameReceipt?.width,
      height: store.scenes[0].frameReceipt?.height,
    };
  });
  await page.evaluate(() => (window as any).__mamilas.getState().reset());
  await page.locator('input[aria-label="Proje paketi içe al"]').setInputFiles(packPath);
  await expect(framePanel.getByText(/ONAYLI — MOTION AÇIK/)).toBeVisible();
  const gateAfterRoundTrip = await page.evaluate(() => {
    const store = (window as any).__mamilas.getState();
    return {
      hash: store.scenes[0].frameReceipt?.frameHash,
      verdict: store.scenes[0].frameReceipt?.verdict,
      width: store.scenes[0].frameReceipt?.width,
      height: store.scenes[0].frameReceipt?.height,
    };
  });
  expect(gateAfterRoundTrip).toEqual(gateBeforeRoundTrip);

  // Taşınmış/eski evidence'in görünür stale kapısı: kararı frame/approval makbuzlarını
  // sessizce yeniden bağlamadan değiştir; UI gerçek commandId farkını kapatmalı.
  await page.evaluate(() => {
    const store = (window as any).__mamilas;
    store.setState({ directorBrief: 'E2E karar değişti — eski receipt yeniden kullanılmaz.' });
  });
  await expect(authorPanel.getByText(/ONAY BAYAT/)).toBeVisible();
  await expect(framePanel.getByText(/Frame eski karara bağlı/)).toBeVisible();
  await expect(framePanel.getByText(/Motion kapalı — Current ajan prompt receipt yok veya prompt değişti/)).toBeVisible();
  await expect(authorPanel.getByRole('button', { name: 'Onayla' })).toBeDisabled();

  // Aynı metin bile yeni kararın prompt-source kimliğine yeniden bağlanmadan kullanılamaz.
  await authorPanel.getByPlaceholder(/Ajanın.*final image prompt/).fill(
    'A single translucent water droplet rises through a tactile educational world; clean plate, no text.',
  );
  await authorPanel.getByRole('button', { name: /Ajan prompt'unu geri al/ }).click();
  await expect(authorPanel.getByRole('button', { name: 'Onayla' })).toBeEnabled();
  await authorPanel.getByRole('button', { name: 'Onayla' }).click();
  await expect(authorPanel.getByText(/MAMİ ONAYLADI/)).toBeVisible();

  // Taşınabilir project pack ve stale-safe closeout Timeline export şeridinde.
  await expect(page.getByRole('button', { name: /Proje Paketi/ })).toBeVisible();
  await expect(page.getByText('⬆ Proje İçe Al')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kapanış Receipt' })).toBeVisible();

  // 9. 390px Viewport Overflow check.
  await page.setViewportSize({ width: 390, height: 800 });
  const mobileLayout = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>('*')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, className: element.className, left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
      })
      .filter((item) => item.left < -1 || item.right > viewport + 1)
      .slice(0, 12);
    return { documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, viewport, offenders };
  });
  expect(mobileLayout.documentWidth, JSON.stringify(mobileLayout.offenders)).toBeLessThanOrEqual(mobileLayout.viewport);
  expect(mobileLayout.bodyWidth, JSON.stringify(mobileLayout.offenders)).toBeLessThanOrEqual(mobileLayout.viewport);
});
