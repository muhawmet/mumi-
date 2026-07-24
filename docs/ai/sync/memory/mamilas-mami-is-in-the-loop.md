---
name: mamilas-mami-is-in-the-loop
description: "MAMILAS otonom bir sistem DEĞİL — Mami döngüde. Bir bulguyu kapatmadan önce \"Mami bunu bir cümleyle düzeltir mi?\" diye sor. Aşırı mühendislik tuzağı."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e848cc8c-0163-4aa4-90b7-47ca221a0d2a
---

**Mami DÖNGÜDE. Otonom bir sistem kurmuyoruz.** API yok, olmayacak — o elle müdahale ediyor, prompt'a bakıyor, düzeltiyor.

> *"Buradaki her şeyde ben varım. Bu sistem otomasyon kurmak için değil, **EN İYİYİ ÜRETMEK** için."* (2026-07-14)

**Bu cümle kapıların AMACINI değiştirir.** Kapı, Mami'nin yerine karar vermek için değil —
**Mami'nin GÖREMEYECEĞİ şeyi yakalamak** için vardır. Her kapı önerisinde tek soru:

> **"Mami bunu gözüyle yakalar mı?"**
> **Yakalarsa → kapı YOK, ona GÖSTER.** Yakalayamazsa → kapı VAR.

Aynısı heyet/ajan için: heyet bir **onay makamı değil.** İşi, Mami prompt'u görmeden önce onu daha iyi
hâle getirmek — ve düşüncesini `ledger/`'a **açık yazmak** ki Mami okuyup *"burada yanılmışsın"* diyebilsin.
**Kararını gizleyen değil, kararını GÖSTEREN sistem.**

Gece-5'te bunu unuttum ve saatlerce **onun bir cümleyle çözdüğü şeyleri kodla çözmeye** çalıştım. Mami'nin sözü:

> *"Ben Claude'a atsam, hepsini gündüz yapsa, '4-5'ini gece yap' derim zaten. Ne bunların hepsi amına koyayım, ne yapıyorsun sen günlerdir?"*

**AYRIM (bir bulguyu kapatmadan ÖNCE sor):**

> **"Bu, Mami'nin PROMPT'A BAKARAK bir cümleyle düzeltebileceği bir şey mi?"**

- **EVET → KAPATMA.** Rapora "Mami'nin gözüne bırakıldı" diye not düş, geç.
  *(rim ışığı yanlış dünyada · ışık varyantını beğenmedi · kadraj monoton · saat fazı yanlış)*
- **HAYIR — üretimden ÖNCE, SESSİZCE oluyor → KAPAT.**
  *(markanın kendi reklamından silinmesi · eser adının motora sızması · `"17."` diye bir sahne doğması · path'in 2D dünyada 3D istemesi · kaynağın açık emrinin ezilmesi · frameGate'in doğru kareyi reddetmesi)*

**KRİTİK KARIŞTIRMA:** *"ajan bu brief'e itaat edemiyor"* ≠ *"Mami bu prompt'u kullanamaz."*
Denetçi ajan tam otonom bir robot gibi konuşur ve HER çelişkiyi bir bug olarak raporlar. Onun her itirazı bir bug DEĞİLDİR. Ajanın raporundaki **dramı da doğrulamadan aktarma** — gece-5'te "ödenmiş Kling kredisi giden kare" dedim, yanlıştı; frame gate onu zaten yakalardı.

**Why:** Mami'nin zamanı ve usage'ı sınırlı. Onun 2 saniyede yaptığı şeyi kodla çözmek, gerçekten sessizce bozulan şeyleri bulmaktan çalınan zamandır.
**How to apply:** Her denetim bulgusunu bu süzgeçten geçir. İlgili: [[mamilas-simulation-loop]]
