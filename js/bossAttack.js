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

function startBossChargeAttack() {
  boss.chargePhase = "windup";
  boss.chargeTimer = BOSS_CHARGE_WINDUP_FRAMES;
  boss.chargeX = boss.body.x;
  boss.chargeTargetOffsetY = getBossChargeTargetOffsetY();
  boss.chargeBodyOffsetX = 0;
  boss.chargeBodyOffsetY = 0;
  setBossChargeVelocity();
  boss.chargeUfoOffsetY = 0;
  boss.warpTimer = 0;
  boss.warpFromOffsetY = 0;
  boss.warpToOffsetY = 0;
}

function getBossChargeTargetOffsetY() {
  const targetCenterY = player.y + player.h / 2;
  const targetOffsetY =
    targetCenterY -
    boss.body.y -
    boss.body.h / 2;
  const minOffsetY =
    BOSS_CHARGE_TARGET_MARGIN_Y - boss.body.y;
  const maxOffsetY =
    canvas.height -
    BOSS_CHARGE_TARGET_MARGIN_Y -
    boss.body.y -
    boss.body.h;

  return Math.max(
    minOffsetY,
    Math.min(targetOffsetY, maxOffsetY)
  );
}

function setBossChargeVelocity() {
  const targetOffsetX =
    -BOSS_CHARGE_BODY_RIGHT_MARGIN -
    boss.body.w -
    boss.body.x;
  const targetOffsetY =
    boss.chargeTargetOffsetY -
    boss.floatOffsetY;
  const distance = Math.max(
    1,
    Math.hypot(targetOffsetX, targetOffsetY)
  );

  boss.chargeBodyVx =
    targetOffsetX / distance * BOSS_CHARGE_BODY_SPEED;
  boss.chargeBodyVy =
    targetOffsetY / distance * BOSS_CHARGE_BODY_SPEED;
}

function updateBossChargeUfoRetreat() {
  const targetOffsetY = canvas.height + 40 - getBossWeakY();

  boss.chargeUfoOffsetY = Math.min(
    targetOffsetY,
    boss.chargeUfoOffsetY + BOSS_CHARGE_UFO_RETREAT_SPEED
  );
}

function moveBossChargeOffsetTowardZero() {
  const distance = Math.hypot(
    boss.chargeBodyOffsetX,
    boss.chargeBodyOffsetY
  );

  if (distance <= BOSS_CHARGE_BODY_RETURN_SPEED) {
    boss.chargeBodyOffsetX = 0;
    boss.chargeBodyOffsetY = 0;
    return;
  }

  boss.chargeBodyOffsetX -=
    boss.chargeBodyOffsetX / distance * BOSS_CHARGE_BODY_RETURN_SPEED;
  boss.chargeBodyOffsetY -=
    boss.chargeBodyOffsetY / distance * BOSS_CHARGE_BODY_RETURN_SPEED;
}

function updateBossChargeAttack() {
  if (boss.chargePhase === "none") return false;

  if (boss.chargePhase === "windup") {
    boss.chargeTimer--;

    if (boss.chargeTimer <= 0) {
      boss.chargePhase = "bodyCharge";
      boss.chargeTimer = 0;
    }

    return true;
  }

  if (boss.chargePhase === "bodyCharge") {
    updateBossChargeUfoRetreat();
    boss.chargeBodyOffsetX += boss.chargeBodyVx;
    boss.chargeBodyOffsetY += boss.chargeBodyVy;
    updateBossChargeHit();

    if (
      boss.body.x +
      boss.chargeBodyOffsetX +
      boss.body.w < -BOSS_CHARGE_BODY_RIGHT_MARGIN
    ) {
      boss.chargePhase = "bodyReturn";
      boss.chargeBodyOffsetX =
        canvas.width +
        BOSS_CHARGE_BODY_RIGHT_MARGIN -
        boss.body.x;
    }

    return true;
  }

  if (boss.chargePhase === "bodyReturn") {
    moveBossChargeOffsetTowardZero();

    if (
      boss.chargeBodyOffsetX === 0 &&
      boss.chargeBodyOffsetY === 0
    ) {
      boss.chargePhase = "none";
      boss.chargeTimer = 0;
      boss.chargeX = 0;
      boss.chargeTargetOffsetY = 0;
      boss.chargeBodyOffsetX = 0;
      boss.chargeBodyOffsetY = 0;
      boss.chargeBodyVx = 0;
      boss.chargeBodyVy = 0;
      boss.chargeUfoOffsetY = 0;
    }

    return true;
  }

  if (boss.chargePhase === "ufoHold") {
    boss.chargeTimer--;

    if (boss.chargeTimer <= 0) {
      boss.chargePhase = "ufoReturn";
    }

    return true;
  }

  if (boss.chargePhase === "ufoReturn") {
    boss.chargeUfoOffsetY = Math.max(
      0,
      boss.chargeUfoOffsetY - BOSS_CHARGE_UFO_RETURN_SPEED
    );

    if (boss.chargeUfoOffsetY <= 0) {
      boss.chargePhase = "none";
      boss.chargeTimer = 0;
      boss.chargeX = 0;
      boss.chargeTargetOffsetY = 0;
      boss.chargeBodyOffsetX = 0;
      boss.chargeBodyOffsetY = 0;
      boss.chargeBodyVx = 0;
      boss.chargeBodyVy = 0;
    }

    return true;
  }

  boss.chargePhase = "none";
  boss.chargeTimer = 0;
  boss.chargeTargetOffsetY = 0;
  boss.chargeBodyOffsetX = 0;
  boss.chargeBodyOffsetY = 0;
  boss.chargeBodyVx = 0;
  boss.chargeBodyVy = 0;
  boss.chargeUfoOffsetY = 0;
  return false;
}

function isBossChargeBodyActive() {
  return boss.chargePhase === "bodyCharge";
}

function getBossChargeHitBox() {
  return {
    x:
      boss.body.x +
      boss.chargeBodyOffsetX +
      BOSS_CHARGE_HIT_OFFSET_X,
    y:
      getBossBodyY() +
      boss.chargeBodyOffsetY +
      BOSS_CHARGE_HIT_OFFSET_Y,
    w: BOSS_CHARGE_HIT_W,
    h: BOSS_CHARGE_HIT_H
  };
}

function updateBossChargeHit() {
  if (player.invincible > 0) return;
  if (!hit(getPlayerHitBox(), getBossChargeHitBox())) return;

  resetBulletClearCombo();
  player.damage++;
  player.invincible = 60;

  if (player.damage >= 3) {
    gameOver = true;
  }
}

function getBossAttackTable() {
  if (boss.life <= 2) {
    return [
      { attack: spawnBossParryBullet, weight: 30 },
      { attack: startBossWaveAttack, weight: 30 },
      { attack: startBossHiddenRaikanLaugh, weight: 20 },
      { attack: startBossChargeAttack, weight: 20 }
    ];
  }

  if (boss.life <= 3) {
    return [
      { attack: spawnBossParryBullet, weight: 45 },
      { attack: startBossWaveAttack, weight: 40 },
      { attack: startBossHiddenRaikanLaugh, weight: 15 }
    ];
  }

  if (boss.life <= 4) {
    return [
      { attack: spawnBossParryBullet, weight: 70 },
      { attack: startBossWaveAttack, weight: 30 }
    ];
  }

  return [
    { attack: spawnBossParryBullet, weight: 100 }
  ];
}

function chooseBossAttackPattern() {
  const attackTable = getBossAttackTable();
  const totalWeight = attackTable.reduce(
    (sum, pattern) => sum + pattern.weight,
    0
  );
  let randomWeight = Math.random() * totalWeight;

  for (let i = 0; i < attackTable.length; i++) {
    randomWeight -= attackTable[i].weight;

    if (randomWeight < 0) {
      return attackTable[i].attack;
    }
  }

  return attackTable[attackTable.length - 1].attack;
}

function updateBossParryBullets() {

  if (updateBossChargeAttack()) return;

  if (updateBossWaveAttack()) return;

  if (boss.parryBulletTimer > 0) {
    boss.parryBulletTimer--;
    return;
  }

  chooseBossAttackPattern()();

  boss.parryBulletTimer = BOSS_PARRY_BULLET_INTERVAL;
}
