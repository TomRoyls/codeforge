// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Creature {
  name: string
  type: CreatureType
  description: string
  habitat: string[]
  dangerLevel: 'harmless' | 'caution' | 'dangerous' | 'lethal'
  frequency: number
  behaviors: string[]
  weaknesses: string[]
  loot: string
}

export type CreatureType =
  | 'dragon'
  | 'unicorn'
  | 'phoenix'
  | 'hydra'
  | 'golem'
  | 'ghost'
  | 'chimera'
  | 'kraken'
  | 'sprite'
  | 'gargoyle'

export interface CreatureSighting {
  file: string
  line: number
  creature: string
  evidence: string
  severity: number
}

export interface BestiaryStats {
  totalCreatures: number
  totalSightings: number
  dangerousCreatures: number
  harmlessCreatures: number
  mostCommonCreature: string
  mostDangerousArea: string
  ecosystemHealth: number
  biodiversity: number
}

export interface BestiaryResult {
  creatures: Creature[]
  sightings: CreatureSighting[]
  stats: BestiaryStats
  recommendations: string[]
}

// ─── Dragon Detection ─────────────────────────────────────────────────────────

/**
 * Detect dragons: dangerous anti-patterns.
 *
 * @example
 * detectDragons('a.ts', 'eval("code")')
 */
export function detectDragons(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []

  const evalMatch = content.match(/\beval\s*\(/g)
  if (evalMatch) {
    const line = content.substring(0, content.indexOf('eval(')).split('\n').length
    sightings.push({
      file, line, creature: 'Dragon',
      evidence: 'eval() usage — executes arbitrary code',
      severity: 90,
    })
  }

  const funcMatch = content.match(/new\s+Function\s*\(/g)
  if (funcMatch) {
    const line = content.substring(0, content.indexOf('new Function(')).split('\n').length
    sightings.push({
      file, line, creature: 'Dragon',
      evidence: 'new Function() — dynamic code execution',
      severity: 85,
    })
  }

  let maxNest = 0
  let curNest = 0
  for (const ch of content) {
    if (ch === '{') { curNest++; if (curNest > maxNest) maxNest = curNest }
    if (ch === '}') curNest = Math.max(0, curNest - 1)
  }
  if (maxNest > 5) {
    sightings.push({
      file, line: 1, creature: 'Dragon',
      evidence: `Nesting depth ${maxNest} — callback hell / pyramid of doom`,
      severity: Math.min(100, 50 + (maxNest - 5) * 10),
    })
  }

  return sightings
}

// ─── Unicorn Detection ────────────────────────────────────────────────────────

/**
 * Detect unicorns: rare perfect code patterns.
 *
 * @example
 * detectUnicorns('a.ts', '/** docs *\\/ export function foo(x: number): number { try {} catch(e) {} }')
 */
export function detectUnicorns(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []

  const exports = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  const exportCount = exports ? exports.length : 0

  const jsdoc = content.match(/\/\*\*[\s\S]*?\*\//g)
  const jsdocCount = jsdoc ? jsdoc.length : 0

  const catches = content.match(/\bcatch\s*\(/g)
  const catchCount = catches ? catches.length : 0

  const typeAnnotations = content.match(/:\s*(?:string|number|boolean|void|object|unknown)\b/g)
  const typeCount = typeAnnotations ? typeAnnotations.length : 0

  if (exportCount > 0 && jsdocCount >= exportCount && catchCount > 0 && typeCount >= exportCount) {
    sightings.push({
      file, line: 1, creature: 'Unicorn',
      evidence: `Perfect code: ${jsdocCount} JSDoc, ${catchCount} error handlers, ${typeCount} type annotations`,
      severity: 5,
    })
  }

  return sightings
}

// ─── Phoenix Detection ────────────────────────────────────────────────────────

/**
 * Detect phoenixes: recently refactored code.
 *
 * @example
 * detectPhoenixes('a.ts', 'refactored code', true)
 */
export function detectPhoenixes(file: string, _content: string, wasRefactored: boolean): CreatureSighting[] {
  if (!wasRefactored) return []
  return [{
    file, line: 1, creature: 'Phoenix',
    evidence: 'Recently refactored — code reborn from the ashes',
    severity: 10,
  }]
}

// ─── Hydra Detection ──────────────────────────────────────────────────────────

/**
 * Detect hydras: high coupling code that spawns more problems.
 *
 * @example
 * detectHydras('a.ts', 'import ...', 8)
 */
export function detectHydras(file: string, content: string, dependencyCount: number): CreatureSighting[] {
  const imports = content.match(/^import\s+/gm)
  const importCount = imports ? imports.length : 0

  if (importCount > 8 || dependencyCount > 8) {
    return [{
      file, line: 1, creature: 'Hydra',
      evidence: `High coupling: ${importCount} imports, ${dependencyCount} dependents — cut one head, two grow back`,
      severity: Math.min(80, 30 + Math.max(importCount, dependencyCount) * 5),
    }]
  }

  return []
}

// ─── Golem Detection ──────────────────────────────────────────────────────────

/**
 * Detect golems: massive code blocks (functions > 100 lines).
 *
 * @example
 * detectGolems('a.ts', 'function big() { ... }')
 */
export function detectGolems(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []
  const lines = content.split('\n')

  let fnStart = -1
  let braceDepth = 0
  let fnName = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const fnMatch = line.match(/(?:function\s+(\w+)\s*\([^)]*\)\s*\{|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>\s*\{)/)
    if (fnMatch && fnStart === -1) {
      fnStart = i
      fnName = fnMatch[1] ?? fnMatch[2] ?? 'anonymous'
      braceDepth = 0
    }

    if (fnStart !== -1) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }

      if (braceDepth === 0 && i > fnStart) {
        const fnLength = i - fnStart + 1
        if (fnLength > 100) {
          sightings.push({
            file, line: fnStart + 1, creature: 'Golem',
            evidence: `Function '${fnName}' is ${fnLength} lines — massive and slow-moving`,
            severity: Math.min(70, 30 + fnLength - 100),
          })
        }
        fnStart = -1
      }
    }
  }

  return sightings
}

// ─── Ghost Detection ──────────────────────────────────────────────────────────

/**
 * Detect ghosts: dead code, unused exports, unreachable branches.
 *
 * @example
 * detectGhosts('a.ts', 'export function unused() {} return; x = 1;')
 */
export function detectGhosts(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (/^\s*return\s*;?\s*$/.test(line) && i + 1 < lines.length) {
      const nextLines = lines.slice(i + 1, i + 4).join('\n')
      if (nextLines.trim().length > 0 && !/^\s*[}\])]/.test(lines[i + 1]!)) {
        sightings.push({
          file, line: i + 2, creature: 'Ghost',
          evidence: 'Unreachable code after return statement',
          severity: 40,
        })
        break
      }
    }
  }

  const exports = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/gm)
  if (exports && exports.length > 3) {
    const names = exports.map((e) => { const m = e.match(/(\w+)$/); return m ? m[1] : '' })
    const nonTestFile = !/\.(test|spec)\./.test(file)
    if (nonTestFile && names.length > 5) {
      sightings.push({
        file, line: 1, creature: 'Ghost',
        evidence: `${names.length} exports — some may be unused (ghostly presence)`,
        severity: 30,
      })
    }
  }

  return sightings
}

// ─── Chimera Detection ────────────────────────────────────────────────────────

/**
 * Detect chimeras: files mixing multiple unrelated concerns.
 *
 * @example
 * detectChimeras('a.ts', "import {a} from 'ui'\nimport {b} from 'db'")
 */
export function detectChimeras(file: string, content: string): CreatureSighting[] {
  const imports = content.match(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm) ?? []
  const domains = new Set<string>()

  for (const imp of imports) {
    const sourceMatch = imp.match(/from\s+['"]([^'"]+)['"]/)
    if (sourceMatch) {
      const source = sourceMatch[1]!
      if (source.startsWith('.')) {
        const parts = source.split('/')
        if (parts.length > 1) domains.add(parts[1]!)
      } else {
        const top = source.split('/')[0]!
        domains.add(top)
      }
    }
  }

  if (domains.size > 5) {
    return [{
      file, line: 1, creature: 'Chimera',
      evidence: `Mixed concerns: ${domains.size} different domains imported`,
      severity: Math.min(60, 20 + domains.size * 8),
    }]
  }

  return []
}

// ─── Kraken Detection ─────────────────────────────────────────────────────────

/**
 * Detect krakens: deeply nested chains.
 *
 * @example
 * detectKrakens('a.ts', '.then(() => { .then(() => { .then(() => { .then(() => {}) }) }) })')
 */
export function detectKrakens(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []

  const thenCount = (content.match(/\.then\s*\(/g) ?? []).length
  const catchCount = (content.match(/\.catch\s*\(/g) ?? []).length
  const chainLength = thenCount + catchCount

  if (chainLength > 4) {
    sightings.push({
      file, line: 1, creature: 'Kraken',
      evidence: `Promise chain with ${chainLength} links — tentacles reaching deep`,
      severity: Math.min(75, 25 + chainLength * 10),
    })
  }

  const callbackPattern = content.match(/\)\s*\{\s*\n[^}]*\)\s*\{\s*\n[^}]*\)\s*\{/g)
  if (callbackPattern && callbackPattern.length > 2) {
    sightings.push({
      file, line: 1, creature: 'Kraken',
      evidence: `${callbackPattern.length} deeply nested callbacks — tentacles everywhere`,
      severity: 65,
    })
  }

  return sightings
}

// ─── Sprite Detection ─────────────────────────────────────────────────────────

/**
 * Detect sprites: small elegant utility functions.
 *
 * @example
 * detectSprites('a.ts', 'function add(a: number, b: number) { return a + b }')
 */
export function detectSprites(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []
  const lines = content.split('\n')

  const fnPattern = /(?:function\s+(\w+)\s*\([^)]*\)\s*\{|(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>\s*\{)/
  let i = 0
  while (i < lines.length) {
    const match = lines[i]!.match(fnPattern)
    if (match) {
      const name = match[1] ?? match[2] ?? 'anonymous'
      const startLine = i
      let braceDepth = 0
      let endLine = i
      let started = false

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]!) {
          if (ch === '{') { braceDepth++; started = true }
          if (ch === '}') braceDepth--
        }
        if (started && braceDepth === 0) { endLine = j; break }
      }

      const fnLength = endLine - startLine + 1
      if (fnLength > 0 && fnLength <= 10) {
        const fnText = lines.slice(startLine, endLine + 1).join('\n')
        const hasReturn = /return\s+/.test(fnText)
        const hasParams = /\([^)]+\)/.test(fnText)

        if (hasReturn && hasParams) {
          sightings.push({
            file, line: startLine + 1, creature: 'Sprite',
            evidence: `Elegant function '${name}' — ${fnLength} lines, pure and focused`,
            severity: 5,
          })
        }
      }
      i = endLine + 1
    } else {
      i++
    }
  }

  return sightings
}

// ─── Gargoyle Detection ───────────────────────────────────────────────────────

/**
 * Detect gargoyles: defensive code patterns.
 *
 * @example
 * detectGargoyles('a.ts', 'if (!x) return; if (typeof y !== "string") throw new Error()')
 */
export function detectGargoyles(file: string, content: string): CreatureSighting[] {
  const sightings: CreatureSighting[] = []

  const earlyReturns = (content.match(/if\s*\([^)]*\)\s*(?:\{\s*)?return/g) ?? []).length
  const throwGuards = (content.match(/if\s*\([^)]*\)\s*(?:\{\s*)?throw/g) ?? []).length
  const typeGuards = (content.match(/typeof\s+\w+\s*(?:===|!==)\s*['"]\w+['"]/g) ?? []).length
  const nullChecks = (content.match(/\!\w+|\?\.\w+|\?\?\s*/g) ?? []).length

  const guardCount = earlyReturns + throwGuards + typeGuards + Math.min(nullChecks, 5)

  if (guardCount >= 3) {
    sightings.push({
      file, line: 1, creature: 'Gargoyle',
      evidence: `${guardCount} defensive patterns — standing guard at the gates`,
      severity: 5,
    })
  }

  return sightings
}

// ─── Creature Catalog Builder ─────────────────────────────────────────────────

/**
 * Build creature from sightings.
 *
 * @example
 * buildCreature('Dragon', sightings)
 */
export function buildCreature(type: CreatureType, sightings: CreatureSighting[]): Creature {
  const info: Record<CreatureType, { description: string; dangerLevel: Creature['dangerLevel']; behaviors: string[]; weaknesses: string[]; loot: string }> = {
    dragon: { description: 'Dangerous anti-patterns that breathe fire through your codebase', dangerLevel: 'dangerous', behaviors: ['Code execution', 'Deep nesting', 'Security risks'], weaknesses: ['Replace eval with safe alternatives', 'Flatten nesting with early returns'], loot: 'Security and maintainability improved' },
    unicorn: { description: 'Rare perfect code patterns — almost mythical in their elegance', dangerLevel: 'harmless', behaviors: ['Perfect documentation', 'Comprehensive error handling', 'Full type coverage'], weaknesses: ['None — replicate this pattern'], loot: 'Exemplar for the team' },
    phoenix: { description: 'Code reborn from refactoring ashes — fresh and renewed', dangerLevel: 'harmless', behaviors: ['Recently refactored', 'Improved structure'], weaknesses: ['Monitor for regression'], loot: 'Cleaner architecture' },
    hydra: { description: 'High-coupling code where fixing one problem spawns two more', dangerLevel: 'dangerous', behaviors: ['High fan-out', 'Many dependents', 'Cascading changes'], weaknesses: ['Decouple interfaces', 'Introduce abstraction layers'], loot: 'Independent, testable modules' },
    golem: { description: 'Massive slow-moving code blocks that crush productivity', dangerLevel: 'caution', behaviors: ['Functions > 100 lines', 'Hard to understand', 'Difficult to test'], weaknesses: ['Break into smaller functions', 'Extract responsibilities'], loot: 'Maintainable, testable code' },
    ghost: { description: 'Dead code haunting the codebase — present but unreachable', dangerLevel: 'caution', behaviors: ['Unused exports', 'Unreachable branches', 'Dead variables'], weaknesses: ['Remove dead code', 'Tree-shake exports'], loot: 'Reduced bundle size and confusion' },
    chimera: { description: 'Files mixing multiple unrelated concerns into one beast', dangerLevel: 'caution', behaviors: ['Multiple domains', 'Mixed responsibilities'], weaknesses: ['Split by domain', 'Apply single responsibility'], loot: 'Clear module boundaries' },
    kraken: { description: 'Deeply nested chains with tentacles reaching everywhere', dangerLevel: 'dangerous', behaviors: ['Promise chains', 'Callback pyramids', 'Deep nesting'], weaknesses: ['Use async/await', 'Flatten promise chains'], loot: 'Readable async code' },
    sprite: { description: 'Small elegant utility functions — quick and helpful', dangerLevel: 'harmless', behaviors: ['Short functions', 'Pure logic', 'Clear purpose'], weaknesses: ['Keep them pure'], loot: 'Reusable building blocks' },
    gargoyle: { description: 'Defensive code standing guard at module boundaries', dangerLevel: 'harmless', behaviors: ['Input validation', 'Type guards', 'Early returns'], weaknesses: ['Keep guards focused'], loot: 'Robust error prevention' },
  }

  const c = info[type]
  return {
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    description: c.description,
    habitat: [...new Set(sightings.map((s) => s.file))],
    dangerLevel: c.dangerLevel,
    frequency: sightings.length,
    behaviors: c.behaviors,
    weaknesses: c.weaknesses,
    loot: c.loot,
  }
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute ecosystem health (0-100, high = few dangerous creatures).
 *
 * @example
 * computeEcosystemHealth(creatures, sightings)
 */
export function computeEcosystemHealth(creatures: Creature[], sightings: CreatureSighting[]): number {
  if (sightings.length === 0) return 100

  let dangerPenalty = 0
  for (const c of creatures) {
    if (c.dangerLevel === 'lethal') dangerPenalty += c.frequency * 15
    else if (c.dangerLevel === 'dangerous') dangerPenalty += c.frequency * 8
    else if (c.dangerLevel === 'caution') dangerPenalty += c.frequency * 3
  }

  return Math.max(0, Math.round(100 - dangerPenalty))
}

/**
 * Compute biodiversity (variety of creature types).
 *
 * @example
 * computeBiodiversity(creatures)
 */
export function computeBiodiversity(creatures: Creature[]): number {
  if (creatures.length === 0) return 0
  const types = new Set(creatures.map((c) => c.type))
  return Math.round((types.size / 10) * 100)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate bestiary recommendations.
 *
 * @example
 * generateRecommendations(creatures, sightings, stats)
 */
export function generateRecommendations(
  creatures: Creature[],
  sightings: CreatureSighting[],
  stats: BestiaryStats,
): string[] {
  const recs: string[] = []

  const dragons = creatures.filter((c) => c.type === 'dragon')
  if (dragons.length > 0) {
    recs.push(`SLAY: ${dragons[0]!.frequency} Dragon sighting(s) — eliminate eval() and deep nesting immediately`)
  }

  const hydras = creatures.filter((c) => c.type === 'hydra')
  if (hydras.length > 0) {
    recs.push(`DECUPLE: ${hydras[0]!.frequency} Hydra sighting(s) — decouple carefully to avoid spawning more problems`)
  }

  const ghosts = creatures.filter((c) => c.type === 'ghost')
  if (ghosts.length > 0) {
    recs.push(`CLEANSE: ${ghosts[0]!.frequency} Ghost sighting(s) — remove dead code to reduce haunting`)
  }

  const krakens = creatures.filter((c) => c.type === 'kraken')
  if (krakens.length > 0) {
    recs.push(`UNTANGLE: ${krakens[0]!.frequency} Kraken sighting(s) — replace deep chains with async/await`)
  }

  const golems = creatures.filter((c) => c.type === 'golem')
  if (golems.length > 0) {
    recs.push(`DISMANTLE: ${golems[0]!.frequency} Golem sighting(s) — break massive functions into smaller pieces`)
  }

  const unicorns = creatures.filter((c) => c.type === 'unicorn')
  if (unicorns.length > 0) {
    recs.push(`CELEBRATE: ${unicorns[0]!.frequency} Unicorn sighting(s) — study and replicate these perfect patterns`)
  }

  if (stats.ecosystemHealth < 50) {
    recs.push(`Ecosystem health is ${stats.ecosystemHealth}% — critical cleanup needed`)
  }

  if (recs.length === 0) {
    recs.push('The codebase ecosystem is balanced — no dangerous creatures detected')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build complete bestiary result from files and contents.
 *
 * @example
 * buildBestiaryResult(['a.ts'], ['const x = 1'], { maxDepth: 50 })
 */
export function buildBestiaryResult(
  files: string[],
  contents: string[],
  options: { maxDepth: number },
): BestiaryResult {
  const allSightings: CreatureSighting[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    allSightings.push(...detectDragons(file, content))
    allSightings.push(...detectUnicorns(file, content))
    allSightings.push(...detectPhoenixes(file, content, false))
    allSightings.push(...detectHydras(file, content, 0))
    allSightings.push(...detectGolems(file, content))
    allSightings.push(...detectGhosts(file, content))
    allSightings.push(...detectChimeras(file, content))
    allSightings.push(...detectKrakens(file, content))
    allSightings.push(...detectSprites(file, content))
    allSightings.push(...detectGargoyles(file, content))
  }

  const typeMap = new Map<CreatureType, CreatureSighting[]>()
  for (const s of allSightings) {
    const t = s.creature.toLowerCase() as CreatureType
    const arr = typeMap.get(t) ?? []
    arr.push(s)
    typeMap.set(t, arr)
  }

  const creatures: Creature[] = []
  for (const [type, sightings] of typeMap) {
    creatures.push(buildCreature(type, sightings))
  }

  const dangerousCreatures = creatures.filter((c) => c.dangerLevel === 'dangerous' || c.dangerLevel === 'lethal').length
  const harmlessCreatures = creatures.filter((c) => c.dangerLevel === 'harmless').length

  const freqMap = new Map<string, number>()
  for (const c of creatures) {
    freqMap.set(c.name, (freqMap.get(c.name) ?? 0) + c.frequency)
  }
  const mostCommon = [...freqMap.entries()].sort((a, b) => b[1] - a[1])
  const mostCommonCreature = mostCommon[0]?.[0] ?? 'none'

  const fileDanger: Record<string, number> = {}
  for (const s of allSightings) {
    fileDanger[s.file] = (fileDanger[s.file] ?? 0) + s.severity
  }
  const mostDangerousEntries = Object.entries(fileDanger).sort((a, b) => b[1] - a[1])
  const mostDangerousArea = mostDangerousEntries[0]?.[0] ?? 'none'

  const ecosystemHealth = computeEcosystemHealth(creatures, allSightings)
  const biodiversity = computeBiodiversity(creatures)

  const stats: BestiaryStats = {
    totalCreatures: creatures.length,
    totalSightings: allSightings.length,
    dangerousCreatures,
    harmlessCreatures,
    mostCommonCreature,
    mostDangerousArea,
    ecosystemHealth,
    biodiversity,
  }

  const recommendations = generateRecommendations(creatures, allSightings, stats)

  return { creatures, sightings: allSightings, stats, recommendations }
}
