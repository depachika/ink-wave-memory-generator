import { frames, frameLabels } from "./frames.js";
import { logos } from "./logos.js";
import {
  OUTPUT_WIDTH,
  OUTPUT_HEIGHT,
  drawCover,
  drawOverlay,
  drawLogo,
} from "./image_composer.js";

const photoInput = document.querySelector("#photo-input");
const preview = document.querySelector("#preview");
const context = preview.getContext("2d");
const placeholder = document.querySelector("#preview-placeholder");
const status = document.querySelector("#status");
const frameList = document.querySelector("#frame-list");
const logoInput = document.querySelector("#logo-input");
const logoControls = document.querySelector("#logo-controls");
const photoSection = document.querySelector("#photo-section");
const frameSection = document.querySelector("#frame-section");
const logoSection = document.querySelector("#logo-section");
const downloadButton = document.querySelector("#download");
const resetAllButton = document.querySelector("#reset-all");
const resetLogoButton = document.querySelector("#reset-logo");
const outlineColorInput = document.querySelector("#logo-outline-color");
const outlineColorError = document.querySelector("#logo-outline-color-error");
const outlineColorPresets = document.querySelector("#outline-color-presets");

const logoFields = {
  x: document.querySelector("#logo-x"),
  y: document.querySelector("#logo-y"),
  size: document.querySelector("#logo-size"),
  rotation: document.querySelector("#logo-rotation"),
  outlineWidth: document.querySelector("#logo-outline-width"),
};

const logoNumberFields = {
  x: document.querySelector("#logo-x-number"),
  y: document.querySelector("#logo-y-number"),
  size: document.querySelector("#logo-size-number"),
  rotation: document.querySelector("#logo-rotation-number"),
  outlineWidth: document.querySelector("#logo-outline-width-number"),
};

const logoUnits = {
  x: "%",
  y: "%",
  size: "%",
  rotation: "°",
  outlineWidth: "px",
};

const state = {
  photo: null,
  frame: null,
  logo: null,
  selectedFrame: "",
  selectedLogo: "",
  selectedLogoConfig: null,
  outlineColor: "#FFFFFF",
};

const imageCache = new Map();

const loadImage = (url) => {
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`画像を読み込めない: ${url}`));
    image.src = url;
  });

  imageCache.set(url, promise);
  return promise;
};

const setStatus = (message) => {
  status.textContent = message;
};

const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
};

const formatNumber = (value) => {
  return Number(value).toFixed(1).replace(/\.0$/, "");
};

const getFieldLimits = (field) => {
  return {
    min: Number(field.min),
    max: Number(field.max),
    step: Number(field.step) || 1,
  };
};

const getLogoSettings = () => {
  return {
    x: Number(logoFields.x.value),
    y: Number(logoFields.y.value),
    size: Number(logoFields.size.value),
    rotation: Number(logoFields.rotation.value),
    outlineColor: state.outlineColor,
    outlineWidth: Number(logoFields.outlineWidth.value),
  };
};

const updateNumberFields = () => {
  for (const [key, rangeField] of Object.entries(logoFields)) {
    logoNumberFields[key].value = formatNumber(rangeField.value);
  }
};

const updateOutlineColorSelection = () => {
  const currentColor = state.outlineColor.toUpperCase();

  for (const button of outlineColorPresets.querySelectorAll("[data-color]")) {
    const isSelected = button.dataset.color.toUpperCase() === currentColor;
    button.setAttribute("aria-pressed", String(isSelected));
    button.textContent = isSelected ? "✓" : "";
    button.style.color = ["#FFFFFF", "#FFCC00"].includes(button.dataset.color.toUpperCase())
      ? "#172033"
      : "#FFFFFF";
  }
};

const setOutlineColor = (color) => {
  state.outlineColor = color.toUpperCase();
  outlineColorInput.value = state.outlineColor;
  outlineColorInput.setAttribute("aria-invalid", "false");
  outlineColorError.hidden = true;
  updateOutlineColorSelection();
  renderPreview();
};

const resetLogoSettings = () => {
  const config = state.selectedLogoConfig ?? {};
  const defaults = {
    x: config.x ?? 12,
    y: config.y ?? 15,
    size: config.size ?? 30,
    rotation: config.rotation ?? 0,
    outlineWidth: config.outlineWidth ?? 0,
  };

  for (const [key, value] of Object.entries(defaults)) {
    logoFields[key].value = value;
  }

  state.outlineColor = (config.outlineColor ?? "#FFFFFF").toUpperCase();
  updateNumberFields();
  outlineColorInput.value = state.outlineColor;
  outlineColorInput.setAttribute("aria-invalid", "false");
  outlineColorError.hidden = true;
  updateOutlineColorSelection();
  renderPreview();
};

const renderPreview = async () => {
  context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  if (!state.photo) {
    placeholder.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  try {
    drawCover(context, state.photo, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    if (state.frame) {
      drawOverlay(context, state.frame, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    }

    if (state.logo) {
      drawLogo(context, state.logo, OUTPUT_WIDTH, OUTPUT_HEIGHT, getLogoSettings());
    }

    placeholder.hidden = true;
    downloadButton.disabled = false;
    setStatus("プレビューを更新しました。気に入ったら画像を保存しよう！");
  }
  catch (error) {
    console.error(error);
    setStatus("プレビューの作成に失敗しました。別の画像を試してください。");
    downloadButton.disabled = true;
  }
};

const closeAllSections = () => {
  photoSection.open = false;
  frameSection.open = false;
  logoSection.open = false;
};

const openSection = (targetSection) => {
  closeAllSections();
  targetSection.open = true;
};







const previewSection = document.querySelector(".preview-section");
const previewPin = document.querySelector("#preview-pin");
const previewPinLabel = document.querySelector("#preview-pin-label");

previewPin.addEventListener("click", () => {
  const isPinned = previewSection.classList.toggle("is-pinned");

  previewPin.classList.toggle("is-pinned", isPinned);
  previewPin.setAttribute("aria-pressed", String(isPinned));
  previewPin.setAttribute(
    "aria-label",
    isPinned ? "プレビューの固定を解除する" : "プレビューを固定する"
  );
  previewPinLabel.textContent = isPinned ? "固定中" : "固定する";
});








const getFrameLabel = (fileName) => {
  const key = fileName.replace(/\.[^.]+$/, "");
  return frameLabels[key] ?? key.replaceAll("_", " ");
};

const updateFrameSelection = (selectedButton) => {
  for (const card of frameList.querySelectorAll("button")) {
    card.setAttribute("aria-pressed", String(card === selectedButton));
  }
};

const buildFrameChoices = async () => {
  frameList.replaceChildren();

  const noneButton = document.createElement("button");
  noneButton.type = "button";
  noneButton.className = "choice-card choice-card-none";  // 「フレームなし」のボタンだけに専用のCSSを適用するため
  noneButton.dataset.frameNone = "true";
  noneButton.setAttribute("aria-pressed", "false");  // 初期は未選択（「フレームなし」すら選んでいない状態）

  const noneLabel = document.createElement("span");
  noneLabel.textContent = "フレームなし";
  noneButton.append(noneLabel);

  noneButton.addEventListener("click", async () => {
    state.frame = null;
    state.selectedFrame = "";

    updateFrameSelection(noneButton);
    frameSection.open = false;
    logoSection.open = true;

    await renderPreview();
  });

  frameList.append(noneButton);

  if (frames.length === 0) {
    return;
  }

  for (const frame of frames) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.setAttribute("aria-pressed", "false");

    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.src = `./assets/frames/${frame.fileName}`;

    const label = document.createElement("span");
    label.textContent = frame.label ?? getFrameLabel(frame.fileName);

    button.append(image, label);

    button.addEventListener("click", async () => {
      try {
        const loadedFrame = await loadImage(image.src);

        state.frame = loadedFrame;
        state.selectedFrame = frame.fileName;

        updateFrameSelection(button);
        frameSection.open = false;

        await renderPreview();
      }
      catch (error) {
        console.error(error);
        setStatus("フレームを読み込めませんでした。ファイル名と配置を確認してください。\n（ジェネレーター製作者に連絡してください）");
      }
    });

    frameList.append(button);
  }
};

const buildLogoChoices = async () => {
  for (const logo of logos) {
    const option = document.createElement("option");
    option.value = logo.fileName;
    option.textContent = logo.label ?? getFrameLabel(logo.fileName);
    logoInput.append(option);
  }
};

const handleRangeInput = (key) => {
  logoNumberFields[key].value = formatNumber(logoFields[key].value);
  renderPreview();
};

const handleNumberInput = (key) => {
  const numberField = logoNumberFields[key];
  const value = numberField.valueAsNumber;

  if (numberField.value.trim() === "" || !Number.isFinite(value)) {
    return;
  }

  const { min, max } = getFieldLimits(logoFields[key]);

  if (value < min || value > max) {
    return;
  }

  const precision = key === "rotation" ? 0 : 1;
  const normalizedValue = Number(value.toFixed(precision));

  logoFields[key].value = normalizedValue;
  renderPreview();
};

const normalizeNumberInput = (key) => {
  const numberField = logoNumberFields[key];
  const { min, max } = getFieldLimits(logoFields[key]);
  const value = numberField.valueAsNumber;

  if (numberField.value.trim() === "" || !Number.isFinite(value)) {
    numberField.value = formatNumber(logoFields[key].value);
    return;
  }

  const precision = key === "rotation" ? 0 : 1;
  const normalizedValue = Number(clamp(value, min, max).toFixed(precision));

  logoFields[key].value = normalizedValue;
  numberField.value = formatNumber(normalizedValue);
  renderPreview();
};

for (const [key, field] of Object.entries(logoFields)) {
  field.addEventListener("input", () => handleRangeInput(key));
  logoNumberFields[key].addEventListener("input", () => handleNumberInput(key));
  logoNumberFields[key].addEventListener("change", () => normalizeNumberInput(key));
}

outlineColorPresets.addEventListener("click", (event) => {
  const button = event.target.closest("[data-color]");

  if (!button) {
    return;
  }

  setOutlineColor(button.dataset.color);
});

outlineColorInput.addEventListener("input", () => {
  const color = outlineColorInput.value.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    outlineColorInput.setAttribute("aria-invalid", "true");
    outlineColorError.hidden = false;
    return;
  }

  state.outlineColor = color.toUpperCase();
  outlineColorInput.setAttribute("aria-invalid", "false");
  outlineColorError.hidden = true;
  updateOutlineColorSelection();
  renderPreview();
});

outlineColorInput.addEventListener("change", () => {
  const color = outlineColorInput.value.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    outlineColorInput.value = state.outlineColor;
    outlineColorInput.setAttribute("aria-invalid", "false");
    outlineColorError.hidden = true;
    return;
  }

  outlineColorInput.value = color.toUpperCase();
});

photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setStatus("画像ファイルを選択してください。");
    return;
  }

  let url;

  try {
    url = URL.createObjectURL(file);
    const image = await loadImage(url);

    state.photo = image;

    await renderPreview();
    openSection(frameSection);
  }
  catch (error) {
    console.error(error);
    setStatus("画像を読み込めませんでした。別の画像を試してください。");
  }
  finally {
    if (url) {
      URL.revokeObjectURL(url);
      imageCache.delete(url);
    }
  }
});

logoInput.addEventListener("change", async () => {
  const fileName = logoInput.value;

  if (!fileName) {
    state.logo = null;
    state.selectedLogo = "";
    state.selectedLogoConfig = null;
    logoControls.hidden = true;

    await renderPreview();
    return;
  }

  const logo = logos.find((item) => item.fileName === fileName);

  if (!logo) {
    return;
  }

  try {
    const loadedLogo = await loadImage(`./assets/logos/${logo.fileName}`);

    state.logo = loadedLogo;
    state.selectedLogo = logo.fileName;
    state.selectedLogoConfig = logo;

    logoControls.hidden = false;
    resetLogoSettings();

    await renderPreview();
  }
  catch (error) {
    console.error(error);
    setStatus("ロゴを読み込めませんでした。ファイル名と配置を確認してください。\n（ジェネレーター製作者に連絡してください）");
  }
});

resetLogoButton.addEventListener("click", resetLogoSettings);

resetAllButton.addEventListener("click", async () => {
  const confirmed = window.confirm(
    "写真・フレーム・ロゴの設定をすべてリセットします。\nこの操作は後から取り消せません。\n\n本当に実行しますか？"
  );

  if (!confirmed) {
    return;
  }

  photoInput.value = "";
  logoInput.value = "";

  state.photo = null;
  state.frame = null;
  state.logo = null;
  state.selectedFrame = "";
  state.selectedLogo = "";
  state.selectedLogoConfig = null;

  logoControls.hidden = true;

  updateFrameSelection(null);

  photoSection.open = true;
  frameSection.open = false;
  logoSection.open = false;

  resetLogoSettings();

  await renderPreview();

  setStatus("設定をリセットしました。画像を選ぶところから始めてください。");
});

downloadButton.addEventListener("click", () => {
  if (!state.photo) {
    return;
  }

  preview.toBlob((blob) => {
    if (!blob) {
      setStatus("画像の書き出しに失敗しました。ブラウザーを変えて試してください。");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ink-wave-memory.png";

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setStatus("画像の保存を開始しました。端末のダウンロード先を確認してください。");
  }, "image/png");
});

const initialize = async () => {
  preview.width = OUTPUT_WIDTH;
  preview.height = OUTPUT_HEIGHT;

  updateNumberFields();
  updateOutlineColorSelection();

  await buildFrameChoices();
  await buildLogoChoices();
  await renderPreview();
};

initialize();
