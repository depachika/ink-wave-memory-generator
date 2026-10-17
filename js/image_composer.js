
// Canvas 上で写真、フレーム、ロゴを合成する。

export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;

// ロゴ画像ごとに、生成済みの縁取り画像をキャッシュする。
const outlineCache = new WeakMap();


export function drawCover(context, image, width, height, filter = "none")
{
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.save();
  context.filter = filter;
  context.drawImage(image, x, y, drawWidth, drawHeight);
  context.restore();
}

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
