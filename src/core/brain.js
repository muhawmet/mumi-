window.window.BRAIN = {
  worlds: [],

  references: [
    {
      id: 'arcane', title: 'Arcane', kind: 'dizi', worldId: 'clay',
      dna: { palette: ['#0e7c7b', '#d62246', '#f4a259'], texture: 'oil-painted', lighting: 'neon chiaroscuro', linework: 'painterly', mood: 'dramatic, gritty, emotional' },
      previewArt: { gradient: 'linear-gradient(135deg,#0e7c7b,#1b1b2f 55%,#d62246)', overlay: 'crack-texture', accent: '#f4a259' }
    },
    {
      id: 'spiderverse', title: 'Spider-Verse', kind: 'film', worldId: 'verse_miles',
      dna: { palette: ['#e11d48', '#0ea5e9', '#facc15'], texture: 'halftone dots', lighting: 'pop chromatic', linework: 'comic ink', mood: 'kinetic, youthful' },
      previewArt: { gradient: 'linear-gradient(135deg,#e11d48,#7c3aed 50%,#0ea5e9)', overlay: 'halftone-dots', accent: '#facc15' }
    },
    {
      id: 'ghibli', title: 'Studio Ghibli', kind: 'anime', worldId: 'ghibli_storybook',
      dna: { palette: ['#34d399', '#bae6fd', '#fde68a'], texture: 'soft watercolor', lighting: 'warm natural', linework: 'gentle', mood: 'nostalgic, serene' },
      previewArt: { gradient: 'linear-gradient(135deg,#bae6fd,#34d399 60%,#fde68a)', overlay: 'soft-grain', accent: '#059669' }
    },
    {
      id: 'demonslayer', title: 'Demon Slayer', kind: 'anime', worldId: 'demon_slayer_visual',
      dna: { palette: ['#0ea5e9', '#f43f5e', '#1e1b4b'], texture: 'cel + ufotable fx', lighting: 'glowing effects', linework: 'sharp cel', mood: 'intense, elegant' },
      previewArt: { gradient: 'linear-gradient(135deg,#1e1b4b,#0ea5e9 55%,#f43f5e)', overlay: 'water-flow', accent: '#38bdf8' }
    },
    {
      id: 'pixar', title: 'Pixar (Coco/Soul)', kind: 'film', worldId: 'pixar_feature',
      dna: { palette: ['#fb7185', '#fbbf24', '#60a5fa'], texture: 'soft 3D subsurface', lighting: 'cinematic global illum', linework: 'none', mood: 'warm, heartfelt' },
      previewArt: { gradient: 'linear-gradient(135deg,#fb7185,#fbbf24 55%,#60a5fa)', overlay: 'soft-bokeh', accent: '#f59e0b' }
    },
    {
      id: 'klaus', title: 'Klaus', kind: 'film', worldId: 'arcane_edu',
      dna: { palette: ['#0f172a', '#38bdf8', '#e2e8f0'], texture: 'volumetric 2D', lighting: 'dramatic rim light', linework: 'soft painted', mood: 'festive, dramatic' },
      previewArt: { gradient: 'linear-gradient(135deg,#0f172a,#38bdf8 55%,#e2e8f0)', overlay: 'soft-grain', accent: '#0ea5e9' }
    },
    {
      id: 'mitchells', title: 'Mitchells vs Machines', kind: 'film', worldId: 'verse_edu',
      dna: { palette: ['#fb923c', '#ec4899', '#facc15'], texture: 'hand-drawn scribbles', lighting: 'pop bright', linework: 'marker lines', mood: 'chaotic, fun' },
      previewArt: { gradient: 'linear-gradient(135deg,#fb923c,#ec4899 55%,#facc15)', overlay: 'halftone-dots', accent: '#fbbf24' }
    },
    {
      id: 'edgerunners', title: 'Cyberpunk Edgerunners', kind: 'anime', worldId: 'anime_cel',
      dna: { palette: ['#facc15', '#ec4899', '#06b6d4'], texture: 'cel', lighting: 'neon glow', linework: 'sharp ink', mood: 'kinetic, tragic' },
      previewArt: { gradient: 'linear-gradient(135deg,#facc15,#ec4899 55%,#06b6d4)', overlay: 'crack-texture', accent: '#f472b6' }
    },
    {
      id: 'pussinboots', title: 'Puss in Boots: Last Wish', kind: 'film', worldId: 'clay',
      dna: { palette: ['#ef4444', '#f59e0b', '#10b981'], texture: 'painterly 3D', lighting: 'warm gold', linework: 'stepped paint', mood: 'adventurous, mythic' },
      previewArt: { gradient: 'linear-gradient(135deg,#ef4444,#f59e0b 55%,#10b981)', overlay: 'soft-bokeh', accent: '#facc15' }
    },
    {
      id: 'spidergwen', title: 'Spider-Verse Gwen', kind: 'film', worldId: 'verse_gwen',
      dna: { palette: ['#fbcfe8', '#f8fafc', '#94a3b8'], texture: 'watercolor bleed', lighting: 'pastel pink-white-grey', linework: 'delicate graphic', mood: 'ballet, quiet energy' },
      previewArt: { gradient: 'linear-gradient(135deg,#fbcfe8,#f8fafc 55%,#ec4899)', overlay: 'water-flow', accent: '#ec4899' }
    }
  ],

  negativeLibrary: {
    global: ['morphing', 'warping', 'melting', 'extra fingers', 'duplicated face', 'text artifacts', 'watermark', 'flickering', 'identity drift between frames'],
    perWorld: {
      arcane_painterly: ['plastic 3D', 'flat vector', 'cute softness', 'copied characters'],
      arcane_edu: ['undercity tunnel framing', 'cute softness', 'plastic 3D'],
      arcane_undercity: ['sky', 'open air', 'flat lighting'],
      verse_miles: ['photoreal skin', 'blurry edges', 'smooth gradients', 'web pattern', 'suit', 'copied character designs'],
      verse_gwen: ['kinetic diagonal chaos', 'copied character features'],
      verse_edu: ['photoreal skin', 'blurry edges', 'smooth gradients'],
      verse_noir: ['color distractions', 'Ben-Day dots'],
      anime_edu: ['copied faces', 'copied costumes', 'named powers'],
      anime_cel: ['copied faces', 'copied costumes'],
      demon_slayer_visual: ['copied character features', 'named technique text'],
      pixar_feature: ['flat classroom staging', 'generic shiny CGI', 'ominous lighting'],
      watercolor_storybook: ['hard digital lines', '3D shading', 'sharp vector edges'],
      ghibli_storybook: ['copied film locations', 'protected creature designs'],
      ghibli_felt_edu: ['copied film locations', 'sharp vector edges'],
      chalk_universe: ['hard digital glow', 'flat text walls'],
      flat_vector_cartoon: ['texture', 'gradient mush'],
      shadow_puppet: ['3D volume', 'front lighting'],
      book_theater: ['macro crop', 'plastic look'],
      wood_diorama: ['macro crop', 'messy clutter'],
      felt_diorama: ['macro crop', 'glossy surfaces'],
      paper_diorama: ['plastic look', 'flat lighting', 'macro crop'],
      clay_diorama: ['glossy CGI', 'perfectly smooth', 'macro crop'],
      stained_glass: ['3D rendering', 'flat color fields'],
      graphic_poster_world: ['busy detail', 'gradient soup', 'tiny unreadable text'],
      oil_painted_classic: ['flat poster feel', 'cheap filter look', 'copied artworks'],
      cinematic_real: ['plastic CGI', 'cartoon style', '2D illustration', 'oversaturated colors', 'drawings']
    }
  }
};

window.loadWorlds = async function() {
  if (window.BRAIN.worlds && window.BRAIN.worlds.length > 0) return;
  try {
    const res = await fetch('/api/taxonomy');
    const data = await res.json();
    window.BRAIN.taxonomy = data;
    window.BRAIN.worlds = data.worlds || data;
  } catch(e) {
    console.error('Failed to load worlds', e);
  }
};
