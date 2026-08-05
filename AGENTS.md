# MAMILAS — Codex giriş sözleşmesi

Bu dosya Codex için kısa ve kalıcı giriş noktasıdır. Ayrıntılı ortak kurallar
`docs/ai/PROJECT_CONTRACT.md` içindedir; göreve başlamadan önce onu oku.

## Faz anahtarı — hangi yasayla açılıyorsun

<!-- FAZ ANAHTARI (CLAUDE.md ile AYNI import'u taşır — docsContract.test.ts kilitler). 2026-08-05:
     İCRAAT → İNŞA, DAR VE GERİ DÖNÜŞLÜ (Dörtlü Masa'yı kanıtlı kapıya çevirme turu). Tur bitince
     İCRAAT'a geri çevrilir. Üretim otoritesi bu tur boyunca da `artifacts/current-work.json`'dur. -->

- **Aktif faz: İNŞA** — yürütme profili `@docs/ai/faz-insa.md` (duvar kur). İcraat bu tur için
  uykuda: `@docs/ai/faz-icraat.md` (video üret). Hangi profil aktifse `CLAUDE.md`'nin ilk import
  satırı söyler; iki giriş sözleşmesi **aynı** `docs/ai/faz-*.md`'ye işaret etmek zorunda.
- Durum: `artifacts/current-work.json` — aktif işin TEK makine gerçeği; `node scripts/current-work.mjs`
  ile oku (SessionStart hook'u aynı metni basar). `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
  (1337 satır) **arşivdir, otorite DEĞİL** — yalnız geçmişe dair bir cümle kurulacaksa açılır.
- **Dörtlü Masa** (Claude · Codex Sol · AGY · Mami) — roller, dört sonuçluk Sol sözlüğü
  (`CLEAR TO CONTINUE` / `RESHAPE` / `NARROW` / `UNPROVEN`, ulaşılamazsa `SOL_UNAVAILABLE`), beş
  tetikleyici ve her hükmün hangi dosyada yaşayacağı **tek otoritededir: `docs/ai/DORTLU-MASA.md`**.
  Codex bu masada **karşı-yönetmendir**: Claude'un özetine değil gerçek dosya yollarına bakar,
  prompt yazmaz, jüri değildir. Sahte `CLEAR` yasak.
- Tamamlanmış task'ı yeniden yapma. Çelişki varsa `FACT REQUIRED` ile dur; sohbet hafızasından varsayma.
- Claude ve Codex **aynı** state ve receipt dosyalarını yazar. İkinci bir gerçeklik üretme.
- **Site TARİF üretir; motora giden prompt'u AJAN yazar.** Ölçüm (2026-07-29): kodun ürettiği metin
  ile teslim edilen kare arasında **%1-3** örtüşme, aktif projede %0. `src/core/` bir dünya/ref/palet
  kütüphanesidir — prompt'un doğduğu yer değil. `generateBatch` çıktısı prompt kalitesi kanıtı DEĞİLDİR.
- **Arşiv kıstas değil** (Mami): `agents/COMMAND-INBOX/Biten/` ne yapıldığının kaydıdır, kalite ölçütü
  değil; çoğu iş çıkışında aceleyle üretildi. "Sıfır revize" kusursuz demek değildir. Altın standart
  2026-08-03'te değişti: **5. Sınıf - Hücre ve Organelleri** (Mami: *"Eşeyli artık eskidi"*).
  **Eşeyli ve Eşeysiz Üreme** yalnız **motion BİÇİMİNİN** referansıdır, kalite tavanı değil.
- **Harcamadan önce ölç:** `scripts/dunya-kilidi.mjs` ile dünya kuyruğunu bas (elle yazma),
  `scripts/prompt-lint.mjs` ile yapıyı ölç — 71 revizenin ~44-52'si burada kredi yakmadan kesiliyor.

## Önce oku

- `docs/ai/PROJECT_CONTRACT.md` — değişmez ürün ve çalışma kuralları.
- `docs/ai/CODEX.md` — Codex'e özgü oturum, araç ve usage disiplini.
- İlgili çekirdek dosyalar — gerçek davranışın kaynağı Markdown değil koddur.
- Görev bir görsel üretimi, audit veya kalite kapısıysa `.agents/skills/` altındaki
  uygun skill'i kullan.

## Kod kaynakları

- Otorite: `src/core/brain.ts` → `AUTHORITY_HIERARCHY`.
- Motor desteği: `src/core/engine.ts` → `ENGINE_USABLE` ve `ENGINE_DIALECTS`.
- Veri: `src/core/SURGERY_DATA.json`.
- Üretim akışı: `source.ts` → `pure.ts` → `brain.ts` → export katmanları.
- Doküman/kod drift kapısı: `src/core/docsContract.test.ts`.

Bu değerleri tahmin etme veya başka dokümanlara yeni kopyalarını ekleme.

## Çalışma biçimi

- Windows/PowerShell birincil yerel ortamdır; macOS launcher'larını da koru.
- Kullanıcının yazdığı metni sessizce değiştirme.
- Önce kök nedeni ve gerçek üretim çıktısını incele; test yeşili tek başına kalite
  kanıtı değildir.
- İlgisiz dosyaları değiştirme. Test silme. Push yapma.
- Büyük işte bağımsız araştırma kolları gerçekten varsa çoklu ajan kullan; küçük
  görevlerde tek ajanla ilerle.
- İç muhakemeyi veya ajan tartışmasını dökme; karar, kanıt ve sonuç ver.

## Kalite kapısı

Değişikliğe uygun olanları çalıştır:

1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npm run build`
4. Launcher değiştiyse Windows ve macOS ince-kabuk sözleşmelerini doğrula.

E2E bilinen baseline sorunlarından ayrıştırılarak değerlendirilir; yeni kırık ekleme.
