/**
 * BRAIN M7 — Mami-onaylı ders bankası.
 *
 * Döngü: biten projenin closeout'u `lessonCandidates[]` üretir (hepsi CANDIDATE —
 * otomatik yasalaşma YOK, çöp ders sistemi zehirler). Mami bir adayı onaylarsa ders
 * `agents/lessons/APPROVED.md`'ye ELLE girer (tek satır + kaynak proje + tarih + "Mami
 * onayı"). Author context'leri bu bankadan kısa, curated bir `approvedLessons` slice'ı
 * okur (tavan 20 — 300KB dump değil). Dersler KARAR değildir: command kimliğine girmez,
 * çelişkide Mami direktifi kazanır (role kartları söyler).
 */

export interface ApprovedLesson {
  lesson: string;
  sourceProject: string;
  date: string;
  status: 'APPROVED';
  /** Konu etiketi. Satırda `· konu: <ad>` yoksa 'genel'. Tavan bunu kullanır. */
  topic: string;
}

export interface LessonCandidate {
  lesson: string;
  sourceProject: string;
  date: string;
  status: 'CANDIDATE';
}

/** Context ekonomisi: author'a giden ders sayısı tavanı. */
export const APPROVED_LESSONS_CAP = 20;

/** Konu etiketi yazılmamış eski satırların düştüğü kova. */
export const VARSAYILAN_KONU = 'genel';

// Satır biçimi: "- <ders> — kaynak: <proje> · <YYYY-AA-GG> · Mami onayı[ · konu: <ad>]"
// Konu eki OPSİYONELDİR — bankadaki 7 eski satır etiketsiz ve aynen çalışmaya devam eder.
const LESSON_LINE_RE = /^-\s+(.+?)\s+—\s+kaynak:\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*·\s*Mami onayı\s*(?:·\s*konu:\s*([^·]+?)\s*)?$/u;

/** APPROVED.md gövdesini parse eder; format-dışı satırlar sessizce atlanır (banka opsiyonel). */
export function parseApprovedLessons(markdown: string): ApprovedLesson[] {
  if (!markdown?.trim()) return [];
  const lessons: ApprovedLesson[] = [];
  for (const line of markdown.split('\n')) {
    const match = LESSON_LINE_RE.exec(line.trim());
    if (!match) continue;
    lessons.push({
      lesson: match[1],
      sourceProject: match[2],
      date: match[3],
      status: 'APPROVED',
      topic: (match[4] ?? VARSAYILAN_KONU).trim().toLocaleLowerCase('tr') || VARSAYILAN_KONU,
    });
  }
  return lessons;
}

/**
 * Author context slice'ı: yalnız APPROVED + tavanlı.
 *
 * ESKİ DAVRANIŞ `slice(-CAP)` idi ve tavan KONUMSALDI — değere değil sıraya bakıyordu.
 * Ölçüldü (2026-08-04): bankadaki 7 dersin 7'si de TEK projeden ve TEK konudan (yüzeydeki
 * Türkçe yazı) geliyordu; bekleyen 107 aday 16 projeden. Konumsal tavanda 8. yazı dersi,
 * 1. motion dersini yalnızca DAHA YENİ YAZILDIĞI için yer değiştirir — yani banka doldukça
 * çeşitlilik değil, son projenin takıntısı kazanır.
 *
 * Yeni davranış: konular arasında SIRAYLA (round-robin), her konunun içinde en yeniden
 * eskiye doğru toplanır. Böylece tek başına duran bir motion dersi, sekiz yazı dersine
 * yenilmez. Tavana ulaşılmazsa hiçbir şey düşmez; tek konu varsa davranış eskisinin
 * BİREBİR aynısıdır (`slice(-CAP)`).
 *
 * Dönüş sırası dosyadaki özgün sıradır — okunabilirlik için; eleme sırası değil.
 */
export function approvedLessonsSlice(lessons: ApprovedLesson[]): ApprovedLesson[] {
  const approved = lessons.filter((l) => l.status === 'APPROVED');
  if (approved.length <= APPROVED_LESSONS_CAP) return approved;

  // Konu kovaları — her kovanın içi EN YENİ önce (dosyada sona eklenen en yenidir).
  const kovalar = new Map<string, ApprovedLesson[]>();
  for (const l of approved) {
    const kova = kovalar.get(l.topic);
    if (kova) kova.unshift(l);
    else kovalar.set(l.topic, [l]);
  }

  const secilen = new Set<ApprovedLesson>();
  const siralar = [...kovalar.values()];
  for (let tur = 0; secilen.size < APPROVED_LESSONS_CAP; tur += 1) {
    let turdaEklenen = 0;
    for (const kova of siralar) {
      if (secilen.size >= APPROVED_LESSONS_CAP) break;
      const aday = kova[tur];
      if (!aday) continue;
      secilen.add(aday);
      turdaEklenen += 1;
    }
    if (turdaEklenen === 0) break; // bütün kovalar tükendi
  }

  return approved.filter((l) => secilen.has(l));
}
