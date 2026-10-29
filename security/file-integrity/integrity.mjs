import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASELINE = join(ROOT, 'security', '.baseline.json');
const LOG = join(ROOT, 'security', '.integrity.log');
const SKIP_DIRS = new Set(['node_modules', '.git', '.expo']);
const SKIP_FILES = new Set(['.baseline.json', '.integrity.log', '.env']);

function walk(dir, out = {}) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, out); }
    else if (e.isFile() && !SKIP_FILES.has(e.name)) {
      out[relative(ROOT, p)] = createHash('sha256').update(readFileSync(p)).digest('hex');
    }
  }
  return out;
}

const cmd = process.argv[2];
if (cmd === 'init') {
  const files = walk(ROOT);
  writeFileSync(BASELINE, JSON.stringify({ created: new Date().toISOString(), files }, null, 2));
  console.log(`Baseline saved: ${Object.keys(files).length} files`);
} else if (cmd === 'check') {
  if (!existsSync(BASELINE)) { console.error('No baseline. Run: init'); process.exit(2); }
  const base = JSON.parse(readFileSync(BASELINE, 'utf8')).files;
  const now = walk(ROOT);
  const added = Object.keys(now).filter(f => !(f in base));
  const missing = Object.keys(base).filter(f => !(f in now));
  const changed = Object.keys(now).filter(f => f in base && base[f] !== now[f]);
  const ok = !added.length && !missing.length && !changed.length;
  appendFileSync(LOG, JSON.stringify({ time: new Date().toISOString(), ok, added, missing, changed }) + '\n');
  if (process.argv.includes('--json')) { console.log(JSON.stringify({ ok, added, missing, changed, checkedAt: new Date().toISOString() })); process.exit(ok ? 0 : 1); }
  if (ok) console.log('OK: no changes');
  else { console.log({ added, missing, changed }); process.exit(1); }
} else {
  console.log('Usage: node security/file-integrity/integrity.mjs init|check');
  process.exit(2);
}
