import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const CATEGORY_IDS = [
  'chat',
  'writing',
  'images',
  'video',
  'audio',
  'coding',
  'local',
  'research',
  'productivity',
  'education',
  'accessibility',
];

export const ACCESS_TYPES = ['free', 'free-tier', 'open-source', 'self-hosted'];

const REQUIRED_META = [
  'title',
  'subtitle',
  'edition',
  'last_verified',
  'author',
  'description',
  'category_order',
  'disclaimer',
  'verification_note',
  'privacy_note',
  'access_legend',
];

const REQUIRED_CATEGORY = ['id', 'name', 'short', 'description', 'tip', 'start_here', 'tools'];
const REQUIRED_TOOL = [
  'id',
  'name',
  'access',
  'signup',
  'free',
  'limits',
  'best_for',
  'url',
  'tags',
  'last_verified',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class GuideValidationError extends Error {
  constructor(errors) {
    super(`Guide data validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
    this.name = 'GuideValidationError';
    this.errors = errors;
  }
}

function isFilledString(value, minLength = 1) {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isValidDate(value) {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function loadGuideData(root = process.cwd()) {
  const meta = await readJson(path.join(root, 'data/meta.json'));
  const categories = [];
  const tools = [];

  for (const id of meta.category_order ?? []) {
    const categoryPath = path.join(root, 'data/categories', `${id}.json`);
    const category = await readJson(categoryPath);
    const categoryTools = Array.isArray(category.tools) ? category.tools : [];

    categories.push({
      ...category,
      tools: categoryTools.map((tool) => ({ ...tool, category: id })),
    });
    tools.push(
      ...categoryTools.map((tool) => ({
        ...tool,
        category: id,
      })),
    );
  }

  return { meta, categories, tools };
}

export function validateGuideData(guide) {
  const errors = [];
  const { meta, categories, tools } = guide;

  if (!meta || typeof meta !== 'object') {
    throw new GuideValidationError(['meta.json must contain an object']);
  }

  for (const field of REQUIRED_META) {
    if (!(field in meta)) errors.push(`meta.${field} is required`);
  }

  if (!isFilledString(meta.title, 5)) errors.push('meta.title is too short');
  if (!isFilledString(meta.description, 20)) errors.push('meta.description is too short');
  if (!isValidDate(meta.last_verified)) errors.push('meta.last_verified must be a real YYYY-MM-DD date');
  if (!isFilledString(meta.disclaimer, 40)) errors.push('meta.disclaimer is too short');
  if (!isFilledString(meta.privacy_note, 30)) errors.push('meta.privacy_note is too short');
  if (!isFilledString(meta.verification_note, 30)) errors.push('meta.verification_note is too short');

  if (!Array.isArray(meta.category_order)) {
    errors.push('meta.category_order must be an array');
  } else {
    const uniqueOrder = new Set(meta.category_order);
    if (uniqueOrder.size !== meta.category_order.length) {
      errors.push('meta.category_order contains duplicate category IDs');
    }
    for (const id of CATEGORY_IDS) {
      if (!meta.category_order.includes(id)) errors.push(`meta.category_order is missing ${id}`);
    }
    for (const id of meta.category_order) {
      if (!CATEGORY_IDS.includes(id)) errors.push(`meta.category_order contains unknown category ${id}`);
    }
  }

  if (!meta.access_legend || typeof meta.access_legend !== 'object') {
    errors.push('meta.access_legend must be an object');
  } else {
    for (const access of ACCESS_TYPES) {
      if (!isFilledString(meta.access_legend[access], 15)) {
        errors.push(`meta.access_legend.${access} is missing or too short`);
      }
    }
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push('No categories were loaded');
  }

  if (!Array.isArray(tools) || tools.length === 0) {
    errors.push('No tools were loaded');
  }

  if (Array.isArray(tools) && tools.length < 150) {
    errors.push(`The guide needs at least 150 tools; found ${tools.length}`);
  }

  const categoryIds = new Set();
  const categoryToolIds = new Map();

  for (const category of categories ?? []) {
    const label = `category ${category.id ?? '(missing id)'}`;
    for (const field of REQUIRED_CATEGORY) {
      if (!(field in category)) errors.push(`${label} is missing ${field}`);
    }

    if (!SLUG.test(category.id ?? '')) errors.push(`${label} has an invalid id`);
    if (categoryIds.has(category.id)) errors.push(`${label} is duplicated`);
    categoryIds.add(category.id);

    if (!CATEGORY_IDS.includes(category.id)) errors.push(`${label} is not in the expected category list`);
    if (meta.category_order && !meta.category_order.includes(category.id)) {
      errors.push(`${label} is not listed in meta.category_order`);
    }

    if (!isFilledString(category.name, 3)) errors.push(`${label} name is too short`);
    if (!isFilledString(category.short, 8)) errors.push(`${label} short description is too short`);
    if (!isFilledString(category.description, 40)) errors.push(`${label} description is too short`);
    if (!isFilledString(category.tip, 30)) errors.push(`${label} tip is too short`);
    if (!Array.isArray(category.start_here) || category.start_here.length < 1 || category.start_here.length > 3) {
      errors.push(`${label} start_here must contain one to three tool IDs`);
    }
    if (!Array.isArray(category.tools) || category.tools.length < 10) {
      errors.push(`${label} should include at least 10 tools`);
    }

    const localIds = new Set((category.tools ?? []).map((tool) => tool.id));
    categoryToolIds.set(category.id, localIds);
    for (const startId of category.start_here ?? []) {
      if (!localIds.has(startId)) errors.push(`${label} start_here references missing tool ${startId}`);
    }
  }

  if (meta.category_order) {
    const loadedOrder = (categories ?? []).map((category) => category.id);
    if (JSON.stringify(loadedOrder) !== JSON.stringify(meta.category_order)) {
      errors.push('Loaded categories do not match meta.category_order');
    }
  }

  const seenIds = new Map();
  const seenNames = new Map();
  const seenUrls = new Map();

  for (const tool of tools ?? []) {
    const label = `tool ${tool.id ?? '(missing id)'}`;
    for (const field of REQUIRED_TOOL) {
      if (!(field in tool)) errors.push(`${label} is missing ${field}`);
    }

    if (!SLUG.test(tool.id ?? '')) errors.push(`${label} has an invalid id`);
    if (seenIds.has(tool.id)) {
      errors.push(`${label} duplicates the id used by ${seenIds.get(tool.id)}`);
    } else {
      seenIds.set(tool.id, label);
    }

    const normalizedName = (tool.name ?? '').trim().toLowerCase();
    if (seenNames.has(normalizedName)) {
      errors.push(`${label} duplicates the name used by ${seenNames.get(normalizedName)}`);
    } else {
      seenNames.set(normalizedName, label);
    }

    if (!isFilledString(tool.name, 2)) errors.push(`${label} name is too short`);
    if (!ACCESS_TYPES.includes(tool.access)) {
      errors.push(`${label} access must be one of: ${ACCESS_TYPES.join(', ')}`);
    }
    if (!isFilledString(tool.signup, 25)) errors.push(`${label} signup field is too short`);
    if (!isFilledString(tool.free, 30)) errors.push(`${label} free field is too short`);
    if (!isFilledString(tool.limits, 25)) errors.push(`${label} limits field is too short`);
    if (!isFilledString(tool.best_for, 20)) errors.push(`${label} best_for field is too short`);
    if (!isValidDate(tool.last_verified)) errors.push(`${label} has an invalid last_verified date`);
    if (tool.last_verified !== meta.last_verified) {
      errors.push(`${label} last_verified must match meta.last_verified until re-verified separately`);
    }
    if (!categoryIds.has(tool.category)) errors.push(`${label} has an unknown category`);
    if (meta.category_order && !meta.category_order.includes(tool.category)) {
      errors.push(`${label} category is not in meta.category_order`);
    }

    if (!Array.isArray(tool.tags) || tool.tags.length < 2 || tool.tags.length > 6) {
      errors.push(`${label} needs two to six tags`);
    } else {
      if (new Set(tool.tags).size !== tool.tags.length) errors.push(`${label} has duplicate tags`);
      for (const tag of tool.tags) {
        if (!isFilledString(tag, 2) || tag !== tag.trim()) {
          errors.push(`${label} has an invalid tag`);
        }
      }
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(tool.url);
    } catch {
      errors.push(`${label} has an invalid URL`);
    }

    if (parsedUrl) {
      if (parsedUrl.protocol !== 'https:') errors.push(`${label} URL must use https`);
      if (parsedUrl.username || parsedUrl.password) errors.push(`${label} URL must not contain credentials`);
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname)) {
        errors.push(`${label} URL must be public`);
      }
      if (/(^|\.)bit\.ly$|(^|\.)tinyurl\.com$/i.test(parsedUrl.hostname)) {
        errors.push(`${label} URL must not use a shortener`);
      }
      if ([...parsedUrl.searchParams.keys()].some((key) => /^(utm_|ref|affiliate|aff)$/i.test(key))) {
        errors.push(`${label} URL must not contain tracking parameters`);
      }
      const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`.replace(/\/$/, '');
      if (seenUrls.has(cleanUrl)) {
        errors.push(`${label} duplicates the URL used by ${seenUrls.get(cleanUrl)}`);
      } else {
        seenUrls.set(cleanUrl, label);
      }
      if (/[<>"]/.test(tool.url)) errors.push(`${label} URL contains unsafe characters`);
    }

    for (const field of ['signup', 'free', 'limits', 'best_for']) {
      if (/<script|javascript:/i.test(tool[field] ?? '')) {
        errors.push(`${label} ${field} contains unsafe markup`);
      }
    }
  }

  if (errors.length > 0) throw new GuideValidationError(errors);

  return guide;
}
