import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
// @ts-expect-error — scripts/ derlemeye dahil değil; saf karar tablosu buradan import edilir.
import { decide, icerikHash } from '../../scripts/lib/sync-karar.mjs';

const REPO = resolve(process.cwd());
const read = (rel: string) => readFileSync(resolve(REPO, rel), 'utf8');

// Bu duvarın varlık sebebi (İNŞA ledger'ı T-3): aynayı yazan HİÇBİR test yoktu.
// 2026-07-28'de tek yönlü `memory-sync` iki kez canlıda ısırdı — sabah Mac'te 21,
// akşam Windows'ta 9 hafıza dosyası arşive gidecekti. Kusur mantıkta değil,
// mantığı ölçen bir duvarın hiç olmamasındaydı. Bu dosya o duvardır.

describe('claude-sync karar tablosu', () => {
  test('iki taraf eşitse hareket yok', () => {
    expect(decide('a', 'a', null)).toBe('esit');
    expect(decide('a', 'a', 'a')).toBe('esit');
    expect(decide('a', 'a', 'eski')).toBe('esit');
  });

  test('tek tarafta doğan dosya karşı tarafa taşınır', () => {
    expect(decide(null, 'a', null)).toBe('cek'); // diğer makinede doğmuş
    expect(decide('a', null, null)).toBe('it');  // burada doğmuş
  });

  // 🔴 Bu iki satır, bugün 9 hafızayı kurtaran davranışın kilididir.
  // Eski script burada 'sil/arşivle' diyordu; doğru cevap 'geri yükle'.
  test('bir taraftan DÜŞEN dosya geri konur, asla silinmez', () => {
    expect(decide(null, 'a', 'a')).toBe('geriYukleCanli');
    expect(decide('a', null, 'a')).toBe('geriYukleRepo');
  });

  // Codex (gpt-5.6-sol) itirazı, 2026-07-28 — ikinci gözün yakaladığı gerçek kusur.
  // Silme DE bir değişikliktir: bir taraf sildi + diğeri değiştirdiyse iki taraf da
  // değişmiştir. Önceki hal bunu sessizce 'geriYukleCanli' sayıyor, yani bilerek
  // silinmiş bir dosyayı BAŞKA içerikle diriltip "geri kondu" diye raporluyordu.
  test('silme + karşı tarafta değişiklik ÇATIŞMADIR, sessiz diriltme değil', () => {
    expect(decide(null, 'yeni', 'eski')).toBe('catismaSilme');
    expect(decide('yeni', null, 'eski')).toBe('catismaSilme');
  });

  test('yalnız bir taraf değiştiyse yön kesindir', () => {
    expect(decide('yeni', 'eski', 'eski')).toBe('it');  // canlı değişti
    expect(decide('eski', 'yeni', 'eski')).toBe('cek'); // repo değişti
  });

  test('iki taraf da değiştiyse yön TAHMİN EDİLMEZ', () => {
    expect(decide('A', 'B', 'ortak')).toBe('catisma');
    expect(decide('A', 'B', null)).toBe('catisma'); // taban yoksa da tahmin yok
  });

  test('hiçbir girdi kombinasyonu silme üretemez', () => {
    const hashes = [null, 'A', 'B'];
    const sonuclar = new Set<string>();
    for (const l of hashes) for (const r of hashes) for (const b of hashes) {
      sonuclar.add(decide(l, r, b));
    }
    // Tablonun tamamı. 'sil' diye bir sonuç YOK ve eklenirse bu test kırmızı verir.
    expect([...sonuclar].sort()).toEqual(
      ['catisma', 'catismaSilme', 'cek', 'esit', 'geriYukleCanli', 'geriYukleRepo', 'it', 'yok'],
    );
  });
});

// Codex'in ikinci itirazı: test yalnız saf `decide`'ı ölçüyordu, asıl yükü taşıyan
// CRLF normalizasyonunu hiç çalıştırmıyordu. Windows CRLF yazar, Mac LF — normalize
// edilmezse her koşuda sonsuz it/çek döngüsü olur ve senkron hiç durulmaz.
describe('claude-sync içerik hash — satır sonu tuzağı', () => {
  const sha = (data: string | Buffer) =>
    createHash('sha256').update(data).digest('hex').slice(0, 16);
  const h = (s: string | Buffer) => icerikHash(Buffer.from(s), sha);

  test('CRLF ile LF aynı dosyayı AYNI sayar (sonsuz döngü olmaz)', () => {
    expect(h('bir\r\niki\r\nüç\r\n')).toBe(h('bir\niki\nüç\n'));
  });

  test('gerçek içerik farkı hâlâ fark olarak görünür', () => {
    expect(h('bir\niki\n')).not.toBe(h('bir\nÜÇ\n'));
  });

  test('Türkçe karakter ve boş dosya hash üretir', () => {
    expect(h('ğüşiöçİĞÜŞÖÇ')).toHaveLength(16);
    expect(h('')).toHaveLength(16);
  });

  test('ikili dosya normalize EDİLMEZ — 0x0D0A baytları korunur', () => {
    const ikili = Buffer.from([0x00, 0x0d, 0x0a, 0xff]);
    const duz = Buffer.from([0x00, 0x0a, 0xff]);
    expect(h(ikili)).not.toBe(h(duz));
  });
});

describe('claude-sync kapıya bağlı', () => {
  test('script ve karar tablosu repoda duruyor', () => {
    expect(existsSync(resolve(REPO, 'scripts/claude-sync.mjs'))).toBe(true);
    expect(existsSync(resolve(REPO, 'scripts/lib/sync-karar.mjs'))).toBe(true);
  });

  // Duvar sessizce sökülmesin: kapı bu script'i çağırmayı bırakırsa test kırmızı verir.
  test('gate.sh senkronu --check ile koşuyor', () => {
    const gate = read('.claude/hooks/gate.sh');
    expect(gate).toContain('claude-sync.mjs --check');
  });

  // 2026-07-28: eski tek yönlü script emekliye ayrıldı. Geri dönerse — ya da biri
  // onu tekrar kapıya bağlarsa — bu test bunu yakalar.
  test('emekli memory-sync artık kapıda değil', () => {
    expect(read('.claude/hooks/gate.sh')).not.toContain('memory-sync.mjs --check');
  });

  // 🔴 Çelişkili denetimin çürüttüğü tasarım kusuru (2026-07-28): taban repoda tutuluyordu,
  // git onu taşıyınca `base` karşı makinenin hâline dönüşüyor ve script gelen güncellemeyi
  // bayat kopyayla eziyordu — üstelik "0 silindi" diye rapor ederek. Yasa: paylaşılan taban
  // diye bir şey yoktur. Biri tabanı tekrar repoya taşımaya kalkarsa burada kırmızı verir.
  test('senkron tabanı MAKİNEYE özel — repoda tutulmaz', () => {
    const src = read('scripts/claude-sync.mjs');
    expect(src).toContain('.mamilas-sync-base.json');
    expect(src).toMatch(/const MANIFEST = join\(HOME,/);
    expect(src).not.toMatch(/const MANIFEST = join\(SYNC_DIR|manifest\.json'\)/);
    expect(existsSync(resolve(REPO, 'docs/ai/sync/manifest.json'))).toBe(false);
  });
});
