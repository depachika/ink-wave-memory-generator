

const imageCache = new Map();

// 入力画像の総画素数の上限。
// UHD 4K（3840 × 2160 = 8,294,400画素）は許容する。
// 9,000,000画素以上の画像は読み込み対象外とする。
const MAX_IMAGE_PIXELS = 9_000_000;

export const loadImage = (url) => {
  // 同じURLの画像がキャッシュに存在する場合は再利用する。
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      // 画像の読み込み後、幅と高さから総画素数を計算する。
      const totalPixels = image.width * image.height;

      // 上限以上の画像は受け付けない。
      if (totalPixels >= MAX_IMAGE_PIXELS) {
        reject(
          new Error(
            `画像の総画素数が上限を超えています: ${image.width} × ${image.height} = ${totalPixels}画素（上限: ${MAX_IMAGE_PIXELS - 1}画素）`
          )
        );
        return;
      }

      // 制限を満たした画像を返す。
      resolve(image);
    };

    // 画像を読み込めなかった場合はエラーにする。
    image.onerror = () => {
      reject(new Error(`画像を読み込めない: ${url}`));
    };

    // 画像の読み込みを開始する。
    image.src = url;
  });

  // 読み込み処理をキャッシュに登録する。
  imageCache.set(url, promise);

  // 成功した画像はキャッシュに残す。
  // 失敗した場合はキャッシュを削除し、再試行できるようにする。
  promise.catch(() => {
    // 別の読み込み処理が同じURLで登録されていた場合は削除しない。
    if (imageCache.get(url) === promise) {
      imageCache.delete(url);
    }
  });

  return promise;
};

export const deleteImageCache = (url) => {
  // 指定されたURLのキャッシュを削除する。
  imageCache.delete(url);
};
