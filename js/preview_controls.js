
const previewSection = document.querySelector('.preview-section');
const previewPin = document.querySelector('#preview-pin');
const previewPinLabel = document.querySelector('#preview-pin-label');

const hasPreviewPinElements = () =>
  Boolean(previewSection && previewPin && previewPinLabel);

export const initializePreviewControls = () => {
  if (!hasPreviewPinElements()) {
    console.error('プレビュー固定用のHTML要素が見つかりません。');
    return;
  }

  // 初期状態では固定ボタンを無効化する
  setPreviewPinEnabled(false);

  previewPin.addEventListener('click', () => {
    const isPinned = previewSection.classList.toggle('is-pinned');

    previewPin.classList.toggle('is-pinned', isPinned);
    previewPin.setAttribute('aria-pressed', String(isPinned));
    previewPin.setAttribute(
      'aria-label',
      isPinned
        ? 'プレビューの固定を解除する'
        : 'プレビューを固定する',
    );

    previewPinLabel.textContent = isPinned ? '固定中' : '固定する';
  });
};

export const setPreviewPinEnabled = (enabled) => {
  if (!hasPreviewPinElements()) {
    console.error('プレビュー固定用のHTML要素が見つかりません。');
    return;
  }

  previewPin.disabled = !enabled;

  if (!enabled) {
    previewSection.classList.remove('is-pinned');
    previewPin.classList.remove('is-pinned');
    previewPin.setAttribute('aria-pressed', 'false');
    previewPin.setAttribute('aria-label', 'プレビューを固定する');
    previewPinLabel.textContent = '固定する';
  }
};

export const setPreviewPinned = (pinned) => {
  if (!hasPreviewPinElements()) {
    console.error('プレビュー固定用のHTML要素が見つかりません。');
    return;
  }

  previewSection.classList.toggle('is-pinned', pinned);
  previewPin.classList.toggle('is-pinned', pinned);
  previewPin.setAttribute('aria-pressed', String(pinned));
  previewPin.setAttribute(
    'aria-label',
    pinned
      ? 'プレビューの固定を解除する'
      : 'プレビューを固定する',
  );

  previewPinLabel.textContent = pinned ? '固定中' : '固定する';
};