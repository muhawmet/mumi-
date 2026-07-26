# V2 KÜTÜPHANE — FAZ 0.2 + 0.3 RECEIPT (2026-07-26)

Mami kararı: "FAZ 0.2+0.3 — kaynak temizliği". Kare basılmadan, kaynakta.
Dürüst durum: **kaynak düzeltildi / görsel doğrulama BEKLİYOR** — kare hükmü Mami'nin.

## Envanter (bu turda ölçüldü)

| | Toplam | Gerçek kare vermiş |
|---|---|---|
| Dünya | 46 | **1** (`pixar_3d_edu`) |
| Ref | ~130 | **3** (`pixar_dimensional`, `pixar_emotional_staging`, `soul`) |
| Palet | 12 | **1** (`vibrant_edu`) |

Üç bitmiş video: Sürtünme 31/31 kare · Bileşke 52/52 · Kuvvet Ölçülmesi 20/48 (28 kare diskte yok).
Toplam **103 gerçek kare**, hepsi tek dünya + tek palet + 3 ref ile. Dört command JSON'un dördü
`pixar_3d_edu`. `product_brand_real` yalnız test artifact'i — render'lı kare yok.
Kanıt: `agents/COMMAND-INBOX/` (JSON `locks.worldId` + `locks.paletteId` + `locks.refIds`).

## Ölçüm — gerçek `generateBatch`, üretim yapılandırması birebir

world=pixar_3d_edu · palette=vibrant_edu · refs=[pixar_dimensional, pixar_emotional_staging, soul]
· nano_banana_2 + kling_3 · iki vaka (cast BOŞ = üretimdeki gerçek hâl, cast DOLU).

| Kusur | ÖNCE | SONRA | Hüküm |
|---|---|---|---|
| 3 · `saffron` | ×2 (her iki vakada, her sahnede) | **×0** | KANITLANDI → düzeltildi |
| 2 · `sheen` | ×8 castless / ×2 cast'li | **×2 / ×2** | daralttı — bkz. aşağı |
| 5 · anonim gövde | ×1 castless | ×1 | tetikleyici kusur 4; yasa kaldırılmadı |
| 4 · boş cast | brief + 5 paket boş alan basıyor | **satır basılmıyor** | düzeltildi |
| 1 · belgesel preseti | **×0** bu yapılandırmada | — | ders/EDU yolunda YOK; `cinematic_story` presetine özgü |
| 7 · stale `locks.topic` | **×0** image prompt'ta | — | export/dosya-adı katmanında; image yoluna girmiyor |
| 6 · genel negatif | 15 madde, her sahnede aynı | değişmedi | **Mami kararı bekliyor** — bkz. aşağı |

## Yapılan üç değişiklik (TDD — her biri önce kırmızı)

**1. `saffron` → `warm golden` — KÜTÜPHANEDE (`SURGERY_DATA.json`, `vibrant_edu.bias`).**
`hexToLightWords` hex'i ışık diline çeviriyordu ve bu yasa çalışıyordu; ama paletin `bias`
alanı ham nesirdi ve hiçbir çeviriden geçmiyordu — `vibrant_edu` prompt'a sahne başına iki kez
`saffron` sokuyordu. Kanıt zinciri kapalı: veri → prompt → bozuk kare → revize dosyası
(`Bileşke Kuvvet_REVİZE-TUR2.txt` bölüm başlığı: "B) ÇİÇEK OLMUŞ GLOW'LAR"; aynı dosyanın en
üstündeki KRİTİK NOT tam bu kelimeyi elle yasaklıyordu).

**Bir ara sürüm bunu kodda, çıkışta çeviren bir sözcük katmanı olarak yazdı ve Mami reddetti
("regex yok") — haklıydı, katman SÖKÜLDÜ.** Kötü kelimeyi kaynağında değil çıkışında yakalayan
bir kat, kütüphaneyi yanlış bırakıp semptomu gizler. `.claude/settings.json` içindeki
`Read(./src/core/SURGERY_DATA.json)` deny kuralı Mami'nin talimatıyla kaldırıldı ve kelime
kütüphanede düzeltildi. Koruma artık kodda değil TESTTE: `wordTraps.test.ts` 12 paletin hepsini
tarar ve bir palet çiçek adı taşırsa HANGİSİ olduğunu söyler — sessizce düzeltmez, düzeltmeyi
kütüphaneye yollar. (Ölçüldü: 9/12 palet honey/cream/olive/peach/plum/wine/sage/tomato taşıyor;
bunlar gündelik RENK sözcüğü ve "warm honey bounce" pixar'ın kendi ışık dili — kanıtsız
dokunulmadı.)

**2. `SSS` → `subsurface-style translucency` (`brain.ts`, `scrubHumanTokens`).**
İki komşu satır aynı fiziği iki AYRI kelimeyle çeviriyordu: uzun form "translucency" (doğru),
kısaltma "sheen" (yanlış). `sheen` yüzeyden YANSIYAN parlaklık, `SSS` yüzeyin İÇİNDEN geçen ışık.
Mami'nin "sheen → plastik cilt" bulgusunun kaynağı **dünya verisi değil, bu çeviriydi**:
castless promptta sayıyı ×8'e çıkarıp "subsurface-style sheen surface" cümlesini IMPERATIVE
olarak basıyordu. Dünyanın meşru malzeme dili (ahşabın satin-varnish sheen'i, lastiğin
soft-diffuse'ü) **korundu** — karşı-test var.

**3. Boş `cast` satırı basılmıyor (`brain.ts` ×2 yüzey).**
`location` bu korumayı zaten almıştı, gerekçesi de yorumunda yazılıydı ("boş alan ajanı
uydurmaya davet ediyor"); `cast` aynı listede bir satır yukarıda korumasızdı. Üç bitmiş
videonun üçünde de site tarafında cast boştu (@mira/@efe tag'lerini ajan yazdı) — yani her
üretimde boş basıldı. `buildAgentBrief` ve `primePacket` birlikte düzeltildi (tek yüzey drift üretir).

## Yeni test dosyası — `src/core/wordTraps.test.ts` (8 test)

Kod kokusu taraması değil: her madde gerçek bir revize dosyasında YAZILI bir hata ve gerçek
`generateBatch` ile yeniden üretildi. Bir test **ölçüm aleti** olarak da çalışıyor —
`SURGERY_DATA.json` okuması bu oturumda classifier tarafından engelli olduğu için, 12 paleti
tarayan test hangi paletin hangi nesne-renk adını taşıdığını başarısızlık mesajında bildiriyor
(ölçüldü: 9/12 palet, liste receipt'in üstünde).

## Kapı

- `npx tsc --noEmit` → **0**
- `rtk proxy npx vitest run` → **2070/2070 (81 dosya)**. Taban 2062 → +8 yeni test; **silinen test yok**.
- `npm run build` → **OK** (tek uyarı: bilinen bundle-boyutu debt'i)
- Gerçek çıktı gözle okundu (iki vaka, tam prompt) — kapı yeşili görsel kanıt değildir.

`brain.test.ts`'te 2 test güncellendi: `vibrant_edu`'nun fixture'ı `saffron`'u SABİT yazıyordu.
Kilitledikleri yasa (renk lead'i ile fizik cümlesi arasında NOKTA olmalı) **aynen korundu**,
yalnız beklenen kelime çeviri sonrasına alındı. Assertion zayıflatılmadı, test sayısı düşmedi.

## FAZ 0.3 — ders korpusu

`agents/lessons/CANDIDATES-2026-07-26.md` — Bileşke Kuvvet'in 2 revize turundan 10 ders adayı,
`lessonBank.ts`'in parse ettiği satır biçiminde. **`APPROVED.md`'ye yazılmadı** — M7 yasası:
yalnız Mami yazar, otomatik promote yok. Sürtünme ve Kuvvet Ölçülmesi için revize turu hiç
yapılmamış; o iki videonun dersleri henüz yok.

## Mami kararına açık iki nokta

**A · Kusur 6 — genel negatif yığını.** Ölçüldü: her sahnede aynı 15 madde. Ama gerçek-kare
kanıtı YOK — hiçbir revize maddesi bir hatayı negatif bandına bağlamıyor. Ve yığının bir kısmı
MAMILAS'ın en iyi pedagojik yasası ("gerçek nesne yerine ikon/diyagram/gösterge koyma").
Negatif silmek IP firewall'ını da açar. Kök neden kanıtlanmadan yama yapılmadı — hangi maddeler
gürültü, hangileri firewall, Mami'nin hükmü gerekiyor.

**B · Kusur 5 — anonim gövde.** Yasa doğru (cast gerçekten yoksa uydurma yüz yasağı). Sorun
tetikleyicide: site cast'i boş bırakınca EDU yolunda sessizce "karede kimse yok" moduna
geçiyor — oysa video @mira/@efe ile dolu. Doğru çözüm yasayı silmek değil, **boş cast'i görünür
kılmak** (insan taşıyan yolda uyarı/blocker). Bu bir ürün kararı.

**C · Ayrıca ölçüldü (kod değil skill kusuru):** `bloom` prompt yolunda ×0. Kaynağı
`mamilas-director` skill'inin kendisi — satır 64 atmosfer için "bloom" yazmayı İSTİYOR,
satır 70 aynı kelimeyi YASAKLIYOR. Skill kendisiyle çelişiyor; FAZ 1'de düzeltilecek.

## FAZ 1'den erken kapananlar

**Kütüphane karnesi (FAZ 1.3) — `docs/KUTUPHANE-KARNESI.md` + `scripts/kutuphane-karne.ts`.**
Elle yazılmaz, komutla üretilir (bayatlamasın). 46 dünyanın durum kaydı: **1 VALIDATED /
45 UNVALIDATED**. Envanterin yeni ölçümleri: 46/46 dünya sekiz katmanı da taşıyor · 120 ref'in
hepsi 6+ cümlelik dna'ya sahip · 130 ref = 76 dünyaya-bağlı + **44 orphan** + 10 `cinedna_` ·
kendi ref'i olmayan 7 dünya. **Orphan sınıfı `mamilas-ref` skill'inde HİÇ yazılı değil** —
skill "worldId zorunlu" diyor, veri 44 kayıtla aksini söylüyor (`refCompatibleWithWorld`,
`pure.ts:661` bu sınıfı tanıyor). Skill drift'i FAZ 1.1'e taşındı.

**`mamilas-director` skill'inin `bloom` çelişkisi kapatıldı.** Satır 64 atmosfer için "bloom"
yazmayı istiyordu, satır 70 aynı kelimeyi yasaklıyordu; ajan iki emri de okuyup çiçek üretiyordu.
Artık tek emir: "soft round warm-golden glow of light". Aynı yerde kapanan iki tuzak (saffron,
sheen) ajanın işi olmaktan çıkarıldı — kaynakta ve testte. `.claude` ve `.agents` kopyaları
byte-parite (launcher-parity kuralı).

## Değişen dosyalar

- `src/core/SURGERY_DATA.json` — `vibrant_edu.bias`: iki `saffron` → `warm golden` (KÜTÜPHANE FIX)
- `src/core/brain.ts` — 2 fix (SSS terimi + 2 boş-cast yüzeyi) + palet yolunda niye kod
  katmanı OLMADIĞINI anlatan yasa yorumu
- `src/core/brain.test.ts` — 2 fixture literal'i düzeltilmiş veriye alındı
- `src/core/wordTraps.test.ts` — YENİ, 8 test
- `agents/lessons/CANDIDATES-2026-07-26.md` — YENİ, 10 ders adayı
- `docs/KUTUPHANE-KARNESI.md` + `scripts/kutuphane-karne.ts` — YENİ, kütüphane durum kaydı
- `.claude/skills/mamilas-director/SKILL.md` + `.agents/` kopyası — bloom çelişkisi
- `.claude/settings.json` — SURGERY_DATA deny kuralı kaldırıldı (Mami talimatı)
- `artifacts/decision-pipeline-implementation/receipts/V2-FAZ-0.md` — bu dosya

Commit atılmadı — Mami kararı.
