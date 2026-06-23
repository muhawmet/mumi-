#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const ROLES = new Set(['all', 'idea', 'image', 'motion', 'suno', 'proof']);

function usage() {
  console.error([
    'Usage: node scripts/mamilas-command.mjs <mamilas_command.json> [--role image|motion|suno|idea|proof|all] [--json]',
    '',
    'Examples:',
    '  node scripts/mamilas-command.mjs brief_mamilas_command.json --role image',
    '  node scripts/mamilas-command.mjs brief_mamilas_command.json --role motion --json | claude --print --input-format json',
  ].join('\n'));
}

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function fail(message) {
  console.error(`mamilas-command: ${message}`);
  usage();
  process.exit(1);
}

const file = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
if (!file) fail('missing command JSON file');

const role = argValue('--role', 'all');
if (!ROLES.has(role)) fail(`unknown role "${role}"`);

const asJson = process.argv.includes('--json');
const command = JSON.parse(await readFile(file, 'utf8'));
if (command.schema !== 'mamilas.command.v2026') {
  fail(`unsupported schema "${command.schema || 'missing'}"`);
}

const roles = role === 'all'
  ? command.commands.roles.map((item) => item.role)
  : [role];

const payload = {
  schema: command.schema,
  commandId: command.commandId,
  role,
  contract: command.commands.contract,
  sourceIntegrity: command.sourceIntegrity,
  locks: command.locks,
  referenceDNA: command.referenceDNA,
  scenes: command.scenes,
  packets: Object.fromEntries(
    roles.map((item) => [
      item,
      item === 'idea' ? command.agentBrief || command.agentPackets?.idea || '' : command.agentPackets?.[item] || '',
    ]),
  ),
};

if (asJson) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(0);
}

process.stdout.write(`MAMILAS COMMAND ${command.version} · ${command.commandId}\n`);
process.stdout.write(`ROLE: ${role}\n`);
process.stdout.write(`TOPIC: ${command.locks.topic}\n`);
process.stdout.write(`PATH: ${command.locks.productionPath} · WORLD: ${command.locks.worldId} · PALETTE: ${command.locks.paletteId || 'world-default'}\n\n`);
process.stdout.write('== CONTRACT ==\n');
process.stdout.write(`${command.commands.contract.map((line) => `- ${line}`).join('\n')}\n\n`);

for (const item of roles) {
  const text = payload.packets[item];
  process.stdout.write(`== ${item.toUpperCase()} PACKET ==\n`);
  process.stdout.write(`${text || '[missing packet in command JSON]'}\n\n`);
}
