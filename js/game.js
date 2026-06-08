const debugCanvas = document.getElementById("debug-ui");
const debugCtx = debugCanvas.getContext("2d");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ====================
// 背景画像
// ====================

const bg1 = loadImage("background1", "images/background1.png");
const bg2 = loadImage("background2", "images/background2.png");
const titleBgImg = loadImage("title", "images/title.png");

const backgrounds = [
  { img: bg1, x: 0 },
  { img: bg2, x: canvas.width }
];

const bgSpeed = 2;

function imageReady(img) {
  return img.complete && img.naturalWidth > 0;
}

// ====================
// ゲーム変数
// ====================

let keys = {};
let score = 0;
let gameOver = false;
let gameState = "loading";
let frame = 0;
let trailPoints = [];
let parryCount = 0;
let parryFlash = 0;
let stakes = [];
let titleMenuIndex = 0;
let clearCombo = 0;
let clearComboTimer = 0;

const DEV_START_BOSS =
  new URLSearchParams(location.search).get("boss") === "1";

const MAX_PARRY = 3;
const SPECIAL_READY_FRAMES = 12;
const SPECIAL_THROW_FRAMES = 14;
const STAKE_MUZZLE_FLASH_FRAMES = 5;
const CLEAR_COMBO_FRAMES = 75;
const SCORE_DISPLAY_SCALE = 10;

let showHitBoxes = false;

const TITLE_MENU_ITEMS = [
  "START",
  "STORY",
  "TUTORIAL",
  "CONFIG",
  "CREDITS"
];

// ====================
// 状態遷移
// ====================

function enterTitle() {
  gameState = "title";
}

function enterPlaying() {
  resetGame();
  resetGameNav();
  gameState = "playing";
}

function enterBoss() {
  resetGame();
  resetGameNav();
  resetBoss();
  score = 1000 * SCORE_DISPLAY_SCALE;
  gameState = "boss";
}

function enterStory() {
  resetStory();
  gameState = "story";
}

function enterTutorial() {
  resetTutorial();
  gameState = "tutorial";
}

function enterConfig() {
  gameState = "config";
}

function enterCredits() {
  gameState = "credits";
}

// ====================
// リセット
// ====================

function resetGame() {
  player.x = 100;
  player.y = 200;
  player.damage = 0;
  player.invincible = 0;

  player.spin = false;
  player.spinTimer = 0;
  player.spinCooldown = 0;
  player.rotation = 0;
  player.speed = player.normalSpeed;
  player.special = false;
  player.specialPhase = "none";
  player.specialTimer = 0;
  player.stakeFired = false;

  bullets = [];
  stakes = [];
  trailPoints = [];

  backgrounds[0].x = 0;
  backgrounds[1].x = canvas.width;

  score = 0;
  frame = 0;
  parryCount = 0;
  parryFlash = 0;
  clearCombo = 0;
  clearComboTimer = 0;
  gameOver = false;
}

// ====================
// 当たり判定
// ====================

function hit(a, b) {

  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );

}

// ====================
// 背景更新
// ====================

function updateBackground() {

  backgrounds.forEach(bg => {
    bg.x -= bgSpeed;
  });

  backgrounds.forEach(bg => {

    if (bg.x <= -canvas.width) {

      let maxX = Math.max(...backgrounds.map(b => b.x));

      bg.x = maxX + canvas.width;
    }

  });

}

// ====================
// 更新
// ====================

function updateLoading() {
  if (isAssetLoadComplete()) {
    if (DEV_START_BOSS) {
      enterBoss();
      return;
    }

    enterTitle();
  }
}

function updateActionCommon(options = {}) {

  const addScore = options.addScore ?? false;
  const spawnBullets = options.spawnBullets ?? false;

  frame++;
  // プレイヤー動作
  updatePlayer();
  // 必殺技演出
  updateSpecial();
  // 背景スクロール
  updateBackground();
  // スコア
  if (addScore) {
    score += 1;
  }
  // 弾消しコンボ時間
  if (clearComboTimer > 0) {
    clearComboTimer--;

    if (clearComboTimer <= 0) {
      resetBulletClearCombo();
    }
  }
  // 弾生成
  if (spawnBullets) {
    let difficulty = Math.floor(score / 600);
    updateBulletSpawner(difficulty);
  }
  // 超電磁杭更新
  updateStake();
  // 弾更新
  updateBullets();
  // エフェクト
  updateEffects();
  // ゲーム中ナビ
  updateGameNav();
}

function updatePlaying() {
  updateActionCommon({
    addScore: true,
    spawnBullets: true
  });
}

function updateBoss() {
  if (typeof isBossClear === "function" && isBossClear()) {
    updateBackground();
    updateGameNav();
    return;
  }

  if (typeof isBossIntroActive === "function" && isBossIntroActive()) {
    frame++;
    updateBackground();
    updateBossEnemy();
    return;
  }

  updateActionCommon();
  updateBossEnemy();
}

function update() {
  if (gameState === "loading") {
    updateLoading();
    return;
  }
  if (gameState === "title") return;
  if (gameState === "config") return;
  if (gameState === "credits") return;
  if (gameState === "story") {
    updateStory();
    return;
  }
  if (gameState === "tutorial") {
    updateTutorial();
    return;
  }
  if (gameOver) {
    updateGameNav();
    return;
  }
  if (gameState === "boss") {
    updateBoss();
    return;
  }
  if (gameState === "playing") {
    updatePlaying();
  }
}

// ====================
// 背景描画
// ====================

function drawBackground() {

  backgrounds.forEach(bg => {

    if (imageReady(bg.img)) {

      ctx.drawImage(
        bg.img,
        bg.x,
        0,
        canvas.width,
        canvas.height
      );

    }

  });

}

function drawCoverImage(img) {

  if (!imageReady(img)) return;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvas.width / canvas.height;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imageRatio > canvasRatio) {
    sw = img.naturalHeight * canvasRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / canvasRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(
    img,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

// ====================
// 弾消しコンボ
// ====================

function addBulletClearCombo() {

  clearCombo++;
  clearComboTimer = CLEAR_COMBO_FRAMES;
  score += clearCombo * SCORE_DISPLAY_SCALE;

  if (typeof markTutorialBulletCleared === "function") {
    markTutorialBulletCleared();
  }
}

function resetBulletClearCombo() {
  clearCombo = 0;
  clearComboTimer = 0;
}

// ====================
// ゲーム画面描画
// ====================

function drawGame() {
  // 背景
  drawBackground();

  // エフェクト
  drawEffects();  

  // プレイヤー
  drawPlayer();

  // 弾
  drawBullets();

  // 超電磁杭
  drawStake();

  // 当たり判定
  drawHitBoxes();

  // UI
  drawUI();
}

function drawBossGame() {

  // 背景
  drawBackground();

  // エフェクト
  drawEffects();

  drawBossIntroShade();

  // ボス
  drawBossEnemy();

  // プレイヤー
  drawPlayer();

  // 弾
  drawBullets();
  drawBossRaikanBullets();

  // 超電磁杭
  drawStake();

  // 当たり判定
  drawHitBoxes();
  drawBossHitBoxes();

  // UI
  if (!(typeof isBossIntroActive === "function" && isBossIntroActive())) {
    drawUI();
  }

  if (!(typeof isBossIntroActive === "function" && isBossIntroActive())) {
    drawBossPlaceholder();
  }

  drawBossClearOverlay();
}

// ====================
// 描画入口
// ====================

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case "loading":
      drawLoading();
      break;
    case "title":
      drawTitle();
      break;
    case "story":
      drawStory();
      break;
    case "tutorial":
      drawTutorial();
      break;
    case "config":
      drawConfig();
      break;
    case "credits":
      drawCredits();
      break;
    case "playing":
      drawGame();
      break;
    case "boss":
      drawBossGame();
      break;
  }
}

// ====================
// メインループ
// ====================

function loop() {

  perfBeginFrame();

  perfMeasureUpdate(() => {
    update();
  });

  perfMeasureDraw(() => {
    draw();
    drawDebugUI();
    if (
      gameState === "playing" ||
      (
        gameState === "boss" &&
        !(typeof isBossClear === "function" && isBossClear()) &&
        !(typeof isBossIntroActive === "function" && isBossIntroActive())
      )
    ) {
      drawGameNav();
    } else if (
      gameState !== "story" &&
      gameState !== "tutorial"
    ) {
      drawDialogueUI("", "");
    }

    perfSetCounts({
      bullets: bullets.length,
      enemyBullets: bullets.length,
      playerBullets: stakes.length,
      enemies: 0,
      effects: trailPoints.length + stakes.length
    });

    perfDrawOverlay();
  });

  requestAnimationFrame(loop);

}

loop();
