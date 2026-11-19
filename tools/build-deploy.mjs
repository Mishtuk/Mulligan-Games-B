// npm run build:deploy: the normal Astro build with DEPLOY=1, so astro.config.mjs fails it while SITE_URL is a placeholder.
import { spawnSync } from 'node:child_process';
const r = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env: { ...process.env, DEPLOY: '1' } });
process.exit(r.status ?? 1);
