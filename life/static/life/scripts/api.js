const lifeUri = "api/Patterns";

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
  return fetch(...params).then((response) => response.json());
}
