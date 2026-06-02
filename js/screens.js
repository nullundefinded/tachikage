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

  ctx.font = "24px sans-serif";

  TITLE_MENU_ITEMS.forEach((item, i) => {

    const y = 245 + i * 42;
    const selected = i === titleMenuIndex;

    ctx.fillStyle = selected
      ? "cyan"
      : "white";

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

function drawConfig() {

  drawInfoScreen(
    "CONFIG",
    [
      "Coming soon",
      "Effect quality, controls, and display options"
    ]
  );
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
