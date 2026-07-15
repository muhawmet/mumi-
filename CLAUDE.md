# MAMILAS — Claude giriş sözleşmesi

Bu dosya yalnızca Claude giriş noktasıdır. Ortak ve kanonik proje kuralları
`docs/ai/PROJECT_CONTRACT.md` içindedir; göreve başlamadan önce onu oku.

## Gerçek kaynaklar

- Otorite sırası: Path > World / Render Lock > Material (only when world-compatible) > Source meaning > Approved image > Director Mandate > Reference DNA > Palette.
- Otoritenin kod kaynağı: `src/core/brain.ts` → `AUTHORITY_HIERARCHY`.
- Motor desteği: `src/core/engine.ts` → `ENGINE_USABLE` ve `ENGINE_DIALECTS`.
- Veri: `src/core/SURGERY_DATA.json`.
- Drift denetimi: `src/core/docsContract.test.ts`.

Kodda yaşayan sayıları, motor listelerini veya durum bilgisini bu dosyaya kopyalama.

## Aktif dönüşüm — Decision Pipeline

- Durum: `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md` — **her oturumda önce bunu oku.**
- Yürütme sözleşmesi: `/mamilas-pipeline` skill'i (task sırası, kapılar, receipt, `/clear`).
- Katman yasaları `.claude/rules/` içinde ve dosyaya dokununca kendiliğinden yüklenir.

## Çalışma biçimi

- Windows/PowerShell birincil yerel ortamdır; Mac launcher sözleşmesini koru.
- Gerçek `generateBatch` çıktısını görmeden prompt kalitesi hakkında hüküm verme.
- Kullanıcının metnini sessizce yeniden yazma; eksik gerçek varsa dur ve bildir.
- Test silme, ilgisiz dosyaları değiştirme ve push yapma.
- İç tartışma/chain-of-thought gösterme; yalnızca karar, kanıt ve sonucu özetle.

## Kalite kapısı

`npx tsc --noEmit` → `npx vitest run` → `npm run build`.
Launcher değiştiyse Windows ve macOS ince-kabuk sözleşmelerini ayrıca doğrula.

Geçmiş uzun sürüm arşivlendi:
`docs/ai/archive/CLAUDE-legacy-2026-07-12.md`.
