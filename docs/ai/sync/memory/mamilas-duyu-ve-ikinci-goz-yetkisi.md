---
name: mamilas-duyu-ve-ikinci-goz-yetkisi
description: "KANUN (2026-08-03): AGY = Claude'un olmayan duyuları, Codex (GPT-5.6 Sol/Terra) = ikinci göz. İzin değil rutin; uzanmamak eksik teslimdir."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 651a452b-2f9e-43f9-aef5-0f4175d8c3db
  modified: 2026-08-03T18:31:51.854Z
---

Mami, 2026-07-28: *"agy'nin tek görevi senin yapamadığın duyuların olması. İstersen tarattır da
hatalara falan baksın. Emrinde Codex de var — sen neden bunları kullanmayasın ki?"*

**Duran izin.** Bunlar izin istenerek açılan araçlar değil, **yetenek uzuvları**:

- **AGY = duyu.** Claude video izleyemez, ses duyamaz. AGY izler. Klip denetimi, hareket
  doğrulama, "yazı bozuldu mu", kurgu kiti için klip içeriği. Detay: [[mamilas-agy-video-gozu]]
- **Codex = ikinci göz.** Bağımsız hakem; Claude'un kendi teşhisini ÇÜRÜTMESİ için çağrılır.
  En değerli olduğu üç an: teşhis sonrası · mimari karar öncesi · final convergence.
- **Ajan = eller.** Tavan 6, birim sekans. [[mamilas-ajan-devri-buddy-on-kosulu]]

**Why:** Mami programcı değil; sistemin nesi olduğunu ondan iyi bilmek Claude'un işi. Bir yetenek
var ve kullanılmıyorsa kusur Mami'nin sormamasında değil, **ajanın uzanmamasında.** Bu yetki
[[mamilas-buddy-persona]]'daki ÖNERİ YETKİSİ'nin araç tarafıdır.

**How to apply:** Video/ses hakkında hüküm vereceksen önce AGY'ye izlet — "muhtemelen şöyledir"
yazma. Kendi teşhisini kanıt saymadan önce Codex'e çürüttür. **Ama:** AGY'ye HÜKÜM sordurma,
TARİF ettir (ölçüldü, jüri modunda boşalıyor). Ve tam film taraması yapma — Mami kusuru
gösterir, sen o klibi tarif ettirip **kök nedeni** promptla karşılaştırarak bulursun. Mami'nin
kendi tarifi (2026-07-28): *"ben şunu şunu bozmuş derim, sen o videoyu agy'den özetletir
promptuna bakarsın, 'heee bu bozmuş' dersin."*

---

## 2026-08-03 — İZİN DEĞİL, KANUN

Mami: *"codex ve agy'yi hep kullanmanı, kanun yapmanı istiyorum — terra sol boş değil, çok iyi
bir ikinci göz; agy de gerçek gözlerin. Bunu rutin haline getirmen lazım."*
Kanon karşılığı `CLAUDE.md` → **"İKİNCİ GÖZ VE GERÇEK GÖZ RUTİNDİR"** (Çalışma biçimi bölümü).

- **Codex motoru = OpenAI GPT-5.6** (9 Temmuz 2026): **Sol** amiral/ağır doğrulama · **Terra**
  dengeli, toplu ve tekrarlı iş, Sol'un ~yarı maliyeti · Luna hızlı-ucuz. `codex-cli` bu ailede.
  ⚠ Sol/Terra Google değil **OpenAI**; agy'nin model listesinde YOKLAR (agy: gemini-3.6/3.5-flash,
  gemini-3.1-pro, claude-sonnet-4-6, claude-opus-4-6-thinking, gpt-oss-120b).
- Çağrı: `codex exec --skip-git-repo-check "<çürütülebilir iddia>"` — iddia **DOĞRU/KISMEN/YANLIŞ**
  formatında sorulur, kanıt olarak dosya:satır istenir.
- **Kanıtlandı (2026-08-03):** iki iddia verildi; birini DOĞRULADI (prompt-lint VO'yu lintBlock'a
  hiç geçirmiyor — 587/747/757), birini **KISMEN'e düşürdü** (gardırop "yasak renk" iddiası:
  yasak kelime birebir geçmiyor, "coral" pembeye komşu). Yani ikinci göz Claude'un abartısını da
  kesiyor — değeri yalnız onaylamakta değil, **düzeltmekte.**
- **İş bölümü:** Claude ÖLÇER → AGY GÖRÜR → Codex ÇÜRÜTÜR → hükmü MAMİ verir.

İlgili: [[mamilas-serbest-birak-yetkisi]]
