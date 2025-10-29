import fs from 'fs'; import path from 'path';

const p = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(p)) for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i); if (m) process.env[m[1]] = m[2];
}