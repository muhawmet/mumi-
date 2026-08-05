# PROMPT SİSTEMİ ARINDIRMA — etki haritası ve plan (2026-08-05)

> **Amaç:** Claude en iyi mümkün NB2 start-frame'i ve gerçek kare görüldükten sonra en iyi
> mümkün Kling motion'ını **kendisi** yazsın. Sistem yalnız gerçek kilitleri korusun.
>
> Bu dosya bir rapor değil, bir **söküm planıdır**. Tek ölçü: *Claude'un özgürlüğünü hangi
> somut enjeksiyondan kurtardım?*

---

## 1 · KÖK NEDEN — tek cümle

**Her enjeksiyon tek tek gerçek bir ölçümle haklıydı; toplamı bir kafes oldu.**

Bu, `CLAUDE.md` §0'ın kendi yasasıdır — *"her ölçüm bir yasak bıraktı, toplamı çit oldu"* —
ama o yasa **kareye** uygulanmıştı, **sisteme** hiç uygulanmadı. İki drift anı adlandırılabilir:

| # | commit | ne çözdü (gerçek) | ne yarattı |
|---|---|---|---|
| 1 | `3640aa1` (07-29) | Aynı dünyada **dört lehçe**: Kütle'nin ilk 8 karesi STYLE 81-91 kelime, kalan 27'si 23-30; `overscale` 8/8 → 0/27. *"Prompt kalitesi 'o bloğu kim yazdı'ya bağlıydı."* | Ölçen **prompt metni ÜRETMEYE** başladı: `dunya-kilidi.mjs` yapıştırmaya hazır üç satır basıyor, yasa da *"elle yazma"* diyor (`PROMPT-YASASI.md:693`). |
| 2 | `ec80a52` (08-04) | Mami: *"60 start frame veriyorsan 41 revize veriyorsun."* O 41'in çoğu basılmadan önce metinde görülebilirdi. | Linter **yapıdan ANLAMA** geçti ve oradan **YAZARLIĞA** kaydı: artık kırmızı satırın yanında yazılacak İngilizce cümleyi veriyor. |

Yani sökülecek olan **niyet değil, mekanizma**: ölçümlerin koruduğu şey kalacak, o şeyi
**Claude'un yerine yazan** kısım gidecek.

---

## 2 · KARAR EDEN KANIT — altın standart kendi linter'ından geçmiyor

`5. Sınıf - Hücre ve Organelleri` (Mami: *"son mitokondrili olan şaheser"*, kalite tavanı)
bugünkü `prompt-lint.mjs` ile ölçüldü:

```
A-K01-K15   ⚠️ kırmızı 3/15      C-K31-K44   ⚠️ kırmızı 1/14
B-K16-K30   ✅ kırmızı 0/15      D-K45-K53   ⚠️ kırmızı 1/9
                                  TOPLAM: 5 KIRMIZI
```

Ateşleyen kural **`isik-yuzu-disliyor`** (`prompt-lint.mjs:510-645`) — ve tam da bu kural,
kırmızının yanına **yazılacak cümleyi** koyuyor:

> `YAZMA: "the light reaches nothing of her face" · YAZ: "the terminator falls as one soft
> curved line down her cheek so the near side sits well under, carried only by warm bounce
> off the sunlit wall and never lifted by any fill"`

**Hüküm:** ölçen artık kaliteyi ölçmüyor, **kendi kurallarını** ölçüyor. Bir ölçüm aracının
şaheseri reddetmesi, aracın kalibrasyonunun bozulduğunun tanımıdır.

---

## 3 · ÖLÇÜLEN ETKİ — sayılar

### 3.1 Motora giden metnin %60'ı kalıp

Aktif proje (Denetleyici, 56 blok), motora giden karakterler:

| alan | benzersiz sürüm | toplam karakter | pay |
|---|---|---|---|
| GÖVDE (sahne — Claude'un yazdığı) | 46 | 146.890 | **%40** |
| STYLE | 54 | 49.684 | %13 |
| **LIGHT AND PALETTE** | **1** | 52.080 | %14 |
| NEGATIVE | 44 | 123.092 | %33 |

**`LIGHT AND PALETTE` 56 blokta TEK sürüm** — 52 KB birebir tekrar. Kuyruk toplamı
**224.856 karakter = %60**.

Asıl kıyas, iyi öncüllerle yan yana konunca çıkıyor:

| | Denetleyici (aktif) | **Hücre (şaheser)** | Eşeyli |
|---|---|---|---|
| benzersiz STYLE | 54/56 ama **709 karakterlik omurga ortak** | **53/53 tamamen özgün** | 49/50 |
| benzersiz LIGHT AND PALETTE | **1/56** | **53/53** | 45/50 |
| benzersiz NEGATIVE | 44/56 | **53/53** | 50/50 |
| referans bloklarında birebir yapıştırma payı | **%55-63** | — | — |
| motion dosyasında sabit pay | — | **%5.4** | %6.8 |

Hücre'de bütün negatiflerin **en uzun ortak son eki 1 karakter** (nokta). Yani şaheser
kuyruğu yapıştırmadı — **her kareye kendi üç satırını yazdı.**

### 3.1b Tek kaynak iddiası diskte ZATEN kırık

`_DUNYA-KUYRUGU.txt:8` → `shadows read as deep cool indigo`
56 karenin 56'sı → `shadows read as an open luminous blue-indigo that stays airy…`

Kareler `dd83a98` ile yeniden ışıklandırıldı, kaynak dosya güncellenmedi ve **hiçbir şey bunu
fark etmedi**. "Tek kaynak" bir iddiaydı, ölçen yoktu.

### 3.1c İki canlı artefact birbirinin tersini emrediyor

- `_DUNYA-KUYRUGU.txt:2` → *"🔴 **BU ÜÇ SATIR HER KAREYE BİREBİR YAPIŞTIRILIR.**"*
- `prompt-lint.mjs:679-685` (`style-tekrar`, KIRMIZI) → *"**`dunya-kilidi.mjs` çıktısını olduğu
  gibi yapıştırma. O kuyruk bir BAŞLANGIÇTIR**"*

Aynı repoda, aynı hafta. Ajan hangisine uyarsa öbüründen kırmızı alıyor.

### 3.2 Linter 12 estetik KIRMIZI taşıyor

`prompt-lint.mjs`'in üretim engelleyen kırmızılarından **12'si** ölçülmüş bir motor hatasına
değil, kelime/tekrar/ifade beklentisine dayanıyor: `canli` · `derinlik` · `text-tasiyici` ·
`style-tekrar` · `neg-ozel` · `clean-table` · `real-stil-sifati` · `karsi-terim` · `fstop` ·
`ten-real` · `lens` · `tekduzelik-yazi`.

Bunlardan `canli` (L119-128) ve `derinlik` (L129-134) **saf ifade dayatmasıdır**: karede
"three things are alive" ve "depth in three layers" cümle ailesi geçmiyorsa kırmızı yanar.

### 3.3 Linter 10 yerde Claude'a cümle yazdırıyor

`report()` her kırmızı için `fix` metnini basıyor (`prompt-lint.mjs:1094`, `:1244-1245`).
Hazır cümle veren yerler: `:641-644` · `:505-507` · `:466-468` · `:319` · `:293-295` ·
`:430-432` · `:398-401` · `:300` · `:201-202` · `:680-684`.

### 3.4 Prompt TÜRÜ diye bir şey neredeyse yok

- `reference-plate` **hiç tanımlı değil**.
- `ref-edit` **tek bir kontrol** alıp `return` ediyor (`:1060-1071`) — yani bir edit'e dünya
  kuyruğu, kamera satırı ya da karakter tarifi sızsa **linter görmez**.
- Linter `_REFERANSLAR.txt`'i **hiç okumuyor**; `--all` taramasında bilerek atlıyor (`:1300`).
  `@handle` kontrolü saf biçim: uydurma bir handle de geçer.
- 🔴 **Referans dosyası, kuyruk tekrarını denetleyen tek iki kurala (`style-tekrar`,
  `neg-ozel`) YAPISAL OLARAK GÖRÜNMEZ** — `blockKind !== 'frame'` olduğu için sayıma hiç
  girmiyor. Yani %55-63 birebir yapıştırma tam da ölçülmeyen yerde birikti.

### 3.4b Kuyruk yapıştırmanın gerçek bedeli: prompt kendi kendisiyle çelişiyor

Aktif referans setinden, tek prompt içinde:

- **@maket** — gövde: *"the letters are cut INTO the brass with darkened recesses, **never
  raised** on top of it"* · yapıştırılan kuyruk: *"Turkish label only — blocky dimensional
  letterform, **raised** and legible"*. Motora aynı anda iki zıt emir gidiyor.
- **@kedi** — gövde: *"no rim"* · kuyruk: *"Silhouette reads entirely through lighting
  **rim** and value separation"*.
- **@maket / @mutfak** — kuyruk *"warm-honey SSS dominant on **skin**"* ve *"**fabric** in
  warm-saturated primaries"* diyor; birinde ten yok (plastik büst), öbüründe kumaş yok
  (boş mutfak). Gövde ayrıca *"never fleshy"* diyor.

Bunlar üslup tartışması değil: **tek prompt içinde çelişki**, ve motor çelişkiyi her zaman
kendi kütüphanesinden çözüyor.

### 3.5 Yasa kendi kuyruğunu zaten mahkûm etmiş

`PROMPT-YASASI.md:863` — *"**ÖLÇÜLDÜ — 7 SABİT KUYRUK FİLMİ DURDURUYOR.** MAMİ KARARI
BEKLİYOR, kural HENÜZ değişmedi."* Ayrıca AGY ölçtü: kuyruk 52/52 yazılıyken **ağız 2/3
klipte oynadı** — kuyruk *gerekli ama yetmiyor*; işi çözen şey Claude'un yazdığı fiil oldu.

### 3.6 Duran bağlam ~33 KB ve içinde 8 çelişki var

`CLAUDE.md` (15 KB) + `faz-icraat.md` (8 KB) + skill index (5.6 KB) + üç SessionStart hook
(4.4 KB, `hasat-gate` tek başına 2.9 KB ve **borç büyüdükçe büyüyor**).
Ölçülen çelişkiler: altın standart (director hâlâ "Eşeyli" diyor) · `mamilas-plan` emekli ama
`mamilas-pipeline` açıklaması hâlâ ona yönlendiriyor · Sol effort düzyazıda `xhigh`, kopyalanacak
komutta `terra`+`high` · `memory/` dizini yok ama hook her oturum ona yazdırıyor · lifecycle
"beş yerde aynı" deniyor, director'da hiç yok · kapı üç komut deniyor, gerçekte yedi.

### 3.7 Performans — hook'lar suçsuz

Ölçüldü: commit dışı Bash'te kapı **18 ms**'de çıkıyor; üç SessionStart hook toplam ~200 ms.
Gerçek maliyet **commit kapısında 16.4 s** (tsc 2.6 · **vitest 13.2** · build 0.55) ve
vitest'in %52'si İCRAAT'ta **donmuş olan** iki dosya: `commandRuntime.test.ts` 11.9 s +
`batchResilience.test.ts` 7.3 s. *(Tam değerlendirme ve tek öneri T8'de.)*

---

## 4 · KORU / DARALT / SÖK

### KORU — dokunulmaz

| Ne | Nerede | Neden |
|---|---|---|
| Çocuk güvenliği · siluet okuması | `PROMPT-YASASI §1 −1` ve `5øø`; `prompt-lint siluet-alt-govde` | müşteri revizesi ×2, gerçek zarar |
| Kaynağın tonu — çatışma icat edilmez | `§1 5ø` | müşteri revizesi, ölçüldü |
| VO doğruluğu ve yükümlülük | `§1a`, `YÜKÜM` | pedagojik hata sıfır tolerans |
| TAŞIR / TAŞIMAZ ref sözleşmesi | `§4a.1` | ayak kadrajda 7/7 kötü kare, 0/4 iyi |
| Referans envanteri ilk iştir | `§4a` | — |
| Gerçek kare görülmeden motion yazma | `§3` `:817` | mutlak |
| Kling üç imkânsızı: yazmaz · konuşmaz · yazıya yaklaşmaz | `§3ø` | KİTAP 3.6s / GİDA 1.0s ölçüldü |
| Motion'da yazı dondurma | `§3ø` `:1033` | morph'un birinci sınıfı |
| Ölçülmüş motor kırılmaları | `§2b`, `govde-isik-celiskisi`, `adsiz-nesne`, `islak-goz`, `hece-sayi` | her biri basılmış kareyle kanıtlı |
| Mami'nin üç yaratıcı hükmü | `DORTLU-MASA §1` | — |
| AGY yalnız gerçek medya tarif eder · Sol yalnız dar kapılarda | `DORTLU-MASA §3` | — |
| canary → gerçek kare → gerçek klip → Mami | `DORTLU-MASA`, `current-work` | bu sabah kodla zorlandı |

### DARALT — kalır ama üretimi engellemez

| Ne | Bugün | Olacak |
|---|---|---|
| STYLE kelime tavanı | SARI (zaten) | SARI kalır, **gözlem** |
| `style-tekrar` · `neg-ozel` · `kare-ozel` | **KIRMIZI/SARI** | **SARI gözlem** — dünya kimliği sürüklenmesi bilgi, ihlal değil |
| `text-tasiyici` (yazı çözümü tekrarı) | KIRMIZI | SARI |
| `ten` · `temas` · `text-hece` | KIRMIZI (kelime VARLIĞI) | KIRMIZI kalır ama **çelişki** testine çevrilir, kelime aramaya değil |
| Sabit sessizlik kuyruğu (motion) | KIRMIZI, birebir | KIRMIZI kalır (ölçüldü 50/50 + 57/57) — ama *"gerekli ama yetmez"* notu yasaya girer |

### SÖK — bugün gidiyor

| Ne | Nerede | Neden |
|---|---|---|
| Kırmızının yanında **yazılacak İngilizce cümle** vermek | `prompt-lint` 10 yer | ölçen yazar değildir |
| `canli` · `derinlik` KIRMIZI | `:119-134` | saf ifade dayatması |
| `clean-table` · `real-stil-sifati` · `karsi-terim` · `fstop` · `ten-real` · `lens` KIRMIZI | — | kanıtsız kelime beklentisi |
| `tekduzelik-yazi` KIRMIZI | `:287-296` | kendi yorumu: *"hiçbiri hatalı değildi, hepsi AYNIYDI"* |
| **Dünya kuyruğunun otomatik yapıştırılması** | `dunya-kilidi.mjs`, `§2:437-442`, `§4:1090` | %60 kalıp; `LIGHT AND PALETTE` 56/56 tek sürüm |
| Referans-edit'e dünya kuyruğu / kamera / karakter tarifi / hazır negatif | `§4`, aktif ref dosyası | edit **delta-only** olmalı |
| Şablonun içindeki hazır İngilizce cümleler | `§2:430-437` | Claude'un cümlesi olmalı |
| Çelişkili ve bayat duran bağlam | `§3.6`'daki 8 madde | iki gerçek üretiyor |

---

## 5 · TASK'LAR — sekiz, atomik

| # | task | bitiş kanıtı |
|---|---|---|
| **T1** | Prompt türü sözleşmesi: `scene-start-frame` · `reference-plate` · `reference-edit` ayrı türler; her tür kendi kuralına tabi | linter üç türü de tanıyor; plaka sahne slotlarına tabi değil |
| **T2** | Dünya DNA'sı **yaratıcı kaynağa** çevrilir; `dunya-kilidi` yapıştırılacak metin değil **okunacak kart** basar | çıktı "kopyala-yapıştır" değil; kimlik sürüklenmesi SARI ölçülür |
| **T3** | Linter denetçiye iner: cümle vermez, estetik kırmızıları SARI'ya düşer, tür-farkındalı olur | altın standart (Hücre) **kırmızı 0** verir |
| **T4** | Giriş bağlamı kısaltılır, 8 çelişki kapatılır, bayat atıflar arşivlenir | duran bağlam küçülür, çelişki 0 |
| **T5** | Aktif Denetleyici referans seti yeni sözleşmeye göre temizlenir — **yalnız hatalılar** | edit'ler delta-only; plakalar DNA taşır |
| **T6** | Kırmızı fixture'lar: edit'e tail sızması · ref dosyası hiç okunmaması · sahte PASS · motion'da yazı | dördü de kırmızı yanar, sonra yeşile döner |
| **T7** | Gerçek canary üretim yüzeyi: Mami'ye **basılacak küçük set** | görsel hüküm uydurulmadan teslim |
| **T8** | Performans receipt'i + Mami'ye **tek** ayar önerisi | ölçülmüş sayılarla |

### Bu turda YAPILMAYACAKLAR

Yeni dev negatif listesi · yeni kelime yasağı · yeni genel STYLE paragrafı · test yeşilini
kalite ilan etmek · Mami adına canary/final hükmü · plan dışı site/refactor · eski projeleri
toplu mutasyona uğratmak · yapılmamış işi `current-work`'e tamamlandı yazmak.

### Bilinen risk — dürüstçe

`prompt-lint.test.mjs:127-195` (test A5) *"kalite yönü"* iddiasını **`style-tekrar` ve
`neg-ozel`** üzerinden kuruyor (`Üreme < Kültürler ≤ Birlikte`). Bu iki kural SARI'ya inince
A5 düşer. A5 **silinmeyecek**; ölçtüğü şey dürüst bir isimle yeniden yazılacak: bu bir
*kalite* sıralaması değil, bir **kalıp yoğunluğu** sıralamasıdır.

`3640aa1`'in çözdüğü gerçek sorun (aynı dünyada dört lehçe) **geri gelebilir**. Karşılığı
yasak değil ölçüm: dünya kimliği sürüklenmesi SARI olarak raporlanır, kararı Claude verir.

⚠ **`style-tekrar` saf estetik DEĞİL** — arkasında gerçek bir korelasyon var: STYLE'ı tek
sürümde donduran üç iş (Birlikte 54/54 → 30 revize · Farklı Kültürler 53/53 · Sürtünme
31/31) ile karesi kendi STYLE'ını yazan altın standart (Üreme 49 sürüm/50 kare → ten/ışık
sınıfında **sıfır** revize) arasındaki tek yapısal fark bu. Ama kural bir **vekil**: asıl
istenen şey "kuyruk yapıştırma"ydı. Kuyruk yapıştırma T2'de zaten kalkıyor, dolayısıyla
kural SARI gözleme iner — yasak olarak değil, **ölçüm olarak** kalır.

### Aktif üretim çatışması

Öbür sohbet şu an aynı projede Sekans 3'ü denetliyor (9 kare açıldı, 6 yeniden basım).
**T5 yalnız referans setine dokunur**, `PROMPTLAR/` · `REVIZE/` · `MOTION/` · `images/` ve
`current-work.json` bu turda ELLENMEZ.
