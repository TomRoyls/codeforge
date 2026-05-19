import * as fs from 'node:fs/promises'
import { basename } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface TreeNode {
  name: string
  type: 'file' | 'directory'
  size?: number
  lines?: number
  children?: TreeNode[]
}

export interface TreeResult {
  root: TreeNode
  totalFiles: number
  totalDirs: number
  totalSize: number
  maxDepth: number
}

export interface BuildTreeOptions {
  maxDepth: number
  showSize: boolean
  showLines: boolean
  ignorePatterns: string[]
}

// ─── Constants ───────────────────────────────────────────

const DEFAULT_IGNORE = ['node_modules', 'dist', '.git', 'coverage', '.next', '.nuxt', '__pycache__']

const TEXT_EXTENSIONS: ReadonlySet<string> = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.html',
  '.md',
  '.py',
  '.rs',
  '.go',
  '.java',
  '.rb',
  '.sh',
  '.yaml',
  '.yml',
  '.xml',
  '.sql',
  '.txt',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',
  '.env',
  '.gitignore',
  '.eslintrc',
  '.prettierrc',
  '.editorconfig',
  '.svelte',
  '.vue',
  '.zig',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.m',
  '.swift',
  '.kt',
  '.scala',
  '.hs',
  '.ex',
  '.exs',
  '.erl',
  '.lua',
  '.r',
  '.R',
  '.pl',
  '.pm',
])

// ─── Helpers ─────────────────────────────────────────────

function isIgnored(name: string, ignorePatterns: string[]): boolean {
  const lowerName = name.toLowerCase()
  for (const pattern of ignorePatterns) {
    if (lowerName === pattern.toLowerCase()) {
      return true
    }
  }
  return false
}

function isTextFile(fileName: string): boolean {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1) return false
  const ext = fileName.slice(dotIndex).toLowerCase()
  return TEXT_EXTENSIONS.has(ext)
}

async function countFileLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    if (content.length === 0) return 0
    return content.split('\n').length
  } catch {
    return 0
  }
}

// ─── buildTree ───────────────────────────────────────────

export async function buildTree(dirPath: string, options: BuildTreeOptions): Promise<TreeNode> {
  const allIgnore = [...DEFAULT_IGNORE, ...options.ignorePatterns]
  const rootName = basename(dirPath) || dirPath

  const root: TreeNode = {
    children: [],
    name: rootName,
    type: 'directory',
  }

  await buildNode(root, dirPath, allIgnore, options, 1)
  return root
}

async function buildNode(
  parent: TreeNode,
  dirPath: string,
  ignorePatterns: string[],
  options: BuildTreeOptions,
  currentDepth: number,
): Promise<void> {
  let entries
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return
  }

  // Filter out ignored entries
  const filtered = Array.from(entries).filter((entry) => !isIgnored(entry.name, ignorePatterns))

  // Sort: directories first (alphabetically), then files (alphabetically)
  const directories = filtered
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
  const files = filtered
    .filter((e) => e.isFile())
    .sort((a, b) => a.name.localeCompare(b.name))

  const sorted = [...directories, ...files]

  const children: TreeNode[] = []

  for (const entry of sorted) {
    if (entry.isDirectory()) {
      const childNode: TreeNode = {
        children: [],
        name: entry.name,
        type: 'directory',
      }
      children.push(childNode)

      if (currentDepth < options.maxDepth) {
        const childPath = `${dirPath}/${entry.name}`
        await buildNode(childNode, childPath, ignorePatterns, options, currentDepth + 1)
      }
    } else if (entry.isFile()) {
      const childNode: TreeNode = {
        name: entry.name,
        type: 'file',
      }

      const filePath = `${dirPath}/${entry.name}`

      if (options.showSize) {
        try {
          const stat = await fs.stat(filePath)
          childNode.size = stat.size
        } catch {
          childNode.size = 0
        }
      }

      if (options.showLines && isTextFile(entry.name)) {
        childNode.lines = await countFileLines(filePath)
      }

      children.push(childNode)
    }
  }

  parent.children = children
}

// ─── countTreeNodes ──────────────────────────────────────

export function countTreeNodes(node: TreeNode): { files: number; dirs: number; totalSize: number } {
  let files = 0
  let dirs = 0
  let totalSize = 0

  if (node.type === 'file') {
    files++
    totalSize += node.size ?? 0
  }

  if (node.type === 'directory') {
    dirs++
  }

  if (node.children) {
    for (const child of node.children) {
      const childCounts = countTreeNodes(child)
      files += childCounts.files
      dirs += childCounts.dirs
      totalSize += childCounts.totalSize
    }
  }

  return { dirs, files, totalSize }
}

// ─── formatFileSize ──────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  // Format with appropriate precision
  if (unitIndex === 0) {
    return `${bytes} B`
  }

  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1)
  return `${formatted} ${units[unitIndex]}`
}

// ─── filterByDepth ───────────────────────────────────────

export function filterByDepth(node: TreeNode, maxDepth: number, currentDepth: number = 0): TreeNode {
  const filtered: TreeNode = {
    name: node.name,
    type: node.type,
  }

  if (node.type === 'file') {
    filtered.size = node.size
    filtered.lines = node.lines
  }

  if (currentDepth >= maxDepth || !node.children) {
    return filtered
  }

  filtered.children = Array.from(node.children).map((child) =>
    filterByDepth(child, maxDepth, currentDepth + 1),
  )

  return filtered
}
