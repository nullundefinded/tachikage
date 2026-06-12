// ====================
// Player
// ====================

const playerImg = loadImage("player.normal", "images/player.png");

const playerRailstakeReadyImg = loadImage("player.railstake.ready", "images/player_railstake_ready.png");

const playerRailstakeThrowImg = loadImage("player.railstake.throw", "images/player_railstake_throw.png");

const player = {
  x: 100,
  y: 200,
  w: 120,
  h: 120,

  hitBox: {
    offsetX: 24,
    offsetY: 20,
    w: 72,
    h: 84
  },

  parryBox: {
    offsetX: 0,
    offsetY: 0,
    w: 120,
    h: 120
  },

  speed: 5,
  normalSpeed: 5,
  boostSpeed: 10,

  damage: 0,
  invincible: 0,

  spin: false,
  spinTimer: 0,
  spinCooldown: 0,
  rotation: 0,

  special: false,
  specialPhase: "none",
  specialTimer: 0,
  stakeFired: false
};

function getPlayerHitBox() {
  return {
    x: player.x + player.hitBox.offsetX,
    y: player.y + player.hitBox.offsetY,
    w: player.hitBox.w,
    h: player.hitBox.h
  };
}

function getPlayerParryBox() {
  return {
    x: player.x + player.parryBox.offsetX,
    y: player.y + player.parryBox.offsetY,
    w: player.parryBox.w,
    h: player.parryBox.h
  };
}

// ====================
// Player Update
// ====================

function updatePlayer() {

  if (player.spinCooldown > 0) {
    player.spinCooldown--;
  }

  // スピン中処理
  if (player.spin) {

    player.spinTimer++;

    const spinTotal = 30;
    const overshootEnd = 22;

    if (player.spinTimer <= overshootEnd) {
      // 0 → 390度まで右回転
      const t = player.spinTimer / overshootEnd;
      player.rotation = 390 * t;
    } else {
      // 390 → 360度へ少し戻る
      const t = (player.spinTimer - overshootEnd) / (spinTotal - overshootEnd);
      player.rotation = 390 - 30 * t;
    }

    if (player.spinTimer >= spinTotal) {
      player.spin = false;
      player.spinTimer = 0;
      player.spinCooldown = 5;
      player.rotation = 0;
      player.speed = player.normalSpeed;
    }
  }

  // プレイヤー移動
  if (isControlPressed("up")) player.y -= player.speed;
  if (isControlPressed("down")) player.y += player.speed;
  if (isControlPressed("left")) player.x -= player.speed;
  if (isControlPressed("right")) player.x += player.speed;

  // 画面外制限
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // 軌跡も左へ流す
  trailPoints.forEach(p => {
    p.x -= bgSpeed * 2;
  });

  // 回転込みで、ボード下あたりの位置を計算
  const rad = player.rotation * Math.PI / 180;

  const centerX = player.x + player.w / 2;
  const centerY = player.y + player.h / 2;

  const localX = -player.w * 0.15;
  const localY = player.h * 0.35;

  const trailX = centerX + localX * Math.cos(rad) - localY * Math.sin(rad);
  const trailY = centerY + localX * Math.sin(rad) + localY * Math.cos(rad);

  // 軌跡を記録
  trailPoints.push({
    x: trailX,
    y: trailY
  });

  if (trailPoints.length > 25) {
    trailPoints.shift();
  }
}

// ====================
// Player Draw
// ====================

function drawPlayer() {

  let currentPlayerImg = playerImg;
  let drawScale = 1;
  let drawOffsetY = 0;

  if (player.specialPhase === "ready") {
    currentPlayerImg = playerRailstakeReadyImg;
    drawScale = 1.14;
    drawOffsetY = -12;
  }

  if (player.specialPhase === "throw") {
    currentPlayerImg = playerRailstakeThrowImg;
  }

  if (!imageReady(currentPlayerImg)) return;

  // 無敵中点滅
  if (
    player.invincible > 0 &&
    Math.floor(player.invincible / 5) % 2 !== 0
  ) {
    return;
  }

  ctx.save();

  ctx.translate(
    player.x + player.w / 2,
    player.y + player.h / 2
  );

  ctx.rotate(
    player.rotation * Math.PI / 180
  );

  const drawW = player.w * drawScale;
  const drawH = player.h * drawScale;

  ctx.drawImage(
    currentPlayerImg,
    -drawW / 2,
    -drawH / 2 + drawOffsetY,
    drawW,
    drawH
  );

  ctx.restore();

}
