const debugCanvas = document.getElementById("debug-ui");
const debugCtx = debugCanvas.getContext("2d");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ====================
// 背景画像
// ====================

const bg1 = new Image();
const bg2 = new Image();
const titleBgImg = new Image();

bg1.src = "images/background1.png";
bg2.src = "images/background2.png";
titleBgImg.src = "images/title.png";

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
let gameState = "title";
let frame = 0;
let trailPoints = [];
let parryCount = 0;
let parryFlash = 0;
let stakes = [];
let titleMenuIndex = 0;

const MAX_PARRY = 3;
const SPECIAL_READY_FRAMES = 12;
const SPECIAL_THROW_FRAMES = 14;
const STAKE_MUZZLE_FLASH_FRAMES = 5;

let showHitBoxes = false;

const HITBOX_TOGGLE = {
  x: 0,
  y: 0,
  w: 130,
  h: 28
};

const TITLE_MENU_ITEMS = [
  "START",
  "STORY",
  "HOW TO PLAY",
  "CONFIG",
  "CREDITS"
];

// ====================
// 入力
// ====================

document.addEventListener("keydown", e => {

  keys[e.key] = true;

  if (gameState === "title") {

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

    if (e.key === "Enter") {
      const selectedMenu = TITLE_MENU_ITEMS[titleMenuIndex];

      if (selectedMenu === "START") {
        resetGame();
        gameState = "playing";
      }

      if (selectedMenu === "STORY") {
        resetStory();
        gameState = "story";
      }
    }

    return;
  }

  if (gameState === "story") {

    if (e.key === "Escape") {
      gameState = "title";
    }

    if (e.key === "Enter") {

      if (storyLineIndex < STORY_LINES.length - 1) {
        advanceStoryLine();
      } else {
        gameState = "title";
      }
    }

    return;
  }

  if (
    e.code === "Space" &&
    !e.repeat &&
    !player.spin &&
    !gameOver
  ) {
  
    player.spin = true;
    player.spinTimer = 0;
  
    player.speed = player.boostSpeed;
  
  }

  if (
    e.code === "KeyX" &&
    !gameOver &&
    parryCount >= MAX_PARRY
  ) {
  
    startSpecial();
  }

  if (gameOver && e.key === "Enter") {
    resetGame();
    gameState = "playing";
  }

  if (gameOver && e.key === "Escape") {
    resetGame();
    gameState = "title";
  }

});
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

function update() {
  if (gameState === "title") return;
  if (gameState === "story") {
    updateStory();
    return;
  }
  if (gameOver) return;
  frame++;
  // プレイヤー動作
  updatePlayer();
  // 必殺技演出
  updateSpecial();
  // 背景スクロール
  updateBackground();
  // スコア
  score += 1;
  // 難易度上昇
  let difficulty = Math.floor(score / 600);
  // 弾生成
  updateBulletSpawner(difficulty);
  // 超電磁杭更新
  updateStake();
  // 弾更新
  updateBullets();
  // エフェクト
  updateEffects();
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
// タイトル画面描画
// ====================

function drawTitle() {

  if (imageReady(titleBgImg)) {
    drawCoverImage(titleBgImg);
  } else {
    drawBackground();
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.fillText(
    "TACHIKAGE",
    canvas.width / 2,
    140
  );

  ctx.font = "24px sans-serif";

  TITLE_MENU_ITEMS.forEach((item, i) => {

    const y = 245 + i * 42;
    const selected = i === titleMenuIndex;

    ctx.fillStyle = selected
      ? "cyan"
      : "white";

    ctx.fillText(
      `${selected ? "> " : "  "}${item}${selected ? " <" : "  "}`,
      canvas.width / 2,
      y
    );
  });

  ctx.textAlign = "left";

}

// ====================
// 当たり判定デバッグ描画
// ====================

function drawHitBox(box, color) {

  ctx.fillStyle = color.fill;
  ctx.strokeStyle = color.stroke;
  ctx.lineWidth = 2;

  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeRect(box.x, box.y, box.w, box.h);
}

function drawHitTriangle(triangle, color) {

  ctx.fillStyle = color.fill;
  ctx.strokeStyle = color.stroke;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(triangle.a.x, triangle.a.y);
  ctx.lineTo(triangle.b.x, triangle.b.y);
  ctx.lineTo(triangle.c.x, triangle.c.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHitBoxes() {

  if (!showHitBoxes) return;

  ctx.save();

  drawHitBox(
    player,
    {
      fill: "rgba(80,255,120,0.12)",
      stroke: "rgba(80,255,120,0.85)"
    }
  );

  bullets.forEach(b => {
    drawHitBox(
      b,
      {
        fill: "rgba(255,80,80,0.12)",
        stroke: "rgba(255,80,80,0.85)"
      }
    );
  });

  stakes.forEach(s => {
    drawHitTriangle(
      stakeEffectTriangle(s),
      {
        fill: "rgba(190,90,255,0.10)",
        stroke: "rgba(190,90,255,0.75)"
      }
    );

    drawHitBox(
      s,
      {
        fill: "rgba(80,230,255,0.14)",
        stroke: "rgba(80,230,255,0.9)"
      }
    );
  });

  ctx.restore();
}

// ====================
// 外部UI描画
// ====================

function drawDebugUI() {

  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
  debugCtx.save();

  debugCtx.fillStyle = showHitBoxes
    ? "rgba(60,220,255,0.22)"
    : "rgba(0,0,0,0.35)";
  debugCtx.strokeStyle = showHitBoxes
    ? "rgba(90,240,255,0.95)"
    : "rgba(255,255,255,0.55)";
  debugCtx.lineWidth = 2;

  debugCtx.fillRect(
    HITBOX_TOGGLE.x,
    HITBOX_TOGGLE.y,
    HITBOX_TOGGLE.w,
    HITBOX_TOGGLE.h
  );
  debugCtx.strokeRect(
    HITBOX_TOGGLE.x,
    HITBOX_TOGGLE.y,
    HITBOX_TOGGLE.w,
    HITBOX_TOGGLE.h
  );

  debugCtx.fillStyle = showHitBoxes
    ? "cyan"
    : "white";
  debugCtx.font = "14px sans-serif";
  debugCtx.textAlign = "center";
  debugCtx.textBaseline = "middle";
  debugCtx.fillText(
    `HIT BOX ${showHitBoxes ? "ON" : "OFF"}`,
    HITBOX_TOGGLE.x + HITBOX_TOGGLE.w / 2,
    HITBOX_TOGGLE.y + HITBOX_TOGGLE.h / 2
  );

  debugCtx.restore();
}

// ====================
// ゲーム画面UI描画
// ====================

function drawUI() {

  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";

  ctx.fillText(
    "Score: " + Math.floor(score / 10),
    20,
    35
  );

  ctx.fillText(
    "Damage: " + player.damage + " / 3",
    20,
    70
  );

  // パリィゲージ
  ctx.fillStyle =
    parryCount >= MAX_PARRY
      ? "cyan"
      : "white";

  ctx.fillText(
    `Parry: ${parryCount} / ${MAX_PARRY}`,
    20,
    105
  );

  // 必殺技使用可能表示
  if (parryCount >= MAX_PARRY) {

    ctx.fillStyle = "cyan";
    ctx.font = "20px sans-serif";

    ctx.fillText(
      "RAIL STAKE READY",
      20,
      135
    );
  }

  // ゲームオーバー
  if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";

    ctx.fillText(
      "GAME OVER",
      240,
      220
    );

    ctx.font = "24px sans-serif";

    ctx.fillText(
      "Enter: Retry   Esc: Title",
      250,
      270
    );
  }
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

// ====================
// 描画入口
// ====================

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case "title":
      drawTitle();
      break;
    case "story":
      drawStory();
      break;
    case "playing":
      drawGame();
      break;
  }
}

// ====================
// メインループ
// ====================

function loop() {

  update();
  draw();
  drawDebugUI();
  if (gameState !== "story") {
    drawDialogueUI("", "");
  }

  requestAnimationFrame(loop);

}

loop();
