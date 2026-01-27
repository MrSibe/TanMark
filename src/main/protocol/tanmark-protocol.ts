import { protocol, net } from 'electron'
import { pathToFileURL } from 'node:url'

/**
 * 注册 tanmark:// 自定义协议
 * 必须在 app.whenReady() 之前调用
 */
export function registerTanmarkScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'tanmark',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }
  ])
}

/**
 * 设置协议处理器
 * 必须在 app.whenReady() 之后调用
 */
export function setupProtocolHandler(): void {
  protocol.handle('tanmark', async (request) => {
    try {
      // 去除协议头：`tanmark://`
      // Mac: tanmark:///Users/xxx → /Users/xxx
      // Windows: tanmark://C:/Users/xxx → C:/Users/xxx
      const rawPath = request.url.slice('tanmark://'.length)
      let decodedPath = decodeURIComponent(rawPath)

      // 【关键修复】确保路径以 / 开头
      if (!decodedPath.startsWith('/')) {
        decodedPath = '/' + decodedPath
      }

      // 转换为标准 file:// URL
      const fileUrl = pathToFileURL(decodedPath).toString()

      // 使用 net.fetch 读取文件
      const response = await net.fetch(fileUrl)

      // 返回响应
      return response
    } catch (error) {
      console.error('[Protocol] Error serving file:', error)
      return new Response('File not found', {
        status: 404,
        statusText: 'Not Found'
      })
    }
  })
}
