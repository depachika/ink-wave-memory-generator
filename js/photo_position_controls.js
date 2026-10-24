

import { state } from './state.js';
import {
  photoPositionControls,
  photoPositionFields,
  photoPositionNumberFields,
} from './dom.js';
import { renderPreview } from './preview.js';

// ============================================================
// 写真位置調整の設定値
// ============================================================

// 写真位置は、canvasの中心を基準とした移動量（-100～100%）で指定する。
// Xは正数で右、負数で左へ移動する。
// Yは正数で上、負数で下へ移動する。
// 小数第1位まで指定できる。
const POSITION_MIN = -100;
const POSITION_MAX = 100;
const POSITION_STEP = 0.1;
const DEFAULT_POSITION = 0;

// ============================================================
// 入力値の検証・整形
// ============================================================

// 入力値を数値に変換し、許容範囲内に収める。
// 空欄や数値以外はnullを返し、呼び出し元で処理する。
const normalizePosition = (value) => {
  if (value === '' || !Number.isFinite(Number(value))) {
    return null;
  }

  const number = Number(value);
  const clamped = Math.min(
    POSITION_MAX,
    Math.max(POSITION_MIN, number),
  );

  // 小数第1位にそろえ、浮動小数点の誤差を抑える。
  return Math.round(clamped * 10) / 10;
};

// ============================================================
// UIと共有状態の同期
// ============================================================

// 指定軸の状態を、スライダーと数値入力の両方へ反映する。
const syncPositionFields = ({ axis, value }) => {
  photoPositionFields[axis].value = String(value);
  photoPositionNumberFields[axis].value = String(value);
};

// ============================================================
// 写真位置の更新
// ============================================================

// 入力値を状態へ反映し、UIを同期してプレビューを再描画する。
const updatePhotoPosition = async ({ axis, inputValue }) => {
  const value = normalizePosition(inputValue);

  // 数値入力が空欄などの場合は、確定するまで状態を変更しない。
  if (value === null) {
    return;
  }

  state.photoPosition[axis] = value;

  syncPositionFields({ axis, value });

  await renderPreview();
};

// ============================================================
// 初期化
// ============================================================

// 写真位置調整UIのイベントを登録する。
// app.jsから一度だけ呼び出すこと。
export const initializePhotoPositionControls = () => {
  // 共有状態が存在しない場合は、新しい座標方式の初期値を設定する。
  state.photoPosition ??= {
    x: DEFAULT_POSITION,
    y: DEFAULT_POSITION,
  };

  // 既存の状態値も新しい許容範囲に合わせる。
  // 通常はstate.jsで初期化されるが、古い値が残っていても整合性を保つ。
  for (const axis of ['x', 'y']) {
    const value = normalizePosition(state.photoPosition[axis]);

    state.photoPosition[axis] = value ?? DEFAULT_POSITION;
  }

  for (const axis of ['x', 'y']) {
    const slider = photoPositionFields[axis];
    const numberInput = photoPositionNumberFields[axis];

    // 初期値をスライダーと数値入力に反映する。
    syncPositionFields({
      axis,
      value: state.photoPosition[axis],
    });

    // スライダーと数値入力欄の範囲・刻み幅を統一する。
    slider.min = String(POSITION_MIN);
    slider.max = String(POSITION_MAX);
    slider.step = String(POSITION_STEP);

    numberInput.min = String(POSITION_MIN);
    numberInput.max = String(POSITION_MAX);
    numberInput.step = String(POSITION_STEP);

    // スライダー操作時は、即座に数値入力とプレビューを更新する。
    slider.addEventListener('input', async () => {
      await updatePhotoPosition({
        axis,
        inputValue: slider.value,
      });
    });

    // 数値入力中も、入力可能な値であればプレビューを更新する。
    numberInput.addEventListener('input', async () => {
      await updatePhotoPosition({
        axis,
        inputValue: numberInput.value,
      });
    });

    // 入力欄からフォーカスが外れたとき、空欄を現在の状態値へ戻す。
    numberInput.addEventListener('blur', () => {
      syncPositionFields({
        axis,
        value: state.photoPosition[axis],
      });
    });
  }

  // 項目ごとのリセットボタンを処理する。
  // 既存の更新処理を再利用し、状態・入力欄・プレビューを同期する。
  photoPositionControls.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-reset-photo-position]');

    if (!button || !photoPositionControls.contains(button)) {
      return;
    }

    const axis = button.dataset.resetPhotoPosition;

    if (!['x', 'y'].includes(axis)) {
      return;
    }

    await updatePhotoPosition({
      axis,
      inputValue: DEFAULT_POSITION,
    });
  });

  // このファイルでは表示・非表示を制御しない。
  // フレーム選択に合わせた表示制御はframe_controls.jsで行う。
  photoPositionControls.hidden = true;
};

