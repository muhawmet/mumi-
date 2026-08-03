# KOMUT JSON'INI BURAYA AT

Timeline'dan **Komut JSON** ile indirdiğin dosyayı bu klasöre bırak, ardından
`production/MOTION-CALISTIR.bat` (Windows) veya `production/MOTION-CALISTIR.command`
(macOS) dosyasını aç.

Dosya adını değiştirme gerekmez; Timeline'ın verdiği adla bırak. Runner adı değil, dosyanın
içindeki gerçek command şemasını kontrol eder.

Buraya **Proje Paketi** koyma: o dosya Studio'ya geri içe almak içindir ve üretim command'i
değildir. Runner yalnız schema'sı `mamilas.command.v2026` olan gerçek command dosyalarını seçer.

## Start frame'ler → `<proje>/images/`

Üretilen start frame **her projede `images/` klasörüne** iner. Ad tek ve kanoniktir; dosya adı
kare numarasıdır: `images/1.png`, `images/2.png` … `images/53.png`.

Neden kural: bu klasör daha önce üç ayrı adla yaşadı (`resimler`, `Resimler`, hiç). Ad tahmin
edilince `teslim-denetim.mjs` yanlış klasöre bakar ve **olmayan bir kusuru** ("görsel yok")
rapor eder. Tek ad = tek gerçek.

- Klasör kendiliğinden doğar: `node scripts/current-work.mjs baslat "<proje>"` onu açar.
- Eski `resimler/` ve `Resimler/` klasörleri **okunmaya devam eder** ve taşınmaz — içlerinde
  Mami'nin gerçek kareleri var. Yeni rutin onların yanında yaşar.
- Boş `images/` bir kusur değildir: kare inmeden önce klasör zaten vardır, denetçi susar.
- Kare dosyalarının kendisi `.gitignore` ile repo dışındadır (yalnız `.gitkeep` izlenir);
  klasör iskeleti taşınır, 372 MB görsel taşınmaz.
