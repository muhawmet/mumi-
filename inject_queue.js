const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const queueSkeleton = `
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
      message: \`MOCK_\${job.type}_SUCCESS\`,
      url: \`/mock-assets/\${job.type.toLowerCase()}-\${Date.now()}.mp4\`,
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
  
  const jobId = \`job_\${Date.now()}_\${jobIdCounter++}\`;
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
`;

if (!serverCode.includes('PHASE D: JOB QUEUE SKELETON')) {
  // Insert before the listen call
  serverCode = serverCode.replace(/(let port = process\.env\.PORT || 3000;)/, queueSkeleton + '\n$1');
  
  // if not found, just insert before the startServer function
  if (!serverCode.includes('PHASE D')) {
    serverCode = serverCode.replace(/function startServer\(/, queueSkeleton + '\nfunction startServer(');
  }
  
  fs.writeFileSync('server.js', serverCode);
}
console.log("Queue skeleton injected.");
