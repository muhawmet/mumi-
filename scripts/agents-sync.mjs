#!/usr/bin/env node
// MAMILAS agents-sync — tek kanon (agents/) → iki yüzey (.claude/agents, .codex/agents).
// Üretilen her dosya GENERATED banner + protocolHash taşır; elle düzenleme --check'te kırmızı verir.
// Hash: mamilas-command.mjs'in sha256'sı (yeni hash icat edilmez — plan M1 kuralı).
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './mamilas-command.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const GENERATED_BANNER_PREFIX = 'GENERATED — DO NOT EDIT';

function loadManifest() {
  const manifest = JSON.parse(readFileSync(join(REPO_ROOT, 'agents', 'manifest.json'), 'utf8'));
  const protocolText = readFileSync(join(REPO_ROOT, manifest.protocol), 'utf8');
  return { manifest, protocolHash: sha256(protocolText) };
}

function bannerMd(source, protocolHash) {
  return `<!-- ${GENERATED_BANNER_PREFIX} · source: ${source} · protocolHash: ${protocolHash} · regen: npm run agents:sync -->`;
}
function bannerToml(source, protocolHash) {
  return `# ${GENERATED_BANNER_PREFIX} · source: ${source} · protocolHash: ${protocolHash} · regen: npm run agents:sync`;
}

function renderClaudeMd(entry, body, protocolHash) {
  return [
    bannerMd(entry.source, protocolHash),
    '---',
    `name: ${entry.name}`,
    `description: ${entry.description}`,
    `tools: ${entry.tools}`,
    `model: ${entry.model}`,
    '---',
    '',
    body.trimEnd(),
    '',
  ].join('\n');
}

function renderCodexToml(entry, body, protocolHash) {
  const trimmed = body.trimEnd();
  if (trimmed.includes('"""')) {
    throw new Error(`${entry.source}: gövde \`\"\"\"\` içeriyor — TOML multi-line string kırılır; kanonu düzelt`);
  }
  // TOML basic multi-line string: backslash satır-devamı olarak yorumlanır.
  // Kanon gövdelerinde ham backslash varsa kaçışla; bugünkü gövdelerde yok ama güvenli taraf.
  const safe = trimmed.replaceAll('\\', '\\\\');
  return [
    bannerToml(entry.source, protocolHash),
    `name = ${JSON.stringify(entry.name)}`,
    `description = ${JSON.stringify(entry.description)}`,
    'developer_instructions = """',
    safe,
    '"""',
    '',
  ].join('\n');
}

/** Manifest'ten iki yüzeyin beklenen dosya içeriklerini üretir. */
function expectedFiles() {
  const { manifest, protocolHash } = loadManifest();
  const out = [];
  for (const entry of manifest.studioAgents) {
    const body = readFileSync(join(REPO_ROOT, entry.source), 'utf8');
    out.push({
      path: join(manifest.surfaces.claude, `${entry.name}.md`),
      content: renderClaudeMd(entry, body, protocolHash),
      banner: bannerMd(entry.source, protocolHash),
      protocolHash,
    });
    out.push({
      path: join(manifest.surfaces.codex, `${entry.name}.toml`),
      content: renderCodexToml(entry, body, protocolHash),
      banner: bannerToml(entry.source, protocolHash),
      protocolHash,
    });
  }
  return { manifest, protocolHash, files: out };
}

export function syncAgents() {
  const { files } = expectedFiles();
  const written = [];
  for (const f of files) {
    const abs = join(REPO_ROOT, f.path);
    mkdirSync(dirname(abs), { recursive: true });
    const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    if (current !== f.content) {
      writeFileSync(abs, f.content, 'utf8');
      written.push(f.path);
    }
  }
  return { written };
}

export function checkAgents() {
  const { manifest, files } = expectedFiles();
  const drift = [];
  const report = [];
  const expectedPaths = new Set(files.map((f) => f.path));

  for (const f of files) {
    const abs = join(REPO_ROOT, f.path);
    const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    const hasBanner = current !== null && current.startsWith(f.banner);
    if (current === null) drift.push(`${f.path}: missing (run agents:sync)`);
    else if (current !== f.content) drift.push(`${f.path}: stale/hand-edited (byte mismatch vs fresh sync)`);
    if (current !== null && !hasBanner) drift.push(`${f.path}: missing-banner`);
    report.push({ path: f.path, hasBanner, protocolHash: f.protocolHash });
  }

  // Orphan avı: yüzeylerde manifest'in üretmediği mamilas-* dosyası = elle yazılmış authority (KUSUR-B).
  const orphans = [];
  for (const [surface, dir] of Object.entries(manifest.surfaces)) {
    const abs = join(REPO_ROOT, dir);
    if (!existsSync(abs)) continue;
    const ext = surface === 'claude' ? '.md' : '.toml';
    for (const name of readdirSync(abs)) {
      if (!name.startsWith('mamilas-') || !name.endsWith(ext)) continue;
      const rel = join(dir, name);
      if (!expectedPaths.has(rel)) orphans.push(rel);
    }
  }

  return { drift, orphans, files: report };
}

// CLI
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  const isCheck = process.argv.includes('--check');
  if (isCheck) {
    const { drift, orphans } = checkAgents();
    const problems = [...drift, ...orphans.map((o) => `${o}: orphan (manifest'te yok)`)];
    if (problems.length) {
      console.error('agents-sync --check FAIL:');
      for (const p of problems) console.error(`  - ${p}`);
      process.exit(1);
    }
    console.log('agents-sync --check OK — iki yüzey kanonla birebir.');
  } else {
    const { written } = syncAgents();
    if (written.length) {
      console.log(`agents-sync: ${written.length} dosya yazıldı:`);
      for (const w of written) console.log(`  - ${w}`);
    } else {
      console.log('agents-sync: her şey güncel, yazılan dosya yok.');
    }
  }
}
