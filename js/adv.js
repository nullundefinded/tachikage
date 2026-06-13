// ====================
// STORY / ADV
// ====================

const dialogueCanvas = document.getElementById("dialogue-ui");
const dialogueCtx = dialogueCanvas.getContext("2d");
const storyGameCanvas = document.getElementById("game");
const storyMaskCanvas = document.createElement("canvas");
const storyMaskCtx = storyMaskCanvas.getContext("2d");

const storyImages = {
  tachikage: {
    normal: loadImage("story.tachikage.normal", "images/tachikage_normal.png"),
    laugh: loadImage("story.tachikage.laugh", "images/tachikage_laugh.png")
  },
  sherry: {
    normal: loadImage("story.sherry.normal", "images/sherry_normal.png"),
    laugh: loadImage("story.sherry.laugh", "images/sherry_laugh.png"),
    smug: loadImage("story.sherry.smug", "images/sherry_smug.png")
  },
  nullun: {
    normal: loadImage("story.nullun.normal", "images/nullun.png")
  }
};

const storyForegroundImages = {
  neonCity: loadImage("story.foreground.neonCity", "images/neon_city.png")
};

const storyBackgroundImages = {
  ajito: loadImage("story.background.ajito", "images/ajito.png"),
  neonCityLower: loadImage("story.background.neonCityLower", "images/neon_city.png")
};

const storyMusicTracks = {
  thinkingReed: new Audio("images/music/a thinking reed.mp3"),
  hectopascal: new Audio("images/music/私の想いはヘクトパスカル.mp3")
};

const STORY_MUSIC_VOLUME_STORAGE_KEY = "tachikage.storyMusicVolume";
const STORY_MUSIC_DEFAULT_VOLUME = 0.35;
const STORY_MUSIC_VOLUME_CONTROL = {
  x: 18,
  y: 42,
  w: 132,
  h: 26,
  labelW: 36,
  trackW: 82
};

let storyLineIndex = 0;
let storyMode = "select";
let storyChapterIndex = 0;
let currentStoryLines = null;
let storyBackgroundKey = null;
let currentStoryMusicKey = null;
let storyMusicVolume = loadStoryMusicVolume();
let storyMusicVolumeDragging = false;

const STORY_CHARACTER_ENTER_FRAMES = 18;
const STORY_CHARACTER_SLIDE = 36;
const STORY_UNLOCK_STORAGE_PREFIX = "tachikage.story.";

const STORY_LINES = window.STORY_LINES || [
  {
    speaker: "System",
    character: "tachikage",
    face: "normal",
    text: "storyLines.jsが読み込めませんでした。"
  }
];

const STORY_CHAPTER_LINES = window.STORY_CHAPTER_LINES || {};
const STORY_ENDING_LINES = window.STORY_ENDING_LINES || {};

const STORY_CHAPTERS = [
  {
    id: "intro",
    title: "はじまり",
    unlockKey: null,
    lines: STORY_LINES
  },
  {
    id: "neonCity",
    title: "ネオンシティについて",
    unlockKey: "neonCity",
    lines: STORY_CHAPTER_LINES.neonCity || STORY_LINES
  },
  {
    id: "balad",
    title: "バラッドについて",
    unlockKey: "balad",
    lines: STORY_CHAPTER_LINES.balad || STORY_LINES
  },
  {
    id: "bossAdvice",
    title: "バラッド戦アドバイス",
    unlockKey: "bossAdvice",
    lines: STORY_CHAPTER_LINES.bossAdvice || STORY_LINES
  },
  {
    id: "ending",
    title: "エンディング",
    unlockKey: "ending",
    lines: STORY_ENDING_LINES.ending ||
      STORY_CHAPTER_LINES.ending ||
      STORY_LINES
  },
  {
    id: "epilogueExtra",
    title: "蛇足",
    unlockKey: "epilogueExtra",
    lines: STORY_ENDING_LINES.epilogueExtra ||
      STORY_CHAPTER_LINES.epilogueExtra ||
      STORY_LINES
  },
  {
    id: "afterword",
    title: "注釈・あとがき",
    unlockKey: "afterword",
    lines: STORY_ENDING_LINES.afterword ||
      STORY_CHAPTER_LINES.afterword ||
      STORY_LINES
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
  },
  nullun: {
    face: "normal",
    visible: false,
    animFrame: STORY_CHARACTER_ENTER_FRAMES
  }
};

let storyRightCharacter = "sherry";

function readStoryStorageValue(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStoryStorageValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage can be unavailable in some restricted browser modes.
  }
}

function loadStoryMusicVolume() {
  const saved = readStoryStorageValue(STORY_MUSIC_VOLUME_STORAGE_KEY);

  if (saved === null) return STORY_MUSIC_DEFAULT_VOLUME;

  const volume = Number(saved);

  if (!Number.isFinite(volume)) return STORY_MUSIC_DEFAULT_VOLUME;

  return Math.max(0, Math.min(1, volume));
}

function saveStoryMusicVolume() {
  writeStoryStorageValue(
    STORY_MUSIC_VOLUME_STORAGE_KEY,
    String(storyMusicVolume)
  );
}

function isStoryChapterUnlocked(chapter) {
  if (!chapter.unlockKey) return true;

  return readStoryStorageValue(
    STORY_UNLOCK_STORAGE_PREFIX + chapter.unlockKey
  ) === "1";
}

function unlockStoryChapter(id) {
  const chapter = STORY_CHAPTERS.find(item => item.id === id);

  if (!chapter || !chapter.unlockKey) return false;
  if (isStoryChapterUnlocked(chapter)) return false;

  writeStoryStorageValue(
    STORY_UNLOCK_STORAGE_PREFIX + chapter.unlockKey,
    "1"
  );

  return true;
}

function resetStoryCharacters() {

  Object.values(storyCharacterStates).forEach(state => {
    state.face = "normal";
    state.visible = false;
    state.animFrame = STORY_CHARACTER_ENTER_FRAMES;
  });

  storyRightCharacter = "sherry";
  storyBackgroundKey = null;
}

function resetStory() {

  stopStoryMusic();
  storyMode = "select";
  storyLineIndex = 0;
  currentStoryLines = STORY_LINES;
  resetStoryCharacters();
  drawDialogueUI("", "");
}

function startStoryChapter(chapter) {

  if (!isStoryChapterUnlocked(chapter)) return;

  storyMode = "play";
  storyLineIndex = 0;
  currentStoryLines = chapter.lines || STORY_LINES;
  resetStoryCharacters();

  applyStoryLine();
}

function advanceStoryLine() {

  storyLineIndex++;
  applyStoryLine();
}

function applyStoryLine() {

  const line = currentStoryLines[storyLineIndex];

  if (!line) return;

  if (line.hideCharacters) {
    resetStoryCharacters();
  }

  if (line.hideCharacter) {
    const state = storyCharacterStates[line.hideCharacter];

    if (state) {
      state.visible = false;
      state.animFrame = STORY_CHARACTER_ENTER_FRAMES;
    }
  }

  if (
    line.character === "sherry" ||
    line.character === "nullun"
  ) {
    storyRightCharacter = line.character;
  }

  if (line.background) {
    storyBackgroundKey = line.background;
  }

  if (line.music) {
    playStoryMusic(line.music);
  }

  const state = storyCharacterStates[line.character];

  if (!state) return;
  if (line.hideSpeaker) return;

  const nextFace = line.face || "normal";

  if (!state.visible || state.face !== nextFace) {
    state.face = nextFace;
    state.visible = true;
    state.animFrame = 0;
  }
}

function updateStory() {

  if (storyMode !== "play") return;

  Object.values(storyCharacterStates).forEach(state => {
    if (
      state.visible &&
      state.animFrame < STORY_CHARACTER_ENTER_FRAMES
    ) {
      state.animFrame++;
    }
  });
}

function isStorySelectActive() {
  return storyMode === "select";
}

function isStoryLastLine() {
  return storyLineIndex >= currentStoryLines.length - 1;
}

function getNextStoryChapterIndex(direction) {
  let nextIndex = storyChapterIndex;

  for (let i = 0; i < STORY_CHAPTERS.length; i++) {
    nextIndex =
      (nextIndex + direction + STORY_CHAPTERS.length) %
      STORY_CHAPTERS.length;

    if (isStoryChapterUnlocked(STORY_CHAPTERS[nextIndex])) {
      return nextIndex;
    }
  }

  return storyChapterIndex;
}

function handleStorySelectKey(e) {
  if (e.key === "Escape") {
    enterTitle();
    return true;
  }

  if (isControlKey(e, "up")) {
    storyChapterIndex = getNextStoryChapterIndex(-1);
    return true;
  }

  if (isControlKey(e, "down")) {
    storyChapterIndex = getNextStoryChapterIndex(1);
    return true;
  }

  if (e.key === "Enter") {
    startStoryChapter(STORY_CHAPTERS[storyChapterIndex]);
    return true;
  }

  return true;
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

function playStoryMusic(key) {

  if (currentStoryMusicKey === key) return;

  stopStoryMusic();

  const track = storyMusicTracks[key];

  if (!track) return;

  currentStoryMusicKey = key;
  track.currentTime = 0;
  track.volume = storyMusicVolume;
  track.play().catch(() => {
    currentStoryMusicKey = null;
  });
}

function stopStoryMusic() {

  if (!currentStoryMusicKey) return;

  const track = storyMusicTracks[currentStoryMusicKey];

  if (track) {
    track.pause();
    track.currentTime = 0;
  }

  currentStoryMusicKey = null;
}

function applyStoryMusicVolume() {
  Object.values(storyMusicTracks).forEach(track => {
    track.volume = storyMusicVolume;
  });
}

function setStoryMusicVolumeFromPoint(x) {
  const control = STORY_MUSIC_VOLUME_CONTROL;
  const trackX = control.x + control.labelW;
  const rate = (x - trackX) / control.trackW;

  storyMusicVolume = Math.max(0, Math.min(1, rate));
  applyStoryMusicVolume();
  saveStoryMusicVolume();
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

function drawStoryForeground(line) {

  if (!line || !line.foreground) return;

  const img = storyForegroundImages[line.foreground];

  if (!img || !imageReady(img)) return;

  ctx.save();
  ctx.globalAlpha = 0.96;
  ctx.drawImage(
    img,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();
}

function drawStoryImageCover(img) {

  const scale = Math.max(
    canvas.width / img.naturalWidth,
    canvas.height / img.naturalHeight
  );
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    w,
    h
  );
}

function drawStoryBackground() {

  const img = storyBackgroundImages[storyBackgroundKey];

  if (!img || !imageReady(img)) {
    drawBackground();
    return;
  }

  drawStoryImageCover(img);
}

function drawStoryScreenTone(line) {

  if (!line || !line.screenTone) return;

  ctx.save();

  ctx.fillStyle = line.screenTone === "white"
    ? `rgba(255,255,255,${line.screenToneAlpha ?? 0.72})`
    : `rgba(0,0,0,${line.screenToneAlpha ?? 0.72})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function drawStoryMusicVolumeControl() {

  if (!currentStoryMusicKey) return;

  const control = STORY_MUSIC_VOLUME_CONTROL;
  const trackX = control.x + control.labelW;
  const trackY = control.y + control.h / 2;
  const knobX = trackX + control.trackW * storyMusicVolume;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2;
  ctx.fillRect(control.x, control.y, control.w, control.h);
  ctx.strokeRect(control.x, control.y, control.w, control.h);

  ctx.fillStyle = "rgba(210,245,255,0.9)";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("VOL", control.x + 8, trackY);

  ctx.strokeStyle = "rgba(80,240,255,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(trackX, trackY);
  ctx.lineTo(trackX + control.trackW, trackY);
  ctx.stroke();

  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(knobX, trackY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawStory() {

  if (storyMode === "select") {
    drawStorySelect();
    return;
  }

  const line = currentStoryLines[storyLineIndex];
  const isLastLine = storyLineIndex === currentStoryLines.length - 1;

  drawStoryBackground();
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStoryCharacter(
    "tachikage",
    "left",
    line.character === "tachikage"
  );

  drawStoryCharacter(
    storyRightCharacter,
    "right",
    line.character === storyRightCharacter
  );

  drawStoryForeground(line);
  drawStoryScreenTone(line);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(
    "Press Esc to return",
    18,
    16
  );

  drawStoryMusicVolumeControl();

  ctx.textBaseline = "alphabetic";

  drawDialogueUI(
    line.speaker,
    line.text,
    isLastLine
      ? "Enter/Escでタイトルに戻る"
      : "Enter"
  );
}

function drawStorySelect() {

  ctx.fillStyle = "#02080e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "cyan";
  ctx.font = "38px sans-serif";
  ctx.fillText(
    "STORY",
    canvas.width / 2,
    96
  );

  ctx.font = "22px sans-serif";

  STORY_CHAPTERS.forEach((chapter, index) => {
    const enabled = isStoryChapterUnlocked(chapter);
    const selected = enabled && index === storyChapterIndex;
    const y = 150 + index * 34;

    ctx.fillStyle = selected
      ? "cyan"
      : enabled
        ? "white"
        : "rgba(255,255,255,0.34)";

    ctx.fillText(
      `${selected ? "> " : "  "}${chapter.title}${selected ? " <" : "  "}`,
      canvas.width / 2,
      y
    );

    if (!enabled) {
      ctx.fillStyle = "rgba(210,245,255,0.42)";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        "LOCKED",
        canvas.width / 2 + 210,
        y - 2
      );
      ctx.font = "22px sans-serif";
    }
  });

  ctx.fillStyle = "rgba(210,245,255,0.72)";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    "Move: Select   Enter: Read   Esc: Title",
    canvas.width / 2,
    410
  );

  ctx.textAlign = "left";
  drawDialogueUI("", "");
}

function isStoryMusicVolumeControlVisible() {
  return gameState === "story" &&
    storyMode === "play" &&
    Boolean(currentStoryMusicKey);
}

function getStoryPointFromMouseEvent(e) {
  const rect = storyGameCanvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) * storyGameCanvas.width / rect.width,
    y: (e.clientY - rect.top) * storyGameCanvas.height / rect.height
  };
}

function isPointInStoryMusicVolumeControl(point) {
  const control = STORY_MUSIC_VOLUME_CONTROL;

  return point.x >= control.x &&
    point.x <= control.x + control.w &&
    point.y >= control.y &&
    point.y <= control.y + control.h;
}

storyGameCanvas.addEventListener("mousedown", e => {
  if (!isStoryMusicVolumeControlVisible()) return;

  const point = getStoryPointFromMouseEvent(e);

  if (!isPointInStoryMusicVolumeControl(point)) return;

  storyMusicVolumeDragging = true;
  setStoryMusicVolumeFromPoint(point.x);
});

storyGameCanvas.addEventListener("mousemove", e => {
  if (!storyMusicVolumeDragging) return;

  const point = getStoryPointFromMouseEvent(e);
  setStoryMusicVolumeFromPoint(point.x);
});

window.addEventListener("mouseup", () => {
  storyMusicVolumeDragging = false;
});
