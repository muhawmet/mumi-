---
name: mamilas-uretim-medyasi-masaustunde
description: "Klip ve video medyası repo'da DEĞİL, masaüstünde yaşar — ~/Desktop/6. Sınıf Animasyonlar/<proje>; kaba-kurgu ve motion-qc oraya bakar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 86cafcb2-ec5a-4102-aba8-577ca2365eab
  modified: 2026-07-30T10:33:11.614Z
---

Mami, 2026-07-30: *"çalışma dosyası burada ama unutma üretime geçtiğimde masaüstündeyim hep,
videolarda gelince."*

**Kural:** repo `agents/COMMAND-INBOX/<proje>/` yalnız **metin kitini** taşır (prompt, revize,
motion, seslendirme, suno) ve **kareleri** (`Resimler/`). Üretilen **klipler ve videolar
masaüstünde** yaşar:

```
~/Desktop/6. Sınıf Animasyonlar/<proje adı>/
```

Aktif örnek: `~/Desktop/6. Sınıf Animasyonlar/5. Sınıf - Birlikte Daha Güçlüyüz`
(klasör adı 6. Sınıf Animasyonlar olsa da içine 5. sınıf projeleri de giriyor — ad yanıltıcı,
konum doğru.)

**Why:** klipler yüzlerce MB; repo'ya girerse git şişer ve iki cihaz senkronu çöker. Mami
üretim sırasında zaten masaüstünde çalışıyor, medyayı oraya indiriyor.

**How to apply:**
- Klip yolu SORULMAZ, buradan varsayılır — ama var mı diye **kontrol edilir**, tahmin edilmez.
- `node scripts/kaba-kurgu.mjs "<proje>" --klipler "~/Desktop/6. Sınıf Animasyonlar/<proje>"`
- `node scripts/motion-qc.mjs <klip>` da aynı köke bakar.
- Kareler (`.png`) repo içinde `Resimler/`de kalır; klipler (`.mp4`) masaüstünde.
  Bkz. [[mamilas-kaba-kurgu-hatti]] ve [[mamilas-generation-routine]].
