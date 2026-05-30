// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleBoundary {
  name: string
  intendedPurpose: string
  allowedDependencies: string[]
  actualDependencies: string[]
  violations: BoundaryViolation[]
}

export interface BoundaryViolation {
  from: string
  to: string
  type: 'cross-layer' | 'circular' | 'misplaced-file' | 'leaky-abstraction'
  severity: 'warning' | 'critical'
  description: string
  files: string[]
}

export interface DriftIndicator {
  type: 'boundary-violation' | 'size-drift' | 'complexity-drift' | 'coupling-drift'
  description: string
  before: string | number
  after: string | number
  drift: number
  severity: 'low' | 'medium' | 'high'
}

export interface DriftStats {
  totalModules: number
  totalBoundaries: number
  violationCount: number
  driftScore: number
  driftTrend: 'improving' | 'stable' | 'worsening'
  mostDriftedModule: string
  healthiestModule: string
}

export interface DriftResult {
  boundaries: ModuleBoundary[]
  violations: BoundaryViolation[]
  indicators: DriftIndicator[]
  stats: DriftStats
  recommendations: string[]
}

export interface DriftOptions {
  verbose?: boolean
}

// ─── Layer Definitions ────────────────────────────────────────────────────────

const LAYER_ORDER: Record<string, number> = {
  commands: 0,
  handlers: 0,
  routes: 0,
  controllers: 0,
  core: 1,
  services: 1,
  middleware: 1,
  utils: 2,
  helpers: 2,
  lib: 2,
  shared: 2,
  types: 3,
  models: 3,
  interfaces: 3,
}

const PURPOSE_MAP: Record<string, string> = {
  commands: 'CLI command definitions and handlers',
  handlers: 'Request/event handler logic',
  routes: 'API route definitions',
  controllers: 'Request controller logic',
  core: 'Core business logic and shared infrastructure',
  services: 'Service layer business logic',
  middleware: 'Request processing middleware',
  utils: 'Utility and helper functions',
  helpers: 'Helper and utility functions',
  lib: 'Library and shared utilities',
  shared: 'Shared code across modules',
  types: 'TypeScript type definitions',
  models: 'Data models and schemas',
  interfaces: 'Interface definitions',
}

/**
 * Get the layer number for a module name (higher = deeper).
 *
 * @example
 * getLayerNumber('commands') // 0
 */
export function getLayerNumber(moduleName: string): number {
  return LAYER_ORDER[moduleName] ?? 1
}

// ─── inferModuleBoundaries ────────────────────────────────────────────────────

/**
 * Infer intended module boundaries from file paths.
 *
 * @example
 * inferModuleBoundaries(['src/commands/count.ts', 'src/core/file.ts']) // [ModuleBoundary, ...]
 */
export function inferModuleBoundaries(files: string[]): ModuleBoundary[] {
  const moduleMap = new Map<string, string[]>()

  for (const file of files) {
    const parts = file.split('/')
    if (parts.length < 2) continue
    const srcIdx = parts.indexOf('src')
    if (srcIdx === -1 || srcIdx + 1 >= parts.length) continue
    const moduleName = parts[srcIdx + 1]!
    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, [])
    }
    moduleMap.get(moduleName)!.push(file)
  }

  const boundaries: ModuleBoundary[] = []
  const allNames = [...moduleMap.keys()]

  for (const [name] of moduleMap) {
    const purpose = PURPOSE_MAP[name] ?? `${name} module`
    boundaries.push({
      name,
      intendedPurpose: purpose,
      allowedDependencies: inferAllowedDependencies(name, allNames),
      actualDependencies: [],
      violations: [],
    })
  }

  return boundaries
}

// ─── inferAllowedDependencies ─────────────────────────────────────────────────

/**
 * Infer which modules a given module is allowed to depend on.
 *
 * @example
 * inferAllowedDependencies('commands', ['commands', 'core', 'utils']) // ['core', 'utils']
 */
export function inferAllowedDependencies(moduleName: string, allNames: string[]): string[] {
  const ownLayer = getLayerNumber(moduleName)
  const allowed: string[] = []
  for (const other of allNames) {
    if (other === moduleName) continue
    if (getLayerNumber(other) > ownLayer) {
      allowed.push(other)
    }
  }
  return allowed
}

// ─── computeActualDependencies ────────────────────────────────────────────────

/**
 * Extract actual import dependencies for a module from file contents.
 *
 * @example
 * computeActualDependencies(boundary, files, contents) // ['core', 'utils']
 */
export function computeActualDependencies(
  boundary: ModuleBoundary,
  files: string[],
  contents: string[],
): string[] {
  const deps = new Set<string>()

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const parts = filePath.split('/')
    const srcIdx = parts.indexOf('src')
    if (srcIdx === -1) continue
    const fileModule = parts[srcIdx + 1]
    if (fileModule !== boundary.name) continue

    const content = contents[i] ?? ''
    const importMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)
    for (const match of importMatches) {
      const rawPath = match[1] ?? ''
      const segments = rawPath.split('/')
      const fileDirParts = parts.slice(0, parts.length - 1)
      let current = [...fileDirParts]

      for (const seg of segments) {
        if (seg === '..') {
          current.pop()
        } else if (seg !== '.') {
          current.push(seg)
        }
      }

      const resolvedSrcIdx = current.indexOf('src')
      if (resolvedSrcIdx !== -1 && resolvedSrcIdx + 1 < current.length) {
        const depModule = current[resolvedSrcIdx + 1]!
        if (depModule !== boundary.name) {
          deps.add(depModule)
        }
      }
    }
  }

  return [...deps]
}

// ─── detectBoundaryViolations ─────────────────────────────────────────────────

/**
 * Detect boundary violations across all modules.
 *
 * @example
 * detectBoundaryViolations(boundaries) // [BoundaryViolation, ...]
 */
export function detectBoundaryViolations(boundaries: ModuleBoundary[]): BoundaryViolation[] {
  const violations: BoundaryViolation[] = []

  const boundaryMap = new Map<string, ModuleBoundary>()
  for (const b of boundaries) {
    boundaryMap.set(b.name, b)
  }

  for (const boundary of boundaries) {
    for (const dep of boundary.actualDependencies) {
      if (!boundary.allowedDependencies.includes(dep)) {
        const violation: BoundaryViolation = {
          from: boundary.name,
          to: dep,
          type: 'cross-layer',
          severity: 'warning',
          description: `${boundary.name} (layer ${getLayerNumber(boundary.name)}) depends on ${dep} (layer ${getLayerNumber(dep)}), violating layer hierarchy`,
          files: [],
        }
        violations.push(violation)
        boundary.violations.push(violation)
      }
    }
  }

  for (let i = 0; i < boundaries.length; i++) {
    for (let j = i + 1; j < boundaries.length; j++) {
      const a = boundaries[i]!
      const b = boundaries[j]!
      if (a.actualDependencies.includes(b.name) && b.actualDependencies.includes(a.name)) {
        const violation: BoundaryViolation = {
          from: a.name,
          to: b.name,
          type: 'circular',
          severity: 'critical',
          description: `Circular dependency between ${a.name} and ${b.name}`,
          files: [],
        }
        violations.push(violation)
      }
    }
  }

  return violations
}

// ─── computeDriftIndicators ───────────────────────────────────────────────────

/**
 * Compute drift indicators from violations and boundaries.
 *
 * @example
 * computeDriftIndicators(violations, boundaries) // [DriftIndicator, ...]
 */
export function computeDriftIndicators(
  violations: BoundaryViolation[],
  boundaries: ModuleBoundary[],
): DriftIndicator[] {
  const indicators: DriftIndicator[] = []

  const crossLayerCount = violations.filter((v) => v.type === 'cross-layer').length
  if (crossLayerCount > 0) {
    indicators.push({
      type: 'boundary-violation',
      description: `${crossLayerCount} cross-layer violation${crossLayerCount > 1 ? 's' : ''} detected`,
      before: '0 violations',
      after: `${crossLayerCount} violations`,
      drift: crossLayerCount,
      severity: crossLayerCount > 5 ? 'high' : crossLayerCount > 2 ? 'medium' : 'low',
    })
  }

  const circularCount = violations.filter((v) => v.type === 'circular').length
  if (circularCount > 0) {
    indicators.push({
      type: 'boundary-violation',
      description: `${circularCount} circular dependenc${circularCount > 1 ? 'ies' : 'y'} detected`,
      before: '0 circular',
      after: `${circularCount} circular`,
      drift: circularCount,
      severity: 'high',
    })
  }

  for (const boundary of boundaries) {
    const expectedDeps = boundary.allowedDependencies.length
    const actualDeps = boundary.actualDependencies.length
    if (actualDeps > expectedDeps + 2) {
      const diff = actualDeps - expectedDeps
      indicators.push({
        type: 'coupling-drift',
        description: `${boundary.name} depends on ${actualDeps} modules (expected ~${expectedDeps})`,
        before: expectedDeps,
        after: actualDeps,
        drift: diff,
        severity: diff > 4 ? 'high' : diff > 2 ? 'medium' : 'low',
      })
    }
  }

  for (const boundary of boundaries) {
    if (boundary.violations.length > 3) {
      indicators.push({
        type: 'complexity-drift',
        description: `${boundary.name} has ${boundary.violations.length} boundary violations`,
        before: 0,
        after: boundary.violations.length,
        drift: boundary.violations.length,
        severity: boundary.violations.length > 5 ? 'high' : 'medium',
      })
    }
  }

  return indicators
}

// ─── computeDriftScore ────────────────────────────────────────────────────────

/**
 * Compute drift score from 0-100 (0=perfect, 100=fully drifted).
 *
 * @example
 * computeDriftScore([], []) // 0
 */
export function computeDriftScore(
  violations: BoundaryViolation[],
  indicators: DriftIndicator[],
): number {
  let score = 0

  for (const v of violations) {
    if (v.type === 'circular') score += 15
    else if (v.type === 'cross-layer') score += 8
    else if (v.type === 'leaky-abstraction') score += 5
    else score += 3
  }

  for (const ind of indicators) {
    if (ind.severity === 'high') score += 10
    else if (ind.severity === 'medium') score += 5
    else score += 2
  }

  return Math.min(100, score)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations from drift analysis.
 *
 * @example
 * generateRecommendations(violations, indicators) // ['Break circular deps...']
 */
export function generateRecommendations(
  violations: BoundaryViolation[],
  indicators: DriftIndicator[],
): string[] {
  const recs: string[] = []

  const circular = violations.filter((v) => v.type === 'circular')
  for (const v of circular) {
    recs.push(`Break circular dependency between ${v.from} and ${v.to} — extract shared logic to a separate module`)
  }

  const crossLayer = violations.filter((v) => v.type === 'cross-layer')
  if (crossLayer.length > 0) {
    recs.push(`Fix ${crossLayer.length} cross-layer violation${crossLayer.length > 1 ? 's' : ''} — respect the layer hierarchy (commands → core → utils)`)
  }

  const couplingDrifts = indicators.filter((i) => i.type === 'coupling-drift')
  for (const cd of couplingDrifts) {
    recs.push(`Reduce coupling in ${cd.description.split(' ')[0]} module — it depends on too many other modules`)
  }

  if (recs.length === 0) {
    recs.push('Architecture is well-structured. No significant drift detected.')
  }

  return recs
}

// ─── buildDriftResult ─────────────────────────────────────────────────────────

/**
 * Orchestrate full drift analysis.
 *
 * @example
 * buildDriftResult(['src/commands/a.ts'], ['import from core'], {}) // DriftResult
 */
export function buildDriftResult(
  files: string[],
  contents: string[],
  _options?: DriftOptions,
): DriftResult {
  const boundaries = inferModuleBoundaries(files)

  for (const boundary of boundaries) {
    boundary.actualDependencies = computeActualDependencies(boundary, files, contents)
  }

  const violations = detectBoundaryViolations(boundaries)
  const indicators = computeDriftIndicators(violations, boundaries)
  const driftScore = computeDriftScore(violations, indicators)

  const totalModules = boundaries.length
  const violationCount = violations.length

  let mostDriftedModule = 'none'
  let maxV = 0
  let healthiestModule = 'none'
  let minV = Infinity
  for (const b of boundaries) {
    if (b.violations.length > maxV) {
      maxV = b.violations.length
      mostDriftedModule = b.name
    }
    if (b.violations.length < minV) {
      minV = b.violations.length
      healthiestModule = b.name
    }
  }

  const driftTrend: 'improving' | 'stable' | 'worsening' = driftScore < 20 ? 'improving' : driftScore > 50 ? 'worsening' : 'stable'

  const stats: DriftStats = {
    totalModules,
    totalBoundaries: totalModules,
    violationCount,
    driftScore,
    driftTrend,
    mostDriftedModule,
    healthiestModule,
  }

  const recommendations = generateRecommendations(violations, indicators)

  return { boundaries, violations, indicators, stats, recommendations }
}
