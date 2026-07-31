# MAMILAS — SİSTEM DENETİMİ, 2026-07-31

20 kollu denetim. AGY (`gemini-3.1-pro-high` / `3.6-flash-high`) buldu, Claude grep ile
doğruladı. **AGY'ye kör güvenilmedi:** 5 iddiadan 1'i abartı, 2 satır numarası yanlış,
bir bölüm kaynaksız çıktı — hepsi işaretli.

Ham raporlar bu klasörde. **Sıfırdan araştırma yapılmayacak, önce buraya bakılacak.**

---

# A — ÜRETİM: MOTORLARIN GERÇEĞİ

## A1. Kling 3.0 — resmi kılavuz bizi çürütüyor
> *"Yüklediğin görsel kimlik, ışık, arka plan ve kompozisyon için tek doğruluk kaynağıdır.
> **Görselde zaten görünen şeyleri yeniden tarif etme** — model o öğeleri yeniden üretir,
> kimlik kayması ve bozulma doğar. Prompt yalnızca **aksiyon ve kameraya** odaklanmalıdır."*
> **Uzunluk: 60 kelime altı, tercihen 25-45.**

Biz 210-260 yazıyorduk. Altın standardımız (Eşeyli) 202. Topluluk bulgusu: 70 kelimeyi
geçince dikkat dağılıyor ve **arka plan figürleri donuyor**; uzun kısıtlama cümleleri hareket
vektörlerini çakıştırıp **kilitlenme ve ani sıçrama** üretiyor.
`[kaynak: agy-9-kling-arastirmasi.txt — resmi alıntı DOKÜMANTE, mekanizma TOPLULUK]`

## A2. 34 klip izlendi — kusurun gerçek sebebi
| ölçüm | sonuç |
|---|---|
| "donuk iskelet üzerinde eriyen yüz ve eller" | **26/34 klip (%76)** |
| başlangıç karesi temiz miydi | **%90'dan fazlası temiz** — hasar karede değil, istekte |
| kusurun zamandaki yeri | %31,5 ilk saniye · **%53,9 orta (1-4s)** · %14,6 son |
| yapay uzatma (donmuş kare dolgusu / kare tekrarı) | **12/34 klip (%35)** |
| temiz çıkan klip | **3/34** |

Kanıt: Klip 6 yüz `0.0s` pürüzsüz → `1.25s` burun ve çene yok. Klip 5 parmaklar `0.0s`
kusursuz → `1.46s` altı kemiksiz yapı. Klip 20'nin ilk 3,5 saniyesi donmuş ilk kare.
**Temiz çıkan 3 klibin ortak yanı:** karmaşık uzuv hareketi yok · mikro jest (yaprak, ışık,
nefes) · kamera sabit ya da çok düşük genlikli.
`[agy-20-en-kotu-proje-klipleri.txt]`

## A3. İyi/kötü klip karşılaştırması — 7+7 klip, yedi ölçülü fark
| | iyi küme | kötü küme |
|---|---|---|
| eklem sıçraması | **0** | 5 klipte, `1.6s`-`3.5s` arasında |
| tam donma (klip fotoğrafa dönüyor) | yok | Klip 11 `2.2s`→son, Klip 21 `2.3s`→son |
| yüz erimesi | yok | Klip 5 `2.8s`, 14 `1.8s`, 19 `4.8s` |
| içinden geçme (el/bacak masadan, tırabzandan) | yok | Klip 11, 14, 21 |
| **yazı bozulması** | `REJENERASYON` ve `HİDRA` formunu koruyor | `KİTAP` kutu çökerken eriyor, `GİDA` titriyor |
| donmuş uzuv | yok | çorabı tutan el, sudaki kasa, kapıdaki adam |

🔴 **Kötü Klip 1 = bizim K01.** Prompt'ta elleri bilerek dondurmuştuk; ölçüm *"çorabı tutan
elle ayak donuk kalır"* dedi. **Kilit klibin ilacı değil, hastalığı.**
`[agy-18-klip-karsilastirma.txt]`

## A4. Kling'in yapamadıkları (yasaya girdi · §3ø)
- **Kimse okunabilir yazı yazmaz.** Yazma sahnesi geniş çekilir, yazı Premiere'de maskelenir.
- **Kimse konuşmaz.** Çene açılınca yüz morph ediyor.
- **Kamera yazıya yaklaşmaz** — ve **yazıyı taşıyan nesne de kıpırdamaz.** Taşıyıcı oynadığı
  an harf eriyor. Devrilmez, çökmez, açılmaz, elden ele geçmez.
- **Nesne el değiştirmesi tek klipte olmaz** — başlangıç+bitiş karesi kullanılır.
- **Klip VO'dan kısaysa yavaşlatılmaz, uzun üretilir.** Germe gözle görülüyor (%35).

## A5. Motor seçimi
Kalabalık fiziksel aksiyonda **Veo 3.1 ve Hailuo (MiniMax 2.0), Kling 3.0'ı geçiyor**;
Kling'in üstünlüğü yüz ifadesi ve animasyon stilini koruma, zayıflığı el değiştirme.
Repo 8 motorun lehçesini zaten tutuyor (`src/core/engine.ts`) — geçiş tek satırlık iş.
`[SINANMADI — kanıt bir düello klibi gerektirir]`

---

# B — ÜRETİM: MAMİ NEYİ REDDEDİYOR

139 revize kaydı tarandı. **Hiçbir red sebebi sinematografi ya da hikâye değil.**

| sıra | sebep | adet | makinece kesilebilir mi |
|---|---|---|---|
| 1 | **VO'nun fiilini yapan gövde karede yok** | 53 | evet (kısmen) |
| 2 | İngilizce tabela | 42 | evet |
| 3 | bozuk harf / uydurma yazı | 38 | evet |
| 4 | çiçeğe dönüşen kavram ışığı (`bloom`/`saffron`) | 37 | evet |
| 5 | cast ırk/yaş ihlali | 28 | evet |
| 6 | Anadolu dışı mimari (Paris/İtalya) | 22 | evet |
| 7 | geometri kaynaşması / uçan uzuv | 18 | hayır |
| 8 | kostüm tutarsızlığı | 10 | kısmen |

**İnandırıcılık kusuru tek başına 45 madde (%32):** kare teknik olarak sağlam ama durum
yalan. *"Hasara bakıyordu"* → ikisi birbirine bakıp gülümsüyor. *"Belediye temizliyordu"*
→ tek adam duruyor. Bu zevk değil, **kontrol edilebilir bir değişmez.**

## B1. Kalite sıralaması — yanlış altın standardı kopyalıyorduk
| proje | kare | red | oran |
|---|---|---|---|
| **Sabit Sürat ve Hız** | 44 | 8 | **%18** ← hiç incelenmedi |
| Kütle ve Ağırlık | 35 | 10 | %29 |
| Kuvvetlerin Güç Birliği | 52 | 27 | %52 |
| **Eşeyli ve Eşeysiz Üreme** | 50 | 29 | **%58** |
| Birlikte Daha Güçlüyüz | 54 | 36 | %67 |
| Bizi Bir Arada Tutan Değerler | 34 | 25 | **%74** |

Eşeyli'nin **motion**'ı altın, **kareleri** ortalamanın altında. İkisi ayrılmalı.
13 projenin yalnız 6'sında revize kaydı var — kalanların karnesi **ölçülemiyor.**

## B2. İyi kare ile kötü karenin ölçülen farkı
| | iyi (Eşeyli) | kötü (üç proje) |
|---|---|---|
| kare başına insan | **1-2 odaklı figür** | kalabalık, 4 gövdesiz kol |
| özne | isimli/kilitli (`@efe`, `@kedi`) | soyut parıltı → çiçek |
| sahne | somut fiziksel eylem | sahte müsamere pozu |
| yazı | nesne yüzeyine kazınmış | arka planda uydurma tabela |
| kamera | mikro push | **yana kayma — 5 klibin 5'inde arka planda yapay figür doğdu** |

---

# C — SİSTEM: NEDEN ÖĞRENMİYORUZ

## C1. Dokuz hafıza sistemi, ortalama ömür bir haftanın altı
`HANDOFF_*.md` 8g · `CODEX_LOG.md` 2g · `EXECUTION_STATE.md` 14g · `agents/lessons/` 13g ·
`memory-sync` 5g · `claude-sync` **<1g** · `.claude/rules/` 14g · `oturum-durumu` 1g ·
`current-work.json` 2g (aktif, **şu an yalan söylüyor**).

**14 dosya sırayla "tek doğruluk kaynağı benim" dedi.**

**Ölüm deseni her seferinde aynı:** kurulur → diskle kopar → yalan söyler → arşive atılır →
yenisi kurulur. **Ortak payda: hepsi elle güncelleniyordu.** Hayatta kalanlar ise diskten
türetilen ya da bloke edenler oldu.

## C2. Emek oranı
Hafıza/durum/sync/ders sistemleri: **256.046 satır churn, 84 commit.**
Gerçek video ve prompt üretimi: **168.892 satır, 74 commit.**
→ **Hafıza sistemlerine, video üretmekten 1,5 kat fazla emek gitti.**

## C3. Saatler nereye gidiyor
- 30 günde 76 oturum, asistan aktif çalışma **~135 saat**
- **3.318 yazma eyleminin 2.154'ü (%65)** aynı oturumda yeniden yazım
- Yeniden yapım, aktif sürenin **~%31'i**
- **Mami'nin 1.243 mesajının %44,7'si red ya da düzeltme**
- En çok yeniden yazılan üçüncü dosya: **`MEMORY.md` — 45 oturumda 87 kez**

## C4. Bilgi en güvenilmez katmanda
| yöntem | okunma anı | güven |
|---|---|---|
| bloklayan hook / lint | araç çağrısından önce zorunlu | ~%100 |
| `CLAUDE.md` + `.claude/rules/` | oturum başında otomatik | ~%90 |
| `MEMORY.md` (ilk ~200 satır) | oturum başında otomatik | ~%75 |
| MCP hafıza sunucusu | **ajan çağırmaya karar verirse** | ~%30 |
| **pasif not dosyası** | elle açılırsa | **~%5 ← 40 hafıza dosyamız + 861 satırlık yasa** |

Hazır MCP hafıza eklentileri **%30** — sebebi teknik değil davranışsal: ajan "önce hafızama
bakayım" demiyor, doğrudan dosya düzenlemeye atlıyor.

## C5. Ders bankası
1.858 satır aday hasat edilmiş, **onaylı ders sıfır.** Emilen üç dersin (STYLE tavanı,
kırmızı çizgiler, Türkçe hero imlası) üçünde de bir **ölçen** vardı. Düzyazı kalan beş ders
tekrarladı — motion tempo dersi **29 Tem** yazıldı, **30 Tem** 54 klibin 54'ünde tekrar etti.

**→ Ölçülen ders emiliyor, yazılan ders buharlaşıyor.**

## C6. Kapılar dişsiz
- `hasat-gate.mjs` üç çıkışta da `exit(0)`
- `gate.sh` push edilmemiş işi ve sync hatasını **görüyor, durdurmuyor**
- **`prompt-lint.mjs` hiçbir hook'a ya da kapıya bağlı değil** — prompt'lar lint görmeden commit ediliyor
- `current-work.mjs --check` sapmayı buluyor, kapıya bağlı değil

## C7. Beyin baypas edilmiş
`src/core/` 11.853 satır, **%58'i yalnız testlerden erişiliyor.** `brain.ts`, `engine.ts`,
`lessonBank.ts` üretimde **hiç import edilmiyor**; ders parser'ının biri test edilen biri
kullanılan **iki kopyası** var.

## C8. Dünya kütüphanesi kareye ulaşmıyor
`render_law` **36 bileşen** → `dunya-kilidi.mjs` 90 kelime bütçesine **11'ini alıp 25'ini
atıyor** → ajan sahneye göre bir kez daha uyarlıyor. **Üç aşamalı sapma.**

## C9. Yasa kendiyle çelişiyor (5 çift · biri düzeltildi)
- ~~satır 619 "değişim gövdede olmaz" ↔ 628 "gövdeyi dondurmak kusurdur"~~ → **kapandı**
- `@handle` "asla tarif etme" ↔ "yaş/etnisite/kıyafet yaz"
- "boş yüzey bırakma" ↔ "okunmayacaksa boş bıraksın"
- "negatif korumaz" ↔ zorunlu global negatif kuyruğu
- motion "114 kelime" ↔ "210-260 kelime"

## C10. Küçük ama sinsi
Skill parite testi **10 skill'in 2'sini** kontrol ediyor (`mamilas-ref` çoktan sapmış) ·
**21 öksüz script** (yalnız dokümanlarda adı geçiyor) · `current-work.json` bitmiş işi aktif
sanıyor · `settings.json` üç `.sh` hook çağırıyor, birincil ortam Windows.

---

# D — CLAUDE'UN ÇALIŞMA BİÇİMİNDEKİ KUSURLAR

1. **Ölçmeden kural yazıyor.** §3a kafadan yazıldı, 54 klibi dondurdu. Altın standardı açıp
   saymak 10 dakika sürecekti.
2. **Dersi şablona çevirip 54 kareye aynısını basıyor.** `At first` 52/54 → yerine
   `The clip opens with` **54/54**. Metronomu metronomla değiştirdi.
3. **Korkusunu prompta yazıyor.** Morph korkusuyla paragrafın %35'i yasak oldu — ani
   hareketleri kilit üretti.
4. **Görmediği kareye motion yazdı** (K24'te olmayan ıslak duvardan damla).
5. **Ajan bloklarını çakıştırdı**, usage yaktı.

---

# E — TEK CÜMLE

**Bilgi eksik değil, karar anında önümüzde değil.** Düzyazıya yazılan ders buharlaşıyor;
ölçene yazılan ders tutuyor. Ve kalite kararı **sahne tasarımında** veriliyor — kelime
katmanında değil.

---

# RAPOR DİZİNİ
| dosya | ne arar |
|---|---|
| `agy-hafiza-denetimi.txt` | ilk genel hafıza denetimi |
| `agy-2-carpitma-denetimi.txt` | **1 numaralı raporu çürütme denemesi** |
| `agy-3-celiski-taramasi.txt` | yasa/skill/rules çelişkileri |
| `agy-4-tekrar-eden-hatalar.txt` | ders yazıldı → aynı hata tekrar etti tablosu |
| `agy-5-beyin-haritasi.txt` | `src/core/` canlı mı ölü mü baypas mı |
| `agy-6-arac-envanteri.txt` | script ve hook envanteri, öksüzler |
| `agy-7-teslim-korpusu.txt` | proje karneleri, red sebebi frekansı |
| `agy-8-kalici-hafiza-arastirmasi.txt` | 2026 hafıza pratikleri + başarısızlık modları |
| `agy-9-kling-arastirmasi.txt` | **Kling resmi kılavuzu + topluluk** |
| `agy-10-mami-zevki.txt` | red sebeplerinin taksonomisi, yalan dedektörü |
| `agy-11-en-iyi-proje.txt` | Sabit Sürat neden %18 |
| `agy-12-nb2-arastirmasi.txt` | NB2 yazı/karakter tutarlılığı |
| `agy-13-kontrol-sartnamesi.txt` | kontrol katmanı şartnamesi |
| `agy-14-hafiza-arkeolojisi.txt` | **9 sistem, 14 "tek doğruluk kaynağı"** |
| `agy-15-saatler-nereye.txt` | transkriptlerden zaman analizi |
| `agy-16-icra-gercekligi.txt` | ne gerçekten koşuyor |
| `agy-17-skill-denetimi.txt` | 10 skill, çakışma ve ölü akış |
| `agy-18-klip-karsilastirma.txt` | **iyi/kötü klip, 7 ölçülü fark** |
| `agy-19-kusur-sayimi.txt` | 54 klip kusur sayımı |
| `agy-20-en-kotu-proje-klipleri.txt` | **34 klip izlendi, %76 aynı kusur** |
