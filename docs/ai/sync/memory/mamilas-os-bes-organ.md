---
name: mamilas-os-bes-organ
description: "Otonom stüdyonun mimarisi — brifing kapısı, iş emri omurgası, motor+cüzdan rotası, üç kademeli göz, kurgu zekâsı, karar yüzeyi; ve inşa sırasında ölçülen dört bulgu"
metadata: 
  node_type: memory
  type: project
  originSessionId: e441bce1-7ec1-4fba-82da-71f254aaa12f
  modified: 2026-08-07T08:04:12.456Z
---

**2026-08-07'de kuruldu.** Mami AGY'yle bir brief yazdı (`OPUS5-OTONOM-STUDYO-BRIFI.md`) ve
*"ben sana fikir verdim, sen yasa zannediyorsun — en iyi pipeline'ı kurmak yerine"* dedi.
Doğru teşhis: brief bir spec değil bir vizyondur, budanmaz — **arşa çıkarılır.**

## Mimari — beş organ (brief'in 6 adımı bunların üstünde koşar)

Brief **üretimi** otomatikleştiriyordu. Oysa ölçülen gerçek: üretim zaten iyi (125 kare / 0 kırmızı),
zayıf olan **kurgu**; ve darboğaz kredi değil **İNSAN DÖNGÜSÜ** — tek onaycı, telefonda, DEHB'li.

| Organ | Dosya | Ne çözüyor |
|---|---|---|
| 0 · **Brifing** | `scripts/brifing.mjs` | Plan modunun altı kilidi. Cevapları ÖLÇÜMDEN türetip **seçtirir** — açık uçlu soru yok. `.docx` doğrudan okunur (bağımlılıksız ZIP+XML); elle metne çevirme adımı kalktı |
| 1 · **İş emri** | `scripts/is-emri.mjs` | Shot seviyesinde, atomik, diske yazılı durum. "Nerede kalmıştık" sohbette yaşıyordu ve bir `/clear` ömrü sürüyordu |
| 2 · **Rota** | `scripts/rota.mjs` | Motor değil **MOTOR+CÜZDAN** çifti. Ana hat Magnific (Mami: *"önce magnific kredisini bitirmek"*), Higgsfield ekstra |
| 3 · **Üç kademeli göz** | `dis-goz gor --film` + `scripts/kare-cek.mjs` | İşaretçi AGY · cetvel ffmpeg · **hakem Claude'un gözü**. Hakem ayağı bugüne kadar YOKTU |
| 4 · **Kurgu zekâsı** | `scripts/lj-kesim.mjs` | "Kurgu çok basic"in cevabı |
| 5 · **Karar yüzeyi** | `scripts/karar.mjs` | Tek ekran, ≤5 madde, ikili tuş. Altıncı madde okunmuyor, o yüzden yazılmıyor |
| — · **Öğrenme** | `scripts/uretim-defteri.mjs` | Kuzey yıldızı (ilk basımda tutma) + ÜÇ VURUŞ |

## İnşa sırasında ölçülen dört bulgu

🔴 **Adobe kurgu motoru OLAMAZ.** Kendi routing belgesi: *"video trimming to timestamps —
not available"* · *">~20 dosya batch — not available"* · yerel dosya okuyamıyor, klip başına
**elle seçim**. `video_create_quick_cut` bir highlight seçicisi, timeline değil.
→ Kurgu `kaba-kurgu.mjs` (Premiere XML) + `ffmpeg`'de kalır. Kalan yüzeyi Mami araştırıyor.

🔴 **Soul ID DÜŞTÜ.** Yalnız `soul_2` / `soul_cinema` ile çalışıyor; NB2 + Kling 3.0 hattında
çalışmıyor. Süreklilik yolu **Element**tir.

🔴 **"Kling 3.0 referans alır" cümlesi cüzdansız YANLIŞ.** Magnific'te 450 kredi ve 3 referans
alıyor; Higgsfield'da 10 kredi ve `medias` üzerinden referans **almıyor** — orada referans
**Element**tir, prompt'a `<<<element_id>>>` gömülür ve NB2/NB Pro/Kling 3.0 ile çalışır.
Element rafı boş sanılıyordu, **9 element varmış** (`ogr`, `aras1`, `defne1`, `emin`, `ref`,
`iye`, `taoni`, `logo`, `building`) → `artifacts/element-rafi.json`.

🔴 **Higgsfield `faceless-channel-video` v2.1** — anlatıcılı explainer/kids/story, 30sn–10dk,
stil kilidi + tekrar kullanılan varlıklar, sunucu tarafında bitiriyor. **Tam bizim kategorimiz.**
Varlığı ölçüldü, **kalitesi ölçülmedi**; Türkçe müfredat sadakati ve Mami'nin zevki orada yok.

## Mami'nin bu turda koyduğu kurallar

- **Recreate onun kontrolünde.** *"Onarımı beraber yaparız — sen bulursun, bana gösterirsin."*
  Brief'in "bozuk kareyi sessizce düzelt" maddesi DÜŞTÜ. Yetki *"sistem oturunca"* aşamalı gelecek.
- **Önce Magnific bitirilir**; Higgsfield gerçek parada daha pahalı, ekstra araç.
- **Kredi kıyaslanamaz** (~6k'ya karşı 600k ölçek) — kıyaslanan birim **FİLM**. Ve kredi duvar
  değil: Magnific bitince yeni hesap, 600k.
- **Element 1:1, sahne 16:9.** Raf projelerden birike birike büyür, baştan hepsi kurulmaz.
- 🔴 **Süreklilik bir İSİM LİSTESİ değil, bir EŞİK:** *"her şeyde de 2-3'ten fazla görünüyorsa
  devamlılık olur — kediyse `@kedi` diye üretiriz, sonraki videoda kedi lazımsa onu kullanırsın."*
  Karakter, hayvan, nesne, mekân fark etmez. Raf **cüzdan üstüdür**.
- **Her iş plan modunda açılır** — *"MAMILAS sitesini böyle egale ediyoruz."*

Bkz. [[mamilas-magnific-mcp-hatti]] · [[mamilas-higgsfield-hatti]] · [[mamilas-uc-kademeli-goz]] ·
[[mamilas-bul-sec-onar]] · [[mamilas-upwork-portfolyo-hedefi]]
