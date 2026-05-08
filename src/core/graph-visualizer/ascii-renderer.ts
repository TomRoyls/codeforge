import type { RenderOptions, TreeLayout } from './types.js'

export class AsciiRenderer {
  renderTree(
    layout: TreeLayout,
    labels: Map<string, string>,
    options: RenderOptions,
  ): string {
    const lines: string[] = []
    const visited = new Set<string>()

    const renderChildren = (
      parentId: string,
      prefix: string,
      depth: number,
    ): void => {
      const children = layout.children.get(parentId) ?? []
      for (let i = 0; i < children.length; i++) {
        const childId = children[i]!
        if (visited.has(childId)) continue
        if (depth >= options.maxDepth) continue
        visited.add(childId)

        const isLast = i === children.length - 1
        const connector = this.renderConnector(depth, isLast)
        const childLabel = labels.get(childId) ?? childId
        const childDisplayLabel = options.showLabels
          ? options.nodePrefix + this.truncateLabel(childLabel, options.maxWidth - prefix.length - 4)
          : options.nodePrefix + childId

        lines.push(prefix + connector + childDisplayLabel)

        const childPrefix = prefix + (isLast ? '    ' : '│   ')
        renderChildren(childId, childPrefix, depth + 1)
      }
    }

    if (layout.root) {
      const rootLabel = labels.get(layout.root) ?? layout.root
      const displayRootLabel = options.showLabels
        ? options.nodePrefix + this.truncateLabel(rootLabel, options.maxWidth - 4)
        : options.nodePrefix + layout.root
      lines.push(displayRootLabel)
      visited.add(layout.root)
      renderChildren(layout.root, '', 0)
    }

    for (const nodeId of layout.order) {
      if (!visited.has(nodeId)) {
        visited.add(nodeId)
        const nodeLabel = labels.get(nodeId) ?? nodeId
        const displayLabel = options.showLabels
          ? options.nodePrefix + this.truncateLabel(nodeLabel, options.maxWidth - 4)
          : options.nodePrefix + nodeId
        lines.push(displayLabel)
        renderChildren(nodeId, '', 0)
      }
    }

    return lines.join('\n')
  }

  renderNode(
    _id: string,
    label: string,
    _depth: number,
    isLast: boolean,
    prefix: string,
  ): string {
    const connector = isLast ? '└── ' : '├── '
    return prefix + connector + label
  }

  renderConnector(_depth: number, isLast: boolean): string {
    return isLast ? '└── ' : '├── '
  }

  renderBox(label: string, width: number): string[] {
    const innerWidth = Math.max(width - 2, 1)
    const top = '┌' + '─'.repeat(innerWidth) + '┐'
    const bottom = '└' + '─'.repeat(innerWidth) + '┘'
    const wrappedLines = this.wrapText(label, innerWidth)
    const middle = wrappedLines.map(
      (line) => '│' + line.padEnd(innerWidth) + '│',
    )
    return [top, ...middle, bottom]
  }

  truncateLabel(label: string, maxWidth: number): string {
    if (maxWidth <= 0) return ''
    if (label.length <= maxWidth) return label
    if (maxWidth < 3) return label.slice(0, maxWidth)
    return label.slice(0, maxWidth - 3) + '...'
  }

  wrapText(text: string, maxWidth: number): string[] {
    if (maxWidth <= 0) return [text]
    const lines: string[] = []
    let remaining = text
    while (remaining.length > 0) {
      if (remaining.length <= maxWidth) {
        lines.push(remaining)
        break
      }
      let breakPoint = remaining.lastIndexOf(' ', maxWidth)
      if (breakPoint <= 0) {
        breakPoint = maxWidth
      }
      lines.push(remaining.slice(0, breakPoint))
      remaining = remaining.slice(breakPoint).trimStart()
    }
    return lines.length > 0 ? lines : [text]
  }
}
