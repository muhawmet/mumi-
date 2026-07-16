# BRAIN-M6 — Sistem QA hardening (ölçülmüş red-line regresyon matrisi)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high (birleşik M5+M6+M7 turu)
**Plan:** Task M6 · **Kaynak:** `[[mamilas-brain-intelligence-mined]]` QA JURY bölümü.

## Ne yapıldı

- **`src/core/juryRedlines.test.ts` (13 test)** — eski hatta GERÇEK karelerle ölçülmüş kusurların
  kalıcı kilitleri:
  - **Render-lock inceltme yasağı:** 6 dünyada renderPhysics kütle tabanı — Sol düzeltmesi sonrası
    GERÇEK ölçümün tam %90'ı (ilk deakins tabanı 1000/2687=%37 idi → 2418) + 46/46 canlılık.
  - **Prop geri-sızma kilidi (Sol sonrası 5/5):** one_piece/naruto/cyberpunk/bleach/claymation —
    M2'nin etkilediği BEŞ dünyanın envanter regex'i renderPhysics'te YASAK + vocabularyExamples'ta
    ZORUNLU + splitter determinizmi. (Sinonim/yeni envanter sızıntısı statik regex'le yakalanamaz —
    o katman frame-jury'nin figürlü kare denetimi; ledger.)
  - **Kontrat-boşaltma kilidi (Sol sonrası tam-metin):** bölüm asgari sayıları + 9 kritik madde
    CÜMLE-VERBATIM kilitli — anlamsız-madde-değişimi artık kırmızı verir (smoke-test bulgusu kapandı).
  - **Image parite matrisi (M4 P2 kapanışı):** animasyon + photoreal + engine'siz + dünya'sız
    4 vakada TS↔runner byte-eşitliği.
  - **Kart drift kilidi:** image-jury (FACT_REQUIRED/suppressed/interpretation), frame-jury
    (aşağıda), motion-jury (inventory/still-lips/trigger/override) + kling-dışı motorlarda motion
    evrensel yasaları.
- **`agents/roles/frame-jury.md` derinleşti:** world-lock testi **FİGÜRLÜ kareyle** ("insan üslubun
  turnusol kâğıdıdır" — figürsüz establishing plate kırık kilidi geçirir) + 2D-medium split'in
  PİKSEL kontrolü + FACT_REQUIRED (kare eksik gerçeği icat ettiyse PASS yok). Bu yasa bilinçli
  olarak frame-jury'de — prompt jürisi kare görmez.

## Bilinçli scope kararları (ledger)

- Statik çekirdek kontrat iki dosyada kopya kalıyor (M4 P2): sceneContextHash draft'ı zaten
  yakalıyor + parite matrisi byte-eşitliği kilitliyor; JSON'a taşımak contextHash'i bir kez daha
  kırar — fayda/maliyet düşük. Post/convergence adayı.
- worldPacket/motionEngine'in karar-türetilebilirliği (M4 tur-2 bulgusu): tehdit modeli Mami'nin
  kendi diski; migration storyboard-verify ile ana kapı kapandı. Convergence adayı.

## Kapı

Birleşik (M5+M6+M7): tsc 0 · vitest **1951/1951 · 74 dosya** · build OK.

## Dosyalar

- `src/core/juryRedlines.test.ts` (yeni, 13 test)
- `agents/roles/frame-jury.md`
