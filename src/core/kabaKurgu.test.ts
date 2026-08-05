import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, test } from 'vitest';

// KABA KURGU DUVARI — kurgu kitinin beşinci parçasını (KABA-KURGU.xml) üreten script.
//
// Bu blok kozmetik değil: aşağıdaki dört madde 2026-07-28'de CANLI yaşandı ve her biri
// Mami'yi bloke etti. Duvar, aynı sınıfın sessizce geri gelmesini kırmızıya bağlar.
const REPO = resolve(process.cwd());
const SCRIPT = 'scripts/kaba-kurgu.mjs';
const src = () => readFileSync(resolve(REPO, SCRIPT), 'utf8');
const temps: string[] = [];
const yeniProje = (images = false, vo = false) => {
  const dir = mkdtempSync(join(tmpdir(), 'mamilas-kaba-kurgu-'));
  temps.push(dir);
  writeFileSync(join(dir, 'ORNEK-EDIT-PLAN.txt'), [
    '2 klip',
    '1.png   K01   1s   2s   [0:00–0:02]   İlk VO cümlesi.',
    '2.png   K02   1s   3s   [0:02–0:05]   İkinci VO cümlesi.',
  ].join('\n'), 'utf8');
  if (images) {
    mkdirSync(join(dir, 'images'));
    writeFileSync(join(dir, 'images', '1.png'), 'frame-1');
    writeFileSync(join(dir, 'images', '2.png'), 'frame-2');
  }
  if (vo) {
    // 8 kHz mono PCM WAV, tam 5.000 saniye — fixture'ın gerçek VO toplamı.
    const samples = 5 * 8000;
    const wav = Buffer.alloc(44 + samples, 0x80);
    wav.write('RIFF', 0); wav.writeUInt32LE(36 + samples, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32); wav.writeUInt16LE(8, 34);
    wav.write('data', 36); wav.writeUInt32LE(samples, 40);
    writeFileSync(join(dir, 'voice.wav'), wav);
  }
  return dir;
};
const calistir = (dir: string, ...args: string[]) => execFileSync(process.execPath, [resolve(REPO, SCRIPT), dir, ...args], {
  cwd: REPO,
  encoding: 'utf8',
});

afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('kaba-kurgu — Premiere timeline üreticisi', () => {
  test('script var ve faz profili onu kurgu kitinin parçası sayar', () => {
    expect(existsSync(resolve(REPO, SCRIPT)), `${SCRIPT} yok — kurgu kiti beşinci parçasını üretemez`).toBe(true);
    const faz = readFileSync(resolve(REPO, 'docs/ai/faz-icraat.md'), 'utf8');
    expect(faz).toContain('kaba-kurgu.mjs');
    expect(faz).toContain('KABA-KURGU.xml');
  });

  // Ölçülen kusur: Premiere 1924x1076'yı görünce PAR'ı "D1/DV PAL (1.0940)" sandı ve
  // pikselleri %9 gerdi — scale %100'de bile kenarlar siyah kaldı.
  test('kare piksel AÇIKÇA beyan edilir — PAL tahmini bir daha görüntü esnetemez', () => {
    expect(src()).toContain('<pixelaspectratio>square</pixelaspectratio>');
  });

  // Ölçülen kusur: <file> içinde width/height beyan edilince Premiere medyayı o ölçüye zorluyordu.
  // Mami: "sen çözünürlüğüne dokunma videoların."
  test('klip boyutu file elemanında BEYAN EDİLMEZ — Premiere gerçek medyadan okur', () => {
    const s = src();
    const fileBlok = s.slice(s.indexOf('<file id="f-'), s.indexOf('</file>', s.indexOf('<file id="f-')));
    expect(fileBlok).not.toMatch(/<width>|<height>/);
  });

  // Ölçülen kusur: Türkçe kesme işareti (Dünya'da) tırnak sayılınca cümle kırpılıyordu;
  // K23 "Bir astronotun kütlesi Dünya" diye kısaldı ve K22 onun cümlelerini yuttu.
  test('kesme işareti tırnak sayılmaz — Türkçe cümle ortadan kırpılamaz', () => {
    const m = src().match(/const TIRNAK = \/\[([^\]]*)\]\//);
    expect(m, 'TIRNAK tanımı bulunamadı').not.toBeNull();
    expect(m![1], 'kesme işareti (’) tırnak listesinde — cümleyi kırpar').not.toContain('’');
    expect(m![1]).not.toContain('‘');
  });

  // Ölçülen kusur: döngülenen ses parçalarına YENİ boş file id verilince Premiere
  // tanımsız referans görüp dosyayı komple reddetti (File Import Failure, boş hata mesajı).
  test('tekrar eden ses klibi aynı file id\'yi gösterir — tanımsız referans yok', () => {
    expect(src()).toMatch(/n === 0 \? `<file id="file-\$\{id\}">/);
    expect(src()).toMatch(/: `<file id="file-\$\{id\}"\/>`/);
  });

  // Ölçülen kusur: teslim edilmiş Sabit Sürat EDIT-PLAN'ı "44 klip" diyordu ama 12 satır
  // taşıyordu (K33'ten başlıyordu). Hiçbir kapı görmedi.
  test('plan kendi iddiasını tutmuyorsa kırmızı basar (kapsam denetimi)', () => {
    const s = src();
    expect(s).toContain('KAPSAM');
    expect(s).toMatch(/klip["'`]?\s*\)?\s*[,;]?[\s\S]{0,200}kareler\.length/);
  });

  test('bayraksız çağrı eski klipsiz XML\'i byte byte korur', () => {
    const dir = yeniProje();
    calistir(dir, '--fps', '10');
    const ad = basename(dir);
    const xml = readFileSync(join(dir, `${ad} — kaba kurgu.xml`), 'utf8');
    expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<!-- MAMILAS kaba kurgu — ORNEK-EDIT-PLAN.txt kaynağından üretildi.
     Bu bir TASLAK timeline'dır; nihai kesim hükmü Mami'nindir. -->
<xmeml version="5">
  <sequence id="seq-1">
    <name>${ad} — kaba kurgu</name>
    <duration>50</duration>
    <rate><timebase>10</timebase><ntsc>FALSE</ntsc></rate>
    <timecode><rate><timebase>10</timebase><ntsc>FALSE</ntsc></rate><string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>
    <media>
      <video>
        <format><samplecharacteristics><rate><timebase>10</timebase><ntsc>FALSE</ntsc></rate><width>1920</width><height>1080</height><pixelaspectratio>square</pixelaspectratio><anamorphic>FALSE</anamorphic><fielddominance>none</fielddominance></samplecharacteristics></format>
        <track>
        <!-- K01 klip YOK (1.png) — 20 kare boşluk -->
        <!-- K02 klip YOK (2.png) — 30 kare boşluk -->
        </track>
      </video>
      <audio>


      </audio>
    </media>
  </sequence>
</xmeml>
`);
  });

  test('--animatic her kare için video-only still üretir ve toplamı VO süresine eşittir', () => {
    const dir = yeniProje(true, true);
    // Fixture VO toplamı: gerçek WAV 5.000s; planın 2s + 3s payı aynı VO süresidir.
    calistir(dir, '--animatic', '--tahmin', '--fps', '10');
    const xml = readFileSync(join(dir, `${basename(dir)} — ANIMATIC-0.xml`), 'utf8');
    const video = xml.match(/<video>[\s\S]*?<\/video>/)?.[0] || '';

    expect((video.match(/<clipitem id="ci-/g) || []).length).toBe(2);
    expect(video).toContain('<duration>20</duration>');
    expect(video).toContain('<duration>30</duration>');
    expect(xml).toContain('<sequence id="seq-1">\n    <name>');
    expect(xml).toContain('<duration>50</duration>'); // 5s gerçek fixture VO toplamı × 10 fps
    expect(video).toContain('<media><video/></media>');
    expect(video).not.toContain('<audio>');
    expect(xml).toContain('<file id="file-vo1">'); // VO A1, video-only still'lerden ayrıdır.
  });
});
