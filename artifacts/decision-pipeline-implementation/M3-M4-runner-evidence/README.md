# M3/M4/M5 runner kanıtları — tarihli anlık görüntüler

Scratchpad kalıcı olmadığı için gerçek runner çıktıları buraya kopyalandı (2026-07-16).
**Bunlar tarihli kanıttır, canlı workspace değildir** — kontrat sceneContextHash'in parçası
olduğundan sonraki her kontrat evrimi eski context hash'lerini doğal olarak stale eder; runner'ın
`--migrate-command-context` yolu bunun için var (storyboard'u DOĞRULAR — reseal yok; yalnız
context taşır).

## M3 zinciri (o günkü kontratla)

- `m3_command.json` — gerçek buildCommandJSON (commandId `mamilas-ce4a0f77…`).
- `m3-artifacts/` — author r0 → jury r0 REJECT → author r1 → jury r1 PASS → AWAIT_FRAME.
- `m3_live_directive_command.json` — `--add-directive-file` sonrası yeni commandId
  (`mamilas-feaf5683…`), approvals sıfırlandı.

## M5 zinciri — DÜRÜST akış-testi (final kontratla, Sol birleşik denetim sonrası)

- `m5-command.json` — aynı karar, M5 final kontratıyla (contextHash farklı — beklenen).
- `m5-image-author-r0.json` — kontrata tam uyumlu, beat'e sadık denizci prompt'u (M4 zekâsı).
- `m5-image-jury-r0.json` — meşru PASS (kanıtlar kontrat maddelerini tek tek gösterir).
- `m5-frame1.png` + `m5-frame-receipt.json` — gerçek piksel import (1280×720, sharp decode,
  Mami-APPROVE simülasyonu, hash-bağlı).
- `m5-frame-jury-r0-FACT_REQUIRED.json` — **jürinin DÜRÜST verdict'i:** düz mavi kalibrasyon
  plate'i Image Author'ın denizci vaadini taşımıyor → PASS verilemez → runner motion'ı AÇMADI
  (`FACT_REQUIRED` nedeniyle durdu). Bu, frame-gate'in gerçekten koruduğunun kanıtıdır: akış
  testi bile sahte PASS ile geçemez. **Gerçek motion artifact'i Mami'nin gerçek karesi
  geldiğinde üretilecek** (motion şema/doğrulama birim testlerle ayrıca kilitli — vitest süiti).

> İlk M5 kanıt turunda frame-jury'ye plate'e PASS yazdırılmıştı — Sol bunu kart ihlali olarak
> REJECT etti (haklı). Bu klasördeki zincir o bulgunun düzeltilmiş, kartlara tam sadık halidir.
