import { extname } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface MagicNumber {
  context: string
  file: string
  line: number
  occurrences: number
  shouldExtract: boolean
  suggestedName: string
  value: number
}

export interface HardcodedString {
  context: string
  file: string
  length: number
  line: number
  occurrences: number
  shouldExtract: boolean
  suggestedName: string
  value: string
}

export interface ExistingConstant {
  file: string
  line: number
  name: string
  type: 'boolean' | 'number' | 'object' | 'regex' | 'string'
  usageCount: number
  value: string
}

export interface ConstantsStats {
  byFile: Record<string, number>
  extractionCandidates: number
  totalExistingConstants: number
  totalHardcodedStrings: number
  totalMagicNumbers: number
}

export interface ConstantsResult {
  existingConstants: ExistingConstant[]
  hardcodedStrings: HardcodedString[]
  magicNumbers: MagicNumber[]
  stats: ConstantsStats
}

export interface ConstantsOptions {
  ext?: string[]
  threshold?: number
  verbose?: boolean
}

// ─── findMagicNumbers ───────────────────────────────────

/**
 * @example
 * const nums = findMagicNumbers('const x = 86400', 'app.ts')
 * console.log(nums.length)
 */
export function findMagicNumbers(content: string, filePath: string): MagicNumber[] {
  const results: MagicNumber[] = []
  const lines = content.split('\n')
  const skippedNumbers = new Set([0, 1, -1, 2])

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

    const stringStripped = stripStringsFromLine(trimmed)

    const numberMatches = stringStripped.matchAll(/\b(\d+(?:\.\d+)?)\b/g)
    for (const match of numberMatches) {
      const num = parseFloat(match[1])
      if (skippedNumbers.has(num)) continue
      if (num > Number.MAX_SAFE_INTEGER) continue

      const before = stringStripped.substring(0, match.index!)
      if (/\.\s*$/.test(before)) continue
      if (/import\s/.test(before)) continue
      if (/\bconst\s+[A-Z_]+\s*=\s*$/.test(before)) continue

      if (/\[\s*\d+\s*\]/.test(match[0]) && stringStripped.includes(`[${num}]`)) continue

      const context = trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed
      const suggested = suggestConstantName(num, trimmed)

      results.push({
        context,
        file: filePath,
        line: i + 1,
        occurrences: 1,
        shouldExtract: true,
        suggestedName: suggested,
        value: num,
      })
    }
  }

  return results
}

// ─── findHardcodedStrings ───────────────────────────────

/**
 * @example
 * const strs = findHardcodedStrings("const url = 'https://api.example.com/v1'", 'app.ts')
 * console.log(strs.length)
 */
export function findHardcodedStrings(content: string, filePath: string): HardcodedString[] {
  const results: HardcodedString[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

    const stringRegex = /['"`]([^'"`\n]{4,}?)['"`]/g
    let match: RegExpExecArray | null

    while ((match = stringRegex.exec(line)) !== null) {
      const value = match[1]

      if (/^\.(\/|\.\.)/.test(value)) continue
      if (/^[A-Z@][\w/-]*$/.test(value)) continue
      if (/^\d+(\.\d+)?$/.test(value)) continue
      if (value.length <= 3) continue

      const before = line.substring(0, match.index)
      if (/import\s/.test(before) || /from\s+$/.test(before) || /require\s*\(\s*$/.test(before)) continue

      const context = trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed
      const shouldExtract = value.length > 20 || value.length > 10
      const suggested = suggestConstantName(value, trimmed)

      results.push({
        context,
        file: filePath,
        length: value.length,
        line: i + 1,
        occurrences: 1,
        shouldExtract,
        suggestedName: suggested,
        value,
      })
    }
  }

  return results
}

// ─── findExistingConstants ──────────────────────────────

/**
 * @example
 * const consts = findExistingConstants('const MAX_RETRIES = 3', 'app.ts')
 * console.log(consts[0].name)
 */
export function findExistingConstants(content: string, filePath: string): ExistingConstant[] {
  const results: ExistingConstant[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const match = line.match(/(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*(?::\s*\w+\s*)?=\s*(.+)/)
    if (match) {
      const name = match[1]
      const valueStr = match[2].trim().replace(/;$/, '')
      const type = detectConstantType(valueStr)
      const usageCount = countNameUsage(content, name)

      results.push({
        file: filePath,
        line: i + 1,
        name,
        type,
        usageCount,
        value: valueStr.length > 40 ? valueStr.substring(0, 40) + '...' : valueStr,
      })
    }
  }

  return results
}

// ─── countOccurrences ───────────────────────────────────

/**
 * @example
 * const count = countOccurrences(86400, ['app.ts'], { 'app.ts': '86400 + 86400' })
 * console.log(count)
 */
export function countOccurrences(
  value: number | string,
  _files: string[],
  contents: Record<string, string>,
): number {
  const searchStr = String(value)
  let count = 0

  for (const content of Object.values(contents)) {
    let idx = 0
    while ((idx = content.indexOf(searchStr, idx)) !== -1) {
      count++
      idx += searchStr.length
    }
  }

  return count
}

// ─── suggestConstantName ────────────────────────────────

/**
 * @example
 * suggestConstantName(86400, 'timeout = 86400') // 'SECONDS_PER_DAY' or similar
 * suggestConstantName('https://api.example.com', 'fetch(url)') // 'API_BASE_URL'
 */
export function suggestConstantName(value: number | string, _context: string): string {
  if (typeof value === 'number') {
    if (value === 86400) return 'SECONDS_PER_DAY'
    if (value === 3600) return 'SECONDS_PER_HOUR'
    if (value === 1000) return 'MILLIS_PER_SECOND'
    if (value === 60) return 'SECONDS_PER_MINUTE'
    if (value === 24) return 'HOURS_PER_DAY'
    if (value === 7) return 'DAYS_PER_WEEK'
    if (value === 100) return 'PERCENTAGE_SCALE'
    if (value === 1024) return 'BYTES_PER_KB'
    if (value === 65536) return 'PORT_MAX'
    if (value === 255) return 'MAX_BYTE_VALUE'
    if (value === 256) return 'BYTE_RANGE'
    if (value === 404) return 'HTTP_NOT_FOUND'
    if (value === 500) return 'HTTP_INTERNAL_ERROR'
    if (value === 200) return 'HTTP_OK'
    if (value === 301) return 'HTTP_MOVED_PERMANENTLY'
    if (value === 443) return 'HTTPS_PORT'
    if (value === 80) return 'HTTP_PORT'
    if (value === 3000) return 'DEFAULT_DEV_PORT'
    if (value === 8080) return 'DEFAULT_SERVER_PORT'
    if (value >= 1000 && value < 100000) return `CONSTANT_${value}`
    return `MAGIC_NUMBER_${Math.abs(value)}`
  }

  const str = value as string
  if (/^https?:\/\//.test(str)) return 'BASE_URL'
  if (/^wss?:\/\//.test(str)) return 'WS_URL'
  if (str.includes('@') && str.includes('.')) return 'DEFAULT_EMAIL'
  if (/^#([0-9a-f]{3}){1,2}$/i.test(str)) return 'COLOR_HEX'
  if (/^\d+\.\d+\.\d+$/.test(str)) return 'VERSION'
  if (/^v\d+/.test(str)) return 'VERSION'
  if (str.length > 30) return 'LONG_STRING_CONSTANT'

  const upper = str.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  return upper.substring(0, 30) || 'STRING_CONSTANT'
}

// ─── computeConstantsStats ──────────────────────────────

/**
 * @example
 * const stats = computeConstantsStats(magicNums, hardStrings, existing)
 * console.log(stats.totalMagicNumbers)
 */
export function computeConstantsStats(
  magicNumbers: MagicNumber[],
  hardcodedStrings: HardcodedString[],
  existingConstants: ExistingConstant[],
): ConstantsStats {
  const byFile: Record<string, number> = {}

  for (const m of magicNumbers) {
    byFile[m.file] = (byFile[m.file] ?? 0) + 1
  }
  for (const s of hardcodedStrings) {
    byFile[s.file] = (byFile[s.file] ?? 0) + 1
  }

  const extractionCandidates =
    magicNumbers.filter((m) => m.shouldExtract).length +
    hardcodedStrings.filter((s) => s.shouldExtract).length

  return {
    byFile,
    extractionCandidates,
    totalExistingConstants: existingConstants.length,
    totalHardcodedStrings: hardcodedStrings.length,
    totalMagicNumbers: magicNumbers.length,
  }
}

// ─── buildConstantsResult ───────────────────────────────

/**
 * @example
 * const result = await buildConstantsResult(files, reader, {})
 * console.log(result.stats.totalMagicNumbers)
 */
export async function buildConstantsResult(
  files: string[],
  contentReader: ContentReader,
  options?: ConstantsOptions,
): Promise<ConstantsResult> {
  const threshold = options?.threshold ?? 1
  const allMagic: MagicNumber[] = []
  const allStrings: HardcodedString[] = []
  const allConstants: ExistingConstant[] = []
  const contents: Record<string, string> = {}

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const scannable = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
    if (!scannable.includes(ext)) continue

    let content: string
    try {
      content = await contentReader(file)
      contents[file] = content
    } catch {
      continue
    }

    allMagic.push(...findMagicNumbers(content, file))
    allStrings.push(...findHardcodedStrings(content, file))
    allConstants.push(...findExistingConstants(content, file))
  }

  for (const m of allMagic) {
    m.occurrences = countOccurrences(m.value, files, contents)
  }

  for (const s of allStrings) {
    s.occurrences = countOccurrences(s.value, files, contents)
    if (s.occurrences < threshold && s.length <= 20) {
      s.shouldExtract = false
    }
  }

  const stats = computeConstantsStats(allMagic, allStrings, allConstants)

  return {
    existingConstants: allConstants,
    hardcodedStrings: options?.verbose ? allStrings : allStrings.filter((s) => s.shouldExtract),
    magicNumbers: options?.verbose ? allMagic : allMagic.slice(0, 100),
    stats,
  }
}

// ─── Internal Helpers ───────────────────────────────────

function stripStringsFromLine(line: string): string {
  return line.replace(/'[^']*'/g, '""').replace(/"[^"]*"/g, '""').replace(/`[^`]*`/g, '""')
}

function detectConstantType(value: string): ExistingConstant['type'] {
  if (/^['"`]/.test(value)) return 'string'
  if (/^\d+(\.\d+)?$/.test(value)) return 'number'
  if (value === 'true' || value === 'false') return 'boolean'
  if (/^\/.*\/[gimsuy]*$/.test(value)) return 'regex'
  return 'object'
}

function countNameUsage(content: string, name: string): number {
  let count = 0
  const regex = new RegExp(`\\b${name}\\b`, 'g')
  const matches = content.match(regex)
  if (matches) count = matches.length
  return count > 0 ? count - 1 : 0
}
