// Minimal reference backend for URM's ViewPersistenceConfig 'api' mode.
// Stands in for a real database with one JSON file per reportId.
//
// Endpoints:
//   GET  /api/views?reportId=X   -> { views: View[], activeViewId: string }
//   POST /api/views              -> body { reportId, views, activeViewId } -> persists, returns { ok: true }

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const PORT = 4000;

function dataFile(reportId) {
  return path.join(DATA_DIR, `${reportId}.json`);
}

async function readViews(reportId) {
  try {
    const raw = await fs.readFile(dataFile(reportId), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { views: [], activeViewId: '' };
  }
}

async function writeViews(reportId, payload) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(dataFile(reportId), JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/api/views') {
    const reportId = url.searchParams.get('reportId');
    if (!reportId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'reportId query param required' }));
      return;
    }
    const payload = await readViews(reportId);
    console.log(`[server] GET /api/views?reportId=${reportId} -> ${payload.views.length} views`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/views') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { reportId, views, activeViewId } = JSON.parse(body);
      await writeViews(reportId, { views, activeViewId });
      console.log(
        `[server] POST /api/views reportId=${reportId} -> saved ${views.length} views, active="${activeViewId}"`,
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`[server] URM view-persistence reference API listening on http://localhost:${PORT}`);
});
