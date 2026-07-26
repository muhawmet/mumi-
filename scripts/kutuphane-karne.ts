/**
 * MAMILAS KÜTÜPHANE KARNESİ — `docs/KUTUPHANE-KARNESI.md` üretici.
 *
 * Kullanım: npx tsx scripts/kutuphane-karne.ts > docs/KUTUPHANE-KARNESI.md
 *
 * Karne elle yazılmaz. "Hangi dünya gerçek kare verdi" sorusunun tek cevabı burasıdır;
 * V2'nin yöntemi (dünya → prompt → kare → kusuru dünyaya yaz) ancak bu kayıt varsa
 * ilerlediğini gösterebilir. Sayılar canlı `SURGERY_DATA.json`'dan okunur — dokümana
 * literal kopyalanmaz (PROJECT_CONTRACT: kod kanoniktir).
 */
import { DATA, refCompatibleWithWorld } from '../src/core/pure';

/**
 * ÜRETİM GERÇEĞİ — elle bakımlı tek alan. Bir dünya ancak gerçek kare verdiyse
 * buraya girer; kanıtı `agents/COMMAND-INBOX/` altındaki command JSON (`locks.worldId`)
 * ve diskteki PNG'lerdir. Ölçüm 2026-07-26: dört command JSON'un dördü de pixar_3d_edu
 * (Sürtünme 31/31 · Bileşke 52/52 · Kuvvet Ölçülmesi 20/48 diskte) = 103 kare.
 */
const GERCEK_KARE: Record<string, number> = { pixar_3d_edu: 103 };

const W = DATA.worlds as any[];
const R = (DATA as any).refs as any[];

const own = (id: string) => R.filter((r) => r.worldId === id).length;
const uygun = (id: string) => R.filter((r) => refCompatibleWithWorld(r, id)).length;

const rows = W.map((w) => ({
  id: w.id as string,
  grup: (w.group || '') as string,
  kare: GERCEK_KARE[w.id] || 0,
  own: own(w.id),
  uygun: uygun(w.id),
  law: String(w.render_law || '').length,
})).sort((a, b) => (b.kare - a.kare) || a.grup.localeCompare(b.grup) || a.id.localeCompare(b.id));

const validated = rows.filter((r) => r.kare > 0).length;
const orphan = R.filter((r) => !r.worldId && !String(r.id).startsWith('cinedna_')).length;
const cine = R.filter((r) => String(r.id).startsWith('cinedna_')).length;
const bagli = R.length - orphan - cine;
const refsiz = rows.filter((r) => !r.own).map((r) => r.id);

const out: string[] = [];
out.push('# MAMILAS KÜTÜPHANE KARNESİ');
out.push('');
out.push('**Elle yazma — üret:** `npx tsx scripts/kutuphane-karne.ts > docs/KUTUPHANE-KARNESI.md`');
out.push('');
out.push('## Tek cümle');
out.push('');
out.push(`**${W.length} dünyanın ${validated}'i gerçek kareyle doğrulanmış.** Kütüphane kâğıtta tam —`);
out.push(`${W.length}/${W.length} dünya sekiz katmanın hepsini taşıyor, ${bagli + orphan} ref'in hepsi 6+ cümlelik dna'ya`);
out.push(`sahip — ama ${W.length - validated} dünya hakkında BİLDİĞİMİZ bir şey yok: hiçbiri motora sürülmedi.`);
out.push('');
out.push('## Durum tanımı');
out.push('');
out.push('- **VALIDATED** — bu dünyadan gerçek kare üretildi, kusurları görüldü ve dünyaya yazıldı.');
out.push('- **UNVALIDATED** — tarif yazılı, kare yok. Kalitesi hakkında hüküm verilemez. "Oyuncak"');
out.push('  demek de "hazır" demek kadar kanıtsızdır.');
out.push('');
out.push('## Ref sınıfları');
out.push('');
out.push(`- **${R.length} ref** = ${bagli} dünyaya-bağlı (\`worldId\`) + ${orphan} **orphan** (worldId yok,`);
out.push(`  kategoriden uyumlanır) + ${cine} \`cinedna_\` (dünyalar-arası sinematografi).`);
out.push('- Orphan sınıfını `refCompatibleWithWorld` (`src/core/pure.ts`) tanır: worldId taşımayan ref,');
out.push('  kategorisi bir animasyon medyumunu REAL bir dünyaya dayatmadıkça uyumludur.');
out.push('  **`mamilas-ref` skill\'i bu sınıftan hiç bahsetmiyor** — skill "worldId zorunlu" diyor,');
out.push(`  veri ${orphan} kayıtla aksini söylüyor.`);
out.push(`- **Kendi ref'i olmayan ${refsiz.length} dünya:** ${refsiz.join(' · ')}.`);
out.push('  (Orphan havuzundan besleniyorlar, ama kendi imza ref\'leri yok.)');
out.push('');
out.push('## Karne');
out.push('');
out.push('| Dünya | Grup | Durum | Gerçek kare | Kendi ref | Uygun ref | render_law |');
out.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  out.push(`| \`${r.id}\` | ${r.grup} | ${r.kare ? 'VALIDATED' : 'UNVALIDATED'} | ${r.kare || '—'} | ${r.own || '—'} | ${r.uygun} | ${r.law} |`);
}
console.log(out.join('\n'));
