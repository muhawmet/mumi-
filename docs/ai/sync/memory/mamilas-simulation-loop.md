---
name: mamilas-simulation-loop
description: "MAMILAS'ın ASIL denetim yöntemi — fabrikayı fabrikaya değil, onu KULLANAN ajana sor. Mami bu döngünün \"kusur yok\" diyene kadar sürmesini istiyor (standing order)."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e848cc8c-0163-4aa4-90b7-47ca221a0d2a
---

**Fabrikayı fabrikaya sorarak denetlemek işe yaramıyor.** Kodu okuyan denetim 13 bulgu çıkardı — hepsi gerçekti — ve **hiçbiri** asıl kanı akıtanları bulamadı: Path'in 2D dünyada 3D istemesi · doğru Tesla karesinin kendi koruma kapısında FAIL olması · gecenin ikinci cümlede bitmesi · negatiflerin ANLAM hatasını hiç kovalamaması · whiteboard'a kendi okunu yasaklamamız · "uygulanmış gibi görünüp hiçbir şey yapmayan" fix. **Hepsini, brief'e İTAAT ETMEYE ÇALIŞAN ajan buldu.**

**DÖNGÜ (Mami'nin standing order'ı — "kusur yok, harikayı yarattık" diyene kadar durma):**
1. `npx tsx scripts/faz5-pilot.ts` → `~/Desktop/FAZ5-PILOT/` (her register'dan paket)
2. Paketleri **İKİ BAĞIMSIZ AJANA** ver, tek soru: **"Bu brief'ten prompt yazmak ZORUNDASIN. Uçtan uca, hiçbir parçasını kırmadan itaat edebiliyor musun?"**
   - **Codex `gpt-5.6-sol` = DIŞTAN DENETÇİ** (Mami'nin kararı). `codex exec --sandbox workspace-write --skip-git-repo-check -c model=gpt-5.6-sol -c model_reasoning_effort=high` — repo'ya DOKUNMAZ, sadece `~/Desktop/FAZ5-PILOT/` okur.
   - Claude subagent (opus) = ikinci göz, ayrı dosyaya yazar.
3. Sorular sadece bunlar: (a) iki parça aynı piksel hakkında ZIT şey mi emrediyor? (b) girdisini VERMEDİĞİ bir şeyi mi emrediyor? (c) kaynak, dünyanın fiziksel olarak yapamayacağını mı istiyor? (d) başka register'dan şablon artığı var mı?
4. Her bulguyu kapat → **`faz1_triple.test.ts`'e kilitle** → gerçek çıktıyla GÖZLE doğrula → tekrar sor.
5. **İKİSİ DE "TEMİZ" DEMEDEN "kapandı" DEME.** Bugün 3 kez "kapandı" dedim, 3 kez ajan çürüttü.

**Görev tarifinde ŞART:** "ZATEN KAPANDI" listesini ver (yoksa eski bulguyu tekrar getirir, bir gün yakar). "Yanlış bir TEMİZ bir üretim günü kaybettirir; tekrarlanan eski bir bulgu da bir gün kaybettirir."

**Why:** Kodu okuyan göz, kodun YAPISINI ölçer. Ajan, kodun ÇIKTISINA itaat etmeye çalışır — ve itaat edemediği yer, üretim gününde kötü kare demektir.
**How to apply:** Her büyük turdan sonra bu döngüyü koş. Tur bitti demek = iki ajan da TEMİZ dedi demek. İlgili: [[mamilas-generation-routine]]
