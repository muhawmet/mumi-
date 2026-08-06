---
name: mamilas-agy-continue-ve-donma-olceri
description: "AGY -c (continue) videoyu KORUYOR (ölçüldü 2026-08-06) — tek izleme, çok soru; ve freezedetect -38dB YALANCI çıktı, \"donma\" değil \"neredeyse hareketsiz\" ölçüyor"
metadata: 
  node_type: memory
  type: reference
  originSessionId: d105a6d7-86a2-4ca5-998a-096a3a24c91a
  modified: 2026-08-06T11:21:00.352Z
---

## 1. `agy -c` ÇALIŞIYOR ve medya bağlamını KORUYOR

Ölçüldü 2026-08-06, Mavişehir reklamı (28 sn) üzerinde. Öncesinde her soru **yeni bir çağrıydı**,
yani film **her soruda baştan izleniyordu**; takip sorusu sorulamıyordu.

`-c` ile aynı oturuma dönüldü ve kanıt üç katlı:
- `num_turns: 2` · `cache_read_tokens: 2.315.739` (önceki bağlam okundu)
- **önceki cevapta OLMAYAN yeni görsel detaylar** geldi: "kırmızı tişörtlü 2 öğrenci",
  "kadın koçun üstünde BEYAZ önlük" → özetten değil, videoya tekrar bakarak cevapladı
- süre 359 sn (bir izlemenin bedeli), ama sonraki sorular aynı oturumdan gidiyor

**Bağlandı:** `node scripts/dis-goz.mjs sor "<soru>" [--oturum <id>]`; kimliği `gor` çıktısı basar.
⚠ `timeout` komutu bu makinede YOK (zsh/macOS) — kabuk sarmalayıcısı kullanma.

🔴 **AMA DEVAM TURU BİR TANE — ölçüldü, iddiamı düzeltiyorum.** İlk takip sorusu çalıştı;
**ikinci takip 3/3 hata verdi** (`status:ERROR · retryable error from model provider`), hem
kimliksiz `-c` ile hem açık `--conversation <id>` ile. Aynı dakikalarda taze bir `ara` çağrısı
sorunsuz döndü → genel kesinti değil, **oturumun kendisi**. Sebep kanıtlanmadı; en olası aday
bağlam tavanı (28 sn'lik videoda bile 2,3M cache okuması var).
**Çalışma kuralı: bir izleme + TEK takip turu. O yüzden takip soruları DAMLA DAMLA değil,
tek çağrıda TOPLU sorulur.**

🔴 Ve `--continue` sessiz bir tuzak taşıyor: **"EN SON oturuma" döner.** Araya başka bir agy
çağrısı girerse (bir `ara` yeter) yanlış oturumu sürdürür ve bunu haber vermez. Bu yüzden
`dis-goz.mjs` kimliği basar ve `--oturum` ile kimliğe dönmeyi tercih eder — [[mamilas-yerlesim-varsayimi-kusuru]]
sınıfının aynısı: sessizce yanlış şeyi ölçmek.

## 2. 🔴 `freezedetect=n=-38dB` YALANCI ÇIKTI — kanon düzeltmesi

Aynı videoda ffmpeg **9.6-10.4 (0.8 sn)** ve **19.72-20.4 (0.68 sn)** için "freeze" bastı.
AGY *"kıpırdıyor, kamera ve kalem hareketi var"* dedi. Hakem: o penceredeki **28 karenin 28'i
md5 olarak FARKLI** → görüntü gerçekten kıpırdıyor. **AGY doğru, ölçer yanlış.**

Sebep yapısal: `freezedetect` **"kareler aynı" demiyor, "değişim eşiğin altında" diyor** —
yavaş, sabit tripodlu, az hareketli plan onu tetikliyor. Yani o filtre bir
**"neredeyse hareketsiz" detektörü**, bir donma detektörü değil.

**Kural: "donma" iddiası kare kimliğiyle doğrulanır**, freezedetect ile değil:
`ffmpeg -ss <t> -t <süre> -i <film> -vsync 0 /tmp/f%03d.png` → `md5 -q *.png | sort -u | wc -l`.
Tekil sayı kare sayısına eşitse donma YOK.

⚠ **Geriye dönük kuşku:** Hücre filminin *"10 donma / ~9.5 sn (filmin %4.3'ü)"* hükmü aynı
-38dB eşiğiyle kuruldu ([[mamilas-agy-video-gozu]] ve CLAUDE.md'de yazılı) — **o sayı fazla
raporlanmış olabilir**, kare kimliğiyle yeniden ölçülmeli. Ve bu, [[mamilas-yerlesim-varsayimi-kusuru]]
sınıfının aynısı: doğrulayıcı ölçtüğü şeyin ne olduğunu varsaydı.
