// ─── Interfaces ────────────────────────────────────────

export interface AsciiOptions {
  font: string
  maxWidth: number
  color: string
  border: boolean
  comment: boolean
}

export interface AsciiResult {
  lines: string[]
  width: number
  height: number
}

// ─── Base character shapes ────────────────────────────
// '#' = filled pixel, ' ' = empty. Every character is exactly 5 lines.
// All lines within a character must be the same width.

const BASE_SHAPES: Record<string, string[]> = {
  // ─── Letters ───────────────────────────────────────
  A: [' ## ', '#  #', '####', '#  #', '#  #'],
  B: ['### ', '#  #', '### ', '#  #', '### '],
  C: [' ## ', '#   ', '#   ', '#   ', ' ## '],
  D: ['### ', '#  #', '#  #', '#  #', '### '],
  E: ['####', '#   ', '### ', '#   ', '####'],
  F: ['####', '#   ', '### ', '#   ', '#   '],
  G: [' ## ', '#   ', '# ##', '#  #', ' ## '],
  H: ['#  #', '#  #', '####', '#  #', '#  #'],
  I: ['###', ' # ', ' # ', ' # ', '###'],
  J: [' ###', '   #', '   #', '#  #', ' ## '],
  K: ['#  #', '# # ', '##  ', '# # ', '#  #'],
  L: ['#   ', '#   ', '#   ', '#   ', '####'],
  M: ['#    #', '##  ##', '# ## #', '#    #', '#    #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ## ', '#  #', '#  #', '#  #', ' ## '],
  P: ['### ', '#  #', '### ', '#   ', '#   '],
  Q: [' ## ', '#  #', '#  #', '# ##', ' ###'],
  R: ['### ', '#  #', '### ', '# # ', '#  #'],
  S: [' ## ', '#   ', ' ## ', '   #', ' ## '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#  #', '#  #', '#  #', '#  #', ' ## '],
  V: ['#   #', '#   #', ' # # ', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],

  // ─── Digits ────────────────────────────────────────
  '0': [' ## ', '#  #', '# ##', '#  #', ' ## '],
  '1': [' # ', '## ', ' # ', ' # ', '###'],
  '2': [' ## ', '#  #', '  # ', ' #  ', '####'],
  '3': ['### ', '   #', ' ## ', '   #', '### '],
  '4': ['#  #', '#  #', '####', '   #', '   #'],
  '5': ['####', '#   ', '### ', '   #', '### '],
  '6': [' ## ', '#   ', '### ', '#  #', ' ## '],
  '7': ['####', '   #', '  # ', ' #  ', ' #  '],
  '8': [' ## ', '#  #', ' ## ', '#  #', ' ## '],
  '9': [' ## ', '#  #', ' ## ', '   #', ' ## '],

  // ─── Punctuation ───────────────────────────────────
  ' ': ['   ', '   ', '   ', '   ', '   '],
  '.': ['   ', '   ', '   ', '   ', ' # '],
  '-': ['     ', '     ', '#####', '     ', '     '],
  '!': [' # ', ' # ', ' # ', '   ', ' # '],
  '?': [' ## ', '   #', '  # ', '    ', '  # '],
  ',': ['   ', '   ', '   ', ' # ', '#  '],
}

const CHAR_HEIGHT = 5

// ─── Font renderers ───────────────────────────────────

function renderBlockChar(lines: string[]): string[] {
  return lines.map(line => line.replaceAll('#', '\u2588')) // █
}

function renderShadowChar(lines: string[]): string[] {
  return lines.map(line => line.replaceAll('#', '\u2593')) // ▓
}

function renderThinChar(baseLines: string[]): string[] {
  return baseLines.map((line, row) => {
    let result = ''
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== '#') {
        result += ' '
        continue
      }
      const hasUp = row > 0 && baseLines[row - 1]![col] === '#'
      const hasDown = row < baseLines.length - 1 && baseLines[row + 1]![col] === '#'
      const hasLeft = col > 0 && line[col - 1] === '#'
      const hasRight = col < line.length - 1 && line[col + 1] === '#'

      const h = hasLeft || hasRight
      const v = hasUp || hasDown

      if (h && v) result += '\u253C' // ┼
      else if (h) result += '\u2500' // ─
      else if (v) result += '\u2502' // │
      else result += '\u2500' // ─ (isolated pixel)
    }
    return result
  })
}

// ─── Public API ───────────────────────────────────────

export function getCharMap(font: string): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const [char, lines] of Object.entries(BASE_SHAPES)) {
    switch (font) {
      case 'thin':
        result[char] = renderThinChar(lines)
        break
      case 'shadow':
        result[char] = renderShadowChar(lines)
        break
      default:
        result[char] = renderBlockChar(lines)
    }
  }
  return result
}

export function renderText(text: string, options: AsciiOptions): AsciiResult {
  if (text.length === 0) {
    return { height: 0, lines: [], width: 0 }
  }

  const charMap = getCharMap(options.font)
  const upperText = text.toUpperCase()
  const characters = Array.from(upperText)

  const charLines = characters.map(ch => {
    const rendered = charMap[ch] ?? charMap['?'] ?? charMap[' ']!
    return rendered
  })

  const rowGroups: string[][][] = []
  let currentGroup: string[][] = []
  let currentWidth = 0

  function flushGroup(): void {
    if (currentGroup.length > 0) {
      rowGroups.push(currentGroup)
    }
    currentGroup = []
    currentWidth = 0
  }

  for (const lines of charLines) {
    const charWidth = lines[0]!.length
    const addedWidth = currentGroup.length === 0 ? charWidth : 1 + charWidth

    if (currentWidth + addedWidth > options.maxWidth && currentGroup.length > 0) {
      flushGroup()
    }

    currentGroup.push(lines)
    currentWidth += addedWidth
  }
  flushGroup()

  const resultLines: string[] = []
  for (const group of rowGroups) {
    for (let row = 0; row < CHAR_HEIGHT; row++) {
      let line = ''
      for (let i = 0; i < group.length; i++) {
        if (i > 0) line += ' '
        line += group[i]![row]!
      }
      resultLines.push(line)
    }
  }

  const width = resultLines.reduce((max, line) => Math.max(max, line.length), 0)

  return {
    height: resultLines.length,
    lines: resultLines,
    width,
  }
}

export function measureWidth(text: string, font: string): number {
  if (text.length === 0) return 0

  const charMap = getCharMap(font)
  const upperText = text.toUpperCase()
  let width = 0

  for (let i = 0; i < upperText.length; i++) {
    const ch = upperText[i]!
    const lines = charMap[ch] ?? charMap['?'] ?? charMap[' ']!
    if (i > 0) width += 1
    width += lines[0]!.length
  }

  return width
}
