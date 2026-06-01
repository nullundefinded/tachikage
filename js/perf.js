// ====================
// Performance Monitor
// ====================

const PERF_ENABLED = new URLSearchParams(location.search).has("perf");

const perf = {
  fps: 0,
  avgFps: 0,
  minFps: 0,
  frameMs: 0,
  updateMs: 0,
  drawMs: 0,
  lastFrameTime: 0,
  fpsSamples: [],
  counts: {
    bullets: 0,
    enemyBullets: 0,
    playerBullets: 0,
    enemies: 0,
    effects: 0
  }
};

function perfBeginFrame() {

  if (!PERF_ENABLED) return;

  const now = performance.now();

  if (perf.lastFrameTime > 0) {
    perf.frameMs = now - perf.lastFrameTime;
    perf.fps = perf.frameMs > 0 ? 1000 / perf.frameMs : 0;
    perf.fpsSamples.push(perf.fps);

    if (perf.fpsSamples.length > 60) {
      perf.fpsSamples.shift();
    }

    const fpsTotal = perf.fpsSamples.reduce((sum, fps) => sum + fps, 0);
    perf.avgFps = fpsTotal / perf.fpsSamples.length;
    perf.minFps = Math.min(...perf.fpsSamples);
  }

  perf.lastFrameTime = now;
}

function perfMeasureUpdate(fn) {

  if (!PERF_ENABLED) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  perf.updateMs = performance.now() - start;
}

function perfMeasureDraw(fn) {

  if (!PERF_ENABLED) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  perf.drawMs = performance.now() - start;
}

function perfSetCounts(counts) {

  if (!PERF_ENABLED) return;

  perf.counts = {
    ...perf.counts,
    ...counts
  };
}

function perfDrawOverlay() {

  if (!PERF_ENABLED) return;

  const x = canvas.width - 190;
  const y = 12;
  const lineH = 16;
  const lines = [
    `FPS ${perf.avgFps.toFixed(1)} (${perf.fps.toFixed(1)})`,
    `MIN ${perf.minFps.toFixed(1)}`,
    `FRAME ${perf.frameMs.toFixed(2)} ms`,
    `UPDATE ${perf.updateMs.toFixed(2)} ms`,
    `DRAW ${perf.drawMs.toFixed(2)} ms`,
    `BULLETS ${perf.counts.bullets}`,
    `ENEMY BULLETS ${perf.counts.enemyBullets}`,
    `PLAYER BULLETS ${perf.counts.playerBullets}`,
    `ENEMIES ${perf.counts.enemies}`,
    `EFFECTS ${perf.counts.effects}`
  ];

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(x - 10, y - 8, 180, lines.length * lineH + 12);

  ctx.strokeStyle = "rgba(80,240,255,0.7)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 10, y - 8, 180, lines.length * lineH + 12);

  ctx.fillStyle = "rgba(200,255,255,0.95)";
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineH);
  });

  ctx.restore();
}
