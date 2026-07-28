# ANTIGRAVITY ULTRA — PASS C: IMPLEMENTATION GATE

## Pass B hükmü

Pass B, ilk turdaki iki yanlış iddiayı doğru biçimde geri çekti:

- `prompt-lint` yaratıcı veto olarak otomatik production kapısında çalışmıyor; bu bulgu `REJECTED`.
- `protocolHash` CRLF vakası güncel backlog değil, `HISTORICAL`.

Bu iyi ilerleme, fakat `CLAUDE-IMPLEMENTATION-BRIEF.md` henüz implementasyon yetkisi taşımaz.
İki ACCEPT bulgusu aynı statüde değildir ve TASK-1'in önerdiği çözüm mevcut kodda sessiz yeni
yanlış sınıflama üretir.

Bu tur kod yazmaz. Pass B dosyaları silinmez; sonuçlar `PASS-C/` altında tutulur.

## Önce düzeltilecek yanlışlar

### C1 — B3 gerçek, ama `UNKNOWN` çözümü yanlış tasarlanmış

`deriveProductionPath('Gece Serumu')` bugün gerçekten `ANIMATION_EDU` döndürüyor; bu CURRENT
bulgudur. Ancak proposal'daki yalnızca `return 'UNKNOWN'` değişikliği kabul edilemez:

- `registerOf('UNKNOWN')` bugün `STY` döndürür.
- `resolveRecipeDefaults('UNKNOWN', 'deakins_naturalist')` bugün varsayılan STY reflerini
  seçer; yani Mami'ye soru sorulmadan başka bir render register'ı ve başka referanslar atanır.
- `commandExport` geçerli bir `DATA.paths` kimliği varsayar; UNKNOWN yeni bir path kontratı,
  command, UI, receipt ve runner davranışı tasarlanmadan yalnız fallback'e konamaz.

Pass C'nin sorusu "UNKNOWN ekleyelim mi?" değildir. Soru şudur:

> Belirsiz proje sınıfı, herhangi bir path/register/default-ref türetilmeden önce hangi somut
> kullanıcı yüzeyinde Mami'den seçim ister ve bu seçim command receipt'e nasıl kilitlenir?

Pro iki küçük tasarım seçeneğini yalnız mevcut mimari üzerinden kanıtla karşılaştırır:

1. **Pre-resolution BLOCKED:** belirsiz metin, path/defaults üretmeden önce Studio/command
   export'ta anlaşılır tek hata verir; Mami mevcut path seçiciden açık seçim yapar.
2. **Explicit pending choice:** ayrı bir belirsizlik durumu yalnız UI/decision katmanında yaşar;
   command ve runner'a geçebilmek için mevcut geçerli path ID'lerinden biri seçilmiş olmalıdır.

Yeni path id, ikinci runner, otomatik "REAL kabul et" veya isimden yaratıcı tahmin önerilmez.
Her seçenek için şu gerçek akış gösterilir:

`girdi → defaults/ref seçimi → world-path guard → command export → runner validation → receipt`.

Mami'ye sorulacak karar yalnız budur: belirsiz sınıfta **önce seçim zorunlu mu**, yoksa mevcut
varsayılan EDU davranışı bilinçli olarak korunuyor mu?

### C2 — B6 bir bug değil, yetki isteyen capability gap

`memory-sync`in canlı → repo tek yönlü olması kaynakta açıkça yazılmış bir tasarımdır; mevcut
`node scripts/memory-sync.mjs --check` de bu workspace'te yeşildir. Dolayısıyla "--adopt yok"
tek başına CURRENT arıza değildir.

Bu bir ürün kararı olarak ayrı değerlendirilir:

- Mami gerçekten repo tarafında değişip canlıya geri alınması gereken bir hafıza örneği verdi mi?
- Verildiyse yön seçimini script değil Mami yapmalı mı?
- `--adopt` eklenecekse yalnız açık Mami komutu, dry-run/manifest, dosya bazlı diff, overwrite
  reddi veya açık `--force`, ve canlı hafızaya yazmadan önce görünür onay gerektirir.

Bu kanıt yoksa B6 `CURRENT` değil `CAPABILITY_CANDIDATE` olur ve Claude briefinden çıkar.

### C3 — B1 ve B4 memo'da aşırı iddia edilmiş

- B1, Mami'nin kendi kapsamındaki frame filename/identity olayını tekrar açıyor. Bu bulgu ve
  çözüm yönü Pass C'den ve memo'dan çıkarılır.
- B4 yalnız `revize.txt` metnini okudu; gerçek frame'leri görmedi. "35/35 kare incelendi" kendi
  kendine yazılmış rapora dayanıyor. Görsel kanıt yoksa "motion yasası pratikte tam uygulanıyor"
  hükmü `UNPROVEN` olur. Gerçek kareler erişilebiliyorsa görsel inceleme, receipt ve onaylı motion
  metni birlikte yapılır; erişilemiyorsa iddia memo'dan çıkarılır.

### C4 — Model kaynak haritası yeniden yazılır

Pass B'deki genel/eskimiş URL'ler model bağlamı veya ajan sınırı için kanıt değildir. Her model
iddiası resmi ürün/doküman sayfasına bağlı olur; desteklemeyen sayılar silinir. Bu harita Claude
briefinin parçası değildir, fakat makro taramanın güvenilirlik eşiğidir.

## Pass C teslim eşiği

`artifacts/antigravity-makro-scan-2026-07-28/PASS-C/` altında yalnız şunları üret:

```text
B3-DESIGN-PROBE.md                 # iki seçenek, uçtan uca gerçek çağrı zinciri
B6-DECISION-PROBE.md               # gerçek ihtiyaç var mı, varsa güvenli yetki sözleşmesi
MODEL-SOURCES-CORRECTED.md
COUNTER-JURY-v3.md
MAMI-MEMO-v3.md
CLAUDE-IMPLEMENTATION-BRIEF-v2.md  # yalnız B3 eşiği geçerse
```

`CLAUDE-IMPLEMENTATION-BRIEF-v2.md` şu iki koşul olmadan yazılamaz:

1. B3 için seçilen akışın hiçbir aşamada sessiz STY/EDU/REAL veya default ref üretmediği
   gerçek probe ile gösterilmiş olmalı.
2. Mami'nin "belirsiz sınıfta seçim zorunlu" / "EDU varsayılanı kalsın" kararı alınmış olmalı.

B6 ancak Mami'nin gerçek repo→canlı geri alma ihtiyacını doğrulamasıyla ayrı brief olur. Bu
turda ikisini tek implementation görevine birleştirmek yasaktır.

## Antigravity'ye yapıştırılacak direktif

> Pass B kısmen kabul edildi: linter veto ve CRLF bulgularını doğru geri çektin. Ama Claude
> briefi implementasyon için hazır değil. `UNKNOWN`u sadece deriveProductionPath'e döndürmek
> bugün registerOf'ta STY'ye ve default refs'e düşüyor; bu yeni bir sessiz yanlış karar olur.
> B3'ü pre-resolution seçim tasarımı olarak, gerçek input→defaults→guard→command→runner→receipt
> hattında kanıtla. B6'yı bug değil yetki isteyen capability adayına indir; gerçek ihtiyaç ve
> güvenli Mami onayı yoksa brieften çıkar. B1 frame identity kapsam dışıdır; B4 görsel kanıt
> yoksa UNPROVEN'dır. Pass C belgesindeki teslim eşiğini geçmeden Claude implementation briefi
> yazma veya önceki briefi parlatma.
