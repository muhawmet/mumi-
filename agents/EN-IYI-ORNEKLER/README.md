# ⭐ EN İYİ ÖRNEKLER — sıkışınca buraya bak

Mami, 2026-07-31: *"en kötü sıkışırsak onlara bakarız."*

Burası **kanon değil, ÖRNEK**. Kural `agents/PROMPT-YASASI.md`'de; burada o kuralların
tuttuğu gerçek dosyalar duruyor. Yeni bir kare ya da klip yazarken ritmi buradan al —
kural listesinden değil. Bugün ölçüldü: ajanlar yasayı okuyunca değil, **bu dosyaları
okuyunca** iyi iş çıkardı.

---

## `6.1.3 Sorunlari Birlikte Cozuyoruz/` — bugünkü set (2026-07-31)

Mami'nin hükmü: *"inanılmaz videolar · film gibi · empati var · plastiklik yok."*

| dosya | neden burada |
|---|---|
| **PROMPTLAR (57 kare · lint 0)** | Karede tek dramatik fikir + adı konulmuş baskın geometri. Generic ışık/palet bloğu YOK — renk sahnenin kendi malzemesinden doğuyor. Üç katmanlı derinlik, ön plan örtmesi, karakter kameraya poz vermiyor. |
| **CODEX PILOTU (cita)** | Çıtayı bu koydu. İki fikri en değerlisi: **NEGATİF YASASI** (önce bu karenin kötü üretimini hayal et, sonra yalnız onu engelle — banka listesi yapıştırma) ve **MOTION İÇİN ŞİMDİDEN KİLİT** (start frame'e bir sonraki fazın kısıtı yazılır: kalem görünse bile kimse okunabilir yazı yazmaz). |
| **MOTION (57 klip)** | 203-215 kelime, tek paragraf, `Camera:` kendi cümlesi, **adı konulmuş yay cümlesi** her klipte. Yasak kalıp sıfır. |
| **REFERANSLAR** | `@tag` disiplini + türetilecek kare tablosu. Referansta nesne varsa üstündeki beden parçası da yazılı (ayak/ayaklık dersi burada). |
| **SESLENDIRME** | Bir cümle = bir klip, hiçbiri 12 kelimeyi aşmıyor. Omurga: her gün görülen ama fark edilmeyen şey → biri geçemeyince görülüyor → kapanışta açılışın AYNI kadrajı tek farkla. |
| **ENZIM (17 karar)** | Proje boyunca Mami'nin verdiği kararlar + kareyle/kliple ölçülen dersler. Yeni projede `_ENZIM.md` böyle tutulur. |

**En iyi üç kare fikri:** K37 (kalem Derin'in elinde, yazının son harfinin üstüne yatmış —
kanıt jestte değil kâğıtta) · K47 (künye oturur göz hizasında, sandalye kısıt değil **doğru
yükseklik**) · K52-K53 (kapanış açılışın aynı kadrajı, tek fark).

---

## `6. Sinif Eseyli ve Eseysiz Ureme/` — MOTION altın standardı

50 klibin tamamı iyi. Buradaki 7 dosya ritim örneği:
**12 · 27 · 35 · 41** (kanonik dörtlü) ve **08 · 21 · 33**.

Ne öğretiyorlar:
- Klip **devam eden bir işin ortasında** açılır — kişi bir NİYET taşır (*"still hunting"*)
- **Sebepli tek vuruş**: bir şey o işi bitirir ve o an yüz değişir
- **Adı konulmuş yay cümlesi** — klibin duygusunu cümle olarak söyler
  (*"he begins comparing and ends having decided the two are not the same thing"*)
- `Camera:` kendi cümlesi, sona yakın
- Kilit **tek kısa cümle** — yasak yığını değil

⚠ `MOTION-01` bilerek burada YOK: o dosya `half a second later` içeriyor ve kamerayı ilk
cümleye kaynatmış. Altın standardın kendi tek kırmızısı odur (`motion-lint` de öyle ölçüyor).

---

## Ölçenler — örneğe bakmadan önce koş
```
node scripts/prompt-lint.mjs "<teslim>.txt" --register=edu     # start frame (gate.sh'a bağlı)
node scripts/motion-lint.mjs "<MOTION klasörü>"                # motion
```
