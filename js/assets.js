// ====================
// アセット読み込み
// ====================

const assetEntries = [];
const assetEntriesByName = {};
const assetEntriesBySrc = {};

function loadImage(name, src) {

  if (assetEntriesByName[name]) {
    return assetEntriesByName[name].img;
  }

  if (assetEntriesBySrc[src]) {
    assetEntriesByName[name] = assetEntriesBySrc[src];
    return assetEntriesBySrc[src].img;
  }

  const img = new Image();
  const entry = {
    name,
    src,
    img,
    loaded: false,
    failed: false
  };

  assetEntries.push(entry);
  assetEntriesByName[name] = entry;
  assetEntriesBySrc[src] = entry;

  img.onload = () => {
    entry.loaded = true;
  };

  img.onerror = () => {
    entry.loaded = true;
    entry.failed = true;
  };

  img.src = src;

  return img;
}

function getAsset(name) {
  return assetEntriesByName[name]?.img || null;
}

function getAssetLoadProgress() {

  const total = assetEntries.length;
  const loaded = assetEntries.filter(entry => entry.loaded).length;
  const failed = assetEntries.filter(entry => entry.failed).length;

  return {
    total,
    loaded,
    failed,
    complete: total === loaded
  };
}

function isAssetLoadComplete() {
  return getAssetLoadProgress().complete;
}
