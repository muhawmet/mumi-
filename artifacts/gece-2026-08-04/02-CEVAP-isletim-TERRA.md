## 1. Çit sayımı

Sayım birimi: davranışı değiştiren bağımsız emir; alıntıdaki kötü promptlar ve kanıt anlatısı hariç tutuldu. Anahtar kelime saymadım; yasa bunun yanıltıcı olduğunu kendisi söylüyor (`PROMPT-YASASI.md:963-968`).

| Kova | Sayı | Oran |
|---|---:|---:|
| A — Yetkilendiren | 141 | %54,4 |
| B — Yasaklayan | 118 | %45,6 |

B, külliyatın tamamında sayıca baskın değil. Teşhis bu yüzden çürümüyor: prompt yazım anında B’ler daha görünür, tekrar ediyor ve bazıları “mutlak yasa” diye sunuluyor; ajan önce yapabileceğini değil, bozmamayı düşünüyor. Yasanın kendi teşhisi de budur (`PROMPT-YASASI.md:97-113`).

Tamamen silinmesi değil, yüzeylerden silinip yalnız tek kanonda kalması gereken 10 tekrar:

1. “Görülmemiş kareye motion yazma” — kanon `PROMPT-YASASI.md:788-789`; Faz, Director ve Denetim’deki kopyaları silinebilir.
2. “Tek geçiş” — kanon `PROMPT-YASASI.md:278-283`; Enzim/Director/Denetim/Faz kopyaları silinebilir.
3. “Sorunsuz kareye revize yok” — kanon `PROMPT-YASASI.md:283`; Director ve Denetim kopyaları silinebilir.
4. “Revize = reference-edit; sahneyi baştan tarif etme” — kanon `PROMPT-YASASI.md:279-280`; Director ve Denetim kopyaları silinebilir.
5. “Bulanık arka planı keskinleştirme” — kanon `PROMPT-YASASI.md:281-282`; Director ve Denetim kopyaları silinebilir.
6. “Katı nesne + hızlı kamera = rigid/no-morph” — kanon `PROMPT-YASASI.md:995-1001`; Director ve Enzim kopyaları silinebilir.
7. “Motion yeni özne doğurmaz” — kanon `PROMPT-YASASI.md:975`; Director’daki açıklama kopyası silinebilir.
8. “Tag’li karakteri görünüşüyle tekrar tarif etme” — kanon `PROMPT-YASASI.md:713-718`; Director’daki aynı yasak silinebilir.
9. “Boş/white void yasak” — kanon aslında “yüzeyi giydir” olumlu reçetesidir (`PROMPT-YASASI.md:693-704`); Director’daki yasak cümlesi silinmeli.
10. “no empty void / no lens flare” — Enzim zaten bunların gereksiz olduğunu söylüyor (`mamilas-enzim/SKILL.md:104-110`); bu negatifler tamamen kaldırılmalı.

## 2. Okunamayan yasa problemi

Dördüncü seçenek: **tek kanonlu yasa derleyicisi + kare-başı kanun fişi**.

- Tek değiştirilebilir kaynak yine `agents/PROMPT-YASASI.md` kalır. Başına yalnızca makine-okur bir “kural kaydı” eklenir: `id`, `register`, `when`, `form`, `gate`, `sourceLines`.
- `scripts/yasa-fisi.mjs`, prompt yazımından hemen önce Director tarafından çalışır: proje/register + kare özellikleri (`EDU`, yazı var, çocuk var, katı nesne var, motion) alır.
- Araç, yasayı her seferinde kaynaktan seçerek `<Ad>_YASA-FISI.md` üretir: örneğin K12 için yalnız §0, ton, siluet, TEXT, katı-nesne motion ve ilgili prompt reçeteleri.
- Fiş düzenlenemez cache’tir: kaynak dosyanın hash’i ve satır aralıkları bulunur. Hash değişirse fiş geçersizdir.
- `prompt-lint`, prompt yanında fişin hash’ini ve gerekli kural kimliklerini arar; yoksa `MISSING_LAW_RECEIPT` verir. Bu üretim otomasyonu değil, basmadan önceki mevcut lint kapısının kanıt genişlemesidir.
- Director, 81.8K’yı “bir gün okumuş” olmaz; her karede 12–20 ilgili, aynen kaynaklanmış satırı görür.

Bu, bölme değildir: ikinci kanon yazılmaz; fiş yalnız kanonun doğrulanabilir, bağlama seçilmiş çıktısıdır. Mevcut “tek kanon” ilkesiyle de uyumludur (`PROJECT_CONTRACT.md:5-8`).

## 3. Talimatın doğru biçimi

Karar ağacı:

```text
Ölçülmüş hata mı?
├─ Hayır → Kural yazma; precedent/örnek olarak tut.
└─ Evet
   ├─ Metinden deterministik ölçülebilir mi?
   │  └─ Evet → KAPI.
   ├─ Başarılı çözümün kopyalanabilir İngilizce cümlesi var mı?
   │  └─ Evet → ÖRNEK / reçete.
   ├─ Güvenlik, kaynak sadakati veya yetki ihlali mi?
   │  └─ Evet → kısa KURAL + kare görüldükten sonra insan kapısı.
   └─ Birden çok meşru estetik çözüm mü?
      └─ Evet → 2-3 örnek + yönetmen sorusu; kural değil.
```

Beş yanlış biçim:

1. `FİKİR: ... tek gerilim ya da tek değişim` (`PROMPT-YASASI.md:421,466-469`) yanlış biçimde kural. “Gerilim” doğrudan kaynakta olmayan çatışmayı imal etmiş (`200-214`). Biçimi: merak/fark ediş/ölçek/dönüşüm/yankıdan gerçek kare örnekleri + “VO’suz hangi kanıt görülür?” sorusu.

2. “Her karede feda” (`PROMPT-YASASI.md:423, §2c`) yanlış biçimde evrensel kural. Biçimi: üç güçlü kadraj örneği ve `PLAN` seçeneği; her kareyi zorunlu eksiltmeye itmemeli.

3. “Kavram ışığı çiçek/alev olmaz” (`PROMPT-YASASI.md:1002-1003`) kural değil, doğrudan kopyalanabilir prompt reçetesidir. Biçimi: yalnız şu satır: `the glow stays a soft round golden light and never becomes a flower, petal or flame.`

4. “Siluet tek anlama gelmeli” (`PROMPT-YASASI.md:160-174`) prompt kuralı olarak eksik. Risk, yazıda değil üretilmiş pikselde görünür. Biçimi: kare görüldükten sonraki zorunlu insan kapısı: “VO kapalıyken zararlı ikinci okuma var mı?”

5. “Yaklaşık yarı kare yazı taşısın” (`PROMPT-YASASI.md:262-265`) yanlış bir kota. Biçimi: yazı seçilmişse kapı `carrier + material + orientation` ister; yazı sayısıysa sahnenin hakkı ve örnek bankasıyla belirlenir.

Doğru kapı örneği: `STYLE` uzunluğu. Ölçülebilir, eşik tanımlı ve lint zaten duvar rolü oynuyor (`PROMPT-YASASI.md:664`). “Klibin sonu başından farklı” ise kapıya çevrilebilir: başlangıç durumu, dönüm ve yerleşme alanları ayrı yazılmamışsa kırmızı (`PROMPT-YASASI.md:915-961`).

## 4. Ajanın prompt yazma yüzeyi

`mamilas-director`, kusursuz ama sıradanı engellemekte güçlü; şaheseri zorunlu kılmakta henüz eksik.

Güçlü tarafı: `FİKİR`, `PLAN`, `FEDA` ve çapa kapıları teknik olarak temiz ama plastik kareyi kesiyor (`mamilas-director/SKILL.md:97-135`). Eksik tarafı: bu kapılar “iyi kadraj” soruyor, “bu fikir yalnız animasyonla mı mümkün?” sorusunu zorlamıyor. Yeni §0 okunacak kaynakta var; Director’ın yazım yüzeyinde zorunlu karar alanı yok (`PROMPT-YASASI.md:115-136`).

Somut ekleme: Director’a satır 135’ten sonra `1.6 ANİMASYON HAMLESİ` eklenmeli; prompt başlığına da girsin:

```text
GERÇEK-KAMERA ÇÖZÜMÜ: <en sıradan literal çözüm>
ANİMASYON HAMLESİ: <kavramın kendisi | ölçek yalanı | malzeme hâl değişimi |
                    mekânın yeniden dizilmesi | imkânsız kadraj>
KANIT: <VO’nun söyleyemediği, yalnız bu görüntünün taşıdığı şey>
```

Kurallar:

- İlk satır motora gitmez; banal seçeneği görünür yapıp reddetmek içindir.
- İkinci satır beş serbestlikten tam birini seçer; “takvim yaprağı” gibi literal kaçışı yakalar.
- Üçüncü satır `FİKİR`in yerine geçmez; onu somutlar.
- Inline jüri, lintten önce yalnız şunu sorar: “Bu kare gerçek kamerayla çekilebiliyorsa, seçilen animasyon hamlesi nerede?” Cevap yoksa teknik slot doldurulmaz.

Şaheseri üreten fark budur: hata korkusundan gelen doğru kadraj değil; konunun ancak animasyonla söylenebilen biçimine dair seçilmiş bir bahis.

## 5. Silinecekler / ölü çelişkiler

| Ölü veya yanlış öğe | Neden |
|---|---|
| Fazın “yeni video = Enzim” akışı (`faz-icraat.md:35`) | Plan “Dünya kartı → Plan → Enzim” diyor (`mamilas-plan/SKILL.md:67-88`); aktif çağrı haritası Plan’ı hiç çağırmıyor. |
| Codex profilinin “Enzim → Director” sırası (`docs/ai/CODEX.md:32-34`) | Aynı nedenle Plan’ı fiilen opsiyonelleştiriyor; “her yeni video” plan kuralıyla çelişiyor. |
| Motion hedefi “190–215” (`PROMPT-YASASI.md:793-796`) | Aynı template 210–260 yazıyor (`809`); tek aralık seçilmeden lint/ajanın doğru davranışı yok. |
| Her klibe sabit kamera kuyruğu (`PROMPT-YASASI.md:823-824`) | Aynı bölüm bunun 53 klibin 53’ünü durdurduğunu ve yalnız yazı/katı nesneye daraltılması gerektiğini söylüyor (`834-853`). |
| Tek `_MOTION.txt` teslimi (`PROMPT-YASASI.md:1111`; `faz-icraat.md:83`) | Aynı kanon “klip başına ayrı `01.txt … 54.txt`” diyor (`PROMPT-YASASI.md:875-876`). Birini seçmek zorunda. |
| Yeni kelime tuzağını kodda/testte düzelt emri (`PROMPT-YASASI.md:1182-1184`; Director `160-166`) | Aktif fazda `src/core` donuk, kusur ledger’a gider (`faz-icraat.md:48-50`); bu emir inşa fazına taşınmalı. Metin yalnız `wordTraps.test.ts` adını koruma olarak anıyor; bu denetim kapsamında testin kendisi açılmadı. |
| Director’daki “ayrı görünür `.md`” başlığı (`mamilas-director/SKILL.md:231`) | Aynı paragraf Windows için `.txt` teslimini emrediyor (`233-238`); `.md` kelimesi silinmeli. |
| CLAUDE’un “kapı yeşilken commit + main’e push sorulmaz” emri (`CLAUDE.md:178-181`) | Repo giriş sözleşmesindeki “Push yapma” ile çelişiyor; kalıcı bir çalışma kuralı olarak yanlış yetki veriyor. |
| “Altı ajana kadar” (`CLAUDE.md:99-104`) | Mevcut çalışma ortamı dört eşzamanlı slotla sınırlı; sayı çalışma yüzeyinden çıkarılıp runtime kapasitesine bırakılmalı. |
| “Kural henüz değişmedi, Mami kararı bekleniyor” (`PROMPT-YASASI.md:834-853`) | Aynı dosya sonraki bölümde canlı kamera ve limit testini norm yapıyor (`985-1007`); bekleyen karar metni artık aktif template’in içine değil, karar günlüğüne ait. |

Çağrı uçları açısından adı geçen kritik dosyaların tümü mevcut: `AJAN-BRIEF`, hata kataloğu, dünya kartı dizini ve ilgili script’ler bulundu. “Adı var ama dosya yok” bulgusu yok; sorun yok dosya değil, aynı davranışın üç-dört yüzeyde ayrı ayrı yaşaması.

