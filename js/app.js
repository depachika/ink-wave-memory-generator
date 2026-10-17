import { frames, frameLabels } from "./frames.js";
import { logos } from "./logos.js";
import {
  OUTPUT_WIDTH,
  OUTPUT_HEIGHT,
  drawCover,
  drawOverlay,
  drawLogo,
} from "./image_composer.js";

const photoInput = document.querySelector("#photo-input");
const preview = document.querySelector("#preview");
const context = preview.getContext("2d");
const placeholder = document.querySelector("#preview-placeholder");
const status = document.querySelector("#status");
const frameList = document.querySelector("#frame-list");
const logoInput = document.querySelector("#logo-input");
const logoControls = document.querySelector("#logo-controls");
const downloadButton = document.querySelector("#download");
const resetAllButton = document.querySelector("#reset-all");
const resetLogoButton = document.querySelector("#reset-logo");

const logoFields = {
  x: document.querySelector("#logo-x"),
  y: document.querySelector("#logo-y"),
  size: document.querySelector("#logo-size"),
  rotation: document.querySelector("#logo-rotation"),
};

const logoOutputs = {
  x: document.querySelector("#logo-x-value"),
  y: document.querySelector("#logo-y-value"),
  size: document.querySelector("#logo-size-value"),
  rotation: document.querySelector("#logo-rotation-value"),
};

const state = {
  photo: null,
  frame: null,
  logo: null,
  selectedFrame: "",
  selectedLogo: "",
};

const imageCache = new Map();

function loadImage(url)
{
  if (imageCache.has(url))
  {
    return imageCache.get(url);
  }

  const promise = new Promise((resolve, reject) =>
  {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`画像を読み込めない: ${url}`));
    image.src = url;
  });

  imageCache.set(url, promise);
  return promise;
}

function setStatus(message)
{
  status.textContent = message;
}

function getLogoSettings()
{
  return {
    x: Number(logoFields.x.value),
    y: Number(logoFields.y.value),
    size: Number(logoFields.size.value),
    rotation: Number(logoFields.rotation.value),
  };
}

function updateLogoOutputs()
{
  logoOutputs.x.value = `${logoFields.x.value}%`;
  logoOutputs.y.value = `${logoFields.y.value}%`;
  logoOutputs.size.value = `${logoFields.size.value}%`;
  logoOutputs.rotation.value = `${logoFields.rotation.value}°`;
}

function resetLogoSettings()
{
  logoFields.x.value = state.logo?.x ?? 78;
  logoFields.y.value = state.logo?.y ?? 82;
  logoFields.size.value = state.logo?.size ?? 18;
  logoFields.rotation.value = state.logo?.rotation ?? 0;
  updateLogoOutputs();
  renderPreview();
}

async function renderPreview()
{
  context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  if (!state.photo)
  {
    placeholder.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  try
  {
    drawCover(context, state.photo, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    if (state.frame)
    {
      drawOverlay(context, state.frame, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    }

    if (state.logo)
    {
      drawLogo(context, state.logo, OUTPUT_WIDTH, OUTPUT_HEIGHT, getLogoSettings());
    }

    placeholder.hidden = true;
    downloadButton.disabled = false;
    setStatus("プレビューを更新した。気に入ったら画像を保存できる。");
  }
  catch (error)
  {
    console.error(error);
    setStatus("プレビューの作成に失敗した。別の画像を試してほしい。");
    downloadButton.disabled = true;
  }
}

function getFrameLabel(fileName)
{
  const key = fileName.replace(/\.[^.]+$/, "");
  return frameLabels[key] ?? key.replaceAll("_", " ");
}

async function buildFrameChoices()
{
  frameList.replaceChildren();

  if (frames.length === 0)
  {
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = "フレーム素材はまだ登録されていない。assets/frames/ に画像を置き、js/frames.js に登録する。";
    frameList.append(message);
    return;
  }

  for (const frame of frames)
  {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.setAttribute("aria-pressed", "false");

    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.src = `./assets/frames/${frame.fileName}`;

    const label = document.createElement("span");
    label.textContent = frame.label ?? getFrameLabel(frame.fileName);

    button.append(image, label);
    button.addEventListener("click", async () =>
    {
      try
      {
        state.frame = await loadImage(image.src);
        state.selectedFrame = frame.fileName;

        for (const card of frameList.querySelectorAll("button"))
        {
          card.setAttribute("aria-pressed", String(card === button));
        }

        await renderPreview();
      }
      catch (error)
      {
        console.error(error);
        setStatus("フレームを読み込めなかった。ファイル名と配置を確認してほしい。");
      }
    });

    frameList.append(button);
  }
}

async function buildLogoChoices()
{
  for (const logo of logos)
  {
    const option = document.createElement("option");
    option.value = logo.fileName;
    option.textContent = logo.label ?? getFrameLabel(logo.fileName);
    logoInput.append(option);
  }
}

photoInput.addEventListener("change", async () =>
{
  const file = photoInput.files?.[0];

  if (!file)
  {
    return;
  }

  if (!file.type.startsWith("image/"))
  {
    setStatus("画像ファイルを選択してほしい。");
    return;
  }

  try
  {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    state.photo = image;
    await renderPreview();
    URL.revokeObjectURL(url);
  }
  catch (error)
  {
    console.error(error);
    setStatus("写真を読み込めなかった。別の画像を試してほしい。");
  }
});

logoInput.addEventListener("change", async () =>
{
  const fileName = logoInput.value;

  if (!fileName)
  {
    state.logo = null;
    state.selectedLogo = "";
    logoControls.hidden = true;
    await renderPreview();
    return;
  }

  const logo = logos.find((item) => item.fileName === fileName);

  if (!logo)
  {
    return;
  }

  try
  {
    state.logo = await loadImage(`./assets/logos/${logo.fileName}`);
    state.selectedLogo = logo.fileName;
    logoControls.hidden = false;
    resetLogoSettings();
    await renderPreview();
  }
  catch (error)
  {
    console.error(error);
    setStatus("ロゴを読み込めなかった。ファイル名と配置を確認してほしい。");
  }
});

for (const field of Object.values(logoFields))
{
  field.addEventListener("input", () =>
  {
    updateLogoOutputs();
    renderPreview();
  });
}

resetLogoButton.addEventListener("click", resetLogoSettings);

resetAllButton.addEventListener("click", async () =>
{
  photoInput.value = "";
  logoInput.value = "";
  state.photo = null;
  state.frame = null;
  state.logo = null;
  state.selectedFrame = "";
  state.selectedLogo = "";
  logoControls.hidden = true;

  for (const card of frameList.querySelectorAll("button"))
  {
    card.setAttribute("aria-pressed", "false");
  }

  resetLogoSettings();
  await renderPreview();
  setStatus("設定をリセットした。写真を選ぶところから始められる。");
});

downloadButton.addEventListener("click", () =>
{
  if (!state.photo)
  {
    return;
  }

  preview.toBlob((blob) =>
  {
    if (!blob)
    {
      setStatus("画像を書き出せなかった。ブラウザーを変えて試してほしい。");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ink-wave-memory.png";
    document.body.append(link);
    link.click();
    link.remove();

    // ダウンロード開始後に URL を解放する。
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("画像の保存を開始した。端末のダウンロード先を確認してほしい。");
  }, "image/png");
});

async function initialize()
{
  preview.width = OUTPUT_WIDTH;
  preview.height = OUTPUT_HEIGHT;
  updateLogoOutputs();
  await buildFrameChoices();
  await buildLogoChoices();
  await renderPreview();
}

initialize();
