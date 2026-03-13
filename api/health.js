const APPS = [
  { id: 'seo', name: 'Auditoria de SEO', url: 'https://audit-seo-azure.vercel.app/' },
  { id: 'erp', name: 'ERP', url: 'https://guessless.vercel.app/erp' },
  { id: 'jarvis', name: 'Jarvis', url: 'https://clarim.vercel.app/jarvis' },
  { id: 'meivende', name: 'MeiVende', url: 'https://axiom-guessless.vercel.app/' },
  { id: 'atlas', name: 'Atlas', url: 'https://atlas-na-web.vercel.app/' },
  { id: 'dash', name: 'Dash', url: 'https://trafic-eli.vercel.app/' },
];

const TIMEOUT_MS = 8000;

async function pingApp(app) {
  const start = Date.now();
  try {
    // Bug #3 fix: use GET instead of HEAD — some servers reject HEAD
    const res = await fetch(app.url, {
      method: 'GET',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });
    const latency = Date.now() - start;
    // Bug #2 fix: simplify to online/offline only (no degraded state)
    return {
      id: app.id,
      name: app.name,
      status: res.ok || res.status === 304 ? 'online' : 'offline',
      statusCode: res.status,
      latency,
    };
  } catch {
    return {
      id: app.id,
      name: app.name,
      status: 'offline',
      statusCode: null,
      latency: null,
    };
  }
}

export default async function handler(req, res) {
  // Bug #5 fix: handle OPTIONS preflight and restrict to GET
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  const results = await Promise.allSettled(APPS.map(pingApp));
  // Bug #4 fix: check fulfilled status before accessing value
  const apps = results.map((r) =>
    r.status === 'fulfilled' && r.value
      ? r.value
      : { id: 'unknown', name: 'Unknown', status: 'offline', statusCode: null, latency: null }
  );

  const onlineApps = apps.filter((a) => a.status === 'online');
  const latencies = onlineApps.map((a) => a.latency).filter(Boolean);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
    : null;

  res.status(200).json({
    timestamp: new Date().toISOString(),
    summary: {
      total: apps.length,
      online: onlineApps.length,
      avgLatency,
    },
    apps,
  });
}
