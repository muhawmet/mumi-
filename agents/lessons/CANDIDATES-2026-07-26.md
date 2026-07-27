# DERS ADAYLARI — 2026-07-26 · kaynak: gerçek kareler

**Bu dosya banka DEĞİL.** `APPROVED.md`'ye yalnız Mami yazar (M7 yasası: otomatik promote yok).
Buradaki her satır onaylanmaya HAZIR biçimde yazıldı — kabul ettiğin satırı `APPROVED.md`'ye
olduğu gibi taşı, istemediğini burada bırak.

## Nereden çıktı

Tahmin yok. Her ders, teslim edilmiş bir videonun revize dosyasında YAZILI bir hatadan
türetildi ve hangi karede göründüğü yanında duruyor:

- `agents/COMMAND-INBOX/Biten/6. Sınıf Kuvvetlerin Güç Birliği/Bileşke Kuvvet_REVİZE-PROMPTLAR.txt` — 19 kare
- `.../Bileşke Kuvvet_REVİZE-TUR2.txt` — 33 madde, 4 bölüm

Sürtünme (31 kare) ve Kuvvet Ölçülmesi (48 kare) için revize turu hiç yapılmamış — o iki
videonun dersleri henüz çıkarılmadı. Banka onlarla büyür.

## Zaten kaynağa yazıldı (ders olarak gerekmez)

Bu ikisi artık koddan geçiyor, ajanın hatırlamasına gerek yok — `src/core/wordTraps.test.ts`
kilitliyor:

- `saffron` → prompt yoluna giremez, `warm golden`'a çevrilir (`translateFlowerColourNames`).
  REVİZE-TUR2'nin en üstündeki KRİTİK NOT artık kaynağın davranışı.
- `SSS` → `subsurface-style translucency` (eskiden `sheen` yazıyordu = plastik cilt emri).

## Ders adayları

```
- Kuvvet/enerji glow'u YUVARLAK sıcak-altın ışık halesidir: taç yaprağı, sap, çiçek ya da ok değil — "soft round warm-golden glow of light, luminous energy aura, no petals, no stem, no arrow" — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Kuvvet glow'u NESNENİN üstündedir, cildin üstünde değil: yüze/tene glow bindirme — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Karede okunan her yazı Türkçe ya da HİÇ: İngilizce tabela/poster/rozet yok, uydurma harf dizisi yok, okunmayacaksa yüzey boş kalsın — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Arka plandaki tahta/poster yazısı yumuşak-bulanık ve KISA kalır; netleştirilirse motor garbled Türkçe/İngilizce doğuruyor — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Kapak/plaka yazısı soldan sağa okunur — aynalanmış (mirrored) metin kabul edilmez — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Sayısal etiket: sıfır ile birim AYRI ve aralıklı ("R = 0 N", asla "R = ON"); her kuvvet için TEK etiket, kopya etiket yok — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Prop yüzeye YATAR: kitap masanın üstünde, kutu tezgâhın üstünde — havada asılı nesne yok — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Cilt tonu sıcak mat ten rengidir; yeşil/gri cilt karenin reddi demektir — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Karakter kimliği tag'in kendisidir ve ROL beat'ten gelir: kıyafet/renk karışırsa da kim çeker kim izler karışırsa da kare yanlıştır — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
- Bir sekans boyunca tekrar eden prop (kitap, araç, alet) üretimden ÖNCE referans olarak basılıp tag'lenir; tag'siz prop her karede başka çıkar — kaynak: Bileşke Kuvvet · 2026-07-26 · Mami onayı
```

## Ders yapılMADI — bilerek

- **"bloom" kelimesi.** Prompt yolunda ×0 ölçüldü (gerçek `generateBatch`, pixar_3d_edu) — yani
  `bloom` koddan gelmiyor. Kaynağı `mamilas-director` skill'inin KENDİSİ: satır 64 atmosfer için
  "bloom" yazmayı İSTİYOR, satır 70 aynı kelimeyi YASAKLIYOR. Ders değil, skill çelişkisi —
  FAZ 1'de skill'de düzeltilecek.
- **Round-robin kadraj** (Fable bulgusu: dev-dalga beat'ine 85mm close). Ders bankası ajana
  tavsiye verir; bu bir kanal kusuru — kadraj kararının sahibi tanımsız. Ders yazmak kusuru
  gizler.
