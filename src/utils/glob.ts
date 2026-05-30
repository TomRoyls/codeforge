export interface GlobToRegexOptions {
  ignoreCase: boolean
}

const DEFAULT_OPTIONS: GlobToRegexOptions = {
  ignoreCase: false,
}

const _globToRegexCache = new Map<string, RegExp>()

export function globToRegex(pattern: string, options: Partial<GlobToRegexOptions> = {}): RegExp {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let i = 0
  const len = pattern.length
  let result = ''

  while (i < len) {
    const ch = pattern[i]

    if (ch === '*') {
      if (i + 1 < len && pattern[i + 1] === '*') {
        if (i + 2 < len && pattern[i + 2] === '/') {
          result += '(?:.*/)?'
          i += 3
        } else {
          result += '.*'
          i += 2
        }
      } else {
        result += '[^/]*'
        i++
      }
    } else if (ch === '?') {
      result += '[^/]'
      i++
    } else if (ch === '[') {
      let j = i + 1
      let bracketContent = ''
      if (j < len && pattern[j] === '!') {
        bracketContent += '^'
        j++
      }
      while (j < len && pattern[j] !== ']') {
        const bracketCh = pattern[j]
        if (bracketCh === '\\' && j + 1 < len) {
          bracketContent += escapeRegexChar(pattern[j + 1]!)
          j += 2
        } else {
          bracketContent += escapeRegexChar(bracketCh!)
          j++
        }
      }
      result += '[' + bracketContent + ']'
      i = j + 1
    } else if (ch === '\\' && i + 1 < len) {
      const nextChar = pattern[i + 1]!
      if (nextChar === '*' || nextChar === '?') {
        result += '\\' + nextChar
      } else {
        result += escapeRegexChar(nextChar)
      }
      i += 2
    } else {
      result += escapeRegexChar(ch!)
      i++
    }
  }

  const flags = opts.ignoreCase ? 'i' : ''
  const cacheKey = `${pattern}|${flags}`
  let regex = _globToRegexCache.get(cacheKey)
  if (!regex) {
    regex = new RegExp('^' + result + '$', flags)
    _globToRegexCache.set(cacheKey, regex)
  }
  return regex
}

function escapeRegexChar(ch: string): string {
  if (/[.+^${}()|[\]\\]/.test(ch)) {
    return '\\' + ch
  }
  return ch
}

export function matchGlob(input: string, pattern: string, options: Partial<GlobToRegexOptions> = {}): boolean {
  const regex = globToRegex(pattern, options)
  return regex.test(input)
}

export function matchAnyGlob(input: string, patterns: string[], options: Partial<GlobToRegexOptions> = {}): boolean {
  return patterns.some((p) => matchGlob(input, p, options))
}
