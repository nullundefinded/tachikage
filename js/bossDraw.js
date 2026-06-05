// ====================
// Boss Draw
// ====================

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
  const centerY = getBossBodyY() + boss.body.h / 2;
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

function drawBossLifeBar() {

  const barW = 180;
  const barH = 10;
  const x = canvas.width - barW - 24;
  const y = 76;
  const rate = boss.life / BOSS_MAX_LIFE;

  ctx.save();

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    `BOSS LIFE ${boss.life} / ${BOSS_MAX_LIFE}`,
    canvas.width - 24,
    y - 8
  );

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(x, y, barW, barH);

  ctx.fillStyle = "rgba(255,80,130,0.92)";
  ctx.fillRect(x, y, barW * rate, barH);

  ctx.strokeStyle = "rgba(255,255,255,0.68)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barW, barH);

  ctx.restore();
}

function drawBossWarpEffect(ufoH) {

  if (boss.warpTimer <= 0) return;

  const rate = boss.warpTimer / BOSS_WARP_EFFECT_FRAMES;
  const fromBodyY = boss.body.y + boss.warpFromOffsetY;
  const fromWeakY = boss.weak.y + boss.warpFromOffsetY;
  const toCenterX = boss.body.x + boss.body.w / 2;
  const toCenterY = boss.body.y + boss.warpToOffsetY + boss.body.h / 2;
  const ringRadius = 42 + (1 - rate) * 34;

  ctx.save();
  ctx.globalAlpha = rate * 0.34;

  drawBossImage(
    bossImages.ufo,
    {
      x: boss.weak.x,
      y: fromWeakY,
      w: boss.weak.w,
      h: ufoH
    }
  );

  drawBossImage(
    bossImages.stand,
    {
      x: boss.body.x,
      y: fromBodyY,
      w: boss.body.w,
      h: boss.body.h
    }
  );

  ctx.restore();
  ctx.save();

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(90,220,255,0.95)";
  ctx.strokeStyle = `rgba(120,235,255,${rate * 0.72})`;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(
    toCenterX,
    toCenterY,
    ringRadius,
    ringRadius * 0.58,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,120,230,${rate * 0.46})`;
  ctx.lineWidth = 2;

  for (let i = 0; i < 5; i++) {
    const angle = frame * 0.12 + i * Math.PI * 2 / 5;
    const startRadius = 20 + i * 5;
    const endRadius = ringRadius + 26;

    ctx.beginPath();
    ctx.moveTo(
      toCenterX + Math.cos(angle) * startRadius,
      toCenterY + Math.sin(angle) * startRadius * 0.58
    );
    ctx.lineTo(
      toCenterX + Math.cos(angle) * endRadius,
      toCenterY + Math.sin(angle) * endRadius * 0.58
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
    y: getBossWeakY(),
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

  drawBossWarpEffect(ufoH);

  ctx.save();

  if (boss.weakHitTimer > 0) {
    ctx.globalAlpha = 0.78 + Math.sin(frame * 1.2) * 0.18;
  }

  drawBossImage(bossImages.ufo, weakDrawBox);

  ctx.restore();
  ctx.save();

  ctx.translate(
    boss.body.x + boss.body.w / 2,
    getBossBodyY() + boss.body.h / 2
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
  drawBossLifeBar();
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
