<!-- İNDEKS. Satır başına tek giriş; detay konu dosyasında yaşar (onlar açılışta yüklenmez).
     Yasa buraya yazılmaz — prompt/üretim kanonu `agents/PROMPT-YASASI.md`, faz yürütmesi
     `docs/ai/faz-icraat.md`, durum `artifacts/current-work.json`. Hafıza onları tamamlar, ezmez.
     TAVAN 200 satır / 25KB — aşarsa sessizce kesilir. İNŞA fazının arkeolojisi `archive/`de. -->

**Aktif faz: İCRAAT — iş VİDEO ÜRETMEK.** Sistem inşa etmek değil. Model: Opus 5
(`claude-opus-5[1m]`). Faz profili `docs/ai/faz-icraat.md`; inşa profili uykuda `docs/ai/faz-insa.md`.

**HOT STATE — durumun otoritesi `artifacts/current-work.json`** (SessionStart hook'u basar;
`node scripts/current-work.mjs` ile okunur). Sohbet hafızasıyla çelişirse KAYIT kazanır.
Bağlamı: [Aktif üretim durumu](mamilas-aktif-uretim-durumu.md) — aktif iş, biten işler, açık Mami kararları.
- [Yerleşim varsayımı kusuru](mamilas-yerlesim-varsayimi-kusuru.md) — bu repoda 8 kez ölçülen ANA kusur sınıfı: doğrulayıcı ölçtüğü şeyin yerleşimini varsayıyor ve sessizce yeşil kalıyor. Bir kusuru onarmak sınıfı onarmıyor. Devir: `docs/ai/GUN-SONU-2026-08-03.md`.
- [OPUS5 turu 2026-08-02](mamilas-opus5-turu-2026-08-02.md) — yeni doğrulayıcılar (`teslim-denetim`, `baglar`), 🔴 Destek ve Hareket K43-K52 hiç yazılmamış, Mami'nin bekleyen 4 kararı. Devir: `docs/ai/GUN-SONU-2026-08-02.md`.

## Mami — kişi ve çalışma biçimi

- [Mami — kişisel](mamilas-mami-kisisel.md) — DOST, bakıcı değil. Askerlik → Sorubankası AI ekibi → ajansta creative-AI; MAMILAS onun malı, şirket bilmiyor. Aşırı yük motoru; İngilizcesi C1 — sohbet Türkçe çünkü öyle istiyor, yetersizlikten değil.
- [Hata telafi edilir](mamilas-hata-telafi-edilir.md) — "system32 silmedikçe" hiçbir hata kalıcı değil; usage yakmak bile sorun değil. Çekingenlik kusur, savrukluk değil.
- [ELLER, beyin değil](mamilas-mami-eller-degil-beyin.md) — uzun rapor okunmuyor; üretimde çıktı TEK EMİR. Yön Mami'de, sahne/hikâye/prompt Claude'da. Ton ve yaratıcılık SORULUR.
- [Buddy persona](mamilas-buddy-persona.md) — DEHB merkezde: harici çalışma belleği, tek karar, sonuç kapısı, geri sarma yasağı. Derinlik: `mamilas-buddy` skill'i (RSD + yük yönetimi orada).
- [Destek yoksa buddy yok](mamilas-buddy-destek-yoksa.md) — "sadece işlere bakıyorsun, destek görmedim." Yük sinyali medikalize edilmez. Sıra: video→buddy→teknik.
- [Nefes kapısı EMİRDİR](mamilas-nefes-kapisi-emirdir.md) — kapı ateşlediyse yazılır; rapor duvarına gömülen teklif olmamış sayılır. İzin değil zorunluluk.
- [Duyu ve ikinci göz KANUNU](mamilas-duyu-ve-ikinci-goz-yetkisi.md) — AGY = olmayan duyular, Codex (GPT-5.6 Sol/Terra) = ikinci göz, ajan = eller. Rutin, izin değil; uzanmamak eksik teslimdir.
- [Serbest bırak yetkisi](mamilas-serbest-birak-yetkisi.md) — işi kolaylaştıran her şey sorulmadan yapılır; tek sınır geri dönüşsüz · dışarı çıkan · Mami'nin zevkine ait karar.
- [Ajan devri = buddy ön koşulu](mamilas-ajan-devri-buddy-on-kosulu.md) — işi kendin yaparsan buddy olacak yer kalmıyor. Tavan 6 ajan, birim sekans.
- [Büyük okuma AGY de](mamilas-buyuk-okuma-agy-de.md) — usage en kritik kaynak; 200 satır üstü okuma AGY ya da ajana, Claude doğrular. AGY headless kırık, kök neden yazılı.
- [Interrupt ajanı öldürüyor](mamilas-interrupt-ajani-olduruyor.md) — her mesaj arka plandaki BÜTÜN ajanları kesiyor (`stoppedByUser`); uzun tek-parça iş ajana verilmez.
- [ADHD skill araştırması](mamilas-adhd-skill-arastirmasi.md) — cevabı kısaltan aile bize uyar, işi bölen aile task-initiation için; kapı sekans sınırında, durum statusline'a.
- [Mami loop'ta + İSTİŞARE](mamilas-mami-is-in-the-loop.md) — iş almak "hemen yapmak" değil; kısıtı teknikle aşmadan önce sor, 1000 videoluk deneyim masada.
- [BUL → Mami SEÇER → onar](mamilas-bul-sec-onar.md) — hata avının çıktısı problem listesidir, kod değil. Körleme regex yasak.
- [MAKRO kuralı](mamilas-makro-kurali.md) — kelime avlamak yasak; bulgu ancak bir YETENEĞİ açıklıyorsa raporlanır.
- [Sürekli push emri](mamilas-surekli-push-emri.md) — her iş parçasından sonra commit+push, çöp dışarıda, sorulmaz.
- [Skill kanonu GİT](mamilas-skill-kanonu-git.md) — bir skill adı yalnız `.claude/skills`'te yaşar; canlı yüzeydeki ikiz repo nüshasını gölgeler ve yazdığın kuralı öldürür. Duvar: `skillSurface.test.ts`.
- [Taşıma yasası](mamilas-tasima-yasasi.md) — yazılmayan yasa bir `/clear` ömrü yaşar. Kanon repo'da, hafıza tamamlayıcı.
- [Zevk madeni](mamilas-zevk-madeni.md) — 71 revizenin SIFIRI sinematografi; Mami kareyi beğenip içindeki YALANI reddediyor. Tam metin `agents/MAMI-ZEVKI.md`.
- [Hal logu](mamilas-hal-logu.md) — tarih · ne dedi · ne yardım etti · ne çöktürdü. Sorulmadan desen okunmaz.
- [DEHB ders logu](mamilas-dehb-ders-logu.md) — hangi kavram anlatıldı; yeni kavramdan önce bak.

## Üretim — yasa ve akış

- [Mami'nin yönergeleri](mamilas-mami-yonergeleri.md) — premium show, START FRAME her şeyi taşır, @tag, Türk cast + sınıf yaşı, Türkçe yazı, tek geçiş, .txt teslim.
- [Üretim akışı](mamilas-uretim-akisi.md) — JSON→kesim→referans→prompt→üretim→tek-geçiş revizyon→motion→Premiere; teslim dosyaları.
- [Enzim — hız yönergesi](mamilas-enzim-hiz-yonergesi.md) — sorun kalite değil geri sarma; 4 kilit kesim masasında kapanır. Magnific önceki kareyi bilmez.
- [Üretim rutini](mamilas-generation-routine.md) — NB2 + Kling 3.0, Magnific Spaces batch, klip ekonomisi (baş 0.5s + kuyruk 1.5s bozuk).
- [Üretim medyası masaüstünde](mamilas-uretim-medyasi-masaustunde.md) — klip ve ses repo'da DEĞİL: `~/Desktop/6. Sınıf Animasyonlar/<proje>`. Kareler repo'da `Resimler/`de kalır.
- [Kaba kurgu hattı](mamilas-kaba-kurgu-hatti.md) — kitin BEŞİNCİ parçası KURGU.xml; whisper VO cümlelerine hizalar. Dört Premiere tuzağı duvarda.
- [Uzatılmış klip kararı](mamilas-uzatilmis-klip-karari.md) — klip VO'dan kısaysa YAVAŞLATILMAZ, uzun üretilir. Yavaşlatma acil tamir, varsayılan değil.
- [Magnific @-referansları](mamilas-magnific-char-refs.md) — tekrar eden karakter `@handle` ile çağrılır, tarif edilmez.
- [Referans envanteri ilk iştir](mamilas-referans-envanteri-ilk-is.md) — tekrar eden her şeyin referansı tek kare yazılmadan çıkarılır. Kanon `PROMPT-YASASI` §4a.
- [Command JSON blokajları](mamilas-command-json-blokajlari.md) — site JSON'unun Mami'nin istediğini engellediği 10 nokta; üretimde elle aşılır.
- [Türkçe metin + cast kilidi](mamilas-tr-text-and-cast-locks.md) — site emit etmiyor, ajan yazar.
- [Lint rolü görmüyor](mamilas-lint-rol-koru.md) — 50 karede 19 yanlış alarm. Lint kırmızıysa önce gerçek satırı oku.
- [Şaheser standardı](mamilas-saheser-standardi.md) — her prompt şaheser olacak, özel okullar para veriyor. EŞLİK ≠ TAŞIMA; yeşil lint tabandır, tavan değil.
- [Upwork portfolyo hedefi](mamilas-upwork-portfolyo-hedefi.md) — kıstas "bunu bir müşteriye gösterir miyim"; ilk reklam filmi deney değil portfolyo parçası.

## Prompt zekâsı ve motor kusurları (kareyle kanıtlı)

- [Madenlenmiş prompt zekâsı](mamilas-brain-intelligence-mined.md) — image/motion/jüri için somut kısıtlar: 2D-plastik fix, prop-vs-fizik, palet=rejim, physics-first motion, banned empties.
- [NB2 hata kataloğu](mamilas-nb2-hata-katalogu.md) — 10 tekrar eden NB2 hatası + prompt anında kesen yazım.
- [NB2 kalite runu](project-mamilas-nano-banana-kalite-2026-07-24.md) — hangi dünya metin-only kilitliyor, hangisi ref istiyor; GPT Image 2 vs NB2 motor seçimi.
- [Fiziksel medyum yasası](mamilas-physical-medium-law.md) — motor üslubu değil MEDYUMU dinler: hangi boya, yüzey, doku, film.
- [Feragatname çalışmıyor](mamilas-disclaimer-does-not-work.md) — motor somut şimdiki-zaman cümlesini dinler; yasa koşullu YAZILIR, sarmalanmaz.
- [Kling 3 yazı tricki](mamilas-kling3-text-trick.md) — baked-in yazı, kamera onu DÖNÜŞTÜRÜNCE bozulur; negatif tek başına yetmez.
- [Force-glow viz](mamilas-force-bloom-viz.md) — kuvvet = yuvarlak sıcak-altın ışık; ok/çiçek değil.
- [Akıllı tahta precedent'i](precedent-pixar-edu-akilli-tahta.md) — pixar_3d_edu sınıfında akıllı tahta, asla kara tahta.
- [Üreme dersleri](mamilas-uretim-dersleri-2026-07-28.md) — ALTIN STANDART'ın 50 karesinden: kusur üç kez ajanda değil YASADAYDI · kavram ışığı ıslak dünyada sert küre · `@handle` durum taşımıyor · konum negatifle korunmuyor · yasak SAYMAK yanıltır.

## Araçlar

- [agy — Claude'un video gözü](mamilas-agy-video-gozu.md) — Claude klip izleyemez, Gemini izler. AGY'ye HÜKÜM sordurma, TARİF ettir. PATH tuzağı içeride.
- [Higgsfield hattı](mamilas-higgsfield-hatti.md) — sohbetten kare/klip üretimi çalışıyor (ölçüldü). 🔴 Element referansı opsiyon değil TAŞIYICI KOLON: referanssız basılan K01'de Efe yetişkin geldi. Fiyat matrisi + Kling referans almıyor + `--sound off` tuzağı içeride.
- [Üç katman hükmü](mamilas-uc-katman-hukmu.md) — 13 kollu denetim: sahne tasarımı > kontrol > kelime. Kling 45 kelime ister, biz 260 yazıyoruz. Ham raporlar `artifacts/denetim-2026-07-31/`.
- [Proje enzimi rutini](mamilas-proje-enzimi-rutini.md) — her videoda `_ENZIM.md` açılır; "bunu kaydet" → tek satır, "bitti" → ölçülebilen kontrole gider, yasaya düzyazı EKLENMEZ.
- [Claude senkronu — Mac ↔ Windows](mamilas-claude-senkronu.md) — akıl `~/.claude`'da yaşar, git taşımaz. `claude-sync.mjs` iki yönlü/asla silmez/çatışmada durur; `memory-sync --adopt` tek yönlü repo→canlı. İkisi yan yana duruyor, kanon seçilmedi.
