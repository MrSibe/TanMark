/**
 * 图片上传工具
 */

/**
 * 处理图片文件并保存到 assets 目录
 * @param file 图片文件对象
 * @param currentFilePath 当前打开的 Markdown 文件路径
 * @returns 图片的相对路径和绝对路径
 */
export async function uploadImage(
  file: File,
  currentFilePath: string
): Promise<{ relativePath: string; absolutePath: string } | null> {
  try {
    // 验证是否为图片
    if (!file.type.startsWith('image/')) {
      return null
    }

    // 读取文件数据
    const arrayBuffer = await file.arrayBuffer()

    // 调用 IPC 保存图片
    const result = await window.api.saveImage(currentFilePath, arrayBuffer, file.name)

    if (!result.success) {
      console.error('[Upload] Failed to save image:', result.error)
      return null
    }

    return {
      relativePath: result.relativePath!,
      absolutePath: result.absolutePath!
    }
  } catch (error) {
    console.error('[Upload] Error uploading image:', error)
    return null
  }
}

/**
 * 从剪贴板或拖拽事件中提取图片文件
 */
export function extractImageFiles(dataTransfer: DataTransfer): File[] {
  const files: File[] = []

  // 从 files 列表中提取
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i]
      if (file.type.startsWith('image/')) {
        files.push(file)
      }
    }
  }

  // 从 items 列表中提取 (处理复制的图片数据)
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i]
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file && !files.some((f) => f.name === file.name)) {
          files.push(file)
        }
      }
    }
  }

  return files
}
