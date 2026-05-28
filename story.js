// ====================
// STORY / ADV
// ====================

const dialogueCanvas = document.getElementById("dialogue-ui");
const dialogueCtx = dialogueCanvas.getContext("2d");
const storyMaskCanvas = document.createElement("canvas");
const storyMaskCtx = storyMaskCanvas.getContext("2d");

const storyImages = {
  tachikage: {
    normal: new Image(),
    laugh: new Image()
  },
  sherry: {
    normal: new Image(),
    laugh: new Image(),
    smug: new Image()
  }
};

storyImages.tachikage.normal.src = "images/tachikage_normal.png";
storyImages.tachikage.laugh.src = "images/tachikage_laugh.png";
storyImages.sherry.normal.src = "images/sherry_normal.png";
storyImages.sherry.laugh.src = "images/sherry_laugh.png";
storyImages.sherry.smug.src = "images/sherry_smug.png";

let storyLineIndex = 0;

const STORY_CHARACTER_ENTER_FRAMES = 18;
const STORY_CHARACTER_SLIDE = 36;

const STORY_LINES = window.STORY_LINES || [
  {
    speaker: "System",
    character: "tachikage",
    face: "normal",
    text: "storyLines.jsが読み込めませんでした。"
  }
];

const storyCharacterStates = {
  tachikage: {
    face: "normal",
    visible: false,
    animFrame: STORY_CHARACTER_ENTER_FRAMES
  },
  sherry: {
    face: "normal",
    visible: false,
    animFrame: STORY_CHARACTER_ENTER_FRAMES
  }
};

function resetStory() {

  storyLineIndex = 0;

  Object.values(storyCharacterStates).forEach(state => {
    state.face = "normal";
    state.visible = false;
    state.animFrame = STORY_CHARACTER_ENTER_FRAMES;
  });

  applyStoryLine();
}

function advanceStoryLine() {

  storyLineIndex++;
  applyStoryLine();
}

function applyStoryLine() {

  const line = STORY_LINES[storyLineIndex];

  if (!line) return;

  const state = storyCharacterStates[line.character];

  if (!state) return;

  const nextFace = line.face || "normal";

  if (!state.visible || state.face !== nextFace) {
    state.face = nextFace;
    state.visible = true;
    state.animFrame = 0;
  }
}

function updateStory() {

  Object.values(storyCharacterStates).forEach(state => {
    if (
      state.visible &&
      state.animFrame < STORY_CHARACTER_ENTER_FRAMES
    ) {
      state.animFrame++;
    }
  });
}

function drawDialogueUI(speaker, text, promptText = "Enter") {

  dialogueCtx.clearRect(
    0,
    0,
    dialogueCanvas.width,
    dialogueCanvas.height
  );

  if (!text) return;

  dialogueCtx.save();

  drawDialoguePanel();

  dialogueCtx.font = "18px sans-serif";
  const speakerNameWidth = dialogueCtx.measureText(speaker).width;
  const speakerBoxW = Math.min(
    dialogueCanvas.width - 40,
    Math.max(184, speakerNameWidth + 118)
  );

  dialogueCtx.fillStyle = "rgba(0,0,0,0.72)";
  dialogueCtx.strokeStyle = "rgba(80,240,255,0.75)";
  dialogueCtx.lineWidth = 1;
  dialogueCtx.fillRect(20, 14, speakerBoxW, 28);
  dialogueCtx.strokeRect(20, 14, speakerBoxW, 28);

  dialogueCtx.fillStyle = "rgba(80,240,255,0.95)";
  dialogueCtx.font = "15px sans-serif";
  dialogueCtx.textAlign = "left";
  dialogueCtx.textBaseline = "middle";
  dialogueCtx.fillText(
    "SPEAKER",
    32,
    28
  );

  dialogueCtx.fillStyle = "white";
  dialogueCtx.font = "18px sans-serif";
  dialogueCtx.fillText(
    speaker,
    112,
    28
  );

  dialogueCtx.fillStyle = "rgba(245,255,255,0.96)";
  dialogueCtx.font = "21px sans-serif";
  dialogueCtx.textBaseline = "top";
  drawDialogueText(
    text,
    24,
    55,
    dialogueCanvas.width - 48,
    26
  );

  dialogueCtx.fillStyle = "rgba(80,240,255,0.75)";
  dialogueCtx.font = "14px sans-serif";
  dialogueCtx.textAlign = "right";
  dialogueCtx.textBaseline = "alphabetic";
  dialogueCtx.fillText(
    promptText,
    dialogueCanvas.width - 24,
    dialogueCanvas.height - 30
  );

  dialogueCtx.restore();
}

function drawDialoguePanel() {

  const w = dialogueCanvas.width;
  const h = dialogueCanvas.height;

  dialogueCtx.beginPath();
  dialogueCtx.moveTo(18, 0);
  dialogueCtx.lineTo(w - 1, 0);
  dialogueCtx.lineTo(w - 1, h - 22);
  dialogueCtx.lineTo(w - 22, h - 1);
  dialogueCtx.lineTo(1, h - 1);
  dialogueCtx.lineTo(1, 18);
  dialogueCtx.closePath();

  dialogueCtx.fillStyle = "rgba(2,8,14,0.92)";
  dialogueCtx.fill();

  dialogueCtx.save();
  dialogueCtx.clip();

  dialogueCtx.strokeStyle = "rgba(45,190,220,0.16)";
  dialogueCtx.lineWidth = 1;

  for (let x = 16; x < w; x += 32) {
    dialogueCtx.beginPath();
    dialogueCtx.moveTo(x, 0);
    dialogueCtx.lineTo(x, h);
    dialogueCtx.stroke();
  }

  for (let y = 16; y < h; y += 24) {
    dialogueCtx.beginPath();
    dialogueCtx.moveTo(0, y);
    dialogueCtx.lineTo(w, y);
    dialogueCtx.stroke();
  }

  dialogueCtx.restore();

  dialogueCtx.strokeStyle = "rgba(110,245,255,0.95)";
  dialogueCtx.lineWidth = 2;
  dialogueCtx.beginPath();
  dialogueCtx.moveTo(18, 0);
  dialogueCtx.lineTo(w - 1, 0);
  dialogueCtx.lineTo(w - 1, h - 22);
  dialogueCtx.lineTo(w - 22, h - 1);
  dialogueCtx.lineTo(1, h - 1);
  dialogueCtx.lineTo(1, 18);
  dialogueCtx.closePath();
  dialogueCtx.stroke();

  dialogueCtx.strokeStyle = "rgba(255,60,140,0.8)";
  dialogueCtx.lineWidth = 2;
  dialogueCtx.beginPath();
  dialogueCtx.moveTo(0, 0);
  dialogueCtx.lineTo(44, 0);
  dialogueCtx.moveTo(w - 96, h - 1);
  dialogueCtx.lineTo(w - 28, h - 1);
  dialogueCtx.stroke();

  dialogueCtx.fillStyle = "rgba(80,240,255,0.75)";
  dialogueCtx.fillRect(18, h - 16, 86, 2);
  dialogueCtx.fillStyle = "rgba(255,60,140,0.65)";
  dialogueCtx.fillRect(w - 130, 15, 58, 2);
}

function drawDialogueText(text, x, y, maxWidth, lineHeight) {

  let line = "";

  [...text].forEach(char => {
    const nextLine = line + char;

    if (
      line &&
      dialogueCtx.measureText(nextLine).width > maxWidth
    ) {
      dialogueCtx.fillText(line, x, y);
      line = char;
      y += lineHeight;
      return;
    }

    line = nextLine;
  });

  if (line) {
    dialogueCtx.fillText(line, x, y);
  }
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

// ====================
// ストーリー画面描画
// ====================

function drawStoryCharacter(character, side, active) {

  const state = storyCharacterStates[character];

  if (!state || !state.visible) return;

  const images = storyImages[character];
  const img = images[state.face] || images.normal;

  if (!imageReady(img)) return;

  const progress = Math.min(
    state.animFrame / STORY_CHARACTER_ENTER_FRAMES,
    1
  );
  const slideOffset = (1 - progress) *
    STORY_CHARACTER_SLIDE *
    (side === "left" ? -1 : 1);
  const targetH = 390;
  const scale = targetH / img.naturalHeight;
  const targetW = img.naturalWidth * scale;
  const x = side === "left"
    ? 36
    : canvas.width - targetW - 36;
  const y = canvas.height - targetH;

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.drawImage(
    img,
    x + slideOffset,
    y,
    targetW,
    targetH
  );
  ctx.restore();

  if (!active) {
    storyMaskCanvas.width = targetW;
    storyMaskCanvas.height = targetH;

    storyMaskCtx.clearRect(
      0,
      0,
      targetW,
      targetH
    );
    storyMaskCtx.drawImage(
      img,
      0,
      0,
      targetW,
      targetH
    );
    storyMaskCtx.globalCompositeOperation = "source-in";
    storyMaskCtx.fillStyle = "rgba(0,0,0,0.45)";
    storyMaskCtx.fillRect(
      0,
      0,
      targetW,
      targetH
    );
    storyMaskCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(
      storyMaskCanvas,
      x + slideOffset,
      y
    );
  }
}

function drawStory() {

  const line = STORY_LINES[storyLineIndex];
  const isLastLine = storyLineIndex === STORY_LINES.length - 1;

  drawBackground();
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStoryCharacter(
    "tachikage",
    "left",
    line.character === "tachikage"
  );

  drawStoryCharacter(
    "sherry",
    "right",
    line.character === "sherry"
  );

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(
    "Press Esc to return",
    18,
    16
  );

  ctx.textBaseline = "alphabetic";

  drawDialogueUI(
    line.speaker,
    line.text,
    isLastLine
      ? "Enter/Escでタイトルに戻る"
      : "Enter"
  );
}
