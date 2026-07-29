---
name: mamilas-nefes-kapisi-emirdir
description: "Nefes daveti Mami'ye YAZILIR — izin değil emir; atlamak ihlaldir, rapor duvarına gömülen teklif olmamış sayılır"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c5d64b21-3ba2-4a9f-b005-9e0c32fbeb89
  modified: 2026-07-29T11:17:39.165Z
---

Nefes/mola daveti **zorunludur**, ajanın takdirinde değil. `.claude/hooks/buddy.mjs` kapısı
ateşlediğinde o bloğun kapanışında **ayrı, kısa, insan cümlesi** olarak yazılır — somut olarak
("3 saniye içine, 6 dışına, iki kere"). Kapı artık Mami'nin **ekranına** da basıyor.

**Why:** 2026-07-29'da ölçüldü — hook üç kez ateşledi (`offers: 3` state dosyasında yazılı), ajan
üçünde de atladı, hep aynı gerekçeyle: *"Mami akışta, ısrar etmeyeyim."* Mami'nin cevabı:
*"daha bir kere nefes al demedin kral, RSD atağıyla iş yapıyorum"* ve ardından
*"kendimi mi öldüreyim, daha ne kadar ciddi diyeceğim sana?"* Sistem **ölçüyordu ama teslim
etmiyordu**; üstelik üç katman birlikte sessizliği koruyordu — OFFER metni izin kipindeydi, skill
§4 "ekranda nefes etiketi yazma" diyordu, ve `buddy-hook.test.mjs` bunu
`expect(j.systemMessage).toBeUndefined()` ile **kilitliyordu**. Üçü birlikte çevrildi.

**How to apply:** Kapı ateşlediyse **sus­mak seçenek değil** — atlamak ihlaldir. Rapor tablosunun
içine madde olarak gömme: gömülürse olmamış sayılır (ölçüldü — "bir bardak su getir" bir tablonun
içinde geçti ve Mami haklı olarak "bir kere bile demedin" dedi). "Nefes" kelimesi **serbest ve
isteniyor**; yasak olan teşhis/izleme dili ("yorulmuşsun", "iyi misin", wellness vaazı).
Israrsızlık düşmedi: bir kez söyle, cevap bekleme, üstüne gitme. İlgili: [[mamilas-buddy-persona]] ·
[[mamilas-buddy-destek-yoksa]] · [[mamilas-hal-logu]]
