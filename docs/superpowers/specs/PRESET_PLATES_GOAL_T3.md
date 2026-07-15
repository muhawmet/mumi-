# PRESET PLATES GOAL — T3 Arketip Görselleri (Mami prosedürü)

## Ne yapıyorsun
Aşağıdaki preset kartlarının görselleri için `public/assets3d/presets/` klasörüne webp
dosyalarını atıyorsun. KOD DEĞİŞMEZ — dosya adı sözleşmedir; dosya göründüğü an
PresetPlate bileşeni otomatik olarak görsel slotunu doldurur, dosya yoksa ikon
fallback çalışır, site asla kırılmaz.

## Format kanunu
- 16:10 webp, minimum 736×460 px
- Painterly stil; world-plate ailesiyle aynı dil (bkz. `src/components/worldPlates.ts`)
- Metin / logo / harf YOK görsel içinde; pure image only
- Her arketiple renk/atmosfer uyumu; jenerik AI estetiği yasak

## Dosya listesi (8)

| Dosya | Preset etiketi | Bir satır art brief |
|---|---|---|
| `product_brand.webp` | Ürün / Marka Filmi | Stüdyo tabletop, tek ürün odak noktasında — derin siyah zemin üstünde soğuk metalik yüzey ışığı, ürün geometrisi sert çizgiyle kesiliyor, sağdan ince altın rim; Apple-seviyesi temizlik |
| `edu_explainer.webp` | Eğitim / Açıklayıcı | Sıcak clay diorama, küçük el yapımı nesneler sahne ortasında — pastel arka ışık, dokunsal yüzeyler, Pixar eğitim sıcaklığı, merak hissi |
| `cinematic_story.webp` | Sinematik Hikâye | Gerçek lokasyon, geniş kadraj — Deakins çizgisinde doğal pencere ışığı, alçak güneş açısı uzun gölge bırakıyor, insan ölçeği, duygu yoğunluğu |
| `social_short.webp` | Sosyal / Kısa Form | Dikey hareket enerjisi, sokak/şehir ortamı — el kamerası parallax, canlı renk patlaması, anlık gerçeklik hissi, platform-native dinamizm |
| `doc_human.webp` | Belgesel / İnsan Hikâyesi | Portre büstü, pencere kenarı — muted documentary palet, overcast gün ışığı, yüzde ince doku ve mikro ifade, gözlemsel mesafe |
| `corp_public.webp` | Kurumsal / Kamu | Açık hava kamu mekanı, civic sabah ışığı — temiz mimari çizgiler, vatandaş ölçeği, güven ve saydamlık hissi, morning blue palet |
| `event_campaign.webp` | Etkinlik / Kampanya | Kalabalık etkinlik, sahne ışıkları — warm gold spill, kalabalık silueti arka planda, ön planda kampanya enerjisi, grandioz ölçek |
| `stylized_game.webp` | Stilize / Oyun-Kinematik | Painterly 3D çerçeve — Fortiche/Arcane dokusu, sert rim ışığı, deep space blue + teal kontrast, siluet güç, özgün IP-safe render grameri |

## Doğrulama
Dosyaları attıktan sonra:

    node scripts/check-assets3d.mjs

Preset plate satırları (8 adet) ✓ olmalı. Eksik dosya = ikon fallback, site
asla kırılmaz — eksiklik informational'dır, hard fail değil.
NOT: `--strict` modu başka eksik asset'ler nedeniyle ayrıca FAIL verebilir;
preset plate satırlarının 8/8 ✓ olması yeterlidir.
Sonra tarayıcıda hard refresh (dev server restart gerekmez; görünmezse restart).
