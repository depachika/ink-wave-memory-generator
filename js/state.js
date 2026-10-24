
export const state = {
  // 選択・読み込み済みの写真
  photo: null,

  // 読み込み済みのフレーム画像
  frame: null,

  // 選択中のフレーム設定（frames.jsonの該当項目）
  // 出力画像の幅・高さを参照するために保持する。
  frameConfig: null,

  // 選択・読み込み済みのロゴ画像
  logo: null,

  // 選択中のフレーム・ロゴ
  selectedFrame: '',
  selectedLogo: '',
  selectedLogoConfig: null,

  // ロゴの縁取り色
  outlineColor: '#FFFFFF',

  // 写真の移動量（出力canvasの幅・高さに対する割合）
  // Xは正数で右、負数で左へ移動する。
  // Yは正数で上、負数で下へ移動する。
  // X・Yともに0%なら、写真の中心はcanvasの中心に一致する。
  // フレームを切り替えても、この値は維持する。
  photoPosition: {
    x: 0,
    y: 0,
  },
};
