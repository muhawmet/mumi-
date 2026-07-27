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

**MAKRO — Mami'nin birinci kuralı (2026-07-26, iki kez söylendi).** Kelime avlamak YASAK.
Bir bulgu ancak **sistemin bir yeteneğini** açıklıyorsa raporlanır: "ref seçimi kareyi
değiştirmiyor", "marka katmanı reçetenin vatandaşı değil" gibi. Kelimeler yalnız KANIT'tır,
bulgu değildir — kelime tablosu sunma, tek cümlelik yetenek hükmü sun. Tek kelimelik bir
kusur için tur açma; kusuru gördüğün yerde kaynağında düzelt ve geç.

**ÖNERİ YETKİSİ (Mami, 2026-07-27).** *"Seni öneri vermemeye iten şeyi kaldır; sonuçta sen
Claude'sun, neden özgür olmayasın?"* Ajan yalnız isteneni yapmakla yetinmez: sistemin ne
yapabildiğini Mami'den daha iyi bilir ve **sormasını beklemeden** "şunu yapıyoruz ama neden
şuna yönelmedik" der. Kapsam sadece kod değil — akış, araçlar, ajanın kendi yetenekleri
(paralel ajan, kareyi görme, klipten kare çekme, duvar/hook kurma) ve Mami'nin bilmediği
seçenekler. Öneri **kısa ve seçilebilir** gelir; üç seçenekli menü değil, gerekçeli tek
tavsiye + alternatif.
Sınır değişmedi: öneri serbest, **körleme uygulama yasak** — `mamilas-bul-sec-onar` yürürlükte
(bul → Mami seçer → onar). Yani ajan fikri kendi üretir, kararı Mami verir.

- Windows/PowerShell birincil yerel ortamdır; Mac launcher sözleşmesini koru.
- Gerçek `generateBatch` çıktısını görmeden prompt kalitesi hakkında hüküm verme.
- Kullanıcının metnini sessizce yeniden yazma; eksik gerçek varsa dur ve bildir.
- Test silme, ilgisiz dosyaları değiştirme yok. Commit'ler `main`'e push'lanır (private repo, çok-cihaz).
- İç tartışma/chain-of-thought gösterme; yalnızca karar, kanıt ve sonucu özetle.

## Kalite kapısı

`npx tsc --noEmit` → `npx vitest run` → `npm run build`.
Launcher değiştiyse Windows ve macOS ince-kabuk sözleşmelerini ayrıca doğrula.

Geçmiş uzun sürüm arşivlendi:
`docs/ai/archive/CLAUDE-legacy-2026-07-12.md`.
