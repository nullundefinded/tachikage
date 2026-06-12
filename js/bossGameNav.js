// ====================
// Boss Game Navigator
// ====================

let bossGameNavBodyHitCount = 0;
let bossGameNavWeakAfterBodyHitShown = false;

function resetBossGameNav() {

  bossGameNavBodyHitCount = 0;
  bossGameNavWeakAfterBodyHitShown = false;
}

function notifyBossGameNavBodyGuardHit() {

  if (gameState !== "boss") return;
  if (boss.life !== BOSS_MAX_LIFE) return;

  bossGameNavBodyHitCount++;

  if (bossGameNavBodyHitCount === 1) {
    showGameNav(
      "bossBodyGuardFirst",
      "surprised",
      "嘘、効いてない…！？",
      150,
      10
    );
  } else if (bossGameNavBodyHitCount === 2) {
    showGameNav(
      "bossBodyGuardSecond",
      "surprised",
      "やっぱり効かないみたい！？どこか狙える場所は…",
      180,
      10
    );
  }
}

function notifyBossGameNavWeakHit() {

  if (gameState !== "boss") return;
  if (bossGameNavBodyHitCount <= 0) return;
  if (bossGameNavWeakAfterBodyHitShown) return;

  if (showGameNav(
    "bossWeakAfterBodyGuard",
    "laugh",
    "そっか、足場なら避けれないよね！タチカゲ冴えてるぅ！",
    180,
    10
  )) {
    bossGameNavWeakAfterBodyHitShown = true;
  }
}

function updateBossGameNav() {

  if (gameState !== "boss") return;

  updateGameNavTimers();

  if (typeof isBossClear === "function" && isBossClear()) return;
  if (typeof isBossIntroActive === "function" && isBossIntroActive()) return;

  if (gameOver) {
    showBossGameNavGameOver();
    return;
  }

  if (boss.chargePhase === "windup") {
    showGameNav(
      "bossChargeWarning",
      "surprised",
      "突進来る！ 上か下に逃げて！",
      70,
      9,
      {
        once: false,
        cooldown: 45
      }
    );
    return;
  }

  if (boss.hiddenRaikanLaughTimer > 0) {
    showGameNav(
      "bossHiddenRaikanWarning",
      "surprised",
      "笑ってる……なんかやばいかも！",
      90,
      8,
      {
        once: false,
        cooldown: 90
      }
    );
    return;
  }

  if (boss.life <= 2) {
    showGameNav(
      "bossLife2",
      "surprised",
      "動きが荒くなってる。突進の構えを見逃さないで！",
      180,
      5
    );
  } else if (boss.life <= 3) {
    showGameNav(
      "bossLife3",
      "wink",
      "変な気配……まずい攻撃が来るかも！",
      180,
      5
    );
  } else if (boss.life <= 4) {
    showGameNav(
      "bossLife4",
      "normal",
      "攻撃のリズムが変わったよ。波状弾に注意！",
      180,
      5
    );
  } else {
    showGameNav(
      "bossStart",
      "normal",
      "バラッド・ラミーガネ…　あーしたちの…　貴方の敵だよ",
      180,
      4
    );
  }
}

function showBossGameNavGameOver() {

  if (gameNavGameOverShown) return;

  const storyUnlockNotice =
    typeof consumeStoryUnlockNoticeText === "function"
      ? consumeStoryUnlockNoticeText()
      : "";

  if (storyUnlockNotice) {
    showGameNav(
      "bossGameOver",
      "sad",
      storyUnlockNotice,
      240,
      10
    );

    gameNavGameOverShown = true;
    return;
  }

  showGameNav(
    "bossGameOver",
    "sad",
    "タチカゲ！？タチカゲーッ！！！",
    240,
    10
  );

  gameNavGameOverShown = true;
}
