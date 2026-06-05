// ====================
// Boss Movement
// ====================

const BOSS_FLOAT_AMPLITUDE = 200;
const BOSS_FLOAT_SPEED = 0.025;
const BOSS_RANDOM_MOVE_LIFE = 2;
const BOSS_RANDOM_MOVE_COUNT = 3;
const BOSS_RANDOM_MOVE_SHORT_STOP_FRAMES = 10;
const BOSS_RANDOM_MOVE_STOP_FRAMES = 30;
const BOSS_WARP_EFFECT_FRAMES = 14;

function getBossBodyY() {
  return boss.body.y + boss.floatOffsetY;
}

function getBossWeakY() {
  return boss.weak.y + boss.floatOffsetY;
}

function getRandomBossFloatOffsetY() {
  return (Math.random() * 2 - 1) * BOSS_FLOAT_AMPLITUDE;
}

function startBossWarpEffect(fromOffsetY, toOffsetY) {
  boss.warpTimer = BOSS_WARP_EFFECT_FRAMES;
  boss.warpFromOffsetY = fromOffsetY;
  boss.warpToOffsetY = toOffsetY;
}

function updateBossRandomMovement() {

  if (boss.randomMoveStopTimer > 0) {
    boss.randomMoveStopTimer--;
    return;
  }

  if (boss.randomMoveCount >= BOSS_RANDOM_MOVE_COUNT) {
    boss.randomMoveCount = 0;
    boss.randomMoveStopTimer = BOSS_RANDOM_MOVE_STOP_FRAMES;
    return;
  }

  const fromOffsetY = boss.floatOffsetY;
  boss.floatOffsetY = getRandomBossFloatOffsetY();
  startBossWarpEffect(fromOffsetY, boss.floatOffsetY);
  boss.randomMoveCount++;

  if (boss.randomMoveCount < BOSS_RANDOM_MOVE_COUNT) {
    boss.randomMoveStopTimer = BOSS_RANDOM_MOVE_SHORT_STOP_FRAMES;
  }
}

function updateBossMovement() {

  if (boss.warpTimer > 0) {
    boss.warpTimer--;
  }

  if (boss.life <= BOSS_RANDOM_MOVE_LIFE) {
    updateBossRandomMovement();
    return;
  }

  boss.floatTimer++;
  boss.floatOffsetY =
    Math.sin(boss.floatTimer * BOSS_FLOAT_SPEED) *
    BOSS_FLOAT_AMPLITUDE;
}
