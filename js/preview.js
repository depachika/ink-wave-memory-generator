

import {
  preview,
  context,
  placeholder,
  status,
  downloadButton,
  xShareButton,
  logoFields,
} from './dom.js';

import { state } from './state.js';

import {
  getOutputSize,
  drawCover,
  drawOverlay,
  drawLogo,
} from './image_composer.js';

// ステータスメッセージを更新する。
export const setStatus = (message) => {
  status.textContent = message;
};

// 現在の入力欄と共有状態から、ロゴの描画設定を取得する。
export const getLogoSettings = () => {
  return {
    x: Number(logoFields.x.value),
    y: Number(logoFields.y.value),
    size: Number(logoFields.size.value),
    rotation: Number(logoFields.rotation.value),
    outlineColor: state.outlineColor,
    outlineWidth: Number(logoFields.outlineWidth.value),
  };
};

// 出力サイズに合わせてCanvasを更新し、写真・フレーム・ロゴを描画する。
export const renderPreview = async () => {
  try {
    // フレームの有無に応じて出力寸法を決定する。
    const outputSize = getOutputSize(
      state.photo,
      state.frame,
      state.frameConfig,
    );

    const { width, height } = outputSize;

    // Canvasの寸法を変更すると、描画内容と描画設定がリセットされる。
    // 寸法が変わった場合は、以降の処理で全体を描き直す。
    if (
      preview.width !== width ||
      preview.height !== height
    ) {
      preview.width = width;
      preview.height = height;
    }

    // 出力画像と同じ縦横比でプレビュー領域を表示する。
    // preview-wrapの縦横比をCanvasの寸法に合わせる。
    if (preview.parentElement) {
      preview.parentElement.style.aspectRatio = `${width} / ${height}`;
    }

    // 既存の描画内容を消去する。
    context.clearRect(0, 0, width, height);

    // 写真が未選択の場合はプレースホルダーを表示する。
    if (!state.photo) {
      placeholder.hidden = false;
      downloadButton.disabled = true;
      xShareButton.disabled = true;
      return;
    }

    // 写真の透明部分などがある場合に備え、背景を白で塗る。
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    // フレームの有無によって写真の描画方法を切り替える。
    if (state.frame) {
      // フレームあり：
      // 指定された出力領域に合わせて写真を拡大・切り抜きする。
      // X・YはCanvasの中心を原点とした写真の移動量（%）。
      // Xは正の値で右、負の値で左へ移動する。
      // Yは正の値で上、負の値で下へ移動する。
      drawCover(
        context,
        state.photo,
        width,
        height,
        state.photoPosition.x,
        state.photoPosition.y,
      );
    } else {
      // フレームなし：
      // 出力寸法は写真の元寸法なので、全体をそのまま描画する。
      // 写真位置の設定による切り抜きは行わない。
      context.drawImage(
        state.photo,
        0,
        0,
        width,
        height,
      );
    }

    // フレームをCanvas全体に重ねる。
    if (state.frame) {
      drawOverlay(
        context,
        state.frame,
        width,
        height,
      );
    }

    // ロゴが選択されている場合は、写真・フレームの上に描画する。
    if (state.logo) {
      drawLogo(
        context,
        state.logo,
        width,
        height,
        getLogoSettings(),
      );
    }

    // 描画が完了したら、プレビューと保存・共有操作を有効にする。
    placeholder.hidden = true;
    downloadButton.disabled = false;
    xShareButton.disabled = false;

    setStatus('プレビューを更新しました。気に入ったら画像を保存しよう！');
  }
  catch (error) {
    // 描画や出力サイズの検証に失敗した場合は、エラーを記録する。
    console.error(error);

    setStatus(
      'プレビューの作成に失敗しました。設定や画像を確認してください。',
    );

    // 不完全な画像を保存・共有しないようにする。
    downloadButton.disabled = true;
    xShareButton.disabled = true;
  }
};

