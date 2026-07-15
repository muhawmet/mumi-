# MAMILAS Agent Runtime

Bu klasördeki tek çalıştırılabilir prodüksiyon yolu canonical command lifecycle'dır:

`Timeline Command JSON → scripts/mamilas-command.mjs → agents/PROTOCOL.md → roles/* → adapters/*`

`gpt/*`, `claude/*`, `kick/*`, `knowledge/*`, `GLOBAL_BRAIN.md` ve eski production packet dosyaları
tarihsel referanstır; runnable değildir. `agentBrief`, `agentPackets` veya
`mamilas.production.v2026` provider'a yapıştırılamaz.

## Manuel lifecycle

1. Timeline'dan `*_mamilas_command.json` indir.
2. Command ve sıradaki tek işi doğrula:

   ```text
   node scripts/mamilas-command.mjs --file <command.json> --dry-run
   ```

3. Her scene için Mami storyboard onayını ayrı receipt olarak yaz:

   ```text
   node scripts/mamilas-command.mjs --file <command.json> --approve-storyboard --scene <id>
   ```

4. Mami yeni bir sohbet direktifi verdiyse exact UTF-8 metni yeni canonical command'e ekle. Kaynak
   command yerinde değişmez; eski approval/artifact'ler stale kalır:

   ```text
   node scripts/mamilas-command.mjs --file <command.json> --add-directive-file <note.txt> --scope PROJECT --out <new-command.json>
   node scripts/mamilas-command.mjs --file <command.json> --add-directive-file <note.txt> --scope SCENE --scene <id> --out <new-command.json>
   ```

5. Runtime'la yalnız sıradaki `Image Author → Image Jury` rolünü çalıştır. PASS sonrası
   Studio'nun doğrulayacağı command+artifact bundle'ı çıkar:

   ```text
   node scripts/mamilas-command.mjs --file <command.json> --export-image-bundle --scene <id> --out <bundle.json>
   ```

   Studio'ya düz prompt değil bu `mamilas.image-artifact-bundle.v1` dosyası geri alınır. Bundle
   runtime'da eklenmiş LIVE_CHAT direktiflerini ve bunların yeni commandId/context hash'lerini de taşır.

6. Mami frame'i harici araçta elle üretir. Runtime PNG/JPEG/WebP dosyasını tam pixel decode eder,
   SHA-256/dimensions/aspect'i kendisi hesaplar ve Mami verdict'ine bağlar:

   ```text
   node scripts/mamilas-command.mjs --file <command.json> --import-frame <frame> --scene <id> --verdict APPROVE
   ```

7. Current gerçek frame + Mami `APPROVE` yoksa Motion açılmaz. Sonraki roller
   `Frame Jury → Motion Author → Motion Jury` sırasıyla, her biri tek artifact yazarak ilerler.

Windows ve macOS launcher'lar yalnız ince kabuktur; karar, hash ve gate yasasını kopyalamaz.
Claude ve Codex aynı protocol/artifact validator'ı kullanır. Harici generation API, batch,
otomatik upscale veya ajan loop'u yoktur.
