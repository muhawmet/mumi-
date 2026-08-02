import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// TEK YÜZEY DUVARI — "aynı skill dört yerde yaşıyor, çakışmada canlı sessizce kazanıyor" kusuru.
//
// Ölçüldü (2026-08-02): mamilas-buddy · mamilas-gate · mamilas-audit üçü de HEM ~/.claude/skills'te
// HEM .claude/skills'te vardı ve üçü de FARKLIYDI. Claude Code çakışmada canlı yüzeyi yüklüyor,
// yani repo'daki nüsha hiç koşmuyordu. Somut hasar: Mami 2026-07-29'da "etiketsiz nefes" yasağını
// açıkça kaldırdı, düzeltme repo nüshasına yazıldı, koşan canlı nüshada eski yasak kaldı —
// hook ekrana nefes kutusu basarken yüklenen skill "nefes yazma" diyordu. Kural doğru yazıldı,
// YANLIŞ RAFA kondu ve iki gün sonra yokmuş gibi davranıldı.
//
// Mami'nin kararı (2026-08-02): kanon GİT. Skill git'te yaşar, canlı yüzeyde ikizi durmaz.
//
// Bu duvarın kıstası İÇERİK EŞİTLİĞİ DEĞİL, TEKLİK. Sebebi: içerik karşılaştırması senkron
// zamanlamasına duyarlıdır (Windows pull ile Mac commit arasında meşru bir an fark eder) ve
// çakan bir kapı kapatılan kapıdır. Teklik kıstası zamanlamadan bağımsızdır: nüsha ya vardır
// ya yoktur.
//
// Mevcut testlerin kör noktası (bu dosyanın kapattığı): docsContract yalnız İSİM paritesi,
// skillCapability yalnız SKILL.md içeriği — ikisi de yalnız repo içi iki yüzeye bakar.
// ~/.claude/skills ve docs/ai/sync/skills hiçbir testin konusu değildi. Ayrıca hiçbir test
// `references/` altını ölçmüyordu: dehb-mufredat.md (241 satır) yalnız canlı yüzeyde
// duruyordu ve körleme bir silme onu dört yüzeyden birden uçuracaktı.

const REPO = resolve(process.cwd());
const lf = (s: string) => s.replace(/\r\n/g, '\n');

/** Bir yüzeydeki skill adları. Yüzey yoksa boş — makineye özel yüzeyler için şart. */
const skillsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

const PROJE = resolve(REPO, '.claude/skills');
const CODEX = resolve(REPO, '.agents/skills');
const AYNA = resolve(REPO, 'docs/ai/sync/skills');
const CANLI = resolve(homedir(), '.claude/skills');

const projeSkills = skillsIn(PROJE);

describe('skill yüzeyi — bir skill, bir kanon', () => {
  test('ölçüm gerçekten koşuyor — proje yüzeyi boş değil', () => {
    expect(projeSkills.length).toBeGreaterThan(5);
  });

  // ---- TEKLİK: aynı ad iki yüzeyde birden duramaz -------------------------------------------

  test('canlı yüzey (~/.claude/skills) proje skill\'inin ikizini TAŞIMAZ — çakışmada canlı kazanır', () => {
    const canliSkills = skillsIn(CANLI);
    const cakisan = canliSkills.filter((n) => projeSkills.includes(n));
    // Mesaj kırmızı verdiğinde ne yapılacağını söyler — çıplak bir assert kusuru gizler.
    expect(
      cakisan,
      cakisan.length === 0
        ? ''
        : `Bu skill'ler HEM canlıda HEM projede var: ${cakisan.join(', ')}. ` +
          `Claude Code canlıyı yükler, repo nüshası hiç koşmaz — yani bu skill'e yazdığın ` +
          `düzeltme ölü. Çözüm: içeriği .claude/skills altında birleştir, sonra ` +
          `${cakisan.map((n) => `~/.claude/skills/${n}`).join(' ve ')} sil. ` +
          `docs/ai/sync/skills altındaki ikizini de AYNI ANDA sil, yoksa claude-sync geri diriltir.`,
    ).toEqual([]);
  });

  test('senkron aynası (docs/ai/sync/skills) proje skill\'inin ikizini TAŞIMAZ — diriltme yolu', () => {
    const aynaSkills = skillsIn(AYNA);
    const cakisan = aynaSkills.filter((n) => projeSkills.includes(n));
    expect(
      cakisan,
      cakisan.length === 0
        ? ''
        : `Bu skill'ler hem senkron aynasında hem projede var: ${cakisan.join(', ')}. ` +
          `Ayna canlıyı besler: claude-sync bir sonraki koşuda bunları ~/.claude/skills'e ` +
          `geri yazar ve çakışma yeniden doğar. docs/ai/sync/skills altından sil.`,
    ).toEqual([]);
  });

  // ---- İKİZ PARİTESİ: .claude ↔ .agents, SKILL.md DIŞINDAKİ dosyalar dahil ------------------

  test('Codex ikizi (.agents/skills) küme olarak proje ile aynı', () => {
    expect(skillsIn(CODEX)).toEqual(projeSkills);
  });

  /** Bir skill klasöründeki tüm dosyalar, klasöre göreli yollarıyla. */
  const dosyalar = (kok: string, alt = ''): string[] => {
    const dizin = join(kok, alt);
    if (!existsSync(dizin)) return [];
    return readdirSync(dizin, { withFileTypes: true })
      .flatMap((d) =>
        d.isDirectory() ? dosyalar(kok, join(alt, d.name)) : [join(alt, d.name)],
      )
      .sort();
  };

  // SKILL.md içeriğini skillCapability zaten ölçüyor. Buradaki iş EK DOSYALAR — references/
  // altı hiçbir testin konusu değildi ve tam da orada tek nüsha kalmış bir müfredat vardı.
  test.each(projeSkills)('%s — ikizde aynı dosya kümesi var (references/ dahil)', (ad) => {
    expect(dosyalar(join(CODEX, ad))).toEqual(dosyalar(join(PROJE, ad)));
  });

  test.each(projeSkills)('%s — SKILL.md dışındaki dosyalar ikizde birebir aynı', (ad) => {
    const ekler = dosyalar(join(PROJE, ad)).filter((f) => f !== 'SKILL.md');
    for (const ek of ekler) {
      const a = lf(readFileSync(join(PROJE, ad, ek), 'utf8'));
      const b = lf(readFileSync(join(CODEX, ad, ek), 'utf8'));
      expect(b, `${relative(REPO, join(CODEX, ad, ek))} ikizinden ayrışmış`).toBe(a);
    }
  });
});
