---
name: mamilas-seslendirme-tek-blok
description: "Seslendirme istendiğinde HER ZAMAN tek blok verilir — numarasız, etiketsiz, paragraf boşluklu; numaralı sürüm yalnız kurgu haritası içindir"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 86cafcb2-ec5a-4102-aba8-577ca2365eab
  modified: 2026-07-30T10:36:19.336Z
---

Mami, 2026-07-30: *"şu seslendirmeyi sadece tek bir metin olarak verir misin, hep bunu da al
hafızaya."*

**Kural:** VO metni istendiğinde çıktı **tek blok**tur. Numara YOK, etiket YOK, `#####` bölüm
başlığı YOK, madde YOK. Yalnız düz cümleler ve **paragraf boşlukları** — ElevenLabs v3
noktalama ve boş satırdan nefes alır, paragraf arası bölüm geçişidir.

Ayar notları (stability, telaffuz, süre) metnin **ALTINA** ayrı blokta gider ve
"bunları kopyalama" diye işaretlenir.

**Why:** Mami metni doğrudan ElevenLabs kutusuna yapıştırıyor. Numaralı sürüm okunurken
motor rakamları da okuyor ya da ton kayıyor; ayrıca 5000 karakter limiti var, etiketler yer
yiyor. Numaralı sürüm **yalnız** kurgu haritası (EDIT-PLAN) ve kare eşlemesi içindir,
teslim için değil.

**How to apply:**
- Teslim dosyası ikiye ayrılır: `<Ad>_SESLENDIRME.txt` (numaralı, kare eşlemeli, yönetmen için)
  ve `<Ad>_SESLENDIRME-TEK-BLOK.txt` (yapıştırılacak olan).
- Sohbette istendiğinde tek blok **doğrudan mesaja** basılır, dosya yolu vermekle yetinilmez.
- Karakter sayısı her seferinde ölçülür ve 5000 limitine göre söylenir.
- Bkz. [[mamilas-uretim-akisi]] ve [[mamilas-generation-routine]].
