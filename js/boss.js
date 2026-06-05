// ====================
// Boss
// ====================

const bossImages = {
  ufo: loadImage("boss.ufo", "images/UFO.png"),
  stand: loadImage("boss.gulu.stand", "images/gulu_balad_stand.png")
};

const BOSS_BODY_GUARD_FRAMES = 18;
const BOSS_WEAK_HIT_FRAMES = 12;
const BOSS_PARRY_BULLET_INTERVAL = 80;
const BOSS_PARRY_BULLET_START_DELAY = 45;
const BOSS_PARRY_BULLET_SPEED = 2.8;
const BOSS_PARRY_BULLET_MAX = 2;

const boss = {
  body: {
    x: 550,
    y: 75,
    w: 230,
    h: 230,
    hitBox: {
      offsetX: 42,
      offsetY: 32,
      w: 146,
      h: 142
    }
  },
  weak: {
    x: 590,
    y: 232,
    w: 170,
    hitBox: {
      offsetX: 26,
      offsetY: 31,
      w: 118,
      h: 44
    }
  },
  bodyGuardTimer: 0,
  bodyGuardImpactX: 0,
  bodyGuardImpactY: 0,
  bodyGuardSide: 1,
  weakHitTimer: 0,
  parryBulletTimer: BOSS_PARRY_BULLET_START_DELAY
};

function resetBoss() {
  boss.bodyGuardTimer = 0;
  boss.bodyGuardImpactX = 0;
  boss.bodyGuardImpactY = 0;
  boss.bodyGuardSide = 1;
  boss.weakHitTimer = 0;
  boss.parryBulletTimer = BOSS_PARRY_BULLET_START_DELAY;
}

function getBossBodyBox() {
  return {
    x: boss.body.x + boss.body.hitBox.offsetX,
    y: boss.body.y + boss.body.hitBox.offsetY,
    w: boss.body.hitBox.w,
    h: boss.body.hitBox.h
  };
}

function getBossWeakBox() {
  return {
    x: boss.weak.x + boss.weak.hitBox.offsetX,
    y: boss.weak.y + boss.weak.hitBox.offsetY,
    w: boss.weak.hitBox.w,
    h: boss.weak.hitBox.h
  };
}

function countBossParryBullets() {
  return bullets.filter(b => b.bossParry).length;
}

function spawnBossParryBullet() {

  const bulletH = 42;
  const targetY = player.y + player.h / 2 - bulletH / 2;

  bullets.push({
    x: boss.body.x + 28,
    y: Math.max(18, Math.min(targetY, canvas.height - bulletH - 18)),
    w: 48,
    h: bulletH,
    speed: BOSS_PARRY_BULLET_SPEED,
    bossParry: true
  });
}

function updateBossParryBullets() {

  if (boss.parryBulletTimer > 0) {
    boss.parryBulletTimer--;
    return;
  }

  if (countBossParryBullets() < BOSS_PARRY_BULLET_MAX) {
    spawnBossParryBullet();
  }

  boss.parryBulletTimer = BOSS_PARRY_BULLET_INTERVAL;
}

function updateBossEnemy() {

  updateBossParryBullets();

  if (boss.bodyGuardTimer > 0) {
    boss.bodyGuardTimer--;
  }

  if (boss.weakHitTimer > 0) {
    boss.weakHitTimer--;
  }

  const bodyBox = getBossBodyBox();
  const weakBox = getBossWeakBox();

  stakes.forEach(stake => {

    if (hit(stake, weakBox)) {
      boss.weakHitTimer = BOSS_WEAK_HIT_FRAMES;
      return;
    }

    if (!stake.bossBodyGuarded && hit(stake, bodyBox)) {
      const impactX = stake.x + stake.w;
      const impactY = stake.y + stake.h / 2;

      boss.bodyGuardTimer = BOSS_BODY_GUARD_FRAMES;
      boss.bodyGuardImpactX = Math.max(
        bodyBox.x,
        Math.min(impactX, bodyBox.x + bodyBox.w)
      );
      boss.bodyGuardImpactY = Math.max(
        bodyBox.y,
        Math.min(impactY, bodyBox.y + bodyBox.h)
      );
      boss.bodyGuardSide =
        boss.bodyGuardImpactX < boss.body.x + boss.body.w / 2
          ? 1
          : -1;

      stake.bossBodyGuarded = true;
    }
  });
}

function drawBossImage(img, box) {

  if (!imageReady(img)) return;

  ctx.drawImage(
    img,
    box.x,
    box.y,
    box.w,
    box.h
  );
}

function drawBossBodyImage(box, guardPower) {

  const img = bossImages.stand;

  if (!imageReady(img)) return;

  if (guardPower <= 0) {
    drawBossImage(img, box);
    return;
  }

  const centerX = boss.body.x + boss.body.w / 2;
  const centerY = boss.body.y + boss.body.h / 2;
  const holeX = Math.max(
    0,
    Math.min(boss.bodyGuardImpactX - centerX - box.x, box.w)
  );
  const holeY = Math.max(
    0,
    Math.min(boss.bodyGuardImpactY - centerY - box.y, box.h)
  );
  const sliceCount = 36;
  const sourceSliceH = img.naturalHeight / sliceCount;
  const drawSliceH = box.h / sliceCount;
  const holeRadiusX = 20 + guardPower * 42;
  const holeRadiusY = 12 + guardPower * 28;

  for (let i = 0; i < sliceCount; i++) {

    const sliceY = drawSliceH * i;
    const sliceCenterY = sliceY + drawSliceH / 2;
    const distY = Math.abs(sliceCenterY - holeY);
    const holeCurve = Math.max(
      0,
      1 - (distY / holeRadiusY) * (distY / holeRadiusY)
    );
    const openPower = holeCurve * guardPower;
    const bendPower = Math.max(0, 1 - distY / 96) * guardPower;
    const ripple = Math.sin(i * 0.7 + frame * 0.38);
    const bendX =
      boss.bodyGuardSide * bendPower * (12 + ripple * 3);

    if (openPower <= 0.02) {
      ctx.drawImage(
        img,
        0,
        sourceSliceH * i,
        img.naturalWidth,
        sourceSliceH + 1,
        box.x + bendX,
        box.y + sliceY,
        box.w,
        drawSliceH + 1
      );
      continue;
    }

    const holeHalfW = Math.sqrt(holeCurve) * holeRadiusX;
    const leftW = Math.max(0, holeX - holeHalfW);
    const rightX = Math.min(box.w, holeX + holeHalfW);
    const rightW = Math.max(0, box.w - rightX);
    const push = 8 + openPower * 24;

    if (leftW > 0) {
      ctx.drawImage(
        img,
        0,
        sourceSliceH * i,
        img.naturalWidth * leftW / box.w,
        sourceSliceH + 1,
        box.x + bendX - push * 0.45,
        box.y + sliceY,
        leftW,
        drawSliceH + 1
      );
    }

    if (rightW > 0) {
      ctx.drawImage(
        img,
        img.naturalWidth * rightX / box.w,
        sourceSliceH * i,
        img.naturalWidth * rightW / box.w,
        sourceSliceH + 1,
        box.x + rightX + bendX + push * 0.75,
        box.y + sliceY,
        rightW,
        drawSliceH + 1
      );
    }
  }
}

function drawBossBodyGuardEffect(guardPower) {

  if (guardPower <= 0) return;

  const bodyBox = getBossBodyBox();
  const impactX = boss.bodyGuardImpactX || bodyBox.x;
  const impactY =
    boss.bodyGuardImpactY || bodyBox.y + bodyBox.h / 2;
  const side = boss.bodyGuardSide;
  const holeW = 24 + guardPower * 46;
  const holeH = 11 + guardPower * 18;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255,70,210,0.8)";

  ctx.strokeStyle = `rgba(28,0,24,${guardPower * 0.78})`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(impactX, impactY, holeW, holeH, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,110,220,${guardPower * 0.62})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(impactX, impactY, holeW + 2, holeH + 1, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {

    const dir = i < 2 ? -1 : 1;
    const y = impactY + dir * (holeH + 8 + i % 2 * 8);
    const wave = Math.sin(frame * 0.3 + i) * 5;
    const startX = impactX - side * (holeW * 0.72);
    const midX = impactX + side * (holeW * 0.2);
    const endX = impactX + side * (holeW * 0.92);

    ctx.strokeStyle = `rgba(255,140,230,${guardPower * 0.42})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.quadraticCurveTo(
      midX,
      y + wave * dir,
      endX,
      y - wave
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawBossEnemy() {

  const ufoH =
    imageReady(bossImages.ufo)
      ? boss.weak.w * bossImages.ufo.naturalHeight / bossImages.ufo.naturalWidth
      : 114;

  const weakDrawBox = {
    x: boss.weak.x,
    y: boss.weak.y,
    w: boss.weak.w,
    h: ufoH
  };

  const bodyPulse =
    boss.bodyGuardTimer > 0
      ? Math.sin(frame * 0.9) * 4
      : 0;
  const bodyGuardPower =
    boss.bodyGuardTimer > 0
      ? Math.sin(
        boss.bodyGuardTimer / BOSS_BODY_GUARD_FRAMES * Math.PI / 2
      )
      : 0;

  ctx.save();

  if (boss.weakHitTimer > 0) {
    ctx.globalAlpha = 0.78 + Math.sin(frame * 1.2) * 0.18;
  }

  drawBossImage(bossImages.ufo, weakDrawBox);

  ctx.restore();
  ctx.save();

  ctx.translate(
    boss.body.x + boss.body.w / 2,
    boss.body.y + boss.body.h / 2
  );

  drawBossBodyImage(
    {
      x: -boss.body.w / 2 + bodyPulse,
      y: -boss.body.h / 2,
      w: boss.body.w,
      h: boss.body.h
    },
    bodyGuardPower
  );

  ctx.restore();

  drawBossBodyGuardEffect(bodyGuardPower);
}

function drawBossHitBoxes() {

  if (!showHitBoxes) return;

  drawHitBox(
    getBossBodyBox(),
    {
      fill: "rgba(255,80,180,0.08)",
      stroke: "rgba(255,80,180,0.65)"
    }
  );

  drawHitBox(
    getBossWeakBox(),
    {
      fill: "rgba(255,230,80,0.14)",
      stroke: "rgba(255,230,80,0.9)"
    }
  );
}
