# YENİ STANDART DENETİMİ — Hayvanlarda Üreme, Büyüme ve Gelişme

**Kapsam:** 54 yazılı start-frame promptu ve yan kitler incelendi; kare **0/54**, motion yok. Bu nedenle yalnız metin/plan kanıtı vardır; görsel, klip ve gerçek kurgu hükmü kurulmamıştır.

| # | Başlık | DURUM | Sayı / kanıt | ONARIM |
|---|---|---|---|---|
| 1 | Sekans omurgası | **KUSURLU** | Enzimde 6 makro grup var; S2 **14**, S4 **16** kare ve `SEKANS DAĞILIMI` yalnız “yer / ne anlatıyor” düzeyinde. 54/54 kart tek VO cümlesine bağlı; her grup için ayrı **soru → gözlemsel kanıt → dönüşüm/reveal → köprü** ve 15–30 sn yay yok. | 6 makro grubu 3–6 karelik 15–30 sn sekans kartlarına böl; her karta dört yay parçası ile ENTRY/EXIT sözleşmesini yaz. |
| 2 | Motion açılış tekdüzeliği | **UYGULANAMAZ** | Motion dosyası/bloku **0**; bu yüzden açılış cümlesi çeşit sayısı **0**, ölçülecek 54 motion yok. | Onaylı karelerden sonra motion yazılırken her sekansın giriş/çıkış ritmini ayrı kur ve açılış kalıbını teslimden önce say. |
| 3 | Kesim cümle sınırında mı? | **KUSURLU** | EDIT-PLAN **0**, kayıtlı L/J kesim **0**; buna karşılık VO belgesi açıkça “**BİR CÜMLE = BİR KLİP**” diyor ve 54 prompt/54 VO eşleşiyor. | Gerçek VO + onaylı karelerle EDIT-PLAN/ANIMATIC-0 kur; kesimlerin bir bölümünü cümle içi L/J ses taşımasına bağla. |
| 4 | Ses haritası | **KUSURLU** | SUNO, 6 grup için yalnız müzik yoğunluğu yazıyor; sekans başına ortam + foley + reveal vurgusu + geçiş + bilinçli sessizlik içeren tam harita **0/6**. Ayrı SFX planı yok. | ANIMATIC-0’la birlikte her yeni sekansa bu beş ses slotundan yalnız anlam taşıyanları yaz. |
| 5 | K01–K08 açılış kuşağı | **TEMİZ** | K01–K08 için ayrı açılış omurgası var; **8/8** kartta FİKİR ve PLAN satırı yazılmış. K01’in kırık yumurta/kapalı göz/devrik sepet durumları K54’te üç kontrollü farkla aynalanıyor. | Bu kuşağı koru; yalnız #6’daki zincir tablosuna K01–K08’in devralınan fiziksel durumlarını ekle. |
| 6 | Ardışık zincir kilidi | **KUSURLU** | Literal `ENTRY STATE` **0**, `EXIT STATE` **0**. Yalnız K47–K52’de kavram ışığı için açık bir 6-kare zincir ve K01↔K54 uzak ayna kilidi var; tüm ardışık 3–5 kare koşuları için nesne/ışık/kamera durumu yok. | Değişen her 3–5 karelik koşu için “önceki durum → bu karede değişen tek şey → sonraki devralım” satırını ekle. |
| 7 | Sabit dünya kuyruğu | **KUSURLU** | `STYLE`, `LIGHT AND PALETTE`, `NEGATIVE` satırları biçimsel olarak **54’er farklı** sürüm; fakat STYLE ort. **117** kelime (≤90 sınırını aşıyor), LIGHT ort. **140** kelime ve **59 kelimelik ortak son ek** taşıyor. Negatif A paketinde 27/27 kartta aynı **16** katalog maddesi var. | Her STYLE’ı ≤90 kelimeye indir; yalnız ölçülmüş motor/safety/süreklilik kilidini tut, ortak dekoratif kuyruğu ve §0.3’ü geçmeyen kuralları sök. |
| 8 | Kaynağın tonu | **TEMİZ** | VO meraklı ve çatışmasız; promptlarda Efe’ye kayıtsızlık/ön yargı, dışlanma, suçluluk veya yapay barış yayı yüklenmiyor. “Risk”, kaynağın dış döllenme bilgisinin sonucu. | Değiştirme: sonraki omurgada gerilimi çatışmadan değil merak, fark ediş ve dönüşümden üret. |
| 9 | Olumsuz yazım | **KUSURLU** | NEGATIVE satırları ort. **214** kelime / **17.6** noktalı-virgül maddesi. A paketi: ort. **256** kelime, 27/27’de 16 aynı madde; B paketi: ort. **171** kelime, 27/27’de 5 aynı madde. Bu, kare-özel 1–2 kilit yerine eski negatif katalog mantığıdır. | Kimlik/varlık/mekân bilgisini pozitif gövdeye taşı; NEGATIVE’de yalnız o karenin kanıtlı tek bozulma yolunu 1–2 maddeyle kapat. |

## Hüküm

**Bu proje yeni standartla üretime hazır mı? HAYIR.** Prompt lint’in kırmızısız olması yalnız yapısal kapıdır; mevcut paket henüz sekans, ses, animatic, kurgu ve motion katmanlarını taşımaz.

Sıralı yapılacaklar:

1. 54 kartı 15–30 sn sekans kartlarına ayır; dört parçalı omurga ile ENTRY/EXIT durumlarını yaz.
2. K01–K08’i koruyarak değişen tüm 3–5 karelik fiziksel zincirleri ayrı tabloda kilitle.
3. Promptlarda STYLE/ışık kuyruğunu ve negatif kataloglarını §0.3’e göre azalt; sadece kare-özel, ölçülmüş kilitleri bırak.
4. Intro start-frame’leri basıp Mami onayı al; sonra **gerçek VO** ile ANIMATIC-0, ses haritası ve L/J içeren EDIT-PLAN üret.
5. Ancak onaylı karelerden motion yaz; 8 kliplik canary ve rolling rough cut ile gerçek klip/kurgu hükmünü al.

## İncelenen kanıt

- `00-DURUM.txt`: kare 0/54, motion yok.
- `Hayvanlarda Üreme_ENZIM.md`: açılış/ayna kilidi ve altı makro sekans.
- `PROMPTLAR/A-K01-K27.txt`, `PROMPTLAR/B-K28-K54.txt`: 54 prompt, STYLE/ışık/NEGATIVE ölçümü.
- `Hayvanlarda Üreme_SESLENDIRME.txt`, `Hayvanlarda Üreme_SUNO.txt`: 1:1 cümle-klip politikası ve yalnız müzik planı.
