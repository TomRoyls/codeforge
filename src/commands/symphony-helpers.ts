// ─── Types ─────────────────────────────────────────────────────────────────────

export type SectionType = 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'keyboard'
export type InstrumentRole = 'lead' | 'harmony' | 'bass' | 'rhythm' | 'solo'
export type HarmonyType = 'perfect' | 'major' | 'minor' | 'dissonant' | 'cacophonous'
export type DissonanceType = 'timing' | 'key' | 'volume' | 'style' | 'missing'
export type DissonanceSeverity = 'minor' | 'moderate' | 'major'

export interface Instrument {
  file: string
  section: string
  role: InstrumentRole
  skill: number
  range: [number, number]
  tuning: number
}

export interface OrchestraSection {
  name: string
  instruments: Instrument[]
  sectionType: SectionType
  harmony: number
  volume: number
  tuning: number
}

export interface Harmony {
  between: [string, string]
  consonance: number
  type: HarmonyType
  description: string
}

export interface Dissonance {
  file: string
  type: DissonanceType
  severity: DissonanceSeverity
  description: string
  resolution: string
}

export interface SymphonyStats {
  totalInstruments: number
  sectionCount: number
  perfectHarmonies: number
  dissonantCount: number
  overallHarmony: number
  orchestraBalance: number
  tuningScore: number
  leadInstrument: string
  loudestSection: string
  quietestSection: string
}

export interface SymphonyResult {
  instruments: Instrument[]
  sections: OrchestraSection[]
  harmonies: Harmony[]
  dissonances: Dissonance[]
  stats: SymphonyStats
  recommendations: string[]
}

// ─── Section Type Classification ────────────────────────────────────────────────

/**
 * Classify section type from directory and files.
 *
 * @example
 * classifySectionType(files, 'src/core')
 */
export function classifySectionType(files: string[], directory: string): SectionType {
  const hasTests = files.some((f) => /\.(test|spec)\./.test(f) || /^test/.test(f))
  const isTestDir = /test|spec|__tests__/.test(directory)
  if (isTestDir || (hasTests && files.every((f) => /\.(test|spec)\./.test(f)))) return 'percussion'

  const isCore = /\/core\/|\/lib\/|^core$|^lib$/.test(directory)
  if (isCore) return 'strings'

  const isCommand = /\/commands\/|\/cli\/|^commands$/.test(directory)
  if (isCommand) return 'brass'

  const isConfig = files.some((f) => /\.(json|yaml|yml|toml|rc)$/.test(f))
  const typeFiles = files.filter((f) => f.includes('type') || f.includes('interface') || f.endsWith('.d.ts'))
  if (isConfig || typeFiles.length > files.length * 0.5) return 'keyboard'

  return 'woodwinds'
}

// ─── Role Classification ────────────────────────────────────────────────────────

/**
 * Classify instrument role from file characteristics.
 *
 * @example
 * classifyRole('mod.ts', 'export function run() {}', 5, 3)
 */
export function classifyRole(file: string, content: string, imports: number, exports: number): InstrumentRole {
  if (file.includes('index') && exports > 3) return 'lead'
  if (imports > 5 && exports > 2) return 'lead'

  if (content.includes('async ') && content.includes('await ')) return 'solo'

  if (imports <= 1 && exports <= 1) return 'solo'

  const constants = (content.match(/^export (const|let|type|interface)\s/gm) || []).length
  if (constants > 3 && imports <= 2) return 'rhythm'

  if (imports > 2 || exports > 1) return 'harmony'

  return 'bass'
}

// ─── Skill (Code Quality) ──────────────────────────────────────────────────────

/**
 * Compute instrument skill (code quality 0-100).
 *
 * @example
 * computeSkill('const x: number = 1')
 */
export function computeSkill(content: string): number {
  if (content.length === 0) return 20

  let score = 40

  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  score += Math.min(15, jsdoc * 3)

  const types = (content.match(/:\s*(string|number|boolean|void|unknown)\b/g) || []).length
  score += Math.min(10, types * 2)

  const goodNames = (content.match(/(?:const|let|function|class)\s+[a-z][a-zA-Z0-9]{2,}/g) || []).length
  if (goodNames > 2) score += 10

  const anyUsage = (content.match(/:\s*any\b/g) || []).length
  score -= anyUsage * 5

  const lines = content.split('\n').filter((l) => l.trim().length > 0)
  const avgLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  if (avgLen > 0 && avgLen < 80) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── Range (Complexity Range) ──────────────────────────────────────────────────

/**
 * Compute complexity range [min, max] across functions.
 *
 * @example
 * computeRange('if (x) { for (let i = 0; ...) }')
 */
export function computeRange(content: string): [number, number] {
  const blocks = content.split(/\bfunction\b|=>\s*[{(]/)
  if (blocks.length <= 1) return [1, 1]

  const complexities = blocks.map((block) => {
    const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
    let total = 1
    for (const pat of patterns) {
      const m = block.match(pat)
      if (m) total += m.length
    }
    return total
  }).filter((c) => c > 0)

  if (complexities.length === 0) return [1, 1]
  return [Math.min(...complexities), Math.max(...complexities)]
}

// ─── Tuning (Consistency) ──────────────────────────────────────────────────────

/**
 * Compute tuning (pattern consistency within file 0-100).
 *
 * @example
 * computeTuning('function add() {} function sub() {}')
 */
export function computeTuning(content: string): number {
  if (content.length === 0) return 50

  let score = 60

  const arrowFuncs = (content.match(/=>\s*[{(]/g) || []).length
  const regularFuncs = (content.match(/\bfunction\s+\w+/g) || []).length
  const totalFuncs = arrowFuncs + regularFuncs

  if (totalFuncs > 1) {
    const ratio = Math.min(arrowFuncs, regularFuncs) / totalFuncs
    if (ratio > 0.8 || ratio === 0) score += 20
    else if (ratio > 0.5) score += 10
    else score -= 10
  }

  const exports = content.match(/^export\s/gm) || []
  if (exports.length > 0) {
    const namedExports = (content.match(/^export\s+(function|const|class|type|interface)\s/gm) || []).length
    const defaultExports = (content.match(/^export\s+default\s/gm) || []).length
    if (defaultExports > 0 && namedExports > 0) score -= 10
  }

  const namingStyles = new Set<string>()
  const names = content.match(/(?:const|let|function|class)\s+(\w+)/g) || []
  for (const n of names) {
    const name = n.replace(/^(?:const|let|function|class)\s+/, '')
    if (/^[a-z]/.test(name)) namingStyles.add('camelCase')
    if (/^[A-Z]/.test(name)) namingStyles.add('PascalCase')
    if (/_/.test(name)) namingStyles.add('snake_case')
  }
  if (namingStyles.size === 1) score += 15
  else if (namingStyles.size > 2) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── Section Harmony ────────────────────────────────────────────────────────────

/**
 * Compute section harmony (internal consistency 0-100).
 *
 * @example
 * computeSectionHarmony(section)
 */
export function computeSectionHarmony(section: OrchestraSection): number {
  if (section.instruments.length === 0) return 50

  const avgSkill = section.instruments.reduce((s, i) => s + i.skill, 0) / section.instruments.length
  const avgTuning = section.instruments.reduce((s, i) => s + i.tuning, 0) / section.instruments.length

  const skills = section.instruments.map((i) => i.skill)
  const variance = skills.length > 1
    ? skills.reduce((s, v) => s + Math.pow(v - avgSkill, 2), 0) / skills.length
    : 0
  const consistency = Math.max(0, 100 - Math.sqrt(variance))

  return Math.round(avgSkill * 0.3 + avgTuning * 0.3 + consistency * 0.4)
}

// ─── Section Volume ─────────────────────────────────────────────────────────────

/**
 * Compute section volume (relative size).
 *
 * @example
 * computeSectionVolume(section)
 */
export function computeSectionVolume(section: OrchestraSection): number {
  return section.instruments.reduce((s, i) => s + i.range[1] + i.range[0], 0) / Math.max(1, section.instruments.length)
}

// ─── Section Tuning ─────────────────────────────────────────────────────────────

/**
 * Compute section tuning (overall consistency).
 *
 * @example
 * computeSectionTuning(section)
 */
export function computeSectionTuning(section: OrchestraSection): number {
  if (section.instruments.length === 0) return 50
  return Math.round(section.instruments.reduce((s, i) => s + i.tuning, 0) / section.instruments.length)
}

// ─── Measure Harmony Between Sections ───────────────────────────────────────────

/**
 * Measure harmony (consonance) between two sections.
 *
 * @example
 * measureHarmony(sectionA, sectionB)
 */
export function measureHarmony(sectionA: OrchestraSection, sectionB: OrchestraSection): Harmony {
  const nameA = sectionA.name
  const nameB = sectionB.name

  let consonance = 50

  const tuningDiff = Math.abs(sectionA.tuning - sectionB.tuning)
  consonance += Math.max(0, 25 - tuningDiff * 0.5)

  const harmonyDiff = Math.abs(sectionA.harmony - sectionB.harmony)
  consonance += Math.max(0, 25 - harmonyDiff * 0.5)

  consonance = Math.max(0, Math.min(100, Math.round(consonance)))

  let type: HarmonyType = 'perfect'
  if (consonance >= 85) type = 'perfect'
  else if (consonance >= 70) type = 'major'
  else if (consonance >= 50) type = 'minor'
  else if (consonance >= 30) type = 'dissonant'
  else type = 'cacophonous'

  const descriptions: Record<HarmonyType, string> = {
    perfect: `${nameA} and ${nameB} play in perfect harmony`,
    major: `${nameA} and ${nameB} are mostly harmonious`,
    minor: `${nameA} and ${nameB} have minor harmonic tensions`,
    dissonant: `${nameA} and ${nameB} create dissonance`,
    cacophonous: `${nameA} and ${nameB} are severely out of tune with each other`,
  }

  return { between: [nameA, nameB], consonance, type, description: descriptions[type] }
}

// ─── Detect Dissonance ─────────────────────────────────────────────────────────

/**
 * Detect dissonances across files.
 *
 * @example
 * detectDissonance(files, contents, sections)
 */
export function detectDissonance(files: string[], contents: string[], sections: OrchestraSection[]): Dissonance[] {
  const dissonances: Dissonance[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''

    const hasAsync = /\basync\b/.test(content)
    const hasSync = /\bfunction\s+\w+\s*\([^)]*\)\s*\{/.test(content) && !hasAsync
    const hasCallback = /\bcallback\b|\bcb\b/.test(content)

    if (hasAsync && hasCallback) {
      dissonances.push({
        file, type: 'timing', severity: 'moderate',
        description: 'Mixed async/callback patterns',
        resolution: 'Standardize on async/await throughout',
      })
    }

    const camelCase = (content.match(/(?:const|let|function)\s+[a-z][a-zA-Z0-9]*/g) || []).length
    const snakeCase = (content.match(/(?:const|let|function)\s+\w+_\w+/g) || []).length
    if (camelCase > 0 && snakeCase > 0 && camelCase < snakeCase * 3) {
      dissonances.push({
        file, type: 'key', severity: 'minor',
        description: 'Mixed naming conventions (camelCase and snake_case)',
        resolution: 'Adopt consistent naming convention',
      })
    }

    const lines = content.split('\n').length
    if (lines > 500) {
      dissonances.push({
        file, type: 'volume', severity: lines > 1000 ? 'major' : 'moderate',
        description: `File is ${lines} lines — too loud for the ensemble`,
        resolution: 'Split into smaller, focused modules',
      })
    }
  }

  const sectionTypes = new Set(sections.map((s) => s.sectionType))
  if (!sectionTypes.has('percussion')) {
    dissonances.push({
      file: '*', type: 'missing', severity: 'major',
      description: 'No test section (percussion) in the orchestra',
      resolution: 'Add test files to establish rhythm',
    })
  }

  return dissonances
}

// ─── Overall Harmony ────────────────────────────────────────────────────────────

/**
 * Compute overall harmony from harmony measurements.
 *
 * @example
 * computeOverallHarmony(harmonies)
 */
export function computeOverallHarmony(harmonies: Harmony[]): number {
  if (harmonies.length === 0) return 50
  return Math.round(harmonies.reduce((s, h) => s + h.consonance, 0) / harmonies.length)
}

// ─── Orchestra Balance ─────────────────────────────────────────────────────────

/**
 * Compute orchestra balance (how evenly distributed sections are).
 *
 * @example
 * computeOrchestraBalance(sections)
 */
export function computeOrchestraBalance(sections: OrchestraSection[]): number {
  if (sections.length <= 1) return 50

  const sizes = sections.map((s) => s.instruments.length)
  const avg = sizes.reduce((s, v) => s + v, 0) / sizes.length
  if (avg === 0) return 50

  const variance = sizes.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / sizes.length
  const cv = Math.sqrt(variance) / avg

  return Math.max(0, Math.min(100, Math.round(100 - cv * 100)))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate symphony recommendations.
 *
 * @example
 * generateRecommendations(instruments, sections, harmonies, dissonances, stats)
 */
export function generateRecommendations(
  _instruments: Instrument[],
  sections: OrchestraSection[],
  _harmonies: Harmony[],
  dissonances: Dissonance[],
  stats: SymphonyStats,
): string[] {
  const recs: string[] = []

  const majors = dissonances.filter((d) => d.severity === 'major')
  if (majors.length > 0) {
    recs.push(`${majors.length} major dissonance(s) need resolution — address: ${majors.slice(0, 3).map((d) => d.description).join('; ')}`)
  }

  if (stats.orchestraBalance < 40) {
    recs.push('The orchestra is unbalanced — some sections dominate while others are underrepresented')
  }

  const poorTuning = sections.filter((s) => s.tuning < 50)
  if (poorTuning.length > 0) {
    recs.push(`${poorTuning.length} section(s) need better tuning — standardize: ${poorTuning.map((s) => s.name).join(', ')}`)
  }

  if (stats.dissonantCount > 3) {
    recs.push(`${stats.dissonantCount} dissonant harmonies — improve cross-module consistency`)
  }

  if (stats.overallHarmony > 75) {
    recs.push('The symphony plays beautifully — maintain these high harmony standards')
  }

  if (recs.length === 0) {
    recs.push('The orchestra performs with admirable harmony and balance')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete symphony result.
 *
 * @example
 * buildSymphonyResult(['a.ts'], ['code'], {})
 */
export function buildSymphonyResult(files: string[], contents: string[], options: Record<string, unknown>): SymphonyResult {
  if (files.length === 0) {
    const emptyStats: SymphonyStats = {
      totalInstruments: 0, sectionCount: 0, perfectHarmonies: 0, dissonantCount: 0,
      overallHarmony: 0, orchestraBalance: 0, tuningScore: 0,
      leadInstrument: 'none', loudestSection: 'none', quietestSection: 'none',
    }
    return { instruments: [], sections: [], harmonies: [], dissonances: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const dirMap = new Map<string, { files: string[]; contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const dir = files[i].includes('/') ? files[i].substring(0, files[i].lastIndexOf('/')) : '.'
    if (!dirMap.has(dir)) dirMap.set(dir, { files: [], contents: [] })
    dirMap.get(dir)!.files.push(files[i])
    dirMap.get(dir)!.contents.push(contents[i] ?? '')
  }

  const instruments: Instrument[] = []

  const sections: OrchestraSection[] = []
  for (const [dir, data] of dirMap) {
    const sectionType = classifySectionType(data.files, dir)
    const sectionInstruments: Instrument[] = []

    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i]
      const content = data.contents[i] ?? ''
      const imports = (content.match(/^import\s/gm) || []).length
      const exports = (content.match(/^export\s/gm) || []).length

      const instrument: Instrument = {
        file,
        section: dir,
        role: classifyRole(file, content, imports, exports),
        skill: computeSkill(content),
        range: computeRange(content),
        tuning: computeTuning(content),
      }
      sectionInstruments.push(instrument)
      instruments.push(instrument)
    }

    const section: OrchestraSection = {
      name: dir,
      instruments: sectionInstruments,
      sectionType,
      harmony: 0,
      volume: 0,
      tuning: 0,
    }
    section.harmony = computeSectionHarmony(section)
    section.volume = computeSectionVolume(section)
    section.tuning = computeSectionTuning(section)
    sections.push(section)
  }

  const harmonies: Harmony[] = []
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      harmonies.push(measureHarmony(sections[i], sections[j]))
    }
  }

  const dissonances = detectDissonance(files, contents, sections)

  const perfectHarmonies = harmonies.filter((h) => h.type === 'perfect').length
  const dissonantCount = harmonies.filter((h) => h.type === 'dissonant' || h.type === 'cacophonous').length
  const overallHarmony = computeOverallHarmony(harmonies)
  const orchestraBalance = computeOrchestraBalance(sections)
  const tuningScore = sections.length > 0
    ? Math.round(sections.reduce((s, sec) => s + sec.tuning, 0) / sections.length)
    : 50

  const sortedBySkill = [...instruments].sort((a, b) => b.skill - a.skill)
  const leadInstrument = sortedBySkill[0]?.file ?? 'none'

  const sortedByVolume = [...sections].sort((a, b) => b.volume - a.volume)
  const loudestSection = sortedByVolume[0]?.name ?? 'none'
  const quietestSection = sortedByVolume[sortedByVolume.length - 1]?.name ?? 'none'

  const stats: SymphonyStats = {
    totalInstruments: instruments.length,
    sectionCount: sections.length,
    perfectHarmonies,
    dissonantCount,
    overallHarmony,
    orchestraBalance,
    tuningScore,
    leadInstrument,
    loudestSection,
    quietestSection,
  }

  const recommendations = generateRecommendations(instruments, sections, harmonies, dissonances, stats)

  return { instruments, sections, harmonies, dissonances, stats, recommendations }
}
