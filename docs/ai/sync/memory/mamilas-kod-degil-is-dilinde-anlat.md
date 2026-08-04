---
name: mamilas-kod-degil-is-dilinde-anlat
description: "Mami programcı değil ve kör izin veriyor — bu yüzden ciddi kararlar KOD dilinde değil İŞ dilinde anlatılır: ne değişecek, neyi kazandırır, neyi bozabilir."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 20457d74-46f4-4a3a-be00-dd8de2edb87a
  modified: 2026-08-03T18:44:52.823Z
---

Mami, 2026-08-03: *"rica etsem benim code cehaletimi anlayıp ona göre adapte olsan — ciddi
karar verilirken güzelce anlat, ben sana kör izin veriyorum zaten."*

**Why:** Kör izin verildiği için açıklamanın yükü tamamen ajanda. `lintBlock`, `parseBlocks`,
`head` alanı gibi terimler Mami için karar bilgisi taşımıyor; o cümleyi okuyunca onaylayacak
bir şey göremiyor ve **kararı veremiyor, yalnız güveniyor.** Güvenle verilen izin bir karar
değildir. Ayrıca bu bir yetersizlik değil iş bölümü: Mami sistemi programcı olmadan kurdu,
onun uzmanlığı kare ve kurgu — teknik karar tercümesi ajanın görevi.

**How to apply:** Ciddi bir karar (kod değişikliği, akış değişikliği, yasa değişikliği,
kredi/klip yakan iş) anlatılırken üç satır, hepsi iş dilinde:
1. **NE OLUYOR** — sistemin hangi yeteneği değişiyor, günlük işte ne fark eder
2. **NE KAZANDIRIR** — mümkünse sayıyla (kaç kare, kaç klip, kaç revize)
3. **NEYİ BOZABİLİR** — geri dönüşü var mı, yoksa ne kaybederiz

Dosya adı ve satır numarası **kanıt olarak** kalır ama cümlenin konusu olamaz — bunlar
[[mamilas-makro-kurali]]'nın teknik karar hâlidir. "Fonksiyon X, Y'yi Z'ye geçirmiyor" değil;
**"denetim aracı, karenin cümleye uyup uymadığına hiç bakmıyor — bugün 16 kusurun 12'sini
bu yüzden kaçırdı."**

İlgili: [[mamilas-serbest-birak-yetkisi]] · [[mamilas-makro-kurali]] · [[mamilas-mami-kisisel]]
