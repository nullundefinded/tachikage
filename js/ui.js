const HITBOX_TOGGLE = {
  x: 0,
  y: 0,
  w: 130,
  h: 28
};

// ====================
// 当たり判定デバッグ描画
// ====================

function drawHitBox(box, color) {

  ctx.fillStyle = color.fill;
  ctx.strokeStyle = color.stroke;
  ctx.lineWidth = 2;

  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeRect(box.x, box.y, box.w, box.h);
}

function drawHitTriangle(triangle, color) {

  ctx.fillStyle = color.fill;
  ctx.strokeStyle = color.stroke;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(triangle.a.x, triangle.a.y);
  ctx.lineTo(triangle.b.x, triangle.b.y);
  ctx.lineTo(triangle.c.x, triangle.c.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHitBoxes() {

  if (!showHitBoxes) return;

  ctx.save();

  drawHitBox(
    player,
    {
      fill: "rgba(80,255,120,0.12)",
      stroke: "rgba(80,255,120,0.85)"
    }
  );

  bullets.forEach(b => {
    drawHitBox(
      b,
      {
        fill: "rgba(255,80,80,0.12)",
        stroke: "rgba(255,80,80,0.85)"
      }
    );
  });

  stakes.forEach(s => {
    drawHitTriangle(
      stakeEffectTriangle(s),
      {
        fill: "rgba(190,90,255,0.10)",
        stroke: "rgba(190,90,255,0.75)"
      }
    );

    drawHitBox(
      s,
      {
        fill: "rgba(80,230,255,0.14)",
        stroke: "rgba(80,230,255,0.9)"
      }
    );
  });

  ctx.restore();
}

// ====================
// 外部UI描画
// ====================

function drawDebugUI() {

  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
  debugCtx.save();

  debugCtx.fillStyle = showHitBoxes
    ? "rgba(60,220,255,0.22)"
    : "rgba(0,0,0,0.35)";
  debugCtx.strokeStyle = showHitBoxes
    ? "rgba(90,240,255,0.95)"
    : "rgba(255,255,255,0.55)";
  debugCtx.lineWidth = 2;

  debugCtx.fillRect(
    HITBOX_TOGGLE.x,
    HITBOX_TOGGLE.y,
    HITBOX_TOGGLE.w,
    HITBOX_TOGGLE.h
  );
  debugCtx.strokeRect(
    HITBOX_TOGGLE.x,
    HITBOX_TOGGLE.y,
    HITBOX_TOGGLE.w,
    HITBOX_TOGGLE.h
  );

  debugCtx.fillStyle = showHitBoxes
    ? "cyan"
    : "white";
  debugCtx.font = "14px sans-serif";
  debugCtx.textAlign = "center";
  debugCtx.textBaseline = "middle";
  debugCtx.fillText(
    `HIT BOX ${showHitBoxes ? "ON" : "OFF"}`,
    HITBOX_TOGGLE.x + HITBOX_TOGGLE.w / 2,
    HITBOX_TOGGLE.y + HITBOX_TOGGLE.h / 2
  );

  debugCtx.restore();
}

// ====================
// ゲーム画面UI描画
// ====================

function drawUI() {

  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";

  ctx.fillText(
    "Score: " + Math.floor(score / SCORE_DISPLAY_SCALE),
    20,
    35
  );

  ctx.fillText(
    "Damage: " + player.damage + " / 3",
    20,
    70
  );

  if (clearCombo > 0) {

    ctx.fillStyle = "rgba(120,220,255,0.95)";
    ctx.font = "20px sans-serif";

    ctx.fillText(
      `Combo: ${clearCombo}`,
      20,
      95
    );

    const comboGaugeW = 120;
    const comboGaugeH = 6;
    const comboGaugeRate = clearComboTimer / CLEAR_COMBO_FRAMES;

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(
      20,
      104,
      comboGaugeW,
      comboGaugeH
    );

    ctx.fillStyle = "rgba(80,220,255,0.9)";
    ctx.fillRect(
      20,
      104,
      comboGaugeW * comboGaugeRate,
      comboGaugeH
    );

    ctx.strokeStyle = "rgba(180,245,255,0.75)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      20,
      104,
      comboGaugeW,
      comboGaugeH
    );
  }

  // パリィゲージ
  ctx.font = "24px sans-serif";
  ctx.fillStyle =
    parryCount >= MAX_PARRY
      ? "cyan"
      : "white";

  ctx.fillText(
    `Parry: ${parryCount} / ${MAX_PARRY}`,
    20,
    135
  );

  // ゲームオーバー
  if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";

    ctx.fillText(
      "GAME OVER",
      240,
      220
    );

    ctx.font = "24px sans-serif";

    ctx.fillText(
      "Enter: Retry   Esc: Title",
      250,
      270
    );
  }
}
