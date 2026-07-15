# PHASE 2 — Studio Application, UX & Evidence State

**Tarih:** 2026-07-15
**Kapsam:** Yalnız React Studio, Zustand evidence state, Project Pack/closeout ve browser UX
**Builder verdict:** **PASS — fresh bağımsız audit PASS**

## Sonuç

Studio’nun görünür akışı ve state kapıları tek zincire bağlandı:

`Brief → Director → Recipe → Scenes → ajan prompt import → shot approval → gerçek frame import → Mami APPROVE → motion`

Timeline ve QA canonical command export’ları artık aynı `productionReadiness` sonucunu zorunlu
tutar. QA’daki `forceExport`/“onayı atla” yolu kaldırıldı; Timeline `Komut JSON` da readiness
sağlanmadan disabled. Store katmanı da UI’dan bağımsız olarak current ajan prompt receipt’i olmadan
shot approval veya frame import kabul etmiyor.

## Kapatılan kritik kusurlar

- Site scaffold prompt’u ajan final prompt’u gibi onaylanamıyor. `hasCurrentAgentPrompt`, prompt
  metni + SHA-256 yanında receipt `fromCommandId` alanını override-bağımsız
  `promptSourceCommandId` ile karşılaştırıyor; canonical readiness ayrı `prompt` aşamasında duruyor.
  Karar/storyboard değişince aynı prompt metni bile yeniden import edilmeden current kanıt sayılmıyor.
- Frame receipt current command ve current prompt hash’ine bağlı. Prompt/karar değişince motion
  kapanıyor; stale frame UI’da görünür kalıyor.
- Decode edilemeyen/0×0/boş dosya artık frame receipt üretmiyor. Motion ve frame APPROVE pozitif
  width/height/byteSize, 64-hex SHA-256 ve current evidence zinciri arıyor.
- Project Pack yalnız self-hash’e güvenmiyor: schema/shape, explicit unknown schema, projectId↔packHash,
  WorldPacket↔decision, prompt↔frame↔approval bağları ve gerçek frame kanıtı doğrulanıyor. Import
  hataları kullanıcı-visible `lastError` olur; uygulamayı düşürmez.
- Pack round-trip artık `phase0PresetId`, `directorChoices`, `beatKeeps` ve `beatAnalysis` dahil açık
  Studio kararlarını taşıyor; doğrulanmış pack fresh Brief yüzeyinden açılabiliyor ve evidence state’i
  ile Timeline’a dönüyor.
- Studio closeout, final-delivery `mamilas.closeout.v1` ile çakışmayan
  `mamilas.studio-closeout.v1` şemasına ayrıldı. Stale command/prompt/frame zinciri
  `APPROVED_FRAME` değil `STALE_EVIDENCE` olur; Timeline’dan closeout receipt indirilebilir.

## UX, navigation ve accessibility

- Preset/Director header yolları doğrudan `setCurrentStep` ile source gate atlamıyor; canonical
  `advance()` yolunu kullanıyor.
- ProductionPulse prompt/approval aşamasında kullanıcıyı Timeline düzeltme yüzeyine götürüyor.
- Sidebar active step `aria-current="step"` taşıyor.
- Project Pack ve frame file input’ları klavye/screen-reader erişilebilir native input olarak kaldı;
  visible face `:focus-within` ring taşıyor.
- 390 px görünümde perspective/hover taşması kapatıldı. Full browser senaryosu document/body
  genişliğinin viewport’u aşmadığını doğruluyor.

## Gerçek browser kanıtı

Playwright’ın gerçek Chromium akışı şunları tek senaryoda yaptı:

1. Üretilmiş storyboard’da ajan final prompt’unu elle geri aldı.
2. Prompt yokken `Onayla` disabled kaldı; `Reddet → Onayla` bypass’ı çalışmadı.
3. Shot’ı current prompt ile onayladı.
4. `screenshots/01-dashboard.png` dosyasını gerçek file input ile yükledi.
5. Browser receipt’i SHA-256 + **1280×720** + byte size ile yazdı; verdict önce `PENDING` kaldı.
6. Mami `APPROVE` sonrası `MOTION BRIEF AÇIK` görünür oldu.
7. Project Pack’i browser download ile indirdi, store’u resetledi, fresh Brief import yüzeyinden aynı
   dosyayı yükledi; prompt/frame hash, dimensions, verdict ve motion gate sonucu birebir geri geldi.
8. Decision değiştirildi; shot/frame stale göründü, eski prompt için `Onayla` disabled kaldı ve motion
   kapandı. Aynı prompt yeni prompt-source kimliğine yeniden import edilince onay tekrar açıldı.
9. Viewport 390×800’e alındı; yatay document/body overflow **0**.

Kullanılan PNG kanıtı: **518,222 byte · 1280×720 · SHA-256
`76b0b59ac7b7795d72461334aa90b4b9f5a7a4c869f5c2b7259aeec583da204e`**.
Bu kare estetik üretim PASS’i değildir; gerçek byte/dimension/stale kapısının browser kanıtıdır.

## Çalıştırılan kapılar

- Builder focused resolution: **3 dosya · 38/38 PASS**.
- TypeScript: `npx tsc --noEmit` → **PASS**.
- Full Vitest: **66 dosya · 1875/1875 PASS**.
- Production build: `npm run build` → **PASS**.
- Full Playwright: **15/15 PASS**.
- Fresh independent re-audit: focused Vitest **4 dosya · 45/45 PASS**; targeted gerçek Chromium
  **1/1 PASS**; final verdict **PASS**.
- In-app Chrome karşı-okuması: 390 px layout **document/body ≤ viewport**, active step
  `aria-current`, fresh Brief’te erişilebilir `Proje paketi içe al` input’u görünür DOM’da doğrulandı.

Build’deki yaklaşık 1.96 MB ana chunk uyarısı Phase 1 ledger’ındaki `P1-S01` ile aynıdır; yeni bir
Phase 2 kırığı değildir.

## Dürüst görsel durum

**implementation complete / visual validation pending** — bu faz gerçek frame evidence kapısını
kanıtladı; üretilecek yaratıcı karenin estetik hükmü Mami’nin gerçek frame verdict’idir.
