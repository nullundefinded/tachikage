// ====================
// Game Navigator
// ====================

const gameNavFaces = {
  normal: new Image(),
  laugh: new Image(),
  sad: new Image(),
  surprised: new Image(),
  wink: new Image()
};

gameNavFaces.normal.src = "images/sherry_face_normal.png";
gameNavFaces.laugh.src = "images/sherry_face_laugh.png";
gameNavFaces.sad.src = "images/sherry_face_sad.png";
gameNavFaces.surprised.src = "images/sherry_face_surprised.png";
gameNavFaces.wink.src = "images/sherry_face_wink.png";

let gameNavMessage = null;
let gameNavTimer = 0;
let gameNavPriority = 0;
let gameNavParryUseCount = 0;

const GAME_NAV_DEFAULT_FRAMES = 180;
const gameNavFlags = {};
const gameNavCooldowns = {};

function resetGameNav() {

  gameNavMessage = null;
  gameNavTimer = 0;
  gameNavPriority = 0;
  gameNavParryUseCount = 0;

  Object.keys(gameNavFlags).forEach(key => {
    delete gameNavFlags[key];
  });

  Object.keys(gameNavCooldowns).forEach(key => {
    delete gameNavCooldowns[key];
  });

  showGameNav(
    "start",
    "normal",
    "よし、行こっか！",
    GAME_NAV_DEFAULT_FRAMES,
    1
  );
}

function updateGameNav() {

  if (gameState !== "playing") return;

  const displayScore = Math.floor(score / SCORE_DISPLAY_SCALE);

  if (gameNavTimer > 0) {
    gameNavTimer--;

    if (gameNavTimer <= 0) {
      gameNavMessage = null;
      gameNavPriority = 0;
    }
  }

  Object.keys(gameNavCooldowns).forEach(id => {
    gameNavCooldowns[id]--;

    if (gameNavCooldowns[id] <= 0) {
      delete gameNavCooldowns[id];
    }
  });

  if (
    displayScore >= 50 &&
    gameNavParryUseCount <= 0
  ) {
    showGameNav(
      "parryTip",
      "normal",
      "…あ、ちなみにSpace押すとパリィだよー　無敵になりながら早く動けてお得！",
      240,
      5
    );
  }

  if (
    displayScore >= 100 &&
    gameNavParryUseCount <= 0
  ) {
    showGameNav(
      "parryChallenge",
      "wink",
      "なになにパリィ縛りー？　そういうプレイがお好きかにゃ？",
      210,
      4
    );
  }

  if (player.damage >= 2) {
    showGameNav(
      "danger",
      "surprised",
      "あと1回当たったら危ないよ！無理せず避けて！",
      210,
      4
    );
  }

  if (player.damage >= 1) {
    showGameNav(
      "firstDamage",
      "sad",
      "あー、当たっちゃった。無理せず避けてこ！",
      180,
      3
    );
  }

  if (clearCombo >= 50) {
    showGameNav(
      "combo50",
      "surprised",
      "50コンボぉ！？そこまでいけるんだ！？",
      210,
      5,
      {
        once: false,
        cooldown: 300
      }
    );
  } else if (clearCombo >= 30) {
    showGameNav(
      "combo30",
      "surprised",
      "30コンボ！それはちょっとやりすぎじゃない！？",
      210,
      4,
      {
        once: false,
        cooldown: 300
      }
    );
  } else if (clearCombo >= 10) {
    showGameNav(
      "combo10",
      "laugh",
      "おー！10コンボ達成！やりますなぁ",
      180,
      3,
      {
        once: false,
        cooldown: 300
      }
    );
  }

  if (parryCount >= MAX_PARRY) {
    showGameNav(
      "stakeReady",
      "wink",
      "チャージ完了！Xで超電磁杭だよ！",
      180,
      4,
      {
        once: false,
        cooldown: 300
      }
    );
  }
}

function showGameNav(id, face, text, frames = GAME_NAV_DEFAULT_FRAMES, priority = 1, options = {}) {

  const once = options.once ?? true;
  const cooldown = options.cooldown ?? 0;

  if (once && gameNavFlags[id]) return false;
  if (!once && gameNavCooldowns[id] > 0) return false;

  if (!setGameNavMessage(face, text, frames, priority)) {
    return false;
  }

  if (once) {
    gameNavFlags[id] = true;
  } else if (cooldown > 0) {
    gameNavCooldowns[id] = cooldown;
  }

  return true;
}

function markGameNavParryUsed() {

  if (gameState !== "playing") return;

  gameNavParryUseCount++;
}

function setGameNavMessage(face, text, frames, priority) {

  if (
    gameNavMessage &&
    gameNavTimer > 0 &&
    priority < gameNavPriority
  ) {
    return false;
  }

  gameNavMessage = {
    face,
    text
  };
  gameNavTimer = frames;
  gameNavPriority = priority;

  return true;
}

function drawGameNav() {

  dialogueCtx.clearRect(
    0,
    0,
    dialogueCanvas.width,
    dialogueCanvas.height
  );

  if (!gameNavMessage || gameNavTimer <= 0) return;

  dialogueCtx.save();
  drawDialoguePanel();

  const icon =
    gameNavFaces[gameNavMessage.face] ||
    gameNavFaces.normal;

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
    gameNavMessage.text,
    122,
    52,
    dialogueCanvas.width - 150,
    25
  );

  dialogueCtx.restore();
}
