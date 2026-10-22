import {
  ACCESS_LABELS,
  ACCESS_VALUES,
  countToolsByCategory,
  filterTools,
  isFiltering,
  safeExternalUrl,
} from './search.js';

const ui = {
  search: document.querySelector('#tool-search'),
  access: document.querySelector('#access-filter'),
  clear: document.querySelector('#clear-filters'),
  categoryCards: document.querySelector('#category-cards'),
  categoryChips: document.querySelector('#category-chips'),
  activeNote: document.querySelector('#active-note'),
  activeTitle: document.querySelector('#active-note-title'),
  activeDescription: document.querySelector('#active-note-description'),
  activeTip: document.querySelector('#active-note-tip'),
  activeStart: document.querySelector('#active-note-start'),
  status: document.querySelector('#results-status'),
  loading: document.querySelector('#loading-state'),
  grid: document.querySelector('#tool-grid'),
  empty: document.querySelector('#empty-state'),
  emptyMessage: document.querySelector('#empty-message'),
  error: document.querySelector('#error-state'),
  directory: document.querySelector('#directory'),
};

if (ui.grid) {
  init();
}

const state = {
  data: null,
  categoryMap: new Map(),
  categoryCounts: {},
  query: '',
  category: 'all',
  access: 'all',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function displayDate(isoDate, long = false) {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return isoDate;
  return (long ? fullDateFormatter : dateFormatter).format(date);
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function pluralTools(count) {
  return `${count} ${count === 1 ? 'tool' : 'tools'}`;
}

function init() {
  bindEvents();
  loadData();
}

function bindEvents() {
  ui.search.addEventListener('input', () => {
    state.query = ui.search.value;
    applyFilters();
  });

  ui.access.addEventListener('change', () => {
    state.access = ACCESS_VALUES.includes(ui.access.value) ? ui.access.value : 'all';
    applyFilters();
  });

  ui.clear.addEventListener('click', resetFilters);

  for (const button of document.querySelectorAll('[data-reset]')) {
    button.addEventListener('click', resetFilters);
  }

  ui.categoryCards.addEventListener('click', (event) => {
    const card = event.target.closest('[data-category-card]');
    if (!card) return;
    event.preventDefault();
    state.category = card.dataset.categoryCard;
    state.query = '';
    state.access = 'all';
    ui.search.value = '';
    ui.access.value = 'all';
    applyFilters();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ui.directory.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });

  ui.categoryChips.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-chip-category]');
    if (!chip) return;
    state.category = chip.dataset.chipCategory;
    applyFilters();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    const isTyping = target instanceof HTMLElement
      && (target.matches('input, textarea, select') || target.isContentEditable);
    if (isTyping) return;
    event.preventDefault();
    ui.search.focus();
    ui.search.select();
  });

  window.addEventListener('popstate', () => {
    if (!state.data) return;
    readStateFromUrl();
    applyFilters({ syncUrl: false });
  });
}

async function loadData() {
  try {
    const response = await fetch('data/tools.json', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`);

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.tools) || !Array.isArray(payload.categories) || !payload.meta) {
      throw new Error('The guide JSON is missing required fields');
    }

    state.data = payload;
    state.categoryMap = new Map(payload.categories.map((category) => [category.id, category]));
    state.categoryCounts = countToolsByCategory(payload.tools);
    readStateFromUrl();

    updateVerifiedDates(payload.meta.last_verified);
    updateStats(payload);
    renderCategoryCards();
    renderCategoryChips();
    applyFilters({ syncUrl: false });

    ui.loading.hidden = true;
    ui.grid.setAttribute('aria-busy', 'false');
    document.documentElement.classList.add('is-ready');
  } catch (error) {
    console.error('Could not load the guide data:', error);
    ui.loading.hidden = true;
    ui.grid.hidden = true;
    ui.grid.setAttribute('aria-busy', 'false');
    ui.error.hidden = false;
    ui.status.textContent = 'The tool directory could not load.';
    ui.categoryCards.replaceChildren(createElement('p', 'loading-inline', 'Categories are unavailable until the guide data loads.'));
    ui.categoryChips.replaceChildren(createElement('span', 'loading-inline', 'Filters are unavailable until the guide data loads.'));
  }
}

function readStateFromUrl() {
  if (!state.data) return;
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get('category');
  const requestedAccess = params.get('access');
  const requestedQuery = params.get('q') ?? '';

  state.query = requestedQuery.slice(0, 160);
  state.category = requestedCategory && state.categoryMap.has(requestedCategory) ? requestedCategory : 'all';
  state.access = ACCESS_VALUES.includes(requestedAccess) ? requestedAccess : 'all';
  ui.search.value = state.query;
  ui.access.value = state.access;
}

function updateVerifiedDates(isoDate) {
  document.querySelectorAll('[data-verified-date]').forEach((node) => {
    node.textContent = displayDate(isoDate, true);
    node.setAttribute('datetime', isoDate);
  });
}

function updateStats(payload) {
  document.querySelectorAll('[data-stat="tools"]').forEach((node) => {
    node.textContent = payload.meta.tool_count ?? payload.tools.length;
  });
  document.querySelectorAll('[data-stat="categories"]').forEach((node) => {
    node.textContent = payload.meta.category_count ?? payload.categories.length;
  });
}

function renderCategoryCards() {
  const fragment = document.createDocumentFragment();

  for (const category of state.data.categories) {
    const count = state.categoryCounts[category.id] ?? 0;
    const startNames = category.start_here
      .map((id) => state.data.tools.find((tool) => tool.id === id)?.name)
      .filter(Boolean);
    const card = createElement('a', 'category-card');
    card.href = `?category=${encodeURIComponent(category.id)}#directory`;
    card.dataset.category = category.id;
    card.dataset.categoryCard = category.id;
    card.setAttribute('aria-label', `Browse ${pluralTools(count)} in ${category.name}. Start with ${startNames.join(', ')}.`);

    const top = createElement('div', 'category-card__top');
    const letters = category.name.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase();
    const mark = createElement('span', 'category-card__mark', letters);
    mark.setAttribute('aria-hidden', 'true');
    const countLabel = createElement('span', 'category-card__count', pluralTools(count));
    top.append(mark, countLabel);

    const title = createElement('h3', null, category.name);
    const description = createElement('p', null, category.short);
    const action = createElement('span', 'category-card__action');
    action.append(createElement('span', null, 'Browse category'), createElement('span', null, '→'));

    card.append(top, title, description, action);
    fragment.append(card);
  }

  ui.categoryCards.replaceChildren(fragment);
}

function renderCategoryChips() {
  const fragment = document.createDocumentFragment();

  const allButton = createElement('button', 'category-chip');
  allButton.type = 'button';
  allButton.dataset.chipCategory = 'all';
  allButton.append(
    createElement('span', null, 'All tools'),
    createElement('span', 'category-chip__count', String(state.data.tools.length)),
  );
  fragment.append(allButton);

  for (const category of state.data.categories) {
    const count = state.categoryCounts[category.id] ?? 0;
    const button = createElement('button', 'category-chip');
    button.type = 'button';
    button.dataset.chipCategory = category.id;
    button.append(
      createElement('span', null, category.name),
      createElement('span', 'category-chip__count', String(count)),
    );
    fragment.append(button);
  }

  ui.categoryChips.replaceChildren(fragment);
}

function updateCategoryControls() {
  for (const chip of ui.categoryChips.querySelectorAll('[data-chip-category]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.chipCategory === state.category));
  }
  ui.access.value = state.access;
  ui.clear.disabled = !isFiltering(state);
}

function renderActiveNote() {
  if (state.category === 'all') {
    ui.activeNote.hidden = true;
    return;
  }

  const category = state.categoryMap.get(state.category);
  if (!category) {
    ui.activeNote.hidden = true;
    return;
  }

  const startNames = category.start_here
    .map((id) => state.data.tools.find((tool) => tool.id === id)?.name)
    .filter(Boolean);

  ui.activeNote.hidden = false;
  ui.activeTitle.textContent = category.name;
  ui.activeDescription.textContent = category.description;
  ui.activeTip.textContent = category.tip;
  ui.activeStart.textContent = startNames.join(' · ');
}

function applyFilters({ syncUrl = true } = {}) {
  if (!state.data) return;

  const filtered = filterTools(state.data.tools, state, state.data.categories);
  const active = isFiltering(state);
  const total = state.data.tools.length;

  renderActiveNote();
  renderGrid(filtered);
  updateCategoryControls();

  if (filtered.length === 0) {
    ui.empty.hidden = false;
    ui.emptyMessage.textContent = buildEmptyMessage();
  } else {
    ui.empty.hidden = true;
  }

  if (!active) {
    ui.status.textContent = `Showing all ${pluralTools(total)}.`;
  } else {
    const context = state.category !== 'all' ? ` in ${state.categoryMap.get(state.category)?.name ?? 'this category'}` : '';
    ui.status.textContent = `${filtered.length} of ${pluralTools(total)}${context} match your filters.`;
  }

  if (syncUrl) syncStateToUrl();
}

function buildEmptyMessage() {
  const details = [];
  if (state.query.trim()) details.push(`for “${state.query.trim()}”`);
  if (state.category !== 'all') details.push(`in ${state.categoryMap.get(state.category)?.name ?? 'this category'}`);
  if (state.access !== 'all') details.push(`with ${ACCESS_LABELS[state.access] ?? state.access} access`);
  const context = details.length ? `Nothing matched ${details.join(' ')}. ` : 'Nothing matched. ';
  return `${context}Try a shorter search term, choose all categories, or reset the access filter.`;
}

function renderGrid(tools) {
  const fragment = document.createDocumentFragment();

  for (const tool of tools) {
    const category = state.categoryMap.get(tool.category);
    const card = createElement('article', 'tool-card');
    card.dataset.category = tool.category;
    const headingId = `tool-${tool.id}-title`;
    card.setAttribute('aria-labelledby', headingId);

    const top = createElement('div', 'tool-card__top');
    top.append(
      createElement('span', 'tool-card__category', category?.name ?? tool.category),
      createBadge(tool.access),
    );

    const title = createElement('h3', null, tool.name);
    title.id = headingId;

    const best = createElement('p', 'tool-card__best');
    best.append(
      createElement('span', 'tool-card__best-label', 'Best for'),
      document.createTextNode(tool.best_for),
    );

    const details = createElement('dl', 'tool-card__details');
    details.append(
      createDetail('What is free', tool.free, 'free'),
      createDetail('Sign-up notes', tool.signup, 'signup'),
      createDetail('Watch the limits', tool.limits, 'limits'),
    );

    const tags = createElement('ul', 'tool-card__tags');
    tags.setAttribute('aria-label', 'Tags');
    for (const tag of tool.tags) {
      tags.append(createElement('li', null, tag));
    }

    const footer = createElement('div', 'tool-card__footer');
    const verified = createElement('span', 'tool-card__verified');
    verified.append(document.createTextNode('Verified '));
    const time = createElement('time', null, displayDate(tool.last_verified));
    if (tool.last_verified) time.setAttribute('datetime', tool.last_verified);
    verified.append(time);

    const link = createElement('a', 'tool-card__link');
    const safeUrl = safeExternalUrl(tool.url);
    link.href = safeUrl ?? '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Visit ${tool.name} official site (opens in a new tab)`);
    link.append(document.createTextNode('Official site'));
    const arrow = createElement('span', null, '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
    if (!safeUrl) link.removeAttribute('target');

    footer.append(verified, link);
    card.append(top, title, best, details, tags, footer);
    fragment.append(card);
  }

  ui.grid.replaceChildren(fragment);
}

function createBadge(access) {
  const badge = createElement('span', 'access-badge', ACCESS_LABELS[access] ?? access);
  badge.dataset.access = access;
  return badge;
}

function createDetail(label, text, kind) {
  const wrapper = createElement('div', kind === 'free' ? 'tool-card__detail' : `tool-card__detail tool-card__detail--${kind}`);
  wrapper.append(
    createElement('dt', null, label),
    createElement('dd', null, text),
  );
  return wrapper;
}

function resetFilters() {
  state.query = '';
  state.category = 'all';
  state.access = 'all';
  ui.search.value = '';
  ui.access.value = 'all';
  applyFilters();
  ui.search.focus();
}

function syncStateToUrl() {
  const url = new URL(window.location.href);
  if (state.query.trim()) url.searchParams.set('q', state.query.trim());
  else url.searchParams.delete('q');
  if (state.category !== 'all') url.searchParams.set('category', state.category);
  else url.searchParams.delete('category');
  if (state.access !== 'all') url.searchParams.set('access', state.access);
  else url.searchParams.delete('access');
  window.history.replaceState(null, '', url);
}
