/**
 * Tanmark 主题服务
 *
 * 负责加载、保存和管理 JSON 主题文件
 */

import { ThemeConfig } from '@shared/types/theme'
import { ThemeCompiler } from '../ipc/theme-compiler'
import fs from 'fs/promises'
import path from 'path'

/**
 * 主题服务类
 */
export class ThemeService {
  private compiler: ThemeCompiler

  constructor() {
    this.compiler = new ThemeCompiler()
  }

  /**
   * 智能加载主题 - 自动检测格式（JSON 或 CSS）
   */
  async loadTheme(
    themePath: string
  ): Promise<{ config?: ThemeConfig; css?: string; format: 'json' | 'css' }> {
    const ext = path.extname(themePath).toLowerCase()

    if (ext === '.json') {
      return await this.loadJSONTheme(themePath)
    } else if (ext === '.css') {
      return await this.loadCSSTheme(themePath)
    }

    throw new Error(`Unsupported theme format: ${ext}`)
  }

  /**
   * 加载 JSON 主题
   */
  async loadJSONTheme(
    themePath: string
  ): Promise<{ config: ThemeConfig; css: string; format: 'json' }> {
    try {
      const content = await fs.readFile(themePath, 'utf-8')
      const config = JSON.parse(content) as ThemeConfig

      // 验证必需字段
      this.validateThemeConfig(config)

      // 处理主题继承
      const resolvedConfig = config.extends
        ? await this.resolveInheritance(config, themePath)
        : config

      // 编译为 CSS
      const css = this.compiler.compileToCSS(resolvedConfig)

      return {
        config: resolvedConfig,
        css,
        format: 'json'
      }
    } catch (error) {
      console.error(`[ThemeService] Failed to load JSON theme: ${themePath}`, error)
      throw error
    }
  }

  /**
   * 加载 CSS 主题（向后兼容）
   */
  async loadCSSTheme(themePath: string): Promise<{ css: string; format: 'css' }> {
    try {
      const css = await fs.readFile(themePath, 'utf-8')
      return { css, format: 'css' }
    } catch (error) {
      console.error(`[ThemeService] Failed to load CSS theme: ${themePath}`, error)
      throw error
    }
  }

  /**
   * 保存 JSON 主题
   */
  async saveJSONTheme(themePath: string, config: ThemeConfig): Promise<void> {
    try {
      // 验证配置
      this.validateThemeConfig(config)

      // 格式化 JSON（2 空格缩进）
      const json = JSON.stringify(config, null, 2)

      // 确保目录存在
      const dir = path.dirname(themePath)
      await fs.mkdir(dir, { recursive: true })

      // 写入文件
      await fs.writeFile(themePath, json, 'utf-8')

      console.log(`[ThemeService] Theme saved: ${themePath}`)
    } catch (error) {
      console.error(`[ThemeService] Failed to save theme: ${themePath}`, error)
      throw error
    }
  }

  /**
   * 解析主题继承链
   */
  private async resolveInheritance(
    config: ThemeConfig,
    themePath: string,
    visited: Set<string> = new Set()
  ): Promise<ThemeConfig> {
    // 检测循环继承
    if (visited.has(config.meta.id)) {
      throw new Error(`Circular theme inheritance detected: ${config.meta.id}`)
    }

    if (!config.extends) {
      return config
    }

    // 加载父主题
    const parentPath = this.resolveParentPath(config.extends, themePath)
    const { config: parentConfig } = await this.loadJSONTheme(parentPath)

    // 标记已访问
    visited.add(config.meta.id)

    // 递归解析父主题的继承
    const resolvedParent = await this.resolveInheritance(parentConfig, parentPath, visited)

    // 合并主题
    return this.mergeThemes(resolvedParent, config)
  }

  /**
   * 解析父主题路径
   */
  private resolveParentPath(parentId: string, currentPath: string): string {
    // 尝试在同一目录下查找父主题
    const currentDir = path.dirname(currentPath)
    const parentPath = path.join(currentDir, `${parentId}.json`)

    return parentPath
  }

  /**
   * 深度合并两个主题
   */
  private mergeThemes(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
    return {
      meta: {
        ...parent.meta,
        ...child.meta,
        // 确保关键元数据不被覆盖
        id: child.meta.id,
        name: child.meta.name,
        version: child.meta.version
      },
      colors: {
        ...parent.colors,
        ...child.colors,
        editor: {
          ...parent.colors.editor,
          ...child.colors.editor
        }
      },
      typography: {
        ...parent.typography,
        ...child.typography
      },
      ui: {
        ...parent.ui,
        ...child.ui
      },
      extends: child.extends, // 保留继承信息
      customCSS: child.customCSS || parent.customCSS
    }
  }

  /**
   * 验证主题配置
   */
  private validateThemeConfig(config: any): void {
    if (!config.meta) {
      throw new Error('Missing required field: meta')
    }

    if (!config.meta.id || typeof config.meta.id !== 'string') {
      throw new Error('Invalid or missing meta.id')
    }

    if (!config.meta.name || typeof config.meta.name !== 'string') {
      throw new Error('Invalid or missing meta.name')
    }

    if (!config.colors) {
      throw new Error('Missing required field: colors')
    }

    if (!config.typography) {
      throw new Error('Missing required field: typography')
    }

    if (!config.ui) {
      throw new Error('Missing required field: ui')
    }
  }

  /**
   * 从 CSS 主题转换为 JSON 配置
   */
  async convertCSStoJSON(cssPath: string): Promise<ThemeConfig> {
    const { css } = await this.loadCSSTheme(cssPath)

    // 解析 CSS 变量
    const variables = this.extractCSSVariables(css)

    // 构建 JSON 配置
    const config: ThemeConfig = {
      meta: this.extractMetaFromCSS(css),
      colors: this.extractColorsFromVariables(variables),
      typography: this.extractTypographyFromVariables(variables),
      ui: this.extractUIFromVariables(variables)
    }

    return config
  }

  /**
   * 从 CSS 内容中提取元数据
   */
  private extractMetaFromCSS(css: string): ThemeConfig['meta'] {
    const nameMatch = css.match(/@theme-name:\s*(.+)$/m)
    const authorMatch = css.match(/@theme-author:\s*(.+)$/m)
    const versionMatch = css.match(/@theme-version:\s*(.+)$/m)
    const descriptionMatch = css.match(/@theme-description:\s*(.+)$/m)
    const typeMatch = css.match(/@theme-type:\s*(.+)$/m)

    // 从文件路径或内容推断主题类型
    const isDark =
      css.includes('--color-bg: #1') ||
      css.includes('--color-bg: #2') ||
      css.includes('--color-bg: #0')

    return {
      id: 'converted-theme',
      name: nameMatch ? nameMatch[1].trim() : 'Converted Theme',
      version: versionMatch ? versionMatch[1].trim() : '1.0.0',
      author: authorMatch ? authorMatch[1].trim() : 'Unknown',
      description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
      type: typeMatch
        ? (typeMatch[1].trim() as 'light' | 'dark' | 'auto')
        : isDark
          ? 'dark'
          : 'light'
    }
  }

  /**
   * 从 CSS 中提取所有变量
   */
  private extractCSSVariables(css: string): Map<string, string> {
    const variables = new Map<string, string>()
    const regex = /--([\w-]+):\s*([^;]+);/g

    let match
    while ((match = regex.exec(css)) !== null) {
      const name = match[1]
      const value = match[2].trim()
      variables.set(name, value)
    }

    return variables
  }

  /**
   * 从变量中提取颜色
   */
  private extractColorsFromVariables(variables: Map<string, string>): ThemeConfig['colors'] {
    const get = (key: string, defaultValue: string) => variables.get(key) || defaultValue

    return {
      bg: get('color-bg', '#ffffff'),
      bgSecondary: get('color-bg-secondary', '#f5f5f5'),
      sidebarBg: get('color-sidebar-bg', '#f7f7f7'),
      fg: get('color-fg', '#333333'),
      fgSecondary: get('color-fg-secondary', '#666666'),
      fgMuted: get('color-fg-muted', '#999999'),
      fgOnDark: get('color-fg-on-dark', '#ffffff'),
      border: get('color-border', '#e0e0e0'),
      borderLight: get('color-border-light', '#f0f0f0'),
      divider: get('color-divider', '#e5e5e5'),
      hover: get('color-hover', '#eeeeee'),
      active: get('color-active', '#e0e0e0'),
      focus: get('color-focus', '#4a9eff'),
      accent: get('color-accent', '#4a9eff'),
      accentHover: get('color-accent-hover', '#3a8eef'),
      success: get('color-success', '#28a745'),
      warning: get('color-warning', '#ffc107'),
      error: get('color-error', '#dc3545'),
      info: get('color-info', '#17a2b8'),
      editor: {
        text: get('editor-text-color', '#333333'),
        heading: get('editor-heading-color', '#222222'),
        link: get('editor-link-color', '#4a9eff'),
        linkHover: get('editor-link-hover-color', '#3a8eef'),
        codeBg: get('editor-code-bg', '#f6f8fa'),
        codeColor: get('editor-code-color', '#333333'),
        codeBorder: get('editor-code-border', '#e0e0e0'),
        codeblockBg: get('editor-codeblock-bg', '#1e1e1e'),
        codeblockText: get('editor-codeblock-text', '#e6edf3'),
        blockquoteBorder: get('editor-blockquote-border', '#4a9eff'),
        blockquoteBg: get('editor-blockquote-bg', '#f6f8fa'),
        blockquoteText: get('editor-blockquote-text', '#57606a'),
        tableBorder: get('editor-table-border', '#e0e0e0'),
        tableHeaderBg: get('editor-table-header-bg', '#f6f8fa'),
        tableHeaderText: get('editor-table-header-text', '#333333'),
        tableRowEvenBg: get('editor-table-row-even-bg', '#f6f8fa'),
        tableRowHoverBg: get('editor-table-row-hover-bg', '#f3f4f6'),
        hrColor: get('editor-hr-color', '#e0e0e0'),
        listMarkerColor: get('editor-list-marker-color', '#4a9eff'),
        taskCheckboxBorder: get('editor-task-checkbox-border', '#e0e0e0'),
        taskCheckboxChecked: get('editor-task-checkbox-checked', '#4a9eff'),
        selectionBg: get('selection-bg', '#4a9eff'),
        selectionColor: get('selection-color', '#ffffff'),
        taskCheckboxHoverBg: get('task-checkbox-hover-bg', '#f6f8fa'),
        taskCheckboxHoverBorder: get('task-checkbox-hover-border', '#0969da'),
        taskCompletedText: get('task-completed-text', '#6e7781'),
        codeblockBorder: get('codeblock-border', 'rgba(255, 255, 255, 0.1)'),
        codeblockShadow: get('codeblock-shadow', '0 2px 8px rgba(0, 0, 0, 0.15)')
      }
    }
  }

  /**
   * 从变量中提取字体排版
   */
  private extractTypographyFromVariables(
    variables: Map<string, string>
  ): ThemeConfig['typography'] {
    const getNumber = (key: string, defaultValue: number) => {
      const value = variables.get(key)
      return value ? parseFloat(value) : defaultValue
    }

    return {
      fontSize: getNumber('editor-font-size', 16),
      lineHeight: getNumber('editor-line-height', 1.75),
      fontFamily:
        variables.get('editor-font-family') || '-apple-system, BlinkMacSystemFont, sans-serif',
      codeFontFamily: variables.get('editor-code-font-family') || "'Monaco', 'Menlo', monospace",
      headingFontFamily: variables.get('editor-heading-font-family'),
      headingFontWeight: getNumber('editor-heading-font-weight', 600),
      h1Size: getNumber('editor-h1-size', 2.25),
      h2Size: getNumber('editor-h2-size', 1.875),
      h3Size: getNumber('editor-h3-size', 1.5),
      h4Size: getNumber('editor-h4-size', 1.25),
      h5Size: getNumber('editor-h5-size', 1.125),
      h6Size: getNumber('editor-h6-size', 1),
      maxWidth: getNumber('editor-max-width', 900),
      padding: getNumber('editor-padding', 40)
    }
  }

  /**
   * 从变量中提取 UI 样式
   */
  private extractUIFromVariables(variables: Map<string, string>): ThemeConfig['ui'] {
    const getNumber = (key: string, defaultValue: number) => {
      const value = variables.get(key)
      return value ? parseFloat(value) : defaultValue
    }

    return {
      borderRadiusSm: getNumber('border-radius-sm', 4),
      borderRadiusMd: getNumber('border-radius-md', 8),
      borderRadiusLg: getNumber('border-radius-lg', 12),
      borderRadius: getNumber('border-radius', 6),
      buttonPadding: variables.get('button-padding') || '8px 16px',
      inputPadding: variables.get('input-padding') || '8px 12px',
      transitionFast: variables.get('transition-fast') || '0.15s',
      transitionNormal: variables.get('transition-normal') || '0.2s',
      transitionSlow: variables.get('transition-slow') || '0.3s',
      transitionSpeed: variables.get('transition-speed') || '0.2s',
      shadowSm: variables.get('shadow-sm') || '0 1px 2px rgba(0, 0, 0, 0.05)',
      shadowMd: variables.get('shadow-md') || '0 4px 6px rgba(0, 0, 0, 0.1)',
      shadowLg: variables.get('shadow-lg') || '0 10px 15px rgba(0, 0, 0, 0.1)',
      scrollbarWidth: getNumber('scrollbar-width', 8),
      scrollbarTrack: variables.get('scrollbar-track') || 'transparent',
      scrollbarThumb: variables.get('scrollbar-thumb') || 'rgba(0, 0, 0, 0.2)',
      scrollbarThumbHover: variables.get('scrollbar-thumb-hover') || 'rgba(0, 0, 0, 0.3)',
      scrollbarRadius: getNumber('scrollbar-radius', 4),
      resizerBg: variables.get('resizer-bg') || '#d0d0d0',
      resizerHoverBg: variables.get('resizer-hover-bg') || '#b0b0b0',
      emptyStateColor: variables.get('empty-state-color') || '#999999'
    }
  }
}
