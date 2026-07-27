> **Prompt yazımının kanonu hafızada değil, repo'da:** `agents/PROMPT-YASASI.md`
> (daimi direktifler + start-frame/motion/referans template'leri). Hafıza onu tamamlar, ezmez.

## Mami — kişi ve çalışma biçimi

- [Mami — kişisel](mamilas-mami-kisisel.md) — DOST, bakıcı değil. Mülakat TAMAM: askerlik (1 saatte ADOP, gece amiri) → Sorubankası AI ekibi, ajansın en değerlisi → MAMILAS onun malı, şirket bilmiyor → aşırı yük motoru (%16 katılım, 3.50) → zevk listeyle değil seçerek açığa çıkar → İngilizce akıcı/yazılı zayıf.
- [Buddy persona](mamilas-buddy-persona.md) — DEHB **merkezde**, yan destek değil: harici çalışma belleği, tek karar, sonuç kapısı, geri sarma yasağı, konudan konuya atlar ve hiçbiri düşmez, "bak şunu yaptık" özeti. Derinlik: `/mamilas-buddy`.
- [Hal logu](mamilas-hal-logu.md) — tarih · o gün ne dedi · ne yardım etti · ne çöktürdü. Yorum yok, desen için; Mami sormadan desen okunmaz.
- [DEHB ders logu](mamilas-dehb-ders-logu.md) — hangi kavram anlatıldı (tekrar etmemek için); yeni kavramdan önce bak, sonra işle.
- [MAKRO kuralı](mamilas-makro-kurali.md) — Mami'nin birinci kuralı: kelime avlamak yasak; bulgu ancak sistemin bir YETENEĞİNİ açıklıyorsa raporlanır, kelimeler yalnız kanıttır.
- [BUL → Mami SEÇER → onar](mamilas-bul-sec-onar.md) — STANDING ORDER: hata avının çıktısı problem listesidir, kod değil; körleme yama ve yeni regex/keyword tablosu yasak.
- [Mami loop'ta](mamilas-mami-is-in-the-loop.md) — MAMILAS otonom değil; bir bulguyu kapatmadan önce "Mami bunu bir cümleyle düzeltir mi?" diye sor. Aşırı mühendislik tuzağı.
- [Simülasyon döngüsü](mamilas-simulation-loop.md) — asıl denetim: fabrikayı fabrikaya değil, onu KULLANAN ajana sor.
- [Batch mod mandası](mamilas-batch-mode-mandate.md) — sahne-sahne onay reddedildi; varsayılan TOPLU mod, verdict de toplu (istisna listesi).
- [Push serbest](mamilas-push-serbest.md) — kapı yeşilken commit main'e push'lanır; eski "PUSH YOK" kuralı iptal.

## Üretim — yönerge ve akış

- [Mami'nin yönergeleri](mamilas-mami-yonergeleri.md) — premium show, START FRAME her şeyi taşır (Kling yeni öğe üretemez), 50-50 karakter, @tag, Türk cast + sınıf yaşı, Türkçe yazı, motion/kamera/süre, revize kararı, .txt teslim.
- [Enzim — hız yönergesi](mamilas-enzim-hiz-yonergesi.md) — sorun kalite değil geri sarma; 4 karar (preset, karakter oranı, tag listesi, yazı planı) kesim masasında kilitlenir. Spaces kare hafızası yok; negatifte olmayan nesneyi anma.
- [Üretim akışı](mamilas-uretim-akisi.md) — uçtan uca: JSON→kesim→referans→faz faz prompt→üretim→tek-geçiş revizyon→motion→Premiere; teslim .txt seti.
- [Üretim rutini](mamilas-generation-routine.md) — Mami'nin gerçek üretim rutini ve klip ekonomisi (motorlar, Kling zamanlaması, temiz koşu için sahne tavanı).
- [Magnific @-referansları](mamilas-magnific-char-refs.md) — tekrar eden karakter `@handle` ile çağrılır; görünüş tarif edilmez, kimliği ref taşır.

## Motor kusurları (kareyle kanıtlı)

- [NB2 hata kataloğu](mamilas-nb2-hata-katalogu.md) — gerçek render'larda tekrar eden 10 NB2 hatası (aynalı yazı, "0 N"→"ON", yüzen nesne, yüzde glow, yeşil cilt, ikiz etiket, rol kayması, tag'siz prop drift, garbled tabela, çiçek-glow) + prompt anında kesen yazım.
- [NB2 kalite runu](project-mamilas-nano-banana-kalite-2026-07-24.md) — hangi dünya metin-only stil kilitliyor, hangisi ref/isim gerektiriyor; One Piece metinle tutmuyor.
- [Kling 3 yazı tricki](mamilas-kling3-text-trick.md) — baked-in yazı, kamera onu DÖNÜŞTÜRDÜĞÜNDE bozulur; yazı taşıyan karede push-in/zoom yazma, negatif tek başına yetmez.
- [Fiziksel medyum yasası](mamilas-physical-medium-law.md) — motor soyut üslubu değil MEDYUMU dinler: hangi boya, hangi yüzey, hangi doku, hangi film. "2D plastik"in kareyle kanıtlı çözümü.
- [Force-glow viz](mamilas-force-bloom-viz.md) — fizik-edu'da kuvvet = golden ışık-glow'u (ok/çiçek değil): boyut=büyüklük, birleşir=toplama, çarpışır=çıkarma, eşit-zıt=R0.
- [Türkçe metin + cast kilidi](mamilas-tr-text-and-cast-locks.md) — site emit etmiyor ama gerekli: her harf Türkçe (İngilizce filler yasak) + Türk/Anadolu cast, pozitif tarifle.
- [Feragatname çalışmıyor](mamilas-disclaimer-does-not-work.md) — motor ve ajan soyut sarmalamayı değil somut şimdiki-zaman cümlesini dinler; yasa koşullu YAZILIR.
- [Akıllı tahta precedent'i](precedent-pixar-edu-akilli-tahta.md) — pixar_3d_edu sınıf karelerinde arka pano akıllı tahta, asla kara tahta (Mami onaylı yön).

## Sistem — mimari ve tuzaklar

- [Taşıma yasası](mamilas-tasima-yasasi.md) — sistemin tek hastalığı bilgiyi TAŞIYAMAMAK; yazılmayan yasa bir `/clear` ömrü yaşar. Kanon repo'da (`agents/PROMPT-YASASI.md`), hafıza tamamlayıcı; taşınabilirlik kalite kuralı; sessiz geçiş yasak.
- [MAMILAS Decision Pipeline](mamilas-decision-pipeline.md) — aktif dönüşüm; her oturumda önce EXECUTION_STATE.md okunur, sohbet hafızasına güvenilmez.
- [Site tarif, ajan prompt](mamilas-site-tarif-ajan-prompt.md) — site TARİF üretir, motor prompt'unu AJAN yazar; site prompt yazmaz.
- [Reçete zekâsı](mamilas-recete-zekasi.md) — kaldıraç reçete: enzim'in 4 kilidinden 3'ü BaseDecision'da hiç yoktu → geri sarmanın kaynağı. Ölçüt "zekâ artıyor mu", silme masada değil.
- [V2 kütüphane — makro](mamilas-v2-kutuphane-makro.md) — 46 dünyanın 45'i hiç kare görmedi; darboğaz kelime kusuru değil doğrulama maliyeti → ortak 5-kare sınav seti. Kusur kütüphanede düzeltilir, kodda değil.
- [Madenlenmiş prompt zekâsı](mamilas-brain-intelligence-mined.md) — `agents/promptQuality.mined.json`'un 17 maddesinin doğduğu kazı: detay üçlüsü, kendi kendine yeten kare, boş kalite sıfatı yasağı.
- [Bağlam ekonomisi](mamilas-context-economy.md) — Claude'un MAMILAS'ta loop'a girmesinin mekanik sebebi ve kapatılışı (SURGERY_DATA token yükü, anlatı CLAUDE.md, rica olan kapı).
- [Test yüzeyi içi boş](mamilas-test-suite-is-hollow.md) — testlerin büyük kısmı hiçbir gerçek kusuru reddetmiyor; mutasyon testiyle ölçüldü. Yeşil test yetenek kanıtı değildir.
- [getByLabel Türkçe tuzağı](mamilas-getbylabel-turkish-trap.md) — e2e'de Türkçe etiketler sessizce tutmuyor (smartUpper 'ı'yı 'I' yapıyor); yazılıp koşturulmamış test kırık kalır.

## Aktif işler

- [Bileşke Kuvvet durumu](mamilas-bileske-kuvvet-world-explainer.md) — 52 kare + motion yazıldı; @mira/@ali/@can/@araba/@kitap; kesim 69→52.
- [Kuvvet brief kıstas değil](mamilas-kuvvet-brief-not-kistas.md) — Kuvvet Ölçümleri brief Antigravity ürünü, düşük kalite; gerçek referans Sürtünme.
- [Command JSON blokajları](mamilas-command-json-blokajlari.md) — site JSON'unun Mami'nin istediğini engellediği 10 nokta (cast boş, yaş yok, "saffron", "sheen", anonim-gövde yasası, clean-plate, boş DIRECTOR TASK, filler birleşmiyor).
