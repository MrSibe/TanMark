// Tanmark 主题 IPC 处理器 - 双层主题扫描和加载
import { ipcMain, app, shell, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import path from 'path'

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

export interface ThemeInfo {
  id: string // 主题 ID (文件名，不含扩展名)
  name: string // 主题名称
  path: string // 主题文件完整路径
  content: string // 主题 CSS 内容
  isDefault: boolean // 是否为默认主题
  source: 'builtin' | 'user' // 主题来源
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
function parseThemeMetadata(cssContent: string): { name?: string } {
  const nameMatch = cssContent.match(/@theme-name:\s*(.+)$/m)
  return {
    name: nameMatch ? nameMatch[1].trim() : undefined
  }
}

/**
 * 扫描指定文件夹，返回所有主题文件
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
      // 只处理 .css 文件，跳过模板文件
      if (!file.endsWith('.css') || file === 'template.css') {
        continue
      }

      const filePath = path.join(dir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const themeId = path.basename(file, '.css')

      // 解析主题元数据
      const metadata = parseThemeMetadata(content)

      themes.push({
        id: themeId,
        name: metadata.name || themeId,
        path: filePath,
        content: content,
        isDefault: themeId === 'github' && source === 'builtin', // 只有内置的 github 是默认主题
        source: source
      })
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
      const builtInTemplateSource = path.join(getBuiltInThemesDirectory(), 'template.css')
      const userTemplateDest = path.join(userThemesDir, 'template.css')

      try {
        const templateContent = await fs.readFile(builtInTemplateSource, 'utf-8')
        await fs.writeFile(userTemplateDest, templateContent, 'utf-8')
      } catch (error) {
        console.error(`[Theme] Error copying template.css:`, error)
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
}
