const http = require('http');

const NUM_REQUESTS = 20000;
const CONCURRENCY = 200;
const URL = 'http://localhost:3001/api/jobs/enqueue';

const payload = JSON.stringify({ type: 'IMAGE', payload: {} });

let completed = 0;
let failed = 0;
let success = 0;

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

function sendRequest() {
    return new Promise((resolve) => {
        const req = http.request(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            agent: agent
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    success++;
                } else {
                    failed++;
                    // console.error(`Failed with status ${res.statusCode}: ${data}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            failed++;
            // console.error(`Request error: ${err.message}`);
            resolve();
        });

        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log(`Starting stress test: ${NUM_REQUESTS} requests with concurrency ${CONCURRENCY}...`);
    const startTime = Date.now();
    let currentIndex = 0;

    async function worker() {
        while (true) {
            // Get the next index to process
            const taskIndex = currentIndex++;
            if (taskIndex >= NUM_REQUESTS) {
                break;
            }
            
            await sendRequest();
            completed++;
            if (completed % 2000 === 0) {
                console.log(`Completed ${completed}/${NUM_REQUESTS} requests...`);
            }
        }
    }

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n--- Stress Test Report ---');
    console.log(`Total Requests: ${NUM_REQUESTS}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`Successful: ${success}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Requests/sec: ${(NUM_REQUESTS / duration).toFixed(2)}`);
}

run().catch(console.error);
