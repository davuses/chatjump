// Runs before installing dependencies. Published versions are immutable;
// missing or unfinished releases are built and tested before publication.
import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const manifest = read('manifest.json');
const pkg = read('package.json');
const lock = read('package-lock.json');
const version = manifest.version;
if (!/^\d+\.\d+\.\d+$/.test(version) || version.split('.').some(n => Number(n) > 65535)) {
  throw new Error('Use a three-part numeric extension version, for example 1.0.4.');
}
if ([pkg.version, lock.version, lock.packages?.['']?.version].some(v => v !== version)) {
  throw new Error('manifest.json, package.json, and package-lock.json versions must match.');
}
const repo = process.env.GITHUB_REPOSITORY;
if (!repo || !process.env.GH_TOKEN) throw new Error('GitHub repository and token are required.');

async function get(endpoint) {
  const response = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status} for ${endpoint}.`);
  return response.json();
}

const release = await get(`releases/tags/v${version}`);
const publish = !release || release.draft;
if (publish) {
  const latest = await get('releases/latest');
  if (latest && /^v\d+\.\d+\.\d+$/.test(latest.tag_name)) {
    const previous = latest.tag_name.slice(1).split('.').map(Number);
    const next = version.split('.').map(Number);
    let comparison = 0;
    for (let i = 0; i < 3 && comparison === 0; i++) comparison = next[i] - previous[i];
    if (comparison <= 0) throw new Error(`New version must be greater than ${latest.tag_name}.`);
  }
}
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\npublish=${publish}\n`);
}
console.log(publish ? `Build and publish v${version}.` : `v${version} is already published; nothing to release.`);
