---
name: project-mamilas-hardfix-run
description: 2026-07-16 hard-fix run TAMAM — Codex 27-madde CLI raporu kapandı; çift tık = Yönetmen modu; çöken Deneme resume-kanıtlı; 2007/2007 + E2E 15/15.
metadata: 
  node_type: memory
  type: project
  originSessionId: b1de5f1a-7cfa-4848-b888-0db81834f8a8
---

# HARD-FIX RUN — 2026-07-16 akşam, TAMAM (commit'li, push YOK)

**Kaynak:** `~/Desktop/MAMILAS-YERLESIK-YONETMEN-CLI-AKIS-RAPORU.md` (Codex+Sol, 27 madde).
**Teslim:** `artifacts/decision-pipeline-implementation/HARDFIX-TESLIM-2026-07-16.md` (madde-madde kanıt).
**Commit zinciri:** `0fcf7e9`(B+D ref/continuity) `d9f43cd`(C jury/firewall) `72c6ff7`(A batch)
`75aca49`(Yönetmen+E drift) `10cd015`(teslim+e2e borçları).

## Ne değişti (ürün seviyesi)

- **Çift tık = YÖNETMEN modu artık:** batch arkada ayrı süreç (BATCH-LOG.txt), Mami foreground'da
  Yönetmen'le konuşur (`--director`; rol kartı `agents/roles/director-session.md`). Yalnız-batch:
  `node runner.mjs --batch`.
- **SAHNE-PROMPTLAR.md** görünür (run kökünde), incremental-atomik, başta özet satırı.
- **Sahne 6 çöküşü sınıfı bitti:** jury şablonu REJECT alanlarını gösterir + deterministik
  format-repair (prefix'li evidence→alan taşıma) + launch'ta BİR teknik-retry (.invalid marker)
  + sahne izolasyonu (tek hata diğer 11'i durdurmaz).
- **Resume:** `--migrate-command-context` workspace'i de taşır (approvals+artifacts reseal,
  karar untouched). ÇÖKEN Deneme koşusu scratch'te migrate+resume KANITLANDI: 1-5 PASS korundu.
- **IP firewall:** `agents/ipFirewall.json` TEK KANON; runner FINAL agent promptunu tarar
  (TR ek yasası dahil). Jury'ler world/locks/failureModes'u bağımsız görür.
- **continuityState:** önceki PASS author artifact'inden özet, hash-DIŞI katman (command stale olmaz).
- **Lens:** imageVantage `gateCameraLens`'ten geçer (Chivo 50/85→35 kanıtı).
- `npm run jury-audit` (vite-node) çalışır komut.

## Sınıflandırma cevabı (Mami'nin sorusu "gördün mü / bilinçli miydi")

- Batch izolasyon + jury şablonu + incremental teslim: **gözden kaçmış kusur** (benim d17c1a2/4843430 işim).
- Foreground Yönetmen: bilinçli erteleme ama vaadi kırıyordu — kapandı.
- E.26 (QA çift verdict): **Codex yanılgısı, geçersiz** — qa.ts'te tek kanonik aggregate zaten var.
- E.24 (scaffold çelişki): kısmi → convergence ledger (kör keyword-susturma Sol dersiyle yasak).

## Açık ledger

E.24 authority-çözücü · `--batch`+`--export` arg-validasyonu · "apple orchard" yanlış-pozitif
riski · `.invalid` marker temizlik ritüeli · e2e 2 baseline borcu KAPANDI (M3-sonrası bundle
interpretation + screenshots sıra bağımlılığı).

## Ders (bu oturum)

- **Baseline karşılaştırması için ASLA `git checkout <old> -- .` kullanma** — 63 eski dosyayı
  staged getirdi, elle temizledim (zarar yok, doğrulandı). Doğrusu: `git show <ref>:<path>`.
- Fake-provider stub deseni (commandRuntime.test.ts) director/batch e2e'leri için mükemmel çalışıyor.

## Mami sıradaki

Gerçek 12-sahne Deneme (çift tık→Yönetmen) · kare üretimi+verdict · eski yarım koşuyu devralmak
istersen run klasöründe bir kez `--migrate-command-context`.
