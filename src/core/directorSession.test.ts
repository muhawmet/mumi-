import { describe, expect, test } from 'vitest';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildCommandJSON } from './commandExport';
import { generateBatch, resolveRecipeDefaults } from './pure';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor A.1/A.7 (Yerleşik Yönetmen ürün vaadi).
// --director: batch ARKA planda ayrı süreç, foreground'da kalıcı Yönetmen sohbeti.
// Mami gizli .mamilas'ta JSON aramaz; Yönetmen SAHNE-PROMPTLAR.md + BATCH-LOG'dan
// doğal dille durum verir, direktifi exact LIVE_CHAT yoluyla bağlar.
// ============================================================================

function fixtureCommand(sceneCount = 2) {
  const defaults = resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu');
  const generated = generateBatch({
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount, cast: '',
    selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world',
    selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft', selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  });
  const state: any = {
    selectedProjectId: 'education', projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount,
    cast: '', subject: 'Su Döngüsü', location: '', recipeScenes: [], selectedWorldId: 'pixar_3d_edu',
    selectedPropId: 'native_world', selectedRefIds: defaults.selectedRefIds, selectedPaletteId: 'pastel_soft',
    selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3', brandKitLock: '', mood: '',
    cameraEnergy: '', timeLight: '', transition: '', musicVibe: '', pov: '', signature: '', leitmotif: '',
    tempoCurve: '', directorBrief: '', rawSource: '', sourceBeats: [], sourceReport: null,
    beatMode: 'Dengeli', workingMode: 'guided', beatKeeps: {}, beatAnalysis: null,
    scenes: generated.scenes, agentBrief: generated.agentBrief, agentPackets: generated.agentPackets,
    osTextMode: 'AUTO', voSyncMode: 'FREE', shotApprovals: {},
  };
  return buildCommandJSON(state) as any;
}

describe('Yerleşik Yönetmen modu — foreground sohbet + background batch', () => {
  test('--director: batch arkada başlar, Yönetmen oturumu açılır, DIRECTOR-SESSION.md canlı işaretçileri taşır', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mamilas-director-'));
    const command = fixtureCommand(2);
    const file = join(dir, 'sample_mamilas_command.json');
    writeFileSync(file, JSON.stringify(command));
    mkdirSync(join(dir, '.mamilas', 'artifacts'), { recursive: true });
    spawnSync(process.execPath, [resolve('scripts/mamilas-command.mjs'), '--file', file, '--approve-storyboard', '--all-scenes'], { cwd: dir, encoding: 'utf8' });

    // Fake provider: hem arka batch'in rol oturumlarını (SESSION.md varsa artifact yazar)
    // hem foreground Yönetmen'i (DIRECTOR yolunda selam verir çıkar) oynar.
    const bin = join(dir, '.bin');
    mkdirSync(bin);
    const runtimeUrl = require('node:url').pathToFileURL(resolve('scripts/mamilas-command.mjs')).href;
    const helper = join(bin, 'fake-codex.mjs');
    writeFileSync(helper, `
      import { readFile, writeFile } from 'node:fs/promises';
      import { existsSync } from 'node:fs';
      import { join } from 'node:path';
      import { canonicalHash, sha256 } from ${JSON.stringify(runtimeUrl)};
      const instruction = process.argv.slice(2).join(' ');
      const root = join(process.cwd(), '.mamilas');
      if (instruction.includes('DIRECTOR-SESSION.md')) {
        // Yönetmen: oturum sözleşmesini okur, durumu görür, çıkar.
        const session = await readFile(join(root, 'DIRECTOR-SESSION.md'), 'utf8');
        if (!session.includes('SAHNE-PROMPTLAR.md')) throw new Error('Yönetmen canlı paket işaretçisini görmedi');
        if (!session.includes('Yerleşik Yönetmen')) throw new Error('rol kartı yüklenmedi');
        console.error('Yönetmen: batch arkada, Mami ile konuşuyorum.');
        process.exit(0);
      }
      // Rol oturumu: template'i doldur, mühürle. Oturum scratch'i sahne/rol başına izole
      // (.mamilas/work/<scene>/<role>/<rev>/), bu yüzden en yeni SESSION.md aranır.
      const { readdirSync, statSync } = await import('node:fs');
      const findSessions = (d, acc = []) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          const full = join(d, e.name);
          if (e.isDirectory()) findSessions(full, acc);
          else if (e.name === 'SESSION.md') acc.push(full);
        }
        return acc;
      };
      const sessionPath = findSessions(root).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
      const session = await readFile(sessionPath, 'utf8');
      const template = JSON.parse(await readFile(session.match(/--seal-artifact "([^"]+)"/)[1], 'utf8'));
      const out = session.match(/--out "([^"]+)"/)[1];
      if (template.role === 'image_author') {
        const prompt = 'Scene ' + template.sceneId + ' director-mode prompt. Continuous dimensional 3D CGI feature-animation shading with never any photoreal or live-action capture.';
        template.content = {
          prompt, promptHash: sha256(prompt),
          interpretation: { dominantSubject: 's', singleEvent: 'e', frozenInstant: 'i' },
          directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
        };
      } else {
        template.content = { verdict: 'PASS', evidence: ['stub counter-read'] };
      }
      const { contentHash: _x, ...body } = template;
      const sealedOut = { ...body, contentHash: canonicalHash(body) };
      await writeFile(out, JSON.stringify(sealedOut));
    `, 'utf8');
    let stub: string;
    if (process.platform === 'win32') {
      stub = join(bin, 'codex.cmd');
      writeFileSync(stub, `@echo off\r\n"${process.execPath}" "${helper}" %*\r\n`, 'utf8');
    } else {
      stub = join(bin, 'codex');
      writeFileSync(stub, `#!/bin/sh\nexec "${process.execPath}" "${helper}" "$@"\n`, 'utf8');
      chmodSync(stub, 0o755);
    }

    const result = spawnSync(process.execPath, [
      resolve('scripts/mamilas-command.mjs'), '--file', file, '--director', '--provider', 'codex',
    ], { cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` }, timeout: 120_000 });

    expect(result.status, result.stderr).toBe(0);
    // İnsan sohbeti stdout'u kirletilmez — kapanış insan-okur satırdır, JSON değil.
    expect(result.stderr).toContain('Yönetmen oturumu kapandı');
    expect(result.stderr).toContain('Batch arka planda başladı');
    // Yönetmen oturum sözleşmesi yazıldı ve rol kartını taşıyor:
    const session = readFileSync(join(dir, '.mamilas', 'DIRECTOR-SESSION.md'), 'utf8');
    expect(session).toContain('SAHNE-PROMPTLAR.md');
    expect(session).toContain('Sıradan `REJECT` için Mami\'yi DURDURMA');
    expect(session).toContain('--add-directive-file');
    // Arka batch'in bitmesini bekle (stub roller hızlı; log dosyası oluşur):
    const deadline = Date.now() + 90_000;
    const packPath = join(dir, 'SAHNE-PROMPTLAR.md');
    let packText = '';
    while (Date.now() < deadline) {
      if (existsSync(packPath)) {
        packText = readFileSync(packPath, 'utf8');
        if (packText.includes('2 PASS prompt hazır')) break;
      }
      spawnSync(process.platform === 'win32' ? 'cmd' : 'sh', process.platform === 'win32' ? ['/c', 'ping -n 2 127.0.0.1 >nul'] : ['-c', 'sleep 1']);
    }
    expect(packText).toContain('2 PASS prompt hazır');
    expect(existsSync(join(dir, 'BATCH-LOG.txt'))).toBe(true);
  }, 180_000);
});
