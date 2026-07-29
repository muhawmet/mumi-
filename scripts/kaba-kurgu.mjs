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
import { execFileSync, execSync } from 'node:child_process';

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

// ---------- 2b. TAM VO CÜMLESİ — plandaki metin kısaltılmış olabilir ----------
// EDIT-PLAN satırları "...ekranda beliren sayıyı" gibi KISALTILMIŞ yazılır ve birleşik beat'lerin
// (K04 = S4+S5) yalnız ikinci yarısını taşır. Metin eşleme bu yüzden kayıyordu: "O gün fen
// dersinde..." cümlesi hiçbir kareye eşleşmeyip önceki karede kalıyordu.
// Tam cümleler PROMPTLAR dosyalarının kare başlıklarında duruyor:
//   `Kare 4 — "O gün fen dersinde ... bambaşka iki kavramdı." (start frame · B4+B5 merge)`
//   `K09 | "Kütlenin birimi kilogramdı..." | yazı: "kg" ve "g"`
// DİKKAT: ‘ ve ’ BURAYA GİRMEZ. Türkçede ’ kesme işaretidir (Dünya’da, Newton’dı) —
// tırnak sayınca cümle oradan kırpılıyor, kısa kalıyor ve zenginleştirme sessizce düşüyordu.
// Kanıt: K23 "Bir astronotun kütlesi Dünya" diye kesildi, K22 onun cümlelerini yuttu.
const TIRNAK = /[«»"“”]/;
// Proje klasörü VE bir üstü taranır: prompt dosyaları bazen COMMAND-INBOX kökünde kalıyor
// (Kütle'de öyleydi). Elle symlink kurmak bir sonraki videoda unutulur — kendi bulsun.
const promptAdaylari = [];
for (const dir of [PROJE, resolve(PROJE, '..')]) {
  let liste; try { liste = readdirSync(dir); } catch { continue; }
  for (const f of liste) if (/PROMPTLAR|START-FRAME/i.test(f) && /\.(txt|md)$/i.test(f)) promptAdaylari.push(join(dir, f));
}
for (const yol of promptAdaylari) {
  let metin;
  try { metin = readFileSync(yol, 'utf8'); } catch { continue; }
  for (const ln of metin.replace(/\r\n/g, '\n').split('\n')) {
    const km = ln.match(/^\s*(?:Kare\s*(\d+)|K(\d+))\s*[—\-|]/i);
    if (!km) continue;
    const no = parseInt(km[1] || km[2], 10);
    const hedef = kareler.find((kr) => kr.k === no);
    if (!hedef) continue;
    // satırdaki ilk tırnaklı bloğu al (tırnak çeşidi ne olursa olsun)
    const parca = ln.split(TIRNAK);
    const aday = parca.length >= 3 ? parca[1].trim() : '';
    if (aday.length > (hedef.vo || '').length) hedef.vo = aday;
  }
}

// ---------- 3. Klipleri bul ----------
const klipDir = resolve(flag('klipler', join(PROJE, 'klipler')));
const VIDEO_EXT = ['.mp4', '.mov', '.m4v'];
let klipler = [];
if (existsSync(klipDir) && statSync(klipDir).isDirectory()) {
  klipler = readdirSync(klipDir).filter((f) => VIDEO_EXT.includes(extname(f).toLowerCase()));
}
// K numarasına göre eşle: dosya adındaki İLK sayı grubu = kare numarası.
// Bir kareye BİRDEN FAZLA klip düşebilir: Mami uzattığı klipleri "8b.mp4" diye koyuyor
// (b = yeni ve hedef süreli, normali eski). Hepsini topla — hangisinin kullanılacağına
// slot süresi belli olduktan sonra karar verilir (bkz. 5d: en iyi oturanı seç).
const klipAdaylari = new Map();
for (const f of klipler) {
  const n = basename(f).match(/(\d+)/);
  if (!n) continue;
  const k = parseInt(n[1], 10);
  if (!klipAdaylari.has(k)) klipAdaylari.set(k, []);
  klipAdaylari.get(k).push(join(klipDir, f));
}
// geriye dönük uyumluluk: tek dosya bekleyen yerler için ilk adayı veren görünüm
const klipByK = new Map([...klipAdaylari].map(([k, v]) => [k, v[0]]));

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

// ---------- 4b. ÇÖZÜNÜRLÜK — tahmin etme, ÖLÇ ----------
// 2026-07-28: 1920x1080 varsaymıştım, Kling klipleri 1924x1076 çıktı — Premiere medyayı
// beyan edilen ölçüye zorlayınca görüntü esniyordu. Beyan artık ölçümden gelir.
// SEQUENCE standart 1920x1080. Klip boyutu BEYAN EDİLMEZ — Premiere gerçek medyadan okur;
// beyan ettiğim an medyayı o ölçüye zorluyordu ve görüntü esniyordu (Mami'nin gördüğü kusur).
// Mami: "sen çözünürlüğüne dokunma videoların, ben sonradan biraz büyütünce hepsi oturuyor."
const EN = parseInt(flag('en', '1920'), 10);
const BOY = parseInt(flag('boy', '1080'), 10);
let klipEn = null, klipBoy = null;
if (ffprobe && klipByK.size) {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0', [...klipByK.values()][0]], { encoding: 'utf8' }).trim();
    const [w, h] = out.split(',').map(Number);
    if (w && h) { klipEn = w; klipBoy = h; }
  } catch { /* yut */ }
}
const timebase = Math.round(fps);
const ntsc = Math.abs(fps - timebase) > 0.01;

// ---------- 5. Ses dosyalarını BUL (bayrak verilmediyse kendi ara) ----------
const SES_EXT = ['.mp3', '.wav', '.m4a', '.aac', '.flac'];
const sesAdaylari = [];
for (const dir of [klipDir, PROJE]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (SES_EXT.includes(extname(f).toLowerCase())) sesAdaylari.push(join(dir, f));
  }
}
const sureOf = (p) => {
  if (!ffprobe) return null;
  try {
    return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', p], { encoding: 'utf8' }).trim());
  } catch { return null; }
};
// VO = adında elevenlabs/vo geçen, yoksa EN UZUN ses. Müzik = adında suno geçen, yoksa diğerlerinin en uzunu.
let voDosya = flag('vo', null);
// `--muzik "<dosya>@<sn>"` yerleşim biçimi de gelebilir — ham hâli diskte yok, `@`den önce kes.
// Kesilmezse ffprobe var olmayan yola çağrılır ve karneye anlamsız bir hata satırı düşer.
let muzikDosya = (() => {
  const ham = flag('muzik', null);
  if (!ham || existsSync(resolve(ham))) return ham;
  const at = ham.lastIndexOf('@');
  const kirpik = at > 0 ? ham.slice(0, at) : ham;
  return existsSync(resolve(kirpik)) ? kirpik : null;
})();
if (!voDosya) {
  voDosya = sesAdaylari.find((p) => /elevenlabs|_vo\b|seslendirme|voice/i.test(basename(p)))
    || sesAdaylari.slice().sort((a, b) => (sureOf(b) || 0) - (sureOf(a) || 0))[0] || null;
}
if (!muzikDosya) {
  muzikDosya = sesAdaylari.find((p) => p !== voDosya && /suno|muzik|music|track/i.test(basename(p)))
    || sesAdaylari.filter((p) => p !== voDosya).sort((a, b) => (sureOf(b) || 0) - (sureOf(a) || 0))[0] || null;
}
const voToplam = voDosya ? sureOf(resolve(voDosya)) : null;
const muzikSure = muzikDosya ? sureOf(resolve(muzikDosya)) : null;

// ÇOK PARÇALI MÜZİK — `--muzik "<dosya>@<sn>"` birden fazla kez verilebilir.
// Suno bir üretimde iki varyant döndürüyor; ikisi de kendi sonuyla biten TAM parçalar.
// Döngülemek yerine her birini dramaturjiye göre yerleştirmek doğrusu (ölçüm: her iki parça da
// "clear ending, not a seamless loop"). @ yoksa eski davranış (tek parça, gerekirse döngü) sürer.
const muzikArgs = argv.reduce((acc, a, i) => {
  if (a === '--muzik' && argv[i + 1] && !argv[i + 1].startsWith('--')) acc.push(argv[i + 1]);
  return acc;
}, []);
const muzikYerlesim = muzikArgs
  .map((s) => {
    const at = s.lastIndexOf('@');
    if (at < 1) return null;
    const sn = parseFloat(s.slice(at + 1));
    if (!Number.isFinite(sn)) return null;
    const p = s.slice(0, at);
    return existsSync(resolve(p)) ? { dosya: p, bas: sn, sure: sureOf(resolve(p)) } : null;
  })
  .filter(Boolean);

// ---------- 5b. VO'yu CÜMLELERE böl (nefes boşluğundan) ----------
// 2026-07-28 ölçümü: plan tahmini gerçek VO'dan sistematik olarak uzun çıkıyor
// (Sabit Sürat 312→275, Kütle 213→180). Tahmin yerine SESİN KENDİSİ otorite olsun.
// Yöntem: silencedetect tüm boşlukları verir (nefes + cümle karışık); cümle sınırı olarak
// EN UZUN (kare sayısı-1) boşluk seçilir — böylece segment sayısı kare sayısına birebir oturur.
let voSegment = null;
let voHizaKaynak = '';

// ---------- 5a. WHISPER — sesi gerçekten yazıya dök (varsa) ----------
// silencedetect yalnız "burada sessizlik var" der; nefes ile cümle sonunu ayırt edemez.
// whisper CÜMLEYİ bilir — sınırları tahmin değil ölçüm olur. Yerel çalışır, internete gitmez.
// Transkript proje klasörüne yazılır ve tekrar kullanılır (whisper yavaştır, bir kez koşsun).
let whisperSinir = null;
let whisperSeg = null;
const whisperCli = (() => { try { execFileSync('whisper-cli', ['-h'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const MODEL = join(process.env.HOME || '', '.cache/whisper/ggml-medium.bin');
if (voDosya && whisperCli && existsSync(MODEL) && !has('tahmin')) {
  const trBase = join(PROJE, `${basename(projeArg || 'proje')}—VO-transkript`);
  try {
    if (!existsSync(trBase + '.srt')) {
      console.log('   🎙  whisper VO\'yu yazıya döküyor (ilk sefer, birkaç dakika)...');
      // 16 kHz mono wav'a çevir (whisper.cpp bunu ister)
      const wav = join(PROJE, '.vo-16k.wav');
      execSync(`ffmpeg -y -v error -i ${JSON.stringify(resolve(voDosya))} -ar 16000 -ac 1 -c:a pcm_s16le ${JSON.stringify(wav)}`);
      execSync(`whisper-cli -m ${JSON.stringify(MODEL)} -f ${JSON.stringify(wav)} -l tr -osrt -of ${JSON.stringify(trBase)} 2>&1`,
        { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
      try { execSync(`rm -f ${JSON.stringify(wav)}`); } catch { /* yut */ }
    }
    const srt = readFileSync(trBase + '.srt', 'utf8');
    // SRT zaman satırı: 00:00:03,660 --> 00:00:11,420
    const t2s = (t) => { const [h, m, rest] = t.split(':'); const [s, ms] = rest.split(','); return (+h) * 3600 + (+m) * 60 + (+s) + (+ms) / 1000; };
    const seg = [];
    for (const m of srt.matchAll(/(\d\d:\d\d:\d\d,\d+)\s*-->\s*(\d\d:\d\d:\d\d,\d+)\s*\n([\s\S]*?)(?=\n\n|\n*$)/g)) {
      seg.push({ bas: t2s(m[1]), son: t2s(m[2]), metin: m[3].replace(/\s+/g, ' ').trim() });
    }
    if (seg.length >= 2) {
      whisperSeg = seg;
      whisperSinir = [];
      for (let i = 0; i < seg.length - 1; i++) whisperSinir.push({ orta: (seg[i].son + seg[i + 1].bas) / 2, sure: seg[i + 1].bas - seg[i].son });
    }
  } catch (e) { console.log(`   ⚠ whisper koşamadı (${String(e.message).slice(0, 60)}) — sessizlik ölçümüne düşülüyor`); }
}

if (voDosya && ffprobe && !has('tahmin')) {
  try {
    // ffmpeg silencedetect'i STDERR'e yazar — execFileSync yalnız stdout döner, o yüzden
    // kabuk üzerinden 2>&1 ile birleştiriyoruz. (İlk yazımda bu kaçtı, hizalama sessizce düştü.)
    const log = execSync(`ffmpeg -i ${JSON.stringify(resolve(voDosya))} -af silencedetect=noise=-35dB:d=0.25 -f null - 2>&1`,
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const bosluk = [];
    const re = /silence_start:\s*([\d.]+)[\s\S]*?silence_end:\s*([\d.]+)/g;
    let m;
    while ((m = re.exec(log))) {
      const s = parseFloat(m[1]), e = parseFloat(m[2]);
      bosluk.push({ s, e, orta: (s + e) / 2, sure: e - s });
    }
    // ═══ METİN EŞLEME — VO nokta atışı ═══
    // Oranla tahmin kayıyordu (Mami: "6. video girdikten çok sonra 'kuvvet' diyor").
    // Doğrusu: whisper'ın çıkardığı CÜMLE METNİNİ plandaki cümleyle eşleştir, klibi o cümlenin
    // GERÇEK başlangıç saniyesine oturt. Artık tahmin değil, sesin kendisinden okuma.
    const norm = (t) => (t || '').toLocaleLowerCase('tr')
      .replace(/\([^)]*\)/g, ' ').replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ').trim();
    const tok = (t) => norm(t).split(' ').filter((w) => w.length >= 4);

    if (whisperSeg && whisperSeg.length >= 2 && voToplam) {
      // Her transkript CÜMLESİNİ bir kareye ata (ileri-monoton). Kare, kendisine atanan ilk
      // cümlede başlar. Bu yön her iki birleşimi de doğru çözer: bir kare iki cümle taşıyorsa
      // ikisi de ona düşer; plandaki metin kısaltılmışsa komşu cümle yanlış kareye kaymaz.
      const segTok = whisperSeg.map((g) => new Set(tok(g.metin)));
      const kareTok = kareler.map((kr) => tok(kr.vo));
      const skor = (i, j) => {
        const kt = kareTok[i];
        if (!kt.length) return 0;
        let ortak = 0;
        for (const w of kt) if (segTok[j].has(w)) ortak++;
        return ortak / kt.length;
      };
      const atama = new Array(whisperSeg.length).fill(0);
      let cur = 0;
      for (let j = 0; j < whisperSeg.length; j++) {
        // kalan kare sayısı kalan cümleden fazlaysa ilerlemek zorunlu
        const zorunlu = (kareler.length - 1 - cur) >= (whisperSeg.length - j);
        let en = cur, enS = skor(cur, j);
        for (let i = cur + 1; i < Math.min(kareler.length, cur + 4); i++) {
          const sc = skor(i, j);
          if (sc > enS + 0.05) { enS = sc; en = i; }
        }
        if (zorunlu && en === cur) en = Math.min(cur + 1, kareler.length - 1);
        cur = en;
        atama[j] = cur;
      }
      const ilkSeg = new Array(kareler.length).fill(-1);
      for (let j = whisperSeg.length - 1; j >= 0; j--) ilkSeg[atama[j]] = j;
      const baslangic = kareler.map((_, i) => ({ t: ilkSeg[i] >= 0 ? whisperSeg[ilkSeg[i]].bas : null, kesin: ilkSeg[i] >= 0 }));
      baslangic[0].t = 0;
      for (let i = 0; i < baslangic.length; i++) {
        if (baslangic[i].t !== null) continue;
        let a2 = i - 1; while (a2 >= 0 && baslangic[a2].t === null) a2--;
        let b2 = i + 1; while (b2 < baslangic.length && baslangic[b2].t === null) b2++;
        const solT = a2 >= 0 ? baslangic[a2].t : 0;
        const sagT = b2 < baslangic.length ? baslangic[b2].t : voToplam;
        baslangic[i].t = solT + ((sagT - solT) * (i - a2)) / ((b2 < baslangic.length ? b2 : baslangic.length) - a2);
      }
      voSegment = [];
      for (let i = 0; i < kareler.length; i++) {
        const bas = Math.max(0, baslangic[i].t);
        const son = i + 1 < kareler.length ? Math.max(bas + 0.4, baslangic[i + 1].t) : voToplam;
        voSegment.push({ bas, son });
      }

      // ---------- NEFES BOŞLUĞUNDA KESİM ----------
      // Mami (2026-07-29): "nefes boşluklarını güzel kes, video tırtıklanmış yine, süreleri
      // yetmiyor diye — elimle düzeltemem."
      //
      // Kusur yukarıdaki `son` satırındaydı: yuva SONRAKİ CÜMLENİN BAŞLADIĞI yerde bitiyordu,
      // yani her klip kendi cümlesinden sonraki nefesin TAMAMINI taşımak zorundaydı. Uzun nefes
      // = şişmiş yuva = klip yetişemiyor = yavaşlatma ya da donuk kare.
      //
      // Oysa malzeme kıt değil: 50 klip toplamı 331s, VO 295s — 36 saniye FAZLA var, yanlış
      // dağıtılmış. Nefes bir kimsenin malı değil; kesim onun İÇİNDE, iki klibi de doyuran
      // yere kayabilir. Sınır yalnız nefes penceresinde oynar — konuşmanın üstüne asla binmez.
      const KB = Math.max(0, parseFloat(flag('kirp-bas', '0.5')) || 0);
      const konusmaSonu = new Array(kareler.length).fill(null);
      for (let j = 0; j < whisperSeg.length; j++) {
        const i = atama[j];
        if (i >= 0 && (konusmaSonu[i] === null || whisperSeg[j].son > konusmaSonu[i])) konusmaSonu[i] = whisperSeg[j].son;
      }
      const kapasiteSn = (i) => {
        const p = klipByK.get(kareler[i].k);
        const s = (p && ffprobe) ? (sureOf(p) || 0) : 0;
        return s > 0 ? Math.max(0.5, s - KB) : Infinity;   // ölçemediysen sınır koyma
      };
      let kaydi = 0;
      for (let i = 0; i < kareler.length - 1; i++) {
        const nefesBas = konusmaSonu[i];
        if (nefesBas === null) continue;
        const sinir = voSegment[i].son;
        const pencere = sinir - nefesBas;
        if (pencere <= 0.15) continue;                      // gerçek bir nefes yok
        const kap = kapasiteSn(i);
        if (!Number.isFinite(kap)) continue;
        const gerek = voSegment[i].bas + kap;               // bu klibin doyduğu an
        if (gerek >= sinir - 0.02) continue;                // zaten yetiyor, dokunma
        // Konuşmanın hemen ardına 0.12s bırak — kesim hecenin üstüne düşmesin.
        const yeni = Math.max(nefesBas + 0.12, Math.min(sinir, gerek));
        if (sinir - yeni < 0.08) continue;                  // kazanç kırıntı, kesimi oynatma
        voSegment[i].son = yeni;
        voSegment[i + 1].bas = yeni;
        kaydi++;
      }
      if (kaydi) console.log(`   🫁 nefes boşluğunda kesim: ${kaydi} sınır kaydırıldı — açık kalan klip komşusunun nefesinden besleniyor`);
      if (has('ayrinti')) {
        for (let i = 0; i < kareler.length; i++) {
          const segs = atama.map((a, j) => (a === i ? j : -1)).filter((x) => x >= 0);
          console.log(`   K${String(kareler[i].k).padStart(2,'0')} ${voSegment[i].bas.toFixed(1)}-${voSegment[i].son.toFixed(1)} (${(voSegment[i].son-voSegment[i].bas).toFixed(1)}s) seg[${segs.join(',')}] ${(kareler[i].vo||'').slice(0,38)}`);
        }
      }
      voHizaKaynak = `whisper metin eşleme — ${baslangic.filter((x) => x.kesin).length}/${kareler.length} kare cümlesine oturdu`;
    }
  } catch { /* yut — tahmine düş */ }
}

// ---------- 5c. Kesim boyları ----------
const sn2fr = (s) => Math.max(1, Math.round(s * fps));

// BAŞ KIRPMA — Mami yasası (2026-07-29): "ai videolarının başlarındaki ilk yarım saniye sikten
// oluyor." i2v motoru start frame'i ilk kare olarak basıyor; hareket henüz başlamadığı için o
// yarım saniye donuk duruyor. Her klipte kesilir.
//
// İKİNCİ KAZANÇ: kırpma geçiş için gereken HANDLE'ı üretir. Dissolve ancak klibin in noktasının
// ÖNCESİNDE medya kalırsa mümkün; kırpmasız 50 klibin 2'sinde handle vardı, kırpmayla 50'sinde de var.
const KIRP_BAS = Math.max(0, parseFloat(flag('kirp-bas', '0.5')) || 0);
const kirpFr = sn2fr(KIRP_BAS) - (KIRP_BAS > 0 ? 0 : 1); // 0 istenirse gerçekten 0
const GECIS = Math.max(0, parseFloat(flag('gecis', '0')) || 0);

let cursor = 0;
const items = kareler.map((kr, i) => {
  // Otorite sırası: gerçek VO segmenti > plan tahmini
  const seg = voSegment ? voSegment[i] : null;
  const hedefSn = seg ? (seg.son - seg.bas) : Math.max(kr.klipSn, kr.voSn);
  const durFr = sn2fr(hedefSn);
  // Kaynak boyu: ffprobe ile ÖLÇÜLEN gerçek > plandaki beyan. Kırpma matematiği tahminle yapılmaz.
  const dosyaOn = klipByK.get(kr.k) || null;
  const olculenSn = (ffprobe && dosyaOn) ? (sureOf(dosyaOn) || 0) : 0;
  const srcFr = sn2fr(olculenSn || kr.klipSn);
  // Kırpma ZORUNLU — Mami'nin yasası "her klipte, istisnasız". Yer açığını hız kapatır:
  // 5s klip 5s yuvada %90 hızla oynar, göz bunu fark etmez; çirkin yarım saniyeyi fark eder.
  // Tek sınır kaynağın kendisi — geriye en az 1 saniye kalmalı, yoksa kırpma klibi yer.
  const kirp = Math.max(0, Math.min(kirpFr, srcFr - sn2fr(1)));
  const kaynakFr = Math.max(1, srcFr - kirp);
  // Klip yere sığmıyorsa YAVAŞLAT. Eskiden `out`u kırpıyordum → Premiere kalan yeri
  // "medya yok" çizgisiyle dolduruyordu ve orada görüntü donuyordu (Mami'nin gördüğü kusur).
  // FCP7'de hız = (kaynak kare / timeline kare) × 100. Taban %35 — altında hareket sürünür.
  // Klip yere sığıyorsa NORMAL HIZ (çoğu kare böyle). Sığmıyorsa yavaşlatılır — çünkü
  // alternatifi tırtık, yani kararan ekran. Birleşik beat'lerde (K08 = S8+S9) cümle 10s,
  // klip 5s: matematik başka çıkış bırakmıyor. Yalnız GEREKTİĞİ KADAR yavaşlatılır.
  const gerekenHiz = (kaynakFr / durFr) * 100;
  const hiz = gerekenHiz >= 99.5 ? 100 : Math.max(45, gerekenHiz);
  const kullanilanKaynak = Math.min(kaynakFr, Math.round(durFr * (hiz / 100)));
  const it = {
    ...kr, i,
    start: cursor,
    end: cursor + durFr,
    inFr: kirp,
    outFr: kirp + kullanilanKaynak,
    kirp,                                   // uygulanan baş kırpma (kare)
    kirpIstendi: kirpFr,                    // istenen — sığmadıysa fark karneye düşer
    srcFr,                                  // ölçülen kaynak boyu
    kuyrukHandle: srcFr - (kirp + kullanilanKaynak),  // geçiş için sondaki artık
    hiz,
    dosya: dosyaOn,
    gercekSn: hedefSn,
    tasma: hiz <= 35.001 && gerekenHiz < 35, // taban bile yetmedi → gerçek boşluk
    yavas: hiz < 99.5,
  };
  cursor += durFr;
  return it;
});
const toplamFr = cursor;

// ---------- 5d. KOMŞUDAN ÖDÜNÇ — yavaşlatmadan önceki son çare ----------
// Mami (2026-07-28): "35'i tekrar üretmeme gerek yok, boşa masraf — 34-35 arası ahenk yaparsın."
// Klip VO'suna yetmiyorsa, ÖNCEKİ klibin artan malzemesi varsa sınır geriye kaydırılır:
// önceki klip daha uzun oynar, bu klip geç başlar. Ses görüntüden önce girer — bu bir kusur
// değil, standart kurgu (VO lead). Böylece ne yavaşlatma ne yeniden üretim gerekir.
const sureCache = new Map();
const sureOfCached = (p) => {
  if (!sureCache.has(p)) sureCache.set(p, sureOf(p) || 0);
  return sureCache.get(p);
};
const klipSuresi = (it) => {
  if (!it.dosya || !ffprobe) return it.klipSn;
  return sureOfCached(it.dosya) || it.klipSn;
};

// EN İYİ KLİBİ SEÇ — bir kareye birden fazla dosya düşmüşse (8.mp4 + 8b.mp4).
// Kural: slot'u KARŞILAYAN adaylardan EN KISASI (fazla malzeme boşa gitmesin);
// hiçbiri karşılamıyorsa EN UZUNU (en az yavaşlatma gerektiren).
// Mami: "b'ler istediğin süreler, normalleri eski."
for (const it of items) {
  const adaylar = klipAdaylari.get(it.k);
  if (!adaylar || adaylar.length < 2 || !ffprobe) continue;
  const slotSn = (it.end - it.start) / fps;
  const olculu = adaylar.map((p) => ({ p, s: sureOfCached(p) })).filter((x) => x.s > 0);
  if (!olculu.length) continue;
  const yeten = olculu.filter((x) => x.s >= slotSn - 0.05).sort((a, b) => a.s - b.s);
  const secim = yeten.length ? yeten[0] : olculu.slice().sort((a, b) => b.s - a.s)[0];
  if (secim.p !== it.dosya) { it.dosya = secim.p; it.klipSecildi = basename(secim.p); }
}
// Ödünç hesabı da KIRPMA SONRASI boya bakar — baş kırpma klibin malzemesini gerçekten azaltır.
const kullanilabilirSn = (it) => Math.max(0, klipSuresi(it) - it.kirp / fps);
for (let i = 1; i < items.length; i++) {
  const it = items[i];
  const kaynakSn = kullanilabilirSn(it);
  const slotSn = (it.end - it.start) / fps;
  const acik = slotSn - kaynakSn;
  if (acik <= 0.05) continue;                    // yetiyor
  const onc = items[i - 1];
  const oncKaynak = kullanilabilirSn(onc);
  const oncSlot = (onc.end - onc.start) / fps;
  const oncArtan = oncKaynak - oncSlot;          // öncekinin kullanılmayan malzemesi
  if (oncArtan <= 0.05) continue;                // öncekinde de yok
  const odunc = Math.min(acik, oncArtan);
  const oduncFr = Math.round(odunc * fps);
  onc.end += oduncFr;                            // önceki daha uzun oynar
  onc.outFr = Math.min(onc.kirp + sn2fr(oncKaynak), onc.outFr + oduncFr);
  it.start += oduncFr;                           // bu klip geç başlar (VO önden girer)
  it.oduncAldi = odunc;
}
// ödünç sonrası hızları yeniden hesapla
//
// 🔴 KIRPMA BURADA DA SAYILIR. 2026-07-29'da bu döngü kırpmadan habersizdi: `outFr`u kırpmayı
// EKLEMEDEN yazıyordu, `inFr` ise kirp'ti — yani her klip yuvasının tam olarak kirp kadarını boş
// bırakıyordu. Mami'nin gördüğü kusur buydu: "video tırtıklanmış yine, süreleri yetmiyor."
// 50 karenin 50'sinde birden, tam 0.5s. Ölçüm: yuva 6.5s / klip 6.0s, elli kez.
// Ders: bir klibin KULLANILABİLİR boyu ham kaynak değil, ham kaynak eksi kırpmadır.
for (const it of items) {
  const slotFr = it.end - it.start;
  const kullanilabilir = Math.max(1, sn2fr(klipSuresi(it)) - it.kirp);
  const gereken = (kullanilabilir / slotFr) * 100;
  it.hiz = gereken >= 99.5 ? 100 : Math.max(45, gereken);
  it.outFr = it.kirp + Math.min(kullanilabilir, Math.round(slotFr * (it.hiz / 100)));
  it.kuyrukHandle = it.srcFr - it.outFr;
  it.yavas = it.hiz < 99.5;
}

// ---------- 6. XML ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pathurl = (abs) => 'file://localhost' + abs.split('/').map((p, i) => (i === 0 ? p : encodeURIComponent(p))).join('/');
const rate = () => `<rate><timebase>${timebase}</timebase><ntsc>${ntsc ? 'TRUE' : 'FALSE'}</ntsc></rate>`;
// KARE PİKSEL — Premiere 1924x1076'yı görünce "D1/DV PAL (1.0940)" sanıp pikselleri %9 geriyordu.
// Kenarlardaki siyahın ve esnemenin gerçek sebebi buydu. Açıkça square beyan ediyoruz.
const parBlok = '<pixelaspectratio>square</pixelaspectratio>';

const projeAd = basename(PROJE);
const videoParcalar = items.map((it, n) => {
  if (!it.dosya) return `        <!-- K${String(it.k).padStart(2, '0')} klip YOK (${esc(it.kareDosya)}) — ${(it.end - it.start)} kare boşluk -->`;
  return `        <clipitem id="ci-${n}">
          <name>${esc(basename(it.dosya))}</name>
          <enabled>TRUE</enabled>
          <duration>${it.srcFr}</duration>
          ${rate()}
          <start>${it.start}</start>
          <end>${it.end}</end>
          <in>${it.inFr}</in>
          <out>${it.outFr}</out>
          <file id="f-${n}">
            <name>${esc(basename(it.dosya))}</name>
            <pathurl>${esc(pathurl(it.dosya))}</pathurl>
            ${rate()}
            <duration>${it.srcFr}</duration>
            <media><video/></media>
          </file>
          <sourcetrack><mediatype>video</mediatype><trackindex>1</trackindex></sourcetrack>${it.hiz < 99.5 ? `
          <filter>
            <effect>
              <name>Time Remap</name>
              <effectid>timeremap</effectid>
              <effectcategory>motion</effectcategory>
              <effecttype>motion</effecttype>
              <mediatype>video</mediatype>
              <parameter authoringApp="PremierePro"><parameterid>variablespeed</parameterid><name>variablespeed</name><valuemin>0</valuemin><valuemax>1</valuemax><value>0</value></parameter>
              <parameter authoringApp="PremierePro"><parameterid>speed</parameterid><name>speed</name><valuemin>-100000</valuemin><valuemax>100000</valuemax><value>${it.hiz.toFixed(4)}</value></parameter>
              <parameter authoringApp="PremierePro"><parameterid>reverse</parameterid><name>reverse</name><value>FALSE</value></parameter>
              <parameter authoringApp="PremierePro"><parameterid>frameblending</parameterid><name>frameblending</name><value>TRUE</value></parameter>
            </effect>
          </filter>` : ''}
          <comments><mastercomment1>K${String(it.k).padStart(2, '0')} — ${esc(it.vo.slice(0, 90))}</mastercomment1></comments>
        </clipitem>`;
});

// ---------- 6b. GEÇİŞLER ----------
// Mami (2026-07-29): "kaba kurgu değil güzel yap, geçişler falan."
//
// Dissolve BEDAVA DEĞİL: FCP7'de L karelik ortalanmış geçiş, giden klipten L/2 kuyruk ve gelen
// klipten L/2 baş HANDLE ister. Handle yoksa Premiere ya geçişi düşürür ya donmuş kare gösterir.
// Bu yüzden geçiş körlemesine serpilmez — iki tarafta da ÖLÇÜLMÜŞ handle varsa konur, yoksa
// sert kesim kalır. Sert kesim bir kusur değil; yanlış yere konmuş dissolve kusurdur.
//
// Baş handle'ı KIRP_BAS üretiyor (Mami'nin ilk-yarım-saniye yasası). Yani iki yasa aynı yere
// bakıyor: çirkin başlangıcı kesen kırpma, geçişin malzemesini de doğuruyor.
const gecisFr = GECIS > 0 ? sn2fr(GECIS) : 0;
const gecisler = [];
if (gecisFr > 0) {
  for (let n = 0; n < items.length - 1; n++) {
    const a = items[n], b = items[n + 1];
    if (!a.dosya || !b.dosya) continue;
    const yari = Math.floor(gecisFr / 2);
    // Ölçülmüş handle — tahmin değil.
    const yer = Math.min(a.kuyrukHandle, b.kirp);
    if (yer < yari || yari < 1) continue;
    const cut = a.end;
    gecisler.push({ n, cut, L: yari * 2, kA: a.k, kB: b.k });
  }
}
const gecisXml = (g) => `        <transitionitem>
          <start>${g.cut - g.L / 2}</start>
          <end>${g.cut + g.L / 2}</end>
          <alignment>center</alignment>
          ${rate()}
          <cutPointTicks>0</cutPointTicks>
          <effect>
            <name>Cross Dissolve</name>
            <effectid>Cross Dissolve</effectid>
            <effectcategory>Dissolve</effectcategory>
            <effecttype>transition</effecttype>
            <mediatype>video</mediatype>
            <wipecode>0</wipecode>
            <startratio>0</startratio>
            <endratio>1</endratio>
            <reverse>FALSE</reverse>
          </effect>
        </transitionitem>`;
const gecisByIdx = new Map(gecisler.map((g) => [g.n, g]));
const videoItems = videoParcalar.map((s, n) => {
  const g = gecisByIdx.get(n);
  return g ? `${s}\n${gecisXml(g)}` : s;
}).join('\n');

// Ses rayı. Kaynak videodan KISAYSA döngülenir (Suno parçası ~85s, video ~180s → 3 kopya).
//
// ⚠ DÖNGÜ HER PARÇAYA UYGUN DEĞİL. Suno parçaları sessizliğe inen NET bir sonla bitiyor
// (2026-07-29 ölçümü: ses1 ve ses2'nin ikisi de "clear ending, not a seamless loop"). Böyle bir
// parçayı 3× döngülemek üç kez sessizliğe inip üç kez yeniden başlamak demektir — duyulur hata.
// Bu yüzden `--muzik "<dosya>@<başlangıç sn>"` biçimi var: parça ölçülen yerine BİR KEZ konur.
// Birden fazla `--muzik` verilebilir; her biri kendi rayına düşer, döngü yapılmaz.
const sesTrack = (dosya, id, label, kaynakSure, basSn = null) => {
  if (!dosya || !existsSync(resolve(dosya))) return '';
  const abs = resolve(dosya);
  const kaynakFr = kaynakSure ? sn2fr(kaynakSure) : toplamFr;
  // Yerleşim verildiyse: TEK kopya, verilen yerde. Döngü yok.
  if (basSn !== null) {
    const bas = sn2fr(basSn) - (basSn > 0 ? 0 : 1);
    const b0 = Math.max(0, basSn > 0 ? sn2fr(basSn) : 0);
    const bit = Math.min(b0 + kaynakFr, toplamFr);
    if (b0 >= toplamFr || bit - b0 < fps * 0.5) return '';
    return `      <track>
        <clipitem id="${id}-0">
          <name>${esc(basename(abs))}</name>
          <enabled>TRUE</enabled>
          <duration>${kaynakFr}</duration>
          ${rate()}
          <start>${b0}</start>
          <end>${bit}</end>
          <in>0</in>
          <out>${bit - b0}</out>
          <file id="file-${id}">
            <name>${esc(basename(abs))}</name>
            <pathurl>${esc(pathurl(abs))}</pathurl>
            ${rate()}
            <duration>${kaynakFr}</duration>
            <media><audio><channelcount>2</channelcount></audio></media>
          </file>
          <sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>
          <comments><mastercomment1>${esc(label)} — ${(b0 / fps).toFixed(1)}s'de tek kez (döngü YOK)</mastercomment1></comments>
        </clipitem>
      </track>`;
  }
  const kopya = Math.max(1, Math.ceil(toplamFr / kaynakFr));
  const parcalar = [];
  for (let n = 0; n < kopya; n++) {
    const bas = n * kaynakFr;
    const bit = Math.min(bas + kaynakFr, toplamFr);
    // yuvarlamadan doğan kırıntıyı atla (yarım saniyeden kısa parça timeline'ı kirletir)
    if (bas >= toplamFr || bit - bas < fps * 0.5) break;
    parcalar.push(`        <clipitem id="${id}-${n}">
          <name>${esc(basename(abs))}${kopya > 1 ? ` (${n + 1}/${kopya})` : ''}</name>
          <enabled>TRUE</enabled>
          <duration>${kaynakFr}</duration>
          ${rate()}
          <start>${bas}</start>
          <end>${bit}</end>
          <in>0</in>
          <out>${bit - bas}</out>
          ${n === 0 ? `<file id="file-${id}">
            <name>${esc(basename(abs))}</name>
            <pathurl>${esc(pathurl(abs))}</pathurl>
            ${rate()}
            <duration>${kaynakFr}</duration>
            <media><audio><channelcount>2</channelcount></audio></media>
          </file>` : `<file id="file-${id}"/>`}
          <sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>
          <comments><mastercomment1>${esc(label)}${kopya > 1 ? ` — döngü ${n + 1}/${kopya}` : ''}</mastercomment1></comments>
        </clipitem>`);
  }
  return `      <track>\n${parcalar.join('\n')}\n      </track>`;
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
        <format><samplecharacteristics>${rate()}<width>${EN}</width><height>${BOY}</height>${parBlok}<anamorphic>FALSE</anamorphic><fielddominance>none</fielddominance></samplecharacteristics></format>
        <track>
${videoItems}
        </track>
      </video>
      <audio>
${sesTrack(voDosya, 'vo1', 'VO — ElevenLabs', voToplam)}
${muzikYerlesim.length
  ? muzikYerlesim.map((m, i) => sesTrack(m.dosya, `mzk${i + 1}`, `Müzik ${i + 1}/${muzikYerlesim.length} — Suno (VO altında ~-18 dB)`, m.sure, m.bas)).filter(Boolean).join('\n')
  : sesTrack(muzikDosya, 'mzk1', 'Müzik — Suno (VO altında ~-18 dB)', muzikSure)}
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

const mmss = (s) => { const t = Math.round(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
console.log(`\n📼 ${projeAd}`);
console.log(`   plan     : ${planDosya} → ${kareler.length} kare`);
console.log(`   klipler  : ${klipByK.size}/${kareler.length} bulundu (${klipDir})`);
console.log(`   fps      : ${fps} — ${fpsKaynak}`);
console.log(`   sequence : ${EN}x${BOY}${klipEn ? ` · klipler ${klipEn}x${klipBoy} (boyut BEYAN EDİLMEDİ — Premiere medyadan okur)` : ''}`);
if (voDosya) console.log(`   VO       : ${basename(voDosya)} → ${voToplam ? mmss(voToplam) : '?'}`);
if (muzikYerlesim.length) {
  for (const m of muzikYerlesim) {
    const son = m.bas + (m.sure || 0);
    console.log(`   müzik    : ${basename(m.dosya)} → ${mmss(m.bas)}–${mmss(son)} (${mmss(m.sure || 0)}, tek kez, döngü YOK)`);
  }
  const kapali = muzikYerlesim.reduce((n, m) => n + (m.sure || 0), 0);
  const toplamSn = toplamFr / fps;
  console.log(`      müziksiz nefes: ${mmss(Math.max(0, toplamSn - kapali))} — sessizlik kusur değil, kurgu kararı`);
} else if (muzikDosya) console.log(`   müzik    : ${basename(muzikDosya)} → ${muzikSure ? mmss(muzikSure) : '?'}${muzikSure && voToplam && muzikSure < voToplam ? ` (${Math.ceil(toplamFr / sn2fr(muzikSure))}× döngülendi)` : ''}`);
if (voSegment) {
  console.log(`   ✂ HİZALAMA: ${voHizaKaynak} → klip boyları gerçek VO cümlelerinden kesildi`);
  console.log(`      plan tahmini ${mmss(planToplam)} → gerçek ${mmss(toplamFr / fps)} · ${(planToplam - toplamFr / fps).toFixed(1)}s fazla tahmin düzeltildi`);
} else {
  console.log(`   süre     : ${mmss(planToplam)} (${toplamFr} kare) — plan tahmininden${voDosya ? ' (VO cümlelere bölünemedi)' : ''}`);
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
const secilenler = items.filter((it) => it.klipSecildi);
if (secilenler.length) console.log(`   🎬 uzatılmış klip seçildi: ${secilenler.map((e) => `K${String(e.k).padStart(2,'0')}→${e.klipSecildi}`).join(' ')}`);
const oduncler = items.filter((it) => it.oduncAldi);
if (oduncler.length) console.log(`   🤝 komşudan ödünç (yavaşlatma yerine): ${oduncler.map((e) => `K${String(e.k).padStart(2,'0')}+${e.oduncAldi.toFixed(1)}s`).join(' ')}`);
const yavaslar = items.filter((it) => it.yavas && !it.tasma);
if (yavaslar.length) console.log(`   ⏱ yavaşlatıldı (VO'ya sığsın diye): ${yavaslar.map((e) => `K${String(e.k).padStart(2,'0')}%${Math.round(e.hiz)}`).join(' ')}`);
if (tasan.length) console.log(`   🔴 %35'te bile sığmadı: ${tasan.map((e) => 'K' + String(e.k).padStart(2, '0')).join(' ')} — burada boşluk kalır`);
// BAŞ KIRPMA + GEÇİŞ karnesi — sessiz kısıntı yasak, ne düştüyse söylenir.
if (kirpFr > 0) {
  const tam = items.filter((it) => it.dosya && it.kirp >= it.kirpIstendi).length;
  const eksik = items.filter((it) => it.dosya && it.kirp < it.kirpIstendi);
  console.log(`   ✂ baş kırpma ${KIRP_BAS}s (i2v ilk-kare yasası): ${tam}/${items.filter((it) => it.dosya).length} klip tam kırpıldı`);
  if (eksik.length) console.log(`      ⚠ kaynağı yetmeyen: ${eksik.map((e) => `K${String(e.k).padStart(2,'0')}(${(e.kirp / fps).toFixed(2)}s)`).join(' ')}`);
}
if (gecisFr > 0) {
  const olasi = items.length - 1;
  console.log(`   🎞 geçiş ${GECIS}s dissolve: ${gecisler.length}/${olasi} kesime kondu — kalanı SERT kesim (iki tarafta handle yok)`);
}
console.log(`\n✅ ${ciktiYol}`);
console.log(`   Premiere: File → Import → bu .xml. Timeline kurulu gelir; kesim hükmü senin.\n`);
