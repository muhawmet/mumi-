# M3 — Gerçek akış kanıtı: kesintisiz tam paket + şeffaf yorum + Mami revizyon hattı

**Tarih:** 2026-07-16 · **Koşum:** Node 26 + resolver shim (tsx kırık) · scratchpad `m3-flow.ts` / `m3-package.ts` / `m3-run/`
Scratchpad kalıcı değildir; çıktının aslı bu dosyadadır.

> **Sol KRİTİK #1 karşılığı (aynı gün kapatıldı):** Aşağıdaki §0, ilk turdaki elle-mühürlü paketin
> yerine geçen **gerçek runner zinciridir** — `scripts/mamilas-command.mjs` CLI'sıyla, runner'ın kendi
> `--seal-artifact` mühürü ve `validateArtifactChain`/`expectedInputs` doğrulamasıyla sürüldü.
> §3-4'teki elle-mühürlü ilk tur artık yalnız prompt-içeriği kanıtıdır, zincir kanıtı DEĞİLDİR.

## 0. GERÇEK RUNNER ZİNCİRİ (mamilas-command.mjs CLI, uçtan uca)

Command dosyası gerçek `buildCommandJSON` çıktısı olarak diske yazıldı
(`m3_mamilas_command.json`, commandId `mamilas-ce4a0f77…` — workbench'le byte-aynı: determinizm).

| Adım | CLI | Sonuç |
|---|---|---|
| Storyboard onayı | `--approve-storyboard --scene 1` | `STORYBOARD_APPROVED`, approvalHash `54be4b30…` |
| Sıradaki rol | `--scene 1` | `RUN_ROLE image_author r0` + CONTEXT (9821 B, `containsSiteGeneratedPrompt: false`) |
| Author r0 | draft → `--seal-artifact` → `.mamilas/artifacts/1-image_author-r0.json` | contentHash `d03ccced…`; `inputArtifactHashes=[contextHash1]`; **interpretation'lı** — runner kabul etti |
| Sıradaki rol | `--scene 1` | `RUN_ROLE image_jury r0` |
| Jury r0 | REJECT (`failingCheck`: kompozisyon ilişkisi zayıf + `targetedFix`) | contentHash `38489f39…` |
| Sıradaki rol | `--scene 1` | **`RUN_ROLE image_author r1`** — tek-revizyon hattı runner'dan açıldı |
| Author r1 | jürinin fix'i uygulanmış prompt + güncellenmiş interpretation; `inputArtifactHashes=[ctx, author0, jury0]` | contentHash `a95e7a78…` — runner kabul etti |
| Jury r1 | PASS (3 evidence) | contentHash `2449b96f…` |
| Sıradaki rol | `--scene 1` | **`AWAIT_FRAME`** — prompt PASS ≠ frame PASS; kare Mami'nin |
| Mami düzeltmesi | `--add-directive-file mami-fix.txt --scope SCENE --scene 2` | `DIRECTIVE_ADDED`; directive `live-eb9f4cf7e73fcb5e` AYNEN; **yeni commandId `mamilas-feaf5683…`** türedi, approvals sıfırlandı → eski artifact'ler doğal stale |

Zincirin kanıtladıkları: (a) interpretation receipt'i gerçek runner doğrulamasından geçiyor ve
eksikse reddediliyor; (b) akışta onay kapısı YOK — author→jury→(REJECT ise r1)→AWAIT_FRAME;
(c) Mami'nin doğal-dil düzeltmesi canonical yoldan giriyor ve karar kimliğini değiştiriyor.

## Zincir (hepsi gerçek kod, fixture değil)

Gerçek Türkçe source (3 beat, fırtına/denizci) → `generateBatch` → gerçek `buildCommandJSON` →
`buildImageAuthorContext` sahne slice'ları → Claude image_author rolünde **tam paket kesintisiz** →
Mami LIVE_CHAT düzeltmesi → revision-1.

- **commandId:** `mamilas-ce4a0f77f13ae060733c1945511e84c9f31796d2b93cd209356e80a9c0bec20a`
- **storyboardHash:** `b6d330ca46f902cb4c8e2effcfc3af65bb4118e5dba1d7b9e7565409988d09ba`
- Site direktifi (directorBrief → MamiDirective `site-directive-001`, AYNEN):
  *"Fırtına sahnelerinde denizcinin yüzü hep okunur kalsın; kaos gövde diliyle anlatılsın."*

## 1. Dürüst adlandırma — gerçek çıktı

`generateBatch` sahne architecture'ı artık:

```json
{
  "exactSourceBeat": "Genç denizci güvertede tek başına durur, tuz kokusu ve rüzgar yüzüne çarpar.",
  "semanticInterpretationStatus": "AGENT_AUTHORED"
}
```

`dominantSubject`/`event` kopya-yalan alanları architecture'dan kalktı; verbatim beat dürüst adla
taşınıyor (SOURCE_BOUND yolda üç sahne de birebir doğrulandı — `interpretationReceipt.test.ts`).

## 2. Şema turnusolu — gerçek command hash'leriyle

- `interpretation`'sız image_author artifact'i → `verify.ok=false`,
  problem: `interpretation receipt eksik — dominantSubject/singleEvent/frozenInstant üçü de zorunlu`
- Receipt'li aynı artifact → `verify.ok=true`, problem yok.
- Aynı yasa runner'da (`scripts/mamilas-command.mjs` `validateRoleContent`) — iki yüzey tek yasa.

## 3. Kesintisiz tam paket — 3 sahne, her prompt'un yanında görünür yorum

Üç artifact da `verify: true` mühürlendi (r0). **Akış hiçbir yerde durmadı**:
`nextLifecycleAction([author_r0])` → `{"kind":"RUN_ROLE","role":"image_jury","revision":0}` —
araya AWAIT/onay fazı girmedi (Mami revizyonu: onay bürokrasisi YOK).

| Sahne | interpretation (özne · olay · donmuş an) |
|---|---|
| 1 | the young sailor alone at the deck rail · leans into the salt wind, steadying against the rail · half a second before he narrows his eyes at something on the horizon |
| 2 | a black storm wall swallowing the horizon · the storm front visibly grows while deck timbers strain · the moment the first cloud shadow touches the bow |
| 3 | the captain's hands on wet rope lunging for the helm · soaked rope slips through his gripping palm · half a second before his palm clamps down hard enough to burn |

Prompt'lar role kartının FRAME-BUILD sırasıyla yazıldı (özne+eylem+yer → kompozisyon ilişkisi →
kamera+motivasyonlu ışık → dar frame-korumaları); `[DIRECTOR TASK]`/TODO/hex yok; paletteAsLight
fiziksel ışık olarak işlendi; M2 ayrımı görünür (sahne 2: cel-çizgili gemi vs outline'sız boyalı
fırtına duvarı — prop envanteri emir olarak girmedi).

### Sahne 1 prompt (r0, verbatim)

> 35mm eye-level medium-wide three-quarter view from the deck planks. A young sailor stands alone at the wooden rail of a ship deck, gripping it with one hand, body leaning into a hard salt wind that whips his hair and open collar toward the stern. His face stays fully readable — jaw set, eyes open against the gust — while the wind chaos lives in his clothes and hair. Toei-style bold-cel production frame: 4px uniform pure-black outline around the figure, no taper; fill is 2-value flat cel — saturated mid tones and deep marine-blue cel shadow, never grey. Behind him the sky is hand-brush-painted cumulus masses in cream-white, stacked huge over a hard horizon line; the deck planks run in strong one-point perspective toward the bow. Light: high sun slightly behind camera; shadows read as deep cool blue, midtones vivid warm amber, highlights near-white warm ivory on the cloud tops and the rail's worn edge. No on-screen text. Negative: no grey fill, no gradient shading on the figure, no photoreal skin, no motion blur. Clean motion-ready start frame.

### Sahne 3 prompt (r0, verbatim) — site direktifi uygulanmış hali

> 85mm eye-level close view: the captain caught mid-lunge toward the ship's wheel, upper body and both hands dominant in frame, the helm's spokes readable just beyond his reach. A soaked rope runs through his near hand, mid-slip — water squeezing out between his fingers in fat cel droplets. His face stays clear and determined at frame edge; the panic lives entirely in the hands and the slipping rope. Toei-style bold-cel frame: 4px uniform pure-black outline, 2-value flat cel fill — vivid warm-amber key side, deep marine-blue cel shadow side, never grey. Rain-dark deck boards behind him blur into painted texture; the rope fibers and the wheel's worn wood grain carry the only fine detail. Light: storm-dim sky, so the midtones read muted warm amber and every shadow reads deep cool blue; highlights are near-white ivory only on the wet rope and the splash beads. No on-screen text. Negative: no grey fill, no motion blur, no photoreal water, no extra crew in frame. Clean motion-ready start frame.

## 4. Mami revizyon hattı — doğal dil → MamiDirective → revision-1, kaynak receipt'te

Simüle edilen Mami düzeltmesi (sahne 2 karesine bakınca söyleyeceği cümle):

> "Renderı tam alamamışsın — fırtına duvarı küçük kalmış; duvar kadrajın üst üçte ikisini yutsun,
> gölgesi pruvayı geçsin."

- LIVE_CHAT MamiDirective: `live-eb9f4cf7e73fcb5e` (deterministik id, `liveDirectiveId`).
- Revision-1 artifact `verify: true`; `directiveReceipts`'te **iki kaynak da AYNEN görünür**
  (site-directive-001 + live-eb9f4cf7e73fcb5e, ikisi de APPLIED).
- Yorum receipt'i de revize edildi: *"a black storm wall devouring two thirds of the sky …
  the instant the last band of sunlight is pinched to a sliver on the planks."*
- Prompt farkı: "rising off the horizon" → "devouring the upper two thirds of the frame";
  "shadow just reaching the bow rail" → "shadow already past the bow, crawling up the foredeck planks".

### Sahne 2 prompt (r1, verbatim — Mami motora elle taşır)

> 50mm eye-level medium view from mid-deck toward the bow, the ship's rail and foreground planks framing the lower third as deliberate negative space. Dominant element: a colossal black-green storm wall devouring the upper two thirds of the frame, hand-brush-painted cumulonimbus stacked like a cliff, its leading shadow already past the bow, crawling up the foredeck planks. Toei-style bold-cel frame: deck and rigging hold 3-5px uniform pure-black outlines and 2-value flat cel fill; the storm wall alone is painted — layered brush texture, no outlines — so the threat reads as weather, not as a drawn object. Deck timbers bow subtly along their grain lines where the strain concentrates. Light: sunlight collapsing to a narrow warm-amber band on the foreground planks; everything under the cloud shadow reads deep cool blue; one vivid warm-red accent lives only on a signal pennant's real surface. No on-screen text. Negative: no figures in frame, no grey fill, no lightning yet, no photoreal water simulation. Clean motion-ready start frame.

## Kare hükmü

Prompt'lar motora elle verilebilir; **görsel PASS yalnız Mami'nin gerçek kare verdict'iyle olur.**
Bu dosya akışın (kesintisiz paket + şeffaf yorum + müdahale hattı) çalıştığının kanıtıdır, kare
kalitesinin değil.
