
// Canvas 上で写真、フレーム、ロゴを合成する。

// ロゴ画像ごとに、生成済みの縁取り画像をキャッシュする。
const outlineCache = new WeakMap();


// ============================================================
// 写真の描画
// ============================================================

/**
 * @function
 * @description
 * 写真を出力領域全体に広げ、指定された位置に描画する関数。
 *
 * positionX / positionY は、canvasの中心を原点とした移動量（%）。
 * Xは正数で右、負数で左へ移動する。
 * Yは正数で上、負数で下へ移動する。
 *
 * 移動量の基準は、Xがcanvasの幅、Yがcanvasの高さ。
 * 写真がcanvasからはみ出したり、空白が生じたりすることを許容する。
 *
 * zoom は将来の拡大率調整に備えた内部引数。今回は初期値の1を使用する。
 *
 * @param {*} context
 * @param {*} image
 * @param {*} width
 * @param {*} height
 * @param {*} positionX
 * @param {*} positionY
 * @param {*} zoom
 * @param {*} filter
 */
export const drawCover = (
  context,
  image,
  width,
  height,
  positionX = 0,
  positionY = 0,
  zoom = 1,
  filter = 'none',
) => {
  // 出力領域を覆うために必要な最小倍率を求める。
  const baseScale = Math.max(
    width / image.width,
    height / image.height,
  );

  // 拡大率を適用する。今回はzoom=1なので従来と同じ倍率になる。
  const scale = baseScale * zoom;

  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  // canvasの中心を基準に、指定された移動量を反映する。
  // Xは正数で右方向へ移動する。
  const centerX = width / 2 + width * positionX / 100;

  // canvasのY座標は下方向が正なので、Yは符号を反転する。
  // Yは正数で上方向、負数で下方向へ移動する。
  const centerY = height / 2 - height * positionY / 100;

  // 写真の中心座標から、描画する左上の座標を求める。
  const x = centerX - drawWidth / 2;
  const y = centerY - drawHeight / 2;

  context.save();
  context.filter = filter;
  context.drawImage(image, x, y, drawWidth, drawHeight);
  context.restore();
};


export function drawOverlay(context, image, width, height)
{
  context.drawImage(image, 0, 0, width, height);
}


const createLogoWithOutline = (image, logoWidth, logoHeight, outlineColor, outlineWidth) => {
  const padding = Math.ceil(outlineWidth) + 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(logoWidth + padding * 2);
  canvas.height = Math.ceil(logoHeight + padding * 2);

  const context = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;

  const maskContext = maskCanvas.getContext("2d");
  maskContext.drawImage(image, padding, padding, logoWidth, logoHeight);

  // 縁取りの外周を複数方向に広げる。
  const angleCount = 64;  // デフォルトは32でやっていた
  const steps = Math.max(1, Math.ceil(outlineWidth));

  for (let step = 1; step <= steps; step += 1) {
    const radius = outlineWidth * step / steps;

    for (let angleIndex = 0; angleIndex < angleCount; angleIndex += 1) {
      const angle = (Math.PI * 2 * angleIndex) / angleCount;

      context.drawImage(
        maskCanvas,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
    }
  }

  // 広げた領域を指定色にする。
  context.globalCompositeOperation = "source-in";
  context.fillStyle = outlineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 元画像部分を除く。
  context.globalCompositeOperation = "destination-out";
  context.drawImage(maskCanvas, 0, 0);

  // 元画像を縁取りの上に重ねる。
  context.globalCompositeOperation = "source-over";
  context.drawImage(maskCanvas, 0, 0);

  return {
    canvas,
    x: padding,
    y: padding,
  };
};


export function drawLogo(context, image, width, height, settings) {
  const logoWidth = width * settings.size / 100;
  const logoHeight = logoWidth * image.height / image.width;
  const centerX = width * settings.x / 100;
  const centerY = height * settings.y / 100;
  const outlineWidth = Math.max(0, Number(settings.outlineWidth) || 0);
  const outlineColor = settings.outlineColor ?? "#FFFFFF";

  context.save();
  context.translate(centerX, centerY);
  context.rotate(settings.rotation * Math.PI / 180);

  if (outlineWidth > 0 && /^#[0-9A-Fa-f]{6}$/.test(outlineColor)) {
    let cache = outlineCache.get(image);

    if (!cache) {
      cache = new Map();
      outlineCache.set(image, cache);
    }

    const cacheKey = [
      logoWidth,
      logoHeight,
      outlineColor.toUpperCase(),
      outlineWidth,
    ].join(":");

    let outlinedLogo = cache.get(cacheKey);

    if (!outlinedLogo) {
      outlinedLogo = createLogoWithOutline(
        image,
        logoWidth,
        logoHeight,
        outlineColor,
        outlineWidth,
      );

      cache.set(cacheKey, outlinedLogo);
    }

    context.drawImage(
      outlinedLogo.canvas,
      -logoWidth / 2 - outlinedLogo.x,
      -logoHeight / 2 - outlinedLogo.y,
    );
  }
  else {
    context.drawImage(image, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
  }

  context.restore();
}

/**
 * @function
 * @description
 * フレームの有無に応じて、出力画像の画素寸法を決定する。
 * フレームなしの場合は写真の元サイズを使用する。
 * フレームありの場合は、フレーム設定に登録された出力サイズを使用する。
 * @param {*} photo 
 * @param {*} frame 
 * @param {*} frameConfig 
 * @returns 
 */
export const getOutputSize = (photo, frame, frameConfig = null) => {
  if (!photo) {
    return {
      width: 1920,
      height: 1080,
    };
  }

  if (!frame) {
    return {
      width: photo.width,
      height: photo.height,
    };
  }

  const output = frameConfig?.output;

  if (
    !Number.isFinite(output?.width) ||
    !Number.isFinite(output?.height) ||
    output.width <= 0 ||
    output.height <= 0
  ) {
    throw new Error('フレームの出力サイズが正しく設定されていません。');
  }

  return {
    width: output.width,
    height: output.height,
  };
};
