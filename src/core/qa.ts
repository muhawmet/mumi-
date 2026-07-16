import type { StudioState } from '../store/useStudioStore';
import { DATA, effectiveMaterialId, deriveProductionPath, materialClauseOf, pathContract } from './pure';
import { registerOf, renderLock, stripTemporalForStill, scrubHumanTokens, hexToLightWords, reconcileAspectRatio, type Register } from './brain';

export type SkillId =
  | 'visual_calculus' | 'conceptualization' | 'drama' | 'encyclopedia'
  | 'inland_empire' | 'prompt_surgeon' | 'volition';
export const PROMPT_SURGEON: SkillId = 'prompt_surgeon';

export interface QATip {
  skill: SkillId;
  level: 'Trivial' | 'Easy' | 'Medium' | 'Challenging' | 'Legendary' | 'Godly';
  success: boolean;
  text: string;
  evidence: string[];
  sceneIds?: number[];
}

// A failing voice only blocks export when its level is Medium or above — Easy/Trivial
// misses stay advisory. The QA screen gates the export button on this; VOLITION reuses
// the same predicate so the "ready to fire" verdict and the button never disagree.
const BLOCKING_LEVELS: ReadonlyArray<QATip['level']> = ['Medium', 'Challenging', 'Legendary', 'Godly'];

export function exportGateStatus(tips: QATip[]): { blocked: boolean; blocking: QATip[] } {
  const blocking = tips.filter((t) => !t.success && BLOCKING_LEVELS.includes(t.level));
  return { blocked: blocking.length > 0, blocking };
}

// ==================== PROMPT SURGEON (deterministic prompt linting) ====================

// Alternatifler UZUNDAN KISAYA: 6'lı alternatif önce eşleşirse #RRGGBBAA'nın ilk
// 6 hanesini yer, kalan alfa word-char'ları \b'yi bozar → 8-haneli hiç yakalanmazdı.
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
// SLOP genişletme sınırı (korpus taramasıyla doğrulandı): bare 'cinematic/dynamic/epic/octane'
// EKLENEMEZ — ref isimleri ('Cinematic Deep-Focus Geometry'), palet adları ('Golden Dust Epic'),
// render_law metinleri ve engine grammar'ları ('Veo cinematic grammar', 'dynamic clarity')
// prompt yoluna meşru olarak giriyor. Sadece compound kalıplar yasak.
const SLOP_RE = /\b(masterpiece|ultra[- ]?detailed|award[- ]?winning|8k|4k|trending on artstation|best quality|highly detailed|stunning|breathtaking|jaw[- ]?dropping|mind[- ]?blowing|ultra[- ]?realistic|hyper[- ]?realistic|octane render|unreal engine|cinematic (?:lighting|shot|feel|look|quality|masterpiece)|dynamic (?:lighting|shot|angle|pose|composition)|epic (?:scale|shot|scene|lighting))\b/gi;
const LIGHT_CUE_RE = /light|lighting|glow|shadow|lit\b/i;
const CAMERA_CUE_RE = /camera|lens|angle|shot|frame[d]?|close-up|wide|macro/i;
const TRIGGER_RE = /\b(ready to|suddenly|then,|begins to|starts to|transforms?|appears?)\b/gi;

// Palette Translation Law çevirisi TEK kaynaktan konuşur: brain.hexToLightWords.
// (Eski qa-yerel hexToPhysical duplikesi silindi — iki sözlük ayrışınca QA'nın FIX
// satırı ile prompt'taki gerçek palet dili farklı kelimeler söylüyordu.)

// RENDER-LOCK EXEMPTION — input shape note:
// qa.ts receives the full StudioState, so the render-lock text IS reconstructable:
// state.selectedWorldId → DATA.worlds, plus deriveProductionPath(projectClass) →
// registerOf(path) and materialClauseOf(selectedPropId, world) — the exact same
// call chain pure.ts uses when it prepends renderLock() to every imagePrompt.
// We therefore rebuild that verbatim block and STRIP it from imagePrompt before
// hex-scanning (option A from the spec); the 'Light/Palette lines only' fallback
// is not needed. If the world is missing the lock is '' and nothing is stripped.
export function renderLockTextFor(state: StudioState): string {
  const world = DATA.worlds.find((w) => w.id === state.selectedWorldId);
  if (!world) return '';
  const path = deriveProductionPath(state.projectClass || '');
  const register = registerOf(path);
  const materialClause = register === 'REAL' ? '' : materialClauseOf(state.selectedPropId, world);
  // Mirror buildImagePrompt's still-frame transforms so the reconstructed block matches
  // the lock text actually embedded in imagePrompt: R11 temporal strip (always),
  // the path's framing contract overriding the world ratio, and R5 castless human-token
  // scrub (no-cast REAL/EDU registers). Miss one and QA validates text no engine ever saw.
  let lock = reconcileAspectRatio(
    stripTemporalForStill(renderLock(world, register, materialClause || undefined)),
    pathContract(path)?.required,
  );
  const castless = register !== 'STY' && !String(state.cast || '').trim();
  if (castless) lock = scrubHumanTokens(lock);
  return lock;
}

// Motion-prompt muafiyet soyucusu (CHECK 2 slop + CHECK 4 trigger ortak kullanır):
// NEGATIVE: satırı ve 'Engine grammar (' cümlesi taramadan düşer — ikisi de yasak
// kelimeleri PROHİBİSYON olarak meşru şekilde adlandırır (motor yasası, model çıktısı değil).
function stripExemptMotionLines(motionPrompt: string): string {
  return (motionPrompt || '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('NEGATIVE:'))
    .map((line) => line.replace(/Engine grammar \([^)]*\):.*?(?=Everything not named|$)/, ''))
    .join('\n');
}

function negativeItemsOf(motionPrompt: string): string[] {
  const negLine = (motionPrompt || '').split('\n').map((l) => l.trim()).find((l) => l.startsWith('NEGATIVE:'));
  if (!negLine) return [];
  return negLine.slice('NEGATIVE:'.length).split(',').map((i) => i.trim().replace(/\.+$/, '')).filter(Boolean);
}

function quote(t: string, cap = 60): string {
  const s = (t || '').trim();
  return s.length > cap ? s.slice(0, cap) + '…' : s;
}

// FIX-6b: whitespace-normalize for comparison only (\s+→space, trim, lowercase).
// Used so a raw '\n'-carrying merged beat matches its SRC_LINE-normalized prompt form.
const normWS = (t: string): string => (t || '').replace(/\s+/g, ' ').trim().toLowerCase();

// KÖK (T5 FIX-4): drama süre eşiği register-agnostik olarak EDU-hızlı pacing'e (Önerilen <4s)
// göreydi → STY/REAL sinematik pacing (4.5-8s, VO-senkron, Kling temiz penceresine doğru) hep
// "Tempo ölüyor" → volition'ı HAKSIZ blokluyordu. Eşikler register-aware: EDU hızlı kalır,
// STY/REAL cinematic hold'a izin verir (avg + ekstrem üst sınır engine penceresine oranlı).
const DRAMA_LIMITS: Record<Register, { avg: number; hi: number; lo: number }> = {
  EDU: { avg: 4, hi: 8, lo: 1.5 },
  STY: { avg: 8.5, hi: 12, lo: 1.5 },
  REAL: { avg: 8.5, hi: 12, lo: 1.5 },
};

export function evaluateDirectorCabinet(state: StudioState): QATip[] {
  const tips: QATip[] = [];
  const scenes = state.scenes || [];
  if (scenes.length === 0) return tips;
  const register = registerOf(deriveProductionPath(state.projectClass || ''));
  const dramaLimit = DRAMA_LIMITS[register];

  // 1. VISUAL CALCULUS
  let vcSuccess = true;
  const vcEvidence: string[] = [];
  const vcSceneIds = new Set<number>();
  let consecutiveCount = 1;
  let currentVantage = '';
  let maxConsecutiveVantage = 0;
  let maxConsecutiveVantageName = '';
  let wideCount = 0;
  const unreadableTextScenes: number[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const vantage = s.architecture?.imageVantage?.toLowerCase() || '';
    if (vantage === currentVantage && vantage !== '') {
      consecutiveCount++;
      if (consecutiveCount >= 3) {
        if (consecutiveCount > maxConsecutiveVantage) {
            maxConsecutiveVantage = consecutiveCount;
            maxConsecutiveVantageName = s.architecture.imageVantage;
        }
      }
    } else {
      currentVantage = vantage;
      consecutiveCount = 1;
    }
    if (vantage.includes('wide') || vantage.includes('geniş')) wideCount++;
    if (s.onScreenText && s.durationSec < 2.5) unreadableTextScenes.push(s.id);
  }

  if (maxConsecutiveVantage >= 3) {
    vcSuccess = false;
    vcEvidence.push(`Aynı vantage (${maxConsecutiveVantageName.substring(0, 30)}...) ${maxConsecutiveVantage} ardışık sahnede kullanılmış.`);
  }
  if (wideCount > scenes.length / 2) {
    vcSuccess = false;
    vcEvidence.push(`Sahnelerin %${Math.round((wideCount / scenes.length) * 100)}'si geniş açı. Odak kaybı riski.`);
  }
  if (unreadableTextScenes.length > 0) {
    vcSuccess = false;
    vcEvidence.push(`Sahne ${unreadableTextScenes.join(', ')}: Ekranda yazı var ama süre 2.5s altında (okunamaz).`);
    unreadableTextScenes.forEach(id => vcSceneIds.add(id));
  }
  if (vcSuccess) {
    vcEvidence.push(`Matematik kusursuz. Geniş açı oranı %${Math.round((wideCount / scenes.length) * 100)}. Okunabilirlik sorunu yok.`);
    tips.push({ skill: 'visual_calculus', level: 'Medium', success: true, text: "Optikler hizalandı. Lens ve kompozisyon hesaplamaları render motoru için optimal aralıkta seyrediyor.", evidence: vcEvidence });
  } else {
    tips.push({ skill: 'visual_calculus', level: 'Challenging', success: false, text: "Hesaplamalarımda bir hata seziyorum. Kadraj tekrarları ve açı matematiğinde vizyon kaybı riskimiz var. Verileri tekrar kontrol et.", evidence: vcEvidence, sceneIds: Array.from(vcSceneIds) });
  }

  // 2. CONCEPTUALIZATION
  const genericPhrases = ["concept model", "teaching mechanism", "proof stage", "circuit board", "place-value board", "kavram", "genel", "soyut model"];
  let cSuccess = true;
  const cEvidence: string[] = [];
  const cSceneIds = new Set<number>();
  const subjectCounts: Record<string, number> = {};

  scenes.forEach(s => {
    // BRAIN M3: dominantSubject/event kalktı — ikisi de zaten verbatim beat'in kopyasıydı.
    const text = (s.architecture?.exactSourceBeat || '').toLowerCase();
    const foundPhrases = genericPhrases.filter(p => text.includes(p));
    if (foundPhrases.length > 0) {
      cSuccess = false;
      cEvidence.push(`Sahne ${s.id}: Jenerik tabir bulundu (${foundPhrases.join(', ')}).`);
      cSceneIds.add(s.id);
    }
    const subject = s.architecture?.exactSourceBeat || '';
    if (subject) subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });
  for (const [sub, count] of Object.entries(subjectCounts)) {
    if (count >= 4) {
      cSuccess = false;
      cEvidence.push(`'${sub.substring(0, 30)}...' öznesi ${count} sahnede tekrar ediyor.`);
    }
  }
  if (cSuccess) {
    cEvidence.push("Hiçbir jenerik tabir bulunmadı.", "Özneler yeterli varyasyona sahip.");
    tips.push({ skill: 'conceptualization', level: 'Challenging', success: true, text: "Metaforlar saf, vizyon bulanıklaşmamış! Konseptin sanatsal bütünlüğü ve dünya kuralları arasındaki uyum tek kelimeyle harika.", evidence: cEvidence });
  } else {
    tips.push({ skill: 'conceptualization', level: 'Challenging', success: false, text: "Bu bir sanat eseri mi yoksa jenerik bir stok videosu mu? Konseptte tekrara düşüyoruz, sanatsal kimliğimizi kaybedemeyiz!", evidence: cEvidence, sceneIds: Array.from(cSceneIds) });
  }

  // 3. DRAMA
  let dSuccess = true;
  const dEvidence: string[] = [];
  const dSceneIds = new Set<number>();
  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSec || 3), 0);
  const avgDuration = totalDuration / scenes.length;

  if (avgDuration > dramaLimit.avg) {
    dSuccess = false;
    dEvidence.push(`Ortalama süre çok yüksek: ${avgDuration.toFixed(1)}s (Önerilen < ${dramaLimit.avg}s).`);
  } else dEvidence.push(`Ortalama süre sağlıklı: ${avgDuration.toFixed(1)}s.`);

  scenes.forEach(s => {
    if (s.durationSec > dramaLimit.hi || s.durationSec < dramaLimit.lo) {
      dSuccess = false;
      dEvidence.push(`Sahne ${s.id}: Ekstrem süre (${s.durationSec}s).`);
      dSceneIds.add(s.id);
    }
  });
  let consecutiveDurCount = 1;
  let currentDur = -1;
  let currentDurStartScene = -1;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (s.durationSec === currentDur) {
      consecutiveDurCount++;
      if (consecutiveDurCount >= 5 && i === scenes.length -1) {
         dSuccess = false;
         dEvidence.push(`Sahne ${currentDurStartScene}-${s.id}: ${consecutiveDurCount} sahne boyunca aynı süre (${currentDur}s).`);
      }
    } else {
      if (consecutiveDurCount >= 5) {
         dSuccess = false;
         dEvidence.push(`Sahne ${currentDurStartScene}-${scenes[i-1].id}: ${consecutiveDurCount} sahne boyunca aynı süre (${currentDur}s).`);
      }
      currentDur = s.durationSec;
      consecutiveDurCount = 1;
      currentDurStartScene = s.id;
    }
  }
  if (dSuccess) {
    tips.push({ skill: 'drama', level: 'Easy', success: true, text: "Ritim şahane! Aksiyon eğrisi ve kesmeler izleyiciyi tam kıvamında avcunun içine alıyor. Sire, bu bir başyapıt olacak!", evidence: dEvidence });
  } else {
    tips.push({ skill: 'drama', level: 'Challenging', success: false, text: "Sire! Tempo ölüyor! İzleyici sıkılıp gidecek. Pacing (süreler) konusunda çok tehlikeli sulardayız, acil ritim müdahalesi gerekiyor!", evidence: dEvidence, sceneIds: Array.from(dSceneIds) });
  }

  // 4. ENCYCLOPEDIA
  let eSuccess = true;
  const eEvidence: string[] = [];
  // Coverage TEK BAŞINA bütünlük kanıtı değil: sourceIntegrity() bozuk kaynakta
  // coverage'ı bir UZUNLUK ORANINA düşürür (reconstructed.length/rawVault.length),
  // yani aynı uzunlukta bambaşka bir metin %100 okur. Bütünlüğün otoritesi
  // ok/hash eşitliğidir; coverage sadece "ne kadarı eksik" göstergesidir.
  const report = state.sourceReport;
  const coverage = report?.coverage ?? 0;
  const integrityOk = !!report && report.ok && report.rawHash === report.reconHash;
  if (!integrityOk) {
    eSuccess = false;
    eEvidence.push(
      report
        ? `Kaynak bütünlüğü bozuk — hash uyuşmuyor (raw ${report.rawHash} ≠ recon ${report.reconHash}); coverage %${coverage} yanıltıcı.`
        : `Kaynak raporu yok — bütünlük kanıtlanamıyor.`,
    );
  } else eEvidence.push(`Kaynak bütünlüğü %${coverage}.`);

  if (scenes.length !== state.sceneCount) { eSuccess = false; eEvidence.push(`Sahne sayısı uyumsuz: State(${state.sceneCount}) vs Bundle(${scenes.length}).`); }
  else eEvidence.push(`Sahne sayısı senkronize: ${scenes.length}.`);

  if (!state.selectedWorldId) { eSuccess = false; eEvidence.push(`Dünya seçilmemiş (selectedWorldId eksik).`); }
  else eEvidence.push(`Dünya seçili: ${state.selectedWorldId}.`);

  const world = DATA.worlds.find(w => w.id === state.selectedWorldId);
  const effectiveMat = world ? effectiveMaterialId(world, state.selectedPropId) : state.selectedPropId;
  if (state.selectedPropId && state.selectedPropId !== 'none' && state.selectedPropId !== 'native_world') {
    if (effectiveMat !== state.selectedPropId) {
        eSuccess = false;
        eEvidence.push(`Materyal (${state.selectedPropId}) mevcut dünya (${state.selectedWorldId}) ile uyumsuz. 'none' olmalı.`);
    } else {
        eEvidence.push(`Materyal uyumu doğrulandı (${state.selectedPropId}).`);
    }
  } else eEvidence.push(`Ekstra materyal kısıtlaması yok.`);

  if (eSuccess) {
    tips.push({ skill: 'encyclopedia', level: 'Easy', success: true, text: "Sistem veritabanı temiz. Tüm protokoller, Render Lock kilitleri ve export önkoşulları eksiksiz bir şekilde sağlandı.", evidence: eEvidence });
  } else {
    tips.push({ skill: 'encyclopedia', level: 'Challenging', success: false, text: "Kritik İhlal! Protokoller eksik. Render motoru bu konfigürasyonu reddedecek. Sistem bütünlüğü tehlikede.", evidence: eEvidence });
  }

  // 5. INLAND EMPIRE
  const ieEvidence: string[] = [];
  const thirdIndex = Math.floor(scenes.length * 0.66);
  const climaxScenes = scenes.slice(thirdIndex);
  let longestScene = climaxScenes[0] || scenes[scenes.length - 1];
  if (climaxScenes.length > 0) longestScene = climaxScenes.reduce((prev, curr) => (curr.durationSec > prev.durationSec) ? curr : prev, climaxScenes[0]);

  if (longestScene && longestScene.architecture?.exactSourceBeat) {
      ieEvidence.push(`Final 1/3'teki en uzun sahne (Sahne ${longestScene.id}, ${longestScene.durationSec}s) analiz edildi.`);
      ieEvidence.push(`Odak: ${longestScene.architecture.exactSourceBeat}`);
      tips.push({ skill: 'inland_empire', level: 'Legendary', success: true, text: `Neden kamera sadece etrafı izliyor? O "${longestScene.architecture.exactSourceBeat}" var ya... Belki de ona çok daha karanlık, çok daha ruhani bir açıdan yaklaşmalıyız. Nesnelerin cansızlığına bir ruh üfle.`, evidence: ieEvidence, sceneIds: [longestScene.id] });
  } else {
      ieEvidence.push("Climax/Son üçte bir bölümünde geçerli bir sahne bulunamadı.");
      tips.push({ skill: 'inland_empire', level: 'Legendary', success: false, text: "Gözlerim karanlıkta hiçbir şey göremiyor. Ruh yok. Bağ kuracak bir nesne bile yok.", evidence: ieEvidence });
  }

  // 6. PROMPT SURGEON — lints the prompts themselves. Six deterministic checks;
  // medium findings block (VOLITION reads Medium+ failures), low findings warn only.
  {
    const psEvidence: string[] = [];
    const psSceneIds = new Set<number>();
    let psHasMedium = false;
    let psHasLow = false;
    const lockText = renderLockTextFor(state);

    // CHECK 6 collection — the MOTION BODY that actually reaches the engine.
    // ÖLÜ KOD DÜZELTMESİ (T5): CHECK 6/6b eskiden 'Moving element:' / 'Event:'
    // etiketlerini arıyordu. FAZ2'de banka söküldü — buildMotionPrompt bu etiketleri
    // ARTIK HİÇ BASMIYOR (brain.test.ts bunu ayrıca garanti eder). İki regex de hiçbir
    // gerçek çıktıyla eşleşmiyordu; check'ler yalnızca elle yazılmış fixture'larla
    // yeşil tutuluyordu. Check'in NİYETİ (sahneler arası klon/monoton motion) geçerli
    // ve ÖLÇÜLDÜ: rawSource'suz (topic-only, store default) bir batch'te 30 dünyanın
    // 27'si ≥2 sahnede BİREBİR AYNI motion gövdesi basıyor; sağlıklı N-beat senaryoda
    // 0/30. Bu yüzden niyet, gerçek yüzeye kablolandı.
    //
    // Sahne adresi ('[3] ') içerik değil — motoru ayırt eden şey gövdedir. Adres
    // soyulmazsa iki birebir aynı talimat sırf numarası farklı diye 'farklı' görünür.
    const bodyByScene: Array<{ id: number; text: string }> = [];
    // CHECK 6b collection — the source beat each motion prompt CARRIES verbatim
    // ('Motion brief (Claude yazar): source beat "..."'). Bu, sitenin YAZMADIĞI tek
    // girdi: Mami'nin senaryosu. Kök neden buradadır — iki sahne aynı beat'i taşıyorsa
    // kamera havuzu tesadüfen ayırsa bile iki plan aynı olayı anlatır.
    const beatByScene: Array<{ id: number; text: string }> = [];

    for (const s of scenes) {
      const img = s.imagePrompt || '';
      const mot = s.motionPrompt || '';
      // The render-lock block is a verbatim contract and MAY contain hex — strip it first.
      const imgSansLock = lockText ? img.split(lockText).join(' ') : img;

      // CHECK 1 — HEX LEAK (medium): raw hex violates the Palette Translation Law.
      const hexHits = [...(imgSansLock.match(HEX_RE) || []), ...(mot.match(HEX_RE) || [])];
      if (hexHits.length > 0) {
        psHasMedium = true;
        psSceneIds.add(s.id);
        const uniq = Array.from(new Set(hexHits));
        psEvidence.push(`Sahne ${s.id}: Ham hex sızıntısı — ${uniq.map((h) => `'${h}'`).join(', ')} (render lock dışında). Motorlar hex okumaz.`);
        psEvidence.push(`FIX (Sahne ${s.id}): ${uniq.map((h) => `'${h}' → '${hexToLightWords(h)} light'`).join('; ')} — fiziksel ışık dili olarak yaz.`);
      }

      // CHECK 2 — AI-SLOP STACKING (medium): banned filler tokens in either prompt.
      // The prompts' own Negative/NEGATIVE lines legitimately NAME slop tokens in
      // order to forbid them ("empty adjectives (cinematic, dynamic, stunning, 4K)")
      // — prohibition lines are exempt from the slop scan.
      // Image: render-lock bloğu (CHECK 1 ile aynı muafiyet) + 'Negative: ' kuyruğu taranmaz.
      const slopScanImg = imgSansLock.split(/\bNegative:\s/)[0];
      // Motion: NEGATIVE satırı + Engine grammar cümlesi taranmaz (CHECK 4 ile ortak soyucu).
      const slopScanMot = stripExemptMotionLines(mot);
      const slopHits = Array.from(new Set([...(slopScanImg.match(SLOP_RE) || []), ...(slopScanMot.match(SLOP_RE) || [])].map((t) => t.toLowerCase())));
      if (slopHits.length > 0) {
        psHasMedium = true;
        psSceneIds.add(s.id);
        psEvidence.push(`Sahne ${s.id}: AI-slop dolgu tespit edildi — ${slopHits.map((t) => `'${t}'`).join(', ')}.`);
        psEvidence.push(`FIX (Sahne ${s.id}): ${slopHits.map((t) => `'${t}'`).join(', ')} token'larını sil — kalite iddia edilmez, ışık/lens/doku ile gösterilir.`);
      }

      // CHECK 3 — TRIAD (imagePrompt only, medium): subject line + light cue + camera cue.
      // FIX-6b: the subject (architecture.exactSourceBeat = raw beatText) may carry
      // internal '\n' from a merged multi-sentence autoGroupBeats beat, while the img
      // injects the SRC_LINE-normalized (\s+→space) form (FIX-6). Comparing raw-vs-normalized
      // makes includes() falsely fail → phantom "özne eksik" → surgeon blocks volition.
      // Normalize whitespace on BOTH sides for the match (display/byte integrity untouched).
      const subject = (s.architecture?.exactSourceBeat || '').trim();
      const hasSubject = /dominant element\s*:/i.test(img) || (subject !== '' && normWS(img).includes(normWS(subject)));
      const missing: string[] = [];
      if (!hasSubject) missing.push("özne ('Dominant element' / konsept öznesi)");
      if (!LIGHT_CUE_RE.test(img)) missing.push('ışık cue');
      if (!CAMERA_CUE_RE.test(img)) missing.push('kamera cue');
      if (missing.length > 0) {
        psHasMedium = true;
        psSceneIds.add(s.id);
        psEvidence.push(`Sahne ${s.id}: Triad eksik — ${missing.join(', ')}. Mevcut prompt: "${quote(img)}"`);
        const fixLines: string[] = [];
        if (!hasSubject) fixLines.push(`"Dominant element: ${subject || '<konsept öznesi>'}."`);
        if (!LIGHT_CUE_RE.test(img)) fixLines.push('"Light: single motivated key light, soft falloff, grounded shadows."');
        if (!CAMERA_CUE_RE.test(img)) fixLines.push('"Camera/vantage: 35mm eye-level medium shot."');
        psEvidence.push(`FIX (Sahne ${s.id}): imagePrompt'a ekle → ${fixLines.join(' + ')}`);
      }

      // CHECK 4 — TRIGGER-WORD RESIDUE (motionPrompt only, low): i2v trigger words
      // that klingScrub should have removed. NEGATIVE: and 'Engine grammar (' excluded.
      const triggerHits = Array.from(new Set((stripExemptMotionLines(mot).match(TRIGGER_RE) || []).map((t) => t.toLowerCase())));
      if (triggerHits.length > 0) {
        psHasLow = true;
        psSceneIds.add(s.id);
        psEvidence.push(`Sahne ${s.id}: i2v tetik kelimesi kalıntısı — ${triggerHits.map((t) => `'${t}'`).join(', ')}.`);
        psEvidence.push(`FIX (Sahne ${s.id}): motion prompt'tan sil: ${triggerHits.map((t) => `'${t}'`).join(', ')} — eylemi düz şimdiki zamanda, tek sürekli hareket olarak yaz.`);
      }

      // CHECK 6 collection — motion body with the scene address ('[3] ') stripped.
      if (mot.trim()) {
        bodyByScene.push({ id: s.id, text: mot.replace(/^\[[^\]]*\]\s*/, '').trim().toLowerCase() });
      }

      // CHECK 6b collection — the source beat carried verbatim inside the motion brief.
      // KAPSAM: yalnızca GERÇEK bir kaynak varsa. Mami henüz senaryo girmediyse pure.ts
      // durumu açıkça 'UNSOURCED_TOPIC_INPUT' ilan eder ve tek konu cümlesini her sahneye
      // kopyalar — bu TASARIM GEREĞİ, ve kaynak katmanı (conceptualization/encyclopedia)
      // zaten bunu bildirip export'u blokluyor. Orada beat tekrarını 'monoton motion' diye
      // ikinci kez suçlamak, eksik senaryoyu motion'ın günahı gibi göstermek olur.
      const sourced = s.architecture?.source?.status !== 'UNSOURCED_TOPIC_INPUT';
      const beatMatch = mot.match(/source beat "(.*?)"/);
      if (sourced && beatMatch && beatMatch[1].trim()) {
        beatByScene.push({ id: s.id, text: beatMatch[1].trim().toLowerCase() });
      }

      // CHECK 5 — NEGATIVE BLOAT (motionPrompt, low): duplicate items or >18 items.
      const negItems = negativeItemsOf(mot);
      if (negItems.length > 0) {
        const seen = new Set<string>();
        const dupes = new Set<string>();
        const deduped: string[] = [];
        for (const item of negItems) {
          const key = item.toLowerCase();
          if (seen.has(key)) dupes.add(item.toLowerCase());
          else { seen.add(key); deduped.push(item); }
        }
        if (dupes.size > 0) {
          psHasLow = true;
          psSceneIds.add(s.id);
          psEvidence.push(`Sahne ${s.id}: NEGATIVE satırında mükerrer madde — ${Array.from(dupes).map((d) => `'${d}'`).join(', ')}.`);
          psEvidence.push(`FIX (Sahne ${s.id}): NEGATIVE: ${deduped.join(', ')}.`);
        }
        if (negItems.length > 18) {
          psHasLow = true;
          psSceneIds.add(s.id);
          psEvidence.push(`Sahne ${s.id}: NEGATIVE şişkin — ${negItems.length} madde (limit 18). Motor uzun listeyi sular, sinyal kaybolur.`);
          psEvidence.push(`FIX (Sahne ${s.id}): NEGATIVE: ${deduped.slice(0, 18).join(', ')}.`);
        }
      }
    }

    // Near-clone çekirdeği: SADECE noktalama/boşluk düzlenir. HARFLER KORUNUR.
    //
    // İKİ TUZAK, ÖLÇÜLEREK KAPATILDI (T5 — denetçi ajan yakaladı):
    // (1) PARANTEZ SOYMA YOK. Eski check parantez içini komple siliyordu (ölü TR-graft
    //     kırıntıları "(kayp)/(pusulann)" içindi). Bugün prompt yolunda böyle bir kırıntı
    //     YOK — pure.ts'in '(Gelişim Evresi N)' etiketi bile motion/image prompt'a hiç
    //     ulaşmıyor (ölçüldü: 0/8 sahne; pure.ts exactSourceBeat'i ham exactText'ten
    //     verbatim taşıyor — M3'te ad dürüstleşti, davranış aynı). Buna karşılık parantez soymak İNSAN AYRIMINI siliyordu:
    //     "Kubbe çöker (gece)" ile "Kubbe çöker (gündüz)" klon sayılıp export'u bloklardı.
    // (2) UNICODE. '\w' Türkçe harfi tanımaz: '[^\w\s—]' filtresi 'çöker'→'ker',
    //     'yavaşça'→'yava a' yapıyor, FARKLI iki Türkçe beat'i aynı çekirdeğe çökertiyordu.
    //     '\p{L}' + 'u' bayrağı ile harf sınıfı Türkçeyi de kapsar.
    const normaliseCore = (text: string): string =>
      text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s—]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // CHECK 6 — CLONED MOTION BODY (cross-scene, medium): iki sahnenin motora giden
    // talimatı, sahne adresi soyulduğunda birebir aynıysa motor iki planı AYIRT EDEMEZ
    // — aynı klip iki kez üretilir. Bu bir AYNA değil KAPI: gövde ancak Mami'nin
    // kaynak beat'i tekrar ettiğinde çakışır (ölçüm: sağlıklı 8-beat senaryoda 0/30
    // dünya, topic-only batch'te 27/30 dünya). Site kendi şablonunu yeniden yazarak
    // bu check'i yeşile çeviremez.
    const clonedBodyScenes = new Set<number>();
    if (bodyByScene.length >= 2) {
      const bodyCounts: Record<string, number[]> = {};
      for (const { id, text } of bodyByScene) {
        const core = normaliseCore(text);
        if (!bodyCounts[core]) bodyCounts[core] = [];
        bodyCounts[core].push(id);
      }
      for (const ids of Object.values(bodyCounts)) {
        if (ids.length >= 2) {
          psHasMedium = true;
          ids.forEach((id) => { psSceneIds.add(id); clonedBodyScenes.add(id); });
          psEvidence.push(
            `Sahne ${ids.join(', ')}: Klonlanmış MOTION — ${ids.length} sahnenin motora giden talimatı birebir aynı (sahne numarası dışında tek karakter fark yok). Motor bu iki planı ayırt edemez; aynı klibi iki kez üretir.`
          );
          psEvidence.push(
            `FIX (Sahne ${ids.join(', ')}): bu sahnelerin kaynak beat'i aynı — her sahneye senaryodan KENDİ beat'ini ver (rawSource'u sahne sayısı kadar ayrı cümleye böl), yoksa iki plan aynı olayı aynı kamerayla anlatır.`
          );
        }
      }
    }

    // CHECK 6b — CLONED SOURCE BEAT (cross-scene, medium): KÖK NEDEN. Motion prompt'un
    // taşıdığı kaynak beat iki sahnede aynıysa, kamera havuzu tesadüfen farklı bir
    // kamera verdiği için gövde birebir çakışmasa bile iki plan AYNI olayı anlatır.
    // Ölçüm: topic-only batch'te gövde klonu 27/30 dünyada, beat klonu 30/30 dünyada —
    // yani beat kontrolü daha güçlü (kameranın maskelediği 3 dünyayı da yakalar).
    // Bu tamamen Mami'nin girdisi (senaryo); site'in yazdığı bir string DEĞİL → KAPI.
    if (beatByScene.length >= 2) {
      const beatCounts: Record<string, number[]> = {};
      for (const { id, text } of beatByScene) {
        const core = normaliseCore(text);
        if (!beatCounts[core]) beatCounts[core] = [];
        beatCounts[core].push(id);
      }
      for (const [core, ids] of Object.entries(beatCounts)) {
        if (ids.length < 2) continue;
        // CHECK 6 zaten bu sahne kümesinin tamamını klon gövde olarak bildirdiyse tekrar etme.
        if (ids.every((id) => clonedBodyScenes.has(id))) continue;
        psHasMedium = true;
        ids.forEach((id) => psSceneIds.add(id));
        psEvidence.push(
          `Sahne ${ids.join(', ')}: Klonlanmış KAYNAK BEAT — aynı çekirdek "${core.slice(0, 50)}" ${ids.length} sahnede tekrarlıyor (kamera farklı olsa da olay aynı). Her sahne kendi beat'inden türeyen tek, farklı bir olay taşımalı.`
        );
        psEvidence.push(
          `FIX (Sahne ${ids.join(', ')}): senaryoyu bu sahneler için ayrıştır — ya her sahneye ayrı bir cümle/olay ver ya da sahne sayısını beat sayısına indir. Aynı beat'i parantez ekiyle (ör. '(Gelişim Evresi 2)') çoğaltmak sahneyi farklılaştırmaz.`
        );
      }
    }

    if (!psHasMedium && !psHasLow) {
      psEvidence.push('Hex sızıntısı yok (render lock muafiyeti uygulandı).');
      psEvidence.push('AI-slop dolgusu yok, triad (özne+ışık+kamera) tam, tetik kelime kalıntısı yok, NEGATIVE hijyenik, her sahnenin motion talimatı ve kaynak beat\'i birbirinden farklı.');
      tips.push({ skill: 'prompt_surgeon', level: 'Medium', success: true, text: 'Neşter steril, doku pürüzsüz. Bu prompt setinde kesilecek tek bir fazlalık bile bulamadım — motora bu haliyle emanet edilebilir.', evidence: psEvidence });
    } else {
      // Medium findings block the render (VOLITION filter); low-only stays 'Easy' = warn-only.
      tips.push({
        skill: 'prompt_surgeon',
        level: psHasMedium ? 'Medium' : 'Easy',
        success: false,
        text: psHasMedium
          ? 'Neşteri getir, bu prompt\'lar kanıyor! Hex sızıntısı, dolgu dokusu ya da eksik triad var — motoru zehirlemeden önce ameliyat şart. FIX satırlarını aynen yapıştır.'
          : 'Küçük dikişler gerekiyor. Kanama yok ama kalıntı doku var — FIX satırlarını uygula, prompt\'lar tertemiz kapansın.',
        evidence: psEvidence,
        sceneIds: Array.from(psSceneIds),
      });
    }
  }

  // 7. VOLITION
  const vEvidence: string[] = [];
  const blockingTips = exportGateStatus(tips).blocking;
  const vSuccess = blockingTips.length === 0 && eSuccess;

  if (vSuccess) {
      vEvidence.push("Diğer içseslerde (Medium ve üzeri) engelleyici bir uyarı yok.");
      vEvidence.push("Encyclopedia (Protokoller) başarıyla geçildi.");
      tips.push({ skill: 'volition', level: 'Medium', success: true, text: "Her şey hazır. Şüphe etmeyi bırak, derin bir nefes al ve Üretimi Ateşle.", evidence: vEvidence });
  } else {
      vEvidence.push(`${blockingTips.length} adet kritik uyarı mevcut.`);
      if (!eSuccess) vEvidence.push("Encyclopedia kontrolleri başarısız.");
      const summary = blockingTips.map(t => t.skill).join(', ');
      tips.push({ skill: 'volition', level: 'Godly', success: false, text: `İradeni topla! Şuna baksana, ${summary} sana bağırıyor. Bu hatalarla devam edersen üretimi mahvedeceksin. Kendine gel ve bu sorunları çöz!`, evidence: vEvidence });
  }

  return tips;
}
