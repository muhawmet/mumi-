#!/usr/bin/env node
// kaba-kurgu.mjs — EDIT-PLAN → Premiere'in doğrudan açtığı FCP7 XML (xmeml v5)
//
//   node scripts/kaba-kurgu.mjs "<proje klasörü>" [--klipler <dir>] [--fps 25] [--cikti <ad.xml>]
//   node scripts/kaba-kurgu.mjs "agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık"
//
// NEDEN VAR (2026-07-28 ölçümü): EDIT-PLAN zaten TAM kesim listesi taşıyor — klip, süre,
// timecode, VO cümlesi. Ama o metin Premiere'e hiç dosya olarak girmiyordu; Mami her videoda
// 35-44 klibi elle sürükleyip elle kırpıyordu. Bu script o metni timeline'a çevirir.
// İş "kurmak"tan "rötuş"a düşer. Hüküm hâlâ Mami'nin — XML'i silmek `rm`, medyaya dokunmaz.
//
// ÖLÇÜLEN SAPMA: Sabit Sürat planı 312.1s dedi, gerçek kurgu 275.4s çıktı (%12 fazla tahmin).
// Bu yüzden --vo verilirse kesim boyları TAHMİNDEN değil GERÇEK sesten türetilir (ffprobe).

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const projeArg = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== undefined
  ? !argv[argv.indexOf(a) - 1].startsWith('--') || ['--klipler', '--fps', '--cikti', '--vo', '--muzik'].indexOf(argv[argv.indexOf(a) - 1]) === -1
  : true);

const PROJE = resolve(projeArg || '.');
if (!existsSync(PROJE) || !statSync(PROJE).isDirectory()) {
  console.error(`❌ proje klasörü yok: ${PROJE}`);
  console.error('   kullanım: node scripts/kaba-kurgu.mjs "<proje klasörü>" [--klipler <dir>] [--fps 25]');
  process.exit(2);
}

// ---------- 1. EDIT-PLAN bul ----------
const planDosya = readdirSync(PROJE).find((f) => /EDIT-PLAN.*\.txt$/i.test(f));
if (!planDosya) {
  console.error(`❌ EDIT-PLAN bulunamadı: ${PROJE}`);
  console.error('   Bu script kurgu planından timeline üretir; plan yoksa üretecek bir şey yok.');
  process.exit(2);
}
const plan = readFileSync(join(PROJE, planDosya), 'utf8').replace(/\r\n/g, '\n');

// ---------- 2. Satırları ayrıştır ----------
// Biçim: "1.png   K01   5s   4.0s   [0:00–0:04]   VO cümlesi"
// Parser biçime dayanmaz: dosya adı + K numarası + iki süre yakalar, gerisini VO sayar.
const SATIR = /^\s*(\S+\.(?:png|jpg|jpeg))\s+K(\d+)\s+(\d+(?:\.\d+)?)s\s+(\d+(?:\.\d+)?)s\s*(?:\[[^\]]*\])?\s*(.*)$/i;
const kareler = [];
for (const ln of plan.split('\n')) {
  const m = ln.match(SATIR);
  if (!m) continue;
  kareler.push({
    kareDosya: m[1],
    k: parseInt(m[2], 10),
    klipSn: parseFloat(m[3]),
    voSn: parseFloat(m[4]),
    vo: (m[5] || '').replace(/◄.*$|⚠.*$|△.*$|✓VO.*$/g, '').trim(),
  });
}
if (!kareler.length) {
  console.error(`❌ ${planDosya} içinde kare satırı bulunamadı.`);
  console.error('   Beklenen biçim: "1.png   K01   5s   4.0s   [0:00–0:04]   VO cümlesi"');
  process.exit(2);
}
kareler.sort((a, b) => a.k - b.k);

// ---------- 3. Klipleri bul ----------
const klipDir = resolve(flag('klipler', join(PROJE, 'klipler')));
const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];
let klipler = [];
if (existsSync(klipDir) && statSync(klipDir).isDirectory()) {
  klipler = readdirSync(klipDir).filter((f) => VIDEO_EXT.includes(extname(f).toLowerCase()));
}
// K numarasına göre eşle: dosya adındaki İLK sayı grubu = kare numarası
const klipByK = new Map();
for (const f of klipler) {
  const n = basename(f).match(/(\d+)/);
  if (n) klipByK.set(parseInt(n[1], 10), join(klipDir, f));
}

// ---------- 4. fps ----------
const ffprobe = (() => { try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
let fps = parseFloat(flag('fps', '0')) || 0;
let fpsKaynak = 'bayrak';
if (!fps && ffprobe && klipByK.size) {
  const ilk = [...klipByK.values()][0];
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=r_frame_rate', '-of', 'default=nw=1:nk=1', ilk], { encoding: 'utf8' }).trim();
    const [a, b] = out.split('/').map(Number);
    if (a && b) { fps = Math.round((a / b) * 100) / 100; fpsKaynak = `klipten ölçüldü (${basename(ilk)})`; }
  } catch { /* yut */ }
}
if (!fps) { fps = 25; fpsKaynak = 'varsayılan (klip yok / ffprobe yok)'; }
const timebase = Math.round(fps);
const ntsc = Math.abs(fps - timebase) > 0.01;

// ---------- 5. Gerçek VO süresi (opsiyonel, tahmini ezer) ----------
const voDosya = flag('vo', null);
let voToplam = null;
if (voDosya && existsSync(voDosya) && ffprobe) {
  try {
    voToplam = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', resolve(voDosya)], { encoding: 'utf8' }).trim());
  } catch { /* yut */ }
}

// Kesim boyu: klip uzunluğu ile VO uzunluğunun BÜYÜĞÜ (VO taşarsa son kare uzar).
const sn2fr = (s) => Math.max(1, Math.round(s * fps));
let cursor = 0;
const items = kareler.map((kr, i) => {
  const hedefSn = Math.max(kr.klipSn, kr.voSn);
  const durFr = sn2fr(hedefSn);
  const kaynakFr = sn2fr(kr.klipSn); // üretilen klibin gerçek boyu
  const it = {
    ...kr, i,
    start: cursor,
    end: cursor + durFr,
    inFr: 0,
    outFr: Math.min(durFr, kaynakFr), // klipten fazlasını isteme; taşarsa Premiere'de freeze/uzat
    dosya: klipByK.get(kr.k) || null,
    tasma: hedefSn > kr.klipSn + 0.01,
  };
  cursor += durFr;
  return it;
});
const toplamFr = cursor;

// ---------- 6. XML ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pathurl = (abs) => 'file://localhost' + abs.split('/').map((p, i) => (i === 0 ? p : encodeURIComponent(p))).join('/');
const rate = () => `<rate><timebase>${timebase}</timebase><ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc></rate>`;

const projeAd = basename(PROJE);
const videoItems = items.map((it, n) => {
  if (!it.dosya) return `        <!-- K${String(it.k).padStart(2, '0')} klip YOK (${esc(it.kareDosya)}) — ${(it.end - it.start)} kare boşluk -->`;
  return `        <clipitem id="ci-${n}">
          <name>${esc(basename(it.dosya))}</name>
          <enabled>TRUE</enabled>
          <duration>${it.outFr}</duration>
          ${rate()}
          <start>${it.start}</start>
          <end>${it.end}</end>
          <in>${it.inFr}</in>
          <out>${it.outFr}</out>
          <file id="f-${n}">
            <name>${esc(basename(it.dosya))}</name>
            <pathurl>${esc(pathurl(it.dosya))}</pathurl>
            ${rate()}
            <duration>${it.outFr}</duration>
            <media><video><samplecharacteristics>${rate()}<width>1920</width><height>1080</height></samplecharacteristics></video></media>
          </file>
          <comments><mastercomment1>K${String(it.k).padStart(2, '0')} — ${esc(it.vo.slice(0, 90))}</mastercomment1></comments>
        </clipitem>`;
}).join('\n');

const sesTrack = (dosya, id, label) => {
  if (!dosya || !existsSync(resolve(dosya))) return '';
  const abs = resolve(dosya);
  return `      <track>
        <clipitem id="${id}">
          <name>${esc(basename(abs))}</name>
          <enabled>TRUE</enabled>
          <duration>${toplamFr}</duration>
          ${rate()}
          <start>0</start>
          <end>${toplamFr}</end>
          <in>0</in>
          <out>${toplamFr}</out>
          <file id="file-${id}">
            <name>${esc(basename(abs))}</name>
            <pathurl>${esc(pathurl(abs))}</pathurl>
            ${rate()}
            <media><audio><channelcount>2</channelcount></audio></media>
          </file>
          <comments><mastercomment1>${esc(label)}</mastercomment1></comments>
        </clipitem>
      </track>`;
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<!-- MAMILAS kaba kurgu — ${esc(planDosya)} kaynağından üretildi.
     Bu bir TASLAK timeline'dır; nihai kesim hükmü Mami'nindir. -->
<xmeml version="5">
  <sequence id="seq-1">
    <name>${esc(projeAd)} — kaba kurgu</name>
    <duration>${toplamFr}</duration>
    ${rate()}
    <timecode>${rate()}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>
    <media>
      <video>
        <format><samplecharacteristics>${rate()}<width>1920</width><height>1080</height></samplecharacteristics></format>
        <track>
${videoItems}
        </track>
      </video>
      <audio>
${sesTrack(flag('vo', null), 'vo-1', 'VO — ElevenLabs')}
${sesTrack(flag('muzik', null), 'mzk-1', 'Müzik — Suno')}
      </audio>
    </media>
  </sequence>
</xmeml>
`;

const ciktiAd = flag('cikti', `${projeAd} — kaba kurgu.xml`);
const ciktiYol = join(PROJE, ciktiAd);
writeFileSync(ciktiYol, xml, 'utf8');

// ---------- 7. Karne ----------
const eksik = items.filter((it) => !it.dosya);
const tasan = items.filter((it) => it.tasma);
const planToplam = items.reduce((n, it) => n + Math.max(it.klipSn, it.voSn), 0);

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
console.log(`\n📼 ${projeAd}`);
console.log(`   plan     : ${planDosya} → ${kareler.length} kare`);
console.log(`   klipler  : ${klipByK.size}/${kareler.length} bulundu (${klipDir})`);
console.log(`   fps      : ${fps} — ${fpsKaynak}`);
console.log(`   süre     : ${mmss(planToplam)} (${toplamFr} kare)`);
if (voToplam) {
  const fark = planToplam - voToplam;
  console.log(`   GERÇEK VO: ${mmss(voToplam)} — plan ${fark > 0 ? '+' : ''}${fark.toFixed(1)}s sapıyor`);
}
// KAPSAM DENETİMİ — plan kendi iddiasını tutuyor mu?
// 2026-07-28 ölçümü: Sabit Sürat'ın EDIT-PLAN'ı "44 klip" diyor ama yalnız 12 satır taşıyor
// (K33'ten başlıyor, ilk 32 satır yok) — ve video bu haliyle teslim edildi, kimse görmedi.
// Dosyanın VAR olması, KAPSADIĞI anlamına gelmiyor. Bu satır o sınıfı bir daha sessiz bırakmaz.
const iddia = plan.match(/(\d+)\s*klip/i);
if (iddia && parseInt(iddia[1], 10) !== kareler.length) {
  console.log(`   🔴 KAPSAM: plan kendi içinde "${iddia[1]} klip" diyor ama ${kareler.length} kare satırı var`);
  console.log(`      → plan EKSİK. Timeline yalnız bulunan ${kareler.length} kareyi taşır.`);
}
const beklenen = [];
for (let n = kareler[0].k; n <= kareler[kareler.length - 1].k; n++) {
  if (!kareler.some((kr) => kr.k === n)) beklenen.push(n);
}
if (beklenen.length) console.log(`   🔴 SIRA BOŞLUĞU: K${beklenen.join(' K')} plan içinde atlanmış`);
if (kareler[0].k !== 1) console.log(`   🔴 plan K${kareler[0].k}'ten başlıyor — K01–K${kareler[0].k - 1} arası satır yok`);

if (eksik.length) console.log(`   ⚠ klip yok: ${eksik.map((e) => 'K' + String(e.k).padStart(2, '0')).join(' ')} (XML'de boşluk bırakıldı)`);
if (tasan.length) console.log(`   ⚠ VO klibi aşıyor: ${tasan.map((e) => 'K' + String(e.k).padStart(2, '0')).join(' ')} — Premiere'de son kareyi dondur`);
console.log(`\n✅ ${ciktiYol}`);
console.log(`   Premiere: File → Import → bu .xml. Timeline kurulu gelir; kesim hükmü senin.\n`);
