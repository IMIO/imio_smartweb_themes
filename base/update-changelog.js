#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node update-changelog.js <version>');
  process.exit(1);
}

const date = new Date().toISOString().split('T')[0];
const repoUrl = 'https://github.com/IMIO/imio_smartweb_themes';

// Previous tag (before new one is created)
let prevTag;
try {
  prevTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
} catch (e) {
  prevTag = null;
}

// Commits touching current directory (base/) since previous tag
let commits = '';
try {
  const range = prevTag ? `${prevTag}...HEAD` : 'HEAD';
  commits = execSync(`git log --pretty=format:"* %s (%h)" ${range} -- .`, { encoding: 'utf8' }).trim();
} catch (e) {
  // no commits
}

// Build new CHANGELOG entry
const compareUrl = prevTag
  ? `${repoUrl}/compare/${prevTag}...v${version}`
  : `${repoUrl}/releases/tag/v${version}`;

const newEntry = commits
  ? `## [${version}](${compareUrl}) (${date})\n\n${commits}`
  : `## [${version}](${compareUrl}) (${date})`;

// Prepend to CHANGELOG.md
const infile = path.join(__dirname, 'CHANGELOG.md');
let existing = '';
try {
  existing = fs.readFileSync(infile, 'utf8').trim();
} catch (e) {
  // file doesn't exist yet
}

fs.writeFileSync(infile, newEntry + (existing ? '\n\n' + existing : '') + '\n');
console.log(`CHANGELOG.md updated for v${version}`);
