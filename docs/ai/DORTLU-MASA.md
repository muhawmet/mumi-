# DÖRTLÜ YÖNETMEN MASASI — tek otorite

> **Bu dosya rollerin, sonuç sözlüğünün ve beş tetikleyicinin TEK kaynağıdır.**
> Başka hiçbir belge bu listeyi kopyalamaz; buraya bağlanır. Kopyalamak, bu repoda sekiz kez
> ölçülen kusur sınıfının kendisidir (iki nüsha ayrışır, biri sessizce ölür).
>
> **Nasıl çağrıldıkları burada YAZMAZ** — Codex ve AGY'nin komut satırı, model seçimi, maliyeti
> ve bilinen tuzakları `CLAUDE.md` → *İKİNCİ GÖZ VE GERÇEK GÖZ* bölümündedir. Burası **ne zaman**
> ve **hangi sonuçla**; orası **nasıl**.

Doğuş gerekçesi (2026-08-05): bu sözleşme aylarca yalnız oturum planında yaşadı, repo'da tek
satırı yoktu. Plan ölünce yasa da öldü — *yazılmayan yasa bir `/clear` ömrü yaşar.*

---

## 1. Dört rol — birbirinin yerine geçmez

| Rol | Ne yapar | Ne YAPMAZ |
|---|---|---|
| **Claude** | Ana yönetmen ve uygulayıcı. Plan, Shot Card, start-frame promptu; **gerçek kare görüldükten sonra** final motion. | Sol/AGY sonucu uydurmaz. Mami adına estetik hüküm vermez. Her kare için kurul toplamaz. |
| **Codex Sol** | Karşı-yönetmen. **Gerçek** Plan/Shot Card/frame/clip yollarını okur ve iddiayı çürütür. | Prompt yazmaz. Jüri değildir. Claude'un özetine güvenmez. Rutin klasör sayımına harcanmaz. |
| **AGY** | Gerçek göz. Kendisine verilen **gerçek medyayı** (canary klipleri, tam video) zaman damgasıyla **TARİF eder**. | Prompt/lint/XML/Claude açıklamasından kalite hükmü vermez. `PASS_CANDIDATE` yazmaz. Otomatik yargıca dönüşmez. |
| **Mami** | Üç kararın tek sahibi: **Vizyon Kilidi readback · Canary hükmü · Tam video final hükmü.** | Form doldurmaz. Rutin paket için onay vermez. |

**Mami'nin ham cümlesi kanıttır.** *"Plastik"*, *"motion duygusal"*, *"bu dünya çalışmadı"* —
bunlar estetik kanıtın kendisidir; yapılandırılmış bir forma çevrilmeleri gerekmez.

**Mami'nin bir turdaki zorunlu karar sayısı üçü geçmez.** Sorunsuz paket tekrar onay istemez;
yalnız istisna ona gider.

---

## 2. Sonuç sözlüğü — bu dört kelimeden başkası yazılamaz

Sol'un çıktısı **yalnız** şunlardan biridir:

| Sonuç | Anlamı | Claude ne yapar |
|---|---|---|
| `CLEAR TO CONTINUE` | Varsayım ayakta | devam |
| `RESHAPE` | Varsayım kırık | sahne **Shot Card'dan itibaren** yeniden kurulur — **akışı geri saran tek sonuç budur** |
| `NARROW` | Genelleme fazla geniş | daraltılan kilit uygulanır ve kayda **tek sonuç** olarak yazılır |
| `UNPROVEN` | Görsel/klip kanıtı yok | canary'nin **ölçeceği hipoteze** dönüşür; tek başına blokaj değildir |

**`SOL_UNAVAILABLE`** — Sol'a gerçekten ulaşılamadıysa yazılır. Dürüst kayıttır.
🔴 **Sahte `CLEAR` yasaktır.** Gerçek sonuç gelmeden `CLEAR TO CONTINUE` yazılamaz; ne Sol'un
ne AGY'nin çıktısı uydurulabilir; otomatik provider çağrısı / API loop'u kurulamaz.

**AGY'nin çıktısı hüküm değildir.** Zaman damgalı tarif üretir. `APPROVED` ve `MOTION_VERIFIED`
yalnız **Mami'nin ham cümlesiyle** doğar.

### Claude'un karşılığı — her bulguya TEK kelime

Sol ya da AGY'den gelen her bulgu, kayda **tek** karşılıkla geçer. Başka kelime yazılamaz;
özellikle **"sonra bakarız" yasaktır** — adlandırılmamış erteleme, bulgunun sessizce ölmesidir.

| Karşılık | Anlamı |
|---|---|
| `uygulandı` | bulgu kabul edildi ve değişiklik yapıldı |
| `daraltıldı` | bulgu doğru ama kapsamı fazla genişti; daraltılmış hâliyle uygulandı |
| `kanıt yetersiz` | bulgu reddedilmedi, **adı verilmiş** bir sonraki task'a ya da canary hipotezine bağlandı |

---

## 3. Beş tetikleyici — masa yalnız burada toplanır

**1 · VİZYON KİLİDİ + CANARY SHOT CARD HAZIR** → Claude → Sol.
Sol şunları çürütür: ritim · tekrar · ref rolleri · animasyon ayrıcalığı · start-frame olay
eşiği · risk kör noktaları. **Sol sonucu kayda geçmeden canary açılmaz.**

**2 · CANARY FRAME'LERİ GELDİ** → Claude ve Mami **gerçek kareyi açar**.
bozuk kare → revize + `MOTION INTENT` · temiz kare → frame-aware canary motion.
**AGY burada çağrılmaz** — prompta ve kareye değil, gerçek klibe bakar.

**3 · CANARY KLİPLERİ GELDİ** → Claude → AGY: gerçek klip üzerinden morph, ağız hareketi,
geometri drift'i, olay okunurluğu, kamera sapması ve kesim anı **tarif ettirilir**.
Claude → Sol: AGY tarifi + gerçek klip + `CANARY-LOCK` taslağı çürütülür.
Mami tek hüküm verir: **bu lehçeyle devam** ya da **yeniden kur**.
Yalnız bundan sonra `CANARY-LOCK` yazılır ve ilk 8-12 shot paketi açılır.

**4 · AYNI SHOT İKİ KEZ BOZULDU** → Claude **üçüncü referans-edit yamasını yazmaz.**
Sol zorunlu devreye girer ve dördünden hangisinin yanlış olduğunu ayırır:
prompt mu · start-frame mi · ref ithalatı mı · motion fiziksel olarak imkânsız mı.

**5 · TAM FİLM HAZIR** → AGY **bütün filmi** baştan sona tarif eder (klip klip değil — kurgu,
akış ve duygu ancak bütünde görünür). Sol kurgu tekrarını, duygu eğrisini ve portfolyo çıtasını
o kanıt üzerinden çürütür. Mami final hükmünü verir. **Ancak sonra** hasat, precedent ve makro
ders adayı doğar.

**Bunların dışında masa toplanmaz.** Rutin her prompt, her kare, her 10'lu paket için Sol
harcanmaz, AGY çağrılmaz, Mami'ye soru gitmez.

---

## 4. Artefact yerleşimi — yeni rapor mezarlığı kurulmaz

Kalıcı kanıt **mevcut proje artefact'inin içinde kısa bir blok** olarak yaşar:

| Ne | Nerede |
|---|---|
| Sol **Plan** hükmü | proje `_ENZIM.md` → **KİLİT 5** altında |
| Sol + AGY + Mami **canary** hükmü | `<Ad>_CANARY-LOCK.md` altında |
| İki kez bozulan shot hükmü | o shot'ın **kendi Shot Card'ı** altında |
| Final AGY + Sol özeti | mevcut **kapanış hasadı** altında |

Her blok yalnız dört şey taşır:
**incelenen GERÇEK yollar** (mümkünse `sha256`) · **bulgu** · **Claude'un uyguladığı TEK sonuç** ·
varsa **Mami'nin ham cümlesi**.

`~/Desktop/mamiş/` yalnız **dış göz transfer alanıdır** — kanonik receipt değildir, otorite
değildir. Oradan gelen bulgu repo'daki bloğa taşınmadıysa yaşamamış sayılır.

Bloğun **biçimi** ve dış göze verilecek brief kalıpları: `agents/DIS-GOZ-BRIEF-SABLONU.md`.
Bloğun kendisi altı alan taşır — `KOŞULDU` · `OKUNAN` (+ `sha256`) · `HÜKÜM` · `BULGU` ·
`SONUÇ` · (opsiyonel) `MAMİ`. **`KOŞULDU` ve var olan bir `OKUNAN` yolu zorunludur**: sahte
`CLEAR`'ı kelimeyle değil ölçenle engelleyen duvar budur.

---

## 5. Ölçen

Bu sözleşmenin kodla zorlanan kısmı:

| Ölçen | Ne zorlar |
|---|---|
| `scripts/hukum-blogu.mjs` | hüküm bloğu **uydurulamaz**: koşma kaydı yoksa, okunduğu iddia edilen yol diskte yoksa ya da sözlük dışına çıkılırsa **kırmızı** |
| `node scripts/current-work.mjs ilerle --faz uretim` | canary kilidi yoksa **reddeder** |
| `scripts/dortlu-masa.test.mjs` | bu dosyanın kanon olarak bağlı kaldığını ve **nüshalanmadığını** kilitler |
