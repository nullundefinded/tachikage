// ====================
// Boss
// ====================

const bossImages = {
  ufo: loadImage("boss.ufo", "images/UFO.png"),
  stand: loadImage("boss.gulu.stand", "images/gulu_balad_stand.png")
};

const boss = {
  body: {
    x: 542,
    y: 50,
    w: 230,
    h: 230,
    hitBox: {
      offsetX: 38,
      offsetY: 30,
      w: 154,
      h: 166
    }
  },
  weak: {
    x: 590,
    y: 232,
    w: 170,
    hitBox: {
      offsetX: 12,
      offsetY: 24,
      w: 146,
      h: 58
    }
  },
  bodyGuardTimer: 0,
  weakHitTimer: 0
};

function resetBoss() {
  boss.bodyGuardTimer = 0;
  boss.weakHitTimer = 0;
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

function hitStakeWithBox(stake, box) {
  return (
    hit(stake, box) ||
    hitTriangleWithRect(stakeEffectTriangle(stake), box)
  );
}

function updateBossEnemy() {

  if (boss.bodyGuardTimer > 0) {
    boss.bodyGuardTimer--;
  }

  if (boss.weakHitTimer > 0) {
    boss.weakHitTimer--;
  }

  const bodyBox = getBossBodyBox();
  const weakBox = getBossWeakBox();

  stakes.forEach(stake => {

    if (hitStakeWithBox(stake, weakBox)) {
      boss.weakHitTimer = 12;
      return;
    }

    if (hitStakeWithBox(stake, bodyBox)) {
      boss.bodyGuardTimer = 14;
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

  ctx.save();

  if (boss.weakHitTimer > 0) {
    ctx.globalAlpha = 0.78 + Math.sin(frame * 1.2) * 0.18;
  }

  drawBossImage(bossImages.ufo, weakDrawBox);

  ctx.restore();
  ctx.save();

  const bodyScaleX =
    boss.bodyGuardTimer > 0
      ? 0.9
      : 1;
  const bodyScaleY =
    boss.bodyGuardTimer > 0
      ? 1.08
      : 1;

  ctx.translate(
    boss.body.x + boss.body.w / 2,
    boss.body.y + boss.body.h / 2
  );
  ctx.scale(bodyScaleX, bodyScaleY);

  drawBossImage(
    bossImages.stand,
    {
      x: -boss.body.w / 2 + bodyPulse,
      y: -boss.body.h / 2,
      w: boss.body.w,
      h: boss.body.h
    }
  );

  ctx.restore();
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
