// ====================
// 入力
// ====================

document.addEventListener("keydown", e => {

  keys[e.key] = true;

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

  if (
    gameState === "config" ||
    gameState === "credits"
  ) {
    handleInfoScreenKey(e);
    return;
  }

  if (gameOver) {
    handleGameOverKey(e);
    return;
  }

  if (gameState === "playing") {
    handlePlayingKey(e);
  }

});

function handleTitleKey(e) {

  if (e.code === "ArrowUp") {
    titleMenuIndex =
      (titleMenuIndex + TITLE_MENU_ITEMS.length - 1) %
      TITLE_MENU_ITEMS.length;
  }

  if (e.code === "ArrowDown") {
    titleMenuIndex =
      (titleMenuIndex + 1) %
      TITLE_MENU_ITEMS.length;
  }

  if (e.key !== "Enter") return;

  const selectedMenu = TITLE_MENU_ITEMS[titleMenuIndex];

  if (selectedMenu === "START") {
    enterPlaying();
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

function handleStoryKey(e) {

  if (e.key === "Escape") {
    enterTitle();
  }

  if (e.key !== "Enter") return;

  if (storyLineIndex < STORY_LINES.length - 1) {
    advanceStoryLine();
  } else {
    enterTitle();
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
    e.code === "Space" &&
    !e.repeat &&
    !player.spin &&
    player.spinCooldown <= 0
  ) {
    player.spin = true;
    player.spinTimer = 0;
    player.speed = player.boostSpeed;
  }

  if (
    e.code === "KeyX" &&
    parryCount >= MAX_PARRY
  ) {
    startSpecial();
  }
}

function handleGameOverKey(e) {

  if (e.key === "Enter") {
    enterPlaying();
  }

  if (e.key === "Escape") {
    resetGame();
    enterTitle();
  }
}

document.addEventListener("keyup", e => {
  keys[e.key] = false;
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
