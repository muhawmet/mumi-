# 🎬 MAMILAS MODERN: MİRA VE EFE EMSAL DAVA & BAŞUCU REHBERİ

> *"Biz sadece video üretmiyoruz, bilimsel gerçekliği sinematik bir Pixar şaheserine dönüştürüyoruz."*

Bu başucu rehberi, Mamilas Modern'in **"Güneşin Sırları"** projesinde deneme yanılma, kriz çözme ve kurgu dehasıyla kazanılmış **Altın Kuralları** içerir. Gelecekte üretilecek tüm *Mira ve Efe Eğitim Serisi* videolarında bu belgedeki kanunlar **tavizsiz** uygulanacaktır. Bu bir yapay zeka dokümanı değil; görüntü yönetmeni, pedagog ve baş kurgucunun ortak anayasasıdır.

---

## BÖLÜM 1: START FRAME (NANO BANANA 2) DİNAMİKLERİ

### 1.1. Estetik Standart: Pixar 3D CGI
Görseller hiçbir zaman "gerçekçi (photorealistic)" veya "2D çizim" olamaz. Standartımız her zaman Pixar RenderMan kalitesinde 3D CGI'dır.
- Işıklandırma daima karakterin veya objenin duygu durumunu desteklemelidir (Cinematic single motivated key light).
- Siyah gölgeler yerine daima sıcak/soğuk "bounce fill" (yansıyan ışık) kullanılmalıdır. Sahnelerde kömür karası (hard-black shadow) yasaktır.

### 1.2. Pedagojik Sorumluluk (Galileo Vakası)
Eğitim materyali ürettiğimiz için, sahnede gösterilen her hareketin çocukta oluşturacağı bilinçaltı etkisi hesaplanmalıdır.
> [!CAUTION]
> **Galileo Vakası:** Teleskop sahnesinde Galileo'nun Güneş'e doğrudan bakması, çocukların bunu taklit edip gözlerine zarar vermesi riskini taşıyordu. Bu kriz, hareketin (Motion) **"gözünü vizörden çekip düşünceli bir şekilde masadaki haritalara bakması"** şeklinde değiştirilmesiyle aşılmıştır.
> **KURAL:** Hiçbir insan referansına tehlikeli, taklit edildiğinde zarar verecek eylemler yaptırılamaz. Riskli anlarda aksiyon, eylemin *düşünsel* kısmına (çeneyi sıvazlama, kitaba bakma vb.) kaydırılmalıdır.

---

## BÖLÜM 2: I2V KLING 3.0 & HAREKET KANUNLARI

### 2.1. Anti-Overacting (Doğallık Kilidi)
Kling 3.0, "şaşırma, merak etme, keşfetme" gibi duyguları yorumlarken karakterlerin gözlerini yuvalarından fırlatıp abartılı (cartoonish shock) tepkiler vermeye çok meyillidir. Bu, projenin "Premium Eğitim" hissini yok eder.
> [!IMPORTANT]
> Tüm karakter (Mira/Efe vb.) hareket promptlarına şu kilit komut mutlaka eklenmelidir:
> `NEGATIVE AVOID: morphing, overacting, extreme surprise, exaggerated facial expressions, unnatural astonishment, bulging eyes, cartoonish shock.`
> *Karakter her zaman "subtly curious" (doğal ve naif bir merak) içinde olmalıdır.*

### 2.2. I2V Anchor Law (Kurgu Kilidi ve 1.5s Sabitleme)
Her video klibinin kusursuz bir Premiere kurgusuna oturması için saniye matematiği şansa bırakılamaz.
- Tüm Kling promptlarının sonuna eklenmesi zorunlu kural:
  `The action attacks in the first second, completes its cause-and-effect event by 70% of the clip, and gracefully settles into a stable, frozen 1.5s final hold.`
- **Kurgu Hilesi:** Bu 1.5 saniyelik "buzlanma" (frozen hold), Premiere'de editörün videoya sağ tıklayıp "Add Frame Hold" demesiyle videonun kalitesi bozulmadan sonsuza kadar uzatılabilmesine olanak tanır. Seslendirme videodan uzun gelse bile asla senkron sorunu yaşanmaz.

---

## BÖLÜM 3: POST-PRODÜKSİYON VE KURGU SANATI (PREMIERE & AUDIO)

### 3.1. J-Cut "İkinci Kelime" Matematiği
Bir belgeselin akıcılığını sağlayan şey, görselin sesle milimetrik dansıdır.
> [!TIP]
> **Editörün Pusulası:** Sahneler asla seslendirmenin birinci kelimesinde ekrana (timeline'a) düşmemelidir!
> Seslendirme başlar, eski görüntü yankılanır ve aksiyon/kesme (Cut) işlemi tam olarak **İKİNCİ KELİMEDE** (Örn: "Güneş, DÜNYA'MIZ gibi...") gerçekleşir.
> *Kurgu planları oluşturulurken, 2. kelimeler daima BÜYÜK HARFLE yazılarak editöre "vuracağı nokta" gösterilir.*

### 3.2. ElevenLabs v3 ve Müzik Miksajı
- **ElevenLabs v3 SSML:** Eski usul "iki satır boşluk bırakma" tekniği v3'te işe yaramaz. Sahneler arası tam sessizlik ve doğal tonlama için `.cjs` veya `.py` botlarımız, ses metninin her satırının arasına mutlak suretle `<break time="1.5s" />` etiketini (tag) enjekte etmelidir.
- **Auto-Ducking:** Suno 5.5 "Vibrant Education" tarzı orkestral müzikler, Premiere Essential Sound'da "Music" olarak işaretlenir ve diyalog girdiği an otomatik olarak **-14dB** seviyesine inmelidir (Auto-ducking). Müzik asla eğitimin önüne geçmemelidir.

---

## BÖLÜM 4: ACIMASIZ QA (KALİTE KONTROL) DERSLERİ
"Güneş" projesinin final render'ı incelendiğinde gelecekte asla tekrarlanmaması gereken 3 majör hata tespit edilmiş ve yasaklanmıştır:

### 4.1. Hayalet Dudak (Phantom Mouth) Sendromu
Sahnede karakter konuşmuyorsa, dudakları MİLİMETRE dahi oynamamalıdır. AI, yüz algıladığında rastgele ağız oynatmaya meyillidir.
> **YENİ KURAL:** Seslendirmesi olmayan tüm karakter motion promptlarına `closed mouth, perfectly still lips, no talking` komutu ZORUNLU eklenecektir.

### 4.2. Kimlik Kayması (Identity Drift)
Mira'nın yatak odasındaki yaşıyla (6-7), uzaydaki yaşı (10-11) arasında görsel farklılık (yüz hatlarında keskinleşme) tespit edilmiştir.
> **YENİ KURAL:** Tüm Pass A (Image) promptlarında karakterin yaş ve yüz morfolojisi (Örn: `7-year-old, round face, chubby cheeks`) her sahnede kelimesi kelimesine aynı bırakılmalı, kıyafet değişse bile anatomi promptları ASLA değiştirilmemelidir.

### 4.3. Metinlerde Mikro-Titreşim (Text Wobble)
Kling 3.0 tabelaları mükemmel korusa da, kamera metne çok yaklaştığında harflerde jöle gibi bir titreme (flicker) olmaktadır.
> **YENİ KURAL:** İçinde belirgin metin/tabela olan sahnelerde kamera hareketleri "Yavaş ve Agresif Olmayan" (Örn: `extremely subtle micro-movement, static text lock`) seviyeye çekilmeli, hızlı pan veya zoom yapılmamalıdır.

---
*İmza: Mamilas Modern Otonom Kreatif Ekibi.*
