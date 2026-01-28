// Tanmark 主题 IPC 处理器 - 双格式主题扫描和加载（CSS + JSON）
import { ipcMain, app, shell, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { ThemeService } from '../services/theme-service'
import { ThemeInfo } from '@shared/types/theme'
import { ThemeCompiler } from '@shared/theme-compiler'

// 创建主题服务实例
const themeService = new ThemeService()

// 获取主窗口实例（需要在应用启动后调用）
function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows.length > 0 ? windows[0] : null
}

/**
 * 从 CSS 内容中解析背景色
 */
function parseBackgroundColor(cssContent: string): string | null {
  const match = cssContent.match(/--color-bg:\s*([^;]+)/)
  return match ? match[1].trim() : null
}

/**
 * 更新窗口背景色
 */
function updateWindowBackgroundColor(color: string): void {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.setBackgroundColor(color)
  }
}

/**
 * 获取内置主题文件夹路径
 */
function getBuiltInThemesDirectory(): string {
  const isDev = !app.isPackaged
  if (isDev) {
    // 开发环境: 从项目根目录读取
    return path.join(process.cwd(), 'themes')
  } else {
    // 生产环境: 从打包后的资源目录读取
    return path.join(process.resourcesPath, 'themes')
  }
}

/**
 * 获取用户主题文件夹路径（跨平台）
 */
function getUserThemesDirectory(): string {
  const documentsPath = app.getPath('documents')
  return path.join(documentsPath, 'Tanmark', 'themes')
}

/**
 * 从 CSS 注释中解析主题元数据
 */
function parseThemeMetadata(cssContent: string): { name?: string; previewColor?: string } {
  const nameMatch = cssContent.match(/@theme-name:\s*(.+)$/m)
  const colorMatch = cssContent.match(/@theme-color:\s*(.+)$/m)
  return {
    name: nameMatch ? nameMatch[1].trim() : undefined,
    previewColor: colorMatch ? colorMatch[1].trim() : undefined
  }
}

/**
 * 扫描指定文件夹，返回所有主题文件（支持 JSON 和 CSS）
 */
async function scanThemesFromDirectory(
  dir: string,
  source: 'builtin' | 'user'
): Promise<ThemeInfo[]> {
  const themes: ThemeInfo[] = []

  try {
    // 检查目录是否存在
    await fs.access(dir)

    // 读取目录中的所有文件
    const files = await fs.readdir(dir)

    for (const file of files) {
      const ext = path.extname(file).toLowerCase()

      // 只处理 .json 和 .css 文件
      if (ext !== '.json' && ext !== '.css') {
        continue
      }

      const filePath = path.join(dir, file)
      const themeId = path.basename(file, ext)

      try {
        // 使用 ThemeService 加载主题
        const { config, css, format } = await themeService.loadTheme(filePath)

        // 从配置或元数据获取主题名称
        const themeName = config?.meta.name || parseThemeMetadata(css || '').name || themeId

        // 从配置中获取预览颜色
        const previewColor = config?.meta.previewColor || parseThemeMetadata(css || '').previewColor

        themes.push({
          id: themeId,
          name: themeName,
          path: filePath,
          content: css,
          config,
          isDefault: themeId === 'github' && source === 'builtin',
          source,
          format: format as 'css' | 'json',
          previewColor
        })
      } catch (error) {
        console.error(`[Theme] Error loading theme file: ${file}`, error)
        // 跳过无法加载的主题文件
        continue
      }
    }

    return themes
  } catch (error) {
    console.error(`[Theme] Error scanning ${source} themes in ${dir}:`, error)
    return []
  }
}

/**
 * 扫描所有主题（内置 + 用户）
 */
async function scanAllThemes(): Promise<ThemeInfo[]> {
  // 先扫描内置主题
  const builtInDir = getBuiltInThemesDirectory()
  const builtInThemes = await scanThemesFromDirectory(builtInDir, 'builtin')

  // 再扫描用户主题
  const userDir = getUserThemesDirectory()
  const userThemes = await scanThemesFromDirectory(userDir, 'user')

  // 合并主题，用户主题覆盖内置主题（同名时）
  const themeMap = new Map<string, ThemeInfo>()

  // 先添加内置主题
  for (const theme of builtInThemes) {
    themeMap.set(theme.id, theme)
  }

  // 用户主题覆盖同名的内置主题
  for (const theme of userThemes) {
    themeMap.set(theme.id, theme)
  }

  const allThemes = Array.from(themeMap.values())
  return allThemes
}

/**
 * 确保用户主题文件夹存在
 */
async function ensureUserThemesDirectory(): Promise<void> {
  const userThemesDir = getUserThemesDirectory()

  try {
    // 检查目录是否存在
    await fs.access(userThemesDir)
  } catch {
    // 目录不存在，创建它
    try {
      await fs.mkdir(userThemesDir, { recursive: true })

      // 复制模板文件到用户主题文件夹
      const builtInTemplateSource = path.join(getBuiltInThemesDirectory(), 'template.json')
      const userTemplateDest = path.join(userThemesDir, 'template.json')

      try {
        const templateContent = await fs.readFile(builtInTemplateSource, 'utf-8')
        await fs.writeFile(userTemplateDest, templateContent, 'utf-8')
        console.log('[Theme] template.json copied to user themes directory')
      } catch (error) {
        console.error(`[Theme] Error copying template.json:`, error)
      }
    } catch (error) {
      console.error(`[Theme] Error creating user themes directory:`, error)
    }
  }
}

/**
 * 注册主题相关的 IPC 处理器
 */
export function registerThemeHandlers(): void {
  // 确保用户主题文件夹存在
  ensureUserThemesDirectory()

  // 获取所有可用主题
  ipcMain.handle('theme:getAll', async () => {
    return await scanAllThemes()
  })

  // 获取特定主题的内容
  ipcMain.handle('theme:getContent', async (_, themeId: string) => {
    const themes = await scanAllThemes()
    const theme = themes.find((t) => t.id === themeId)
    return theme ? theme.content : null
  })

  // 获取默认主题
  ipcMain.handle('theme:getDefault', async () => {
    const themes = await scanAllThemes()
    const defaultTheme = themes.find((t) => t.isDefault)
    return defaultTheme || themes[0] || null
  })

  // 获取用户主题文件夹路径
  ipcMain.handle('theme:getUserThemesPath', () => {
    return getUserThemesDirectory()
  })

  // 在文件管理器中打开用户主题文件夹
  ipcMain.handle('theme:openUserThemesFolder', async () => {
    const userThemesDir = getUserThemesDirectory()
    // 确保文件夹存在
    await ensureUserThemesDirectory()
    // 在系统文件管理器中打开
    await shell.openPath(userThemesDir)
    return true
  })

  // 应用主题时更新窗口背景色
  ipcMain.handle('theme:applyTheme', async (_, cssContent: string) => {
    const bgColor = parseBackgroundColor(cssContent)
    if (bgColor) {
      updateWindowBackgroundColor(bgColor)
    }
    return true
  })

  // === 新增：JSON 主题支持 ===

  // 获取主题的 JSON 配置
  ipcMain.handle('theme:getConfig', async (_, themeId: string) => {
    try {
      const themes = await scanAllThemes()
      const theme = themes.find((t) => t.id === themeId)

      if (!theme) {
        return null
      }

      // 如果是 JSON 主题，直接返回配置
      if (theme.format === 'json' && theme.config) {
        return theme.config
      }

      // 如果是 CSS 主题，尝试转换为 JSON
      if (theme.format === 'css') {
        const config = await themeService.convertCSStoJSON(theme.path)
        return config
      }

      return null
    } catch (error) {
      console.error(`[Theme] Error getting theme config:`, error)
      return null
    }
  })

  // 保存 JSON 主题
  ipcMain.handle('theme:saveJSON', async (_, themeId: string, config: any) => {
    try {
      const userDir = getUserThemesDirectory()

      // 确保用户主题文件夹存在
      await ensureUserThemesDirectory()

      // 保存主题
      const themePath = path.join(userDir, `${themeId}.json`)
      await themeService.saveJSONTheme(themePath, config)

      return { success: true, path: themePath }
    } catch (error) {
      console.error(`[Theme] Error saving JSON theme:`, error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 验证主题配置
  ipcMain.handle('theme:validate', async (_, config: any) => {
    try {
      // 尝试编译主题来验证
      const themeCompiler = new ThemeCompiler()
      const css = themeCompiler.compileToCSS(config)

      // 如果编译成功，说明配置有效
      return { valid: true, css }
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message
      }
    }
  })
}
