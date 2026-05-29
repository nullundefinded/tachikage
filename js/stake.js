// ====================
// Stake / Special Attack
// ====================

// ====================
// 超電磁杭
// ====================

const stakeImg = new Image();
stakeImg.src = "images/stake.png";

// ====================
// 超電磁杭生成
// ====================

function fireStake() {

  const muzzleX = player.x + player.w - 20;
  const muzzleY = player.y + player.h / 2;

  stakes.push({
    x: muzzleX,
    y: muzzleY - 10,
    w: 160,
    h: 20,
    speed: 14,
    age: 0,
    muzzleX,
    muzzleY
  });

}

function startSpecial() {

  player.special = true;
  player.specialPhase = "ready";
  player.specialTimer = 0;
  player.stakeFired = false;

  parryCount = 0;
}

function updateSpecial() {

  if (!player.special) return;

  player.specialTimer++;

  if (
    player.specialPhase === "ready" &&
    player.specialTimer >= SPECIAL_READY_FRAMES
  ) {
    player.specialPhase = "fire";
    player.specialTimer = 0;
  }

  if (player.specialPhase === "fire") {

    if (!player.stakeFired) {
      fireStake();
      player.stakeFired = true;
    }

    player.specialPhase = "throw";
    player.specialTimer = 0;
  }

  if (
    player.specialPhase === "throw" &&
    player.specialTimer >= SPECIAL_THROW_FRAMES
  ) {
    player.special = false;
    player.specialPhase = "none";
    player.specialTimer = 0;
    player.stakeFired = false;
  }
}

function stakeEffectTriangle(s) {

  const trailLength = 145;
  const effectRadius = 36;
  const tipX = s.x + s.w;
  const centerY = s.y + s.h / 2;

  return {
    a: {
      x: tipX - trailLength,
      y: centerY - effectRadius
    },
    b: {
      x: tipX - trailLength,
      y: centerY + effectRadius
    },
    c: {
      x: tipX,
      y: centerY
    }
  };
}

function pointInTriangle(p, a, b, c) {

  const d1 =
    (p.x - b.x) * (a.y - b.y) -
    (a.x - b.x) * (p.y - b.y);
  const d2 =
    (p.x - c.x) * (b.y - c.y) -
    (b.x - c.x) * (p.y - c.y);
  const d3 =
    (p.x - a.x) * (c.y - a.y) -
    (c.x - a.x) * (p.y - a.y);

  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNegative && hasPositive);
}

function hitTriangleWithRect(triangle, rect) {

  const points = [
    {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2
    },
    {
      x: rect.x,
      y: rect.y
    },
    {
      x: rect.x + rect.w,
      y: rect.y
    },
    {
      x: rect.x,
      y: rect.y + rect.h
    },
    {
      x: rect.x + rect.w,
      y: rect.y + rect.h
    }
  ];

  return points.some(p =>
    pointInTriangle(p, triangle.a, triangle.b, triangle.c)
  );
}

// ====================
// 超電磁杭更新
// ====================

function updateStake() {

  // 超電磁杭移動
  stakes.forEach(s => {
    s.x += s.speed;
    s.age++;
  });

  // 画面外削除
  stakes = stakes.filter(
    s => s.x < canvas.width + s.w
  );

  // 超電磁杭弾消し処理
  stakes.forEach(s => {

    const effectTriangle = stakeEffectTriangle(s);

    bullets = bullets.filter(b => {
      const cleared =
        hit(s, b) ||
        hitTriangleWithRect(effectTriangle, b);

      if (cleared) {
        addBulletClearCombo();
      }

      return !cleared;
    });

  });

}

// ====================
// 超電磁杭描画
// ====================

function drawStake() {

  stakes.forEach(s => {

    drawStakeHelix(s, false);

    if (imageReady(stakeImg)) {

      ctx.drawImage(
        stakeImg,
        s.x,
        s.y,
        s.w,
        s.h
      );

    } else {

      ctx.fillStyle = "cyan";

      ctx.fillRect(
        s.x,
        s.y,
        s.w,
        s.h
      );

    }

    drawStakeMuzzleFlash(s);
    drawStakeHelix(s, true);
    drawStakeSparks(s);

  });

}
