---
name: mamilas-mami-is-in-the-loop
description: "MAMILAS otonom bir sistem DEĞİL — Mami döngüde. Bir bulguyu kapatmadan önce \"Mami bunu bir cümleyle düzeltir mi?\" diye sor. Aşırı mühendislik tuzağı."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e848cc8c-0163-4aa4-90b7-47ca221a0d2a
  modified: 2026-07-29T09:08:18.562Z
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

## İSTİŞARE — iş almak "hemen yapmak" demek değil (2026-07-29)

> *"Sana ne iş yap desem direkt harıl harıl vermeye çalışıyorsun. **İstişare etsen zaten
> öğreneceksin işi.** 1000 video yaptım ben, deneyimim var; sende de zekâ var."*

Ölçülmüş örnek, aynı gün: Üreme kurgusunda K06'nın klibi VO'suna yetmedi. Ben yavaşlatma
matematiğiyle uğraştım, %69'a indirdim, sonra nefes kısarak %80'e çektim ve raporda
"bu bir üretim kararı" diye **bir satır not düştüm**. Mami'nin cevabı: *"kısa oldu video
dediğinde aynı videoyu **extendli üretebilirim** ben."* Yani tek cümlelik bir soru saatlerce
uğraşı bitirecekti — üstelik [[mamilas-uzatilmis-klip-karari]] bunu zaten yazıyordu ve ben
onu commit mesajında **alıntılamıştım.** Bilgi vardı; eksik olan SORMAKtı.

**Ayrım net:** rapora "bu Mami'nin kararı" yazmak istişare DEĞİLDİR — o, kararı sıraya koyup
işi sürdürmektir. İstişare, **işi durdurup sormaktır.**

**Kural:** İş geldiğinde ilk hamle üretmek değil, **birlikte düşünmek.** Özellikle şu üç anda dur ve sor:
1. Bir kısıtı teknikle aşmaya çalışırken (yavaşlatma, doldurma, telafi) — *kısıt gerçek mi, yoksa
   Mami bir üretimle kaldırır mı?*
2. Bir şeyi "kabul edilebilir" ilan etmeden önce — *o eşiği koyan ben miyim, o mu?*
3. Yeni bir işe başlarken — *nasıl yapılacağını 1000 videoluk deneyim mi söylemeli, benim varsayımım mı?*

**Why:** Mami'nin elinde 1000 videoluk üretim deneyimi var; bende hız ve analiz var. Sormadan
üretmek onun deneyimini masada bırakıyor ve benim aynı dersi tekrar tekrar keşfetmeme yol açıyor.
İstişare bir gecikme değil, **öğrenme kanalı** — sorulmadıkça öğrenilmiyor.

**How to apply:** Her denetim bulgusunu yukarıdaki süzgeçten geçir. İş aldığında önce bir tur
konuş: ne yapacağını, nerede takılacağını, hangi varsayımı yaptığını söyle — sonra üret.
İlgili: [[mamilas-uzatilmis-klip-karari]] · [[mamilas-bul-sec-onar]] · [[mamilas-makro-kurali]]
