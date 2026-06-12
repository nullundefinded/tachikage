// ====================
// Config
// ====================

const CONFIG_KEY_BINDINGS_STORAGE_KEY = "tachikage.keyBindings";
const CONFIG_STORAGE_KEY_PREFIX = "tachikage.";
const CONFIG_BOSS_MODE_UNLOCK_STORAGE_KEY = "tachikage.bossModeUnlocked";

const configResetCanvas = document.getElementById("config-reset-ui");
const configResetCtx = configResetCanvas.getContext("2d");

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
  }
];

let keyBindings = loadKeyBindings();
let configMenuIndex = 0;
let configCaptureAction = null;
let configConfirmAction = null;
let configMessage = "";

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
    configMessage = "Reset canceled";
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
    configMessage = "Key change canceled";
    return;
  }

  const usedAction = findActionByCode(e.code, configCaptureAction);

  if (usedAction) {
    configMessage =
      `${formatKeyCode(e.code)} is already used by ${usedAction.label}`;
    return;
  }

  keyBindings[configCaptureAction] = e.code;
  saveKeyBindings();

  configMessage =
    `${getControlActionLabel(configCaptureAction)} set to ` +
    getControlKeyLabel(configCaptureAction);
  configCaptureAction = null;
}

function activateConfigMenuItem(item) {
  if (item.type === "key") {
    configCaptureAction = item.action;
    configMessage = `Press a key for ${getControlActionLabel(item.action)}`;
    return;
  }

  if (item.id === "resetKeys") {
    startKeyResetConfirm();
    return;
  }

  if (item.id === "resetBossUnlock") {
    removeConfigStorageValue(CONFIG_BOSS_MODE_UNLOCK_STORAGE_KEY);
    configMessage = "Boss Mode unlock reset";
    return;
  }

  if (item.id === "resetTachikageStorage") {
    resetTachikageStorage();
    keyBindings = getDefaultKeyBindings();
    configMessage = "TACHIKAGE localStorage reset";
  }
}

function startKeyResetConfirm() {
  configCaptureAction = null;
  configConfirmAction = "resetKeys";
  configMessage = "Reset key config? Enter / Click: Yes   Esc: Cancel";
}

function confirmKeyReset() {
  resetKeyConfig();
  configConfirmAction = null;
  configMessage = "Key config reset";
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
  ctx.fillStyle = "#02080e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(80,240,255,0.95)";
  ctx.font = "34px sans-serif";
  ctx.fillText("CONFIG", canvas.width / 2, 62);

  const keyColumnX = 100;
  const keyColumnW = 350;
  const resetColumnX = 475;
  const valueColumnX = 300;
  const keyValueMaxW = keyColumnX + keyColumnW - valueColumnX;

  ctx.textAlign = "left";
  drawConfigSection("KEY SETTINGS", keyColumnX, 106);

  let y = 138;

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
    y += 34;
  });

  drawConfigSection("RESET", resetColumnX, 106);
  y = 138;

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
    y += 34;
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

  ctx.fillText(item.label, x, y);
}

configResetCanvas.addEventListener("click", () => {
  if (!shouldShowConfigResetUI()) return;

  if (configConfirmAction === "resetKeys") {
    confirmKeyReset();
    return;
  }

  startKeyResetConfirm();
});
