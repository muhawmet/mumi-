# B3 — REAL / EDU Register Düşüşü

## İncelenen Gerçek Yol
`src/core/pure.ts:970-988` (`deriveProductionPath`) → `src/core/brain.ts:46` (`registerOf`).

## Aday Bulgu — Tanımlanamayan Proje İsimleri Sessizce ANIMATION_EDU'ya Düşüyor
- **Durum:** `CURRENT`
- **Beklenen / Gerçek:** Proje ismi veya sınıfı `ULTRA`, `REAL`, `COMMERCIAL`, `PRODUCT`, `AUTOMOTIVE` gibi anahtar kelimeler içermediğinde (örneğin "Gece Serumu", "Milli Gün", "Cilt Bakım Şişesi"), `deriveProductionPath` fonksiyonu varsayılan olarak `'ANIMATION_EDU'` döndürmektedir.
- **Kanıt Zinciri:** `src/core/pure.ts:987` (`return 'ANIMATION_EDU';`). `registerOf('ANIMATION_EDU')` ise `'EDU'` döndürmektedir (`src/core/brain.ts:49`).
- **Tekrar Üretim:** `deriveProductionPath("Gece Serumu")` çalıştırıldığında çıktının `'ANIMATION_EDU'` olduğunu doğrula.
- **Karşı-okuma ve Sonucu:** Eğer proje ismi açıkça `REAL` anahtar kelimelerinden birini taşıyorsa doğru sınıflanır (`ULTRAREAL_COMMERCIAL`). Ancak Türkçe özel ürün/marka isimleri tanınmamaktadır.
- **Üretim Etkisi:** Mami reklam/şaheser üretmek istediğinde özel isim verdiğinde (ör. "Gece Serumu"), sistem projeyi sessizce EDU register'ına sokarak photoreal doku ve kamera kurallarını devre dışı bırakır.
- **Korunacak Şey:** Açık anahtar kelime eşleşmesi (`REAL`, `COMMERCIAL`).
- **En Küçük Yön / Production Probe:** Tanımlanamayan isimlerde varsayılan EDU dönmek yerine `UNKNOWN` döndürerek UI veya Command Export aşamasında Mami'ye register sorulması / makbuza kilitlenmesi.
