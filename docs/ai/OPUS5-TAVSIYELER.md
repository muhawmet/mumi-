# OPUS 5 TAVSİYELERİ — yargı ve öneri (2026-08-02)

> Ölçüm: `docs/ai/SISTEM-HARITASI.md`. Bu dosya **hüküm** verir.
> **BUL → Mami SEÇER → onar.** "UYGULANDI" işaretli olanlar geri alınabilir olduğu için
> beklemeden yapıldı (icra protokolü md.3); ötekiler Mami'nin kararını bekler.

---

## 0. ÖNCE KISTAS — "Opus 5 standardı" ne demek

Ölçmeden önce kıstas yazılır. Altı madde; her biri bu turda **ölçülmüş** bir kusurdan doğuyor,
hiçbiri temenni değil.

**K1 — Her sözleşmenin bir doğrulayıcısı vardır.**
Düzyazıda iddia edilen ama makinede kontrol edilmeyen sözleşme bir sözleşme değil, bir alışkanlıktır.
*Kanıt: `N.png = KN` her yerde varsayıldı, hiçbir yerde doğrulanmadı → 36 klip yanlış cümlenin
altına oturacaktı.*

**K2 — Her bulgunun bir okunma kanıtı vardır.**
Okuyucunun bakmadığı kanala yazılan bulgu üretilmemiş sayılır.
*Kanıt: `hasat-gate.mjs`'in 12 çıktı çağrısının 12'si stderr → stdout 0 bayt. "1.858 satır aday,
7 onaylı ders" olayının mekanizması budur.*

**K3 — Her hüküm tek yerde yaşar; ikinci nüsha üretilir, yazılmaz.**
İki elle yazılmış nüsha kaymaya mahkûmdur; hangisinin doğru olduğunu kimse bilmez.
*Kanıt: motion kelime bandı üç ayrı sayı — yasa `:546`=190-215, yasa `:561`=210-260,
`motion-lint:137`=160-250. Üçü de "yasa" diye okunuyor.*

**K4 — Her yetenek yeniden çağrılabilir; tek kullanımlık metin yetenek değildir.**
*Kanıt: iki kez 200 satırlık ajan brief'i elle yazıldı, işe yaradı, buharlaştı.*

**K5 — Her iş en ucuz yeterli modele gider; ana bağlam en pahalı kaynaktır.**
*Kanıt: 8 modelin 2'si kullanıldı; üç ders üretilirken iş çok ajana dağıldı ve usage bitti.*

**K6 — Yeşil ≠ temiz. Bir ölçüm neyi ÖLÇMEDİĞİNİ söylemek zorundadır.**
*Kanıt: `prompt-lint` yeşilken §2ø ölü kare üretti; `teslim-denetim` 16 projeye yanlış sayı
bastı ve hiç uyarmadı.*

**Bu turda hiçbir şey "sadeleştirme" adına silinmedi.** 917 satırlık yasa karmaşık diye
kısaltılmadı — ölçülmüş bir yasa karmaşık olabilir. Kaldırılan tek şey **kanıtı olmayan
alışkanlıktır**, ve "çağrılmıyor" tek başına kaldırma gerekçesi sayılmadı.

---

## 1. TAVSİYELER — sıralı, bedeli yazılı

### T1 · Teslim sözleşmesi ve doğrulayıcısı — **P0** ✅ UYGULANDI

**Şu an nasıl:** Teslim biçimi bir gelenek. Aynı sistem aynı hafta iki biçim üretti:
`### K01 | VO…` birleşik dosya (Farklı Kültürler, Bileşke Kuvvet) ve `# K01 — "VO"` blok
dosyaları (Hücre, Bitkilerde Üreme, Destek). Doğrulayıcı `teslim-denetim.mjs` **argv almıyor**
(`grep -c process.argv` = 0), hedefi `:4`'te hardcode, regexi `^### K\d+`.

**Kusuru:** Doğrulayıcı üreticiyle aynı sözleşmeyi konuşmuyor ve **sessizce yanlış cevap
veriyor**. 17 projenin 16'sına "53 kare" diyor. Bu K1 + K6 ihlali aynı anda.

**Şöyle yapardık:** `teslim-denetim.mjs` argv alsın, `--all` ile her projeyi yürüsün, **iki
biçimi de** tanısın, tanımadığı biçimde **0 demek yerine "BİÇİM TANINMADI" desin**, ve
kare sayısı ↔ VO cümle sayısı uyuşmazlığında kırmızı versin. Testi olsun.

**Maliyeti:** ~1 saat, 1 script + 1 test dosyası.

**Kazancı (ölçülmüş):** Destek ve Hareket'te **41 kare yazılmış, VO 52 cümle — K42-K52 hiç yok**
ve bunu bugüne kadar hiçbir şey söylemedi. Bitkilerde Üreme'de gerçek 54, denetim 53 diyordu.
Bu doğrulayıcı o gün koşsaydı iki proje eksik teslim edilmezdi.

---

### T2 · Kanal onarımı — bulgular stderr'de ölüyor — **P0** ✅ UYGULANDI

**Şu an nasıl:** `hasat-gate.mjs:23` `const say = s => process.stderr.write(...)` — 12 çağrının
12'si stderr. SessionStart'ta **yalnız stdout modele girer**. `gate.sh` exit 0 yolundaki 16
stderr yazımı da öyle: yeşil satır, doküman drift uyarısı, sync uyarısı, push uyarısı, lint-skip
makbuzu — hiçbiri modele ulaşmıyor.

**Kusuru:** K2 ihlali. Sistem doğru ölçüyor, sonucu kimse görmüyor. `buddy.mjs:257` bunu **zaten
doğru yapıyor** (`hookSpecificOutput.additionalContext`) — desen repoda var, uygulanmamış.

**Şöyle yapardık:** `hasat-gate.mjs` stdout'a yazsın. `gate.sh` yeşil yolda da bir özet satır
bassın (uyarılar dahil). Desen `buddy.mjs`'ten kopyalanır, icat edilmez.

**Maliyeti:** ~20 dakika, 2 dosya.

**Kazancı (ölçülmüş):** stderr'de **üç gerçek bekleyen iş** duruyordu ve modele hiç ulaşmadı.
1.858 satır ders adayı birikti, `APPROVED.md`'de 7 ders var — kanal açılmadan bu oran düzelmez.

---

### T3 · Motion kapıya bağlı değil — **P0** ✅ UYGULANDI

**Şu an nasıl:** `prompt-lint` `gate.sh:155`'te commit duvarında. `motion-lint` (490 satır,
14 kural, testi var) **hiçbir kapıya bağlı değil** — `grep "motion-lint" .claude/hooks/gate.sh`
→ 0 eşleşme. Tek atıf bir README'de.

**Kusuru:** Hattın yarısı ölçülüyor, yarısı ölçülmüyor; ve ölçülmeyen yarı **klip kredisi
yakan** yarı. Start-frame hatası bir kareyi bozar, motion hatası bir klibi.

**Şöyle yapardık:** `gate.sh`'a prompt-lint döngüsünün ikizi olarak motion-lint döngüsü eklenir.

**Maliyeti:** ~20 dakika, 1 dosya.

**Kazancı:** 45 MOTION dosyası şu an denetimsiz commit ediliyor. Ölçülmüş kazanç sayısı yok —
çünkü hiç ölçülmedi; bu tam olarak sorunun kendisi.

---

### T4 · `.md` teslim dosyaları linti atlıyor — **P0** ✅ UYGULANDI

**Şu an nasıl:** `gate.sh:123,133` deseni `*_PROMPTLAR*.txt`. `current-work.mjs:53` ise
`['_promptlar.txt','_promptlar.md']` — **iki dosya aynı hattı iki farklı uzantı kümesiyle
tanıyor.** `Biten/` altında 2 adet `.md` teslim duruyor.

**Kusuru:** K1 ihlali; ayrıca sessiz. `.md` yazan bir oturum kapıdan hiç ölçülmeden geçer ve
kapı yine "✅ Gate yesil" der.

**Maliyeti:** ~10 dakika, 1 satır desen.

**Kazancı:** 2 geçmiş teslim denetimsiz geçmiş. İleride sıfır.

---

### T5 · Model yönlendirme politikası — Mami'nin açıkça istediği ✅ UYGULANDI (belge)

**Şu an nasıl:** 8 model var (Sol 5.6 · Terra 5.6 High · Gemini 3.6 Flash High · Gemini 3.1 Pro
High · Opus 5 · Sonnet 5 · AGY · Claude Max), pratikte **2'si** kullanıldı. Her iş Claude'un ana
bağlamından geçti.

**Kusuru:** K5 ihlali. Ana bağlam en pahalı ve en kıt kaynak; 200 satırlık bir okuma orada
yapıldığında bir daha geri alınamaz. Ayrıca ters kusur da ölçüldü: üç ders üretilirken iş **çok
ajana dağıldı ve usage bitti** — yani "daha çok ajan" da bir politika değil.

**Şöyle yapardık:** `docs/ai/MODEL-YONLENDIRME.md` — iş sınıfı → model → çıktı biçimi → doğrulama.
Kural olarak yazılır, hafızaya değil belgeye (K3).

**Maliyeti:** ~30 dakika belge; kalıcı kazanç.

**Kazancı (ölçülmüş):** Bu turun haritası **6 ajanla, ana bağlamda tek büyük dosya okumadan**
çıktı — 4.000+ satırlık ölçüm ana bağlama 6 sıkıştırılmış rapor olarak döndü. Aynı iş tek
bağlamda yapılsaydı oturum harita adımında biterdi.

---

### T6 · Hüküm kaydı — bir hükmün kaç yerde yaşadığını kimse bilmiyor — **P1** ⏸ MAMİ SEÇER

**Şu an nasıl:** Aynı hüküm 2-5 dosyada elle yazılı. Sağlıklı olanlar birebir aynı (7 hüküm),
**kaymış olanlar** var: motion kelime bandı 3 sayı · `FACT REQUIRED` token 2 yazım
(`FACT_REQUIRED` / boşluklu) · "motion görmeden yazılmaz" 2 farklı kapsam.

**Kusuru:** K3 ihlali. En pahalı vakası ölçüldü: Mami "İngilizcem C1" diye düzeltti; düzeltme
hafızaya ve **proje** buddy skill'ine yazıldı — ama runtime'da `~/.claude/skills/mamilas-buddy`
(324 satır) yükleniyor ve **o dosyada hüküm hiç yok**. Yanlış hüküm iki gün sonra aynen geri doğdu.
**Bu kusurun yapısal koşulu şu an duruyor.**

**Şöyle yapardık:** `docs/ai/HUKUMLER.md` — her hüküm bir satır: `hüküm · kanonik yer · yaşadığı
diğer yüzeyler`. Yanına bir test: her yüzeyi grep'ler, metin kaymışsa kırmızı. Sayısal hükümler
(kelime bandı gibi) **tek yerden türetilir**, ikinci nüsha yazılmaz.

**Maliyeti:** ~2 saat (kayıt + test). Sürekli bakım gerektirir.

**Kazancı (ölçülmüş):** motion kelime bandının hangi sayısının doğru olduğu **bugün belirsiz** —
ajan yasadan 190-215 okur, lint 160-250 kabul eder, yasanın kendi template'i 210-260 der.
Bu tek hüküm üç ayrı davranış üretiyor.

**Neden beklemede:** Kanonik sayıyı seçmek Mami'nin kararı — bu bir yazı-tura değil, ölçülmüş
tercih. Kayıt yapısı hazır kurulabilir, ama sayıyı ben seçemem.

---

### T7 · Ajan brief'i bir yetenek olsun — **P1** ⏸ MAMİ SEÇER

**Şu an nasıl:** Ajan brief'leri hiçbir yerde yaşamıyor. Bu turda iki kez ~200 satır elle yazıldı,
çalıştı, buharlaştı. `.claude/agents/` dizini **var** ve `mamilas-qa-jury.md` orada duruyor —
yani mekanizma mevcut, kullanılmıyor.

**Kusuru:** K4 ihlali. Her seferinde sıfırdan yazılan brief her seferinde farklı çıkıyor —
ölçüldü: **altı ajan aynı işi altı üslupla yazdı.** Biçim şart koşuldu, üslup koşulmadı.

**Şöyle yapardık:** Tekrar eden 4 rol `.claude/agents/` altına kalıcı ajan tanımı olur:
`sekans-denetim` (kare gör → revize + motion, tek geçiş) · `blok-prompt` (bir sekansın
promptlarını yasa+kilit ile yaz) · `katman-haritasi` (ölçüm, yorumsuz, dosya:satır) ·
`ikinci-goz` (adversarial doğrulama). Her tanımda **çıktı biçimi şart koşulur** — bu turda
ölçülen kural: biçim şart koşulmayan ajanın işi ana bağlama geri döner ve iki kez ödenir.

**Maliyeti:** ~1.5 saat, 4 dosya.

**Kazancı (ölçülmüş):** Bu turun 6 ajanı biçim şartlı çalıştı ve çıktıları doğrudan belgeye
girdi — hiçbiri yeniden yazılmadı. Şartsız çalışan önceki turda usage bitti.

**Neden beklemede:** Ajan üslubu Mami'nin zevkine bağlı; `sekans-denetim`'in kıstas sırasını
(`director:158` VO-uyumuyla mı, `denetim:38` FİKİR ile mi başlıyor) ben seçemem — ikisi bugün
çelişiyor ve seçim kalite kararıdır.

---

### T8 · Yasa ↔ lint sözleşmesi makine-okur olsun — **P1** ⏸ MAMİ SEÇER

**Şu an nasıl:** 917 satırlık yasa, 40 lint kuralı, aralarında **yazılı hiçbir bağ yok.**
Hangi kuralın hangi §'i ölçtüğü kimsenin kafasında.

**Kusuru:** İki yönlü kayma ölçüldü. (i) Lint'in `no on-screen text` kaçış cümlesi **yasada hiç
yazılı değil** → 53 karelik sette 48 kırmızının 37'si sahteydi. (ii) Yasanın §2ø'sü lint'in
ölçemeyeceği şey ve lint yeşilken ölü kare üretildi. K6'nın tam merkezi.

**Şöyle yapardık:** Her lint kuralı hangi §'i ölçtüğünü **beyan eder** (kural nesnesine bir alan).
Yasa tarafında her § "ölçülüyor / ölçülmüyor / insan hükmü" etiketi taşır. Bir test eşlemenin
tam olduğunu kanıtlar. `KAPSAM` satırı bu eşlemeden **üretilir**, elle yazılmaz — böylece "yeşil
neyi kapsamıyor" her koşuda doğru olur.

**Maliyeti:** ~3 saat (40 kural etiketlenir, yasa 27 bölüm etiketlenir, 1 test).

**Kazancı (ölçülmüş):** 37 sahte kırmızı bir sette. `lint-rol-koru` hafıza kaydı zaten "50 karede
19 yanlış alarm" diyor — aynı sınıf, ikinci ölçüm.

**Neden beklemede:** Yasa metnine etiket eklemek yasayı değiştirmektir; icra protokolü md.4 bunu
Mami'ye bırakıyor.

---

### T9 · Skill gölgelemesi — **P1** ⏸ MAMİ SEÇER

**Şu an nasıl:** 3 skill iki yüzeyde birden yaşıyor ve **kullanıcı seviyesi kazanıyor**:
buddy (proje 178 / global 324, diff **504 satır**) · gate (16/53) · audit (20/17).
`docsContract.test.ts:309` ikiz kuralı yalnız `.claude` ↔ `.agents` bakıyor, `~/.claude`'u
**hiç görmüyor**.

**Kusuru:** Zıt hüküm ölçüldü: proje `mamilas-gate:3` "kapıyı çalıştırmak için kullan" ↔ global
`mamilas-gate:3` "**Do NOT** use it merely to run the four commands". İkisi de yürürlükte sayılıyor,
yalnız biri yükleniyor. T6'nın C1 vakası da buradan çıktı.

**Şöyle yapardık:** İki seçenek — (a) proje sürümleri kanon, global'ler işaretçiye indirgenir;
(b) global'ler kanon, proje nüshaları silinir. Hangisi olursa `claude-sync --check` üçüncü
yüzeyi de görmeli ve aynı adı iki yerde görünce **kırmızı vermeli**.

**Maliyeti:** karar 5 dakika, uygulama ~1 saat.

**Neden beklemede:** Nüsha silmek geri alınamaz (icra protokolü md.4). Ayrıca 324 satırlık global
buddy'nin proje sürümünde olmayan içeriği var — hangisinin kalacağı Mami'nin kararı.

---

### T10 · Ölü ve tek-kullanımlık script'ler — **P2** ⏸ MAMİ SEÇER (silme kararı)

24 script'in **10'u hiçbir yerden çağrılmıyor**, 14'ünün testi yok. Üç sınıf:

**(a) Ölü değil, bağlanmamış — bağlanmalı:**
`birlestir.mjs` (147 satır) blok dosyalarını birleşik teslime çeviriyor — **T1'in tam çözümü,
hiç çağrılmıyor.** Bu yüzden Hücre/Bitkilerde/Destek'te `_PROMPTLAR.txt` ve `_EDIT-PLAN.txt`
hiç üretilmedi, dolayısıyla `KABA-KURGU.xml` de üretilemedi — **kitin beşinci parçası üç derste
kayıp.** `motion-qc.mjs` ve `vo-nefes-kirp.mjs` de aynı sınıf.

**(b) Kalıcılaşmış tek kullanımlık kopya:**
`ureme-birlestir.mjs:7` ve `ureme-motion-birlestir.mjs:12` — proje yolu **koda gömülü**,
`birlestir.mjs`'in tek projeye pişmiş nüshaları. K3 ihlali.

**(c) Gerçekten ölü:** `t4-recipe-shots` · `t5-scenes-shots` · `t6-shots` (site Playwright
kanıtları, site bu turun konusu değil) · `check-assets3d`.

**Neden beklemede:** Silme geri alınamaz. (a) sınıfını bağlamak ayrı bir iş parçası,
(b) ve (c) Mami'nin kararı.

---

### T11 · `Stop` hook'u kayıtlı değil — **P2** ⏸ ölçüm kaybı

`buddy.mjs:193-197` `Stop` eventini işliyor, `.claude/settings.json`'da kayıt **yok** →
bütün buddy state dosyalarında `"turns":0`. Canlı kanıt: `batches:423, offers:8, turns:0`.
Yük yönetiminin tur sayacı hiç dolmuyor; nefes kapısı yalnız batch sayısına bakıyor.
Kaydı eklemek ucuz ama **davranış değiştirir** (kapı daha sık ateşler) — Mami'nin kararı.

---

### T12 · Meta-duvarın kör noktası — **P2** ✅ UYGULANDI (`962074a`)

`docsContract.test.ts:254` regexi yalnız `.claude/hooks/*.sh` eşliyordu. `buddy.mjs` ve
`oturum-durumu.mjs` — yani **modele ulaşan iki hook'un ikisi de** — meta-duvarda hiç
doğrulanmıyordu; silinseler testler yeşil kalırdı. Tarama artık `.mjs` ve exec-form `args`
dizisini de görüyor (`:259`).

**Terra 5.6 ikinci gözde iki artçı risk buldu, ikisi de haklı ve ikisi de kapatıldı:**
(i) eşik 4'e çıkarılmıştı ama gerçek kayıt 5 — bir hook sessizce silinse test yeşil kalırdı;
(ii) `.mjs` kolu yalnız dosyanın VAR olduğunu ölçüyordu, **çalıştığını değil** — bozuk bir
`.mjs` SessionStart'ı öldürür ve duvar bunu görmezdi.

---

## 2. UYGULANMAYAN AMA KAYDA GEÇEN

- **İş listesi md.15 ve md.16 artık geçersiz.** `claude-sync --dry-run` → 57 dosya eşit, **0 çatışma**.
  `current-work.mjs --check` → exit **0**. İş listesindeki iddialar bugün doğru değil; liste
  güncellenmeli (bu bir belge işi, Mami'nin onayına gerek yok — T13 olarak yapılacak).
- **md.9 kısmen geçersiz:** `mamilas-world` ve `mamilas-checkpoint` yok değil, `~/.claude/skills/`
  altında **kurulu**. Sorun ölü atıf değil, **yanlış yüzeye atıf** — T9'un alt kümesi.
- **`ONAY-BEKLEYEN.md:3` yalan söylüyor:** "APPROVED.md bugün 0 ders taşıyor", gerçek 7.
- **Öksüz hafıza kaydı 2 adet:** `mamilas-motor-gercekleri.md`, `mamilas-seslendirme-tek-blok.md`
  — dosya var, `MEMORY.md`'de satırı yok, yani hiçbir oturumda görünmüyor.
- **Ölü rapor:** `artifacts/brain-audit-2026-07-25/` (215 satır) ve `artifacts/duration-bug/`
  (34 satır) — repo içinden sıfır referans.

---

## 3. SIRA

**Bu turda uygulandı (geri alınabilir, beklemedi):** T1 · T2 · T3 · T4 · T5.
**Mami seçer:** T6 (kanonik kelime bandı) · T7 (ajan üslubu) · T8 (yasaya etiket) ·
T9 (hangi skill yüzeyi kanon) · T10 (silme) · T11 (Stop kaydı).

Sıralama gerekçesi: uygulananların hepsi **sessiz yalan** üreten kusurlardı — sistem yanlış cevap
veriyor ve bunu söylemiyordu. Bekletilenlerin hepsi **kalite tercihi** içeriyor; onları ben
seçersem Mami'nin zevkini tahmin etmiş olurum, ölçmüş olmam.
