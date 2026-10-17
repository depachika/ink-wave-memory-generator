// ロゴ画像を追加する場合は、assets/logos/ に置き、logos 配列へ登録する。
// x と y はロゴの中心位置、size は出力画像の幅に対するロゴの幅。
// outlineColor は縁取り色、outlineWidth は出力画像上の縁取りの太さ（px）。

export const logos = [
  {
    fileName: "IW_logo_black_v.png",
    label: "INK WAVE ロゴ（通常版）",
    x: 12,
    y: 15,
    size: 30,
    rotation: 0,
    outlineColor: "#FFFFFF",
    outlineWidth: 15,
  },
  {
    fileName: "IW_logo_white_v.png",
    label: "INK WAVE ロゴ（白色版）",
    x: 12,
    y: 15,
    size: 30,
    rotation: 0,
    outlineColor: "#003399",
    outlineWidth: 15,
  },
];
