# MODEL YÖNLENDİRME — hangi iş hangi modele gider (2026-08-02)

> **Neden var:** kadroda 8 model var, pratikte 2'si kullanılıyordu. Her iş Claude'un ana
> bağlamından geçti. Ana bağlam en pahalı ve en kıt kaynak — 200 satırlık bir okuma orada
> yapıldığında geri alınamaz.
>
> **Ters kusur da ölçüldü:** üç ders üretilirken iş çok ajana dağıldı ve usage bitti.
> Yani "daha çok ajan" bir politika değil. Politika şudur: **işi en ucuz YETERLİ modele ver,
> çıktı biçimini ÖNCEDEN şart koş, hükmü kendine sakla.**

---

## 0. KADRO — ölçülmüş çağrı biçimleri

Hiçbiri tahmin değil; hepsi 2026-08-02'de bu makinede koşturularak doğrulandı.

| Ad (Mami'nin sayımı) | Gerçek kimlik | Çağrı | Durum |
|---|---|---|---|
| **Sol 5.6** | `gpt-5.6-sol` | `codex exec "…"` (varsayılan model) | ✅ çalışıyor |
| **Terra 5.6 High** | `gpt-5.6-terra` | `codex exec -c model=gpt-5.6-terra -c model_reasoning_effort=high "…"` | ✅ çalışıyor |
| **Gemini 3.6 Flash High** | `gemini-3.6-flash-high` | `agy --model gemini-3.6-flash-high -p "…"` | ⚠ dosya okuyamaz |
| **Gemini 3.1 Pro High** | `gemini-3.1-pro-high` | `agy --model gemini-3.1-pro-high -p "…"` | ⚠ dosya okuyamaz |
| **Opus 5** | `claude-opus-5[1m]` | ana oturum | ✅ |
| **Sonnet 5** | `claude-sonnet-5` | `Agent` aracı, `model: sonnet` | ✅ |
| **AGY** | Antigravity CLI | `agy` — yukarıdaki iki Gemini'nin taşıyıcısı | ⚠ kısmi |
| **Claude Max** | abonelik | ana oturum + ajanlar | ✅ |

**Sol/Terra bilgisi nerede yaşıyordu:** `~/.codex/config.toml:3`. Repo bu iki modeli
"BİLİNMİYOR, uydurma, Mami'ye sor" diye kaydetmişti. Bilgi repo dışındaydı ve kimse oraya
bakmamıştı — Claude'un aklının `~/.claude`'da yaşadığı bilinip `~/.codex`'in hiç açılmaması
aynı kör noktanın iki yüzü.

### AGY'nin gerçek sınırı — teşhis düzeltildi

Repo *"`agy --mode plan -p` izin kapısında duruyor, headless KIRIK"* diyordu. Ölçüm daha dar:

- `agy --mode plan -p "Say only: AGY_ALIVE"` → **`AGY_ALIVE`**. Headless çalışıyor.
- Dosya okutan bir görev → `a tool required the "read_file" permission that headless mode
  cannot prompt for, so it was auto-denied`.

Yani **AGY headless düşünebiliyor, okuyamıyor.** Açmanın iki yolu var ve ikisi de izin/güvenlik
ayarı olduğu için **Mami'nin kararı**: (a) `settings.json`'a `permissions.allow` altında
`read_file` kuralı, (b) `--dangerously-skip-permissions` (tüm araçları otomatik onaylar —
yazma dahil, o yüzden tek başına önerilmez).

Bu kapanana kadar **büyük okuma Claude ajanına gider** — ölçüldü, çalışıyor.

---

## 1. YÖNLENDİRME TABLOSU — iş sınıfı → model

| İş sınıfı | Gider | Neden | Çıktı biçimi şartı | Doğrulama |
|---|---|---|---|---|
| **Katman haritası / envanter** (200+ satır okuma, yorumsuz ölçüm) | Claude ajanı (Explore), paralel, **tavan 6** | Ana bağlamı korur; ajan dosyayı okur, ana bağlama sıkıştırılmış tablo döner | Tablo + `dosya:satır` zorunlu · "ölçülmedi" demeye izinli · satır tavanı yazılı | Ana bağlam 3-5 iddiayı grep ile doğrular |
| **İkinci göz / çürütme** (yazılmış işin denetimi) | **Terra 5.6 High** (`codex exec`) | Bağımsız model, bağımsız bağlam; kendi ilk varsayımını kanıt saymaz. Bu turda 5 gerçek kusur buldu | `YANLIŞ / DOĞRULANDI / RİSK / ÖLÇEMEDİM` başlıkları · her satır `dosya:satır` | **Her iddia grep ile doğrulanır** — Terra da yanılır |
| **Hızlı ikinci okuma** (tek dosya, dar soru) | **Sol 5.6** (`codex exec`) | Terra'dan ucuz, aynı bağımsızlık | Tek paragraf hüküm + kanıt satırı | Ana bağlam doğrular |
| **Mekanik dönüşüm** (biçim çevirme, toplu yeniden adlandırma) | Claude ajanı, `model: sonnet` | Muhakeme gerekmez, ucuz olan yeter | Değiştirilen dosya listesi + satır sayısı | `git diff --stat` |
| **Kare/klip denetimi** (görsel hüküm) | Claude ajanı, **sekans başına bir tane** | Kare görülmeden motion yazılmaz; birim kare değil SEKANS | `revize.txt` + `MOTION` biçimi önceden | Mami'nin gözü — son hüküm onun |
| **Klip izleme** (video içeriği) | **AGY** (Gemini) — açıldığında | Claude klip izleyemez, Gemini izler | **TARİF ettir, HÜKÜM sordurma** | Her iddia kareyle/grep ile doğrulanır |
| **Ölçülebilir kontrol** (sayım, biçim, eşleşme) | **Script** — hiçbir model | Bir model her koşuda farklı cevap verir; script vermez | — | Testi |
| **Mimari karar / yasa yorumu** | **Ana bağlam (Opus 5)** | Devredilemez; hüküm ipi elde kalır | — | Mami seçer |

---

## 2. DEĞİŞMEZ KURALLAR

**R1 — Ölçülebilen şey modele sorulmaz.** Sayım, biçim kontrolü, dosya varlığı, satır eşleşmesi
bir script'in işidir. Bir model bunu her koşuda biraz farklı yapar; script yapmaz.
*Kanıt: teslim sayımı, bağ denetimi ve prompt ölçümü üçü de script'e indirildi.*

**R2 — Her ajanın çıktı biçimi ÖNCEDEN şart koşulur.** Şartsız ajanın işi ana bağlama geri
döner ve **iki kez ödenir**.
*Kanıt: bu turun 6 haritacı ajanı biçim şartlı çalıştı, çıktıları doğrudan belgeye girdi,
hiçbiri yeniden yazılmadı. Şartsız çalışan önceki turda usage bitti.*

**R3 — Eşzamanlı ajan tavanı 6, birim İŞ PARÇASI.** Kare başına ajan değil, sekans/katman
başına ajan. 44 kare için 44 ajan usage yakar ve sürekliliği bozar.

**R4 — Dış modelin hiçbir iddiası doğrulanmadan kabul edilmez.** AGY TARİF eder, hüküm vermez.
Terra çürütür, hüküm vermez. Hüküm ana bağlamındır ve grep ile kanıtlanır.
*Kanıt: Terra bu turda 7 iddia getirdi, 5'i doğru çıktı, 2'si biçim tercihiydi.*

**R5 — Usage sırası: önce Codex, sonra AGY, en son ana bağlam.** Mami'nin cümlesi:
*"en önemli şey senin usage'ın."* Bir işi dışarıya verebiliyorsan ver.

**R6 — Dışarıya giden görev metni bir dosyaya yazılır, komut satırına gömülmez.**
*Kanıt: ters tırnak içeren commit mesajı kabukta komut çalıştırmaya kalktı ve mesaj bozuldu.
Aynı sınıf her uzun prompt için geçerli.*

---

## 3. BU TURDA ÖLÇÜLEN KAZANÇ

| Ne | Nasıl yapıldı | Ana bağlama düşen |
|---|---|---|
| 8 katmanlık sistem haritası (~4.000 satır kaynak) | 6 paralel Claude ajanı, biçim şartlı | 6 sıkıştırılmış rapor |
| Kendi işimin denetimi | Terra 5.6 High, ayrı bağlam | 60 satırlık çürütme raporu |
| Belgelerdeki 380 atfın kontrolü | **script** (`baglar.mjs`), modelsiz | 28 satırlık kırık listesi |

Aynı iş tek bağlamda yapılsaydı oturum harita adımında biterdi.

---

## 4. BU BELGENİN SINIRLARI

- Gemini'lerin gerçek iş kalitesi **ölçülmedi** — dosya okuyamadıkları için deneme yapılamadı.
- `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.4` de kurulu ama kadroda sayılmadı, denenmedi.
- Codex usage'ının tavanı bilinmiyor; "biter" hükmü Mami'nin ölçümü, benim değil.
- Model seçimi kalite ölçümüne değil, **iş sınıfına** dayanıyor. Hangi modelin hangi işte daha
  iyi olduğu karşılaştırmalı olarak ölçülmedi.
