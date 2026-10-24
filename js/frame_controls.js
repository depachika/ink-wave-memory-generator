

import { state } from './state.js';

import {
  frameList,
  frameSection,
  logoSection,
  photoPositionControls,
} from './dom.js';

import { loadImage } from './image_loader.js';
import { setStatus, renderPreview } from './preview.js';


const loadFrames = async () => {
  const response = await fetch('./data/frames.json');

  if (!response.ok) {
    throw new Error(`フレーム一覧の読み込みに失敗した: ${response.status}`);
  }

  return await response.json();
};



/**
 * @function
 * @description
 * フレーム設定の検証
 * frames.jsonに登録された出力サイズが有効か確認する。
 * 不正な設定があれば、どのフレームに問題があるか分かるようにする。
 * @param {*} frame 
 */
const validateFrameConfig = (frame) => {
  const width = frame.output?.width;
  const height = frame.output?.height;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      `フレーム「${frame.fileName ?? 'ファイル名不明'}」の出力サイズが不正です。`,
    );
  }
};



export const getFrameLabel = (fileName) => {
  const key = fileName.replace(/\.[^.]+$/, '');

  return key.replaceAll('_', ' ');
};


/**
 * @function
 * @description
 * フレーム選択肢の中で、どのフレームが選択されているかを画面上で示すための関数。
 * @param {*} selectedButton 
 */
export const updateFrameSelection = (selectedButton) => {
  for (const card of frameList.querySelectorAll('button')) {
    card.setAttribute('aria-pressed', String(card === selectedButton));
  }
};



/**
 * @function
 * @description
 * フレーム選択肢を構築する。
 * @returns 
 */
export const buildFrameChoices = async () => {
  console.log('[frame_controls] buildFrameChoices() 開始');

  // 既存の選択肢をクリアする。
  frameList.replaceChildren();

  let frames;

  // ----------------------------------------------------------
  // 1. フレーム一覧を読み込む
  // ----------------------------------------------------------

  try {
    frames = await loadFrames();

    console.log('[frame_controls] frames.json 読み込み成功', {
      count: Array.isArray(frames) ? frames.length : '配列ではない',
      frames,
    });
  }
  catch (error) {
    console.error('[frame_controls] frames.json 読み込み失敗', error);

    setStatus(
      'フレーム一覧を読み込めませんでした。ファイルの配置を確認してください。',
    );
    return;
  }

  // JSONの最上位が配列であることを確認する。
  if (!Array.isArray(frames)) {
    setStatus('フレーム一覧の形式が正しくありません。');
    return;
  }

  // ----------------------------------------------------------
  // 2. フレーム設定を検証する
  // ----------------------------------------------------------

  try {
    for (const frame of frames) {
      validateFrameConfig(frame);
    }
    console.log('[frame_controls] フレーム設定の検証完了');
  }
  catch (error) {
    console.error(error);
    setStatus(error.message);
    return;
  }

  // ----------------------------------------------------------
  // 3. 「フレームなし」の選択肢を構築する
  // ----------------------------------------------------------

  const noneButton = document.createElement('button');
  noneButton.type = 'button';
  noneButton.className = 'choice-card choice-card-none';
  noneButton.dataset.frameNone = 'true';
  noneButton.setAttribute('aria-pressed', 'false');

  const noneLabel = document.createElement('span');
  noneLabel.textContent = 'フレームなし';
  noneButton.append(noneLabel);

  noneButton.addEventListener('click', async () => {
    // フレーム画像とフレーム設定を両方クリアする。
    state.frame = null;
    state.frameConfig = null;
    state.selectedFrame = '';
    
    // 写真位置調整UI全体を無効化する。
    // fieldset内のスライダー、数値入力欄、ボタンなどが無効になる。
    photoPositionControls.disabled = true;


    // フレーム選択肢の中で、どのフレームが選択されているかを画面上で示す
    updateFrameSelection(noneButton);
    // フレームの下にある画像の位置を調整することがないため、このセクションを畳んで次のセクションを開く
    // frameSection.open = false;
    // logoSection.open = true;

    // 写真位置は維持したままプレビューを更新する。
    await renderPreview();
  });

  frameList.append(noneButton);

  // ----------------------------------------------------------
  // 4. 各フレームの選択肢を構築する
  // ----------------------------------------------------------

  for (const frame of frames) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-card';
    button.setAttribute('aria-pressed', 'false');

    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'lazy';
    image.src = `./assets/frames/${frame.fileName}`;

    const label = document.createElement('span');
    label.textContent = frame.label ?? getFrameLabel(frame.fileName);

    button.append(image, label);

    button.addEventListener('click', async () => {
      try {
        // 画像の読み込みが成功するまで、現在の選択状態を変更しない。
        const loadedFrame = await loadImage(image.src);

        // フレーム画像と、その画像に対応する設定（状態）を保存する。
        state.frame = loadedFrame;
        state.frameConfig = frame;
        state.selectedFrame = frame.fileName;

        // 写真位置調整UI全体を有効化する。
        photoPositionControls.disabled = false;

        // フレーム選択肢の中で、どのフレームが選択されているかを画面上で示す
        updateFrameSelection(button);
        // フレームの下にある画像の位置を調整することを想定して、まだこのセクションを畳まない

        // 写真位置を維持して、新しい出力サイズで描画する。
        await renderPreview();
      }
      catch (error) {
        console.error(error);
        setStatus(
          'フレームを読み込めませんでした。ファイル名と配置を確認してください。\n（ジェネレーター製作者に連絡してください）',
        );
      }
    });

    frameList.append(button);
  }

  console.log('[frame_controls] フレーム選択肢の生成完了', {
    count: frameList.children.length,
    frameList,
  });
};


