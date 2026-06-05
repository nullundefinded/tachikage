// ====================
// Boss
// ====================

const bossImages = {
  ufo: loadImage("boss.ufo", "images/UFO.png"),
  stand: loadImage("boss.gulu.stand", "images/gulu_balad_stand.png")
};

const BOSS_BODY_GUARD_FRAMES = 18;
const BOSS_WEAK_HIT_FRAMES = 12;
const BOSS_PARRY_BULLET_INTERVAL = 80;
const BOSS_PARRY_BULLET_START_DELAY = 45;
const BOSS_PARRY_BULLET_SPEED = 2.8;
const BOSS_PARRY_BULLET_MAX = 2;
const BOSS_MAX_LIFE = 5;

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
  weakHitTimer: 0,
  life: BOSS_MAX_LIFE,
  floatTimer: 0,
  floatOffsetY: 0,
  randomMoveStopTimer: 0,
  randomMoveCount: 0,
  warpTimer: 0,
  warpFromOffsetY: 0,
  warpToOffsetY: 0,
  parryBulletTimer: BOSS_PARRY_BULLET_START_DELAY
};

function resetBoss() {
  boss.bodyGuardTimer = 0;
  boss.bodyGuardImpactX = 0;
  boss.bodyGuardImpactY = 0;
  boss.bodyGuardSide = 1;
  boss.weakHitTimer = 0;
  boss.life = BOSS_MAX_LIFE;
  boss.floatTimer = 0;
  boss.floatOffsetY = 0;
  boss.randomMoveStopTimer = 0;
  boss.randomMoveCount = 0;
  boss.warpTimer = 0;
  boss.warpFromOffsetY = 0;
  boss.warpToOffsetY = 0;
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
    x: boss.weak.x + boss.weak.hitBox.offsetX,
    y: getBossWeakY() + boss.weak.hitBox.offsetY,
    w: boss.weak.hitBox.w,
    h: boss.weak.hitBox.h
  };
}

function countBossParryBullets() {
  return bullets.filter(b => b.bossParry).length;
}

function spawnBossParryBullet() {

  const bulletH = 42;
  const targetY = player.y + player.h / 2 - bulletH / 2;

  bullets.push({
    x: boss.body.x + 28,
    y: Math.max(18, Math.min(targetY, canvas.height - bulletH - 18)),
    w: 48,
    h: bulletH,
    speed: BOSS_PARRY_BULLET_SPEED,
    bossParry: true
  });
}

function updateBossParryBullets() {

  if (boss.parryBulletTimer > 0) {
    boss.parryBulletTimer--;
    return;
  }

  if (countBossParryBullets() < BOSS_PARRY_BULLET_MAX) {
    spawnBossParryBullet();
  }

  boss.parryBulletTimer = BOSS_PARRY_BULLET_INTERVAL;
}

function updateBossEnemy() {

  updateBossMovement();
  updateBossParryBullets();

  if (boss.bodyGuardTimer > 0) {
    boss.bodyGuardTimer--;
  }

  if (boss.weakHitTimer > 0) {
    boss.weakHitTimer--;
  }

  const bodyBox = getBossBodyBox();
  const weakBox = getBossWeakBox();

  stakes.forEach(stake => {

    if (!stake.bossWeakHit && hit(stake, weakBox)) {
      boss.weakHitTimer = BOSS_WEAK_HIT_FRAMES;
      boss.life = Math.max(0, boss.life - 1);
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
