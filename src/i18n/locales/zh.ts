import { TranslationDictionary } from '../../types/i18n';

export const zh: TranslationDictionary = {
  // App & Brand
  appTitle: 'LoveJaz - 家族谱系图',
  appSubtitle: '世代传承家族历史与优良传统',
  newTree: '新建谱系',
  sampleTree: '示例家谱',
  shareLink: '分享链接',
  exportImage: '导出图表',
  deployGuide: '部署指南',
  loveJazGuide: 'Love Jaz 指南',
  loveJazGuideTitle: '💖 如何爱 Jaz — 使用手册 v1.0',
  userManualTab: '💖 如何关爱 Jaz',
  deployGuideTab: '🚀 免费全球一键部署',
  language: '语言',

  // Pedigree Symbols & Roles
  male: '男性（方形）',
  female: '女性（圆形）',
  generation: '世代',
  generationLabel: '第 {{num}} 代',
  spouse: '配偶',
  addSpouse: '+ 添加配偶',
  addChild: '+ 添加子女',
  addParents: '+ 添加父母',
  editProfile: '编辑资料',
  deleteMember: '删除成员',
  deleteConfirmTitle: '确认删除成员',
  deleteConfirmDesc: '您确定要删除 {{name}} 吗？此操作无法撤销。',
  marriage: '婚姻',
  legend: '谱系图例',
  addChildTitle: '添加子女',
  childName: '子女姓名',

  // Profile Fields
  name: '姓名',
  gender: '性别',
  birthYear: '出生年份',
  age: '年龄',
  deceased: '已故',
  deceasedBadge: '卒',
  living: '在世',
  notes: '备注 / 个人生平',
  titleRole: '头衔 / 称谓',
  cancel: '取消',
  save: '保存更改',
  close: '关闭',
  confirm: '确认',

  // Canvas Controls
  zoomIn: '放大',
  zoomOut: '缩小',
  resetZoom: '重置缩放',
  fitView: '全貌居中',
  toggleGenerations: '切换世代标注',
  undo: '撤销',
  redo: '重做',
  theme: '主题风格',

  // Themes
  themeMinimalist: '极简纯白（明亮）',
  themeVintage: '皇家复古羊皮纸',
  themeNavy: '典雅海军蓝与金（蓝色）',
  themeDark: '深色演播室（暗黑）',
  themePink: '浪漫粉红 LoveJaz（爱心）',
  themeLight: '明亮风格',
  themeDarkShort: '暗黑风格',
  themePinkShort: '粉红爱心',
  themeNavyShort: '海军蓝',
  themeVintageShort: '羊皮纸',
  themeSelector: '主题风格',

  // Export Modal
  exportTitle: '导出家谱图',
  exportFormat: '文件格式',
  exportResolution: '清晰度',
  exportTheme: '风格',
  includeTitle: '包含家谱标题',
  includeGenerations: '包含世代坐标轴',
  includeLegend: '包含图例（男性 / 女性）',
  includeBorder: '包含装饰边框',
  downloadPng: '下载 PNG 图片',
  downloadSvg: '下载 SVG 矢量图',
  printPdf: '打印 / 导出 PDF',

  // Share Modal
  shareModalTitle: '分享家谱',
  shareModalDesc: '任何拥有此链接的人均可直接查看和探索此家谱，无需登录。',
  copyLink: '复制链接',
  linkCopied: '链接已复制到剪贴板！',
  downloadJson: '下载备份文件 (JSON)',
  uploadJson: '从 JSON 恢复',

  // Deployment Guide
  deployGuideTitle: '免费全球部署指南',
  deployVercel: '使用 Vercel 一键部署',
  deployCloudflare: '使用 Cloudflare Pages 部署',
  deployGithub: '使用 GitHub Pages 部署',

  // Extra Tree Dialogs & Notifications
  sampleTreeTitle: '世代传承家族谱系',
  newTreeTitle: '我的家族谱系',
  resetTreeConfirm: '创建新的家谱？',
  resetTreeDesc: '确定吗？当前未保存的更改将被替换。',

  // Spacing & Drag Stretch
  spacing: '间距',
  adjustSpacing: '调整间距',
  horizontalSpacing: '左右横向间距',
  verticalSpacing: '上下世代间距',
  dragToStretch: '拖动以拉伸间距',
  compactSpacing: '紧凑',
  defaultSpacing: '标准',
  spaciousSpacing: '宽松',
  resetSpacing: '重置间距',
};
