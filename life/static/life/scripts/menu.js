const _COLUMNS = ["name", "preview", "controls", "description"];

function createElement(tagName, className = "", textContent = "") {
  // TODO: Make this more flexible (add title, id, etc.)
  const element = document.createElement(tagName);
  element.className = className;
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

function _createTableHead() {
  const tHead = createElement("thead");
  const row = createElement("tr");
  _COLUMNS.forEach((columnName) => {
    const headerCell = createElement("th");
    headerCell.appendChild(
      createElement("span", "menu-table-header", columnName),
    );
    row.appendChild(headerCell);
  });
  tHead.appendChild(row);
  return tHead;
}

const SETTINGS = {
  colors: { on: "limegreen", off: "lightgray" },
  borders: true,
  editable: false,
};

class PatternMenu {
  _patterns = [];
  _menu = createElement("tbody", "menu-body");
  _statusRow = null;

  selectedPattern = null;
  onPatternSelected = (pattern) => console.dir(pattern);
  onRetryRequested = () => {};

  constructor(root, patterns = []) {
    const table = createElement("table", "menu-table");
    table.appendChild(_createTableHead());
    table.appendChild(this._menu);
    if (patterns.length) {
      patterns.forEach((pattern) => this.addPattern(pattern));
    } else {
      this.setEmptyState();
    }
    root.appendChild(table);
  }

  clear() {
    this._patterns = [];
    this._menu.replaceChildren();
    this._statusRow = null;
  }

  setPatterns(patterns = []) {
    this.clear();
    if (!patterns.length) {
      this.setEmptyState();
      return;
    }
    patterns.forEach((pattern) => this.addPattern(pattern));
  }

  setLoadingState(
    title = "Loading patterns",
    detail = "Reading the Conway glossary and building previews.",
  ) {
    this._showState("loading", title, detail);
  }

  setErrorState(
    title = "Unable to load patterns",
    detail = "Try refreshing the page in a moment.",
  ) {
    this._showState("error", title, detail, {
      actionLabel: "Retry loading catalog",
      action: () => this.onRetryRequested(),
    });
  }

  setEmptyState(
    title = "No patterns available",
    detail = "The Conway glossary catalog did not return any patterns.",
  ) {
    this._showState("empty", title, detail, {
      secondaryDetail:
        "Saved user patterns are separate from this glossary menu and will only appear once a save-backed catalog exists.",
    });
  }

  updateCellColor(color = "limegreen") {
    this._patterns.forEach((game) => game.setCellColor(color));
  }
  updateBackgroundColor(color = "lightgray") {
    this._patterns.forEach((game) => game.setBackgroundColor(color));
  }

  addPattern(pattern) {
    this._clearState();
    const row = createElement("tr", "menu-item");

    const nameCell = createElement("td", "pattern-name", pattern.name);
    nameCell.onclick = () => this.onPatternSelected(pattern);
    row.appendChild(nameCell);

    const previewCell = this._createPreviewCell(pattern);
    row.appendChild(previewCell);
    const controlCell = createElement("td", "pattern-controls");
    controlCell.append(
      this._createPreviewControls(this._patterns[this._patterns.length - 1]),
    );
    row.appendChild(controlCell);
    row.appendChild(
      createElement("td", "pattern-description", pattern.description || ""),
    );
    this._menu.appendChild(row);
  }

  _clearState() {
    if (this._statusRow) {
      this._statusRow.remove();
      this._statusRow = null;
    }
  }

  _showState(kind, title, detail, options = {}) {
    this.clear();
    const row = createElement("tr", `menu-state-row menu-state-${kind}`);
    const cell = createElement("td", "menu-state-cell");
    cell.colSpan = _COLUMNS.length;

    const panel = createElement("div", "menu-state-panel");
    panel.appendChild(createElement("p", "menu-state-eyebrow", kind));
    panel.appendChild(createElement("h3", "menu-state-title", title));
    panel.appendChild(createElement("p", "menu-state-detail", detail));

    if (options.secondaryDetail) {
      panel.appendChild(
        createElement("p", "menu-state-note", options.secondaryDetail),
      );
    }

    if (options.actionLabel && typeof options.action === "function") {
      const button = createElement(
        "button",
        "menu-state-action",
        options.actionLabel,
      );
      button.type = "button";
      button.onclick = options.action;
      panel.appendChild(button);
    }

    cell.appendChild(panel);
    row.appendChild(cell);
    this._menu.appendChild(row);
    this._statusRow = row;
  }

  _createPreviewCell(pattern) {
    const previewCell = createElement("td", "pattern-preview");
    const previewFrame = createElement("div", "preview-grid-frame");
    const game = this._createPreviewGrid(previewFrame, pattern);
    previewFrame.onclick = () =>
      this.onPatternSelected({ ...pattern, points: game.pattern });
    this._patterns.push(game);
    previewCell.append(previewFrame);
    return previewCell;
  }

  _createPreviewControls(game) {
    const controlPanel = createElement("div", "menu-control-panel");

    const rotateLeft = createElement("a", "rotate-button", `↺`);
    rotateLeft.title = "Rotate Counterclockwise";
    rotateLeft.onclick = () => game.rotate(false);

    const rotateRight = createElement("a", "rotate-button", `↻`);
    rotateRight.title = "Rotate Clockwise";
    rotateRight.onclick = () => game.rotate(true);

    const flipVertical = createElement("a", "flip-button", "↕");
    flipVertical.title = "Flip Vertically";
    flipVertical.onclick = () => game.flip(true);

    const flipHorizontal = createElement("a", "flip-button", "↔");
    flipHorizontal.title = "Flip Horizontally";
    flipHorizontal.onclick = () => game.flip(false);

    controlPanel.append(rotateLeft, rotateRight, flipVertical, flipHorizontal);
    return controlPanel;
  }

  _createPreviewGrid(frame, pattern) {
    const points = new Points(...pattern.points);
    const padding = { x: 2, y: 2 };
    const size = ptAdd(points.boundingBox, ptAdd(padding, padding));
    return new DemoBoard(
      { ...SETTINGS, size },
      frame,
      points.translateToList(padding.x, padding.y),
    );
  }
}
