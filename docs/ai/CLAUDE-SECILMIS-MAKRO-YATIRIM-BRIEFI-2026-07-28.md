# CLAUDE — SEÇİLMİŞ MAKRO YATIRIM BRİEFİ

## Başlangıç hükmü

MAMILAS'ın canlı üretim omurgasında acil onarım gerektiren doğrulanmış bug yok. Bu brief,
çalışan command → start frame → revize → motion → edit hattını değiştirmek için değil; Mami'nin
gerçek üretim kalitesini, oturum devamlılığını ve Claude/Codex çalışma güvenini artıracak üç
**opt-in, geri alınabilir ve kanıt üreten** kabiliyet için hazırlanmıştır.

Her maddeyi sırayla yap. Birinin kabul testi/gerçek production probe'u geçmeden diğerine geçme.
Koddan önce güncel kaynakları ve mevcut receipt'leri yeniden doğrula; burada yazan hedefi ezber
sayma. Her madde sonunda bağımsız karşı-okuma, `npx tsc --noEmit`, `npx vitest run`, `npm run build`
çalıştır. API, otomatik render/provider çağrısı, ikinci lifecycle runner, dosya adıyla kimlik
tasarlama, aktif promptları yeniden yazma ve Mami adına yaratıcı karar YOK.

## Bilinçli olarak KAPSAM DIŞI

- `deriveProductionPath` için kör `UNKNOWN` dönüşü / sentetik register guard'ı.
- `prompt-lint`i boş-dolu kontrolüne indirmek veya kreatif ölçülerini sökmek.
- Kapanmış CRLF/protocolHash olayını yeniden onarmak.
- Frame filename / kare numarası kimliği.
- `memory-sync --adopt`ı acil bug diye eklemek.

Bunlar ya kapanmış, ya Mami'nin kapsamı, ya da gerçek ihtiyacı geldiğinde ayrı yetkiyle ele
alınacak capability adaylarıdır.

---

## M1 — Motion Proof Lane: Kling çıktısını Premiere'den ÖNCE kanıtlamak

### Neden bu güzel yatırım?

`scripts/motion-qc.mjs` zaten yerel ffmpeg ile bir klibin %2/%35/%70/%98 anlarından dört PNG
çıkarabiliyor ve doğru görsel denetim sorularını basıyor. Fakat hiçbir çağıranı, kalıcı receipt'i
ve "prompt yazıldı" ile "klip gözle doğrulandı" ayrımını taşıyan production yüzeyi yok. Sonuçta
motion metni varlığı klibin iyi olduğuna yanlışlıkla kanıt gibi okunabiliyor.

### Hedef

Manuel production'a bağlı, **opt-in** bir post-Kling denetim adımı kur:

`Mami klibi yerelden seçer → motion-qc dört kanıt karesi çıkarır → Claude/Codex + Mami kareleri
görür → yalnız insan kararıyla MOTION_VERIFIED / MOTION_REVISE / MOTION_UNPROVEN receipt'i oluşur.`

Bu bir video üreticisi değildir; dış sağlayıcı çağırmaz, otomatik PASS vermez, Premiere'i
bloklamaz. Sadece pahalı keşfi daha erken yere taşır.

### Korunacaklar

- Start frame görülmeden motion yazmama yasası.
- Mami'nin son görsel hükmü.
- Mevcut `motion-qc.mjs`in ffmpeg yoksa exit 2 ile dürüstçe durması.
- Premiere sınırı: receipt kurgu/VO/müzik notu olabilir; compositing/keyframe önermeyecek.

### En küçük mimari yön

1. `motion-qc`i saf, testlenebilir sample/metadata katmanına ayır; CLI davranışını koru.
2. Açık bir klip yolu ve açık bir kaynak frame yolu alan, seçilen proje/scene bağlamına yazılan
   küçük bir **motion-review receipt** şeması tanımla. Kimlik dosya adından türetilmez; çağıran
   mevcut scene/command/frame receipt bağlamını açık verir.
3. Receipt şunları taşır: clip sha256/metadata, four sample path+hash, source frame hash,
   reviewer, insan verdict'i, kısa kanıt notu, karar zamanı. Frame veya karar hash'i değişirse
   receipt stale olur.
4. Mevcut command/runtime lifecycle'ına yalnız açık `--import-motion-review` veya eşdeğer manuel
   girişle bağla. Varsayılan akış ve geçmiş projeler değişmeden çalışır.
5. Bir klipte metin morph/ekstra öğe/warp/kimlik/ağız/kamera için Mami'nin onaylayacağı kısa
   verdict şablonunu sun; otomatik estetik skor icat etme.

### Kabul ve gerçek probe

- ffmpeg yok → exit 2 ve receipt YOK.
- Geçerli yerel test klibi → dört sample ve metadata üretir; bunlar gerçek dosyadır.
- İnsan verdict'i olmadan `MOTION_VERIFIED` yazılamaz.
- Source frame veya command değişince eski receipt stale görünür.
- Gerçek Kling klibi geldiğinde Mami dört sample'ı görür, verdict verir; bu gerçek production probe
  olmadan M1 tamam ilan edilmez.

---

## M2 — Active Production Snapshot: dev ledger yerine kısa, doğrulanabilir hot state

### Neden bu güzel yatırım?

Yeni Claude/Codex oturumları büyük `EXECUTION_STATE.md`yi okumaya yönlendiriliyor. Bu dosya hem
tarihçe hem ledger; aktif videonun şu anki prompt/frame/motion/edit gerçeğini tek bakışta ve
makinece doğrulanabilir biçimde taşımıyor. Bu usage yakar, eski üretim kararlarının yeni oturuma
geri gelmesi riskini büyütür.

### Hedef

Yeni ikinci gerçeklik yaratmadan, **açıkça seçilmiş aktif proje** için küçük bir türetilmiş
`ACTIVE-PRODUCTION.md`/JSON görünümü oluştur:

`explicit project root + current command/receipt/artifact pathleri → doğrulanabilir hot snapshot`.

Bu snapshot proje seçmez, dosya adından sahne kimliği uydurmaz, eski ledger'ı değiştirmez. Kaynak
artefact pathleri, hashleri ve üretildiği anı taşır; kaynak değişirse geçersiz kalır veya yeniden
üretilir.

### Korunacaklar

- `EXECUTION_STATE.md` tarihsel/karar kanonu olarak kalır.
- Mevcut command/receipt/hashing altyapısı otoritedir.
- Mami'nin aktif proje seçimi açık olur; ajan tahmin etmez.
- Hâlen manuel World Studio ve görünür artefact paketleri kullanılır.

### En küçük mimari yön

1. Önce mevcut command status / closeout / receipt yüzeylerini bul; yeni state şeması icat etmeden
   onların projection'ını üret.
2. Snapshot yalnız şu alanları gösterir: aktif proje yolu, command/decision id-hash, register/world,
   storyboard/frame/motion durumları, son güncelleme kanıtı, açık Mami kararı, ilgili artifact
   linkleri ve bir sonraki **tek** geçerli faz.
3. Her alanın kaynağını path+hash ile yanında göster. Kaynak eksikse `UNKNOWN` değil
   `MEASURED_MISSING`; temiz gibi görünemez.
4. Giriş sözleşmeleri snapshot'ın nasıl doğrulanacağını söyler; snapshot yoksa veya stale ise
   mevcut state/receipt yoluna geri döner. Yeni dosyayı körlemesine her oturum otorite yapma.

### Kabul ve gerçek probe

- Kütle ve Ağırlık gibi gerçek bir proje seçildiğinde snapshot, kaynak artefactlere tıklanabilir
  yollarla ulaşır ve sahte tamamlanma söylemez.
- Command/receipt hash'i değiştirildiğinde snapshot `STALE` veya `MEASURED_MISSING` olur.
- Snapshot silinirse mevcut Studio/command akışı aynı kalır.
- Taze Claude/Codex oturumu snapshot + gerekli tek receipt ile aktif işin sonraki adımını doğru
  söyler; bu Mami'nin gözle onayladığı production probe'dur.

---

## M3 — Capability Contract Gate: skill dosyası değil, gerçekten yüklenebilir yetenek

### Neden bu güzel yatırım?

Claude ve Codex'in skill klasörleri artık küme olarak eşit ve hook dosyaları var/çalıştırılabilir
ölçülüyor. Ancak provider yüzeyinin aynı çalışma yeteneğine ulaştığını yalnız dosya adı değil,
`trigger → kaynak → çıktı → sonraki adım` zinciri kanıtlar. Bu özellikle buddy, director, enzim,
denetim ve üretim becerilerinde session kalitesi için önemlidir.

### Hedef

Kod üretimini veya agent davranışını değiştirmeyen statik bir **capability contract validator**:
aktif skill için zorunlu kaynakların çözüldüğünü, iki sağlayıcının ortak çekirdeğe ulaştığını ve
tanımlanan output'un sonraki aşamada anlaşılabilir olduğunu doğrular.

### En küçük mimari yön

1. İlk olarak yalnız beş kritik skill'i kapsa: `mamilas-buddy`, `mamilas-director`,
   `mamilas-enzim`, `mamilas-denetim`, `mamilas-uret`.
2. Contract verisi mümkünse mevcut skill başlığında/tek ortak makinece okunur dosyada dursun;
   aynı bilgiyi iki SKILL.md'ye kopyalama.
3. Validator yalnız açık local/relative dependency'leri ve provider adapter yolunu çözer;
   doğal dildeki her kelimeyi dosya referansı sanıp yalancı kırmızı üretmez.
4. Hook hedefini, skill varlığını ve gerekli referansın erişilebilirliğini birlikte raporlar.
   Bu test çağırdığı skill'i gerçek agent gibi çalıştırmaya veya Mami ile konuşmaya kalkmaz.

### Kabul ve gerçek probe

- Bir critical skill'in provider eşini veya zorunlu local referansını geçici fixture'da kaldırınca
  validator kırmızı olur.
- İki yüzeyde aynı ortak contract, farklı sağlayıcı adapterleri varsa yeşil olur.
- Mevcut production skill'leri, prompt/command/receipt çıktıları davranış olarak değişmeden kalır.
- Bir taze Claude ve Codex oturumu aynı trigger için aynı authoritative kaynakları okur; Mami bu
  iki sonuçta çalışma biçimi drift'i görmez.

## Claude'un teslim biçimi

Her M1/M2/M3 sonunda şunu teslim et:

```text
<M1|M2|M3>
Korunan production invariantları:
Dokunulan yüzeyler:
Gerçek kaynak zinciri:
Kabul testleri:
Gerçek Mami production probe:
Geri alma / opt-in davranışı:
```

Bir madde gerçek kaynaklara bağlanamıyor veya mevcut hattı genişletmek yerine ikinci runner/state
yaratıyorsa dur, `FACT REQUIRED` yaz ve Mami'ye tek karar sor. M1 dışındaki hiçbir iş gerçek klip
veya API gerektirmez; M1 de yalnız Mami'nin yerel olarak verdiği klibi inceler.
