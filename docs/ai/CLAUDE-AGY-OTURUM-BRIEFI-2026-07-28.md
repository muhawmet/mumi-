# CLAUDE + AGY — MAMILAS KANITLI KAPANIŞ OTURUMU

> **Oturum sahibi:** Mami  
> **Çalışma modu:** önce oku, kanıtla, tasarımı geri anlat, sonra `CLEAR` bekle.  
> **Bu belgenin amacı:** çalışan üretim hattını yeni guard'larla germeden, gerçek video
> kalitesini ve Claude/Codex çalışma bağlantısını güçlendirmek.

## İlk hüküm

MAMILAS'ın canlı `command → start frame → revize → motion → edit kit` omurgasında bugün
acil onarım gerektiren doğrulanmış bir kırık yoktur. Antigravity'nin son karşı-jürisi de bu
hükme ulaşmıştır: Pass B/C'deki `UNKNOWN` fallback ve zorunlu `memory-sync --adopt`
önerileri gerçek Studio akışı ve güncel memory probe'u karşısında geçerli değildir.

Bu yüzden bu oturum **bug avı veya sentetik kapı yazma** oturumu değildir. Üç seçilmiş,
opt-in ve geri alınabilir yatırım vardır:

1. **M1 — Motion Proof Lane + AGY Video Jürisi:** Kling klibi Premiere'e gitmeden önce
   görsel olarak kanıtlanır.
2. **M3 — Capability Contract:** Claude/Codex'te "skill var" değil, `tetikleyici → kanon
   → çıktı → sonraki adım` zinciri gerçekten çözülebilir olur.
3. **M2 — Active Production Snapshot:** seçilmiş aktif videonun doğrulanabilir hot state'i
   oluşur; büyük tarih ledger'ı normal oturumun tek giriş maliyeti olmaz.

Sıra bilerek `M1 → M3 → M2`dir. Önce gerçek video kör noktasını kapat; sonra Claude/Codex
beyninin bağlantısını kanıtla; ardından yeni oturumların aynı üretim gerçeğine kısa yoldan
açılmasını sağla.

## Değişmez sınırlar

- API, otomatik görsel/video üretimi, ödeme/kredi otomasyonu, ikinci lifecycle runner veya
  arka plan provider çağrısı YOK.
- Kare dosya adı / numarası ile kimlik konusu bu turun dışında; Mami bunu kendisi yürütüyor.
- Aktif promptları geriye dönük yeniden yazma, Mami adına yaratıcı karar alma veya manual
  Magnific → Mami onayı → Kling akışını değiştirme.
- AGY, `claude|codex` text-role provider listesine eklenmeyecek. Onun değeri ayrı bir
  **manuel video-görme karşı-jürisi** olmasıdır.
- Her yeni receipt açık proje/scene/frame bağlamından gelir; dosya adına bakıp kimlik uydurmaz.
- Mami'nin görsel hükmü son hükümdür. Agent verdict'i kanıtlı tavsiyedir.
- İlgisiz worktree değişikliklerini koru; destructive reset/checkout/push yok.

## Bu oturumda okunacak kanon ve kanıt paketi

Önce bunları oku; eski raporu ezberden uygulama.

1. `CLAUDE.md`, `AGENTS.md`, `docs/ai/PROJECT_CONTRACT.md`, `docs/ai/faz-icraat.md`
2. `docs/ai/CLAUDE-SECILMIS-MAKRO-YATIRIM-BRIEFI-2026-07-28.md`
3. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
4. `agents/PROMPT-YASASI.md`, `scripts/motion-qc.mjs`
5. `artifacts/antigravity-makro-scan-2026-07-28/PASS-D/MAMI-MEMO-v4.md`
6. Pass C'nin yalnız canlı kalan dürüst bulgusu için
   `artifacts/antigravity-makro-scan-2026-07-28/PASS-C/evidence/C4-motion-unproven-status.md`
7. `src/core/agentProtocol.ts`, `scripts/mamilas-command.mjs`, ilgili skill/hook/adaptör
   yüzeyleri ve gerçek seçilmiş production receipt'leri.

### Antigravity raporları nasıl okunacak

Pass B ve Pass C, araştırma tarihi olarak değerlidir; uygulanacak görev listesi değildir.
Özellikle aşağıdakileri **yeniden diriltme**:

- `deriveProductionPath` için kör `UNKNOWN` dönüşü veya `UNCLASSIFIED_REGISTER_LOCK`.
- `memory-sync --adopt`ı canlı bug/otomatik senkron çözümü saymak.
- prompt linter'ı kreatif veto sanmak.
- CRLF/protocolHash olayını yeniden açmak.

Pass D'nin doğru sonucu: bug yazmak için acele yok. Motion prompt dosyalarının varlığı,
gerçek Kling klibinin görsel olarak iyi olduğunun kanıtı değildir. Bu bir hata raporu değil;
M1'in gerekçesidir.

## Aşama 0 — yalnızca readback, kod YOK

Bu belgeyi okuduktan sonra **dosya değiştirme, AGY çağırma veya test refactor'u yapma**.
Mami'ye en fazla şu kısa readback'i ver ve bekle:

```text
OTURUM READBACK
Korunan doğru omurga:
Antigravity'den bilinçli dışarıda kalanlar:
İlk önerdiğim CLEAR: CLEAR M1
M1 sonunda Mami'nin göreceği somut kanıt:
M3'te bağlanacak Claude/Codex yetenek zinciri:
M2'nin tek gerçeklik kaynağı:
Risk / FACT REQUIRED (varsa tek madde):
```

Mami yalnız `CLEAR M1`, `CLEAR M3`, `CLEAR M2` veya `DUR` yazmadan bir sonraki aşamaya geçme.
Bir aşama bittiğinde de kendiliğinden sonrakine geçme; yeniden `CLEAR` bekle.

---

## CLEAR M1 — Motion Proof Lane ve AGY Video Jürisi

### Ürün kararı

AGY CLI gerçek video dosyalarını doğrudan medya olarak inceleyebiliyor. Bu kabiliyet mevcut
yerel `scripts/motion-qc.mjs` ile birleşecek; AGY bir üretici veya ana runner değil, klibi
gören ikinci jüri olacak.

Hedef akış:

```text
Mami açıkça klibi + kaynak start frame'i seçer
→ motion-qc %2 / %35 / %70 / %98 kanıt karelerini çıkarır
→ Mami AGY oturumuna klibi yapıştırır; AGY sample + start frame + VO beat + motion prompt'u okur
→ AGY kanıtlı VIDEO_REVIEW önerisi verir
→ Mami hüküm verir
→ yalnız Mami hükmüyle doğrulanabilir motion-review receipt yazılır
```

AGY CLI'de video medya yapıştırma TUI üzerinden manuel ve açık eylemdir. Bunu `agy -p` ile
runner içine gizleme, AGY kredisi tüketen otomatik bir loop'a dönüştürme veya video üretimi
sanma. AGY transcript'i tek başına receipt değildir; Mami'nin seçtiği hüküm receipt'e girer.

### Claude'un tasarlayacağı en küçük kabiliyet

1. `motion-qc`yi saf sample/metadata çekirdeği ve mevcut CLI kabuğu olarak ayır; mevcut
   ffmpeg/ffprobe yoksa exit 2 dürüstlüğü korunur.
2. Açık command/scene/frame bağlamıyla import edilen küçük bir `motion-review` receipt şeması
   tanımla. Receipt: clip hash ve metadata, dört sample path+hash, source-frame hash,
   motion-prompt/decision bağlamı, reviewer, Mami verdict'i, kısa kanıt ve zaman taşır.
3. Verdict yalnız `MOTION_VERIFIED`, `MOTION_REVISE` veya `MOTION_UNPROVEN` olabilir.
   İnsan hükmü olmadan `MOTION_VERIFIED` yazılamaz.
4. Frame/decision değişince eski receipt stale olur. Bu receipt Premiere'i bloklamaz ve
   geçmiş projeleri mutasyona uğratmaz.
5. Mevcut lifecycle'a sadece açık manuel import yüzeyi ile bağla; ikinci runner yaratma.

### AGY'ye verilecek video-jüri promptu

Mami `CLEAR AGY PILOT` dediğinde, AGY TUI'ye klibi medya olarak yapıştır. Claude o an bu
bağlamı aynı oturuma verir; AGY dosya değiştirmez:

```text
MAMILAS VIDEO JÜRİSİ — READ ONLY

Bu bir Kling klibi. Kaynak start frame, VO beat, onaylı motion prompt ve motion-qc'nin
%2/%35/%70/%98 sample kareleri bağlamda. Video üretme, repo dosyası değiştirme, estetik puan
uydurma veya Mami adına karar verme.

Yalnız şu yedi kanıta bak: yazı morph/bozulma; yeni öğe; katı geometri warp'ı; karakter
kimliği drift'i; kavram ışığının nesneye dönüşmesi; dudak/ağız hareketi; istenmeyen kamera
hareketi/kadraj drift'i.

Çıktı tam olarak şu biçimde olsun:
VIDEO_REVIEW
VERDICT: PASS_CANDIDATE | REVISE_FRAME | REVISE_MOTION | REGENERATE_CLIP | UNPROVEN
EVIDENCE: her bulgu için zaman veya sample yüzdesi + görünür gerçek
ROOT_CAUSE: start_frame | motion_prompt | clip_generation | unproven
MINIMAL_FIX: yalnız gerekli spesifik düzeltme
PRESERVE: değiştirilmemesi gereken sahne unsurları
MAMI_DECISION_REQUIRED: evet/hayır ve neden
```

`PASS_CANDIDATE`, Mami onayı değildir. Mami kabul ederse Claude receipt'e
`MOTION_VERIFIED` yazar; Mami kabul etmezse `MOTION_REVISE` veya `MOTION_UNPROVEN` kalır.

### M1 kabulü

- ffmpeg yoksa sample ve receipt yok; exit 2 korunur.
- Geçerli yerel klip dört gerçek sample + metadata üretir.
- Sample'lar, kaynak frame ve Mami hükmü olmadan doğrulandı statüsü yazılamaz.
- Kaynak bağlam değişince receipt stale görünür.
- Bir gerçek Kling klibinde AGY + Mami pilotu yapılmadan M1 tamam ilan edilmez.

---

## CLEAR M3 — Claude/Codex beynini gerçek bağlamak

### Problem

Skill klasörlerinin veya hook dosyalarının varlığı, agent'ın o capability'yi gerçekten
yüklediğini, doğru kanona ulaştığını ve üretimde kullanılabilir bir çıktı verdiğini ispatlamaz.
Bu turda "Codex/Claude beyni bağlı" demek için dosya eşliği değil, gerçek capability zinciri
ölçülecek.

### En küçük çözüm

İlk turda yalnız beş kritik capability'yi kapsayan statik ve provider-bağımsız bir contract
validator tasarla:

- `mamilas-buddy`
- `mamilas-director`
- `mamilas-enzim`
- `mamilas-denetim`
- `mamilas-uret`

Her capability için şu zincir görünür olmalı:

```text
doğal tetikleyici → ortak kanon / zorunlu kaynak → Claude veya Codex adaptörü
→ tanımlı görünür çıktı → sonraki geçerli aşama
```

Contract, SKILL.md kopyalarının metnini birbiriyle eşitlemeye çalışma. Ortak workflow
çekirdeği tek kaynaktan tanımlansın; Claude/Codex yalnız kendi yükleme/adaptör farkını taşısın.
Validator gerçek agent oturumu açmaz, Mami ile konuşmaz, prompt üretmez ve doğal dildeki her
kelimeyi path sanarak yalancı kırmızı üretmez.

### M3 kabulü

- Fixture'da zorunlu ortak kaynak veya provider adapteri kaldırınca kırmızı.
- Aynı ortak contract + farklı geçerli adaptör olduğunda yeşil.
- Mevcut prompt/command/receipt davranışı değişmez.
- Taze Claude ve Codex oturumu aynı tetikleyicide aynı otoriter kaynaklara ulaşır; bu Mami'nin
  kısa bir gerçek session probe'u ile doğrulanır.

---

## CLEAR M2 — Active Production Snapshot

`EXECUTION_STATE.md` tarihçe ve karar ledger'ı olarak kalacak. Normal üretim oturumunun hot
path'i olmamalı. Yeni bir ikinci gerçeklik yazmak yerine Mami'nin açıkça seçtiği projedeki
mevcut command/receipt/artifactlerden türeyen, hashli küçük snapshot tasarla.

Snapshot şu görünür gerçeklerle sınırlı kalır: proje yolu, command/decision hash, register/world,
storyboard-frame-motion durumu, en son kanıt, açık Mami kararı, artifact linkleri ve sonraki tek
geçerli faz. Kaynak yoksa `MEASURED_MISSING`; stale ise `STALE` der. Proje seçmez, frame
dosya adından kimlik üretmez, ledger'ı değiştirmez.

### M2 kabulü

- Gerçek seçilmiş proje kaynak artefactlere tıklanabilir yollarla açılır; sahte tamamlanma yok.
- Command/receipt değişince snapshot stale veya measured-missing olur.
- Snapshot silinirse Studio/command hattı aynı kalır.
- Taze Claude/Codex oturumu snapshot + gerekli tek receipt ile doğru sonraki adımı söyler;
  Mami bunu gerçek üretimde gözle onaylar.

---

## Her CLEAR sonunda teslim biçimi

Bir aşamayı tamamlamadan önce ilgili kaynakları yeniden ölç. Teslimde kısa ve kanıtlı yaz:

```text
<M1 | M3 | M2>
Korunan production invariantları:
Dokunulan yüzeyler:
Gerçek kaynak zinciri:
Kabul testleri ve sonucu:
Gerçek Mami/production probe:
Opt-in ve geri alma davranışı:
Kalan kanıtsız alan:
Sonraki önerilen CLEAR:
```

Bir tasarım ikinci runner/state, otomatik kredi tüketimi veya Mami adına yaratıcı hüküm
gerektiriyorsa kod yazma: `FACT REQUIRED` de ve yalnız gerekli tek kararı iste.

## Başvuru belgeleri

- Seçilmiş yatırım brief'i:
  `docs/ai/CLAUDE-SECILMIS-MAKRO-YATIRIM-BRIEFI-2026-07-28.md`
- Antigravity scan charter:
  `docs/ai/ANTIGRAVITY-ULTRA-MAKRO-TARAMA-RUN-2026-07-28.md`
- Pass B/C karşı-okumaları:
  `docs/ai/ANTIGRAVITY-PASS-B-KANITLI-MAKRO-DERINLESTIRME-2026-07-28.md`,
  `docs/ai/ANTIGRAVITY-PASS-C-IMPLEMENTATION-GATE-2026-07-28.md`
- Pass D gerçek giriş/yetki hükmü:
  `docs/ai/ANTIGRAVITY-PASS-D-GERCEK-GIRIS-VE-YETKI-GATE-2026-07-28.md`
- Ham Antigravity memo ve kanıtları:
  `artifacts/antigravity-makro-scan-2026-07-28/`

