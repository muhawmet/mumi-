---
name: mamilas-imagegen
description: MAMILAS için yeni raster görsel, dünya önizlemesi, konsept kare, kapak veya mevcut görsel düzenlemesi istendiğinde kullan. Yerleşik imagegen aracını proje sözleşmesi ve MAMILAS görsel yasalarıyla çalıştırır.
---

# MAMILAS Imagegen

Önce `AGENTS.md` ve `docs/ai/PROJECT_CONTRACT.md` dosyalarını oku. İstenen dünya,
referans veya palet varsa gerçek değerleri `src/core/SURGERY_DATA.json` ve ilgili kod
yolundan al; hafızadan uydurma.

## Akış

1. İsteği yeni üretim mi, mevcut görsel düzenlemesi mi diye sınıflandır.
2. Yerel hedef veya referans görsel varsa önce görsel olarak incele.
3. Kullanıcının brief'ini koruyarak motor-hazır kısa bir görsel spesifikasyonuna çevir.
4. Ham hex'i fiziksel ışık diline çevir; korumalı IP/marka sızıntısını engelle.
5. Varsayılan olarak yerleşik `imagegen` aracını kullan. API anahtarı isteme.
6. Çıktıyı konu, kompozisyon, metin doğruluğu, dünya kimliği ve yasaklar açısından
   görsel olarak denetle. Gerekirse tek hedefli bir düzeltme turu yap.
7. Proje varlığıysa seçilen finali `artifacts/imagegen/<slug>/` altına kopyala ve
   kullanılan final prompt'u aynı klasörde `prompt.md` olarak sakla.

## Kilitler

- Kullanıcının istemediği karakter, nesne, marka, slogan veya metin ekleme.
- Metin varsa birebir yazımı tırnak içinde belirt; yanlış üretilirse PASS verme.
- Düzenlemede değişmeyecek yüz, poz, kompozisyon, ürün ve metni her turda yeniden kilitle.
- Kaynak görseli kullanıcı açıkça istemedikçe üzerine yazma; sürümlü kardeş dosya üret.
- Projede kullanılacak finali yalnızca global Codex görsel klasöründe bırakma.
- Gerçek/native şeffaflık veya açık API/CLI isteği yoksa fallback image API yoluna geçme.
