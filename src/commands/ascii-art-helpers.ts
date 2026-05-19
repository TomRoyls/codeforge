import { basename } from 'node:path'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type FontName = 'banner' | 'block' | 'shadow' | 'simple' | 'standard'

export interface AsciiConfig {
  text: string
  font: FontName
  width: number
  color: string | null
  showStats: boolean
}

export interface AsciiStats {
  name: string
  version: string
  description: string
  commands: number
  linesOfCode: number
  languages: number
  testCount: number
}

export interface AsciiResult {
  banner: string[]
  stats: AsciiStats | null
  width: number
  height: number
}

export type CharMap = Record<string, string[]>

// ─── Simple Font (3x5) ─────────────────────────────────

const SIMPLE_CHARS: CharMap = {
  'A': [' # ', '# #', '###', '# #', '# #'],
  'B': ['## ', '# #', '## ', '# #', '## '],
  'C': [' ##', '#  ', '#  ', '#  ', ' ##'],
  'D': ['## ', '# #', '# #', '# #', '## '],
  'E': ['###', '#  ', '## ', '#  ', '###'],
  'F': ['###', '#  ', '## ', '#  ', '#  '],
  'G': [' ##', '#  ', '# #', '# #', ' ##'],
  'H': ['# #', '# #', '###', '# #', '# #'],
  'I': ['###', ' # ', ' # ', ' # ', '###'],
  'J': ['###', '  #', '  #', '# #', ' # '],
  'K': ['# #', '# #', '## ', '# #', '# #'],
  'L': ['#  ', '#  ', '#  ', '#  ', '###'],
  'M': ['# #', '###', '# #', '# #', '# #'],
  'N': ['# #', '###', '###', '# #', '# #'],
  'O': [' ##', '# #', '# #', '# #', ' ##'],
  'P': ['## ', '# #', '## ', '#  ', '#  '],
  'Q': [' ##', '# #', '# #', ' ##', '  #'],
  'R': ['## ', '# #', '## ', '# #', '# #'],
  'S': [' ##', '#  ', ' ##', '  #', '## '],
  'T': ['###', ' # ', ' # ', ' # ', ' # '],
  'U': ['# #', '# #', '# #', '# #', ' ##'],
  'V': ['# #', '# #', '# #', ' # ', ' # '],
  'W': ['# #', '# #', '# #', '###', '# #'],
  'X': ['# #', '# #', ' # ', '# #', '# #'],
  'Y': ['# #', '# #', ' # ', ' # ', ' # '],
  'Z': ['###', '  #', ' # ', '#  ', '###'],
  '0': [' ##', '# #', '# #', '# #', ' ##'],
  '1': [' # ', '## ', ' # ', ' # ', '###'],
  '2': [' ##', '  #', ' ##', '#  ', '###'],
  '3': ['## ', '  #', ' # ', '  #', '## '],
  '4': ['# #', '# #', '###', '  #', '  #'],
  '5': ['###', '#  ', '###', '  #', '###'],
  '6': [' ##', '#  ', '###', '# #', ' ##'],
  '7': ['###', '  #', ' # ', ' # ', ' # '],
  '8': [' ##', '# #', ' ##', '# #', ' ##'],
  '9': [' ##', '# #', ' ###', '  #', ' ##'],
  ' ': ['   ', '   ', '   ', '   ', '   '],
  '-': ['   ', '   ', '###', '   ', '   '],
  '.': ['   ', '   ', '   ', '   ', ' # '],
  '_': ['   ', '   ', '   ', '   ', '###'],
  '/': ['  #', ' # ', ' # ', '#  ', '   '],
}

// ─── Standard Font (5x5) ───────────────────────────────

const STANDARD_CHARS: CharMap = {
  'A': ['  ##  ', '#    #', '######', '#    #', '#    #'],
  'B': ['##### ', '#    #', '##### ', '#    #', '##### '],
  'C': [' #####', '#     ', '#     ', '#     ', ' #####'],
  'D': ['##### ', '#    #', '#    #', '#    #', '##### '],
  'E': ['######', '#     ', '####  ', '#     ', '######'],
  'F': ['######', '#     ', '####  ', '#     ', '#     '],
  'G': [' #####', '#     ', '#  ###', '#    #', ' #####'],
  'H': ['#    #', '#    #', '######', '#    #', '#    #'],
  'I': ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  'J': ['######', '     #', '     #', '#    #', ' #### '],
  'K': ['#   #', '#  # ', '##   ', '#  # ', '#   #'],
  'L': ['#     ', '#     ', '#     ', '#     ', '######'],
  'M': ['#    #', '##  ##', '# ## #', '#    #', '#    #'],
  'N': ['#    #', '##   #', '# #  #', '#  # #', '#   ##'],
  'O': [' #### ', '#    #', '#    #', '#    #', ' #### '],
  'P': ['##### ', '#    #', '##### ', '#     ', '#     '],
  'Q': [' #### ', '#    #', '#    #', '#  # #', ' ## # '],
  'R': ['##### ', '#    #', '##### ', '#  #  ', '#   # '],
  'S': [' #####', '#     ', ' #### ', '     #', '##### '],
  'T': ['#######', '   #   ', '   #   ', '   #   ', '   #   '],
  'U': ['#    #', '#    #', '#    #', '#    #', ' #### '],
  'V': ['#    #', '#    #', ' #  # ', ' #  # ', '  ##  '],
  'W': ['#    #', '#    #', '# ## #', '##  ##', '#    #'],
  'X': ['#    #', ' #  # ', '  ##  ', ' #  # ', '#    #'],
  'Y': ['#    #', ' #  # ', '  ##  ', '  ##  ', '  ##  '],
  'Z': ['#######', '    # ', '   #  ', '  #   ', '#######'],
  '0': [' #### ', '#  ## ', '# # # ', '##  # ', ' #### '],
  '1': ['  # ', ' ## ', '  # ', '  # ', ' ###'],
  '2': [' ####', '    #', ' ### ', '#    ', '#####'],
  '3': ['#### ', '    #', ' ### ', '    #', '#### '],
  '4': ['#   #', '#   #', '#####', '    #', '    #'],
  '5': ['#####', '#    ', '#### ', '    #', '#### '],
  '6': [' ### ', '#    ', '#### ', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', '  #  '],
  '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '],
  '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
  ' ': ['    ', '    ', '    ', '    ', '    '],
  '-': ['      ', '      ', '######', '      ', '      '],
  '.': ['   ', '   ', '   ', '   ', ' # '],
  '_': ['      ', '      ', '      ', '      ', '######'],
  '/': ['    #', '   # ', '  #  ', ' #   ', '#    '],
}

// ─── Block Font (5x5) ──────────────────────────────────

const BLOCK_CHARS: CharMap = {
  'A': [' ██ ', '█  █', '████', '█  █', '█  █'],
  'B': ['███ ', '█  █', '███ ', '█  █', '███ '],
  'C': [' ███', '█   ', '█   ', '█   ', ' ███'],
  'D': ['███ ', '█  █', '█  █', '█  █', '███ '],
  'E': ['████', '█   ', '███ ', '█   ', '████'],
  'F': ['████', '█   ', '███ ', '█   ', '█   '],
  'G': [' ███', '█   ', '█ ██', '█  █', ' ███'],
  'H': ['█  █', '█  █', '████', '█  █', '█  █'],
  'I': ['███', ' █ ', ' █ ', ' █ ', '███'],
  'J': ['████', '   █', '   █', '█  █', ' ██ '],
  'K': ['█  █', '█ █ ', '██  ', '█ █ ', '█  █'],
  'L': ['█   ', '█   ', '█   ', '█   ', '████'],
  'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
  'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
  'O': [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
  'P': ['███ ', '█  █', '███ ', '█   ', '█   '],
  'Q': [' ██ ', '█  █', '█  █', '█ ██', ' ███'],
  'R': ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
  'S': [' ███', '█   ', ' ██ ', '   █', '███ '],
  'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
  'U': ['█  █', '█  █', '█  █', '█  █', ' ██ '],
  'V': ['█  █', '█  █', '█  █', ' ██ ', ' ██ '],
  'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
  'X': ['█  █', '█  █', ' ██ ', '█  █', '█  █'],
  'Y': ['█  █', ' ██ ', ' ██ ', ' ██ ', ' ██ '],
  'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
  '0': [' ██ ', '█ ██', '██ █', '█  █', ' ██ '],
  '1': [' █ ', '██ ', ' █ ', ' █ ', '███'],
  '2': [' ██ ', '   █', ' ██ ', '█   ', '████'],
  '3': ['███ ', '   █', ' ██ ', '   █', '███ '],
  '4': ['█  █', '█  █', '████', '   █', '   █'],
  '5': ['████', '█   ', '███ ', '   █', '███ '],
  '6': [' ███', '█   ', '███ ', '█  █', ' ██ '],
  '7': ['█████', '   █ ', '  █  ', ' █   ', '█    '],
  '8': [' ██ ', '█  █', ' ██ ', '█  █', ' ██ '],
  '9': [' ██ ', '█  █', ' ███', '   █', '███ '],
  ' ': ['   ', '   ', '   ', '   ', '   '],
  '-': ['    ', '    ', '████', '    ', '    '],
  '.': ['  ', '  ', '  ', '  ', '█ '],
  '_': ['    ', '    ', '    ', '    ', '████'],
}

// ─── Shadow Font (5x5) ─────────────────────────────────

const SHADOW_CHARS: CharMap = {
  'A': [' ██ ', '█▒█', '████', '█  █', '█  █'],
  'B': ['███ ', '█  █', '███ ', '█  █', '███ '],
  'C': [' ███', '█  ░', '█   ', '█  ░', ' ███'],
  'E': ['████', '█   ', '███ ', '█   ', '████'],
  'F': ['████', '█   ', '███ ', '█   ', '█   '],
  'H': ['█  █', '█  █', '████', '█  █', '█  █'],
  'I': ['███', ' ░ ', ' ░ ', ' ░ ', '███'],
  'L': ['█   ', '█   ', '█   ', '█   ', '████'],
  'O': [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
  'P': ['███ ', '█  █', '███ ', '█   ', '█   '],
  'S': [' ███', '█   ', ' ██ ', '   █', '███ '],
  'T': ['█████', '  ░  ', '  ░  ', '  ░  ', '  ░  '],
  'U': ['█  █', '█  █', '█  █', '█▒█', ' ░█ '],
  ' ': ['   ', '   ', '   ', '   ', '   '],
  '-': ['    ', '    ', '████', ' ░░ ', '    '],
  '.': ['  ', '  ', '  ', '  ', '█░'],
}

// ─── Banner Font (7x4) ─────────────────────────────────

const BANNER_CHARS: CharMap = {
  'A': [' ╔══╗ ', '║ ═ ║ ', '╠════╣ ', '║ ═ ║ ', '╚══╝ '],
  'B': ['╔══╗ ', '║ ═ ║ ', '╠══╝ ', '║ ═ ║ ', '╚══╝ '],
  'C': ['╔═══╗', '║    ', '║    ', '║    ', '╚═══╝'],
  'D': ['╔══╗ ', '║  ║ ', '║  ║ ', '║  ║ ', '╚══╝ '],
  'E': ['╔═══╗', '║    ', '╠══  ', '║    ', '╚═══╝'],
  'F': ['╔═══╗', '║    ', '╠══  ', '║    ', '║    '],
  'H': ['║  ║ ', '║  ║ ', '╠══╣ ', '║  ║ ', '║  ║ '],
  'I': ['╔══╗', ' ║  ', ' ║  ', ' ║  ', '╚══╝'],
  'L': ['║    ', '║    ', '║    ', '║    ', '╚═══╝'],
  'O': ['╔══╗ ', '║  ║ ', '║  ║ ', '║  ║ ', '╚══╝ '],
  'S': ['╔═══╗', '║    ', '╠═══╗', '    ║', '╚═══╝'],
  'T': ['╔════╗', '  ║   ', '  ║   ', '  ║   ', '  ║   '],
  'U': ['║  ║ ', '║  ║ ', '║  ║ ', '║  ║ ', '╚══╝ '],
  ' ': ['     ', '     ', '     ', '     ', '     '],
  '-': ['     ', '     ', '╔═══╗', '     ', '     '],
  '.': ['   ', '   ', '   ', '   ', ' ╔╝ '],
}

// ─── getCharMap ─────────────────────────────────────────

/**
 * @example
 * const map = getCharMap('simple')
 * console.log(map['A'][0])
 */
export function getCharMap(font: FontName): CharMap {
  switch (font) {
    case 'block': return BLOCK_CHARS
    case 'shadow': return SHADOW_CHARS
    case 'simple': return SIMPLE_CHARS
    case 'banner': return BANNER_CHARS
    case 'standard': return STANDARD_CHARS
    default: return SIMPLE_CHARS
  }
}

// ─── renderChar ─────────────────────────────────────────

/**
 * @example
 * const lines = renderChar('A', charMap)
 * console.log(lines[0])
 */
export function renderChar(char: string, charMap: CharMap): string[] {
  const upper = char.toUpperCase()
  return charMap[upper] ?? charMap[' '] ?? [' ', ' ', ' ', ' ', ' ']
}

// ─── renderText ─────────────────────────────────────────

/**
 * @example
 * const lines = renderText('HI', charMap)
 * console.log(lines.length)
 */
export function renderText(text: string, charMap: CharMap): string[] {
  if (text.length === 0) return []

  const chars = text.split('')
  const rendered = chars.map((c) => renderChar(c, charMap))

  const height = rendered[0].length
  const lines: string[] = []

  for (let row = 0; row < height; row++) {
    let line = ''
    for (const charLines of rendered) {
      line += charLines[row] ?? ''
    }
    lines.push(line)
  }

  return lines
}

// ─── centerText ─────────────────────────────────────────

/**
 * @example
 * const centered = centerText(['###'], 10)
 * console.log(centered[0])
 */
export function centerText(lines: string[], width: number): string[] {
  return lines.map((line) => {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '')
    const padding = Math.max(0, Math.floor((width - stripped.length) / 2))
    return ' '.repeat(padding) + line
  })
}

// ─── getProjectInfo ─────────────────────────────────────

/**
 * @example
 * const info = await getProjectInfo('/path/to/project')
 * console.log(info.name)
 */
export async function getProjectInfo(cwd: string): Promise<{
  name: string
  version: string
  description: string
}> {
  try {
    const pkgPath = resolve(cwd, 'package.json')
    const raw = await readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw)
    return {
      name: pkg.name ?? 'unknown',
      version: pkg.version ?? '0.0.0',
      description: pkg.description ?? '',
    }
  } catch {
    return { name: 'codeforge', version: '0.0.0', description: '' }
  }
}

// ─── formatStatsLine ────────────────────────────────────

/**
 * @example
 * const line = formatStatsLine(stats)
 * console.log(line)
 */
export function formatStatsLine(stats: AsciiStats): string {
  const parts: string[] = []
  parts.push(`v${stats.version}`)
  if (stats.commands > 0) parts.push(`${stats.commands} commands`)
  if (stats.linesOfCode > 0) parts.push(`${stats.linesOfCode} LOC`)
  if (stats.languages > 0) parts.push(`${stats.languages} languages`)
  if (stats.testCount > 0) parts.push(`${stats.testCount} tests`)
  return `${stats.name} ${parts.join(' │ ')}`
}

// ─── buildAsciiResult ───────────────────────────────────

/**
 * @example
 * const result = await buildAsciiResult('/path', { text: 'HI', font: 'simple', width: 80, color: null, showStats: false })
 * console.log(result.banner[0])
 */
export async function buildAsciiResult(
  cwd: string,
  config: AsciiConfig,
): Promise<AsciiResult> {
  const charMap = getCharMap(config.font)
  const banner = renderText(config.text, charMap)

  let stats: AsciiStats | null = null
  if (config.showStats) {
    const info = await getProjectInfo(cwd)
    stats = {
      commands: 0,
      description: info.description,
      languages: 0,
      linesOfCode: 0,
      name: info.name,
      testCount: 0,
      version: info.version,
    }
  }

  return {
    banner,
    height: banner.length,
    stats,
    width: config.width,
  }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/ascii-art-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
