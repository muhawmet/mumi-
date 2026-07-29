# DERS ADAYI — MOTION'DA TEMPO YOK: 34 SHOT AYNI HIZDA

**Kaynak:** 6. Sınıf — Bizi Bir Arada Tutan Değerler (6.1.2), 2026-07-29.
**Mami'nin sorusu:** *"Yani motionlara baktın mı prompt olarak, belki motionlar kötüdür."*
Bakıldı — 34 kamera cümlesinin hepsi metinden ölçüldü. **Mami haklı.**

**Mami'nin talebi neydi:** *"motionlar pixar filmi gibi olsun, sahneler çok dull kamerayla müzikle
seslendirmeyle kurtarılır."*

---

## Ölçüm — `Camera:` ile `Frame lock:` arası, 34/34

| ne | kaç kare |
|---|---|
| `slow` VEYA `eased` VEYA `locked` | **34 / 34** |
| `eased` | 29 |
| `slow` | 23 |
| `near-locked` / `almost locked` / `essentially locked` | 9 |
| **kararlı vuruş sözcüğü** (`fast`·`snap`·`whip`·`quick`·`sharp`·`accelerate`·`sudden`·`lands`) | **2 / 34** |
| rack focus / odak kaydırma | 9 |

Ölçüm notu: ilk sayım kirliydi — `Camera:` satırı paragraf sonuna kadar gidip `Frame lock:`
cümlesini de yutuyordu ve "kararlı vuruş" 34/34 çıkmıştı. Sınır açıkça verilince gerçek sayı **2**.

**Repertuar üç hareketten oluşuyor:** yavaş içeri (dolly in) · yavaş yukarı-aşağı (boom) ·
yavaş yana (lateral track). Kesimden kesime **tempo hiç değişmiyor.**

## Mekanizma — farkında olmadan yapılan takas

AGY'nin temiz bulduğu klipler tam olarak kameranın kıpırdamadığı klipler (K19 · K21 · K26,
"near-locked"). Kameranın geniş hareket ettiği yerde morphing çıktı (yana kayan/geri çekilen
5 klibin 5'inde arka planda figür doğdu).

Yani motion yazarı **morphing riskini düşürmek için hareketi kıstı** ve bedeli *"dull"* olarak
ödendi. **Asıl kusur takasın kendisi değil, takasın Mami'ye söylenmemesi.** Mami "kamerayla
kurtar" derken teknik güvenlik satın alındığını bilmiyordu.

## Yanlış çözüm / doğru çözüm

**Yanlış:** "kamerayı daha çok oynat" — ölçüm bunun morphing'i geri getirdiğini gösteriyor.

**Doğru:** Pixar'da enerji genelde kadrajın **içindeki aksiyondan** ve shot başına **TEK kararlı
vuruştan** gelir; kamera çoğu shot'ta sakindir ama **kesimden kesime tempo değişir.** Ritim
varyasyondan doğar. Bu sette 34 shot aynı tempoda — yani sorun hareketin azlığı değil,
**kontrastın sıfır olması.**

Teknik ayak da buna bağlanıyor: hareket genişledikçe arka plandaki ikincil figür eriyor. O yüzden
kararlı vuruş **derinliği kalabalık olmayan** kadrajda ya da **insansız** kadrajda yapılır.

## Yasa teklifi — Mami onayı bekliyor

> **Motion'da `slow` / `eased` varsayılan olamaz.** Her sekansta en az bir shot **kararlı bir
> vuruş** taşır, kesimler arası tempo değişir — ve o vuruş, arka planı kalabalık olmayan kadrajda
> yapılır.

*Lint'le ölçülebilir hâli:* bir sekansın tüm karelerinde `slow|eased|locked` varsa ve hiçbirinde
kararlı-vuruş sözcüğü yoksa → **SARI** (tempo tekdüzeliği). Bu videoda 34/34 SARI verirdi.

---

**Bu dosya ADAYDIR.** Yasa cümlesi Mami'nin onayına sunuldu, `APPROVED.md`'ye kendiliğinden
girmez. Mami'nin bu katmandaki ham hükmü `PROJECT-LOOT.json` → `subjectiveVerdict.motion`.
