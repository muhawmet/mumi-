// --- PHASE 3: ADAPTIVE UI STATE & RENDER LOGIC --- //

function mapRefIdToBrainRefId(id) {
  if (!id) return null;
  const lower = id.toLowerCase();
  if (lower.includes('demon_slayer') || lower.includes('demonslayer')) return 'demonslayer';
  if (lower.includes('spider_verse') || lower.includes('spiderverse')) return 'spiderverse';
  if (lower.includes('totoro') || lower.includes('ghibli') || lower.includes('spirited_away') || lower.includes('princess_mononoke')) return 'ghibli';
  if (lower.includes('arcane')) return 'arcane';
  if (lower.includes('pixar') || lower.includes('coco') || lower.includes('soul')) return 'pixar';
  if (lower.includes('klaus')) return 'klaus';
  if (lower.includes('mitchells')) return 'mitchells';
  if (lower.includes('edgerunners')) return 'edgerunners';
  if (lower.includes('puss_in_boots') || lower.includes('pussinboots')) return 'pussinboots';
  if (lower.includes('spidergwen') || lower.includes('gwen')) return 'spidergwen';
  return id;
}

function mapMusicStyleToWorldId(style, defaultWorldId) {
  if (!style) return defaultWorldId;
  const s = style.toLowerCase();
  if (s.includes('orchestral')) return 'pixar_feature';
  if (s.includes('acoustic') || s.includes('warm_acoustic')) return 'watercolor_storybook';
  if (s.includes('hip_hop') || s.includes('beats')) return 'anime_cel';
  if (s.includes('lo_fi') || s.includes('chill') || s.includes('ambient')) return 'chalk_universe';
  if (s.includes('synth') || s.includes('drive')) return 'anime_cel';
  return defaultWorldId;
}

const STATE = {
  selectedWorldId: 'arcane_painterly',
  selectedRefId: null,
  selectedPropId: null,
  selectedPaletteId: null,
  selectedMusicId: null
};

function escapeHTML(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>'"]/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[match]));
}

// DOM Elements (Cascade UI)
const cascadeWorld = document.getElementById('cascade-world');
const cascadeProp = document.getElementById('cascade-prop');
const cascadeRef = document.getElementById('cascade-reference');
const cascadePalette = document.getElementById('cascade-palette');
const cascadeMusic = document.getElementById('cascade-music');

// Render Functions
function initUI() {
  if (cascadeRef) initCascadeUI();
}

function initCascadeUI() {
  // Populate references
  cascadeRef.innerHTML = '<option disabled selected>Seçiniz (Optimum Preset İçin)...</option>';
  
  // Group by category
  const categories = [...new Set(MASTER_REFERENCES.map(r => r.category))];
  
  categories.forEach(cat => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = cat.toUpperCase();
    
    MASTER_REFERENCES.filter(r => r.category === cat).forEach(ref => {
      const opt = document.createElement('option');
      opt.value = ref.id;
      opt.textContent = ref.name;
      optgroup.appendChild(opt);
    });
    
    cascadeRef.appendChild(optgroup);
  });

  // Attach Event Listener for Cascade Auto-Fill
  cascadeRef.addEventListener('change', (e) => {
    const refId = e.target.value;
    const ref = MASTER_REFERENCES.find(r => r.id === refId);
    
    if (ref) {
      if (cascadePalette && ref.autoPalette) {
        cascadePalette.value = ref.autoPalette;
        STATE.selectedPaletteId = ref.autoPalette;
        showToast('Palette Auto-Locked: ' + ref.autoPalette, 'success');
      }
      if (cascadeMusic && ref.autoMusic) {
        cascadeMusic.value = ref.autoMusic;
        STATE.selectedMusicId = ref.autoMusic;
        showToast('Music Auto-Locked: ' + ref.autoMusic, 'success');
      }
      
      STATE.selectedRefId = refId;
      if (window.AudioEngine) window.AudioEngine.selectWorld();
      saveState();
    }
  });

  // Attach event listeners for other cascade elements to save state
  if(cascadeWorld) cascadeWorld.addEventListener('change', () => { 
    STATE.selectedWorldId = cascadeWorld.value; 
    saveState();
  });
  if(cascadeProp) cascadeProp.addEventListener('change', () => {
    STATE.selectedPropId = cascadeProp.value;
    saveState();
  });
  if(cascadePalette) cascadePalette.addEventListener('change', () => {
    STATE.selectedPaletteId = cascadePalette.value;
    saveState();
  });
  if(cascadeMusic) cascadeMusic.addEventListener('change', () => {
    STATE.selectedMusicId = cascadeMusic.value;
    saveState();
  });
}

// Logic Actions - Retained for compatibility if called from elsewhere
function selectReference(refId) {
  if(cascadeRef) {
      cascadeRef.value = refId;
      cascadeRef.dispatchEvent(new Event('change'));
  }
}

function selectWorld(worldId, fromReference = false) {
  if(cascadeWorld) {
      cascadeWorld.value = worldId;
      STATE.selectedWorldId = worldId;
  }
}

// Replaced by comprehensive DOMContentLoaded at the end

// --- PHASE 4: PRODUCTION ENGINE --- //

STATE.character = 'Aras';
STATE.scenes = [];
STATE.selectedSceneId = null;
STATE.modelGrounding = null;
STATE.importedScenePack = null;
STATE.projectControls = null;
STATE.contractGate = null;

let MODEL_REGISTRY = null;
let modelRegistryPromise = null;
let MUSIC_REGISTRY = null;
let musicRegistryPromise = null;

function loadModelRegistry() {
  if (MODEL_REGISTRY) return Promise.resolve(MODEL_REGISTRY);
  if (!modelRegistryPromise) {
    modelRegistryPromise = fetch('/model-registry.json')
      .then(response => {
        if (!response.ok) throw new Error(`Registry HTTP ${response.status || 'error'}`);
        return response.json();
      })
      .then(registry => {
        if (!registry || !registry.registryVersion || !registry.image || !registry.video) {
          throw new Error('Registry schema is incomplete');
        }
        MODEL_REGISTRY = registry;
        return registry;
      })
      .catch(error => {
        modelRegistryPromise = null;
        throw error;
      });
  }
  return modelRegistryPromise;
}

function loadMusicRegistry() {
  if (MUSIC_REGISTRY) return Promise.resolve(MUSIC_REGISTRY);
  if (!musicRegistryPromise) {
    musicRegistryPromise = fetch('/music-registry.json')
      .then(response => {
        if (!response.ok) throw new Error(`Music registry HTTP ${response.status || 'error'}`);
        return response.json();
      })
      .then(registry => {
        if (!registry || !registry.registryVersion || !registry.mappings) {
          throw new Error('Music registry schema is incomplete');
        }
        MUSIC_REGISTRY = registry;
        return registry;
      })
      .catch(error => {
        musicRegistryPromise = null;
        throw error;
      });
  }
  return musicRegistryPromise;
}

function readModelSelection(selectId, kind) {
  const select = document.getElementById(selectId);
  if (!select) return { kind, provider: null, label: null };
  const selectedOption = select.selectedOptions && select.selectedOptions[0];
  const optionParent = selectedOption && selectedOption.parentElement;
  const provider = select.dataset.modelProvider
    || (optionParent && optionParent.label)
    || null;
  return { kind, provider, label: select.value };
}

function resolveModelAdapter(registry, selection) {
  const providerModels = selection.provider
    && registry[selection.kind]
    && registry[selection.kind][selection.provider];
  if (!providerModels || !providerModels.includes(selection.label)) {
    return {
      status: 'BLOCKED',
      code: 'MODEL_TARGET_UNREGISTERED',
      selection,
      registryVersion: registry.registryVersion
    };
  }
  return {
    status: 'TARGET_REGISTERED',
    targetModel: {
      kind: selection.kind,
      provider: selection.provider,
      label: selection.label
    },
    resolveCurrentVersion: true,
    registryVersion: registry.registryVersion,
    registryRole: registry.role || 'ADVISORY_TARGET_CATALOG'
  };
}

// Character Selection Logic
const ALLOWED_CHARACTERS = ['Aras', 'Defne', 'İkisi'];
document.querySelectorAll('.char-btn').forEach(btn => {
  btn.onclick = () => {
    const requested = btn.getAttribute('data-char');
    if (!ALLOWED_CHARACTERS.includes(requested)) {
      console.warn('Rejected unknown character:', requested);
      return;
    }
    document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    STATE.character = requested;
    if (typeof saveState === 'function') saveState();
  };
});

// Generation Helpers
function getGlobalNegatives() {
  return BRAIN.negativeLibrary.global.join(', ');
}
function getWorldNegatives(worldId) {
  return BRAIN.negativeLibrary.perWorld[worldId] ? BRAIN.negativeLibrary.perWorld[worldId].join(', ') : '';
}

const SCENE_INTENTS = [
  'orient the audience to the core idea',
  'identify the first essential element',
  'expose the governing relationship',
  'demonstrate the mechanism in action',
  'contrast a correct and incorrect state',
  'transform the initial state visibly',
  'verify the result with observable proof',
  'apply the idea to a concrete situation',
  'connect the result to the wider system',
  'resolve the sequence with a clear takeaway'
];

const SCENE_EVENTS = [
  'the key relationship is revealed from an initially neutral arrangement',
  'one component moves into its correct position and locks',
  'a visible comparison separates the two possible outcomes',
  'the mechanism completes one cause-and-effect cycle',
  'an incorrect arrangement is corrected in one decisive change',
  'the proof marker appears only after the result is established',
  'one practical example activates while all supporting elements remain still',
  'the completed system settles into an edit-safe final state'
];

const SCENE_FOCUSES = [
  'concept map',
  'primary teaching object',
  'cause-and-effect junction',
  'worked example',
  'proof state'
];

function stableSemanticFingerprint(parts) {
  const text = parts.join('|');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `scene-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function projectIdentity(topic, sourceInput) {
  const exactBeats = sourceInput.beats.map(beat => beat.exactText);
  return {
    projectId: stableSemanticFingerprint(['PROJECT', String(topic || '').trim()]),
    sourceHash: stableSemanticFingerprint(['SOURCE', sourceInput.status, ...exactBeats])
  };
}

function parseSourceInput(topic) {
  const raw = String(topic || '').trim();
  const sourceMatch = raw.match(/^SOURCE:\s*([\s\S]+)$/i);
  if (!sourceMatch) {
    return {
      status: 'UNSOURCED_TOPIC_INPUT',
      beats: [{ sourceId: null, exactText: raw || 'Genel Konu' }],
      notice: 'UNSOURCED: only a topic was supplied; no canonical source beat is claimed.'
    };
  }

  const beats = sourceMatch[1]
    .split(/\n+/)
    .map(text => text.trim())
    .filter(Boolean)
    .map((exactText, index) => ({
      sourceId: `source-${String(index + 1).padStart(3, '0')}`,
      exactText
    }));

  return {
    status: beats.length > 0 ? 'SOURCE_BOUND' : 'UNSOURCED_TOPIC_INPUT',
    beats: beats.length > 0 ? beats : [{ sourceId: null, exactText: 'Genel Konu' }],
    notice: beats.length > 0 ? null : 'UNSOURCED: SOURCE marker contained no usable beat.'
  };
}

function buildImageVantage(world, sceneIndex) {
  const index = Math.max(1, Number(sceneIndex) || 1) - 1;
  const tactile = world && world.category === 'tactile';
  const pool = tactile ? [
    '35mm three-quarter wide exterior view, complete miniature frame visible',
    '50mm eye-level wide exterior view, foreground mechanism and layered background readable',
    '35mm high three-quarter wide exterior view, full diorama boundary retained',
    '50mm low three-quarter wide exterior view, miniature scale and negative space preserved'
  ] : [
    '35mm eye-level medium-wide three-quarter view, dominant subject and environment readable',
    '50mm eye-level medium view, dominant subject isolated against deliberate negative space',
    '85mm eye-level close view, subject geometry intact and background context still legible',
    '35mm low three-quarter medium-wide view, silhouette separated from the background',
    '50mm high three-quarter medium view, cause-and-effect layout visible in one frame'
  ];
  return world && world.imageVantageConstraint
    ? `${pool[index % pool.length]}; constraint: ${world.imageVantageConstraint}`
    : pool[index % pool.length];
}

function createSceneArchitecture(topic, sceneIndex, world) {
  const index = Math.max(1, Number(sceneIndex) || 1) - 1;
  const sourceInput = parseSourceInput(topic);
  const sourceBeat = sourceInput.beats[index % sourceInput.beats.length];
  const intent = SCENE_INTENTS[index % SCENE_INTENTS.length];
  const event = SCENE_EVENTS[Math.floor(index / SCENE_INTENTS.length) % SCENE_EVENTS.length];
  const focus = SCENE_FOCUSES[index % SCENE_FOCUSES.length];
  const dominantSubject = `${sourceBeat.exactText} — ${focus}`;

  return {
    source: {
      status: sourceInput.status,
      sourceId: sourceBeat.sourceId,
      exactText: sourceBeat.exactText,
      notice: sourceInput.notice
    },
    beat: intent,
    dominantSubject,
    event,
    imageVantage: buildImageVantage(world || BRAIN.worlds[0], sceneIndex),
    semanticFingerprint: stableSemanticFingerprint([
      sourceInput.status,
      sourceBeat.sourceId || sourceBeat.exactText,
      intent,
      dominantSubject,
      event
    ])
  };
}

function deriveTeachingRecipe(world) {
  const propEl = document.getElementById('cascade-prop');
  if (propEl && propEl.value) {
    return {
      id: propEl.value,
      source: 'USER_OVERRIDE'
    };
  }
  const tactileRecipes = {
    paper_diorama: 'paper',
    clay_diorama: 'clay',
    wood_diorama: 'wood',
    felt_diorama: 'fabric',
    shadow_puppet: 'shadow-puppet',
    book_theater: 'paper-theater',
    stained_glass: 'stained-glass'
  };
  return {
    id: tactileRecipes[world.id] || 'world-native',
    source: tactileRecipes[world.id] ? 'WORLD_DERIVED' : 'NO_TACTILE_OVERRIDE'
  };
}

function deriveProductionPath(projectClass) {
  const value = String(projectClass || '').toUpperCase();
  if (/ULTRA|REAL|COMMERCIAL|PRODUCT|LIVE ACTION/.test(value)) return 'ULTRAREAL_COMMERCIAL';
  if (/TASARIM|DESIGN/.test(value)) return 'STYLIZED_PREMIUM';
  return 'ANIMATION_EDU';
}

function validateBriefCompatibility({ path, world, recipe }) {
  const findings = [];
  const realPath = /REAL|COMMERCIAL|PRODUCT|LIVE_ACTION/.test(path);
  const tactileRecipe = recipe && recipe.id && recipe.id !== 'world-native';
  if (realPath && tactileRecipe) {
    findings.push({
      code: 'REGISTER_CONTAMINATION',
      message: `REAL path ${path} cannot use tactile recipe ${recipe.id}`
    });
  }
  if (realPath && world.category !== 'real') {
    findings.push({
      code: 'WORLD_PATH_MISMATCH',
      message: `REAL path ${path} cannot use ${world.category} world ${world.id}`
    });
  }
  return {
    status: findings.length ? 'BLOCKED' : 'PASS',
    authority: ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT'],
    path,
    findings
  };
}

function buildFinalBriefContext(sceneArchitecture, world, selectedRefId, path) {
  const brainRefId = mapRefIdToBrainRefId(selectedRefId);
  const reference = brainRefId ? BRAIN.references.find(ref => ref.id === brainRefId) : null;
  const compatibleReference = reference && reference.worldId === world.id ? reference : null;
  const recipe = deriveTeachingRecipe(world);
  const paletteAccent = world.palette && world.palette.length ? world.palette[world.palette.length - 1] : null;

  return {
    authority: ['SOURCE', 'WORLD', 'RECIPE', 'REFERENCE_DNA', 'PALETTE_ACCENT'],
    path,
    source: sceneArchitecture.source,
    world: {
      id: world.id,
      renderRecipe: world.renderRecipe,
      texture: world.texture,
      lighting: world.lighting
    },
    recipe,
    referenceDNA: reference ? {
      id: reference.id,
      status: compatibleReference ? 'ACTIVE_SUBORDINATE' : 'SUPPRESSED_WORLD_MISMATCH',
      worldId: reference.worldId,
      directives: compatibleReference ? {
        mood: reference.dna.mood,
        linework: reference.dna.linework
      } : {},
      suppressedFields: ['palette', 'texture', 'lighting']
    } : {
      id: null,
      status: 'NONE',
      directives: {},
      suppressedFields: []
    },
    paletteAccent: {
      value: paletteAccent,
      source: 'WORLD_PALETTE_LAST_ACCENT'
    }
  };
}

function buildImagePrompt(topic, sceneIndex, sceneCount, sceneArchitecture, finalBrief, world, character, model) {
  let prompt = world.renderRecipe;
  prompt += `. Project topic: ${topic}`;
  prompt += `. Source status: ${sceneArchitecture.source.status}`;
  prompt += `. Source beat: ${sceneArchitecture.source.sourceId || 'UNBOUND'} — ${sceneArchitecture.source.exactText}`;
  if (sceneArchitecture.source.notice) prompt += `. ${sceneArchitecture.source.notice}`;
  prompt += `. Scene intent: ${sceneArchitecture.beat}`;
  prompt += `. Dominant subject: ${sceneArchitecture.dominantSubject}`;
  prompt += `. Single visible event: ${sceneArchitecture.event}`;
  const paletteEl = document.getElementById('cascade-palette');
  if (paletteEl && paletteEl.value) {
    prompt += `. Palette: ${paletteEl.value}`;
  } else if (world.palette) {
    prompt += `. Palette: ${world.palette.join(', ')}`;
  }
  if (world.texture) prompt += `. Texture: ${world.texture}`;
  if (world.lighting) prompt += `. Lighting: ${world.lighting}`;
  if (world.compositionConstraint) prompt += `. Composition: ${world.compositionConstraint}`;
  prompt += `. Camera/vantage: ${sceneArchitecture.imageVantage}`;
  
  prompt += `. Teaching recipe: ${finalBrief.recipe.id}`;
  if (finalBrief.referenceDNA.status === 'ACTIVE_SUBORDINATE') {
    prompt += `. Reference DNA (subordinate): ${finalBrief.referenceDNA.directives.mood}, ${finalBrief.referenceDNA.directives.linework}`;
  }
  if (finalBrief.paletteAccent.value) prompt += `. Palette accent: ${finalBrief.paletteAccent.value}`;
  
  if (character && character !== 'İkisi') {
    prompt += `. Subject: ${character}`;
  } else if (character === 'İkisi') {
    prompt += `.Subjects: Aras and Defne`;
  }
  
  let negatives = getGlobalNegatives();
  let worldNeg = getWorldNegatives(world.id);
  if (worldNeg) negatives += ', ' + worldNeg;
  
  return prompt + ` --no ${ negatives } `;
}

function sceneNegatives(scene, world) {
  return {
    global: cloneJSON(BRAIN.negativeLibrary.global),
    world: cloneJSON(BRAIN.negativeLibrary.perWorld[world.id] || []),
    perScene: cloneJSON(scene.perSceneNegatives || [])
  };
}

function packetWarnings(scene, role) {
  const warnings = [];
  if (scene.sceneArchitecture.source.status !== 'SOURCE_BOUND') {
    warnings.push({ code: 'UNSOURCED_INPUT', message: scene.sceneArchitecture.source.notice });
  }
  if (scene.finalBrief.referenceDNA.status === 'SUPPRESSED_WORLD_MISMATCH') {
    warnings.push({ code: 'REFERENCE_DNA_SUPPRESSED', message: 'Reference DNA cannot override the selected world.' });
  }
  if (role === 'MOTION' && !scene.imageFile && !scene.approvedImage) {
    warnings.push({ code: 'APPROVED_IMAGE_REQUIRED', message: 'Motion remains locked until an approved image or IMAGE agent result exists.' });
  }
  if (role === 'SUNO' && scene.musicGrounding.status === 'BLOCKED') {
    warnings.push({ code: scene.musicGrounding.code, message: 'No music mapping was guessed.' });
  }
  return warnings;
}

function targetForRole(scene, role) {
  if (role === 'IMAGE') return cloneJSON(scene.targetModels.image.targetModel);
  if (role === 'MOTION') return cloneJSON(scene.targetModels.video.targetModel);
  return { kind: 'music', provider: 'SUNO', label: 'Custom Mode' };
}

function createHandoffPacket(scene, role, world, identity) {
  const targetModel = targetForRole(scene, role);
  const registryHint = role === 'SUNO' ? {
    registryVersion: scene.musicGrounding.registryVersion,
    role: 'KNOWLEDGE_GROUNDED_MUSIC_MAPPING',
    claim: 'MUSIC_STYLE_ONLY_NOT_MODEL_VERSION_GROUNDING'
  } : {
    registryVersion: scene.targetModels.image.registryVersion,
    role: scene.targetModels.image.registryRole,
    claim: 'TARGET_ONLY_NOT_VERSION_GROUNDING'
  };
  const packetId = stableSemanticFingerprint([
    identity.projectId,
    identity.sourceHash,
    String(scene.id),
    role,
    targetModel.provider,
    targetModel.label
  ]);
  return {
    packetVersion: '1.0.0',
    packetId,
    projectId: identity.projectId,
    sourceHash: identity.sourceHash,
    role,
    scene: {
      id: scene.id,
      sourceId: scene.sceneArchitecture.source.sourceId,
      exactSourceBeat: scene.sceneArchitecture.source.exactText,
      sourceStatus: scene.sceneArchitecture.source.status,
      intent: scene.sceneArchitecture.beat,
      dominantSubject: scene.sceneArchitecture.dominantSubject,
      event: scene.sceneArchitecture.event,
      continuity: {
        previousSceneId: scene.id > 1 ? scene.id - 1 : null,
        nextSceneId: scene.id < STATE.scenes.length ? scene.id + 1 : null,
        characterLock: STATE.character,
        worldLock: world.id,
        semanticFingerprint: scene.semanticFingerprint
      }
    },
    world: {
      id: world.id,
      recipe: cloneJSON(scene.finalBrief.recipe),
      renderRecipe: world.renderRecipe,
      texture: world.texture,
      lighting: world.lighting,
      camera: scene.sceneArchitecture.imageVantage,
      composition: world.compositionConstraint || null,
      motionGrammar: world.motionNotes
    },
    refDNA: cloneJSON(scene.finalBrief.referenceDNA),
    locks: {
      character: STATE.character || null,
      product: null,
      visibleText: 'NO_UNSOURCED_VISIBLE_TEXT'
    },
    targetModel,
    resolveCurrentVersion: true,
    registryHint,
    negatives: sceneNegatives(scene, world),
    warnings: packetWarnings(scene, role),
    draft: {
      previewPrompt: role === 'IMAGE' ? scene.draftPrompt : role === 'MOTION' ? world.motionNotes : scene.sunoBrief,
      canonical: false
    }
  };
}

function refreshSceneHandoffPackets(topic) {
  const world = BRAIN.worlds.find(item => item.id === STATE.selectedWorldId);
  const identity = projectIdentity(topic, parseSourceInput(topic));
  STATE.scenes.forEach(scene => {
    scene.handoffPackets = ['IMAGE', 'MOTION', 'SUNO'].map(role => createHandoffPacket(scene, role, world, identity));
  });
}

function buildVoiceOver(sceneIndex, topic) {
  const projectClass = document.getElementById('project-class') ? document.getElementById('project-class').value : '';
  
  if (projectClass === 'Tasarım İşi') {
    const designDefaults = [
      `[Draft: Introduce ${ topic || 'the concept' } visually.]`,
      `[Draft: Highlight the details and atmosphere.]`,
      `[Draft: Show the progression or action.]`,
      `[Draft: Emphasize the emotional or visual climax.]`,
      `[Draft: Concluding shot and takeaway.]`
    ];
    return designDefaults[(sceneIndex - 1) % designDefaults.length];
  } else {
    const eduDefaults = [
      `[Draft: Welcome the audience and introduce ${ topic || 'the topic' }.]`,
      `[Draft: Explain the first key concept shown on screen.]`,
      `[Draft: Dive deeper into the mechanics or details.]`,
      `[Draft: Show the practical application or result.]`,
      `[Draft: Summarize the lesson and say goodbye.]`
    ];
    return eduDefaults[(sceneIndex - 1) % eduDefaults.length];
  }
}

function resolveMusicMapping(registry, worldId) {
  const mapping = registry.mappings[worldId];
  if (!mapping) {
    return {
      status: 'BLOCKED',
      code: 'MUSIC_MAPPING_UNGROUNDED',
      worldId,
      registryVersion: registry.registryVersion
    };
  }
  return {
    status: 'GROUNDED',
    worldId,
    registryVersion: registry.registryVersion,
    sourceRef: mapping.sourceRef,
    text: mapping.text
  };
}

function buildSunoBrief(sceneIndex, sceneCount, musicGrounding) {
  if (musicGrounding.status !== 'GROUNDED') {
    return `BLOCKED: ${musicGrounding.code} for ${musicGrounding.worldId}; no music style was guessed.`;
  }
  const progress = sceneCount <= 1 ? 1 : (sceneIndex - 1) / (sceneCount - 1);
  const stage = progress < 0.2 ? 'INTRO' : progress < 0.65 ? 'BUILD' : progress < 0.85 ? 'PEAK' : 'RESOLVE';
  return `[MUSIC SOURCE: ${musicGrounding.sourceRef}; REGISTRY: ${musicGrounding.registryVersion}] ${musicGrounding.text} STRUCTURE: ${stage} for scene ${sceneIndex}/${sceneCount}. VO POCKET: keep 1–4 kHz sparse; no sustained vocals; reduce transients under narration.`;
}

// Batch Generator
const batchBtn = document.getElementById('btn-batch-generate');
if (batchBtn) {
  batchBtn.dataset.actionBound = 'true';
  batchBtn.onclick = generateBatch;
  batchBtn.onmouseenter = () => { if (window.AudioEngine) window.AudioEngine.hover(); };
}

let isGeneratingBatch = false;
async function generateBatch() {
  if (isGeneratingBatch) return;
  isGeneratingBatch = true;
  
  const loader = document.getElementById('cinematic-loader');
  
  try {
    if (window.AudioEngine) window.AudioEngine.generate();
    
    if (loader) loader.style.display = 'flex';
    await new Promise(r => setTimeout(r, 50));

    const topic = document.getElementById('project-topic').value || 'Genel Konu';
    const count = parseInt(document.getElementById('project-scenes').value, 10);
    let registry;
    let musicRegistry;
    try {
      [registry, musicRegistry] = await Promise.all([loadModelRegistry(), loadMusicRegistry()]);
    } catch (error) {
      STATE.modelGrounding = { status: 'BLOCKED', code: 'PROMPT_REGISTRY_UNAVAILABLE', message: error.message };
      saveState();
      showToast('BLOCKED: Model registry okunamadı; sürüm tahmin edilmeyecek.', 'error');
      return STATE.modelGrounding;
    }

    const imageAdapter = resolveModelAdapter(registry, readModelSelection('image-model', 'image'));
    const videoAdapter = resolveModelAdapter(registry, readModelSelection('video-model', 'video'));
    const blockedAdapter = [imageAdapter, videoAdapter].find(adapter => adapter.status === 'BLOCKED');
    if (blockedAdapter) {
      STATE.modelGrounding = blockedAdapter;
      STATE.scenes = [];
      saveState();
      showToast(`BLOCKED: ${blockedAdapter.selection.provider || 'UNKNOWN'} / ${blockedAdapter.selection.label || 'UNKNOWN'} registry içinde yok; sürüm tahmin edilmeyecek.`, 'error');
      renderTable();
      renderDetailPanel();
      return blockedAdapter;
    }
    STATE.modelGrounding = {
      status: 'TARGETS_REGISTERED_AGENT_VERSION_REQUIRED',
      resolveCurrentVersion: true,
      image: imageAdapter,
      video: videoAdapter
    };
    const imageModel = imageAdapter.targetModel.label;
    
    const world = BRAIN.worlds.find(w => w.id === STATE.selectedWorldId);
    if (!world) {
      if (window.AudioEngine) window.AudioEngine.error();
      showToast("Lütfen bir vizyonel dünya seçin.", "error");
      return;
    }
    const projectClass = document.getElementById('project-class') ? document.getElementById('project-class').value : '';
    const path = deriveProductionPath(projectClass);
    const recipe = deriveTeachingRecipe(world);
    STATE.contractGate = validateBriefCompatibility({ path, world, recipe });
    if (STATE.contractGate.status === 'BLOCKED') {
      STATE.scenes = [];
      saveState();
      alert(`BLOCKED: ${STATE.contractGate.findings.map(finding => finding.code).join(', ')}`);
      renderTable();
      renderDetailPanel();
      return STATE.contractGate;
    }
    const musicSelect = document.getElementById('cascade-music');
    const targetWorldIdForMusic = musicSelect && musicSelect.value ? mapMusicStyleToWorldId(musicSelect.value, world.id) : world.id;
    const musicGrounding = resolveMusicMapping(musicRegistry, targetWorldIdForMusic);
    
    STATE.scenes = [];
    
    for (let i = 1; i <= count; i++) {
      const sceneTopic = `${ topic } - Sahne ${ i } `;
      const sceneArchitecture = createSceneArchitecture(topic, i, world);
      const finalBrief = buildFinalBriefContext(sceneArchitecture, world, STATE.selectedRefId, path);
      const draftPrompt = buildImagePrompt(topic, i, count, sceneArchitecture, finalBrief, world, STATE.character, imageModel);
      
      let arcPct = (i - 1) / Math.max(1, count - 1);
      let intensity = 0;
      let phaseName = '';
      if (arcPct < 0.25) { intensity = 20 + (arcPct / 0.25) * 30; phaseName = 'Intro'; }
      else if (arcPct < 0.7) { intensity = 50 + ((arcPct - 0.25) / 0.45) * 35; phaseName = 'Build-up'; }
      else if (arcPct < 0.9) { intensity = 85 + ((arcPct - 0.7) / 0.2) * 15; phaseName = 'Climax'; }
      else { intensity = 100 - ((arcPct - 0.9) / 0.1) * 70; phaseName = 'Resolution'; }
      
      let duration = 4;
      if (phaseName === 'Intro') duration = 3;
      else if (phaseName === 'Build-up') duration = 4;
      else if (phaseName === 'Climax') duration = 6;
      else duration = 5;

      STATE.scenes.push({
        id: i,
        topic: sceneTopic,
        sceneArchitecture,
        finalBrief,
        semanticFingerprint: sceneArchitecture.semanticFingerprint,
        modelAdapter: imageAdapter,
        targetModels: { image: imageAdapter, video: videoAdapter },
        musicGrounding,
        draftPrompt,
        canonicalPrompt: '',
        imagePrompt: draftPrompt,
        motionPrompt: '',
        sunoBrief: buildSunoBrief(i, count, musicGrounding),
        voiceOver: buildVoiceOver(i, topic),
        status: i === 1 ? 'progress' : 'pending',
        imageStatus: i === 1 ? 'progress' : 'pending',
        videoStatus: 'pending',
        sunoStatus: i === 1 ? 'progress' : 'pending',
        voStatus: 'pending',
        intensity,
        phaseName,
        duration
      });
    }
    refreshSceneHandoffPackets(topic);
    
    STATE.selectedSceneId = 1;
    if (typeof saveState === 'function') saveState();
    renderTable();
    renderDetailPanel();
    
    return { status: 'GENERATED', scenes: STATE.scenes };
  } finally {
    if (loader) loader.style.display = 'none';
    isGeneratingBatch = false;
  }
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  const pacingContainer = document.getElementById('pacing-graph-container');
  const pacingGraph = document.getElementById('pacing-graph');

  if (!STATE.scenes || STATE.scenes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state-row">Henüz sahne üretilmedi. Sol panelden BATCH ÜRET butonunu kullanın.</td></tr>`;
    if (pacingContainer) pacingContainer.style.display = 'none';
    return;
  }
  
  if (pacingContainer) pacingContainer.style.display = 'block';
  if (pacingGraph) pacingGraph.innerHTML = '';

  tbody.innerHTML = '';
  STATE.scenes.forEach(scene => {
    const tr = document.createElement('tr');
    tr.className = `scene-row ${STATE.selectedSceneId === scene.id ? 'active' : ''}`;
    tr.onclick = () => {
      if (window.AudioEngine && STATE.selectedSceneId !== scene.id) window.AudioEngine.click();
      selectScene(scene.id);
    };

    let arcPct = (scene.id - 1) / Math.max(1, STATE.scenes.length - 1);
    let intensity = 0;
    let phaseName = '';
    if (arcPct < 0.25) { intensity = 20 + (arcPct / 0.25) * 30; phaseName = 'Intro'; }
    else if (arcPct < 0.7) { intensity = 50 + ((arcPct - 0.25) / 0.45) * 35; phaseName = 'Build-up'; }
    else if (arcPct < 0.9) { intensity = 85 + ((arcPct - 0.7) / 0.2) * 15; phaseName = 'Climax'; }
    else { intensity = 100 - ((arcPct - 0.9) / 0.1) * 70; phaseName = 'Resolution'; }
    
    scene.intensity = intensity;
    scene.phaseName = phaseName;
    scene.pacing = { intensity, phaseName };
    if (phaseName === 'Intro') scene.duration = 3;
    else if (phaseName === 'Build-up') scene.duration = 4;
    else if (phaseName === 'Climax') scene.duration = 6;
    else scene.duration = 5;

    if (pacingGraph && window.drawPacingGraph) {
      // The new premium UI Graph Module handles the rendering!
      // We do it once at the end of renderTable.
    }
    
    tr.innerHTML = `
      <td>${escapeHTML(scene.id)}</td>
      <td>${escapeHTML(scene.topic.length > 50 ? scene.topic.substring(0, 50) + '...' : scene.topic)}</td>
      <td><span class="status-badge status-${escapeHTML(scene.status.toLowerCase())}"></span> ${escapeHTML(scene.status)}</td>
      <td class="item-check ${scene.imageStatus === 'done' ? 'done' : ''}">${scene.imageStatus === 'done' ? '✓' : '○'}</td>
      <td class="item-check ${scene.videoStatus === 'done' ? 'done' : ''}">${scene.videoStatus === 'done' ? '✓' : '○'}</td>
      <td class="item-check ${scene.sunoStatus === 'done' ? 'done' : ''}">${scene.sunoStatus === 'done' ? '✓' : '○'}</td>
      <td class="item-check ${scene.voStatus === 'done' ? 'done' : ''}">${scene.voStatus === 'done' ? '✓' : '○'}</td>
    `;
    tbody.appendChild(tr);
  });
  
  if (pacingGraph && window.drawPacingGraph) {
    window.drawPacingGraph(STATE.scenes);
  }
}

function selectScene(id) {
  STATE.selectedSceneId = id;
  renderTable();
  renderDetailPanel();
}

function renderDetailPanel() {
  const scene = STATE.scenes.find(s => s.id === STATE.selectedSceneId);
  const container = document.getElementById('detail-cards-container');
  const emptyState = document.getElementById('detail-empty-state');
  const titleEl = document.getElementById('detail-title');

  if (!scene || !STATE.scenes || STATE.scenes.length === 0) {
    if (titleEl) titleEl.innerText = "Sahne Detayı";
    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    syncDetailActions(null);
    return;
  }

  if (container) container.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  if (titleEl) titleEl.innerText = `Sahne ${ scene.id } Detayı`;

  const promptText = scene.canonicalPrompt || scene.imagePrompt;
  const prefix = scene.canonicalPrompt ? '[CANONICAL AGENT OUTPUT]\n' : '[DRAFT PREVIEW — NON-CANONICAL]\n';
  const imageEl = document.getElementById('detail-image-prompt');
  if (imageEl) imageEl.textContent = prefix + promptText;
  
  const motionEl = document.getElementById('detail-motion-prompt');
  if (motionEl) {
    if (scene.motionPrompt) {
      motionEl.innerText = scene.motionPrompt;
      if (motionEl.parentElement) motionEl.parentElement.classList.remove('locked');
    } else {
      const world = BRAIN.worlds.find(w => w.id === STATE.selectedWorldId) || BRAIN.worlds[0];
      const motionNotes = (world && world.motionNotes) ? world.motionNotes : 'N/A';
      motionEl.innerHTML = `<span>🔒</span> Görsel indirilince analiz edilecek. JSON dışa ver → vision-AI → JSON içe al.<br><br><span style="color:var(--text-2)">World Motion Rules: ${escapeHTML(motionNotes)}</span>`;
      if (motionEl.parentElement) motionEl.parentElement.classList.add('locked');
    }
  }
  
  const sunoEl = document.getElementById('detail-suno-prompt');
  if (sunoEl) {
    sunoEl.innerText = scene.canonicalSunoPrompt
      ? `[CANONICAL AGENT OUTPUT]\n${scene.canonicalSunoPrompt}`
      : `[DRAFT PREVIEW — NON-CANONICAL]\n${scene.sunoBrief}`;
  }
  const voEl = document.getElementById('detail-vo-prompt');
  if (voEl) voEl.innerText = scene.voiceOver;
  syncDetailActions(scene);
}

window.copyText = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Panoya kopyalandı!', 'success');
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
      showToast('Kopyalama başarısız oldu.', 'error');
    });
  }
}

function ensureMotionCopyButton() {
  const motionPrompt = document.getElementById('detail-motion-prompt');
  
  const copyHandler = () => {
    const sceneId = STATE.selectedSceneId;
    const scene = STATE.scenes.find(s => s.id === sceneId);
    if (scene && scene.handoffPackets) {
      const motionPacket = scene.handoffPackets.find(p => p.role === 'MOTION');
      if (motionPacket) {
        navigator.clipboard.writeText(JSON.stringify(motionPacket, null, 2))
          .then(() => showToast('Motion JSON kopyalandı.', 'success'))
          .catch(() => showToast('Kopyalama başarısız.', 'error'));
      }
    }
  };

  let button = document.getElementById('btn-copy-motion');
  if (button) {
    button.dataset.actionBound = 'true';
    button.onclick = copyHandler;
    return button;
  }

  const header = motionPrompt && motionPrompt.parentElement
    ? motionPrompt.parentElement.querySelector('.prompt-header')
    : null;
  if (!header) return null;

  button = document.createElement('button');
  button.id = 'btn-copy-motion';
  button.className = 'copy-btn';
  button.textContent = 'Kopyala';
  button.dataset.actionBound = 'true';
  button.onclick = copyHandler;
  header.appendChild(button);
  return button;
}

function syncDetailActions(scene) {
  const claudeButton = document.querySelector('.copy-claude-btn');
  if (claudeButton) {
    claudeButton.disabled = !scene;
    claudeButton.dataset.actionBound = scene ? 'true' : 'disabled';
    claudeButton.title = scene ? '' : 'Önce bir sahne üretin';
    claudeButton.onclick = scene ? () => {
      const packet = JSON.stringify({
        contract: 'MAMILAS_D6_AGENT_HANDOFF',
        packets: cloneJSON(scene.handoffPackets)
      }, null, 2);
      window.open('https://claude.ai/new', '_blank', 'noopener');
      navigator.clipboard.writeText(packet).then(() => showToast('Claude paketi panoya kopyalandı.')).catch(error => {
        console.error('Claude paketi kopyalanamadı', error);
        showToast('Kopyalama başarısız.', 'error');
      });
    } : null;
  }

  const motionButton = ensureMotionCopyButton();
  if (motionButton) {
    motionButton.disabled = !scene || !scene.motionPrompt;
    motionButton.title = motionButton.disabled ? 'Motion prompt henüz hazır değil' : '';
  }
}

// --- PHASE 5: JSON BRIDGE & PERSISTENCE --- //

function saveState() {
  captureProjectControls();
  try {
    localStorage.setItem('mamilas_state', JSON.stringify(STATE));
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn('localStorage quota exceeded; STATE not persisted this tick.', e);
      if (window.showToast) window.showToast('Tarayıcı belleği doldu, durum kaydedilemedi.', 'error');
    } else {
      console.error('saveState failed:', e);
    }
  }
}

function captureProjectControls() {
  const topic = document.getElementById('project-topic');
  const projectClass = document.getElementById('project-class');
  const sceneCount = document.getElementById('project-scenes');
  const imageModel = readModelSelection('image-model', 'image');
  const videoModel = readModelSelection('video-model', 'video');
  if (!topic || !projectClass || !sceneCount) return;

  const cascadeWorld = document.getElementById('cascade-world');
  const cascadeProp = document.getElementById('cascade-prop');
  const cascadeRef = document.getElementById('cascade-reference');
  const cascadePalette = document.getElementById('cascade-palette');
  const cascadeMusic = document.getElementById('cascade-music');

  STATE.projectControls = {
    topic: topic.value,
    projectClass: projectClass.value,
    sceneCount: sceneCount.value,
    imageModel,
    videoModel,
    selectedWorldId: cascadeWorld ? cascadeWorld.value : STATE.selectedWorldId,
    selectedRefId: cascadeRef ? cascadeRef.value : STATE.selectedRefId,
    selectedPropId: cascadeProp ? cascadeProp.value : STATE.selectedPropId,
    selectedPaletteId: cascadePalette ? cascadePalette.value : STATE.selectedPaletteId,
    selectedMusicId: cascadeMusic ? cascadeMusic.value : STATE.selectedMusicId
  };
}

function restoreProjectControls() {
  const controls = STATE.projectControls;
  if (!controls) return;
  const values = {
    'project-topic': controls.topic,
    'project-class': controls.projectClass,
    'project-scenes': controls.sceneCount,
    'image-model': controls.imageModel && controls.imageModel.label,
    'video-model': controls.videoModel && controls.videoModel.label
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) element.value = String(value);
  });
  
  if (controls.selectedWorldId) {
    STATE.selectedWorldId = controls.selectedWorldId;
    const cascadeWorld = document.getElementById('cascade-world');
    if (cascadeWorld) {
      cascadeWorld.value = controls.selectedWorldId;
    }
  }
  if (controls.selectedPropId) {
    STATE.selectedPropId = controls.selectedPropId;
    const cascadeProp = document.getElementById('cascade-prop');
    if (cascadeProp) {
      cascadeProp.value = controls.selectedPropId;
    }
  }
  if (controls.selectedRefId) {
    STATE.selectedRefId = controls.selectedRefId;
    const cascadeRef = document.getElementById('cascade-reference');
    if (cascadeRef) {
      cascadeRef.value = controls.selectedRefId;
    }
  }
  if (controls.selectedPaletteId) {
    STATE.selectedPaletteId = controls.selectedPaletteId;
    const cascadePalette = document.getElementById('cascade-palette');
    if (cascadePalette) {
      cascadePalette.value = controls.selectedPaletteId;
    }
  }
  if (controls.selectedMusicId) {
    STATE.selectedMusicId = controls.selectedMusicId;
    const cascadeMusic = document.getElementById('cascade-music');
    if (cascadeMusic) {
      cascadeMusic.value = controls.selectedMusicId;
    }
  }

  const sliderDisplay = document.getElementById('slider-val-display');
  const batchCount = document.getElementById('batch-btn-count');
  if (sliderDisplay) sliderDisplay.innerText = String(controls.sceneCount);
  if (batchCount) batchCount.innerText = String(controls.sceneCount);
}

function bindProjectPersistence() {
  ['project-topic', 'project-class', 'project-scenes', 'image-model', 'video-model', 'cascade-world', 'cascade-prop', 'cascade-reference', 'cascade-palette', 'cascade-music'].forEach(id => {
    const element = document.getElementById(id);
    if (!element || typeof element.addEventListener !== 'function') return;
    element.addEventListener(id === 'project-topic' || id === 'project-scenes' ? 'input' : 'change', saveState);
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem('mamilas_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.character) STATE.character = parsed.character;
      if (parsed.selectedWorldId) STATE.selectedWorldId = parsed.selectedWorldId;
      if (parsed.selectedRefId) STATE.selectedRefId = parsed.selectedRefId;
      if (parsed.selectedPropId) STATE.selectedPropId = parsed.selectedPropId;
      if (parsed.selectedPaletteId) STATE.selectedPaletteId = parsed.selectedPaletteId;
      if (parsed.selectedMusicId) STATE.selectedMusicId = parsed.selectedMusicId;
      if (parsed.scenes && Array.isArray(parsed.scenes)) STATE.scenes = parsed.scenes;
      if (parsed.selectedSceneId) STATE.selectedSceneId = parsed.selectedSceneId;
      if (parsed.projectControls) STATE.projectControls = parsed.projectControls;
    }
  } catch (e) {
    console.error("State parse error — resetting to defaults", e);
    try { localStorage.removeItem('mamilas_state'); } catch (_) { /* ignore */ }
    STATE.character = 'Aras';
    STATE.scenes = [];
    STATE.selectedSceneId = null;
    STATE.projectControls = null;
    STATE.selectedWorldId = 'arcane_painterly';
    STATE.selectedRefId = null;
    STATE.selectedPropId = null;
    STATE.selectedPaletteId = null;
    STATE.selectedMusicId = null;
  }
}

function cloneJSON(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function createScenePack() {
  if (!STATE.scenes || STATE.scenes.length === 0) {
    return null;
  }

  const projectTopic = document.getElementById('project-topic').value || 'Mamilas Projesi';
  const world = BRAIN.worlds.find(w => w.id === STATE.selectedWorldId);
  refreshSceneHandoffPackets(projectTopic);
  const preservedPack = cloneJSON(STATE.importedScenePack) || {};
  const preservedScenes = Array.isArray(preservedPack.scenes) ? preservedPack.scenes : [];
  const preservedById = new Map(preservedScenes.map(scene => [scene.id, scene]));
  const currentIds = new Set(STATE.scenes.map(scene => scene.id));

  const scenes = STATE.scenes.map(scene => {
    const preserved = preservedById.get(scene.id) || {};
    return {
      ...preserved,
      id: scene.id,
      topic: scene.topic,
      sceneArchitecture: cloneJSON(scene.sceneArchitecture),
      finalBrief: cloneJSON(scene.finalBrief),
      semanticFingerprint: scene.semanticFingerprint,
      modelAdapter: cloneJSON(scene.modelAdapter),
      targetModels: cloneJSON(scene.targetModels),
      handoffPackets: cloneJSON(scene.handoffPackets),
      draftPrompt: scene.draftPrompt,
      canonicalPrompt: scene.canonicalPrompt || '',
      canonicalSunoPrompt: scene.canonicalSunoPrompt || '',
      imagePrompt: scene.imagePrompt,
      imageFile: scene.imageFile !== undefined ? scene.imageFile : (preserved.imageFile || ''),
      motionPrompt: scene.motionPrompt || '',
      negatives: cloneJSON(scene.perSceneNegatives !== undefined ? scene.perSceneNegatives : (preserved.negatives || [])),
      proof: cloneJSON(scene.proof !== undefined ? scene.proof : preserved.proof),
      agentResults: cloneJSON(scene.agentResults !== undefined ? scene.agentResults : (preserved.agentResults || {}))
    };
  });
  preservedScenes.forEach(scene => {
    if (!currentIds.has(scene.id)) scenes.push(scene);
  });

  return {
    ...preservedPack,
    packetVersion: preservedPack.packetVersion || '1.0.0',
    project: projectTopic,
    projectState: {
      ...(preservedPack.projectState || {}),
      selectedWorldId: STATE.selectedWorldId,
      selectedRefId: STATE.selectedRefId,
      character: STATE.character,
      modelGrounding: cloneJSON(STATE.modelGrounding)
    },
    world: world ? world.name : 'Bilinmeyen Dünya',
    contract: 'MAMILAS_D6_ORCHESTRATOR_AGENT_ROUND_TRIP',
    handoffPackets: scenes.flatMap(scene => cloneJSON(scene.handoffPackets || [])),
    _instructions: "Each receiving agent must resolve the current target-model version live, then return JSON with packetId, projectId, role, sceneId, finalPrompt, perSceneNegatives, and proof. Never overwrite world or source locks.",
    scenes
  };
}

function applyAgentResult(result) {
  const sceneId = Number(result && (result.sceneId !== undefined ? result.sceneId : result.scene && result.scene.id));
  const role = String(result && result.role || '').toUpperCase();
  const finalPrompt = result && (result.finalPrompt || result.output && result.output.finalPrompt);
  const target = STATE.scenes.find(scene => scene.id === sceneId);
  if (!target || !['IMAGE', 'MOTION', 'SUNO'].includes(role) || typeof finalPrompt !== 'string' || !finalPrompt.trim()) {
    return { status: 'BLOCKED', code: 'INVALID_AGENT_RESULT', sceneId, role };
  }

  const expectedPacket = (target.handoffPackets || []).find(packet => packet.role === role);
  if (result.packetId && expectedPacket && result.packetId !== expectedPacket.packetId) {
    return { status: 'BLOCKED', code: 'PACKET_ID_MISMATCH', sceneId, role };
  }
  if (result.projectId && expectedPacket && result.projectId !== expectedPacket.projectId) {
    return { status: 'BLOCKED', code: 'PROJECT_ID_MISMATCH', sceneId, role };
  }

  target.agentResults = target.agentResults || {};
  target.agentResults[role] = cloneJSON(result);
  if (Array.isArray(result.perSceneNegatives)) target.perSceneNegatives = cloneJSON(result.perSceneNegatives);
  if (result.proof !== undefined) target.proof = cloneJSON(result.proof);

  if (role === 'IMAGE') {
    target.canonicalPrompt = finalPrompt;
    target.imagePrompt = finalPrompt;
    target.imageStatus = 'done';
  } else if (role === 'MOTION') {
    target.motionPrompt = finalPrompt;
    target.videoStatus = 'done';
  } else {
    target.canonicalSunoPrompt = finalPrompt;
    target.sunoStatus = 'done';
  }
  return { status: 'APPLIED', sceneId, role };
}

function applyScenePack(data) {
  if (!data || (!Array.isArray(data.scenes) && !Array.isArray(data.agentResults) && !data.role)) {
    return { status: 'BLOCKED', code: 'INVALID_SCENE_PACK', updated: 0 };
  }

  STATE.importedScenePack = cloneJSON(data);
  let updated = 0;
  (data.scenes || []).forEach(importedScene => {
    const target = STATE.scenes.find(scene => scene.id === importedScene.id);
    if (!target) return;
    if (typeof importedScene.motionPrompt === 'string') {
      target.motionPrompt = importedScene.motionPrompt;
      target.videoStatus = importedScene.motionPrompt ? 'done' : target.videoStatus;
    }
    if (Array.isArray(importedScene.negatives)) {
      target.perSceneNegatives = cloneJSON(importedScene.negatives);
    }
    if (typeof importedScene.canonicalPrompt === 'string' && importedScene.canonicalPrompt) {
      target.canonicalPrompt = importedScene.canonicalPrompt;
      target.imagePrompt = importedScene.canonicalPrompt;
      target.imageStatus = 'done';
    }
    if (importedScene.proof !== undefined) target.proof = cloneJSON(importedScene.proof);
    if (importedScene.agentResults && typeof importedScene.agentResults === 'object') {
      target.agentResults = cloneJSON(importedScene.agentResults);
    }
    if (typeof importedScene.imageFile === 'string') target.imageFile = importedScene.imageFile;
    updated++;
  });
  const agentResults = Array.isArray(data.agentResults) ? data.agentResults : data.role ? [data] : [];
  const resultDetails = agentResults.map(applyAgentResult);
  updated += resultDetails.filter(result => result.status === 'APPLIED').length;
  saveState();
  return {
    status: resultDetails.some(result => result.status === 'BLOCKED') ? 'IMPORTED_WITH_BLOCKS' : 'IMPORTED',
    updated,
    results: resultDetails
  };
}

function exportScenePack() {
  const exportData = createScenePack();
  if (!exportData) {
    showToast("Dışa aktarılacak sahne yok.", "error");
    return;
  }
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", url);
  downloadAnchorNode.setAttribute("download", exportData.project.replace(/\s+/g, '_') + "_Scenes.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  document.body.removeChild(downloadAnchorNode);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importScenePack(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        throw new Error('Geçersiz dosya formatı.');
      }
      
      parsed.scenes.forEach(s => {
        if (!s.id || typeof s.id !== 'number' || !s.topic) throw new Error('Scene corruption');
      });
      
      STATE.importedScenePack = parsed;
      showToast('📦 Scene Pack başarıyla içe aktarıldı.', 'success');
      
      const result = applyScenePack(parsed);
      const updated = result.updated;
      
      if (updated > 0) {
        showToast(`${updated} sahne/ajan sonucu içe aktarıldı.`);
      } else {
        showToast("JSON geçerli ama eşleşen veya güncellenecek yeni sahne bulunamadı.", "warning");
      }
      
      saveState();
      renderTable();
      renderDetailPanel();
    } catch (error) {
      showToast("Geçersiz veya bozuk JSON dosyası.", "error");
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };
  reader.onerror = () => {
    showToast("Dosya okuma hatası.", "error");
    event.target.value = '';
  };
  reader.readAsText(file);
}

// Boot-time dependency assertion: log loudly if optional modules failed to load.
// Keeps the app working (graceful degrade) but makes silent absence visible to
// devs and to qa_capture.js.
function assertWindowDeps() {
  const expected = ['AudioEngine', 'drawPacingGraph', 'showToast', 'saveProjectToDisk', 'loadProjectFromDisk', 'exportTimelineXML', 'generateABTestBrief'];
  const missing = expected.filter(k => typeof window[k] === 'undefined');
  if (missing.length > 0) {
    console.warn('[mamilas] optional window deps missing:', missing.join(', '),
      '— affected buttons will gracefully degrade.');
  }
  return missing;
}

function checkHealth() {
  const dot = document.getElementById('health-dot');
  const text = document.getElementById('health-text');
  if(!dot) return;
  fetch('/api/health')
    .then(r => {
      if(r.ok) {
        dot.classList.add('online');
        dot.classList.remove('offline');
        if(text) text.innerText = 'MAMILAS PRO (Bağlı)';
        if (window.AudioEngine && !window.AudioEngine.initialized) {
          window.AudioEngine.init();
          window.AudioEngine.initialized = true;
        }
      } else {
        throw new Error('Not ok');
      }
    })
    .catch(() => {
      dot.classList.add('offline');
      dot.classList.remove('online');
      if(text) text.innerText = 'MAMILAS PRO (Offline)';
    });
}

// Bindings and Startup
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initUI();
  restoreProjectControls();
  bindProjectPersistence();
  loadModelRegistry().catch(() => {});
  loadMusicRegistry().catch(() => {});
  
  const soundToggle = document.getElementById('btn-sound-toggle');
  if (soundToggle) {
    soundToggle.onclick = () => {
      window.isSoundOn = !window.isSoundOn;
      soundToggle.innerText = window.isSoundOn ? '🔊' : '🔇';
      if (window.AudioEngine) {
        window.AudioEngine.toggle(window.isSoundOn);
        if (window.isSoundOn) {
          window.AudioEngine.init();
          window.AudioEngine.click();
        }
      }
    };
    window.isSoundOn = true;
  }

  const focusToggle = document.getElementById('btn-focus-toggle');
  if (focusToggle) {
    focusToggle.onclick = () => {
      document.body.classList.toggle('focus-mode');
      const isFocus = document.body.classList.contains('focus-mode');
      focusToggle.innerText = isFocus ? '🧿' : '👁️';
      if (window.AudioEngine && window.isSoundOn) window.AudioEngine.hover();
    };
  }

  assertWindowDeps();
  checkHealth();
  syncDetailActions(null);
  
  // Restore character selection
  document.querySelectorAll('.char-btn').forEach(btn => {
    if (STATE.character === btn.getAttribute('data-char')) {
      document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
  
  // Render scenes if loaded
  if (STATE.scenes && STATE.scenes.length > 0) {
    renderTable();
    renderDetailPanel();
  }
  
  // Bind JSON buttons
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) {
    btnExport.dataset.actionBound = 'true';
    btnExport.onclick = exportScenePack;
  }
  
  const btnImport = document.getElementById('btn-import-json');
  const fileImport = document.getElementById('file-import-json');
  if (btnImport && fileImport) {
    btnImport.dataset.actionBound = 'true';
    btnImport.onclick = () => fileImport.click();
    fileImport.onchange = importScenePack;
  }

  // NEW BUTTON BINDINGS
  const btnApiSave = document.getElementById('btn-api-save');
  if (btnApiSave) {
    let isSaving = false;
    btnApiSave.addEventListener('click', async () => {
      if (!window.saveProjectToDisk) return alert("API module missing.");
      if (isSaving) return;
      isSaving = true;
      const originalText = btnApiSave.innerText;
      try {
        btnApiSave.disabled = true;
        btnApiSave.innerText = "Kaydediliyor...";
        await window.saveProjectToDisk({ ...STATE, version: "1.0.0" });
        alert("Proje başarıyla Backend'e kaydedildi!");
      } catch (err) {
        alert("Hata: Proje kaydedilemedi.");
      } finally {
        btnApiSave.innerText = originalText;
        btnApiSave.disabled = false;
        isSaving = false;
      }
    });
  }

  const btnXmlExport = document.getElementById('btn-export-xml');
  if (btnXmlExport) {
    btnXmlExport.addEventListener('click', () => {
      if (!window.exportTimelineXML) return alert("XML Exporter missing.");
      window.exportTimelineXML(STATE.scenes);
    });
  }

  const btnAbTest = document.getElementById('btn-ab-test');
  if (btnAbTest) {
    btnAbTest.addEventListener('click', () => {
      if (!window.generateABTestBrief) return alert("A/B Tester missing.");
      const markdown = window.generateABTestBrief(STATE.scenes, "Kling", "Sora");
      alert("A/B Test konsola yazdırıldı!");
      console.log(markdown);
    });
  }
});
function showToast(msg, type) {
  console.log('TOAST: ' + type + ' - ' + msg);
}
