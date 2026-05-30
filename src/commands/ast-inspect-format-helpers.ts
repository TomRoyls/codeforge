import type { InspectResult } from './ast-inspect-helpers.js'

export function formatInspectTable(result: InspectResult, verbose: boolean = false): string {
  const lines: string[] = []

  lines.push(`File: ${result.filePath}`)
  lines.push(`  Nodes: ${result.totalNodes}  Lines: ${result.totalLines}  Max Depth: ${result.maxDepth}`)
  lines.push('')

  if (result.nodeTypes.length === 0) {
    lines.push('  No AST nodes detected.')
    return lines.join('\n')
  }

  const typeColWidth = Math.max(22, ...result.nodeTypes.map((nt) => nt.type.length)) + 2
  const countColWidth = 8

  const header =
    '  ' +
    'Type'.padEnd(typeColWidth) +
    'Count'.padEnd(countColWidth) +
    (verbose ? 'Lines' : 'First Line')
  lines.push(header)
  lines.push('  ' + '─'.repeat(header.length - 2))

  for (const nt of result.nodeTypes) {
    const lineStr = verbose
      ? nt.lines.slice(0, 10).join(', ') + (nt.lines.length > 10 ? '...' : '')
      : String(nt.firstLine)

    lines.push(
      '  ' +
        nt.type.padEnd(typeColWidth) +
        String(nt.count).padEnd(countColWidth) +
        lineStr,
    )
  }

  return lines.join('\n')
}

export function formatInspectJson(result: InspectResult): string {
  const output = {
    filePath: result.filePath,
    totalNodes: result.totalNodes,
    totalLines: result.totalLines,
    maxDepth: result.maxDepth,
    nodeTypes: result.nodeTypes.map((nt): Record<string, unknown> => ({
      type: nt.type,
      count: nt.count,
      lineCount: nt.lines.length,
      firstLine: nt.firstLine,
    })),
  }
  return JSON.stringify(output, null, 2)
}
