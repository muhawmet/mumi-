---
name: mamilas-proje-enzimi-rutini
description: "Her yeni videoda _ENZIM.md açılır; Mami 'bunu kaydet' der, ajan yazar, 'bitti' deyince özümsenir"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3a570c66-5bb4-4fd7-95e0-2754582958c2
  modified: 2026-07-31T06:49:32.863Z
---

**Mami, 2026-07-31:** *"Bu enzim olayını da projeye başladığımız gibi açalım. Ben 'bunu kaydet
bunu kaydet' diyeyim, sen toparla hafızaya al. Projeye başladığımızda rutin olur, döküman
açarsın, içini doldururuz, 'bitti' derim, onu özümsersin."*

**Why:** Kararların çürüdüğü yer 861 satırlık yasa değil, **karar ile yazının arasındaki
mesafe.** Ölçüldü (2026-07-31): bir ders 29 Temmuz'da yazıldı, 30 Temmuz'da 54 klibin 54'ünde
tekrar etti — bilgi eksik değildi, karar anında önünde değildi. Emilen dersler ise hep bir
**ölçene** yazılanlardı. `_ENZIM.md` bunun insan tarafındaki karşılığı: kararın verildiği anda
yazılan, prompt yazılmadan önce açılan tek dosya. Bkz. [[mamilas-uc-katman-hukmu]].

**How to apply:**
- **Yeni video başlarken** `agents/COMMAND-INBOX/<Ad>/_ENZIM.md` açılır — `current-work.mjs
  baslat` ile aynı anda, sorulmadan. Boş açılır, dolduran konuşmadır.
- Mami *"bunu kaydet"* dediğinde **tek satır** eklenir, tarih + karar. Yorum yok, genelleme yok,
  yasa cümlesi yok — söylediği neyse o. Kısa tut; şişerse okunmaz hale gelir ve amacı ölür.
- **Her prompt turundan önce `_ENZIM.md` açılır.** Yasa değil, önce bu. Otuz satırdır, okunur.
- Mami *"bitti"* dediğinde özümseme: **ölçülebilir olan `prompt-lint`/kontrol katmanına gider**
  (orada tutar), ölçülemeyen proje arşivinde kalır. **Düzyazı olarak yasaya EKLEME** — bugüne
  kadar tekrar eden beş kusurun beşi de yasaya düzyazı yazılmıştı.
- `/mamilas-enzim` skill'i kilitleri kapatır (4 kilit); `_ENZIM.md` ise **o projenin canlı karar
  defteridir**. İkisi ayrı: biri açılışta bir kez, diğeri proje boyunca.
