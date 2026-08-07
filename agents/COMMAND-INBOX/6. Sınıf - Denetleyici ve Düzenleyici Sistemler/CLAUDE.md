---
proje: 6. Sınıf - Denetleyici ve Düzenleyici Sistemler
kaynak: agents/COMMAND-INBOX/Bekleyen/6.sınıf denetleyici ve düzenleyici sistemler video senaryosu.docx
# Ölçüldü 2026-08-07 (607 kelimelik kaynakta):
#   sinir 12 · orkestra 7 · hormon 5 · elektrik 3 · nöron 1 · maket 1 · bisiklet 1 · damar 1 · lunapark 1
# Aynı kaynakta: mutfak 0 · soba 0 — önceki turun 56 karelik dünyası buydu ve çöktü.
dunya: [orkestra, sinir, hormon, elektrik, nöron, maket, bisiklet, damar, lunapark]
canary: GECTI          # 4 demo karesi Mami onayı aldı (commit 3a3d539a)
butce: { onayli: 4200, birim: 75 }
uretim_yetkisi: ana-oturum
---

# Denetleyici ve Düzenleyici Sistemler — VİDEO BEYNİ

Kilitlerin tam metni burada çoğaltılmaz, çağrılır:

@Denetleyici ve Düzenleyici_ENZIM.md

## KİLİT BAŞLIKLARI — yeni oturumun yanlış yapamayacağı üç şey

- **Tek mekân YOK; mekân kavramı takip eder ve her sekansın mekânı kaynaktan gelir.**
  S1/S7 konser salonu · S2 bedenin içi · S3 nöron dünyası · S4 maket masası + denge anı ·
  S5 gerçek anlar (çaydanlık) · S6 kan dolaşımı + lunapark.
  Süreklilik mekândan değil **Mira'dan, ışık rejiminden ve paletten** gelir.
- **`references` alanına YALNIZ `@mira` geçer.** Mekân/nesne plakası kareyi eziyor —
  27 kare basılarak ölçüldü; motor geometriyi değil bütün kompozisyonu kopyalıyor.
  Mekân sürekliliği **yazıyla** taşınır; plaka ajanın gözü içindir.
- **`@handle` çağrılır, tarif edilmez.** Yaş, yüz, saç, ten, göz, gardırop, milliyet
  yazılmaz — metinde yalnız `the girl` / `she`. Bu tur tam buradan kırılmıştı.

## DURUM — tek cümle

Prompt 56/56 ✓ · plaka 3/3 ✓ · **kare 0/56** · motion 0/56 · klip 0/56.
Sıradaki adım doğrudan 56 karenin basımı; Mami'nin emri: **image'dan sonra DUR, klip basma.**

## MAMİ KARARLARI

- 2026-08-07 — "üretim kısmını sadece sen yapacaksın, şef sensin, onlar sadece prompt
  yazacak; MCP sadece sende. Bıraksam sonsuz üretecektin."
- 2026-08-07 — "zengin bir hayat, fakir değil, özel okullara yapıyoruz devlete değil."
- 2026-08-07 — kahraman `@efe` değil **`@mira`**; önceki turun 56 karesi bu yüzden geçersiz.
- 2026-08-07 — "usage çok hızlı eridi, paralel işte dayanmadı; birer videolar yapmak lazım."

## BU VİDEODA ÖĞRENİLENLER

- 2026-08-07 🔴 **KARAKTER PLAKASI KİMLİĞİ TAŞIYOR AMA IŞIK REJİMİNİ DE TAŞIYOR.**
  Mami: *"sağdaki plastik değil mi, soldaki direkt filmden."* Ölçüldü: K05 (şef, **referanssız**)
  sahnenin kendi ışığında doğdu — nota lambası pratiği, sert yan key, modelleme gölgesi, ten
  dokusu, ön düzlemde odak dışı tuba. K07 (Mira, **`@mira` referanslı**) plastik.
  Sebep `elements/mira.png`: beyaz fonda **düz aydınlatılmış stüdyo plakası** — yön veren key
  yok, gölge yok, ten tek tonda, kumaş mat. Motor bunu kareye taşıyor.
  **Onarım plakada, prompt'ta değil:** plaka sahne rejiminde yeniden basılır (tek yönlü sert
  key + modelleme gölgesi + ten dokusu + ışıklı nötr fon). Tek kare (~75 kredi) 11 Mira
  karesini birden düzeltir.

- 2026-08-07 ❌ Kaynakta 0 kez geçen mekâna (mutfak) 56 kare yazıldı; motor sonunda pes edip
  ders kitabı diyagramı bastı — etiketli oklar, İngilizce yazı, çocuk yok. 27 kare çöpe.
- 2026-08-07 ✅ Dünya kaynaktan türetilince (orkestra / nöron) ilk 3 kare onay aldı.
  Değişen tek şey dünyanın nereden geldiğiydi.
- 2026-08-07 ❌ Negatifte bir nesneyi adlandırmak o nesneyi ÇAĞIRIYOR ("no phone" → eline
  broşür verdi). Kelime metinden tamamen çıkarılıp olumlu cümle konunca ilk denemede temiz.
- 2026-08-07 ❌ Kadraj kilidi cümleyle tutmuyor; ön düzlemde odak dışı somut bir kütleyle
  tutuyor. Aksi hâlde referansın stüdyo tam-boy plakası birebir ithal oluyor.

## AÇIK KARARLAR — Mami'ye soruldu, körleme yapılmadı

1. `prompt-lint`'in iki kuralı hiç yeşil yanamıyor (üç ajan bağımsız ölçtü): `AYRICALIK`/
   `YÜKÜM` `\S{12,}` istiyor — doğal Türkçe cümle geçmiyor; insan dedektörü Türkçe gövdeye
   karşı korumasız ("adlandırmanın" içindeki "man"). Onarım tek satır ama kod donmuş fazda.
2. K56'da duvar saati bilerek odak dışında — okunur ikinci bir saat ya aynayı ya demlenmiş
   çayı yalanlar.
3. `_REFERANSLAR.txt` `@mira`'yı 13 karede listeliyor, kota 11 — envanter yeniden numaralanmalı.
