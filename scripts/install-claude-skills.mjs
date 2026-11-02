import { cpSync, existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const names = ['affiliate-funnel-orchestrator', 'cloudflare-verification', 'cookie-manager',
  'funnel-qa', 'gotooffer-tracking', 'offer-tab-router', 'swipe-interaction'];
const mode = process.argv[2] || '--user';
if (!['--user', '--project'].includes(mode) || process.argv.length > 3) {
  console.error('Usage: node scripts/install-claude-skills.mjs [--user|--project]');
  process.exit(1);
}
const source = fileURLToPath(new URL('../.agents/skills/', import.meta.url));
const root = mode === '--project' ? process.cwd() : os.homedir();
const destination = path.join(root, '.claude', 'skills');
const existing = names.filter(name => existsSync(path.join(destination, name)));
if (existing.length) {
  console.error(`Nothing installed: these skills already exist in ${destination}: ${existing.join(', ')}. Review them before updating.`);
  process.exit(1);
}
for (const name of names) {
  if (!existsSync(path.join(source, name, 'SKILL.md'))) throw new Error(`Missing source skill: ${name}`);
}
mkdirSync(destination, { recursive: true });
for (const name of names) {
  cpSync(path.join(source, name), path.join(destination, name), { recursive: true, force: false, errorOnExist: true });
  console.log(`Installed ${name}`);
}
console.log(`Skills installed in ${destination}. Start a new Claude Code session and use /skills.`);
