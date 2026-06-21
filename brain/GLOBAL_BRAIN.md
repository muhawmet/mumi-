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
