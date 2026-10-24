

import { state } from './state.js';
import { downloadButton, preview } from './dom.js';
import { setStatus } from './preview.js';


export const initializeImageDownload = () => {
  downloadButton.addEventListener('click', () => {
    if (!state.photo) {
      return;
    }

    preview.toBlob((blob) => {
      if (!blob) {
        setStatus(
          '画像の書き出しに失敗しました。ブラウザーを変えて試してください。',
        );
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'ink-wave-memory.png';

      document.body.append(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setStatus(
        '画像の保存を開始しました。端末のダウンロード先を確認してください。',
      );
    }, 'image/png');
  });
};

