import { describe, expect, it } from 'vitest';
import type { Scene } from '../store/useStudioStore';
import { normalizeDownloadName, scenesToMarkdown, scenesToCSV, type ExportContext } from './exporters';

const CTX: ExportContext = {
  topic: 'Fotosentez',
  projectClass: 'edu_explainer',
  cast: 'none',
  worldId: 'pixar_3d_edu',
  refIds: ['ref_a'],
  paletteId: 'world default',
};

function makeScene(onScreenText: string | null): Scene {
  return {
    id: 1,
    phaseName: 'Climax',
    durationSec: 4,
    intensity: 80,
    imagePrompt: 'a glowing leaf, morning light',
    motionPrompt: '',
    voiceOver: 'Işık yaprağa çarpar.',
    sunoBrief: 'warm ambient pulse',
    onScreenText,
    duration: {} as Scene['duration'],
    handoff: {} as Scene['handoff'],
    architecture: {
      beat: 'reveal',
      exactSourceBeat: 'Işık yaprağa çarpar.',
      semanticInterpretationStatus: 'AGENT_AUTHORED',
      imageVantage: 'macro',
      semanticFingerprint: 'abc123',
    } as Scene['architecture'],
  } as Scene;
}

// CLAUDE.md sert-kısıt: on-screen text ya IMAGE PROMPT'a diegetik/baked gömülür ya HİÇ olmaz.
// Mami After Effects/editör BİLMEZ — export post-prodüksiyon overlay/katman/konum/süre spec'i YAZAMAZ.
// Kanun otoritesi: commandExport.ts:202 (ON-SCREEN TEXT LAW).
describe('export ON-SCREEN TEXT LAW compliance', () => {
  const AE_LEAK = /AE Layer|After Effects|\(AE\)|· TITLE ·|· BOLD ·|Alt-merkez|Merkez · TITLE/i;

  it('scenesToMarkdown frames on-screen text as baked, never a post-production overlay', () => {
    const md = scenesToMarkdown([makeScene('Fotosentez')], CTX);
    expect(md).not.toMatch(AE_LEAK);
    expect(md).toMatch(/baked/i);
    expect(md).toMatch(/Fotosentez/);
  });

  it('scenesToMarkdown marks textless scenes as NO_TEXT (image carries meaning)', () => {
    const md = scenesToMarkdown([makeScene(null)], CTX);
    expect(md).not.toMatch(AE_LEAK);
    expect(md).toMatch(/NO_TEXT/);
  });

  it('scenesToCSV header does not name After Effects', () => {
    const csv = scenesToCSV([makeScene('Fotosentez')], CTX);
    expect(csv).not.toMatch(AE_LEAK);
  });
});

describe('normalizeDownloadName', () => {
  it('keeps JSON exports named and extension-safe even for long Turkish dossier titles', () => {
    const name = normalizeDownloadName(
      'Peki hiç düşündün mü... sen kaç farklı GRUBA aynı anda üye olabilirsin? "Biliyor muydun"_production.json',
      'application/json;charset=utf-8',
    );
    expect(name).toMatch(/_production\.json$/);
    expect(name.length).toBeLessThanOrEqual(125);
    expect(name).not.toMatch(/[<>:"/\\|?*]/);
  });

  it('adds the extension when a caller forgets it', () => {
    expect(normalizeDownloadName('mamilas_command', 'application/json')).toBe('mamilas_command.json');
    expect(normalizeDownloadName('timeline', 'text/csv;charset=utf-8')).toBe('timeline.csv');
  });
});
