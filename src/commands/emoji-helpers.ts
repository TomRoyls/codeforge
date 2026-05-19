// ─── Interfaces ──────────────────────────────────────────

export interface EmojiMatch {
  emoji: string
  name: string
  category: string
  filePath: string
  line: number
  column: number
  context: string
}

export interface EmojiStats {
  emoji: string
  name: string
  category: string
  count: number
  files: string[]
}

export interface EmojiResult {
  matches: EmojiMatch[]
  stats: EmojiStats[]
  totalEmojis: number
  uniqueEmojis: number
  byCategory: { category: string; count: number }[]
  topEmoji: EmojiStats | null
  filesWithEmojis: number
}

// ─── Emoji Map ───────────────────────────────────────────

interface EmojiInfo {
  name: string
  category: string
}

export const EMOJI_MAP: Map<string, EmojiInfo> = new Map([
  // Smileys
  ['😀', { name: 'grinning', category: 'Smileys' }],
  ['😁', { name: 'beaming', category: 'Smileys' }],
  ['😂', { name: 'joy', category: 'Smileys' }],
  ['🤣', { name: 'rofl', category: 'Smileys' }],
  ['😃', { name: 'smiley', category: 'Smileys' }],
  ['😄', { name: 'smile', category: 'Smileys' }],
  ['😅', { name: 'sweat_smile', category: 'Smileys' }],
  ['😆', { name: 'laughing', category: 'Smileys' }],
  ['😉', { name: 'wink', category: 'Smileys' }],
  ['😊', { name: 'blush', category: 'Smileys' }],
  ['😋', { name: 'yum', category: 'Smileys' }],
  ['😎', { name: 'sunglasses', category: 'Smileys' }],
  ['😏', { name: 'smirk', category: 'Smileys' }],
  ['😐', { name: 'neutral_face', category: 'Smileys' }],
  ['😑', { name: 'expressionless', category: 'Smileys' }],
  ['😢', { name: 'cry', category: 'Smileys' }],
  ['😡', { name: 'rage', category: 'Smileys' }],
  ['🤔', { name: 'thinking', category: 'Smileys' }],
  ['😴', { name: 'sleeping', category: 'Smileys' }],
  // Gestures
  ['👍', { name: 'thumbsup', category: 'Gestures' }],
  ['👎', { name: 'thumbsdown', category: 'Gestures' }],
  ['👋', { name: 'wave', category: 'Gestures' }],
  ['👏', { name: 'clap', category: 'Gestures' }],
  ['🙌', { name: 'raised_hands', category: 'Gestures' }],
  ['🤝', { name: 'handshake', category: 'Gestures' }],
  // Hearts
  ['❤️', { name: 'red_heart', category: 'Hearts' }],
  ['💔', { name: 'broken_heart', category: 'Hearts' }],
  ['💕', { name: 'two_hearts', category: 'Hearts' }],
  ['💖', { name: 'sparkling_heart', category: 'Hearts' }],
  // Animals
  ['🐱', { name: 'cat', category: 'Animals' }],
  ['🐶', { name: 'dog', category: 'Animals' }],
  ['🐻', { name: 'bear', category: 'Animals' }],
  ['🦊', { name: 'fox', category: 'Animals' }],
  // Celebration
  ['🎉', { name: 'party', category: 'Celebration' }],
  ['🎊', { name: 'confetti', category: 'Celebration' }],
  ['🎈', { name: 'balloon', category: 'Celebration' }],
  ['🎁', { name: 'gift', category: 'Celebration' }],
  // Nature
  ['🔥', { name: 'fire', category: 'Nature' }],
  ['⚡', { name: 'lightning', category: 'Nature' }],
  ['🌟', { name: 'star', category: 'Nature' }],
  ['🌈', { name: 'rainbow', category: 'Nature' }],
  // Symbols
  ['✅', { name: 'check', category: 'Symbols' }],
  ['❌', { name: 'cross', category: 'Symbols' }],
  ['⚠️', { name: 'warning', category: 'Symbols' }],
  ['💯', { name: 'hundred', category: 'Symbols' }],
  // Misc
  ['🚀', { name: 'rocket', category: 'Misc' }],
  ['💡', { name: 'bulb', category: 'Misc' }],
  ['📌', { name: 'pushpin', category: 'Misc' }],
  ['🎯', { name: 'target', category: 'Misc' }],
  // Tools
  ['🔧', { name: 'wrench', category: 'Tools' }],
  ['🛠️', { name: 'tools', category: 'Tools' }],
  ['🔨', { name: 'hammer', category: 'Tools' }],
  ['⚙️', { name: 'gear', category: 'Tools' }],
  // Office
  ['📝', { name: 'memo', category: 'Office' }],
  ['📊', { name: 'chart', category: 'Office' }],
  ['📈', { name: 'chart_up', category: 'Office' }],
  ['📋', { name: 'clipboard', category: 'Office' }],
  // Food
  ['🍕', { name: 'pizza', category: 'Food' }],
  ['☕', { name: 'coffee', category: 'Food' }],
  ['🍺', { name: 'beer', category: 'Food' }],
])

// ─── Emoji regex ─────────────────────────────────────────

const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{FE0F}]/gu

// ─── findEmojisInContent ────────────────────────────────

/**
 * Scan file content for emoji characters.
 *
 * @example
 * const matches = findEmojisInContent('Hello 😀 world', 'greet.ts')
 * // matches[0].emoji === '😀'
 * // matches[0].name === 'grinning'
 * // matches[0].line === 1
 */
export function findEmojisInContent(content: string, filePath: string): EmojiMatch[] {
  const matches: EmojiMatch[] = []
  const lines = content.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (line === undefined) continue

    let match: RegExpExecArray | null
    EMOJI_REGEX.lastIndex = 0

    while ((match = EMOJI_REGEX.exec(line)) !== null) {
      const emoji = match[0]
      const info = EMOJI_MAP.get(emoji)
      matches.push({
        category: info?.category ?? 'Other',
        column: match.index + 1,
        context: line.trim(),
        emoji,
        filePath,
        line: lineIndex + 1,
        name: info?.name ?? 'Unknown',
      })
    }
  }

  return matches
}

// ─── buildEmojiStats ────────────────────────────────────

/**
 * Aggregate raw emoji matches into per-emoji statistics.
 *
 * @example
 * const stats = buildEmojiStats(matches)
 * // stats sorted by count descending
 */
export function buildEmojiStats(matches: EmojiMatch[]): EmojiStats[] {
  const map = new Map<string, EmojiStats>()

  for (const m of matches) {
    const existing = map.get(m.emoji)
    if (existing) {
      existing.count++
      if (!existing.files.includes(m.filePath)) {
        existing.files.push(m.filePath)
      }
    } else {
      map.set(m.emoji, {
        category: m.category,
        count: 1,
        emoji: m.emoji,
        files: [m.filePath],
        name: m.name,
      })
    }
  }

  const result = Array.from(map.values())
  result.sort((a, b) => b.count - a.count)
  return result
}

// ─── buildEmojiResult ───────────────────────────────────

/**
 * Build the full EmojiResult from matches and stats.
 *
 * @example
 * const result = buildEmojiResult(matches, stats, 20)
 * // result.topEmoji is the most frequent emoji
 */
export function buildEmojiResult(matches: EmojiMatch[], stats: EmojiStats[], top: number): EmojiResult {
  const limitedStats = stats.slice(0, top)

  const categoryMap = new Map<string, number>()
  for (const m of matches) {
    const current = categoryMap.get(m.category) ?? 0
    categoryMap.set(m.category, current + 1)
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const filesSet = new Set<string>()
  for (const m of matches) {
    filesSet.add(m.filePath)
  }

  return {
    byCategory,
    filesWithEmojis: filesSet.size,
    matches,
    stats: limitedStats,
    topEmoji: limitedStats.length > 0 ? limitedStats[0]! : null,
    totalEmojis: matches.length,
    uniqueEmojis: new Set(matches.map((m) => m.emoji)).size,
  }
}
