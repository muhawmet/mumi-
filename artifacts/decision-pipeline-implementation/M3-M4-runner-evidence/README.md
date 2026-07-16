# M3/M4 runner kanıtları — tarihli anlık görüntüler

Scratchpad kalıcı olmadığı için gerçek runner çıktıları buraya kopyalandı (2026-07-16).
**Bunlar tarihli kanıttır, canlı workspace değildir** — kontrat sceneContextHash'in parçası
olduğundan sonraki her kontrat evrimi eski context hash'lerini doğal olarak stale eder; runner'ın
`--migrate-command-context` yolu bunun için var (storyboard'u doğrular, yalnız context taşır).

- `m3_command.json` — M3 turundaki gerçek buildCommandJSON çıktısı (commandId `mamilas-ce4a0f77…`).
- `m3-artifacts/` — M3 gerçek zinciri: author r0 → jury r0 REJECT → author r1 → jury r1 PASS
  (hepsi `--seal-artifact` ile mühürlendi, runner `AWAIT_FRAME`'e durdu).
- `m3_live_directive_command.json` — `--add-directive-file` sonrası türetilen yeni command
  (`mamilas-feaf5683…`, approvals sıfırlandı).
- `m4_command.json` + `m4-author-r0.json` — M4 FINAL kontrat tasarımıyla (overridePolicy)
  yeniden üretilen command (contextHash1 `77ff3298…`) + runner'ın kabul ettiği, tüm maden
  yasalarına uyan image_author artifact'i (contentHash `2dac9951…`; sonraki adım image_jury r0).
