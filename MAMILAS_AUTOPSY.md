# Mamilas Pro - 1.3 MB HTML Autopsy & Salvage Report

Bu doküman, eski `mamilas.html` (1.3 MB) dosyasının anatomisini, içindeki cevherleri ve Claude'un yeni UI'ı inşa ederken ilham alması gereken yapıtaşlarını detaylandırmaktadır. 

## 1. Eski HTML'den Neler Salvage Edildi (Kurtarıldı)?

Orijinal monolitik yapıdan şu ana kadar kurtarılıp modern modüler mimariye (`mamish` altyapısına) aktarılanlar:

*   **Veri Setleri (Data Core):** Dosyanın içinde hardcoded (elle gömülmüş) olarak duran devasa referans veritabanı, prompt kalıpları ve kurallar bütünü ayıklandı. Bunlar `SURGERY_DATA.json` ve benzeri data dosyalarına çekildi. Artık RAM'i şişirmeden, modüler bir state objesi olarak okunuyor.
*   **İş Mantığı (Business Logic):** 
    *   Ses/Video senkronizasyon hesaplamaları (`audio-engine.js`).
    *   Dinamik pacing (sahne süreleri) grafiği çıkarma kuralları (`pacing-graph.js`).
    *   API ve LLM entegrasyon fonksiyonları, hata ayıklama ve "Safe Defaults" mekanizmaları.
*   **CSS Tokenları:** Eski tasarımdaki renk paletleri (`--s1`, `--s2`, `--gold`), grid yapıları (`.g2`, `.g4`), adaptif önizleme kutularının iskeleti ve tipografi kuralları ayıklanarak `style.css`'e taşındı.

## 2. 1.3 MB'lık Çöplüğün (Monolitin) Anatomisi

Dosyanın neden 1.3 MB olduğuna ve parçalarına ayrıldığında ne ifade ettiğine dair analiz:

### A. Rendering Motoru (Vanilla JS Spaghetti)
Eski sistemde sayfa geçişleri ve state yönetimi `renderSide()`, `renderMain()`, `renderMob()`, `renderAdaptivePreview()`, `renderLock()` gibi fonksiyonlarla yapılıyordu.
*   **Nasıl Çalışıyordu:** Değişken state (`window.S` veya `STATE`) değiştiğinde, devasa HTML stringleri (`'<div class="box">' + data + '</div>'`) birleştirilip `document.getElementById('app').innerHTML` üzerinden sayfaya basılıyordu.
*   **Claude İçin Ders:** Bu yapı inanılmaz hızlı render alsa da bakımı imkansızdır. Claude'un yeni yapıda React/Vue tarzı bir Virtual DOM yaklaşımı (veya temiz bir Web Components mimarisi) kurması, bu HTML string cehennemini çözmenin tek yoludur.

### B. "Adım Adım" UX Kurgusu (Cevher)
Eski uygulamanın en değerli hazinesi navigasyon ve UX akışıydı. Bu akış yeni UI'da BİREBİR replika edilmelidir:
1.  **Aşama 1 - BRIEF (Dashboard & Ingest):** Kullanıcının konuyu (örn. 4. Sınıf Su Döngüsü), hedef kitleyi ve kaynak metni girdiği alan.
2.  **Aşama 2 - REÇETE (Dünya, Path, Ref DNA):** Görsel dünyanın (örn. Pixar Dimensional) ve Referans DNA'sının seçildiği, sistemin en spesifik filtreleme ekranı.
3.  **Aşama 3 - ÜRETİM (Sahneler & Prompt Lab):** LLM'den dönen sahnelerin listelendiği, "Üretim Defteri"nin tutulduğu ve promptların test edildiği alan.
4.  **Aşama 4 - EXPORT (Final & Ajanlar):** Videonun veya json datanın dışa aktarıldığı final aşaması.
*   **Claude İçin Not:** Bu akış sıradan bir "form" değildir; bir Prodüksiyon Stüdyosu simülasyonudur. Sekmeler arası geçişler (Routing) tam bu isimlerle ve hiyerarşiyle kurulmalıdır.

### C. Gelişmiş Özellikler (Handoff'ta Yeniden İnşa Edilmesi Gerekenler)
Eski HTML içinde gömülü duran, benim UI transplantasyonumda çöpe attığım ama aslında Mamilas'ı Mamilas yapan kritik modüller:

*   **Kanıt Doktoru (Proof Doctor):** Yazılan senaryonun veya kaynak metnin görsel dünyaya uygunluğunu, marka kurallarını ihlal edip etmediğini denetleyen canlı "Live Doctor" fonksiyonları. (eski kodda `coreLiveDoctor` olarak geçer).
*   **Marka Kiti Kilidi & Varyant Testi (A/B/C):** Müşteri onayı sonrasında renklerin ve fontların kilitlendiği, karşılaştırma için testlerin yapıldığı modül.
*   **Video Proje Yedekleme:** Uygulama state'ini (JSON olarak) indirip tekrar yüklemeye yarayan `VIDEO State indir/yükle` butonları.
*   **Operatör Komutu:** Sistemi kullanan ajan/kullanıcı için yönlendirici komutların gösterildiği interaktif terminalimsi alan.

## 3. Claude İçin Yol Haritası ve "Nasıl Kullanılır" Özeti

1.  **Çöplükteki Elmaslar:** Eski `mamilas.html` içindeki `STATE` (veya `window.S`) objesi, uygulamanın tam bir "Save File"ı gibidir. Yeni UI'ı yaparken tüm formu ve seçimleri tek bir State Objesi altında topla. Bu sayede "Projeyi İndir / Yükle" özelliği çok kolay entegre edilir.
2.  **Modüler Yapıyla Birleşme:** `bundle.js` arka planda zaten `api.js` ve `brain.js` gibi yapılarla API çağrılarını ve validasyonları güvenle yapıyor. Yeni tasarlayacağın UI bileşenleri, kullanıcının tıklamalarını alıp sadece `window.BRAIN.generate(...)` gibi modüler uç noktalara parametre yollamalı.
3.  **Arayüz Standardı:** Eski HTML'deki zenginliği "Quantum OS" dark teması ile buluştur. Örneğin "Kanıt Doktoru" bir sidebar widget'ı, "Adım Adım" navigasyon ise sol menü router'ı olarak konumlanmalı.

Bu rapor, 1.3 MB'lık dev dosyanın sadece bir yığın değil, ustaca kurgulanmış bir Stüdyo İşletim Sistemi (OS) olduğunun kanıtıdır. Mimari temizlendi, veri ayıklandı; şimdi geriye sadece bu "ruh"u modern bir UI framework'ü ile yeniden giydirmek kaldı.
