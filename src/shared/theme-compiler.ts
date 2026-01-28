/**
 * Tanmark 主题编译器
 *
 * 将 JSON 主题配置编译为 CSS Variables
 */

import {
  ThemeConfig,
  ColorSystem,
  TypographySystem,
  UIStyles,
  EditorColors
} from '@shared/types/theme'

/**
 * 主题编译器类
 */
export class ThemeCompiler {
  /**
   * 将主题配置编译为完整的 CSS
   */
  compileToCSS(config: ThemeConfig): string {
    const cssParts: string[] = []

    // CSS 文件头部注释
    cssParts.push(this.generateHeader(config))

    // 生成 CSS 变量
    cssParts.push(':root, .dark {')
    cssParts.push(this.compileShadcnVars(config))
    cssParts.push(this.compileColors(config.colors))
    cssParts.push(this.compileTypography(config.typography))
    cssParts.push(this.compileUIStyles(config.ui))
    cssParts.push('}')

    // 添加自定义 CSS（向后兼容）
    if (config.customCSS) {
      cssParts.push('')
      cssParts.push('/* 自定义 CSS（向后兼容） */')
      cssParts.push(config.customCSS)
    }

    return cssParts.join('\n')
  }

  /**
   * 生成 CSS 文件头部注释
   */
  private generateHeader(config: ThemeConfig): string {
    const meta = config.meta
    const lines = [
      '/**',
      ` * ============================================`,
      ` * ${meta.name} v${meta.version}`,
      ` * ============================================`,
      ` *`
    ]

    if (meta.description) {
      lines.push(` * ${meta.description}`)
      lines.push(` *`)
    }

    lines.push(` * 作者: ${meta.author}`)
    lines.push(` * 类型: ${meta.type}`)
    lines.push(` *`)

    if (meta.tags && meta.tags.length > 0) {
      lines.push(` * 标签: ${meta.tags.join(', ')}`)
      lines.push(` *`)
    }

    lines.push(` * @theme-name: ${meta.name}`)
    lines.push(` * @theme-author: ${meta.author}`)
    lines.push(` * @theme-version: ${meta.version}`)
    lines.push(` * @theme-type: ${meta.type}`)
    if (meta.previewColor) {
      lines.push(` * @theme-color: ${meta.previewColor}`)
    }
    lines.push(` */`)

    return lines.join('\n')
  }

  /**
   * 编译颜色系统
   */
  private compileColors(colors: ColorSystem): string {
    const lines: string[] = []

    lines.push('  /* ==================== 基础颜色 ==================== */')
    lines.push(`  --color-bg: ${colors.bg};`)
    lines.push(`  --color-bg-secondary: ${colors.bgSecondary};`)
    lines.push(`  --color-sidebar-bg: ${colors.sidebarBg};`)
    lines.push('')

    lines.push('  /* ==================== 文字颜色 ==================== */')
    lines.push(`  --color-fg: ${colors.fg};`)
    lines.push(`  --color-fg-secondary: ${colors.fgSecondary};`)
    lines.push(`  --color-fg-muted: ${colors.fgMuted};`)
    lines.push(`  --color-fg-on-dark: ${colors.fgOnDark};`)
    lines.push('')

    lines.push('  /* ==================== 边框和分隔线 ==================== */')
    lines.push(`  --color-border: ${colors.border};`)
    lines.push(`  --color-border-light: ${colors.borderLight};`)
    lines.push(`  --color-divider: ${colors.divider};`)
    lines.push('')

    lines.push('  /* ==================== 交互状态颜色 ==================== */')
    lines.push(`  --color-hover: ${colors.hover};`)
    lines.push(`  --color-active: ${colors.active};`)
    lines.push(`  --color-focus: ${colors.focus};`)
    lines.push(`  --color-accent: ${colors.accent};`)
    lines.push(`  --color-accent-hover: ${colors.accentHover};`)
    lines.push('')

    lines.push('  /* ==================== 状态颜色 ==================== */')
    lines.push(`  --color-success: ${colors.success};`)
    lines.push(`  --color-warning: ${colors.warning};`)
    lines.push(`  --color-error: ${colors.error};`)
    lines.push(`  --color-info: ${colors.info};`)
    lines.push('')

    lines.push('  /* ==================== 编辑器颜色 ==================== */')
    lines.push(...this.compileEditorColors(colors.editor))

    return lines.join('\n')
  }

  /**
   * 同步 shadcn/ui 基础变量，避免暗色主题下出现浅色边框/文字
   */
  private compileShadcnVars(config: ThemeConfig): string {
    const colors = config.colors
    const isDarkTheme = config.meta?.type === 'dark'
    const lines: string[] = []

    lines.push(`  color-scheme: ${isDarkTheme ? 'dark' : 'light'};`)
    lines.push(`  --background: ${colors.bg};`)
    lines.push(`  --foreground: ${colors.fg};`)
    lines.push(`  --card: ${colors.bgSecondary};`)
    lines.push(`  --card-foreground: ${colors.fg};`)
    lines.push(`  --popover: ${colors.bgSecondary};`)
    lines.push(`  --popover-foreground: ${colors.fg};`)
    lines.push(`  --primary: ${colors.accent};`)
    lines.push(`  --primary-foreground: ${colors.fgOnDark};`)
    lines.push(`  --secondary: ${colors.bgSecondary};`)
    lines.push(`  --secondary-foreground: ${colors.fg};`)
    lines.push(`  --muted: ${colors.bgSecondary};`)
    lines.push(`  --muted-foreground: ${colors.fgMuted};`)
    lines.push(`  --accent: ${colors.hover};`)
    lines.push(`  --accent-foreground: ${colors.fg};`)
    lines.push(`  --destructive: ${colors.error};`)
    lines.push(`  --destructive-foreground: ${colors.fgOnDark};`)
    lines.push(`  --border: ${colors.border};`)
    lines.push(`  --input: ${colors.borderLight};`)
    lines.push(`  --ring: ${colors.focus};`)
    lines.push(`  --sidebar: ${colors.sidebarBg};`)
    lines.push(`  --sidebar-foreground: ${colors.fg};`)
    lines.push(`  --sidebar-primary: ${colors.accent};`)
    lines.push(`  --sidebar-primary-foreground: ${colors.fgOnDark};`)
    lines.push(`  --sidebar-accent: ${colors.hover};`)
    lines.push(`  --sidebar-accent-foreground: ${colors.fg};`)
    lines.push(`  --sidebar-border: ${colors.border};`)
    lines.push(`  --sidebar-ring: ${colors.focus};`)
    lines.push('')

    return lines.join('\n')
  }

  /**
   * 编译编辑器颜色
   */
  private compileEditorColors(editor: EditorColors): string {
    const lines: string[] = []

    lines.push('  /* 编辑器基础文字 */')
    lines.push(`  --editor-text-color: ${editor.text};`)
    lines.push(`  --editor-heading-color: ${editor.heading};`)
    lines.push(`  --editor-h1-color: ${editor.h1 || editor.heading};`)
    lines.push(`  --editor-h2-color: ${editor.h2 || editor.heading};`)
    lines.push(`  --editor-h3-color: ${editor.h3 || editor.heading};`)
    lines.push('')

    lines.push('  /* 编辑器链接 */')
    lines.push(`  --editor-link-color: ${editor.link};`)
    lines.push(`  --editor-link-hover-color: ${editor.linkHover};`)
    lines.push('')

    lines.push('  /* 行内代码 */')
    lines.push(`  --editor-code-bg: ${editor.codeBg};`)
    lines.push(`  --editor-code-color: ${editor.codeColor};`)
    lines.push(`  --editor-code-border: ${editor.codeBorder};`)
    lines.push('')

    lines.push('  /* 代码块 */')
    lines.push(`  --editor-codeblock-bg: ${editor.codeblockBg};`)
    lines.push(`  --editor-codeblock-text: ${editor.codeblockText};`)
    lines.push('')

    lines.push('  /* 引用块 */')
    lines.push(`  --editor-blockquote-border: ${editor.blockquoteBorder};`)
    lines.push(`  --editor-blockquote-bg: ${editor.blockquoteBg};`)
    lines.push(`  --editor-blockquote-text: ${editor.blockquoteText};`)
    lines.push('')

    lines.push('  /* 表格 */')
    lines.push(`  --editor-table-border: ${editor.tableBorder};`)
    lines.push(`  --editor-table-header-bg: ${editor.tableHeaderBg};`)
    lines.push(`  --editor-table-header-text: ${editor.tableHeaderText};`)
    lines.push(`  --editor-table-row-even-bg: ${editor.tableRowEvenBg};`)
    lines.push(`  --editor-table-row-hover-bg: ${editor.tableRowHoverBg};`)
    lines.push('')

    lines.push('  /* 其他元素 */')
    lines.push(`  --editor-hr-color: ${editor.hrColor};`)
    lines.push(`  --editor-list-marker-color: ${editor.listMarkerColor};`)
    lines.push(`  --editor-task-checkbox-border: ${editor.taskCheckboxBorder};`)
    lines.push(`  --editor-task-checkbox-checked: ${editor.taskCheckboxChecked};`)
    lines.push('')

    lines.push('  /* 编辑器增强样式 */')
    lines.push(`  --selection-bg: ${editor.selectionBg};`)
    lines.push(`  --selection-color: ${editor.selectionColor};`)
    lines.push(`  --task-checkbox-hover-bg: ${editor.taskCheckboxHoverBg};`)
    lines.push(`  --task-checkbox-hover-border: ${editor.taskCheckboxHoverBorder};`)
    lines.push(`  --task-completed-text: ${editor.taskCompletedText};`)
    lines.push(`  --codeblock-border: ${editor.codeblockBorder};`)
    lines.push(`  --codeblock-shadow: ${editor.codeblockShadow};`)
    lines.push('')

    return lines.join('\n')
  }

  /**
   * 编译字体排版
   */
  private compileTypography(typography: TypographySystem): string {
    const lines: string[] = []

    lines.push('  /* ==================== 编辑器排版 ==================== */')
    lines.push(`  --editor-font-size: ${typography.fontSize}px;`)
    lines.push(`  --editor-line-height: ${typography.lineHeight};`)
    lines.push(`  --editor-font-family: ${typography.fontFamily};`)
    lines.push(`  --editor-code-font-family: ${typography.codeFontFamily};`)
    lines.push(
      `  --editor-heading-font-family: ${typography.headingFontFamily || typography.fontFamily};`
    )
    lines.push(`  --editor-heading-font-weight: ${typography.headingFontWeight};`)
    lines.push(`  --editor-h1-size: ${typography.h1Size}rem;`)
    lines.push(`  --editor-h2-size: ${typography.h2Size}rem;`)
    lines.push(`  --editor-h3-size: ${typography.h3Size}rem;`)
    lines.push(`  --editor-h4-size: ${typography.h4Size}rem;`)
    lines.push(`  --editor-h5-size: ${typography.h5Size}rem;`)
    lines.push(`  --editor-h6-size: ${typography.h6Size}rem;`)
    lines.push(`  --editor-max-width: ${typography.maxWidth}px;`)
    lines.push(`  --editor-padding: ${typography.padding}px;`)

    return lines.join('\n')
  }

  /**
   * 编译 UI 样式
   */
  private compileUIStyles(ui: UIStyles): string {
    const lines: string[] = []

    lines.push('  /* ==================== UI 样式 ==================== */')
    lines.push(`  --border-radius-sm: ${ui.borderRadiusSm}px;`)
    lines.push(`  --border-radius-md: ${ui.borderRadiusMd}px;`)
    lines.push(`  --border-radius-lg: ${ui.borderRadiusLg}px;`)
    lines.push(`  --border-radius: ${ui.borderRadius}px;`)
    lines.push(`  --button-padding: ${ui.buttonPadding};`)
    lines.push(`  --input-padding: ${ui.inputPadding};`)
    lines.push(`  --transition-fast: ${ui.transitionFast};`)
    lines.push(`  --transition-normal: ${ui.transitionNormal};`)
    lines.push(`  --transition-slow: ${ui.transitionSlow};`)
    lines.push(`  --transition-speed: ${ui.transitionSpeed};`)
    lines.push(`  --shadow-sm: ${ui.shadowSm};`)
    lines.push(`  --shadow-md: ${ui.shadowMd};`)
    lines.push(`  --shadow-lg: ${ui.shadowLg};`)
    lines.push(`  --scrollbar-width: ${ui.scrollbarWidth}px;`)
    lines.push(`  --scrollbar-track: ${ui.scrollbarTrack};`)
    lines.push(`  --scrollbar-thumb: ${ui.scrollbarThumb};`)
    lines.push(`  --scrollbar-thumb-hover: ${ui.scrollbarThumbHover};`)
    lines.push(`  --scrollbar-radius: ${ui.scrollbarRadius}px;`)
    lines.push(`  --resizer-bg: ${ui.resizerBg};`)
    lines.push(`  --resizer-hover-bg: ${ui.resizerHoverBg};`)
    lines.push(`  --empty-state-color: ${ui.emptyStateColor};`)

    return lines.join('\n')
  }
}
