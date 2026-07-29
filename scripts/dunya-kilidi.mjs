#!/usr/bin/env node
/**
 * dunya-kilidi.mjs — DÜNYA KİLİDİNİN TEK KAYNAĞI
 * =============================================================================
 *
 * NEDEN VAR
 * ---------
 * Dünya kilidi (`STYLE:` bloğu + palet ışık davranışı + global negatif kuyruk) koddan
 * EMİT EDİLMİYOR. `src/core/brain.ts` içindeki `renderLock()` ve `paletteLightPrompt()`
 * yalnız site/runner yolunda çalışıyor; elle prompt yazan ajanın eline hiç geçmiyor.
 * Sonuç: her ajan bloğu ezberden yeniden yazıyor ve AYNI DÜNYADA DÖRT FARKLI LEHÇE oluştu.
 *
 * ÖLÇÜM (üç ajan, teslim edilmiş dosyalar üzerinden):
 *   · Kütle ilk 8 kare      → STYLE 81-91 kelime · `props drawn 10-15% overscale` 8/8
 *   · Kütle kalan 27 kare   → STYLE 23-30 kelime · overscale 0/27  (başka ajan yazdı)
 *                             yani AYNI FİLMDE İKİ FARKLI PROP ÖLÇEĞİ
 *   · Bileşke Kuvvet        → STYLE 189-284 kelime · 7 farklı sürüm (yasa tavanı 110)
 *   · Sürtünme              → 31 karede birebir aynı 126 kelimelik blok (tek tutarlı olan)
 * Hüküm: prompt kalitesi "o bloğu KİM yazdı"ya bağlı. Bu bir YETENEK kusuru, kelime kusuru değil.
 *
 * NE YAPAR
 * --------
 *   node scripts/dunya-kilidi.mjs <worldId> [--register=edu|real|sty] [--palet=<id>]
 * O dünyanın kanonik, YAPIŞTIRMAYA HAZIR kuyruğunu basar (stdout):
 *     STYLE: …            (≤90 kelime — PROMPT-YASASI §2 tavanı)
 *     LIGHT AND PALETTE: … (palet ışık DAVRANIŞI olarak; ham hex ASLA)
 *     NEGATIVE: …          (global kuyruk; kare-özel maddeler ajanın ÖNÜNE eklenir)
 * Ölçüm ve uyarılar stderr'e gider — stdout saf kopyalanabilir metindir.
 *
 * YASA
 * ----
 * · Tek kelime UYDURULMAZ. Her kelime `src/core/SURGERY_DATA.json`'dan gelir; script yalnız
 *   SEÇER, sıralar ve marka adını söker. Yeniden yazmaz, parafraz etmez.
 * · Ham hex çıktıya sızmaz (`hexToLightWords` portu). Sızarsa script kendini uyarır.
 * · 90 kelime aşılırsa KESİLMEZ, UYARILIR — kesmek yasayı değil metni bozar.
 * · Marka/stüdyo adı sökülür ama SESSİZCE DEĞİL: her sökülen token stderr'e yazılır.
 *
 * KAYNAKLAR (hepsi diskten okunur, hiçbiri ezberden değil)
 * -------------------------------------------------------
 *   src/core/SURGERY_DATA.json    → dünya, render_law, line/lens_grammar, light_law,
 *                                    palette_lock, negative_lock, palettes
 *   src/core/brain.ts             → renderLock (~70) · paletteLightPrompt (~366) ·
 *                                    scrubImageNegatives (~1632) — MANTIK taklit edilir
 *                                    (.ts import edilemez; JSON'dan aynı sonuç üretilir)
 *   src/core/pure.ts              → splitRenderLawPhysics (~459) — prop envanteri ayıklama
 *   agents/ipFirewall.json        → marka/IP kanonu (TEK kaynak)
 *   agents/promptQuality.mined.json → REAL register'ın zorunlu karşı-terimleri
 *   agents/PROMPT-YASASI.md §2    → STYLE ≤90 kelime tavanı, slot sırası
 *
 * `src/core/` bu script tarafından OKUNUR, asla yazılmaz (icraat fazı: kod donuk).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = (v) => String(v == null ? '' : v);
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const DATA = readJson('src/core/SURGERY_DATA.json');
const IP_FIREWALL = readJson('agents/ipFirewall.json');
let MINED = null;
try { MINED = readJson('agents/promptQuality.mined.json'); } catch { MINED = null; }

/** PROMPT-YASASI §2 — "STYLE ≤90 kelime". 269 kelimelik blok kare-özel oranını %35'e
 *  düşürdü ve %65 revize getirdi; tavan ölçülmüş bir kıstas, tercih değil. */
const STYLE_WORD_CAP = 90;

const warn = (msg) => process.stderr.write(msg + '\n');
const words = (s) => T(s).trim().split(/\s+/).filter(Boolean).length;

// ============================================================================
// 1) brain.ts / pure.ts PORTLARI — mantık taklit, çıktı aynı
// ============================================================================

/** brain.ts:46 registerOf — dünyanın kendi grubundan doğal register'ı. */
function registerOfPath(productionPath) {
  const p = T(productionPath).toUpperCase();
  if (/REAL|COMMERCIAL|PRODUCT|LIVE|DOCUMENTARY|TESTIMONIAL|FOOD|FASHION|TOURISM|AUTOMOTIVE|TECH|ARCHITECTURE|SOCIAL|HEALTH/.test(p)) return 'REAL';
  if (p === 'ANIMATION_EDU' || /EGITIM|EĞİTİM|EDU/.test(p)) return 'EDU';
  return 'STY';
}

/** brain.ts:170 splitTopLevelCommas — parantez içi virgül ayırıcı SAYILMAZ. */
function splitTopLevelCommas(s) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of T(s)) {
    if (ch === '(') { depth++; cur += ch; }
    else if (ch === ')') { depth = Math.max(0, depth - 1); cur += ch; }
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** pure.ts:425-467 — render_law'ı {physics, props} olarak ayır. Prop envanteri kareye sızar. */
const PROP_NOUN_RE = /\b(poster|pennant|hull|figurehead|signage|caravel|bridge|facade|seal|path|machine|cable|curtain|tree|wall|roof|courtyard|lamp|desk|table|window|door|vending|sticker|crt|fortress|village|rope|stone|timber|cardboard|foam|wire|miniature)\w*\b/gi;
const PHYSICS_BEHAVIOUR_RE = /\b(light source|photon|motivated|serves as the|soft key|key light|fill (?:light|comes)|bounce|ambient|contrast ratio|falloff|grain|lens|aperture|exposure|implied through composition|filling \d+)/i;
const splitLawSentences = (law) => T(law).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
function isPropInventorySentence(sentence) {
  const nouns = sentence.match(PROP_NOUN_RE) ?? [];
  if (new Set(nouns.map((n) => n.toLowerCase())).size < 3) return false;
  return !PHYSICS_BEHAVIOUR_RE.test(sentence);
}
function splitRenderLawPhysics(law) {
  const physics = [], props = [];
  for (const s of splitLawSentences(T(law).trim())) (isPropInventorySentence(s) ? props : physics).push(s);
  return { physics, props };
}

const worldRenderText = (w) => w.render_law || w.render || w.one_liner || w.name;
const worldAvoidText = (w) => (w.negative_lock || []).join('; ') || w.avoid || '';

/** brain.ts:1760 STILL_TEMPORAL_RE — kadans cümlesi MOTION'a aittir, durağan kareye değil. */
const STILL_TEMPORAL_RE = /\b(?:\d+\s?fps|dual-cadence|rate-clash|ink-smear|frames?\s+(?:dissolve|resolve)|freeze-frame|per-frame\s+micro-strobe|micro-strobe|on\s+\d+s\s+holds?|\d+\s*frame\s+cycles?|painted smears?|follow-through smears?|smear[- ]frames?)\b/i;

/** brain.ts:337 FLAT_LIGHT_RE — dünya kendi ışık yasasında yönlü ışığı reddediyor mu. */
const FLAT_LIGHT_RE = /no directional lighting simulation|no directional shadow|flat-lit with no directional|flat even board illumination/i;
const isFlatLightWorld = (w) => FLAT_LIGHT_RE.test(w.light_law || '');
const paletteReadingFor = (w) => isFlatLightWorld(w)
  ? 'Render these as flat printed plane values — each colour its own uniform field, no simulated light falloff.'
  : 'Render these as light behaviour, never flat fills.';

/** brain.ts:116 hexToLightWords — PALETTE TRANSLATION LAW. Motor hex okumaz; fizik okur. */
function hexToLightWords(hex) {
  const m = /^#?([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(T(hex).trim());
  if (!m) return T(hex);
  let m6 = m[1];
  if (m6.length === 8) m6 = m6.slice(0, 6);
  if (m6.length === 4) m6 = m6.slice(0, 3);
  if (m6.length === 3) m6 = m6.split('').map((c) => c + c).join('');
  const n = parseInt(m6, 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const li = l < 0.16 ? 'near-black' : l < 0.38 ? 'deep'
    : (s >= 0.7 && l < 0.85) ? 'vivid'
    : l < 0.62 ? 'dusky' : l < 0.85 ? 'bright' : 'near-white';
  if (s < 0.09) return `${li} neutral gray`;
  const hue = h < 15 ? 'red' : h < 40 ? 'burnt orange' : h < 60 ? 'amber' : h < 90 ? 'olive gold'
    : h < 150 ? 'green' : h < 195 ? 'teal' : h < 240 ? 'blue' : h < 280 ? 'indigo'
    : h < 320 ? 'violet' : h < 345 ? 'magenta' : 'red';
  const temp = (h >= 90 && h < 280) ? 'cool' : 'warm';
  if (h >= 15 && h < 60) {
    if (l >= 0.85) return `${li} warm ivory`;
    if (s < 0.35 && l < 0.62) return `${li} warm umber`;
    if (s < 0.20 && l >= 0.62) return `${li} warm off-white`;
  }
  return `${li} ${temp} ${hue}`;
}

/** brain.ts:165 META_LANG — insan danışman diline yazılmış cümleler motora gitmez. */
const META_LANG = /^\s*(best for|pairs with|default choice|do not override|uses the selected|overlays cleanly on)/i;
const DIRECTIONAL_LIGHT_RE = /\b(?:key|rim|backlight|bounce|fill|falloff|specular|ambient occlusion|god[- ]?ray|shadow shapes?|value separation)\b/i;

/** brain.ts:195 biasCharacterClause — bias'ın POZİTİF karakter yarısı. */
function biasCharacterClause(bias) {
  const raw = T(bias).trim();
  if (!raw) return '';
  const negIdx = raw.search(/\bNO\b|\bAVOID\b|\basla\b/i);
  const positive = (negIdx > 0 ? raw.slice(0, negIdx) : raw).trim().replace(/[.!?;]+$/, '').trim();
  if (!positive) return '';
  const rawChunks = [];
  for (const chunk of splitTopLevelCommas(positive)) {
    for (const part of chunk.split(/(?<=[.!?])\s+/).map((c) => c.trim()).filter(Boolean)) {
      rawChunks.push({ text: part, endsSentence: /[.!?]$/.test(part) });
    }
  }
  const chunks = rawChunks.filter((c) => !META_LANG.test(c.text));
  if (!chunks.length) return '';
  let out = '';
  chunks.forEach((c, i) => {
    const text = c.text.replace(/[.!?;]+$/, '');
    if (i === 0) { out = text; return; }
    out += (chunks[i - 1].endsSentence ? '. ' : ', ') + text;
  });
  return `— palette character: ${out}`;
}

/** brain.ts:255 biasNegativeClause — bias'ın NO/AVOID kuyruğu. */
function biasNegativeClause(bias) {
  const raw = T(bias).trim();
  if (!raw) return '';
  const negIdx = raw.search(/\bNO\b|\bAVOID\b|\basla\b/i);
  if (negIdx < 0) return '';
  return raw.slice(negIdx).trim().replace(/[.!?]+$/, '').trim();
}

// brain.ts:265-327 — R9 ailesi: World/Render Lock > Palette çifte-otorite çözümleri.
const WORLD_COOL_SHADOW_RE = /warm highlights,?\s*cool shadows|cool shadows?\b|shadows?\s+(?:push|pushed|fall)\w*\s+(?:toward |into )?(?:steel-)?teal/i;
const TEAL_ORANGE_ITEM_RE = /teal[- ]?(?:and[- ]?)?orange/i;
const WORLD_WARM_HIGHLIGHT_RE = /warm highlights?|warm practical|warm key light|warm motivated key|motivated key/i;
const WARM_BLANKET_ITEM_RE = /^no\s+warm\b/i;
const WARM_SCOPED_ITEM = "NO unmotivated warm accent (the world's source-light temperature governs highlights)";
const WORLD_OPENS_SHADOW_RE = /complementary bounce fill|bounce fill at \d|opens the shadow side|fill one to two stops under key/i;
const LIFT_BLANKET_ITEM_RE = /^(?:no\s+(?:lifted|shadow lift)|total shadow absorption)/i;
const LIFT_SCOPED_ITEM = "NO unmotivated shadow lift (the world's own bounce fill governs the shadow side)";
function worldDeclaresTealOrange(lawText) {
  for (const sent of lawText.split(/[.!?]+/)) {
    const m = /teal[- ](?:and[- ])?orange/i.exec(sent);
    if (m && !/\b(?:no|never|not|forbid\w*|avoid|without)\b/i.test(sent.slice(0, m.index))) return true;
  }
  return false;
}
function resolvePaletteGradeConflict(negBias, world) {
  if (!negBias) return negBias;
  const lawText = `${worldRenderText(world)} ${T(world.light_law)}`;
  const dropCool = WORLD_COOL_SHADOW_RE.test(lawText);
  const dropTealOrange = worldDeclaresTealOrange(lawText);
  const scopeWarm = WORLD_WARM_HIGHLIGHT_RE.test(lawText);
  const scopeLift = WORLD_OPENS_SHADOW_RE.test(lawText);
  if (!dropCool && !dropTealOrange && !scopeWarm && !scopeLift) return negBias;
  return negBias.split(',').map((x) => x.trim()).filter((x) => x
    && !(dropCool && /cool interruption/i.test(x))
    && !(dropTealOrange && TEAL_ORANGE_ITEM_RE.test(x)))
    .map((x) => (scopeWarm && WARM_BLANKET_ITEM_RE.test(x) ? WARM_SCOPED_ITEM : x))
    .map((x) => (scopeLift && LIFT_BLANKET_ITEM_RE.test(x) ? LIFT_SCOPED_ITEM : x))
    .join(', ');
}

const EMPTY_ADJ_RE = /\b(?:cinematic|dynamic|stunning|epic|4k|8k)\b/gi;
const scrubEmptyAdjectives = (label) => T(label)
  .replace(EMPTY_ADJ_RE, '').replace(/\s{2,}/g, ' ')
  .replace(/\s+([,.;:—-])/g, '$1').replace(/[\s—-]+$/, '').trim();

/** brain.ts:373 paletteLightPromptRaw — dünyanın palette_lock'u (ya da seçili palet) ışık dili. */
function paletteLightPrompt(palette, world) {
  const lock = palette?.hex ?? (!palette ? world.palette_lock : undefined);
  const reading = paletteReadingFor(world);
  const endStop = (s) => { const t = T(s).trim(); return t && !/[.!?]$/.test(t) ? t + '.' : t; };
  if (lock) {
    const rawBias = palette?.hex ? T(palette.bias) : T(world.palette_lock?.bias);
    const rawChar = biasCharacterClause(rawBias);
    const charClause = isFlatLightWorld(world)
      ? rawChar.split(/(?<=\.)\s+/).map((sentence) => {
        const tail = sentence.endsWith('.') ? '.' : '';
        const items = sentence.replace(/\.$/, '').split(/,\s*/).map((i) => i.trim())
          .filter((i) => i && !DIRECTIONAL_LIGHT_RE.test(i));
        return items.length ? items.join(', ') + tail : '';
      }).filter(Boolean).join(' ')
      : rawChar;
    const negClause = endStop(resolvePaletteGradeConflict(biasNegativeClause(rawBias), world));
    const name = palette?.hex ? `${scrubEmptyAdjectives(T(palette.name))} — ` : '';
    const roleAware = (role, w) => {
      if (role === 'shadows') return w.replace(/^bright\b/, 'lifted pale').replace(/^near-white\b/, 'lifted near-white');
      if (role === 'highlights') return w.replace(/^near-black\b/, 'crushed near-black').replace(/^deep\b/, 'restrained deep');
      return w;
    };
    const rawRoles = [
      ['shadows', hexToLightWords(lock.shadow)], ['midtones', hexToLightWords(lock.mid)],
      ['accents', hexToLightWords(lock.accent)], ['highlights', hexToLightWords(lock.highlight)],
    ];
    const worldGradeText = `${worldRenderText(world)} ${T(world.light_law)}`;
    const worldCoolShadow = WORLD_COOL_SHADOW_RE.test(worldGradeText);
    const WARM_SHADOW_RE = /\b(?:warm|orange|amber|umber|burnt|gold(?:en)?|scorched|tan)\b/i;
    let shadowReconciled = false;
    const roles = rawRoles.map(([role, w]) => {
      const aware = roleAware(role, w);
      if (role === 'shadows' && worldCoolShadow && WARM_SHADOW_RE.test(aware)) {
        shadowReconciled = true;
        const lum = (aware.match(/^(?:crushed near-black|restrained deep|lifted (?:pale|near-white)|near-black|deep|dusky|bright|near-white)/i) || [''])[0];
        return [role, `${lum ? lum + ' ' : ''}cool-neutral held under the world cool-shadow grade`];
      }
      return [role, aware];
    });
    const families = rawRoles.map(([, w]) => w.replace(/^(near-black|deep|dusky|bright|near-white)\s+/, ''));
    const oneFamily = new Set(families).size === 1 && !shadowReconciled;
    const shadowKey = roles[0][1].split(' ')[0];
    const body = oneFamily
      ? `a single ${shadowKey}-keyed ${families[0]} family — ${roles.map(([role, w]) => `${w.split(' ')[0]} ${role}`).join(', ')}`
      : roles.map(([role, w]) => `${role} read as ${w}`).join(', ');
    const charPart = charClause ? ` ${charClause}.` : '.';
    const negPart = negClause ? ` ${negClause}` : '';
    return `${name}${body}${charPart}${negPart} ${reading}`.replace(/\s+/g, ' ').trim();
  }
  const colors = palette?.colors?.length ? palette.colors
    : (world.palette_lock ? [world.palette_lock.shadow, world.palette_lock.mid, world.palette_lock.accent, world.palette_lock.highlight] : (world.colors || world.palette || []));
  const wordsOut = Array.from(new Set(colors.map(hexToLightWords)));
  if (wordsOut.length) {
    const hasOwnVisualBias = !!(palette?.hex || palette?.c0 || palette?.c1);
    const charClause = biasCharacterClause(hasOwnVisualBias ? palette?.bias : world.palette_lock?.bias);
    return `Palette light: ${wordsOut.join(', ')}${charClause ? ` ${charClause}.` : '.'} ${reading}`;
  }
  return isFlatLightWorld(world)
    ? 'World-native palette, read as flat printed plane values.'
    : 'World-native palette, read as light behaviour.';
}

// ============================================================================
// 2) NEGATİF KUYRUK — brain.ts:1443/1632 scrubImageNegatives portu
// ============================================================================

const STYLE_CAP_WORDS = new Set(['turkish', 'english', 'hollywood', 'toei', 'vision', 'material', 'render', 'the', 'dutch', 'layer', 'steadicam']);
const NEG_SYMBOL_SUBSTITUTION = 'the named thing replaced by a symbol for it — no icon, pictogram, chart, diagram, arrow, gauge or infographic panel standing in for the real object or the real action; the literal thing is IN the frame, photographed/rendered as matter, not illustrated as a concept';
const NEG_SYMBOL_DIAGRAMMATIC = 'decoration standing in for the mechanism — the diagram must DO the explaining: every drawn element is the real part, the real quantity or the real step, never a mood-icon or a filler glyph beside it';
const NEG_STATIC_TAIL = 'empty adjectives (cinematic, dynamic, stunning, 4K); flat slide; warped or drifting text; character retyping';
const IP_GENERIC_NEG = 'no recognizable franchise or real-person characters, logos, brand names';
const WORLD_DRAWS_DIAGRAMS_RE = /whiteboard|dry[- ]erase|isometric (?:diagram|explainer)|infographic|flat vector icon|motion[- ]design|explainer diagram|schematic/i;

/** brain.ts:1443 negItemIsIP — bir negatif maddesi IP adı mı, yoksa gerçek render yasağı mı. */
function negItemIsIP(item) {
  if (/\bnamed\b/i.test(item)) return true;
  if (/\bfranchise\b/i.test(item)) return true;
  if (/^(?:19|20)\d{2}\b/.test(item.trim().replace(/^(?:NO|NOT)\s+/i, ''))) return true;
  if (/\b(emblem|insignia|sigil|crest|wordmark|mascot|likeness|iconography|costumes?|haori|hanafuda|monolith)\b/i.test(item)) return true;
  if (/-(aura|gear|field|cloak)\b/i.test(item)) return true;
  if (/\b(hotel-twin-girls|severed-floor)\b/i.test(item)) return true;
  if (/\b(MDR|NASA|NERV|SOL|LEGO|ODM|RSA|FIFA|EVA)\b/.test(item)) return true;
  const negLed = /^(?:NO|NOT)\s+/i.test(item.trim());
  const core = item.trim().replace(/^(?:NO|NOT)\s+/i, '');
  if (/\b[A-Z][a-z]+(?:[ -][A-Z][a-z]+)+\b/.test(core)) return true;
  if (/\b[A-Z][A-Za-z]*\s+\d/.test(core)) return true;
  if (negLed) {
    const first = core.match(/^([A-Z][a-z]+)\b/);
    if (first && !STYLE_CAP_WORDS.has(first[1].toLowerCase())) return true;
  }
  const rest = core.replace(/^[A-Z][A-Za-z]*\s+/, ' ');
  return (rest.match(/\b[A-Z][a-z]{2,}\b/g) || []).some((w) => !STYLE_CAP_WORDS.has(w.toLowerCase()));
}

/** brain.ts:1632 scrubImageNegatives — IP selini tek jenerik cümleye indirger, dedupe eder. */
function scrubImageNegatives(ipParts, diagrammatic = false, extraLeadItems = []) {
  const seenCores = [];
  let tealOrangeSeen = false;
  const norm = (s) => s.toLowerCase().replace(/^no\s+/, '').replace(/[.\s]+$/, '').replace(/\s+/g, ' ').trim();
  const consider = (raw) => {
    const it = raw.trim().replace(/^[,;]\s*/, '').replace(/\.\s*$/, '').trim();
    if (!it) return null;
    const core = norm(it);
    if (!core) return null;
    if (/teal[- ]?(?:and[- ])?orange/.test(core)) {
      if (tealOrangeSeen) return null;
      tealOrangeSeen = true;
    }
    for (const kc of seenCores) if (kc === core || kc.startsWith(core + ' ')) return null;
    seenCores.push(core);
    return it;
  };
  const keptClauses = [];
  let droppedIP = false;
  // render_law'dan sökülen "Strictly forbid …" cümleleri STYLE'a değil BURAYA aittir.
  for (const lead of extraLeadItems) { const k = consider(lead); if (k) keptClauses.push(k); }
  for (const part of ipParts) {
    const p = T(part).trim();
    if (!p) continue;
    let lastItemAllIP = false, prevItemTailDroppedIP = false, armedByImperative = false;
    for (const clause of p.split(/;|(?<!\b(?:e\.g|i\.e|etc|vs|cf|approx|no))\.\s/i).map((c) => c.trim()).filter(Boolean)) {
      const items = splitTopLevelCommas(clause).filter(Boolean);
      if (!items.length) continue;
      const clauseIsImperative = /^(?:NO|NOT|AVOID)\b/i.test(items[0].trim());
      const survivors = [];
      for (const item of items) {
        const it = item.trim();
        const isContinuation = /^(?:not|nor|or|and)\b/.test(it);
        const isFresh = !isContinuation && (/^(?:NO|NOT|AVOID)\b/i.test(it) || /^[A-Z]/.test(it));
        const orphanable = isContinuation || (!isFresh && armedByImperative);
        if (orphanable && (lastItemAllIP || prevItemTailDroppedIP)) {
          droppedIP = true; prevItemTailDroppedIP = false; continue;
        }
        const subs = it.split(/\s+—\s+/).map((s) => s.trim()).filter(Boolean);
        const subSurvivors = [];
        let anyKept = false, thisDroppedIP = false;
        for (const sub of subs) {
          if (negItemIsIP(sub)) { droppedIP = true; thisDroppedIP = true; continue; }
          anyKept = true;
          const s = consider(sub);
          if (s) subSurvivors.push(s);
        }
        lastItemAllIP = !anyKept;
        if (lastItemAllIP) armedByImperative = clauseIsImperative;
        prevItemTailDroppedIP = anyKept && thisDroppedIP;
        if (subSurvivors.length) survivors.push(subSurvivors.join(' — '));
      }
      if (survivors.length) keptClauses.push(survivors.join(', '));
    }
  }
  if (droppedIP) { const g = consider(IP_GENERIC_NEG); if (g) keptClauses.push(g); }
  { const m = consider(diagrammatic ? NEG_SYMBOL_DIAGRAMMATIC : NEG_SYMBOL_SUBSTITUTION); if (m) keptClauses.push(m); }
  for (const s of NEG_STATIC_TAIL.split(';')) { const k = consider(s); if (k) keptClauses.push(k); }
  return keptClauses.join('; ');
}

// ============================================================================
// 3) MARKA SÖKÜMÜ — "stili çağır, stüdyoyu değil" (PROMPT-YASASI §2)
// ============================================================================
//
// Kaynak iki taraflı: (a) agents/ipFirewall.json TEK KANON'u, (b) dünyanın KENDİ
// negative_lock'unda IP olarak işaretlenmiş maddelerinden çıkan özel adlar. Böylece
// "Pixar"/"Disney" gibi stüdyo adları dünyanın kendi yasağından öğrenilir — el listesi yok.
// RenderMan gibi render-hattı adları KAPSAM DIŞI (brain.ts:1492 notu): bunlar motora
// marka değil ışık/çizgi grameri ısmarlar.

function brandTokensFor(world) {
  const tokens = new Set();
  // ≥4 harf: "One Piece"nin `One`'ı ve "Brand Kit"in `Kit`i özel ad sanılıp metnin içinden
  // sökülüyordu. Üç harfli gerçek marka nadirdir; ALL-CAPS kısaltmalar zaten kapsam dışı.
  const push = (t) => { const s = T(t).trim(); if (s.length >= 4) tokens.add(s.toLowerCase()); };
  // (a) firewall kanonu — yalnız tek kelimelik markalar sözcük-token olarak sökülebilir
  for (const src of [IP_FIREWALL.commercialBrandSource, IP_FIREWALL.gateExtraFranchise, IP_FIREWALL.protectedIpSource]) {
    for (const alt of T(src).split('|')) if (alt && !/[\s\\.]/.test(alt)) push(alt);
  }
  // (b) dünyanın kendi negatif kilidinden: IP sayılan maddelerdeki Title-case özel adlar.
  // YALNIZ Title-case (`[A-Z][a-z]+`) — brain.ts:1478'in kendi muafiyeti: ALL-CAPS token
  // bir teknik kısaltmadır, marka değil ("SSS", "CGI", "AO", "HDR"). İlk sürüm bunu
  // kapsamıştı ve `SSS` paletten silinip "warm-honey dominant on skin" kalmıştı — dünyanın
  // kendi cilt fiziği kayboldu.
  for (const item of world.negative_lock || []) {
    if (!negItemIsIP(item)) continue;
    for (const w of item.match(/\b[A-Z][a-z]+(?:-[A-Z][a-z]+)?\b/g) || []) {
      if (!STYLE_CAP_WORDS.has(w.toLowerCase()) && !/^(No|Not|Avoid|Must)$/.test(w)) push(w);
    }
  }
  // GENEL AD MUAFİYETİ — ölçüldü: `product_brand_real`'in "…OTHER than the client brand locked
  // in the Brand Kit" maddesinden `Brand` özel ad sanıldı ve STYLE'ın açılışı "Turkish product
  // and brand advertising" → "Turkish product and advertising"a düştü; dünyanın kendi kimliği
  // silindi. Kural veriden gelir, el listesinden değil: bir özel ad dünyanın kendi metninde
  // KÜÇÜK HARFLE geçmez. Geçiyorsa o bir genel addır ve sökülmez. (+ firewall'ın kendi
  // gateExemptGenerics listesi.)
  const ownText = `${T(world.one_liner)} ${T(world.render_law)} ${T(world.light_law)} ${T(world.line_grammar)} ${T(world.lens_grammar)}`;
  for (const g of IP_FIREWALL.gateExemptGenerics || []) tokens.delete(T(g).toLowerCase());
  for (const tok of Array.from(tokens)) {
    if (new RegExp(`(?<![\\w#])${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(ownText)) tokens.delete(tok);
  }
  return tokens;
}

/** Marka token'ını cümleden söker; SESSİZ DEĞİL — sökülen her token rapora düşer. */
function scrubBrandTokens(text, tokens, report) {
  let out = T(text);
  for (const tok of tokens) {
    const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:'s|’s)?\\b`, 'gi');
    if (!re.test(out)) continue;
    report.add(tok);
    out = out.replace(re, '');
  }
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/^[\s,;:—-]+/, '').trim();
}

// ============================================================================
// 4) STYLE BLOĞU — SEÇİM, yeniden yazım DEĞİL
// ============================================================================
//
// Kaynak cümleler dünyanın render_law fiziği + line_grammar + lens_grammar'ıdır.
// (camera_grammar bilerek dışarıda: kamera hareketi MOTION'un işi, durağan karenin değil —
//  renderLock() de onu almıyor.) Cümleler bileşenlerine ayrılır, her bileşen MALZEME/OPTİK
// yoğunluğuna göre puanlanır, 90 kelimelik bütçeye en yüksek puanlılar alınır ve ORİJİNAL
// SIRAYLA basılır. Hiçbir kelime yeniden yazılmaz — yalnız seçilir.

const SPEC_RE = /\b(grain|sheen|varnish|matte|gloss|weave|woven|stitch|fiber|fibre|pore|anisotropic|specular|subsurface|sss|scatter\w*|translucen\w*|wood|fabric|metal|rubber|glass|clay|paper|ink|paint|painted|cel|emulsion|halation|film stock|vision3|kodak|silhouette|occlusion|bounce|rim|key|falloff|bokeh|aperture|focal|lens|f\/\d|mm\b|contrast|value|edge|texture|surface|shading|render|line|stroke|hatch|grade|highlight|shadow|skin|overscale|scale)\b/gi;
// Sondaki `\b` bilerek YOK: "(10-15%)" içinde `%`den sonra `)` gelir, ikisi de word-dışıdır
// ve sınır kurulmaz — overscale kilidi tam da bu yüzden sayı bonusunu alamıyordu.
const NUMERIC_RE = /\b(\d+(?:\.\d+)?\s?(?:mm|%|°|k\b|stops?|nm)|f\/\d|\d+:\d+)/i;
// META_RE bilerek DAR: "deliberate"/"signature" ilk sürümde buradaydı ve dünyanın en pahalı
// ölçülmüş kilidini ("Every prop has a deliberate overscale factor (10-15%)" — Kütle'de 0/27)
// bütçe dışına itti. Yalnız GERÇEK meta dili elenir: içeriği olmayan çerçeve cümleleri.
const META_RE = /\b(non-negotiable|imperative|is NOT|philosophy|approach|never merely|specific formal grammar)\b/i;
const FORBID_LEAD_RE = /^(?:strictly forbid|forbid|no|never|avoid)\b/i;
/** Kendi başına duramayan karşıtlık kuyruğu: "…, not photo-random", "…, never hard-step".
 *  Ayrı bileşene bölünürse anlamsız kırıntı olur ve NEGATIVE'e yalancı madde yazar. */
const CONTINUATION_RE = /^(?:not|nor|never|or|and|but)\b/i;

/**
 * Bir cümleyi puanlanabilir bileşenlere ayırır: ';' → ':' → em-dash → üst düzey virgül.
 * İki koruma:
 *  · Sayı taşıyan parantez KORUNUR — "(10-15%)" atıldığında overscale kilidi ölçüsünü kaybeder.
 *  · Karşıtlık kuyruğu ("…, not photo-random") kendinden önceki bileşene GERİ YAPIŞTIRILIR.
 */
function toUnits(sentence) {
  const groups = [];
  for (const semi of sentence.split(/;\s*/)) {
    for (const colon of semi.split(/:\s+/)) {
      for (const dash of colon.split(/\s+[—–]\s+/)) {
        const out = [];
        const push = (raw) => {
          const t = raw.replace(/\s*\(([^)]*)\)/g, (mm, inner) => (/\d/.test(inner) ? ` (${inner})` : ''))
            .replace(/[.\s]+$/, '').replace(/\s{2,}/g, ' ').trim();
          if (!t) return;
          if (CONTINUATION_RE.test(t) && out.length) { out[out.length - 1] += ', ' + t; return; }
          out.push(t);
        };
        for (const comma of splitTopLevelCommas(dash)) push(comma);
        if (out.length) groups.push(out);
      }
    }
  }
  return groups;
}

function scoreUnit(t) {
  let score = 0;
  // Eş anlamlı yığını 4'te DOYAR, ÖLÇÜ ise ağır basar. Ölçüsüz sürüm "props drawn 10-15%
  // overscale"i (Kütle'de 8/8 → 0/27 sapmasını doğuran tam cümle) bütçe dışına itiyordu:
  // altı farklı malzeme kelimesi sayan bir cümle 18 alırken sayı taşıyan kural 7 alıyordu.
  // Motor bir SAYIYA uyabilir; eş anlamlı yığınına uyamaz.
  score += Math.min(new Set((t.match(SPEC_RE) || []).map((w) => w.toLowerCase())).size, 4) * 3;
  if (NUMERIC_RE.test(t)) score += 6;
  if (META_RE.test(t)) score -= 6;
  const props = new Set((t.match(PROP_NOUN_RE) || []).map((n) => n.toLowerCase())).size;
  if (props > 1) score -= (props - 1) * 2;
  if (words(t) > 22) score -= 2;      // uzun bileşen bütçeyi yer, kilidi taşımaz
  if (words(t) < 3) score -= 3;       // tek kelimelik kırıntı ajanı yanıltır
  return score;
}

function buildStyle(world, register, brandTokens, notes) {
  const { physics, props } = splitRenderLawPhysics(world.render_law || '');
  // REAL register'ın zorunlu karşı-terimleri — motorun "parlak ticari plastik" varsayılanını
  // kıran tek madde (agents/promptQuality.mined.json → photoreal, VERBATIM alıntı).
  const realCounterTerms = (register === 'REAL' && MINED?.photoreal?.length)
    ? (/:\s*(.+?)\s*\(or equivalents/.exec(MINED.photoreal[0].text) || [])[1] || '' : '';
  const forbidden = [];      // render_law'ın yasak cümleleri → NEGATIVE'e taşınır
  const sources = [];
  const pushSentences = (list, tag) => {
    for (const s of list) {
      if (STILL_TEMPORAL_RE.test(s)) { notes.temporalDropped.push(s); continue; }
      sources.push({ tag, sentence: s });
    }
  };
  pushSentences(physics, 'render');
  pushSentences(splitLawSentences(world.line_grammar || ''), 'line');
  pushSentences(splitLawSentences(world.lens_grammar || ''), 'lens');
  if (!sources.length) {
    // renderLock() fallback zinciri — dünya metni boşsa register'ın kendi tabanı.
    const base = register === 'REAL'
      ? 'Photoreal live-action cinematic frame, real lens depth, practical light, authentic material response, no animation styling.'
      : 'Stylized animated frame, original IP-safe design with concrete lens, light, line and material rules.';
    notes.fallback = true;
    return { style: base, forbidden, kept: [], dropped: [], props };
  }

  const units = [];
  sources.forEach(({ tag, sentence }, si) => {
    toUnits(sentence).forEach((group, gi) => {
      // KÖK KUSUR (ilk koşuda ölçüldü): "Strictly forbid 2D cel shading, hard black outlines,
      // flat graphic fill, clay/plasticine surface texture on character skin." cümlesinde yalnız
      // İLK virgül maddesi yasak başını taşıyor. Bileşen bazlı bakınca kalan üçü yasak başını
      // kaybetti ve `clay/plasticine surface texture on character skin` STYLE'a POZİTİF EMİR
      // olarak girdi — dünyanın kendi 3. negatif maddesinin tam tersi.
      // Yasak kararı bu yüzden virgül maddesinde DEĞİL, EM-DASH/İKİ NOKTA SEGMENTİNDE verilir:
      // yasak-başlı segmentin bütün virgül maddeleri NEGATIVE'e gider (brain.ts:1702
      // `clauseIsImperative`), ama em-dash'in ötesindeki POZİTİF kuyruk STYLE'da kalır
      // (brain.ts:1730) — "No outlines — silhouette reads through lighting rim and value"
      // cümlesinde yasak da, o yasağın pozitif karşılığı da korunur.
      const segmentForbids = FORBID_LEAD_RE.test(group[0]);
      group.forEach((raw, ui) => {
        if (segmentForbids) { forbidden.push(raw); return; }
        const clean = scrubBrandTokens(raw, brandTokens, notes.brandScrubbed);
        if (!clean || words(clean) < 2) return;
        units.push({
          tag, order: si * 10000 + gi * 100 + ui, text: clean, score: scoreUnit(clean),
          mandatory: tag === 'render' && si === 0 && gi === 0 && ui === 0,
        });
      });
    });
  });

  // BÜTÇE PAYI — tek havuzda yarıştırınca render bileşenleri lens grameri­ni açlıktan öldürüyor
  // ve kare film stoğunu/odak uzunluğunu kaybediyor (Sürtünme'nin elle yazılmış bloğunda
  // dağılım ~62/10/30'du). Pay: render 50 · line 12 · lens 28 kelime; artan pay bir sonrakine akar.
  const QUOTA = { render: 50, line: 12, lens: 28 };
  // REAL karşı-terimleri bloğa SONRADAN eklenir ama bütçeye ÖNCEDEN yazılır — yoksa tavan
  // sessizce aşılır (ilk REAL koşusunda 100/90 çıktı).
  if (register === 'REAL' && realCounterTerms) QUOTA.render -= words(realCounterTerms);
  const chosen = [];
  // Gruplar arası tekrar kilidi: `product_brand_real`'de "50mm for context" hem render_law'da
  // hem lens_grammar'da yazılı ve blok aynı emri iki kez veriyordu.
  const seen = [];
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const isDuplicate = (u) => {
    const c = norm(u.text);
    return seen.some((s) => s === c || s.startsWith(c + ' ') || c.startsWith(s + ' '));
  };
  let spill = 0;
  for (const tag of ['render', 'line', 'lens']) {
    const pool = units.filter((u) => u.tag === tag);
    let budget = QUOTA[tag] + spill;
    const take = (u) => { chosen.push(u); seen.push(norm(u.text)); budget -= words(u.text); };
    for (const u of pool.filter((x) => x.mandatory)) take(u);
    for (const u of pool.filter((x) => !x.mandatory).sort((a, b) => b.score - a.score || a.order - b.order)) {
      if (words(u.text) <= budget && !isDuplicate(u)) take(u);
    }
    spill = Math.max(0, budget);
  }
  chosen.sort((a, b) => a.order - b.order);
  const dropped = units.filter((u) => !chosen.includes(u));

  // Kaynak grubuna göre cümlelendir: render · line · lens.
  const groups = ['render', 'line', 'lens']
    .map((tag) => chosen.filter((u) => u.tag === tag).map((u) => u.text).join(', '))
    .filter(Boolean)
    // Cümle başı büyütülür — ama YALNIZ düz bir sözcükse. "f/4 on mid-shots" ve "35mm to 50mm"
    // gibi teknik başlangıçlar aynen kalır; büyütmek onları motora yanlış token olarak verir.
    .map((s) => (/^[a-z]{3,}/.test(s) ? s[0].toUpperCase() + s.slice(1) : s))
    .map((s) => (/[.!?]$/.test(s) ? s : s + '.'));
  let style = groups.join(' ').replace(/\s{2,}/g, ' ').trim();

  if (realCounterTerms) { style += ` ${realCounterTerms}.`; notes.realCounterTerms = realCounterTerms; }
  return { style, forbidden, kept: chosen, dropped, props };
}

// ============================================================================
// 5) CLI
// ============================================================================

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function printList() {
  const byGroup = new Map();
  for (const w of DATA.worlds) {
    if (!byGroup.has(w.group)) byGroup.set(w.group, []);
    byGroup.get(w.group).push(w);
  }
  for (const [group, list] of byGroup) {
    process.stdout.write(`\n${group}  (${list.length})\n`);
    for (const w of list) {
      process.stdout.write(`  ${w.id.padEnd(28)} ${registerOfPath(w.group).padEnd(5)} ${w.name}\n`);
    }
  }
  process.stdout.write(`\nTOPLAM ${DATA.worlds.length} dünya · ${(DATA.palettes || []).length} palet\n`);
  if ((DATA.palettes || []).length) {
    process.stdout.write(`Paletler: ${DATA.palettes.map((p) => p.id).join(', ')}\n`);
  }
  process.stdout.write('\nKullanım: node scripts/dunya-kilidi.mjs <worldId> [--register=edu|real|sty] [--palet=<id>]\n');
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--liste') || argv.includes('--list')) { printList(); return 0; }

  const flags = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }));
  const worldId = argv.find((a) => !a.startsWith('--'));
  if (!worldId) {
    warn('KULLANIM: node scripts/dunya-kilidi.mjs <worldId> [--register=edu|real|sty] [--palet=<id>]');
    warn('          node scripts/dunya-kilidi.mjs --liste');
    return 2;
  }

  const world = DATA.worlds.find((w) => w.id === worldId);
  if (!world) {
    warn(`HATA: "${worldId}" diye bir dünya YOK (${DATA.worlds.length} dünya var).`);
    const near = DATA.worlds
      .map((w) => ({ id: w.id, d: levenshtein(worldId.toLowerCase(), w.id.toLowerCase()) }))
      .sort((a, b) => a.d - b.d).slice(0, 3);
    warn('En yakın 3 öneri:');
    for (const n of near) warn(`  ${n.id}`);
    warn('Tam liste: node scripts/dunya-kilidi.mjs --liste');
    return 2;
  }

  const natural = registerOfPath(world.group);
  const register = flags.register ? T(flags.register).toUpperCase() : natural;
  if (!['EDU', 'REAL', 'STY'].includes(register)) {
    warn(`HATA: bilinmeyen register "${flags.register}" — edu | real | sty`);
    return 2;
  }

  let palette;
  if (flags.palet) {
    palette = (DATA.palettes || []).find((p) => p.id === flags.palet);
    if (!palette) {
      warn(`HATA: "${flags.palet}" diye bir palet YOK. Mevcut: ${(DATA.palettes || []).map((p) => p.id).join(', ')}`);
      return 2;
    }
  }

  const notes = { brandScrubbed: new Set(), temporalDropped: [], fallback: false, realCounterTerms: '' };
  const brandTokens = brandTokensFor(world);
  const { style, forbidden, kept, dropped, props } = buildStyle(world, register, brandTokens, notes);

  const lightRaw = paletteLightPrompt(palette, world);
  const light = scrubBrandTokens(lightRaw, brandTokens, notes.brandScrubbed);

  const diagrammatic = WORLD_DRAWS_DIAGRAMS_RE.test(`${worldRenderText(world)} ${T(world.light_law)}`);
  // render_law'ın yasak maddeleri NEGATIVE'e taşınırken her biri kendi "NO" başını alır —
  // "NO 2D cel shading; hard black outlines; flat graphic fill" listesinde başsız maddeler
  // motora POZİTİF sipariş gibi okunur.
  // Her madde tek bir yasak başına indirgenir: "Strictly forbid X" / "Never a X" / başsız
  // enumerasyon kuyruğu → hepsi "NO X". Artikel düşer ("NO a flat sky" dilbilgisi kusuruydu),
  // liste tek dilde okunur — karışık "never …; No …; NO …" motorun okumasını zayıflatıyordu.
  const forbidItems = forbidden.map((f) => {
    const core = f.trim()
      .replace(/^(?:strictly\s+)?forbids?\s+/i, '')
      .replace(/^(?:no|not|never|avoid)\s+/i, '')
      .replace(/^(?:a|an|the)\s+/i, '')
      .trim();
    return core ? `NO ${core}` : '';
  }).filter(Boolean);
  const negative = scrubImageNegatives([worldAvoidText(world)], diagrammatic, forbidItems);

  // ---- stdout: yapıştırmaya hazır kuyruk, başka hiçbir şey ----
  process.stdout.write(`STYLE: ${style}\n`);
  process.stdout.write(`LIGHT AND PALETTE: ${light}\n`);
  process.stdout.write(`NEGATIVE: ${negative}\n`);

  // ---- stderr: ölçüm ve uyarılar ----
  const styleWords = words(style);
  warn('');
  warn(`── ${world.id} · ${world.name}`);
  warn(`   register: ${register}${register !== natural ? `  ⚠ dünyanın doğal register'ı ${natural} — §2R'ye göre slot dolgusu DEĞİŞİR` : ''}`);
  warn(`   palet   : ${palette ? palette.id : 'world.palette_lock (varsayılan)'}`);
  warn(`   STYLE   : ${styleWords} kelime (tavan ${STYLE_WORD_CAP}) ${styleWords > STYLE_WORD_CAP ? '⚠ TAVAN AŞILDI — kesilmedi, uyarıldı' : '✓'}`);
  warn(`   LIGHT   : ${words(light)} kelime · NEGATIVE: ${words(negative)} kelime`);
  warn(`   seçilen : ${kept.length} bileşen · elenen: ${dropped.length} (bütçe dışı)`);

  const hex = `${style} ${light} ${negative}`.match(HEX_RE);
  if (hex) warn(`   ⚠ HAM HEX SIZDI: ${Array.from(new Set(hex)).join(', ')} — Palette Translation Law ihlali, çıktıyı KULLANMA`);
  else warn('   ✓ ham hex yok (Palette Translation Law)');

  if (notes.brandScrubbed.size) warn(`   ✓ marka/stüdyo adı söküldü: ${Array.from(notes.brandScrubbed).join(', ')}`);
  if (notes.realCounterTerms) warn(`   ✓ REAL karşı-terimleri eklendi: ${notes.realCounterTerms}`);
  if (notes.fallback) warn('   ⚠ dünyanın render_law/grammar metni BOŞ — register tabanı basıldı, dünya kilidi YOK');
  // `props` boş bir dizi olduğunda da truthy — uyarı 46 dünyanın 46'sında basılıyor ve içi boş
  // ("…"). Ölçüldü 2026-07-29: bu gürültü "her dünyada prop sızıntısı var" gibi YANLIŞ bir
  // kütüphane karnesi doğurdu. Uyarı ancak gerçekten ayıklanan metin varsa basılır.
  const propMetin = (props ?? []).join(' ').trim();
  if (propMetin) warn(`   ℹ render_law prop envanteri STYLE dışında tutuldu (kareye sızardı): "${propMetin.slice(0, 90)}…"`);
  if (notes.temporalDropped.length) warn(`   ℹ ${notes.temporalDropped.length} kadans cümlesi STYLE dışında (MOTION'a ait)`);
  if (forbidden.length) warn(`   ℹ render_law'ın ${forbidden.length} yasak cümlesi NEGATIVE'e taşındı`);

  // REAL'in ölçülmüş kütüphane boşluğu (PROMPT-YASASI §2R): dünya metni diyaframı yazıyor,
  // KARANLIĞI yazmıyor. Ref seçilmezse REAL dünya gölgesini kaybeder.
  if (register === 'REAL') {
    const covered = `${worldRenderText(world)} ${T(world.light_law)} ${style}`;
    const missing = ['negative fill', 'contrast ratio', 'black point'].filter((k) => !new RegExp(k, 'i').test(covered));
    if (missing.length) warn(`   ⚠ REAL boşluğu (§2R): dünya KARANLIĞI yazmıyor → ${missing.join(', ')}. Ref seçmezsen kareye ELLE yaz.`);
  }
  // \b zorunlu: sınırsız /ten/ "intensity" içinde eşleşiyordu ve uyarı hiç ateşlemiyordu.
  if (register !== 'REAL' && !/\b(?:skin|complexion)\b/i.test(style)) {
    warn("   ℹ STYLE ten kilidini taşımıyor — [3 KİMLİK] slotunda 'warm matte tan skin, low specular' ayrıca yazılmalı (§2).");
  }
  if (dropped.length) {
    warn('   ── bütçe dışı kalan bileşenler (gerekiyorsa kareye ELLE ekle):');
    for (const d of dropped.slice(0, 8)) warn(`      · [${d.tag} ${d.score}] ${d.text.slice(0, 110)}`);
    if (dropped.length > 8) warn(`      · … +${dropped.length - 8} bileşen daha`);
  }
  warn('');
  return 0;
}

process.exit(main());
