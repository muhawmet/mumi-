# BRAIN M2 — GERÇEK A/B: image_author artifact'i (prop-laden vs physics-only)

**Tarih:** 2026-07-16 · **Rol:** Image Author (Claude, gerçek lifecycle role kartıyla —
`agents/roles/studio/image-author.md`) · **Kaynak:** aynı source/sahne-1, iki gerçek
`buildCommandJSON` çıktısının `image_author` world slice'ı (M2 SONRASI kod).

**Source (sahne-1 sceneBrief):** "Genç denizci güvertede tek başına durur, fırtına yaklaşır."
**Engine:** nano_banana_2 · **Cast:** yok · **onScreenText:** yok.

Command kimlikleri: one_piece_toei `mamilas-40a9…` · deakins_naturalist `mamilas-87dd…`
(scratchpad `m2-ab.ts` çıktısı — Node 26 + resolver shim, gerçek `buildCommandJSON`).

---

## A — one_piece_toei (prop-laden dünya, M2'nin hedefi)

**M2 ÖNCESİ renderPhysics şu cümleyi taşıyordu (set-emri konumunda):**
> "Invented fictional signage — wanted-poster paper, pennants, caravel-hybrid timber hull with
> carved figurehead — lives inside the frame as dressing…"

**M2 SONRASI:** bu cümle renderPhysics'te YOK; `vocabularyExamples` (yaratıcı referans — EMİR
değil) kanalında. Fizik cümleleri (line/cel/sky/horizon/anatomi/speed-line) VERBATIM korundu.

**Image Author final prompt (yeni renderPhysics'ten yazıldı):**

> 35mm-equivalent frog-eye camera from knee height, horizon line at 25% from frame bottom,
> steep receding perspective. Toei-style bold-cel production frame in the grand-voyage
> shonen-adventure lineage: character silhouette built with 4px uniform pure-black outline,
> zero taper, 2-value flat cel fill — saturated mid and deep-saturated marine shadow, never
> grey. Dominant element: a young sailor standing alone at the bow rail of a weathered ship
> deck, fists closed at his sides, jaw set, wind pressing his shirt flat against his chest.
> The sky is the emotional engine and occupies the top two-thirds of the frame: hand-brush-
> painted cumulus masses in cream-gold curdling into a cobalt-marine storm wall on the
> horizon, the last amber-orange flare of sun compressed to a thin band beneath it. The open
> sea reads deep teal-navy, whitecaps as dry-brush scratches. Environmental pressure: the
> first fat raindrops hit the deck planks as flat graphic dark spots; a loose rope-end lifts
> and snaps in the rising wind; spray mist drifts as rough dry-brush shapes past his boots.
> The sailor towers from the bottom third against the sky, visually enormous against the
> world. STRICT PURE 2D CEL SHADING — no 3D, no 2.5D, no subsurface gradient, no realistic
> anatomy proportion, no pastel or muted tone. No overlay text. AVOID: Luffy, Straw Hat,
> Jolly Roger, named franchise property, gradient fill, resort turquoise sea. Clean
> motion-ready start frame.

**Uygulanan:** render-lock fizik açılışı · dominant element (denizci+fırtına baskısı) ·
negative_lock + IP firewall · text yok → clean plate · palet dünyanın kendi fiziğinden.

**Sızıntı kontrolü (gözle):** prompt'ta wanted-poster / pennant / caravel / figurehead **YOK** —
sahne bunları istemedi, renderPhysics artık dayatmıyor. M2 öncesi aynı slice bu envanteri
render-yasası konumunda taşıyordu (One Piece karesine korsan gemisi + WANTED afişleri sızmıştı
— TASK-00 ölçümü). Guverte/halat sahnenin KENDİ source'undan geliyor ("güvertede"), dünya
envanterinden değil — fark tam olarak bu.

---

## B — deakins_naturalist (fizik-saf dünya, kontrol kolu)

**M2 SONRASI renderPhysics:** BİREBİR dokunulmamış — motivated-source cümlesi window/desk/lamp
kelimeleri geçmesine rağmen fizik-davranış imzasıyla (`light source`, `photon`, `motivated`)
fizikte kaldı. Boşaltma yok (test: `single motivated source` / `negative fill` /
`contrast ratio` / `grain` hepsi yerinde).

**Image Author final prompt:**

> Locked-off frame, 2.39:1 anamorphic, 50mm Master Anamorphic at f/5.6, deep focus.
> Photoreal cinematography in the Roger Deakins ASC BSC naturalist lineage — discipline of
> restraint. Dominant element: a young sailor standing alone on a wet ship deck, small in
> the frame — occupying 15% of frame height at the rail, composed against a vast storm sky
> that fills the upper two-thirds. Single motivated source: the last low sun breaking under
> the storm shelf behind camera-left, raking hard across the deck at near-horizontal angle;
> every photon traceable to it. Negative fill — the sailor's windward side holds detail in
> amber key, his leeward side falls to near-black, 6:1 contrast ratio; the darkness is the
> image. Wet deck planks return a single elongated specular streak of the low sun; rain has
> not arrived — the air carries pre-storm haze that softens only the far horizon. Fine
> organic ARRI Alexa 65 grain in the deep shadow of the superstructure; wide tonal latitude,
> highlights protected, no clipping hardness. Grade naturalistic: warm key, cool shadow,
> skin accurate to low-sun temperature, midtones never pushed to teal. No overlay text.
> AVOID: fill-flash flat lighting, handheld shake, Hollywood teal-orange grade, plastic AI
> glow skin, neon, fluorescent green. Clean motion-ready start frame.

**Sızıntı kontrolü:** kontrol kolunda değişim yok — fizik-saf law aynı davranışla taşındı.

---

## Hüküm (kod tarafı — kare hükmü Mami'nin)

- Prop-laden dünyada envanter cümlesi render-yasası konumundan çıktı; prompt'a set-emri
  olarak girmiyor. Sahne istemedikçe wanted-poster/caravel artık kareye itilmiyor.
- Ajan envanter kelime dağarcığını hâlâ görüyor (`vocabularyExamples`) — bir liman sahnesi
  yazarken ORADAN yaratıcı referans alabilir; fark: emir değil, seçenek.
  **⚠️ Sol denetimi (#1, KRİTİK — kapatıldı):** ilk halde bu iddia runtime'da yanlıştı —
  `vocabularyExamples` iki gerçek role-context builder'ına (`agentProtocol.ts` +
  `mamilas-command.mjs`) hiç girmiyordu; cümleler görünmez oluyordu. Fix: her iki builder'a
  alan eklendi + `worldPacketPhysics.test.ts` "görünmez kanal yasağı" testi kilitledi.
- Fizik-saf dünya (kontrol) byte-değişmedi; 46 dünyada renderPhysics benzersiz + >120 karakter.
- **Kare hükmü:** Mami bu iki prompt'u motora elle verip A/B karesine bakabilir (tek dış kapı).
