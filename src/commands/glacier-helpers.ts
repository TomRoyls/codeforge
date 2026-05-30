// ─── Types ──────────────────────────────────────────────────────────────────

export type IceZoneType = 'permafrost' | 'glacial-ice' | 'active-ice' | 'melt-zone' | 'crevasse' | 'moraine'
export type DangerType = 'crevasse' | 'avalanche-risk' | 'ice-bridge' | 'thin-ice' | 'undercurrent'
export type DangerSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FlowType = 'steady' | 'seasonal' | 'surging' | 'retreating'
export type MoraineType = 'lateral' | 'medial' | 'terminal' | 'ground'
export type IceClassification = 'bedrock' | 'deep-ice' | 'surface-ice' | 'slush' | 'water'
export type GlacierHealth = 'polar-cap' | 'alpine-glacier' | 'valley-glacier' | 'ice-sheet' | 'retreating' | 'melted'

export interface HiddenDanger {
  type: DangerType
  description: string
  severity: DangerSeverity
  line: number
  mitigation: string
}

export interface IceZone {
  file: string
  zone: IceZoneType
  stability: number
  density: number
  temperature: number
  age: string
  layers: number
  iceCoreQuality: number
  hiddenDangers: HiddenDanger[]
  classification: IceClassification
}

export interface GlacierFlow {
  from: string
  to: string
  flowType: FlowType
  volume: number
  description: string
}

export interface MorainePile {
  area: string
  type: MoraineType
  items: string[]
  size: number
  age: string
  description: string
}

export interface GlacierStats {
  totalZones: number
  permafrostZones: number
  activeIceZones: number
  meltZones: number
  crevasseZones: number
  moraineZones: number
  avgStability: number
  avgTemperature: number
  avgIceCoreQuality: number
  totalHiddenDangers: number
  criticalDangers: number
  totalFlows: number
  steadyFlows: number
  surgingFlows: number
  retreatingFlows: number
  totalMoraines: number
  moraineItems: number
  frozenRatio: number
  stabilityIndex: number
  glacierHealth: GlacierHealth
}

export interface GlacierResult {
  zones: IceZone[]
  flows: GlacierFlow[]
  moraines: MorainePile[]
  stats: GlacierStats
  recommendations: string[]
}

// ─── measureStability ───────────────────────────────────────────────────────

/**
 * Measure code stability 0-100
 * @example
 * measureStability('export function add(a: number, b: number): number { return a + b }', 'utils.ts') // high
 */
export function measureStability(content: string, _filePath: string): number {
  let score = 40

  const hasTypes = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (hasTypes) score += 10

  const hasTests = /test\(|describe\(|it\(|expect\(/.test(content)
  if (hasTests) score += 15

  const hasErrorHandling = /try\s*\{|catch\s*\(|throw\s+/.test(content)
  if (hasErrorHandling) score += 10

  const exports = (content.match(/export\s/g) || []).length
  const imports = (content.match(/import\s/g) || []).length
  if (exports > 0 && imports >= 0) score += 5

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 15

  const hasTodo = /TODO|FIXME|HACK|XXX/.test(content)
  if (hasTodo) score -= 10

  const hasVar = /\bvar\b/.test(content)
  if (hasVar) score -= 5

  const codeLines = content.split('\n').filter(l => l.trim().length > 0).length
  if (codeLines > 300) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── measureDensity ─────────────────────────────────────────────────────────

/**
 * Measure code density 0-100
 * @example
 * measureDensity('const x = 1; const y = 2;') // high
 */
export function measureDensity(content: string): number {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)
  if (codeLines.length === 0) return 0

  const totalChars = codeLines.reduce((s, l) => s + l.trim().length, 0)
  const avgLen = totalChars / codeLines.length

  const hasFunctions = (content.match(/function\s|=>/g) || []).length
  const hasClasses = (content.match(/class\s/g) || []).length
  const hasInterfaces = (content.match(/interface\s/g) || []).length
  const symbols = hasFunctions + hasClasses + hasInterfaces
  const symbolDensity = Math.min(40, Math.round((symbols / Math.max(1, codeLines.length)) * 200))

  const lineDensity = Math.min(60, Math.round(avgLen / 1.5))

  return Math.max(0, Math.min(100, symbolDensity + lineDensity))
}

// ─── measureTemperature ─────────────────────────────────────────────────────

/**
 * Measure activity level (temperature) 0-100
 * @example
 * measureTemperature('TODO: fix this\nFIXME: broken') // high temperature
 */
export function measureTemperature(content: string): number {
  let score = 15

  const todos = (content.match(/TODO/g) || []).length
  const fixmes = (content.match(/FIXME/g) || []).length
  const hacks = (content.match(/HACK|XXX/g) || []).length
  score += Math.min(30, (todos + fixmes + hacks) * 8)

  const deprecated = (content.match(/@deprecated/g) || []).length
  score += Math.min(15, deprecated * 10)

  const consoleUsage = (content.match(/console\.(log|warn|error|debug)/g) || []).length
  score += Math.min(10, consoleUsage * 3)

  const anyTypes = (content.match(/:\s*any\b/g) || []).length
  score += Math.min(10, anyTypes * 3)

  const comments = (content.match(/\/\/.+/g) || []).length
  const codeLines = content.split('\n').filter(l => l.trim().length > 0).length
  if (codeLines > 0 && comments / codeLines > 0.3) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── estimateAge ────────────────────────────────────────────────────────────

/**
 * Estimate code age indicator
 * @example
 * estimateAge('var x = arguments[0]') // 'legacy'
 */
export function estimateAge(content: string): string {
  const hasVar = /\bvar\b/.test(content)
  const hasArguments = /\barguments\b/.test(content)
  const hasPrototype = /\.prototype\./.test(content)
  const hasRequire = /\brequire\s*\(/.test(content)

  if (hasPrototype) return 'legacy'
  if (hasVar && hasArguments) return 'aged'
  if (hasRequire && !/import\s/.test(content)) return 'mature'

  const hasConst = /\bconst\b/.test(content)
  const hasArrow = /=>/.test(content)
  const hasAsync = /\basync\b/.test(content)

  if (hasAsync && hasArrow) return 'modern'
  if (hasConst && hasArrow) return 'recent'
  return 'established'
}

// ─── countLayers ────────────────────────────────────────────────────────────

/**
 * Count abstraction layers
 * @example
 * countLayers('class A { method() { if (x) { helper() } } }') // 3
 */
export function countLayers(content: string): number {
  const lines = content.split('\n')
  let maxDepth = 0
  let currentDepth = 0

  for (const line of lines) {
    const opens = (line.match(/\{/g) || []).length + (line.match(/\(/g) || []).length
    const closes = (line.match(/\}/g) || []).length + (line.match(/\)/g) || []).length
    currentDepth += opens - closes
    if (currentDepth > maxDepth) maxDepth = currentDepth
  }

  const hasClass = /class\s/.test(content) ? 1 : 0
  const hasExport = /export\s/.test(content) ? 1 : 0

  return Math.max(1, maxDepth + hasClass + hasExport)
}

// ─── measureIceCoreQuality ──────────────────────────────────────────────────

/**
 * Measure quality of code (ice core quality) 0-100
 * @example
 * measureIceCoreQuality('export function add(a: number, b: number): number { return a + b }') // high
 */
export function measureIceCoreQuality(content: string): number {
  let score = 30

  const hasDocs = /\/\*\*/.test(content)
  if (hasDocs) score += 15

  const hasTypes = /:\s*(string|number|boolean|void|Promise|Record)/.test(content)
  if (hasTypes) score += 15

  const hasErrorHandling = /try\s*\{|catch\s*\(/.test(content)
  if (hasErrorHandling) score += 10

  const hasConst = /\bconst\b/.test(content)
  if (hasConst) score += 5

  const codeLines = content.split('\n').filter(l => l.trim().length > 0)
  const avgLen = codeLines.reduce((s, l) => s + l.length, 0) / Math.max(1, codeLines.length)
  if (avgLen < 80) score += 10
  else if (avgLen > 120) score -= 5

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 15

  const hasVar = /\bvar\b/.test(content)
  if (hasVar) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── detectHiddenDangers ────────────────────────────────────────────────────

/**
 * Detect hidden dangers in code
 * @example
 * detectHiddenDangers('const x: any = JSON.parse(str)', 'a.ts') // HiddenDanger[]
 */
export function detectHiddenDangers(content: string, _filePath: string): HiddenDanger[] {
  const dangers: HiddenDanger[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const lineNum = i + 1

    if (/:\s*any\b/.test(line)) {
      dangers.push({
        type: 'crevasse',
        description: 'Any type creates hidden assumptions',
        severity: 'high',
        line: lineNum,
        mitigation: 'Replace with proper type definition',
      })
    }

    if (/JSON\.parse\(/.test(line) && !/try\s*\{/.test(lines.slice(Math.max(0, i - 2), i).join('\n'))) {
      dangers.push({
        type: 'thin-ice',
        description: 'JSON.parse without error handling',
        severity: 'medium',
        line: lineNum,
        mitigation: 'Wrap in try-catch block',
      })
    }

    if (/\bnull\s*!/.test(line) || /\.toString\(\)/.test(line)) {
      dangers.push({
        type: 'ice-bridge',
        description: 'Unsafe type assumption or coercion',
        severity: 'medium',
        line: lineNum,
        mitigation: 'Add proper null checks and type guards',
      })
    }

    if (/export\s/.test(line) && /TODO|FIXME|HACK/.test(line)) {
      dangers.push({
        type: 'avalanche-risk',
        description: 'Exported symbol with unresolved issue',
        severity: 'high',
        line: lineNum,
        mitigation: 'Fix issue before stable export',
      })
    }

    if (/\beval\s*\(/.test(line)) {
      dangers.push({
        type: 'undercurrent',
        description: 'Eval usage creates hidden execution paths',
        severity: 'critical',
        line: lineNum,
        mitigation: 'Remove eval, use safer alternatives',
      })
    }
  }

  const exports = (content.match(/export\s/g) || []).length
  const imports = (content.match(/import\s/g) || []).length
  if (exports > 10 && imports === 0) {
    dangers.push({
      type: 'avalanche-risk',
      description: `${exports} exports with no imports - change cascades widely`,
      severity: 'high',
      line: 1,
      mitigation: 'Reduce export surface or add integration tests',
    })
  }

  return dangers
}

// ─── classifyIceZone ────────────────────────────────────────────────────────

/**
 * Classify ice zone type based on code characteristics
 * @example
 * classifyIceZone('export interface Config { name: string }', 'types.ts') // 'permafrost'
 */
export function classifyIceZone(content: string, filePath: string): IceZoneType {
  const temperature = measureTemperature(content)
  const stability = measureStability(content, filePath)
  const hasDeprecated = /@deprecated/.test(content)
  const hasTodo = /TODO|FIXME|HACK/.test(content)
  const isTypeFile = /\.(d\.ts|types\.ts|interfaces\.ts)$/.test(filePath) || /^types\//.test(filePath)

  if (hasDeprecated) return 'melt-zone'
  if (isTypeFile && temperature < 25) return 'permafrost'

  const hasOnlyTypes = /^\/\*\*[\s\S]*?\*\/\s*$|^(export\s+)?(interface|type)\s+/m.test(content)
    && !/function|class/.test(content)
  if (hasOnlyTypes && stability >= 70) return 'permafrost'

  if (temperature > 60 && hasTodo) return 'moraine'
  if (temperature > 50) return 'active-ice'
  if (stability >= 70 && temperature < 30) return 'glacial-ice'

  const dangers = detectHiddenDangers(content, filePath)
  if (dangers.some(d => d.severity === 'high' || d.severity === 'critical') && stability >= 50) return 'crevasse'

  if (stability >= 50) return 'glacial-ice'
  return 'active-ice'
}

// ─── classifyIceClassification ──────────────────────────────────────────────

/**
 * Classify ice type (bedrock through water)
 * @example
 * classifyIceClassification(90, 15) // 'bedrock'
 */
export function classifyIceClassification(stability: number, temperature: number): IceClassification {
  if (stability >= 80 && temperature <= 20) return 'bedrock'
  if (stability >= 65 && temperature <= 35) return 'deep-ice'
  if (stability >= 40 && temperature <= 60) return 'surface-ice'
  if (stability >= 20) return 'slush'
  return 'water'
}

// ─── mapGlacierFlows ────────────────────────────────────────────────────────

/**
 * Map influence flows between files
 * @example
 * mapGlacierFlows(['a.ts', 'b.ts'], ['import { x } from "./b"', 'export const x = 1']) // GlacierFlow[]
 */
export function mapGlacierFlows(files: string[], contents: string[]): GlacierFlow[] {
  const flows: GlacierFlow[] = []
  const importMap = new Map<string, Set<string>>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (!file || !content) continue
    const imports = new Set<string>()
    const matches = content.matchAll(/import\s+.*?from\s+['"]\.\/?([^'"]+)['"]/g)
    for (const m of matches) {
      const imported = (m[1] ?? '').replace(/\.(ts|js)$/, '')
      for (let j = 0; j < files.length; j++) {
        const fileJ = files[j]
        if (!fileJ) continue
        const baseName = fileJ.replace(/\.(ts|tsx|js|jsx)$/, '').split('/').pop() || ''
        if (imported === baseName || fileJ.includes(imported)) {
          imports.add(fileJ)
        }
      }
    }
    importMap.set(file, imports)
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const deps = importMap.get(file)
    if (!deps) continue
    for (const dep of deps) {
      const fromContent = contents[files.indexOf(dep)] || ''
      const fromTemp = measureTemperature(fromContent)
      const fromStability = measureStability(fromContent, dep)

      let flowType: FlowType = 'steady'
      if (fromTemp > 60) flowType = 'surging'
      else if (fromTemp > 40) flowType = 'seasonal'
      else if (fromStability < 30) flowType = 'retreating'

      const volume = Math.min(100, Math.round(fromStability * 0.5 + (100 - fromTemp) * 0.5))

      flows.push({
        from: dep,
        to: file,
        flowType,
        volume,
        description: `${dep} flows into ${file}`,
      })
    }
  }

  return flows
}

// ─── identifyMoraines ───────────────────────────────────────────────────────

/**
 * Identify tech debt accumulation areas
 * @example
 * identifyMoraines(['src/a.ts'], ['// TODO: fix this\n// FIXME: broken']) // MorainePile[]
 */
export function identifyMoraines(files: string[], contents: string[]): MorainePile[] {
  const moraines: MorainePile[] = []
  const dirMap = new Map<string, { files: string[]; items: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (!file || !content) continue
    const dir = file.split('/').slice(0, -1).join('/') || '.'

    const todos = Array.from(content.matchAll(/\/\/\s*(TODO[\s:]*)[^\n]*/g)).map(m => m[0].trim())
    const fixmes = Array.from(content.matchAll(/\/\/\s*(FIXME[\s:]*)[^\n]*/g)).map(m => m[0].trim())
    const hacks = Array.from(content.matchAll(/\/\/\s*(HACK[\s:]*)[^\n]*/g)).map(m => m[0].trim())
    const items = [...todos, ...fixmes, ...hacks]

    if (items.length === 0) continue

    const group = dirMap.get(dir) || { files: [], items: [] }
    group.files.push(file)
    group.items.push(...items)
    dirMap.set(dir, group)
  }

  for (const [dir, group] of dirMap) {
    if (group.items.length === 0) continue

    const uniqueItems = Array.from(new Set(group.items))
    let type: MoraineType = 'lateral'
    if (group.files.length > 3) type = 'medial'
    else if (dir === '.' || dir === 'src') type = 'ground'

    const hasDeprecated = group.items.some(i => /deprecated/i.test(i))
    if (hasDeprecated) type = 'terminal'

    moraines.push({
      area: dir,
      type,
      items: uniqueItems,
      size: uniqueItems.length,
      age: group.items.length > 10 ? 'old' : group.items.length > 5 ? 'mature' : 'fresh',
      description: `${uniqueItems.length} tech debt item(s) in ${dir}`,
    })
  }

  return moraines
}

// ─── computeFrozenRatio ─────────────────────────────────────────────────────

/**
 * Compute percentage of frozen codebase
 * @example
 * computeFrozenRatio(zones) // 65
 */
export function computeFrozenRatio(zones: IceZone[]): number {
  if (zones.length === 0) return 50
  const frozen = zones.filter(z => z.zone === 'permafrost' || z.zone === 'glacial-ice').length
  return Math.round((frozen / zones.length) * 100)
}

// ─── computeStabilityIndex ──────────────────────────────────────────────────

/**
 * Compute overall stability index 0-100
 * @example
 * computeStabilityIndex(zones) // 72
 */
export function computeStabilityIndex(zones: IceZone[]): number {
  if (zones.length === 0) return 50
  const avgStability = zones.reduce((s, z) => s + z.stability, 0) / zones.length
  const avgQuality = zones.reduce((s, z) => s + z.iceCoreQuality, 0) / zones.length
  const criticalDangers = zones.reduce((s, z) => s + z.hiddenDangers.filter(d => d.severity === 'critical').length, 0)
  const dangerPenalty = Math.min(20, criticalDangers * 5)
  return Math.round(Math.max(0, Math.min(100, avgStability * 0.5 + avgQuality * 0.3 + 20 - dangerPenalty)))
}

// ─── classifyGlacierHealth ──────────────────────────────────────────────────

/**
 * Classify overall glacier health
 * @example
 * classifyGlacierHealth(85, 70, 0) // 'polar-cap'
 */
export function classifyGlacierHealth(stability: number, frozenRatio: number, criticalDangers: number): GlacierHealth {
  const combined = stability * 0.5 + frozenRatio * 0.3 + (100 - Math.min(50, criticalDangers * 10)) * 0.2
  if (combined >= 80 && criticalDangers === 0) return 'polar-cap'
  if (combined >= 70) return 'alpine-glacier'
  if (combined >= 55) return 'valley-glacier'
  if (combined >= 40) return 'ice-sheet'
  if (combined >= 25) return 'retreating'
  return 'melted'
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate glacier analysis recommendations
 * @example
 * generateRecommendations(zones, dangers, flows, moraines, stats) // string[]
 */
export function generateRecommendations(
  zones: IceZone[],
  _dangers: HiddenDanger[],
  flows: GlacierFlow[],
  moraines: MorainePile[],
  stats: GlacierStats,
): string[] {
  const recs: string[] = []

  const criticalZones = zones.filter(z => z.hiddenDangers.some(d => d.severity === 'critical'))
  if (criticalZones.length > 0) {
    recs.push(`Fix ${stats.criticalDangers} critical danger(s) in ${criticalZones.length} zone(s) immediately`)
  }

  const meltZones = zones.filter(z => z.zone === 'melt-zone')
  if (meltZones.length > 0) {
    recs.push(`Complete deprecation of ${meltZones.length} melt-zone file(s)`)
  }

  if (moraines.length > 0) {
    const totalItems = moraines.reduce((s, m) => s + m.size, 0)
    recs.push(`Clean up ${totalItems} tech debt item(s) across ${moraines.length} moraine pile(s)`)
  }

  const crevasses = zones.filter(z => z.zone === 'crevasse')
  if (crevasses.length > 0) {
    recs.push(`Add safety nets to ${crevasses.length} crevasse zone(s) with hidden dangers`)
  }

  const retreatingFlows = flows.filter(f => f.flowType === 'retreating')
  if (retreatingFlows.length > 0) {
    recs.push(`Stabilize ${retreatingFlows.length} retreating flow(s) - dependencies at risk`)
  }

  if (stats.frozenRatio < 30) {
    recs.push('Low frozen ratio - stabilize core modules for a healthier codebase')
  }

  if (stats.stabilityIndex < 40) {
    recs.push('Low stability index - add tests and type safety to critical paths')
  }

  return Array.from(new Set(recs))
}

// ─── buildGlacierResult ─────────────────────────────────────────────────────

/**
 * Build complete glacier analysis result
 * @example
 * buildGlacierResult(['a.ts'], ['export function f() {}'], {}) // GlacierResult
 */
export function buildGlacierResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): GlacierResult {
  const zones: IceZone[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    const filePath = files[i]
    if (!filePath) continue

    const stability = measureStability(content, filePath)
    const density = measureDensity(content)
    const temperature = measureTemperature(content)
    const age = estimateAge(content)
    const layers = countLayers(content)
    const iceCoreQuality = measureIceCoreQuality(content)
    const hiddenDangers = detectHiddenDangers(content, filePath)
    const zone = classifyIceZone(content, filePath)
    const classification = classifyIceClassification(stability, temperature)

    zones.push({
      file: filePath,
      zone,
      stability,
      density,
      temperature,
      age,
      layers,
      iceCoreQuality,
      hiddenDangers,
      classification,
    })
  }

  const flows = mapGlacierFlows(files, contents)
  const moraines = identifyMoraines(files, contents)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const allDangers = zones.flatMap(z => z.hiddenDangers)
  const criticalDangers = allDangers.filter(d => d.severity === 'critical').length
  const frozenRatio = computeFrozenRatio(zones)
  const stabilityIndex = computeStabilityIndex(zones)
  const glacierHealth = classifyGlacierHealth(stabilityIndex, frozenRatio, criticalDangers)

  const stats: GlacierStats = {
    totalZones: zones.length,
    permafrostZones: zones.filter(z => z.zone === 'permafrost').length,
    activeIceZones: zones.filter(z => z.zone === 'active-ice').length,
    meltZones: zones.filter(z => z.zone === 'melt-zone').length,
    crevasseZones: zones.filter(z => z.zone === 'crevasse').length,
    moraineZones: zones.filter(z => z.zone === 'moraine').length,
    avgStability: avg(zones.map(z => z.stability)),
    avgTemperature: avg(zones.map(z => z.temperature)),
    avgIceCoreQuality: avg(zones.map(z => z.iceCoreQuality)),
    totalHiddenDangers: allDangers.length,
    criticalDangers,
    totalFlows: flows.length,
    steadyFlows: flows.filter(f => f.flowType === 'steady').length,
    surgingFlows: flows.filter(f => f.flowType === 'surging').length,
    retreatingFlows: flows.filter(f => f.flowType === 'retreating').length,
    totalMoraines: moraines.length,
    moraineItems: moraines.reduce((s, m) => s + m.size, 0),
    frozenRatio,
    stabilityIndex,
    glacierHealth,
  }

  const recommendations = generateRecommendations(zones, allDangers, flows, moraines, stats)

  return { zones, flows, moraines, stats, recommendations }
}
