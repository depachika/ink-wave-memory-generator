// assets/frames/ 内の画像を選択肢として扱う。
// 表示名を変更したい素材だけ、labels にファイル名と表示名を登録する。
// GitHub Pages ではフォルダー内のファイル一覧を自動取得できないため、
// frames 配列にファイル名を追加する必要がある。

export const frames = [
  // 例: { fileName: "congratulations_frame.png", label: "おめでとう！" },
  {
    fileName: "letter_box_inkwave.png",
    label: "映画風フレーム"
  },
  { 
    fileName: "congratulations_frame.png",
    label: "おめでとうフレーム"
  },
  {
    fileName: "oil_painting_aesthetic_frame.png",
    label: "美麗なフレーム"
  },
];

export const frameLabels = {
  // congratulations_frame: "おめでとう！",
};
