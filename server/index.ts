import express, { type Request, type Response, type NextFunction } from 'express';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from './env.ts';
import { store } from './store.ts';
import { aiEnabled, generateBlueprint } from './ai.ts';
import { rateLimit } from './rateLimit.ts';
import { AIifyRequestSchema, EventsSchema, projectInputProblem, RegistrationSchema } from '../shared/validation.ts';
import { findByCode, leaderboard, recordEvents, register, simulateReferral, stats, toPublic } from '../shared/domain.ts';
import { firstName, makeId } from '../shared/ids.ts';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
// Dev-only: save the rendered OpenGraph image produced by /og.
app.post('/api/dev/og', express.json({ limit: '4mb' }), (req, res) => {
  if (env.production) return fail(res, 404, 'not_found', 'Not found');
  const m = String(req.body?.dataUrl ?? '').match(/^data:image\/png;base64,(.+)$/);
  if (!m) return fail(res, 400, 'bad_image', 'Expected a PNG data URL');
  writeFileSync(join('public', 'og.png'), Buffer.from(m[1]!, 'base64'));
  res.json({ ok: true });
});

app.use(express.json({ limit: '64kb' }));

const LOOPBACK = new Set(['::1', '127.0.0.1', '::ffff:127.0.0.1']);
/** Salted IP hash for abuse checks. Loopback is skipped in dev so one laptop can test the referral loop. */
const ipHash = (req: Request) =>
  !env.production && LOOPBACK.has(req.ip ?? '') ? undefined : createHash('sha256').update(`${req.ip}${env.ipSalt}`).digest('hex').slice(0, 16);
const fail = (res: Response, status: number, code: string, message: string) => res.status(status).json({ error: { code, message } });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: aiEnabled(), demo: env.demoMode, publicUrl: env.publicUrl });
});

// ── AI-ify ────────────────────────────────────────────────────────────
app.post('/api/aiify', rateLimit('aiify', 20, 10 * 60_000), async (req, res) => {
  const parsed = AIifyRequestSchema.safeParse(req.body);
  const problem = projectInputProblem(String(req.body?.project ?? ''));
  if (!parsed.success || problem) return fail(res, 400, 'invalid_project', problem ?? 'Tell us a bit more about your project.');
  const out = await generateBlueprint(parsed.data.project, parsed.data.context, { demo: parsed.data.demo });
  if ('invalid' in out) return fail(res, 422, 'invalid_project', 'That doesn’t look like a project yet. Try something like “smart parking system”.');
  store.write((d) => {
    d.blueprints[out.blueprint.id] = out.blueprint;
  });
  res.json({ blueprint: out.blueprint });
});

app.get('/api/blueprints/:id', (req, res) => {
  const bp = store.read().blueprints[req.params.id];
  if (!bp) return fail(res, 404, 'not_found', 'That project link has expired.');
  res.json({ blueprint: bp });
});

// ── Registration + referrals ─────────────────────────────────────────
app.post('/api/register', rateLimit('register', 8, 10 * 60_000), (req, res) => {
  const parsed = RegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return res.status(400).json({ error: { code: 'invalid', message: 'Check the highlighted fields.', fields } });
  }
  const out = store.write((d) => {
    const r = register(d, parsed.data, { now: new Date(), ipHash: ipHash(req) });
    if (r.ok && r.events.length) recordEvents(d, r.events.map((e) => ({ ...e, sessionId: 'server' })));
    return r;
  });
  if (!out.ok) return fail(res, 409, out.code, out.message);
  res.status(out.result.status === 'created' ? 201 : 200).json(out.result);
});

/** Dashboard data. Needs the private token so a public referral link can't expose progress. */
app.get('/api/me/:code', (req, res) => {
  const d = store.read();
  const u = findByCode(d, req.params.code);
  if (!u || req.get('x-dash-token') !== u.dashToken) return fail(res, 404, 'not_found', 'We couldn’t find that dashboard.');
  res.json({ user: toPublic(d, u), leaderboard: leaderboard(d, { collegeKey: u.collegeKey, limit: 5 }) });
});

/** Public: who invited me? (first name + college only). */
app.get('/api/r/:code', (req, res) => {
  const u = findByCode(store.read(), req.params.code);
  if (!u) return res.json({ valid: false });
  res.json({ valid: true, code: u.referralCode, firstName: firstName(u.name), college: u.college, project: u.generatedProject ?? null });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard(store.read(), { collegeKey: typeof req.query.college === 'string' ? req.query.college : undefined, limit: 6 }));
});

app.get('/api/colleges', (_req, res) => {
  const d = store.read();
  const names = new Set([...d.seeds.map((s) => s.name), ...d.users.map((u) => u.college)]);
  res.json({ colleges: [...names].sort() });
});

// ── Analytics ────────────────────────────────────────────────────────
app.post('/api/events', express.text({ type: 'text/plain', limit: '64kb' }), rateLimit('events', 120, 60_000), (req, res) => {
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body); // sendBeacon posts text/plain
    } catch {
      return res.status(204).end();
    }
  }
  const parsed = EventsSchema.safeParse(body);
  if (parsed.success) store.write((d) => recordEvents(d, parsed.data.events));
  res.status(204).end();
});

const requireAdmin = (req: Request, res: Response, next: NextFunction) =>
  req.get('x-admin-key') === env.adminKey ? next() : fail(res, 401, 'unauthorized', 'Wrong admin key.');

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json(stats(store.read(), { includeDemo: req.query.demo === '1' }));
});

app.get('/api/admin/export.csv', requireAdmin, (_req, res) => {
  const cols = ['createdAt', 'name', 'email', 'phone', 'college', 'branch', 'year', 'source', 'campaign', 'referralCode', 'referredBy', 'referralCount', 'rewardUnlocked', 'originalProject', 'generatedProject'] as const;
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = store.read().users.filter((u) => !u.demo).map((u) => cols.map((c) => esc(u[c])).join(','));
  res.type('text/csv').attachment('registrations.csv').send([cols.join(','), ...rows].join('\n'));
});

// ── Demo mode ────────────────────────────────────────────────────────
app.post('/api/demo/referral', (req, res) => {
  if (!env.demoMode) return fail(res, 404, 'not_found', 'Not found');
  const code = String(req.body?.code ?? '');
  const d = store.read();
  const u = findByCode(d, code);
  if (!u || req.get('x-dash-token') !== u.dashToken) return fail(res, 404, 'not_found', 'Unknown code');
  const out = store.write((data) => {
    const r = simulateReferral(data, code, { now: new Date(), ipHash: makeId(8) });
    if (r?.ok) recordEvents(data, r.events.map((e) => ({ ...e, sessionId: `demo-${makeId(6)}` })));
    return r;
  });
  if (!out?.ok) return fail(res, 400, 'demo_failed', 'Could not simulate a referral');
  res.json({ user: toPublic(store.read(), u), leaderboard: leaderboard(store.read(), { collegeKey: u.collegeKey, limit: 5 }) });
});

app.use('/api', (_req, res) => fail(res, 404, 'not_found', 'Not found'));

// ── Static app (production) ──────────────────────────────────────────
const dist = resolve('dist');
if (existsSync(dist)) {
  const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    let html = indexHtml.replaceAll('%PUBLIC_URL%', env.publicUrl);
    // Shared project links get a personalised preview in WhatsApp / LinkedIn.
    const m = req.path.match(/^\/p\/([a-z0-9]+)$/);
    const bp = m ? store.read().blueprints[m[1]!] : undefined;
    if (bp) {
      const t = `I AI-ified my project: ${bp.projectName}`.replace(/"/g, '&quot;');
      html = html.replace(/(<meta property="og:title" content=")[^"]*/, `$1${t}`).replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${t}`);
    }
    res.type('html').send(html);
  });
}

app.listen(env.port, () => {
  console.log(`[api] http://localhost:${env.port}  ai=${aiEnabled() ? env.aiModel : 'patterns-only'}  demo=${env.demoMode}`);
});
