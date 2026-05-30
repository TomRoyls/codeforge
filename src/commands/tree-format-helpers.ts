import chalk from 'chalk'

import type { TreeNode, TreeResult } from './tree-helpers.js'
import { formatFileSize } from './tree-helpers.js'

// ─── Tree rendering ─────────────────────────────────────

interface RenderOptions {
  showSize: boolean
  showLines: boolean
}

export function renderTree(node: TreeNode, options: RenderOptions): string {
  const lines: string[] = []

  lines.push(chalk.bold.blue(node.name))

  if (node.children && node.children.length > 0) {
    renderChildren(node.children, lines, '', options)
  }

  return lines.join('\n')
}

function renderChildren(
  children: TreeNode[],
  lines: string[],
  prefix: string,
  options: RenderOptions,
): void {
  const lastIndex = children.length - 1

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const isLast = i === lastIndex

    const connector = isLast ? '└── ' : '├── '
    const continuation = isLast ? '    ' : '│   '

    const displayName =
      child?.type === 'directory' ? chalk.bold.blue(child?.name) : child?.name

    let suffix = ''
    if (child?.type === 'file') {
      const parts: string[] = []
      if (options.showSize && child?.size !== undefined) {
        parts.push(`(${formatFileSize(child?.size)})`)
      }
      if (options.showLines && child?.lines !== undefined) {
        parts.push(`[${child?.lines} lines]`)
      }
      if (parts.length > 0) {
        suffix = '  ' + chalk.dim(parts.join('  '))
      }
    }

    lines.push(`${prefix}${connector}${displayName}${suffix}`)

    if (child?.type === 'directory' && child?.children && child?.children.length > 0) {
      renderChildren(child?.children, lines, prefix + continuation, options)
    }
  }
}

export function renderSummary(
  totalDirs: number,
  totalFiles: number,
  totalSize: number,
  showSize: boolean,
): string {
  let summary = `\n${totalDirs} directories, ${totalFiles} files`
  if (showSize && totalSize > 0) {
    summary += ` [${formatFileSize(totalSize)}]`
  }
  return summary
}

// ─── JSON rendering ─────────────────────────────────────

export function renderTreeJson(result: TreeResult): string {
  return JSON.stringify(result, null, 2)
}
