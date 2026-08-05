#!/usr/bin/env node
/**
 * basim-kuyrugu.mjs — BASIM SIRASI. Mami'nin elleri Claude'u beklemesin diye.
 *
 * Neden var (2026-08-04 ölçümü): 233 kare YAZILI, 0'ı BASILI. Yazma bir gecede oldu,
 * basım hiç başlamadı. Darboğaz yazma değil BASIM — ve basımı yavaşlatan şey, hangi karenin
 * sırada olduğunu her seferinde sormak zorunda kalmak.
 *
 * Ne yapar: PROMPTLAR'daki kareleri okur, hangilerinin basıldığını `images/`ten görür,
 * BASILMAYANLARI sıraya dizer ve her biri için dosya + satır verir. Kuyruk her koşuda
 * yeniden türetilir — bayatlayamaz.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * 2026-08-05 — ARAÇ MODÜLE ÇEVRİLDİ (davranış aynı, CLI çıktısı birebir korundu).
 * Neden: dosya yazılmıştı ama ÇAĞIRANI YOKTU. Bu depoda ölçülmüş kusur sınıfı tam olarak
 * budur — "yazdım" çalışıyor demek değildir. Artık iki gerçek çağıranı var:
 *   · `scripts/kare-yakala.mjs`  → inen kareyi kuyruğun SIRADAKİ numarasıyla adlandırır
 *   · `.claude/hooks/oturum-durumu.mjs` → `[durum]` bloğuna basılmamış kare sayısını basar
 *
 * ⚠ İKİNCİ ORTAM KUSURU DA ONARILDI: `INBOX` cwd'ye göreliydi. Repo kökü dışından
 * çağrılınca (hook `CLAUDE_PROJECT_DIR` ile çağırır, ajanların cwd'si her bash çağrısında
 * sıfırlanır) klasör bulunamıyor ve araç SESSİZCE "proje yok" diyordu. Kök artık dosyanın
 * kendi konumundan türetilir; `root` parametresi testler ve hook için dışarıdan verilebilir.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Kullanım:
 *   node scripts/basim-kuyrugu.mjs                    # bütün açık projeler
 *   node scripts/basim-kuyrugu.mjs "Bileşke Kuvvet"   # tek proje, kare kare
 *   node scripts/basim-kuyrugu.mjs "<proje>" --grup 8 # 8'li batch hâlinde
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMAGE_DIR_ALIASES, nfc } from './current-work.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_DEFAULT = path.resolve(HERE, '..');
export const INBOX_REL = 'agents/COMMAND-INBOX';

/** Kuyruğa girmeyen klasörler — teslim edilmiş, bekleyen ya da deneme işleri. */
export const ATLANAN = new Set(['Biten', 'Bekleyen', 'DENEME']);

// Basılı kare klasörü. Kanonik ad ve eski adlar `current-work.mjs`ten ithal edilir —
// ikinci bir liste yazmak, bu depoda sekiz kez ölçülmüş "doğrulayıcı yerleşimi varsayıyor"
// kusurunun kendisidir. `kareler` yalnız burada duruyor: canlı diskte bir projede geçti,
// current-work kanonuna girmedi.
export const KARE_KLASORLERI = [...IMAGE_DIR_ALIASES, 'kareler'];

const KARE_RE = /^(?:#{1,3}\s*)?#?\s*K(\d{1,3})\b/;
/** Aralık satırı (`K35–K38`) bir kare başlığı DEĞİLDİR — blok özetidir. */
const ARALIK_RE = /^(?:#{1,3}\s*)?#?\s*K\d{1,3}\s*[-–—]\s*K?\d/;
const BASILI_RE = /^(\d{1,3})\.(png|jpg|jpeg)$/i;

/** Kuyruğa girecek proje adları (Biten/Bekleyen/DENEME hariç), istenirse tek projeye daraltılmış. */
export function projeListesi(root = REPO_DEFAULT, hedef = null) {
  const dir = path.join(root, INBOX_REL);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !ATLANAN.has(d.name))
    .map((d) => d.name)
    // macOS diskte NFD, kayıtta NFC yaşar — iki taraf da normalize edilmeden karşılaştırılmaz.
    .filter((n) => !hedef || nfc(n) === nfc(hedef));
}

/** Projenin BASILI kare klasörü (dolu olan tercih edilir) — yoksa null. */
export function kareKlasoru(projeAbs) {
  let bos = null;
  for (const ad of KARE_KLASORLERI) {
    const dir = path.join(projeAbs, ad);
    if (!fs.existsSync(dir)) continue;
    const dolu = fs.readdirSync(dir).some((f) => BASILI_RE.test(f));
    if (dolu) return dir;
    if (!bos) bos = dir;
  }
  return bos;
}

/**
 * Tek projenin kuyruğu. Kayda sormaz, yalnız diski okur.
 * @returns {{proje:string, kok:string, yazili:Map<number,object>, basili:Set<number>,
 *            bekleyen:number[], kareDir:string|null}|null}
 */
export function taraProje(proje, root = REPO_DEFAULT) {
  const kok = path.join(root, INBOX_REL, proje);
  const pdir = path.join(kok, 'PROMPTLAR');
  if (!fs.existsSync(pdir)) return null;

  // yazılmış kareler: hangi dosyada, hangi satırda
  const yazili = new Map();
  for (const f of fs.readdirSync(pdir).filter((n) => /\.txt$/.test(n)).sort()) {
    const satirlar = fs.readFileSync(path.join(pdir, f), 'utf8').split('\n');
    satirlar.forEach((l, i) => {
      const t = l.trim();
      const m = t.match(KARE_RE);
      if (!m || ARALIK_RE.test(t)) return;
      const n = Number(m[1]);
      if (!yazili.has(n)) yazili.set(n, { dosya: f, satir: i + 1, baslik: t.slice(0, 78) });
    });
  }

  // basılmış kareler
  // ⚠ KLASÖR ADI PROJEDEN PROJEYE DEĞİŞİYOR — `images/` ve `resimler/` ikisi de kullanılıyor
  //   (Farklı Kültürler `resimler/`). Tek ada güvenmek, bu repoda 11 kez ölçülen
  //   "doğrulayıcı yerleşimi varsayıyor" kusurunun aynısıdır: araç 53 basılı kareyi
  //   "hiç basılmamış" sayıp kuyruğa koyuyordu.
  const basili = new Set();
  for (const ad of KARE_KLASORLERI) {
    const idir = path.join(kok, ad);
    if (!fs.existsSync(idir)) continue;
    for (const f of fs.readdirSync(idir)) {
      const m = f.match(BASILI_RE);
      if (m) basili.add(Number(m[1]));
    }
  }

  const bekleyen = [...yazili.keys()].filter((n) => !basili.has(n)).sort((a, b) => a - b);
  return { proje, kok, yazili, basili, bekleyen, kareDir: kareKlasoru(kok) };
}

/** Bütün (ya da tek) projenin kuyruğu, en çok bekleyen başta. */
export function kuyruk(root = REPO_DEFAULT, hedef = null) {
  return projeListesi(root, hedef)
    .map((p) => taraProje(p, root))
    .filter((r) => r && r.yazili.size)
    .sort((a, b) => b.bekleyen.length - a.bekleyen.length);
}

/**
 * Tek sayı: bu projede yazılı ama BASILMAMIŞ kare adedi. Proje bilinmiyorsa hepsi toplanır.
 * SessionStart hook'u bunu `[durum]` bloğuna tek satır olarak basar.
 * @returns {number|null} proje diskte yoksa / PROMPTLAR yoksa null — 0 ile karıştırılmaz.
 */
export function bekleyenSayisi(root = REPO_DEFAULT, proje = null) {
  if (proje) {
    const [ad] = projeListesi(root, path.basename(String(proje)));
    if (!ad) return null;
    const r = taraProje(ad, root);
    return r ? r.bekleyen.length : null;
  }
  return kuyruk(root).reduce((t, r) => t + r.bekleyen.length, 0);
}

/**
 * `[durum]` bloğunun tek satırı: aktif işte ve BÜTÜN kutuda kaç kare basılmamış.
 * İkisi ayrı raporlanır çünkü ayrı gerçeklerdir — ölçüldü 2026-08-05: aktif işin kuyruğu
 * boşken kutuda 125 kare bekliyordu. Yalnız aktif işi basan bir satır "iş bitti" derdi.
 */
export function basimOzeti(root = REPO_DEFAULT, proje = null) {
  return { proje: bekleyenSayisi(root, proje), toplam: bekleyenSayisi(root) };
}

/**
 * Sıradaki basılacak kare numarası.
 * Kuyrukta bekleyen varsa ilki; yoksa null — "yok" ile "1" ASLA karıştırılmaz, çünkü
 * yanlış numara Mami'nin basılı karesinin üstüne yazma riskidir.
 */
export function sonrakiKare(proje, root = REPO_DEFAULT) {
  const r = taraProje(proje, root);
  return r && r.bekleyen.length ? r.bekleyen[0] : null;
}

// ---------------------------------------------------------------------------
// CLI — çıktı biçimi 2026-08-04 sürümüyle BİREBİR aynı.
// ---------------------------------------------------------------------------
const dogrudan = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (dogrudan) {
  const argv = process.argv.slice(2);
  const hedef = argv.find((a) => !a.startsWith('--'));
  const gi = argv.indexOf('--grup');
  const GRUP = gi >= 0 ? Number(argv[gi + 1]) || 8 : 0;

  if (!projeListesi(REPO_DEFAULT, hedef).length) {
    console.error(`basim-kuyrugu: proje bulunamadı${hedef ? ` — "${hedef}"` : ''}`);
    process.exit(2);
  }

  const sonuc = kuyruk(REPO_DEFAULT, hedef);
  const toplamBekleyen = sonuc.reduce((t, r) => t + r.bekleyen.length, 0);

  console.log('\n[basım kuyruğu] — kuyruk her koşuda yeniden türetilir, bayatlayamaz\n');
  console.log(`BASILMAYI BEKLEYEN TOPLAM: ${toplamBekleyen} kare\n`);

  for (const r of sonuc) {
    const durum = r.bekleyen.length === 0 ? '✓ tamam' : `${r.bekleyen.length} bekliyor`;
    console.log(`${'─'.repeat(72)}`);
    console.log(`${r.proje}`);
    console.log(`  yazılı ${r.yazili.size} · basılı ${r.basili.size} · ${durum}`);
    if (!r.bekleyen.length) { console.log(); continue; }

    if (!hedef) {
      // özet mod: yalnız aralık
      const ilk = r.bekleyen[0], son = r.bekleyen[r.bekleyen.length - 1];
      const dosyalar = [...new Set(r.bekleyen.map((n) => r.yazili.get(n).dosya))];
      console.log(`  sıradaki: K${String(ilk).padStart(2, '0')} … K${String(son).padStart(2, '0')}`);
      console.log(`  dosyalar: ${dosyalar.join(' · ')}`);
      console.log(`  → kare kare liste: node scripts/basim-kuyrugu.mjs "${r.proje}"\n`);
      continue;
    }

    // tek proje: kare kare, istenirse gruplu
    const gruplar = GRUP ? Array.from({ length: Math.ceil(r.bekleyen.length / GRUP) },
      (_, i) => r.bekleyen.slice(i * GRUP, (i + 1) * GRUP)) : [r.bekleyen];
    gruplar.forEach((g, gi2) => {
      if (GRUP) console.log(`\n  ── BATCH ${gi2 + 1}/${gruplar.length} · ${g.length} kare ──`);
      for (const n of g) {
        const y = r.yazili.get(n);
        console.log(`  [ ] K${String(n).padStart(2, '0')}  ${y.dosya}:${y.satir}`);
        console.log(`        ${y.baslik}`);
      }
    });
    console.log();
  }

  console.log('─'.repeat(72));
  console.log('Basılan kare `images/<n>.png` olarak kaydedilir — kuyruk kendiliğinden kısalır.');
  console.log('İnen PNG\'yi elle adlandırma: node scripts/kare-yakala.mjs --izle');
  console.log('Basmadan önce: prompt-lint yeşil mi? Basıldıktan sonra: /mamilas-denetim\n');
}
