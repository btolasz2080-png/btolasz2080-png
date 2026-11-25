// Sync the profile README from the portfolio website.
// Reads the site's courses, certificates, projects and details, then:
//   1. rewrites the folder lists between the <!-- sync:... --> markers in README.md
//   2. updates tools/profile.json and redraws the SVGs (name, folder papers, file counts)
// Usage: node tools/sync.mjs <path-to-site-repo>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const site = path.resolve(process.argv[2] || path.join(root, 'site'));
const SITE_URL = 'https://btolasz2080-png.github.io';

// ── tiny front-matter reader (enough for the site's simple files)
function frontMatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (!m) return data;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let [, key, v] = kv;
    v = v.trim();
    if (v.startsWith('"') || v.startsWith("'")) {
      const q = v[0];
      const end = v.indexOf(q, 1);
      v = v.slice(1, end > 0 ? end : undefined);
    } else {
      v = v.replace(/\s+#.*$/, '').trim();
      if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      else if (v === 'true' || v === 'false') v = v === 'true';
    }
    data[key] = v;
  }
  return data;
}

const read = (dir) => {
  const full = path.join(site, 'src/content', dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: f.replace(/\.md$/, ''), ...frontMatter(path.join(full, f)) }))
    .filter((e) => e.title && e.sample !== true); // example entries never go on the public profile
};

const monthYear = (d) => { const t = new Date(d); return isNaN(t) ? String(d || '') : t.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
const byDate = (k) => (a, b) => new Date(b[k] || 0) - new Date(a[k] || 0);

const courses = read('courses').sort(byDate('completed'));
const certs = read('certificates').sort(byDate('issued'));
const projects = read('projects').sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

// ── site details (name, eyebrow, contact) from src/data/site.ts
const siteTs = fs.readFileSync(path.join(site, 'src/data/site.ts'), 'utf8');
const str = (key) => (siteTs.match(new RegExp(`\\b${key}:\\s*['"]([^'"]*)['"]`)) || [])[1] || '';
const eyebrow = ((siteTs.match(/eyebrow:\s*\[([^\]]*)\]/) || [])[1] || '').split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const details = { name: str('name'), email: str('email'), linkedin: str('linkedin'), eyebrow: eyebrow.join(' · ') };
const placeholder = (v) => !v || /example\.com|your-username|^Your /i.test(v);

// ── README lists
const courseLine = (c) => {
  const cert = c.certificate && certs.find((x) => x.id === c.certificate);
  return `- **${c.title}** · ${c.provider || ''} · ${monthYear(c.completed)}${cert ? ` · [certificate](${SITE_URL}/certificates/${cert.id}/)` : ''}`;
};
const lists = {
  cisco: [courses.filter((c) => c.platform === 'cisco').map(courseLine), "- 📥 *Coming soon. I'm adding my Cisco courses.*"],
  coursera: [courses.filter((c) => c.platform === 'coursera').map(courseLine), "- 📥 *Coming soon. I'm adding my Coursera courses.*"],
  other: [courses.filter((c) => !['cisco', 'coursera'].includes(c.platform)).map(courseLine), '- 📥 *Coming soon.*'],
  certificates: [certs.map((c) => `- **${c.title}** · ${c.issuer || ''} · ${monthYear(c.issued)}${c.verifyUrl ? ` · [verify ↗](${c.verifyUrl})` : ''}`), '- 📥 *Coming soon. Each certificate will link to its verification page.*'],
  projects: [projects.map((p) => `- **[${p.title}](${SITE_URL}/projects/${p.id}/)** · ${p.category || ''} · ${p.year || ''}${p.summary ? ` — ${p.summary}` : ''}${p.github ? ` · [code](${p.github})` : ''}`), "- 📥 *I'm uploading my first college projects as repositories. They'll be pinned below.*"],
};

const contact = [
  '<p>',
  `  📫 <b>Email</b> · ${placeholder(details.email) ? '<i>add your email here</i>' : `<a href="mailto:${details.email}">${details.email}</a>`}<br />`,
  `  💼 <b>LinkedIn</b> · ${placeholder(details.linkedin) ? '<i>add your LinkedIn here</i>' : `<a href="${details.linkedin}">${details.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>`}<br />`,
].join('\n');

let readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const put = (key, body) => {
  const re = new RegExp(`(<!-- sync:${key}:start -->)[\\s\\S]*?(<!-- sync:${key}:end -->)`);
  readme = readme.replace(re, `$1\n${body}\n$2`);
};
for (const [key, [items, empty]] of Object.entries(lists)) put(key, items.length ? items.join('\n') : empty);
put('contact', contact);
if (!placeholder(details.name)) readme = readme.replace(/(<img src="assets\/header\.svg" width="100%" alt=")[^—"]*—/, `$1${details.name} —`);
fs.writeFileSync(path.join(root, 'README.md'), readme);

// ── profile.json → SVGs
const cfgPath = path.join(here, 'profile.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (details.name) cfg.name = details.name;
if (details.eyebrow) cfg.eyebrow = details.eyebrow;
const titles = {
  cisco: courses.filter((c) => c.platform === 'cisco').map((c) => c.title),
  coursera: courses.filter((c) => c.platform === 'coursera').map((c) => c.title),
  other: courses.filter((c) => !['cisco', 'coursera'].includes(c.platform)).map((c) => c.title),
  certificates: certs.map((c) => c.title),
  projects: projects.map((p) => p.title),
};
cfg.folders = cfg.folders.map((f) => ({ ...f, items: titles[f.id] || [] }));
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
execFileSync(process.execPath, [path.join(here, 'build.js')], { stdio: 'inherit' });

console.log(`Synced: ${courses.length} courses, ${certs.length} certificates, ${projects.length} projects.`);
