---
name: mamilas-lint-rol-koru
description: "prompt-lint kelimeyi görüyor, ROLÜNÜ görmüyor — Üreme'de 50 karede 19 yanlış alarm, 7 tuzak hitinin 7'si de sahte"
metadata: 
  node_type: memory
  type: project
  originSessionId: d50143b4-0c97-40b6-b609-8acc36b519c7
  modified: 2026-07-29T09:08:23.814Z
---

`scripts/prompt-lint.mjs` bir kelimenin **hangi rolde** geçtiğini sormuyor. Ölçüldü
(2026-07-29, aktif Üreme projesi, 50 kare, `--register=edu`): **19/50 kare "eksikli"** çıktı,
ve elle okununca **hepsi yanlış alarm**:

- `bloom` ×3 (K44/K49/K50) — gerçek metin: *"a garden rose in full open bloom"*,
  *"the opened rose bloom in the glass"*. Sahnede **gerçekten gül var**. Tuzak kuralı
  kavram ışığına "bloom" denmesine karşıydı (NB2 glow'u çiçek çiziyor), çiçeğin kendisine değil.
- `sheen` ×5 — bakteri (*"faint pearly sheen"*), solucan (*"moist sheen"*), çilek kabuğu
  (*"wet sheen"*), yağlı ahşap (*"oiled satin sheen"*), grafit. **Hiçbiri insan cildi değil.**
  Tuzak kuralı plastik CİLDE karşıydı.
- "ten kilidi YOK" ×~15 — K19/20/22/23/24/26/31/41/42'de **insan yok** (hidra, denizanası,
  maya, deniz yıldızı, solucan, kertenkele, çilek, yavru kediler). İnsansız karede insan
  kilidi aranıyor.

**Why:** Yanlış alarm oranı yüksek bir kapı okunmaz hale gelir; okunmayan kapı gerçek kusuru
da yakalayamaz. Bileşke'nin 7 çiçek-glow'unu geçiren mekanizma tam budur — kapı vardı, güveni
yoktu. Sınıfı tanı: **yeşil/kırmızı bir sinyal, yetenek kanıtı değildir** — kapının kendisi
ölçülmedikçe kaç kusur geçirdiği bilinmez. (Aynı sınıfın İNŞA turu ölçümleri `archive/`de.)

**How to apply:** Tuzak kelime kuralı **bağlam koşullu** yazılır, kelime eşleşmesi değil —
`sheen` yalnız cilt/ten bağlamında (skin, cilt, face, hand) ateşler; `bloom` yalnız glow/ışık
bağlamında ateşler, gerçek çiçek tarifinde susar. "Ten kilidi" yalnız karede insan `@handle`
varken zorunludur. Lint çıktısı düzeltilmeden **prompt'a dokunma** — 2026-07-29'da Üreme'nin
50 karesi bu yüzden hatalı "onarılacaktı", elle okuma kurtardı. Kural: lint kırmızı derse
önce **gerçek satırı oku**, sonra hüküm ver ([[mamilas-bul-sec-onar]]).
