// ─── Types ────────────────────────────────────────────────────────────────────

export interface Treaty {
  name: string
  signatories: string[]
  articles: number
  isPublic: boolean
  isStrict: boolean
  strength: number
}

export interface Tension {
  between: [string, string]
  type: 'excessive-coupling' | 'fragile-dependency' | 'implicit-contract' | 'missing-documentation' | 'type-mismatch'
  severity: 'high' | 'low' | 'medium'
  description: string
  resolution: string
}

export interface Nation {
  file: string
  name: string
  exports: string[]
  imports: string[]
  privateMembers: number
  gdp: number
  openness: number
  allies: string[]
  tensions: Tension[]
}

export interface Alliance {
  members: string[]
  sharedTypes: string[]
  sharedImports: string[]
  strength: number
}

export interface DiplomatStats {
  nationCount: number
  treatyCount: number
  allianceCount: number
  tensionCount: number
  highTensions: number
  avgOpenness: number
  diplomaticHealth: number
  strongestAlliance: string
  weakestLink: string
}

export interface DiplomatResult {
  nations: Nation[]
  treaties: Treaty[]
  alliances: Alliance[]
  tensions: Tension[]
  stats: DiplomatStats
  recommendations: string[]
}

export interface DiplomatOptions {
  verbose?: boolean
}

// ─── Extract Exports ──────────────────────────────────────────────────────────

/**
 * Extract exported names from content.
 *
 * @example
 * extractExportedNames('export function foo() {}')
 */
export function extractExportedNames(content: string): string[] {
  const names: string[] = []
  const patterns = [
    /export\s+function\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+const\s+(\w+)/g,
    /export\s+let\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
    /export\s+enum\s+(\w+)/g,
    /export\s+async\s+function\s+(\w+)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      names.push(m[1] ?? '')
    }
  }
  return [...new Set(names)]
}

// ─── Extract Imports ──────────────────────────────────────────────────────────

/**
 * Extract import paths from content.
 *
 * @example
 * extractImportPaths("import { x } from './foo'")
 */
export function extractImportPaths(content: string): string[] {
  const paths: string[] = []
  let m: RegExpExecArray | null
  const pat = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
  while ((m = pat.exec(content)) !== null) {
    paths.push(m[1] ?? '')
  }
  const sideEffect = /import\s+['"]([^'"]+)['"]/g
  while ((m = sideEffect.exec(content)) !== null) {
    paths.push(m[1] ?? '')
  }
  return paths
}

// ─── Extract Import Names ─────────────────────────────────────────────────────

/**
 * Extract imported names (destructuring) from content.
 *
 * @example
 * extractImportNames("import { foo, bar } from 'x'")
 */
export function extractImportNames(content: string): string[] {
  const names: string[] = []
  let m: RegExpExecArray | null
  const pat = /import\s+\{([^}]+)\}\s+from/g
  while ((m = pat.exec(content)) !== null) {
    for (const item of (m[1] ?? '').split(',')) {
      const trimmed = item.trim().split(/\s+as\s+/)[0]!.trim()
      if (trimmed) names.push(trimmed)
    }
  }
  return names
}

// ─── Count Private Members ────────────────────────────────────────────────────

/**
 * Count non-exported functions/classes/consts.
 *
 * @example
 * countPrivateMembers('function foo() {}')
 */
export function countPrivateMembers(content: string): number {
  const allFuncs = (content.match(/\bfunction\s+\w+/g) ?? []).length
  const exportedFuncs = (content.match(/\bexport\s+(?:async\s+)?function\s+\w+/g) ?? []).length
  const allClasses = (content.match(/\bclass\s+\w+/g) ?? []).length
  const exportedClasses = (content.match(/\bexport\s+class\s+\w+/g) ?? []).length
  return (allFuncs - exportedFuncs) + (allClasses - exportedClasses)
}

// ─── Extract Interfaces/Types ─────────────────────────────────────────────────

/**
 * Extract interface/type definitions from content.
 *
 * @example
 * extractTypeDefinitions('export interface Foo { x: number }')
 */
export function extractTypeDefinitions(content: string): { name: string; isPublic: boolean; isStrict: boolean; articles: number }[] {
  const types: { name: string; isPublic: boolean; isStrict: boolean; articles: number }[] = []

  const ifacePat = /(?:export\s+)?interface\s+(\w+)\s*\{([^}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = ifacePat.exec(content)) !== null) {
    const name = m[1] ?? ''
    const body = m[2]!
    const matchedText = content.substring(m.index, m.index + 30)
    const isPublic = matchedText.startsWith('export')
    const articles = (body.match(/\w+\s*[?]/g) ?? []).length === 0 && (body.match(/\w+\s*:/g) ?? []).length > 0
      ? (body.match(/\w+\s*:/g) ?? []).length
      : (body.match(/\w+/g) ?? []).length
    const isStrict = !body.includes('any') && !body.includes('?')
    types.push({ name, isPublic, isStrict, articles })
  }

  const typePat = /(?:export\s+)?type\s+(\w+)\s*=/g
  while ((m = typePat.exec(content)) !== null) {
    const name = m[1] ?? ''
    const matchedText = content.substring(m.index, m.index + 30)
    const isPublic = matchedText.startsWith('export')
    types.push({ name, isPublic, isStrict: true, articles: 0 })
  }

  return types
}

// ─── Compute Openness ─────────────────────────────────────────────────────────

/**
 * Compute openness ratio (0-100).
 *
 * @example
 * computeOpenness(5, 3)
 */
export function computeOpenness(exports: number, privateMembers: number): number {
  const total = exports + privateMembers
  if (total === 0) return 100
  return Math.round((exports / total) * 100)
}

// ─── Map Nations ──────────────────────────────────────────────────────────────

/**
 * Map each file to a nation with diplomatic properties.
 *
 * @example
 * mapNations(files, contents)
 */
export function mapNations(files: string[], contents: string[]): Nation[] {
  return files.map((file, i) => {
    const content = contents[i] ?? ''
    const exports = extractExportedNames(content)
    const imports = extractImportPaths(content)
    const privateMembers = countPrivateMembers(content)
    const gdp = content.split('\n').length
    const openness = computeOpenness(exports.length, privateMembers)

    const allyCounts = new Map<string, number>()
    for (const imp of imports) {
      const base = imp.replace(/^\.\//, '').replace(/^\.\.\//, '')
      allyCounts.set(base, (allyCounts.get(base) ?? 0) + 1)
    }
    const allies = [...allyCounts.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name)

    const name = file.includes('/') ? file.substring(file.lastIndexOf('/') + 1) : file

    return { file, name, exports, imports, privateMembers, gdp, openness, allies, tensions: [] }
  })
}

// ─── Discover Treaties ────────────────────────────────────────────────────────

/**
 * Discover type treaties across files.
 *
 * @example
 * discoverTreaties(files, contents)
 */
export function discoverTreaties(files: string[], contents: string[]): Treaty[] {
  const treatyMap = new Map<string, { signatories: Set<string>; articles: number; isPublic: boolean; isStrict: boolean }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const typeDefs = extractTypeDefinitions(content)

    for (const td of typeDefs) {
      const existing = treatyMap.get(td.name)
      if (existing) {
        existing.signatories.add(file)
        existing.isPublic = existing.isPublic || td.isPublic
        existing.isStrict = existing.isStrict && td.isStrict
      } else {
        treatyMap.set(td.name, {
          signatories: new Set([file]),
          articles: td.articles,
          isPublic: td.isPublic,
          isStrict: td.isStrict,
        })
      }
    }

    const importedNames = extractImportNames(content)
    for (const name of importedNames) {
      const existing = treatyMap.get(name)
      if (existing) {
        existing.signatories.add(file)
      }
    }
  }

  const treaties: Treaty[] = []
  for (const [name, data] of treatyMap) {
    const signatories = [...data.signatories]
    const strength = Math.min(100, signatories.length * 20 + (data.isPublic ? 20 : 0) + (data.isStrict ? 20 : 0))
    treaties.push({
      name,
      signatories,
      articles: data.articles,
      isPublic: data.isPublic,
      isStrict: data.isStrict,
      strength,
    })
  }

  return treaties.sort((a, b) => b.strength - a.strength)
}

// ─── Form Alliances ───────────────────────────────────────────────────────────

/**
 * Form alliances based on shared types and imports.
 *
 * @example
 * formAlliances(nations, treaties)
 */
export function formAlliances(nations: Nation[], treaties: Treaty[]): Alliance[] {
  const alliances: Alliance[] = []

  for (const treaty of treaties) {
    if (treaty.signatories.length >= 2) {
      const sharedTypes = [treaty.name]
      const members = treaty.signatories
      const sharedImports: string[] = []

      const nationImports = new Map<string, Set<string>>()
      for (const member of members) {
        const nation = nations.find((n) => n.file === member)
        if (nation) {
          nationImports.set(member, new Set(nation.imports))
        }
      }

      const allImports = [...nationImports.values()]
      if (allImports.length >= 2) {
        const first = allImports[0]!
        for (const imp of first) {
          if (allImports.every((s) => s.has(imp))) {
            sharedImports.push(imp)
          }
        }
      }

      alliances.push({
        members,
        sharedTypes,
        sharedImports,
        strength: treaty.strength,
      })
    }
  }

  return alliances
}

// ─── Detect Tensions ──────────────────────────────────────────────────────────

/**
 * Detect diplomatic tensions between modules.
 *
 * @example
 * detectTensions(nations, treaties, contents)
 */
export function detectTensions(nations: Nation[], _treaties: Treaty[], contents: string[]): Tension[] {
  const tensions: Tension[] = []

  for (let i = 0; i < nations.length; i++) {
    const nation = nations[i]!
    const content = contents[i] ?? ''

    if (content.includes('as any')) {
      tensions.push({
        between: [nation.file, '*'],
        type: 'type-mismatch',
        severity: 'high',
        description: `Type safety bypassed with 'as any' in ${nation.file}`,
        resolution: 'Replace as any with proper type assertions',
      })
    }

    const undocumentedExports = nation.exports.filter((exp) => {
      const regex = new RegExp(`export\\s+(?:async\s+)?(?:function|class|const|type|interface)\\s+${exp}`)
      const match = regex.exec(content)
      if (!match) return false
      const before = content.substring(Math.max(0, match.index - 100), match.index)
      return !before.includes('/**') && !before.includes('*')
    })

    if (undocumentedExports.length > 3) {
      tensions.push({
        between: [nation.file, '*'],
        type: 'missing-documentation',
        severity: 'medium',
        description: `${undocumentedExports.length} exports lack JSDoc documentation`,
        resolution: 'Add JSDoc comments to exported members',
      })
    }

    for (const imp of nation.imports) {
      const itemCount = (content.match(new RegExp(`from\\s+['"]${imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')) ?? []).length
      if (itemCount > 5) {
        tensions.push({
          between: [nation.file, imp],
          type: 'excessive-coupling',
          severity: 'medium',
          description: `Excessive imports from ${imp}`,
          resolution: 'Reduce coupling by extracting shared utilities',
        })
      }
    }
  }

  for (let i = 0; i < nations.length; i++) {
    for (let j = i + 1; j < nations.length; j++) {
      const a = nations[i]!
      const b = nations[j]!
      if (a.imports.some((imp) => b.file.includes(imp.replace(/^\.\//, ''))) &&
          b.imports.some((imp) => a.file.includes(imp.replace(/^\.\//, '')))) {
        tensions.push({
          between: [a.file, b.file],
          type: 'fragile-dependency',
          severity: 'medium',
          description: `Circular dependency between ${a.file} and ${b.file}`,
          resolution: 'Break circular dependency with an intermediary module',
        })
      }
    }
  }

  return tensions
}

// ─── Diplomatic Health ────────────────────────────────────────────────────────

/**
 * Compute overall diplomatic health (0-100).
 *
 * @example
 * computeDiplomaticHealth(nations, treaties, tensions)
 */
export function computeDiplomaticHealth(nations: Nation[], treaties: Treaty[], tensions: Tension[]): number {
  if (nations.length === 0) return 100

  let score = 100

  const publicTreaties = treaties.filter((t) => t.isPublic).length
  if (publicTreaties === 0 && nations.length > 1) score -= 20

  const highTensions = tensions.filter((t) => t.severity === 'high').length
  score -= highTensions * 10

  const mediumTensions = tensions.filter((t) => t.severity === 'medium').length
  score -= mediumTensions * 3

  const avgOpenness = nations.reduce((s, n) => s + n.openness, 0) / nations.length
  if (avgOpenness < 20) score -= 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate diplomatic recommendations.
 *
 * @example
 * generateDiplomatRecommendations(nations, treaties, tensions, stats)
 */
export function generateDiplomatRecommendations(
  nations: Nation[],
  treaties: Treaty[],
  tensions: Tension[],
  stats: DiplomatStats,
): string[] {
  const recs: string[] = []

  if (stats.highTensions > 0) {
    recs.push(`${stats.highTensions} high-severity tension(s) — add type definitions to resolve`)
  }

  const closed = nations.filter((n) => n.openness < 20)
  if (closed.length > 0) {
    recs.push(`${closed.length} closed nation(s) — consider exporting more functionality`)
  }

  if (treaties.length === 0 && nations.length > 1) {
    recs.push('No shared type treaties — create interfaces for inter-module communication')
  }

  const fragile = tensions.filter((t) => t.type === 'fragile-dependency')
  if (fragile.length > 0) {
    recs.push(`${fragile.length} fragile dependency(ies) — stabilize or decouple modules`)
  }

  if (stats.diplomaticHealth < 50) {
    recs.push(`Diplomatic health is ${stats.diplomaticHealth}% — significant refactoring recommended`)
  }

  if (recs.length === 0) {
    recs.push('Diplomatic relations are strong — modules communicate through clear contracts')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete diplomat result.
 *
 * @example
 * buildDiplomatResult(files, contents)
 */
export function buildDiplomatResult(
  files: string[],
  contents: string[],
  _options?: DiplomatOptions,
): DiplomatResult {
  const nations = mapNations(files, contents)
  const treaties = discoverTreaties(files, contents)
  const alliances = formAlliances(nations, treaties)
  const tensions = detectTensions(nations, treaties, contents)

  const avgOpenness = nations.length > 0
    ? Math.round(nations.reduce((s, n) => s + n.openness, 0) / nations.length)
    : 100

  const highTensions = tensions.filter((t) => t.severity === 'high').length
  const diplomaticHealth = computeDiplomaticHealth(nations, treaties, tensions)

  const strongestAlliance = alliances.length > 0
    ? alliances[0]!.members.join(' + ')
    : 'N/A'

  const tensionCounts = new Map<string, number>()
  for (const t of tensions) {
    tensionCounts.set(t.between[0], (tensionCounts.get(t.between[0]) ?? 0) + 1)
    tensionCounts.set(t.between[1], (tensionCounts.get(t.between[1]) ?? 0) + 1)
  }
  const weakestLink = [...tensionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

  const stats: DiplomatStats = {
    nationCount: nations.length,
    treatyCount: treaties.length,
    allianceCount: alliances.length,
    tensionCount: tensions.length,
    highTensions,
    avgOpenness,
    diplomaticHealth,
    strongestAlliance,
    weakestLink,
  }

  const recommendations = generateDiplomatRecommendations(nations, treaties, tensions, stats)

  return { nations, treaties, alliances, tensions, stats, recommendations }
}
