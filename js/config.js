// ====================
// Config
// ====================

const CONFIG_KEY_BINDINGS_STORAGE_KEY = "tachikage.keyBindings";
const CONFIG_CHEAT_MODE_STORAGE_KEY = "tachikage.cheatMode";
const CONFIG_STORAGE_KEY_PREFIX = "tachikage.";
const CONFIG_BOSS_MODE_UNLOCK_STORAGE_KEY = "tachikage.bossModeUnlocked";

const configGameCanvas = document.getElementById("game");
const configResetCanvas = document.getElementById("config-reset-ui");
const configResetCtx = configResetCanvas.getContext("2d");
const CONFIG_LAYOUT = Object.freeze({
  keyColumnX: 100,
  keyColumnW: 350,
  resetColumnX: 475,
  resetColumnW: 300,
  valueColumnX: 300,
  sectionY: 106,
  firstItemY: 138,
  itemGap: 34,
  itemHitH: 28
});

const DEFAULT_KEY_BINDINGS = Object.freeze({
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  parry: "Space",
  special: "KeyX"
});

const CONTROL_ACTIONS = [
  { id: "up", label: "Move Up" },
  { id: "down", label: "Move Down" },
  { id: "left", label: "Move Left" },
  { id: "right", label: "Move Right" },
  { id: "parry", label: "Parry" },
  { id: "special", label: "Stake" }
];

const CONFIG_MENU_ITEMS = [
  { type: "key", action: "up" },
  { type: "key", action: "down" },
  { type: "key", action: "left" },
  { type: "key", action: "right" },
  { type: "key", action: "parry" },
  { type: "key", action: "special" },
  {
    type: "button",
    id: "resetBossUnlock",
    label: "Reset Boss Mode Unlock"
  },
  {
    type: "button",
    id: "resetTachikageStorage",
    label: "Reset TACHIKAGE Storage"
  },
  {
    type: "toggle",
    id: "cheatMode",
    label: "Cheat Mode"
  }
];

let keyBindings = loadKeyBindings();
let cheatModeEnabled = loadCheatModeEnabled();
let configMenuIndex = 0;
let configCaptureAction = null;
let configConfirmAction = null;
let configMessage = "";
let configMessageTimer = 0;

function readConfigStorageValue(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeConfigStorageValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage can be unavailable in restricted browser modes.
  }
}

function removeConfigStorageValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Storage can be unavailable in restricted browser modes.
  }
}

function getDefaultKeyBindings() {
  return { ...DEFAULT_KEY_BINDINGS };
}

function loadKeyBindings() {
  const bindings = getDefaultKeyBindings();
  const saved = readConfigStorageValue(CONFIG_KEY_BINDINGS_STORAGE_KEY);

  if (!saved) return bindings;

  try {
    const parsed = JSON.parse(saved);

    CONTROL_ACTIONS.forEach(action => {
      if (
        typeof parsed[action.id] === "string" &&
        parsed[action.id].length > 0
      ) {
        bindings[action.id] = parsed[action.id];
      }
    });
  } catch (error) {
    return bindings;
  }

  return bindings;
}

function saveKeyBindings() {
  writeConfigStorageValue(
    CONFIG_KEY_BINDINGS_STORAGE_KEY,
    JSON.stringify(keyBindings)
  );
}

function loadCheatModeEnabled() {
  return readConfigStorageValue(CONFIG_CHEAT_MODE_STORAGE_KEY) === "1";
}

function saveCheatModeEnabled() {
  writeConfigStorageValue(
    CONFIG_CHEAT_MODE_STORAGE_KEY,
    cheatModeEnabled ? "1" : "0"
  );
}

function toggleCheatModeEnabled() {
  cheatModeEnabled = !cheatModeEnabled;
  saveCheatModeEnabled();
  showConfigNotice(
    cheatModeEnabled
      ? "Cheat Mode ON"
      : "Cheat Mode OFF"
  );
}

function isCheatModeEnabled() {
  return cheatModeEnabled;
}

function showConfigMessage(message) {
  configMessage = message;
  configMessageTimer = 0;
}

function showConfigNotice(message) {
  configMessage = message;
  configMessageTimer = 60;
}

function updateConfigMessageTimer() {
  if (configMessageTimer <= 0) return;

  configMessageTimer--;

  if (configMessageTimer <= 0) {
    configMessage = "";
  }
}

function isControlPressed(action) {
  const code = keyBindings[action];
  return Boolean(code && keys[code]);
}

function isControlKey(e, action) {
  return e.code === keyBindings[action];
}

function isMovementControlKey(e) {
  return (
    isControlKey(e, "up") ||
    isControlKey(e, "down") ||
    isControlKey(e, "left") ||
    isControlKey(e, "right")
  );
}

function getControlKeyLabel(action) {
  return formatKeyCode(keyBindings[action] || DEFAULT_KEY_BINDINGS[action]);
}

function getConfigKeyLabel(action) {
  return formatKeyCode(
    keyBindings[action] || DEFAULT_KEY_BINDINGS[action],
    { compact: true }
  );
}

function getMovementControlLabel() {
  const defaultMove =
    keyBindings.up === DEFAULT_KEY_BINDINGS.up &&
    keyBindings.down === DEFAULT_KEY_BINDINGS.down &&
    keyBindings.left === DEFAULT_KEY_BINDINGS.left &&
    keyBindings.right === DEFAULT_KEY_BINDINGS.right;

  if (defaultMove) return "Arrow keys";

  return [
    getControlKeyLabel("up"),
    getControlKeyLabel("down"),
    getControlKeyLabel("left"),
    getControlKeyLabel("right")
  ].join(" / ");
}

function getMovementControlTextLabel() {
  const defaultMove =
    keyBindings.up === DEFAULT_KEY_BINDINGS.up &&
    keyBindings.down === DEFAULT_KEY_BINDINGS.down &&
    keyBindings.left === DEFAULT_KEY_BINDINGS.left &&
    keyBindings.right === DEFAULT_KEY_BINDINGS.right;

  return defaultMove ? "矢印キー" : getMovementControlLabel();
}

function formatKeyCode(code, options = {}) {
  if (!code) return "-";
  if (code === "Space") return "Space";
  if (code.startsWith("Arrow")) {
    const direction = code.slice(5);
    return options.compact ? direction : `Arrow ${direction}`;
  }
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return `Num ${code.slice(6)}`;
  return code;
}

function ellipsizeText(text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;

  const ellipsis = "...";
  let trimmed = text;

  while (
    trimmed.length > 0 &&
    ctx.measureText(trimmed + ellipsis).width > maxWidth
  ) {
    trimmed = trimmed.slice(0, -1);
  }

  return trimmed.length > 0 ? trimmed + ellipsis : ellipsis;
}

function getControlActionLabel(actionId) {
  const action = CONTROL_ACTIONS.find(item => item.id === actionId);
  return action ? action.label : actionId;
}

function findActionByCode(code, exceptAction) {
  return CONTROL_ACTIONS.find(action => {
    return action.id !== exceptAction && keyBindings[action.id] === code;
  });
}

function handleConfigKey(e) {
  if (configConfirmAction) {
    handleConfigConfirmKey(e);
    return;
  }

  if (configCaptureAction) {
    handleConfigCaptureKey(e);
    return;
  }

  if (e.key === "Escape") {
    enterTitle();
    return;
  }

  if (e.code === "ArrowUp") {
    configMenuIndex =
      (configMenuIndex - 1 + CONFIG_MENU_ITEMS.length) %
      CONFIG_MENU_ITEMS.length;
    return;
  }

  if (e.code === "ArrowDown") {
    configMenuIndex =
      (configMenuIndex + 1) % CONFIG_MENU_ITEMS.length;
    return;
  }

  if (e.key === "Enter") {
    activateConfigMenuItem(CONFIG_MENU_ITEMS[configMenuIndex]);
  }
}

function handleConfigConfirmKey(e) {
  if (e.key === "Escape") {
    configConfirmAction = null;
    showConfigNotice("Reset canceled");
    return;
  }

  if (e.key !== "Enter") return;

  if (configConfirmAction === "resetKeys") {
    confirmKeyReset();
  }
}

function handleConfigCaptureKey(e) {
  if (e.key === "Escape") {
    configCaptureAction = null;
    showConfigNotice("Key change canceled");
    return;
  }

  const usedAction = findActionByCode(e.code, configCaptureAction);

  if (usedAction) {
    showConfigNotice(
      `${formatKeyCode(e.code)} is already used by ${usedAction.label}`
    );
    return;
  }

  keyBindings[configCaptureAction] = e.code;
  saveKeyBindings();

  showConfigNotice(
    `${getControlActionLabel(configCaptureAction)} set to ` +
    getControlKeyLabel(configCaptureAction)
  );
  configCaptureAction = null;
}

function activateConfigMenuItem(item) {
  if (item.type === "key") {
    configCaptureAction = item.action;
    showConfigMessage(`Press a key for ${getControlActionLabel(item.action)}`);
    return;
  }

  if (item.id === "resetKeys") {
    startKeyResetConfirm();
    return;
  }

  if (item.id === "resetBossUnlock") {
    removeConfigStorageValue(CONFIG_BOSS_MODE_UNLOCK_STORAGE_KEY);
    showConfigNotice("Boss Mode unlock reset");
    return;
  }

  if (item.id === "resetTachikageStorage") {
    resetTachikageStorage();
    keyBindings = getDefaultKeyBindings();
    cheatModeEnabled = false;
    showConfigNotice("TACHIKAGE localStorage reset");
    return;
  }

  if (item.id === "cheatMode") {
    toggleCheatModeEnabled();
  }
}

function startKeyResetConfirm() {
  configCaptureAction = null;
  configConfirmAction = "resetKeys";
  showConfigMessage("Reset key config? Enter / Click: Yes   Esc: Cancel");
}

function confirmKeyReset() {
  resetKeyConfig();
  configConfirmAction = null;
  showConfigMessage("");
}

function resetKeyConfig() {
  keyBindings = getDefaultKeyBindings();
  saveKeyBindings();
}

function resetTachikageStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CONFIG_STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    // Storage can be unavailable in restricted browser modes.
  }
}

function shouldShowConfigResetUI() {
  return gameState === "title" || gameState === "config";
}

function drawConfigResetUI() {
  configResetCanvas.style.visibility =
    shouldShowConfigResetUI() ? "visible" : "hidden";

  configResetCtx.clearRect(
    0,
    0,
    configResetCanvas.width,
    configResetCanvas.height
  );

  if (!shouldShowConfigResetUI()) return;

  const confirming = configConfirmAction === "resetKeys";

  configResetCtx.save();
  configResetCtx.fillStyle = confirming
    ? "rgba(60,220,255,0.22)"
    : "rgba(0,0,0,0.35)";
  configResetCtx.strokeStyle = confirming
    ? "rgba(90,240,255,0.95)"
    : "rgba(255,255,255,0.55)";
  configResetCtx.lineWidth = 2;

  configResetCtx.fillRect(
    0,
    0,
    configResetCanvas.width,
    configResetCanvas.height
  );
  configResetCtx.strokeRect(
    0,
    0,
    configResetCanvas.width,
    configResetCanvas.height
  );

  configResetCtx.fillStyle = confirming ? "cyan" : "white";
  configResetCtx.font = "14px sans-serif";
  configResetCtx.textAlign = "center";
  configResetCtx.textBaseline = "middle";
  configResetCtx.fillText(
    confirming ? "RESET? CLICK" : "KEY RESET",
    configResetCanvas.width / 2,
    configResetCanvas.height / 2
  );

  configResetCtx.restore();
}

function drawConfig() {
  updateConfigMessageTimer();

  ctx.fillStyle = "#02080e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(80,240,255,0.95)";
  ctx.font = "34px sans-serif";
  ctx.fillText("CONFIG", canvas.width / 2, 62);

  const keyColumnX = CONFIG_LAYOUT.keyColumnX;
  const keyColumnW = CONFIG_LAYOUT.keyColumnW;
  const resetColumnX = CONFIG_LAYOUT.resetColumnX;
  const valueColumnX = CONFIG_LAYOUT.valueColumnX;
  const keyValueMaxW = keyColumnX + keyColumnW - valueColumnX;

  ctx.textAlign = "left";
  drawConfigSection("KEY SETTINGS", keyColumnX, CONFIG_LAYOUT.sectionY);

  let y = CONFIG_LAYOUT.firstItemY;

  CONFIG_MENU_ITEMS.slice(0, 6).forEach((item, index) => {
    drawConfigMenuItem(
      item,
      keyColumnX,
      valueColumnX,
      keyValueMaxW,
      22,
      y,
      index === configMenuIndex
    );
    y += CONFIG_LAYOUT.itemGap;
  });

  drawConfigSection("RESET", resetColumnX, CONFIG_LAYOUT.sectionY);
  y = CONFIG_LAYOUT.firstItemY;

  CONFIG_MENU_ITEMS.slice(6).forEach((item, index) => {
    const menuIndex = index + 6;
    drawConfigMenuItem(
      item,
      resetColumnX,
      resetColumnX + 260,
      0,
      20,
      y,
      menuIndex === configMenuIndex
    );
    y += CONFIG_LAYOUT.itemGap;
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(210,245,255,0.72)";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    "Arrow: Select   Enter: Change / Execute   Esc: Title",
    canvas.width / 2,
    410
  );

  if (configMessage) {
    ctx.fillStyle =
      configCaptureAction || configConfirmAction
        ? "cyan"
        : "rgba(255,255,255,0.92)";
    ctx.font = "18px sans-serif";
    ctx.fillText(configMessage, canvas.width / 2, 382);
  }

  ctx.restore();
}

function drawConfigSection(label, x, y) {
  ctx.fillStyle = "rgba(80,240,255,0.75)";
  ctx.font = "16px sans-serif";
  ctx.fillText(label, x, y);
}

function drawConfigMenuItem(item, x, valueX, valueMaxW, fontSize, y, selected) {
  ctx.fillStyle = selected ? "cyan" : "white";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText(selected ? ">" : " ", x - 28, y);

  if (item.type === "key") {
    const label = getControlActionLabel(item.action);
    ctx.fillText(label, x, y);

    ctx.fillStyle =
      selected && configCaptureAction === item.action
        ? "rgba(255,255,255,0.95)"
        : "rgba(210,245,255,0.9)";
    const keyLabel = getConfigKeyLabel(item.action);
    const displayKeyLabel =
      valueMaxW > 0 ? ellipsizeText(keyLabel, valueMaxW) : keyLabel;

    ctx.fillText(displayKeyLabel, valueX, y);
    return;
  }

  if (item.type === "toggle") {
    ctx.fillText(item.label, x, y);

    ctx.fillStyle = cheatModeEnabled
      ? "cyan"
      : "rgba(210,245,255,0.9)";
    ctx.fillText(
      cheatModeEnabled ? "ON" : "OFF",
      valueX,
      y
    );
    return;
  }

  ctx.fillText(item.label, x, y);
}

function getConfigMenuIndexAtPoint(x, y) {
  const keyIndex = getConfigColumnIndexAtPoint(
    x,
    y,
    CONFIG_LAYOUT.keyColumnX - 36,
    CONFIG_LAYOUT.keyColumnW + 36,
    0,
    6
  );

  if (keyIndex >= 0) return keyIndex;

  return getConfigColumnIndexAtPoint(
    x,
    y,
    CONFIG_LAYOUT.resetColumnX - 36,
    CONFIG_LAYOUT.resetColumnW + 36,
    6,
    CONFIG_MENU_ITEMS.length - 6
  );
}

function getConfigColumnIndexAtPoint(
  x,
  y,
  columnX,
  columnW,
  startIndex,
  count
) {
  if (
    x < columnX ||
    x > columnX + columnW
  ) {
    return -1;
  }

  for (let i = 0; i < count; i++) {
    const itemY =
      CONFIG_LAYOUT.firstItemY + i * CONFIG_LAYOUT.itemGap;

    if (
      y >= itemY - CONFIG_LAYOUT.itemHitH + 6 &&
      y <= itemY + 6
    ) {
      return startIndex + i;
    }
  }

  return -1;
}

function getConfigPointFromMouseEvent(e) {
  const rect = configGameCanvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) * configGameCanvas.width / rect.width,
    y: (e.clientY - rect.top) * configGameCanvas.height / rect.height
  };
}

configGameCanvas.addEventListener("mousemove", e => {
  if (
    gameState !== "config" ||
    configCaptureAction ||
    configConfirmAction
  ) {
    return;
  }

  const point = getConfigPointFromMouseEvent(e);
  const index = getConfigMenuIndexAtPoint(point.x, point.y);

  if (index >= 0) {
    configMenuIndex = index;
  }
});

configGameCanvas.addEventListener("click", e => {
  if (gameState !== "config") return;

  const point = getConfigPointFromMouseEvent(e);

  if (
    configCaptureAction ||
    configConfirmAction
  ) {
    return;
  }

  const index = getConfigMenuIndexAtPoint(point.x, point.y);

  if (index >= 0) {
    configMenuIndex = index;
    activateConfigMenuItem(CONFIG_MENU_ITEMS[index]);
  }
});

configResetCanvas.addEventListener("click", () => {
  if (!shouldShowConfigResetUI()) return;

  if (configConfirmAction === "resetKeys") {
    confirmKeyReset();
    return;
  }

  startKeyResetConfirm();
});
