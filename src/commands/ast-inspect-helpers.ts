import {extname} from 'node:path'

import type { ASTNode } from '../core/ast-query/types.js'
import { QueryEngine } from '../core/ast-query/query-engine.js'

export interface NodeTypeInfo {
  type: string
  count: number
  lines: number[]
  firstLine: number
}

export interface InspectResult {
  filePath: string
  totalNodes: number
  totalLines: number
  nodeTypes: NodeTypeInfo[]
  maxDepth: number
  sourcePreview: string
}

const engine = new QueryEngine()

export function inspectSource(source: string, filePath: string): InspectResult {
  const ast = engine.buildASTFromSource(source)
  const lines = source.split('\n')

  const typeMap = new Map<string, { count: number; lines: Set<number> }>()
  collectNodeTypes(ast, typeMap)

  const nodeTypes: NodeTypeInfo[] = []
  for (const [type, info] of typeMap) {
    const sortedLines = [...info.lines].sort((a, b) => a - b)
    nodeTypes.push({
      type,
      count: info.count,
      lines: sortedLines,
      firstLine: sortedLines[0] ?? 0,
    })
  }

  nodeTypes.sort((a, b) => b.count - a.count)

  const maxDepth = computeMaxDepth(ast)
  const previewLines = lines.slice(0, 3)
  const sourcePreview = previewLines.join('\n') + (lines.length > 3 ? '\n...' : '')

  return {
    filePath,
    totalNodes: countAllNodes(ast),
    totalLines: lines.length,
    nodeTypes,
    maxDepth,
    sourcePreview,
  }
}

export function filterByType(result: InspectResult, typeFilter: string): InspectResult {
  if (!typeFilter) return result
  const filtered = result.nodeTypes.filter(
    (nt) => nt.type.toLowerCase().includes(typeFilter.toLowerCase()),
  )
  return { ...result, nodeTypes: filtered }
}

export function inspectFiles(
  sources: Array<{ content: string; filePath: string }>,
): InspectResult[] {
  return sources.map(({ content, filePath }) => inspectSource(content, filePath))
}

function collectNodeTypes(
  node: ASTNode,
  typeMap: Map<string, { count: number; lines: Set<number> }>,
): void {
  const existing = typeMap.get(node.type)
  if (existing) {
    existing.count++
    existing.lines.add(node.location.startLine)
  } else {
    typeMap.set(node.type, {
      count: 1,
      lines: new Set([node.location.startLine]),
    })
  }
  for (const child of node.children) {
    collectNodeTypes(child, typeMap)
  }
}

function countAllNodes(node: ASTNode): number {
  let count = 1
  for (const child of node.children) {
    count += countAllNodes(child)
  }
  return count
}

function computeMaxDepth(node: ASTNode, depth: number = 0): number {
  if (node.children.length === 0) return depth
  let maxChildDepth = depth
  for (const child of node.children) {
    const childDepth = computeMaxDepth(child, depth + 1)
    if (childDepth > maxChildDepth) maxChildDepth = childDepth
  }
  return maxChildDepth
}

export function getFileExtension(filePath: string): string {
  return extname(filePath).toLowerCase()
}
