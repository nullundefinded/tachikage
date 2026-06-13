// ====================
// 入力
// ====================

const TITLE_MENU_MOUSE_BOX = {
  x: 250,
  y: 215,
  w: 300,
  h: 30,
  gap: 36
};

document.addEventListener("keydown", e => {

  keys[e.key] = true;
  keys[e.code] = true;

  if (gameState === "title") {
    handleTitleKey(e);
    return;
  }

  if (gameState === "story") {
    handleStoryKey(e);
    return;
  }

  if (gameState === "tutorial") {
    if (handleTutorialKey(e)) {
      return;
    }

    handlePlayingKey(e);
    return;
  }

  if (gameState === "config") {
    handleConfigKey(e);
    return;
  }

  if (gameState === "credits") {
    handleInfoScreenKey(e);
    return;
  }

  if (
    gameState === "boss" &&
    typeof isBossClear === "function" &&
    isBossClear()
  ) {
    handleBossClearKey(e);
    return;
  }

  if (gameOver) {
    handleGameOverKey(e);
    return;
  }

  if (
    gameState === "playing" ||
    gameState === "boss"
  ) {
    handlePlayingKey(e);
  }

});

function handleTitleKey(e) {

  if (configConfirmAction) {
    handleConfigConfirmKey(e);
    return;
  }

  if (isControlKey(e, "up")) {
    titleMenuIndex = getNextTitleMenuIndex(-1);
  }

  if (isControlKey(e, "down")) {
    titleMenuIndex = getNextTitleMenuIndex(1);
  }

  if (e.key !== "Enter") return;

  const selectedMenu = TITLE_MENU_ITEMS[titleMenuIndex];

  if (!isTitleMenuItemEnabled(selectedMenu)) return;

  activateTitleMenuItem(selectedMenu);
}

function activateTitleMenuItem(selectedMenu) {

  if (selectedMenu === "RIDE MODE") {
    enterPlaying();
  }

  if (selectedMenu === "BOSS MODE") {
    enterBoss();
  }

  if (selectedMenu === "STORY") {
    enterStory();
  }

  if (selectedMenu === "TUTORIAL") {
    enterTutorial();
  }

  if (selectedMenu === "CONFIG") {
    enterConfig();
  }

  if (selectedMenu === "CREDITS") {
    enterCredits();
  }
}

function getNextTitleMenuIndex(direction) {

  let nextIndex = titleMenuIndex;

  for (let i = 0; i < TITLE_MENU_ITEMS.length; i++) {
    nextIndex =
      (nextIndex + direction + TITLE_MENU_ITEMS.length) %
      TITLE_MENU_ITEMS.length;

    if (isTitleMenuItemEnabled(TITLE_MENU_ITEMS[nextIndex])) {
      return nextIndex;
    }
  }

  return titleMenuIndex;
}

function handleStoryKey(e) {

  if (
    typeof isStorySelectActive === "function" &&
    isStorySelectActive()
  ) {
    handleStorySelectKey(e);
    return;
  }

  if (e.key === "Escape") {
    resetStory();
    return;
  }

  if (e.key !== "Enter") return;

  if (!isStoryLastLine()) {
    advanceStoryLine();
  } else {
    resetStory();
  }
}

function handleInfoScreenKey(e) {

  if (
    e.key === "Escape" ||
    e.key === "Enter"
  ) {
    enterTitle();
  }
}

function handlePlayingKey(e) {

  if (
    isControlKey(e, "parry") &&
    !e.repeat &&
    !player.spin &&
    player.spinCooldown <= 0
  ) {
    player.spin = true;
    player.spinTimer = 0;
    player.speed = player.boostSpeed;
  }

  if (
    isControlKey(e, "special") &&
    !player.special &&
    (
      parryCount >= MAX_PARRY ||
      (
        typeof isCheatModeEnabled === "function" &&
        isCheatModeEnabled()
      )
    )
  ) {
    startSpecial();
  }
}

function handleGameOverKey(e) {

  if (e.key === "Enter") {
    if (gameState === "boss" && bossStartedFromRide) {
      enterPlaying();
      return;
    }

    if (gameState === "boss" || DEV_START_BOSS) {
      enterBoss();
      return;
    }

    enterPlaying();
  }

  if (e.key === "Escape") {
    resetGame();
    enterTitle();
  }
}

function handleBossClearKey(e) {

  if (
    e.key !== "Enter" &&
    e.key !== "Escape"
  ) {
    return;
  }

  if (typeof consumeStoryUnlockNoticeText === "function") {
    consumeStoryUnlockNoticeText();
  }

  resetGame();
  enterTitle();
}

document.addEventListener("keyup", e => {
  keys[e.key] = false;
  keys[e.code] = false;
});

debugCanvas.addEventListener("click", e => {

  const rect = debugCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * debugCanvas.width / rect.width;
  const y = (e.clientY - rect.top) * debugCanvas.height / rect.height;

  if (
    x >= HITBOX_TOGGLE.x &&
    x <= HITBOX_TOGGLE.x + HITBOX_TOGGLE.w &&
    y >= HITBOX_TOGGLE.y &&
    y <= HITBOX_TOGGLE.y + HITBOX_TOGGLE.h
  ) {
    showHitBoxes = !showHitBoxes;
    drawDebugUI();
  }
});

canvas.addEventListener("mousemove", e => {
  if (gameState !== "title") {
    return;
  }

  const index = getTitleMenuIndexAtMouseEvent(e);

  if (
    index >= 0 &&
    isTitleMenuItemEnabled(TITLE_MENU_ITEMS[index])
  ) {
    titleMenuIndex = index;
  }
});

canvas.addEventListener("click", e => {
  if (gameState !== "title") {
    return;
  }

  const index = getTitleMenuIndexAtMouseEvent(e);

  if (
    index < 0 ||
    !isTitleMenuItemEnabled(TITLE_MENU_ITEMS[index])
  ) {
    return;
  }

  titleMenuIndex = index;
  activateTitleMenuItem(TITLE_MENU_ITEMS[index]);
});

function getTitleMenuIndexAtMouseEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * canvas.width / rect.width;
  const y = (e.clientY - rect.top) * canvas.height / rect.height;

  if (
    x < TITLE_MENU_MOUSE_BOX.x ||
    x > TITLE_MENU_MOUSE_BOX.x + TITLE_MENU_MOUSE_BOX.w
  ) {
    return -1;
  }

  for (let i = 0; i < TITLE_MENU_ITEMS.length; i++) {
    const itemY = TITLE_MENU_MOUSE_BOX.y + i * TITLE_MENU_MOUSE_BOX.gap;

    if (
      y >= itemY &&
      y <= itemY + TITLE_MENU_MOUSE_BOX.h
    ) {
      return i;
    }
  }

  return -1;
}
