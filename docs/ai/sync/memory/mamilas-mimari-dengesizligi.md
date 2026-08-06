---
name: mamilas-mimari-dengesizligi
description: "Sistem enerjisinin %85'i prompt metnine kural koymakta, %15'i imalatta; darboğaz yazma değil BASIM — ölçüldü 2026-08-05"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2edc1db9-9f2b-4194-a1f2-08d11d8b4443
  modified: 2026-08-05T18:49:34.565Z
---

MAMILAS'ın enerjisi yanlış yerde. AGY mimari taraması (2026-08-05, 67 aktif dosya, 20.726 satır):

| aşama | satır | pay |
|---|---|---|
| prompt YAZMA + DENETİM + ÖĞRENME/kütük | **17.680** | **%85.3** |
| kare BASMA + klip ÜRETİM + KURGU | **3.046** | **%14.7** |

**Darboğaz yazmak değil.** Yazma zaten hızlı: 52 kare motion, 6 paralel ajan, **8 dakika**
(×4.9). Buna karşılık **233 kare yazılı / 0 basılı** (`basim-kuyrugu.mjs:5-7`), video başına
**~700 UI el hareketi**, ve 52 karenin **39'u** en az bir kez revize edilmiş.

**Ölçen, önlemesi gereken kusuru üretiyor.** Zincir: linter İngilizce ifade zorunlu kılar →
metnin %60'ı sabit kalıp olur (`LIGHT AND PALETTE` 56 blokta tek sürüm, 52 KB tekrar) → kalıp
kare gövdesiyle çelişir → motor kendi varsayılanına düşer → plastik kare. İki uçtan kanıt:
`Değerler` lint 34/34 temiz → Mami *"hepsi plastik bozuk oyun hamuru"* (revize %73.5);
altın standart `Hücre` negatiflerinin en uzun ortak son eki **1 karakter**.

**Kalite kaybının ikisi de metinde değil** — biri KURGUDA (AGY şaheseri izledi: 8 kesimde
~2.1sn ölü hava, 6 planda ekran donuyor), biri KAREDEKİ FİKİRDE (kavram bir nesneye
indirgeniyor: masada duran kil kafa heykeli). Metni ölçen ~30 script bunların hiçbirini
göremiyor.

**Süreklilik revize yükünün ~%33'ü** ve yeri belli: **K01–K08 açılış kuşağında** yoğunlaşıyor
(oran 1.56) ve **%41'i ardışık 3-5 karelik zincirlerin içinde** — paket sınırında DEĞİL
(o hipotez çürütüldü, oran 1.06).

**Why:** Ölçülebilen tek yüzey metindi, o yüzden herkes metne kural yazdı. Yanlış yüzeyi
ölçmek, doğru yüzeyi ölçmemenin bahanesi oldu — kural yığılmasının kök nedeni bu.

**How to apply:** Yeni kural yazmadan önce sor: *bu, metni mi ölçüyor yoksa çıktıyı mı?*
Metni ölçüyorsa ve karşılığında bir kare/klip kanıtı yoksa yazma. Hız arıyorsan yazma
tarafına dokunma — basıma ve revizeye bak. Süreklilik arıyorsan K01–K08'e ve ardışık
zincirlere bak. Bkz. [[mamilas-yerlesim-varsayimi-kusuru]] · [[mamilas-duyu-ve-ikinci-goz-yetkisi]] ·
[[mamilas-uretim-akisi]]. Plan: `~/.claude/plans/kanka-plan-moduna-ge-memoized-haven.md`.
