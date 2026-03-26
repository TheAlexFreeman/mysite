const LIFE_API_CONFIG = window.LIFE_API_CONFIG || {};
const lifeUri = LIFE_API_CONFIG.lifeUri || "api/Patterns";
const catalogUri = LIFE_API_CONFIG.catalogUri || "api/catalog/";
const persistenceDisabled = LIFE_API_CONFIG.persistenceDisabled || false;

function apiGetPatternCatalog() {
  return _apiFetch(catalogUri);
}

function apiGetAllPatterns() {
  return _apiFetch(lifeUri);
}

function apiLoadPattern(id) {
  return _apiFetch(`${lifeUri}/${id}`);
}

function apiSavePattern(name, creator, points) {
  if (persistenceDisabled) {
    return Promise.reject(
      new Error("Pattern saving is disabled in the static export."),
    );
  }
  return _apiFetch(`${lifeUri}/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: 0, name, creator, points }),
  });
}

function apiSaveColorScheme(name, colors) {
  if (persistenceDisabled) {
    return Promise.reject(
      new Error("Color scheme saving is disabled in the static export."),
    );
  }
  return _apiFetch(`${lifeUri}/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...colors, name, id: 0 }),
  });
}

function _apiFetch(...params) {
  return fetch(...params).then(async (response) => {
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error) {
          message = data.error;
        }
      } catch {
        // Fall back to the status-based message when the body is not JSON.
      }
      throw new Error(message);
    }
    return response.json();
  });
}
