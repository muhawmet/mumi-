# CLAUDE — KARŞI BRİF (Codex'in `claude.txt` brifine ek ve itiraz)

> Tarih: 2026-08-04 · Kaynak brif: `~/Desktop/claude.txt` (Codex, 17 madde)
> Bu dosya Codex'in brifini **değiştirmez**, üstüne bindirir. Codex'in doğrulanabilir
> 4 iddiasından 3'ü tam tuttu, 1'i benim ölçtüğümden yumuşaktı. İyi bir brif.
> Aşağıdakiler Codex'in **göremediği** yerlerden: kareyi göremez, hook durumunu okumaz,
> Mami'nin yorulduğu yeri hiç bilmez.

---

## M1 — Öğrenme organı tıkalı. Brifin görmediği en büyük şey.

**Ölçüm (2026-08-04):**

| Ne | Değer |
|---|---|
| `APPROVED.md` kapasitesi | 20 satır (`lessonBank.ts` → `slice(-20)`) |
| İçindeki ders | **7** |
| 7 dersin kaynak projesi | **1 tane** (Birlikte Daha Güçlüyüz, 2026-07-31) |
| 7 dersin konusu | **1 tane** (yüzeydeki Türkçe yazı) |
| Bekleyen aday | **107**, 16 projeden, 11 dosyada |

Bu dosya dekoratif değil: **runner CONTEXT.json → author (image/motion)**,
**`.claude/skills/mamilas-director`** ve **enzim** üçü de bu bankayı okur. Yani
"MAMILAS'ın üretim zekâsı" fiilen **tek projenin tek konusudur.** Motion dersi yok,
plastik ten dersi yok, kompozisyon dersi yok, kaynak-tonu dersi yok.

11 video üretildi, 71 revize yaşandı, 107 ders ölçüldü — **hiçbiri üretime geri dönmedi.**

**Kusur onay adımında değil, onayın MALİYETİNDE.** 107 satırı okuyup seçmek Mami için
bir akşam. Kimse bir akşamını ders onaylamaya vermez, o yüzden hiç onaylanmadı.

**Onarım (kod değil, iş):** 107 adayı ajanlarla okut → MAKRO'ya indir (kelime değil
**yetenek** dersi) → projeler arası **tekrar sayısına** göre sırala → Mami'ye tek
seçilebilir liste sun. Onay 10 dakikaya düşer.

**İkincil kusur — tavan konumsal:** `slice(-20)` değere değil **sıraya** bakıyor.
8. yazı dersi ile 1. motion dersi aynı yarışta ve yazı dersi kazanıyor, çünkü daha yeni
yazılmış. Tavan konu-çeşitliliğine duyarlı olmalı ya da hiç olmamalı.

---

## M2 — Codex'in brifi MAMİ'YE VERGİ KOYUYOR.

Brifin içinde en az beş yeni "Mami hükmü" alanı var: TAKE-LEDGER verdict · CLIENT-NOTES
hükmü · review receipt hükmü · final AV ses dengesi hükmü · PLAN onayı.

Mami **zaten sistemin dar boğazı.** Kareyi o basıyor, klibi o basıyor, zevkin son sözü
onda. Ona proje başına beş yeni karar noktası eklemek sistemi hızlandırmaz, yavaşlatır.

**Kural (bu inşa turunun tamamını bağlar):**
> Hiçbir yeni sistem Mami'ye tıklama EKLEYEMEZ — eklediğinden fazlasını götürmedikçe.

Somut karşılığı: TAKE-LEDGER makine seçimini **varsayılan** yapar ve Mami'ye yalnız
gerçekten belirsiz yerde sorar (aynı K için **içeriği farklı** iki take — süresi farklı
iki take değil). "Mami hükmü" alanı boş kalabilmeli ve boş olması hata sayılmamalı.

---

## M3 — Her yeni kapı, KIRMIZI olabildiğini kanıtlamalı.

Bu repoda **8 kez ölçülen** ana kusur sınıfı: *doğrulayıcı, ölçtüğü şeyin yerleşimini
varsayıyor ve sessizce yeşil kalıyor* (`gate.sh` python3 aradı · `protocolHash` CRLF ·
`buddy-gate` ham komut aradı ama rtk yeniden yazıyor · `agentsSync` satır sonu).

Codex'in brifi **altı yeni doğrulayıcı** öneriyor (reconcile · AGY receipt · AV review ·
lint · ledger · sync makbuzu). Her biri bu kusur sınıfının yeni bir örneğidir — aksi
kanıtlanmadıkça.

**Kural:** Bu turda yazılan hiçbir kapı, **kırmızı yandığını gösteren bir fixture
olmadan** teslim edilmez. Yeşil kapı kanıt değildir; kırmızı yanabilen kapı kanıttır.

---

## M4 — Yasa büyüyor, KAPI büyümüyor.

Ölçülmüş en yüksek getirili organ `prompt-lint`: 71 revizenin **~44-52'si** orada,
tek kredi yakmadan kesiliyor. Codex'in 17 maddesinin **hiçbiri** bu organı büyütmüyor.

Buna karşılık yasa büyüyor: `PROMPT-YASASI.md` **81.8K**, son bir haftada §0 (Animasyonun
Ruhu), 5ø (kaynağın tonu), 5øø (siluet okuması) eklendi. Bu üç maddenin **hiçbirinin
makine kapısı yok** — yalnız ajanın onları o gün okumuş olmasına bağlılar.

Mami'nin kendi teşhisi bunun sonucudur: *"çit çektik, içinde takılıyoruz."* Okunamayacak
kadar büyüyen yasa, çite dönüşür; ölçülen yasa kapıya dönüşür.

**Onarım:** Yasaya madde eklemek serbest — **ama her yeni madde ya lint kontrolü doğurur
ya da açıkça "ölçülemez, ajan gözü" damgası yer.** Ölçülemeyen madde yasada kalır ama
KAPSAM satırında görünür: *"yeşil şunu kapsamıyor."*

---

## M5 — MİHENK görsel olmalı ve KARELERİ AÇAN yazmalı.

Codex'in 9. maddesi doğru ama eksik tarif edilmiş. Not:
`agents/EN-IYI-ORNEKLER/` zaten **var** — içi metin (PROMPTLAR.txt, MOTION-*.txt).
Yani metin mihenki var, görsel mihenk yok. Mami'nin şikâyeti ("plastik") metinle
taşınmayan bir kusur, o yüzden metin mihenki onu çözmedi.

**İki ek:**
1. Kareleri **Claude açar** (Read PNG okuyor — Codex göremez). Her kayıt: gerçek kare +
   proje/K + neden iyi olduğu **tek cümle** + hangi dersin örneği.
2. **Negatifi olmadan mihenk öğretmez.** Yanına *"aynı dünyada plastik çıkan kare"*
   konur. Zevk övgüyle değil **karşıtlıkla** taşınır — Hücre işi bunun kanıtı: aynı
   projede hem "HIGH END ribozom" hem "plastik Mira" var.

---

## M6 — Sistem BİTMİŞ FİLMİ hiç görmedi. (Bence ilk yapılacak iş bu.)

11 proje bitti. Hiçbiri **baştan sona izlenmedi.** Elimizde prompt var, motion var, XML
var; **filmin kendisi hakkında tek satır kanıt yok.**

AGY bunu yapabiliyor ve **kredi yakmıyor**: 1M bağlam · istek başına 10 videoya kadar ·
varsayılan çözünürlükte 1 saat video · 3-4 dakikalık tam film rahat izlenir.
Mami'nin duran emri de bu yönde: *"tam videoları izlesene teker teker izleteceğine,
hem kurgu da çok basic onu da anlarsın."*

Bu **üretim durmadan, boş pencerede** yapılabilecek en yüksek bilgili iş:

- "Mira neden plastik" sorusu teoriyle değil **kanıtla** cevaplanır
- M5'in mihenk kütüphanesi gerçek karelerden doğar, hatırayla değil
- M1'in 107 dersi **filme bakılarak** sıralanır, dosyaya bakılarak değil
- Kurgu ritmi hakkında ilk gerçek ölçüm ("çok basic" Mami'nin hükmü — nedeni yazılı değil)

**Sıra bu yüzden ters:** Codex "önce defter kur, sonra üret" diyor. Ben
**"önce bitmiş işe BAK, sonra neyin defterini tutacağını bil"** diyorum.

---

## Kabul edilen Codex maddeleri (değiştirmeden)

- **P0.3 Pilot 6** — brifin en iyi maddesi, kod bile gerektirmiyor, doğrudan kredi koruyor
- **P1.8 Referans rol sözleşmesi** — `identity`/`prop`/`environment`/`composition`/`edit-reference`.
  İlk okumada hafife almıştım: Magnific'in tam boy referanstan bütün sahneyi kopyalaması
  negatif eksikliği değil, **rolün söylenmemesi**
- **P1.7 Revize merdiveni** — "aynı kusur ikinci kez → üçüncü yamaya izin yok"
- **P0.4 TAKE-LEDGER** — M2'deki vergi kuralıyla düzeltilmiş haliyle
- **P0.1 reconcile** — ama asıl kusur Codex'in dediğinden keskin: kayıt bayat değil,
  **`phase` alanı ölü.** Serbest metin güncel (motion 52/52), `faz` hâlâ `enzim`.
  Faz hiçbir şeyi kapıya çevirmiyor, kimse ilerletmiyor, hook onu basıp yanlış söylüyor.
  `plan` fazı eklemek çözüm değil — **fazın bir kapı olması** çözüm.
- **P0.6 AGY kanon çatışması** — proje değil, CLAUDE.md'de 10 satır

## Park edilen Codex maddeleri

12 (AV review) · 13 (delivery manifest) · 14 (eski spec arşivi) · 15 (rapor yaşam
döngüsü) · 16 (memory-sync) · 17 (global skill ayrımı).
Hepsi doğru, hiçbiri kareyi güzelleştirmiyor. Bekleyen bir işi beklerken yapılır.

> 15. maddeye özel not: rapor için durum makinesi kurmak, **raporlar hakkında rapor**
> üretmektir. Okunmayan rapor sorununun çözümü daha az rapor yazmaktır.

---

## Önerilen sıra (Codex'in sırasından farkı)

1. **M6** — AGY bitmiş filmleri izlesin (üretim durmuyor, kredi yanmıyor, her şeyi besliyor)
2. **M1** — 107 aday dersi MAKRO'ya indir, Mami tek geçişte onaylasın
3. **M5** — mihenk kütüphanesi (M6 ve M1'in çıktısından doğar)
4. **P0.3 Pilot 6** + **P1.7 merdiven** + **P1.8 ref rolü** — sonraki videoya yetişir
5. **P0.1 faz kapısı** + **P0.4 ledger** — M2 ve M3 kurallarına uyarak
6. Gerisi park

**M2 ve M3 madde değil, bu turun anayasasıdır** — her maddeye uygulanır.
