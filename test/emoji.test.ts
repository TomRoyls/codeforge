import { describe, expect, it } from 'vitest'

import Emoji from '../src/commands/emoji.js'
import {
  buildEmojiResult,
  buildEmojiStats,
  EMOJI_MAP,
  findEmojisInContent,
  type EmojiMatch,
  type EmojiResult,
  type EmojiStats,
} from '../src/commands/emoji-helpers.js'
import { formatEmojiCsv, formatEmojiJson, formatEmojiTable } from '../src/commands/emoji-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeEmojiMatch(overrides: Partial<EmojiMatch> = {}): EmojiMatch {
  return {
    category: 'Smileys',
    column: 7,
    context: 'Hello 😀 world',
    emoji: '😀',
    filePath: 'test.ts',
    line: 1,
    name: 'grinning',
    ...overrides,
  }
}

function makeEmojiStats(overrides: Partial<EmojiStats> = {}): EmojiStats {
  return {
    category: 'Smileys',
    count: 3,
    emoji: '😀',
    files: ['a.ts', 'b.ts'],
    name: 'grinning',
    ...overrides,
  }
}

function makeEmojiResult(overrides: Partial<EmojiResult> = {}): EmojiResult {
  const matches = [makeEmojiMatch()]
  const stats = [makeEmojiStats()]
  return {
    byCategory: [{ category: 'Smileys', count: 1 }],
    filesWithEmojis: 1,
    matches,
    stats,
    topEmoji: stats[0] ?? null,
    totalEmojis: 1,
    uniqueEmojis: 1,
    ...overrides,
  }
}

// ─── EMOJI_MAP ───────────────────────────────────────────

describe('EMOJI_MAP', () => {
  it('contains grinning emoji', () => {
    expect(EMOJI_MAP.get('😀')).toEqual({ name: 'grinning', category: 'Smileys' })
  })

  it('contains thumbsup emoji', () => {
    expect(EMOJI_MAP.get('👍')).toEqual({ name: 'thumbsup', category: 'Gestures' })
  })

  it('contains red_heart emoji', () => {
    expect(EMOJI_MAP.get('❤️')).toEqual({ name: 'red_heart', category: 'Hearts' })
  })

  it('contains cat emoji', () => {
    expect(EMOJI_MAP.get('🐱')).toEqual({ name: 'cat', category: 'Animals' })
  })

  it('contains party emoji', () => {
    expect(EMOJI_MAP.get('🎉')).toEqual({ name: 'party', category: 'Celebration' })
  })

  it('contains fire emoji', () => {
    expect(EMOJI_MAP.get('🔥')).toEqual({ name: 'fire', category: 'Nature' })
  })

  it('contains check emoji', () => {
    expect(EMOJI_MAP.get('✅')).toEqual({ name: 'check', category: 'Symbols' })
  })

  it('contains rocket emoji', () => {
    expect(EMOJI_MAP.get('🚀')).toEqual({ name: 'rocket', category: 'Misc' })
  })

  it('contains wrench emoji', () => {
    expect(EMOJI_MAP.get('🔧')).toEqual({ name: 'wrench', category: 'Tools' })
  })

  it('contains memo emoji', () => {
    expect(EMOJI_MAP.get('📝')).toEqual({ name: 'memo', category: 'Office' })
  })

  it('contains pizza emoji', () => {
    expect(EMOJI_MAP.get('🍕')).toEqual({ name: 'pizza', category: 'Food' })
  })

  it('has at least 40 entries', () => {
    expect(EMOJI_MAP.size).toBeGreaterThanOrEqual(40)
  })

  it('every entry has name and category', () => {
    for (const [key, val] of EMOJI_MAP) {
      expect(val.name).toBeTruthy()
      expect(val.category).toBeTruthy()
      expect(key).toBeTruthy()
    }
  })
})

// ─── findEmojisInContent ────────────────────────────────

describe('findEmojisInContent', () => {
  it('finds a single emoji', () => {
    const matches = findEmojisInContent('Hello 😀 world', 'test.ts')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.emoji).toBe('😀')
    expect(matches[0]!.name).toBe('grinning')
    expect(matches[0]!.category).toBe('Smileys')
  })

  it('finds multiple emojis on one line', () => {
    const matches = findEmojisInContent('Good 👍 and bad 👎', 'test.ts')
    expect(matches).toHaveLength(2)
    expect(matches[0]!.emoji).toBe('👍')
    expect(matches[1]!.emoji).toBe('👎')
  })

  it('finds emojis across multiple lines', () => {
    const content = 'Line 1 😀\nLine 2 🚀\nLine 3 🔥'
    const matches = findEmojisInContent(content, 'test.ts')
    expect(matches).toHaveLength(3)
    expect(matches[0]!.line).toBe(1)
    expect(matches[1]!.line).toBe(2)
    expect(matches[2]!.line).toBe(3)
  })

  it('returns empty array when no emojis', () => {
    const matches = findEmojisInContent('Hello world no emojis here', 'test.ts')
    expect(matches).toHaveLength(0)
  })

  it('finds emoji in a comment', () => {
    const matches = findEmojisInContent('// TODO: fix this 🐛 later', 'test.ts')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.name).toBe('Unknown')
    expect(matches[0]!.category).toBe('Other')
  })

  it('finds emoji in a string literal', () => {
    const matches = findEmojisInContent('const msg = "Hello 😀!";', 'test.ts')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.emoji).toBe('😀')
  })

  it('assigns Unknown/Other for unmapped emoji', () => {
    const matches = findEmojisInContent('🫠', 'test.ts')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.name).toBe('Unknown')
    expect(matches[0]!.category).toBe('Other')
  })

  it('sets correct line number (1-based)', () => {
    const content = 'no emoji\nno emoji\n😀 here'
    const matches = findEmojisInContent(content, 'test.ts')
    expect(matches[0]!.line).toBe(3)
  })

  it('sets correct column number (1-based)', () => {
    const matches = findEmojisInContent('   😀', 'test.ts')
    expect(matches[0]!.column).toBe(4)
  })

  it('includes context as trimmed line', () => {
    const matches = findEmojisInContent('  Hello 😀 world  ', 'test.ts')
    expect(matches[0]!.context).toBe('Hello 😀 world')
  })

  it('sets filePath correctly', () => {
    const matches = findEmojisInContent('😀', 'src/utils.ts')
    expect(matches[0]!.filePath).toBe('src/utils.ts')
  })

  it('handles empty content', () => {
    const matches = findEmojisInContent('', 'test.ts')
    expect(matches).toHaveLength(0)
  })

  it('handles same emoji multiple times', () => {
    const matches = findEmojisInContent('😀 😀 😀', 'test.ts')
    expect(matches).toHaveLength(3)
  })
})

// ─── buildEmojiStats ────────────────────────────────────

describe('buildEmojiStats', () => {
  it('aggregates count by emoji', () => {
    const matches = [
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '🚀' }),
    ]
    const stats = buildEmojiStats(matches)
    const grinning = stats.find((s) => s.emoji === '😀')
    expect(grinning!.count).toBe(2)
    const rocket = stats.find((s) => s.emoji === '🚀')
    expect(rocket!.count).toBe(1)
  })

  it('collects unique files per emoji', () => {
    const matches = [
      makeEmojiMatch({ emoji: '😀', filePath: 'a.ts' }),
      makeEmojiMatch({ emoji: '😀', filePath: 'b.ts' }),
      makeEmojiMatch({ emoji: '😀', filePath: 'a.ts' }),
    ]
    const stats = buildEmojiStats(matches)
    const grinning = stats.find((s) => s.emoji === '😀')
    expect(grinning!.files).toEqual(['a.ts', 'b.ts'])
  })

  it('sorts by count descending', () => {
    const matches = [
      makeEmojiMatch({ emoji: '🚀' }),
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '🚀' }),
      makeEmojiMatch({ emoji: '🚀' }),
    ]
    const stats = buildEmojiStats(matches)
    expect(stats[0]!.emoji).toBe('🚀')
    expect(stats[0]!.count).toBe(3)
    expect(stats[1]!.emoji).toBe('😀')
    expect(stats[1]!.count).toBe(2)
  })

  it('returns empty array for empty matches', () => {
    const stats = buildEmojiStats([])
    expect(stats).toHaveLength(0)
  })

  it('preserves name and category from match', () => {
    const matches = [makeEmojiMatch({ emoji: '🎉', name: 'party', category: 'Celebration' })]
    const stats = buildEmojiStats(matches)
    expect(stats[0]!.name).toBe('party')
    expect(stats[0]!.category).toBe('Celebration')
  })
})

// ─── buildEmojiResult ───────────────────────────────────

describe('buildEmojiResult', () => {
  it('computes totalEmojis correctly', () => {
    const matches = [makeEmojiMatch(), makeEmojiMatch(), makeEmojiMatch()]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.totalEmojis).toBe(3)
  })

  it('computes uniqueEmojis correctly', () => {
    const matches = [
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '🚀' }),
    ]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.uniqueEmojis).toBe(2)
  })

  it('computes byCategory breakdown', () => {
    const matches = [
      makeEmojiMatch({ emoji: '😀', category: 'Smileys' }),
      makeEmojiMatch({ emoji: '🚀', category: 'Misc' }),
      makeEmojiMatch({ emoji: '😂', category: 'Smileys' }),
    ]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.byCategory).toHaveLength(2)
    const smileys = result.byCategory.find((c) => c.category === 'Smileys')
    expect(smileys!.count).toBe(2)
  })

  it('sets topEmoji to most frequent', () => {
    const matches = [makeEmojiMatch({ emoji: '😀' }), makeEmojiMatch({ emoji: '🚀' }), makeEmojiMatch({ emoji: '🚀' })]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.topEmoji).not.toBeNull()
    expect(result.topEmoji!.emoji).toBe('🚀')
  })

  it('sets topEmoji to null when no matches', () => {
    const result = buildEmojiResult([], [], 20)
    expect(result.topEmoji).toBeNull()
  })

  it('computes filesWithEmojis', () => {
    const matches = [
      makeEmojiMatch({ filePath: 'a.ts' }),
      makeEmojiMatch({ filePath: 'b.ts' }),
      makeEmojiMatch({ filePath: 'a.ts' }),
    ]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.filesWithEmojis).toBe(2)
  })

  it('applies top N limit to stats', () => {
    const matches = [
      makeEmojiMatch({ emoji: '😀' }),
      makeEmojiMatch({ emoji: '🚀' }),
      makeEmojiMatch({ emoji: '🔥' }),
    ]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 2)
    expect(result.stats).toHaveLength(2)
  })

  it('returns empty matches array when no input', () => {
    const result = buildEmojiResult([], [], 20)
    expect(result.matches).toHaveLength(0)
    expect(result.stats).toHaveLength(0)
    expect(result.totalEmojis).toBe(0)
    expect(result.uniqueEmojis).toBe(0)
  })

  it('sorts byCategory by count descending', () => {
    const matches = [
      makeEmojiMatch({ category: 'Misc' }),
      makeEmojiMatch({ category: 'Smileys' }),
      makeEmojiMatch({ category: 'Smileys' }),
    ]
    const stats = buildEmojiStats(matches)
    const result = buildEmojiResult(matches, stats, 20)
    expect(result.byCategory[0]!.category).toBe('Smileys')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Emoji command - static metadata', () => {
  it('has a description', () => {
    expect(Emoji.description).toBe('Scan source files for emoji usage')
  })

  it('has examples array', () => {
    expect(Array.isArray(Emoji.examples)).toBe(true)
    expect(Emoji.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Emoji.args.path).toBeDefined()
    expect(Emoji.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Emoji.args.path.default).toBe('.')
  })
})

describe('Emoji command - flags', () => {
  it('has format flag with options', () => {
    expect(Emoji.flags.format.options).toContain('json')
    expect(Emoji.flags.format.options).toContain('table')
    expect(Emoji.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Emoji.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Emoji.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Emoji.flags.ignore).toBeDefined()
    expect(Emoji.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Emoji.flags.ext).toBeDefined()
  })

  it('has top flag defaulting to 20', () => {
    expect(Emoji.flags.top.default).toBe(20)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Emoji.flags.verbose.default).toBe(false)
  })
})

describe('Emoji command - class structure', () => {
  it('exports a default class', () => {
    expect(Emoji).toBeDefined()
    expect(typeof Emoji).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Emoji.prototype.run).toBe('function')
  })
})

// ─── formatEmojiTable ───────────────────────────────────

describe('formatEmojiTable', () => {
  it('contains header with total emojis', () => {
    const result = makeEmojiResult()
    const output = formatEmojiTable(result, false)
    expect(output).toContain('Emoji Analysis Report')
    expect(output).toContain('Total emojis found')
    expect(output).toContain('Unique emojis')
    expect(output).toContain('Files with emojis')
  })

  it('shows no-emojis message when empty', () => {
    const result = makeEmojiResult({
      matches: [],
      stats: [],
      totalEmojis: 0,
      uniqueEmojis: 0,
      filesWithEmojis: 0,
      topEmoji: null,
      byCategory: [],
    })
    const output = formatEmojiTable(result, false)
    expect(output).toContain('No emojis found')
  })

  it('shows top emoji highlight', () => {
    const result = makeEmojiResult({
      topEmoji: makeEmojiStats({ emoji: '🚀', name: 'rocket', count: 5 }),
    })
    const output = formatEmojiTable(result, false)
    expect(output).toContain('Top emoji')
    expect(output).toContain('🚀')
  })

  it('shows category breakdown', () => {
    const result = makeEmojiResult({
      byCategory: [
        { category: 'Smileys', count: 3 },
        { category: 'Misc', count: 2 },
      ],
    })
    const output = formatEmojiTable(result, false)
    expect(output).toContain('Category Breakdown')
    expect(output).toContain('Smileys')
    expect(output).toContain('Misc')
  })

  it('shows table header columns', () => {
    const result = makeEmojiResult()
    const output = formatEmojiTable(result, false)
    expect(output).toContain('Name')
    expect(output).toContain('Count')
    expect(output).toContain('Category')
    expect(output).toContain('Files')
  })

  it('shows verbose per-file locations', () => {
    const result = makeEmojiResult({
      matches: [makeEmojiMatch({ filePath: 'src/app.ts', line: 42, column: 10, emoji: '😀' })],
    })
    const output = formatEmojiTable(result, true)
    expect(output).toContain('Per-File Locations')
    expect(output).toContain('src/app.ts')
    expect(output).toContain('L42')
  })

  it('hides verbose per-file locations when not verbose', () => {
    const result = makeEmojiResult({
      matches: [makeEmojiMatch({ filePath: 'src/app.ts' })],
    })
    const output = formatEmojiTable(result, false)
    expect(output).not.toContain('Per-File Locations')
  })
})

// ─── formatEmojiCsv ─────────────────────────────────────

describe('formatEmojiCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeEmojiResult({ stats: [] })
    const output = formatEmojiCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Emoji,Name,Count,Category,Files')
  })

  it('includes data rows for stats', () => {
    const result = makeEmojiResult({
      stats: [makeEmojiStats({ emoji: '😀', name: 'grinning', count: 3, category: 'Smileys', files: ['a.ts'] })],
    })
    const output = formatEmojiCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1]).toContain('😀')
    expect(lines[1]).toContain('grinning')
  })

  it('escapes commas in names', () => {
    const result = makeEmojiResult({
      stats: [makeEmojiStats({ name: 'hello,world' })],
    })
    const output = formatEmojiCsv(result)
    expect(output).toContain('"hello,world"')
  })

  it('handles empty stats', () => {
    const result = makeEmojiResult({ stats: [] })
    const output = formatEmojiCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toBe('Emoji,Name,Count,Category,Files')
  })
})

// ─── formatEmojiJson ────────────────────────────────────

describe('formatEmojiJson', () => {
  it('produces valid JSON', () => {
    const result = makeEmojiResult()
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalEmojis', () => {
    const result = makeEmojiResult({ totalEmojis: 42 })
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalEmojis).toBe(42)
  })

  it('contains stats array', () => {
    const result = makeEmojiResult()
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(Array.isArray(parsed.stats)).toBe(true)
  })

  it('contains byCategory array', () => {
    const result = makeEmojiResult()
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.byCategory).toBeDefined()
    expect(Array.isArray(parsed.byCategory)).toBe(true)
  })

  it('contains topEmoji when present', () => {
    const result = makeEmojiResult({ topEmoji: makeEmojiStats({ emoji: '🚀', name: 'rocket' }) })
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.topEmoji).toBeDefined()
    expect(parsed.topEmoji.emoji).toBe('🚀')
  })

  it('topEmoji is null when no stats', () => {
    const result = makeEmojiResult({ stats: [], topEmoji: null })
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.topEmoji).toBeNull()
  })

  it('handles empty results', () => {
    const result = makeEmojiResult({
      matches: [],
      stats: [],
      totalEmojis: 0,
      uniqueEmojis: 0,
      filesWithEmojis: 0,
      topEmoji: null,
      byCategory: [],
    })
    const output = formatEmojiJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalEmojis).toBe(0)
    expect(parsed.stats).toHaveLength(0)
  })
})
