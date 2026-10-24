

// DOM要素・共有状態
import {
  photoInput,
  logoInput,
  logoControls,
  photoSection,
  frameSection,
  logoSection,
  resetAllButton,
  photoPositionControls,
  photoPositionFields,
  photoPositionNumberFields,
} from './dom.js';

import { state } from './state.js';

// プレビュー関連
import {
  setStatus,
  renderPreview,
} from './preview.js';

import {
  initializePreviewControls,
  setPreviewPinEnabled,
} from './preview_controls.js';

// フレーム関連
import {
  buildFrameChoices,
  updateFrameSelection,
} from './frame_controls.js';

// ロゴ関連
import {
  buildLogoChoices,
  initializeLogoControls,
  resetLogoSettings,
} from './logo_controls.js';

// 写真位置調整
import {
  initializePhotoPositionControls,
} from './photo_position_controls.js';

// 画像保存・X投稿関連
import { initializeImageDownload } from './image_download.js';
import { initializeXShare } from './x_share.js';

// 写真選択時のイベントを登録する副作用インポート
import './photo.js';

// ============================================================
// 全設定のリセット
// ============================================================

resetAllButton.addEventListener('click', async () => {
  const confirmed = window.confirm(
    '写真・フレーム・ロゴの設定をすべてリセットします。\nこの操作は後から取り消せません。\n\n本当に実行しますか？',
  );

  // キャンセルされた場合は何も変更しない。
  if (!confirmed) {
    return;
  }

  // ファイル選択欄をクリアする。
  photoInput.value = '';
  logoInput.value = '';

  // 画像・フレーム・ロゴの共有状態を初期化する。
  state.photo = null;
  state.frame = null;
  state.frameConfig = null;
  state.logo = null;

  state.selectedFrame = '';
  state.selectedLogo = '';
  state.selectedLogoConfig = null;

  // 写真位置をcanvasの中心に戻し、UIにも反映する。
  // 新しい座標方式では、X・Yともに0が初期位置となる。
  state.photoPosition = {
    x: 0,
    y: 0,
  };

  for (const axis of ['x', 'y']) {
    const value = String(state.photoPosition[axis]);

    photoPositionFields[axis].value = value;
    photoPositionNumberFields[axis].value = value;
  }

  // 写真位置調整UIを非表示にする。
  photoPositionControls.hidden = true;

  // プレビュー固定を解除し、固定操作を無効にする。
  setPreviewPinEnabled(false);

  // フレームの選択状態を解除する。
  updateFrameSelection(null);

  // ロゴ設定を初期化する。
  logoControls.hidden = true;
  resetLogoSettings();

  // 写真選択を開き、フレームとロゴの設定を閉じる。
  photoSection.open = true;
  frameSection.open = false;
  logoSection.open = false;

  // 初期状態をプレビューへ反映する。
  await renderPreview();

  setStatus('リセットしました。画像を選ぶところから始めてください。');

  // ページトップへ戻る。
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

// ============================================================
// アプリケーションの初期化
// ============================================================

const initialize = async () => {
  // 写真位置調整の入力イベントを登録する。
  initializePhotoPositionControls();

  // ロゴ設定とプレビュー固定のイベントを登録する。
  initializeLogoControls();
  initializePreviewControls();

  // 画像保存ボタンのイベントを登録する。
  initializeImageDownload();

  // X投稿用設定と、フレーム・ロゴの選択肢を読み込む。
  await initializeXShare();
  await buildFrameChoices();
  await buildLogoChoices();

  // 初期状態のプレビューを描画する。
  await renderPreview();
};

// 初期化を実行する。
initialize();

