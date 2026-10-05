import { TranslationDictionary } from '../../types/i18n';

export const ja: TranslationDictionary = {
  // App & Brand
  appTitle: 'LoveJaz - 家系図・家系ペディグリー',
  appSubtitle: '何世代にもわたる家族の伝統と血統を大切に残す',
  newTree: '新規家系図',
  sampleTree: 'サンプル家系図',
  shareLink: 'リンクを共有',
  exportImage: 'エクスポート',
  deployGuide: 'デプロイ手順',
  loveJazGuide: 'Love Jaz ガイド',
  loveJazGuideTitle: '💖 How to Love Jaz — ユーザーマニュアル v1.0',
  userManualTab: '💖 Jazを愛する方法',
  deployGuideTab: '🚀 無料グローバル公開・デプロイ',
  language: '言語',

  // Pedigree Symbols & Roles
  male: '男性（四角）',
  female: '女性（丸）',
  generation: '世代',
  generationLabel: '第{{num}}世代',
  spouse: '配偶者',
  addSpouse: '+ 配偶者を追加',
  addChild: '+ 子供を追加',
  addParents: '+ 両親を追加',
  editProfile: 'プロフィール編集',
  deleteMember: 'メンバーを削除',
  deleteConfirmTitle: 'メンバー削除の確認',
  deleteConfirmDesc: '本当に {{name}} を削除しますか？この操作は取り消せません。',
  marriage: '婚姻',
  legend: '系図の凡例',
  addChildTitle: '子供を追加',
  childName: '子供の名前',

  // Profile Fields
  name: '氏名',
  gender: '性別',
  birthYear: '生年',
  age: '年齢',
  deceased: '故人',
  deceasedBadge: '没',
  living: '生存',
  notes: 'メモ・略歴',
  titleRole: '肩書・役割',
  cancel: 'キャンセル',
  save: '変更を保存',
  close: '閉じる',
  confirm: '確認',

  // Canvas Controls
  zoomIn: '拡大',
  zoomOut: '縮小',
  resetZoom: 'ズームをリセット',
  fitView: '画面に合わせる',
  toggleGenerations: '世代ラベル表示切替',
  undo: '元に戻す',
  redo: 'やり直す',
  theme: 'テーマ',

  // Themes
  themeMinimalist: 'ミニマリスト・クリーン（ライト）',
  themeVintage: 'ロイヤル・ヴィンテージ羊皮紙',
  themeNavy: 'エレガント・ネイビー＆ゴールド（ブルー）',
  themeDark: 'ダーク・スタジオ（ダーク）',
  themePink: 'ロマンティック・ピンク LoveJaz（ハート）',
  themeLight: 'ライト',
  themeDarkShort: 'ダーク',
  themePinkShort: 'ピンク（ハート）',
  themeNavyShort: 'ネイビーブルー',
  themeVintageShort: 'ヴィンテージ',
  themeSelector: 'テーマ',

  // Export Modal
  exportTitle: '家系図のエクスポート',
  exportFormat: 'フォーマット',
  exportResolution: '解像度',
  exportTheme: 'テーマ',
  includeTitle: '家系図タイトルを含める',
  includeGenerations: '世代軸ラベルを含める',
  includeLegend: '凡例（男性・女性）を含める',
  includeBorder: '装飾フレームを含める',
  downloadPng: 'PNGをダウンロード',
  downloadSvg: 'SVGベクターをダウンロード',
  printPdf: '印刷 / PDF出力',

  // Share Modal
  shareModalTitle: '家系図を共有',
  shareModalDesc: 'このリンクを知っている人は、ログイン不要で誰でもこの家系図を閲覧・探索できます。',
  copyLink: 'リンクをコピー',
  linkCopied: 'リンクをクリップボードにコピーしました！',
  downloadJson: 'バックアップを保存 (JSON)',
  uploadJson: 'JSONから復元',

  // Deployment Guide
  deployGuideTitle: '無料グローバル公開・デプロイ手順',
  deployVercel: 'Vercelでデプロイ（ワンクリック）',
  deployCloudflare: 'Cloudflare Pagesでデプロイ',
  deployGithub: 'GitHub Pagesでデプロイ',

  // Extra Tree Dialogs & Notifications
  sampleTreeTitle: '伝統の家族系図',
  newTreeTitle: '私の家系図',
  resetTreeConfirm: '新しい家系図を作成しますか？',
  resetTreeDesc: '本当によろしいですか？現在の未保存の変更内容は上書きされます。',

  // Spacing & Drag Stretch
  spacing: '間隔',
  adjustSpacing: '間隔を調整・拡張',
  horizontalSpacing: '左右の間隔',
  verticalSpacing: '上下の間隔（世代）',
  dragToStretch: 'ドラッグして間隔を伸縮',
  compactSpacing: 'コンパクト',
  defaultSpacing: '標準',
  spaciousSpacing: 'ゆったり',
  resetSpacing: '間隔をリセット',
};
