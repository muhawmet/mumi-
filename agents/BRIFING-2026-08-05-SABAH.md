# SABAH BRİFİNGİ — 5 Ağustos 2026

> Gece çalışması. Üretim durmadı, kredi yanmadı, hiçbir kare basılmadı.
> Kapı yeşil: **tsc temiz · vitest 2541 PASS · 0 FAIL · build 310ms.** İki commit içeride.
> **Bu dosya okunacak tek dosyadır.** Gerisi kanıt olarak duruyor, açman gerekmiyor.

---

## 1. GECENİN TEK CÜMLESİ

**"Mira neden plastik" sorusunun cevabı zaten yazılmıştı — ve kaynağı hâlâ açıktı.**
Teslim metninden 77 yerden silinmiş, ama plastiği **emreden kütüphane satırı** yerinde
duruyordu. Yani her yeni videoda geri gelecekti. Bu gece kapatıldı.

---

## 2. ÜÇ BULGU — hepsi ölçüldü, hiçbiri tahmin değil

### ① Plastik tenin MEMBASI açıktı
`src/core/SURGERY_DATA.json` iki ayrı yerde motora birebir şunu söylüyordu:
> *"wet dual-point specular on eyes with painted-in iris depth"*

Bu, senin iki tur "plastik" dediğin şeyin kaynak cümlesi. Teslim metninde silinmişti,
**kaynakta duruyordu.** Üçüncü bir yerde de klişe yazıyı emrediyordu
(*"blocky dimensional letterform, raised and legible"*) — ve bu cümle, `dunya-kilidi.mjs`'in
"bas ve yapıştır" çıktısında **`prompt-lint`'in kendi kırmızısını** ateşliyordu. Yani iki
resmi araç birbirine ters çalışıyormuş. Üçü de düzeltildi.

### ② "Eşeyli = 0 revize altın standart" YALANMIŞ
Bu cümle sistemde **8 yerde çıpa** olarak kullanılıyordu; kural sertliği buna göre ayarlanmış.
Diskteki `_revize.txt`: **31 revize bloğu.**

Ama kalibrasyon çökmedi — çünkü o 31 revizenin sınıfını ölçtüm: süreklilik · kostüm kilidi ·
dünya kilidi · cam kopyası. **Hiçbiri ten/ışık sınıfında değil.** Yani "Eşeyli temizdi"
doğruydu, "0 revize aldı" yanlıştı. Sekiz yer düzeltildi.

**Ders:** bir çıpa SAYISIYLA değil, *o kusur sınıfındaki durumuyla* ölçülür.

### ③ Dünya kartı ile plastik onarımı çelişiyor SANILDI — çelişmiyor
Kart: *"çocuğun yüzü hiçbir karede gölgeye atılmaz"* (§5øø güvenlik yasası).
HASAT §4a: *"terminatör yanağından bir çizgi hâlinde insin, yakın taraf iyice altta kalsın."*

Görünüşte zıt, gerçekte aynı düşmanı hedefliyorlar. Ayrım tek cümle:
> **YASAK: yüz OKUNMAZ olur** (siluet, kapalı siyah, düz ambiyans).
> **ZORUNLU: yüz MODELLENİR** (terminatör + adlandırılmış sıçrama, yüz okunur kalır).

Kanıt senin en iyi ten karende zaten yazılı — K07: *"turns dark against the sun but stays
fully modelled, three-dimensional and readable."* Bu ayrım kurala yazıldı.

---

## 3. NE KURDUM

| Ne | Kanıt |
|---|---|
| **Yeni KIRMIZI kapı: `isik-yuzu-disliyor`** — plastiğin ölçülmüş **ikinci** sebebi | Korpus: Üreme 0/50 · Sabit Sürat 0/44 · Sürtünme 0/31 · Hücre A **53%** · Farklı Kültürler **66%** · Birlikte **89%** (30 revize) |
| **`islak-goz`: SARI → KIRMIZI**, ve daraltıldı | Kırmızıya çekince gizli bir yanlış alarm çıktı (su/cam harflerini göz sanıyordu). Şimdi: Üreme 0/50, kalan tek ateşleme **K49** — hasadın "en plastik kare" dediği kare |
| **Memba onarıldı** (3 satır) | `dunya-kilidi` çıktısı artık `tekduzelik-yazi` kırmızısı ATEŞLEMİYOR |
| **Ders bankası tavanı konusallaştı** | Eskiden `slice(-20)` **sıraya** bakıyordu: 8. yazı dersi 1. motion dersini yalnız daha yeni yazıldığı için düşürüyordu. Artık konular arası round-robin |

**Kuralın tek cümlesi** (bunu ezberle, gerisi detay):
> *Işığın nereye ULAŞMADIĞINI yazma — karanlığın nerede DURDUĞUNU yaz.*

Mekanizma: "ışık yüzüne ulaşmaz" bir **negatif**tir. Motor negatiften karanlık üretmiyor,
yüzü **gradyansız ortam dolgusuna** bırakıyor. Ölçüm iki yönlü doğrulandı — Üreme dışlama
0/50 + karanlık çapası 28/50; Birlikte tam tersi (49/54 ve 0/54).

---

## 4. KENDİ HATAM — kayda geçsin

İlk ölçümüm **sahte yeşil** verdi: `parseBlocks` `{head, body}` nesnesi döndürürken onu string
sandım, regex `"[object Object]"` üzerinde koştu, **0/289** çıktı ve "sıfır yanlış alarm"
diye okunabilirdi. Şüphelendim, bilinen pozitiflerde test ettim, yakaladım.

Bu, bu depoda **8 kez ölçülen** ana kusur sınıfının aynısı — bu kez benim elimden.
Ölçüm gerçek `lintBlock` yoluna taşındı ve **testin içine gömüldü**.

---

## 5. SENİN KARARINI BEKLEYEN — 3 madde

1. **Kanon çelişkisi hükmü.** §5øø ayrımını ben yazdım (yüz modellenir / okunmaz olmaz).
   Güvenlik yasasına dokunduğu için **son söz senin**: doğru ayrım mı?
2. **Motor deneyi.** Codex en ucuz ayırt edici deneyi tasarladı: **4 kare × 2 motor = 8 baskı**
   (K13 ve K07 yüz · K24 geçirgen madde · K25 Türkçe yazı), model adı görünmeden.
   Hükmü sen verirsin. **Basalım mı?**
3. **Gece hamlesi önerisi (Codex Sol).** 52 motion'ı yeniden yazmak yerine önce **6 kliplik
   canary**: 6 motion yeni tarifle yazılsın, sen bas, AGY tarif etsin, sen PASS/REJECT ver.
   Tutmazsa 52 klip yanmadan hipotez düzelir.

---

## 6. CODEX HESABI — istediğin rakam

| # | Model | Muhakeme | İş | Çıktı |
|---|---|---|---|---|
| 1 | **GPT-5.6 Sol** | `xhigh` | Strateji: 1→100 merdiveni + tezimi çürüt | 255 satır |
| 2 | **GPT-5.6 Terra** | `high` | İşletim sistemi denetimi (çit sayımı, yasa mimarisi) | 110 satır |
| 3 | **GPT-5.6 Terra** | `high` | Motor stratejisi (NB2 vs GPT Image 2, motion) | 131 satır |

**Toplam 3 Codex çağrısı** — 1 Sol (ağır teşhis) + 2 Terra (yarı maliyet, geniş denetim).
Luna kullanmadım; iş mekanik değildi. Ayrıca **1 Opus 5 ajanı** (sistem taraması, 10 tavsiye —
43 araç çağrısı, 692 saniye). ⚠ Codex CLI token sayısı basmıyor; sana çağrı sayısı ve model
veriyorum, uydurma rakam vermiyorum.

**Ham konuşmanın tamamı** (soru + cevap, birebir): `artifacts/gece-2026-08-04/`
- `01-SORU/CEVAP-strateji-SOL` · `02-...-isletim-TERRA` · `03-...-motor-TERRA`

---

## 7. CODEX BENİ NEREDE ÇÜRÜTTÜ — dürüstlük payı

- **"Plastik teşhisi hiç tüketilmedi" dedim → yanlış.** `islak-goz` olarak kısmen tüketilmişti;
  eksik olan ikinci yarısıydı. (Bu gece o yarıyı kurdum.)
- **"107 adayı seçilebilir listeye indirelim" fikrim → zaten denenmiş ve batmış.**
  `ONAY-KUYRUGU-2026-08-03.md`: "13 satırlık bütçe" için yazılan dosya **461 satır**.
  Okumayı azaltmak için yazılan şey okumayı artırmış. Doğru yön: **kuyruk emekli olsun,
  ders yalnız KARAR ANINDA görünsün** — bu gece yaptığım tam olarak bu.
- **İki sınıflı ders modelim (ölçülmüş/zevk) → dört sınıf olmalı:**
  GÖZLEM · HİPOTEZ · SÖZLEŞME · ZEVK. Benimki üçünü tek torbaya koyuyormuş.

**Codex'in en cesur teşhisi** — gecenin en değerli cümlesi:
> *"MAMILAS'ın asıl sorunu öğrenme belleği değil; **pozitif amaç fonksiyonunun olmaması.**
> Sistem 'iyi film' üretmek için değil, ölçülmüş hatalara yakalanmamak için optimize olmuş.
> Çit fazla olduğu için değil — **çit yönetmenin yerine geçtiği için.**"*

Bu, senin "tarlada çit çektik" teşhisinin **nedenini** söylüyor.

---

## 8. SIRADAKİ TEK ADIM

Sen uyanınca **tek soru**: yukarıdaki 3 karardan hangisini önce açıyoruz?
Üretim tarafında değişen bir şey yok — Destek ve Hareket'in 52 klibi hâlâ seni bekliyor.
