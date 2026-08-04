## 1. Motor seçimi: ölçüm olmalı

Doğru soru “hangi motor daha iyi?” değil:

> Bu kare sınıfında, bu dünya ve bu prompt lehçesiyle, hangi motor Mami’nin kabul ettiği kareye en az kredi + en az revize + en az dünya kopmasıyla ulaştırıyor?

Ölçü bir motorun en güzel tek çıktısı değil; ilk-baskı kabul oranı, gerekli düzeltme sayısı, komşu NB2 karelerle render uyumu, kimlik tekrarının güvenilirliği ve metin doğruluğudur.

NB2 için bugün kanıt var: geçirgen malzeme, maddeden kesilmiş Türkçe yazı ve geometrik ışık yönlendirmesi. İnsan yüzündeki kusurun ise önce motor değil prompt olduğu ölçülmüş: 18/20 karakter karesindeki ıslak çift catchlight ve yüzü ışık dışına atan negatif yazım.

- Tavsiye: NB2 varsayılanını “alışkanlık” değil, sınıf-bazlı geçici baseline yap; GPT Image 2 ancak kazandığı sınıfta devreye girsin.
- Maliyet: Bir kez dört-karelik karşılaştırma düzeni.
- Risk: Tek şahane GPT yüzü, bütün hat için yanlış “motor değişimi” kararına dönüşebilir.

## 2. Motor yönlendirme doktrini

| Kare sınıfı | Bugünkü yönlendirme | Gerekçe | Maliyet / risk |
|---|---|---|---|
| İnsan yüzü | Önce NB2 + Hücre’deki yüz-ışık düzeltmesi; GPT2 challenger | Plastik kök nedeninin prompt olduğu kanıtlı; yüzü ışığın içine alan iki NB2 kare doğal çıktı. | Maliyet: düzeltmiş promptla A/B. Risk: Prompt kusurunu motor kusuru sanmak. |
| Geçirgen madde / kavram | NB2 birincil | Hücre’de ışığın maddeden geçmesi high-end sonucu verdi; K24/K27/K33 kanıtlı. | Maliyet: yok, mevcut yol. Risk: GPT2’ye dair karşı kanıt yok; bu sınıfta motor değiştirmek gereksiz kredi riski. |
| Türkçe yazı | NB2 birincil | 21/21 doğru hece; harf malzemeden kesilince glif sorunu sıfır. | Maliyet: mevcut yazı disiplini. Risk: GPT2’nin Türkçe/diakritik ve “maddeden harf” davranışı bilinmiyor. |
| Geniş mekân kurulum | NB2 baseline, GPT2 bilinmiyor | NB2’nin geometri, lens ve ön-plan çapasıyla çalıştığı ölçülmüş; GPT2 için aynı sınıfta veri yok. | Maliyet: ayrı test gerekir. Risk: motor karışımı ilk olarak geniş kadrajda render dili kopması üretir. |
| Kalabalık | Motor değiştirme değil, insan sayısını azaltma | Küçük/adsız yüzler promptla taşınamaz; bu piksel ve kompozisyon problemidir. | Maliyet: sahne tasarımı. Risk: GPT2 “kalabalık daha iyi” varsayımı kanıtsız ve pahalı. |
| Karakter kimliği tekrarı | Magnific referans/@handle hattı korunur; GPT2 ancak ayrı kimlik testi geçerse | NB2-Magnific hattında referans mekanizması var. GPT2’nin bu kurulumda aynı referans taşıma biçimi **bilinmiyor**. | Maliyet: iki-kare devamlılık testi. Risk: tek güzel portre, tekrar eden karakter garantisi değildir. |
| Motion’a girecek kare | Önce dünya içinde kabul edilmiş start frame; kaynak motor ikincil | Kling’in sözleşmesi onaylı kareyi “truth” kabul ediyor; zayıf veya dünyadan kopuk kare motion’da düzelmez. | Maliyet: kare denetimi. Risk: Motion ile start-frame kusurunu örtmeye çalışma. |

Kısa hüküm: GPT2’nin ilk aday sınıfı insan yüzü olabilir; geçirgen kavram ve Türkçe yazı değil. Ama yüz sınıfında da önce doğru NB2 ışık lehçesi denenmeden motor değişmez.

## 3. Lehçe maliyeti

NB2’nin ölçülmüş lehçesi şunları söylüyor:

- Geometriyi dinliyor, soyut ton komutlarını zayıf dinliyor.
- Negatif tek başına korumuyor; istenen fizik pozitif yazılmalı.
- Işık “şuna değer, şuna değmez” diye mekânsal yazılınca çalışıyor.
- Uzun, slotlu start-frame yapısı kullanılıyor: lens, özne, kimlik, mekân, ışık, kavram, derinlik, temas, ardından STYLE/TEXT/NEGATIVE.
- `@handle`, Magnific tarafındaki kimlik hattının parçası.
- Türkçe yazı; taşıyıcı, harf malzemesi, heceleme ve yüzeye paralellik birlikte yazılınca güvenilir.

GPT Image 2 için bu repoda motor lehçesi, gerçek prompt paketi, kare örneği veya denetim kaydı yok. Bu nedenle “daha kısa prompt sever”, “negatifi daha iyi dinler”, “referansı daha iyi taşır” gibi bir hüküm şu an **bilinmiyor**. Uydurulmamalı.

Literal NB2 promptunu GPT2’ye vermek, “GPT2 daha kötü” testi değil, “NB2 lehçesi GPT2’ye taşınabilir mi?” testidir. Bozulma muhtemel alanlar:

- `@handle` / referans çağrısının anlamı veya etkisi,
- uzun slot dizisinin öncelik sırası,
- NB2 için yazılmış mekânsal negatiflerin etkisi,
- TEXT’in malzeme-fizik tarifinin okunması,
- ışık, lens ve dünya kuyruğunun kompozisyona ağırlığı,
- EDU/REAL/STY register ayrımının korunması.

`prompt-lint` de bunu destekliyor: register değişince ten, f-stop ve photoreal karşı-terimleri değişiyor; STYLE uzunluğu ise tek başına hüküm değil, sarı sinyal. Yani motor değiştirmek sadece promptu kısaltmak değildir; aynı çekim niyetini yeni motorun öncelik diline çevirmektir.

- Tavsiye: GPT2 için ayrı bir “lehçe kartı” oluşmadan sadece literal-port pilotu yap; başarılı olursa ikinci turda motor-native çeviri dene.
- Maliyet: İlk tur 4 GPT baskısı; ikinci tur yalnız başarısız ama umut veren sınıflara.
- Risk: Literal port başarısızlığını GPT2 kapasitesi sanmak; native rewrite başarısını da dünya tutarlılığı sanmak.

## 4. En ucuz ayırt edici deney

İlk deney 4 kare × 2 motor = 8 baskı. Daha azı, motor farkıyla üretim rastlantısını ayıramaz; daha fazlası ilk karar için gereksiz pahalı.

Aynı projeden, aynı çözünürlük/oran/kadraj niyetiyle:

1. K13 — yüz taşıyan kare, ama Hücre §4’teki düzeltilmiş yüz-ışık metniyle.
2. K07 — ikinci yüz vakası; farklı ışık geometrisinde aynı yüz testi.
3. K24 — geçirgen madde / mitokondri, yazısız kavram testi.
4. K25 — “MİTOKONDRİ” maddeden kesilmiş Türkçe yazı testi.

Kontrol değişkenleri: aynı sahne fikri, aynı kadraj, aynı ışık olayı, aynı dünya dili, aynı prompt gövdesi, aynı reference yöntemi varsa aynı reference yöntemi. Motor dışında hiçbir yaratıcı karar değişmez.

Sıra:

1. NB2 ve GPT2 çıktılarını model adı görünmeden dosyala.
2. Mami önce “kabul / küçük revize / baştan” hükmü versin.
3. Sonra şu sırayla bakılsın: dünya dili → sahne fikri/fizik → sınıf testi → revize yükü.
4. GPT2 ancak bir sınıfta NB2’den daha az revizeyle kabul alır ve komşu NB2 karelerinden kopmazsa o sınıfı kazanır.

Bu deney kimlik tekrarını ölçmez. GPT2 ilk turu geçerse ikinci, dar test: aynı karakterin ardışık iki karesi, aynı referans mekanizmasıyla 4 baskı. Geçmeden karakter hattına alınmaz.

- Tavsiye: İlk turu “genel motor seçimi” değil, yüz/challenger elemesi olarak kullan.
- Maliyet: 8 baskı; kimlik testi yalnız gerekirse +4.
- Risk: Bu deney geniş mekân ve kalabalık için hüküm vermez; o sınıflar açıkça **bilinmiyor** kalmalıdır.

## 5. Çok motorlu hattın kıracağı şey

Tek motorun gizli garantisi sadece estetik değil, hata biçimidir: bütün kareler aynı tür parlamayı, lens yorumunu, deri/malzeme varsayımını ve kompozisyon refleksini taşır. İki motor karışınca en çok şu yerlerde kopar:

- Ardışık iki karakter karesinde ten, göz ve yüz terminatörü,
- Aynı ışık olayının sekans boyunca tonu,
- Aynı materyalin shader davranışı,
- Geniş kurulumdan yakın plana geçiş,
- Aynı karakterin yaş/baş/oran algısı,
- Motion’a giren karede Kling’in devraldığı görsel fizik.

Foto-gerçekçi K02/K04 vakası bunun hazır kanıtı: plastiklik azaldı ama EDU dünyası öldü. “Yüz daha iyi” tek başına kabul kıstası değildir.

Telafi bir “motor karıştırma” değil, motor sınırı koymaktır:

- Motoru kare başına değil, mümkünse sekans başına kilitle.
- GPT2 kazansa bile onu NB2 karakter sekansının ortasına tek kare olarak sokma; izole kavram insert’i veya kendi kısa mini-sekansı olsun.
- Her aday kareyi seçili iki NB2 komşusuyla üçlü incele.
- Ortak kilit kartı tut: lens/ölçek, ışık kaynağı ve yönü, malzeme davranışı, palet ışığı, karakter referansı, TEXT fiziği.
- Magnific upscale/referans işlemini “eşitleyici filtre” sanma; bu da ayrıca test edilmemiştir.

- Tavsiye: İlk çok-motor kullanımını yalnız komşuluk riski düşük, tekil insert karelerle sınırla.
- Maliyet: Her aday için komşu-kare denetimi.
- Risk: Motor başına ayrı güzel kareler, kurguda tek bir film gibi görünmeyebilir.

## 6. Motion tarafı

Motion karşılığı şu sorudur:

> Bu start-frame sınıfı ve bu tek hareket yayı için, hangi motor + hangi motion lehçesi klibin gerçekten değişmesini sağlarken kimlik, yazı, katı fizik ve kurgu akışını en az bozuyor?

Şu an Kling 3.0 için lehçe var; karşılaştırmalı motor kanıtı yok. `engine.ts`te Seedance, Veo, Runway vb. için lehçeler bulunması, onların MAMILAS’ta daha iyi olduğunun kanıtı değildir. Önce Kling’in kendi temel performansı ölçülmeli.

Kling için mevcut kesinler:

- Onaylı start frame hakikattir; yalnız değişen şey yazılır.
- Yazı üretilmez, yazı taşıyan nesne hareket etmez, kamera yazıya yaklaşmaz.
- Tek sebep → etki → yerleşme yayı gerekir.
- Katı/metal/cam ve hızlı kamera warp riskidir.
- Motion prompt metni değil, gerçek klip denetlenmelidir.

İlk motion deneyi motor değiştirmek olmamalı. Önce aynı tipte 4 onaylı karede iki Kling yaklaşımını kıyasla: eski kilit-ağır/duran yaklaşım ve doğal jest + sebepli yay + kare-özel kısa kilit yaklaşımı. Sonra klipleri şu altı kayıtla izle: “ne oldu?” okunuyor mu, kimlik duruyor mu, yazı/fizik sağlam mı, bitişte gereksiz duruyor mu, duygu yayı var mı, kurguda komşusuna akıyor mu?

Ancak bu baseline’dan sonra alternatif video motoruna aynı dört risk sınıfıyla geçilebilir: yüz/jest, yazı, katı nesne, geçirgen ışık.

- Tavsiye: Motion motor kararını önce gerçek kliplerden bir “kusur matrisi” çıkararak başlat; prompt sayısından değil.
- Maliyet: İnceleme zamanı ve 8 hedefli Kling baskısı.
- Risk: Baseline olmadan başka motora geçmek, Kling kusurunu mu yoksa prompt/kare kusurunu mu değiştirdiğini belirsiz bırakır.

