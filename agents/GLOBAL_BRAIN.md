# MAMILAS Global Brain

## Tek Otorite

MAMILAS briefi üretim otoritesidir. Ajan kişisel zevkini, model alışkanlığını
veya Reference DNA'yı briefin üstüne çıkaramaz.

## Evrensel Hiyerarşi

`source > route/path > Visual World > primary Teaching Recipe > max 20% scene override > approved image/architecture > Reference DNA > palette accent`

## Çıktı İlkesi

Önce doğrudan kullanılabilir üretim çıktısı verilir. Gerekçe yalnız üretim
kararını değiştirdiğinde eklenir. Sorular yalnız gerçek bir blokaj olduğunda
sorulur; aksi halde varsayım açıkça yazılır ve iş tamamlanır.

## Kalite İlkesi

Uzun batch, geç bloklarda kalite düşürme izni değildir. Her blok kaynakla
bağlı, özgül, üretilebilir ve komşularından ayırt edilebilir olmalıdır.

## Phase 0 Preset Bağlamı

Brief'te `PHASE0_PRESET:` varsa; Visual World, Production Path ve Reference DNA
kreatif direktör tarafından önceden seçilmiş ve kilitlenmiştir. Ajan bu değerleri
onaylanmış karar olarak okur — alternatif önermez, dünya veya path tercihini
sorgulamaz. Preset'in seçtiği world/path/refs birlikte bir prodüksiyon dilini
tanımlar; ajan bu dili içinde çalışır.

## Marka Kiti Kilidi

Brief'te `BRAND KIT: LOCKED` varsa aşağıdaki alanlar müşteri tarafından
onaylanmıştır ve dondurulmuştur:

- **Marka adı** — tam yazım ve büyük/küçük harf korunur
- **Logo notu** — geometri ve yerleşim önerisi yapılmaz
- **Marka renkleri** — brief'teki hex değerleri onaylıdır; alternatif palet önerilmez
- **Font ailesi** — "benzer" bile olsa alternatif önerilmez
- **Palet seçimi** — dünya görselinin temeli olarak sabit kalır

Kilitli bir marka kiti değiştirilemez, çevresinden dolaşılamaz ve esnek
muamele edilemez. Tasarım yönü kilitli kiti hizmetine girer; kit tasarım
yönüne adapte olmaz.

## Kreatif Varyant Testi (A/B/C)

Brief'te `CREATIVE VARIANT TEST — variable: [world|palette]` varsa görev
tekil öneri değil karşılaştırmadır. Tam olarak 3 varyant üretilir:
- **A**: mevcut kurulum (değişmez)
- **B**: adlandırılan değişkende bir adım
- **C**: daha belirgin kontrast

Yalnız adlandırılan değişken farklılaşır; diğer tüm parametreler A/B/C
boyunca aynı kalır. Varyant başına ayrı bir üretim bloğu verilir.

## Site ↔ Ajan Paketleri (mamilas-modern)

Modern site (mamilas-modern) bir orkestratördür: prompt'u kendisi yazmaz,
yönetmen ajanlarının kullanacağı **paketleri** üretir. Timeline ekranındaki
**"Ajan Paketleri"** menüsü altı çıktı verir; her biri eşleşen ajana yapıştırılır:

| Site paketi | Ajan dosyası (claude/ ve gpt/) |
|---|---|
| Ana Ajan Brief | tüm zincirin ortak production brief'i |
| IMAGE Paketi | `02_IMAGE_*` |
| MOTION Paketi | `03_MOTION_*` |
| SUNO Paketi (yalnız video) | `04_SUNO_*` |
| IDEA Paketi | `01_IDEA_*` |
| PROOF Paketi | `06_PROOF_*` |

Tasarım (design) işlerinde SUNO paketi üretilmez; IDEA → DESIGN (`05_DESIGN_*`)
→ PROOF zinciri kullanılır.

### Garanti edilen tetik tokenleri (reçete ↔ eczacı sözleşmesi)

Site, ajanların kapılarını tetikleyen şu tokenleri **birebir** yazar. Ajan bu
tokenleri gördüğünde ilgili kilidi uygular:

- `BRAND KIT: LOCKED` — marka kiti kilidi aktif (yukarıdaki kural geçerli)
- `CREATIVE VARIANT TEST — variable: world|palette` — A/B/C karşılaştırma modu
- `RENDER LOCK` — dünya render reçetesi; image prompt'a kelimesi kelimesine kopyalanır
- `SCENE DOSSIER` — sahne sahne kaynak + concept + kamera
- `PROOF STATE & QUALITY STATUS` — site'ın ön denetimi (regression taraması)

Token yoksa o kilit yoktur: varyant testi aktif değilse brief'te varyant bloğu
**hiç bulunmaz** — standart brief tertemiz kalır. Ajan, var olmayan bir kilidi
uydurmaz.
