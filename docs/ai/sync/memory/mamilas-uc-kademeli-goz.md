---
name: mamilas-uc-kademeli-goz
description: "Video denetiminin doğru mimarisi — AGY İŞARETÇİ, ffmpeg CETVEL, Claude HAKEM; claude-video'dan alınacak fikir ve claude-mem'den alınmayacak şey"
metadata: 
  node_type: memory
  type: reference
  originSessionId: d105a6d7-86a2-4ca5-998a-096a3a24c91a
  modified: 2026-08-06T12:09:27.215Z
---

2026-08-06'da iki repo incelendi ([bradautomates/claude-video](https://github.com/bradautomates/claude-video),
[thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)) ve aynı gün üç kademeli göz
mimarisi ortaya çıktı. **Fikri al, kurumu alma** — dışarıdan gelen hiçbir şey kanona doğrudan girmez.

## Üç kademe

| Kademe | Araç | Ne için | Maliyet |
|---|---|---|---|
| **İŞARETÇİ** | AGY (`dis-goz.mjs gor`) | Tam film, geniş tarama, "nereye bak" | bedava, 1 FPS, ondalık UYDURUR |
| **CETVEL** | `ffmpeg`/`ffprobe` | Süre, donma, kare farkı, gerçek zaman | bedava, kesin |
| **HAKEM** | **Claude'un kendi `Read`'i** | İşaretlenen **3-8 kare**, gerçek piksel | token pahalı, tam kesin |

Üçüncü kademe 2026-08-06'da ilk kez kullanıldı ve **iki ölçümü de o çözdü**: AGY "kıpırdıyor" dedi,
`freezedetect` "donma" dedi; kareleri çıkarıp bakınca **28 karenin 28'i farklı** çıktı → AGY doğru,
ölçer yanlış ([[mamilas-agy-continue-ve-donma-olceri]]).

## claude-video'dan ALINACAK fikir

Yaptığı: `ffmpeg` ile kare çıkar + whisper ile zaman damgalı transkript al + **kareleri Claude'un
`Read`'ine ver**. Üretim/motion/kurgu/yasa YOK — tek organ. Ama o organ üç kanamayı kapatıyor:
AGY'nin uydurması · `-c`'nin ikinci turda ölmesi · donmanın yanlış ölçülmesi.
Onların donma yöntemi **ortalama mutlak fark**; benim md5'im yalnız birebir aynı kareyi yakalıyor,
onlarınki "neredeyse aynı"yı da yakalıyor — **doğru yöntem onlarınki.**

⚠ Sınır: 3 dakikalık film 1 FPS'te ~180 kare = bağlama sığmaz. O yüzden repo kurulmaz,
**~40 satırlık `kare-cek.mjs`** yazılır: `<film> <t1-t2> [n]` → n kare + o aralığın transkripti.
Parçaların hepsi elimizde (ffmpeg · whisper `kaba-kurgu.mjs`'te · `Read`).

## claude-mem'den ALINMAYACAK şey

Otomatik yakalayıp AI ile sıkıştırıp geri enjekte ediyor. **Bizde zarar verir:** ders bankasının
bütün değeri maddelerin **ölçülmüş ve Mami-onaylı** olması; her şeyi yutan bir sıkıştırıcı
115 onaysız adayın otomatik ve denetlenemez halini üretir. Ayrıca aynı gün iki kez yaşanan kusurun
kendisi bu: AGY kendi özetinden cevap verdi, Claude kendi iyimser cümlesinden "çalışıyor" dedi.
**Özet, kanıtı değil kanıta dair cümleyi taşır.**

✅ **ALINACAK olan tek şey: geçmiş oturumlarda ARAMA.** 2026-08-06'da "bunu daha önce ölçtük mü?"
sorusuna ancak repo grep'iyle cevap verilebildi; sohbet geçmişi aranabilir değil. Bu yetenek
otomatik hafıza olmadan da kurulabilir ve gerçek bir boşluk.

## Bağlam ≠ kota (Mami'nin sorusu)

`compact` **bağlamı** toparlar, **usage kotasını** kurtarmaz. Ve compact kayıplıdır: yanlış bir
cümleyi kanıtsız ileri taşır. Kural: **compact = kaza, `/clear` = karar.** İş sınırında
`mamilas-checkpoint` (commit + hafıza + kayıt) atılır, sonra clear serbest — temiz açılışta
Claude özet değil KAYIT okur.
