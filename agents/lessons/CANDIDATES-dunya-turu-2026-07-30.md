# DERS ADAYLARI — 20 karelik dünya turu (2026-07-29/30)

Kaynak: `agents/COMMAND-INBOX/DENEME/` altındaki beş deneme. 20 kare basıldı, dört ayrı dünya
(pixar_3d_edu · sci_fi_hard_surface · science_viz_real · deakins_naturalist) ve üç register.
**`APPROVED.md`'ye yalnız Mami taşır** — bu dosya aday listesidir, otorite değil.

---

## A · YASAYA GİRENLER (bu turda yazıldı, burada yalnız kaydı)

- **§2ø FİKİR** — yeşil lint "temiz" demektir, "iyi" demez. Fikir sınavı: kareyi VO'suz göster,
  *"burada ne oluyor"* diye sor.
- **§2a PLAN KARARI** — kahraman · kaç net insan · ışık · zeminden ayrım · feda.
- **§2b MOTORUN ÖLÇÜLEN DAVRANIŞI** — geometri tutuyor, ton tutmuyor; negatif korumuyor;
  form yazılmazsa motor en tanıdık formu getiriyor; ten güvenilir; Türkçe yazı güvenilir.
- **§2c FEDA** — her şeyin okunduğu kare AI karesidir.

---

## B · KÜTÜPHANE KUSURLARI — `SURGERY_DATA.json`, Mami'nin sözü bekleniyor

**B1. Dünya STYLE metinleri gerçek isim taşıyor.** Marka sökücü üç dünyada çalışmamış:

| Dünya | Sızan ad |
|---|---|
| `ghibli_hayao` | **"Hayao Miyazaki"** — yaşayan gerçek kişi |
| `arcane_fortiche` | **"Fortiche Production"** — stüdyo |
| `spiderverse_sony` | **"Sony Pictures Animation"** — stüdyo |

Bu, §2'nin *"stili çağır, stüdyoyu değil"* maddesiyle **ve dünyanın kendi global negatifiyle**
çelişiyor: negatif "no recognizable franchise, logos, brand names" derken STYLE stüdyo adı
gönderiyor. Motora şu an marka ve kişi adı gidiyor.

**B2. `laika_stopmotion`'da sökme sonrası anlamsız cümle kalmış:** *"in the Studios theatrical
lineage"* — özne silinmiş, cümle sakat.

**B3. REAL dünya metinleri diyaframı yazıyor, KARANLIĞI yazmıyor.** Dört gerçek/reklam
dünyasının hiçbirinde `negative fill`, siyah nokta, kontrast oranı ve "ışık nerede bitiyor"
cümlesi yok; ajan dördüne de **elle** eklemek zorunda kaldı. O satırlar olmasa dört kare de
düz aydınlatılmış plastik çıkardı. §2R'nin adını koyduğu "REAL boşluğu"nun kütüphane kaynağı bu.

**B4. `dunya-kilidi.mjs` franchise isim listesini tek genel cümleye sıkıştırıyor.**
Anime dünyalarında ("NO Gojo…", "NO Luffy…" gibi satırlar) telif kilidi şu an **ajanın elle
yazmasına** bağlı. Kilit çıktısına isimli-karakter satırlarının aynen taşınması tek satırlık iş.

---

## C · LİNT YANLIŞ ALARMLARI — `prompt-lint.mjs`, ikisi de ölçüldü

**C1. Türkçe-İngilizce eşsesli.** `handle` slotu insan varlığını `\b(child|boy|girl|…)\b` ile
arıyor ve Türkçe PLAN satırındaki **"tam boy"** ifadesindeki `boy`'a takıldı. `hasHuman`'ın
`surface` içinde `face` bulma kusurunun ikizi, bu sefer dil-arası.
**Onarım:** insan kelimeleri **yalnız `-----` arası İngilizce gövdede** aransın; Türkçe
FİKİR/PLAN/başlık satırları taranmasın.

**C2. Harf sayacı betimlemeyle çakışıyor.** Karede *"one letter is scuffed thin at its corner"*
diye bir **tarif** vardı; `text-hece` onu harf sayısı sanıp kırmızı yaktı ve doğru yazılmış
kareyi reddetti. **Onarım:** sayaç yalnız parantez içindeki sayım öbeğini okusun, serbest
metindeki "one/two letter(s)" ifadelerini görmesin.

---

## D · MOTOR SINIRLARI — prompt'la aşılmıyor, tasarımla aşılıyor

**D1. İsimsiz insan pahalıdır ve piksel sınırı tarifle aşılmaz.** Ekranda ~30-40 piksellik bir
yüzde kimlik taşınamaz. Kalabalık hissi **gövdeyle değil eşyayla** kurulur. Ölçüldü: aynı sahne
kalabalıklı ve kalabalıksız basıldı, ikisinde de simetri kaldı — yani kalabalık suçlu değildi,
**çapasızlık** suçluydu.

**D2. Simetri varsayılandır.** Ön planda kesilen bir çapa yoksa motor tek nokta perspektifine
düşüyor: özne ortada, yol ortada, iki figür yan yana eşit.

**D3. Kırılma, kostik ve ince-film girişimi ÇALIŞIYOR.** Damlanın içindeki ters çevrilmiş
koridor, duvarda gezinen kostik şeritler, plakalardaki yağ-tabakası renk kayması — üçü de
fizik olarak yazıldığında tuttu. Yani zor optik bir sınır değil.

**D4. Cyan/iç ışık büyük ölçekte kayboluyor.** "Plaka dikişlerinden sızan cyan parıltı" makro
karede çıktı, bina ölçeğindeki karede hiç çıkmadı.

---

## E · TESLİM EDİLEN DENEMELER

| Klasör | Kare | Durum |
|---|---|---|
| `Festival — Kültür Yolu` | 2 | Kemer karesi Mami onayı: *"inanılmaz"*. Kilim karesi: *"güzel duruyor"* |
| `Limit Testi — Uzaylı` | 3 | Ölçek tuttu, kırılma tuttu, yaratık formu ÇÖKTÜ (§2b.3) |
| `Andromeda` | 2 | basıldı, hüküm yazılmadı |
| `TOHUM — 5 Sahne` | 5 | Mami: *"çok mid"*. Ten geçti, geometri geçti, ton çöktü (§2b.1) |
| `10 Dünya Turu` | 10 | prompt hazır, üretim yapılmadı |
