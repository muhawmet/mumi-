#!/usr/bin/env node

/**
 * MAMILAS cross-platform launcher runner.
 *
 * The runner owns only human-facing command selection and provider selection. The
 * canonical lifecycle, hashes, gates and role context live in scripts/mamilas-command.mjs
 * and agents/PROTOCOL.md. Legacy production JSON and giant kick prompts are not runnable.
 */
import { accessSync, constants, existsSync, readdirSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
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

function commandCandidates(dir) {
  return readdirSync(dir)
    .filter((name) =>
      (name.endsWith('_mamilas_command.json') || name === 'mamilas_command.json' || name === 'project.json') &&
      statSync(join(dir, name)).isFile(),
    )
    .sort();
}

async function chooseCommand() {
  const explicit = argValue('--file');
  if (explicit) return resolve(explicit);
  const candidates = commandCandidates(HERE);
  if (candidates.length === 0) {
    return die(
      '\n❌  *_mamilas_command.json bulunamadı.',
      '    Timeline’dan “MAMILAS Command” indir veya --file ile tam yolu ver.',
    );
  }
  if (candidates.length === 1) return join(HERE, candidates[0]);
  if (!process.stdin.isTTY) {
    return die(
      `\n❌  ${candidates.length} command adayı var; sessizce birini seçmiyorum.`,
      '    --file ile doğru command dosyasını belirt.',
    );
  }
  console.log('\nBirden fazla command bulundu:');
  candidates.forEach((name, index) => console.log(`  ${index + 1}) ${name}`));
  const answer = (await ask(`Seç (1-${candidates.length}): `)).trim();
  const picked = Number(answer);
  if (!Number.isInteger(picked) || picked < 1 || picked > candidates.length) {
    return die('\n❌  Geçersiz seçim; yanlış projeyi çalıştırmıyorum.');
  }
  return join(HERE, candidates[picked - 1]);
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
  const commandFile = await chooseCommand();
  if (!commandFile) return;
  const mutation = process.argv.includes('--approve-storyboard') || process.argv.includes('--import-frame') || process.argv.includes('--add-directive-file') || process.argv.includes('--export-image-bundle');
  const explicitLaunch = process.argv.includes('--launch');
  const dryRun = mutation || process.argv.includes('--dry-run') || (!explicitLaunch && !process.stdin.isTTY);
  const launch = !mutation && (explicitLaunch || !dryRun);
  const provider = launch ? await chooseProvider() : null;
  if (launch && !provider) return;

  const args = [join(root, 'scripts', 'mamilas-command.mjs'), '--file', commandFile];
  for (const name of ['--scene', '--workspace', '--artifacts', '--import-frame', '--verdict', '--add-directive-file', '--scope', '--out']) {
    const value = argValue(name);
    if (value) args.push(name, value);
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
