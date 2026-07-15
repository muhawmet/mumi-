# T6 — Yönetmen + QA Yerleşimi

**Dal:** feat/3d-diorama-shell · **Üst plan:** `~/.claude/plans/inherited-humming-petal.md` (Işıklı Atölye T0-T7)
**Tarih:** 2026-07-05 · **Model:** Opus 4.8 (beyin/uygulayıcı), yargı fazı ultracode workflow (paralel bağımsız denetçiler)
**Önceki:** T5 kapandı @ b6eefd2. Bu oturum HEAD: `69b57c4`.

## Amaç (üst plan T6 metni birebir)

- **Kapalı hâl:** yelpaze yerine masaya yatık düzenli kart dizisi (overlap/kesik başlık biter, +7 anlamlı "diğer yollar" kartına döner, boş 2/3 dolar).
- **Açık hâl:** state tek kopyaya iner (Decision Record kalır; chip tekrarı ve ray kopyası sadeleşir).
- **QA:** sol kolon ölü boşluğu dolar (konuşma geçmişi akışı; tüm sesler kartlaşır), sağ ray stage'e göre yaşar (statik alıntı + boş içerik yerine bağlamlı içerik).
- **Ek (envanter 7,8 kalanı, NİHAİ KAPANIŞ notu):** akvaryum toggle'ı 1280px'te header CTA'larını örtüyor → yerleşim fix.

## Mevcut durum (kod gerçeği, okundu)

- `src/pages/Director/DirectorStep.tsx` (521 satır): `if (!preset)` dalı `.ml-v3-fan-card` overlapping arc (marginLeft -60, rotateY, translateZ) + `+N` more kartı. Açık dalda **iki kez** aynı özet: "Canlı ince ayar" panelinin altındaki World/Palet/Ref DNA chip'leri (~351-362) VE sağ `.director-decision-rail` aside'ının World/Palette/Ref DNA bloğu (~500-515).
- `src/pages/QA/QAStep.tsx` (317 satır): grid `minmax(0,1fr) 310px`. Sol kolonda tek tek beliren tip kartları (auto-advance, `visibleIndex`) — az tip görünürken sol kolon boş kalır. Sağ aside: CABINET INDEX stat'ları + NOW SPEAKING + tam tip listesi (statik). Header'da kendi "Timeline'a Dön" CTA'sı.
- Akvaryum toggle: `AppLayout.tsx` `position:fixed; top:18; right:364` (menü açıkken). Dar ekranda step-içi header CTA'larıyla çakışabilir. `index.css` @820px'te top/right'ı 14 yapıyor ama 1280px aralığı korumasız.
- Tasarım sistemi: `tokens.css` (--gold*, --m2-*), `design_v3.css` (--v3-ice, cam/parşömen kabuk, `.ml-v3-panel-glass`, `.ml-v3-parchment`). `PanelKit` (Panel/Button/Field). Cam-içine-cam yasağı (V3 §3b): blur bütçesi bakış hattında 1.

## KORUNAN SÖZLEŞMELER (kırılırsa e2e/gate patlar)

1. **`Reçeteye geç` butonu** — beat-planner.spec:27, screenshots.spec:30, smoke.spec:34/112/228/256 `getByRole('button', {name:/Reçeteye geç/})`. İsim + rol DEĞİŞMEZ.
2. **`Reçeteye geç` disabled-when-not-ready** — smoke.spec:96 `toBeDisabled()`. (Not: mevcut Director butonunda bu gating YOK; smoke:96 muhtemelen Dashboard'da — davranışı bozma, doğrula.)
3. **vitest tabanı düşmez** (şu an gate koşulacak, sayı ölçülüp kilitlenecek). Test silmek YASAK.
4. **src/core dokunulmaz** — bu saf yerleşim işi; qa.ts/pure.ts/brain.ts değişmez.
5. Diğer e2e string'leri (SAHNE, Timeline, vs.) değişmez; `data-testid` (director-world, director-palette, director-ref-pack, director-project-class) korunur.
6. **frontend-design yasaları:** jenerik AI-slop yok; token disiplini (ham hex yerine --gold/--v3/--m2 var'ları); transform hit-target'ı oynatmaz (Playwright "element not stable" dersi); cam-içine-cam yok.

## İş paketleri

### Paket A — Director kapalı hâl (grid) — Task #2
- `.ml-v3-fan-card`/`.ml-v3-fan-more` arc'ı KALDIR. Yerine "masaya yatık düzenli kart dizisi": responsive grid (`repeat(auto-fill, minmax(240px,1fr))` ~2-3 sütun), hafif masa-yatıklığı (statik `rotateX`/perspective, hit-target sabit), kesik yok — başlık tam, thesis 2 satır clamp (`-webkit-line-clamp`, kesik "…" yerine düzgün).
- `+N` → anlamlı **"Diğer yollar / tüm arketipler"** kartı (kaç yol kaldığını + nereye götürdüğünü söyler, `setCurrentStep('dashboard')`).
- Boş 2/3 dolar: header + grid dikey ritmi sayfayı doldurur (min-height stage yerine grid akışı).
- CSS: `design_v3.css`'e `.ml-v3-deck` / `.ml-v3-deck-card` bloğu (fan-* sil). `pickPreset` mantığı aynen korunur.

### Paket B — Director açık hâl (dedup) — Task #3
- İki özet kopyasından BİRİ kalır. Karar: **sağ Decision Record rail asli özet olur** (sticky, path kararları + World/Palette/Ref). "Canlı ince ayar" panelindeki tekrar chip satırı (~351-362) KALDIRILIR — panel yalnızca DÜZENLEME kontrolü olur (select'ler + inline "seçildi" durumu değil, ray gösterir).
- Ray sadeleşir: chip tekrarı biter, tek net "aktif kilitler" bloğu. Decision Record başlığı + path kararları + 3 özet (World/Palette/Ref) — çift değil tek.
- `Reçeteye geç` / `Brief'e dön` / `Default'a dön` aynen kalır.

### Paket C — QA (sol akış + canlı ray + akvaryum fix) — Task #4
- **Sol:** "konuşma geçmişi akışı" — tüm sesler kartlaşır; az tip varken ölü boşluk bitmeli. Öneri: SESSION VERDICT bandı üstte kalır, altında sesler dikey akış; boşken/az-tip iskeleti (henüz konuşmamış sesler soluk "sırada" kartı) sol kolonu doldurur. Auto-advance + typewriter + AdvisorPortrait korunur.
- **Sağ ray stage'e göre yaşar:** statik yerine bağlamlı — NOW SPEAKING sesin GERÇEK evidence'ı/verdict özeti + geçiş/kanıt sayacı canlı. CABINET INDEX stat'ları kalır ama "boş içerik" hissi biter (ör. seçili sesin evidence'ı ray'de bağlamlı görünür).
- **Akvaryum/header fix:** 1280px civarında toggle ile step-header CTA çakışmasını çöz (index.css'e ~1100-1400px guard veya toggle'ı ray şeridine hizala). ÖLÇÜMLE doğrula (screenshot @1280).

### Paket D — Gate + yargı + kapanış — Task #5
1. `mamilas-gate`: `npx tsc --noEmit` 0 · `npx vitest run` yeşil (taban kilit) · `npm run build` · `.command×2` syntax.
2. Screenshot: `npm run dev` + `node scripts/design-tour-shots.mjs` (veya T6 için yeni tur) → Director-kapalı/açık + QA + @1280 kareleri.
3. **ultracode Workflow:** paralel bağımsız buyer's-eye yargıçlar (Director-kapalı / Director-açık / QA holistik) + 1 adversarial correctness/e2e-contract verifier (diff okur, `Reçeteye geç`+data-testid+string'leri doğrular). Confirmed bulgular sentezlenir.
4. Fix döngüsü → re-gate → re-judge, hedef **ONAYLA (≥8.5)**.
5. Commit (spesifik dosyalar, `-A` yok) + `mamilas-checkpoint`.

## Doğrulama / kabul

- Gate yeşil, e2e "yeni kırık yok" (bilinen baseline kırıkları sabit).
- Kapalı hâlde 0 kesik başlık, +N anlamlı; açık hâlde tek özet kopyası; QA sol dolu + ray canlı; @1280 toggle çakışması yok.
- Yargı ONAYLA; kanıt kareleri `reports/t6-*`.

## Kapsam dışı (sıra memory'de)
Preset/director bug ailesi (6 e2e), decode engine, production export, FAZ5 pilot. ASIL HEDEF pilottan sonra.

## KAPANIŞ KAYDI (2026-07-05)

**T6 BİTTİ.** Dört yerleşim dosyası: `DirectorStep.tsx` · `QAStep.tsx` · `design_v3.css` · `index.css`. Kanıt: `reports/t6/*.jpg` (script `scripts/t6-shots.mjs`).

- **Paket A (Director kapalı):** overlapping fan (`.ml-v3-fan-*`) söküldü → `.ml-v3-deck` auto-fill `minmax(208px,1fr)` düzenli dizi. Deck container-genişliğine yanıt verir: 1600→3-kolon (778px), 1280→2-kolon (458px), <~430px→1-kolon. CTA üstü hairline ayraç boşluğu doldurur; 8 arketip tam başlık + `directorPanel.eyebrow` rol kicker; `+N` stub yerine "SERBEST YOL / Kendi brief'inle başla" kartı (`setCurrentStep('dashboard')`).
- **Paket B (Director açık):** "Canlı ince ayar" altındaki World/Palet/Ref chip tekrarı kaldırıldı; özet TEK kopya sağ DECISION RECORD'da. Record etiket+seçim özeti (verbatim `row.desc` kaldırıldı → sol panelin tekrarı yok).
- **Paket C (QA):** tüm sesler kartlaştı — konuşan tam kart (portre+typewriter+evidence), sırada bekleyen soluk monogram-glyph kartı (`sırada — söz bekliyor`), sol ölü boşluk doldu. Sağ ray canlı: NOW SPEAKING gerçek evidence + seviye + PASS/FIX. `activeCardRef` scroll (reduced-motion saygılı). 1280 ezilmesi: `.qa-cabinet-body` ≤1340px'te rail'i alta indirir (`.qa-dialogue`/`.qa-rail` sınıfları).
- **GATE:** tsc 0 · vitest 498/498 · build ✓ · `.command`×2 ✓. e2e: 14 geç / 1 kırık — bu kırık (`smoke:249 Reference DNA` ref-avoidance içeriği) baseline @69b57c4'te de AYNEN kırık (stash ile kanıtlandı), T6 regresyonu DEĞİL; Creative Arsenal kuyruğunda.
- **YARGI (ultracode workflow, 2 tur, bağımsız buyer's-eye + adversarial verifier):** Tur1 QA 8.6 ONAYLA / Director-kapalı 8.0 / açık 8.0 / holistik 8.3 ŞARTLI; verifier `contractsSafe=true` (Reçeteye geç + 4 data-testid + src/core dokunulmadı + test silinmedi + fan artığı yok + spoiler yok). Fix dalgası (kart tightening+ayraç, Decision Record özet, monogram glyph, reduced-motion, minmax 208). Tur2 Director-açık 8.7 + holistik 8.7 ONAYLA; Director-kapalı 8.2 tek koşulu (1280 1-kolon) minmax 208 ile empirik kapandı (458px'te 2-kolon ölçüldü+screenshot).
- **KAPSAM DIŞI (adjudicate, T6'da değiştirilmedi):** PreviewStage/LIVE CANVAS rail REF DNA/CAM/LIGHT/STAGE metin-kesmesi (kalıcı shell rail'i tüm adımlarda, kart rail'den geniş taşıyor — AppLayout rail-boyutlama işi, ayrı seans); world/ref adının kalıcı HUD rail'inde tekrarı (bilinçli cross-step bağlam); QA içses kimlik renkleri (onaylı Disco cabinet kimliği). 3 yargıç da bunları kapsam-dışı NOT etti, puan düşürmedi.
- **SIRADA:** T7 (kapanış + main merge) veya FAZ5 pilot (Mami kararı; Pazartesi 2026-07-06 video günü).
