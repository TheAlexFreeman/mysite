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

  selectedPattern = null;
  onPatternSelected = (pattern) => console.dir(pattern);

  constructor(root, patterns = []) {
    const table = createElement("table", "menu-table");
    table.appendChild(_createTableHead());
    table.appendChild(this._menu);
    patterns.forEach((pattern) => this.addPattern(pattern));
    root.appendChild(table);
  }

  updateCellColor(color = "limegreen") {
    this._patterns.forEach((game) => game.setCellColor(color));
  }
  updateBackgroundColor(color = "lightgray") {
    this._patterns.forEach((game) => game.setBackgroundColor(color));
  }

  addPattern(pattern) {
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
    row.appendChild(createElement("td", "pattern-description"));
    this._menu.appendChild(row);
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
    flipHorizontal.title = "FlipHorizontally";
    flipHorizontal.onclick = () => game.flip(false);

    controlPanel.append(rotateLeft, rotateRight, flipVertical, flipHorizontal);
    return controlPanel;
  }

  _createPreviewGrid(frame, pattern) {
    const points = new Points(...pattern.points);
    const padding = { x: 2, y: 2 };
    const size = ptAdd(points.boundingBox, ptAdd(padding, padding));
    return new GameDemo(
      { ...SETTINGS, size },
      frame,
      points.translateToList(padding.x, padding.y),
    );
  }
}
