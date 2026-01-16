export interface FileInfo {
  path: string
  name: string
  content: string
}

export interface DirectoryItem {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryItem[]
}
