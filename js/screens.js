// ====================
// ロード画面描画
// ====================

function drawLoading() {

  const progress = getAssetLoadProgress();
  const rate = progress.total > 0
    ? progress.loaded / progress.total
    : 1;

  ctx.fillStyle = "#02080e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "white";
  ctx.font = "54px sans-serif";
  ctx.fillText(
    "TACHIKAGE",
    canvas.width / 2,
    165
  );

  ctx.fillStyle = "rgba(210,245,255,0.82)";
  ctx.font = "18px sans-serif";
  ctx.fillText(
    `LOADING ${progress.loaded} / ${progress.total}`,
    canvas.width / 2,
    218
  );

  const barW = 320;
  const barH = 8;
  const barX = canvas.width / 2 - barW / 2;
  const barY = 246;

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(barX, barY, barW, barH);

  ctx.fillStyle = "rgba(60,230,255,0.9)";
  ctx.fillRect(barX, barY, barW * rate, barH);

  ctx.strokeStyle = "rgba(200,245,255,0.72)";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  if (progress.failed > 0) {
    ctx.fillStyle = "rgba(255,190,120,0.86)";
    ctx.font = "14px sans-serif";
    ctx.fillText(
      `LOAD WARNING ${progress.failed}`,
      canvas.width / 2,
      292
    );
  }

  ctx.textAlign = "left";
}

// ====================
// ボス仮画面描画
// ====================

function drawBossPlaceholder() {

  ctx.save();

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,80,130,0.92)";
  ctx.font = "22px sans-serif";
  ctx.fillText(
    "BOSS MODE",
    canvas.width - 24,
    34
  );

  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "prototype",
    canvas.width - 24,
    56
  );

  ctx.restore();
}

// ====================
// タイトル画面描画
// ====================

function drawTitle() {

  if (imageReady(titleBgImg)) {
    drawCoverImage(titleBgImg);
  } else {
    drawBackground();
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.fillText(
    "TACHIKAGE",
    canvas.width / 2,
    140
  );

  ctx.fillStyle = "rgba(210,245,255,0.86)";
  ctx.font = "17px sans-serif";
  ctx.fillText(
    "- WHERE PAIN ENDS -",
    canvas.width / 2,
    174
  );

  ctx.font = "23px sans-serif";

  TITLE_MENU_ITEMS.forEach((item, i) => {

    const y = 235 + i * 36;
    const enabled = isTitleMenuItemEnabled(item);
    const selected = enabled && i === titleMenuIndex;

    ctx.fillStyle = selected
      ? "cyan"
      : enabled
        ? "white"
        : "rgba(255,255,255,0.38)";

    ctx.fillText(
      `${selected ? "> " : "  "}${item}${selected ? " <" : "  "}`,
      canvas.width / 2,
      y
    );
  });

  ctx.textAlign = "left";

}

function drawInfoScreen(title, lines) {

  drawTitle();

  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "cyan";
  ctx.font = "38px sans-serif";
  ctx.fillText(
    title,
    canvas.width / 2,
    126
  );

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";

  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      canvas.width / 2,
      190 + index * 34
    );
  });

  ctx.fillStyle = "rgba(210,245,255,0.72)";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    "Enter / Esc: Title",
    canvas.width / 2,
    390
  );

  ctx.textAlign = "left";
}

function drawCredits() {

  drawInfoScreen(
    "CREDITS",
    [
      "TACHIKAGE / 雷滑",
      "Created by nurun-chan",
      "Navigator: Sherry"
    ]
  );
}
