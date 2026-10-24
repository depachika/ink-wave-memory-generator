
import { xShareButton } from './dom.js';


// X投稿用の設定を読み込む
const loadXShareConfig = async () => {
  const response = await fetch('./data/x_share.json');

  if (!response.ok) {
    throw new Error(
      `X投稿設定の読み込みに失敗した: ${response.status}`,
    );
  }

  return await response.json();
};


// X投稿用URLを生成する
export const buildXIntentUrl = (config) => {
  const url = new URL('https://x.com/intent/tweet');

  const text = [
    config.message,
    ...(config.hashtags ?? []).map((tag) => `#${tag}`),
  ].filter(Boolean).join('\n');

  url.searchParams.set('text', text);

  if (config.url) {
    url.searchParams.set('url', config.url);
  }

  return url.toString();
};


// X共有機能を初期化する
export const initializeXShare = async () => {
  let config;

  try {
    config = await loadXShareConfig();
  } catch (error) {
    console.error(error);
    xShareButton.disabled = true;
    return;
  }

  xShareButton.addEventListener('click', () => {
    const intentUrl = buildXIntentUrl(config);

    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  });
};

