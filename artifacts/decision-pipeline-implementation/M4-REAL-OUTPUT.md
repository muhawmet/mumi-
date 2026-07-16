# M4 — Gerçek çıktı: dünya/engine-aware promptQuality kontratı + Mami override

**Tarih:** 2026-07-16 · Koşum: gerçek `buildCommandJSON` + `scripts/mamilas-command.mjs` CLI (scratchpad `m4-run/`)

## 1. Kontrat gerçek context'te

Aynı karar (commandId `mamilas-ce4a0f77…` — M3 ile byte-aynı: kontrat karar kimliğine girmez, doğru)
ama **contextHash değişti** (`72fc785e…` → `6a0943ef…`): kontrat sealed context'in parçası; M3
workspace'i doğal stale oldu. `one_piece_toei` + `nano_banana_2` için gerçek context:

- `requiredEvidence`: 8 (3 çekirdek + detay üçlüsü + self-contained + half-a-second-before +
  **2D-medium law** + **numeric lens/f-stop**)
- `rejectIf`: 7 (4 çekirdek + banned empties + palet-liste-duotone + stil-sıfatı/franchise-adı)
- `suppressed`: [] (override yokken boş; kontrat deterministik — test kilitli)

Tek kanon: `agents/promptQuality.mined.json` — TS (`agentProtocol.ts`) ve runner
(`mamilas-command.mjs`) aynı dosyadan okur; ayna kopya yok; drift sceneContextHash kapısında kırmızı
(commandRuntime testleri iki tarafın hash'ini karşılaştırıyor — 1925/1925 geçti).

## 2. Yeni kontrata göre gerçek image_author artifact'i (runner kabul etti)

contentHash `08bc71b0…`, runner sonrası adım `image_jury r0`. Prompt (verbatim):

> Locked 35mm at deck eye level, f/8 deep focus, medium-wide three-quarter view from the planks. A young sailor stands alone at the wooden rail of a ship deck at open sea, gripping the rail with one hand, body leaning into a hard salt wind. Environmental pressure: the wind flattens his open collar against his neck and drives spray-damp streaks across the deck grain. Micro-action: his knuckles whiten slightly on the rail as a gust lands. Optical event: spindrift catches the high sun behind camera and reads as bright grains against the dark hull shadow. Medium split: the sailor is a flat-cel figure — 4px uniform pure-black outline, two-value cel fill, saturated mid and deep marine-blue cel shadow, never grey — while the sky behind him is hand-brush-painted cumulus in cream-white and the sea is painted texture; the gap between cel figure and painted world is the style. Palette regime: poster-primary saturation with a cool-shadow warm-mid bias — shadows lean deep cool blue, midtones vivid warm amber, highlights near-white warm ivory; accents live only on real surfaces. Continuity from zero: dry canvas shirt with rolled sleeves just starting to dampen at the cuffs, no cargo on deck, clear weather with the storm not yet visible, no other crew in frame. No on-screen text. Negative: no grey fill, no gradient shading on the figure, no photoreal skin, no motion blur. Clean motion-ready still, half a second before he narrows his eyes at the first dark line rising on the horizon.

Kontrat maddeleri prompt'ta ölçülebilir: sayısal lens erken (`Locked 35mm … f/8`) · detay üçlüsü
(çevresel baskı=yaka/spray, mikro-aksiyon=beyazlayan eklemler, optik olay=spindrift-backlight) ·
2D-medium split açık · palet REJİM olarak (kapalı liste değil) · continuity sıfırdan · half-a-second
kapanışı · sıfır banned-empty.

## 3. Mami override → AJAN muhakemesi + `overridePolicy` (ürün yasası #5 — Sol kritik sonrası final tasarım)

**Revizyon geçmişi:** İlk tasarım keyword-imzayla (`overrideKeys`) direktiften maddeyi otomatik
suppress ediyordu. Sol kritik: kod polarite bilemez — *"yarım saniye önce patlama olsun"* maddeyi
İSTEYEN bir direktiftir ama keyword eşlemesi onu KAPATIR (ters anlam). **Suppression koddan tamamen
çıkarıldı**; kontrat artık `overridePolicy` taşır:

> "Mined clauses are engine-aware defaults, never universal locks. If an APPLIED Mami directive
> explicitly conflicts with a clause, the directive wins: the Author sets the clause aside and names
> it under suppressedContext; the Jury must not enforce a clause that an APPLIED directive explicitly
> contradicts. Suppression is reasoning, done by the agent, visible in the receipt — never inferred
> by code from directive keywords."

Yani: çatışma HÜKMÜ ajanın (niyeti okuyabilen tek katman), görünürlük artifact receipt'inde
(`suppressedContext` + `directiveReceipts`), jüri suppression'ın arkasında gerçekten çatışan bir
direktif olduğunu ayrıca denetler (dayanaksız suppression = exact failing check). Gerçek context
`overridePolicy`yi taşıyor (doğrulandı). `--add-directive-file` yolu değişmedi — directive AYNEN
girer, yeni commandId türer; kod artık ondan kontrat maddesi düşürmez.

## Kare hükmü

Prompt motora elle verilebilir; 2D-plastik fix'in kare üzerinde çalıştığı hükmü **Mami'nin gerçek
kare verdict'iyle** verilir. **Mami göz bekliyor.**
