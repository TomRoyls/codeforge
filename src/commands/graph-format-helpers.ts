import chalk from 'chalk'

import type { DependencyNode, GraphResult } from './graph-helpers.js'

// ─── Tree formatting ────────────────────────────────────

/**
 * Format a dependency graph as an ASCII tree.
 *
 * @example
 * ```ts
 * const output = formatTree(graphResult, 'count')
 * console.log(output)
 * ```
 */
export function formatTree(result: GraphResult, highlight?: string): string {
  const lines: string[] = []
  const rootNode = result.nodes.get(result.root)
  if (!rootNode) return ''

  const rootLabel = chalk.cyan(rootNode.relativePath)
  lines.push(rootLabel)

  const visited = new Set<string>()
  visited.add(result.root)

  const children = getChildren(rootNode, result, 'imports')
  formatTreeChildren(children, result, '', true, highlight, visited, lines, 1, result.maxDepth)

  return lines.join('\n')
}

function getChildren(
  node: DependencyNode,
  result: GraphResult,
  _direction: string,
): DependencyNode[] {
  const children: DependencyNode[] = []
  for (const importPath of node.imports) {
    const child = result.nodes.get(importPath)
    if (child) {
      children.push(child)
    }
  }
  return children
}

function formatTreeChildren(
  children: DependencyNode[],
  result: GraphResult,
  prefix: string,
  _isRootLevel: boolean,
  highlight: string | undefined,
  visited: Set<string>,
  lines: string[],
  currentDepth: number,
  maxDepth: number,
): void {
  if (currentDepth > maxDepth) return

  children.forEach((child, index) => {
    const isLast = index === children.length - 1
    const connector = isLast ? '└── ' : '├── '
    const newPrefix = isLast ? '    ' : '│   '

    let label = child.relativePath
    if (highlight && matchPattern(child.relativePath, highlight)) {
      label = chalk.yellow(label)
    } else if (child.imports.length === 0) {
      label = chalk.white(label)
    } else {
      label = chalk.white(label)
    }

    lines.push(`${prefix}${connector}${label}`)

    if (!visited.has(child.filePath)) {
      visited.add(child.filePath)
      const grandChildren = getChildren(child, result, 'imports')
      formatTreeChildren(
        grandChildren,
        result,
        prefix + newPrefix,
        false,
        highlight,
        visited,
        lines,
        currentDepth + 1,
        maxDepth,
      )
    }
  })
}

function matchPattern(text: string, pattern: string): boolean {
  return text.includes(pattern)
}

/**
 * Recursively format a single tree node and its children.
 *
 * @example
 * ```ts
 * const lines: string[] = []
 * formatTreeNode(node, '', true, 0, 3, new Set(), result, lines)
 * ```
 */
export function formatTreeNode(
  node: DependencyNode,
  prefix: string,
  isLast: boolean,
  depth: number,
  maxDepth: number,
  visited: Set<string>,
  result: GraphResult,
  lines: string[],
): void {
  const connector = isLast ? '└── ' : '├── '
  const label = node.relativePath
  lines.push(`${prefix}${connector}${label}`)

  if (depth >= maxDepth || visited.has(node.filePath)) return
  visited.add(node.filePath)

  const children = getChildren(node, result, 'imports')
  children.forEach((child, index) => {
    const childIsLast = index === children.length - 1
    const newPrefix = prefix + (isLast ? '    ' : '│   ')
    formatTreeNode(child, newPrefix, childIsLast, depth + 1, maxDepth, visited, result, lines)
  })
}

// ─── Graph formatting ───────────────────────────────────

/**
 * Format a dependency graph as an ASCII box-and-arrow graph.
 *
 * @example
 * ```ts
 * const output = formatGraph(graphResult)
 * console.log(output)
 * ```
 */
export function formatGraph(result: GraphResult, highlight?: string): string {
  const lines: string[] = []
  const nodes = Array.from(result.nodes.values())

  if (nodes.length === 0) return ''

  const processed = new Set<string>()
  const rows: string[][] = []

  for (const edge of result.edges) {
    if (!processed.has(edge.from)) {
      processed.add(edge.from)
      const fromNode = result.nodes.get(edge.from)
      const toNode = result.nodes.get(edge.to)
      if (fromNode && toNode) {
        const row: string[] = []
        const fromLabel = fromNode.relativePath
        const toLabel = toNode.relativePath

        let fromStyled = fromLabel
        let toStyled = toLabel
        if (highlight) {
          if (matchPattern(fromLabel, highlight)) fromStyled = chalk.yellow(fromLabel)
          if (matchPattern(toLabel, highlight)) toStyled = chalk.yellow(toLabel)
        }

        const arrow = edge.type === 'dynamic-import' ? '--*) ' : '---▶ '
        row.push(`${drawBox(fromStyled, fromLabel.length + 4)} ${arrow} ${drawBox(toStyled, toLabel.length + 4)}`)
        rows.push(row)
      }
    }
  }

  for (const row of rows) {
    lines.push(...row)
  }

  if (lines.length === 0 && nodes.length > 0) {
    for (const node of nodes) {
      let label = node.relativePath
      if (highlight && matchPattern(label, highlight)) {
        label = chalk.yellow(label)
      }
      lines.push(drawBox(label, label.length + 4))
    }
  }

  return lines.join('\n')
}

/**
 * Draw an ASCII box around text.
 *
 * @example
 * ```ts
 * drawBox('hello', 10)
 * // ┌──────────┐
 * // │ hello    │
 * // └──────────┘
 * ```
 */
export function drawBox(text: string, width: number): string {
  const boxWidth = Math.max(width, 4)
  const top = `┌${'─'.repeat(boxWidth)}┐`
  const content = `│${padCenter(text, boxWidth)}│`
  const bottom = `└${'─'.repeat(boxWidth)}┘`
  return `${top}\n${content}\n${bottom}`
}

function padCenter(text: string, width: number): string {
  const stripped = stripAnsi(text)
  const padding = Math.max(0, width - stripped.length)
  const leftPad = Math.floor(padding / 2)
  const rightPad = padding - leftPad
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
}

function stripAnsi(text: string): string {
  const ansiRegex = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g
  return text.replace(ansiRegex, '')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a dependency graph as JSON.
 *
 * @example
 * ```ts
 * const json = formatGraphJson(graphResult)
 * console.log(json)
 * ```
 */
export function formatGraphJson(result: GraphResult): string {
  const serializable = {
    edges: result.edges.map((e) => ({
      from: e.from,
      to: e.to,
      type: e.type,
    })),
    maxDepth: result.maxDepth,
    nodes: Object.fromEntries(
      Array.from(result.nodes.entries()).map(([key, node]) => [
        key,
        {
          depth: node.depth,
          filePath: node.filePath,
          importedBy: node.importedBy,
          imports: node.imports,
          relativePath: node.relativePath,
        },
      ]),
    ),
    root: result.root,
    totalEdges: result.totalEdges,
    totalNodes: result.totalNodes,
  }
  return JSON.stringify(serializable, null, 2)
}
