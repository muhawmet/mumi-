# HARD-FIX TESLİM — 2026-07-16 (Yerleşik Yönetmen / CLI akış raporu kapanışı)

Kaynak: `~/Desktop/MAMILAS-YERLESIK-YONETMEN-CLI-AKIS-RAPORU.md` (27 madde).
Commit zinciri: `0fcf7e9` (B+D) → `d9f43cd` (C) → `72c6ff7` (A) → `75aca49` (Yönetmen+E) → bu rapor.

## Tek cümle

**Çöken 2026-07-16 Deneme koşusunun tüm kök nedenleri kapandı; ürün vaadi ("Mami yalnız
Yerleşik Yönetmen ile konuşur") CLI'da artık gerçek; 26/27 madde hard-fix'lendi, 1 madde
geçersiz çıktı (kanıtlı), 1 madde kısmi/ledger.**

## Final kapı (gerçek koşu, bu oturum)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | 0 hata |
| `npx vitest run` | **2007/2007 (80 dosya)** — baseline 1964'ten +43, sıfır silme |
| `npm run build` | OK |
| `npm run test:e2e` | **15/15** (2 baseline borcu bu turda kapatıldı — aşağıda) |
| runner mirror | byte-identical (agents ↔ agents/production) |
| `npm run jury-audit` | 6/6 senaryo ✅ (yeni deklare komut, gerçek koşu) |
| Bağımsız denetçi | **KRİTİK: 0** · 2 ikincil → ledger |

## Madde madde: önceki durum → kök neden → fix → kanıt

### A — Batch runtime (senin yaşadığın çöküş) — `72c6ff7` + `75aca49`

| # | Sınıf | Fix + kanıt |
|---|---|---|
| A.1/A.7 Yönetmen sohbeti yok | bilinçli erteleme, vaadi kırıyordu | `--director` modu: batch ARKA planda ayrı süreç (BATCH-LOG.txt), foreground'da kalıcı Yönetmen sohbeti; rol kartı `agents/roles/director-session.md` (kısa doğal durum · REJECT'te susma · yalnız FACT_REQUIRED'da soru · exact LIVE_CHAT bağlama). Çift-tık launcher'lar director modu (Win/Mac parity). E2E: `directorSession.test.ts` — fake provider'la batch arkada "2 PASS prompt hazır"a ulaştı |
| A.2 REJECT fabrikayı öldürüyor | gözden kaçmış | Geçerli REJECT zaten r1 açıyordu; ölüm sebebi format hatasıydı (A.3). İzolasyonla birlikte kapandı |
| A.3 Malformed ↔ creative karışıyor | **kök neden: jury ŞABLONU `failingCheck/targetedFix/factRequired` alanlarını hiç göstermiyordu** — ajan şablona sadık kaldı, bilgiyi evidence'a yazdı, validator öldürdü | (1) Alanlar şablonda görünür. (2) Deterministik format-repair: `FAILING CHECK —` prefix'li evidence alanlara taşınır, artifact yeniden mühürlenir. (3) Onarılamazsa launch'ta BİR teknik-retry (bozuk dosya `.invalid`'e, aynı rol yeniden koşar); creative revision hakkı YANMAZ. E2E kanıt: `batchResilience.test.ts` "LAUNCH FORMAT-RETRY UÇTAN UCA" |
| A.4 Sahne izolasyonu yok | gözden kaçmış — `loadArtifacts` tek bozuk dosyada tüm klasörü öldürüyordu | Non-strict yükleme modu: hata yalnız sahibini `TECHNICAL_ERROR` yapar; `executeRole`/zincir hataları da sahne-bazlı. Strict mod tekli akışta korunur (sessiz bozulma maskelenmez) |
| A.5 Resume/idempotency | kısmi vardı, protokol evriminde kırılıyordu | `--migrate-command-context` artık workspace'i de taşır: approval'lar yeniden mühürlenir (karar değişmez), artifact'ler protocol-reseal (content/verdict untouched, hash zinciri deterministik eşlenir). **GERÇEK KANIT: çöken Deneme koşusu scratch kopyada migrate+resume edildi — sahne 1-5 PASS korundu (AWAIT_FRAME), 6 format-retry, 7-12 açıldı, batch ölmedi** |
| A.6 Incremental teslim yok | gözden kaçmış | `SAHNE-PROMPTLAR.md` her sahne kapanışında ATOMİK (tmp+rename) yazılır; GÖRÜNÜR kopya run kökünde (command yanında). Başta özet: "12 sahne · 5 PASS prompt hazır · …" |
| A.8 LIVE_CHAT güvenli giriş | zaten sağlamdı (M3) | Yönetmen rol kartı exact-directive yolunu tek meşru giriş ilan eder; komut DIRECTOR-SESSION.md'de hazır |

### B — Continuity — `0fcf7e9`

| # | Fix + kanıt |
|---|---|
| 9/10 ID-only continuity | `continuityState`: önceki PASS author artifact'inden gözlenebilir özet (interpretation + appliedLocks + sourceArtifactHash). Hash-bağlı ama sceneContextHash-DIŞI (approvedLessons katmanı — command'ler stale olmaz, mimari gerekçe kodda). Test: `continuityState.test.ts` 4/4 |
| 11 Recurring-cast protokolü | PROTOCOL.md + author/jury kartları: "anonim tek-shot serbest; aynı belirli kişi tekrar ediyorsa ve yüz gerçeği yoksa UYDURULMAZ → FACT_REQUIRED / Mami identity ref bağlar" |
| 12 Jury bağımsız continuity | Author VE jury aynı `continuityState`'i okur; jury kartı "never against the Author's own risk notes" |

### C — Jury bağımsızlığı + firewall — `d9f43cd`

| # | Fix + kanıt |
|---|---|
| 13/14/15 Jury'ler kör | image/frame/motion jury context'leri artık world fiziği + explicitLocks + failureModes taşır; kartlar "Author'ın vaadi tek kaynak değil" der. sceneContextHash yalnız imageAuthor mühürlü → command'ler stale OLMADI (regresyon testli). Test: `juryIndependence.test.ts` 4/4 |
| 16/17 Firewall final prompta bağlı değil | `agents/ipFirewall.json` TEK KANON (protected IP + work titles + brands + TR ek yasası + muafiyetler); proof.ts/brain.ts VE runner aynı dosyadan. `validateRoleContent` FINAL image/motion promptunu deterministik tarar — hash-valid + jury-PASS sızıntı mekanik kapıdan GEÇEMEZ. Negatif probe'lar + fonksiyonel parite: `ipFirewall.test.ts` 15/15 (Naruto'nun/Gokunun TR ekleri dahil; "Robin yeleği/Sakura ağacı" yanlış-pozitifleri korunur) |

### D — Ref/IP kanalları — `0fcf7e9`

| # | Fix + kanıt |
|---|---|
| 18 worldId'siz 54 ref evrensel | `refCompatibleWithWorld` medium-aware: stilize orphan (2D Animation/Auteur/Story DNA/Anime/Stylized) REAL host'a `compatible:false`; photoreal orphan'lar (Cinematography/Documentary/Product…) meşru kalır |
| 19 Kontaminasyon guard delikli | regex gerçek veri kategorilerini kapsar (eski "3d animation" var olmayan kategoriydi) |
| 20 Apple kanal asimetrisi | `scrubRefFieldIP` — perRef + referenceDNA kanalları da aynı kanondan scrub'lanır; marka adı düşer, zanaat kalır. Test: Apple `refDna`'da artık geçmiyor |
| 21 İki gerçeklik | uyumsuz ref her tüketicide `suppressed:true` + boş DNA (silinmez — Mami seçimi kayıtta) |
| 22 Temporal çoğul | `smear[- ]frames?` + `smears` varyantları; forbid cümlesi korunur |

### E — Drift — `75aca49`

| # | Sonuç |
|---|---|
| 23 Lens clash | `buildImageVantage` → `gateCameraLens`. **GERÇEK KANIT: Chivo (max 35mm) — havuzun 50/85mm istekleri 35mm'e clamp'lendi**, tek deterministik cevap |
| 24 Scaffold çelişkisi | **KISMİ → ledger.** Otorite prose'u mevcut; kör keyword-susturma Sol dersiyle ("kod polarite bilemez") çelişir. Ölçülen somut çift (rim-anchor vs NO-rim-negative) convergence ledger'da |
| 25 İyi tarafı bozma | UYULDU — detay üçlüsü/palet-rejim/half-second korundu; hiçbir prompt katmanı fakirleşmedi |
| 26 QA çift verdict | **GEÇERSİZ (Codex yanılgısı).** `qa.ts:24-26` `exportGateStatus` + VOLITION (`qa.ts:539-553`) aynı predicate'le TEK kanonik aggregate zaten üretir; "ready to fire" ile buton asla çelişmez (koddaki yorum bunu açıkça söylüyor). Kanıt dosya:satır ile |
| 27 jury-audit drift | `npm run jury-audit` (vite-node) eklendi; başlıktaki kırık `npx tsx` düzeltildi; komut gerçek koşuyla doğrulandı 6/6 ✅ |

## Baseline borçları (benim kırığım değil, bu turda kapatıldı)

1. **E2E "Reference DNA workflow"** M3'ten beri kırıktı: test bundle'ı zorunlu `interpretation` alanını taşımıyordu (M3 07-16'da geldi, e2e o günden beri koşulmamıştı). Eklendi.
2. Aynı test `screenshots/01-dashboard.png`'ye koşu-sırası bağımlılığı taşıyordu (klasör dünkü cleanup'ta silinmişti). Test artık kendi fixture'ını üretir.

## Convergence ledger (ikincil — kritik değil)

- E.24 scaffold rim/move çelişkisi: deterministik authority-çözücü tasarımı ayrı oturum işi (kör keyword yasak).
- Denetçi #1: `--batch` + `--export-image-bundle` birlikte verilirse hata mesajı kafa karıştırıcı (pratikte imkânsız kombinasyon; CLI arg-validasyonu iyileştirmesi).
- Denetçi #2: "an apple orchard" gibi meşru metin marka scrub'ına takılabilir (önceden var olan dar-kapsam kararı; `apple` muafiyete alınmadı çünkü ürün-worship ref'i gerçek sızıntı kaynağıydı).
- Fable/Sol notu değil, benim notum: `.invalid` marker'ları workspace'te birikir; temizlik ritüeli tanımlanabilir.

## Mami'nin yapacakları (Claude kapsamı dışı — rapor F bölümü)

1. **Gerçek 12-sahne Deneme koşusu:** çift-tık (artık Yönetmen modu) → batch arkada → Yönetmen'le konuş → `SAHNE-PROMPTLAR.md` paketi. Çöken eski koşuyu devralmak istersen: run klasöründe `--migrate-command-context` bir kez, sonra normal koş.
2. Kareleri harici araçta bas, estetik verdict senin.
3. M4 promptunu motora ver (önceki teslimden bekleyen) + M2 kare A/B + ilk dersleri APPROVED.md'ye yaz.

## Dürüst durum

**implementation complete / visual validation pending** — kod kapıları tam yeşil; gerçek kare
ve estetik hüküm Mami'nindir. "Mami yalnız Yerleşik Yönetmen ile konuşur" vaadi artık koşan
koddur; gerçek 12-sahne koşusuyla deneyim kanıtı Mami'nin ilk üretiminde alınacak.
