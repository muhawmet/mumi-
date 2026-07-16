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
}

export interface LessonCandidate {
  lesson: string;
  sourceProject: string;
  date: string;
  status: 'CANDIDATE';
}

/** Context ekonomisi: author'a giden ders sayısı tavanı. */
export const APPROVED_LESSONS_CAP = 20;

// Satır biçimi: "- <ders> — kaynak: <proje> · <YYYY-AA-GG> · Mami onayı"
const LESSON_LINE_RE = /^-\s+(.+?)\s+—\s+kaynak:\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*·\s*Mami onayı\s*$/u;

/** APPROVED.md gövdesini parse eder; format-dışı satırlar sessizce atlanır (banka opsiyonel). */
export function parseApprovedLessons(markdown: string): ApprovedLesson[] {
  if (!markdown?.trim()) return [];
  const lessons: ApprovedLesson[] = [];
  for (const line of markdown.split('\n')) {
    const match = LESSON_LINE_RE.exec(line.trim());
    if (!match) continue;
    lessons.push({ lesson: match[1], sourceProject: match[2], date: match[3], status: 'APPROVED' });
  }
  return lessons;
}

/** Author context slice'ı: yalnız APPROVED + tavanlı (en yenisi önce kalsın diye sondan). */
export function approvedLessonsSlice(lessons: ApprovedLesson[]): ApprovedLesson[] {
  return lessons.filter((l) => l.status === 'APPROVED').slice(-APPROVED_LESSONS_CAP);
}
