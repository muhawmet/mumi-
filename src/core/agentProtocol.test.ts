import { describe, expect, test } from 'vitest';
import {
  createAgentArtifact, directivesFromDirectorBrief, nextLifecycleAction, protocolDescriptor,
  verifyAgentArtifact, type AgentArtifact, type JuryContent,
} from './agentProtocol';
import { sha256Hex } from './contract';

const decisionHash = 'd'.repeat(64);
const storyboardHash = 's'.repeat(64);
const base = { provider: 'codex' as const, sceneId: 1, decisionHash, storyboardHash, inputArtifactHashes: [] as string[], revision: 0 as const };
const imageContent = (prompt: string) => ({
  prompt, promptHash: sha256Hex(prompt),
  // BRAIN M3: yorum şeffaf — image_author artifact'i zorunlu interpretation receipt'i taşır.
  interpretation: { dominantSubject: 'test subject', singleEvent: 'test event', frozenInstant: 'test instant' },
  directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
});

describe('agent protocol — deterministic hash/tamper/stale', () => {
  test('aynı artifact aynı contentHash üretir; protocol hash SHA-256', () => {
    const a = createAgentArtifact({ ...base, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent('x') });
    const b = createAgentArtifact({ ...base, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent('x') });
    expect(a.contentHash).toBe(b.contentHash);
    expect(protocolDescriptor().contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyAgentArtifact(a, { decisionHash, storyboardHash }).ok).toBe(true);
  });

  test('content tamper, stale decision ve stale protocol reddedilir', () => {
    const a = createAgentArtifact({ ...base, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent('x') });
    expect(verifyAgentArtifact({ ...a, content: { prompt: 'y' } }, { decisionHash, storyboardHash }).problems).toContain('contentHash tampered');
    expect(verifyAgentArtifact(a, { decisionHash: 'e'.repeat(64), storyboardHash }).problems).toContain('decisionHash stale');
    expect(verifyAgentArtifact({ ...a, protocolHash: '0'.repeat(64) }, { decisionHash, storyboardHash }).problems).toContain('protocolHash stale/tampered');
  });

  test('REJECT exact check+targeted fix; FACT_REQUIRED eksik gerçeği taşır', () => {
    const bad = createAgentArtifact({ ...base, phase: 'IMAGE_JURY', role: 'image_jury', content: { verdict: 'REJECT' } as JuryContent });
    expect(verifyAgentArtifact(bad, { decisionHash, storyboardHash }).ok).toBe(false);
    const fact = createAgentArtifact({ ...base, phase: 'IMAGE_JURY', role: 'image_jury', content: { verdict: 'FACT_REQUIRED', factRequired: 'ürün geometrisi', evidence: ['geometri refi yok'] } as JuryContent });
    expect(verifyAgentArtifact(fact, { decisionHash, storyboardHash }).ok).toBe(true);
  });
});

describe('on-demand lifecycle — bir author, bir jury, en fazla bir revision', () => {
  const author = (revision: 0 | 1) => createAgentArtifact({ ...base, revision, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent(`p${revision}`) });
  const jury = (verdict: JuryContent['verdict'], revision: 0 | 1, extra: Partial<JuryContent> = {}) => createAgentArtifact({
    ...base, revision, phase: 'IMAGE_JURY', role: 'image_jury', content: { verdict, evidence: ['counter-read'], ...extra } as JuryContent,
  });

  test('boş zincir image author ile başlar; PASS sonrası frame bekler', () => {
    expect(nextLifecycleAction([])).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 0 });
    expect(nextLifecycleAction([author(0)])).toEqual({ kind: 'RUN_ROLE', role: 'image_jury', revision: 0 });
    expect(nextLifecycleAction([author(0), jury('PASS', 0)])).toEqual({ kind: 'AWAIT_FRAME' });
  });

  test('ilk REJECT tek revision açar; ikinci REJECT loop değil FACT_REQUIRED', () => {
    const reject0 = jury('REJECT', 0, { failingCheck: 'hex leak', targetedFix: 'hex yerine fiziksel ışık' });
    expect(nextLifecycleAction([author(0), reject0])).toEqual({ kind: 'RUN_ROLE', role: 'image_author', revision: 1 });
    expect(nextLifecycleAction([author(0), reject0, author(1)])).toEqual({ kind: 'RUN_ROLE', role: 'image_jury', revision: 1 });
    const reject1 = jury('REJECT', 1, { failingCheck: 'hex leak', targetedFix: 'hexi çıkar' });
    expect(nextLifecycleAction([author(0), author(1), reject1])).toEqual({ kind: 'FACT_REQUIRED', reason: 'revision limiti doldu: hex leak' });
  });

  test('APPROVE olmayan frame motion açmaz', () => {
    const chain = [author(0), jury('PASS', 0)] as AgentArtifact[];
    const frame = { frameHash: 'f'.repeat(64), width: 1, height: 1, byteSize: 10, localPath: 'frame.png' };
    expect(nextLifecycleAction(chain, { ...frame, verdict: 'REGENERATE' })).toEqual({ kind: 'AWAIT_MAMI_APPROVE' });
    expect(nextLifecycleAction(chain, { ...frame, verdict: 'APPROVE' })).toEqual({ kind: 'RUN_ROLE', role: 'frame_jury', revision: 0 });
  });
});

test('MamiDirectives exact text taşır', () => {
  const raw = '4–5 sahneye anlamlı yazı koy; cümlemi değiştirme.';
  expect(directivesFromDirectorBrief(raw)[0].text).toBe(raw);
});
