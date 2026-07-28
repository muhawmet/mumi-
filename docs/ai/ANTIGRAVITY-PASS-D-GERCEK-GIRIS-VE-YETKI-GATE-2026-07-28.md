# ANTIGRAVITY ULTRA — PASS D: GERÇEK GİRİŞ VE YETKİ GATE'İ

## V3 kabul edilmedi: kalan iki mantık hatası

V3 doğru biçimde motion'ı `UNPROVEN`a çekti ve frame filename'i kapsam dışına aldı. Fakat
`CLAUDE-IMPLEMENTATION-BRIEF-v3.md` hâlâ gerçek kullanıcı girişini değil, saf fonksiyonun
izole çağrısını onarmaya çalışıyor.

### D1 — "projectClass tanımsız" normal Studio akışında yok

Mevcut Studio başlangıcı `projectClass: 'ANIMATION_EDU'` ile açılır. Kullanıcı sınıf seçtiğinde
de `setField('projectClass', value)` aynı anda defaults üretir. Bu yüzden V3'ün koşulu:

`projectNameRegisterClaim(name) === null && projectClass tanımsız`

normal kullanıcı yolunda pratikte tetiklenmeyebilir. Öte yandan `projectNameRegisterClaim(null)`
bilinçli olarak belirsizdir: "Kütle ve Ağırlık" veya herhangi bir marka adı kendi başına ne EDU
ne REAL kanıtıdır. Bu iddiayı doğrudan bloklamak normal ders başlıklarını da yanlış yere sürer.

Pass D'nin çözmesi gereken soru şudur:

> Mami bir video açarken hangi **somut giriş yüzeyinde** proje yolunu seçiyor, seçimi ne zaman
> bilinçli sayıyoruz ve hangi gerçek olay bu seçimin gerçekleşmediğini gösteriyor?

Bu cevap olmadan `deriveProductionPath` fallback'ini değiştirmek veya yeni
`UNCLASSIFIED_REGISTER_LOCK` icat etmek yasaktır.

## D1 için zorunlu gerçek production probe

3.1 Pro, kod yazmadan önce aşağıdaki iki ayrı yolu gerçek state/command çıktısıyla sürer:

1. **Normal eğitim yolu:** temiz Studio state → yalnız konu/başlık "Kütle ve Ağırlık" → mevcut
   path seçiciden ANIMATION_EDU bilinçli seçimi → defaults → command export. Bu yol bloklanmamalı.
2. **Belirsiz ticari yol:** temiz Studio state → konu/başlık "Gece Serumu" → Mami'nin normalde
   kullandığı Director veya UI adımları → selected world/path/default refs → command export.

Her yol için kaydet:

- `projectTopic`, `projectName`, `projectClass`, `selectedProjectId`, `selectedWorldId` değerleri;
- sınıfın hangi kullanıcı hareketiyle atandığı;
- defaults'in bu atamadan önce/sonra üretilip üretilmediği;
- oluşan command'in `locks.productionPath`i ve receipt'teki register;
- Mami seçimi olmadan sınıf atandığını gösteren gerçek olay varsa o olay.

Ancak ikinci yol gerçekten Mami seçimi olmadan EDU alıyorsa çözüm yazılır. Değilse C-1,
`deriveProductionPath`in kontrollü fuzzy yardımcı davranışı olarak kalır; implementasyon briefinden
çıkarılır.

## D1 için olası çözüm sınırı

Gerekirse onarım, belirsiz metni path'e dönüştüren saf helper'a değil **gerçek karar girişine**
yerleşir. Geçerli path seçilmeden:

- `resolveRecipeDefaults` default-ref/palette üretmez;
- command export ve runner çalışmaz;
- mevcut path id'lerinden açık Mami seçimi gelir;
- seçim command receipt'te görünür.

"UNKNOWN" yeni path id değildir; `registerOf`a, `DATA.paths`e veya görünmez varsayılan ref
seçimine sızamaz. Yeni runner, otomatik REAL tahmini ve yalnız isim anahtar kelimesiyle yaratıcı
karar yasaktır.

## D2 — Memory `--adopt`: gerçek arıza mı, açık yetki mi?

Mevcut workspace'te `memory-sync --check` yeşildir. V3'ün iddiası şu anda bir gerçek kayıp
reprodüksiyonu değil, gelecekteki repo→canlı geri-alma ihtimalidir. Bunu `CURRENT bug` diye
Claude'a vermeyin.

Pass D, Mami'den tek yetki sorusu ister:

> Repo'da düzenleyip Claude canlı hafızasına geri almak istediğin somut bir hafıza dosyası ve
> çalışma anı var mı?

Yanıt yoksa B6 `CAPABILITY_CANDIDATE` olur, implementation briefinden çıkar. Yanıt varsa
en güvenli tasarım şudur:

- varsayılan **dry-run** + dosya/line diff;
- yalnız açık `--adopt --yes` ile yazma; interaktif prompt CI/terminal dışı yüzeyde zorunlu olmaz;
- canlı dosya önce timestamp'li backup'a kopyalanır;
- `MEMORY.md` otomatik merge edilmez: çatışma varsa yazma reddedilir ve Mami'ye iki tarafın
  diff'i gösterilir. Anlamsal hafızayı script birleştiremez.

## Pass D teslimi

Yeni çıktı yalnız burada yazılır:

```text
artifacts/antigravity-makro-scan-2026-07-28/PASS-D/
  D1-REAL-INPUT-PROBES.md
  D2-MEMORY-AUTHORITY-PROBE.md
  COUNTER-JURY-v4.md
  MAMI-MEMO-v4.md
  CLAUDE-IMPLEMENTATION-BRIEF-v4.md   # yalnız D1 veya D2 gerçek eşik geçerse
```

`CLAUDE-IMPLEMENTATION-BRIEF-v4.md` şu durumda boş kalabilir; boş kalması başarısızlık değildir.
Ancak bir görev yazılırsa tek kök nedene, gerçek giriş yoluna, korunacak normal eğitim yoluna,
Mami kararına ve gerçek production probe'a sahip olmalıdır.

## Antigravity'ye yapıştırılacak direktif

> V3'te iki doğru geri çekme yaptın, fakat yeni guard'ı gerçek kullanıcı girişinde tetiklenmeyen
> `projectClass undefined` koşuluna bağladın. Saf `deriveProductionPath('Gece Serumu')` probe'u,
> Mami'nin Studio/Director'da sınıfı nasıl seçtiğinin kanıtı değildir. Pass D'yi uygula: normal
> eğitim ve belirsiz ticari yolu temiz state'ten command receipt'e kadar gerçek çıktıyla karşılaştır.
> Mami seçimsiz EDU ataması yalnız gerçekten oluşuyorsa onarım tasarla; aksi halde C-1'i brief'ten
> çıkar. Memory --adopt için gerçek geri-alma ihtiyacı yoksa CURRENT bug deme; otomatik MEMORY.md
> merge önerme. Eşik geçmezse boş brief teslim et, uydurma çözüm üretme.
