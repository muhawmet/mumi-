# MAMILAS — Codex post-Claude baseline audit

**Tarih:** 2026-07-15
**Kapsam:** Claude Macro 1–8 iddiaları + Macro 9 boşlukları
**Yöntem:** İlk geçiş salt-okunur; kod, gerçek `generateBatch`, hedefli Vitest, gerçek Chromium E2E,
yerel tarayıcı ve dirty-worktree/backup karşılaştırması birlikte okundu.

## Runtime dürüstlüğü

Kullanıcı bu oturumu `gpt-5.6-sol` / `high` olarak başlattığını belirtti. Proje araçları ve mevcut
oturum API'si kesin model etiketi/reasoning-effort değeri döndürmüyor; bu yüzden bu belge o etiketi
bağımsız ölçülmüş gerçek gibi tekrar etmez. Farklı olduğuna dair de kanıt yoktur.

## Çalıştırılan gerçek kanıt

- `rtk proxy npx tsx scripts/inspect-brief.ts` → iki gerçek `generateBatch` vakası PASS üretti;
  promptlar gözle okundu.
- WorldPacket doğrudan ölçümü → **46/46 paket, 46 benzersiz hash, 0 ham-hex sızıntısı,
  0 legacyRenderLaw uyuşmazlığı**.
- `rtk proxy npx vitest run` ile hedefli Macro 1–8 kümesi → **8 dosya, 174/174 PASS**.
- `rtk proxy npx playwright test e2e/smoke.spec.ts` → **10/10 PASS**.
- Yerel Chrome: eksik reçeteyle sidebar'dan Timeline tıklandı; rail aktif görünse bile ana ekran
  Brief'te kaldı ve `Reçete eksik: Dünya` kapısı korundu. Sidebar bypass gerçekten kapalı.
- Karşı-okuma: yeşil testlerin ölçtüğü iddia ile gerçek prompt/paket içeriği ayrıca karşılaştırıldı.

## Bulgular

### F-01 — CRITICAL — Kaynak düzyazısı hâlâ otomatik on-screen text'e çevriliyor

- **Yer:** `src/core/pure.ts:752-788`, çağrı `src/core/pure.ts:1430`.
- **Gerçek çıktı:** `Su Döngüsü` girdisi aynı promptta hem
  `SOURCE — do not render as on-screen text; narration only` hem de
  `Visible text in-frame: 'Su Döngüsü'` üretti. Premium-ad örneğinde
  `Ürün ışıkta dönüyor` cümlesi de Mami beyanı olmadan fiziksel yazıya dönüştü.
- **Neden test kaçırdı:** Macro 1 testleri `DeliveryPromise`'in düzyazıdan türemediğini ölçüyor;
  ayrı `deriveOnScreenText()` heuristiğini ölçmüyor. Heuristik `split(/\s+/)` + kelime sayısı ile
  kaynağı yorumlamaya devam ediyor.
- **Üretim etkisi:** Mami istemeden kareye yanlış/uzun yazı basılır; prompt kendi içinde çelişir;
  motor tipografi hatasına sürülür. Ürün anayasasındaki “site niyet tahmin etmez” sınırı kırılır.
- **Sorumlu macro:** Macro 1 (kanıtlı regresyon).
- **En küçük kök neden düzeltmesi:** Site-side `AUTO` kaynak metni türetimini kaldır; on-screen text
  yalnız açık Mami beyanı/directive veya açık CLEAN kilidinden doğsun. Gerçek prompt regresyonu ekle.

### F-02 — HIGH — “Site prompt yazmaz” şu an isim değişikliği; gerçek sınır kurulmamış

- **Yer:** `src/core/pure.ts:1439-1465` → `brainImagePrompt`; `src/core/commandExport.ts:386` →
  `prompts.image: scenePrompt(scene)`; sözleşme satırı `src/core/commandExport.ts:411`.
- **Gerçek çıktı:** Site; `IMAGE (motion start frame)`, tam STYLE SYSTEM, lens/light/camera,
  visible-text, negatives ve `Clean motion-ready start frame` içeren engine-facing çok uzun metni
  yazıyor. Sonra aynı alanı “BRIEF” diye adlandırıyor.
- **Neden test kaçırdı:** `src/core/finalBriefLine.test.ts:75-78` gerçek alan biçimini değil yalnız
  sözleşme prose'unda `prompts.image bir BRIEF'tir` cümlesini arıyor; builder kendi iddiasını ölçüyor.
- **Üretim etkisi:** Image Author minimum shot slice'tan yaratıcı prompt yazmak yerine sitenin
  yarı-final promptunu düzeltir; site/ajan sorumluluk sınırı, Mami direktifi ve jüri zinciri bulanır.
- **Sorumlu macro:** Macro 3.
- **En küçük kök neden düzeltmesi:** Legacy site preview üretimini körlemesine sökme; fakat yeni
  command/protocol yolunda `prompts.image` yerine canonical decision + shot + WorldPacket + refs +
  palette-as-light + directives'tan minimum `ImageAuthorContext` üret. Final prompt yalnız artifact'tir.

### F-03 — HIGH — Project Pack seçili paleti WorldPacket'e taşımıyor

- **Yer:** `src/core/projectPack.ts:96-110`; `worldPacketById(... palette: undefined)`.
- **Gerçek çıktı:** `pastel_soft` seçiliyken command WorldPacket'i “lifted pale cool green / high-key
  north-window” taşırken pack WorldPacket'i world default “deep cool indigo / burnt orange / amber”
  taşıdı (`equal: false`).
- **Üretim etkisi:** Windows↔macOS/Claude↔Codex taşınan pack aynı karar kimliğini taşısa da ajana
  yanlış ışık fiziği verebilir; palette-as-light ve context portability iddiası bozulur.
- **Sorumlu macro:** Macro 6 (Macro 2 core paketi doğru).
- **En küçük kök neden düzeltmesi:** `selectedPaletteId` ile canonical palette'i bulup
  `worldPacketById`'ye geçir; seçili/default palette ayrımını gerçek round-trip testine kilitle.

### F-04 — HIGH — Macro 8 browser receipt'i frame lifecycle kanıtını aşıyor

- **Yer:** `artifacts/.../receipts/MACRO-8.md:21-28`; karşı kanıt
  `e2e/smoke.spec.ts:338-356`.
- **Gerçek çıktı:** Chromium smoke 10/10 PASS. Ancak E2E yalnız frame paneli görünür, `Frame yok`
  ve upload düğmesi var diye ölçüyor; dosya yükleme → gerçek hash → Mami `APPROVE` → motion-open
  akışını yapmıyor. Store düzeyindeki `frameGate.test.ts` teknik gate'i doğruluyor.
- **Üretim etkisi:** Kod kapısı muhtemelen doğru, fakat browser acceptance kanıtı receipt iddiasından
  daha zayıf; UI kablo kopması sonraki üretim gününe sızabilir.
- **Sorumlu macro:** Macro 5/8 evidence.
- **En küçük kök neden düzeltmesi:** Fixture frame ile gerçek file input/hash/verdict/motion-open ve
  frame değişince stale akışını Chromium E2E'ye ekle. Fixture visual PASS değildir.

### F-05 — CRITICAL — Macro 9 canonical artifact/protocol/lifecycle zinciri yok

- **Yer:** production aramasında `MamiDirectives`, `protocolVersion`, `inputArtifactHashes`,
  `contentHash`, faz-bazlı `PASS | REJECT | FACT_REQUIRED` ve revision limiti bulunmadı.
  Var olan receipt'ler yalnız `PromptReceipt`/`SceneFrameReceipt` seviyesinde.
- **Üretim etkisi:** Yanlış karar/protocol/storyboard'a ait agent çıktısı current sanılabilir;
  provider değişiminde bağlam kaybolur; tekrar-jüri usage loop'u deterministik engellenmez.
- **Sorumlu macro:** Macro 9.
- **En küçük kök neden düzeltmesi:** Tek canonical protocol + deterministic artifact envelope/hash +
  phase transition validator + bir revision bütçesi + minimum role context builder.

### F-06 — CRITICAL — Aktif ajan/command metinleri Mami'nin manuel/usage yasasıyla çelişiyor

- **Yer:** `.agents/skills/mamilas-uret/SKILL.md:8-29` sabit 6-agent swarm ve geri-dönüş loop'u;
  `agents/kick/claude-tr.md:1-168` giant Production Agent, zorunlu Higgsfield varyasyonu/kredi
  politikası; `.claude/.codex` image/motion author kopyalarında sabit provider/model söylemi.
- **Gerçek çıktı:** Aktif skill “swarm / geri gönder / re-jüri” diyor; kick dosyası image+motion+
  report işini tek rolde birleştiriyor. İkisi birbirine de yeni ürün anayasasına da uymuyor.
- **Üretim etkisi:** Mami ajan kalabalığı görür, gereksiz usage/kredi harcanır, motion gerçek
  APPROVE frame yerine eski üretim ritüellerine bağlanabilir.
- **Sorumlu macro:** Macro 9.
- **En küçük kök neden düzeltmesi:** Aktif orkestrayı on-demand `bir uzman → bir bağımsız jüri`,
  tek revision bütçesi ve manual-only artifact üretimine indir; palette/IP ajanlarını non-runnable
  yap ve deterministic kapıya taşı.

### F-07 — HIGH — Command gerçek lifecycle runner değil; unsafe örnek taşıyor

- **Yer:** `scripts/mamilas-command.mjs:17-23,39-96` packet extractor ve kör
  `claude --print` örneği; gerçek launcher'lar `agents/runner.mjs` + giant kick yoluna gidiyor.
- **Üretim etkisi:** Active decision/protocol/artifact hash/gate/next-role doğrulanmıyor; command
  güvenli interaktif Claude/Codex rol oturumu başlatmıyor; iki runner gerçeği drift yaratıyor.
- **Sorumlu macro:** Macro 9.
- **En küçük kök neden düzeltmesi:** Mevcut cross-platform Node runner temelini koruyup command'i
  project selection → validation → next phase → provider-native interactive launch → post-session
  validation akışına dönüştür; `--print` ve giant JSON dilimlemeyi kaldır.

### F-08 — MEDIUM — Duplicated active laws drift yüzeyi oluşturuyor

- **Yer:** `agents/runner.mjs` ve `agents/production/runner.mjs`; Claude/Codex agent kopyaları;
  `agents/kick/*` lane'leri; palette/IP rol kopyaları.
- **Üretim etkisi:** Hash'li canonical protocol olmadan bir provider veya launcher eski yasayı
  çalıştırabilir. Launcher byte-parity testi shell'i koruyor ama karar yasası parity'sini korumuyor.
- **Sorumlu macro:** Macro 9.
- **En küçük kök neden düzeltmesi:** Karar yasasını tek `PROTOCOL.md` + deterministic code'a al;
  adaptörler yalnız provider I/O tarif etsin; runner/adaptör parity'sini hash/evidence testiyle kilitle.

## Macro 1–8 verdict özeti

| Macro | Verdict | Kanıt |
|---|---|---|
| 1 | **CHANGE** | Regex bankası/typed blocker sökülmüş; ayrı AUTO text heuristiği canlı (F-01). |
| 2 | **KEEP** | 46/46 benzersiz WorldPacket, palette-as-light ve legacy law core'da doğru. |
| 3 | **CHANGE** | Hash'li prompt receipt var; site→agent prompt sınırı gerçek değil (F-02). |
| 4 | **KEEP** | Tek readiness, sidebar bypass ve duplicate production export kapısı doğrulandı. |
| 5 | **KEEP + EVIDENCE FIX** | Store gate doğru; gerçek browser upload/APPROVE E2E eksik (F-04). |
| 6 | **CHANGE** | Pack/hash/round-trip var; seçili palette WorldPacket'ten düşüyor (F-03). |
| 7 | **KEEP core / CHANGE active agents** | Closeout gözlemi doğru; aktif ajan yasaları Macro 9'da çelişkili. |
| 8 | **CHANGE receipt evidence** | Smoke 10/10; receipt browser kanıtını aşırı ifade ediyor. |

## Dirty worktree ve sahiplik sınırı

- `HEAD=2af0fb5` 2026-06-29 ve gerçek ürünün büyük kısmı commit edilmemiş worktree'de yaşıyor.
  İlk audit anında tracked diff **94 dosya, +18,680 / -9,603**; çok sayıda untracked ürün dosyası var.
- `C:\Users\mamya\Desktop\MAMILAS-BACKUPS\MAMILAS-2026-07-14_2333\repo` pre-Claude snapshot'ı
  mevcut. Bu, 14 Temmuz'a kadarki Mami/önceki çalışma gerçekliğini koruyor; Macro kaynaklarının
  önemli mtimeları 15 Temmuz 10:44–11:45.
- Commit ayrımı olmadığı için her eski satırı güvenle “Claude” veya “Mami” diye etiketlemek mümkün
  değil. Uygulama yalnız yukarıdaki kanıtlı kök neden dosyaları + yeni Macro 9 protocol/command
  yüzeyiyle sınırlandırılacak. Screenshots/assets/design ve ilgisiz kullanıcı değişiklikleri korunacak.
- Reset/checkout/stash/push uygulanmayacak. İlk kod mutasyonundan önce tüm güncel tracked+untracked
  proje kaynakları için yeni timestamp'li ZIP + SHA-256 manifest alınacak.

## Karşı-okuma sonucu

F-01 “yalnız test fixture” değil: gerçek `generateBatch` stdout'unda görüldü. F-02 salt isim tartışması
değil: export edilen alan engine-facing prompt yapısında. F-03 gerçek seçili palette ile byte-farklı.
F-04'te kod kusuru kanıtlanmadığı için gate'i yeniden yazma önerisi çıkarıldı; yalnız evidence E2E
isteniyor. Macro 2/4/5 çekirdeği ve deterministic commandId bulgular arasında tutulmadı; kanıtla KEEP.

**AUDIT COMPLETE — IMPLEMENTATION MAY START**

## Post-Claude snapshot — kod mutasyonundan önce

- Klasör: `C:\Users\mamya\Desktop\MAMILAS-BACKUPS\CODEX-POST-CLAUDE-20260715-130558`
- ZIP: `MAMILAS-POST-CLAUDE-20260715-130558.zip`
- ZIP SHA-256: `9dc8fcab894474bfe4b4c0ea81d52fdba3725a99fc5e9972c4d6d3b202fcc82c`
- Manifest: `SHA256-MANIFEST.tsv` — **413** tracked+untracked kaynak dosyası
- Doğrulama: ZIP açıldı; manifest ZIP içinde bulundu; ilk/orta/son örnek dosya hash'leri
  manifestle **3/3** eşleşti.
