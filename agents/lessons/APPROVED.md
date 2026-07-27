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

<!-- İlk gerçek dersler biten projelerin closeout'undan Mami onayıyla gelecek. -->
