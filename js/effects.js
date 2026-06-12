// ====================
// Effects
// ====================

// ====================
// エフェクト更新
// ====================

function updateEffects() {

  // パリィ発光減衰
  if (parryFlash > 0) {
    parryFlash--;
  }

}

// ====================
// 滑走エフェクト
// ====================
  
function drawTrailEffect() {

  if (trailPoints.length < 2) return;


  let forwardPower = 1.0;

  if (isControlPressed("left")) {
    forwardPower = 0.45;
  }

  if (isControlPressed("right")) {
    forwardPower = 1.25;
  }

  if (player.spin) {
    forwardPower = 1.8;
  }

  const speedPower = forwardPower;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 1; i < trailPoints.length; i++) {

    // 全部描かず、断続的に光らせる
    if (Math.random() < 0.35) continue;

    const p1 = trailPoints[i - 1];
    const p2 = trailPoints[i];

    const alpha = i / trailPoints.length * 0.9;

    const jitterX = 30 * speedPower;
    const jitterY = 24 * speedPower;

    const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) *   jitterX;
    const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) *   jitterY;

    // 外側の青い発光
    ctx.shadowBlur = 30 * speedPower;
    ctx.shadowColor = "rgba(60,180,255,1)";
    ctx.strokeStyle = `rgba(40,140,255,${alpha * 0.35})`;
    ctx.lineWidth = 10 * speedPower;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // 中心の白い雷芯
    ctx.shadowBlur = 8 * speedPower;
    ctx.strokeStyle = `rgba(245,255,255,${alpha})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // 枝雷
    if (Math.random() < 0.18 * speedPower) {

      const branchLen = (4 + Math.random() * 10) * speedPower;
      const branchDir = Math.random() < 0.5 ? -1 : 1;

      ctx.shadowBlur = 12 * speedPower;
      ctx.strokeStyle = `rgba(150,230,255,${alpha * 0.8})`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - branchLen,
        midY + branchDir * branchLen
      );
      ctx.stroke();
    }
  }

  // ボード直後の破裂スパーク
  const last = trailPoints[trailPoints.length - 1];

  if (last && Math.random() < 0.65 * speedPower) {

    const sparkCount = Math.floor(3 * speedPower);

    for (let i = 0; i < sparkCount; i++) {

      const angle = Math.PI + (Math.random() - 0.5) * 1.5;
      const len = (12 + Math.random() * 30) * speedPower;

      ctx.shadowBlur = 14 * speedPower;
      ctx.shadowColor = "rgba(80,190,255,1)";
      ctx.strokeStyle = "rgba(230,255,255,0.85)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(
        last.x + Math.cos(angle) * len,
        last.y + Math.sin(angle) * len
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ====================
// パリィ発光
// ====================

function drawParryFlash() {

  if (parryFlash <= 0) return;

  const alpha = parryFlash / 12;

  ctx.save();

  ctx.globalCompositeOperation = "lighter";

  ctx.fillStyle =
    `rgba(120,220,255,${alpha * 0.5})`;

  ctx.beginPath();

  ctx.arc(
    player.x + player.w / 2,
    player.y + player.h / 2,
    80,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

}

// ====================
// 超電磁杭チャージ発光
// ====================

const SPECIAL_READY_FRAME_COUNT = 8;
const SPECIAL_READY_W = 200;
const SPECIAL_READY_H = 200;
const SPECIAL_READY_CENTER_X = 100;
const SPECIAL_READY_CENTER_Y = 100;

const specialReadyImgs = [];

for (let i = 0; i < SPECIAL_READY_FRAME_COUNT; i++) {
  specialReadyImgs.push(
    loadImage(
      `specialReady.${i}`,
      `images/effects/special_ready_${i}.png`
    )
  );
}

function drawSpecialReadyEffect() {

  if (parryCount < MAX_PARRY) return;
  if (player.special) return;
  if (gameOver) return;

  const img =
    specialReadyImgs[
      Math.floor(frame / 2) % SPECIAL_READY_FRAME_COUNT
    ];

  if (!imageReady(img)) {
    drawSpecialReadyEffectProcedural();
    return;
  }

  const centerX = player.x + player.w / 2;
  const centerY = player.y + player.h / 2;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(
    img,
    centerX - SPECIAL_READY_CENTER_X,
    centerY - SPECIAL_READY_CENTER_Y,
    SPECIAL_READY_W,
    SPECIAL_READY_H
  );
  ctx.restore();
}

function drawSpecialReadyEffectProcedural() {

  const centerX = player.x + player.w / 2;
  const centerY = player.y + player.h / 2;
  const pulse = 0.65 + Math.sin(frame * 0.18) * 0.25;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(80,210,255,1)";
  ctx.strokeStyle = `rgba(80,220,255,${0.26 + pulse * 0.18})`;
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    58 + pulse * 8,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  for (let i = 0; i < 7; i++) {

    const angle = frame * 0.08 + i * Math.PI * 2 / 7;
    const radius = 42 + Math.sin(frame * 0.12 + i) * 8;
    const startX = centerX + Math.cos(angle) * radius;
    const startY = centerY + Math.sin(angle) * radius * 0.9;
    const midX = startX + (Math.random() - 0.5) * 24;
    const midY = startY + (Math.random() - 0.5) * 24;
    const endX = centerX + Math.cos(angle + 0.45) * (radius + 18);
    const endY = centerY + Math.sin(angle + 0.45) * (radius + 18) * 0.9;

    ctx.shadowBlur = 16;
    ctx.strokeStyle = "rgba(80,190,255,0.55)";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(245,255,255,0.9)";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.restore();
}

// ====================
// エフェクト描画
// ====================

function drawEffects() {
  // 滑走エフェクト
  drawTrailEffect();
  // 超電磁杭チャージ発光
  drawSpecialReadyEffect();
  // パリィ発光
  drawParryFlash();

}

const STAKE_HELIX_FRAME_COUNT = 6;
const STAKE_HELIX_W = 220;
const STAKE_HELIX_H = 140;
const STAKE_HELIX_TIP_X = 175;
const STAKE_HELIX_CENTER_Y = 70;

const stakeHelixImgs = {
  back: [],
  front: []
};

for (let i = 0; i < STAKE_HELIX_FRAME_COUNT; i++) {
  stakeHelixImgs.back.push(
    loadImage(
      `stakeHelix.back.${i}`,
      `images/effects/stake_helix_back_${i}.png`
    )
  );

  stakeHelixImgs.front.push(
    loadImage(
      `stakeHelix.front.${i}`,
      `images/effects/stake_helix_front_${i}.png`
    )
  );
}

function drawStakeHelix(s, front) {

  const frames = front ? stakeHelixImgs.front : stakeHelixImgs.back;
  const img = frames[Math.floor(s.age / 2) % frames.length];
  const tipX = s.x + s.w;
  const centerY = s.y + s.h / 2;

  if (imageReady(img)) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(
      img,
      tipX - STAKE_HELIX_TIP_X,
      centerY - STAKE_HELIX_CENTER_Y,
      STAKE_HELIX_W,
      STAKE_HELIX_H
    );
    ctx.restore();
    return;
  }

  drawStakeHelixProcedural(s, front);
}

function drawStakeHelixProcedural(s, front) {

  const tipX = s.x + s.w;
  const centerY = s.y + s.h / 2;
  const trailLength = 145;
  const startRadius = 4;
  const endRadius = 54;
  const turns = 0.95;
  const steps = 16;
  const phase = s.age * 0.65;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  [0, Math.PI].forEach(offset => {

    const points = [];

    for (let i = 0; i <= steps; i++) {

      const t = i / steps;
      const angle = t * Math.PI * 2 * turns + phase + offset;
      const radius = startRadius + (endRadius - startRadius) * t;
      const jitterX = (Math.random() - 0.5) * 10 * t;
      const jitterY = (Math.random() - 0.5) * 18 * t;

      points.push({
        x: tipX - trailLength * t + jitterX,
        y: centerY + Math.sin(angle) * radius + jitterY,
        front: Math.cos(angle) >= 0
      });
    }

    ctx.shadowBlur = front ? 24 : 10;
    ctx.shadowColor = "rgba(80,190,255,1)";
    ctx.strokeStyle = front
      ? "rgba(60,180,255,0.52)"
      : "rgba(30,110,220,0.22)";
    ctx.lineWidth = front ? 6 : 3;

    for (let i = 1; i < points.length; i++) {

      if (points[i].front !== front) continue;

      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }

    ctx.shadowBlur = front ? 8 : 0;
    ctx.strokeStyle = front
      ? "rgba(245,255,255,0.9)"
      : "rgba(130,210,255,0.28)";
    ctx.lineWidth = front ? 2 : 1;

    for (let i = 1; i < points.length; i++) {

      if (points[i].front !== front) continue;

      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  });

  ctx.restore();
}

function drawStakeSparks(s) {

  const centerY = s.y + s.h / 2;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  const sparkCount = 4;

  for (let i = 0; i < sparkCount; i++) {

    if (Math.random() < 0.35) continue;

    const baseX = s.x + Math.random() * s.w;
    const baseY = centerY + (Math.random() < 0.5 ? -1 : 1) * (s.h / 2 + 4);
    const dir = baseY < centerY ? -1 : 1;
    const len = 10 + Math.random() * 18;
    const angle = -Math.PI + (Math.random() - 0.5) * 0.9 + dir * 0.65;

    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(80,190,255,1)";
    ctx.strokeStyle = "rgba(230,255,255,0.8)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(
      baseX + Math.cos(angle) * len,
      baseY + Math.sin(angle) * len
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawStakeMuzzleFlash(s) {

  if (s.age > STAKE_MUZZLE_FLASH_FRAMES) return;

  const alpha = 1 - s.age / STAKE_MUZZLE_FLASH_FRAMES;
  const flashX = s.muzzleX;
  const flashY = s.muzzleY;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const gradient = ctx.createRadialGradient(
    flashX,
    flashY,
    4,
    flashX,
    flashY,
    70
  );

  gradient.addColorStop(0, `rgba(245,255,255,${alpha * 0.95})`);
  gradient.addColorStop(0.35, `rgba(80,210,255,${alpha * 0.45})`);
  gradient.addColorStop(1, "rgba(40,120,255,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(flashX, flashY, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 26;
  ctx.shadowColor = "rgba(80,190,255,1)";
  ctx.strokeStyle = `rgba(230,255,255,${alpha * 0.85})`;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  for (let i = 0; i < 5; i++) {

    const angle = (Math.random() - 0.5) * 1.2;
    const len = 38 + Math.random() * 36;

    ctx.beginPath();
    ctx.moveTo(flashX, flashY);
    ctx.lineTo(
      flashX + Math.cos(angle) * len,
      flashY + Math.sin(angle) * len
    );
    ctx.stroke();
  }

  ctx.restore();
}
