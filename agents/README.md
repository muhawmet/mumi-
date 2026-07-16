# MAMILAS Agent Runtime

Bu klasördeki tek çalıştırılabilir prodüksiyon yolu canonical command lifecycle'dır:

`Timeline Command JSON → scripts/mamilas-command.mjs → agents/PROTOCOL.md → roles/* → adapters/*`

`gpt/*`, `claude/*`, `kick/*`, `knowledge/*`, `GLOBAL_BRAIN.md` ve eski production packet dosyaları
tarihsel referanstır; runnable değildir. `agentBrief`, `agentPackets` veya
`mamilas.production.v2026` provider'a yapıştırılamaz.

## Manuel lifecycle

1. Timeline'dan **Komut JSON** indir ve dosyayı `agents/COMMAND-INBOX/` klasörüne bırak.
   **Proje Paketi** bu klasöre konmaz; Studio'ya geri içe almak içindir. `MOTION-CALISTIR.command`
   veya `MOTION-CALISTIR.bat` açıldığında runner yalnız bu inbox'taki gerçek
   `mamilas.command.v2026` dosyalarını görür, sonra **proje adını sorar** ve şunu oluşturur:

   ```text
   MAMILAS-PROJELER/<proje adı>/runs/<commandId>/
     mamilas_command.json
     .mamilas/                 # session, artifact, approval ve frame kanıtları
   ```

   Aynı proje adı + aynı command kimliği kaldığı yerden devam eder. Karar değişip command kimliği
   yenilenirse eski kanıtlar silinmez; aynı proje içinde yeni bir `runs/<commandId>` alanı açılır.
   Bu, ajanın proje bağlamını kendi artifact zincirinde taşımasıdır; projeler birbirine karışmaz.
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
Claude ve Codex aynı protocol/artifact validator'ı kullanır. Harici generation API, otomatik
GÖRSEL/VIDEO generation batch'i, otomatik upscale veya ajan loop'u yoktur. (`--batch` bayrağı
bir generation batch'i DEĞİLDİR: yalnız yazım fazlarının — author→jury — toplu sürücüsüdür.)

**Yönetmen modu (çift-tık default'u):** `--director` batch'i arka planda ayrı süreç olarak
başlatır (günlük `BATCH-LOG.txt`) ve foreground'da kalıcı Yerleşik Yönetmen sohbetini açar
(`agents/roles/director-session.md`). `SAHNE-PROMPTLAR.md` her sahne kapanışında atomik
güncellenir; görünür kopyası run kökünde yaşar. Yarım koşuya devam: önce
`--migrate-command-context` (command + workspace'i güncel protokole taşır, PASS sahneler
yeniden koşulmaz), sonra normal koşu.

Terminalden sessiz kullanımda adsız ortak workspace açılmaz; proje adı açıkça verilir:

```text
node agents/runner.mjs --file <command.json> --project "Su Döngüsü" --dry-run
```

İleri kullanımda açık `--workspace <klasör>` verilirse proje sorusu ve otomatik klasörleme atlanır.
