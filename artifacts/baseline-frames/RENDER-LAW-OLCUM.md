# RENDER_LAW ÖLÇÜMÜ — fizik mi, envanter mi?

- 2026-07-15 · TASK 1B eki · **salt-okunur.** `src/` değişmedi, hiçbir fix uygulanmadı.
- Yöntem: **gözle okuma.** KARE-BULGULARI'nın emri: *"keyword sayımı bunu çözemez —
  `one_piece_toei` yasasını GÖZLE oku, hipotezi KAREYLE sına. Sayımla kapatma."*
- Kaynak: `src/core/SURGERY_DATA.json` → `worlds[].render_law` (dokunulmamış worktree).

---

## Bulgu 1 — Kazanan yasalar **YASA** olarak yazılmış, kaybedenler **ENVANTER** olarak

| Dünya | Yasanın iskeleti | Kare sonucu |
|---|---|---|
| `pixar_3d_edu` | SSS · bounce fill %25-35 · malzeme özgüllüğü · motive key · pişmiş AO · f/4 odak · squash-stretch → **hepsi NASIL** | ✅ geçti (3 kare) |
| `product_brand_real` | (1) IŞIK KAYNAĞI (2) YÜZEY GERÇEĞİ (3) ARKA PLAN (4) KAMERA (5) LENS (6) DOKU → **numaralı yasa listesi** | ✅ geçti (kurumsal kare) |
| `one_piece_toei` | kontur + 2-değer cel + gökyüzü + perspektif = yasa · **AMA** *"wanted-poster paper, pennants, caravel-hybrid timber hull with carved figurehead"* = **envanter** | ❌ kaldı — korsan gemisi ve afişler jeoloji dersine sızdı |
| `synthwave_retro_80s` | (1) parlayan cyan tel-kafes ZEMİN (2) devasa gradyan GÜNEŞ (3) KROM (4) **palmiye, dağ, silüet** (5) CRT tarama çizgisi (6) YILDIZ | ⚠️ hiç kare yok — **en riskli** |

**YASA:** *Render law "NASIL render edilir"i söylüyorsa güvenle taşınır.
"Karede NE bulunur"u sayıyorsa motor onu **alışveriş listesi** sanar.*

`synthwave_retro_80s`'in ilk dört maddesi **nesne** (zemin, güneş, krom, palmiye/dağ).
Yalnız (5) CRT/VHS ve bloom gerçek fizik. Bu dünyayla bir sınıf sahnesi istersen
**sınıfın zeminine neon tel-kafes, penceresine gradyan gün batımı** girer. Kare üretilmedi;
KARE-BULGULARI'nın 3:0 oranı **gözle doğrulandı**.

---

## Bulgu 2 — ⚡ `plastik`'in KÖK NEDENİ: yasanın kendi içinde çelişki var

KARE-BULGULARI'nın hipotezi şuydu:
> *"Dünyanın yasası KARAKTER cel kurallarını TÜM KAREYE uyguluyor. Gerçek One Piece'te
> arka planlar BOYALIDIR — gökyüzü airbrush, bulutlar dereceli."*

Rapor bunu **keyword sayımıyla kanıtlayamadı** ve dürüstçe *"DOĞRULANMADI"* yazdı:
*"düz-cel emri olan 5 dünyanın hepsi arka plan/gökyüzü kelimesini içeriyor — `one_piece_toei`
zaten 'hand-brush-painted cumulus' diyor."*

**Gözle okuyunca hipotez destekleniyor — ama sayımın gördüğünden başka bir sebeple.**

`one_piece_toei.render_law` **ikisini birden** söylüyor:

> **(a) Gökyüzü boyalı olsun:** *"Sky is the emotional engine: **hand-brush-painted** cumulus masses
> in cream-gold over cobalt-marine, **flaring** amber-orange at climactic beats"*
> → fırça, kütle, geçiş, alevlenme = **dereceli, boyalı** bir gökyüzü.

> **(b) Sonra, kapanışta, KAPSAMSIZ bir imperatif:** *"IMPERATIVE: **STRICT PURE 2D CEL SHADING.
> No 3D, no 2.5D, no subsurface gradient**, no realistic anatomy proportion, **no pastel or muted tone**."*

**(b), (a)'yı yiyor.** "No gradient" ve "no pastel or muted tone" **hiçbir kapsam belirtmeden**,
tüm kareye uygulanıyor — oysa (a) tam da dereceli, pastel-krem bir gökyüzü istiyor.
Motor iki emir arasında kalınca **en katı ve en sondakine** uyuyor: düz, gradyansız, saf 2D
→ **vektör illüstrasyon modu** → *"zorla 2D plastik"*.

Karşı kanıt aynı raporda: `shinkai_photoreal_anime` **tam da bu ayrımı yaptığı için** birebir tuttu —
*"sade cel karakter, foto-gerçek arka plan; aradaki UÇURUM üsluptur."* Orada cel disiplini
**FİGÜRE kapsanmış**. One Piece'te kapsanmamış.

Bu, isim yazmanın neden kurtarmadığını da açıklıyor: eksik olan marka adı değil,
**prompt'un içinde motoru gradyandan aktif olarak uzaklaştıran cümle** — ve o cümle
dünyanın kendi yasasında duruyor.

### ⚠️ BU HÂLÂ BİR HİPOTEZDİR — KAREYLE SINANMADI

KARE-BULGULARI'nın kuralı: **"Kare olmadan kapatma."** Bu ölçüm yalnız çelişkiyi **gösterir**.
Önerilen sınama (TASK 5/7'de, **Mami'nin izniyle**): `one_piece_toei` yasasında imperatifi
**kapsa** — cel disiplini → FİGÜR, boyalı/dereceli disiplin → ARKA PLAN — ve **aynı sahneyi**
tekrar üret. Kare One Piece'e yaklaşırsa hipotez doğrulanır. Yaklaşmazsa **kök neden hâlâ bilinmiyor**
ve öyle yazılır.

---

## Bulgu 3 — TASK 4 için doğrudan sonuç

TASK 4'ün "render_law'ı fizik/prop olarak ayır" emri **doğru**, ama ayrım şu şekilde yapılmalı:

1. **Fizik/yasa cümleleri** (ışık, lens, değer, kontur, malzeme, mark-making) → **verbatim kalır.**
   A2 kanıtı: bunları sökmek kareyi stok fotoğrafa çevirdi.
2. **Envanter cümleleri** (wanted afişi, flama, oymalı pruva, palmiye, tel-kafes zemin, gradyan güneş)
   → **kelime dağarcığı** olarak işaretlenir: *"bu dünyada böyle nesneler bulunabilir"*,
   **kadro emri değil**. Zaten dünyanın örnek öznesi için (*"a veteran's salute"*) yapılan şeyin aynısı —
   site bunu `Cast authority` bandında **zaten söylüyor**, ama yalnız **insanlar** için.
   Aynı koruma **nesnelere** yok.
3. **Kapsamsız imperatifler** (`STRICT PURE 2D CEL... no gradient`) → **kapsanır**:
   hangi katmana (figür / arka plan / tüm kare) uygulandığı **açıkça yazılır.**
   Bu, `plastik` hipotezinin kod hâlidir.

**46 dünyaya yayılmaz** — skill'in yasası: A/B geçmeden TASK 7 başlamaz.
KARE-BULGULARI'nın yasağı: *"KÜTÜPHANEYİ BUNDAN ÖNCE GENİŞLETME."*
