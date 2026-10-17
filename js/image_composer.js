// Canvas 上で写真、フレーム、ロゴを合成する。

export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;

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

  // 元画像の不透明部分を少しずつずらして描き、輪郭の外側を広げる。
  context.save();

  const steps = Math.max(1, Math.ceil(outlineWidth));
  const angleCount = 24;

  for (let step = 1; step <= steps; step += 1) {
    const radius = Math.min(step, outlineWidth);

    for (let angleIndex = 0; angleIndex < angleCount; angleIndex += 1) {
      const angle = (Math.PI * 2 * angleIndex) / angleCount;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;

      context.drawImage(maskCanvas, offsetX, offsetY);
    }
  }

  // 広げたアルファ領域を指定色にし、元画像部分を抜く。
  context.globalCompositeOperation = "source-in";
  context.fillStyle = outlineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalCompositeOperation = "destination-out";
  context.drawImage(maskCanvas, 0, 0);

  // 縁取りの上に元画像を重ねる。
  context.globalCompositeOperation = "source-over";
  context.drawImage(maskCanvas, 0, 0);
  context.restore();

  return {
    canvas,
    x: padding,
    y: padding,
  };
};

export function drawLogo(context, image, width, height, settings)
{
  // size はキャンバス幅に対する割合。元画像の縦横比は維持する。
  const logoWidth = width * settings.size / 100;
  const logoHeight = logoWidth * image.height / image.width;
  const centerX = width * settings.x / 100;
  const centerY = height * settings.y / 100;
  const outlineWidth = Math.max(0, Number(settings.outlineWidth) || 0);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(settings.rotation * Math.PI / 180);

  if (outlineWidth > 0 && /^#[0-9A-Fa-f]{6}$/.test(settings.outlineColor ?? "")) {
    const outlinedLogo = createLogoWithOutline(
      image,
      logoWidth,
      logoHeight,
      settings.outlineColor,
      outlineWidth,
    );

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
