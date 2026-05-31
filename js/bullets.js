// ====================
// Bullets
// ====================

const bulletImg = new Image();
bulletImg.src = "images/bullet.png";

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
    b.x -= b.speed;
  });

  // 画面外削除
  bullets = bullets.filter(
    b => b.x + b.w > 0
  );

  // 無敵時間
  if (player.invincible > 0) {
    player.invincible--;
  }

  // 当たり判定
  for (let i = bullets.length - 1; i >= 0; i--) {

    const b = bullets[i];

    if (!hit(player, b)) continue;

    // スピン中ならパリィ
    if (player.spin) {

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

function drawBullets() {

  bullets.forEach(b => {

    // 残像
    ctx.save();

    ctx.globalAlpha = 0.25;

    if (imageReady(bulletImg)) {

      ctx.drawImage(
        bulletImg,
        b.x + 14,
        b.y,
        b.w,
        b.h
      );

      ctx.globalAlpha = 0.12;

      ctx.drawImage(
        bulletImg,
        b.x + 28,
        b.y,
        b.w,
        b.h
      );

    }

    ctx.restore();

    // 本体
    if (imageReady(bulletImg)) {

      ctx.drawImage(
        bulletImg,
        b.x,
        b.y,
        b.w,
        b.h
      );

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
