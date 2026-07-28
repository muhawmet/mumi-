// MAMILAS — senkron KARAR TABLOSU (saf fonksiyon, dosya sistemine dokunmaz)
//
// Ayrı dosyada olmasının tek sebebi: bu tablo test edilebilsin. `claude-sync.mjs`
// çalıştırılabilir bir script (üst seviyede iş yapar), import edilirse senkronu koşturur.
// Karar mantığı buraya alınınca duvar (`src/core/claudeSync.test.ts`) onu import edip
// dosya sistemine hiç dokunmadan sınayabiliyor.
//
// Kurulan yasa: **yön tahmin edilmez, silme yoktur.** İki taraf da değiştiyse cevap
// "çatışma"dır — script'in hangi sürümün doğru olduğuna karar vermeye yetkisi yok.

/**
 * @param {string|null} live  canlı taraftaki içerik hash'i (yoksa null)
 * @param {string|null} repo  repo tarafındaki içerik hash'i (yoksa null)
 * @param {string|null} base  manifest'teki son ortak taban (yoksa null)
 * @returns {'yok'|'esit'|'cek'|'it'|'geriYukleCanli'|'geriYukleRepo'|'catisma'|'catismaSilme'}
 */
export const decide = (live, repo, base) => {
  if (!live && !repo) return 'yok';
  if (live && repo && live === repo) return 'esit';

  // Tek tarafta var. Taban yoksa dosya YENİ doğmuştur → karşı tarafa taşınır.
  // Taban varsa o taraftan DÜŞMÜŞTÜR; düşen geri konur, asla karşıdan silinmez —
  // 2026-07-28'de repo'da olup canlıda olmayan 9 hafızayı "silinmiş" sayan eski
  // script tam bu satırda ölüyor.
  //
  // 🔴 AMA: **silme de bir değişikliktir** (Codex/gpt-5.6-sol itirazı, 2026-07-28).
  // Bir taraf sildiyse VE karşı taraf tabandan farklıysa, iki taraf da değişmiş
  // demektir — bu çatışmadır. Sessizce geri yüklemek, Mami'nin bilerek sildiği bir
  // dosyayı BAŞKA bir içerikle diriltir ve bunu "geri kondu" diye rapor eder.
  // Kayıp olmaz ama script kendi yasasını çiğner: yön tahmin edilmez.
  if (!live && repo) {
    if (!base) return 'cek';
    return repo === base ? 'geriYukleCanli' : 'catismaSilme';
  }
  if (live && !repo) {
    if (!base) return 'it';
    return live === base ? 'geriYukleRepo' : 'catismaSilme';
  }

  // İkisi de var ve farklı — taban kimin değişmediğini söyler.
  if (base && repo === base) return 'it';   // yalnız canlı değişti
  if (base && live === base) return 'cek';  // yalnız repo değişti
  return 'catisma';                          // ikisi de değişti ya da taban yok
};

/**
 * İçerik hash'i — CRLF normalize. İki makine aynı dosyayı farklı sanmasın:
 * Windows CRLF, Mac LF yazar; normalize edilmezse her koşuda sonsuz it/çek döngüsü olur.
 * İkili dosyalar (NUL baytı içerenler) normalize EDİLMEZ, ham hash'lenir.
 * @param {Buffer} buf
 * @param {(data: string|Buffer) => string} digest  hash üreteci (test edilebilirlik için dışarıdan)
 */
export const icerikHash = (buf, digest) => {
  const ikili = buf.includes(0);
  return digest(ikili ? buf : buf.toString('utf8').replace(/\r\n/g, '\n'));
};
