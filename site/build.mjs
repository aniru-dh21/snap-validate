// Builds the website into _site/: bundles site/main.js together with the
// library source (so the playground always runs the code in this repo) and
// copies the static files. Run with `npm run site:build`.
import { build } from 'esbuild';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(siteDir, '..');
const outDir = join(rootDir, '_site');

const pkg = JSON.parse(await readFile(join(rootDir, 'package.json'), 'utf8'));

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [join(siteDir, 'main.js')],
  outfile: join(outDir, 'main.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  define: { __SNAP_VERSION__: JSON.stringify(pkg.version) },
  logLevel: 'warning'
});

for (const file of [
  'index.html',
  'style.css',
  'favicon.svg',
  'social-preview.png',
  'fonts'
]) {
  await cp(join(siteDir, file), join(outDir, file), { recursive: true });
}

console.log(`Built site for snap-validate ${pkg.version} in _site/`);
