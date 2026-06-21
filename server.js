

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const app = express();

// Middleware MUST be before routes
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors(ALLOWED_ORIGINS.length > 0 ? { origin: ALLOWED_ORIGINS } : {}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore', index: 'index.html' }));

// --- PHASE D: JOB QUEUE SKELETON (NO ACTUAL API COSTS) ---
const JOB_QUEUE = new Map();
let jobIdCounter = 1;

function processJobMock(jobId) {
  const job = JOB_QUEUE.get(jobId);
  if (!job) return;
  
  job.status = 'PROCESSING';
  
  // Simulate network delay and processing (2-4 seconds)
  const delay = Math.floor(Math.random() * 2000) + 2000;
  
  setTimeout(() => {
    job.status = 'COMPLETED';
    job.result = {
      type: job.type,
      message: `MOCK_${job.type}_SUCCESS`,
      url: `/mock-assets/${job.type.toLowerCase()}-${Date.now()}.mp4`,
      completedAt: new Date().toISOString()
    };
  }, delay);
}

// POST /api/jobs/enqueue
// Body: { type: 'IMAGE' | 'MOTION' | 'SUNO' | 'VOICE', payload: {...} }
app.post('/api/jobs/enqueue', (req, res) => {
  const { type, payload } = req.body;
  
  if (!['IMAGE', 'MOTION', 'SUNO', 'VOICE'].includes(type)) {
    return res.status(400).json({ error: 'invalid_job_type' });
  }
  
  const jobId = `job_${Date.now()}_${jobIdCounter++}`;
  JOB_QUEUE.set(jobId, {
    id: jobId,
    type,
    payload,
    status: 'QUEUED', // QUEUED, PROCESSING, COMPLETED, FAILED
    createdAt: new Date().toISOString()
  });
  
  // Asynchronously process the job
  processJobMock(jobId);
  
  res.json({ success: true, jobId, status: 'QUEUED' });
});

// GET /api/jobs/:id
app.get('/api/jobs/:id', (req, res) => {
  const job = JOB_QUEUE.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'job_not_found' });
  res.json(job);
});
// ------------------------------------------------------------




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

// GET /api/brain — brain/*.md dosya listesi + meta (boyut)
app.get('/api/brain', (_req, res) => {
  try {
    const files = fs.readdirSync(BRAIN_DIR)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => {
        const full = path.join(BRAIN_DIR, f);
        const stat = fs.statSync(full);
        return { name: f, bytes: stat.size, modified: stat.mtime.toISOString() };
      });
    res.json({ sections: files });
  } catch (e) {
    res.status(500).json({ error: 'brain_index_failed' });
  }
});

// GET /api/brain/:section — tek brain dosyasının içeriği (sadece beyaz liste)
app.get('/api/brain/:section', (req, res) => {
  const raw = String(req.params.section || '');
  if (!/^[A-Za-z0-9_]+\.md$/.test(raw)) {
    return res.status(400).json({ error: 'invalid_section_name' });
  }
  const full = path.join(BRAIN_DIR, raw);
  if (!full.startsWith(BRAIN_DIR + path.sep)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'not_found' });
    const text = fs.readFileSync(full, 'utf8');
    res.type('text/markdown').send(text);
  } catch (e) {
    res.status(500).json({ error: 'read_failed' });
  }
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

let VISUAL_WORLDS = [];
try {
  VISUAL_WORLDS = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'worlds.json'), 'utf8'));
} catch (e) {
  console.error('Failed to load worlds.json', e);
}

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
