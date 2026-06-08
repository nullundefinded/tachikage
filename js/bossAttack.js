// ====================
// Boss Attack
// ====================

function getBossAttackMuzzle() {
  return {
    x: boss.body.x + 44,
    y: getBossBodyY() + boss.body.h * 0.54
  };
}

function getBossSpreadAngles(bulletCount) {

  const muzzle = getBossAttackMuzzle();
  const targetX = player.x + player.w / 2;
  const targetY = player.y + player.h / 2;
  const dx = targetX - muzzle.x;
  const dy = targetY - muzzle.y;
  const baseAngle = Math.atan2(dy, dx);
  const spreadStep =
    bulletCount > 1
      ? BOSS_PARRY_BULLET_SPREAD_ANGLE / (bulletCount - 1)
      : 0;
  const startAngle = baseAngle - BOSS_PARRY_BULLET_SPREAD_ANGLE / 2;
  const angles = [];

  for (let i = 0; i < bulletCount; i++) {
    angles.push(startAngle + spreadStep * i);
  }

  return angles;
}

function spawnBossParryBullet(bulletCount = BOSS_PARRY_BULLET_COUNT) {

  const bulletW = 48;
  const bulletH = 42;
  const muzzle = getBossAttackMuzzle();
  const angles = getBossSpreadAngles(bulletCount);

  angles.forEach(angle => {
    const vx = Math.cos(angle) * BOSS_PARRY_BULLET_SPEED;
    const vy = Math.sin(angle) * BOSS_PARRY_BULLET_SPEED;

    bullets.push({
      x: muzzle.x - bulletW / 2,
      y: muzzle.y - bulletH / 2,
      w: bulletW,
      h: bulletH,
      vx,
      vy,
      angle,
      speed: BOSS_PARRY_BULLET_SPEED,
      bossParry: true
    });
  });

  boss.attackTimer = BOSS_ATTACK_IMAGE_FRAMES;
  return angles;
}

function fireBossWaveAttackShot() {

  const angles = spawnBossParryBullet(BOSS_WAVE_ATTACK_BULLET_COUNT);

  boss.waveAttackShot++;

  if (boss.waveAttackShot === boss.waveAttackRaikanShot) {
    spawnBossRaikanBullet(angles);
  }
}

function startBossWaveAttack() {
  boss.waveAttackShot = 0;
  boss.waveAttackRaikanShot = 0;
  fireBossWaveAttackShot();
  boss.waveAttackTimer = BOSS_WAVE_ATTACK_DELAY;
  boss.waveAttackRemaining = BOSS_WAVE_ATTACK_COUNT - 1;
}

function startBossHiddenRaikanLaugh() {
  boss.hiddenRaikanLaughTimer = BOSS_HIDDEN_RAIKAN_LAUGH_FRAMES;
  boss.waveAttackShot = 0;
  boss.waveAttackRaikanShot =
    1 + Math.floor(Math.random() * BOSS_WAVE_ATTACK_COUNT);
}

function updateBossWaveAttack() {
  if (boss.hiddenRaikanLaughTimer > 0) {
    boss.hiddenRaikanLaughTimer--;

    if (boss.hiddenRaikanLaughTimer <= 0) {
      fireBossWaveAttackShot();
      boss.waveAttackTimer = BOSS_WAVE_ATTACK_DELAY;
      boss.waveAttackRemaining = BOSS_WAVE_ATTACK_COUNT - 1;
    }

    return true;
  }

  if (boss.waveAttackRemaining <= 0) return false;

  if (boss.waveAttackTimer > 0) {
    boss.waveAttackTimer--;
    return true;
  }

  fireBossWaveAttackShot();
  boss.waveAttackRemaining--;
  boss.waveAttackTimer = BOSS_WAVE_ATTACK_DELAY;
  return true;
}

function chooseBossRaikanAngle(preferredAngles) {

  const muzzle = getBossAttackMuzzle();
  const targetX = -BOSS_RAIKAN_BULLET_W;
  const minY = BOSS_RAIKAN_BULLET_H / 2;
  const maxY = canvas.height - BOSS_RAIKAN_BULLET_H / 2;
  const validAngles = (preferredAngles || []).filter(angle => {
    if (Math.cos(angle) >= 0) return false;

    const edgeY =
      muzzle.y +
      Math.tan(angle) * (targetX - muzzle.x);

    return edgeY >= minY && edgeY <= maxY;
  });

  if (validAngles.length > 0) {
    return validAngles[
      Math.floor(Math.random() * validAngles.length)
    ];
  }

  const targetY = Math.max(
    BOSS_RAIKAN_BULLET_H / 2,
    Math.min(
      player.y + player.h / 2 + (Math.random() - 0.5) * 160,
      canvas.height - BOSS_RAIKAN_BULLET_H / 2
    )
  );

  return Math.atan2(
    targetY - muzzle.y,
    targetX - muzzle.x
  );
}

function spawnBossRaikanBullet(preferredAngles) {

  const muzzle = getBossAttackMuzzle();
  const angle = chooseBossRaikanAngle(preferredAngles);

  boss.raikanBullets.push({
    x: muzzle.x - BOSS_RAIKAN_BULLET_W / 2,
    y: muzzle.y - BOSS_RAIKAN_BULLET_H / 2,
    w: BOSS_RAIKAN_BULLET_W,
    h: BOSS_RAIKAN_BULLET_H,
    vx: Math.cos(angle) * BOSS_RAIKAN_BULLET_SPEED,
    vy: Math.sin(angle) * BOSS_RAIKAN_BULLET_SPEED,
    rotation: angle + Math.PI / 2,
    rotationSpeed: BOSS_RAIKAN_ROTATION_SPEED
  });

  boss.attackTimer = BOSS_ATTACK_IMAGE_FRAMES;
}

function updateBossRaikanBullets() {

  boss.raikanBullets.forEach(raikan => {
    raikan.x += raikan.vx;
    raikan.y += raikan.vy;
    raikan.rotation += raikan.rotationSpeed;
  });

  boss.raikanBullets = boss.raikanBullets.filter(
    raikan => {
      const margin = Math.max(raikan.w, raikan.h) * 2;

      return (
        raikan.x + raikan.w > -margin &&
        raikan.x < canvas.width + margin &&
        raikan.y + raikan.h > -margin &&
        raikan.y < canvas.height + margin
      );
    }
  );

  for (let i = boss.raikanBullets.length - 1; i >= 0; i--) {
    const raikan = boss.raikanBullets[i];

    if (!hit(getPlayerHitBox(), getBossRaikanHitBox(raikan))) continue;

    boss.raikanBullets.splice(i, 1);
    resetBulletClearCombo();
    player.damage = 3;
    gameOver = true;
  }
}

function getBossRaikanHitBox(raikan) {
  return {
    x: raikan.x + (raikan.w - BOSS_RAIKAN_HIT_W) / 2,
    y: raikan.y + (raikan.h - BOSS_RAIKAN_HIT_H) / 2,
    w: BOSS_RAIKAN_HIT_W,
    h: BOSS_RAIKAN_HIT_H
  };
}

function updateBossParryBullets() {

  if (updateBossWaveAttack()) return;

  if (boss.parryBulletTimer > 0) {
    boss.parryBulletTimer--;
    return;
  }

  if (Math.random() < BOSS_HIDDEN_RAIKAN_ATTACK_CHANCE) {
    startBossHiddenRaikanLaugh();
  } else if (Math.random() < BOSS_WAVE_ATTACK_CHANCE) {
    startBossWaveAttack();
  } else {
    spawnBossParryBullet();
  }

  boss.parryBulletTimer = BOSS_PARRY_BULLET_INTERVAL;
}
