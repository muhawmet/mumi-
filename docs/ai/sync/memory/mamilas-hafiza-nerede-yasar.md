---
name: mamilas-hafiza-nerede-yasar
description: Bir bilgi hangi organa yazılırsa yaşar — beş kayıt yeri ve her birinin işi; yanlış organa yazılan bilgi sessizce ölür
metadata: 
  node_type: memory
  type: project
  originSessionId: e441bce1-7ec1-4fba-82da-71f254aaa12f
  modified: 2026-08-07T10:35:42.937Z
---

**2026-08-07'de ölçülerek kuruldu.** O gün üretilen bilginin bir kısmı yanlış organa yazıldı ve
neredeyse kayboldu: **kare kimlikleri yalnız sohbette duruyordu** ve sohbet arşivlenseydi yeni
oturum 54 PNG'yi tek tek yeniden yüklemek zorunda kalacaktı. Bu repoda sekiz kez ölçülen kusurun
aynısı: *bilgi bir yerde var sanılıyor, olduğu yer kaybolan yer.*

## Beş organ — hangi bilgi nereye

| Organ | Ne yaşar | Neden orası |
|---|---|---|
| `artifacts/is-emri/<proje>.json` | **Shot seviyesinde durum** — hangi kare basıldı, kaçıncı deneme, kaç kredi, hangi kusur | Otonomluğun tek şartı. `is-emri.mjs devral` yeni oturumu tek komutla yerine oturtur |
| `artifacts/current-work.json` | **Proje seviyesinde durum** — aktif iş, faz, biten, sıradaki TEK adım | SessionStart hook'u bunu basar; sohbet hafızasıyla çelişirse KAYIT kazanır |
| `artifacts/kare-kimlikleri.json` | Karelerin motor kimlikleri + basılan kliplerin hükmü + motion reçetesi | Motion basarken start-frame budur; olmazsa her kare yeniden yüklenir |
| `agents/lessons/CANDIDATES-*.md` | **Sistemin YETENEĞİNİ değiştiren ders** | Üretim yalnız bankayı okur (director · enzim · yasa). Bankaya girmeyen ders üretime hiç dönmez |
| `docs/ai/MUST-DO-KUYRUK.md` | Karar kuyruğu, ölçülmemiş yüzeyler, açık sorular | Otorite değil; her madde ya yapılır ya Mami düşürür |

Bunların dışında: **yasa** `agents/PROMPT-YASASI.md` ve proje prompt dosyasının başındaki
SAHNE YASASI bloğu — kare yazılırken gerçekten okunan yer orasıdır.

## 🔴 Bankaya ne GİRMEZ

Mami (2026-08-07): *"sen ürettin, karışmadım bile, çok derslik bir şey de olmadı."*
O gün ilk hasat 13 maddeydi; yarısı **ajanın kendi yazım hataları ve alet kusurlarıydı**.
Onların yeri banka değil **kodun içi** — düzeltilir, teste çivilenir, kapanır.
Bankaya yalnız *"sistem artık şunu yapabiliyor/yapamıyor"* diyen madde girer.

⚠ Banka tavanı dar: **7 onaylı / 115 aday**, 13 satır yer kalmış. Taşan en eskiyi sessizce
düşürüyor — yani bankaya çöp atmak, iyi bir dersi öldürmek demek.

## Yanlış organa yazmanın belirtisi

Bir bilgiyi yazdıktan sonra şunu sor: **"yeni bir oturum bunu nereden bulacak?"**
Cevap "sohbetten" ise o bilgi ölmüştür. Cevap "hafızadan" ise zayıftır — hafıza
tamamlayıcıdır, otorite değil. Cevap bir dosya adıysa yaşıyordur.

Bkz. [[mamilas-tasima-yasasi]] · [[mamilas-os-bes-organ]] · [[mamilas-aktif-uretim-durumu]]
