#!/usr/bin/env node
// MAMILAS — DÜNYA KUSURU ÖNERİSİ
//
// Neden var (2026-08-02 ölçümü): "kusur kütüphanede düzeltilir, kodda değil" yasası yazılıydı
// ama çalışmıyordu. Kapanış hasadı dünya-yerel kusur bulduğunda tek KONSERVE cümle basıyordu —
// `Dünya malzeme/palet yasası bu kareyi taşımadı` — worldId yok, alan adı yok, mevcut metin yok.
// Yani rapor doğruydu ve UYGULANAMAZDI. Sonuç ölçülü: 12 hasat, `SURGERY_DATA.json`'da
// **sıfır satır** değişiklik (son dokunuş 2026-07-27).
//
// Bu modül kusuru bir ADRESE çevirir: hangi dünya · hangi alan · o alan BUGÜN ne diyor.
//
// NE YAPMAZ: önerilen cümleyi UYDURMAZ. Kaynakta olmayan gerçeği yazmak bu repoda yasak
// (CLAUDE.md "Değişmezler"). Modül kanıtı ve boşluğu gösterir; cümleyi Mami ya da yönetmen
// ajanı yazar. "Alan zaten bunu söylüyor" da bir bulgudur — o zaman kusur tarifte değil
// UYGULAMADADIR ve yeri kütüphane değildir.
//
// ORTAM YASASI: saf Node, kabuk yok. Windows birincil ortamdır.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Kusur sınıfı → dünyanın hangi alanına yazılır.
 * Kaynak: SURGERY_DATA.json'daki gerçek alan adları (id, name, group, one_liner, render_law,
 * line_grammar, lens_grammar, camera_grammar, light_law, palette_lock, motion_cadence,
 * material_compat, negative_lock, example_injection).
 *
 * Eşleme TAHMİN değil, alanların kendi tanımından: malzeme/yüzey render_law'ın konusudur,
 * renk palette_lock'un, yasak liste negative_lock'un, kopyalanacak örnek example_injection'ın.
 */
export const ALAN_HARITASI = {
  'dünya-malzeme': ['render_law', 'material_compat'],
  'dünya-palet': ['palette_lock', 'render_law'],
  'dünya-ışık': ['light_law', 'render_law'],
  'dünya-yazı': ['example_injection', 'negative_lock'],
  'dünya-kadraj': ['camera_grammar', 'lens_grammar'],
};

/** Bilinmeyen bir kusur sınıfı için makul varsayılan — sessiz düşmesin. */
export const VARSAYILAN_ALANLAR = ['render_law', 'example_injection'];

const KISALT = (v, n = 400) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

/** SURGERY_DATA.json'u okur. Yol verilmezse repo kökünden bulur. */
export function kutuphaneyiOku(root = join(HERE, '..')) {
  const yol = join(root, 'src', 'core', 'SURGERY_DATA.json');
  if (!existsSync(yol)) return { yol, veri: null, hata: 'SURGERY_DATA.json bulunamadı' };
  try {
    return { yol, veri: JSON.parse(readFileSync(yol, 'utf8')), hata: null };
  } catch (e) {
    return { yol, veri: null, hata: `JSON parse: ${e?.message ?? e}` };
  }
}

/** worldId → dünya nesnesi. Kütüphane dizi ya da nesne olabilir; ikisini de tanır. */
export function dunyaBul(veri, worldId) {
  if (!veri || !worldId) return null;
  const kaynak = veri.worlds ?? veri;
  const liste = Array.isArray(kaynak) ? kaynak : Object.values(kaynak ?? {});
  return liste.find((w) => w && typeof w === 'object' && w.id === worldId) ?? null;
}

/**
 * Bir dünya kusuru için uygulanabilir öneri iskeleti.
 * @returns {{worldId, bulundu, alanlar:[{alan, var:boolean, mevcut:string|null, uzunluk:number}],
 *            kanit:{kareler:string[], kusur:string}, not:string|null}}
 */
export function dunyaOnerisi({ worldId, kusurKey, kusur, kareler = [], root }) {
  const { veri, hata, yol } = kutuphaneyiOku(root);
  if (hata) {
    return { worldId, bulundu: false, alanlar: [], kanit: { kareler, kusur }, not: hata, yol };
  }
  const w = dunyaBul(veri, worldId);
  if (!w) {
    return {
      worldId, bulundu: false, alanlar: [], kanit: { kareler, kusur }, yol,
      not: `\`${worldId}\` kütüphanede YOK — kusur bir dünyaya bağlanamıyor, önce dünya kaydı gerekiyor.`,
    };
  }

  const hedefler = ALAN_HARITASI[kusurKey] ?? VARSAYILAN_ALANLAR;
  const alanlar = hedefler.map((alan) => ({
    alan,
    var: Object.prototype.hasOwnProperty.call(w, alan),
    mevcut: Object.prototype.hasOwnProperty.call(w, alan) ? KISALT(w[alan]) : null,
    uzunluk: Object.prototype.hasOwnProperty.call(w, alan)
      ? (typeof w[alan] === 'string' ? w[alan].length : JSON.stringify(w[alan]).length)
      : 0,
  }));

  return { worldId, bulundu: true, alanlar, kanit: { kareler, kusur }, not: null, yol };
}

/** Hasat raporuna girecek markdown blokları. */
export function onerimarkdown(o) {
  const L = [];
  if (!o.bulundu) {
    L.push(`⚠️ ${o.not}`);
    return L;
  }
  L.push(`**Dünya:** \`${o.worldId}\` · **dosya:** \`src/core/SURGERY_DATA.json\``);
  L.push('');
  L.push(`**Kanıt:** ${o.kanit.kusur} (kare: ${o.kanit.kareler.join(', ') || '—'})`);
  L.push('');
  L.push('**Yazılacak alan(lar) ve bugünkü metni:**');
  L.push('');
  for (const a of o.alanlar) {
    if (!a.var) {
      L.push(`- \`${a.alan}\` — **alan YOK.** Dünyada bu başlık hiç tanımlı değil; kusurun yeri burası olabilir.`);
      continue;
    }
    L.push(`- \`${a.alan}\` (${a.uzunluk} krk) bugün şunu diyor:`);
    L.push('');
    L.push('  > ' + String(a.mevcut).replace(/\n/g, '\n  > '));
    L.push('');
  }
  L.push('**Karar Mami\'nin:** yukarıdaki metin kusuru zaten yasaklıyorsa kusur TARİFTE değil');
  L.push('UYGULAMADADIR — o zaman kütüphaneye değil prompt yazımına yazılır. Yasaklamıyorsa');
  L.push('eklenecek cümle buraya yazılır ve `SURGERY_DATA.json` o alandan düzenlenir.');
  L.push('');
  L.push('> Öneri cümlesi bilerek BOŞ bırakıldı — kaynakta olmayan gerçek uydurulmaz.');
  return L;
}

// ── CLI ────────────────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const [worldId, kusurKey = 'dünya-malzeme'] = process.argv.slice(2);
  if (!worldId) {
    process.stdout.write('kullanım: node scripts/dunya-onerisi.mjs <worldId> [kusurKey]\n');
    process.stdout.write(`kusur sınıfları: ${Object.keys(ALAN_HARITASI).join(' · ')}\n`);
    process.exit(0);
  }
  const o = dunyaOnerisi({ worldId, kusurKey, kusur: '(CLI denemesi)', kareler: [] });
  process.stdout.write(`${onerimarkdown(o).join('\n')}\n`);
  process.exit(0);
}
