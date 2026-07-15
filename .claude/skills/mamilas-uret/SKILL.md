---
name: mamilas-uret
description: MAMILAS manuel World Studio üretimini tek Yerleşik Yönetmen yüzeyi altında, hash-valid command artifact'leri ve on-demand author→jury fazlarıyla yürütür. Yeni video üretimi, "üret/prodüksiyon koş", command JSON'dan image prompt, gerçek-frame verdict'i sonrası motion veya yarım üretime devam istendiğinde kullan.
---

# MAMILAS ÜRET — on-demand command akışı

1. Önce `agents/PROTOCOL.md` ve active `*_mamilas_command.json` dosyasını oku.
2. `node scripts/mamilas-command.mjs --file <json> --dry-run` ile protocol/decision/storyboard/hash
   kapılarını ve sıradaki tek işi doğrula.
3. Mami'ye yalnız Yerleşik Yönetmen olarak konuş. Sıradaki fazda yalnız bir author veya bir jury
   çalıştır; sabit swarm/ajan tartışması kurma.
4. Image Author'a yalnız command'in minimum shot slice'ını ver. Site-yazımı `prompts.image`
   engine prompt'u değildir ve author context'ine kopyalanmaz.
5. Jury verdict'ini yalnız `PASS | REJECT | FACT_REQUIRED` kabul et. Bir REJECT sonrası en fazla
   bir targeted author revision aç; ikinci redde `FACT_REQUIRED` ile dur.
6. Mami frame'i harici araçta elle üretip current frame olarak yükler. Gerçek frame SHA-256 ve
   Mami `APPROVE` yoksa Motion Author çalıştırma.
7. Her rol yalnız bir `mamilas.agent-artifact.v1` yazar. Command çıkışta artifact hash/stale
   doğrulamasını yapar; ajan site state'ini değiştirmez ve başka rol başlatmaz.

## Değişmez sınırlar

- MamiDirectives exact taşınır; sessiz scrub/özet/yeniden yorum yoktur.
- Palette translation, IP firewall, schema/hash/stale, compatibility, engine math ve path safety
  deterministic koddur; bunlar ajan rolü değildir.
- Harici API, image/video generation, batch, otomatik upscale, provider/kredi ritüeli yoktur.
- Test yeşili görsel PASS değildir. Gerçek frame yoksa sonuç
  `implementation complete / visual validation pending` kalır.
