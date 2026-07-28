# Nano Banana 2 — Kalite Runı Promptları

**Kaynak:** gerçek `worldPacket` (ajanın gördüğü temiz fizik alanları, prop'lar ayrılmış) +
Nano Banana Pro (Gemini 3 Pro Image) prompt yapısı: `[Özne+sıfat] [aksiyon] [mekân] →
[kamera] → [ışık] → [stil/medyum] → [negatif]`.

Konu: **insan öznesi + dünyaya uygun büyüleyici sahne.** Sen elle üreteceksin — bunlar
kopyala-yapıştır hazır. Türkçe ekran-yazısı kareye baked (diegetik).

---

## TEMPLATE (her dünya için doldur)

```
[ÖZNE — somut insan]: <yaş/duruş/kıyafet, tek cümle, dünyanın figür-gramerine göre>
doing [AKSIYON — tek yarım-saniye anı, dominant element]
in [MEKÂN — dünyaya uygun büyüleyici ortam].

CAMERA: <cameraEnvelope'tan tek vantaj + tek hareket>
LIGHT: <lightPhysics + paletteAsLight, ışık davranışı olarak>
STYLE: <renderPhysics'in ÖZÜ — 2-3 cümle, TEKRARSIZ>
ON-SCREEN TEXT (diegetik, Türkçe): <varsa kareye baked, yoksa "none">
NEGATIVE: <negativeLock'tan sadece bu kareye uygun olanlar>
```

Kural: STYLE bölümü render_law'ın **özü** — tam kopyası değil. Özne EN BAŞTA, somut.
Nano Banana özneyi kuralın içinde boğulmadan okumalı.

---

## 1 — ONE PIECE (Toei Bold-Cel) · "Deniz feneri bekçisi, fırtına öncesi"

```
A weathered Anatolian lighthouse keeper, broad-shouldered, thick canvas coat and rolled
sleeves, one oversized hand gripping the iron rail, planted at the top gallery of his
lighthouse, leaning INTO the wind as the first storm-gust hits — mouth just opening into a
shout toward the sea below.

CAMERA: frog-eye from below chest height, 28mm, tilted up so the horizon sits at the bottom
25% of frame and the keeper towers against the sky; one committed rising vantage that gains
his silhouette scale against the bright cloud plane.

LIGHT: hard 2-value cel — mid and shadow step with a crisp boundary, shadow tone deep-
saturated marine, never grey. Sky is the light engine: cream-gold cumulus flaring amber-
orange at the storm's edge overhead. Metal rail and lantern glass get one extra highlight
value step.

STYLE: Toei-style bold-cel production frame. Character built with uniform 4px pure-black
outline, zero taper — silhouette-first. Fill is 2-value flat cel: primary-marine shadow,
saturated warm mid. Hand-brush cumulus masses fill the top two-thirds; open sea reads deep
teal-navy below, never resort turquoise. Speed lines as dry-brush scratches. STRICT PURE 2D
CEL — no 3D, no gradient, no realistic anatomy.

ON-SCREEN TEXT (diegetik, Türkçe): weathered lighthouse plate reads "FENER" in bold display
letterform with drop shadow, part of the iron structure.

NEGATIVE: no Luffy or any One Piece character, no Jolly Roger, no gradient/airbrush fill,
no 3D or 2.5D, no realistic shading, no pastel, no English signage.
```

---

## 2 — RICK & MORTY (Adult-Swim Sci-Fi) · "Laboratuvar teknisyeni, portal karşısında"

```
A tired lab technician in a stained beige coat, noodle-limbed with a rounded oversized head,
tiny dot pupils and a single bead of sweat, standing deadpan and holding a clipboard, facing
a swirling hard-edged toxic-green portal iris that has just flickered open in the wall of a
cramped institutional lab.

CAMERA: flat TV-animation staging, ~40mm equivalent, conversational eye-level two-shot,
locked — the camera is a deadpan witness, background composited flat behind the character
plane. No bokeh, no DOF.

LIGHT: flat even TV cel lighting, single ambient fill. The ONLY luminous element is the
toxic portal-green glow, a flat hard-edged emissive shape casting a sickly pop across the
murky-olive room. Shadows are flat shape-shadows, never atmospheric.

STYLE: adult-swim wobble-line 2D cartoon. Thin 1-2px hand-inked outline that BOILS — shaky,
never clean vector. Economical noodle-limb anatomy, oversized rounded head. Flat 1-2 value
cel, institutional beige-tan and murky-olive palette punctuated by ONE radioactive portal-
green pop. Dense deadpan sci-fi gag machinery staged FLAT behind. No cinematic depth, no
painterly brushwork.

ON-SCREEN TEXT (diegetik, Türkçe): worn hand-lettered wall sign reads "DENEY ODASI" in
wobbling caps, part of the flat background plate.

NEGATIVE: no Rick or Morty or any franchise character, no portal-gun replica, no clean
vector line, no 3D or photoreal, no cinematic atmospheric depth, no warm-cozy grade, no
English signage.
```
```
