---
name: mamilas-uret
description: MAMILAS manuel World Studio üretimini tek Yerleşik Yönetmen yüzeyi altında, hash-valid command artifact'leri ve on-demand author→jury fazlarıyla yürütür. Yeni video üretimi, "üret/prodüksiyon koş", command JSON'dan image prompt, gerçek-frame verdict'i sonrası motion veya yarım üretime devam istendiğinde kullan.
---

# MAMILAS ÜRET — on-demand command akışı

1. Önce `agents/PROTOCOL.md` ve active `*_mamilas_command.json` dosyasını oku.
2. `node scripts/mamilas-command.mjs --file <json> --dry-run` ile protocol/decision/storyboard/context
   hash kapılarını ve sıradaki tek işi doğrula. `AWAIT_STORYBOARD_APPROVAL` dönerse Mami'nin açık
   onayından sonra `--approve-storyboard --scene <id>` ile hash'li workspace receipt'i yaz; prompt
   receipt'i veya final shot approval'ı storyboard onayı gibi kullanma.
   Mami yeni bir sohbet direktifi verirse exact UTF-8 metni dosyaya yaz ve kaynak command'i mutasyona
   uğratmadan `--add-directive-file <txt> --scope PROJECT|SCENE [--scene <id>] --out <new-command>`
   ile yeni canonical command türet. Bundan sonra yalnız yeni command'i kullan.
3. Mami'ye yalnız Yerleşik Yönetmen olarak konuş. Sıradaki fazda yalnız bir author veya bir jury
   çalıştır; sabit swarm/ajan tartışması kurma.
4. Image Author'a yalnız command'in minimum shot slice'ını ver. Site-yazımı `prompts.image`
   engine prompt'u değildir ve author context'ine kopyalanmaz.
5. Jury verdict'ini yalnız `PASS | REJECT | FACT_REQUIRED` kabul et. Bir REJECT sonrası en fazla
   bir targeted author revision aç; ikinci redde `FACT_REQUIRED` ile dur.
   Image Jury `PASS` verince `--export-image-bundle --scene <id> --out <bundle.json>` ile command +
   tam artifact zincirini Studio import dosyasına çevir. Studio'ya düz prompt yapıştırma.
6. Mami frame'i harici araçta elle üretir. Kareyi yalnız
   `--import-frame <path> --scene <id> --verdict APPROVE` ile runtime'a al: runner gerçek bayttan
   SHA-256, dimensions/aspect ve current image-prompt artifact bağını yeniden hesaplar. Bu import
   yoksa veya Mami verdict'i `APPROVE` değilse Motion Author çalıştırma.
7. Her rol yalnız bir `mamilas.agent-artifact.v1` yazar. Command çıkışta artifact hash/stale
   doğrulamasını yapar; ajan site state'ini değiştirmez ve başka rol başlatmaz.
8. Çok sahneli command'de `--scene` verilmezse runner ilk tamamlanmamış sahneyi source sırasıyla
   seçer. Sahne atlamak gerekiyorsa `--scene <id>` açıkça verilir; sessiz seçim yapılmaz.

## Değişmez sınırlar

- MamiDirectives exact taşınır; sessiz scrub/özet/yeniden yorum yoktur.
- Palette translation, IP firewall, schema/hash/stale, compatibility, engine math ve path safety
  deterministic koddur; bunlar ajan rolü değildir.
- Harici API, image/video generation, batch, otomatik upscale, provider/kredi ritüeli yoktur.
- Test yeşili görsel PASS değildir. Gerçek frame yoksa sonuç
  `implementation complete / visual validation pending` kalır.
