// npm run check:all: the owner's one command. build, test, check-site (all 7 paths), a11y, gaps (all 7 paths), each with a
// timeout; a failed or timed-out step is reported and the rest still run. Prints one summary; exit 0 only if every step passed.
// Starts its own local server for check-site and kills it (and any Chrome a step left behind) when done.
import { spawn, spawnSync } from 'node:child_process';

const PORT = process.env.PORT || '4380', BASE = `http://localhost:${PORT}`;
const PATHS = ['/', '/events/', '/shop/', '/sell/', '/visit/', '/privacy/', '/nope'];
const node = process.execPath;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kill = (p) => { try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill('SIGKILL'); } catch {} };

function run(name, args, ms) {
  return new Promise((resolve) => {
    const t0 = Date.now(), p = spawn(node, args, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
    let out = '', timedOut = false;
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
    const timer = setTimeout(() => { timedOut = true; kill(p); }, ms);
    p.on('close', (code) => {
      clearTimeout(timer);
      const secs = Math.round((Date.now() - t0) / 1000), pass = !timedOut && code === 0;
      if (!pass) console.log(`\n--- ${name} output (last 40 lines) ---\n${out.trim().split('\n').slice(-40).join('\n')}\n---`);
      resolve({ name, pass, secs, note: timedOut ? `timed out after ${ms / 1000}s` : pass ? 'ok' : `exit ${code}` });
    });
  });
}
const step = async (name, args, ms) => { console.log(`running ${name} ...`); return run(name, args, ms); };

const results = [];
results.push(await step('build', ['node_modules/astro/bin/astro.mjs', 'build'], 240000));
results.push(await step('test', ['--test', 'test/*.test.mjs'], 240000));
if (results[0].pass) {
  const server = spawn(node, ['tools/serve.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 40 && !up; i++) { try { up = (await fetch(BASE + '/')).ok; } catch { await sleep(250); } }
  results.push(up ? await step('check-site (7 paths)', ['tools/check-site.mjs', BASE, ...PATHS], 420000) : { name: 'check-site (7 paths)', pass: false, secs: 0, note: 'server did not start' });
  kill(server);
  await sleep(500); // a11y and gaps start their own servers on other ports; keep ours stopped first
} else for (const n of ['check-site (7 paths)']) results.push({ name: n, pass: false, secs: 0, note: 'skipped: build failed' });
results.push(await step('a11y', ['tools/a11y-check.mjs'], 600000));
results.push(await step('gaps (7 paths)', ['tools/gaps.mjs', ...PATHS], 420000));

console.log('\ncheck:all summary');
for (const r of results) console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(22)} ${String(r.secs).padStart(4)}s  ${r.note}`);
const bad = results.filter((r) => !r.pass);
console.log(bad.length ? `\n${bad.length} of ${results.length} steps failed: ${bad.map((r) => r.name).join(', ')}` : `\nAll ${results.length} steps passed.`);
process.exit(bad.length ? 1 : 0);
