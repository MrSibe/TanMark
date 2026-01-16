// Tanmark 应用设置类型定义

export interface AppSettings {
  // 主题设置
  theme: {
    current: string // 当前主题 ID，如 'github'、'github-dark'
  }

  // 编辑器设置
  editor: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    showLineNumbers: boolean
    alwaysShowMarkdown: boolean // 是否总是显示 Markdown 源码
  }

  // 系统设置
  system: {
    autoSave: boolean
    autoSaveInterval: number // 自动保存间隔（毫秒）
  }
}

export const defaultSettings: AppSettings = {
  theme: {
    current: 'github' // 默认使用 GitHub 浅色主题
  },
  editor: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontSize: 16,
    lineHeight: 1.75,
    showLineNumbers: false,
    alwaysShowMarkdown: false
  },
  system: {
    autoSave: true,
    autoSaveInterval: 5000 // 5 秒
  }
}
