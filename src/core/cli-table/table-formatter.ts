import type { BorderChars, ColumnConfig } from './types.js'
import { clamp } from '../../utils/math-helpers.js'

export class TableFormatter {
  static getBorderChars(style: 'none' | 'single' | 'double' | 'rounded'): BorderChars {
    switch (style) {
      case 'none':
        return {
          topLeft: '',
          topRight: '',
          topMid: '',
          topHorizontal: '',
          midLeft: '',
          midRight: '',
          midMid: '',
          midHorizontal: '',
          bottomLeft: '',
          bottomRight: '',
          bottomMid: '',
          bottomHorizontal: '',
          vertical: '',
          left: '',
          right: '',
        }
      case 'single':
        return {
          topLeft: '┌',
          topRight: '┐',
          topMid: '┬',
          topHorizontal: '─',
          midLeft: '├',
          midRight: '┤',
          midMid: '┼',
          midHorizontal: '─',
          bottomLeft: '└',
          bottomRight: '┘',
          bottomMid: '┴',
          bottomHorizontal: '─',
          vertical: '│',
          left: '│',
          right: '│',
        }
      case 'double':
        return {
          topLeft: '╔',
          topRight: '╗',
          topMid: '╦',
          topHorizontal: '═',
          midLeft: '╠',
          midRight: '╣',
          midMid: '╬',
          midHorizontal: '═',
          bottomLeft: '╚',
          bottomRight: '╝',
          bottomMid: '╩',
          bottomHorizontal: '═',
          vertical: '║',
          left: '║',
          right: '║',
        }
      case 'rounded':
        return {
          topLeft: '╭',
          topRight: '╮',
          topMid: '┬',
          topHorizontal: '─',
          midLeft: '├',
          midRight: '┤',
          midMid: '┼',
          midHorizontal: '─',
          bottomLeft: '╰',
          bottomRight: '╯',
          bottomMid: '┴',
          bottomHorizontal: '─',
          vertical: '│',
          left: '│',
          right: '│',
        }
    }
  }

  formatCell(content: string, width: number, alignment: 'left' | 'center' | 'right', padding: number): string {
    const pad = ' '.repeat(padding)
    const text = content.length > width ? content.slice(0, width) : content
    const space = width - text.length
    let aligned: string
    switch (alignment) {
      case 'left':
        aligned = text + ' '.repeat(space)
        break
      case 'right':
        aligned = ' '.repeat(space) + text
        break
      case 'center': {
        const leftSpace = Math.floor(space / 2)
        const rightSpace = space - leftSpace
        aligned = ' '.repeat(leftSpace) + text + ' '.repeat(rightSpace)
        break
      }
    }
    return pad + aligned + pad
  }

  formatRow(cells: string[], border: BorderChars): string {
    const sep = border.vertical !== '' ? border.vertical : ' '
    return border.left + cells.join(sep) + border.right
  }

  formatSeparator(border: BorderChars, widths: number[], padding: number): string {
    if (border.topHorizontal === '') return ''
    const parts = widths.map((w) => border.topHorizontal.repeat(w + padding * 2))
    return border.midLeft + parts.join(border.midMid) + border.midRight
  }

  truncate(text: string, maxWidth: number): string {
    if (text.length <= maxWidth) return text
    if (maxWidth < 3) return text.slice(0, maxWidth)
    return text.slice(0, maxWidth - 3) + '...'
  }

  measureWidths(headers: string[], rows: string[][], configs: ColumnConfig[]): number[] {
    return headers.map((header, i) => {
      const config = configs[i]
      if (!config) return header.length
      if (config.width !== undefined) {
        const bounded = clamp(config.width, config.minWidth, config.maxWidth)
        return bounded
      }
      let maxLen = header.length
      for (const row of rows) {
        const cell = row[i]
        if (cell !== undefined && cell.length > maxLen) {
          maxLen = cell.length
        }
      }
      return clamp(maxLen, config.minWidth, config.maxWidth)
    })
  }
}
