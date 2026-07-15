# MAMILAS Buyer Audit — 13 Temmuz 2026

## Sonuç

MAMILAS sıradan bir “prompt oluşturucu” değil; güçlü bir yaratıcı yönetmenlik ve üretim güvenliği sistemi. Görsel kimliği, world/palette/reference DNA kütüphanesi ve özellikle `project.json` içindeki frame/motion gate sözleşmesi ürünün en değerli tarafları. Buna karşılık mevcut sürüm, alıcıya güven veren tek bir gerçeklik sunmuyor: canlı önizleme seçilen ürün dünyasıyla uyuşmuyor, planlanan ve üretilen sahne sayıları ayrışıyor, açıkça istenen baked-in marka metni clean plate'e dönüyor ve bazı ekranlar bu tutarsızlıklara rağmen QA 100/PASS gösteriyor.

**Genel alıcı puanı: 7.2 / 10**

Konumlandırma: güçlü ve özgün bir production cockpit / uzman prototipi; henüz “güvenle satın al, brief ver, paketi indir” seviyesinde buyer-safe SaaS değil.

## Puan kartı

| Alan | Puan | Gözlem |
|---|---:|---|
| Görsel kimlik ve premium his | 8.7 | Özgün, sinematik, hatırlanabilir. |
| Yaratıcı sistem / recipe zekâsı | 9.0 | 46 world, 12 palette, 130 reference DNA; world law metinleri üretim açısından güçlü. |
| Export ve ajan sözleşmesi | 8.8 | Kaynak bütünlüğü, IP firewall, frame gate ve motion gate çok iyi düşünülmüş. |
| Akış ve anlaşılabilirlik | 5.8 | Yoğunluk, küçük metin, karma dil ve çelişkili statüler karar vermeyi zorlaştırıyor. |
| Durum tutarlılığı / alıcı güveni | 5.2 | Önizleme, preset, scene count ve text policy aynı gerçeği taşımıyor. |
| Erişilebilirlik | 4.8 | Düşük kontrastlı küçük yardımcı metinler, sıkışık kontrol yüzeyleri ve ağır görsel yoğunluk. |
| Üretime hazır olma | 7.5 | Paket sözleşmesi güçlü; kritik state/text uyuşmazlıkları çözülmeden otomatik güven verilmemeli. |

## En güçlü taraflar

1. **Recipe gerçekten üretim dili konuşuyor.** World tanımı yalnız estetik etiket değil; lens, ışık kaynağı, yüzey fiziği, kamera hareketi, negatif kilit ve palette davranışı tarif ediyor.
2. **Native palette yaklaşımı doğru.** `native_world`, seçilen world'ün palette lock'unu miras alıyor; ayrıca 11 mood palette ışık davranışı olarak tarif edilmiş. Bu, yalnız hex seçmekten daha olgun.
3. **`project.json` ajan için ciddi bir single source of truth.** Kaynak hash'i, exact beat'ler, locks, creative controls, reference DNA, roller ve üretim klasör sözleşmesi birlikte geliyor.
4. **Frame gate ürünün “moat” adayı.** Ajanın yalnız prompta değil gerçek piksele bakması, her checklist satırına görülen kanıt yazması, başarısız karede motion'ı durdurması ve `project.json`ı görüntünün yerine koymaması açıkça şart koşulmuş.
5. **Motion gate doğru sırayı zorluyor.** Onaylanmış başlangıç karesi yoksa final motion prompt yok; export yalnız `motionDraft` taşıyor ve gerçek kare görüldükten sonra frame-specific negatifler istiyor.
6. **QA Cabinet gerçek problemi yakalıyor.** Test akışında `State(6) vs Bundle(3)` farkını kritik ihlal olarak buldu ve Volition bunu üretim engeli olarak yükseltti.

## Kritik bulgular

### P0 — Açık baked-in metin talebi exportta kayboluyor

Kaynak brief, ürün üzerinde yalnızca **“MAMILAS THERMO”** yazısının baked-in görünmesini açıkça istiyor. Üçüncü sahnenin source beat'i bu cümleyi koruyor; fakat `onScreenText` null ve image prompt aynı sahne için “clean plate / no on-screen text” diyor. Hatta kaynak beat'i narration-only olarak işaretleniyor. Bu, kaynak bütünlüğü %100 görünürken anlam bütünlüğünün bozulduğu bir durumdur.

Etki: marka doğruluğu ve frame gate başarısızlığı; ajan hem exact source'u korumaya hem metni göstermemeye zorlanıyor.

### P0 — Tek paket için üç farklı kalite gerçeği var

- Timeline sahneleri: QA 100.
- Sağ gate: PLAN 6 hedef PASS, PACK 3/6 FIX.
- QA Cabinet: 5/7 pass, Encyclopedia ve Volition FAIL/FIX.

QA 100, alıcıya “hazır” anlamı verirken sistemin kendi final jürisi üretimi tutuyor. Kalite skoru prompt hijyenini ölçüyorsa adı ve açıklaması bunu açıkça söylemeli; shipment readiness ile aynı görsel dilde sunulmamalı.

### P1 — Preset ile source ingest aynı state'i farklı şekilde yönetiyor

Ürün preset'i 6 sahne hedefliyor. Source ingest ise atom/beat sayısını state scene count'a yazarak bunu 3'e indiriyor. QA doğru şekilde farkı buluyor, fakat önceki gate PLAN 6'yı hâlâ PASS gösteriyor. Bu bir “hangi alan otorite?” problemidir.

### P1 — Canlı önizleme seçilen recipe'yi temsil etmiyor

Ürün filmi / Product & Brand Commercial seçiliyken Live Canvas karanlık pelerinli şehir kahramanı gösteriyor. Daha önce aynı akışta David Fincher/Kubrick yönü de otomatik öne çıktı. World ve recipe metni doğru olsa bile görsel kanıt yanlış olduğu için alıcının sisteme güveni kırılıyor.

### P1 — İç kaynak isimleri IP risk algısı yaratıyor

Seçim kataloğunda Pixar, Ghibli/Miyazaki, Arcane/Fortiche, Spider-Verse/Sony, MAPPA, Ufotable ve auteur isimleri görünür durumda. Export edilen test paketinde bunlar sızmadı ve firewall “grammar-only/original subjects” yaklaşımını korudu; bu güçlü. Ancak satın alma ekranında açık taklit çağrışımı hukuki ve marka güveni açısından gereksiz risk yaratıyor. Kullanıcı yüzünde özgün world adları, içeride migration alias'ları daha güvenli olur.

### P1 — Prompt paketi gereğinden büyük ve tekrar yoğun

Üç sahnelik `project.json` yaklaşık 304 bin karakter. Her image brief'i yaklaşık 10–11 bin karakter. World law, ref DNA, path contract ve negatifler sahne başına tekrar ediyor. Bu güvenlik sağlıyor ama ajan maliyeti, bağlam gürültüsü ve çelişki ihtimalini artırıyor. Ortak immutable locks tek blokta, scene delta'ları ayrı tutulabilir.

## Orta ve küçük bulgular

- Recipe “9 seçenek” diyor; veri 12 palette içeriyor. Basit ama güven aşındıran bir sayım hatası.
- Director ve Timeline hâlâ “Ekran Metni (AE)” / “AE katman listesi” dili kullanıyor. Buna karşın export sözleşmesi “post-production overlay yok, metin kareye baked-in” diyor. Ürünün iç terminolojisi kendi üretim modelini çürütüyor.
- Source decode ilk satırın 160 karakterini hem topic hem subject yapıyor. Sonuç olarak kısa proje adı kayboluyor ve indirilen dosya adı uzun, kesilmiş, Türkçe karakterleri bozulmuş bir cümleye dönüşüyor.
- 9.6 saniyelik beat “OVER LIMIT” olarak gösteriliyor, fakat düzeltmeden Timeline'a geçilebiliyor. Uyarı gerçek bir üretim sınırıysa geçiş kapısı olmalı; tavsiyeyse kırmızı alarm dili hafiflemeli.
- Timeline'da aynı işi çağrıştıran iki compile/üretim eylemi bulunuyor; seçim maliyeti yaratıyor.
- Türkçe ve İngilizce terminoloji karışımı (Stage, Brief, Director, Recipe, Beat Planner, Cabinet, Gate, Pass/Fix) uzman kullanıcı için anlaşılır olsa da yeni alıcı için öğrenme yükü yüksek.
- Sol rail ve sağ Live Canvas içindeki yardımcı metinler 1280×720 görünümde küçük ve düşük kontrastlı; kritik kararlar okunabilirlik sınırına yaklaşıyor.
- QA Cabinet, kritik engel varken “Yine de indir” sunuyor. Bu kişisel uzman aracı için kabul edilebilir; ticari üründe bypass kullanıcı, zaman ve gerekçe audit kaydı istemeli.

## Recipe / world / palette değerlendirmesi

Kütüphane kapsamı güçlü: **15 production path, 32 project preset, 46 world, 19 material, 130 reference DNA, 12 palette, 7 QA agent**. Sayıdan daha önemli olan, world ve palette kayıtlarının davranışsal olmasıdır.

Test recipe:

- World: `Product & Brand Commercial — Photoreal Hero Object`
- Group: `COMMERCIAL_REAL`
- Palette: `Native — World Default`
- DNA: `Product Macro Surface Proof`, `Tabletop Product Setup`, `Luxury Watch Macro Precision`
- Palette lock: `#1A1A1C`, `#C9C9CE`, `#C0402E`, `#FBFBFD`
- Bias: clean, sculpted, reflective, neutral
- Controls: human trust, macro glide, tabletop control, product match, premium commercial, customer-hand POV, usage payoff, problem/solution tempo

Recipe metni kendi içinde güçlü ve üretilebilir. Sorun recipe'nin kalitesi değil; Live Canvas, Director preset ve text policy'nin bu recipe'yi aynı şekilde taşımaması.

## `project.json` ve komut paketinin durumu

Olumlu:

- Şema isimleri ve versiyonlar açık: `mamilas.command.v2026`, `mamilas.production.v2026`.
- Exact source, hash, locks, world/palette/ref DNA ve creative controls korunuyor.
- Protected auteur/franchise adları test exportunda sızmadı.
- Motion final alanı, kare yokken null; kör motion üretimi önleniyor.
- Folder contract ve frame checklist ajanı operasyonel olarak yönlendiriyor.

Risk:

- Scene 3'ün explicit baked-in text isteği `onScreenText: null` ile çelişiyor.
- Topic/subject source ingest tarafından eziliyor.
- Aynı world law ve negatifler çok kez tekrarlandığı için paket üç sahnede bile çok büyük.
- QA gate state'i export paketinin dışında kullanıcı yüzünde tek bir canonical verdict olarak görünmüyor.

## Teknik doğrulama

- 55 test dosyası / 1.829 test geçti.
- Production build tamamlandı.
- Build, büyük bundle uyarısı veriyor: ana index yaklaşık 1.22 MB, store chunk yaklaşık 725 KB (minified). Bu bir işlev hatası değil; ilk açılış ve düşük güçlü cihaz performansı için izlenmeli.
- QA sayfasındaki ilk dynamic-import hatası, audit kanıt dosyası geliştirme sunucusunun izlediği klasöre yazılırken sunucunun kapanmasından kaynaklandı. Sunucu yeniden başlatılınca QA Cabinet normal açıldı. Bu nedenle ekran kaydı kanıt olarak tutuldu, fakat ürün kaynaklı kalıcı QA route bug'ı olarak puanlanmadı.

## Öncelikli çözüm sırası

1. Tek canonical readiness modeli: scene count, beat limit, text policy, QA score ve export gate aynı state/selector üzerinden konuşsun.
2. Explicit visible-text parser/lock: “baked-in/ürün üzerinde/yazısı görünsün” türü kaynak talepleri `onScreenText` kilidine dönüşsün; clean plate bunu ezemesin.
3. Live Canvas'ı seçili world/palette/DNA'nın gerçek preview kaynağına bağla; uyumsuzsa placeholder değil açık “preview unavailable” durumu göster.
4. Kullanıcı yüzündeki IP isimlerini özgün, açıklayıcı world adlarına taşı; eski id'leri içeride alias olarak koru.
5. Project topic ile raw source'u ayır; ingest kısa proje adını ezmesin.
6. Ortak prompt yasalarını bir defa export et, sahne başına yalnız delta/override taşı.
7. Metin terminolojisinden AE/overlay dilini kaldır; tek baked-in text modeli kullan.

## Kanıt kapsamı

Audit, 1280×720 masaüstü görünümde yeni bir ürün filmi brief'iyle Brief → Director → Recipe → Scenes → Timeline → QA akışını; JSON/command/production exportlarını ve kaynak veri/ilgili state kodunu kapsar. Mobil/responsive, gerçek image-generation sonucu, dış ajan runner'ının uçtan uca çalışması ve uzun-form/multi-cast projeler bu turda test edilmedi.
