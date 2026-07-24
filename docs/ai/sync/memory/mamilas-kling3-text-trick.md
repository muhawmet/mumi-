---
name: mamilas-kling3-text-trick
description: "Kling 3.0 i2v'de baked-in yazıyı bozmadan tutma tricki (Mami'nin üretim dersi)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 870a98de-1baf-494d-9c3c-3086909cf1c1
  modified: 2026-07-24T14:05:39.377Z
---

Kling 3.0 i2v'de karedeki (baked-in) yazı, kamera onu **dönüştürmek zorunda kaldığında** bozulur:
push-in / forward dolly / zoom yazının ölçeğini-perspektifini değiştirir → Kling yazıyı **baştan
yaratır** → harfler morph olur. Mami'nin sözü: "kamera ileri giderse ama sen 'yazıyı koru' dersen
orada da baştan yaratıyor yazıyı." "NEGATIVE: don't warp text" satırı bu çelişkiyi TEK BAŞINA
durduramaz.

**Why:** sorun kamera hareketi değil, yazıyı yeniden-render'a zorlayan **dönüşüm**. Çelişkili emir
("push in + keep text") = regeneration = warp.

**How to apply (yazı taşıyan karelerde):**
- Yazıyı dönüştürecek kamera hareketi YAZMA (push-in / zoom / yazının üstünden geçen dolly yok).
- Yazının kadrajdaki ölçeği-konumu **sabit** kalsın; motion'ı yazıdan UZAK izole bir öğede tut
  ("only X moves, the caption region is untouched").
- "yazıyı yeniden yaratmaya fırsat verme" → temiz, net negatif o zaman tutar.
- Kamera kilidi ŞART DEĞİL: yazıyı rescale etmeyen küçük/lateral hareket olabilir; yasak olan
  transform. Yazısız karelerde kamera tam özgür (push/arc/dolly serbest).
- Alternatif (en sağlam, gerekirse): yazısız temiz plate + title-in-post overlay.

Bağlam: 5. Sınıf Kuvvet videosu Intro üretiminde ilk 15 motion'da yazılar bozuldu; sebep bende
JSON kamera ipuçlarını (push/dolly) yazı-ağır karelere de kopyalamamdı. [[mamilas-bul-sec-onar]]
· [[project-mamilas-nano-banana-kalite-2026-07-24]]
