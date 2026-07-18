#!/usr/bin/env node

/**
 * MAMILAS interactive command lifecycle.
 *
 * This is not an agent, prompt author or generator. It validates the canonical decision,
 * protocol and artifacts; derives one next role; and only with --launch opens one interactive
 * Claude/Codex session. No --print, provider API, image/video call or agent loop exists here.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { delimiter, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const PROTOCOL_PATH = join(REPO_ROOT, 'agents', 'PROTOCOL.md');
const ARTIFACT_SCHEMA = 'mamilas.agent-artifact.v1';
const STORYBOARD_APPROVAL_SCHEMA = 'mamilas.storyboard-approval.v1';
const FRAME_RECEIPT_SCHEMA = 'mamilas.frame-receipt.v1';
const PROTOCOL_VERSION = 'mamilas.agent-protocol.v1';
const JURY = new Set(['PASS', 'REJECT', 'FACT_REQUIRED']);
const FRAME_VERDICTS = new Set(['APPROVE', 'REGENERATE', 'PROJECT_ONLY_ACCEPT', 'PENDING']);
const PROVIDERS = new Set(['claude', 'codex']);
const ROLE_PHASE = {
  image_author: 'IMAGE_PROMPT', image_jury: 'IMAGE_JURY', frame_jury: 'FRAME_JURY',
  motion_author: 'MOTION', motion_jury: 'MOTION_JURY',
};
// Statik çekirdek — src/core/agentProtocol.ts ile aynı; sealed context'in parçası
// olduğundan drift sceneContextHash kapısında yakalanır. BRAIN M4: madenlenmiş
// yasalar TEK kanondan (agents/promptQuality.mined.json) okunur — ayna kopya yok.
const IMAGE_PROMPT_QUALITY_CONTRACT = Object.freeze({
  frameBuildOrder: [
    'visible subject + decisive action + physical place',
    'one compositional relationship that makes the beat readable',
    'one camera relation plus one motivated light or material behaviour from the selected world',
    'only the narrow, frame-specific constraints that protect the beat',
  ],
  requiredEvidence: [
    'A viewer can name who or what is dominant, what is happening, and where it is happening without reading style language.',
    'The composition describes a physical relationship, threshold, foreground/background separation, or eyeline rather than an abstract mood.',
    'World and reference DNA become an observable choice in this frame; they never introduce a second subject, story, location, era, or identity.',
  ],
  referencePolicy: [
    'Compatible references are subordinate visual grammar, never a source of plot, named identity, or location.',
    'Choose at most one reference-derived observable cue when it strengthens this shot; do not list or blend reference catalogues.',
  ],
  rejectIf: [
    'Generic quality adjectives or a style catalogue carry more meaning than the approved beat.',
    'The prompt could describe a different scene after the subject, action, and place are removed.',
    'A fallback topic competes with a RAW_SOURCE_VAULT shot.',
    'A reference supplies invented narrative facts, protected identity, brand, period, or location.',
  ],
});

// BRAIN M4 — madenlenmiş yasalar TEK kanondan; TS tarafıyla (agentProtocol.ts
// buildImagePromptQualityContract) birebir aynı mantık. Drift sceneContextHash'te kırmızı.
const MINED = JSON.parse(readFileSync(join(REPO_ROOT, 'agents', 'promptQuality.mined.json'), 'utf8'));

// ============================================================================
// HARD-FIX 2026-07-16 (rapor madde 16/17) — DETERMİNİSTİK IP/BRAND FIREWALL,
// üretilen FINAL agent prompt'u üzerinde. Protokol "IP firewall deterministic
// koddur; ajan rolü değildir" diyordu ama o kod agent-yazımı prompt yoluna hiç
// bağlanmamıştı: hash-valid + jury-PASS bir artifact korumalı kimlik/marka taşısa
// mekanik kapıdan geçiyordu. Kanon: agents/ipFirewall.json — src/core/proof.ts ile
// AYNI dosya (parite testi ipFirewall.test.ts). Türkçe ek yasası (Naruto'nun /
// Narutonun / Gokuya) proof.ts ile birebir.
// ============================================================================
const IP_FIREWALL = JSON.parse(readFileSync(join(REPO_ROOT, 'agents', 'ipFirewall.json'), 'utf8'));
const FW_GATE_TERMS = [
  ...IP_FIREWALL.protectedIpSource.split('|').filter((t) => !IP_FIREWALL.gateExemptGenerics.includes(t)),
  ...IP_FIREWALL.gateExtraFranchise,
].sort((a, b) => b.length - a.length);
const FW_ESCAPE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FW_BRAND_RE = new RegExp(`\\b(?:${IP_FIREWALL.commercialBrandSource})\\b`, 'giu');
const FW_WORK_TITLE_RE = new RegExp(`\\b(?:${IP_FIREWALL.workTitleSource})\\b`, 'gu');
// GATE terimleri regex-source parçaları DEĞİL düz metin (peter b\. parker hariç —
// proof.ts de escape'lemeden gömer; kanon aynı byte'ı taşıdığı için davranış birebir).
const FW_TERM_RES = FW_GATE_TERMS.map((term) =>
  new RegExp(`\\b${FW_ESCAPE(term)}${IP_FIREWALL.turkishSuffix}\\b`, 'iu'));

export function firewallHitsIn(text) {
  if (!text) return [];
  const hits = [];
  for (let i = 0; i < FW_TERM_RES.length; i += 1) {
    if (FW_TERM_RES[i].test(text)) hits.push(FW_GATE_TERMS[i]);
  }
  FW_BRAND_RE.lastIndex = 0;
  for (const match of text.matchAll(FW_BRAND_RE)) hits.push(match[0].toLowerCase());
  FW_WORK_TITLE_RE.lastIndex = 0;
  for (const match of text.matchAll(FW_WORK_TITLE_RE)) hits.push(match[0]);
  return Array.from(new Set(hits));
}
// ==================== PROMPT SURGEON — runtime ikiz (M2) ====================
// src/core/qa.ts scanPromptSurgeon'un runtime aynası. Jüri PASS'i (öz-beyan) author
// prompt'unun kod-ölçülebilir bir rejectIf (AI-slop) taşımasını MEŞRULAŞTIRAMAZ:
// jüri ayrı artifact, PASS provenance değil correctness iddiasıdır. Bu tespit
// deterministik ve nötr — SLOP_RE + motion soyucu qa.ts ile BİREBİR aynı desen
// (parite elle korunur; agentProtocol.test.ts + commandRuntime.test.ts iki yüzeyi de sürer).
// Hex zaten aşağıda ayrı regex ile yakalanıyor (image prompt workflow/hex leak) → burada
// yalnız AI-slop taranır, çift-bayrak yok.
const SLOP_RE = /\b(masterpiece|ultra[- ]?detailed|award[- ]?winning|8k|4k|trending on artstation|best quality|highly detailed|stunning|breathtaking|jaw[- ]?dropping|mind[- ]?blowing|ultra[- ]?realistic|hyper[- ]?realistic|octane render|unreal engine|cinematic (?:lighting|shot|feel|look|quality|masterpiece)|dynamic (?:lighting|shot|angle|pose|composition)|epic (?:scale|shot|scene|lighting))\b/gi;

function stripExemptMotionLines(motionPrompt) {
  return (motionPrompt || '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('NEGATIVE:'))
    .map((line) => line
      .replace(/Engine grammar \([^)]*\):.*?(?=Everything not named|$)/, '')
      .replace(/source beat "[^"]*" \[SOURCE —[^\]]*\]/, 'source beat [SOURCE-QUOTE-EXEMPT]'))
    .join('\n');
}

// Tek prompt'ta AI-slop token'ları. motion=true → motion muafiyet soyucusu; image için
// 'Negative: ' kuyruğu taranmaz (qa.ts ile aynı sıra). Render-lock hex muafiyeti burada
// GEREKMEZ: slop'un lock içinde meşru geçişi yok, hex zaten ayrı kapıda.
function surgeonSlopHits(prompt, motion) {
  const text = prompt || '';
  const slopScan = motion ? stripExemptMotionLines(text) : text.split(/\bNegative:\s/)[0];
  return Array.from(new Set((slopScan.match(SLOP_RE) || []).map((t) => t.toLowerCase())));
}

const isAnimationWorld = (world) => Boolean(world?.group && /ANIMATION|STYLIZED/i.test(world.group));
const isPhotorealWorld = (world) => Boolean(world?.group && /REAL|CINEMATIC|COMMERCIAL/i.test(world.group));

// Override AJAN muhakemesidir — kod direktif keyword'ünden madde bastırmaz
// (Sol kritik: "yarım saniye önce patlama olsun" maddeyi İSTEYEN direktiftir; kod
// polariteyi bilemez). agentProtocol.ts CONTRACT_OVERRIDE_POLICY ile birebir aynı.
const CONTRACT_OVERRIDE_POLICY =
  'Mined clauses are engine-aware defaults, never universal locks. If an APPLIED Mami directive '
  + 'explicitly conflicts with a clause, the directive wins: the Author sets the clause aside and '
  + 'names it under suppressedContext; the Jury must not enforce a clause that an APPLIED directive '
  + 'explicitly contradicts. Suppression is reasoning, done by the agent, visible in the receipt — '
  + 'never inferred by code from directive keywords.';

// BRAIN M7 — ders bankası parser'ı. src/core/lessonBank.ts ile FONKSİYONEL parite
// zorunlu (lessonBank.test.ts iki parser'ı aynı girdilerle çalıştırıp çıktı karşılaştırır).
const LESSON_LINE_RE = /^-\s+(.+?)\s+—\s+kaynak:\s*(.+?)\s*·\s*(\d{4}-\d{2}-\d{2})\s*·\s*Mami onayı\s*$/u;
function parseApprovedLessons(markdown) {
  if (!markdown?.trim()) return [];
  const lessons = [];
  for (const line of markdown.split('\n')) {
    const match = LESSON_LINE_RE.exec(line.trim());
    if (!match) continue;
    lessons.push({ lesson: match[1], sourceProject: match[2], date: match[3], status: 'APPROVED' });
  }
  return lessons.slice(-20); // lessonBank.ts APPROVED_LESSONS_CAP ile aynı tavan
}
export const __testParseApprovedLessons = parseApprovedLessons;

function buildMotionPromptQualityContract({ videoModel }) {
  const key = (videoModel ?? '').toLowerCase();
  const clauses = [
    ...MINED.motionUniversal,
    ...(MINED.motionEngine[key] ?? MINED.motionEngine[key.split('_')[0]] ?? []),
  ];
  return {
    requiredEvidence: clauses.filter((c) => c.kind === 'requiredEvidence').map((c) => c.text),
    rejectIf: clauses.filter((c) => c.kind === 'rejectIf').map((c) => c.text),
    overridePolicy: CONTRACT_OVERRIDE_POLICY,
  };
}

function buildImagePromptQualityContract({ world, imageModel }) {
  const clauses = [
    ...MINED.universal,
    ...(isAnimationWorld(world) ? MINED.animation : []),
    ...(isPhotorealWorld(world) ? MINED.photoreal : []),
    ...(MINED.engine[(imageModel ?? '').toLowerCase()] ?? []),
  ];
  return {
    frameBuildOrder: IMAGE_PROMPT_QUALITY_CONTRACT.frameBuildOrder,
    requiredEvidence: [
      ...IMAGE_PROMPT_QUALITY_CONTRACT.requiredEvidence,
      ...clauses.filter((c) => c.kind === 'requiredEvidence').map((c) => c.text),
    ],
    referencePolicy: IMAGE_PROMPT_QUALITY_CONTRACT.referencePolicy,
    rejectIf: [
      ...IMAGE_PROMPT_QUALITY_CONTRACT.rejectIf,
      ...clauses.filter((c) => c.kind === 'rejectIf').map((c) => c.text),
    ],
    overridePolicy: CONTRACT_OVERRIDE_POLICY,
  };
}

// Parite kilidi için test-only export — promptQuality.test.ts TS üreticisiyle byte-karşılaştırır.
export const __testBuildImagePromptQualityContract = buildImagePromptQualityContract;
export const __testBuildMotionPromptQualityContract = buildMotionPromptQualityContract;

export function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key.normalize('NFC'), item])
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    const seen = new Set();
    for (const [key] of entries) {
      if (seen.has(key)) throw new Error(`canonicalize: NFC sonrası çakışan anahtar: ${key}`);
      seen.add(key);
    }
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(',')}}`;
  }
  return 'null';
}

export const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
export const canonicalHash = (value) => sha256(canonicalize(value));

function storyboardHash(scenes) {
  return canonicalHash(scenes.map((scene) => ({
    id: scene.id,
    phaseName: scene.phaseName,
    durationSec: scene.durationSec,
    architecture: scene.architecture,
    sceneBrief: scene.sceneBrief ?? scene.voiceOver,
  })));
}

/**
 * Explicit, local-only migration for a command exported by an older trusted
 * MAMILAS runtime. It changes no decision or scene data: it only reseals the
 * derived sceneContextHashes after the runtime context schema evolves. The
 * storyboardHash is VERIFIED, never resealed — a mismatch is tamper, not drift.
 * Normal execution still rejects stale commands; migration is never implicit.
 */
export function migrateCommandToCurrentContext(command, currentProtocol = null) {
  const migrated = JSON.parse(JSON.stringify(command));
  if (!Array.isArray(migrated.scenes) || !migrated.lifecycle || !migrated.baseDecision) {
    throw new Error('command migration için canonical command alanları eksik');
  }
  // BRAIN M4 (Sol kritik): migration YALNIZ türetilmiş hash'leri taşır — context ŞEKLİ
  // değişti (ör. promptQuality kontratı büyüdü) diye hash'ler tazelenir. storyboardHash
  // YENİDEN MÜHÜRLENMEZ: onu tazelemek, scenes'i kurcalanmış bir command'i "migration"la
  // meşrulaştırırdı. Storyboard uyuşmuyorsa bu bir migration vakası değil, tamper vakasıdır.
  const expectedStoryboard = storyboardHash(migrated.scenes);
  if (migrated.lifecycle.storyboardHash !== expectedStoryboard) {
    throw new Error('command migration reddedildi: storyboardHash scenes ile uyuşmuyor (tamper/stale storyboard migration ile meşrulaştırılamaz)');
  }
  // HARD-FIX 2026-07-16: PROTOCOL.md karar yasasıdır — yasa evrilince eski command'in
  // yeni yasayla koşabilmesi migration'ın tam amacı. Protokol descriptor'ı da tazelenir
  // (yalnız açık --migrate-command-context yolunda; normal koşu stale protokolü yine reddeder).
  if (currentProtocol) migrated.lifecycle.protocol = { ...currentProtocol };
  migrated.lifecycle.sceneContextHashes = Object.fromEntries(migrated.scenes.map((scene) => [
    scene.id,
    canonicalHash({ imageAuthor: imageContext(migrated, scene), motionEngine: scene.motionEngine }),
  ]));
  return migrated;
}

export async function validateCommand(command) {
  const problems = [];
  if (command?.schema !== 'mamilas.command.v2026') problems.push('unsupported command schema');
  const expectedId = command?.baseDecision ? `mamilas-${canonicalHash(command.baseDecision)}` : null;
  if (!expectedId || command.commandId !== expectedId) problems.push('commandId/baseDecision hash uyuşmuyor');
  const protocolText = await readFile(PROTOCOL_PATH, 'utf8');
  const protocolHash = sha256(protocolText);
  if (command?.lifecycle?.protocol?.version !== PROTOCOL_VERSION) problems.push('protocolVersion stale');
  if (command?.lifecycle?.protocol?.contentHash !== protocolHash) problems.push('protocolHash stale/tampered');
  const expectedStoryboard = Array.isArray(command?.scenes) ? storyboardHash(command.scenes) : null;
  if (!expectedStoryboard || command?.lifecycle?.storyboardHash !== expectedStoryboard) problems.push('storyboardHash stale/tampered');
  if (command?.lifecycle?.revisionLimitPerPhase !== 1) problems.push('revision limit 1 olmalı');
  const expectedDirectives = command?.baseDecision?.creativeControls?.directorBrief?.trim()
    ? [{ id: 'site-directive-001', source: 'SITE', scope: 'PROJECT', sceneId: null, text: command.baseDecision.creativeControls.directorBrief }]
    : [];
  const decisionDirectives = command?.baseDecision?.mamiDirectives;
  if (!Array.isArray(decisionDirectives)) problems.push('baseDecision MamiDirectives yok');
  else {
    const siteDirectives = decisionDirectives.filter((item) => item?.source === 'SITE');
    if (canonicalize(siteDirectives) !== canonicalize(expectedDirectives)) problems.push('SITE MamiDirectives projection stale/tampered');
    const ids = new Set();
    for (const directive of decisionDirectives) {
      if (!directive || typeof directive.id !== 'string' || ids.has(directive.id)) problems.push('MamiDirective id geçersiz/duplicate');
      ids.add(directive?.id);
      if (!['SITE', 'LIVE_CHAT'].includes(directive?.source)) problems.push('MamiDirective source geçersiz');
      if (!['PROJECT', 'SCENE'].includes(directive?.scope)) problems.push('MamiDirective scope geçersiz');
      if (typeof directive?.text !== 'string' || !directive.text.trim()) problems.push('MamiDirective text boş');
      if (directive?.scope === 'PROJECT' && directive.sceneId !== null) problems.push('PROJECT directive sceneId null olmalı');
      if (directive?.scope === 'SCENE' && !command.scenes.some((scene) => scene.id === directive.sceneId)) problems.push('SCENE directive sceneId geçersiz');
      if (directive?.source === 'LIVE_CHAT') {
        const identity = { source: directive.source, scope: directive.scope, sceneId: directive.sceneId, text: directive.text };
        const expectedLiveId = `live-${canonicalHash(identity).slice(0, 16)}`;
        if (directive.id !== expectedLiveId) problems.push('LIVE_CHAT directive id stale/tampered');
      }
    }
    if (canonicalize(command?.lifecycle?.mamiDirectives ?? []) !== canonicalize(decisionDirectives)) {
      problems.push('MamiDirectives exact projection stale/tampered');
    }
  }
  if (!command?.lifecycle?.sceneContextHashes || typeof command.lifecycle.sceneContextHashes !== 'object') {
    problems.push('sceneContextHashes yok');
  } else if (Array.isArray(command?.scenes)) {
    for (const scene of command.scenes) {
      const stored = command.lifecycle.sceneContextHashes[scene.id];
      const actual = canonicalHash({ imageAuthor: imageContext(command, scene), motionEngine: scene.motionEngine });
      if (stored !== actual) problems.push(`scene ${scene.id} contextHash stale/tampered`);
    }
  }
  return { ok: problems.length === 0, problems, protocolText, protocolHash, expectedId, expectedStoryboard };
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') && value.length > 0;
}

function validateRoleContent(artifact, command) {
  const problems = [];
  const content = artifact?.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) return ['content object'];
  const scene = command.scenes.find((item) => item.id === artifact.sceneId);
  const directives = (command.lifecycle.mamiDirectives ?? [])
    .filter((item) => item.scope === 'PROJECT' || item.sceneId === artifact.sceneId);
  if (artifact.role === 'image_author') {
    if (typeof content.prompt !== 'string' || !content.prompt.trim()) problems.push('image prompt');
    if (content.promptHash !== sha256(content.prompt ?? '')) problems.push('image promptHash');
    // BRAIN M3: yorum şeffaf olmak zorunda — dominant özne/tek olay/donmuş an tek-satır receipt.
    // Onay kapısı DEĞİLDİR (akış durmaz); yalnız görünürlük zorlanır. agentProtocol.ts ile aynı yasa.
    const interp = content.interpretation;
    if (!interp || typeof interp !== 'object'
      || typeof interp.dominantSubject !== 'string' || !interp.dominantSubject.trim()
      || typeof interp.singleEvent !== 'string' || !interp.singleEvent.trim()
      || typeof interp.frozenInstant !== 'string' || !interp.frozenInstant.trim()) {
      problems.push('interpretation receipt eksik (dominantSubject/singleEvent/frozenInstant)');
    }
    if (!Array.isArray(content.directiveReceipts)) problems.push('directiveReceipts');
    else {
      const normalized = content.directiveReceipts.map((item) => ({ id: item?.id, text: item?.text, status: item?.status }));
      const expected = directives.map((item) => ({ id: item.id, text: item.text, status: normalized.find((receipt) => receipt.id === item.id)?.status }));
      if (canonicalize(normalized.map((item) => ({ ...item })).sort((a, b) => String(a.id).localeCompare(String(b.id)))) !==
          canonicalize(expected.sort((a, b) => String(a.id).localeCompare(String(b.id))))) problems.push('directiveReceipts exact');
      if (normalized.some((item) => !['APPLIED', 'SUPPRESSED'].includes(item.status))) problems.push('directiveReceipts status');
    }
    if (!nonEmptyStrings(content.appliedLocks)) problems.push('appliedLocks');
    if (!Array.isArray(content.suppressedContext)) problems.push('suppressedContext');
    if (!Array.isArray(content.risks)) problems.push('risks');
    if (/\[DIRECTOR TASK\]|\bTODO\b|#[0-9a-f]{3,8}\b/i.test(content.prompt ?? '')) problems.push('image prompt workflow/hex leak');
    // Madde 16/17: deterministik IP/brand firewall FINAL prompt üzerinde — jury PASS
    // ve hash geçerliliği korumalı kimlik/marka sızıntısını meşrulaştıramaz.
    const imageFirewallHits = firewallHitsIn(content.prompt ?? '');
    if (imageFirewallHits.length) problems.push(`image prompt IP firewall: ${imageFirewallHits.join(', ')}`);
    // M2: PROMPT SURGEON AI-slop çapraz-kontrolü — agentProtocol.ts verifyAgentArtifact ikizi.
    const imageSlop = surgeonSlopHits(content.prompt ?? '', false);
    if (imageSlop.length) problems.push(`image prompt AI-slop (surgeon): ${imageSlop.join(', ')}`);
  } else if (artifact.role === 'motion_author') {
    if (typeof content.prompt !== 'string' || !content.prompt.trim()) problems.push('motion prompt');
    if (content.promptHash !== sha256(content.prompt ?? '')) problems.push('motion promptHash');
    if (!nonEmptyStrings(content.inventory)) problems.push('motion inventory');
    if (!Array.isArray(content.risks)) problems.push('motion risks');
    if (typeof content.frameHash !== 'string') problems.push('motion frameHash');
    const motionFirewallHits = firewallHitsIn(content.prompt ?? '');
    if (motionFirewallHits.length) problems.push(`motion prompt IP firewall: ${motionFirewallHits.join(', ')}`);
    // M2: motion author prompt'u da SURGEON'dan geçer (motion muafiyet soyucusuyla).
    const motionSlop = surgeonSlopHits(content.prompt ?? '', true);
    if (motionSlop.length) problems.push(`motion prompt AI-slop (surgeon): ${motionSlop.join(', ')}`);
  } else if (String(artifact.role || '').endsWith('_jury')) {
    const verdict = content.verdict;
    if (!JURY.has(verdict)) problems.push('jury verdict');
    if (!nonEmptyStrings(content.evidence)) problems.push('jury evidence');
    if (verdict === 'REJECT' && (!content.failingCheck?.trim() || !content.targetedFix?.trim())) problems.push('REJECT evidence');
    if (verdict === 'FACT_REQUIRED' && !content.factRequired?.trim()) problems.push('FACT_REQUIRED evidence');
    if (['frame_jury', 'motion_jury'].includes(artifact.role) && typeof content.frameHash !== 'string') problems.push('jury frameHash');
  }
  if (!scene) problems.push('content scene');
  return problems;
}

// Parite/negatif-probe kilidi için test-only export — ipFirewall.test.ts gerçek
// validator'ı korumalı-kimlik/marka/eser promptlarıyla sürer.
export const __testValidateRoleContent = validateRoleContent;

function verifyArtifact(artifact, command) {
  const problems = [];
  if (artifact?.schema !== ARTIFACT_SCHEMA) problems.push('artifact schema');
  if (artifact?.protocolVersion !== PROTOCOL_VERSION) problems.push('protocolVersion');
  if (artifact?.protocolHash !== command.lifecycle.protocol.contentHash) problems.push('protocolHash');
  if (!Number.isInteger(artifact?.sceneId) || !command.scenes.some((scene) => scene.id === artifact.sceneId)) problems.push('sceneId');
  if (!PROVIDERS.has(artifact?.provider)) problems.push('provider');
  if (!ROLE_PHASE[artifact?.role] || artifact?.phase !== ROLE_PHASE[artifact.role]) problems.push('role/phase');
  if (artifact?.decisionHash !== command.commandId.replace(/^mamilas-/, '')) problems.push('decisionHash');
  if (artifact?.storyboardHash !== command.lifecycle.storyboardHash) problems.push('storyboardHash');
  if (artifact?.revision !== 0 && artifact?.revision !== 1) problems.push('revision');
  if (!Array.isArray(artifact?.inputArtifactHashes)) problems.push('inputArtifactHashes');
  if (!artifact?.contentHash) problems.push('contentHash');
  else {
    const { contentHash, ...body } = artifact;
    if (canonicalHash(body) !== contentHash) problems.push('contentHash tampered');
  }
  problems.push(...validateRoleContent(artifact, command));
  return { ok: problems.length === 0, problems };
}

const artifactAt = (artifacts, role, revision) => artifacts.find((item) => item.role === role && item.revision === revision);

function requiredArtifact(artifacts, role, revision, consumer) {
  const artifact = artifactAt(artifacts, role, revision);
  if (!artifact) throw new Error(`${consumer}: prerequisite ${role}@${revision} yok`);
  return artifact;
}

function expectedInputs(role, revision, artifacts, command, sceneId, frame) {
  const contextHash = command.lifecycle.sceneContextHashes[sceneId];
  const latestPassingImageJury = artifacts
    .filter((item) => item.role === 'image_jury' && item.content?.verdict === 'PASS')
    .sort((a, b) => b.revision - a.revision)[0];
  const imageJury = latestPassingImageJury;
  const imageAuthor = imageJury ? requiredArtifact(artifacts, 'image_author', imageJury.revision, role) : null;
  const frameJury = artifactAt(artifacts, 'frame_jury', 0);

  if (role === 'image_author' && revision === 0) return [contextHash];
  if (role === 'image_author' && revision === 1) {
    const author0 = requiredArtifact(artifacts, 'image_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'image_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('image_author@1 yalnız REJECT sonrası açılır');
    return [contextHash, author0.contentHash, jury0.contentHash];
  }
  if (role === 'image_jury') {
    return [contextHash, requiredArtifact(artifacts, 'image_author', revision, role).contentHash];
  }
  if (role === 'frame_jury') {
    if (!imageAuthor || !imageJury) throw new Error('frame_jury: PASS image zinciri yok');
    if (!frame?.contentHash) throw new Error('frame_jury: current frame receipt yok');
    return [contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash];
  }
  if (role === 'motion_author') {
    if (!imageAuthor || !imageJury || !frameJury || frameJury.content?.verdict !== 'PASS') {
      throw new Error('motion_author: PASS image/frame zinciri yok');
    }
    if (!frame?.contentHash) throw new Error('motion_author: current frame receipt yok');
    const base = [contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash];
    if (revision === 0) return base;
    const author0 = requiredArtifact(artifacts, 'motion_author', 0, role);
    const jury0 = requiredArtifact(artifacts, 'motion_jury', 0, role);
    if (jury0.content?.verdict !== 'REJECT') throw new Error('motion_author@1 yalnız REJECT sonrası açılır');
    return [...base, author0.contentHash, jury0.contentHash];
  }
  if (role === 'motion_jury') {
    if (!imageAuthor || !imageJury || !frameJury) throw new Error('motion_jury: prerequisite zinciri yok');
    return [
      contextHash, imageAuthor.contentHash, imageJury.contentHash, frame.contentHash, frameJury.contentHash,
      requiredArtifact(artifacts, 'motion_author', revision, role).contentHash,
    ];
  }
  throw new Error(`unsupported artifact role: ${role}`);
}

// FABLE bulgusu (2026-07-16): frame-bağımlı artifact'lerde (frame_jury/motion_*) frameHash
// uyuşmazlığı FIRLATILIYORDU — Mami daha iyi bir kare getirdiğinde eski jüri/motion artifact'i
// tüm sahneyi kalıcı kilitliyordu ("kareyi asla değiştiremiyor"). Ürün yasası tam tersini
// söylüyor: "frame değişince motion stale" — stale, ÖLÜM değil YENİDEN-KOŞ demektir.
// Yeni davranış: stale frame-bağımlı artifact zinciri kırmaz; AYIKLANIR (yok sayılır) ve
// dönen liste, canlı zincir olarak kullanılır → nextAction frame_jury'yi yeniden açar.
// Image katı (author/jury) frameHash taşımaz — tamper/uyuşmazlık orada hâlâ FIRLATIR.
function validateArtifactChain(artifacts, frame, command, sceneId) {
  const FRAME_BOUND = new Set(['frame_jury', 'motion_author', 'motion_jury']);
  const live = artifacts.filter((artifact) =>
    !FRAME_BOUND.has(artifact.role)
    || (Boolean(frame?.frameHash) && artifact.content?.frameHash === frame.frameHash));
  const seen = new Set();
  for (const artifact of live) {
    const key = `${artifact.role}@${artifact.revision}`;
    if (seen.has(key)) throw new Error(`duplicate artifact: ${key}`);
    seen.add(key);
    const expected = expectedInputs(artifact.role, artifact.revision, live, command, sceneId, frame);
    if (canonicalize(expected) !== canonicalize(artifact.inputArtifactHashes)) {
      throw new Error(`${key}: inputArtifactHashes zinciri uyuşmuyor`);
    }
  }
  return live;
}

// HARD-FIX 2026-07-16 (rapor A.3/A.4): deterministik format-repair. Gerçek Deneme
// çöküşünün deseni — jüri doğru yaratıcı verdict'i yazdı ama zorunlu alanları
// "FAILING CHECK — …" / "TARGETED FIX — …" prefix'iyle evidence[] içine koydu.
// Bilgi ORADA ve makine-okunur; onarım yaratıcı yorum değil alan taşımadır.
// Onarılan artifact yeniden mühürlenir (contentHash tazelenir) ve diske yazılır —
// creative revision hakkı format hatasına YANMAZ.
const REPAIR_PREFIXES = [
  { field: 'failingCheck', re: /^FAILING CHECK\s*[—:-]\s*/i },
  { field: 'targetedFix', re: /^TARGETED FIX\s*[—:-]\s*/i },
  { field: 'factRequired', re: /^FACT[ _]REQUIRED\s*[—:-]\s*/i },
];
function repairJuryArtifact(value) {
  if (!String(value?.role || '').endsWith('_jury')) return null;
  const content = value?.content;
  if (!content || !Array.isArray(content.evidence)) return null;
  const patch = {};
  for (const item of content.evidence) {
    for (const { field, re } of REPAIR_PREFIXES) {
      if (typeof item === 'string' && re.test(item) && !content[field]?.trim() && !patch[field]) {
        patch[field] = item.replace(re, '').trim();
      }
    }
  }
  if (!Object.keys(patch).length) return null;
  const { contentHash: _drop, ...body } = value;
  const repairedBody = { ...body, content: { ...content, ...patch } };
  return { ...repairedBody, contentHash: canonicalHash(repairedBody) };
}

// HARD-FIX 2026-07-16 (rapor A.4): tek bozuk artifact bütün klasör yüklemesini
// ÖLDÜRMÜYOR artık. Bozuk dosya önce mekanik onarım dener; onarılamazsa yalnız
// kendi sahnesi errors[]'a düşer — çağıran sahne-bazlı TECHNICAL_ERROR üretir,
// diğer sahneler yürür. strict=true eski davranışı korur (tekli akış/mutasyon
// yolları hâlâ sert durur — sessiz veri bozulması maskelenmez).
async function loadArtifacts(dir, command, { strict = true } = {}) {
  if (!existsSync(dir)) return strict ? [] : { artifacts: [], errors: [] };
  const artifacts = [];
  const errors = [];
  for (const name of readdirSync(dir).filter((item) => item.endsWith('.json')).sort()) {
    let value;
    try {
      value = JSON.parse(await readFile(join(dir, name), 'utf8'));
    } catch (error) {
      if (strict) throw new Error(`${name}: geçerli JSON değil (${error.message})`);
      errors.push({ file: name, sceneId: Number(name.split('-')[0]) || null, problems: ['geçerli JSON değil'] });
      continue;
    }
    let check = verifyArtifact(value, command);
    if (!check.ok) {
      const repaired = repairJuryArtifact(value);
      if (repaired && verifyArtifact(repaired, command).ok) {
        await writeFile(join(dir, name), JSON.stringify(repaired, null, 2), 'utf8');
        console.error(`🔧 ${name}: format onarıldı (alanlar evidence'tan taşındı, verdict korundu)`);
        artifacts.push(repaired);
        continue;
      }
      if (strict) throw new Error(`${name}: ${check.problems.join(', ')}`);
      errors.push({ file: name, sceneId: value?.sceneId ?? (Number(name.split('-')[0]) || null), problems: check.problems });
      continue;
    }
    artifacts.push(value);
  }
  return strict ? artifacts : { artifacts, errors };
}

async function parseImageDimensions(bytes) {
  try {
    const decoder = sharp(bytes, { failOn: 'error', limitInputPixels: 100_000_000 });
    const metadata = await decoder.metadata();
    if (!['png', 'jpeg', 'webp'].includes(metadata.format)) throw new Error('desteklenmeyen format');
    // metadata() only parses headers. raw().toBuffer() forces a complete pixel decode.
    const { info } = await decoder.clone().rotate().raw().toBuffer({ resolveWithObject: true });
    if (!Number.isInteger(info.width) || info.width <= 0 || !Number.isInteger(info.height) || info.height <= 0) {
      throw new Error('pixel dimensions geçersiz');
    }
    return { width: info.width, height: info.height, format: metadata.format };
  } catch (error) {
    throw new Error(`frame tam decode edilebilir PNG/JPEG/WebP değil: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function passingImageArtifacts(artifacts) {
  const jury = artifacts
    .filter((item) => item.role === 'image_jury' && item.content?.verdict === 'PASS')
    .sort((a, b) => b.revision - a.revision)[0];
  const author = jury ? artifactAt(artifacts, 'image_author', jury.revision) : null;
  return { author, jury };
}

function storyboardApprovalBody(command, scene) {
  return {
    schema: STORYBOARD_APPROVAL_SCHEMA,
    sceneId: scene.id,
    commandId: command.commandId,
    storyboardHash: command.lifecycle.storyboardHash,
    sceneContextHash: command.lifecycle.sceneContextHashes[scene.id],
    verdict: 'APPROVED',
  };
}

async function loadStoryboardApproval(root, command, scene) {
  const file = join(root, 'approvals', `${scene.id}.json`);
  if (!existsSync(file)) return { ok: false, source: null };
  const value = JSON.parse(await readFile(file, 'utf8'));
  const { contentHash, ...body } = value;
  if (canonicalize(body) !== canonicalize(storyboardApprovalBody(command, scene)) || canonicalHash(body) !== contentHash) {
    throw new Error(`scene ${scene.id} storyboard approval stale/tampered`);
  }
  return { ok: true, source: 'WORKSPACE' };
}

async function approveStoryboard(root, command, scene) {
  const body = storyboardApprovalBody(command, scene);
  const value = { ...body, contentHash: canonicalHash(body) };
  await mkdir(join(root, 'approvals'), { recursive: true });
  const file = join(root, 'approvals', `${scene.id}.json`);
  await writeFile(file, JSON.stringify(value, null, 2), 'utf8');
  return { file, approvalHash: value.contentHash };
}

async function addLiveDirective(command, commandFile, args) {
  const sourceFile = argValue(args, '--add-directive-file');
  if (!sourceFile) throw new Error('--add-directive-file için UTF-8 metin dosyası zorunlu');
  const text = await readFile(resolve(sourceFile), 'utf8');
  if (!text.trim()) throw new Error('LIVE_CHAT MamiDirective boş olamaz');
  const scope = argValue(args, '--scope') ?? 'PROJECT';
  if (!['PROJECT', 'SCENE'].includes(scope)) throw new Error('--scope PROJECT|SCENE olmalı');
  const sceneValue = Number(argValue(args, '--scene'));
  const sceneId = scope === 'SCENE' ? sceneValue : null;
  if (scope === 'SCENE' && (!Number.isInteger(sceneId) || !command.scenes.some((scene) => scene.id === sceneId))) {
    throw new Error('SCENE directive için geçerli --scene zorunlu');
  }
  const identity = { source: 'LIVE_CHAT', scope, sceneId, text };
  const directive = { id: `live-${sha256(canonicalize(identity)).slice(0, 16)}`, ...identity };
  if ((command.lifecycle.mamiDirectives ?? []).some((item) => item.id === directive.id)) {
    throw new Error(`LIVE_CHAT directive zaten mevcut: ${directive.id}`);
  }
  const updated = JSON.parse(JSON.stringify(command));
  const existing = updated.baseDecision.mamiDirectives ?? [];
  updated.baseDecision.mamiDirectives = [...existing.filter((item) => item.id !== directive.id), directive];
  updated.lifecycle.mamiDirectives = [...updated.baseDecision.mamiDirectives];
  updated.lifecycle.shotApprovals = {};
  updated.commandId = `mamilas-${canonicalHash(updated.baseDecision)}`;
  updated.lifecycle.sceneContextHashes = Object.fromEntries(updated.scenes.map((scene) => [
    scene.id,
    canonicalHash({ imageAuthor: imageContext(updated, scene), motionEngine: scene.motionEngine }),
  ]));
  const output = jailWrite(argValue(args, '--out') ?? join(dirname(commandFile), `${directive.id}_mamilas_command.json`), dirname(commandFile), '--add-directive-file --out');
  await writeFile(output, JSON.stringify(updated, null, 2), 'utf8');
  return { output, commandId: updated.commandId, directive };
}

async function loadFrame(root, command, scene, artifacts) {
  const receiptPath = join(root, 'frames', `${scene.id}.json`);
  if (!existsSync(receiptPath)) return null;
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  const { contentHash, ...body } = receipt;
  if (canonicalHash(body) !== contentHash) throw new Error(`scene ${scene.id} frame receipt tampered`);
  if (receipt.schema !== FRAME_RECEIPT_SCHEMA || receipt.sceneId !== scene.id) throw new Error(`scene ${scene.id} frame receipt schema/scene`);
  if (receipt.fromCommandId !== command.commandId || receipt.storyboardHash !== command.lifecycle.storyboardHash) throw new Error(`scene ${scene.id} frame stale`);
  if (!FRAME_VERDICTS.has(receipt.verdict)) throw new Error(`scene ${scene.id} frame verdict geçersiz`);
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury || receipt.fromImagePromptArtifactHash !== author.contentHash) throw new Error(`scene ${scene.id} frame prompt bağı stale`);
  const localPath = resolve(join(root, 'frames', receipt.storedFile ?? ''));
  const frameDir = `${resolve(join(root, 'frames'))}${process.platform === 'win32' ? '\\' : '/'}`;
  if (!localPath.startsWith(frameDir) || !existsSync(localPath)) throw new Error(`scene ${scene.id} gerçek frame dosyası yok/geçersiz yol`);
  const bytes = await readFile(localPath);
  const dimensions = await parseImageDimensions(bytes);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  const aspect = Number((dimensions.width / dimensions.height).toFixed(3));
  if (receipt.frameHash !== actualHash || receipt.byteSize !== bytes.length || receipt.width !== dimensions.width || receipt.height !== dimensions.height || receipt.aspect !== aspect) {
    throw new Error(`scene ${scene.id} gerçek frame byte/hash/dimension uyuşmuyor`);
  }
  return { ...receipt, localPath };
}

async function importFrame(root, command, scene, artifacts, sourcePath, verdict) {
  if (!FRAME_VERDICTS.has(verdict)) throw new Error('--verdict APPROVE|REGENERATE|PROJECT_ONLY_ACCEPT|PENDING olmalı');
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury) throw new Error('frame import için PASS image author→jury zinciri zorunlu');
  const bytes = await readFile(resolve(sourcePath));
  const dimensions = await parseImageDimensions(bytes);
  if (dimensions.width <= 0 || dimensions.height <= 0 || bytes.length <= 0) throw new Error('frame dimensions/bytes geçersiz');
  const framesDir = join(root, 'frames');
  await mkdir(framesDir, { recursive: true });
  const storedFile = `${scene.id}.${dimensions.format === 'jpeg' ? 'jpg' : dimensions.format}`;
  await writeFile(join(framesDir, storedFile), bytes);
  const body = {
    schema: FRAME_RECEIPT_SCHEMA,
    sceneId: scene.id,
    fromCommandId: command.commandId,
    storyboardHash: command.lifecycle.storyboardHash,
    fromImagePromptArtifactHash: author.contentHash,
    frameHash: createHash('sha256').update(bytes).digest('hex'),
    width: dimensions.width,
    height: dimensions.height,
    aspect: Number((dimensions.width / dimensions.height).toFixed(3)),
    byteSize: bytes.length,
    originalFileName: sourcePath.split(/[\\/]/).pop(),
    storedFile,
    verdict,
  };
  const receipt = { ...body, contentHash: canonicalHash(body) };
  const receiptPath = join(framesDir, `${scene.id}.json`);
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  return { receiptPath, frameHash: receipt.frameHash, width: receipt.width, height: receipt.height, verdict };
}

async function exportImageBundle(root, command, scene, artifacts, outputArg) {
  const { author, jury } = passingImageArtifacts(artifacts);
  if (!author || !jury) throw new Error('site import bundle için PASS image author→jury zinciri zorunlu');
  const imageArtifacts = artifacts
    .filter((artifact) => (artifact.role === 'image_author' || artifact.role === 'image_jury') && artifact.revision <= jury.revision)
    .sort((a, b) => a.revision - b.revision || a.role.localeCompare(b.role));
  const body = { schema: 'mamilas.image-artifact-bundle.v1', command, artifacts: imageArtifacts };
  // F-A4: --out jail'i. root = projectDir/.mamilas → yazma proje ağacında kalmalı.
  const output = jailWrite(outputArg ?? join(root, 'site-import', `scene-${scene.id}-image-bundle.json`), dirname(resolve(root)), '--export-image-bundle --out');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(body, null, 2), 'utf8');
  return { output, artifactCount: imageArtifacts.length, authorHash: author.contentHash, juryHash: jury.contentHash };
}

const latest = (artifacts, role) => artifacts.filter((a) => a.role === role).sort((a, b) => b.revision - a.revision)[0];

function authorJuryAction(artifacts, authorRole, juryRole) {
  const author = latest(artifacts, authorRole);
  const jury = latest(artifacts, juryRole);
  if (!author) return { kind: 'RUN_ROLE', role: authorRole, revision: 0 };
  if (!jury || jury.revision < author.revision) return { kind: 'RUN_ROLE', role: juryRole, revision: author.revision };
  if (jury.content.verdict === 'FACT_REQUIRED') return { kind: 'FACT_REQUIRED', reason: jury.content.factRequired };
  if (jury.content.verdict === 'REJECT') {
    return author.revision === 0
      ? { kind: 'RUN_ROLE', role: authorRole, revision: 1 }
      : { kind: 'FACT_REQUIRED', reason: `revision limiti doldu: ${jury.content.failingCheck}` };
  }
  return null;
}

function nextAction(artifacts, frame) {
  const image = authorJuryAction(artifacts, 'image_author', 'image_jury');
  if (image) return image;
  if (!frame) return { kind: 'AWAIT_FRAME' };
  if (frame.verdict !== 'APPROVE') return { kind: 'AWAIT_MAMI_APPROVE' };
  const frameJury = latest(artifacts, 'frame_jury');
  if (!frameJury) return { kind: 'RUN_ROLE', role: 'frame_jury', revision: 0 };
  if (frameJury.content.verdict !== 'PASS') {
    // FABLE bulgusu: bu dal çıkışsız bir çıkmazdı — REJECT/FACT_REQUIRED sonrası ne yeni kare
    // yolu söyleniyordu ne de mesaj yol gösteriyordu ("jüri süse dönüyor"). Çıkış her zaman var:
    // Mami yeni/daha iyi kareyi `--import-frame` ile getirir; frame-bağımlı artifact'ler yeni
    // frameHash'le doğal stale olur ve frame_jury yeniden koşar. Mesaj artık bunu SÖYLER.
    const reason = frameJury.content.factRequired || frameJury.content.failingCheck || 'frame jury geçmedi';
    return {
      kind: 'FACT_REQUIRED',
      reason: `${reason} — çıkış yolu: yeni/daha iyi kareyi \`--scene ${frameJury.sceneId} --import-frame <png> --verdict APPROVE\` ile getir; frame-bağımlı artifact'ler yeni kareyle doğal stale olur ve frame jürisi yeniden koşar.`,
    };
  }
  return authorJuryAction(artifacts, 'motion_author', 'motion_jury') ?? { kind: 'COMPLETE' };
}

function imageContext(command, scene) {
  const directives = (command.lifecycle.mamiDirectives ?? []).filter((d) => d.scope === 'PROJECT' || d.sceneId === scene.id);
  const locks = { ...(command.baseDecision?.locks ?? {}) };
  if (command.baseDecision?.source?.authority === 'RAW_SOURCE_VAULT' && command.baseDecision.source.rawSource?.trim()) {
    delete locks.topic;
  }
  return {
    protocol: command.lifecycle.protocol,
    // BRAIN M4: dünya/engine-aware kontrat; override ajan muhakemesi (overridePolicy).
    promptQuality: buildImagePromptQualityContract({
      world: command.worldPacket ? { group: command.worldPacket.group } : null,
      imageModel: command.baseDecision?.engine?.imageModel,
    }),
    decision: { commandId: command.commandId, locks, engine: command.baseDecision.engine, mode: command.baseDecision.mode },
    storyboardHash: command.lifecycle.storyboardHash,
    shot: { id: scene.id, phaseName: scene.phaseName, durationSec: scene.durationSec, architecture: scene.architecture, sceneBrief: scene.sceneBrief },
    mamiDirectives: directives,
    world: command.worldPacket ? {
      id: command.worldPacket.id,
      renderPhysics: command.worldPacket.renderPhysics,
      figurePhysics: command.worldPacket.figurePhysics,
      environmentPhysics: command.worldPacket.environmentPhysics,
      cameraEnvelope: command.worldPacket.cameraEnvelope,
      lightPhysics: command.worldPacket.lightPhysics,
      materialPhysics: command.worldPacket.materialPhysics,
      negativeLock: command.worldPacket.negativeLock,
      paletteAsLight: command.worldPacket.paletteAsLight,
      // BRAIN M2 (Sol #1): render_law'dan ayrılan envanter cümleleri bu kanalda yaşar —
      // yaratıcı REFERANS, kadro/prop EMRİ değil (commandExport.ts:460).
      vocabularyExamples: command.worldPacket.vocabularyExamples,
      refs: (command.worldPacket.refs ?? []).filter((ref) => ref.compatible),
      referencePolicy: IMAGE_PROMPT_QUALITY_CONTRACT.referencePolicy,
    } : null,
    explicitLocks: {
      brandKitLock: command.baseDecision.locks.brandKitLock,
      cast: command.baseDecision.locks.cast,
      onScreenText: scene.prompts?.onScreenText ?? null,
      mamiPromptOverride: command.baseDecision.overrides?.find((item) => item.sceneId === scene.id)?.userImagePrompt ?? null,
    },
    targetEngine: command.baseDecision.engine.imageModel,
    // FABLE bulgusu: alan `negatives` — `avoid` iki yüzeyde birden yanlıştı (ölü kanal).
    failureModes: scene.handoff?.IMAGE?.negatives ?? null,
    continuity: {
      previousSceneId: scene.id > 1 ? command.scenes[command.scenes.findIndex((item) => item.id === scene.id) - 1]?.id ?? null : null,
      nextSceneId: command.scenes[command.scenes.findIndex((item) => item.id === scene.id) + 1]?.id ?? null,
    },
  };
}

function roleDecision(command) {
  return {
    commandId: command.commandId,
    locks: command.baseDecision.locks,
    engine: command.baseDecision.engine,
    mode: command.baseDecision.mode,
    creativeControls: command.baseDecision.creativeControls,
    deliveryPromise: command.baseDecision.deliveryPromise,
  };
}

// HARD-FIX 2026-07-16 (rapor madde 13/14/15): jüriler artık Author'ın gördüğü BAĞLAYICI
// bağlamı bağımsız görür — world fiziği, explicit locks, failure modes. Eskiden jury
// "one world-physics choice" kanıtını world paketini görmeden, yalnız Author'ın prompt
// metninden ölçmek zorundaydı: Author'ın vaadi tek gerçeklik kaynağıydı, karşı-okuma
// süse dönüyordu. Jury context'i sceneContextHash'e GİRMEZ (yalnız imageAuthor hash'lenir)
// — bu genişleme mevcut command'leri stale etmez.
// G4: motion rolleri için world fiziği + HAREKET RİTMİ. Hash-DIŞI (roleContext katmanı) —
// sceneContextHash'e girmez, mevcut command'leri stale etmez, TS↔runner image-parite'sini bozmaz.
function motionWorld(command) {
  if (!command.worldPacket) return null;
  return {
    id: command.worldPacket.id,
    renderPhysics: command.worldPacket.renderPhysics,
    figurePhysics: command.worldPacket.figurePhysics,
    cameraEnvelope: command.worldPacket.cameraEnvelope,
    lightPhysics: command.worldPacket.lightPhysics,
    materialPhysics: command.worldPacket.materialPhysics,
    negativeLock: command.worldPacket.negativeLock,
    motionCadence: command.worldPacket.motionCadence, // dünya-dışı hareketi engelleyen anahtar
  };
}

export function roleContext(command, scene, artifacts, frame, action) {
  const image = imageContext(command, scene);
  if (action.role === 'image_author') return image;
  if (action.role === 'image_jury') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    promptQuality: image.promptQuality, shot: image.shot, mamiDirectives: image.mamiDirectives,
    world: image.world, explicitLocks: image.explicitLocks, failureModes: image.failureModes,
    imagePromptArtifact: latest(artifacts, 'image_author'),
  };
  if (action.role === 'frame_jury') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    shot: image.shot, mamiDirectives: image.mamiDirectives,
    // Madde 14: frame jürisi world/medium yasasını Author'ın vaadinden değil bağımsız
    // world paketinden ölçer (figürlü world-lock + 2D-medium piksel kontrolü M6'da kartta;
    // ölçeceği yasa artık context'te).
    world: image.world, explicitLocks: image.explicitLocks,
    imagePromptArtifact: latest(artifacts, 'image_author'), frame,
  };
  if (action.role === 'motion_author') return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    // BRAIN M5: motion kontratı — Physics-First, still-lips/no-dialogue, SFX omurgası.
    motionQuality: buildMotionPromptQualityContract({ videoModel: command.baseDecision?.engine?.videoModel }),
    // HARD-FIX 2026-07-17 (G4, ordu KÖK-C): motion'ı yazan TEK rol (motion_author) dünyanın
    // hareket ritmini (motionCadence), kamera zarfını ve negatif kilidini göremiyordu —
    // worldPacket bu alanları 46 dünyada üretiyor ama motion context'ine hiç girmiyordu.
    // Sonuç: Tarkovsky long-take dünyasına hızlı-kesme kadans gibi DÜNYA-DIŞI hareket.
    // motionWorld hash-DIŞI (roleContext) — sceneContextHash'e girmez, command'leri stale etmez.
    world: motionWorld(command),
    shot: image.shot, mamiDirectives: image.mamiDirectives, explicitLocks: image.explicitLocks,
    continuity: image.continuity, frame, engine: scene.motionEngine,
  };
  return {
    decision: roleDecision(command), storyboardHash: command.lifecycle.storyboardHash,
    motionQuality: buildMotionPromptQualityContract({ videoModel: command.baseDecision?.engine?.videoModel }),
    shot: image.shot, mamiDirectives: image.mamiDirectives, continuity: image.continuity,
    // Madde 15 + G4: motion jürisi explicit locks + world'ü (hareket ritmi dahil) bağımsız görür.
    world: motionWorld(command), explicitLocks: image.explicitLocks,
    imagePromptArtifact: latest(artifacts, 'image_author'), frame,
    motionArtifact: latest(artifacts, 'motion_author'), engine: scene.motionEngine,
  };
}

function argValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

// HARD-FIX 2026-07-17 (F-A4): --out yazma yolu jail'i. Migration/directive/seal
// yolları çıplak resolve() ile kök dışına yazabiliyordu (otonom child bunları
// SESSION.md ile tetikleyebilir). Yazma HER ZAMAN proje ağacının (command dosyasının
// dizini) altında kalmalı. Okuma yolları (--import-frame/--add-directive-file) jail'siz
// kalır bilerek: Mami frame'i harici klasörden (Desktop) getirir — o meşru kullanım.
//
// BULGU 2 (garanti denetçi): iki tarafı da symlink-normalize et. macOS'ta cwd realpath
// (/private/var) iken --file'dan gelen projectDir /var formunda kalıyordu → startsWith
// symlink prefix farkından meşru --out'u YANLIŞ reddediyordu. Var olan en yakın üst dizini
// realpath'le (hedef dosya henüz yok olabilir), böylece iki yol aynı gerçek köke iner.
function realpathClosest(p) {
  let dir = resolve(p);
  const tail = [];
  while (true) {
    if (existsSync(dir)) { try { return join(realpathSync(dir), ...tail.reverse()); } catch { return resolve(p); } }
    const parent = dirname(dir);
    if (parent === dir) return resolve(p);
    tail.push(dir.slice(parent.length + 1));
    dir = parent;
  }
}
function jailWrite(target, projectDir, label) {
  const out = realpathClosest(target);
  const rootReal = realpathClosest(projectDir);
  const root = `${rootReal}${process.platform === 'win32' ? '\\' : '/'}`;
  if (`${out}${process.platform === 'win32' ? '\\' : '/'}`.startsWith(root) || out === rootReal) return out;
  throw new Error(`${label}: yazma yolu proje klasörünün dışına çıkamaz (${out})`);
}

function commandCandidates(dir) {
  return readdirSync(dir).filter((name) => name.endsWith('_mamilas_command.json') || name === 'mamilas_command.json').sort();
}

function resolveCommandFile(args) {
  const explicit = argValue(args, '--file') ?? args.find((arg) => !arg.startsWith('--') && arg.endsWith('.json'));
  if (explicit) return resolve(explicit);
  const candidates = commandCandidates(process.cwd());
  // FABLE bulgusu: eski mesaj aranan kalıbı söylemiyordu — kullanıcı hangi dosya adının
  // geçerli olduğunu tahmin etmek zorunda kalıyordu ("yanlış sebeple hayır" sınıfı).
  if (candidates.length !== 1) throw new Error(
    `command seçimi belirsiz: ${candidates.length} aday. Aranan kalıp: bu klasörde *_mamilas_command.json `
    + `(siteden "Command JSON" export'unun adı). Doğru dosyayı --file <yol> ile açıkça ver.`);
  return join(process.cwd(), candidates[0]);
}

function findExecutable(name) {
  const extensions = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : [''];
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    for (const extension of extensions) {
      const candidate = join(dir, process.platform === 'win32' ? `${name}${extension.toLowerCase()}` : name);
      if (existsSync(candidate)) return candidate;
      const upper = join(dir, process.platform === 'win32' ? `${name}${extension.toUpperCase()}` : name);
      if (existsSync(upper)) return upper;
    }
  }
  return null;
}

async function launchInteractive(provider, projectDir, workspaceDir) {
  const cli = findExecutable(provider);
  if (!cli) throw new Error(`${provider} CLI bulunamadı`);
  const instruction = `Read ${JSON.stringify(join(workspaceDir, 'SESSION.md'))} and follow it. Work only on the single role named there; do not call generation APIs.`;
  const args = provider === 'codex' ? ['-C', projectDir, instruction] : [instruction];
  const child = process.platform === 'win32' && ['.cmd', '.bat'].includes(extname(cli).toLowerCase())
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${cli}" ${args.map((a) => `"${a.replaceAll('"', '""')}"`).join(' ')}"`], { cwd: projectDir, stdio: 'inherit', windowsVerbatimArguments: true })
    : spawn(cli, args, { cwd: projectDir, stdio: 'inherit' });
  const exitCode = await new Promise((resolvePromise, reject) => { child.on('exit', resolvePromise); child.on('error', reject); });
  if (exitCode !== 0) throw new Error(`${provider} oturumu başarısız çıktı: ${exitCode}`);
  return workspaceDir;
}

// BATCH modu oturumu: aynı SESSION.md sözleşmesi, ama oturum işini bitirince kendisi
// çıkar (claude -p / codex exec) — Mami pencere kapatmak için beklemez. Rol başına
// yine TEK oturum açılır; author ve jury asla aynı context'i paylaşmaz (protokolün
// "bağımsız jury" yasası oturum sınırıyla korunur).
async function launchHeadless(provider, projectDir, workspaceDir) {
  const cli = findExecutable(provider);
  if (!cli) throw new Error(`${provider} CLI bulunamadı`);
  const instruction = `Read ${JSON.stringify(join(workspaceDir, 'SESSION.md'))} and follow it. Work only on the single role named there; do not call generation APIs.`;
  const args = provider === 'codex'
    ? ['exec', '-C', projectDir, '--sandbox', 'workspace-write', instruction]
    : ['-p', instruction, '--permission-mode', 'acceptEdits'];
  const child = process.platform === 'win32' && ['.cmd', '.bat'].includes(extname(cli).toLowerCase())
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${cli}" ${args.map((a) => `"${a.replaceAll('"', '""')}"`).join(' ')}"`], { cwd: projectDir, stdio: 'inherit', windowsVerbatimArguments: true })
    : spawn(cli, args, { cwd: projectDir, stdio: 'inherit' });
  const exitCode = await new Promise((resolvePromise, reject) => { child.on('exit', resolvePromise); child.on('error', reject); });
  if (exitCode !== 0) throw new Error(`${provider} oturumu başarısız çıktı: ${exitCode}`);
  return workspaceDir;
}

// Tek sahnenin canlı durumunu türetir: approval → artifacts → frame → nextAction.
// Hem tekli akış hem batch döngüsü aynı yasadan okur; ikinci bir lifecycle yoktur.
async function sceneStatus(root, command, scene, artifacts) {
  const approval = await loadStoryboardApproval(root, command, scene);
  if (!approval.ok) return { scene, artifacts: [], frame: null, action: { kind: 'AWAIT_STORYBOARD_APPROVAL' } };
  const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === scene.id);
  const frame = await loadFrame(root, command, scene, sceneArtifacts);
  // Stale frame-bağımlı artifact'ler ayıklanır — canlı zincir üzerinden ilerlenir
  // (yeni kare geldiyse frame_jury/motion doğal olarak yeniden açılır).
  const liveArtifacts = validateArtifactChain(sceneArtifacts, frame, command, scene.id);
  return { scene, artifacts: liveArtifacts, frame, action: nextAction(liveArtifacts, frame) };
}

// HARD-FIX 2026-07-16 (rapor madde 9/10/12): recurring identity continuity.
// Önceki sahnenin PASS image_author artifact'inden gözlenebilir özet çıkarır —
// interpretation (dominant özne/tek olay), uygulanan kilitler ve kaynak artifact hash'i.
// Author "continuity'yi sıfırdan yeniden kur" yasasını artık GERÇEK malzemeyle uygular;
// Jury aynı gerçeği bağımsız görür (Author'ın risk notundan değil). Engine memory
// varsayılmaz; özet hash-bağlıdır (sourceArtifactHash) ama sceneContextHash'e GİRMEZ —
// approvedLessons gibi launch-anı katmanıdır, yoksa her sahne PASS'i sonraki tüm
// sahnelerin command'ini stale ederdi.
export function continuityStateFrom(command, scene, allArtifacts) {
  const prevScene = command.scenes[command.scenes.findIndex((item) => item.id === scene.id) - 1];
  if (!prevScene) return null;
  const prevArtifacts = allArtifacts.filter((artifact) => artifact.sceneId === prevScene.id);
  const { author } = passingImageArtifacts(prevArtifacts);
  if (!author?.content) return null;
  return {
    sceneId: prevScene.id,
    sourceArtifactHash: author.contentHash,
    interpretation: author.content.interpretation ?? null,
    appliedLocks: author.content.appliedLocks ?? [],
    law: 'Previous approved scene state. Recurring subjects keep the SAME identity, wardrobe and '
      + 'accumulated physical state described here; rebuild them explicitly in this prompt — the '
      + 'engine remembers nothing. If a specific recurring face/cast fact is required and absent '
      + 'from source, refs and locks, do not invent it: the honest path is FACT_REQUIRED.',
  };
}

// Bir RUN_ROLE aksiyonu için workspace'i hazırlar, TEK oturum açar ve üretilen
// tek artifact'i doğrular. İnteraktif ve batch (headless) aynı sözleşmeyi koşar.
async function executeRole(check, command, projectDir, root, artifactDir, status, provider, headless, allArtifacts = []) {
  const { scene, artifacts: sceneArtifacts, frame, action } = status;
  const context = roleContext(command, scene, sceneArtifacts, frame, action);
  await mkdir(root, { recursive: true });
  await mkdir(artifactDir, { recursive: true });
  await mkdir(join(root, 'frames'), { recursive: true });
  const adapter = await readFile(join(REPO_ROOT, 'agents', 'adapters', `${provider}.md`), 'utf8');
  const role = await readFile(join(REPO_ROOT, 'agents', 'roles', `${action.role.replaceAll('_', '-')}.md`), 'utf8');
  await writeFile(join(root, 'PROTOCOL.md'), check.protocolText, 'utf8');
  await writeFile(join(root, 'ADAPTER.md'), adapter, 'utf8');
  await writeFile(join(root, 'ROLE.md'), role, 'utf8');
  const artifactTemplate = {
    schema: ARTIFACT_SCHEMA,
    protocolVersion: PROTOCOL_VERSION,
    protocolHash: check.protocolHash,
    phase: ROLE_PHASE[action.role],
    role: action.role,
    provider,
    sceneId: scene.id,
    decisionHash: command.commandId.replace(/^mamilas-/, ''),
    storyboardHash: command.lifecycle.storyboardHash,
    inputArtifactHashes: expectedInputs(action.role, action.revision, sceneArtifacts, command, scene.id, frame),
    revision: action.revision,
    content: artifactContentTemplate(action.role, command, scene),
  };
  // BRAIN M7: Mami-onaylı ders bankası — HASH-DIŞI katman (artifactContract gibi).
  // sceneContextHash'e girmez: dersler atölye hafızasıdır, karar değil; banka
  // büyüyünce command'ler stale OLMAZ. Yalnız author rolleri okur; çelişkide Mami
  // direktifi kazanır (role kartı yasası).
  let approvedLessons = [];
  if (action.role === 'image_author' || action.role === 'motion_author') {
    try {
      const bank = await readFile(join(REPO_ROOT, 'agents', 'lessons', 'APPROVED.md'), 'utf8');
      approvedLessons = parseApprovedLessons(bank);
    } catch { /* banka yoksa akış durmaz */ }
  }
  // Continuity state — hash-DIŞI katman (approvedLessons gibi). Author VE jury'ler aynı
  // gerçeği görür: madde 12 — jury continuity'yi Author'ın risk notundan değil bağımsız
  // önceki-sahne state'inden ölçer.
  const continuityState = continuityStateFrom(command, scene, allArtifacts);
  const sessionContext = { ...context, approvedLessons, continuityState, artifactContract: artifactTemplate };
  const templatePath = join(root, 'ARTIFACT_TEMPLATE.json');
  await writeFile(join(root, 'CONTEXT.json'), JSON.stringify(sessionContext, null, 2), 'utf8');
  await writeFile(templatePath, JSON.stringify(artifactTemplate, null, 2), 'utf8');
  const outputName = `${scene.id}-${action.role}-r${action.revision}.json`;
  await writeFile(join(root, 'SESSION.md'), `# MAMILAS single-role session\n\nProvider: ${provider}\nRole: ${action.role}\nScene: ${scene.id}\nRevision: ${action.revision}\n\nRead PROTOCOL.md, ADAPTER.md, ROLE.md and CONTEXT.json. Edit only the content in ARTIFACT_TEMPLATE.json, then seal it with:\n\nnode "${fileURLToPath(import.meta.url)}" --seal-artifact "${templatePath}" --out "${join(artifactDir, outputName)}"\n\nWrite exactly this one artifact. Do not run another role.${headless ? '\nWhen the artifact is sealed, exit the session immediately.' : ''}\n`, 'utf8');
  // HARD-FIX 2026-07-17 (G2, ordu KÖK-A): before-set DİSKTEKİ TÜM sahne artifact'lerinden
  // kurulur, canlı (frame-filtreli) `sceneArtifacts`'ten DEĞİL. Eski davranış: yeni kare gelince
  // stale frame-bağlı artifact (eski frameHash'li motion) canlı listede olmadığı için "created"
  // sanılıyordu → `created.length` şişip yanlış throw → kare iyileştirme her seferinde sahte
  // "teknik hata" + yanmış oturum. `after` zaten filtresiz reload; before de öyle olmalı.
  const beforeAll = (await loadArtifacts(artifactDir, command, { strict: false })).artifacts
    .filter((artifact) => artifact.sceneId === scene.id);
  const beforeHashes = new Set(beforeAll.map((artifact) => artifact.contentHash));
  await (headless ? launchHeadless : launchInteractive)(provider, projectDir, root);
  const after = (await loadArtifacts(artifactDir, command)).filter((artifact) => artifact.sceneId === scene.id);
  const created = after.filter((artifact) => !beforeHashes.has(artifact.contentHash));
  if (created.length !== 1) throw new Error(`oturum tam bir yeni artifact üretmeli; bulunan ${created.length}`);
  const produced = created[0];
  if (produced.role !== action.role || produced.revision !== action.revision || produced.provider !== provider) {
    throw new Error('oturum yanlış role/revision/provider artifact üretti');
  }
  validateArtifactChain(after, frame, command, scene.id);
  return produced;
}

// Batch raporu için sahnenin insan-okur durumu. AWAIT_FRAME'e ulaşan sahnenin PASS
// image prompt'u pakete girer; FACT_REQUIRED sebebiyle durur, gerisi durumunu söyler.
function statusReport(scene, status) {
  const report = { sceneId: scene.id, phaseName: scene.phaseName, state: status.action.kind };
  if (status.action.kind === 'FACT_REQUIRED') report.reason = status.action.reason;
  if (status.action.kind === 'AWAIT_FRAME' || status.action.kind === 'AWAIT_MAMI_APPROVE') {
    const author = latest(status.artifacts, 'image_author');
    if (author?.content?.prompt) report.prompt = author.content.prompt;
  }
  if (status.action.kind === 'COMPLETE') {
    const motion = latest(status.artifacts, 'motion_author');
    if (motion?.content?.prompt) report.motionPrompt = motion.content.prompt;
  }
  return report;
}

// BATCH paket çıktısı: frame-öncesi işi biten her sahnenin PASS image prompt'u tek
// okunur dosyada toplanır — Mami kareleri seri basar, istisna listesiyle döner.
// Bu bir üretim/generation batch'i DEĞİLDİR; yalnız yazım fazlarının toplu sürücüsüdür.
// HARD-FIX 2026-07-16 (rapor A.6/teslim yüzeyi): paket ATOMİK yazılır (tmp+rename —
// yarıda kesilen koşu yarım dosya bırakmaz) ve GÖRÜNÜR kopyası run kökünde yaşar
// (command dosyasının yanı) — Mami gizli .mamilas klasörü açmaz. Özet başa gelir.
async function writeBatchPromptPack(root, command, sceneReports, projectDir = null) {
  const counts = { ready: 0, waiting: 0, fact: 0, error: 0, pending: 0 };
  for (const report of sceneReports) {
    if (report.state === 'AWAIT_FRAME' && report.prompt) counts.ready += 1;
    else if (report.state === 'FACT_REQUIRED') counts.fact += 1;
    else if (report.state === 'TECHNICAL_ERROR') counts.error += 1;
    else if (report.state === 'PENDING') counts.pending += 1;
    else counts.waiting += 1;
  }
  const lines = [
    `# MAMILAS toplu prompt paketi`, ``,
    `Command: ${command.commandId}`, ``,
    `**${sceneReports.length} sahne** · ${counts.ready} PASS prompt hazır`
      + (counts.fact ? ` · ${counts.fact} sahne gerçek bilgi bekliyor (FACT_REQUIRED)` : '')
      + (counts.error ? ` · ${counts.error} sahne teknik hata (diğerleri etkilenmedi)` : '')
      + (counts.pending ? ` · ${counts.pending} sahne sırada` : '')
      + (counts.waiting ? ` · ${counts.waiting} sahne diğer aşamalarda` : ''),
    ``,
  ];
  for (const report of sceneReports) {
    lines.push(`## Sahne ${report.sceneId} — ${report.phaseName ?? ''}`.trimEnd(), ``);
    if (report.state === 'AWAIT_FRAME' && report.prompt) {
      lines.push('```', report.prompt, '```', ``);
    } else {
      lines.push(`> ${report.state}${report.reason ? ` — ${report.reason}` : ''}`, ``);
    }
  }
  const body = lines.join('\n');
  const targets = [join(root, 'SAHNE-PROMPTLAR.md')];
  if (projectDir && resolve(projectDir) !== resolve(root)) targets.push(join(projectDir, 'SAHNE-PROMPTLAR.md'));
  for (const target of targets) {
    const tmp = `${target}.tmp`;
    await writeFile(tmp, body, 'utf8');
    await rename(tmp, target);
  }
  return targets[targets.length - 1];
}

function artifactContentTemplate(role, command, scene) {
  if (role === 'image_author') return {
    prompt: '', promptHash: '',
    // BRAIN M3: zorunlu şeffaf yorum receipt'i — template boş alanları gösterir ki
    // ilk gerçek author çıktısı şema yüzünden reddedilmesin.
    interpretation: { dominantSubject: '', singleEvent: '', frozenInstant: '' },
    directiveReceipts: (command.lifecycle.mamiDirectives ?? [])
      .filter((item) => item.scope === 'PROJECT' || item.sceneId === scene.id)
      .map((item) => ({ id: item.id, text: item.text, status: '' })),
    appliedLocks: [], suppressedContext: [], risks: [],
  };
  if (role === 'motion_author') return { frameHash: '', inventory: [], prompt: '', promptHash: '', risks: [] };
  // HARD-FIX 2026-07-16 (rapor A.3 kök nedeni): jury şablonu REJECT/FACT_REQUIRED
  // alanlarını GÖSTERMİYORDU — gerçek Deneme koşusunda jüri doğru yaratıcı REJECT'i
  // failingCheck/targetedFix yerine evidence[]'a yazdı (şablona sadıktı) ve validator
  // bütün batch'i öldürdü. Alanlar artık şablonda görünür; validator sözleşmesi aynı.
  if (role === 'frame_jury' || role === 'motion_jury') return {
    verdict: '', frameHash: '', evidence: [], failingCheck: '', targetedFix: '', factRequired: '',
  };
  return { verdict: '', evidence: [], failingCheck: '', targetedFix: '', factRequired: '' };
}
export const __testArtifactContentTemplate = artifactContentTemplate;

export async function runCommand(args = process.argv.slice(2)) {
  const file = resolveCommandFile(args);
  const command = JSON.parse(await readFile(file, 'utf8'));
  if (args.includes('--migrate-command-context')) {
    const currentProtocolText = await readFile(PROTOCOL_PATH, 'utf8');
    const migrated = migrateCommandToCurrentContext(command, {
      version: PROTOCOL_VERSION,
      contentHash: sha256(currentProtocolText),
    });
    const migratedCheck = await validateCommand(migrated);
    if (!migratedCheck.ok) throw new Error(`command migration reddedildi: ${migratedCheck.problems.join(' · ')}`);
    const output = jailWrite(argValue(args, '--out') ?? file, dirname(file), '--migrate-command-context --out');
    await writeFile(output, JSON.stringify(migrated, null, 2), 'utf8');
    // HARD-FIX 2026-07-16 (rapor A.5/G.5): workspace migration — resume, tamamlanmış
    // PASS işleri yeniden koşup usage YAKMAZ. İki türetilmiş katman tazelenir, karar
    // katmanına dokunulmaz:
    // (1) approval receipt'leri: Mami'nin onayı storyboard'a verilmişti; storyboard
    //     byte-aynı doğrulandı (yukarıda) — yalnız türetilmiş sceneContextHash yenilenir.
    // (2) artifact'ler: content/verdict/inputlar aynı kalır; yalnız protocolHash +
    //     inputArtifactHashes'teki contextHash referansı güncellenir ve yeniden mühürlenir.
    //     Zincir bütünlüğü korunur: içerideki hash'ler eski→yeni deterministik eşlenir.
    const migrationRoot = resolve(argValue(args, '--workspace') ?? join(dirname(output), '.mamilas'));
    const migratedWorkspace = { approvals: 0, artifacts: 0, frames: 0 };
    const oldContextHashes = new Map(Object.entries(command.lifecycle.sceneContextHashes ?? {}).map(([id, hash]) => [hash, migrated.lifecycle.sceneContextHashes[id]]));
    const approvalsDir = join(migrationRoot, 'approvals');
    if (existsSync(approvalsDir)) {
      for (const name of readdirSync(approvalsDir).filter((item) => item.endsWith('.json'))) {
        const scene = migrated.scenes.find((item) => `${item.id}.json` === name);
        if (!scene) continue;
        await approveStoryboard(migrationRoot, migrated, scene);
        migratedWorkspace.approvals += 1;
      }
    }
    const migrationArtifactDir = resolve(argValue(args, '--artifacts') ?? join(migrationRoot, 'artifacts'));
    const hashMap = new Map(); // eski artifact contentHash → yeni contentHash (zincir sırasıyla)
    if (existsSync(migrationArtifactDir)) {
      // HARD-FIX 2026-07-17 (garanti denetçi BULGU 1): DEPENDENCY sırasında işle, alfabetik
      // DEĞİL. Alfabetik `.sort()` `image_author-r1`'i `image_jury-r0`'dan ÖNCE işliyordu;
      // r1 author'ın input zinciri r0-jury'nin YENİ hash'ini bekler ama o henüz map'te yok →
      // r1 zinciri stale kalıp sahneyi kilitliyordu (REJECT sonrası her kare ölürdü).
      // Lifecycle sırası: role fazı (author→jury→frame→motion) × revision, sonra sahne.
      // HARD-FIX 2026-07-17 (G1, ordu KÖK-A): image → frame receipt → frame-bağlı artifact
      // karşılıklı bağımlılığı TEK hashMap'le, DOĞRU sırada çözülür. Eskiden frame receipt'ler
      // artifact döngüsünden SONRA remap ediliyordu; ama frame_jury/motion'ın
      // inputArtifactHashes'i frame receipt'in contentHash'ini gömdüğünden, onlar işlenirken
      // frame receipt'in YENİ hash'i henüz hashMap'te yoktu → "frame_jury@0 zinciri uyuşmuyor".
      // Doğru sıra: (1) image author/jury  (2) frame RECEIPT'ler (hashMap'e ekle)  (3) frame-bağlı.
      const IMAGE_ROLES = new Set(['image_author', 'image_jury']);
      const remapArtifact = async (name, value) => {
        const { contentHash: oldHash, ...body } = value;
        body.protocolHash = migrated.lifecycle.protocol.contentHash;
        body.inputArtifactHashes = (body.inputArtifactHashes ?? []).map((hash) =>
          oldContextHashes.get(hash) ?? hashMap.get(hash) ?? hash);
        const resealed = { ...body, contentHash: canonicalHash(body) };
        hashMap.set(oldHash, resealed.contentHash);
        await writeFile(join(migrationArtifactDir, name), JSON.stringify(resealed, null, 2), 'utf8');
        migratedWorkspace.artifacts += 1;
      };
      const entries = [];
      for (const name of readdirSync(migrationArtifactDir).filter((item) => item.endsWith('.json'))) {
        let value;
        try { value = JSON.parse(await readFile(join(migrationArtifactDir, name), 'utf8')); } catch { continue; }
        if (value?.schema !== ARTIFACT_SCHEMA) continue;
        entries.push({ name, value });
      }
      // Faz 1: image katı (revision sırasıyla — r1 author r0-jury'nin yeni hash'ini bekler).
      const imageEntries = entries.filter((e) => IMAGE_ROLES.has(e.value.role))
        .sort((a, b) => (a.value.revision - b.value.revision)
          || (a.value.role < b.value.role ? -1 : 1) || (a.value.sceneId - b.value.sceneId));
      for (const { name, value } of imageEntries) await remapArtifact(name, value);

      // Faz 2: frame RECEIPT'ler — image author yeni hash'ini kullanır; frame receipt'in
      // eski→yeni contentHash'i de hashMap'e girer ki frame-bağlı artifact'ler onu bulsun.
      const migrationFramesDir = join(migrationRoot, 'frames');
      let migratedFrames = 0;
      if (existsSync(migrationFramesDir)) {
        for (const name of readdirSync(migrationFramesDir).filter((item) => item.endsWith('.json'))) {
          let receipt;
          try { receipt = JSON.parse(await readFile(join(migrationFramesDir, name), 'utf8')); } catch { continue; }
          if (receipt?.schema !== FRAME_RECEIPT_SCHEMA) continue;
          const remappedAuthor = hashMap.get(receipt.fromImagePromptArtifactHash) ?? receipt.fromImagePromptArtifactHash;
          const { contentHash: oldReceiptHash, ...body } = receipt;
          body.fromImagePromptArtifactHash = remappedAuthor;
          const resealed = { ...body, contentHash: canonicalHash(body) };
          hashMap.set(oldReceiptHash, resealed.contentHash); // frame-bağlı artifact'ler bunu bulur
          await writeFile(join(migrationFramesDir, name), JSON.stringify(resealed, null, 2), 'utf8');
          if (resealed.contentHash !== oldReceiptHash) migratedFrames += 1;
        }
      }
      migratedWorkspace.frames = migratedFrames;

      // Faz 3: frame-bağlı artifact'ler (frame_jury/motion_author/motion_jury) — input'larında
      // hem image hem frame receipt yeni hash'lerini bulurlar.
      const FRAME_ROLE_ORDER = { frame_jury: 0, motion_author: 1, motion_jury: 2 };
      const frameBound = entries.filter((e) => !IMAGE_ROLES.has(e.value.role))
        .sort((a, b) => (a.value.revision - b.value.revision)
          || ((FRAME_ROLE_ORDER[a.value.role] ?? 9) - (FRAME_ROLE_ORDER[b.value.role] ?? 9))
          || (a.value.sceneId - b.value.sceneId));
      for (const { name, value } of frameBound) await remapArtifact(name, value);
    }
    return {
      file: output,
      validation: 'PASS',
      commandId: migrated.commandId,
      storyboardHash: migrated.lifecycle.storyboardHash,
      action: { kind: 'COMMAND_CONTEXT_MIGRATED' },
      migratedWorkspace,
    };
  }
  const check = await validateCommand(command);
  if (!check.ok) throw new Error(check.problems.join(' · '));
  if (args.includes('--add-directive-file')) {
    const added = await addLiveDirective(command, file, args);
    return { file, validation: 'PASS', action: { kind: 'DIRECTIVE_ADDED' }, ...added };
  }
  const projectDir = dirname(file);
  const root = resolve(argValue(args, '--workspace') ?? join(projectDir, '.mamilas'));
  const artifactDir = resolve(argValue(args, '--artifacts') ?? join(root, 'artifacts'));
  const sceneArg = Number(argValue(args, '--scene'));
  const explicitScene = Number.isFinite(sceneArg) && sceneArg > 0
    ? command.scenes.find((item) => item.id === sceneArg)
    : null;
  if (Number.isFinite(sceneArg) && sceneArg > 0 && !explicitScene) throw new Error(`scene ${sceneArg} yok`);

  // HARD-FIX 2026-07-17 (F-A5): --batch tüm sahneleri sürer; tekil-sahne mutasyon
  // bayraklarıyla birleşemez. Eskiden karışım "PASS image zinciri yok" gibi ALAKASIZ
  // bir hataya düşüyordu (batch erken artifacts=[] geçtiği için). Net, erken hata:
  if (args.includes('--batch')) {
    const soloFlags = ['--import-frame', '--export-image-bundle', '--clear-frame', '--add-directive-file', '--approve-storyboard'];
    const clash = soloFlags.find((flag) => args.includes(flag));
    if (clash) throw new Error(`--batch ${clash} ile birlikte kullanılamaz: --batch tüm sahneleri sürer, ${clash} tek sahne/işlem içindir. Birini seç.`);
  }

  if (args.includes('--approve-storyboard')) {
    // BATCH: --all-scenes tüm storyboard approval receipt'lerini tek koşuda yazar.
    // Onay kararı yine Mami'nin (runner tek soru sorar); burası yalnız receipt üretimi.
    if (args.includes('--all-scenes')) {
      await mkdir(root, { recursive: true });
      const approvals = [];
      for (const scene of command.scenes) {
        const approval = await approveStoryboard(root, command, scene);
        approvals.push({ sceneId: scene.id, ...approval });
      }
      return { file, validation: 'PASS', sceneId: null, action: { kind: 'STORYBOARD_APPROVED_ALL' }, approvals };
    }
    if (!explicitScene) throw new Error('--approve-storyboard için --scene zorunlu');
    await mkdir(root, { recursive: true });
    const approval = await approveStoryboard(root, command, explicitScene);
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'STORYBOARD_APPROVED' }, ...approval };
  }

  // HARD-FIX 2026-07-17 (F-A2): frame kurtarma. Bir sahnenin frame receipt'i bozuk
  // bağa düşerse (ör. eski workspace, elle bozulma) o sahne kilitleniyordu ve karesini
  // silecek komut yoktu — tek çıkış dosyayı elle silmekti. --clear-frame o sahnenin
  // frame receipt'ini + saklanan görselini güvenli siler; Mami yeni kare import edebilir.
  // Karar/artifact zincirine DOKUNMAZ — yalnız frame katmanını temizler.
  if (args.includes('--clear-frame')) {
    if (!explicitScene) throw new Error('--clear-frame için --scene zorunlu');
    const framesDir = join(root, 'frames');
    const receiptPath = join(framesDir, `${explicitScene.id}.json`);
    const removed = [];
    if (existsSync(receiptPath)) {
      // Saklanan görsel dosyasını da sil (receipt'ten oku; yol jail'i loadFrame ile aynı).
      try {
        const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
        if (receipt?.storedFile) {
          const stored = resolve(join(framesDir, receipt.storedFile));
          const frameDir = `${resolve(framesDir)}${process.platform === 'win32' ? '\\' : '/'}`;
          if (stored.startsWith(frameDir) && existsSync(stored)) { await rm(stored); removed.push(receipt.storedFile); }
        }
      } catch { /* bozuk receipt olsa da .json'u silmeye devam et */ }
      await rm(receiptPath);
      removed.push(`${explicitScene.id}.json`);
    }
    return {
      file, validation: 'PASS', sceneId: explicitScene.id,
      action: { kind: removed.length ? 'FRAME_CLEARED' : 'NO_FRAME' }, removed,
    };
  }

  // Batch sahne-izolasyonlu kendi non-strict yüklemesini yapar — strict ön yükleme
  // batch'te tek bozuk dosyayla bütün koşuyu öldürürdü (2026-07-16 çöküşü).
  const artifacts = args.includes('--batch') ? [] : await loadArtifacts(artifactDir, command);
  if (args.includes('--export-image-bundle')) {
    if (!explicitScene) throw new Error('--export-image-bundle için --scene zorunlu');
    const approval = await loadStoryboardApproval(root, command, explicitScene);
    if (!approval.ok) throw new Error(`scene ${explicitScene.id} storyboard APPROVE değil`);
    const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === explicitScene.id);
    // FABLE bulgusu: frame=null geçmek, frame_jury/motion artifact'i olan sahnede zinciri
    // yanlış hatayla ("current frame receipt yok") KALICI kırıyordu — receipt diskteyken.
    // Ana yol gibi gerçek frame'i yükle; frame yoksa loadFrame zaten null döner.
    const exportFrame = await loadFrame(root, command, explicitScene, sceneArtifacts);
    const liveExportArtifacts = validateArtifactChain(sceneArtifacts, exportFrame, command, explicitScene.id);
    const exported = await exportImageBundle(root, command, explicitScene, liveExportArtifacts, argValue(args, '--out'));
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'IMAGE_BUNDLE_EXPORTED' }, ...exported };
  }
  if (args.includes('--import-frame')) {
    if (!explicitScene) throw new Error('--import-frame için --scene zorunlu');
    const approval = await loadStoryboardApproval(root, command, explicitScene);
    if (!approval.ok) throw new Error(`scene ${explicitScene.id} storyboard APPROVE değil`);
    const sceneArtifacts = artifacts.filter((artifact) => artifact.sceneId === explicitScene.id);
    // FABLE bulgusu: aynı frame=null kilidi — yeni/daha iyi kare import'u da imkânsızlaşıyordu
    // ("Mami kareyi asla değiştiremiyor"). Mevcut frame'le doğrula; importFrame yeni kareyi
    // yazınca frame-bağımlı eski artifact'ler (frame_jury/motion) hash'leriyle doğal stale olur.
    const currentFrame = await loadFrame(root, command, explicitScene, sceneArtifacts);
    const liveImportArtifacts = validateArtifactChain(sceneArtifacts, currentFrame, command, explicitScene.id);
    const imported = await importFrame(
      root, command, explicitScene, liveImportArtifacts,
      argValue(args, '--import-frame'), argValue(args, '--verdict') ?? 'PENDING',
    );
    return { file, validation: 'PASS', sceneId: explicitScene.id, action: { kind: 'FRAME_IMPORTED' }, ...imported };
  }

  // ============================================================================
  // HARD-FIX 2026-07-16 (rapor A.1/A.7) — YERLEŞİK YÖNETMEN modu. Ürün vaadi:
  // "Mami yalnız Yerleşik Yönetmen ile konuşur; Author/Jury arkada çalışır."
  // --director: batch'i ARKA PLANDA ayrı süreç olarak başlatır (log dosyaya),
  // aynı terminalde kalıcı interaktif Yönetmen oturumu açar. Yönetmen state'i
  // SAHNE-PROMPTLAR.md + BATCH-LOG.txt'den okur, Mami'ye doğal dilde kısa durum
  // verir, sıradan REJECT'te susar, yalnız gerçek FACT_REQUIRED'da soru sorar,
  // Mami direktifini exact LIVE_CHAT olarak --add-directive-file ile bağlar.
  // ============================================================================
  if (args.includes('--director')) {
    const provider = argValue(args, '--provider');
    if (!['claude', 'codex'].includes(provider)) throw new Error('--director için --provider claude|codex zorunlu');
    await mkdir(root, { recursive: true });
    const logPath = join(projectDir, 'BATCH-LOG.txt');
    const { openSync } = await import('node:fs');
    const logFd = openSync(logPath, 'a');
    // Batch arka planda: aynı runtime, --batch --launch; stdout/stderr log dosyasına.
    const batchChild = spawn(process.execPath, [
      fileURLToPath(import.meta.url), '--file', file, '--batch', '--launch', '--provider', provider,
      ...(argValue(args, '--workspace') ? ['--workspace', argValue(args, '--workspace')] : []),
      ...(argValue(args, '--artifacts') ? ['--artifacts', argValue(args, '--artifacts')] : []),
    ], { cwd: projectDir, detached: true, stdio: ['ignore', logFd, logFd] });
    batchChild.unref();
    // Yönetmen oturum sözleşmesi — rol kartı + canlı dosya işaretçileri.
    const directorRole = await readFile(join(REPO_ROOT, 'agents', 'roles', 'director-session.md'), 'utf8');
    await writeFile(join(root, 'DIRECTOR-SESSION.md'), [
      '# MAMILAS Yerleşik Yönetmen oturumu', '',
      `Command: ${command.commandId}`,
      `Proje klasörü: ${projectDir}`,
      `Canlı durum paketi: ${join(projectDir, 'SAHNE-PROMPTLAR.md')} (her sahne kapanışında güncellenir)`,
      `Batch günlüğü: ${logPath}`,
      `Batch süreç PID: ${batchChild.pid}`,
      `Direktif bağlama: node "${fileURLToPath(import.meta.url)}" --file "${file}" --add-directive-file <utf8.txt> [--scope SCENE --scene <id>]`,
      '', directorRole,
    ].join('\n'), 'utf8');
    console.error(`🎬 Batch arka planda başladı (PID ${batchChild.pid}) — günlük: ${logPath}`);
    console.error(`🎭 Yerleşik Yönetmen oturumu açılıyor; Mami yalnız bu sohbetle konuşur.\n`);
    const cli = findExecutable(provider);
    if (!cli) throw new Error(`${provider} CLI bulunamadı`);
    const instruction = `Read ${JSON.stringify(join(root, 'DIRECTOR-SESSION.md'))} and follow it. You are the Yerleşik Yönetmen; speak Turkish with Mami.`;
    const directorArgs = provider === 'codex' ? ['-C', projectDir, instruction] : [instruction];
    const director = process.platform === 'win32' && ['.cmd', '.bat'].includes(extname(cli).toLowerCase())
      ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${cli}" ${directorArgs.map((a) => `"${a.replaceAll('"', '""')}"`).join(' ')}"`], { cwd: projectDir, stdio: 'inherit', windowsVerbatimArguments: true })
      : spawn(cli, directorArgs, { cwd: projectDir, stdio: 'inherit' });
    const exitCode = await new Promise((resolvePromise, reject) => { director.on('exit', resolvePromise); director.on('error', reject); });
    return {
      file, validation: 'PASS', commandId: command.commandId,
      action: { kind: 'DIRECTOR_SESSION_CLOSED' }, batchPid: batchChild.pid, batchLog: logPath, directorExit: exitCode,
      // İnteraktif sohbet stdout'u insana aitti; kapanışta JSON dökmek sohbeti kirletir.
      humanSession: true,
    };
  }

  // BATCH sürücüsü: sahne sahne DURMAK yerine, frame kapısına kadar koşulabilir tüm
  // yazım fazlarını (image author→jury, frame sonrası motion author→jury) tek koşuda
  // tamamlar. Her rol yine tek bağımsız oturumdur; jury yasası, revision limiti,
  // FACT_REQUIRED ve gerçek-frame kapısı AYNEN geçerlidir — hızlanan tek şey Mami'nin
  // launcher'a dönme sayısıdır. Otomatik image/video generation burada da YOKTUR.
  if (args.includes('--batch')) {
    if (explicitScene) throw new Error('--batch tüm sahneleri sürer; --scene ile birlikte kullanılmaz');
    const launch = args.includes('--launch');
    const provider = launch ? argValue(args, '--provider') : null;
    if (launch && !['claude', 'codex'].includes(provider)) throw new Error('--provider claude|codex zorunlu');
    const sceneReports = [];
    const total = command.scenes.length;
    for (const candidate of command.scenes) {
      let report = null;
      // Sahne başına güvenlik tavanı: author r0+r1, jury x2, motion aynı — 8 rol
      // koşusundan fazlası lifecycle yasasında zaten imkânsız; döngü kaçağına kapı yok.
      for (let step = 0; step < 8; step += 1) {
        // HARD-FIX 2026-07-16 (rapor A.4): sahne izolasyonu — non-strict yükleme.
        // Bozuk artifact önce mekanik onarım dener (repairJuryArtifact); onarılamazsa
        // yalnız SAHİBİ sahne etkilenir, diğer bağımsız sahneler yürür.
        const { artifacts: live, errors: loadErrors } = await loadArtifacts(artifactDir, command, { strict: false });
        const ownError = loadErrors.find((error) => error.sceneId === candidate.id);
        if (ownError) {
          // Rapor A.3: format/schema hatası için BİR teknik retry hakkı — creative
          // revision'dan AYRI. Bozuk dosya .invalid'e alınır; launch modunda aynı rol
          // yeniden açılır (lifecycle bozuk dosyayı görmediği için aynı role/revision'ı
          // türetir). İkinci bozuk üretim .invalid.2 ile TECHNICAL_ERROR olur.
          const brokenPath = join(artifactDir, ownError.file);
          const retryMarker = `${brokenPath}.invalid`;
          if (launch && !existsSync(retryMarker)) {
            await rename(brokenPath, retryMarker);
            console.error(`🔁 Sahne ${candidate.id}: ${ownError.file} format-bozuk (${ownError.problems.join(', ')}) — kenara alındı, aynı rol BİR kez teknik-retry ile yeniden açılıyor (creative revision hakkı yanmadı)`);
            continue; // döngü aynı sahneyi yeniden değerlendirir → RUN_ROLE türetilir
          }
          if (launch && existsSync(retryMarker)) {
            await rename(brokenPath, `${brokenPath}.invalid.2`);
          }
          report = {
            sceneId: candidate.id, phaseName: candidate.phaseName, state: launch ? 'TECHNICAL_ERROR' : 'FORMAT_RETRY_PENDING',
            reason: launch
              ? `${ownError.file}: ${ownError.problems.join(', ')} — teknik retry de başarısız; bu sahne elle incelenmeli, diğer sahneler etkilenmedi.`
              : `${ownError.file}: ${ownError.problems.join(', ')} — launch modunda aynı rol bir kez teknik-retry ile yeniden koşulur.`,
          };
          break;
        }
        let status;
        try {
          status = await sceneStatus(root, command, candidate, live);
        } catch (error) {
          // Zincir/approval hatası da yalnız bu sahneyi işaretler — batch ölmez.
          report = { sceneId: candidate.id, phaseName: candidate.phaseName, state: 'TECHNICAL_ERROR', reason: error.message };
          break;
        }
        if (status.action.kind !== 'RUN_ROLE') {
          report = statusReport(candidate, status);
          break;
        }
        if (!launch) { report = { sceneId: candidate.id, phaseName: candidate.phaseName, state: `RUN_ROLE:${status.action.role}` }; break; }
        // Canlı ilerleme — headless oturumlar sessizdir; Mami koşunun nerede olduğunu
        // stderr'den görür (stdout tek JSON sonuç olarak kalır, parse bozulmaz).
        console.error(`⏳ Sahne ${candidate.id}/${total} · ${status.action.role} r${status.action.revision} yazıyor…`);
        try {
          await executeRole(check, command, projectDir, root, artifactDir, status, provider, true, live);
        } catch (error) {
          // Rol oturumu/artifact hatası da sahne-bazlı: provider ölür, sahne işaretlenir,
          // sıradaki sahne yürür. Sonraki koşu (resume) bu sahneyi kaldığı yerden dener.
          report = { sceneId: candidate.id, phaseName: candidate.phaseName, state: 'TECHNICAL_ERROR', reason: error.message };
          console.error(`⚠️ Sahne ${candidate.id}/${total} · ${status.action.role} başarısız: ${error.message} — diğer sahneler sürüyor`);
          break;
        }
        console.error(`✅ Sahne ${candidate.id}/${total} · ${status.action.role} r${status.action.revision} mühürlendi`);
      }
      if (!report) throw new Error(`sahne ${candidate.id} rol tavanına çarptı; lifecycle beklenmedik döngüde`);
      const summary = report.state === 'AWAIT_FRAME' ? 'PASS prompt hazır — kare bekliyor'
        : report.state === 'FACT_REQUIRED' ? `DURDU: ${report.reason ?? 'eksik gerçek'}`
        : report.state;
      console.error(`📦 Sahne ${candidate.id}/${total} → ${summary}`);
      sceneReports.push(report);
      // HARD-FIX 2026-07-16 (rapor A.6): incremental teslim — paket HER sahne
      // kapanışında atomik yazılır; koşu yarıda kesilse bile o ana kadarki PASS
      // promptlar görünür pakette durur. Bekleyen sahneler PENDING olarak listelenir.
      const pendingReports = command.scenes
        .filter((scene) => !sceneReports.some((item) => item.sceneId === scene.id))
        .map((scene) => ({ sceneId: scene.id, phaseName: scene.phaseName, state: 'PENDING' }));
      await writeBatchPromptPack(root, command, [...sceneReports, ...pendingReports], projectDir);
    }
    const packPath = await writeBatchPromptPack(root, command, sceneReports, projectDir);
    if (launch) console.error(`\n🎬 Toplu prompt paketi: ${packPath}\n`);
    return {
      file, validation: 'PASS', protocolHash: check.protocolHash, commandId: command.commandId,
      storyboardHash: check.expectedStoryboard, action: { kind: 'BATCH_REPORT' }, scenes: sceneReports, promptPack: packPath,
    };
  }

  let selected = null;
  const candidates = explicitScene ? [explicitScene] : command.scenes;
  for (const candidate of candidates) {
    const status = await sceneStatus(root, command, candidate, artifacts);
    if (status.action.kind !== 'COMPLETE' || explicitScene) {
      selected = status;
      break;
    }
  }
  if (!selected) return {
    file, validation: 'PASS', protocolHash: check.protocolHash, commandId: command.commandId,
    storyboardHash: check.expectedStoryboard, sceneId: null, action: { kind: 'COMPLETE' }, contextSummary: null,
  };
  const { scene, artifacts: sceneArtifacts, frame, action } = selected;
  const context = action.kind === 'RUN_ROLE' ? roleContext(command, scene, sceneArtifacts, frame, action) : null;
  const contextText = context ? JSON.stringify(context) : '';
  const result = {
    file, validation: 'PASS', protocolHash: check.protocolHash, commandId: command.commandId,
    storyboardHash: check.expectedStoryboard, sceneId: scene.id, action,
    contextSummary: context ? {
      keys: Object.keys(context),
      byteLength: Buffer.byteLength(contextText, 'utf8'),
      containsSiteGeneratedPrompt: Boolean(scene.prompts?.image && contextText.includes(scene.prompts.image)),
    } : null,
  };
  if (args.includes('--launch')) {
    if (action.kind !== 'RUN_ROLE') throw new Error(`launch yok: ${action.kind}`);
    const provider = argValue(args, '--provider');
    if (!['claude', 'codex'].includes(provider)) throw new Error('--provider claude|codex zorunlu');
    await executeRole(check, command, projectDir, root, artifactDir, selected, provider, false, artifacts);
  }
  return result;
}

export async function sealArtifactDraft(args = process.argv.slice(2)) {
  const draftPath = resolve(argValue(args, '--seal-artifact'));
  const outputArg = argValue(args, '--out');
  if (!outputArg) throw new Error('--seal-artifact için --out zorunlu');
  // F-A4: seal ajanın (otonom child) kullandığı yoldur — SESSION.md'de --out artifactDir'i
  // gösterir. Yazma, draft'ın bulunduğu run ağacının (draft'ın iki üstü: .mamilas/... → run
  // kökü) dışına çıkamaz; child'ın kök-dışı artifact yazmasını engeller.
  const runRoot = dirname(dirname(draftPath));
  const output = jailWrite(outputArg, runRoot, '--seal-artifact --out');
  const draft = JSON.parse(await readFile(draftPath, 'utf8'));
  const { contentHash: _ignored, ...body } = draft;
  const sealed = { ...body, contentHash: canonicalHash(body) };
  await writeFile(output, JSON.stringify(sealed, null, 2), 'utf8');
  return { output, contentHash: sealed.contentHash };
}

async function main() {
  try {
    const result = process.argv.includes('--seal-artifact')
      ? await sealArtifactDraft()
      : await runCommand();
    if (result?.humanSession) {
      // Yönetmen oturumu insan sohbetiydi — kapanışta JSON dökülmez, kısa kapanış verilir.
      console.error(`\n🎬 Yönetmen oturumu kapandı. Batch arka planda sürüyorsa durumu SAHNE-PROMPTLAR.md gösterir (günlük: ${result.batchLog}).`);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`mamilas-command: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
