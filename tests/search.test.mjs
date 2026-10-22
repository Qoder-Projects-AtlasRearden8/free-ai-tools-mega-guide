import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACCESS_LABELS,
  ACCESS_VALUES,
  countToolsByCategory,
  filterTools,
  isFiltering,
  normalizeSearchText,
  safeExternalUrl,
  tokenizeQuery,
} from '../site/assets/search.js';

const categories = [
  { id: 'audio', name: 'Audio & Voice' },
  { id: 'images', name: 'Images & Design' },
];

const tools = [
  {
    id: 'whisper',
    name: 'Whisper',
    category: 'audio',
    access: 'open-source',
    best_for: 'Transcribing interviews and meetings',
    signup: 'Install locally with no vendor account or card',
    free: 'Local speech-to-text with no message cap',
    limits: 'Needs a machine with enough memory',
    tags: ['transcription', 'local', 'speech'],
  },
  {
    id: 'otter',
    name: 'Otter.ai',
    category: 'audio',
    access: 'free-tier',
    best_for: 'Meeting notes in a browser',
    signup: 'A free account by email; no card expected',
    free: 'A monthly transcription allowance',
    limits: 'Minutes are capped and expire',
    tags: ['transcription', 'meetings', 'cloud'],
  },
  {
    id: 'upscayl',
    name: 'Upscayl',
    category: 'images',
    access: 'open-source',
    best_for: 'Upscaling small photos',
    signup: 'Download the app; no account or card',
    free: 'Free desktop app',
    limits: 'Needs a decent GPU for speed',
    tags: ['upscale', 'local', 'photos'],
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'images',
    access: 'free-tier',
    best_for: 'Simple social designs',
    signup: 'A free account by email; no card expected',
    free: 'Design tools on a free plan',
    limits: 'Some assets and exports are gated',
    tags: ['design', 'templates', 'beginner'],
  },
];

test('normalizes case, punctuation, whitespace, and accents', () => {
  assert.equal(normalizeSearchText('  Café—NVIDIA!  '), 'cafe nvidia');
  assert.equal(normalizeSearchText('Rock & Roll'), 'rock roll');
  assert.equal(normalizeSearchText('Crème brûlée'), 'creme brulee');
  assert.equal(normalizeSearchText(null), '');
  assert.equal(normalizeSearchText(undefined), '');
});

test('tokenizes a query, drops duplicates, and tolerates empty input', () => {
  assert.deepEqual(tokenizeQuery('Local local LOCAL, speech!'), ['local', 'speech']);
  assert.deepEqual(tokenizeQuery('   '), []);
  assert.deepEqual(tokenizeQuery(''), []);
  assert.deepEqual(tokenizeQuery('one—two/three'), ['one', 'two', 'three']);
});

test('the access labels cover every supported access type', () => {
  assert.deepEqual(new Set(ACCESS_VALUES), new Set(['free-tier', 'free', 'open-source', 'self-hosted']));
  assert.equal(ACCESS_LABELS['free-tier'], 'Free tier');
  assert.equal(ACCESS_LABELS['open-source'], 'Open source');
});

test('returns all tools in source order when no filters are set', () => {
  assert.deepEqual(filterTools(tools, {}, categories).map((tool) => tool.id), [
    'whisper',
    'otter',
    'upscayl',
    'canva',
  ]);
  assert.deepEqual(filterTools(tools, { category: 'all', access: 'all', query: '  ' }, categories), tools);
});

test('filters by category, access, or both', () => {
  assert.deepEqual(filterTools(tools, { category: 'audio' }, categories).map((tool) => tool.id), [
    'whisper',
    'otter',
  ]);
  assert.deepEqual(filterTools(tools, { access: 'open-source' }, categories).map((tool) => tool.id), [
    'whisper',
    'upscayl',
  ]);
  assert.deepEqual(
    filterTools(tools, { category: 'audio', access: 'open-source' }, categories).map((tool) => tool.id),
    ['whisper'],
  );
  assert.deepEqual(filterTools(tools, { category: 'video' }, categories), []);
});

test('requires every query token to match somewhere in a tool record', () => {
  assert.deepEqual(filterTools(tools, { query: 'local transcription' }, categories).map((tool) => tool.id), [
    'whisper',
  ]);
  assert.deepEqual(filterTools(tools, { query: 'meeting notes' }, categories).map((tool) => tool.id), ['otter']);
  assert.deepEqual(filterTools(tools, { query: 'cloud' }, categories).map((tool) => tool.id), ['otter']);
  assert.deepEqual(filterTools(tools, { query: 'local cloud' }, categories), []);
});

test('searches tool names, categories, access labels, sign-up notes, tags, and descriptions', () => {
  assert.deepEqual(filterTools(tools, { query: 'voice' }, categories).map((tool) => tool.id), [
    'whisper',
    'otter',
  ]);
  assert.deepEqual(filterTools(tools, { query: 'open source' }, categories).map((tool) => tool.id), [
    'whisper',
    'upscayl',
  ]);
  assert.deepEqual(filterTools(tools, { query: 'beginner' }, categories).map((tool) => tool.id), ['canva']);
  assert.deepEqual(filterTools(tools, { query: 'memory' }, categories).map((tool) => tool.id), ['whisper']);
  assert.deepEqual(filterTools(tools, { query: 'vendor account' }, categories).map((tool) => tool.id), ['whisper']);
  assert.deepEqual(filterTools(tools, { query: 'card email' }, categories).map((tool) => tool.id), ['otter', 'canva']);
});

test('ranks a name match above a description or category match', () => {
  assert.equal(filterTools(tools, { query: 'whisper' }, categories)[0].id, 'whisper');
  assert.equal(filterTools(tools, { query: 'design' }, categories)[0].id, 'canva');
  assert.equal(filterTools(tools, { query: 'audio' }, categories).length, 2);
});

test('returns an empty list for a query that matches nothing', () => {
  assert.deepEqual(filterTools(tools, { query: 'quantum-basket-weaving' }, categories), []);
});

test('does not mutate the tool array or objects', () => {
  const snapshot = tools.map((tool) => ({ ...tool }));
  filterTools(tools, { query: 'local' }, categories);
  assert.deepEqual(tools, snapshot);
});

test('counts tools by category and ignores empty input safely', () => {
  assert.deepEqual(countToolsByCategory(tools), { audio: 2, images: 2 });
  assert.deepEqual(countToolsByCategory([]), {});
  assert.deepEqual(countToolsByCategory(null), {});
});

test('detects whether meaningful filters are active', () => {
  assert.equal(isFiltering(), false);
  assert.equal(isFiltering({ query: '   ', category: 'all', access: 'all' }), false);
  assert.equal(isFiltering({ query: 'whisper' }), true);
  assert.equal(isFiltering({ category: 'audio' }), true);
  assert.equal(isFiltering({ access: 'free-tier' }), true);
  assert.equal(isFiltering({ category: 'all', access: 'all' }), false);
});

test('accepts only safe HTTPS external URLs', () => {
  assert.equal(safeExternalUrl('https://example.com/tool'), 'https://example.com/tool');
  assert.equal(safeExternalUrl('http://example.com'), null);
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('data:text/html,hello'), null);
  assert.equal(safeExternalUrl('not a URL'), null);
  assert.equal(safeExternalUrl(null), null);
});
