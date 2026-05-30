// ─── Types ────────────────────────────────────────────────────────────────────

export type BoneType = 'joint' | 'muscle' | 'nerve' | 'skeleton' | 'vein'

export interface XrayBone {
  name: string
  type: BoneType
  files: string[]
  strength: number
  description: string
}

export type ContractType = 'data-shape' | 'error-type' | 'return-format' | 'side-effect' | 'ordering'
export type RiskLevel = 'high' | 'low' | 'medium'

export interface ImplicitContract {
  between: [string, string]
  type: ContractType
  description: string
  risk: RiskLevel
  evidence: string
}

export type DuplicationType = 'data' | 'logical' | 'structural'

export interface HiddenDuplication {
  pattern: string
  files: string[]
  similarity: number
  lines: number
  type: DuplicationType
}

export type HiddenDepType = 'config' | 'env-var' | 'file-path' | 'global' | 'order-dependent'

export interface HiddenDependency {
  from: string
  to: string
  type: HiddenDepType
  dependency: string
  risk: RiskLevel
}

export interface XrayStats {
  boneCount: number
  skeletonStrength: number
  jointFlexibility: number
  implicitContracts: number
  highRiskContracts: number
  hiddenDuplications: number
  totalDuplicationLines: number
  hiddenDependencyCount: number
  highRiskDeps: number
  structuralHealth: number
}

export interface XrayResult {
  bones: XrayBone[]
  contracts: ImplicitContract[]
  duplications: HiddenDuplication[]
  hiddenDeps: HiddenDependency[]
  stats: XrayStats
  recommendations: string[]
}

export interface XrayOptions {
  verbose?: boolean
}

// ─── Bone Identification ──────────────────────────────────────────────────────

/**
 * Classify a file's structural role (bone type).
 *
 * @example
 * classifyBone('index.ts', content)
 */
export function classifyBone(file: string, content: string): BoneType {
  const lower = file.toLowerCase()
  if (lower.includes('index') || lower.includes('main') || lower.includes('app') || lower.includes('server') || lower.includes('cli')) return 'skeleton'
  if (lower.includes('event') || lower.includes('hook') || lower.includes('callback') || lower.includes('listener') || lower.includes('emit')) return 'nerve'
  if (lower.includes('pipe') || lower.includes('stream') || lower.includes('transform') || lower.includes('pipeline') || lower.includes('flow')) return 'vein'
  if (lower.includes('interface') || lower.includes('type') || lower.includes('contract') || lower.includes('schema')) return 'joint'
  const hasExports = /\bexport\s+(interface|type)\b/.test(content)
  const hasFunctions = /\bexport\s+(function|class|const)/.test(content)
  if (hasExports && !hasFunctions) return 'joint'
  return 'muscle'
}

/**
 * Identify all bones from files and contents.
 *
 * @example
 * identifyBones(files, contents)
 */
export function identifyBones(files: string[], contents: string[]): XrayBone[] {
  const boneMap = new Map<BoneType, { files: string[]; totalStrength: number }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const type = classifyBone(file, content)
    const lines = content.split('\n').length
    const exports = (content.match(/\bexport\b/g) ?? []).length
    const imports = (content.match(/\bimport\b/g) ?? []).length
    const strength = Math.min(100, Math.round((exports + imports + lines / 10) / 3))

    const existing = boneMap.get(type)
    if (existing) {
      existing.files.push(file)
      existing.totalStrength += strength
    } else {
      boneMap.set(type, { files: [file], totalStrength: strength })
    }
  }

  const descriptions: Record<BoneType, string> = {
    skeleton: 'Core structure files forming the backbone',
    joint: 'Interface files connecting modules',
    muscle: 'Implementation files doing the work',
    nerve: 'Event and callback systems',
    vein: 'Data flow and pipeline files',
  }

  const bones: XrayBone[] = []
  for (const [type, data] of boneMap) {
    const avgStrength = data.files.length > 0 ? Math.round(data.totalStrength / data.files.length) : 0
    bones.push({
      name: type,
      type,
      files: data.files,
      strength: avgStrength,
      description: descriptions[type],
    })
  }

  return bones
}

// ─── Skeleton Strength ────────────────────────────────────────────────────────

/**
 * Compute skeleton strength (0-100).
 *
 * @example
 * computeSkeletonStrength(bones)
 */
export function computeSkeletonStrength(bones: XrayBone[]): number {
  const skeleton = bones.find((b) => b.type === 'skeleton')
  if (!skeleton || skeleton.files.length === 0) return 0
  const fileCount = skeleton.files.length
  const strengthBonus = Math.min(30, fileCount * 10)
  return Math.min(100, skeleton.strength + strengthBonus)
}

// ─── Joint Flexibility ────────────────────────────────────────────────────────

/**
 * Compute joint flexibility (0-100).
 *
 * @example
 * computeJointFlexibility(bones)
 */
export function computeJointFlexibility(bones: XrayBone[]): number {
  const joint = bones.find((b) => b.type === 'joint')
  if (!joint || joint.files.length === 0) return 0
  return Math.min(100, joint.strength + joint.files.length * 5)
}

// ─── Implicit Contracts ───────────────────────────────────────────────────────

/**
 * Detect implicit contracts between files.
 *
 * @example
 * detectImplicitContracts(files, contents)
 */
export function detectImplicitContracts(files: string[], contents: string[]): ImplicitContract[] {
  const contracts: ImplicitContract[] = []

  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const fileA = files[i]!
      const fileB = files[j]!
      const contentA = contents[i] ?? ''
      const contentB = contents[j] ?? ''

      const hasThrowA = /\bthrow\b/.test(contentA)
      const hasCatchB = /\bcatch\s*\(/.test(contentB)
      if (hasThrowA && hasCatchB) {
        contracts.push({
          between: [fileA, fileB],
          type: 'error-type',
          description: 'Error handling contract — one throws, the other catches',
          risk: 'medium',
          evidence: `${fileA} throws, ${fileB} catches`,
        })
      }

      const hasConsoleA = /console\.(log|warn|error|info)/.test(contentA)
      const hasConsoleB = /console\.(log|warn|error|info)/.test(contentB)
      if (hasConsoleA && hasConsoleB) {
        contracts.push({
          between: [fileA, fileB],
          type: 'side-effect',
          description: 'Shared console side effects',
          risk: 'low',
          evidence: 'Both files write to console',
        })
      }

      const hasAsyncA = /\basync\b/.test(contentA)
      const hasAwaitB = /\bawait\b/.test(contentB)
      if (hasAsyncA && hasAwaitB) {
        contracts.push({
          between: [fileA, fileB],
          type: 'return-format',
          description: 'Async return format assumed between files',
          risk: 'medium',
          evidence: `${fileA} is async, ${fileB} awaits`,
        })
      }

      const hasProcessEnvA = /process\.env/.test(contentA)
      const hasProcessEnvB = /process\.env/.test(contentB)
      if (hasProcessEnvA && hasProcessEnvB) {
        contracts.push({
          between: [fileA, fileB],
          type: 'data-shape',
          description: 'Shared environment variable dependency',
          risk: 'high',
          evidence: 'Both files read process.env',
        })
      }
    }
  }

  return contracts
}

// ─── Hidden Duplication ───────────────────────────────────────────────────────

/**
 * Detect hidden structural duplication.
 *
 * @example
 * detectHiddenDuplication(files, contents)
 */
export function detectHiddenDuplication(files: string[], contents: string[]): HiddenDuplication[] {
  const duplications: HiddenDuplication[] = []

  const patterns: { name: string; regex: RegExp; type: DuplicationType }[] = [
    { name: 'try-catch blocks', regex: /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/g, type: 'structural' },
    { name: 'error handling', regex: /if\s*\([^)]*instanceof\s+Error[^)]*\)\s*\{[^}]*\}/g, type: 'logical' },
    { name: 'console logging', regex: /console\.\w+\([^)]*\)/g, type: 'data' },
    { name: 'null checks', regex: /if\s*\([^)]*[!=]==?\s*(?:null|undefined)[^)]*\)/g, type: 'logical' },
    { name: 'default values', regex: /\?\?\s*['"][^'"]*['"]/g, type: 'data' },
    { name: 'async patterns', regex: /async\s+function\s+\w+\([^)]*\)\s*:\s*Promise/g, type: 'structural' },
  ]

  for (const { name, regex, type } of patterns) {
    const matchedFiles: string[] = []
    let totalMatches = 0

    for (let i = 0; i < files.length; i++) {
      const content = contents[i] ?? ''
      const matches = content.match(regex)
      if (matches && matches.length > 0) {
        matchedFiles.push(files[i]!)
        totalMatches += matches.length
      }
    }

    if (matchedFiles.length >= 2) {
      const similarity = Math.min(100, Math.round((matchedFiles.length / files.length) * 100))
      duplications.push({
        pattern: name,
        files: matchedFiles,
        similarity,
        lines: totalMatches,
        type,
      })
    }
  }

  return duplications
}

// ─── Hidden Dependencies ─────────────────────────────────────────────────────

/**
 * Detect hidden dependencies.
 *
 * @example
 * detectHiddenDependencies(files, contents)
 */
export function detectHiddenDependencies(files: string[], contents: string[]): HiddenDependency[] {
  const deps: HiddenDependency[] = []

  const envVars = new Map<string, string[]>()
  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const matches = content.matchAll(/process\.env\.(\w+)/g)
    for (const m of matches) {
      const varName = m[1] ?? ''
      const fileList = envVars.get(varName) ?? []
      if (!fileList.includes(files[i]!)) fileList.push(files[i]!)
      envVars.set(varName, fileList)
    }
  }

  for (const [varName, fileList] of envVars) {
    for (let i = 0; i < fileList.length; i++) {
      for (let j = i + 1; j < fileList.length; j++) {
        deps.push({
          from: fileList[i]!,
          to: fileList[j]!,
          type: 'env-var',
          dependency: `process.env.${varName}`,
          risk: fileList.length > 3 ? 'high' : 'medium',
        })
      }
    }
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const filePathRefs = content.matchAll(/['"](?:\.\/|\.\.\/)[^'"]+\.(?:ts|js|json)['"]/g)
    for (const ref of filePathRefs) {
      const refStr = ref[0]!
      deps.push({
        from: files[i]!,
        to: refStr.replace(/['"]/g, ''),
        type: 'file-path',
        dependency: refStr.replace(/['"]/g, ''),
        risk: 'low',
      })
    }
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const globalMutations = content.matchAll(/(?:global|globalThis)\.\w+\s*=/g)
    for (const m of globalMutations) {
      deps.push({
        from: files[i]!,
        to: '*',
        type: 'global',
        dependency: m[0]!,
        risk: 'high',
      })
    }
  }

  return deps
}

// ─── Structural Health ────────────────────────────────────────────────────────

/**
 * Compute overall structural health (0-100).
 *
 * @example
 * computeStructuralHealth(bones, contracts, duplications, deps)
 */
export function computeStructuralHealth(
  bones: XrayBone[],
  contracts: ImplicitContract[],
  duplications: HiddenDuplication[],
  deps: HiddenDependency[],
): number {
  let score = 100

  const skeleton = bones.find((b) => b.type === 'skeleton')
  if (!skeleton) score -= 20
  else if (skeleton.files.length === 0) score -= 15

  const highRiskContracts = contracts.filter((c) => c.risk === 'high').length
  score -= highRiskContracts * 5

  const highRiskDeps = deps.filter((d) => d.risk === 'high').length
  score -= highRiskDeps * 3

  const dupLines = duplications.reduce((s, d) => s + d.lines, 0)
  if (dupLines > 20) score -= Math.min(15, dupLines)

  return Math.max(0, Math.min(100, score))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate X-ray recommendations.
 *
 * @example
 * generateXrayRecommendations(stats, contracts, duplications, deps)
 */
export function generateXrayRecommendations(
  stats: XrayStats,
  _contracts: ImplicitContract[],
  duplications: HiddenDuplication[],
  _deps: HiddenDependency[],
): string[] {
  const recs: string[] = []

  if (stats.skeletonStrength < 30) {
    recs.push('Weak skeleton — strengthen core files with better structure and exports')
  }

  if (stats.highRiskContracts > 0) {
    recs.push(`${stats.highRiskContracts} high-risk implicit contract(s) — add explicit type definitions`)
  }

  if (duplications.length > 0) {
    recs.push(`${duplications.length} hidden duplication(s) — extract shared utilities`)
  }

  if (stats.highRiskDeps > 0) {
    recs.push(`${stats.highRiskDeps} high-risk hidden dependency(ies) — make dependencies explicit`)
  }

  if (stats.structuralHealth < 50) {
    recs.push(`Structural health is ${stats.structuralHealth}% — significant refactoring recommended`)
  }

  if (recs.length === 0) {
    recs.push('Structural health is good — codebase has strong bones and explicit contracts')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete X-ray result.
 *
 * @example
 * buildXrayResult(files, contents)
 */
export function buildXrayResult(
  files: string[],
  contents: string[],
  _options?: XrayOptions,
): XrayResult {
  const bones = identifyBones(files, contents)
  const contracts = detectImplicitContracts(files, contents)
  const duplications = detectHiddenDuplication(files, contents)
  const hiddenDeps = detectHiddenDependencies(files, contents)

  const skeletonStrength = computeSkeletonStrength(bones)
  const jointFlexibility = computeJointFlexibility(bones)
  const highRiskContracts = contracts.filter((c) => c.risk === 'high').length
  const highRiskDeps = hiddenDeps.filter((d) => d.risk === 'high').length
  const totalDuplicationLines = duplications.reduce((s, d) => s + d.lines, 0)
  const structuralHealth = computeStructuralHealth(bones, contracts, duplications, hiddenDeps)

  const stats: XrayStats = {
    boneCount: bones.length,
    skeletonStrength,
    jointFlexibility,
    implicitContracts: contracts.length,
    highRiskContracts,
    hiddenDuplications: duplications.length,
    totalDuplicationLines,
    hiddenDependencyCount: hiddenDeps.length,
    highRiskDeps,
    structuralHealth,
  }

  const recommendations = generateXrayRecommendations(stats, contracts, duplications, hiddenDeps)

  return { bones, contracts, duplications, hiddenDeps, stats, recommendations }
}
