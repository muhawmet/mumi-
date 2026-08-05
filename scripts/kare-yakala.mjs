#!/usr/bin/env node
/**
 * kare-yakala.mjs — İNEN KARE KENDİ ADINI BULUR.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * NEDEN VAR — ölçülmüş vaka (2026-08-05)
 *
 * Basım hattı şöyle akıyor: prompt elle Nano Banana 2'ye yapıştırılıyor → PNG
 * `~/Downloads`a `Gemini_Generated_Image_x7k2p.png` gibi bir adla iniyor → Mami dosyayı
 * BULUYOR, hangi kare olduğunu HATIRLIYOR, ELLE `23.png` yapıyor, proje klasörüne
 * SÜRÜKLÜYOR. Video başına ~700 UI el hareketi ölçüldü ve bunun büyük parçası tam burada:
 * 125 kare kuyrukta beklerken darboğaz yazma değil, indirme sonrası el işi.
 *
 * Bu araç o dört adımı tek adıma indirir — ve numarayı HATIRLAMAZ, KUYRUKTAN TÜRETİR
 * (`basim-kuyrugu.mjs`). Kuyruk her koşuda diskten yeniden doğduğu için bayatlayamaz:
 * kare basıldığı an kuyruktan düşer, sıradaki kendiliğinden gelir.
 *
 * 🔴 API/TARAYICI OTOMASYONU YOK (Mami'nin kararı, 2026-08-05). Bu araç yalnız
 * YEREL DOSYA taşır. Motorla konuşmaz, indirme başlatmaz, tarayıcıya dokunmaz.
 *
 * 🔴 ÜZERİNE YAZMAZ. Hedef dosya varsa DURUR ve söyler. Basılmış bir kareyi sessizce
 * ezmek, bu depoda geri dönüşü olan tek gerçek kayıptır (kare 5-8 dakikalık kredi).
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ORTAM — bu depoda dört kez ölçülmüş kusur: "bir araç ortama dair varsayım yapıyorsa,
 * o varsayımı TEST ET; yazdım çalışıyor demek değildir." Bu yüzden:
 *   · yol ayracı hiçbir yerde elle yazılmaz → `node:path`
 *   · `~` elle genişletilmez → `os.homedir()`
 *   · indirme klasörü BULUNAMAZSA sessiz no-op yapmaz, ne aradığını yazıp durur
 *   · taşıma `rename` ile denenir, FARKLI DİSK (Windows C: → D:, EXDEV) hâlinde
 *     kopyala+sil'e düşer — tek `renameSync` bu makinede sessizce patlardı
 *
 * Kullanım:
 *   node scripts/kare-yakala.mjs                 # tek seferlik: en son inen kareyi al
 *   node scripts/kare-yakala.mjs --izle          # sürekli izle (Ctrl+C ile çık)
 *   node scripts/kare-yakala.mjs --kuru          # ne yapacağını yaz, DOSYAYA DOKUNMA
 *   node scripts/kare-yakala.mjs --sonraki 23    # numarayı elle ver
 *   node scripts/kare-yakala.mjs --proje "<ad>"  # aktif iş dışı bir projeye al
 *   node scripts/kare-yakala.mjs --indirme <dir> # başka bir kaynak klasör
 */

import {
  existsSync, statSync, readdirSync, renameSync, copyFileSync, unlinkSync, watch,
} from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { readState, nfc, ensureImagesDir } from './current-work.mjs';
import { taraProje, projeListesi, kareKlasoru, REPO_DEFAULT } from './basim-kuyrugu.mjs';

const UZANTILAR = ['.png', '.jpg', '.jpeg'];
/** Yarım inmiş dosyanın kardeş izleri — bunlardan biri varsa dosya HENÜZ HAZIR DEĞİL. */
const YARIM_EKLERI = ['.crdownload', '.part', '.download', '.opdownload', '.tmp'];
/** İndirme klasörü adayları. Windows ve macOS diskte İngilizce adı tutar; yine de TEK ada güvenilmez. */
const INDIRME_ADAYLARI = ['Downloads', 'İndirilenler', 'indirilenler'];

const log = (s) => process.stdout.write(`${s}\n`);
const uyar = (s) => process.stderr.write(`${s}\n`);

// ---------------------------------------------------------------------------
// SAF PARÇALAR — disk yok, testten çivilenebilir.
// ---------------------------------------------------------------------------

/** Argüman ayrıştırma. Bayrak sırası ve `--x=y` biçimi ikisi de kabul edilir. */
export function argAyir(argv) {
  const o = { izle: false, kuru: false, sonraki: null, proje: null, indirme: null, bekleMs: 15000 };
  for (let i = 0; i < argv.length; i += 1) {
    const [ad, gomulu] = argv[i].split('=');
    const deger = () => (gomulu !== undefined ? gomulu : argv[++i]);
    if (ad === '--izle') o.izle = true;
    else if (ad === '--kuru' || ad === '--dry-run') o.kuru = true;
    else if (ad === '--sonraki') o.sonraki = Number(deger());
    else if (ad === '--proje') o.proje = deger();
    else if (ad === '--indirme') o.indirme = deger();
    else if (ad === '--bekle-ms') o.bekleMs = Number(deger());
  }
  return o;
}

/** Kare dosya adı — uzantı KAYNAKTAN gelir, uydurulmaz (jpg inen kare jpg kalır). */
export function kareAdi(n, kaynakAdi) {
  const uz = extname(String(kaynakAdi)).toLowerCase();
  return `${n}${UZANTILAR.includes(uz) ? uz : '.png'}`;
}

/** Bir dosya adı kare görseli mi (yarım indirme ve gizli dosyalar hariç). */
export function gorselMi(ad) {
  if (!ad || ad.startsWith('.')) return false;
  return UZANTILAR.includes(extname(ad).toLowerCase());
}

// ---------------------------------------------------------------------------
// DİSK
// ---------------------------------------------------------------------------

/** İndirme klasörünü BULUR; bulamazsa neyi aradığını söyleyerek null döner (sessiz no-op yok). */
export function indirmeKlasoru(elle = null) {
  if (elle) {
    const abs = resolve(elle.startsWith('~') ? join(homedir(), elle.slice(1)) : elle);
    return existsSync(abs) ? abs : null;
  }
  if (process.env.MAMILAS_INDIRME) {
    const abs = resolve(process.env.MAMILAS_INDIRME);
    if (existsSync(abs)) return abs;
  }
  for (const ad of INDIRME_ADAYLARI) {
    const abs = join(homedir(), ad);
    if (existsSync(abs)) return abs;
  }
  return null;
}

/** Klasördeki kare görselleri, YENİDEN ESKİYE. `sonra` verilirse yalnız ondan yeni olanlar. */
export function adaylar(dir, sonra = 0) {
  let adlar = [];
  try { adlar = readdirSync(dir); } catch { return []; }
  const set = new Set(adlar);
  const out = [];
  for (const ad of adlar) {
    if (!gorselMi(ad)) continue;
    // yarım indirme: `x.png` yanında `x.png.crdownload` duruyorsa dosya HÂLÂ yazılıyor
    if (YARIM_EKLERI.some((e) => set.has(ad + e))) continue;
    let st;
    try { st = statSync(join(dir, ad)); } catch { continue; }
    if (!st.isFile() || st.mtimeMs <= sonra) continue;
    out.push({ ad, yol: join(dir, ad), mtime: st.mtimeMs, boyut: st.size });
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

/** Dosya YAZILMASI BİTENE kadar bekler: boyut iki ölçümde aynı kalmalı. */
async function stabilBekle(yol, enFazlaMs = 15000) {
  const basla = Date.now();
  let onceki = -1;
  while (Date.now() - basla < enFazlaMs) {
    let st;
    try { st = statSync(yol); } catch { return false; }
    if (st.size > 0 && st.size === onceki) return true;
    onceki = st.size;
    await new Promise((r) => { setTimeout(r, 300); });
  }
  return false;
}

/**
 * Taşır. `rename` aynı diskte atomiktir; EXDEV (farklı disk/bölüm) hâlinde kopyala+sil.
 * Windows'ta indirme klasörü ile repo farklı sürücüde olabilir — tek `renameSync` orada patlar.
 */
export function tasi(kaynak, hedef) {
  try {
    renameSync(kaynak, hedef);
    return 'rename';
  } catch (e) {
    if (e?.code !== 'EXDEV') throw e;
    copyFileSync(kaynak, hedef);
    unlinkSync(kaynak);
    return 'copy+unlink';
  }
}

/** Aktif iş kaydından (ya da `--proje`den) proje adını çözer. */
export function projeSec(root, elle = null) {
  if (elle) {
    const [ad] = projeListesi(root, basename(elle));
    return ad ? { ok: true, proje: ad, kaynak: '--proje' } : { ok: false, sebep: `COMMAND-INBOX'ta "${elle}" yok` };
  }
  const r = readState(root);
  if (!r.ok) return { ok: false, sebep: `aktif iş kaydı okunamadı (${r.reason}) — --proje "<ad>" ver` };
  const id = nfc(r.state.projectId ?? '');
  const [ad] = projeListesi(root, id);
  if (!ad) return { ok: false, sebep: `kayıttaki iş COMMAND-INBOX'ta yok: ${id}` };
  return { ok: true, proje: ad, kaynak: 'artifacts/current-work.json' };
}

/**
 * Bir dosyayı sıradaki kare numarasıyla projeye alır.
 * @returns {{ok:boolean, n?:number, hedef?:string, sebep?:string, yontem?:string}}
 */
export function yakala(dosya, { root = REPO_DEFAULT, proje, sonraki = null, kuru = false } = {}) {
  const tarama = taraProje(proje, root);
  if (!tarama) return { ok: false, sebep: `${proje}/PROMPTLAR yok — hangi kareler yazılı bilinmiyor` };

  const n = Number.isInteger(sonraki) ? sonraki : tarama.bekleyen[0];
  if (!Number.isInteger(n)) {
    return {
      ok: false,
      sebep: `kuyrukta bekleyen kare YOK (yazılı ${tarama.yazili.size} · basılı ${tarama.basili.size}). `
        + 'Yeniden basım ise numarayı elle ver: --sonraki <n>',
    };
  }

  // Hedef klasör: dolu olan alias tercih edilir; hiç yoksa kanonik `images` DOĞURULUR.
  const kareDir = tarama.kareDir ?? (kuru ? join(tarama.kok, 'images') : ensureImagesDir(tarama.kok));
  const hedef = join(kareDir, kareAdi(n, dosya));
  if (existsSync(hedef)) {
    return { ok: false, n, hedef, sebep: `hedef ZATEN VAR → ${hedef} · üzerine YAZILMAZ` };
  }
  if (kuru) return { ok: true, n, hedef, yontem: 'kuru', kaynakDosya: dosya };

  const yontem = tasi(dosya, hedef);
  return { ok: true, n, hedef, yontem, kaynakDosya: dosya };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const dogrudan = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (dogrudan) {
  const o = argAyir(process.argv.slice(2));
  const root = REPO_DEFAULT;

  const p = projeSec(root, o.proje);
  if (!p.ok) { uyar(`kare-yakala: ${p.sebep}`); process.exit(2); }

  const indirme = indirmeKlasoru(o.indirme);
  if (!indirme) {
    if (o.indirme) {
      uyar(`kare-yakala: --indirme ile verilen klasör diskte yok → ${o.indirme}`);
    } else {
      uyar('kare-yakala: indirme klasörü bulunamadı. Aranan:');
      for (const ad of INDIRME_ADAYLARI) uyar(`  · ${join(homedir(), ad)}`);
      uyar('  · $MAMILAS_INDIRME');
      uyar('Elle ver: node scripts/kare-yakala.mjs --indirme "<klasör>"');
    }
    process.exit(2);
  }

  const tarama = taraProje(p.proje, root);
  log(`\n[kare-yakala] ${p.proje}   (kaynak: ${p.kaynak})`);
  log(`  indirme : ${indirme}`);
  log(`  kuyruk  : yazılı ${tarama?.yazili.size ?? 0} · basılı ${tarama?.basili.size ?? 0} · bekleyen ${tarama?.bekleyen.length ?? 0}`);
  log(`  hedef   : ${kareKlasoru(tarama?.kok ?? '') ?? join(tarama?.kok ?? '', 'images')}`);
  if (o.kuru) log('  MOD     : KURU — hiçbir dosyaya dokunulmaz');

  const bildir = (r) => {
    if (!r.ok) { uyar(`  ⛔ ${r.sebep}`); return false; }
    const ok = o.kuru ? 'KURU · taşınacaktı' : `alındı (${r.yontem})`;
    log(`  ✅ K${String(r.n).padStart(2, '0')} ${ok}: ${basename(r.kaynakDosya)} → ${r.hedef}`);
    return true;
  };

  if (!o.izle) {
    const [son] = adaylar(indirme);
    if (!son) { uyar('  ⛔ indirme klasöründe png/jpg yok.'); process.exit(1); }
    const yas = Math.round((Date.now() - son.mtime) / 1000);
    log(`  son inen: ${son.ad}  (${yas} sn önce · ${(son.boyut / 1024).toFixed(0)} KB)`);
    const r = yakala(son.yol, { root, proje: p.proje, sonraki: o.sonraki, kuru: o.kuru });
    process.exit(bildir(r) ? 0 : 1);
  }

  // ── İZLEME ──────────────────────────────────────────────────────────────
  // fs.watch tek başına GÜVENİLİR DEĞİL (macOS FSEvents olayı yutabilir, ağ diski hiç vermez).
  // Bu yüzden olay + 2 saniyelik tarama BİRLİKTE koşar: olay hızı, tarama güvenceyi verir.
  // Yalnız ARAÇ BAŞLADIKTAN SONRA inen dosyalar alınır — klasörde duran eski PNG'ler değil.
  let esik = Date.now();
  let mesgul = false;
  log('  MOD     : İZLE — yeni inen kareler alınacak (Ctrl+C ile çık)\n');

  const tur = async () => {
    if (mesgul) return;
    mesgul = true;
    try {
      for (const c of adaylar(indirme, esik).reverse()) {   // eskiden yeniye: sıra korunur
        if (!(await stabilBekle(c.yol, o.bekleMs))) { uyar(`  ⏳ hâlâ yazılıyor, atlandı: ${c.ad}`); continue; }
        esik = Math.max(esik, c.mtime);
        const r = yakala(c.yol, { root, proje: p.proje, sonraki: o.sonraki, kuru: o.kuru });
        bildir(r);
        if (r.ok && !o.kuru) {
          const k = taraProje(p.proje, root);
          log(`     kalan: ${k.bekleyen.length} kare${k.bekleyen.length ? ` · sıradaki K${String(k.bekleyen[0]).padStart(2, '0')}` : ' — KUYRUK BOŞ'}`);
        }
        // `--sonraki` elle verildiyse tek karelik bir emirdir; ikinci dosyaya uygulanmaz.
        if (o.sonraki) { log('  (--sonraki tek karelik emirdi, izleme kapanıyor)'); process.exit(0); }
      }
    } finally { mesgul = false; }
  };

  try { watch(indirme, () => { tur().catch((e) => uyar(`  ⚠ ${e.message}`)); }); } catch (e) {
    uyar(`  ⚠ fs.watch açılamadı (${e.message}) — yalnız 2 sn'lik tarama ile devam.`);
  }
  setInterval(() => { tur().catch((e) => uyar(`  ⚠ ${e.message}`)); }, 2000);
}
