/**
 * MAMILAS DÜNYA SINAVI — koşucu.
 *
 * Tek dünya (ayrıntılı rapor + beş gerçek prompt):
 *   npx tsx scripts/dunya-sinavi.ts pixar_3d_edu
 *   npx tsx scripts/dunya-sinavi.ts pixar_3d_edu --prompts   (prompt gövdelerini de bas)
 *
 * Bütün kütüphane (46 dünya · tek tablo):
 *   npx tsx scripts/dunya-sinavi.ts --all
 *
 * Sınav KARE ÜRETMEZ. Prompt ve yapısal ölçüm üretir; kare hükmü Mami'nindir.
 * Kusur çıkarsa düzeltme yeri KÜTÜPHANEDİR (SURGERY_DATA.json), kod değil — kod
 * yasası geneldir, dünya kusuru yereldir; kodu her dünya için eğmek beyni bozar.
 */
import { EXAM_PROBES, examineWorld, examineLibrary, type WorldExamReport } from '../src/core/worldExam';

const MARK: Record<string, string> = {
  CARRIED: '✅',
  MISSING: '❌',
  CONFLICT: '⚠️ ',
  NOT_MEASURABLE: '·',
};

function detail(report: WorldExamReport, withPrompts: boolean): void {
  console.log('='.repeat(78));
  console.log(`${report.worldId} — ${report.worldName}`);
  console.log(`grup: ${report.group} · yol: ${report.projectClass} · durum: ${report.status}`);
  console.log('='.repeat(78));
  if (report.blockers.length) {
    console.log('\nBLOCKERS:');
    for (const b of report.blockers) console.log(`  - ${b}`);
  }
  console.log('');
  for (const axis of report.axes) {
    const probe = EXAM_PROBES.find((p) => p.id === axis.probe);
    console.log(`${MARK[axis.verdict]} ${axis.probe.padEnd(12)} ${axis.verdict}`);
    console.log(`   yoklar : ${probe?.asks}`);
    console.log(`   ölçüm  : ${axis.measure}`);
    for (const e of axis.evidence) console.log(`   kanıt  : ${e}`);
    console.log('');
  }
  console.log(`HÜKÜM: ${report.verdict}`);
  if (withPrompts) {
    report.prompts.forEach((p, i) => {
      console.log('\n' + '-'.repeat(78));
      console.log(`PROMPT ${i + 1} — ${EXAM_PROBES[i].id}`);
      console.log('-'.repeat(78));
      console.log(p);
    });
  }
}

function table(reports: WorldExamReport[]): void {
  console.log('| Dünya | Grup | Durum | ' + EXAM_PROBES.map((p) => p.id).join(' | ') + ' |');
  console.log('|---|---|---|' + EXAM_PROBES.map(() => '---').join('|') + '|');
  for (const r of reports) {
    const cells = r.axes.map((a) => `${MARK[a.verdict].trim()} ${a.verdict}`);
    console.log(`| \`${r.worldId}\` | ${r.group} | ${r.status} | ${cells.join(' | ')} |`);
  }

  console.log('\n## Özet\n');
  console.log(`- Sınanan dünya: **${reports.length}**`);
  console.log(`- Prompt üretebilen: **${reports.filter((r) => r.status === 'GENERATED').length}**`);
  console.log(`- Bloklanan: **${reports.filter((r) => r.status === 'BLOCKED').length}**`);
  for (const probe of EXAM_PROBES) {
    const axes = reports.map((r) => r.axes.find((a) => a.probe === probe.id)!);
    const carried = axes.filter((a) => a.verdict === 'CARRIED').length;
    const conflict = axes.filter((a) => a.verdict === 'CONFLICT').length;
    const missing = axes.filter((a) => a.verdict === 'MISSING').length;
    console.log(`- **${probe.id}** — taşınıyor ${carried} · çelişki ${conflict} · eksik ${missing}`);
  }

  // Eksen bazlı kusur listesi: hangi dünya, hangi ölçümle düştü. Kelime tablosu değil —
  // düzeltilecek yerin adresi.
  for (const probe of EXAM_PROBES) {
    const bad = reports
      .map((r) => ({ r, a: r.axes.find((x) => x.probe === probe.id)! }))
      .filter(({ a }) => a.verdict === 'MISSING' || a.verdict === 'CONFLICT');
    if (!bad.length) continue;
    console.log(`\n### ${probe.id} — ${bad.length} dünya\n`);
    for (const { r, a } of bad) console.log(`- \`${r.worldId}\` — ${a.verdict}: ${a.measure}`);
  }
}

const args = process.argv.slice(2);
if (args.includes('--all')) {
  table(examineLibrary());
} else {
  const worldId = args.find((a) => !a.startsWith('--'));
  if (!worldId) {
    console.error('Kullanım: npx tsx scripts/dunya-sinavi.ts <worldId> [--prompts]  |  --all');
    process.exit(1);
  }
  detail(examineWorld(worldId), args.includes('--prompts'));
}
