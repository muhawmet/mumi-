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

  // M2 — jüri PASS öz-beyanı, author prompt'unun kod-ölçülebilir bir rejectIf (AI-slop)
  // taşımasını MEŞRULAŞTIRAMAZ. verifyAgentArtifact author prompt'unu SURGEON'dan geçirir.
  // Kök: eski kod jüri PASS + boş-olmayan evidence gördü mü kabul ediyordu; prompt'un
  // içeriğiyle ilgisi ölçülmüyordu. Şimdi author artifact'i prompt'u ölçülünce reddediyor.
  describe('M2 — SURGEON çapraz-kontrolü: PASS, ölçülebilir slop\'u aklayamaz', () => {
    test('CONTROL: temiz author prompt kabul edilir', () => {
      const a = createAgentArtifact({ ...base, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent('Dominant element: a black thermos on oak, warm key light, 35mm eye-level.') });
      const v = verifyAgentArtifact(a, { decisionHash, storyboardHash });
      expect(v.ok).toBe(true);
    });

    test('ATTACK: image author prompt AI-slop taşıyorsa REDDEDİLİR (hash/shape geçerli olsa da)', () => {
      const slopPrompt = 'A thermos, masterpiece, ultra-detailed, trending on artstation, 8k.';
      const a = createAgentArtifact({ ...base, phase: 'IMAGE_PROMPT', role: 'image_author', content: imageContent(slopPrompt) });
      // Artifact şekil/hash olarak KUSURSUZ — yalnız içerik-ölçüm reddetmeli.
      const v = verifyAgentArtifact(a, { decisionHash, storyboardHash });
      expect(v.ok).toBe(false);
      expect(v.problems.join(' ')).toMatch(/AI-slop \(surgeon\)/);
      expect(v.problems.join(' ')).toMatch(/masterpiece/);
    });

    test('ATTACK: motion author prompt slop\'u da yakalanır; NEGATIVE prohibition satırı muaf', () => {
      const motionBase = {
        ...base, phase: 'MOTION' as const, role: 'motion_author' as const,
      };
      const motionContent = (prompt: string) => ({ frameHash: 'f'.repeat(64), inventory: ['thermos'], prompt, promptHash: sha256Hex(prompt), risks: [] });
      // NEGATIVE satırında slop kelimelerini YASAK olarak adlandırmak meşru → muaf.
      const clean = createAgentArtifact({ ...motionBase, content: motionContent('Thermos rotates slowly on the table.\nNEGATIVE: masterpiece, cinematic lighting, 8k') });
      expect(verifyAgentArtifact(clean, { decisionHash, storyboardHash, frameHash: 'f'.repeat(64) }).ok).toBe(true);
      // Gövdede gerçek slop → reddedilir.
      const dirty = createAgentArtifact({ ...motionBase, content: motionContent('Thermos rotates, cinematic lighting, breathtaking.') });
      const v = verifyAgentArtifact(dirty, { decisionHash, storyboardHash, frameHash: 'f'.repeat(64) });
      expect(v.ok).toBe(false);
      expect(v.problems.join(' ')).toMatch(/motion prompt AI-slop \(surgeon\)/);
    });
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
