function point(x = 0, y = 0) {
  return { x, y };
}

function ptEquals(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function ptAdd(p1, p2) {
  return point(p1.x + p2.x, p1.y + p2.y);
}

function ptSub(p1, p2) {
  return point(p1.x - p2.x, p1.y - p2.y);
}

const ORIGIN = { x: 0, y: 0 };

class Points {
  _map = new Map();

  constructor(...points) {
    for (let { x, y } of points) {
      if (!this._map.has(x)) {
        this._map.set(x, new Set());
      }
      this._map.get(x).add(y);
    }
  }

  get hasPoints() {
    return this._map.size > 0;
  }

  get size() {
    let result = 0;
    for (let [_, ys] of this._map) {
      result += ys.size;
    }
    return result;
  }

  get list() {
    return this.map((p) => p);
  }

  has(p = ORIGIN) {
    const { x, y } = p;
    return this._map.has(x) && this._map.get(x).has(y);
  }

  add(p = ORIGIN) {
    const { x, y } = p;
    if (!this._map.has(x)) {
      this._map.set(x, new Set());
    }
    this._map.get(x).add(y);
  }

  remove(p = ORIGIN) {
    const { x, y } = p;
    if (this._map.has(x)) {
      this._map.get(x).delete(y);
    }
  }

  clear() {
    this._map.clear();
  }

  forEach(action = ({ x, y }) => {}) {
    for (let [x, ys] of this._map) {
      for (let y of ys) {
        action({ x, y });
      }
    }
  }

  some(pred = (_) => true) {
    for (let [x, ys] of this._map) {
      for (let y of ys) {
        if (pred({ x, y })) return true;
      }
    }
    return false;
  }

  all(pred = (_) => true) {
    for (let [x, ys] of this._map) {
      for (let y of ys) {
        if (!pred({ x, y })) return false;
      }
    }
    return true;
  }

  get max() {
    const result = { x: 0, y: 0 };
    for (let [x, ys] of this._map) {
      if (x > result.x && ys.size) {
        result.x = x;
      }
      for (let y of ys) {
        if (y > result.y) {
          result.y = y;
        }
      }
    }
    return result;
  }

  get min() {
    const result = { x: Infinity, y: Infinity };
    for (let [x, ys] of this._map) {
      if (x < result.x && ys.size) {
        result.x = x;
      }
      for (let y of ys) {
        if (y < result.y) {
          result.y = y;
        }
      }
    }
    return result;
  }

  get minMax() {
    const max = { x: 0, y: 0 };
    const min = { x: Infinity, y: Infinity };
    for (let [x, ys] of this._map) {
      if (ys.size) {
        if (x > max.x) {
          max.x = x;
        }
        if (x < min.x) {
          min.x = x;
        }
      }
      for (let y of ys) {
        if (y > max.y) {
          max.y = y;
        }
        if (y < min.y) {
          min.y = y;
        }
      }
    }
    return { min, max };
  }

  get boundingBox() {
    const { min, max } = this.minMax;
    return {
      x: max.x - min.x + 1,
      y: max.y - min.y + 1,
    };
  }

  get atOrigin() {
    const min = this.min;
    const result = new Points();
    for (let [x, ys] of this._map) {
      if (ys.size) {
        result._map.set(x - min.x, new Set([...ys].map((y) => y - min.y)));
      }
    }
    return result;
  }

  get neighbors() {
    const result = new Points();
    this.forEach((p) =>
      result.addPoints(...neighbors(p).filter((pt) => !this.has(pt))),
    );
    return result;
  }

  inBox(min = ORIGIN, max = ORIGIN) {
    const result = new Points();
    for (let [x, ys] of this._map) {
      if (x >= min.x && x < max.x) {
        for (let y of ys) {
          if (y >= min.y && y < max.y) {
            result.add({ x, y });
          }
        }
      }
    }
    return result;
  }

  onBoard(size = { x: 1, y: 1 }) {
    return this.inBox(ORIGIN, size);
  }

  copy() {
    const result = new Points();
    for (let [x, ys] of this._map) {
      if (ys.size) {
        result._map.set(x, new Set(ys));
      }
    }
    return result;
  }

  map(func = ({ x, y }) => any) {
    const result = [];
    this.forEach(({ x, y }) => result.push(func({ x, y })));
    return result;
  }

  filter(pred = ({ x, y }) => true) {
    const result = new Points();
    this.forEach((p) => {
      if (pred(p)) {
        result.add(p);
      }
    });
    return result;
  }

  filterToList(pred = ({ x, y }) => true) {
    const result = [];
    this.forEach((p) => {
      if (pred(p)) {
        result.push(p);
      }
    });
    return result;
  }

  equals(pts) {
    if (!(pts instanceof Points)) return false;
    if (pts.size !== this.size) return false;
    return this.all((p) => pts.has(p));
  }

  addPoints(...points) {
    points.forEach((p) => this.add(p));
  }

  union(points) {
    for (let [x, ys] of points._map) {
      if (this._map.has(x)) {
        const row = this._map.get(x);
        for (let y of ys) {
          row.add(y);
        }
      } else {
        this._map.set(x, ys);
      }
    }
  }

  translate(x, y) {
    const result = new Points();
    this.forEach((p) => result.add(ptAdd(p, { x, y })));
    return result;
  }

  translateToList(x, y) {
    const result = [];
    this.forEach((p) => result.push(ptAdd(p, { x, y })));
    return result;
  }

  _rotationFunction(clockwise = true) {
    // TODO: Fix this so it can rotate figures in place
    const { min, max } = this.minMax;
    if (clockwise) {
      return ({ x, y }) => point(y, max.x - x);
    }
    return ({ x, y }) => point(max.y - y, x);
  }

  rotate(clockwise = true) {
    const result = new Points();
    const rotate = this._rotationFunction(clockwise);
    this.forEach((p) => result.add(rotate(p)));
    return result;
  }

  _flipFunction(vertical = true) {
    const max = this.max;
    if (vertical) {
      return ({ x, y }) => point(max.x - x, y);
    }
    return ({ x, y }) => point(x, max.y - y);
  }

  flip(vertical = true) {
    const result = new Points();
    const flip = this._flipFunction(vertical);
    this.forEach((p) => result.add(flip(p)));
    return result;
  }
}

// Points utility functions

function ptsMap(points, func = ({ x, y }) => any) {
  const result = [];
  points.forEach(({ x, y }) => result.push(func({ x, y })));
  return result;
}

function ptsFilter(points, pred = ({ x, y }) => true) {
  const result = new Points();
  points.forEach((p) => {
    if (pred(p)) {
      result.add(p);
    }
  });
  return result;
}

function ptsFilterToList(points, pred = ({ x, y }) => true) {
  const result = [];
  points.forEach((p) => {
    if (pred(p)) {
      result.push(p);
    }
  });
  return result;
}

function ptsEquals(pts1, pts2) {
  if (!(pts1 instanceof Points && pts2 instanceof Points)) return false;
  if (pts1.size !== pts2.size) return false;
  return pts1.all((p) => pts2.has(p));
}

function ptsTranslate(points, x, y) {
  const result = new Points();
  points.forEach((p) => result.add(ptAdd(p, { x, y })));
  return result;
}

function ptsTranslateToList(points, x, y) {
  const result = [];
  points.forEach((p) => result.push(ptAdd(p, { x, y })));
  return result;
}

// Positional Calculations

function neighbor(x = 0, y = 0) {
  return (p) => ptAdd(p, { x, y });
}

const N = neighbor(1, 0);
const S = neighbor(-1, 0);
const E = neighbor(0, 1);
const W = neighbor(0, -1);
const NE = neighbor(1, 1);
const SE = neighbor(-1, 1);
const NW = neighbor(1, -1);
const SW = neighbor(-1, -1);

const NEIGHBORS = [NW, N, NE, W, E, SW, S, SE];

function neighbors(p = ORIGIN) {
  return NEIGHBORS.map((f) => f(p));
}
