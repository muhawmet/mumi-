# MAMILAS — Mami-onaylı ders bankası

Bu dosyaya YALNIZ Mami yazar (veya Mami'nin açık onayıyla yazılır). Otomatik promote YOK:
closeout'un `lessonCandidates[]` adayları buraya kendiliğinden GİRMEZ — çöp ders sistemi zehirler.

**Satır biçimi (parse edilir — `src/core/lessonBank.ts`):**

```
- <tek satır ders> — kaynak: <proje adı> · <YYYY-AA-GG> · Mami onayı
```

Bankadaki son 20 ders, runner launch anında author (image/motion) CONTEXT.json'una
`approvedLessons` olarak girer (hash-dışı katman — command'leri stale etmez). Dersler
engine-aware defaults gibidir: çelişkide Mami'nin canlı direktifi kazanır.

<!-- İlk gerçek dersler biten projelerin closeout'undan Mami onayıyla gelecek. -->
