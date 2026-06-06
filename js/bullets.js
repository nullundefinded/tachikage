// ====================
// Bullets
// ====================

const bulletImg = loadImage("bullet", "images/bullet.png");

let bullets = [];

// ====================
// Bullet Spawn
// ====================

function spawnBullet() {

  bullets.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 42),
    w: 48,
    h: 42,
    speed: 6
  });

}

// ====================
// Bullet Spawner Update
// ====================

function updateBulletSpawner(difficulty) {

  // 弾の発生間隔、数字が小さいほど多く出る
  const bulletInterval =
    Math.max(15, 45 - difficulty * 3);

  // 一度に出る弾数
  const bulletCount =
    1 + Math.floor(difficulty / 4);

  // 弾生成
  if (frame % bulletInterval === 0) {

    for (let i = 0; i < bulletCount; i++) {
      spawnBullet();
    }

  }

}

// ====================
// Bullet Update
// ====================

function updateBullets() {

  // 弾移動
  bullets.forEach(b => {
    if (Number.isFinite(b.vx) && Number.isFinite(b.vy)) {
      b.x += b.vx;
      b.y += b.vy;
      return;
    }

    b.x -= b.speed;
  });

  // 画面外削除
  bullets = bullets.filter(
    b => {
      const margin = Math.max(b.w, b.h) * 2;

      return (
        b.x + b.w > -margin &&
        b.x < canvas.width + margin &&
        b.y + b.h > -margin &&
        b.y < canvas.height + margin
      );
    }
  );

  // 無敵時間
  if (player.invincible > 0) {
    player.invincible--;
  }

  // 当たり判定
  for (let i = bullets.length - 1; i >= 0; i--) {

    const b = bullets[i];

    // スピン中ならパリィ
    if (player.spin) {

      if (!hit(getPlayerParryBox(), b)) continue;

      bullets.splice(i, 1);

      parryCount = Math.min(
        parryCount + 1,
        MAX_PARRY
      );

      parryFlash = 12;
      addBulletClearCombo();

      if (typeof markGameNavParryUsed === "function") {
        markGameNavParryUsed();
      }

      continue;
    }

    // 通常時なら被弾
    if (player.invincible <= 0) {

      if (!hit(getPlayerHitBox(), b)) continue;

      bullets.splice(i, 1);
      resetBulletClearCombo();

      player.damage++;
      player.invincible = 60;

      if (player.damage >= 3) {
        gameOver = true;
      }

    }

  }

}

// ====================
// Bullet Draw
// ====================

function drawBulletImage(b, trailDistance) {

  if (!imageReady(bulletImg)) return;

  if (!Number.isFinite(b.angle)) {
    ctx.drawImage(
      bulletImg,
      b.x + trailDistance,
      b.y,
      b.w,
      b.h
    );
    return;
  }

  const centerX = b.x + b.w / 2 - Math.cos(b.angle) * trailDistance;
  const centerY = b.y + b.h / 2 - Math.sin(b.angle) * trailDistance;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(b.angle - Math.PI);
  ctx.drawImage(
    bulletImg,
    -b.w / 2,
    -b.h / 2,
    b.w,
    b.h
  );
  ctx.restore();
}

function drawBullets() {

  bullets.forEach(b => {

    // 残像
    ctx.save();

    ctx.globalAlpha = 0.25;

    if (imageReady(bulletImg)) {

      drawBulletImage(b, 14);

      ctx.globalAlpha = 0.12;

      drawBulletImage(b, 28);

    }

    ctx.restore();

    // 本体
    if (imageReady(bulletImg)) {

      drawBulletImage(b, 0);

    } else {

      ctx.fillStyle = "red";

      ctx.fillRect(
        b.x,
        b.y,
        b.w,
        b.h
      );

    }

  });

}
