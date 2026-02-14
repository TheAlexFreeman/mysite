const INPUT = new InputHandler();
const gridFrame = document.getElementById("grid-frame");
console.log(gridFrame);
const GAME = new GameBoard(
  {
    size: INPUT.size,
    colors: INPUT.colors,
    borders: INPUT.borders,
    editable: true,
  },
  gridFrame,
);
// TODO: Make event handlers direct parameters of `GAME`
resetCellEventHandlers();

const MENU = new PatternMenu(document.getElementById("menu-root"), [
  {
    name: "r-pent",
    points: [point(0, 0), point(0, 1), point(1, 1), point(1, 2), point(2, 1)],
  },
]);
MENU.onPatternSelected = (pattern) => setPreviewPattern(pattern);

getPatternsAction();

// User Actions

// TODO: Implement modes!!!
let mode = "DEFAULT";

// Keystroke handler
const { ESCAPE, SPACE, LEFT, UP, RIGHT, DOWN } = INPUT.keyCodes;
const KEYSTROKE_HANDLERS = {
  DEFAULT: {
    [ESCAPE]: (event) => resetCellEventHandlers(),
    [SPACE]: (event) => {
      event.preventDefault();
      GAME.isRunning ? stopAction() : playAction();
    },
    [LEFT]: (event) => {
      event.preventDefault();
      backAction();
    },
    [RIGHT]: (event) => {
      event.preventDefault();
      tickAction();
    },
    [UP]: (event) => {
      if (GAME.isRunning) {
        event.preventDefault();
        INPUT.speedSlider.stepUp();
        playAction();
      }
    },
    [DOWN]: (event) => {
      if (GAME.isRunning) {
        event.preventDefault();
        INPUT.speedSlider.stepDown();
        playAction();
      }
    },
  },
};

window.onkeydown = function (keyboardEvent) {
  // TODO: Better way to distinguish 'active' element of page
  if (keyboardEvent.target === document.body) {
    const keystrokeHandler = KEYSTROKE_HANDLERS[mode][keyboardEvent.keyCode];
    keystrokeHandler(keyboardEvent);
  }
};

function playAction() {
  GAME.play(INPUT.tickDelay, () => tickAction());
}

function stopAction() {
  GAME.stop();
}

function tickAction() {
  const changes = GAME.tick();
  INPUT.generationCount += 1;
  INPUT.populationCount = GAME.population;
}

function backAction() {
  const changes = GAME.back();
  if (changes instanceof Points) {
    // Natural generation
    INPUT.generationCount -= 1;
  }
  INPUT.populationCount = GAME.population;
}

function editGenerationAction() {
  INPUT.showGenerationInput();
}

function setGenerationAction() {
  INPUT.hideGenerationInput();
  const target = parseInt(INPUT.generationInput.value);
  while (INPUT.generationCount !== target) {
    INPUT.generationCount < target ? tickAction() : backAction();
  }
}

function clearBoardAction() {
  GAME.clear();
  INPUT.populationCount = 0;
  INPUT.generationCount = 0;
}

function updateSizeAction() {
  // FIXME
  GAME.size = INPUT.size;
  resetCellEventHandlers();
}

function updateBordersAction() {
  // FIXME
  GAME.borders = INPUT.borders;
}

function updateCellColorAction() {
  const color = INPUT.cellColor;
  GAME.setCellColor(color);
  MENU.updateCellColor(color);
}

function updateBackgroundColorAction() {
  const color = INPUT.backgroundColor;
  GAME.setBackgroundColor(color);
  MENU.updateBackgroundColor(color);
}

function getPatternsAction() {
  apiGetAllPatterns().then((patterns) => {
    patterns.forEach((pattern) => MENU.addPattern(pattern));
  });
}

function savePatternAction() {
  const { name, creator, points } = INPUT.validatePattern(GAME);
  apiSavePattern(name, creator, points)
    .then((pattern) => MENU.addPattern(pattern))
    .catch((error) => console.error(`Unable to save pattern ${name}. `, error));
}

// Click/hover handler functions

function setPreviewPattern(pattern) {
  const { points } = pattern;
  const handlers = previewPatternHandlers(points);
  GAME.setCellEventHandlers(handlers);
}

function previewPatternHandlers(points) {
  return {
    onClick: (x, y) => (event) => {
      addPattern(points, x, y);
      if (!event.shiftKey) {
        resetCellEventHandlers();
      }
    },
    onMouseOver: (x, y) => () => {
      GAME.previewPattern(points, x, y, true);
    },
    onMouseOut: (x, y) => () => {
      GAME.previewPattern(points, x, y, false);
    },
  };
}

function addPattern(pattern, x, y) {
  const newCells = GAME.addPattern(pattern, x, y);
  INPUT.populationCount += newCells.length;
}

function resetCellEventHandlers() {
  GAME.setCellEventHandlers({
    onClick: (x, y) => () => {
      toggleCell({ x, y });
    },
  });
  GAME._forEach((p) => GAME._grid.setOpacity(p, 1.0));
}

function toggleCell(p) {
  INPUT.populationCount += GAME.toggleCell(p);
}
