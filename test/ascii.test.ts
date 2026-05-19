import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import Ascii from '../src/commands/ascii.js'
import { getCharMap, measureWidth, renderText } from '../src/commands/ascii-helpers.js'
import type { AsciiOptions } from '../src/commands/ascii-helpers.js'
import {
  addBorder,
  colorize,
  formatAsciiOutput,
  wrapInComment,
} from '../src/commands/ascii-format-helpers.js'

// ─── Test factories ───────────────────────────────────

function makeOptions(overrides: Partial<AsciiOptions> = {}): AsciiOptions {
  return {
    border: false,
    color: 'none',
    comment: false,
    font: 'block',
    maxWidth: 80,
    ...overrides,
  }
}

const TMP_DIR = join(process.cwd(), 'tmp', 'ascii-test-' + process.pid)

// ─── getCharMap ────────────────────────────────────────

describe('getCharMap', () => {
  it('returns a map for block font', () => {
    const map = getCharMap('block')
    expect(Object.keys(map).length).toBeGreaterThan(0)
  })

  it('returns a map for thin font', () => {
    const map = getCharMap('thin')
    expect(Object.keys(map).length).toBeGreaterThan(0)
  })

  it('returns a map for shadow font', () => {
    const map = getCharMap('shadow')
    expect(Object.keys(map).length).toBeGreaterThan(0)
  })

  it('contains all letters A-Z for block font', () => {
    const map = getCharMap('block')
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      expect(map[ch]).toBeDefined()
      expect(map[ch]!.length).toBe(5)
    }
  })

  it('contains all digits 0-9 for block font', () => {
    const map = getCharMap('block')
    for (const ch of '0123456789') {
      expect(map[ch]).toBeDefined()
      expect(map[ch]!.length).toBe(5)
    }
  })

  it('contains space, period, and dash', () => {
    const map = getCharMap('block')
    expect(map[' ']).toBeDefined()
    expect(map['.']).toBeDefined()
    expect(map['-']).toBeDefined()
  })

  it('block font uses █ characters', () => {
    const map = getCharMap('block')
    const aLines = map['A']!
    const joined = aLines.join('')
    expect(joined).toContain('\u2588') // █
  })

  it('thin font uses box-drawing characters', () => {
    const map = getCharMap('thin')
    const aLines = map['A']!
    const joined = aLines.join('')
    const hasBoxDrawing = joined.includes('\u2500') || joined.includes('\u2502') // ─ or │
    expect(hasBoxDrawing).toBe(true)
  })

  it('shadow font uses ▓ characters', () => {
    const map = getCharMap('shadow')
    const aLines = map['A']!
    const joined = aLines.join('')
    expect(joined).toContain('\u2593') // ▓
  })

  it('each character has consistent line widths', () => {
    const map = getCharMap('block')
    for (const [char, lines] of Object.entries(map)) {
      const widths = lines.map(l => l.length)
      const allEqual = widths.every(w => w === widths[0])
      expect(allEqual, `Character "${char}" has inconsistent widths: ${widths.join(', ')}`).toBe(true)
    }
  })
})

// ─── renderText ────────────────────────────────────────

describe('renderText', () => {
  it('renders a single character to 5 lines', () => {
    const result = renderText('A', makeOptions())
    expect(result.lines.length).toBe(5)
    expect(result.height).toBe(5)
  })

  it('renders multiple characters side by side', () => {
    const result = renderText('AB', makeOptions())
    expect(result.lines.length).toBe(5)
    const singleWidth = measureWidth('A', 'block')
    const doubleWidth = measureWidth('AB', 'block')
    expect(doubleWidth).toBe(singleWidth + 1 + measureWidth('B', 'block'))
    expect(result.width).toBe(doubleWidth)
  })

  it('renders lowercase text as uppercase', () => {
    const upper = renderText('A', makeOptions())
    const lower = renderText('a', makeOptions())
    expect(upper.lines).toEqual(lower.lines)
  })

  it('handles spaces between words', () => {
    const result = renderText('A B', makeOptions())
    expect(result.lines.length).toBe(5)
    const widthWithSpace = result.width
    const widthNoSpace = measureWidth('AB', 'block')
    expect(widthWithSpace).toBeGreaterThan(widthNoSpace)
  })

  it('returns empty result for empty string', () => {
    const result = renderText('', makeOptions())
    expect(result.lines).toEqual([])
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('handles unknown characters gracefully', () => {
    const result = renderText('@', makeOptions())
    expect(result.lines.length).toBe(5)
  })

  it('wraps text that exceeds maxWidth', () => {
    const longText = 'ABCDEFGHIJ'
    const singleWidth = measureWidth(longText, 'block')
    const narrow = makeOptions({ maxWidth: Math.floor(singleWidth / 2) })
    const result = renderText(longText, narrow)
    expect(result.lines.length).toBeGreaterThan(5)
  })

  it('respects maxWidth constraint', () => {
    const result = renderText('HELLO WORLD', makeOptions({ maxWidth: 20 }))
    for (const line of result.lines) {
      expect(line.length).toBeLessThanOrEqual(20)
    }
  })

  it('renders digits', () => {
    const result = renderText('42', makeOptions())
    expect(result.lines.length).toBe(5)
    expect(result.width).toBeGreaterThan(0)
  })

  it('renders punctuation', () => {
    const result = renderText('HI!', makeOptions())
    expect(result.lines.length).toBe(5)
    expect(result.width).toBeGreaterThan(0)
  })
})

// ─── measureWidth ──────────────────────────────────────

describe('measureWidth', () => {
  it('returns 0 for empty string', () => {
    expect(measureWidth('', 'block')).toBe(0)
  })

  it('returns correct width for a single character', () => {
    const width = measureWidth('A', 'block')
    const charMap = getCharMap('block')
    expect(width).toBe(charMap['A']![0]!.length)
  })

  it('includes gap between characters', () => {
    const widthAB = measureWidth('AB', 'block')
    const widthA = measureWidth('A', 'block')
    const widthB = measureWidth('B', 'block')
    expect(widthAB).toBe(widthA + 1 + widthB)
  })

  it('works with thin font', () => {
    const width = measureWidth('HI', 'thin')
    expect(width).toBeGreaterThan(0)
  })

  it('works with shadow font', () => {
    const width = measureWidth('HI', 'shadow')
    expect(width).toBeGreaterThan(0)
  })
})

// ─── colorize ──────────────────────────────────────────

describe('colorize', () => {
  it('returns same-length strings for valid color', () => {
    const lines = ['hello', 'world']
    const result = colorize(lines, 'red')
    expect(result.length).toBe(2)
    expect(result[0]!.length).toBeGreaterThan(0)
  })

  it('returns original lines for unknown color', () => {
    const lines = ['hello']
    const result = colorize(lines, 'nonexistent')
    expect(result).toEqual(lines)
  })

  it('handles all supported colors', () => {
    const colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white']
    for (const color of colors) {
      const result = colorize(['test'], color)
      expect(result.length).toBe(1)
    }
  })

  it('returns original lines for empty array', () => {
    const result = colorize([], 'cyan')
    expect(result).toEqual([])
  })
})

// ─── addBorder ─────────────────────────────────────────

describe('addBorder', () => {
  it('adds border around lines', () => {
    const lines = ['abc', 'def']
    const result = addBorder(lines)
    expect(result.length).toBe(4) // top + 2 content + bottom
    expect(result[0]).toContain('\u250C') // ┌
    expect(result.at(-1)).toContain('\u2518') // ┘
  })

  it('pads shorter lines to match the widest', () => {
    const lines = ['abc', 'de']
    const result = addBorder(lines)
    const contentLine1 = result[1]!
    const contentLine2 = result[2]!
    expect(contentLine1.length).toBe(contentLine2.length)
  })

  it('returns empty for empty input', () => {
    const result = addBorder([])
    expect(result).toEqual([])
  })

  it('uses box-drawing characters', () => {
    const result = addBorder(['test'])
    expect(result[0]!.startsWith('\u250C')).toBe(true) // ┌
    expect(result[0]!.endsWith('\u2510')).toBe(true) // ┐
    expect(result.at(-1)!.startsWith('\u2514')).toBe(true) // └
    expect(result.at(-1)!.endsWith('\u2518')).toBe(true) // ┘
  })
})

// ─── wrapInComment ─────────────────────────────────────

describe('wrapInComment', () => {
  it('wraps lines in /* */ block', () => {
    const lines = ['line1', 'line2']
    const result = wrapInComment(lines)
    expect(result[0]).toBe('/*')
    expect(result.at(-1)).toBe(' */')
    expect(result[1]).toBe(' * line1')
    expect(result[2]).toBe(' * line2')
  })

  it('returns empty for empty input', () => {
    const result = wrapInComment([])
    expect(result).toEqual([])
  })

  it('handles single line', () => {
    const result = wrapInComment(['hello'])
    expect(result.length).toBe(3)
    expect(result[0]).toBe('/*')
    expect(result[1]).toBe(' * hello')
    expect(result[2]).toBe(' */')
  })
})

// ─── formatAsciiOutput ────────────────────────────────

describe('formatAsciiOutput', () => {
  it('assembles plain output without extras', () => {
    const result = renderText('HI', makeOptions())
    const output = formatAsciiOutput(result, makeOptions())
    expect(output.length).toBe(5)
  })

  it('applies border when requested', () => {
    const result = renderText('A', makeOptions({ border: true }))
    const output = formatAsciiOutput(result, makeOptions({ border: true }))
    expect(output.length).toBeGreaterThan(5)
    expect(output[0]).toContain('\u250C') // ┌
  })

  it('applies comment wrapping when requested', () => {
    const result = renderText('A', makeOptions({ comment: true }))
    const output = formatAsciiOutput(result, makeOptions({ comment: true }))
    expect(output[0]).toBe('/*')
    expect(output.at(-1)).toBe(' */')
  })

  it('applies color when requested', () => {
    const result = renderText('A', makeOptions({ color: 'cyan' }))
    const output = formatAsciiOutput(result, makeOptions({ color: 'cyan' }))
    expect(output.length).toBe(5)
  })

  it('skips color when color is none', () => {
    const result = renderText('A', makeOptions({ color: 'none' }))
    const output = formatAsciiOutput(result, makeOptions({ color: 'none' }))
    expect(output.length).toBe(5)
  })

  it('combines border and comment', () => {
    const opts = makeOptions({ border: true, comment: true })
    const result = renderText('A', opts)
    const output = formatAsciiOutput(result, opts)
    expect(output[0]).toBe('/*')
    expect(output.at(-1)).toBe(' */')
  })
})

// ─── Command metadata ─────────────────────────────────

describe('Ascii command', () => {
  it('has a description', () => {
    expect(Ascii.description).toBeTruthy()
  })

  it('has examples', () => {
    expect(Ascii.examples).toBeDefined()
    expect(Ascii.examples!.length).toBeGreaterThan(0)
  })

  it('has a text argument', () => {
    expect(Ascii.args.text).toBeDefined()
  })

  it('has required flags', () => {
    expect(Ascii.flags.font).toBeDefined()
    expect(Ascii.flags.color).toBeDefined()
    expect(Ascii.flags.width).toBeDefined()
    expect(Ascii.flags.output).toBeDefined()
    expect(Ascii.flags.border).toBeDefined()
    expect(Ascii.flags.comment).toBeDefined()
  })

  it('has no-color flag', () => {
    expect(Ascii.flags['no-color']).toBeDefined()
  })
})

// ─── Integration: file output ─────────────────────────

describe('file output', () => {
  it('writes output to a file', async () => {
    await mkdir(TMP_DIR, { recursive: true })
    const outputPath = join(TMP_DIR, 'banner.txt')

    const opts = makeOptions()
    const result = renderText('HI', opts)
    const output = formatAsciiOutput(result, opts)

    const { writeFileSync } = await import('node:fs')
    writeFileSync(outputPath, output.join('\n') + '\n', 'utf8')

    const { readFile } = await import('node:fs/promises')
    const content = await readFile(outputPath, 'utf8')
    expect(content).toContain('\n')
    expect(content.length).toBeGreaterThan(0)

    await rm(TMP_DIR, { recursive: true, force: true })
  })
})
