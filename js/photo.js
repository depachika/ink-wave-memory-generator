
import {
  photoInput,
  frameSection,
} from './dom.js';

import { state } from './state.js';

import {
  loadImage,
  deleteImageCache,
} from './image_loader.js';

import {
  setStatus,
  renderPreview,
} from './preview.js';

import { openSection } from './ui.js';
import {
  setPreviewPinEnabled,
  setPreviewPinned,
} from './preview_controls.js';


photoInput.addEventListener('change', async () => {
  const file = photoInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    setStatus('画像ファイルを選択してください。');
    return;
  }

  let url;

  try {
    url = URL.createObjectURL(file);
    const image = await loadImage(url);

    state.photo = image;

    await renderPreview();
    
    // プレビューの描画に成功したら固定ボタンを有効化する
    setPreviewPinEnabled(true);
    // プレビューの表示位置を固定するように変更する
    setPreviewPinned(true);

    openSection(frameSection);
  }
  catch (error) {
    console.error(error);
    setStatus('画像を読み込めませんでした。別の画像を試してください。');
  }
  finally {
    if (url) {
      // キャッシュを削除する
      URL.revokeObjectURL(url);
      deleteImageCache(url);
    }
  }
});
