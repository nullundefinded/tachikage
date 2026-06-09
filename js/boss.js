// ====================
// Boss
// ====================

const bossImages = {
  ufo: loadImage("boss.ufo", "images/UFO.png"),
  stand: loadImage("boss.gulu.stand", "images/gulu_balad_stand.png"),
  attack: loadImage("boss.gulu.attack", "images/gulu_balad_attack.png"),
  charge: loadImage("boss.gulu.charge", "images/gulu_balad_attack_2.png"),
  win: loadImage("boss.gulu.win", "images/gulu_balad_win.png"),
  lose: loadImage("boss.gulu.lose", "images/gulu_balad_lose.png"),
  raikan: loadImage("boss.raikan", "images/raikan.png"),
  weakExplosion: loadImage(
    "boss.weak.explosion",
    "images/effects/ufo_explosion_sheet.png"
  )
};

const BOSS_BODY_GUARD_FRAMES = 18;
const BOSS_WEAK_HIT_FRAMES = 60;
const BOSS_PARRY_BULLET_INTERVAL = 80;
const BOSS_PARRY_BULLET_START_DELAY = 45;
const BOSS_PARRY_BULLET_SPEED = 6;
const BOSS_PARRY_BULLET_COUNT = 9;
const BOSS_PARRY_BULLET_SPREAD_ANGLE = Math.PI / 3;
const BOSS_ATTACK_PATTERN_COUNT = 4;
const BOSS_WAVE_ATTACK_COUNT = 3;
const BOSS_WAVE_ATTACK_BULLET_COUNT = 3;
const BOSS_WAVE_ATTACK_DELAY = 28;
const BOSS_HIDDEN_RAIKAN_LAUGH_FRAMES = 30;
const BOSS_CHARGE_UFO_RETREAT_SPEED = 8;
const BOSS_CHARGE_UFO_RETURN_SPEED = 6;
const BOSS_CHARGE_UFO_HOLD_FRAMES = 30;
const BOSS_CHARGE_BODY_SPEED = 14;
const BOSS_CHARGE_BODY_RETURN_SPEED = 10;
const BOSS_CHARGE_BODY_RIGHT_MARGIN = 60;
const BOSS_CHARGE_BODY_DRAW_SCALE = 1.15;
const BOSS_CHARGE_TARGET_MARGIN_Y = 18;
const BOSS_CHARGE_HIT_OFFSET_X = -50;
const BOSS_CHARGE_HIT_OFFSET_Y = 58;
const BOSS_CHARGE_HIT_W = 235;
const BOSS_CHARGE_HIT_H = 112;
const BOSS_RAIKAN_BULLET_SPEED = 5.4;
const BOSS_RAIKAN_BULLET_W = 42;
const BOSS_RAIKAN_BULLET_H = 112;
const BOSS_RAIKAN_HIT_W = 28;
const BOSS_RAIKAN_HIT_H = 78;
const BOSS_RAIKAN_ROTATION_SPEED = 0.2;
const BOSS_ATTACK_IMAGE_FRAMES = 36;
const BOSS_MAX_LIFE = 5;
const BOSS_INTRO_UFO_START_OFFSET_Y = -360;
const BOSS_INTRO_BODY_START_OFFSET_Y = -420;
const BOSS_INTRO_UFO_DESCEND_FRAMES = 90;
const BOSS_INTRO_BODY_DESCEND_FRAMES = 56;
const BOSS_INTRO_READY_FRAMES = 64;
const BOSS_DEFEAT_FALL_START_SPEED = 1.8;
const BOSS_DEFEAT_FALL_ACCEL = 0.22;
const BOSS_DEFEAT_CLEAR_MARGIN = 30;
const BOSS_DEFEAT_UFO_RISE_SPEED = 1.15;
const BOSS_DEFEAT_UFO_TOP_Y = 100;
const BOSS_DEFEAT_EXPLOSION_INTERVAL = 8;
const BOSS_DEFEAT_EXPLOSION_COUNT = 3;
const BOSS_WEAK_EXPLOSION_FRAME_COUNT = 10;
const BOSS_WEAK_EXPLOSION_FRAME_W = 96;
const BOSS_WEAK_EXPLOSION_FRAME_H = 96;
const BOSS_WEAK_EXPLOSION_MIN_COUNT = 8;
const BOSS_WEAK_EXPLOSION_MAX_COUNT = 12;
const BOSS_WEAK_EXPLOSION_IMPACT_COUNT = 2;

const boss = {
  body: {
    x: 550,
    y: 75,
    w: 230,
    h: 230,
    hitBox: {
      offsetX: 42,
      offsetY: 32,
      w: 146,
      h: 142
    }
  },
  weak: {
    x: 590,
    y: 232,
    w: 170,
    hitBox: {
      offsetX: 26,
      offsetY: 31,
      w: 118,
      h: 44
    }
  },
  bodyGuardTimer: 0,
  bodyGuardImpactX: 0,
  bodyGuardImpactY: 0,
  bodyGuardSide: 1,
  attackTimer: 0,
  weakHitTimer: 0,
  life: BOSS_MAX_LIFE,
  floatTimer: 0,
  floatOffsetY: 0,
  randomMoveStopTimer: 0,
  randomMoveCount: 0,
  warpTimer: 0,
  warpFromOffsetY: 0,
  warpToOffsetY: 0,
  introPhase: "none",
  introTimer: 0,
  introUfoOffsetY: 0,
  introBodyOffsetY: 0,
  weakExplosions: [],
  defeatPhase: "none",
  defeatFallY: 0,
  defeatFallSpeed: 0,
  defeatUfoY: 0,
  defeatExplosionTimer: 0,
  waveAttackTimer: 0,
  waveAttackRemaining: 0,
  waveAttackShot: 0,
  waveAttackRaikanShot: 0,
  hiddenRaikanLaughTimer: 0,
  chargePhase: "none",
  chargeTimer: 0,
  chargeX: 0,
  chargeTargetOffsetY: 0,
  chargeBodyOffsetX: 0,
  chargeBodyOffsetY: 0,
  chargeBodyVx: 0,
  chargeBodyVy: 0,
  chargeUfoOffsetY: 0,
  raikanBullets: [],
  parryBulletTimer: BOSS_PARRY_BULLET_START_DELAY
};

function resetBoss() {
  boss.bodyGuardTimer = 0;
  boss.bodyGuardImpactX = 0;
  boss.bodyGuardImpactY = 0;
  boss.bodyGuardSide = 1;
  boss.attackTimer = 0;
  boss.weakHitTimer = 0;
  boss.life = BOSS_MAX_LIFE;
  boss.floatTimer = 0;
  boss.floatOffsetY = 0;
  boss.randomMoveStopTimer = 0;
  boss.randomMoveCount = 0;
  boss.warpTimer = 0;
  boss.warpFromOffsetY = 0;
  boss.warpToOffsetY = 0;
  boss.introPhase = "ufoIn";
  boss.introTimer = 0;
  boss.introUfoOffsetY = BOSS_INTRO_UFO_START_OFFSET_Y;
  boss.introBodyOffsetY = BOSS_INTRO_BODY_START_OFFSET_Y;
  boss.weakExplosions = [];
  boss.defeatPhase = "none";
  boss.defeatFallY = 0;
  boss.defeatFallSpeed = 0;
  boss.defeatUfoY = 0;
  boss.defeatExplosionTimer = 0;
  boss.waveAttackTimer = 0;
  boss.waveAttackRemaining = 0;
  boss.waveAttackShot = 0;
  boss.waveAttackRaikanShot = 0;
  boss.hiddenRaikanLaughTimer = 0;
  boss.chargePhase = "none";
  boss.chargeTimer = 0;
  boss.chargeX = 0;
  boss.chargeTargetOffsetY = 0;
  boss.chargeBodyOffsetX = 0;
  boss.chargeBodyOffsetY = 0;
  boss.chargeBodyVx = 0;
  boss.chargeBodyVy = 0;
  boss.chargeUfoOffsetY = 0;
  boss.raikanBullets = [];
  boss.parryBulletTimer = BOSS_PARRY_BULLET_START_DELAY;
}

function getBossBodyBox() {
  return {
    x: boss.body.x + boss.body.hitBox.offsetX,
    y: getBossBodyY() + boss.body.hitBox.offsetY,
    w: boss.body.hitBox.w,
    h: boss.body.hitBox.h
  };
}

function getBossWeakBox() {
  return {
    x:
      boss.weak.x +
      (
        boss.chargePhase === "bodyReturn"
          ? boss.chargeBodyOffsetX
          : 0
      ) +
      boss.weak.hitBox.offsetX,
    y:
      getBossWeakY() +
      (
        boss.chargePhase === "bodyReturn"
          ? boss.chargeBodyOffsetY
          : boss.chargeUfoOffsetY
      ) +
      boss.weak.hitBox.offsetY,
    w: boss.weak.hitBox.w,
    h: boss.weak.hitBox.h
  };
}

function getBossWeakDrawBox() {

  const ufoH =
    imageReady(bossImages.ufo)
      ? boss.weak.w * bossImages.ufo.naturalHeight / bossImages.ufo.naturalWidth
      : 114;

  return {
    x:
      boss.weak.x +
      (
        boss.chargePhase === "bodyReturn"
          ? boss.chargeBodyOffsetX
          : 0
      ),
    y:
      getBossWeakY() +
      boss.introUfoOffsetY +
      boss.defeatUfoY +
      (
        boss.chargePhase === "bodyReturn"
          ? boss.chargeBodyOffsetY
          : boss.chargeUfoOffsetY
      ),
    w: boss.weak.w,
    h: ufoH
  };
}

function easeBossIntro(t) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(t, 1)), 3);
}

function isBossIntroActive() {
  return (
    boss.introPhase !== "none" &&
    boss.introPhase !== "done"
  );
}

function updateBossIntro() {

  if (boss.introPhase === "done") return;

  boss.introTimer++;

  if (boss.introPhase === "ufoIn") {
    const t = easeBossIntro(
      boss.introTimer / BOSS_INTRO_UFO_DESCEND_FRAMES
    );

    boss.introUfoOffsetY = BOSS_INTRO_UFO_START_OFFSET_Y * (1 - t);
    boss.introBodyOffsetY = BOSS_INTRO_BODY_START_OFFSET_Y;

    if (boss.introTimer >= BOSS_INTRO_UFO_DESCEND_FRAMES) {
      boss.introPhase = "bodyIn";
      boss.introTimer = 0;
      boss.introUfoOffsetY = 0;
    }

    return;
  }

  if (boss.introPhase === "bodyIn") {
    const t = easeBossIntro(
      boss.introTimer / BOSS_INTRO_BODY_DESCEND_FRAMES
    );

    boss.introBodyOffsetY = BOSS_INTRO_BODY_START_OFFSET_Y * (1 - t);

    if (boss.introTimer >= BOSS_INTRO_BODY_DESCEND_FRAMES) {
      boss.introPhase = "ready";
      boss.introTimer = 0;
      boss.introBodyOffsetY = 0;
    }

    return;
  }

  if (boss.introPhase === "ready") {
    boss.introUfoOffsetY = 0;
    boss.introBodyOffsetY = 0;

    if (boss.introTimer >= BOSS_INTRO_READY_FRAMES) {
      boss.introPhase = "done";
      boss.introTimer = 0;
      boss.parryBulletTimer = BOSS_PARRY_BULLET_START_DELAY;
    }
  }
}

function isBossDefeated() {
  return boss.defeatPhase !== "none";
}

function isBossClear() {
  return boss.defeatPhase === "clear";
}

function startBossDefeat() {

  if (isBossDefeated()) return;

  boss.defeatPhase = "ufoRise";
  boss.defeatFallY = 0;
  boss.defeatFallSpeed = 0;
  boss.defeatUfoY = 0;
  boss.defeatExplosionTimer = 0;
  boss.attackTimer = 0;
  boss.bodyGuardTimer = 0;
  boss.weakHitTimer = 0;
  boss.warpTimer = 0;
  boss.waveAttackTimer = 0;
  boss.waveAttackRemaining = 0;
  boss.waveAttackShot = 0;
  boss.waveAttackRaikanShot = 0;
  boss.hiddenRaikanLaughTimer = 0;
  boss.chargePhase = "none";
  boss.chargeTimer = 0;
  boss.chargeX = 0;
  boss.chargeTargetOffsetY = 0;
  boss.chargeBodyOffsetX = 0;
  boss.chargeBodyOffsetY = 0;
  boss.chargeBodyVx = 0;
  boss.chargeBodyVy = 0;
  boss.chargeUfoOffsetY = 0;
  boss.raikanBullets = [];
  bullets = bullets.filter(b => !b.bossParry);
}

function updateBossDefeat() {

  if (boss.defeatPhase === "ufoRise") {
    const weakDrawBox = getBossWeakDrawBox();
    const isUfoRising = weakDrawBox.y > BOSS_DEFEAT_UFO_TOP_Y;

    if (isUfoRising) {
      boss.defeatUfoY -= BOSS_DEFEAT_UFO_RISE_SPEED;
    } else {
      boss.defeatPhase = "fall";
      boss.defeatFallSpeed = BOSS_DEFEAT_FALL_START_SPEED;
      boss.defeatExplosionTimer = 0;
      return;
    }

    if (boss.defeatExplosionTimer > 0) {
      boss.defeatExplosionTimer--;
    } else {
      addBossDefeatUfoExplosions();
      boss.defeatExplosionTimer = BOSS_DEFEAT_EXPLOSION_INTERVAL;
    }

    return;
  }

  if (boss.defeatPhase !== "fall") return;

  boss.defeatFallSpeed += BOSS_DEFEAT_FALL_ACCEL;
  boss.defeatFallY += boss.defeatFallSpeed;

  if (
    getBossBodyY() + boss.defeatFallY >
    canvas.height + BOSS_DEFEAT_CLEAR_MARGIN
  ) {
    boss.defeatPhase = "clear";
  }
}

function addBossWeakExplosion(stake) {

  const weakBox = getBossWeakBox();
  const drawBox = getBossWeakDrawBox();
  const impactX = stake
    ? Math.max(weakBox.x, Math.min(stake.x + stake.w / 2, weakBox.x + weakBox.w))
    : weakBox.x + weakBox.w / 2;
  const impactY = stake
    ? Math.max(weakBox.y, Math.min(stake.y + stake.h / 2, weakBox.y + weakBox.h))
    : weakBox.y + weakBox.h / 2;
  const count =
    BOSS_WEAK_EXPLOSION_MIN_COUNT +
    Math.floor(
      Math.random() *
      (BOSS_WEAK_EXPLOSION_MAX_COUNT - BOSS_WEAK_EXPLOSION_MIN_COUNT + 1)
    );

  for (let i = 0; i < count; i++) {

    const isImpactExplosion = i < BOSS_WEAK_EXPLOSION_IMPACT_COUNT;
    const x = isImpactExplosion
      ? impactX + (Math.random() - 0.5) * weakBox.w * 0.42
      : drawBox.x + drawBox.w * (0.12 + Math.random() * 0.76);
    const y = isImpactExplosion
      ? impactY + (Math.random() - 0.5) * weakBox.h * 0.72
      : drawBox.y + drawBox.h * (0.16 + Math.random() * 0.68);

    boss.weakExplosions.push({
      x,
      y,
      scale: 0.78 + Math.random() * 0.44,
      age: 0,
      delay: Math.floor(Math.random() * 7)
    });
  }
}

function addBossDefeatUfoExplosions() {

  const drawBox = getBossWeakDrawBox();

  for (let i = 0; i < BOSS_DEFEAT_EXPLOSION_COUNT; i++) {
    boss.weakExplosions.push({
      x: drawBox.x + drawBox.w * (0.12 + Math.random() * 0.76),
      y: drawBox.y + drawBox.h * (0.12 + Math.random() * 0.76),
      scale: 0.78 + Math.random() * 0.5,
      age: 0,
      delay: Math.floor(Math.random() * 5)
    });
  }
}

function updateBossWeakExplosions() {

  boss.weakExplosions.forEach(p => {
    p.age++;
  });

  boss.weakExplosions = boss.weakExplosions.filter(
    p => p.age - p.delay < BOSS_WEAK_EXPLOSION_FRAME_COUNT
  );
}

function updateBossEnemy() {

  updateBossWeakExplosions();
  updateBossRaikanBullets();

  if (isBossIntroActive()) {
    updateBossIntro();
    return;
  }

  if (isBossDefeated()) {
    updateBossDefeat();
    return;
  }

  if (boss.chargePhase === "none") {
    updateBossMovement();
  }

  updateBossParryBullets();

  if (boss.bodyGuardTimer > 0) {
    boss.bodyGuardTimer--;
  }

  if (boss.attackTimer > 0) {
    boss.attackTimer--;
  }

  if (boss.weakHitTimer > 0) {
    boss.weakHitTimer--;
  }

  const bodyBox = getBossBodyBox();
  const weakBox = getBossWeakBox();

  stakes.forEach(stake => {

    if (isBossDefeated()) return;

    if (!stake.bossWeakHit && hit(stake, weakBox)) {
      boss.weakHitTimer = BOSS_WEAK_HIT_FRAMES;
      boss.life = Math.max(0, boss.life - 1);
      addBossWeakExplosion(stake);
      if (boss.life <= 0) {
        startBossDefeat();
      }
      stake.bossWeakHit = true;
      return;
    }

    if (!stake.bossBodyGuarded && hit(stake, bodyBox)) {
      const impactX = stake.x + stake.w;
      const impactY = stake.y + stake.h / 2;

      boss.bodyGuardTimer = BOSS_BODY_GUARD_FRAMES;
      boss.bodyGuardImpactX = Math.max(
        bodyBox.x,
        Math.min(impactX, bodyBox.x + bodyBox.w)
      );
      boss.bodyGuardImpactY = Math.max(
        bodyBox.y,
        Math.min(impactY, bodyBox.y + bodyBox.h)
      );
      boss.bodyGuardSide =
        boss.bodyGuardImpactX < boss.body.x + boss.body.w / 2
          ? 1
          : -1;

      stake.bossBodyGuarded = true;
    }
  });
}
