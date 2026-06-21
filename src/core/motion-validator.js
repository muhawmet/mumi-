// Motion ↔ Image koherans validatörü.
// Hedef: brain/03_MOTION.md "play the approved frame" kuralını runtime'da zorlamak;
// image prompt'unda olmayan named entity'leri motion prompt'unda yakalayıp kullanıcıyı uyarmak.
(function () {
  const STOP = new Set([
    'a','an','the','and','or','but','of','in','on','at','to','for','with','by','from','as','is','are','be','been','being',
    'this','that','these','those','it','its','their','his','her','our','your','my','i','we','you','they',
    'into','onto','over','under','through','between','than','then','so','very','just','more','most','less','least','also','still','again',
    've','ile','bir','bu','şu','o','ne','ya','ya da','da','de','için','gibi','olarak','ama','çünkü','eğer','hem','hem de',
    'scene','shot','camera','frame','image','prompt','motion','close','wide','medium','angle','low','high','out','back','away','side','near','far'
  ]);
  // Movement / camera verbs and adverbs that legitimately appear only in motion prompts.
  const CAMERA_TOKENS = new Set([
    'zoom','pan','tilt','push','pull','orbit','reveal','track','dolly','jib','crane','rack','focus','rotate','spin','swirl','drift',
    'float','fall','rise','sway','glide','hold','settle','fade','cut','build','peak','linger','land','arc','sweep','slide','approach','retreat',
    'slowly','quickly','gently','softly','smoothly','steadily','briefly','barely','suddenly','wide','wider','tight','tighter','left','right',
    'while','before','after','until','past','toward','towards','around','beyond','beside','along','across','behind','front','above','below'
  ]);
  function tokens(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[`*_\[\]\(\)\{\}<>:;,\.!\?\-—–"'/\\]+/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOP.has(w) && !CAMERA_TOKENS.has(w));
  }
  function normalize(w) {
    // Crude stemmer + adverb strip so "slowly"/"pushes"/"pulling"/"leaves" match camera/image roots.
    let n = w;
    if (n.endsWith('ly') && n.length > 4) n = n.slice(0, -2);
    if (n.endsWith('ies') && n.length > 4) n = n.slice(0, -3) + 'y';
    else if (n.endsWith('ves') && n.length > 4) n = n.slice(0, -3) + 'f';
    else if (n.endsWith('sses')) n = n.slice(0, -2);
    else if (n.endsWith('es') && n.length > 4) n = n.slice(0, -2);
    else if (n.endsWith('ing') && n.length > 5) n = n.slice(0, -3);
    else if (n.endsWith('ed') && n.length > 4) n = n.slice(0, -2);
    else if (n.endsWith('s') && n.length > 4) n = n.slice(0, -1);
    return n;
  }
  /**
   * Yalnız belirgin "yeni objeler" uyarılır.
   * Eşik: 3 ve üzeri yabancı içerik tokeni → koherans uyarısı.
   * @returns {{ok: boolean, foreign: string[]}}
   */
  function validateMotionAgainstImage(imagePrompt, motionPrompt) {
    const img = new Set(tokens(imagePrompt).map(normalize));
    const mo = tokens(motionPrompt);
    const seen = new Set();
    const foreign = [];
    for (const raw of mo) {
      const n = normalize(raw);
      if (CAMERA_TOKENS.has(n)) continue;
      if (img.has(n) || seen.has(n)) continue;
      seen.add(n);
      foreign.push(raw);
    }
    const THRESHOLD = 3;
    return { ok: foreign.length < THRESHOLD, foreign: foreign.slice(0, 12) };
  }
  if (typeof window !== 'undefined') window.validateMotionAgainstImage = validateMotionAgainstImage;
  if (typeof module !== 'undefined') module.exports = { validateMotionAgainstImage };
})();
