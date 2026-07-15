# MAMILAS — Codex giriş sözleşmesi

Bu dosya Codex için kısa ve kalıcı giriş noktasıdır. Ayrıntılı ortak kurallar
`docs/ai/PROJECT_CONTRACT.md` içindedir; göreve başlamadan önce onu oku.

## Aktif dönüşüm — Decision Pipeline

- Durum: `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` — **her oturumda önce bunu oku.**
- Yürütme sözleşmesi: `.agents/skills/mamilas-pipeline/SKILL.md` (task sırası, kapılar, receipt, `/clear`).
- Tamamlanmış task'ı yeniden yapma. Çelişki varsa `FACT REQUIRED` ile dur; sohbet hafızasından varsayma.
- Claude ve Codex **aynı** state ve receipt dosyalarını yazar. İkinci bir gerçeklik üretme.

## Önce oku

- `docs/ai/PROJECT_CONTRACT.md` — değişmez ürün ve çalışma kuralları.
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
