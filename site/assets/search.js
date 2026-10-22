export const ACCESS_LABELS = Object.freeze({
  'free-tier': 'Free tier',
  free: 'Free',
  'open-source': 'Open source',
  'self-hosted': 'Self-hosted',
});

export const ACCESS_VALUES = Object.freeze(Object.keys(ACCESS_LABELS));

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenizeQuery(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return [...new Set(normalized.split(/\s+/).filter(Boolean))];
}

function haystackFor(tool, categoryName) {
  const accessLabel = ACCESS_LABELS[tool.access] ?? tool.access ?? '';
  return normalizeSearchText([
    tool.name,
    tool.best_for,
    tool.free,
    tool.signup,
    tool.limits,
    ...(Array.isArray(tool.tags) ? tool.tags : []),
    categoryName,
    accessLabel,
  ].join(' '));
}

function scoreFor(tool, tokens, phrase, categoryName) {
  const name = normalizeSearchText(tool.name);
  const bestFor = normalizeSearchText(tool.best_for);
  const free = normalizeSearchText(tool.free);
  const signup = normalizeSearchText(tool.signup);
  const limits = normalizeSearchText(tool.limits);
  const tags = normalizeSearchText((tool.tags ?? []).join(' '));
  const category = normalizeSearchText(categoryName);
  const access = normalizeSearchText(ACCESS_LABELS[tool.access] ?? '');

  let score = 0;
  if (phrase && name === phrase) score += 50;
  if (phrase && name.includes(phrase)) score += 24;

  for (const token of tokens) {
    if (name.includes(token)) score += 14;
    if (tags.includes(token)) score += 8;
    if (bestFor.includes(token)) score += 5;
    if (category.includes(token)) score += 3;
    if (free.includes(token)) score += 2;
    if (signup.includes(token)) score += 2;
    if (limits.includes(token)) score += 1;
    if (access.includes(token)) score += 1;
  }

  return score;
}

export function filterTools(tools, filters = {}, categories = []) {
  const category = filters.category || 'all';
  const access = filters.access || 'all';
  const query = typeof filters.query === 'string' ? filters.query.trim() : '';
  const tokens = tokenizeQuery(query);
  const phrase = normalizeSearchText(query);
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  const source = Array.isArray(tools) ? tools : [];

  const filtered = source.filter((tool) => {
    if (category !== 'all' && tool.category !== category) return false;
    if (access !== 'all' && tool.access !== access) return false;
    if (tokens.length === 0) return true;
    const haystack = haystackFor(tool, categoryNames.get(tool.category) ?? '');
    return tokens.every((token) => haystack.includes(token));
  });

  if (tokens.length === 0) return filtered;

  return filtered
    .map((tool, index) => ({
      tool,
      index,
      score: scoreFor(tool, tokens, phrase, categoryNames.get(tool.category) ?? ''),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}

export function countToolsByCategory(tools) {
  const counts = {};
  for (const tool of Array.isArray(tools) ? tools : []) {
    counts[tool.category] = (counts[tool.category] ?? 0) + 1;
  }
  return counts;
}

export function isFiltering(filters = {}) {
  const query = typeof filters.query === 'string' ? filters.query.trim() : '';
  return Boolean(query || (filters.category && filters.category !== 'all') || (filters.access && filters.access !== 'all'));
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
