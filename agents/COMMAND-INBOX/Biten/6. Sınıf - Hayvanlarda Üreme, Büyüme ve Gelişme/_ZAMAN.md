# HAYVANLARDA ÜREME — ÜRETİM SÜRESİ ÖLÇÜMÜ

> Mami'nin emri (2026-08-07): *"video süreci kurgusuyla her şeyiyle ne kadar sürüyor, zaman da tut."*
> Buradaki her satır **git commit damgasından** ya da dosya `stat`'ından türetilmiştir — tahmin yok.
> Duvar saati DEĞİL **çalışılan zaman** ölçülür; araya giren başka projeler dışarıda bırakılır.

## Ölçülen adımlar

| Adım | Başlangıç | Bitiş | Süre | Nasıl ölçüldü |
|---|---|---|---|---|
| Enzim kilitleri + VO 54 cümle + referans envanteri + SUNO | 08-03 09:15 | 08-03 09:17 | *tek oturum* | `_ENZIM.md` stat → ilk commit |
| 54 start-frame prompt yazımı (5 sekans) | 08-03 09:17 | 08-03 14:34 | **~5 sa 17 dk** | commit "K01-K27 yazıldı" → "54 kare" |
| **Kare BASIMI — 54 kare + açılış kartı** | 08-07 08:09 | 08-07 12:14 | 🔴 **32 dk** | iş emri açılışı → commit metninde ölçülü |
| Kare denetimi + tur kapanışı | 08-07 12:14 | 08-07 13:08 | **54 dk** | commit → commit |
| İlk 3 klip (K01, K02, K11) + cetvel doğrulaması | 08-07 13:08 | 08-07 13:22 | **14 dk** | commit → commit |
| **MOTION — 54 kare, 5 paralel sekans ajanı** | 08-07 13:37 | 08-07 13:52 | 🔴 **15 dk** | ajan `duration_ms` (en uzun 919s) |

| **EDIT-PLAN + ANIMATIC-0 + süre onarımı** | 08-07 13:52 | 08-07 14:10 | 🔴 **18 dk** | commit damgası |

**Buraya kadar toplam çalışılan zaman: ~7 sa 30 dk** (54 kare + 54 motion + kurgu planı + 3 klip).

## Henüz ölçülmedi — koşuldukça buraya yazılır

| Adım | Tahmin | Gerçek |
|---|---|---|
| Kalan 51 klip basımı (309 sn üretim · ~27.800 kredi) | — | — |
| Kaba kurgu (gerçek kliplerle Premiere XML) | ~5 dk | — |
| Tam film denetimi (AGY + cetvel + hakem) | ~20 dk | — |

## ANIMATIC-0'ın kredi yakmadan kestiği iki kusur (08-07)

1. **41 klipte Kling payı yoktu** — K06 ve K20 eksideydi. Kling'in ilk ~0.5 sn'si ve son
   ~1.5 sn'si kullanılamıyor; süreler ekran+2 sn'ye çekildi (277s → 327s, +4.500 kredi).
   Bu 41 klip aynen basılsaydı kurguda kesilecek yer kalmayacaktı → 41 yeniden basım.
2. **Plan 5:27 tahmin ediyordu, gerçek VO 3:11** — 136 saniyelik tahmin hatası, tek klip
   basılmadan yakalandı.

## Okunması gereken tek sayı

**Darboğaz insan değil, KLİP BASIMI.** 54 kare 32 dakikada basıldı, 54 motion 15 dakikada
yazıldı — yani yazım tarafı artık neredeyse bedava. Kalan 51 klip Kling'de klip başına
~10 dakika üretim süresi istiyor; sıraya girdiği için asıl takvim orada belirleniyor.
