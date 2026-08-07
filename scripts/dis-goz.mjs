#!/usr/bin/env node
/**
 * DIŞ GÖZ — Codex ve AGY için ince, ezbersiz çağrı yüzeyi.
 * =============================================================================
 *
 * NEDEN VAR
 * ---------
 * Ezber bu repoda bir kez ısırdı: CLAUDE.md düzyazısı Sol + xhigh derken tek
 * kopyalanabilir blok terra + high çağırıyordu. Bloğu kopyalayan ne Sol'u ne
 * xhigh'ı alıyordu. AGY'de de sessiz zaman aşımı göreli yoldan değil, workspace
 * dışı okumanın reddinden doğdu; CLI bunu `status:SUCCESS` + boş `response` diye
 * geçirdi. Bu launcher model, izin ve boş-yanıt kapısını KODA bağlar.
 *
 * Kullanım:
 *   node scripts/dis-goz.mjs is   "<görev>"
 *   node scripts/dis-goz.mjs cur  "<iddia>"
 *   node scripts/dis-goz.mjs gor  "</mutlak/medya>" "<soru>"
 *   node scripts/dis-goz.mjs ara  "<konu>"
 *   node scripts/dis-goz.mjs kare "</mutlak/prompt.txt>" "</mutlak/cikti.png>"
 *
 * Her çağrı `--kuru` alır: yalnız kurulacak komutu basar, dış aracı çalıştırmaz.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const AGY_WARNING = 'AGY iyi bir İŞARETÇİ, kötü bir CETVELDİR — saniye altı her iddiayı ffmpeg/ffprobe ile doğrula.';

/**
 * `gor --film` motion raporu. Brief'in sekiz maddesi burada, ama ONDALIK SANİYE YASAĞIYLA.
 *
 * Ölçüldü 2026-08-05: AGY sekiz kesim için "2.07 · 2.25 · 1.96 …" verdi; ffmpeg o bantta SIFIR
 * kesim buldu. Sebep yapısal — AGY videoyu 1 FPS örneklüyor, o çözünürlük onda YOK. Uydurulmuş
 * bir ondalıktan ffmpeg ile kesmek hem temiz saniyeyi çöpe atar hem kredi yakar. Bu yüzden
 * rapor TAM SANİYE ister ve kesim noktasını AGY'ye SORDURMAZ — onu hakem belirler.
 */
const MOTION_RAPORU = [
  'Bu videoyu baştan sona izle ve aşağıdaki sekiz başlığı SIRAYLA doldur. Hüküm verme; gördüğünü tarif et.',
  '',
  '🔴 ZAMAN KURALI — MUTLAK: zaman verirken YALNIZ TAM SANİYE kullan ("6. saniye civarı").',
  'ONDALIK SANİYE YAZMA (2.3s, 3.15s gibi). Videoyu saniyede bir kare örneklüyorsun; ondalık',
  'ayrım sende fiziksel olarak YOK. Emin değilsen "bilmiyorum" yaz — tahmini sayı yazma.',
  '',
  '1. GENEL İZLENİM — hareket doğal mı, film gibi mi yoksa "AI videosu" olduğu belli mi? Tek cümle.',
  '2. MORPHING/ERİME — hangi nesnede, hangi TAM SANİYE civarında, neye dönüşüyor?',
  '3. FİZİK — saç/kumaş/ağırlık doğal mı? Bir nesne başkasının içinden geçiyor mu?',
  '4. KİMLİK SÜREKLİLİĞİ — karakter baştan sona aynı kişi mi? Kıyafet, saç, ten değişiyor mu?',
  '5. KAMERA — pürüzsüz mü? Ani sıçrama, titreme, kadraj kayması var mı?',
  '6. YAZI — varsa hareketle bozuluyor mu? Hangi TAM SANİYE civarında okunamaz oluyor?',
  '7. TEMİZ ARALIK — kabaca hangi saniye aralığı kusursuz, hangisi bozuk? Aralık ver, KESİM NOKTASI VERME.',
  '8. HÜKÜM — tam kullanılır / kısmen kullanılır / çöp. Net söyle.',
].join('\n');
const AGY_MODEL = 'gemini-3.6-flash-high';
const CODEX_MODELS = Object.freeze({
  is: { model: 'gpt-5.6-terra', effort: 'high', sandbox: 'workspace-write' },
  cur: { model: 'gpt-5.6-sol', effort: 'xhigh', sandbox: 'read-only' },
});
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export class DisGozError extends Error {}

const fail = (message) => { throw new DisGozError(message); };
const isAbsolute = (value) => path.isAbsolute(value);
const posixQuote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;
const powerShellQuote = (value) => `'${String(value).replaceAll("'", "''")}'`;

export function usage() {
  return `Kullanım:
  node scripts/dis-goz.mjs is   "<görev>"                 [--kuru]
  node scripts/dis-goz.mjs cur  "<iddia>"                 [--kuru]
  node scripts/dis-goz.mjs gor  "<medya yolu>" "<soru>"   [--kuru]
  node scripts/dis-goz.mjs sor  "<takip sorusu>" [--oturum <id>] [--kuru]   # film YENİDEN İZLENMEZ; kimliği gor basar
                                                                            # kimliksiz `-c` EN SON oturuma döner — araya çağrı girdiyse yanlış filmi sürdürür
  node scripts/dis-goz.mjs ara  "<konu>"                  [--kuru]
  node scripts/dis-goz.mjs kare "<prompt dosyası>" "<çıktı.png/.jpg>" [--kuru]`;
}

function needText(value, label) {
  if (!value || !value.trim()) fail(`${label} boş olamaz.`);
  return value;
}

function needExistingAbsolute(file, label) {
  needText(file, label);
  if (!isAbsolute(file)) fail(`${label} mutlak yol olmalı: ${file}`);
  if (!existsSync(file)) fail(`${label} diskte yok; AGY çalıştırılmadı: ${file}`);
  return file;
}

function needOutputPath(file) {
  needText(file, 'Çıktı yolu');
  if (!isAbsolute(file)) fail(`Çıktı yolu mutlak olmalı: ${file}`);
  const outputDir = path.dirname(file);
  if (!existsSync(outputDir) || !statSync(outputDir).isDirectory()) {
    fail(`Çıktı klasörü diskte yok; AGY çalıştırılmadı: ${outputDir}`);
  }
  assertMissingOutput(file);
  if (!['.png', '.jpg'].includes(path.extname(file).toLowerCase())) {
    fail(`Çıktı yalnız .png veya .jpg olmalı: ${file}`);
  }
  return file;
}

/** Hedefi iki kez kontrol ederiz: kurulumda ve subprocess'e tam girmeden önce. */
function assertMissingOutput(file) {
  let entry;
  try { entry = lstatSync(file); } catch (error) {
    if (error && error.code === 'ENOENT') return;
    throw error;
  }
  if (entry.isDirectory()) fail(`Çıktı hedefi dizin olamaz: ${file}`);
  fail(`Çıktı hedefi zaten var; üzerine yazılmaz: ${file}`);
}

function codexInvocation(subcommand, task) {
  const profile = CODEX_MODELS[subcommand];
  const output = path.join('/tmp', `dis-goz-${subcommand}-${Date.now()}.txt`);
  const instruction = subcommand === 'cur'
    ? `Aşağıdaki iddiayı DOĞRULA ya da ÇÜRÜT. "İncele" demekle yetinme: gerçek dosyaları aç, her bulgu için dosya:satır kanıtı ver; iddianın dışında bulduğun çelişkileri de yaz. Kanıt yoksa UNPROVEN de. İddia:\n${task}`
    : task;
  return {
    bin: 'codex',
    // `-`, Codex'in görevi stdin'den almasını belgelenmiş biçimde ister. Böylece
    // "review" ve "--json" gibi kullanıcı metinleri CLI alt-komutu/seçeneği olamaz.
    args: ['exec', '-m', profile.model, '-c', `model_reasoning_effort="${profile.effort}"`, '-s', profile.sandbox, '--skip-git-repo-check', '-'],
    stdin: instruction,
    output,
    kind: 'codex',
    cwd: REPO_ROOT,
  };
}

function agyInvocation(subcommand, args, session = null, { film = false } = {}) {
  let prompt;
  let output = null;
  let media = null;
  if (subcommand === 'gor') {
    media = needExistingAbsolute(args[0], 'Medya yolu');
    const question = needText(args[1], 'Soru');
    prompt = film
      ? `${MOTION_RAPORU}\n\nMedya: ${media}\nEk soru: ${question}`
      : `Şu gerçek medyayı tarif et; hüküm verme, yalnız gördüğünü yaz. Medya: ${media}\nSoru: ${question}\nZamanla ilgili iddiaları yaklaşık işaret olarak yaz; saniye altı kesinlik uydurma.`;
  } else if (subcommand === 'sor') {
    // Ölçüldü 2026-08-06: `-c` medya bağlamını KORUYOR (num_turns:2, 2.3M cache okuması, önceki
    // cevapta olmayan yeni görsel detay). Ama aynı ölçümde AGY özetinden cevaplamaya da yatkın;
    // o yüzden "tekrar BAK" ve "bilmiyorsan BİLMİYORUM" iki kilit prompt'ta kalır.
    const question = needText(args[0], 'Takip sorusu');
    prompt = `Az önce izlediğin medyaya TEKRAR BAKARAK cevapla — kendi özetinden değil. Hüküm verme, yalnız gördüğünü yaz. Bilmiyorsan "BİLMİYORUM" yaz; tahmin etme.\nSoru: ${question}\nZamanla ilgili iddiaları yaklaşık işaret olarak yaz; saniye altı kesinlik uydurma.`;
  } else if (subcommand === 'ara') {
    const topic = needText(args[0], 'Konu');
    prompt = `İnternetten şu konuyu araştır: ${topic}\nKısa, kaynak bağlantılı bulgular ver; emin olmadığın bilgiyi açıkça ayır.`;
  } else {
    const promptFile = needExistingAbsolute(args[0], 'Prompt dosyası');
    output = needOutputPath(args[1]);
    const imagePrompt = readFileSync(promptFile, 'utf8').trim();
    if (!imagePrompt) fail(`Prompt dosyası boş; AGY çalıştırılmadı: ${promptFile}`);
    prompt = `Aşağıdaki prompttan tek bir görsel üret ve TAM OLARAK şu mutlak yola kaydet: ${output}\nPrompt dosyası: ${promptFile}\nPROMPT BAŞI\n${imagePrompt}\nPROMPT SONU\nKaydettikten sonra yalnız ne ürettiğini ve kaydetme sonucunu yaz.`;
  }
  return {
    bin: 'agy',
    args: [
      '--dangerously-skip-permissions', '--model', AGY_MODEL, '--output-format', 'json', '--print-timeout', '25m',
      // `sor` önceki AGY oturumunu sürdürür: film bir kez izlenir, sonraki sorular bedava.
      // 🔴 `--continue` "EN SON oturuma" döner — araya başka bir agy çağrısı girerse sessizce
      // onu sürdürür. O yüzden kimlik verildiyse `--conversation` tercih edilir; `gor` çıktısı
      // oturum kimliğini basar. Kimliksiz `-c` yalnız hemen ardından çağrılırsa güvenlidir.
      ...(subcommand === 'sor' ? (session ? ['--conversation', session] : ['-c']) : []),
      '-p', prompt,
    ],
    kind: 'agy',
    output,
    media,
    cwd: REPO_ROOT,
  };
}

/** Test edilebilir saf komut kurucusu; hiçbir dış araç çalıştırmaz. */
export function buildInvocation(argv) {
  const values = [...argv];
  const dryIndex = values.indexOf('--kuru');
  const dry = dryIndex !== -1;
  if (dry) values.splice(dryIndex, 1);
  // `--film` tam motion raporunu açar. Bayrak, argüman sayımına GİRMEZ — sayım katı ve
  // katı kalmalı (ölçüldü: gevşek sayım yanlış dosyayı medya sanıp sessiz geçiyordu).
  const filmIndex = values.indexOf('--film');
  const film = filmIndex !== -1;
  if (film) values.splice(filmIndex, 1);
  let session = null;
  const sessionIndex = values.indexOf('--oturum');
  if (sessionIndex !== -1) {
    session = needText(values[sessionIndex + 1], 'Oturum kimliği');
    if (!/^[0-9a-fA-F-]{8,}$/.test(session)) fail(`Oturum kimliği AGY conversation id biçiminde değil: ${session}`);
    values.splice(sessionIndex, 2);
  }
  const [subcommand, ...args] = values;
  if (session && subcommand !== 'sor') fail('--oturum yalnız `sor` ile kullanılır.');
  if (!['is', 'cur', 'gor', 'sor', 'ara', 'kare'].includes(subcommand)) fail(`Bilinmeyen alt komut: ${subcommand || '(yok)'}\n${usage()}`);
  const counts = { is: 1, cur: 1, gor: 2, sor: 1, ara: 1, kare: 2 };
  if (args.length !== counts[subcommand]) fail(`${subcommand} için ${counts[subcommand]} argüman gerekli.\n${usage()}`);
  if (film && subcommand !== 'gor') fail('--film yalnız `gor` ile kullanılır.');
  const invocation = (subcommand === 'is' || subcommand === 'cur')
    ? codexInvocation(subcommand, needText(args[0], subcommand === 'cur' ? 'İddia' : 'Görev'))
    : agyInvocation(subcommand, args, session, { film });
  return { ...invocation, dry, subcommand };
}

export function parseAgyResponse(raw) {
  let parsed;
  try { parsed = JSON.parse(raw); } catch { fail('AGY JSON döndürmedi; başarı sayılmadı.'); }
  if (parsed.status !== 'SUCCESS') {
    fail(`AGY başarısız: status:${String(parsed.status ?? 'YOK')}${parsed.error ? ` · ${String(parsed.error)}` : ''}`);
  }
  if (typeof parsed.response !== 'string' || !parsed.response.trim()) {
    fail('AGY status:SUCCESS ama response boş; bu BAŞARISIZLIK sayıldı.');
  }
  return parsed.response.trim();
}

/** AGY JSON'undan oturum kimliği; yoksa null döner (takip sorusu kimliksiz kalır, çağrı ölmez). */
export function agyConversationId(raw) {
  try {
    const parsed = JSON.parse(raw);
    const id = parsed?.conversation_id;
    return typeof id === 'string' && /^[0-9a-fA-F-]{8,}$/.test(id) ? id : null;
  } catch { return null; }
}

export function parseCodexResponse(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    fail('Codex başarıyla çıktı ama stdout boş; bu BAŞARISIZLIK sayıldı.');
  }
  return raw;
}

function onPath(bin) {
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';')
    : [''];
  return (process.env.PATH || '').split(path.delimiter).some((dir) =>
    extensions.some((ext) => existsSync(path.join(dir, `${bin}${ext}`))));
}

function runCodex(invocation) {
  if (!onPath(invocation.bin)) fail('codex PATH içinde bulunamadı; Codex CLI kurulu/açık değil.');
  let stdout = '';
  try {
    stdout = execFileSync(invocation.bin, invocation.args, {
      cwd: invocation.cwd,
      encoding: 'utf8',
      input: invocation.stdin,
    });
  } catch (error) {
    stdout = String(error.stdout || '');
    writeFileSync(invocation.output, stdout, 'utf8');
    if (stdout) process.stdout.write(stdout);
    fail(`Codex başarısız çıktı (çıkış ${error.status ?? 'bilinmiyor'}). Çıktı kaydı: ${invocation.output}\n${String(error.stderr || '').trim()}`);
  }
  parseCodexResponse(stdout);
  writeFileSync(invocation.output, stdout, 'utf8');
  if (stdout) process.stdout.write(stdout);
  process.stderr.write(`Codex çıktısı kaydedildi: ${invocation.output}\n`);
}

function runAgy(invocation) {
  if (!onPath(invocation.bin)) fail('agy PATH içinde bulunamadı; AGY CLI kurulu/açık değil.');
  if (invocation.subcommand === 'kare') assertMissingOutput(invocation.output);
  let raw = '';
  try {
    raw = execFileSync(invocation.bin, invocation.args, { cwd: invocation.cwd, encoding: 'utf8' });
  } catch (error) {
    fail(`AGY çağrısı başarısız çıktı (çıkış ${error.status ?? 'bilinmiyor'}): ${String(error.stderr || error.stdout || '').trim()}`);
  }
  const response = parseAgyResponse(raw);
  if (invocation.subcommand === 'kare') {
    if (!existsSync(invocation.output)) {
      fail(`AGY response verdi ama hedef görsel oluşmadı; bu BAŞARISIZLIK sayıldı: ${invocation.output}`);
    }
    if (!lstatSync(invocation.output).isFile()) {
      fail(`AGY response verdi ama hedef normal dosya değil; bu BAŞARISIZLIK sayıldı: ${invocation.output}`);
    }
  }
  process.stdout.write(response + '\n');
  // Oturum kimliği basılmazsa takip sorusu kör `-c`'ye mahkûm kalır; kimlik tek satırda verilir.
  const session = agyConversationId(raw);
  if (session && invocation.subcommand !== 'kare') {
    process.stdout.write(`\nOturum: ${session}\nTakip sorusu (film YENİDEN İZLENMEZ): node scripts/dis-goz.mjs sor "<soru>" --oturum ${session}\n`);
  }
  if (invocation.subcommand === 'gor') {
    process.stdout.write(AGY_WARNING + '\n');
    // İşaretçi konuştu; şimdi CETVEL ve HAKEM. Bu iki satır elle hatırlanmaz — o yüzden basılır.
    process.stdout.write([
      '',
      'ZİNCİRİN KALANI — AGY\'nin işaret ettiği aralık kanıta çevrilmeden hüküm EKSİKTİR:',
      `  node scripts/kare-cek.mjs ${posixQuote(invocation.media ?? '<film>')} <aralık> 8 --ses`,
      '  → kareler Read ile açılır (HAKEM); komşu kare farkı donmayı ölçer (CETVEL).',
      '',
    ].join('\n'));
  }
}

export function commandForDisplay(invocation) {
  const command = [invocation.bin, ...invocation.args].map(posixQuote).join(' ');
  if (!invocation.stdin) return command;
  const powerShellCommand = [invocation.bin, ...invocation.args].map(powerShellQuote).join(' ');
  return [
    `printf %s ${posixQuote(invocation.stdin)} | ${command}`,
    `# Windows PowerShell: $disGozTask = ${powerShellQuote(invocation.stdin)}; $disGozTask | & ${powerShellCommand}`,
  ].join('\n');
}

export function main(argv = process.argv.slice(2)) {
  try {
    if (!argv.length || argv.includes('--yardim') || argv.includes('--help')) {
      process.stdout.write(usage() + '\n');
      return 0;
    }
    const invocation = buildInvocation(argv);
    if (invocation.dry) {
      process.stdout.write(commandForDisplay(invocation) + '\n');
      return 0;
    }
    if (invocation.kind === 'codex') runCodex(invocation);
    else runAgy(invocation);
    return 0;
  } catch (error) {
    process.stderr.write(`❌ ${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) process.exitCode = main();
