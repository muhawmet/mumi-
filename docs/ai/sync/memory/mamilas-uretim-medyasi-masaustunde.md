---
name: mamilas-uretim-medyasi-masaustunde
description: "Medyanın DÖRT yeri — kareler images/, eski kareler _ESKI/images/, plakalar elements/ rafına, klipler ve ses masaüstüne"
metadata: 
  node_type: memory
  type: project
  originSessionId: 86cafcb2-ec5a-4102-aba8-577ca2365eab
  modified: 2026-08-07T11:48:32.240Z
---

Mami, 2026-07-30: *"çalışma dosyası burada ama unutma üretime geçtiğimde masaüstündeyim hep,
videolarda gelince."* — ve 2026-08-07'de rutinin tamamını verdi: *"eski resimleri de arşivle
güzelce, yenilerini koyarsın; elementler element klasörüne; videolar masaüstündeki dosyaya."*

**DÖRT YER — tahmin edilmez, uygulanır:**

| Ne | Nereye |
|---|---|
| **Yeni kareler** | `agents/COMMAND-INBOX/<proje>/images/` — `1.png` … `N.png`, kare numarası = dosya adı |
| **Geçersiz kılınan eski kareler** | `agents/COMMAND-INBOX/<proje>/_ESKI/images/` — **silinmez, arşivlenir** |
| **Referans plakaları** | `agents/COMMAND-INBOX/elements/<ad>.png` — **ortak raf**, projeye değil sisteme ait |
| **Klipler ve ses** | `/Users/Muhammet/Desktop/6. Sınıf Animasyonlar/<sınıf>. Sınıf - <ad>/` — repo DIŞINDA |

🔴 **Masaüstü klasörü DÜZDÜR — alt klasör AÇILMAZ.** Ev düzeni ölçüldü (Hücre, Eşeyli):
klipler doğrudan proje klasörünün içinde `1.mp4` … `N.mp4` olarak durur, `klipler/` ya da
`ses/` alt klasörü YOKTUR. Mami'nin kuralı (2026-08-07): *"buraya açacaksın, kaçıncı sınıfsa
başlığa onu da yazarsın; EDIT BURADA, hazırlık her şey command-inbox'ta."* Yani masaüstü
klasörü Premiere'in çalışma alanıdır, repo ise metin ve kare hazırlığının yeri.

**Why:** klipler yüzlerce MB, repoya girerse git şişer ve iki cihaz senkronu çöker.
Element rafı proje klasöründe DEĞİL çünkü değeri tekrar kullanılabilirliğinde: bir öğe
videoda 3+ kez görünüyorsa element olur ve **sonraki videolarda bedava gelir** — mekân,
nesne, hayvan, karakter fark etmez (`rota.mjs` rafı oradan okur). Eski kareler silinmez
çünkü neyin neden reddedildiğinin tek kanıtı onlar.

**How to apply:**
- Proje sıfırdan yazıma açıldığında **önce** `images/` boşaltılır → `_ESKI/images/`.
  Yeni kare eskisinin üstüne yazılmaz; `kare-yakala.mjs` hedef doluysa zaten DURUR.
- Plaka gözle onaylandığı an rafa kopyalanır — onaydan önce değil.
- Klip yolu SORULMAZ, buradan varsayılır ama **var mı diye kontrol edilir**, tahmin edilmez.
  `node scripts/kaba-kurgu.mjs "<proje>" --klipler "~/Desktop/6. Sınıf Animasyonlar/<proje>/klipler"`
- ⚠ Klasör adı "6. Sınıf Animasyonlar" olsa da içine 5. sınıf projeleri de giriyor —
  ad yanıltıcı, konum doğru.
- Bkz. [[mamilas-kaba-kurgu-hatti]] · [[mamilas-generation-routine]] · [[mamilas-magnific-mcp-hatti]].
