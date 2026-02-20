class GameBoard {
  _grid;
  _frame;
  _game;
  _settings = {
    colors: { on: "limegreen", off: "lightgray" },
  };

  get settings() {
    return {
      size: this.size,
      colors: this.colors,
      borders: this.borders,
    };
  }

  get size() {
    return this._game.size;
  }
  set size(value = { x: 1, y: 1 }) {
    this._game.size = value;
    if (this._frame) {
      this.displayGrid(this._frame);
    }
  }

  get colors() {
    return this._settings.colors;
  }
  setCellColor(color = "limegreen") {
    this.colors.on = color;
    this._liveCells.forEach((cell) => this._grid.setColor(cell, color));
  }
  setBackgroundColor(color = "lightgray") {
    this.colors.off = color;
    this._forEach((p) => {
      if (!this.hasCell(p)) {
        this._grid.setColor(p, color);
      }
    });
  }

  get borders() {
    return this._game.borders;
  }
  set borders(value = true) {
    this._game.borders = value;
    this._grid.setBorders(value);
  }

  _forEach(func = ({ x, y }) => {}) {
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        func({ x, y });
      }
    }
  }

  get isRunning() {
    return this._game.isRunning;
  }

  get cells() {
    return this._game.liveCells;
  }

  get pattern() {
    return this._game.normalizedCells;
  }

  get population() {
    return this._game.population;
  }

  constructor(settings, frame = null, cells = []) {
    this._frame = frame;
    this._game = new Game(settings.size, settings.borders);
    this._settings.colors = settings.colors;
    this.size = settings.size;
    cells.forEach((p) => this.addCell(p));
  }

  displayGrid(frame) {
    if (this._grid) {
      this._grid.remove();
    }
    this._grid = new Grid(frame, this.settings, this.cells);
  }

  hasCell(p) {
    return this._game.hasCell(p);
  }

  addCell(p, color = "limegreen") {
    this._game.addCell(p);
    this._grid.setColor(p, color);
  }

  removeCell(p) {
    this._game.removeCell(p);
    this._grid.setColor(p, this.colors.off);
  }

  toggleCell(p, color = "limegreen") {
    if (this.hasCell(p)) {
      this.removeCell(p);
      return -1;
    } else {
      this.addCell(p, color);
      return 1;
    }
  }

  rotate(clockwise = true) {
    const rotatedCells = this._game.rotate(clockwise);
    this.clear();
    const { x, y } = this.size;
    this.size = { x: y, y: x };
    this.addPattern(rotatedCells);
  }

  flip(vertical = true) {
    const flippedCells = this._game.flip(vertical);
    this.clear();
    this.addPattern(flippedCells);
  }

  clear() {
    this.cells.forEach((p) => this.removeCell(p));
    this._game.clear();
  }

  addPattern(pattern, dx = 0, dy = 0) {
    const newCells = this._game.addPattern(pattern, dx, dy);
    newCells.forEach((p) => this._grid.setColor(p, this.colors.on));
    return newCells;
  }

  tick() {
    const changes = this._game.changes;
    console.log(changes);
    changes.forEach(({ point, change }) => {
      this._game.toggleCell(point);
      if (change instanceof Array) {
        const colors = change.map((p) => this._grid.getColor(p));
        this._grid.setColor(point, this._nextColor(colors));
      } else {
        this._grid.setColor(point, this.colors.off);
      }
    });
    return changes;
  }

  _nextColor([c1, c2, c3] = ["limegreen", "limegreen", "limegreen"]) {
    // console.log(c1, c2, c3);
    return "limegreen";
  }

  _correctColor(p) {
    this._grid.setColor(p, this.hasCell(p) ? this.colors.on : this.colors.off);
  }

  play(tickMS, tick = () => this.tick()) {
    this._game.play(tickMS, tick);
  }

  playWhile(tickMS, condition = () => true, onStop = null) {
    const tick = () => {
      if (condition()) {
        this.tick();
      } else {
        this.stop(onStop);
      }
    };
    this._game.play(tickMS, tick);
  }

  playGenerations(tickMS, generations = Infinity, onStop = null) {
    let counter = 0;
    const tick = () => {
      if (counter < generations) {
        this.tick();
        counter += 1;
      } else {
        this.stop(onStop);
      }
    };
    this._game.play(tickMS, tick);
  }

  stop(callback = null) {
    this._game.stop();
    if (callback) callback();
  }
}

class DemoBoard extends GameBoard {
  setClickHandler(onClick = () => {}) {
    this._grid.setGridEventHandlers({ onClick });
  }

  repeat(seedPattern, generations, tickMS) {
    const play = () => {
      this.clear();
      this.addPattern(seedPattern);
      this.playGenerations(tickMS, generations, play);
    };
    play();
  }
}

class GameMemory {
  _memory = [];

  get latestChanges() {
    return this._memory[this._memory.length - 1];
  }

  countGenerations() {
    return this._memory.filter((changes) => !(changes instanceof Array)).length;
  }

  addTick(points) {
    this._memory.push(points);
  }

  addEdit(...points) {
    if (this._memory.length) {
      const changes = this.latestChanges;
      if (changes instanceof Array) {
        // Last change was manual edit
        // New edit is added to latest changes
        changes.push(...points);
      } else {
        // Last change was natural generation
        // New edit becomes NEW latest changes
        this._memory.push(points);
      }
    }
  }

  pop() {
    return this._memory.pop() || [];
  }

  clear() {
    this._memory = [];
  }
}

class PlayableBoard extends GameBoard {
  _memory = new GameMemory();

  get generation() {
    return this._memory.countGenerations();
  }

  constructor(settings, frame = null, cells = []) {
    super(settings, frame, cells);
    this.setCellEventHandlers();
  }

  tick() {
    const changes = super.tick();
    this._memory.addTick(changes);
    return changes;
  }

  back() {
    const changes = this._memory.pop();
    changes.forEach((p) => super.toggleCell(p));
    return changes;
  }

  clear() {
    super.clear();
    this._memory.clear();
  }

  toggleCell(p, color = "limegreen") {
    this._memory.addEdit(p);
    return super.toggleCell(p, color);
  }

  addPattern(pattern, x = 0, y = 0) {
    const newCells = super.addPattern(pattern, x, y);
    this._memory.addEdit(...newCells);
    pattern.forEach((p) => this._grid.setOpacity(p, 1.0));
    this.setCellEventHandlers();
    return newCells;
  }

  setCellEventHandlers(
    handlers = { onClick: (x, y) => () => this.toggleCell({ x, y }) },
  ) {
    this._forEach(({ x, y }) =>
      this._grid.setCellEventHandlers(x, y, handlers),
    );
  }

  // Support for adding patterns from menu

  previewPattern(pattern, dx = 0, dy = 0, on = false) {
    const previewCell = on
      ? (cell) => {
          this._grid.setColorAndOpacity(cell, this.colors.on, 0.8);
        }
      : (cell) => {
          this._grid.setColorAndOpacity(cell, this._colorAt(cell), 1.0);
        };
    for (let cell of this._game.translatePattern(pattern, dx, dy)) {
      previewCell(cell);
    }
  }

  _colorAt(p) {
    return this.hasCell(p) ? this.colors.on : this.colors.off;
  }
}
