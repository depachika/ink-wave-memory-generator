
export const photoInput = document.querySelector("#photo-input");
export const preview = document.querySelector("#preview");
export const context = preview.getContext("2d");
export const placeholder = document.querySelector("#preview-placeholder");
export const status = document.querySelector("#status");
export const frameList = document.querySelector("#frame-list");
export const logoInput = document.querySelector("#logo-input");
export const logoControls = document.querySelector("#logo-controls");
export const photoSection = document.querySelector("#photo-section");
export const frameSection = document.querySelector("#frame-section");
export const logoSection = document.querySelector("#logo-section");
export const downloadButton = document.querySelector("#download");
export const resetAllButton = document.querySelector("#reset-all");
export const resetLogoButton = document.querySelector("#reset-logo");
export const outlineColorInput = document.querySelector("#logo-outline-color");
export const outlineColorError = document.querySelector("#logo-outline-color-error");
export const outlineColorPresets = document.querySelector("#outline-color-presets");
export const xShareButton = document.querySelector("#share-x");

export const logoFields = {
  x: document.querySelector("#logo-x"),
  y: document.querySelector("#logo-y"),
  size: document.querySelector("#logo-size"),
  rotation: document.querySelector("#logo-rotation"),
  outlineWidth: document.querySelector("#logo-outline-width"),
};

export const logoNumberFields = {
  x: document.querySelector("#logo-x-number"),
  y: document.querySelector("#logo-y-number"),
  size: document.querySelector("#logo-size-number"),
  rotation: document.querySelector("#logo-rotation-number"),
  outlineWidth: document.querySelector("#logo-outline-width-number"),
};


// ============================================================
// 写真位置調整用のDOM要素
// ============================================================

// 写真位置調整の操作欄
export const photoPositionControls = document.querySelector(
  '#photo-position-controls',
);

// 写真のX・Y位置を操作するスライダー
export const photoPositionFields = {
  x: document.querySelector('#photo-position-x'),
  y: document.querySelector('#photo-position-y'),
};

// 写真のX・Y位置を直接入力する数値欄
export const photoPositionNumberFields = {
  x: document.querySelector('#photo-position-x-number'),
  y: document.querySelector('#photo-position-y-number'),
};

