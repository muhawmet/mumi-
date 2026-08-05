// DÜNYA KİLİDİ — davranış kilitleri.
//
// NEDEN VAR: `dunya-kilidi.mjs` elle prompt yazan ajanın dünya kuyruğunu ürettiği TEK
// kaynaktır — ve hiçbir vitest yüzeyi yoktu. Script 46 dünyanın her biri için `SURGERY_DATA`
// metnini seçip sıralıyor; bir regex değişikliği tek bir dünyayı sessizce çöpe çevirebilir ve
// bu ancak Mami bozuk bir kare bastığında görülür. Süpürme bunu üretimden ÖNCE görür.
//
// Script bir CLI'dır (stdout = yapıştırmaya hazır kuyruk, stderr = ölçüm). Bu yüzden test de
// onu CLI olarak koşar: import edilen fonksiyon değil, MAMİ'NİN KOŞTUĞU ŞEY sınanır.
//
// NOT: `src/core/` DONUK — bu dosya bilerek `scripts/` altında (icraat fazı yasası).

import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const SCRIPT = fileURLToPath(new URL('./dunya-kilidi.mjs', import.meta.url));

// 46 dünya × ~70 ms süreç açılışı ≈ 3.5 sn. Süpürme BİR KEZ koşar, üç kilit aynı çıktıyı okur.
const SWEEP_TIMEOUT = 180_000;

/** Bir dünyanın stdout'u. Hata durumunda `{ status, stderr }` ile döner, atmaz. */
function run(args) {
  try {
    return { status: 0, stdout: execFileSync('node', [SCRIPT, ...args], { encoding: 'utf8' }), stderr: '' };
  } catch (e) {
    return { status: e.status ?? -1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

let IDS = [];
const OUT = new Map();   // worldId → `--kuyruk` stdout (eski davranış, hâlâ doğru çalışmalı)
const KART = new Map();  // worldId → varsayılan stdout (yapıştırılamaz dünya kartı)

beforeAll(() => {
  const list = run(['--liste']);
  // `  <id>   <REGISTER>   <ad>` — liste biçiminin kendisi de bir sözleşmedir.
  IDS = [...list.stdout.matchAll(/^ {2}(\S+)\s+(EDU|REAL|STY)\s/gm)].map((m) => m[1]);
  for (const id of IDS) OUT.set(id, run([id, '--kuyruk']));
  // 2026-08-05: varsayılan çıktı KART oldu. Süpürme yine üç satırı doğruluyor (alttaki
  // buildStyle/paletteLight/negatif kurucuları hâlâ o yoldan ölçülüyor) ama artık açık
  // `--kuyruk` ile; KART modu ayrıca kendi bloğunda ölçülüyor (B3b).
  for (const id of IDS) KART.set(id, run([id]));
}, SWEEP_TIMEOUT);

describe('B · dünya kilidi süpürmesi', () => {
  // -------------------------------------------------------------------------
  // B1 · Kütüphanenin TAMAMI çıktı üretmeli. Tek bir dünyanın çökmesi, o dünyayı
  // sessizce kullanılamaz kılar — ve bunu ancak prompt yazarken fark ederiz.
  // -------------------------------------------------------------------------
  it('B1 · --liste her dünyayı sayar ve hepsi çökmeden çıktı üretir', () => {
    expect(IDS.length).toBeGreaterThanOrEqual(40);
    const cokenler = IDS.filter((id) => OUT.get(id).status !== 0);
    expect(cokenler).toEqual([]);
    const bos = IDS.filter((id) => !OUT.get(id).stdout.trim());
    expect(bos).toEqual([]);
  }, SWEEP_TIMEOUT);

  // -------------------------------------------------------------------------
  // B2 · HAM HEX SIZINTISI — kütüphanenin bilinen kusuru. Motor hex okumaz, fizik okur
  // (Palette Translation Law). `#1a2b3c` sızan bir kuyruk motora anlamsız token verir.
  // -------------------------------------------------------------------------
  it('B2 · hiçbir dünyanın çıktısında ham hex yok', () => {
    const sizanlar = IDS
      .map((id) => [id, OUT.get(id).stdout.match(/#[0-9a-fA-F]{3,8}\b/g)])
      .filter(([, m]) => m)
      .map(([id, m]) => `${id}: ${[...new Set(m)].join(', ')}`);
    expect(sizanlar).toEqual([]);
  }, SWEEP_TIMEOUT);

  // -------------------------------------------------------------------------
  // B3 · ÜÇ SATIR SÖZLEŞMESİ — artık YALNIZ `--kuyruk` yolunda geçerli.
  // Bu test silinmedi çünkü ölçtüğü şey hâlâ gerçek: alttaki kurucular (buildStyle,
  // paletteLightPrompt, scrubImageNegatives) her dünya için çökmeden ve eksiksiz
  // çalışmak zorunda. Değişen tek şey, bu çıktının artık VARSAYILAN olmaması.
  // Aktif projenin 56 karesi eski kuyrukla basıldı; yeniden basımların tutarlı
  // kalması için `--kuyruk` bilerek yaşıyor.
  // -------------------------------------------------------------------------
  it('B3 · --kuyruk her dünya için STYLE / LIGHT AND PALETTE / NEGATIVE taşır', () => {
    const eksik = [];
    for (const id of IDS) {
      const s = OUT.get(id).stdout;
      for (const lbl of ['STYLE:', 'LIGHT AND PALETTE:', 'NEGATIVE:']) {
        if (!new RegExp(`^${lbl}\\s*\\S`, 'm').test(s)) eksik.push(`${id} → ${lbl}`);
      }
    }
    expect(eksik).toEqual([]);
  }, SWEEP_TIMEOUT);

  // -------------------------------------------------------------------------
  // B3b · KART YAPIŞTIRILAMAZ. Bu turun (2026-08-05) asıl kazanımı: varsayılan çıktı
  // artık motora gidebilecek hazır bir blok DEĞİL. Kart bir gün sessizce kuyruğa geri
  // dönerse — biri "kolaylık olsun" diye örnek cümle eklerse — bu test düşer.
  // Ölçülen kusur: yapıştırılabilir çıktı, aktif projede motora giden metnin %60'ı oldu
  // ve LIGHT AND PALETTE 56 karede TEK sürüme dondu.
  // -------------------------------------------------------------------------
  it('B3b · KART modu yapıştırmaya hazır üç satır ÜRETMEZ', () => {
    const sizanlar = [];
    for (const id of IDS) {
      const s = KART.get(id).stdout;
      for (const lbl of ['STYLE:', 'LIGHT AND PALETTE:', 'NEGATIVE:']) {
        if (new RegExp(`^${lbl}\\s*\\S`, 'm').test(s)) sizanlar.push(`${id} → ${lbl}`);
      }
    }
    expect(sizanlar).toEqual([]);
  }, SWEEP_TIMEOUT);

  it('B3b · KART yapıştırılmayacağını KENDİ İÇİNDE söyler ve dünya bilgisini taşır', () => {
    const s = KART.get('pixar_3d_edu').stdout;
    expect(s).toMatch(/PROMPTA YAPIŞTIRILMAZ/);
    expect(s).toMatch(/DÜNYANIN KİMLİĞİ/);
    expect(s).toMatch(/IŞIK NASIL DAVRANIR/);
    expect(s).toMatch(/YASAK LİSTESİ DEĞİL/);      // negatif bir risk haritası olarak sunulur
    expect(s).toMatch(/NEGATİF KARE-ÖZELDİR/);
  }, SWEEP_TIMEOUT);

  it('B3b · kartta da ham hex yok', () => {
    const sizanlar = IDS
      .map((id) => [id, KART.get(id).stdout.match(/#[0-9a-fA-F]{3,8}\b/g)])
      .filter(([, m]) => m)
      .map(([id, m]) => `${id}: ${[...new Set(m)].join(', ')}`);
    expect(sizanlar).toEqual([]);
  }, SWEEP_TIMEOUT);

  // -------------------------------------------------------------------------
  // B4 · BİLİNMEYEN DÜNYA sessizce boş çıktı vermez. Sessiz no-op bu makinenin
  // ölçülmüş hastalığıdır (dört kez): "yazdım" çalışıyor demek değildir.
  // -------------------------------------------------------------------------
  it('B4 · bilinmeyen dünya: exit ≠ 0, hata + en yakın öneriler basılır', () => {
    const r = run(['pixar_3d_edx']);
    expect(r.status).not.toBe(0);
    expect(r.stdout.trim()).toBe('');          // stdout SAF kalır — yarım kuyruk yapıştırılamaz
    expect(r.stderr).toMatch(/diye bir dünya YOK/);
    expect(r.stderr).toMatch(/En yakın 3 öneri/);
    expect(r.stderr).toMatch(/pixar_3d_edu/);  // öneri gerçekten YAKIN olmalı, liste değil
  });

  // -------------------------------------------------------------------------
  // B5 · STYLE TAVANI (PROMPT-YASASI §2 — 90 kelime). Ölçülmüş kıstas, tercih değil:
  // 269 kelimelik blok kare-özel oranı %35'e düşürdü ve %65 revize getirdi.
  // -------------------------------------------------------------------------
  it('B5 · her dünyanın STYLE bloğu ≤ 90 kelime', () => {
    const asanlar = IDS
      .map((id) => [id, words((OUT.get(id).stdout.match(/^STYLE:(.*)$/m) ?? [, ''])[1])])
      .filter(([, w]) => w > 90)
      .map(([id, w]) => `${id}: ${w}`);
    expect(asanlar).toEqual([]);
  }, SWEEP_TIMEOUT);
});
