/**
 * 将文件名截断为 Finder 风格的中间省略号
 * 优先保证前后部分均匀显示，中间部分用省略号
 *
 * @param fileName 原始文件名
 * @param maxLength 最大长度（字符数，默认 20）
 * @returns 截断后的文件名
 */
export function truncateFileName(fileName: string, maxLength: number = 20): string {
  // 1. 如果文本本身短于最大长度，直接返回
  if (fileName.length <= maxLength) {
    return fileName
  }

  const ellipsis = '...'

  // 2. 计算可用于显示文件名的空间（去除省略号后）
  const availableSpace = maxLength - ellipsis.length

  if (availableSpace < 2) {
    // 如果空间太少，只显示省略号
    return ellipsis
  }

  // 3. macOS Finder 风格：前后均分显示
  // 前面显示 60%，后面显示 40%（因为后面通常包含扩展名，更重要）
  const frontChars = Math.ceil(availableSpace * 0.6)
  const backChars = availableSpace - frontChars

  // 4. 获取前面和后面的部分
  const front = fileName.slice(0, frontChars)
  const back = fileName.slice(-backChars)

  return front + ellipsis + back
}
