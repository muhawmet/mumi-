import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// KABA KURGU DUVARI — kurgu kitinin beşinci parçasını (KABA-KURGU.xml) üreten script.
//
// Bu blok kozmetik değil: aşağıdaki dört madde 2026-07-28'de CANLI yaşandı ve her biri
// Mami'yi bloke etti. Duvar, aynı sınıfın sessizce geri gelmesini kırmızıya bağlar.
const REPO = resolve(process.cwd());
const SCRIPT = 'scripts/kaba-kurgu.mjs';
const src = () => readFileSync(resolve(REPO, SCRIPT), 'utf8');

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
});
