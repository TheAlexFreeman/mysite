function createElement(tagName, className) {
  const result = document.createElement(tagName);
  result.className = className;
  return result;
}

class Grid {
  _grid = [];
  root;
  _cellHandlers = null;

  constructor(frame, settings, cells = []) {
    this.root = this._createGrid(settings, cells);
    this._bindDelegatedCellEvents();
    frame.appendChild(this.root);
  }

  getColor({ x, y }) {
    return this._grid[x][y].style.backgroundColor;
  }
  setColor({ x, y }, color) {
    this._grid[x][y].style.backgroundColor = color;
  }
  setOpacity({ x, y }, opacity) {
    this._grid[x][y].style.opacity = opacity;
  }
  setColorAndOpacity({ x, y }, color, opacity) {
    const { style } = this._grid[x][y];
    style.backgroundColor = color;
    style.opacity = opacity;
  }

  remove() {
    if (this.root) {
      this.root.remove();
    }
  }

  setGridEventHandlers(handlers) {
    const { onClick } = handlers;
    this.root.onclick = onClick;
  }

  setCellEventHandlers(handlers) {
    this._cellHandlers = handlers;
  }

  setBorders(value = true) {
    const borderStyle = value ? "1px solid black" : "1px dashed gray";
    this._setBordersTopBottom(borderStyle);
    this._setBordersLeftRight(borderStyle);
  }

  _setBordersTopBottom(borderStyle) {
    const topRow = this._grid[0];
    const bottomRow = this._grid[this._grid.length - 1];
    for (let y = 0; y < topRow.length; y++) {
      topRow[y].style.borderTop = borderStyle;
      bottomRow[y].style.borderBottom = borderStyle;
    }
  }

  _setBordersLeftRight(borderStyle) {
    const y = this._grid[0].length - 1;
    for (let row of this._grid) {
      row[0].style.borderLeft = borderStyle;
      row[y].style.borderRight = borderStyle;
    }
  }

  _bindDelegatedCellEvents() {
    const getCell = (event) => event.target.closest(".cell");

    this.root.onclick = (event) => {
      const cell = getCell(event);
      if (!cell || !this.root.contains(cell)) return;
      const { onClick } = this._cellHandlers || {};
      if (!onClick) return;
      const x = Number(cell.dataset.x);
      const y = Number(cell.dataset.y);
      onClick(x, y)(event);
    };

    this.root.onmouseover = (event) => {
      const cell = getCell(event);
      if (!cell || !this.root.contains(cell)) return;
      const { onMouseOver } = this._cellHandlers || {};
      if (onMouseOver) {
        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);
        onMouseOver(x, y)(event);
      } else {
        cell.style.opacity = 0.5;
      }
    };

    this.root.onmouseout = (event) => {
      const cell = getCell(event);
      if (!cell || !this.root.contains(cell)) return;
      const { onMouseOut } = this._cellHandlers || {};
      if (onMouseOut) {
        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);
        onMouseOut(x, y)(event);
      } else {
        cell.style.opacity = 1.0;
      }
    };
  }

  _cellLookup(cells = []) {
    const lookup = new Map();
    for (let { x, y } of cells) {
      if (!lookup.has(x)) {
        lookup.set(x, new Set());
      }
      lookup.get(x).add(y);
    }
    return lookup;
  }

  // Grid construction methods

  _createGrid(settings, cells) {
    const { size, colors, borders } = settings;
    const gridElement = createElement("div", "grid");
    const cellLookup = this._cellLookup(cells);
    for (let x = 0; x < size.x; x++) {
      gridElement.appendChild(this._createRow(x, size.y, colors, cellLookup));
    }
    this.setBorders(borders);
    return gridElement;
  }

  _createRow(x, size, colors, cellLookup) {
    const row = [];
    const rowElement = createElement("div", "row");
    const rowLookup = cellLookup.get(x);
    for (let y = 0; y < size; y++) {
      const cell = createElement("span", "cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      const isAlive = rowLookup?.has(y) || false;
      cell.style.backgroundColor = isAlive ? colors.on : colors.off;
      row.push(cell);
      rowElement.appendChild(cell);
    }
    this._grid.push(row);
    return rowElement;
  }
}
