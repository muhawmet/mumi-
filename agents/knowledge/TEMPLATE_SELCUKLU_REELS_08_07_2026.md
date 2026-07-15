# Proje: Selçuklu İleri Sınav - Native Reels Prodüksiyonu
**Tarih:** 08 Temmuz 2026
**Konsept:** Lüks, Premium Sınav Hazırlık Kursu (Apple/Rolex Reklam Estetiği)
**Hedef:** 12 Sahnelik (Beat), YKS hazırlık sürecinin ciddiyetini ve kalitesini anlatan "Thumb-stopping" Native Instagram Reels reklamı.

> **Yeni Ajan İçin Not (Sisteme Yeni Bağlanan Yapay Zeka'ya Talimat):**
> Merhaba. Bu dosya, Mamilas Studio'nun ulaştığı "Kusursuz Premium" AI video prodüksiyon standartlarını içerir. Biz bu projede AI'ın tüm saçmalıklarını (slop, halüsinasyon, TTS hataları) deneyimledik ve çözdük. Benden benzer bir video yapmamı istendiğinde **sıfırdan keşif yapmak yerine doğrudan bu dosyadaki dersleri ve aşağıdaki dosya yollarındaki şablonları** baz almalısın.

---

## 📂 Referans Dosya Yolları (Altın Standartlar)
Aşağıdaki dosyalar, kusursuz bir prodüksiyonun nasıl görünmesi gerektiğinin kanıtıdır. Yeni bir projeye başlarken bu dosyaları okuyup yapısını taklit et:
- **Görsel Tasarım (Image) Şablonu:** `/Users/Muhammet/Desktop/mamilas-modern/agents/done/FINAL_IMAGE_PROMPTS.md`
- **Hareket ve Ses (Motion & VO) Şablonu:** `/Users/Muhammet/Desktop/mamilas-modern/agents/done/FINAL_MOTION_AND_VOICEOVER_PROMPTS.txt`
- **Kurgu ve Senkronizasyon (Edit) Şablonu:** `/Users/Muhammet/Desktop/mamilas-modern/agents/done/PREMIERE_EDIT_PLAN.txt`

---

## 🚫 Kritik Hatalar ve Çözümleri (Lessons Learned)
Bu projede AI ajanlarının yaptığı "sloppy" (dikkatsiz) işler ve bunların nihai temizlenme yöntemleri:

### 1. Motion Aşaması: "AI Slop" ve İnce Motor Zehirlenmesi
*   **Hata:** Kling 3.0 gibi I2V motorlarına `writes`, `draws`, `turns page` gibi ince motor yetenekleri gerektiren eylemler verildiğinde; AI eli bozar, uzaylı yazıları (slop) üretir ve lüks hissiyatı çöpe atar.
*   **Çözüm:** Asla yazı yazdırılmaz! Eylemler ağır çekim ve kamera hileleriyle değiştirilir.
    *   *Kötü:* "Öğrenci deftere formül yazar."
    *   *Doğru:* "Kamera kalemin ucundan öğrencinin odaklanmış yüzüne yavaşça rack focus yapar." (Rack focus, slow-motion, dolly-in, parallax kullanılır).
*   **Koruma Kalkanı:** Tüm motion promptlarının sonuna şu negatif prompt EKLENMEK ZORUNDADIR:
    `[Negative: writing, drawing, scribbling, pen touching paper, text warping, logo melting, letter morphing. The overlaid text and logo must remain 100% static, locked, and unaffected by camera/subject motion.]`

### 2. Motion Aşaması: Görsel Olmayan Halüsinasyonlar (Ghost Objects)
*   **Hata:** Ana görselde (Start Frame) hoca olmamasına rağmen, motion promptuna "Arkadaki hoca sabit durur" yazıldığı için AI'ın yoktan, ucube bir hoca karakteri yaratıp (halüsinasyon) kompozisyonu bozması.
*   **Çözüm:** Start Frame'de olmayan HİÇBİR obje veya kişi motion promptunda zikredilmez. İstenmeyen şeyler negatif prompt ile (`teacher, extra people`) yasaklanır. Kamera sadece var olan karaktere odaklanır.

### 3. Seslendirme (ElevenLabs) Aşaması: TTS Katliamı
*   **Hata:** ElevenLabs'in Türkçe kısaltmaları İngilizce mantığıyla okuyup projenin ciddiyetini bozması. (Örn: "YKS"yi "Ye Ke Se" veya "Pe Ke Ke" gibi okuması).
*   **Çözüm:** TTS motoruna verilecek metinlerde tüm kısaltmalar fonetik olarak Türkçe yazılır. `YKS` -> `Ye Ka Se`.

### 4. Kapanış ve Geçiş Sahneleri (Node Interpolation)
*   **Hata:** Başlangıç (Start) ve Bitiş (End) frame'lerinin olduğu Node geçişlerinde sahneyi "A ve B" diye ikiye bölüp kafa karışıklığı yaratmak.
*   **Çözüm:** Node tabanlı geçişlerde (Interpolation) tek bir prompt yazılır. "Smooth, elegant cinematic interpolation. The camera gently pushes in as the foreground text smoothly dissolves into the final logo."

---

## 🎬 Kurgu ve Tempo Notu
Müşteriler veya dış gözler videonun temposunu "düşük" bulabilir. **Bunun böyle olması gerekir.** Apple, Rolex veya üst segment eğitim kurumlarının reklamları TikTok jump-cut'ları yapmaz; kendinden emin, ağır çekim (slow-motion), asil bir tempo (Premium Pacing) kullanır. Bu proje, "hızlı ve ucuz" değil, "ağır ve lüks" olmak üzere tasarlanmıştır ve müzik (deep bass, ticking clock) bu ritmi destekler. Editte her zaman "Hard Cut" kullanılır, ucuz geçiş efektlerinden (transition) kaçınılır.
