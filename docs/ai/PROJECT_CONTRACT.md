# MAMILAS ortak proje sözleşmesi

Bu belge Claude, Codex ve diğer ajanların paylaştığı kalıcı kuralları taşır.
Günlük ilerleme, aktif dal, model fiyatı, geçici hata veya olay günlüğü burada tutulmaz.

## Ürün sınırı

MAMILAS, Mami'nin eğitim ve reklam videosu üretim konsoludur. Site ve `src/core/`
deterministik karar akışı doğruluk kaynağıdır. Ajan çıktıyı inceler ve kanıtlı değişiklik
yapar; motoru brief'e bakarak yeniden icat etmez.

Görsel katman değişikliklerinde wizard → recipe → brief → export akışını ve mevcut
test setini koru. "Build geçti" görsel kalitenin kanıtı değildir.

## Kod kanoniktir

- Otorite sırasının tek kaynağı `brain.ts` içindeki `AUTHORITY_HIERARCHY` sabitidir.
- Motor süreleri ve lehçelerinin tek kaynağı `engine.ts` içindeki sabitlerdir.
- Dünya, referans ve palet verisinin tek kaynağı `SURGERY_DATA.json` dosyasıdır.
- Bu değerleri dokümanlarda yeni literal listeler veya sayılar halinde çoğaltma.
- Bir dokümanın sıralamayı açıkça taşıması gerekiyorsa `docsContract.test.ts` kapsamına
  alınmalı ve kodla kilitlenmelidir.

## Değişmez üretim kuralları

- Palet, motor prompt'una ham hex olarak değil fiziksel ışık diliyle girer.
- On-screen text ya kareye diegetik/baked olarak üretilir ya da hiç kullanılmaz.
- Motion prompt, onaylı başlangıç karesi görülmeden yazılmaz. Prompt PASS ile görsel
  PASS ayrı kapılardır.
- Seçilen dünyanın görsel dili okunmalı; tanınabilir korumalı karakter, eser veya
  ticari marka sızıntısı export firewall'ından geçemez.
- Prompt yoluna giren her yeni metin kaynağını mevcut karakter/eser ve ticari marka
  korumalarına bağlamadan pipeline'a ekleme.
- Kullanıcının cümlesini sessizce scrub etme. Sorunlu terimi bildir ve düzeltilmiş
  cümle için kullanıcıya dön.
- Marka geometrisi, belirli yüz veya dönem bilgisi kaynakta yoksa uydurma:
  `FACT REQUIRED: <eksik bilgi>` ile dur.
- Premiere çıktıları kesme/sıralama, VO/müzik yerleşimi, seviye ve fade sınırındadır.
  Keyframe, compositing, overlay, grading, speed-ramp veya başka editör varsayma.
- Soyut kalite sıfatları yerine gözlenebilir kamera, ışık, malzeme ve hareket davranışı
  yaz.

## Runner sözleşmesi

- Mantık Node runner'da, şerit yasası `kick/<lane>.md` içinde yaşar.
- `.command` ve `.bat` dosyaları yalnızca ince launcher'dır; içlerine iş kuralı koyma.
- Windows ve macOS paketleri birlikte korunur.
- Runner dosya adına değil üretim kapısının gerçek alanlarına bakar.

## Kanıt disiplini

- Kök neden bulunmadan semptom yaması yapma.
- Prompt/üretim kalitesi için gerçek `generateBatch` çıktısı üret ve çıktıyı gözle oku.
- Fixture yalnızca yardımcı kanıttır; gerçek üretim yolunun yerine geçmez.
- Yeni kontrol, builder'ın kendi yazdığı sabiti değil üretilen paketi veya dış girdiyi
  ölçmelidir.
- Değişiklikten sonra farklı bir review geçişi uygula; kendi ilk varsayımını kanıt
  sayma.

## Model ve araç politikası

Model adları bu sözleşmeye sabitlenmez. Proje `.codex/config.toml` varsayılanı zor
işler için ayarlar; kullanıcı seçimi her zaman üstündür. Çoklu ajan yalnızca bağımsız
iş kolları olduğunda kullanılır.

Raster görsel üretimi veya düzenlemesi istenirse yerleşik `imagegen` akışı tercih
edilir. Projeye ait seçilmiş çıktı `artifacts/imagegen/` altına kopyalanır; yalnızca
Codex önizleme klasöründe bırakılmaz. Yerel hedef görsel düzenlenecekse önce görseli
incele ve değişmemesi gereken özellikleri açıkça kilitle.

## Kalite kapısı

- TypeScript: `npx tsc --noEmit`
- Birim/sözleşme testleri: `npx vitest run`
- Üretim derlemesi: `npm run build`
- E2E: değişiklik alanına göre `npm run test:e2e`; bilinen baseline ile yeni kırığı ayır.
- Test silmek ve test sayısını açıklamasız düşürmek yasaktır.
- Commit yapılacaksa yalnızca ilgili dosyaları açıkça stage et; push kullanıcı kararıdır.
