

import { state } from './state.js';

import {
  logoInput,
  logoControls,
  resetLogoButton,
  outlineColorInput,
  outlineColorError,
  outlineColorPresets,
  logoFields,
  logoNumberFields,
} from './dom.js';

import { loadImage } from './image_loader.js';
import { setStatus, renderPreview } from './preview.js';


// JSONから読み込んだロゴ一覧を保持する
let logos = [];


const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
};


const formatNumber = (value) => {
  return Number(value).toFixed(1).replace(/\.0$/, '');
};


const getFieldLimits = (field) => {
  return {
    min: Number(field.min),
    max: Number(field.max),
    step: Number(field.step) || 1,
  };
};


const getLogoLabel = (fileName) => {
  const key = fileName.replace(/\.[^.]+$/, '');

  return key.replaceAll('_', ' ');
};


// ロゴ一覧をJSONから読み込む
const loadLogos = async () => {
  const response = await fetch('./data/logos.json');

  if (!response.ok) {
    throw new Error(
      `ロゴ一覧の読み込みに失敗した: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('ロゴ一覧のJSON形式が正しくありません。');
  }

  return data;
};


const updateNumberFields = () => {
  for (const [key, rangeField] of Object.entries(logoFields)) {
    logoNumberFields[key].value = formatNumber(rangeField.value);
  }
};


const updateOutlineColorSelection = () => {
  const currentColor = state.outlineColor.toUpperCase();

  for (const button of outlineColorPresets.querySelectorAll('[data-color]')) {
    const buttonColor = button.dataset.color.toUpperCase();
    const isSelected = buttonColor === currentColor;

    button.setAttribute('aria-pressed', String(isSelected));
    button.textContent = isSelected ? '✓' : '';
    button.style.color = ['#FFFFFF', '#FFCC00'].includes(buttonColor)
      ? '#172033'
      : '#FFFFFF';
  }
};


const setOutlineColor = (color) => {
  state.outlineColor = color.toUpperCase();
  outlineColorInput.value = state.outlineColor;
  outlineColorInput.setAttribute('aria-invalid', 'false');
  outlineColorError.hidden = true;

  updateOutlineColorSelection();
  renderPreview();
};


export const resetLogoSettings = () => {
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

  state.outlineColor = (
    config.outlineColor ?? '#FFFFFF'
  ).toUpperCase();

  updateNumberFields();

  outlineColorInput.value = state.outlineColor;
  outlineColorInput.setAttribute('aria-invalid', 'false');
  outlineColorError.hidden = true;

  updateOutlineColorSelection();
  renderPreview();
};



// 選択中のロゴ設定を基準に、指定項目だけを初期値へ戻す。
const resetLogoField = ({ key }) => {
  const config = state.selectedLogoConfig ?? {};

  // 全体リセットと同じ初期値を使用する。
  const defaults = {
    x: config.x ?? 12,
    y: config.y ?? 15,
    size: config.size ?? 30,
    rotation: config.rotation ?? 0,
    outlineWidth: config.outlineWidth ?? 0,
  };

  // 未定義の項目は変更しない。
  if (!Object.hasOwn(defaults, key)) {
    return;
  }

  const value = defaults[key];

  // スライダーと数値入力欄を同期する。
  logoFields[key].value = String(value);
  logoNumberFields[key].value = formatNumber(value);

  // 変更した項目をプレビューへ反映する。
  renderPreview();
};



export const buildLogoChoices = async () => {
  // HTMLで用意した「ロゴを配置しない」を残す
  const noneOption = logoInput.querySelector('option[value=""]');

  logoInput.replaceChildren();

  if (noneOption) {
    logoInput.append(noneOption);
  } else {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'ロゴを配置しない';
    logoInput.append(option);
  }

  // JSONからロゴ一覧を取得する
  try {
    logos = await loadLogos();
  } catch (error) {
    console.error(error);

    logos = [];
    logoInput.value = '';

    setStatus(
      'ロゴ一覧を読み込めませんでした。data/logos.json の配置と内容を確認してください。',
    );

    return;
  }

  // 選択肢を生成する
  for (const logo of logos) {
    const option = document.createElement('option');
    option.value = logo.fileName;
    option.textContent = logo.label ?? getLogoLabel(logo.fileName);
    logoInput.append(option);
  }

  // 初期状態は「ロゴを配置しない」
  logoInput.value = '';
};


const handleRangeInput = (key) => {
  logoNumberFields[key].value = formatNumber(logoFields[key].value);

  renderPreview();
};


const handleNumberInput = (key) => {
  const numberField = logoNumberFields[key];
  const value = numberField.valueAsNumber;

  if (numberField.value.trim() === '' || !Number.isFinite(value)) {
    return;
  }

  const { min, max } = getFieldLimits(logoFields[key]);

  if (value < min || value > max) {
    return;
  }

  const precision = key === 'rotation' ? 0 : 1;
  const normalizedValue = Number(value.toFixed(precision));

  logoFields[key].value = normalizedValue;

  renderPreview();
};


const normalizeNumberInput = (key) => {
  const numberField = logoNumberFields[key];
  const { min, max } = getFieldLimits(logoFields[key]);
  const value = numberField.valueAsNumber;

  if (numberField.value.trim() === '' || !Number.isFinite(value)) {
    numberField.value = formatNumber(logoFields[key].value);
    return;
  }

  const precision = key === 'rotation' ? 0 : 1;
  const normalizedValue = Number(
    clamp(value, min, max).toFixed(precision),
  );

  logoFields[key].value = normalizedValue;
  numberField.value = formatNumber(normalizedValue);

  renderPreview();
};


const handleLogoSelection = async () => {
  const fileName = logoInput.value;

  // 「ロゴを配置しない」が選択された場合
  if (!fileName) {
    state.logo = null;
    state.selectedLogo = '';
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
    // 選択されたロゴ画像を読み込む
    const loadedLogo = await loadImage(
      `./assets/logos/${logo.fileName}`,
    );

    state.logo = loadedLogo;
    state.selectedLogo = logo.fileName;
    state.selectedLogoConfig = logo;

    logoControls.hidden = false;

    resetLogoSettings();

    await renderPreview();
  } catch (error) {
    console.error(error);

    setStatus(
      'ロゴを読み込めませんでした。ファイル名と配置を確認してください。\n（ジェネレーター製作者に連絡してください）',
    );
  }
};


const handleOutlineColorInput = () => {
  const color = outlineColorInput.value.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    outlineColorInput.setAttribute('aria-invalid', 'true');
    outlineColorError.hidden = false;
    return;
  }

  state.outlineColor = color.toUpperCase();

  outlineColorInput.setAttribute('aria-invalid', 'false');
  outlineColorError.hidden = true;

  updateOutlineColorSelection();
  renderPreview();
};


const handleOutlineColorChange = () => {
  const color = outlineColorInput.value.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    outlineColorInput.value = state.outlineColor;
    outlineColorInput.setAttribute('aria-invalid', 'false');
    outlineColorError.hidden = true;
    return;
  }

  outlineColorInput.value = color.toUpperCase();
};


const handleOutlineColorPresetClick = (event) => {
  const button = event.target.closest('[data-color]');

  if (!button) {
    return;
  }

  setOutlineColor(button.dataset.color);
};


export const initializeLogoControls = () => {
  for (const [key, field] of Object.entries(logoFields)) {
    field.addEventListener('input', () => {
      handleRangeInput(key);
    });

    logoNumberFields[key].addEventListener('input', () => {
      handleNumberInput(key);
    });

    logoNumberFields[key].addEventListener('change', () => {
      normalizeNumberInput(key);
    });
  }

  // 項目単位のリセットボタンを処理する。
  logoControls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-reset-logo-field]');

    if (!button || !logoControls.contains(button)) {
      return;
    }

    resetLogoField({
      key: button.dataset.resetLogoField,
    });
  });

  

  outlineColorPresets.addEventListener(
    'click',
    handleOutlineColorPresetClick,
  );

  outlineColorInput.addEventListener('input', handleOutlineColorInput);
  outlineColorInput.addEventListener('change', handleOutlineColorChange);

  logoInput.addEventListener('change', handleLogoSelection);
  resetLogoButton.addEventListener('click', resetLogoSettings);

  updateNumberFields();
  updateOutlineColorSelection();
};

