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

export function drawLogo(context, image, width, height, settings)
{
  // size はキャンバス幅に対する割合。元画像の縦横比は維持する。
  const logoWidth = width * settings.size / 100;
  const logoHeight = logoWidth * image.height / image.width;
  const centerX = width * settings.x / 100;
  const centerY = height * settings.y / 100;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(settings.rotation * Math.PI / 180);
  context.drawImage(image, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
  context.restore();
}
