import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACCESS_TYPES,
  CATEGORY_IDS,
  GuideValidationError,
  loadGuideData,
  validateGuideData,
} from '../scripts/validate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = await loadGuideData(ROOT);

test('the guide passes its own validation', () => {
  assert.doesNotThrow(() => validateGuideData(guide));
  assert.ok(guide instanceof Object);
  assert.ok(Array.isArray(guide.errors) === false);
  assert.equal(guide.categories.length, 10);
  assert.ok(guide.tools.length >= 150, `Expected at least 150 tools, found ${guide.tools.length}`);
});

test('the guide contains all ten required categories in the published order', () => {
  assert.deepEqual(
    guide.categories.map((category) => category.id),
    CATEGORY_IDS,
  );
  assert.deepEqual(guide.meta.category_order, CATEGORY_IDS);
  for (const id of CATEGORY_IDS) {
    assert.ok(guide.categories.some((category) => category.id === id), `Missing category: ${id}`);
  }
});

test('every category is substantive and clearly described', () => {
  for (const category of guide.categories) {
    assert.ok(category.tools.length >= 10, `${category.id} has only ${category.tools.length} tools`);
    assert.ok(category.name.trim().length >= 3);
    assert.ok(category.short.trim().length >= 8);
    assert.ok(category.description.trim().length >= 40);
    assert.ok(category.tip.trim().length >= 30);
    assert.ok(category.start_here.length >= 1 && category.start_here.length <= 3);
    const ids = new Set(category.tools.map((tool) => tool.id));
    for (const starter of category.start_here) {
      assert.ok(ids.has(starter), `${category.id} start_here references missing ${starter}`);
    }
  }
});

test('the total count is the sum of the category counts', () => {
  const total = guide.categories.reduce((sum, category) => sum + category.tools.length, 0);
  assert.equal(total, guide.tools.length);
  assert.ok(guide.tools.length >= 150);
});

test('every tool states what is free, how sign-up works, its limits, its best use, and an official link', () => {
  for (const tool of guide.tools) {
    assert.ok(tool.name.length >= 2, `${tool.id} has a short name`);
    assert.ok(tool.free.trim().length >= 30, `${tool.id} needs a useful free description`);
    assert.ok(tool.signup.trim().length >= 25, `${tool.id} needs practical sign-up notes`);
    assert.ok(tool.limits.trim().length >= 25, `${tool.id} needs practical limits`);
    assert.ok(tool.best_for.trim().length >= 20, `${tool.id} needs a clear best use`);
    const url = new URL(tool.url);
    assert.equal(url.protocol, 'https:', `${tool.id} must use HTTPS`);
    assert.equal(url.username, '', `${tool.id} URL has credentials`);
    assert.equal(url.password, '', `${tool.id} URL has credentials`);
    assert.ok(!['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname));
    assert.ok(!/(^|\.)bit\.ly$|(^|\.)tinyurl\.com$/i.test(url.hostname));
  }
});

test('access labels use the four published types, and each type is represented', () => {
  assert.deepEqual(new Set(Object.keys(guide.meta.access_legend)), new Set(ACCESS_TYPES));
  const observed = new Set(guide.tools.map((tool) => tool.access));
  assert.deepEqual(observed, new Set(ACCESS_TYPES));
  for (const tool of guide.tools) {
    assert.ok(ACCESS_TYPES.includes(tool.access), `${tool.id} has unknown access "${tool.access}"`);
  }
});

test('all tool dates match the edition date', () => {
  assert.match(guide.meta.last_verified, /^\d{4}-\d{2}-\d{2}$/);
  for (const tool of guide.tools) {
    assert.equal(tool.last_verified, guide.meta.last_verified, `${tool.id} has a stale or future date`);
  }
});

test('tool IDs, names, and official URLs are unique', () => {
  const ids = new Map();
  const names = new Map();
  const urls = new Map();
  for (const tool of guide.tools) {
    assert.ok(!ids.has(tool.id), `Duplicate tool ID: ${tool.id}`);
    ids.set(tool.id, true);
    const name = tool.name.trim().toLowerCase();
    assert.ok(!names.has(name), `Duplicate tool name: ${tool.name}`);
    names.set(name, true);
    const url = new URL(tool.url);
    const normalized = `${url.origin}${url.pathname}${url.search}`.replace(/\/$/, '');
    assert.ok(!urls.has(normalized), `Duplicate URL: ${tool.url}`);
    urls.set(normalized, true);
  }
  assert.equal(ids.size, guide.tools.length);
});

test('tools are attached to their source category, not another file', () => {
  for (const category of guide.categories) {
    for (const tool of category.tools) {
      assert.equal(tool.category, category.id);
    }
  }
  for (const tool of guide.tools) {
    const category = guide.categories.find((item) => item.id === tool.category);
    assert.ok(category, `${tool.id} has a category that is not loaded`);
    assert.ok(category.tools.some((candidate) => candidate.id === tool.id));
  }
});

test('the expected flagship tools are present', () => {
  const expected = new Map([
    ['chatgpt', 'chat'],
    ['google-gemini', 'chat'],
    ['grammarly', 'writing'],
    ['canva', 'images'],
    ['capcut', 'video'],
    ['whisper', 'audio'],
    ['github-copilot', 'coding'],
    ['notebooklm', 'research'],
    ['zapier', 'productivity'],
    ['khanmigo', 'education'],
    ['seeing-ai', 'accessibility'],
  ]);
  for (const [id, category] of expected) {
    const tool = guide.tools.find((candidate) => candidate.id === id);
    assert.ok(tool, `Missing flagship tool: ${id}`);
    assert.equal(tool.category, category, `${id} belongs in ${category}`);
  }
});

test('validation rejects an under-sized guide with a useful error', () => {
  const smallGuide = {
    meta: { ...guide.meta },
    categories: guide.categories.map((category) => ({ ...category, tools: category.tools.slice(0, 1) })),
    tools: guide.tools.slice(0, 9),
  };
  assert.throws(
    () => validateGuideData(smallGuide),
    (error) => error instanceof GuideValidationError && error.errors.some((message) => message.includes('at least 150')),
  );
});

test('the source data has no tracking parameters or shorteners', () => {
  for (const tool of guide.tools) {
    const url = new URL(tool.url);
    for (const key of url.searchParams.keys()) {
      assert.ok(!/^(utm_|ref|affiliate|aff)$/i.test(key), `${tool.id} has a tracking parameter`);
    }
  }
});
