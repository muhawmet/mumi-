const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const app = express();
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors(ALLOWED_ORIGINS.length > 0
  ? { origin: ALLOWED_ORIGINS }
  : {}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore', index: 'index.html' }));

const BRAIN_DIR = path.join(__dirname, 'brain');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const APP_ID = 'mamilas-new';

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: APP_ID,
    version: packageJson.version,
    pid: process.pid
  });
});

// GET /api/worlds — tüm dünya listesi
app.get('/api/worlds', (req, res) => {
  res.json(VISUAL_WORLDS);
});

// POST /api/generate-card
// Body: { topic, grade, sceneIndex, sceneCount, world, character, imageModel, videoModel, notes }
// Returns: { imagePrompt, videoPrompt, sunoPrompt, inputCard }
app.post('/api/generate-card', (req, res) => {
  const { topic, grade, sceneIndex, sceneCount, world, character, imageModel, videoModel, notes } = req.body;
  
  const worldData = VISUAL_WORLDS.find(w => w.id === world) || VISUAL_WORLDS[0];
  
  const inputCard = buildInputCard({ topic, grade, sceneIndex, sceneCount, world: worldData, character, imageModel, videoModel, notes });
  
  res.json({
    inputCard,
    imageModel,
    videoModel,
    world: worldData.name
  });
});

// POST /api/generate-batch
// Body: { topic, grade, sceneCount, world, character, imageModel, videoModel }
// Returns: { scenes: [{ sceneIndex, inputCard, ... }] }
app.post('/api/generate-batch', (req, res) => {
  const { topic, grade, sceneCount, world, character, imageModel, videoModel } = req.body;
  
  const parsedCount = parseInt(sceneCount, 10);
  if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 100) {
    return res.status(400).json({ error: 'Invalid sceneCount. Must be an integer between 1 and 100.' });
  }
  
  const worldData = VISUAL_WORLDS.find(w => w.id === world) || VISUAL_WORLDS[0];
  
  const scenes = Array.from({ length: parsedCount }, (_, i) => ({
    id: i + 1,
    topic: `${topic} — Sahne ${i + 1}`,
    inputCard: buildInputCard({ topic, grade, sceneIndex: i + 1, sceneCount: parsedCount, world: worldData, character, imageModel, videoModel }),
    imagePrompt: '',
    videoPrompt: '',
    sunoPrompt: '',
    status: 'pending', // pending | in-progress | done
    imageStatus: 'pending',
    videoStatus: 'pending',
    sunoStatus: 'pending',
  }));
  
  res.json({ scenes, total: scenes.length });
});

function safeProjectPath(projectId) {
  if (typeof projectId !== 'string' || projectId.length === 0 || projectId.length > 64) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) return null;
  const candidate = path.join(DATA_DIR, `${projectId}.json`);
  const resolved = path.resolve(candidate);
  if (path.dirname(resolved) !== path.resolve(DATA_DIR)) return null;
  return resolved;
}

// POST /api/projects/:id — projeyi diske kaydet
app.post('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const filePath = safeProjectPath(projectId);
  if (!filePath) {
    return res.status(400).json({ error: 'Invalid project ID format' });
  }
  const data = req.body;
  
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error saving project:', err);
      return res.status(500).json({ error: 'Failed to save project' });
    }
    res.json({ success: true, message: 'Project saved successfully', id: projectId });
  });
});

// GET /api/projects/:id — projeyi diskten yükle
app.get('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const filePath = safeProjectPath(projectId);
  if (!filePath) {
    return res.status(400).json({ error: 'Invalid project ID format' });
  }
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Error loading project:', err);
      return res.status(500).json({ error: 'Failed to load project' });
    }
    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (parseErr) {
      console.error('Error parsing project data:', parseErr);
      res.status(500).json({ error: 'Failed to parse project data' });
    }
  });
});

// Centralized error handler — never leak stack traces to clients.
// Must be registered AFTER all routes; we re-attach below `module.exports` time
// via startServer wiring. Keeping it as a named middleware here.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err && (err.status || err.statusCode);
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large (limit 1mb)' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error('Unhandled server error:', err);
  res.status(status || 500).json({ error: 'Internal server error' });
}

function buildInputCard({ topic, grade, sceneIndex, sceneCount, world, character, imageModel, videoModel, notes }) {
  return `MAMILAS SAHNE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJE: ${topic}
SINIF: ${grade}. Sınıf
SAHNE: ${sceneIndex} / ${sceneCount}
VİZYONEL DÜNYA: ${world.id}
KARAKTER: ${character}
IMAGE MODEL: ${imageModel}
VIDEO MODEL: ${videoModel}
${notes ? `NOT: ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: Bu brief için sırasıyla üret:
1. IMAGE PROMPT (${imageModel} için — world render kurallarına göre)
2. VIDEO PROMPT (${videoModel} için — world motion kurallarına göre)
3. SUNO BRIEF (world × music mapping kurallarına göre)

Her çıktı paste-ready olacak. Açıklama yok, sadece çıktı.`;
}

const VISUAL_WORLDS = [
  { id: 'paper_diorama', name: 'Paper Diorama', category: 'tactile', emoji: '📄' },
  { id: 'clay_diorama', name: 'Clay Diorama', category: 'tactile', emoji: '🎨' },
  { id: 'pixar_feature', name: 'Pixar Feature', category: 'animation', emoji: '✨' },
  { id: 'watercolor_storybook', name: 'Watercolor Storybook', category: 'animation', emoji: '🎨' },
  { id: 'arcane_edu', name: 'Arcane (Edu)', category: 'arcane', emoji: '⚡' },
  { id: 'arcane_painterly', name: 'Arcane Painterly', category: 'arcane', emoji: '🌆' },
  { id: 'arcane_undercity', name: 'Arcane Undercity', category: 'arcane', emoji: '🌑' },
  { id: 'verse_edu', name: 'Spider-Verse (Edu)', category: 'verse', emoji: '🕷️' },
  { id: 'verse_miles', name: 'Spider-Verse Miles', category: 'verse', emoji: '🌆' },
  { id: 'verse_gwen', name: 'Spider-Verse Gwen', category: 'verse', emoji: '🌸' },
  { id: 'verse_noir', name: 'Spider-Verse Noir', category: 'verse', emoji: '🎭' },
  { id: 'anime_edu', name: 'Anime (Edu)', category: 'anime', emoji: '⚔️' },
  { id: 'anime_cel', name: 'Anime Cel', category: 'anime', emoji: '🌸' },
  { id: 'demon_slayer_visual', name: 'Demon Slayer', category: 'anime', emoji: '🔥' },
  { id: 'ghibli_storybook', name: 'Ghibli Storybook', category: 'ghibli', emoji: '🍃' },
  { id: 'ghibli_felt_edu', name: 'Ghibli + Felt', category: 'ghibli', emoji: '🧶' },
  { id: 'chalk_universe', name: 'Chalk Universe', category: 'animation', emoji: '🖊️' },
  { id: 'flat_vector_cartoon', name: 'Flat Vector', category: 'animation', emoji: '🔷' },
  { id: 'shadow_puppet', name: 'Shadow Puppet', category: 'tactile', emoji: '🎪' },
  { id: 'book_theater', name: 'Book Theater', category: 'tactile', emoji: '📚' },
  { id: 'wood_diorama', name: 'Wood Diorama', category: 'tactile', emoji: '🪵' },
  { id: 'felt_diorama', name: 'Felt Diorama', category: 'tactile', emoji: '🧶' },
  { id: 'stained_glass', name: 'Stained Glass', category: 'tactile', emoji: '🌈' },
  { id: 'graphic_poster_world', name: 'Graphic Poster', category: 'animation', emoji: '🖼️' },
  { id: 'oil_painted_classic', name: 'Oil Painted', category: 'animation', emoji: '🖌️' },
  { id: 'cinematic_real', name: 'Cinematic Realism', category: 'cinematic', emoji: '🎬' },
];

app.use(errorHandler);

function startServer({
  host = process.env.HOST || '127.0.0.1',
  port = Number.parseInt(process.env.PORT || '3001', 10)
} = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  const server = app.listen(port, host, error => {
    if (error) return;
    const address = server.address();
    const boundPort = typeof address === 'object' && address ? address.port : port;
    console.log(`MAMILAS_NEW_READY url=http://${host}:${boundPort} pid=${process.pid} version=${packageJson.version}`);
  });

  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`MAMILAS_PORT_IN_USE host=${host} port=${port} pid=${process.pid}`);
      process.exitCode = 1;
      return;
    }
    console.error(`MAMILAS_SERVER_ERROR code=${error.code || 'UNKNOWN'} message=${error.message}`);
    process.exitCode = 1;
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { APP_ID, app, startServer };
