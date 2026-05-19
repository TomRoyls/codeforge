import { describe, it, expect, vi } from 'vitest'
import { resolve } from 'node:path'
import { mkdir, writeFile, rm } from 'node:fs/promises'

import {
  getCharMap,
  renderChar,
  renderText,
  centerText,
  getProjectInfo,
  formatStatsLine,
  buildAsciiResult,
  sourceBaseName,
  type FontName,
  type CharMap,
  type AsciiConfig,
  type AsciiStats,
  type AsciiResult,
} from '../src/commands/ascii-art-helpers.js'

import {
  colorize,
  formatAsciiStats,
  formatBanner,
  formatAsciiJson,
} from '../src/commands/ascii-art-format-helpers.js'

// ─── getCharMap ─────────────────────────────────────────

describe('getCharMap', () => {
  it('returns simple char map for simple font', () => {
    const map = getCharMap('simple')
    expect(map['A']).toBeDefined()
    expect(map['A'].length).toBe(5)
  })

  it('returns standard char map for standard font', () => {
    const map = getCharMap('standard')
    expect(map['A']).toBeDefined()
    expect(map['A'].length).toBe(5)
  })

  it('returns block char map for block font', () => {
    const map = getCharMap('block')
    expect(map['A']).toBeDefined()
    expect(map['A'].length).toBe(5)
  })

  it('returns shadow char map for shadow font', () => {
    const map = getCharMap('shadow')
    expect(map['A']).toBeDefined()
    expect(map['A'].length).toBe(5)
  })

  it('returns banner char map for banner font', () => {
    const map = getCharMap('banner')
    expect(map['A']).toBeDefined()
    expect(map['A'].length).toBe(5)
  })

  it('all fonts have space character', () => {
    const fonts: FontName[] = ['simple', 'standard', 'block', 'shadow', 'banner']
    for (const font of fonts) {
      const map = getCharMap(font)
      expect(map[' ']).toBeDefined()
    }
  })
})

// ─── renderChar ─────────────────────────────────────────

describe('renderChar', () => {
  const charMap = getCharMap('simple')

  it('renders uppercase A', () => {
    const lines = renderChar('A', charMap)
    expect(lines).toEqual(charMap['A'])
  })

  it('renders lowercase a as uppercase', () => {
    const lines = renderChar('a', charMap)
    expect(lines).toEqual(charMap['A'])
  })

  it('renders space', () => {
    const lines = renderChar(' ', charMap)
    expect(lines).toEqual(charMap[' '])
  })

  it('renders unknown char as space', () => {
    const lines = renderChar('@', charMap)
    expect(lines).toEqual(charMap[' '])
  })

  it('renders digit 0', () => {
    const lines = renderChar('0', charMap)
    expect(lines).toEqual(charMap['0'])
  })
})

// ─── renderText ─────────────────────────────────────────

describe('renderText', () => {
  const charMap = getCharMap('simple')

  it('returns empty array for empty string', () => {
    expect(renderText('', charMap)).toEqual([])
  })

  it('renders single character', () => {
    const lines = renderText('A', charMap)
    expect(lines.length).toBe(5)
    expect(lines[0]).toBe(' # ')
  })

  it('renders two characters side by side', () => {
    const lines = renderText('AB', charMap)
    expect(lines.length).toBe(5)
    expect(lines[0]).toBe(' # ## ')
  })

  it('renders with space between characters', () => {
    const lines = renderText('A B', charMap)
    expect(lines.length).toBe(5)
    expect(lines[0]).toContain('   ')
  })

  it('produces consistent row heights', () => {
    const lines = renderText('ABC', charMap)
    const firstLen = lines[0].length
    for (const line of lines) {
      expect(line.length).toBe(firstLen)
    }
  })

  it('renders digits', () => {
    const lines = renderText('42', charMap)
    expect(lines.length).toBe(5)
  })

  it('renders with standard font', () => {
    const stdMap = getCharMap('standard')
    const lines = renderText('HI', stdMap)
    expect(lines.length).toBe(5)
  })
})

// ─── centerText ─────────────────────────────────────────

describe('centerText', () => {
  it('centers a short line within width', () => {
    const result = centerText(['###'], 10)
    expect(result[0]).toMatch(/^   ###/)
  })

  it('does not add negative padding', () => {
    const result = centerText(['###############'], 5)
    expect(result[0]).toBe('###############')
  })

  it('handles multiple lines', () => {
    const result = centerText(['##', '##'], 10)
    expect(result.length).toBe(2)
    expect(result[0]).toMatch(/^    ##/)
  })

  it('handles empty array', () => {
    const result = centerText([], 80)
    expect(result).toEqual([])
  })

  it('handles width equal to line length', () => {
    const result = centerText(['abc'], 3)
    expect(result[0]).toBe('abc')
  })

  it('strips ANSI codes for width calculation', () => {
    const ansiLine = '\x1b[32m###\x1b[0m'
    const result = centerText([ansiLine], 10)
    expect(result[0]).toContain(ansiLine)
    expect(result[0].length).toBeGreaterThanOrEqual(10)
  })
})

// ─── getProjectInfo ─────────────────────────────────────

describe('getProjectInfo', () => {
  it('reads package.json from cwd', async () => {
    const tmpDir = resolve('/tmp/opencode/ascii-test-pkg')
    await mkdir(tmpDir, { recursive: true })
    await writeFile(
      resolve(tmpDir, 'package.json'),
      JSON.stringify({ name: 'test-pkg', version: '3.1.4', description: 'A test' }),
    )
    const info = await getProjectInfo(tmpDir)
    expect(info.name).toBe('test-pkg')
    expect(info.version).toBe('3.1.4')
    expect(info.description).toBe('A test')
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('returns defaults when no package.json', async () => {
    const info = await getProjectInfo('/tmp/opencode/nonexistent-dir-xyz')
    expect(info.name).toBe('codeforge')
    expect(info.version).toBe('0.0.0')
    expect(info.description).toBe('')
  })

  it('handles missing fields gracefully', async () => {
    const tmpDir = resolve('/tmp/opencode/ascii-test-partial')
    await mkdir(tmpDir, { recursive: true })
    await writeFile(resolve(tmpDir, 'package.json'), '{}')
    const info = await getProjectInfo(tmpDir)
    expect(info.name).toBe('unknown')
    expect(info.version).toBe('0.0.0')
    await rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── formatStatsLine ────────────────────────────────────

describe('formatStatsLine', () => {
  it('formats basic stats', () => {
    const stats: AsciiStats = {
      name: 'myapp',
      version: '1.0.0',
      description: '',
      commands: 5,
      linesOfCode: 1000,
      languages: 3,
      testCount: 42,
    }
    const line = formatStatsLine(stats)
    expect(line).toContain('myapp')
    expect(line).toContain('v1.0.0')
    expect(line).toContain('5 commands')
    expect(line).toContain('1000 LOC')
    expect(line).toContain('3 languages')
    expect(line).toContain('42 tests')
  })

  it('omits zero-count fields', () => {
    const stats: AsciiStats = {
      name: 'bare',
      version: '0.1.0',
      description: '',
      commands: 0,
      linesOfCode: 0,
      languages: 0,
      testCount: 0,
    }
    const line = formatStatsLine(stats)
    expect(line).toBe('bare v0.1.0')
  })

  it('includes only non-zero fields', () => {
    const stats: AsciiStats = {
      name: 'mid',
      version: '2.0.0',
      description: '',
      commands: 3,
      linesOfCode: 0,
      languages: 0,
      testCount: 0,
    }
    const line = formatStatsLine(stats)
    expect(line).toContain('3 commands')
    expect(line).not.toContain('LOC')
  })
})

// ─── buildAsciiResult ───────────────────────────────────

describe('buildAsciiResult', () => {
  it('builds result without stats', async () => {
    const config: AsciiConfig = {
      text: 'HI',
      font: 'simple',
      width: 80,
      color: null,
      showStats: false,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    expect(result.banner.length).toBe(5)
    expect(result.stats).toBeNull()
    expect(result.height).toBe(5)
    expect(result.width).toBe(80)
  })

  it('builds result with stats', async () => {
    const config: AsciiConfig = {
      text: 'A',
      font: 'simple',
      width: 40,
      color: null,
      showStats: true,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    expect(result.banner.length).toBe(5)
    expect(result.stats).not.toBeNull()
    expect(result.stats!.version).toBeDefined()
    expect(result.width).toBe(40)
  })

  it('uses correct font', async () => {
    const config: AsciiConfig = {
      text: 'A',
      font: 'block',
      width: 80,
      color: null,
      showStats: false,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    expect(result.banner[0]).toContain('█')
  })

  it('returns empty banner for empty text', async () => {
    const config: AsciiConfig = {
      text: '',
      font: 'simple',
      width: 80,
      color: null,
      showStats: false,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    expect(result.banner).toEqual([])
    expect(result.height).toBe(0)
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts extension', () => {
    expect(sourceBaseName('src/commands/ascii-art-helpers.ts')).toBe('ascii-art-helpers')
  })

  it('handles filename only', () => {
    expect(sourceBaseName('foo.ts')).toBe('foo')
  })

  it('does not strip non-ts extension', () => {
    expect(sourceBaseName('readme.md')).toBe('readme.md')
  })
})

// ─── colorize ───────────────────────────────────────────

describe('colorize', () => {
  it('returns lines unchanged when color is null', () => {
    const lines = ['###', '# #', '###']
    expect(colorize(lines, null)).toBe(lines)
  })

  it('applies hex color', () => {
    const result = colorize(['test'], '#ff0000')
    expect(result[0]).toContain('test')
    expect(result.length).toBe(1)
  })

  it('applies rgb color', () => {
    const result = colorize(['hello'], '255,165,0')
    expect(result[0]).toContain('hello')
    expect(result.length).toBe(1)
  })

  it('applies named color', () => {
    const result = colorize(['world'], 'green')
    expect(result[0]).toContain('world')
    expect(result.length).toBe(1)
  })

  it('handles unknown color name gracefully', () => {
    const result = colorize(['line'], 'nonexistentcolor')
    expect(result[0]).toBe('line')
  })
})

// ─── formatAsciiStats ───────────────────────────────────

describe('formatAsciiStats', () => {
  it('formats all fields', () => {
    const stats: AsciiStats = {
      name: 'pkg',
      version: '1.2.3',
      description: 'desc',
      commands: 10,
      linesOfCode: 500,
      languages: 4,
      testCount: 99,
    }
    const text = formatAsciiStats(stats)
    expect(text).toContain('pkg')
    expect(text).toContain('1.2.3')
    expect(text).toContain('10 commands')
    expect(text).toContain('500 LOC')
    expect(text).toContain('4 langs')
    expect(text).toContain('99 tests')
    expect(text).toContain('desc')
  })

  it('omits zero fields', () => {
    const stats: AsciiStats = {
      name: 'x',
      version: '0.0.1',
      description: '',
      commands: 0,
      linesOfCode: 0,
      languages: 0,
      testCount: 0,
    }
    const text = formatAsciiStats(stats)
    expect(text).not.toContain('commands')
    expect(text).not.toContain('LOC')
  })
})

// ─── formatBanner ───────────────────────────────────────

describe('formatBanner', () => {
  it('formats banner without stats', () => {
    const result: AsciiResult = {
      banner: ['###', '   ', '###'],
      stats: null,
      width: 80,
      height: 3,
    }
    const text = formatBanner(result)
    expect(text).toContain('###')
    expect(text).not.toContain('commands')
  })

  it('formats banner with stats', () => {
    const result: AsciiResult = {
      banner: ['##'],
      stats: {
        name: 'app',
        version: '1.0.0',
        description: '',
        commands: 2,
        linesOfCode: 100,
        languages: 1,
        testCount: 10,
      },
      width: 80,
      height: 1,
    }
    const text = formatBanner(result)
    expect(text).toContain('##')
    expect(text).toContain('app')
    expect(text).toContain('2 commands')
  })

  it('ends with newline', () => {
    const result: AsciiResult = {
      banner: ['##'],
      stats: null,
      width: 80,
      height: 1,
    }
    const text = formatBanner(result)
    expect(text.endsWith('\n')).toBe(true)
  })
})

// ─── formatAsciiJson ────────────────────────────────────

describe('formatAsciiJson', () => {
  it('produces valid JSON', () => {
    const result: AsciiResult = {
      banner: ['##', '##'],
      stats: null,
      width: 80,
      height: 2,
    }
    const json = formatAsciiJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.banner).toEqual(['##', '##'])
    expect(parsed.width).toBe(80)
    expect(parsed.height).toBe(2)
  })

  it('includes stats in JSON', () => {
    const result: AsciiResult = {
      banner: [],
      stats: {
        name: 'pkg',
        version: '1.0.0',
        description: 'test',
        commands: 1,
        linesOfCode: 10,
        languages: 1,
        testCount: 5,
      },
      width: 40,
      height: 0,
    }
    const json = formatAsciiJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.name).toBe('pkg')
    expect(parsed.stats.testCount).toBe(5)
  })
})

// ─── Font completeness ──────────────────────────────────

describe('font completeness', () => {
  it('simple font has A-Z', () => {
    const map = getCharMap('simple')
    for (let i = 65; i <= 90; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in simple font`).toBeDefined()
      expect(map[ch].length, `${ch} should have 5 rows`).toBe(5)
    }
  })

  it('simple font has 0-9', () => {
    const map = getCharMap('simple')
    for (let i = 48; i <= 57; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in simple font`).toBeDefined()
    }
  })

  it('standard font has A-Z', () => {
    const map = getCharMap('standard')
    for (let i = 65; i <= 90; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in standard font`).toBeDefined()
      expect(map[ch].length, `${ch} should have 5 rows`).toBe(5)
    }
  })

  it('standard font has 0-9', () => {
    const map = getCharMap('standard')
    for (let i = 48; i <= 57; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in standard font`).toBeDefined()
    }
  })

  it('block font has A-Z', () => {
    const map = getCharMap('block')
    for (let i = 65; i <= 90; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in block font`).toBeDefined()
    }
  })

  it('block font has 0-9', () => {
    const map = getCharMap('block')
    for (let i = 48; i <= 57; i++) {
      const ch = String.fromCharCode(i)
      expect(map[ch], `Missing ${ch} in block font`).toBeDefined()
    }
  })

  it('simple font has common symbols', () => {
    const map = getCharMap('simple')
    expect(map[' ']).toBeDefined()
    expect(map['-']).toBeDefined()
    expect(map['.']).toBeDefined()
    expect(map['_']).toBeDefined()
    expect(map['/']).toBeDefined()
  })

  it('standard font has common symbols', () => {
    const map = getCharMap('standard')
    expect(map[' ']).toBeDefined()
    expect(map['-']).toBeDefined()
    expect(map['.']).toBeDefined()
    expect(map['_']).toBeDefined()
    expect(map['/']).toBeDefined()
  })
})

// ─── Integration: full render pipeline ──────────────────

describe('full render pipeline', () => {
  it('renders and centers text', () => {
    const charMap = getCharMap('simple')
    const banner = renderText('HI', charMap)
    const centered = centerText(banner, 40)
    for (const line of centered) {
      expect(line.length).toBeGreaterThan(banner[0].length)
    }
  })

  it('renders, colorizes, and centers', () => {
    const charMap = getCharMap('standard')
    const banner = renderText('CODEFORGE', charMap)
    const colored = colorize(banner, 'cyan')
    const centered = centerText(colored, 100)
    expect(centered.length).toBe(5)
    for (const line of centered) {
      expect(line.length).toBeGreaterThan(banner[0].length)
    }
  })

  it('formats complete result as text', async () => {
    const config: AsciiConfig = {
      text: 'AB',
      font: 'simple',
      width: 40,
      color: null,
      showStats: false,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    const text = formatBanner(result)
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(0)
  })

  it('formats complete result as JSON', async () => {
    const config: AsciiConfig = {
      text: 'Z',
      font: 'block',
      width: 80,
      color: null,
      showStats: false,
    }
    const result = await buildAsciiResult(process.cwd(), config)
    const json = formatAsciiJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.banner.length).toBe(5)
    expect(parsed.height).toBe(5)
  })
})
