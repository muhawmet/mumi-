# HANDOFF — Macro 9 Ajan Beyinleri (zekâ katmanı)

**Yazan:** Claude (Termius/terminal oturumu, Mac) · **Tarih:** 2026-07-16
**Devralan:** VSCode oturumu (Mac) · **Görev:** Mami — *"Macro 9 ajan beyni; zekayı sen dolduracaksın."*

> Bu dosya bir oturumdan diğerine köprüdür. `/clear` sonrası VSCode'da açan ilk şey burasıdır.
> Kanon `docs/ai/PROJECT_CONTRACT.md`; durum `EXECUTION_STATE.md`; yürütme `/mamilas-pipeline`.

---

## 1. Durum — nerede duruyoruz

- **Yapı Windows'ta Codex ile yeniden kuruldu; bu trunk artık `origin/main` (`3c4cc8a`).** Eski Mac
  hattı (516 commit, kick/runner/gate) **silinmedi** → branch `mac-hatti-2026-07-16` + tag
  `mac-hatti-yedek`. Zekâsı madenlenebilir, DURUMU değil.
- **Baseline YEŞİL (kendi gözümle doğrulandı):** `npm install` (sharp geldi) → **tsc 0 · vitest
  1896/1896 (67 dosya)**. İki kırık düzeltildi ve **çalışma ağacında duruyor, commit EDİLMEDİ:**
  1. `sharp` yüklendi (package.json'da vardı, Mac'te install koşulmamıştı).
  2. `agents/MOTION-CALISTIR.bat` + `agents/production/MOTION-CALISTIR.bat` → CRLF verildi
     (sabahki commit `3c4cc8a` launcher-parity testini sıkıp .bat'lara CRLF vermemişti).
  → **İlk iş:** bu iki düzeltmeyi ayrı commit'le (Mami onayıyla). `git add` ile spesifik dosyalar.
- **Phase 3 plumbing GERÇEK ve denetli** (Codex'in işi, dokunma): canonical `mamilas.command.v2026`
  export, hash-mühürlü lifecycle, `sharp` ile gerçek-frame decode kapısı, Claude/Codex adaptörleri,
  cross-platform runner. Bunu yeniden icat etme.

## 2. Görev — "zekayı doldur" tam olarak ne demek

Plumbing hazır; **eksik olan altı ajanın NASIL DÜŞÜNDÜĞÜ.** Beyinler iskelet değil ama **ince ve
dengesiz** (`.claude/agents/*.md`, toplam ~217 satır):

| ajan | satır | durum |
|---|---|---|
| `mamilas-director` | 36 | **iyi** — otorite + mandate + identity-lock + on-screen-text kararı dolu. Örnek al. |
| `mamilas-qa-jury` | 48 | orta |
| `mamilas-motion-author` | 44 | orta |
| `mamilas-image-author` | 34 | **ince** — asıl zekâ burada olmalı |
| `mamilas-ip-firewall` | 31 | **rol sorusu** (aşağıda) |
| `mamilas-palette-translator` | 24 | **DEPRECATED** → deterministik koda taşınmış, doğru |

**İş:** her beyni, birikmiş üretim zekâsıyla **rol-kapsamlı** derinleştir. Monolit DUMP YAPMA —
yeni yapının en büyük kazancı `.claude/rules/` path-scoped yüklemesi (context ekonomisi). Her ajan
yalnız kendi slice'ını taşır (Macro 9 sözleşmesi EXECUTION_STATE'te rol rol tanımlı).

## 3. Doldurulacak zekâ (kaynak: madenlenebilir eski hat + hafıza)

Image Author + jury + director'a şu yasalar **somut kısıt** olarak girmeli (nesir duvarı DEĞİL):

- **Fiziksel medyum yasası** — "2D plastik/anime" değil; motora ışığın/yüzeyin FİZİĞİ. (`[[mamilas-physical-medium-law]]`)
- **Palet = ışık dili**, ham hex değil (palette-translator koda taşındı; Image Author çıktısını kullanır).
- **On-screen text** ya diegetik/baked ya HİÇ. Eski hatta ölçülen **TERS bug**: kaynak ekran-yazısını
  null'a düşürüp, yazısız sahneye önceki anlatı cümlesini takıyordu. → Yeni `brain.ts`'te TEKRAR ÖLÇ.
- **Kadraj çeşitliliği** — eski hatta `imageVantage` 5'li round-robin (beat'e ters lens). → TEKRAR ÖLÇ.
- **Self-contained prompt** — Magnific önceki sahneyi bilmez; her prompt kendi kendine yeter.
- **Türkçe metin kilidi** · **ikinci-ay gafleti** · **yapışık @-tag reddi** (üretim turu dersleri).
- **FACT REQUIRED disiplini** — marka geometrisi/yüz/dönem kaynakta yoksa uydurma, DUR. (canlı üretimde tuttu)
- **Detay yasası** — her sahne 3 fizik detayı: çevresel baskı + mikro-aksiyon + ses/görsel çıpa.
- **"cinematic/epic/4K" YASAK** — gözlenebilir kamera fiili + ışık davranışı + grade dili.

## 4. Açık kararlar (VSCode oturumu Mami'yle netleştirsin — uydurma)

1. **Rol seti ↔ sözleşme çelişkisi.** Macro 9: *"palette translation, ref compat, IP firewall,
   hash, schema = deterministik KOD, ajan işi DEĞİL."* `palette-translator` zaten deprecated. **Soru:
   `mamilas-ip-firewall` de deprecated olup koda mı taşınmalı?** (Firewall zaten `src/core`'da kod
   olarak var.) Ajan mı kalsın, kod mu — Mami/Codex kararı.
2. **Jüri faz-kapsamı.** Sözleşme "Image Prompt Jürisi / Frame Jürisi / Motion Jürisi" (faz-bazlı)
   diyor; ortada tek `mamilas-qa-jury`. Tek jüri fazı `phase` parametresiyle mi taşısın, yoksa üçe
   mi bölünsün? Frame yokken frame PASS verilemez kuralı korunmalı.
3. **`.codex/agents/*.toml` aynası.** Her beyin değişikliği Codex şeridine de yansımalı — **aynı zekâ,
   farklı I/O adaptörü.** Adaptör karar yasasını KOPYALAMAZ (kod kanonik), yalnız I/O tarif eder.

## 5. Doğrulama protokolü (yasa: receipt'e değil ÇIKTIYA bak)

- Beyin değiştikten sonra **gerçek `generateBatch` çıktısı** üret: `scripts/brain-workbench.ts`
  (30 dünya × topic, 8 preset, 12 palet). Prompt'u GÖZLE oku — "yapı doğru" deme, kareye bak.
- Codex'in `image_gen` aracıyla prompt'u gerçek görsele çevirip BAK (CLAUDE.md'deki komut).
- Üç eski kusuru (onScreenText / imageVantage / paletteLight) yeni brain'de yeniden ölç: hâlâ var mı?
- Kapı: `npx tsc --noEmit` → `npx vitest run` → `npm run build`. Launcher değiştiyse zsh + .bat parity.
- **Kendi işini onaylama** — bir iş parçası bitince bağımsız denetçi (Codex `gpt-5.6-sol`) geçir.

## 6. Guardrail'ler

- **PUSH YOK.** Commit iş-parçası başına, `git add` ile spesifik dosyalar (asla `-A`). Her anlamlı
  parçadan sonra `/mamilas-checkpoint` (Termius/VSCode kapanabilir).
- Test silme, ilgisiz dosya değiştirme yok. Fixture'a çöp atıp testi yeşile boyama yok.
- Mami'nin cümlesini sessizce scrub etme; sorunlu terimi ona söyle.
- İç tartışma gösterme; karar + kanıt + sonuç.

## 7. Dosya haritası

- Ajan beyinleri: `.claude/agents/mamilas-*.md` (+ `.codex/agents/*.toml` aynası)
- Adaptörler: `agents/adapters/claude.md` · `agents/adapters/codex.md` · `agents/PROTOCOL.md`
- Deterministik çekirdek: `src/core/brain.ts` (AUTHORITY_HIERARCHY) · `engine.ts` · `pure.ts` · firewall
- Command lifecycle: `src/core/commandExport.ts` · `agents/runner.mjs` · `agents/kick/<lane>.md`
- Gerçek çıktı: `scripts/brain-workbench.ts` · Veri: `SURGERY_DATA.json` (`npm run data`, deny'lı)
- Macro 9 sözleşmesi + faz durumu: `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
- Phase 3 receipt (plumbing ne yaptı): `PHASE-3-COMMAND.md`
