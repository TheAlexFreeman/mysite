const lifeUri = "api/Patterns";
const catalogUri = "api/catalog/";

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
