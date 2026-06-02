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
let gameNavGameOverShown = false;
let gameNavIdleTalkTimer = 0;
let gameNavStakeReadyShown = false;

const GAME_NAV_DEFAULT_FRAMES = 180;
const GAME_NAV_IDLE_TALK_START_SCORE = 120;
const GAME_NAV_IDLE_TALK_MIN_FRAMES = 360;
const GAME_NAV_IDLE_TALK_RANDOM_FRAMES = 240;
const gameNavFlags = {};
const gameNavCooldowns = {};

function resetGameNav() {

  gameNavMessage = null;
  gameNavTimer = 0;
  gameNavPriority = 0;
  gameNavParryUseCount = 0;
  gameNavGameOverShown = false;
  gameNavIdleTalkTimer = nextGameNavIdleTalkFrames();
  gameNavStakeReadyShown = false;

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

  if (gameOver) {
    showGameNavGameOver();
    return;
  }

  gameNavGameOverShown = false;

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

  if (displayScore >= 600) {
    showGameNav(
      "score600",
      "surprised",
      pickGameNavLine([
        "スコア600突破！？すごい、かなり遠くまで来てるよ！",
        "ここまで来たらもう上級者じゃん！集中切らさないで！",
        "スコア600超え！いい波乗ってんねぇ！"
      ]),
      210,
      5
    );
  } else if (displayScore >= 300) {
    showGameNav(
      "score300",
      "laugh",
      pickGameNavLine([
        "スコア300突破！いいペースだよ！",
        "ここまで来たね！その調子で伸ばしてこ！",
        "スコア300超え！だいぶ滑れてきたじゃん！"
      ]),
      200,
      4
    );
  }

  if (player.damage >= 2) {
    showGameNav(
      "danger",
      "surprised",
      pickGameNavLine([
        "あと1回当たったら危ないよ！無理せず避けて！",
        "ちょっと危ないかも。無理しすぎ注意ね",
        "深呼吸、深呼吸。まだ立て直せるよ"
      ]),
      210,
      6
    );
  }

  if (player.damage >= 1) {
    showGameNav(
      "firstDamage",
      "sad",
      pickGameNavLine([
        "あー、当たっちゃった。無理せず避けてこ！",
        "大丈夫、まだいける！次は避けよ！",
        "一発もらったね。落ち着いて立て直そ！"
      ]),
      180,
      5
    );
  }

  if (clearCombo >= 50) {
    showGameNav(
      "combo50",
      "surprised",
      pickGameNavLine([
        "50コンボぉ！？そこまでいけるんだ！？",
        "50コンボ！？ちょっと本気出しすぎじゃない！？",
        "すごっ、50コンボ！そのまま突っ走れー！"
      ]),
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
      pickGameNavLine([
        "30コンボ！それはちょっとやりすぎじゃない！？",
        "30コンボ到達！いい感じに乗ってるね！",
        "そこまでつなぐ！？やるじゃん！"
      ]),
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
      pickGameNavLine([
        "おー！10コンボ達成！やりますなぁ",
        "10コンボ！いい流れきてるよ！",
        "よしよし、つながってる！その調子！"
      ]),
      180,
      3,
      {
        once: false,
        cooldown: 300
      }
    );
  }

  if (parryCount < MAX_PARRY) {
    gameNavStakeReadyShown = false;
  }

  if (
    parryCount >= MAX_PARRY &&
    !gameNavStakeReadyShown
  ) {
    if (showGameNav(
      "stakeReady",
      "wink",
      pickGameNavLine([
        "チャージ完了！Xで超電磁杭だよ！",
        "バリバリ来てるねぇ！Xでぶっ放そ！",
        "今なら撃てるよ！超電磁杭、いっちゃえ！"
      ]),
      180,
      4,
      {
        once: false,
        cooldown: 0
      }
    )) {
      gameNavStakeReadyShown = true;
    }
  }

  updateGameNavIdleTalk(displayScore);
}

function showGameNavGameOver() {

  if (gameNavGameOverShown) return;

  const displayScore = Math.floor(score / SCORE_DISPLAY_SCALE);
  let face = "sad";
  let lines = [
    "ここまでだね…でも、次はいけるよ！",
    "大丈夫、もう一回いこ！",
    "うわっ……今のは痛かったね、大丈夫？"
  ];

  if (displayScore >= 600) {
    face = "surprised";
    lines = [
      "600超えてそこまで！？すごい記録だよ！",
      "ここまで行けたなら胸張っていいって！次はもっと先だね！",
      "かなり走り切ったね…今の、ほんとに見応えあったよ！"
    ];
  } else if (displayScore >= 300) {
    face = "wink";
    lines = [
      "300超えでそこまで行けたね！次はもっと伸ばそ！",
      "いい走りだったよ！今の感覚、忘れないでね！",
      "惜しかったけど、かなり進めてたよ！もう一回いこ！"
    ];
  }

  showGameNav(
    "gameOver",
    face,
    pickGameNavLine(lines),
    240,
    10
  );

  gameNavGameOverShown = true;
}

function updateGameNavIdleTalk(displayScore) {

  if (displayScore < GAME_NAV_IDLE_TALK_START_SCORE) return;

  gameNavIdleTalkTimer--;

  if (gameNavIdleTalkTimer > 0) return;

  const line = pickGameNavLine([
    {
      face: "normal",
      text: "いい感じ、いい感じ。そのまま滑ってこ！"
    },
    {
      face: "wink",
      text: "無理に突っ込まなくていいよー。安全第一！"
    },
    {
      face: "laugh",
      text: "その調子その調子。わたしの解説がいいからかな？"
    },
    {
      face: "sad",
      text: "最近ねー、ネイル変えてみてさ…　ってタチカゲ聞いてる？"
    },
    {
      face: "surprised",
      text: "…あ、そういや今日のボイトレ忘れたわ"
    },
    {
      face: "laugh",
      text: "いやー、見てる分にはおもろいんだけど…タチカゲ君は大変そうですなぁ"
    }
  ]);

  if (showGameNav(
    "idleTalk",
    line.face,
    line.text,
    180,
    1,
    {
      once: false,
      cooldown: GAME_NAV_IDLE_TALK_MIN_FRAMES
    }
  )) {
    gameNavIdleTalkTimer = nextGameNavIdleTalkFrames();
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

function pickGameNavLine(lines) {

  return lines[
    Math.floor(Math.random() * lines.length)
  ];
}

function nextGameNavIdleTalkFrames() {

  return GAME_NAV_IDLE_TALK_MIN_FRAMES +
    Math.floor(Math.random() * GAME_NAV_IDLE_TALK_RANDOM_FRAMES);
}

function markGameNavParryUsed() {

  if (gameState !== "playing") return;

  gameNavParryUseCount++;
}

function setGameNavMessage(face, text, frames, priority) {

  if (
    gameNavMessage &&
    gameNavTimer > 0 &&
    priority <= gameNavPriority
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
