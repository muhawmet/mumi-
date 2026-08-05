#!/usr/bin/env node
// FRAME İMZASI — final motion bloğuna gerçek karenin kimliğini basar.
//
// NEDEN VAR: `PROMPT-YASASI:817` *"görmediğin kareye motion yazma — revize edilmiş kare de
// dahil"* diyordu ve HİÇBİR ŞEY ölçmüyordu. Teslim edilen motion dosyalarında tek bir kare
// yolu yoktu; "kareyi Read ile açtım" iddiası serbest metin olarak yazılıyor ve
// doğrulanamıyordu. SHA-256 mekanizması repoda zaten vardı (`mamilas-command.mjs:850`) ama
// runner hattındaydı ve İCRAAT'ta hiç koşmuyordu. Bu betik o bağlantıyı kurar.
//
// NE YAPAR: her `### K<n>` bloğunun altına tek satır ekler —
//     frame: images/<n>.png · sha256:<ilk 16 hane>
// Blok `YENİDEN-BASIM` / `MOTION INTENT` işaretliyse DOKUNMAZ: o bir teslim değil, niyet.
// Karesi diskte yoksa da dokunmaz ve RAPOR EDER — sessizce atlamak, ölçüyü yalan yapar.
//
// NE YAPMAZ: prompt metnine dokunmaz, blok sırasını değiştirmez, kare SEÇMEZ.
// Eşleme tek kuraldır: `K<n>` → `images/<n>.png`. Kural tutmuyorsa betik durur, tahmin etmez.
//
// Kullanım:
//   node scripts/frame-imza.mjs <MOTION dosyası|dizini> [--yaz]
// `--yaz` verilmezse yalnız NE OLACAĞINI basar (kuru koşu varsayılan).

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';

const HEAD_RE = /^(?:#{1,6}\s*K\s*(\d{1,3})\b|K\s*(\d{1,3})\s*(?:[|·:]|$))/;
const INTENT_RE = /YENİDEN[- ]?BASIM|MOTION\s+INTENT/i;
const FRAME_RE = /^\s*frame:\s*\S+/im;
const SHA_UZUNLUK = 16;

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, SHA_UZUNLUK);

/** `<proje>/MOTION/x.txt` → `<proje>/images` */
function imagesDir(motionPath) {
  const proje = resolve(dirname(motionPath), '..');
  for (const ad of ['images', 'Resimler', 'resimler']) {
    const d = join(proje, ad);
    if (existsSync(d)) return { dir: d, rel: ad };
  }
  return null;
}

export function damgala(metin, { imgDir, imgRel }) {
  const lines = metin.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const rapor = { damgalandi: [], intent: [], karesiz: [], zaten: [] };

  for (let i = 0; i < lines.length; i += 1) {
    out.push(lines[i]);
    const m = lines[i].trim().match(HEAD_RE);
    if (!m) continue;
    const no = m[1] ?? m[2];

    // Bloğun gövdesi: bir sonraki başlığa kadar.
    let j = i + 1;
    while (j < lines.length && !HEAD_RE.test(lines[j].trim())) j += 1;
    const govde = lines.slice(i + 1, j).join('\n');

    if (INTENT_RE.test(govde)) { rapor.intent.push(no); continue; }
    if (FRAME_RE.test(govde)) { rapor.zaten.push(no); continue; }

    const png = join(imgDir, `${no}.png`);
    if (!existsSync(png)) { rapor.karesiz.push(no); continue; }

    out.push(`frame: ${imgRel}/${no}.png · sha256:${sha(png)}`);
    rapor.damgalandi.push(no);
  }
  return { metin: out.join('\n'), rapor };
}

const dosyalar = (h) => (statSync(h).isDirectory()
  ? readdirSync(h).filter((f) => /\.(txt|md)$/i.test(f)).sort().map((f) => join(h, f))
  : [h]);

function main() {
  const argv = process.argv.slice(2);
  const hedef = argv.find((a) => !a.startsWith('--'));
  const yaz = argv.includes('--yaz');
  if (!hedef || !existsSync(hedef)) {
    process.stdout.write('kullanım: node scripts/frame-imza.mjs <dosya|dizin> [--yaz]\n');
    process.exit(1);
  }

  let toplam = 0;
  for (const f of dosyalar(hedef)) {
    const img = imagesDir(f);
    if (!img) {
      process.stdout.write(`⛔ images/ bulunamadı: ${f}\n   Kare dizini yoksa damga uydurulamaz.\n`);
      process.exit(1);
    }
    const ham = readFileSync(f, 'utf8');
    const { metin, rapor } = damgala(ham, { imgDir: img.dir, imgRel: img.rel });
    const d = rapor.damgalandi.length;
    toplam += d;
    process.stdout.write(
      `${basename(f)} — damgalanan ${d}`
      + ` · zaten imzalı ${rapor.zaten.length}`
      + ` · MOTION INTENT ${rapor.intent.length}`
      + (rapor.karesiz.length ? ` · 🔴 KARESİZ ${rapor.karesiz.length} (K${rapor.karesiz.join(' K')})` : '')
      + '\n',
    );
    if (yaz && d) writeFileSync(f, metin, 'utf8');
  }
  process.stdout.write(yaz
    ? `\n✅ yazıldı — toplam ${toplam} blok imzalandı.\n`
    : `\n(kuru koşu — ${toplam} blok imzalanacak. Yazmak için --yaz ver.)\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
