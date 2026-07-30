# DERS ADAYI — Cast kilidi TAG'de tutuyor, TARİFTE kaçıyor (Bileşke Kuvvet, 2026-07-30)

**Statü:** ADAY, kök neden ÖLÇÜLDÜ. `APPROVED.md`'ye yalnız Mami taşır.

## Şikâyet

Mami (2026-07-30, aynen): *"Bileşke iyi değildi çok ürettim zenciler falan çıktı."*
16/71 kare üretildi, cast etnisitesi tutmadı, iş masadan kalktı.

## İlk hipotez ÇÜRÜDÜ

"Cast kilidi yazılmamış" sanıldı. Ölçüm bunu reddetti:

- `Cast is Turkish/Anatolian only.` cümlesi **16/16 karede var** — eksiksiz.
- Her karede ayrıca "a Turkish sixth-grader around eleven or twelve" geçiyor.
- `@mira` tag'i 16 karede 29 kez çağrılıyor; REFERANSLAR'da "ZATEN TAG'Lİ" yazılı.

**Yani kilit yazılıydı ve yine kaçtı.** Kusur kilidin varlığında değil, **kimin üstünde
durduğunda.**

## Kök neden — ölçülmüş

16 karede `@mira` DIŞINDA **14 insan anması** var ve **13'ü çıpasız**:

| Kaç kez | Nasıl geçiyor | Etnisite çıpası |
|---|---|---|
| 6 | "the teacher" | **yok** |
| 1 | "a teacher" | **yok** |
| 1 | "two children" · 1 "the children" | **yok** |
| 1 | "a watching child" · 1 "a sitting child" · 1 "a plump child" | **yok** |
| 1 | "a classmate" · 1 "a child" | **yok** |
| 1 | "a Turkish woman" | var (tek) |

`@mira` tag'li olduğu için **o tuttu.** Öğretmen ve arka plan çocukları **tarife bırakıldı** ve
motor kendi ortalamasına düştü. Mami'nin gördüğü tam olarak bunlar.

Ek olarak: kilit cümlesi STYLE paragrafının **en sonunda** duruyor — insanın tanıtıldığı yerden
onlarca kelime uzakta. Motor somut ve YAKIN cümleyi dinliyor
(`mamilas-disclaimer-does-not-work` ile aynı sınıf: sarmalanan yasa çalışmıyor).

## Altın standart ne yapıyordu (Eşeyli, 50 kare)

`ENZIM-KILITLERI.json` → `castOrigin: "Türk/Anadolu — **ana ve arka plan dahil**"`
ve tag sayımı: `@efe` 157 · `@gul` 43 · `@defter` 42 · `@kedi` 19 · **`@anne` 15** · `@amip` 13.

**Kritik kıyas:** Eşeyli'de `@anne` yalnız **7 karede** görünüyor ve buna rağmen **TAG'Lİ.**
Bileşke'de öğretmen **6 karede** görünüyor ve **tag'siz.** Aynı sıklık, ters karar.
Eşeyli 6 handle ile tekrar eden her insanı tag'e bağlamış; Bileşke tek handle ile gitmiş.

## YETENEK HÜKMÜ

**Cast kimliği REFERANSLA taşınır, TARİFLE taşınmaz.** Tarif ne kadar açık yazılırsa yazılsın
(16/16 karede yazıldı) ikincil figürde kaçıyor. Sınır tag ile tarif arasında, prompt kalitesinde
değil.

İkinci hüküm: **tekrar eden ikincil karakter = tag adayı.** Eşik ölçüldü — Eşeyli 7 karede
tag'lemiş. Öğretmen 6 karede geçiyorsa tag'lenmeliydi.

## Düzeltme — iki hamle

1. **Çıpa isme yapışır.** "the teacher" → "@ogretmen, a Turkish woman in her forties" —
   ilk anıldığı yerde, her karede. Kuyruktaki tek STYLE cümlesi çıpa yerine geçmez.
2. **Öğretmen tag'lenir** (`@ogretmen`), Eşeyli'nin `@anne`si gibi. **Bu bir referans
   basımıdır — kredi yakar, kararı Mami'nin.**

## Açık kalan tek soru

Kaçan kareler hangi dünyada? Dünyanın ref setinde Türk cast örneği yoksa motor ortalamasına
düşer — o zaman kusur dünya metnindedir, promptta değil. **Kaçan kare Mami'de; görülmeden
dünya suçlanmaz.**

## İlgili

`mamilas-tr-text-and-cast-locks` · `mamilas-magnific-char-refs` · `mamilas-disclaimer-does-not-work`
· `PROMPT-YASASI` §2R · Eşeyli `ENZIM-KILITLERI.json`
