import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// SKILL DUVARI — "kanon bir yeteneğe işaret ediyor, yetenek yok" kusurunu kırmızıya bağlar.
//
// Bu sınıf projeyi iki kez ısırdı:
//   1) CLAUDE.md "çalışma biçimi mamilas-buddy skill'idir" diyordu, hook her oturumda "yükle"
//      diyordu, hafıza "derinlik o skill'de" diyordu — DOSYA HİÇBİR YERDE YOKTU. Ajanlar tek
//      paragraflık hook metninden doğaçlama yaptı, Mami dört kez "destek görmedim" dedi.
//   2) memory/mamilas-dehb-ders-logu.md olmayan bir müfredat dosyasına atıf yapıyordu
//      (`~/.claude/skills/mamilas-buddy/references/dehb-mufredat.md`) — `references/` klasörü
//      hiçbir yüzeyde yok. Bozuk atıf bir kez Mami'de kaygı üretti.
//
// docsContract.test.ts skill'ler için bugün yalnız İSİM paritesi ölçüyor
// (dirs('.agents/skills') === dirs('.claude/skills')). Kopyayı parite sanmak kusurun kendisidir:
// isimler eşitken içerik ayrışabilir, frontmatter bozulabilir, gövdedeki her atıf ölü olabilir.
// Bu dosya o üç boşluğu kapatır — skill'in VAR olduğunu değil, ÇAĞRILABİLİR olduğunu ölçer.

const REPO = resolve(process.cwd());
const lf = (s: string) => s.replace(/\r\n/g, '\n');
const read = (rel: string) => lf(readFileSync(resolve(REPO, rel), 'utf8'));

const SURFACES = ['.claude/skills', '.agents/skills'] as const;

/** İki yüzeyde de klasörü olan skill adları — isim paritesini docsContract ölçer, burada içerik. */
const SKILL_NAMES = readdirSync(resolve(REPO, SURFACES[0]), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

/** Her iki yüzeydeki tüm SKILL.md yolları — tekil dosya denetimleri bunun üstünde koşar. */
const ALL_SKILL_FILES = SURFACES.flatMap((surface) =>
  SKILL_NAMES.map((name) => `${surface}/${name}/SKILL.md`),
).filter((rel) => existsSync(resolve(REPO, rel)));

// ---------------------------------------------------------------------------------------------
// Yol çıkarımı — TEMKİNLİ. Yanlış alarm bu duvarı çöpe çevirir; agresif regex duvarı öldürür.
// ---------------------------------------------------------------------------------------------

/** Repo-içi atıf ancak bilinen bir kökle başlarsa yol sayılır. Cümle içi `a/b` ikilemleri değil. */
const PATH_ROOTS = ['scripts', 'agents', 'src', 'docs', 'artifacts', 'public', 'e2e', 'tests', '.claude', '.agents', '.codex'];
const ROOT_ALT = PATH_ROOTS.map((r) => r.replace('.', '\\.')).join('|');
// Önünde sınır (satır başı, boşluk, backtick, tırnak, parantez, köşeli, markdown `*`) olmalı —
// kelime ortasından yol doğmasın. `*` sınır sayılmazsa `**agents/PROTOCOL.md**` biçimindeki kalın
// atıflar SESSİZCE denetim dışı kalır (ölçüldü). Gövde `<>*` KABUL EDER ki placeholder'lar
// yakalanıp ATLANABİLSİN: `<` gövdeden dışlanırsa `artifacts/imagegen/<slug>/` yarım yakalanır
// ve sahte MISS üretir.
const PATH_RE = new RegExp(`(?:^|[\\s\`'"(\\[|*])((?:${ROOT_ALT})/[^\\s\`'"()\\[\\]|]*)`, 'g');
const HOME_RE = /(~\/[^\s`'"()[\]|]*)/g;

/** Cümle noktalaması ve markdown kalın/italik işareti yolun parçası değildir. */
const trimTail = (p: string) => p.replace(/[*_.,;:!?)\]]+$/, '');

/** Placeholder / joker taşıyan atıf bir dosya iddiası değil, bir ŞABLONDUR — ölçülemez. */
const isTemplate = (p: string) => /[*<>{}$]/.test(p);

type Ref = { line: number; path: string };

function extractRefs(text: string): { repo: Ref[]; home: Ref[] } {
  const repo: Ref[] = [];
  const home: Ref[] = [];
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(PATH_RE)) {
      const p = trimTail(m[1]);
      if (p && !isTemplate(p)) repo.push({ line: i + 1, path: p });
    }
    for (const m of line.matchAll(HOME_RE)) {
      const p = trimTail(m[1]);
      if (p && !isTemplate(p)) home.push({ line: i + 1, path: p });
    }
  });
  return { repo, home };
}

/**
 * Dosya atfı ile dizin atfı aynı ağırlıkta değildir.
 *
 * Dosya = ÇAĞRILAN yetenek: yoksa kanon yalan söylüyor → kırmızı.
 * Dizin = KONUM: çalışma anında `mkdir -p` ile doğabilir (`artifacts/imagegen/<slug>/`) ya da
 * metnin kendisi yokluğunu anlatıyor olabilir (mamilas-ref: "`public/refs/` boş"). Bunları
 * kırmızıya bağlamak duvarı yanlış alarma boğar — bu yüzden dizin eksiği YUMUŞAK bildirilir.
 */
const isDirRef = (p: string) => p.endsWith('/');

describe('skill ikizleri içerikçe tek dosyadır', () => {
  // NEDEN: iki yüzey ayrışırsa iki ajan iki farklı yasa okur ve fark SESSİZ kalır — isim
  // paritesi (docsContract) bunu göremez, çünkü isimler eşit kalmaya devam eder.
  test.each(SKILL_NAMES)('%s — .claude ve .agents kopyaları aynı içeriği taşır', (name) => {
    const a = `${SURFACES[0]}/${name}/SKILL.md`;
    const b = `${SURFACES[1]}/${name}/SKILL.md`;
    expect(existsSync(resolve(REPO, a)), `${a} yok`).toBe(true);
    expect(existsSync(resolve(REPO, b)), `${b} yok`).toBe(true);

    // CRLF/LF farkı bu makinede dört kez sahte kusur doğurdu (bkz. agents-sync.mjs `lf`).
    // Satır sonu içerik değildir — normalize edilir, kusur sayılmaz.
    //
    // Giriş sözleşmesinin ADI da içerik değil YÜZEY bilgisidir: .claude kopyası CLAUDE.md'ye,
    // .agents kopyası AGENTS.md'ye atıf yapar (mamilas-ref bugün tam olarak bunu yapıyor).
    // İkisi aynı sözleşmenin yüzeye göre adıdır — docsContract zaten ikisini aynı faza kilitler.
    // Sadece bu tek token nötrlenir; gerçek bir yasa tek kopyada değişirse test yine kırmızı verir.
    const neutral = (s: string) => s.replace(/\b(CLAUDE|AGENTS)\.md\b/g, 'ENTRY.md');
    expect(neutral(read(b))).toBe(neutral(read(a)));
  });
});

describe('skill frontmatter sözleşmesi', () => {
  // NEDEN: frontmatter bozuksa skill listeye hiç çıkmaz — dosya diskte durur ama YETENEK yoktur.
  // Bu, vaka 1'in sessiz versiyonudur: kanon işaret eder, yükleyici görmez.
  test.each(ALL_SKILL_FILES)('%s — açılış frontmatter\'ı, name ve dolu description taşır', (rel) => {
    const text = read(rel);
    expect(text.startsWith('---\n'), `${rel} \`---\` ile açmıyor — skill yüklenmez`).toBe(true);

    const end = text.indexOf('\n---', 4);
    expect(end, `${rel} frontmatter kapanışı (\`---\`) yok`).toBeGreaterThan(0);
    const fm = text.slice(4, end);

    const name = fm.match(/^name:\s*(.+)$/m)?.[1].trim();
    const description = fm.match(/^description:\s*(.+)$/m)?.[1].trim();

    const folder = rel.split('/')[2];
    expect(name, `${rel} frontmatter'da \`name:\` yok`).toBe(folder);
    expect(description ?? '', `${rel} \`description:\` boş — skill tetiklenemez`).not.toBe('');
    expect((description ?? '').length, `${rel} description'ı fazla kısa`).toBeGreaterThan(10);
  });
});

describe('skill gövdesindeki atıflar gerçektir', () => {
  // NEDEN: vaka 2 tam buydu — kanon `references/dehb-mufredat.md` diyordu, dosya hiçbir yüzeyde
  // yoktu. Ajan atfı gerçek sanıp aradı, bulamadı, doğaçladı. Ölü atıf = ölü yetenek.
  test.each(ALL_SKILL_FILES)('%s — repo-içi her dosya atfı diskte var', (rel) => {
    const { repo } = extractRefs(read(rel));
    const missing: string[] = [];
    const softMissing: string[] = [];

    for (const ref of repo) {
      if (existsSync(resolve(REPO, ref.path))) continue;
      (isDirRef(ref.path) ? softMissing : missing).push(`${rel}:${ref.line} → ${ref.path}`);
    }

    for (const s of softMissing) console.warn(`[skill-atif] dizin yok (yumuşak): ${s}`);

    expect(missing, `ÖLÜ ATIF — kanon var olmayan dosyaya işaret ediyor:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  // NEDEN: ev dizini makineye göre değişir (Mami Windows + Mac). `~/...` atfı gerçek olmalı ama
  // yokluğu CI'da kanıt değildir — bu yüzden bildirilir, kırmızıya bağlanmaz.
  test.each(ALL_SKILL_FILES)('%s — repo-dışı (~/) atıflar bildirilir, kapıyı kapatmaz', (rel) => {
    const { home } = extractRefs(read(rel));
    const home$ = process.env.HOME ?? process.env.USERPROFILE ?? '';
    for (const ref of home) {
      if (!home$) continue;
      const abs = resolve(home$, ref.path.slice(2));
      if (!existsSync(abs)) console.warn(`[skill-atif] repo-dışı atıf bulunamadı: ${rel}:${ref.line} → ${ref.path}`);
    }
    expect(Array.isArray(home)).toBe(true);
  });
});

describe('skill\'in çağırdığı script gerçekten koşabilir', () => {
  // NEDEN: "node scripts/x.mjs koş" yazan bir skill, dosya yoksa ya da sözdizimi kırıksa
  // ajanı ÇALIŞMAYAN bir komuta yollar. Varlık yeterli değil — çalıştırılabilirlik ölçülür.
  const NODE_CMD_RE = /\bnode\s+((?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+\.(?:mjs|cjs|js))/g;

  const commands = [
    ...new Set(
      ALL_SKILL_FILES.flatMap((rel) =>
        [...read(rel).matchAll(NODE_CMD_RE)].map((m) => `${rel} ${m[1]}`),
      ),
    ),
  ];

  test('en az bir skill somut bir node komutu çağırıyor (çıkarım sessizce boşalmasın)', () => {
    expect(commands.length).toBeGreaterThan(0);
  });

  test.each(commands)('%s — hedef script var ve `node --check` geçiyor', (entry) => {
    const [rel, script] = entry.split(' ');
    const abs = resolve(REPO, script);
    expect(existsSync(abs), `${rel} \`node ${script}\` diyor ama dosya yok`).toBe(true);
    expect(() => execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' }),
      `${script} sözdizimi kırık — ${rel} ölü komut öğretiyor`).not.toThrow();
  });
});

describe('hook\'un işaret ettiği yetenek diskte var', () => {
  // NEDEN: settings.json'daki hook kaydı bir SÖZ'dür. gate.sh python3 arayıp sessizce no-op oldu,
  // buddy-gate.sh 100644 modla exit 126 ile öldü — ikisi de "duvar kuruldu" derken ateşlemiyordu.
  // docsContract yalnız `.sh` komutlarını görüyor; `command: "node"` + `args: [...]` biçimindeki
  // kayıtlar (oturum-durumu.mjs, buddy.mjs) onun kör noktasında duruyordu. Burada ikisi de ölçülür.
  const settings = JSON.parse(read('.claude/settings.json')) as {
    hooks?: Record<string, Array<{ hooks?: Array<{ type?: string; command?: string; args?: string[] }> }>>;
  };

  /** `"$CLAUDE_PROJECT_DIR"/x` ve `${CLAUDE_PROJECT_DIR}/x` → repo-göreli x. */
  const stripProjectDir = (raw: string) =>
    raw.replace(/["']?\$\{?CLAUDE_PROJECT_DIR\}?["']?\/?/g, '').replace(/^["']|["']$/g, '');

  function hookTargets(): string[] {
    const out: string[] = [];
    for (const group of Object.values(settings.hooks ?? {})) {
      for (const entry of group) {
        for (const h of entry.hooks ?? []) {
          if (h.type !== 'command') continue;
          for (const token of [h.command ?? '', ...(h.args ?? [])]) {
            if (!token.includes('CLAUDE_PROJECT_DIR') && !token.startsWith('.claude/')) continue;
            const rel = stripProjectDir(token).trim();
            if (rel.startsWith('.claude/hooks/')) out.push(rel);
          }
        }
      }
    }
    return [...new Set(out)];
  }

  const targets = hookTargets();

  test('kayıtlı hook hedefleri çıkarılabildi — hem .sh hem node+args biçimi görülüyor', () => {
    expect(targets.length).toBeGreaterThanOrEqual(3);
    expect(targets.some((t) => t.endsWith('.sh')), 'hiç .sh hook hedefi çıkarılamadı').toBe(true);
    expect(targets.some((t) => t.endsWith('.mjs')), 'node+args biçimi hâlâ kör noktada').toBe(true);
  });

  test.each(targets)('%s — dosya var, ve .sh ise exec biti açık', (rel) => {
    const abs = resolve(REPO, rel);
    expect(existsSync(abs), `${rel} settings.json'da kayıtlı ama dosya yok — hook sessiz no-op`).toBe(true);

    // Windows'ta exec biti anlamsızdır (NTFS taşımaz) — VARLIK kontrolü yine de yukarıda yapıldı.
    // `.mjs` hedefler `node` ile çağrılır, exec biti gerekmez; yalnız doğrudan exec edilen .sh ölçülür.
    if (process.platform === 'win32' || !rel.endsWith('.sh')) return;
    const mode = statSync(abs).mode;
    expect(Boolean(mode & 0o111),
      `${rel} çalıştırılabilir değil (mod ${(mode & 0o777).toString(8)}) — exit 126 ile sessizce ölür`).toBe(true);
  });
});
