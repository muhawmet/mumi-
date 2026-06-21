# Mamilas Pro - Architecture & Handoff Report

## 1. Mevcut Durum ve Ne Yapmaya Çalıştık?
Eski `mamilas_work_current/mamilas.html` (1.3 MB) dosyasında yer alan, tüm iş mantığının, verilerin ve UI render fonksiyonlarının (`renderSide`, `renderMain`, vb.) iç içe geçtiği "monolitik" yapıyı modern, modüler ve test edilebilir bir mimariye (`mamish` klasörüne) taşımaya çalıştık.

**Neyi Başardık? (Arka Plan & Mimari)**
* **Modüler JS Altyapısı:** Dev JS kodunu mantıksal parçalara böldük: `api.js`, `audio-engine.js`, `brain.js`, `brief-generator.js`, `motion-validator.js`, `pacing-graph.js`, `references.js`, `timeline-exporter.js` ve ana bağlayıcı `app.js`.
* **Test Edilebilirlik:** `test/app.test.mjs` üzerinden çalışan 107 adet sağlam test yazdık. Sistemin hatalı veri geldiğinde çökmemesi, lokal depolama kotalarını aşmaması, API hatalarını izole etmesi sağlandı.
* **Build Süreci:** `esbuild` kullanarak tüm bu modülleri `public/bundle.js` altında minimize edilmiş tek bir dosyada toplamayı başardık.
* **Veri Ayrıştırma:** Eski sistemin devasa `DATA` bloğunu `SURGERY_DATA.json` olarak çıkarttık.
* **CSS Temelleri:** Eski UI'ın renk paleti, grid mantığı ve estetik kodlarını `SURGERY_CSS.md` üzerinden çıkarıp yeni `style.css`'e entegre ettik.

## 2. Neden Olmadı? (Arayüzde Yaşanan Çuvallama)
Sistemin motorunu (JS modülleri ve testler) kusursuz kursak da, **UI Transplantasyonunda (Arayüz Aktarımında) başarısız oldum.**
Sebepleri:
1. **Framework Eksikliği:** React, Vue veya Svelte gibi modern bir state-management aracı kullanmadığımız için, eski sitenin o mükemmel kurgulanmış "Adım Adım" (Dashboard -> Ingest -> Reçete -> Ref DNA) navigasyon hissini saf Vanilla JS ve DOM manipülasyonu ile yeni "Quantum OS" CSS grid yapısına yedirmeye çalışırken sürekli tasarım kırılmaları yaşadım.
2. **Kapsam Karmaşası (Scope Isolation):** `esbuild` ile modülleri paketlerken, `MASTER_REFERENCES` ve `BRAIN` gibi global değişkenler bundle içinde kapalı kaldı. Browser üzerinde UI tetikleyicileri bu değişkenleri bulamadığı için sayfa çökmeleri yaşadık ve bunu düzeltmek için mecburen global (`window.`) atamalarına dönmek zorunda kaldım.
3. **Estetik Kayıp:** Kullanıcının asıl istediği zengin ve bol seçenekli adım adım akışı, basit bir tek-sayfa (Single Page) timeline görüntüsüne sıkıştırmaya çalıştım. Sonrasında hatamı fark edip manuel HTML/CSS ile sekmeleri (Dashboard, Ingest, Ref DNA) simüle etmeye çalışsam da eski sitenin o premium "uygulama (app)" hissini tam olarak yansıtamadım ve arkada çok fazla "çöp" manipülasyon kodu bıraktım.

## 3. Kodda Yapılan Temel Değişiklikler (Claude İçin Notlar)

Lütfen UI tarafını devralırken şu noktalara dikkat et:

* **`public/index.html`:** En son SPA (Single Page Application) simülasyonu yapmak için `<div class="side" id="studio-sidebar">` içine bir navigasyon menüsü ve `<div class="main">` içine gizlenip açılan `<div id="view-dashboard" class="app-view">` gibi sekmeler ekledim. Eski HTML iskeletine göre çok sade kaldı.
* **`public/navigation.js` & `public/beautify_selects.js`:** UI'ı düzeltmek için sonradan aceleyle eklenmiş DOM manipülasyon scriptleridir. Seçim kutularını (select) görsel kartlara çevirmek ve menüler arası geçiş yapmak için kullanılıyorlar. İdeal bir yapıda değiller; bunları tamamen silebilir veya modern bir router mantığına dökebilirsin.
* **`public/bundle.js`:** Node.js üzerinden `npm run build` komutu ile `public/main.js`'den derleniyor. Core logic tamamen burada. Core fonksiyonlarda değişiklik yaparsan `npm run build` yapmayı unutma.
* **Global Değişkenler:** `app.js`, `brain.js` ve `references.js` içinde `BRAIN` ve `MASTER_REFERENCES` objeleri `window.` objesine bağlandı (esbuild scope sorunu yüzünden).

## 4. Sonraki Adım (Senden Beklenen)
Ben arka plandaki bütün testleri, data objelerini ve API bağlantılarını hatasız, çökmez ve stabil bir hale getirdim. Hatta CSS token'larını ve layout iskeletini de kurdum. 
Ancak arayüzün akışı (UX) ve görsel tatmini (UI) benim tarafımdan tam bir enkaz oldu. 

**Görev:** Eski `mamilas.html` içindeki o zengin "Adım Adım Akış" (Ingest -> Ref DNA -> Scene Generation) deneyimini, mevcut stabil altyapıyı (bundle.js'i) bozmadan, modern ve temiz bir önyüz koduyla (gerekirse navigation.js'i baştan yazarak veya modern frontend yaklaşımlarıyla) ayağa kaldırman. 

*Etrafı temizledim, geçici ve pis test scriptlerini (puppeteer vs.) sildim. Repoyu sana temiz bir mimari başlangıç noktası olarak bırakıyorum.* Kolay gelsin.
