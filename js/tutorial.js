// ====================
// Tutorial
// ====================

const tutorialSherryFaces = {
  normal: loadImage("tutorial.face.normal", "images/sherry_face_normal.png"),
  laugh: loadImage("tutorial.face.laugh", "images/sherry_face_laugh.png"),
  sad: loadImage("tutorial.face.sad", "images/sherry_face_sad.png"),
  surprised: loadImage("tutorial.face.surprised", "images/sherry_face_surprised.png"),
  wink: loadImage("tutorial.face.wink", "images/sherry_face_wink.png")
};

let tutorialStepIndex = 0;
let tutorialStepTimer = 0;
let tutorialMoved = false;
let tutorialPressedParry = false;
let tutorialPressedStake = false;
let tutorialClearedBullets = 0;
let tutorialBulletSpawnTimer = 0;
let tutorialAdviceText = "";
let tutorialAdviceTimer = 0;
let tutorialComboHighlightTimer = 0;

const TUTORIAL_PARRY_STEP = 4;
const TUTORIAL_STAKE_CLEAR_STEP = 7;
const TUTORIAL_COMBO_HIGHLIGHT_FRAMES = 300;

const TUTORIAL_STEPS = [
  {
    face: "normal",
    text: "まずは移動！矢印キーで動いてみて！",
    prompt: "Arrow keys",
    setup: () => {
      tutorialMoved = false;
      bullets = [];
      stakes = [];
    },
    complete: () => tutorialMoved
  },
  {
    face: "wink",
    text: "いいねぇ！Enterであーしの次のナビを続けて聞いてみて！",
    prompt: "Enter",
    advanceOnEnter: true,
    setup: () => {
      bullets = [];
      stakes = [];
    },
    complete: () => false
  },
  {
    face: "normal",
    text: "あんたの目的は基本的にどんどん進むこと！右側からくる弾に3回当たったらおしまいだから気を付けてね。",
    prompt: "Enter",
    advanceOnEnter: true,
    setup: () => {
      bullets = [];
      stakes = [];
    },
    complete: () => false
  },
  {
    face: "wink",
    text: "次はSpaceでパリィ姿勢！回転して弾をはじく準備をしてみよっ！",
    prompt: "Space",
    setup: () => {
      tutorialPressedParry = false;
      bullets = [];
      stakes = [];
    },
    complete: () => tutorialPressedParry
  },
  {
    face: "normal",
    text: "今度は実戦！弾を3回パリィして、超電磁杭をチャージしてみよっ！",
    prompt: () => `Parry ${Math.min(tutorialClearedBullets, MAX_PARRY)} / ${MAX_PARRY}`,
    setup: () => {
      tutorialClearedBullets = 0;
      tutorialBulletSpawnTimer = 0;
      parryCount = 0;
      spawnTutorialBullet();
    },
    complete: () => tutorialClearedBullets >= MAX_PARRY
  },
  {
    face: "laugh",
    text: "いいねっ！3回パリィ成功！電気を纏ったのわかる？これが超電磁杭のチャージ完了サイン！",
    prompt: "Enter",
    advanceOnEnter: true,
    setup: () => {
      parryCount = MAX_PARRY;
      bullets = [];
      stakes = [];
    },
    complete: () => false
  },
  {
    face: "surprised",
    text: "それじゃ、Xで超電磁杭を撃ってみよう！超電磁杭でも弾を消せちゃうよ！",
    prompt: "X",
    setup: () => {
      tutorialPressedStake = false;
      parryCount = MAX_PARRY;
      bullets = [];
      stakes = [];
    },
    complete: () => tutorialPressedStake
  },
  {
    face: "wink",
    text: "いっけー！",
    prompt: "X to clear",
    setup: () => {
      tutorialClearedBullets = 0;
      parryCount = MAX_PARRY;
      bullets = [
        {
          x: player.x + player.w + 220,
          y: player.y + player.h / 2 - 21,
          w: 48,
          h: 42,
          speed: 0
        },
        {
          x: player.x + player.w + 275,
          y: player.y + player.h / 2 + 18,
          w: 48,
          h: 42,
          speed: 0
        }
      ];
    },
    complete: () => tutorialClearedBullets >= 2
  },
  {
    face: "laugh",
    text: "弾を連続で消すとComboが増えて、スコアボーナスも大きくなるの！ゲージがなくなる前につなげよう！",
    prompt: "Enter/Escでタイトルに戻る",
    setup: () => {
      bullets = [];
      stakes = [];
      parryCount = MAX_PARRY;
      tutorialComboHighlightTimer = TUTORIAL_COMBO_HIGHLIGHT_FRAMES;
    },
    complete: () => false
  }
];

function resetTutorial() {

  resetGame();
  tutorialStepIndex = 0;
  tutorialStepTimer = 0;
  tutorialMoved = false;
  tutorialPressedParry = false;
  tutorialPressedStake = false;
  tutorialClearedBullets = 0;
  tutorialBulletSpawnTimer = 0;
  tutorialAdviceText = "";
  tutorialAdviceTimer = 0;
  tutorialComboHighlightTimer = 0;
  setupTutorialStep();
}

function setupTutorialStep() {

  tutorialStepTimer = 0;
  tutorialAdviceText = "";
  tutorialAdviceTimer = 0;

  const step = TUTORIAL_STEPS[tutorialStepIndex];

  if (step && step.setup) {
    step.setup();
  }
}

function advanceTutorialStep() {

  if (tutorialStepIndex >= TUTORIAL_STEPS.length - 1) return;

  tutorialStepIndex++;
  setupTutorialStep();
}

function handleTutorialKey(e) {

  const step = TUTORIAL_STEPS[tutorialStepIndex];

  if (e.key === "Escape") {
    resetGame();
    gameState = "title";
    return true;
  }

  if (
    e.key === "Enter" &&
    tutorialStepIndex >= TUTORIAL_STEPS.length - 1
  ) {
    resetGame();
    gameState = "title";
    return true;
  }

  if (
    e.key === "Enter" &&
    step &&
    step.advanceOnEnter
  ) {
    advanceTutorialStep();
    return true;
  }

  if (
    e.code === "ArrowUp" ||
    e.code === "ArrowDown" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight"
  ) {
    tutorialMoved = true;
  }

  if (e.code === "Space") {
    tutorialPressedParry = true;
  }

  if (
    e.code === "KeyX" &&
    parryCount >= MAX_PARRY
  ) {
    tutorialPressedStake = true;
  }

  return false;
}

function updateTutorial() {

  frame++;
  tutorialStepTimer++;

  updatePlayer();
  updateSpecial();
  updateBackground();
  updateStake();

  const damageBefore = player.damage;

  updateBullets();

  if (player.damage > damageBefore) {
    showTutorialAdvice(
      "あー、タイミングむずいよねぇ…『弾に対してちょっと早めに置く』のがコツだよ！"
    );
  }

  updateEffects();

  if (tutorialAdviceTimer > 0) {
    tutorialAdviceTimer--;
  }

  if (tutorialComboHighlightTimer > 0) {
    tutorialComboHighlightTimer--;
  }

  player.damage = 0;
  gameOver = false;

  const step = TUTORIAL_STEPS[tutorialStepIndex];

  if (
    step &&
    step.complete &&
    step.complete()
  ) {
    advanceTutorialStep();
  }

  if (
    tutorialStepIndex === TUTORIAL_PARRY_STEP &&
    bullets.length === 0 &&
    tutorialClearedBullets < MAX_PARRY
  ) {
    tutorialBulletSpawnTimer++;

    if (tutorialBulletSpawnTimer >= 30) {
      spawnTutorialBullet();
    }
  }
}

function drawTutorial() {

  drawBackground();
  drawEffects();
  drawPlayer();
  drawBullets();
  drawStake();
  drawHitBoxes();
  drawUI();
  drawTutorialComboHighlight();
  drawTutorialDialogue();
}

function drawTutorialComboHighlight() {

  if (tutorialComboHighlightTimer <= 0) return;
  if (clearCombo <= 0) return;

  const pulse = 0.5 + Math.sin(frame * 0.22) * 0.5;
  const highlightX = 14;
  const highlightY = 75;
  const highlightW = 150;
  const highlightH = 42;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, canvas.width, highlightY);
  ctx.fillRect(0, highlightY, highlightX, highlightH);
  ctx.fillRect(
    highlightX + highlightW,
    highlightY,
    canvas.width - highlightX - highlightW,
    highlightH
  );
  ctx.fillRect(
    0,
    highlightY + highlightH,
    canvas.width,
    canvas.height - highlightY - highlightH
  );

  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(120,240,255,${0.45 + pulse * 0.35})`;
  ctx.lineWidth = 2 + pulse * 2;
  ctx.shadowColor = "rgba(80,220,255,0.95)";
  ctx.shadowBlur = 16 + pulse * 10;
  ctx.strokeRect(highlightX, highlightY, highlightW, highlightH);

  ctx.fillStyle = `rgba(160,245,255,${0.65 + pulse * 0.25})`;
  ctx.font = "13px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("SCORE BONUS", 172, 103);
  ctx.restore();
}

function drawTutorialDialogue() {

  const step = TUTORIAL_STEPS[tutorialStepIndex];

  if (!step) return;

  dialogueCtx.clearRect(
    0,
    0,
    dialogueCanvas.width,
    dialogueCanvas.height
  );

  dialogueCtx.save();
  drawDialoguePanel();

  const activeFace = tutorialAdviceTimer > 0 ? "sad" : step.face;
  const activeText = tutorialAdviceTimer > 0 ? tutorialAdviceText : step.text;
  const promptText =
    typeof step.prompt === "function" ? step.prompt() : step.prompt;
  const icon = tutorialSherryFaces[activeFace] || tutorialSherryFaces.normal;

  if (imageReady(icon)) {
    dialogueCtx.save();
    dialogueCtx.beginPath();
    dialogueCtx.arc(62, 60, 38, 0, Math.PI * 2);
    dialogueCtx.clip();
    dialogueCtx.drawImage(icon, 24, 22, 76, 76);
    dialogueCtx.restore();

    dialogueCtx.strokeStyle = "rgba(80,240,255,0.85)";
    dialogueCtx.lineWidth = 2;
    dialogueCtx.beginPath();
    dialogueCtx.arc(62, 60, 39, 0, Math.PI * 2);
    dialogueCtx.stroke();
  }

  dialogueCtx.fillStyle = "rgba(80,240,255,0.95)";
  dialogueCtx.font = "15px sans-serif";
  dialogueCtx.textAlign = "left";
  dialogueCtx.textBaseline = "middle";
  dialogueCtx.fillText("NAVIGATOR", 122, 28);

  dialogueCtx.fillStyle = "white";
  dialogueCtx.font = "18px sans-serif";
  dialogueCtx.fillText("シェリー", 222, 28);

  dialogueCtx.fillStyle = "rgba(245,255,255,0.96)";
  dialogueCtx.font = "20px sans-serif";
  dialogueCtx.textBaseline = "top";
  drawDialogueText(
    activeText,
    122,
    52,
    dialogueCanvas.width - 150,
    25
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

function spawnTutorialBullet() {

  tutorialBulletSpawnTimer = 0;

  bullets = [
    {
      x: player.x + player.w + 120,
      y: player.y + player.h / 2 - 21,
      w: 48,
      h: 42,
      speed: 1.5
    }
  ];
}

function showTutorialAdvice(text) {

  tutorialAdviceText = text;
  tutorialAdviceTimer = 180;
}

function markTutorialBulletCleared() {

  if (gameState !== "tutorial") return;

  tutorialClearedBullets++;

  if (tutorialStepIndex === TUTORIAL_STAKE_CLEAR_STEP) {
    tutorialComboHighlightTimer = TUTORIAL_COMBO_HIGHLIGHT_FRAMES;
  }
}
