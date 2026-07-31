# MAMILAS — Mami-onaylı ders bankası

Bu dosyaya YALNIZ Mami yazar (veya Mami'nin açık onayıyla yazılır). Otomatik promote YOK:
closeout'un `lessonCandidates[]` adayları buraya kendiliğinden GİRMEZ — çöp ders sistemi zehirler.

**Satır biçimi (parse edilir — `src/core/lessonBank.ts`):**

```
- <tek satır ders> — kaynak: <proje adı> · <YYYY-AA-GG> · Mami onayı
```

**YENİ DERS DOSYANIN SONUNA EKLENİR.** Tavan aşılınca düşen, dosyanın **üstündeki** satırlardır
(`slice(-20)` konumsaldır — `date` alanı parse edilir ama sıralamada kullanılmaz). Yeniyi üste
yazarsan 20'yi geçtiğin anda **en yeni dersler** sessizce düşer.

Bankadaki son 20 ders, runner launch anında author (image/motion) CONTEXT.json'una
`approvedLessons` olarak girer (hash-dışı katman — command'leri stale etmez). Dersler
engine-aware defaults gibidir: çelişkide Mami'nin canlı direktifi kazanır.
Aynı bankayı Konuşmalı Yönetmen de okur (`.claude/skills/mamilas-director`), kilit seviyesindeki
satırları enzim okur — yani banka runner'a değil, **üretimin kendisine** bağlıdır.

## Onaylı dersler

- Sahneyi tasarlamak, üstündeki YAZIYI da tasarlamaktır: kadraja afiş, tabela, pano ya da etiket koyuyorsan o yüzeyin Türkçe metnini de sen yazarsın; boş bırakılan her yüzeye motor İngilizce uyduruyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Bağlam Türkiye'dir: hedef kitle Türkiye'de bir okul olduğuna göre kadrajdaki her okunur şey Türkçedir — tabela, kadran, etiket, defter, bayrak dahil — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Arka plandaki her yazı yüzeyi (tabela, poster, pano) yumuşak-bulanık ve Türkçe ya da BOŞ kalır; kare-özel yazılmazsa motor İngilizce ya da uydurma harf dizisi basıyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Ölçü aletinin kadranı da Türkçedir (pusula K/D/G/B, gösterge birimi Türkçe); TEXT slotu yalnız kahraman yazıyı kapsayınca alet üstündeki harfler İngilizce çıkıyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Bayrak, arma ve rozet YAZI slotunun kapsamındadır: mekânda bayrak direği varsa Türk bayrağı açıkça yazılır, yoksa motor Amerikan bayrağı basıyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Her nesne yüzeyine yaslanır ve yumuşak temas gölgesi bırakır; slot düşünce nesne havada yüzüyor — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
- Dünya malzeme/palet yasası bu kareyi taşımadı — kusur dünyada, kodda değil — kaynak: 5. Sınıf - Birlikte Daha Güçlüyüz · 2026-07-31 · Mami onayı
