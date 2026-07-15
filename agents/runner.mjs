#!/usr/bin/env node

/**
 * MAMILAS cross-platform launcher runner.
 *
 * The runner owns only human-facing command selection and provider selection. The
 * canonical lifecycle, hashes, gates and role context live in scripts/mamilas-command.mjs
 * and agents/PROTOCOL.md. Legacy production JSON and giant kick prompts are not runnable.
 */
import {
  accessSync, constants, copyFileSync, existsSync, mkdirSync, readFileSync,
  readdirSync, statSync, writeFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { delimiter, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const HERE = dirname(fileURLToPath(import.meta.url));
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => rl.question(question);

async function die(...lines) {
  for (const line of lines) console.error(line);
  rl.close();
  process.exitCode = 1;
  return null;
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function findRepoRoot(start) {
  let cursor = resolve(start);
  while (true) {
    if (
      existsSync(join(cursor, 'scripts', 'mamilas-command.mjs')) &&
      existsSync(join(cursor, 'agents', 'PROTOCOL.md'))
    ) return cursor;
    const parent = dirname(cursor);
    if (parent === cursor) return null;
    cursor = parent;
  }
}

function commandInbox(root) {
  return resolve(argValue('--inbox') ?? join(root, 'agents', 'COMMAND-INBOX'));
}

function commandCandidates(dir) {
  mkdirSync(dir, { recursive: true });
  const runnable = [];
  const rejected = [];
  for (const name of readdirSync(dir).sort()) {
    const file = join(dir, name);
    if (!name.toLowerCase().endsWith('.json') || !statSync(file).isFile()) continue;
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'));
      if (parsed?.schema === 'mamilas.command.v2026') runnable.push({ name, file });
      else rejected.push(`${name} (${parsed?.schema ?? 'schema yok'})`);
    } catch {
      rejected.push(`${name} (geçerli JSON değil)`);
    }
  }
  return { runnable, rejected };
}

async function chooseCommand(root) {
  const explicit = argValue('--file');
  if (explicit) return resolve(explicit);
  const inbox = commandInbox(root);
  const { runnable: candidates, rejected } = commandCandidates(inbox);
  if (candidates.length === 0) {
    return die(
      '\n❌  COMMAND-INBOX içinde çalıştırılabilir MAMILAS Command yok.',
      `    Dosyayı buraya bırak: ${inbox}`,
      '    Timeline → “Komut JSON” indir. “Proje Paketi” bu runner için çalıştırılamaz.',
      ...(rejected.length ? [`    Atlanan dosyalar: ${rejected.join(', ')}`] : []),
    );
  }
  if (candidates.length === 1) return candidates[0].file;
  if (!process.stdin.isTTY) {
    return die(
      `\n❌  ${candidates.length} command adayı var; sessizce birini seçmiyorum.`,
      '    --file ile doğru command dosyasını belirt.',
    );
  }
  console.log('\nBirden fazla command bulundu:');
  candidates.forEach(({ name }, index) => console.log(`  ${index + 1}) ${name}`));
  const answer = (await ask(`Seç (1-${candidates.length}): `)).trim();
  const picked = Number(answer);
  if (!Number.isInteger(picked) || picked < 1 || picked > candidates.length) {
    return die('\n❌  Geçersiz seçim; yanlış projeyi çalıştırmıyorum.');
  }
  return candidates[picked - 1].file;
}

function projectIdentity(value) {
  const name = String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!name) throw new Error('Proje adı boş olamaz.');
  let folder = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/-+/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 80)
    .trim();
  if (!folder || folder === '.' || folder === '..') throw new Error('Proje adı güvenli bir klasör adına dönüşmedi.');
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(folder)) folder = `_${folder}`;
  return { name, folder };
}

async function chooseProjectName() {
  const explicit = argValue('--project');
  if (explicit) return explicit;
  if (!process.stdin.isTTY) {
    return die('Proje klasörü için --project "Proje Adı" zorunlu.');
  }
  return ask('\nProje adı: ');
}

function prepareProject(commandFile, rawName) {
  const identity = projectIdentity(rawName);
  const commandBytes = readFileSync(commandFile);
  let commandId = null;
  try {
    const candidate = JSON.parse(commandBytes.toString('utf8'));
    if (/^mamilas-[0-9a-f]{64}$/.test(candidate?.commandId ?? '')) commandId = candidate.commandId;
  } catch { /* canonical runtime reports the exact JSON error */ }
  const runId = commandId ?? `unverified-${createHash('sha256').update(commandBytes).digest('hex')}`;
  const projectsRoot = resolve(argValue('--projects-dir') ?? join(HERE, 'MAMILAS-PROJELER'));
  const projectDir = resolve(projectsRoot, identity.folder);
  const expectedPrefix = `${projectsRoot}${sep}`.toLowerCase();
  if (!`${projectDir}${sep}`.toLowerCase().startsWith(expectedPrefix)) {
    throw new Error('Proje klasörü izin verilen kökün dışına çıkamaz.');
  }
  const manifestPath = join(projectDir, 'PROJECT.json');
  if (existsSync(manifestPath)) {
    const existing = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (existing?.name?.toLocaleLowerCase('tr') !== identity.name.toLocaleLowerCase('tr')) {
      throw new Error(`“${identity.name}” mevcut “${existing?.name ?? 'bilinmeyen'}” projesiyle aynı klasör adına dönüşüyor.`);
    }
  }
  const runDir = join(projectDir, 'runs', runId);
  const workspaceDir = join(runDir, '.mamilas');
  mkdirSync(workspaceDir, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify({
    schema: 'mamilas.local-project.v1',
    name: identity.name,
    folder: identity.folder,
    activeCommandId: commandId,
  }, null, 2)}\n`, 'utf8');
  const projectCommand = join(runDir, 'mamilas_command.json');
  if (resolve(commandFile) !== resolve(projectCommand)) copyFileSync(commandFile, projectCommand);
  console.log(`\nProje klasörü: ${projectDir}`);
  console.log(`Aktif çalışma: ${runDir}`);
  return projectCommand;
}

function executable(name) {
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean)
    : [''];
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (!dir) continue;
    for (const extension of extensions) {
      for (const suffix of process.platform === 'win32' ? [extension.toLowerCase(), extension.toUpperCase()] : ['']) {
        const candidate = resolve(dir, `${name}${suffix}`);
        try {
          accessSync(candidate, constants.X_OK);
          if (statSync(candidate).isFile()) return candidate;
        } catch { /* try the next PATH entry */ }
      }
    }
  }
  return null;
}

async function chooseProvider() {
  const explicit = argValue('--provider');
  if (explicit) {
    if (!['claude', 'codex'].includes(explicit)) return die('--provider claude|codex olmalı.');
    return explicit;
  }
  const available = ['claude', 'codex'].filter(executable);
  if (available.length === 1) return available[0];
  if (!process.stdin.isTTY) return die('--launch için --provider claude|codex zorunlu.');
  console.log('\nProvider seç:');
  console.log(`  1) Claude${available.includes('claude') ? '' : ' — CLI bulunamadı'}`);
  console.log(`  2) Codex${available.includes('codex') ? '' : ' — CLI bulunamadı'}`);
  const answer = (await ask('Seç (1/2): ')).trim();
  const provider = answer === '1' ? 'claude' : answer === '2' ? 'codex' : null;
  if (!provider) return die('Geçersiz provider seçimi.');
  if (!available.includes(provider)) return die(`${provider} CLI bulunamadı.`);
  return provider;
}

async function run() {
  const root = findRepoRoot(HERE);
  if (!root) return die('Kanonik scripts/mamilas-command.mjs ve agents/PROTOCOL.md bulunamadı.');
  const projectName = argValue('--workspace') ? null : await chooseProjectName();
  if (projectName === null && !argValue('--workspace')) return;
  const selectedCommand = await chooseCommand(root);
  if (!selectedCommand) return;
  const commandFile = projectName ? prepareProject(selectedCommand, projectName) : selectedCommand;
  const mutation = process.argv.includes('--approve-storyboard') || process.argv.includes('--import-frame') || process.argv.includes('--add-directive-file') || process.argv.includes('--export-image-bundle');
  const explicitLaunch = process.argv.includes('--launch');
  const dryRun = mutation || process.argv.includes('--dry-run') || (!explicitLaunch && !process.stdin.isTTY);
  const launch = !mutation && (explicitLaunch || !dryRun);
  const provider = launch ? await chooseProvider() : null;
  if (launch && !provider) return;

  const args = [join(root, 'scripts', 'mamilas-command.mjs'), '--file', commandFile];
  for (const name of ['--scene', '--workspace', '--artifacts', '--import-frame', '--verdict', '--add-directive-file', '--scope', '--out']) {
    const value = argValue(name);
    if (value) {
      const forwarded = projectName && ['--import-frame', '--add-directive-file'].includes(name)
        ? resolve(value)
        : value;
      args.push(name, forwarded);
    }
  }
  if (process.argv.includes('--approve-storyboard')) args.push('--approve-storyboard');
  if (process.argv.includes('--export-image-bundle')) args.push('--export-image-bundle');
  if (launch) args.push('--launch', '--provider', provider);
  else args.push('--dry-run');

  rl.close();
  const child = spawn(process.execPath, args, { cwd: dirname(commandFile), stdio: 'inherit' });
  await new Promise((resolvePromise, reject) => {
    child.on('exit', (code) => { process.exitCode = code ?? 1; resolvePromise(); });
    child.on('error', reject);
  });
}

try {
  await run();
} catch (error) {
  await die(`runner: ${error.message}`);
}
