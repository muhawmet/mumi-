# MAMILAS ortak proje sözleşmesi

Bu belge Claude, Codex ve diğer ajanların paylaştığı **mimari** kuralları taşır.

**Kapsam sınırı (2026-07-27):** üretim ve prompt yasası artık burada yaşamıyor —
tek kanonu `agents/PROMPT-YASASI.md`. Günlük ilerleme, aktif dal, model fiyatı veya
olay günlüğü de burada tutulmaz (aktif iş kaydı: `artifacts/current-work.json` → `node scripts/current-work.mjs`; `EXECUTION_STATE.md` arşivdir, otorite DEĞİL). Bir kural iki dosyada
durursa ajan hangisine uyacağını rastgele seçer; bu belge o yüzden dar tutulur.

## Ürün sınırı

MAMILAS, Mami'nin eğitim ve reklam videosu üretim konsoludur. Site ve `src/core/`
deterministik karar akışı doğruluk kaynağıdır. Ajan çıktıyı inceler ve kanıtlı değişiklik
yapar; motoru brief'e bakarak yeniden icat etmez.

**Site TARİF verir, prompt'u AJAN yazar.** Site final prompt üretmez ve prompt içeriğini
tahmin etmez. Hiçbir ajan Mami adına seçim yapmaz.

Görsel katman değişikliklerinde wizard → recipe → brief → export akışını ve mevcut test
setini koru. "Build geçti" görsel kalitenin kanıtı değildir.

## Kod kanoniktir

- Otorite sırası, motor süreleri/lehçeleri ve dünya/ref/palet verisinin tek kaynağı koddur
  (`brain.ts`, `engine.ts`, `SURGERY_DATA.json`). Bu değerleri dokümanlarda yeni literal
  listeler veya sayılar halinde çoğaltma.
- Bir dokümanın sıralamayı açıkça taşıması gerekiyorsa `docsContract.test.ts` kapsamına
  alınmalı ve kodla kilitlenmelidir.
- **Satır sonu içerik değildir.** Hash ve byte karşılaştırması yapan her araç `\r\n`'i
  normalize eder. Repo `core.autocrlf=true` ile checkout ediliyor; normalize etmeyen bir
  kontrol aynı commit'te Windows'ta kırmızı, Mac'te yeşil olur (ölçüldü 2026-07-27).

## Değişmez mimari kurallar

- **Manuel World Studio.** API, otomatik generation, batch veya upscale pipeline değildir.
  İkinci bir lifecycle runner yaratılmaz, otomatik provider çağrısı yapılmaz.
- **Motion prompt, onaylı başlangıç karesi görülmeden yazılmaz.** Prompt PASS ile görsel PASS
  ayrı kapılardır.
- **IP firewall.** Tanınabilir korumalı karakter, eser veya ticari marka sızıntısı export
  firewall'ından geçemez. Prompt yoluna giren her yeni metin kaynağını mevcut korumalara
  bağlamadan pipeline'a ekleme. İstisna: müşterinin kendi markası (`brandKitLock`) — bu yol
  bilinçli olarak açıktır ve yalnız üçüncü-taraf IP + ham hex için taranır.
- **Premiere sınırı.** Çıktılar kesme/sıralama, VO/müzik yerleşimi, seviye ve fade sınırındadır.
  Keyframe, compositing, overlay, grading veya speed-ramp varsayma.
- **Palet motora ham hex olarak girmez** — fiziksel ışık dili olarak girer.

## Runner sözleşmesi

- Mantık Node runner'da, şerit yasası `kick/<lane>.md` içinde yaşar.
- `.command` ve `.bat` dosyaları yalnızca ince launcher'dır; içlerine iş kuralı koyma.
- Windows ve macOS paketleri birlikte korunur; runner dosya adına değil üretim kapısının
  gerçek alanlarına bakar.
- Claude/Codex adaptörleri yalnız provider I/O tarif eder, karar yasasını kopyalamaz.

## Model ve araç politikası

Model adları bu sözleşmeye sabitlenmez. Proje `.codex/config.toml` varsayılanı zor işler için
ayarlar; kullanıcı seçimi her zaman üstündür. Çoklu ajan yalnız bağımsız iş kolları olduğunda
kullanılır.

Raster görsel üretimi/düzenlemesi istenirse yerleşik `imagegen` akışı tercih edilir; seçilmiş
çıktı `artifacts/imagegen/` altına kopyalanır. <!-- bag-yok: ilk imagegen koşusunda oluşan hedef dizin, repoda boş durmaz --> Yerel hedef görsel düzenlenecekse önce görseli
incele ve değişmemesi gereken özellikleri açıkça kilitle.

## Kalite kapısı

Komutlar ve commit/push politikası **`CLAUDE.md`'de tek yerde** tanımlıdır — burada
tekrarlanmaz. Ek olarak:

- E2E: değişiklik alanına göre `npm run test:e2e`; bilinen baseline ile yeni kırığı ayır.
- Test silmek ve test sayısını açıklamasız düşürmek yasaktır (`.claude/test-baseline` ratchet).
- Fixture yalnız yardımcı kanıttır; gerçek üretim yolunun yerine geçmez. Yeni bir kontrol,
  builder'ın kendi yazdığı sabiti değil üretilen paketi veya dış girdiyi ölçmelidir.
