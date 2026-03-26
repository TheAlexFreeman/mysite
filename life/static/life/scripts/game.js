class Game {
  // TODO: Add multicolored logics
  _liveCells = new Points();
  _relevantCells = new Points();
  _size = { x: 1, y: 1 };
  _borders = false;

  get size() {
    return this._size;
  }
  set size(value = { x: 1, y: 1 }) {
    this._size = value;
    this._liveCells = this._liveCells.onBoard(value);
    this._relevantCells = this._relevantCells.onBoard(value);
  }

  get borders() {
    return this._borders;
  }
  set borders(value = true) {
    this._borders = value;
    this._crossBorders = value
      ? (points) => points.filter((p) => this._includes(p))
      : (points) => points.map((p) => this._mod(p));
  }

  get population() {
    return this._liveCells.size;
  }

  get liveCells() {
    return this._liveCells.list;
  }

  get normalizedCells() {
    return this._liveCells.atOrigin.list;
  }

  constructor(size, borders) {
    this.size = size;
    this.borders = borders;
  }

  toggleCell(p) {
    if (this.hasCell(p)) {
      this.removeCell(p);
      return -1;
    } else {
      this.addCell(p);
      return 1;
    }
  }

  hasCell(p) {
    return this._liveCells.has(p);
  }

  addCell(p) {
    this._liveCells.add(p);
    this._relevantCells.addPoints(p, ...this._neighbors(p));
  }

  removeCell(p) {
    this._liveCells.remove(p);
  }

  clear() {
    this._liveCells.clear();
    this._relevantCells.clear();
  }

  rotate(clockwise = true) {
    const { x, y } = this._liveCells.min;
    const newCells = this._liveCells.atOrigin.rotate(clockwise);
    return this.translatePattern(newCells, x, y);
  }

  flip(vertical = true) {
    const { x, y } = this._liveCells.min;
    const newCells = this._liveCells.atOrigin.flip(vertical);
    return this.translatePattern(newCells, x, y);
  }

  addPattern(pattern, dx = 0, dy = 0) {
    const translatedPattern = this.translatePattern(pattern, dx, dy);
    const newCells = [];
    for (let p of translatedPattern) {
      if (!this.hasCell(p)) {
        this.addCell(p);
        newCells.push(p);
      }
    }
    return newCells;
  }

  translatePattern(pattern, x = 0, y = 0) {
    const translatePoint = (p) => ptAdd(p, { x, y });
    const translatedPoints = pattern.map(translatePoint);
    return this._crossBorders(translatedPoints);
  }

  // Heart of the game. Everything below should be optimized for speed.

  isRunning = false;
  _interval = null;

  play(tickMS, tick = () => this.tick()) {
    if (this.isRunning) {
      clearInterval(this._interval);
    } else {
      this.isRunning = true;
    }
    this._interval = setInterval(tick, tickMS);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this._interval);
  }

  tick() {
    const changes = this._collectChanges();
    changes.forEach((p) => {
      if (this.hasCell(p)) {
        this.removeCell(p);
      } else {
        this.addCell(p);
      }
    });
    return changes;
  }

  get cellsToChange() {
    return this._collectChanges();
  }

  _collectChanges() {
    const changes = new Points();
    for (let [x, ys] of this._relevantCells._map) {
      for (let y of ys) {
        if (this._needsUpdateCoords(x, y)) {
          changes.add({ x, y });
        }
      }
    }
    return changes;
  }

  get changes() {
    const changes = { on: [], off: [] };
    this._relevantCells.forEach((point) => {
      const change = this.getChange(point);
      if (change) {
        if (change instanceof Array) {
          changes.on.push({ point, change });
        } else {
          changes.off.push(point);
        }
      }
    });
    return changes;
  }

  getChange(point) {
    const { hasPt, liveNeighborsCount, liveNeighbors } = this._neighborState(
      point.x,
      point.y,
      true,
    );
    if (liveNeighborsCount > 3) {
      return hasPt;
    }
    if (liveNeighborsCount === 3) {
      return hasPt ? false : liveNeighbors;
    }
    if (liveNeighborsCount === 2) {
      return false;
    }
    this._relevantCells.remove(point);
    return hasPt;
  }

  _needsUpdate(point) {
    return this._needsUpdateCoords(point.x, point.y);
  }

  _needsUpdateCoords(x, y) {
    const point = { x, y };
    const { hasPt, liveNeighborsCount } = this._neighborState(x, y, false);
    if (liveNeighborsCount > 3) {
      return hasPt;
    }
    if (liveNeighborsCount === 3) {
      return !hasPt;
    }
    if (liveNeighborsCount === 2) {
      return false;
    }
    this._relevantCells.remove(point);
    return hasPt;
  }

  _neighborState(x, y, collectNeighbors = false) {
    const map = this._liveCells._map;
    const liveNeighbors = collectNeighbors ? [] : null;
    let liveNeighborsCount = 0;

    const pushNeighbor = (nx, ny) => {
      if (collectNeighbors) {
        liveNeighbors.push({ x: nx, y: ny });
      }
      liveNeighborsCount++;
    };

    const ys1 = map.get(x - 1);
    if (ys1?.has(y - 1)) pushNeighbor(x - 1, y - 1);
    if (ys1?.has(y)) pushNeighbor(x - 1, y);
    if (ys1?.has(y + 1)) pushNeighbor(x - 1, y + 1);

    const ys2 = map.get(x);
    const hasPt = ys2?.has(y) || false;
    if (ys2?.has(y - 1)) pushNeighbor(x, y - 1);
    if (ys2?.has(y + 1)) pushNeighbor(x, y + 1);
    if (liveNeighborsCount > 3) {
      return { hasPt, liveNeighborsCount, liveNeighbors };
    }

    const ys3 = map.get(x + 1);
    if (ys3?.has(y - 1)) pushNeighbor(x + 1, y - 1);
    if (ys3?.has(y)) pushNeighbor(x + 1, y);
    if (ys3?.has(y + 1)) pushNeighbor(x + 1, y + 1);

    return { hasPt, liveNeighborsCount, liveNeighbors };
  }

  _liveNeighbors(point) {
    return this._neighbors(point).filter((p) => this.hasCell(p));
  }

  _neighbors(point) {
    return this._crossBorders(neighbors(point));
  }

  _crossBorders = ([...points]) => points.map((p) => this._mod(p));

  _includes(point) {
    return this._includesX(point.x) && this._includesY(point.y);
  }

  _includesX(x) {
    return x >= 0 && x < this.size.x;
  }

  _includesY(y) {
    return y >= 0 && y < this.size.y;
  }

  _mod(point) {
    const { x, y } = this.size;
    return {
      x: (x + point.x) % x,
      y: (y + point.y) % y,
    };
  }
}
