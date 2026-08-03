---
name: mamilas-yerlesim-varsayimi-kusuru
description: "Bu repoda tekrar eden ANA kusur sınıfı: doğrulayıcı, ölçtüğü şeyin YERLEŞİMİNİ varsayıyor — ve yeşil kalıyor."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8d6d4d77-e230-4291-adaa-4e9965edc47d
  modified: 2026-08-03T12:18:06.441Z
---

# Yerleşim varsayımı — bu repoda 8 kez ölçülen tek kusur sınıfı

**Hüküm:** Bir doğrulayıcı, ölçtüğü şeyin *gerçek yerleşimini* değil *beklediğini* arıyor —
bulamayınca hata vermiyor, **sessizce yeşil kalıyor** ya da var olan işi yok sayıyor.

## Ölçülmüş tekrarlar

| # | nerede | ne oldu |
|---|---|---|
| 1 | `teslim-denetim` | prompt'u ADIYLA arıyordu; 20 projenin 19'una yanlış cevap verdi |
| 2 | `baglar.mjs` | uzantıyı 5 karaktere kesiyordu (`.command` → `.comma`); var olan dosyayı "kırık" sandı |
| 3 | `gate.sh` prompt dalı | ada göre arıyordu; **128 kare dosyası** duvardan ölçülmeden geçti, kapı "✅ yeşil" yazdı |
| 4 | `current-work` teslim taraması | ad sonekiyle arıyordu; 41 karelik iş kayıtta "yok" göründü |
| 5 | `prompt-lint.test.mjs` A5 | proje yolu gömülüydü; iş `Biten/`e taşınınca ENOENT |
| 6 | `current-work.test.mjs` | proje BAŞINA test üretiyordu; taşınan proje sayıyı düşürdü, **commit kilitlendi** |
| 7 | `gate.sh --diff-filter=ACMR` | **saf taşımayı** "yeni yazılmış" saydı; onarımı da yalnız İLERİ yönü kapattı |
| 8 | `kapanis-hasadi` | bloklu teslimi (`PROMPTLAR/A-K01-K14.txt`) hiç görmedi; 54 kare teslim etmiş proje **ders adayı üretmedi** |

## Kalıcı ders

**Bir kusuru onarmak SINIFI onarmaz.** 1-4 numara 2026-08-02'de onarıldı; 5-8 ertesi gün
çıktı. Noktasal onarım devam ettiği sürece dokuzuncusu da çıkar.

**How to apply — yeni bir ölçüm aracı yazarken üç soru:**
1. Girdisini **ADIYLA mı İÇERİĞİYLE mi** buluyor? (Doğrusu: içerik. `^STYLE:`/`^NEGATIVE:`
   taşıyan her dosya bir prompt teslimidir — ad ne olursa olsun.)
2. Teslimin **iki biçimini de** tanıyor mu? Tek dosya (`<Ad>_PROMPTLAR.txt`) **ve** bloklu
   klasör (`PROMPTLAR/A-K01-K14.txt`) aynı teslimdir; bloklar rakip aday değil PARÇAdır.
3. İş **bitip taşınınca** ne oluyor? Duvar, işin bitmesini kusur saymamalı — proje aktif
   klasörde de `Biten/` altında da aranır.

**Ve:** ad-tabanlı eleme her zaman yanlış değildir. Teslim biçiminin **kendi sözleşmesi**
(`_MOTION` · `_EDIT-PLAN` · `_SESLENDIRME` · `_SUNO` · `_REFERANSLAR` · `_KALAN-URETIM`)
ad-tabanlıdır ve öyle kalmalı — orada ad bir tahmin değil, kanonun kendisi.

Bkz. [[mamilas-olcum-tersti]], [[mamilas-lint-rol-koru]].
