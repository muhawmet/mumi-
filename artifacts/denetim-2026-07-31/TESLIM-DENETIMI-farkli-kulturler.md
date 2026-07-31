# TESLİM DENETİMİ — 5.1.2 Farklı Kültürler (makine ölçümü, 2026-07-31)

AGY headless izin kapısına takıldığı için bu denetim deterministik olarak koşuldu.
Sorular AGY için yazılmıştı; hepsi makineyle kesin ölçülebilir olduğu için sonuç daha güvenilir.

```
## 1. SAYIM
  SESLENDIRME cümle : 53
  EDIT-PLAN satır   : 53
  PROMPTLAR blok    : 53
  MOTION dosya      : 46
  resimler görsel   : 53
  eksik görsel      : YOK
  eksik edit satırı : YOK

## 2. CÜMLE EŞLEŞMESİ — birebir mi
  EDIT-PLAN ↔ SESLENDIRME: ✅ 53/53 birebir
  MOTION ↔ SESLENDIRME: ✅ 46/46 birebir

## 3. MOTION KAPSAMI
  motion YOK        : K3 K8 K12 K17 K32 K46 K49
  KALAN-URETIM'de   : K3 K8 K12 K17 K29 K32 K46 K49
  motion yok ama listede DEĞİL : YOK
  listede ama motion VAR       : K29  ← opsiyonel olanlar burada beklenir

## 4. K02 ↔ K49 KAPANIŞ KİLİDİ
  MOTION/02.txt : ✅ kamera SIFIR genlikte kilitli
  MOTION/49.txt : ⏳ yok — K49 henüz basılmadı, motion yazılmadı (doğru davranış)

## 5. SESSİZ YALAN TARAMASI
  (üstte hiçbir satır yoksa tarama temiz)
```
