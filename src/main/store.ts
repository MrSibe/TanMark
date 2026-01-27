// Tanmark 配置管理 - 使用 electron-store
import Store from 'electron-store'
import { ipcMain } from 'electron'
import { AppSettings, defaultSettings } from '../shared/types/settings'

// 初始化 electron-store
const store = new Store<AppSettings>({
  defaults: defaultSettings,
  name: 'tanmark-config' // 配置文件名：tanmark-config.json
})

/**
 * 设置 IPC 处理器
 * 在主进程中注册设置相关的 IPC 通信
 */
export function setupSettingsIPC(): void {
  // 获取设置
  ipcMain.handle('settings:get', (_event, key?: keyof AppSettings) => {
    if (key) {
      return store.get(key)
    }
    return store.store
  })

  // 修改设置
  ipcMain.handle(
    'settings:set',
    (event, key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
      store.set(key, value)

      // 广播通知所有渲染进程更新（实现多窗口同步）
      event.sender.send('settings:updated', store.store)
      return true
    }
  )

  // 打开配置文件
  ipcMain.handle('settings:openFile', () => {
    store.openInEditor()
    return true
  })
}

/**
 * 导出 store 实例，供其他主进程代码使用
 */
export { store }
