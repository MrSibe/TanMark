/**
 * Tanmark 主题配置类型定义
 *
 * 定义完整的 JSON 主题配置结构，支持：
 * - 颜色系统（基础色、交互色、编辑器色）
 * - 字体排版（字号、行高、字体族）
 * - UI 样式（圆角、间距、阴影）
 * - 主题继承（extends 字段）
 * - 向后兼容（customCSS 字段）
 */

/**
 * 主题配置总接口
 */
export interface ThemeConfig {
  /** 主题元数据 */
  meta: ThemeMeta

  /** 颜色系统 */
  colors: ColorSystem

  /** 字体排版系统 */
  typography: TypographySystem

  /** UI 样式 */
  ui: UIStyles

  /** 父主题 ID（用于主题继承） */
  extends?: string

  /** 自定义 CSS（向后兼容旧版 CSS 主题） */
  customCSS?: string
}

/**
 * 主题元数据
 */
export interface ThemeMeta {
  /** 唯一标识符（如：github, github-dark） */
  id: string

  /** 显示名称 */
  name: string

  /** 语义化版本号（如：2.0.0） */
  version: string

  /** 作者名称 */
  author: string

  /** 主题描述 */
  description?: string

  /** 主题类型 */
  type: 'light' | 'dark' | 'auto'

  /** 标签（用于分类和搜索） */
  tags?: string[]

  /** 预览主色调（用于主题列表展示） */
  previewColor?: string
}

/**
 * 颜色系统
 */
export interface ColorSystem {
  /* ==================== 基础颜色 ==================== */

  /** 主背景色 - 应用程序的主要内容区域背景 */
  bg: string

  /** 次级背景色 - 用于卡片、面板等元素 */
  bgSecondary: string

  /** 侧边栏背景色 */
  sidebarBg: string

  /* ==================== 文字颜色 ==================== */

  /** 主文字颜色 - 标题、正文等主要文本 */
  fg: string

  /** 次级文字颜色 - 用于辅助信息、描述等 */
  fgSecondary: string

  /** 弱化文字颜色 - 用于禁用状态、占位符等 */
  fgMuted: string

  /** 反色文字 - 用于深色背景上的文字 */
  fgOnDark: string

  /* ==================== 边框和分隔线 ==================== */

  /** 主边框颜色 */
  border: string

  /** 次级边框颜色 - 更淡的边框 */
  borderLight: string

  /** 分隔线颜色 */
  divider: string

  /* ==================== 交互状态颜色 ==================== */

  /** 鼠标悬停背景色 */
  hover: string

  /** 激活/选中状态背景色 */
  active: string

  /** 焦点状态边框颜色 */
  focus: string

  /** 主题强调色 - 用于链接、按钮、徽章等 */
  accent: string

  /** 强调色悬停状态 */
  accentHover: string

  /* ==================== 状态颜色 ==================== */

  /** 成功状态颜色 */
  success: string

  /** 警告状态颜色 */
  warning: string

  /** 错误状态颜色 */
  error: string

  /** 信息状态颜色 */
  info: string

  /* ==================== 编辑器颜色 ==================== */

  /** 编辑器专用颜色 */
  editor: EditorColors
}

/**
 * 编辑器颜色
 */
export interface EditorColors {
  /* ==================== 基础文字 ==================== */

  /** 编辑器文字颜色 */
  text: string

  /** 标题颜色（H1-H6 的默认颜色） */
  heading: string

  /** H1 颜色（可选，默认使用 heading） */
  h1?: string

  /** H2 颜色（可选，默认使用 heading） */
  h2?: string

  /** H3 颜色（可选，默认使用 heading） */
  h3?: string

  /* ==================== 链接颜色 ==================== */

  /** 链接颜色 */
  link: string

  /** 链接悬停颜色 */
  linkHover: string

  /* ==================== 代码颜色 ==================== */

  /** 行内代码背景色 */
  codeBg: string

  /** 行内代码文字颜色 */
  codeColor: string

  /** 行内代码边框颜色 */
  codeBorder: string

  /** 代码块背景色 */
  codeblockBg: string

  /** 代码块文字颜色 */
  codeblockText: string

  /* ==================== 引用块颜色 ==================== */

  /** 引用块左边框颜色 */
  blockquoteBorder: string

  /** 引用块背景色 */
  blockquoteBg: string

  /** 引用块文字颜色 */
  blockquoteText: string

  /* ==================== 表格颜色 ==================== */

  /** 表格边框颜色 */
  tableBorder: string

  /** 表头背景色 */
  tableHeaderBg: string

  /** 表头文字颜色 */
  tableHeaderText: string

  /** 偶数行背景色 */
  tableRowEvenBg: string

  /** 悬停行背景色 */
  tableRowHoverBg: string

  /* ==================== 其他元素 ==================== */

  /** 水平线颜色 */
  hrColor: string

  /** 列表标记颜色（如：列表项前的圆点） */
  listMarkerColor: string

  /** 任务复选框边框颜色 */
  taskCheckboxBorder: string

  /** 任务复选框选中颜色 */
  taskCheckboxChecked: string

  /* ==================== 编辑器增强样式 ==================== */

  /** 文字选中背景色 */
  selectionBg: string

  /** 文字选中文字颜色 */
  selectionColor: string

  /** 任务复选框悬停背景色 */
  taskCheckboxHoverBg: string

  /** 任务复选框悬停边框颜色 */
  taskCheckboxHoverBorder: string

  /** 已完成任务文字颜色 */
  taskCompletedText: string

  /** 代码块边框颜色 */
  codeblockBorder: string

  /** 代码块阴影 */
  codeblockShadow: string
}

/**
 * 字体排版系统
 */
export interface TypographySystem {
  /* ==================== 编辑器字体 ==================== */

  /** 基础字号（像素） */
  fontSize: number

  /** 行高（倍数） */
  lineHeight: number

  /** 主字体族（如：-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif） */
  fontFamily: string

  /** 代码字体族（如：'Monaco', 'Menlo', 'Ubuntu Mono', monospace） */
  codeFontFamily: string

  /** 标题字体族（可选，默认使用 fontFamily） */
  headingFontFamily?: string

  /** 标题字重（如：400, 500, 600, 700） */
  headingFontWeight: number

  /* ==================== 标题字号 ==================== */

  /** H1 字号（rem 单位） */
  h1Size: number

  /** H2 字号（rem 单位） */
  h2Size: number

  /** H3 字号（rem 单位） */
  h3Size: number

  /** H4 字号（rem 单位） */
  h4Size: number

  /** H5 字号（rem 单位） */
  h5Size: number

  /** H6 字号（rem 单位） */
  h6Size: number

  /* ==================== 编辑器布局 ==================== */

  /** 最大宽度（像素） */
  maxWidth: number

  /** 内边距（像素） */
  padding: number
}

/**
 * UI 样式
 */
export interface UIStyles {
  /* ==================== 圆角 ==================== */

  /** 小圆角（像素） */
  borderRadiusSm: number

  /** 中圆角（像素） */
  borderRadiusMd: number

  /** 大圆角（像素） */
  borderRadiusLg: number

  /* ==================== 间距 ==================== */

  /** 按钮内边距（CSS 值，如：'8px 16px'） */
  buttonPadding: string

  /** 输入框内边距（CSS 值，如：'8px 12px'） */
  inputPadding: string

  /* ==================== 过渡动画 ==================== */

  /** 快速过渡时间（CSS 值，如：'0.15s'） */
  transitionFast: string

  /** 正常过渡时间（CSS 值，如：'0.2s'） */
  transitionNormal: string

  /** 慢速过渡时间（CSS 值，如：'0.3s'） */
  transitionSlow: string

  /* ==================== 阴影 ==================== */

  /** 小阴影（CSS 值，如：'0 1px 2px rgba(0, 0, 0, 0.05)'） */
  shadowSm: string

  /** 中阴影（CSS 值） */
  shadowMd: string

  /** 大阴影（CSS 值） */
  shadowLg: string

  /* ==================== 滚动条 ==================== */

  /** 滚动条宽度（像素） */
  scrollbarWidth: number

  /** 滚动条轨道颜色 */
  scrollbarTrack: string

  /** 滚动条滑块颜色 */
  scrollbarThumb: string

  /** 滚动条滑块悬停颜色 */
  scrollbarThumbHover: string

  /** 滚动条圆角（像素） */
  scrollbarRadius: number

  /* ==================== 通用样式 ==================== */

  /** 通用圆角（像素） */
  borderRadius: number

  /** 通用过渡时间（CSS 值，如：'0.2s'） */
  transitionSpeed: string

  /* ==================== 特殊元素 ==================== */

  /** Resizer默认背景色 */
  resizerBg: string

  /** Resizer悬停背景色 */
  resizerHoverBg: string

  /** 空状态文字颜色 */
  emptyStateColor: string

  /* ==================== 大纲样式 ==================== */

  /** 大纲字号（CSS 值，如：'0.8125rem'） */
  outlineFontSize: string

  /** 大纲列表内边距（CSS 值，如：'0.5rem 0'） */
  outlineListPadding: string

  /** 大纲项纵向内边距（CSS 值，如：'0.3rem'） */
  outlineItemPaddingY: string

  /** 大纲项横向内边距（CSS 值，如：'0.5rem'） */
  outlineItemPaddingX: string

  /** 大纲层级缩进步进（CSS 值，如：'12px'） */
  outlineIndentStep: string

  /** 大纲空状态内边距（CSS 值，如：'0.75rem'） */
  outlineEmptyPadding: string

  /** 大纲空状态字号（CSS 值，如：'0.75rem'） */
  outlineEmptyFontSize: string
}

/**
 * 主题验证结果
 */
export interface ThemeValidationResult {
  /** 是否通过验证 */
  valid: boolean

  /** 错误信息列表 */
  errors: string[]

  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 主题信息（用于主题列表展示）
 */
export interface ThemeInfo {
  /** 主题 ID */
  id: string

  /** 主题名称 */
  name: string

  /** 主题文件路径 */
  path: string

  /** 主题内容（CSS 或 JSON） */
  content?: string

  /** 主题配置（仅 JSON 主题） */
  config?: ThemeConfig

  /** 是否为默认主题 */
  isDefault: boolean

  /** 主题来源 */
  source: 'builtin' | 'user'

  /** 主题格式 */
  format: 'css' | 'json'

  /** 主题预览颜色（从配置中读取） */
  previewColor?: string
}
