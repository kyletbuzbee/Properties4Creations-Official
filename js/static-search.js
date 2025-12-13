/**
 * P4C Static Search - Client-side search functionality
 * Searches properties and handles search UI
 */

// Create search namespace
if (typeof P4C === 'undefined') {
  window.P4C = {};
}
if (!P4C.Search) {
  P4C.Search = {};
}

/**
 * Initialize search functionality
 */
P4C.Search.init = function () {
  this.setupSearchInput();
  this.loadProperties();
};

/**
 * Setup search input handling
 */
P4C.Search.setupSearchInput = function () {
  const searchInput = document.getElementById('search-input');

  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      this.performSearch(e.target.value);
    }, 300);
  });

  // Clear search on Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.target.value = '';
      this.performSearch('');
    }
  });
};

/**
 * Load properties for search indexing
 */
P4C.Search.loadProperties = async function () {
  try {
    const response = await fetch('/public/properties-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load properties: ${response.status}`);
    }
    this.properties = await response.json();
    this.indexedProperties = this.createSearchIndex(this.properties);
  } catch (error) {
    console.error('Error loading search properties:', error);
  }
};

/**
 * Create searchable index from properties
 */
P4C.Search.createSearchIndex = function (properties) {
  if (!Array.isArray(properties)) return [];

  return properties.map((prop) => ({
    ...prop,
    searchText: [
      prop.title || '',
      prop.description || '',
      prop.story_description || '',
      prop.location || '',
      (prop.bedrooms || '') + ' bedroom',
      (prop.bathrooms || '') + ' bathroom',
      '$' + (prop.price || ''),
      prop.sqft ? prop.sqft + ' sqft' : '',
    ]
      .join(' ')
      .toLowerCase(),
  }));
};

/**
 * Perform search and display results
 */
P4C.Search.performSearch = function (query) {
  const resultsContainer = document.getElementById('search-results');
  const searchContainer = document.querySelector('.search-container');

  if (!query.trim()) {
    if (resultsContainer) resultsContainer.innerHTML = '';
    return;
  }

  if (!this.indexedProperties || this.indexedProperties.length === 0) {
    console.warn('Search index not loaded');
    return;
  }

  const queryLower = query.toLowerCase();
  const results = this.indexedProperties
    .filter((prop) => prop.searchText.includes(queryLower))
    .slice(0, 5); // Limit to 5 results

  if (!resultsContainer) {
    // Create results container if it doesn't exist
    this.createResultsContainer(searchContainer);
    return this.performSearch(query); // Retry
  }

  this.displayResults(results, resultsContainer, query);
};

/**
 * Create search results container
 */
P4C.Search.createResultsContainer = function (searchContainer) {
  if (!searchContainer) return;

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'search-results';
  resultsDiv.className =
    'search-results absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50 mt-1';

  searchContainer.appendChild(resultsDiv);
};

/**
 * Display search results
 */
P4C.Search.displayResults = function (results, container, query) {
  if (results.length === 0) {
    container.innerHTML =
      '<div class="p-4 text-slate-500 text-center">No properties found</div>';
    return;
  }

  container.innerHTML = `
    <div class="p-2">
      <div class="text-xs text-slate-500 mb-2 px-2">Found ${results.length} propert${results.length === 1 ? 'y' : 'ies'}</div>
      ${results.map((prop) => this.renderResult(prop)).join('')}
    </div>
  `;

  // Add click handlers to results
  container.querySelectorAll('.search-result-item').forEach((item) => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      if (url) {
        window.location.href = url;
      }
    });
  });
};

/**
 * Render individual search result
 */
P4C.Search.renderResult = function (prop) {
  const url = prop.url || `/projects/${prop.id || 'property'}.html`;

  return `
    <div class="search-result-item p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
         data-url="${url}">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-slate-900">${prop.title || 'Property'}</h4>
          <p class="text-sm text-slate-600">${prop.location || ''} • ${prop.bedrooms || 0} BR • ${prop.bathrooms || 0} BA</p>
          <p class="text-sm font-medium text-green-600">$${prop.price || 'N/A'}</p>
        </div>
        <div class="text-xs text-slate-500">${prop.sqft || ''} sqft</div>
      </div>
    </div>
  `;
};

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  P4C.Search.init();
});
