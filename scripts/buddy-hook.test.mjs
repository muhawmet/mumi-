// BUDDY KAPISI — sentetik ateşleme testi.
//
// Bu dosya `mamilas-buddy` protokolünün İÇERİĞİNİ denetlemez (o SKILL.md'nin işi). Yalnız
// ATEŞLEMEYİ denetler: doğru olay doğru kanaldan konuşuyor mu, susması gereken yerde susuyor mu,
// cooldown görünmeyen mesaj için yanıyor mu, alt ajan ana thread'in hakkını yiyor mu.
//
// Var oluş sebebi: 2026-07-29 ölçümünde eski `buddy-gate.sh` PostToolUse'tan DÜZ STDOUT basıyordu
// ve o kanal modele ulaşmıyordu — yani "duvar kuruldu" görünüyordu, duvar hiç ateşlememişti.
// Yeşil test yetenek kanıtı değildir; bu yüzden testler hook'u GERÇEKTEN child-process olarak
// koşturur ve stdout'un birebir kendisine bakar.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOK = path.join(REPO, '.claude', 'hooks', 'buddy.mjs');
const GATE_SH = path.join(REPO, '.claude', 'hooks', 'buddy-gate.sh');

let PROJ = '';
let SDIR = '';

beforeAll(() => {
  PROJ = fs.mkdtempSync(path.join(os.tmpdir(), 'buddy-hook-'));
  SDIR = path.join(PROJ, '.claude', '.buddy-state');
});
afterAll(() => {
  try {
    fs.rmSync(PROJ, { recursive: true, force: true });
  } catch {
    /* temizlik testi kırmızıya çevirmez */
  }
});

/** Hook'u gerçek bir child process olarak koştur; stdout'u aynen döndür. */
function run(payload, env = {}) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return execFileSync(process.execPath, [HOOK], {
    input,
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: PROJ, ...env },
  });
}
const statePath = (id) => path.join(SDIR, id + '.json');
const st = (id) => JSON.parse(fs.readFileSync(statePath(id), 'utf8'));
const put = (id, o) => fs.writeFileSync(statePath(id), JSON.stringify(o) + '\n');

const batch = (id, extra = {}) => ({
  session_id: id,
  hook_event_name: 'PostToolBatch',
  prompt_id: 'p-' + Math.random().toString(36).slice(2),
  tool_calls: [
    { tool_name: 'Bash', tool_input: { command: 'rtk vitest' }, tool_use_id: 't1', tool_response: 'ok' },
  ],
  ...extra,
});

const MIN = 60_000;

// ─────────────────────────────────────────────────────────────────────────────
describe('buddy kapısı — kanal yasası', () => {
  test('1) SessionStart konuşur: protokol metni DÜZ stdout ile çıkar', () => {
    const out = run({ session_id: 's-start', hook_event_name: 'SessionStart', source: 'startup' });
    expect(out).toContain('mamilas-buddy');
    expect(out).toContain('DEHB');
    // KASITLI: SessionStart JSON zarfı KULLANMAZ. Canlı ölçüm bu dalda düz stdout'un modele
    // ulaştığını gösterdi; zarfa çevirmek tek görünür kanalı riske atar (spec A.6 + risk maddesi).
    expect(() => JSON.parse(out)).toThrow();
  });

  test('1b) SessionStart ikinci kayıtta SUSAR (çift register dedupe)', () => {
    const out = run({ session_id: 's-start', hook_event_name: 'SessionStart', source: 'startup' });
    expect(out.trim()).toBe('');
    expect(st('s-start').sessionStartEmitted).toBe(true);
  });

  test('1c) compact/resume sayaçları SIFIRLAMAZ (aynı çalışma oturumu)', () => {
    const s = st('s-start');
    s.activeMs = 12 * MIN;
    put('s-start', s);
    run({ session_id: 's-start', hook_event_name: 'SessionStart', source: 'compact' });
    expect(st('s-start').activeMs).toBeGreaterThanOrEqual(12 * MIN);
  });

  test('PostToolUse ve Stop SESSİZ muhasebe dalıdır — hiçbir şey basmaz', () => {
    const id = 's-quiet';
    expect(run({ session_id: id, hook_event_name: 'PostToolUse', tool_name: 'Bash' }).trim()).toBe('');
    expect(
      run({ session_id: id, hook_event_name: 'Stop', stop_hook_active: false, last_assistant_message: 'x' }).trim(),
    ).toBe('');
    expect(st(id).turns).toBe(1);
    // döngü kırıcı
    expect(run({ session_id: id, hook_event_name: 'Stop', stop_hook_active: true }).trim()).toBe('');
    expect(st(id).turns).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('buddy kapısı — eşik, teklif, ısrarsızlık', () => {
  const id = 's-thr';

  test('2) oturum 24:59 aktif → SESSİZ (diğer üç koşul sağlanıyorken bile)', () => {
    run(batch(id)); // state doğur
    const s = st(id);
    s.activeMs = 24 * MIN + 59_000 - 90_000; // tick 90sn ekleyecek → tam 24:59
    s.lastEventMs = Date.now() - 90_000; // gap koşulu SAĞLANIYOR
    s.lastOfferMs = 0; // cooldown SAĞLANIYOR
    s.prompts = {}; // hiperfokus SAĞLANIYOR
    put(id, s);
    const out = run(batch(id));
    expect(out.trim()).toBe('');
    // gerçek saat: put ile koşu arası birkaç ms geçer, eşiğin ALTINDA kalması yeter
    expect(st(id).activeMs).toBeGreaterThanOrEqual(24 * MIN + 59_000);
    expect(st(id).activeMs).toBeLessThan(25 * MIN);
    expect(st(id).lastOfferMs).toBe(0); // damga YANMADI
  });

  // 2026-07-29 YASA DEĞİŞİKLİĞİ — bu testin eski hali sessizliği KORUYORDU.
  // Eski assert: `expect(j.systemMessage).toBeUndefined()` + yorumu "systemMessage ASLA — o
  // Mami'nin EKRANINA basar". Yani kapı ateşlese bile Mami hiçbir şey görmüyordu; teslim
  // tamamen ajanın takdirindeydi ve ajan üç kez atladı (state: offers 3, teslim 0).
  // Mami'nin açık direktifi bu yasağı kaldırdı: "hatta onu çok şık bir şekilde ekranda
  // gösterebilirsin bile". Artık İKİSİ de zorunlu: ekran + ajan zorunluluğu.
  test('3) oturum 25:00+ → TEK teklif; ajana ZORUNLULUK, Mami\'nin EKRANINA nefes daveti', () => {
    const s = st(id);
    s.activeMs = 25 * MIN - 90_000; // tick 90sn ekleyecek → tam 25:00
    s.lastEventMs = Date.now() - 90_000;
    s.prompts = {};
    put(id, s);
    const out = run(batch(id));

    const j = JSON.parse(out); // parse edilebilir JSON mu?
    expect(j.hookSpecificOutput.hookEventName).toBe('PostToolBatch');
    const ctx = j.hookSpecificOutput.additionalContext;
    expect(typeof ctx).toBe('string');
    expect(ctx.length).toBeGreaterThan(100);
    // systemMessage ZORUNLU — nefes daveti Mami'nin EKRANINA basar (Mami direktifi 2026-07-29)
    expect(typeof j.systemMessage).toBe('string');
    expect(j.systemMessage).toMatch(/nefes/i);
    // davet SOMUT olmalı: saniye taşımayan "nefes al" cümlesi ölçüldü, yetmiyor
    expect(j.systemMessage).toMatch(/\d+\s*saniye/);
    // ekran metni TEŞHİS kurmaz — yasak olan izleme dili, davetin kendisi değil
    expect(j.systemMessage).not.toMatch(/yorul|iyi misin|wellness|meditasyon|stres/i);

    // DİL DENETİMİ — teklif artık İZİN değil EMİR taşımak zorunda
    expect(ctx).toContain('ZORUNLULUK');
    expect(ctx).toContain('üç parça');
    expect(ctx).toMatch(/SUSMAK artık seçenek değil/);
    expect(ctx).toMatch(/ısrar hâlâ yasak/i); // ısrarsızlık DÜŞMEDİ
    // ajanın üç kez kullandığı kaçak gerekçe açıkça geçersiz sayılmalı
    expect(ctx).toMatch(/ısrar etmeyeyim.*GEÇERSİZ/s);
    // rapor duvarına gömme yasağı yazılı olmalı — gömülen teklif olmamış sayılır
    expect(ctx).toMatch(/gömme|gömülürse/);
    // eski izin dili GERİ GELMESİN
    expect(ctx).not.toContain('BİR teklif hakkın var');

    expect(st(id).offers).toBe(1);
    expect(st(id).lastOfferMs).toBeGreaterThan(0);
  });

  test('4) hemen ardından tekrar → 45dk cooldown içinde SESSİZ, damga DEĞİŞMEZ', () => {
    const stampBefore = st(id).lastOfferMs;
    const s = st(id);
    s.activeMs = 99 * MIN;
    s.lastEventMs = Date.now() - 90_000;
    put(id, s);
    const out = run(batch(id));
    expect(out.trim()).toBe('');
    expect(st(id).lastOfferMs).toBe(stampBefore);
    expect(st(id).offers).toBe(1);
  });

  test('gap < 45sn → doğal boşluk yok, teklif YOK (eşik dolu olsa bile)', () => {
    const s = st(id);
    s.activeMs = 99 * MIN;
    s.lastOfferMs = 0;
    s.lastEventMs = Date.now() - 5_000; // 5 saniyelik ara: Mami beklemedi
    s.prompts = {};
    put(id, s);
    expect(run(batch(id)).trim()).toBe('');
    expect(st(id).lastOfferMs).toBe(0);
  });

  test('hiperfokus guard: 10dk içinde 3 prompt → SUS; akış soğuyunca teklif geri gelir', () => {
    const now = Date.now();
    let s = st(id);
    s.activeMs = 99 * MIN;
    s.lastOfferMs = 0;
    s.lastEventMs = now - 90_000;
    s.prompts = { a: now - 60_000, b: now - 30_000, c: now - 10_000 };
    put(id, s);
    expect(run(batch(id, { prompt_id: 'c' })).trim()).toBe('');
    expect(st(id).lastOfferMs).toBe(0);

    s = st(id);
    s.prompts = { a: Date.now() - 20 * MIN }; // pencereden düştü
    s.lastEventMs = Date.now() - 90_000;
    put(id, s);
    expect(run(batch(id, { prompt_id: 'a' }))).toContain('additionalContext');
  });

  // 2026-07-29 (Sol denetimi): guard'ı erteleyici yapan HARD_ACTIVE_MS eklendi ama kendi testi
  // yoktu — "duvar var" sanılan ama ateşlemeyen sınıfın kendisi olurdu. Üç kilit:
  // (1) tavanın ALTINDA guard hâlâ susturur, (2) tavanı AŞINCA hiperfokusun kendisi yük sinyali
  // sayılır ve teklif doğar, (3) ısrarsızlık tavanın üstünde de DÜŞMEZ.
  test('yük tavanı: 120dk bitişik aktif süre guard\'ı ERTELEYİCİ yapar, iptal etmez', () => {
    const id3 = 's-yuk-tavani';
    const now = Date.now();
    run(batch(id3));

    // (1) 99dk + 3 prompt → tavan ALTINDA, guard susturur.
    let s = st(id3);
    s.activeMs = 99 * MIN;
    s.lastOfferMs = 0;
    s.lastEventMs = now - 90_000;
    s.prompts = { a: now - 60_000, b: now - 30_000, c: now - 10_000 };
    put(id3, s);
    expect(run(batch(id3, { prompt_id: 'c' })).trim()).toBe('');

    // (2) AYNI hiperfokus, 121dk → tavan AŞILDI, teklif doğar. Mami 3 saat kesintisiz
    //     çalışıp her 2-3 dk prompt attığında eski AND kapısı SONSUZA KADAR susuyordu.
    s = st(id3);
    s.activeMs = 121 * MIN;
    s.lastOfferMs = 0;
    s.lastEventMs = Date.now() - 90_000;
    s.prompts = { a: Date.now() - 60_000, b: Date.now() - 30_000, c: Date.now() - 10_000 };
    put(id3, s);
    expect(run(batch(id3, { prompt_id: 'c' }))).toContain('additionalContext');

    // (3) Israrsızlık tavanın üstünde de geçerli: teklif yeni verildi → hemen ikincisi YOK.
    s = st(id3);
    s.lastEventMs = Date.now() - 90_000;
    put(id3, s);
    expect(run(batch(id3, { prompt_id: 'd' })).trim()).toBe('');
  });

  test('IDLE_CUT: 3 saatlik ara aktif süreye EKLENMEZ (Mami masada değildi)', () => {
    const id2 = 's-idle';
    run(batch(id2));
    const s = st(id2);
    s.activeMs = 0;
    s.lastEventMs = Date.now() - 3 * 60 * MIN;
    put(id2, s);
    run(batch(id2));
    expect(st(id2).activeMs).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('buddy kapısı — izolasyon ve dayanıklılık', () => {
  test('5) farklı session_id bağımsızdır — cooldown MİRASI yok', () => {
    const a = 's-iso-a';
    const b = 's-iso-b';
    run(batch(a));
    let s = st(a);
    s.activeMs = 99 * MIN;
    s.lastEventMs = Date.now() - 90_000;
    s.prompts = {};
    put(a, s);
    expect(run(batch(a))).toContain('additionalContext'); // A teklifini yaktı

    run(batch(b));
    expect(fs.existsSync(statePath(b))).toBe(true);
    expect(st(b).lastOfferMs).toBe(0); // B temiz doğdu
    expect(st(b).offers).toBe(0);
    expect(st(b).activeMs).toBeLessThan(25 * MIN); // ama kendi eşiğini bekler

    s = st(b);
    s.activeMs = 99 * MIN;
    s.lastEventMs = Date.now() - 90_000;
    s.prompts = {};
    put(b, s);
    expect(run(batch(b))).toContain('additionalContext'); // A'nın cooldown'ı B'yi susturmadı
  });

  test('6) alt ajan (agent_id dolu) SESSİZ — ve state\'e HİÇ dokunmaz', () => {
    const id = 's-sub';
    run(batch(id));
    const before = fs.readFileSync(statePath(id), 'utf8');
    const out = run(batch(id, { agent_id: 'aa2e77852fa4424e1', agent_type: 'general-purpose' }));
    expect(out.trim()).toBe('');
    expect(fs.readFileSync(statePath(id), 'utf8')).toBe(before);
  });

  test('6b) agent_type dolu ama agent_id YOK → ana thread sayılır (binary: "not agent_type")', () => {
    const id = 's-maintype';
    const out = run({ session_id: id, hook_event_name: 'SessionStart', source: 'startup', agent_type: 'general-purpose' });
    expect(out).toContain('mamilas-buddy');
  });

  test('7) CRLF + Windows path içeren girdi çökmez, state yazılır', () => {
    const id = 's-crlf';
    const payload = JSON.stringify(
      {
        session_id: id,
        hook_event_name: 'PostToolBatch',
        prompt_id: 'p-win',
        cwd: 'C:\\Users\\Muhammet\\Desktop\\mamilas-modern',
        transcript_path: 'C:\\Users\\Muhammet\\.claude\\projects\\x\\y.jsonl',
        tool_calls: [{ tool_name: 'Bash', tool_input: { command: 'rtk git status\r\nrtk vitest' } }],
      },
      null,
      2,
    ).replace(/\n/g, '\r\n'); // TÜM payload CRLF
    const out = run(payload);
    expect(out.trim()).toBe('');
    expect(st(id).batches).toBe(1);
  });

  test('7b) BOM + CRLF ile yazılmış state dosyası okunur (BOM tuzağı kapalı)', () => {
    const id = 's-bom';
    run(batch(id));
    const s = st(id);
    fs.writeFileSync(statePath(id), '\uFEFF' + JSON.stringify(s).replace(/\n/g, '\r\n') + '\r\n');
    const out = run(batch(id));
    expect(out.trim()).toBe('');
    expect(st(id).batches).toBe(2); // eski sayaç KORUNDU → dosya gerçekten okundu
  });

  test('bozuk JSON / boş stdin çökmez, çıktı basmaz, exit 0', () => {
    expect(run(']not json[').trim()).toBe('');
    expect(run('').trim()).toBe('');
    expect(run('null').trim()).toBe('');
    expect(run({ hook_event_name: 'BilinmeyenOlay', session_id: 'x' }).trim()).toBe('');
  });

  test('bozuk state dosyası hook\'u öldürmez, temiz state ile devam eder', () => {
    const id = 's-corrupt';
    run(batch(id));
    fs.writeFileSync(statePath(id), '{{{ bozuk');
    expect(run(batch(id)).trim()).toBe('');
    expect(st(id).batches).toBe(1);
  });

  test('state dosyası oturum başına ayrı ve sanitize edilmiş adla yazılır', () => {
    const dirty = '../../evil id';
    run(batch(dirty));
    const files = fs.readdirSync(SDIR);
    expect(files).toContain('______evil_id.json');
    expect(fs.existsSync(path.join(PROJ, '.claude', '.buddy-state'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('buddy kapısı — delegatör ve ortam', () => {
  const bashless = process.platform === 'win32';

  test('buddy.mjs ve buddy-gate.sh VAR ve çalıştırılabilir', () => {
    for (const p of [HOOK, GATE_SH]) {
      expect(fs.existsSync(p), `${p} yok`).toBe(true);
      if (!bashless) expect(Boolean(fs.statSync(p).mode & 0o111), `${p} exec değil`).toBe(true);
    }
    expect(fs.readFileSync(HOOK, 'utf8').startsWith('#!/usr/bin/env node')).toBe(true);
  });

  // CLAUDE_PROJECT_DIR burada repo'yu DEĞİL sahte proje dizinini gösteriyor — yani delegatör
  // kardeş betiği env'den çözerse MODULE_NOT_FOUND kusar. Kendi konumundan çözmek zorunda.
  test.skipIf(bashless)('buddy-gate.sh buddy.mjs\'e delege eder (CLAUDE_PROJECT_DIR yanlışken bile)', () => {
    const r = spawnSync('/bin/bash', [GATE_SH], {
      input: JSON.stringify({ session_id: 's-deleg', hook_event_name: 'SessionStart', source: 'startup' }),
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: PROJ },
    });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe('');
    expect(r.stdout).toContain('mamilas-buddy');
    // state yine CLAUDE_PROJECT_DIR'e yazılır (proje ayrımı korunur)
    expect(fs.existsSync(statePath('s-deleg'))).toBe(true);
  });

  test.skipIf(bashless)('8) node YOKSA sessiz geçmez — stderr\'e "ölçemedi ≠ temiz" der', () => {
    const r = spawnSync('/bin/bash', [GATE_SH], {
      input: JSON.stringify({ session_id: 's-nonode', hook_event_name: 'SessionStart' }),
      encoding: 'utf8',
      env: { PATH: '/nonexistent-bin', CLAUDE_PROJECT_DIR: PROJ },
    });
    // exit 0 ŞART: exit 2 agentic loop'u durdurur. Ama SESSİZ olmak yasak.
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe(''); // modele sahte "temiz" sinyali gitmez
    expect(r.stderr).toContain('node yok');
    expect(r.stderr).toContain('temiz demek değil');
  });
});
