import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { AUTHORITY_HIERARCHY } from './brain';

const REPO = resolve(process.cwd());
const read = (rel: string) => readFileSync(resolve(REPO, rel), 'utf8');
const RUNNERS = ['agents/runner.mjs', 'agents/production/runner.mjs'];
const KITS = ['agents', 'agents/production'];
const RETIRED_KICKS = [
  'agents/production/kick/claude-tr.md',
  'agents/production/RUN_MOTION_AGENT.md',
];
// 2026-07-16 temizliği (Mami: "çöpleri sil, tertemiz teslim et"): eski hat dokümanları
// repodan tamamen kaldırıldı. Tombstone bile bırakılmadı — olmayan dosya canlanamaz.
// Bu kilit geri sızmayı kırmızıya bağlar; eski zekâ mac-hatti-2026-07-16 branch'inde yaşar.
const PURGED_LEGACY = [
  'agents/kick', 'agents/claude', 'agents/gpt', 'agents/knowledge', 'agents/done', 'agents/images',
  'agents/GLOBAL_BRAIN.md', 'agents/AGENT_BRAIN_V2_ADDENDUM.md', 'agents/project.json',
  'agents/RUN_MOTION_AGENT.md',
];
const ADAPTERS = ['agents/adapters/claude.md', 'agents/adapters/codex.md'];
const ROLES = [
  'agents/roles/image-author.md',
  'agents/roles/image-jury.md',
  'agents/roles/frame-jury.md',
  'agents/roles/motion-author.md',
  'agents/roles/motion-jury.md',
];

const TIER_KEYS: Array<[RegExp, string]> = [
  [/\b(material|materyal)\b/i, 'MATERIAL'],
  [/render\s*lock|\bworld\b/i, 'WORLD'],
  [/\bpath\b/i, 'PATH'],
  [/\b(source|kaynak)\b/i, 'SOURCE'],
  [/\b(approved|onaylı)\b/i, 'APPROVED'],
  [/mandate/i, 'MANDATE'],
  [/\bdna\b/i, 'REFDNA'],
  [/\b(palette|palet)\b/i, 'PALETTE'],
];

function tiersOf(chain: string): string[] {
  return chain.split('>').map((token) => token.replace(/[*`.]/g, '').trim()).filter(Boolean).map((token) => {
    for (const [pattern, key] of TIER_KEYS) if (pattern.test(token)) return key;
    return `UNKNOWN(${token})`;
  });
}

describe('canonical product contracts stay bound to code', () => {
  test('authority hierarchy keeps its eight canonical tiers', () => {
    expect(tiersOf(AUTHORITY_HIERARCHY)).toEqual([
      'PATH', 'WORLD', 'MATERIAL', 'SOURCE', 'APPROVED', 'MANDATE', 'REFDNA', 'PALETTE',
    ]);
  });

  // Eski "worked prompt hex" ve "engine-window doc aynası" testlerinin nesneleri
  // (GLOBAL_BRAIN, 02_IMAGE_*, kick/*) 2026-07-16 temizliğinde silindi. Engine-window
  // gerçeği artık TEK kanondan yaşar: src/core/engine.ts ENGINE_USABLE — doc aynası yok.
  // ENGINE_USABLE'ın kendisi engine.test.ts + docsContract'ın diğer kilitleriyle korunur.
  test.each(PURGED_LEGACY)('%s stays deleted — legacy path cannot creep back', (rel) => {
    expect(existsSync(resolve(REPO, rel)), `${rel} repoya geri sızmış`).toBe(false);
  });
});

describe('one hashed protocol owns every decision law', () => {
  const protocol = read('agents/PROTOCOL.md');

  test('protocol defines the bounded author/jury lifecycle and verdict vocabulary', () => {
    expect(protocol).toContain('bir author → bir bağımsız jury');
    expect(protocol).toContain('PASS | REJECT | FACT_REQUIRED');
    expect(protocol).toContain('en fazla bir author revision');
    expect(protocol).toContain('Mami `APPROVE`');
  });

  test('protocol assigns deterministic concerns to code, not roles', () => {
    for (const rule of ['Palette translation', 'IP firewall', 'schema/hash/stale', 'engine math']) {
      expect(protocol).toContain(rule);
    }
  });

  test.each(ADAPTERS)('%s is provider I/O only and defers to PROTOCOL', (rel) => {
    const adapter = read(rel);
    expect(adapter).toMatch(/PROTOCOL\.md/);
    expect(adapter).not.toContain('PASS | REJECT | FACT_REQUIRED');
    expect(adapter).not.toContain('Authority Hierarchy');
  });

  test.each(ROLES)('%s exists as one bounded role', (rel) => {
    const role = read(rel);
    expect(role.length).toBeGreaterThan(80);
    expect(role).toMatch(/PROTOCOL\.md/);
  });

  test.each(RETIRED_KICKS)('%s cannot revive the giant-agent path', (rel) => {
    const retired = read(rel);
    expect(retired).toMatch(/DEPRECATED|ÇALIŞTIRILAMAZ|NON-RUNNABLE/);
    expect(retired).not.toMatch(/credit|kredi|--print|claude --print/i);
  });
});

describe('runner is a thin cross-platform command launcher', () => {
  test.each(RUNNERS)('%s selects a command without silently resolving ambiguity', (rel) => {
    const runner = read(rel);
    expect(runner).toContain('commandCandidates');
    expect(runner).toMatch(/candidates\.length === 1/);
    expect(runner).toContain('--file');
    expect(runner).toContain('Geçersiz seçim');
  });

  test.each(RUNNERS)('%s delegates validation and lifecycle to the canonical command', (rel) => {
    const runner = read(rel);
    expect(runner).toContain("'scripts', 'mamilas-command.mjs'");
    expect(runner).toContain("'agents', 'PROTOCOL.md'");
    expect(runner).not.toMatch(/production\.frameGate|KICK_DIR|\.mamilas_kick/);
  });

  test.each(RUNNERS)('%s isolates each named project and command revision', (rel) => {
    const runner = read(rel);
    expect(runner).toContain('Proje adı:');
    expect(runner).toContain('MAMILAS-PROJELER');
    expect(runner).toContain("'runs', runId");
    expect(runner).toContain('mamilas.local-project.v1');
  });

  test.each(RUNNERS)('%s exposes only interactive Claude/Codex provider selection', (rel) => {
    const runner = read(rel);
    expect(runner).toContain("['claude', 'codex']");
    expect(runner).not.toMatch(/antigravity|Higgsfield|credits|kredi/i);
  });

  test('both kits carry a byte-identical runner', () => {
    const [main, production] = RUNNERS.map(read);
    expect(production).toBe(main);
  });
});

describe('Windows and macOS launchers remain thin and equivalent', () => {
  test.each(KITS)('%s ships both launchers', (kit) => {
    expect(() => read(`${kit}/MOTION-CALISTIR.command`)).not.toThrow();
    expect(() => read(`${kit}/MOTION-CALISTIR.bat`)).not.toThrow();
  });

  test.each(KITS)('%s Windows launcher starts beside itself and preserves errors', (kit) => {
    const bat = read(`${kit}/MOTION-CALISTIR.bat`);
    expect(bat).toMatch(/cd \/d "%~dp0"/);
    expect(bat).toMatch(/node runner\.mjs/);
    expect(bat).toMatch(/pause/);
    expect(bat.includes('\r\n')).toBe(true);
  });

  test.each(KITS)('%s macOS launcher calls the same runner beside itself', (kit) => {
    const command = read(`${kit}/MOTION-CALISTIR.command`);
    expect(command).toMatch(/^#!\/bin\/zsh/);
    expect(command).toMatch(/cd "\$\(dirname "\$0"\)"/);
    expect(command).toMatch(/node runner\.mjs/);
  });

  test.each(KITS.flatMap((kit) => [`${kit}/MOTION-CALISTIR.command`, `${kit}/MOTION-CALISTIR.bat`]))(
    '%s carries no decision law',
    (rel) => {
      const launcher = read(rel);
      expect(launcher.split('\n').length).toBeLessThan(20);
      expect(launcher).not.toMatch(/FRAME GATE|FACT REQUIRED|Kling|PROTOCOL/);
    },
  );
});

// FAZ 3 KANALI — Mami-onaylı ders bankası ÜRETİME ulaşmak zorundadır.
//
// Ölçülen kusur (2026-07-27): banka yalnız RUNNER hattına gidiyordu. Mami üretimi Konuşmalı
// Yönetmen'le yapıyor — yani banka dolsa bile canlı üretime hiç ulaşmıyordu. Kanal açıldı,
// ama kanalı yaşatan bir duvar yoktu: biri skill'i yeniden yazsa kanal SESSİZCE kopardı.
// Bu blok kopmayı kırmızıya bağlar. İçerik denetlemez — yalnız bağlantının varlığını.
describe('ders bankası kanalı — banka üretime bağlı kalır', () => {
  const BANK = 'agents/lessons/APPROVED.md';
  const SKILLS = [
    '.claude/skills/mamilas-director/SKILL.md',
    '.agents/skills/mamilas-director/SKILL.md',
    '.claude/skills/mamilas-enzim/SKILL.md',
    '.agents/skills/mamilas-enzim/SKILL.md',
  ].filter((rel) => existsSync(resolve(REPO, rel)));

  test('kanalın iki ucu da var: banka dosyası + runner okuması', () => {
    expect(existsSync(resolve(REPO, BANK))).toBe(true);
    const cmd = read('scripts/mamilas-command.mjs');
    expect(cmd).toContain("'lessons', 'APPROVED.md'");
    expect(cmd).toContain('approvedLessons');
  });

  test('approvedLessons HASH-DIŞI katmandır — banka büyüyünce command stale olmaz', () => {
    const cmd = read('scripts/mamilas-command.mjs');
    // sessionContext CONTEXT.json'a yazılır; sceneContextHash yalnız imageAuthor+motionEngine'i
    // kapsar. Dersler karar değil atölye hafızasıdır — bu ayrım kaybolursa banka her satırda
    // uçuştaki command'leri geçersiz kılardı.
    expect(cmd).toMatch(/approvedLessons[\s\S]{0,400}sessionContext|sessionContext[\s\S]{0,400}approvedLessons/);
    expect(cmd).toContain('CONTEXT.json');
  });

  test.each(SKILLS)('%s bankayı okur — Yönetmen hattı runner\'sız da beslenir', (rel) => {
    expect(read(rel)).toContain(BANK);
  });

  test('skill yüzeyleri tek tek değil ÇİFT güncellenir (launcher-parity)', () => {
    // `.claude/` ve `.agents/` kopyaları birlikte yaşar; biri güncellenip öteki unutulursa
    // iki ajan iki farklı yasa okur.
    //
    // 2026-07-31 ölçümü: bu test ON skill'in İKİSİNE bakıyordu ve onlarda bile yalnız
    // "banka geçiyor mu" diye kontrol ediyordu — yani sekiz skill sessizce sapabilirdi
    // ve sapan biri zaten vardı (`mamilas-ref`). Kapı kör kalamaz: artık İKİ TARAFTA DA
    // var olan HER skill'in TAM içeriği karşılaştırılıyor.
    //
    // Tek meşru fark ortam adıdır: Claude tarafı `CLAUDE.md` der, Codex tarafı `AGENTS.md`.
    // Bu kasıtlı; karşılaştırmadan önce normalize edilir. Başka her fark SAPMADIR.
    const lf = (s: string) => s.replace(/\r\n/g, '\n').replace(/AGENTS\.md/g, 'CLAUDE.md');
    const claudeSkills = resolve(REPO, '.claude/skills');
    const surfaces = existsSync(claudeSkills)
      ? readdirSync(claudeSkills).filter((d) => existsSync(resolve(claudeSkills, d, 'SKILL.md')))
      : [];
    expect(surfaces.length).toBeGreaterThan(5); // testin kör kalmadığının kanıtı

    const sapan: string[] = [];
    for (const surface of surfaces) {
      const a = resolve(REPO, `.claude/skills/${surface}/SKILL.md`);
      const b = resolve(REPO, `.agents/skills/${surface}/SKILL.md`);
      if (!existsSync(b)) { sapan.push(`${surface} (.agents kopyası YOK)`); continue; }
      if (lf(readFileSync(a, 'utf8')) !== lf(readFileSync(b, 'utf8'))) sapan.push(surface);
    }
    expect(sapan, `skill kopyaları sapmış: ${sapan.join(', ')}`).toEqual([]);
  });
});

// META-DUVAR — duvarları denetleyen duvar (2026-07-28 keşif turu, D-1).
//
// Ölçülen kusur: buddy-gate.sh + hasat-gate.sh git index'inde 100644'tü; Mac'te her SessionStart'ta
// `permission denied` (exit 126) ile SESSİZCE ölüyordu. gate.sh'ın 07-27 python3 no-op'unun birebir
// aynası — kusur türü farklı (biri filtre, biri exec-bit), KÖRLÜK aynı: sistem "duvar kuruldu" ile
// "duvar ateşliyor"u ayırt edemiyordu. Bu blok o körlüğü kırmızıya bağlar: settings.json'da kayıtlı
// her hook DOSYA olarak var VE çalıştırılabilir olmak zorunda. Windows'ta exec-bit taşınmaz, ama
// index modu taşınır (git 100755) — bu yüzden test index modunu değil dosya sistemini ölçer ve
// gate.sh'ın kendi 0b yasasını ("sessiz geçiş yasak") hook altyapısının kendisine uygular.
describe('meta-duvar — settings.json hook kaydı ile çalışan gerçek eşleşir', () => {
  const settings = JSON.parse(read('.claude/settings.json')) as {
    hooks?: Record<string, Array<{ hooks?: Array<{ type?: string; command?: string; args?: string[] }> }>>;
  };

  // 2026-08-02 ölçümü: bu tarama YALNIZ `.sh` eşliyordu. Yani modele gerçekten ULAŞAN iki
  // hook — buddy.mjs ve oturum-durumu.mjs — meta-duvarda hiç doğrulanmıyordu; silinseler ya da
  // yeniden adlandırılsalar testler yeşil kalırdı. Duvarın kendi kör noktası, tam olarak
  // duvarın kapattığı kusur sınıfı. Tarama artık `.mjs`'i ve exec-form `args` dizisini de görür.
  function hookPaths(): string[] {
    const paths: string[] = [];
    for (const group of Object.values(settings.hooks ?? {})) {
      for (const entry of group) {
        for (const h of entry.hooks ?? []) {
          if (h.type !== 'command') continue;
          // "$CLAUDE_PROJECT_DIR"/x.sh · bash "$CLAUDE_PROJECT_DIR"/x.sh · node + args:[".../x.mjs"]
          for (const s of [h.command ?? '', ...(h.args ?? [])]) {
            const m = s.match(/\.claude\/hooks\/[A-Za-z0-9._-]+\.(?:sh|mjs)/);
            if (m) paths.push(m[0]);
          }
        }
      }
    }
    return [...new Set(paths)];
  }

  test('en az bir SessionStart + bir PreToolUse hook kayıtlı (kayıt sessizce boşalmasın)', () => {
    expect(Object.keys(settings.hooks ?? {})).toEqual(
      expect.arrayContaining(['PreToolUse', 'SessionStart', 'PostToolUse']),
    );
    // Eşik GERÇEK kayıt sayısıdır, altında bir sayı değil. Terra 5.6 ikinci gözde ölçtü:
    // 5 kayıt varken ">= 4" demek, bir hook sessizce silindiğinde testin yeşil kalması demek —
    // yani sayaç tam olarak koruması gereken kaybı kaçırır. Yeni hook eklenince bu sayı ARTAR;
    // düşürmek için gerekçe yazılır.
    expect(hookPaths().length).toBeGreaterThanOrEqual(5);
  });

  test.each(hookPaths())('%s hem VAR hem ÇALIŞTIRILABİLİR (exit 126 bir daha saklanmaz)', (rel) => {
    const abs = resolve(REPO, rel);
    expect(existsSync(abs), `${rel} settings.json'da kayıtlı ama dosya yok`).toBe(true);

    // `.mjs` hook'ları `node <yol>` ile çağrılır — exec bitine İHTİYAÇ DUYMAZ (oturum-durumu.mjs:8-9).
    // Onlarda 100755 aramak Windows'ta kapıyı kalıcı kırmızı yapardı.
    // Ama VAR olmak yetmez: bozuk sözdizimli bir .mjs SessionStart'ı sessizce öldürür ve
    // "kapı ölçtü ve temiz" ile "kapı hiç ateşlemedi" yine ayırt edilemez — hasat-gate'in
    // bugün onarılan kusurunun aynısı. Node'un kendi ayrıştırıcısı ölçer (Terra 5.6 riski).
    if (rel.endsWith('.mjs')) {
      expect(
        () => execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' }),
        `${rel} sözdizimi bozuk — SessionStart'ta sessizce ölür`,
      ).not.toThrow();
      return;
    }

    // 2026-07-28 (Windows ölçümü): bu hüküm ÖNCE `statSync().mode` bakıyordu ve Mami'nin
    // BİRİNCİL makinesinde asla yeşil olamıyordu — NTFS'te exec biti yoktur, mod daima 666.
    // Yani Mac'ten gelen doğru bir düzeltme, Windows'ta kapıyı kalıcı kırmızı yapmıştı.
    // Taşınan gerçek yetki git INDEX modudur (100755): Mac checkout'unda dosyayı
    // çalıştırılabilir yapan odur, iki makinede de aynı okunur. Ölçüt artık o.
    const indexLine = execFileSync('git', ['ls-files', '-s', '--', rel], { cwd: REPO, encoding: 'utf8' }).trim();
    expect(indexLine, `${rel} git'e hiç eklenmemiş — index modu yok, diğer makineye gitmez`).not.toBe('');
    const indexMode = indexLine.split(/\s+/)[0];
    expect(indexMode, `${rel} git index modu ${indexMode} — 100755 olmalı, yoksa POSIX'te 126 ile ölür`).toBe('100755');

    // POSIX'te çalışma kopyası da ölçülür; Windows'ta bu ölçüm anlamsız olduğu için atlanır.
    if (process.platform !== 'win32') {
      const mode = statSync(abs).mode;
      expect(Boolean(mode & 0o111), `${rel} çalıştırılabilir değil (mod ${(mode & 0o777).toString(8)}) — SessionStart'ta 126 ile ölür`).toBe(true);
    }
  });
});

// CODEX PARİTE — iki giriş sözleşmesi aynı dünyaya açılır (2026-07-28 keşif turu, T-4/T-5).
//
// Ölçülen kusur: faz anahtarı (İNŞA→İCRAAT) 07-28'de yalnız CLAUDE.md'ye yazıldı; AGENTS.md hâlâ
// 13 gün önce kapanmış "Decision Pipeline / mamilas-pipeline" dünyasına açıyordu — Codex yanlış
// yasayla başlıyordu ve hiçbir test bunu ölçmüyordu. Ayrıca İCRAAT'ın kare-denetim skill'i
// (mamilas-denetim) yalnız .claude yüzeyinde doğmuştu. Bu blok ikisini de kilitler.
describe('codex parite — AGENTS.md ile CLAUDE.md aynı faza açar', () => {
  test('iki giriş sözleşmesi de AKTİF faz profiline işaret eder (Codex kapanmış faza açılmaz)', () => {
    const claude = read('CLAUDE.md');
    const agents = read('AGENTS.md');
    const active = claude.match(/@(docs\/ai\/faz-[a-z]+\.md)/);
    expect(active, 'CLAUDE.md faz import satırı yok').not.toBeNull();
    const fazPath = active![1];
    expect(agents.includes(fazPath), `AGENTS.md aktif faza (${fazPath}) işaret etmiyor — Codex yanlış yasayla açılır`).toBe(true);
    // AGENTS.md kapanmış İNŞA yürütmesini birincil sözleşme olarak göstermemeli.
    expect(agents).not.toMatch(/Yürütme sözleşmesi:\s*`?\.agents\/skills\/mamilas-pipeline/);
  });

  test('.claude/skills ile .agents/skills küme olarak eşit — yeni skill tek yüzeyde doğmaz', () => {
    const dirs = (base: string) =>
      readdirSync(resolve(REPO, base), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();
    expect(dirs('.agents/skills')).toEqual(dirs('.claude/skills'));
  });
});
