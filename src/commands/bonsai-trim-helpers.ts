// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PruningTarget {
  type: 'dead-branch' | 'sucker' | 'crossing-branch' | 'water-sprout' | 'crown-lift' | 'thinning' | 'deadwood'
  location: string
  description: string
  impact: 'critical' | 'high' | 'medium' | 'low' | 'cosmetic'
  effort: 'easy' | 'moderate' | 'difficult' | 'major-refactor'
  linesAffected: number
  recommendation: string
}

export interface Foliage {
  totalLeaves: number
  deadLeaves: number
  yellowLeaves: number
  greenLeaves: number
  brownLeaves: number
  overgrownAreas: number
}

export interface BranchStructure {
  trunkStrength: number
  branchAngle: number
  canopyBalance: number
  rootDepth: number
  graftingPoints: number
}

export interface Aesthetic {
  simplicity: number
  elegance: number
  proportion: number
  harmony: number
}

export interface BonsaiBranch {
  file: string
  canPrune: boolean
  pruningOpportunities: number
  density: number
  branchHealth: number
  branchWeight: number
  foliage: Foliage
  structure: BranchStructure
  pruningTargets: PruningTarget[]
  aesthetic: Aesthetic
  style: 'formal-upright' | 'informal-upright' | 'slanting' | 'cascade' | 'semi-cascade' | 'literati' | 'broom' | 'forest'
  maturity: 'seedling' | 'sapling' | 'young' | 'mature' | 'ancient' | 'overgrown'
  health: 'thriving' | 'healthy' | 'fair' | 'stressed' | 'diseased' | 'dead'
  condition: 'masterpiece' | 'well-tended' | 'needs-trimming' | 'overgrown' | 'wild' | 'deadwood'
  qualityScore: number
}

export interface BonsaiTree {
  directory: string
  branches: BonsaiBranch[]
  style: string
  avgHealth: number
  avgDensity: number
  avgAesthetic: number
  totalPruningTargets: number
  criticalTargets: number
  deadLeaves: number
  overgrownAreas: number
  trunkStrength: number
  canopyBalance: number
  rootDepth: number
  dominantStyle: string
  dominantMaturity: string
  masterpieceCount: number
  overgrownCount: number
  deadwoodCount: number
  isBalanced: boolean
  overallAesthetic: number
  needsAttention: boolean
  attentionLevel: 'none' | 'light-trimming' | 'moderate-pruning' | 'heavy-pruning' | 'restoration'
  condition: 'masterpiece' | 'well-tended' | 'needs-work' | 'overgrown' | 'wild-growth' | 'clear-cut'
}

export interface BonsaiGarden {
  totalPruningTargets: number
  criticalTargets: number
  totalDeadLeaves: number
  totalYellowLeaves: number
  totalOvergrownAreas: number
  masterpieceCount: number
  overgrownCount: number
  overallAesthetic: number
  gardenHealth: number
}

export interface BonsaiTrimStats {
  totalFiles: number
  totalTrees: number
  avgDensity: number
  avgHealth: number
  avgAesthetic: number
  avgSimplicity: number
  avgElegance: number
  avgProportion: number
  avgHarmony: number
  avgTrunkStrength: number
  avgCanopyBalance: number
  totalPruningTargets: number
  deadBranchTargets: number
  suckerTargets: number
  thinningTargets: number
  deadwoodTargets: number
  totalDeadLeaves: number
  totalGreenLeaves: number
  masterpieces: number
  overgrown: number
  deadwood: number
  easyPrunes: number
  difficultPrunes: number
  overallAesthetic: number
  gardenerGrade: 'master-gardener' | 'skilled' | 'apprentice' | 'neglectful' | 'absent'
  bestBranch: string
  worstBranch: string
  mostPruningNeeded: string
  mostElegant: string
}

export interface BonsaiTrimResult {
  branches: BonsaiBranch[]
  trees: BonsaiTree[]
  garden: BonsaiGarden
  stats: BonsaiTrimStats
  recommendations: string[]
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify bonsai style from code characteristics
 * @example
 * classifyStyle(0, 0) // 'broom'
 */
export function classifyStyle(
  exports: number,
  classes: number,
): BonsaiBranch['style'] {
  if (exports >= 8) return 'forest'
  if (exports >= 5 && classes >= 2) return 'formal-upright'
  if (classes >= 3) return 'cascade'
  if (exports >= 5) return 'informal-upright'
  if (classes >= 2 && exports >= 2) return 'slanting'
  if (classes >= 1 && exports >= 3) return 'semi-cascade'
  if (classes >= 1) return 'literati'
  if (exports >= 2) return 'broom'
  return 'broom'
}

/**
 * Classify maturity from code size and complexity
 * @example
 * classifyMaturity(0, 0) // 'seedling'
 */
export function classifyMaturity(
  lines: number,
  functions: number,
): BonsaiBranch['maturity'] {
  if (lines >= 300 && functions >= 10) return 'overgrown'
  if (lines >= 200 && functions >= 6) return 'ancient'
  if (lines >= 100 && functions >= 3) return 'mature'
  if (lines >= 50 && functions >= 2) return 'young'
  if (lines >= 20 && functions >= 1) return 'sapling'
  return 'seedling'
}

/**
 * Classify health from quality metrics
 * @example
 * classifyHealth(90) // 'thriving'
 */
export function classifyHealth(quality: number): BonsaiBranch['health'] {
  if (quality >= 85) return 'thriving'
  if (quality >= 70) return 'healthy'
  if (quality >= 50) return 'fair'
  if (quality >= 30) return 'stressed'
  if (quality >= 15) return 'diseased'
  return 'dead'
}

/**
 * Classify condition from quality and pruning targets
 * @example
 * classifyCondition(90, 0) // 'masterpiece'
 */
export function classifyCondition(
  quality: number,
  pruneCount: number,
): BonsaiBranch['condition'] {
  if (quality >= 85 && pruneCount === 0) return 'masterpiece'
  if (quality >= 70) return 'well-tended'
  if (quality >= 50 && pruneCount <= 3) return 'needs-trimming'
  if (pruneCount >= 5) return 'wild'
  if (quality < 30) return 'deadwood'
  return 'overgrown'
}

/**
 * Classify gardener grade from average aesthetic
 * @example
 * classifyGardenerGrade(90) // 'master-gardener'
 */
export function classifyGardenerGrade(
  avgAesthetic: number,
): BonsaiTrimStats['gardenerGrade'] {
  if (avgAesthetic >= 80) return 'master-gardener'
  if (avgAesthetic >= 60) return 'skilled'
  if (avgAesthetic >= 40) return 'apprentice'
  if (avgAesthetic >= 20) return 'neglectful'
  return 'absent'
}

/**
 * Assess attention level for a tree
 * @example
 * assessAttentionLevel(2, 60) // 'light-trimming'
 */
export function assessAttentionLevel(
  pruningTargets: number,
  avgHealth: number,
): BonsaiTree['attentionLevel'] {
  if (pruningTargets === 0 && avgHealth >= 70) return 'none'
  if (pruningTargets <= 2 && avgHealth >= 60) return 'light-trimming'
  if (pruningTargets <= 5 && avgHealth >= 40) return 'moderate-pruning'
  if (avgHealth >= 20) return 'heavy-pruning'
  return 'restoration'
}

// ─── Pruning Target Detection ───────────────────────────────────────────────

/**
 * Identify pruning targets in code content
 * @example
 * identifyPruningTargets('const x: any = 1') // [{ type: 'sucker', ... }]
 */
export function identifyPruningTargets(content: string): PruningTarget[] {
  const targets: PruningTarget[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (/console\.(log|warn|error|debug|info)\s*\(/.test(trimmed)) {
      targets.push({
        type: 'sucker',
        location: `line ${i + 1}`,
        description: 'Console statement: unnecessary debug output',
        impact: 'low',
        effort: 'easy',
        linesAffected: 1,
        recommendation: 'Remove console statement or replace with proper logger',
      })
    }

    if (/\bany\b/.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
      targets.push({
        type: 'water-sprout',
        location: `line ${i + 1}`,
        description: 'Any type usage: weakens type safety',
        impact: 'medium',
        effort: 'moderate',
        linesAffected: 1,
        recommendation: 'Replace with proper type annotation',
      })
    }

    if (/\/\/\s*(TODO|FIXME|HACK|XXX|TEMP)\b/i.test(trimmed)) {
      targets.push({
        type: 'deadwood',
        location: `line ${i + 1}`,
        description: `Technical debt marker: ${trimmed.slice(0, 40)}`,
        impact: 'medium',
        effort: 'easy',
        linesAffected: 1,
        recommendation: 'Resolve or remove the technical debt marker',
      })
    }

    if (trimmed.startsWith('//') && i > 0 && lines[i - 1]?.trim().startsWith('//') && i + 1 < lines.length && lines[i + 1]?.trim().startsWith('//')) {
      if (!targets.some(t => t.location === `line ${i}`)) {
        targets.push({
          type: 'thinning',
          location: `lines ${i}-${i + 2}`,
          description: 'Excessive inline comments: reduce density',
          impact: 'cosmetic',
          effort: 'easy',
          linesAffected: 3,
          recommendation: 'Consolidate comments into a concise block',
        })
      }
    }

    if (/\b(eval|Function)\s*\(/.test(trimmed)) {
      targets.push({
        type: 'dead-branch',
        location: `line ${i + 1}`,
        description: 'Dangerous eval/Function usage',
        impact: 'critical',
        effort: 'difficult',
        linesAffected: 1,
        recommendation: 'Replace with safer alternatives',
      })
    }

    if (trimmed.length > 150) {
      targets.push({
        type: 'crown-lift',
        location: `line ${i + 1}`,
        description: `Long line (${trimmed.length} chars): needs abstraction`,
        impact: 'low',
        effort: 'moderate',
        linesAffected: 1,
        recommendation: 'Break into smaller, named expressions',
      })
    }
  }

  const nestedBraces = content.match(/\{[^{}]*\{[^{}]*\{[^{}]*\{/g)
  if (nestedBraces) {
    for (let i = 0; i < nestedBraces.length; i++) {
      targets.push({
        type: 'crossing-branch',
        location: `nested block ${i + 1}`,
        description: 'Deeply nested code: 4+ levels of nesting',
        impact: 'high',
        effort: 'difficult',
        linesAffected: 5,
        recommendation: 'Flatten nesting with early returns or extract functions',
      })
    }
  }

  const duplicatePatterns = content.match(/(.{20,})\1/g)
  if (duplicatePatterns) {
    for (const dup of duplicatePatterns) {
      targets.push({
        type: 'thinning',
        location: `repeated pattern`,
        description: `Duplicated code pattern: ${dup.slice(0, 30)}...`,
        impact: 'medium',
        effort: 'moderate',
        linesAffected: 2,
        recommendation: 'Extract shared logic into a reusable function',
      })
    }
  }

  return targets
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a bonsai branch
 * @example
 * analyzeBonsaiBranch('export function f() {}', 'f.ts') // BonsaiBranch
 */
export function analyzeBonsaiBranch(content: string, filePath: string): BonsaiBranch {
  const lines = content.split('\n')
  const totalLines = lines.length

  const exportCount = (content.match(/export\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(]|\w+\s*\([^)]*\)\s*[{=])/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length
  const importCount = (content.match(/\bimport\s+/g) ?? []).length
  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const tryCatchCount = (content.match(/\btry\s*\{/g) ?? []).length
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('*')).length
  const blankLines = lines.filter(l => l.trim().length === 0).length
  const codeLines = totalLines - commentLines - blankLines
  const longLines = lines.filter(l => l.length > 120).length

  const totalLeaves = codeLines + functionCount + classCount + interfaceCount + typeCount

  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasTodo = /\/\/\s*(TODO|FIXME|HACK)/.test(content)
  const hasEval = /\b(eval|Function)\s*\(/.test(content)
  const deadCodePatterns = (content.match(/\bif\s*\(\s*false\s*\)/g) ?? []).length

  const deadLeaves = deadCodePatterns + (hasConsole ? 2 : 0) + (hasEval ? 3 : 0)
  const yellowLeaves = hasTodo ? 1 : 0
  const greenLeaves = Math.max(0, totalLeaves - deadLeaves - yellowLeaves)
  const brownLeaves = commentLines > codeLines * 0.5 ? Math.floor(commentLines * 0.3) : 0
  const overgrownAreas = longLines + (functionCount > 0 && codeLines / functionCount > 30 ? functionCount : 0)

  const density = totalLines > 0 ? Math.min(100, Math.round((codeLines / totalLines) * 100)) : 0

  const hasExports = exportCount > 0
  const hasTypes = interfaceCount + typeCount > 0
  const hasJSDoc = jsdocCount > 0
  const hasTests = /describe\s*\(|it\s*\(|test\s*\(/.test(content)

  const trunkStrength = Math.min(100, Math.round(
    (hasExports ? 25 : 0) + (hasTypes ? 20 : 0) + (hasJSDoc ? 20 : 0) + (hasTests ? 20 : 0) + Math.min(15, jsdocCount * 3),
  ))

  const branchAngle = Math.min(100, Math.round(
    (exportCount > 0 ? 20 : 0) + (classCount > 0 ? 15 : 0) + (functionCount > 0 ? 15 : 0) + (interfaceCount > 0 ? 15 : 0) + (typeCount > 0 ? 15 : 0) + Math.min(20, importCount * 4),
  ))

  const maxType = Math.max(interfaceCount, typeCount, classCount, functionCount)
  const totalTypes = interfaceCount + typeCount + classCount + functionCount
  const canopyBalance = totalTypes > 0 ? Math.min(100, Math.round((1 - maxType / totalTypes) * 100)) : 0

  const rootDepth = Math.min(100, Math.round(
    (importCount > 0 ? 20 : 0) + (tryCatchCount > 0 ? 15 : 0) + (hasTypes ? 15 : 0) + Math.min(50, importCount * 8),
  ))

  const graftingPoints = importCount + exportCount

  const pruningTargets = identifyPruningTargets(content)
  const pruningOpportunities = pruningTargets.length

  const simplicity = Math.max(0, 100 - overgrownAreas * 5 - longLines * 3 - (hasAny ? 15 : 0) - (hasEval ? 20 : 0))
  const elegance = Math.min(100, Math.round(
    (hasJSDoc ? 20 : 0) + (hasTypes ? 20 : 0) + (hasExports ? 15 : 0) + (hasTests ? 15 : 0) + (hasAny ? 0 : 10) + Math.min(20, jsdocCount * 4),
  ))
  const codeToPurpose = totalLeaves > 0 ? Math.min(100, Math.round((exportCount / totalLeaves) * 200)) : 0
  const proportion = Math.max(0, Math.min(100, codeToPurpose + (density > 30 && density < 80 ? 20 : 0) - (overgrownAreas > 3 ? 15 : 0)))
  const harmony = Math.min(100, Math.round(
    (density > 20 && density < 80 ? 25 : 10) + (canopyBalance > 50 ? 25 : 10) + (pruningOpportunities === 0 ? 25 : Math.max(0, 25 - pruningOpportunities * 5)) + (hasJSDoc && hasTypes ? 25 : 10),
  ))

  const branchHealth = Math.min(100, Math.max(0, Math.round(
    (trunkStrength * 0.3) + (simplicity * 0.2) + (elegance * 0.2) + (harmony * 0.15) + (greenLeaves > deadLeaves * 3 ? 15 : 5),
  )))

  const branchWeight = Math.min(100, Math.round(
    (exportCount * 8) + (hasTests ? 15 : 0) + (hasJSDoc ? 10 : 0) + (hasTypes ? 10 : 0),
  ))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (branchHealth * 0.3) + (simplicity * 0.2) + (elegance * 0.2) + (proportion * 0.15) + (harmony * 0.15),
  )))

  const style = classifyStyle(exportCount, classCount)
  const maturity = classifyMaturity(totalLines, functionCount)
  const health = classifyHealth(qualityScore)
  const condition = classifyCondition(qualityScore, pruningOpportunities)

  return {
    file: filePath,
    canPrune: pruningOpportunities > 0,
    pruningOpportunities,
    density,
    branchHealth,
    branchWeight: Math.min(100, branchWeight),
    foliage: {
      totalLeaves,
      deadLeaves,
      yellowLeaves,
      greenLeaves,
      brownLeaves,
      overgrownAreas,
    },
    structure: {
      trunkStrength,
      branchAngle,
      canopyBalance,
      rootDepth,
      graftingPoints,
    },
    pruningTargets,
    aesthetic: { simplicity, elegance, proportion, harmony },
    style,
    maturity,
    health,
    condition,
    qualityScore,
  }
}

/**
 * Analyze a directory as a bonsai tree
 * @example
 * analyzeBonsaiTree(branches, 'src') // BonsaiTree
 */
export function analyzeBonsaiTree(branches: BonsaiBranch[], dirPath: string): BonsaiTree {
  if (branches.length === 0) {
    return {
      directory: dirPath,
      branches: [],
      style: 'broom',
      avgHealth: 0,
      avgDensity: 0,
      avgAesthetic: 0,
      totalPruningTargets: 0,
      criticalTargets: 0,
      deadLeaves: 0,
      overgrownAreas: 0,
      trunkStrength: 0,
      canopyBalance: 0,
      rootDepth: 0,
      dominantStyle: 'broom',
      dominantMaturity: 'seedling',
      masterpieceCount: 0,
      overgrownCount: 0,
      deadwoodCount: 0,
      isBalanced: false,
      overallAesthetic: 0,
      needsAttention: false,
      attentionLevel: 'restoration',
      condition: 'clear-cut',
    }
  }

  const avgHealth = Math.round(branches.reduce((s, b) => s + b.branchHealth, 0) / branches.length)
  const avgDensity = Math.round(branches.reduce((s, b) => s + b.density, 0) / branches.length)
  const avgAesthetic = Math.round(branches.reduce((s, b) => s + (b.aesthetic.simplicity + b.aesthetic.elegance + b.aesthetic.proportion + b.aesthetic.harmony) / 4, 0) / branches.length)
  const totalPruningTargets = branches.reduce((s, b) => s + b.pruningOpportunities, 0)
  const criticalTargets = branches.reduce((s, b) => s + b.pruningTargets.filter(t => t.impact === 'critical').length, 0)
  const deadLeaves = branches.reduce((s, b) => s + b.foliage.deadLeaves, 0)
  const overgrownAreas = branches.reduce((s, b) => s + b.foliage.overgrownAreas, 0)
  const trunkStrength = Math.round(branches.reduce((s, b) => s + b.structure.trunkStrength, 0) / branches.length)
  const canopyBalance = Math.round(branches.reduce((s, b) => s + b.structure.canopyBalance, 0) / branches.length)
  const rootDepth = Math.round(branches.reduce((s, b) => s + b.structure.rootDepth, 0) / branches.length)

  const styleCounts = new Map<string, number>()
  for (const b of branches) {
    styleCounts.set(b.style, (styleCounts.get(b.style) ?? 0) + 1)
  }
  const dominantStyle = Array.from(styleCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'broom'

  const maturityCounts = new Map<string, number>()
  for (const b of branches) {
    maturityCounts.set(b.maturity, (maturityCounts.get(b.maturity) ?? 0) + 1)
  }
  const dominantMaturity = Array.from(maturityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'seedling'

  const masterpieceCount = branches.filter(b => b.condition === 'masterpiece').length
  const overgrownCount = branches.filter(b => b.condition === 'overgrown' || b.condition === 'wild').length
  const deadwoodCount = branches.filter(b => b.condition === 'deadwood').length

  const overallAesthetic = Math.round(branches.reduce((s, b) => s + b.qualityScore, 0) / branches.length)
  const healthStd = Math.sqrt(branches.reduce((s, b) => s + Math.pow(b.branchHealth - avgHealth, 2), 0) / branches.length)
  const isBalanced = healthStd < 25 && canopyBalance > 40

  const needsAttention = totalPruningTargets > 0 || avgHealth < 70
  const attentionLevel = assessAttentionLevel(totalPruningTargets, avgHealth)

  let condition: BonsaiTree['condition']
  if (overallAesthetic >= 80 && totalPruningTargets === 0) condition = 'masterpiece'
  else if (overallAesthetic >= 65) condition = 'well-tended'
  else if (totalPruningTargets >= 8) condition = 'wild-growth'
  else if (overallAesthetic < 30) condition = 'clear-cut'
  else if (totalPruningTargets > 3) condition = 'overgrown'
  else condition = 'needs-work'

  return {
    directory: dirPath,
    branches,
    style: dominantStyle,
    avgHealth,
    avgDensity,
    avgAesthetic,
    totalPruningTargets,
    criticalTargets,
    deadLeaves,
    overgrownAreas,
    trunkStrength,
    canopyBalance,
    rootDepth,
    dominantStyle,
    dominantMaturity,
    masterpieceCount,
    overgrownCount,
    deadwoodCount,
    isBalanced,
    overallAesthetic,
    needsAttention,
    attentionLevel,
    condition,
  }
}

/**
 * Generate recommendations for the bonsai garden
 * @example
 * generateRecommendations(branches, trees, garden, stats) // string[]
 */
export function generateRecommendations(
  branches: BonsaiBranch[],
  trees: BonsaiTree[],
  garden: BonsaiGarden,
  stats: BonsaiTrimStats,
): string[] {
  const recs: string[] = []

  if (garden.totalPruningTargets === 0 && garden.overallAesthetic >= 70) {
    recs.push('Garden is well-tended: no pruning needed, maintain current form')
  }

  if (garden.criticalTargets > 0) {
    recs.push(`Critical: ${garden.criticalTargets} dangerous code patterns need immediate removal`)
  }

  const deadBranches = branches.filter(b => b.foliage.deadLeaves > 0)
  if (deadBranches.length > 0) {
    recs.push(`Dead branches: ${deadBranches.length} files contain dead code that should be removed`)
  }

  const overgrown = branches.filter(b => b.foliage.overgrownAreas > 2)
  if (overgrown.length > 0) {
    recs.push(`Overgrown foliage: ${overgrown.length} files need thinning to improve airflow`)
  }

  const lowCanopy = trees.filter(t => t.canopyBalance < 30)
  if (lowCanopy.length > 0) {
    recs.push(`Poor canopy balance: ${lowCanopy.length} directories have uneven code distribution`)
  }

  if (stats.avgSimplicity < 40) {
    recs.push('Low simplicity: reduce code complexity and remove unnecessary patterns')
  }

  if (stats.avgHarmony < 40) {
    recs.push('Low harmony: improve code consistency and documentation coverage')
  }

  if (stats.deadBranchTargets > 0) {
    recs.push(`Dead branches detected: ${stats.deadBranchTargets} instances of unreachable code`)
  }

  if (stats.suckerTargets > 0) {
    recs.push(`Suckers detected: ${stats.suckerTargets} unnecessary dependencies to remove`)
  }

  if (stats.deadwoodTargets > 0) {
    recs.push(`Deadwood: ${stats.deadwoodTargets} deprecated patterns to clean up`)
  }

  if (stats.thinningTargets > 0) {
    recs.push(`Thinning needed: ${stats.thinningTargets} areas with excessive density`)
  }

  if (stats.easyPrunes > 0) {
    recs.push(`Quick wins: ${stats.easyPrunes} easy pruning tasks available`)
  }

  if (stats.difficultPrunes > 0) {
    recs.push(`Major cuts: ${stats.difficultPrunes} difficult pruning tasks require careful planning`)
  }

  if (stats.overallAesthetic >= 70) {
    recs.push('Aesthetic quality is good: focus on maintaining current form')
  } else if (stats.overallAesthetic >= 40) {
    recs.push('Moderate aesthetic: targeted pruning will improve form significantly')
  } else {
    recs.push('Poor aesthetic: consider substantial refactoring for better form')
  }

  if (stats.overgrown > 0) {
    recs.push(`Overgrown specimens: ${stats.overgrown} files need major pruning`)
  }

  if (stats.masterpieces > 0) {
    recs.push(`Masterpiece specimens: ${stats.masterpieces} files are exemplary, use as templates`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete bonsai trim result from files and contents
 * @example
 * buildBonsaiTrimResult(['a.ts'], ['export function a() {}'], {}) // BonsaiTrimResult
 */
export function buildBonsaiTrimResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): BonsaiTrimResult {
  const branches: BonsaiBranch[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeBonsaiBranch(content, file)
    } catch {
      return analyzeBonsaiBranch('', file)
    }
  })

  const dirMap = new Map<string, BonsaiBranch[]>()
  for (const branch of branches) {
    const dir = branch.file.includes('/') ? branch.file.slice(0, branch.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(branch)
    } else {
      dirMap.set(dir, [branch])
    }
  }

  const trees: BonsaiTree[] = Array.from(dirMap.entries()).map(([dir, bs]) =>
    analyzeBonsaiTree(bs, dir),
  )

  const totalPruningTargets = branches.reduce((s, b) => s + b.pruningOpportunities, 0)
  const criticalTargets = branches.reduce((s, b) => s + b.pruningTargets.filter(t => t.impact === 'critical').length, 0)
  const totalDeadLeaves = branches.reduce((s, b) => s + b.foliage.deadLeaves, 0)
  const totalYellowLeaves = branches.reduce((s, b) => s + b.foliage.yellowLeaves, 0)
  const totalOvergrownAreas = branches.reduce((s, b) => s + b.foliage.overgrownAreas, 0)
  const masterpieceCount = branches.filter(b => b.condition === 'masterpiece').length
  const overgrownCount = branches.filter(b => b.condition === 'overgrown' || b.condition === 'wild').length

  const overallAesthetic = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.qualityScore, 0) / branches.length) : 0
  const gardenHealth = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.branchHealth, 0) / branches.length) : 0

  const garden: BonsaiGarden = {
    totalPruningTargets,
    criticalTargets,
    totalDeadLeaves,
    totalYellowLeaves,
    totalOvergrownAreas,
    masterpieceCount,
    overgrownCount,
    overallAesthetic,
    gardenHealth,
  }

  const avgDensity = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.density, 0) / branches.length) : 0
  const avgHealth = gardenHealth
  const avgAesthetic = overallAesthetic
  const avgSimplicity = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.aesthetic.simplicity, 0) / branches.length) : 0
  const avgElegance = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.aesthetic.elegance, 0) / branches.length) : 0
  const avgProportion = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.aesthetic.proportion, 0) / branches.length) : 0
  const avgHarmony = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.aesthetic.harmony, 0) / branches.length) : 0
  const avgTrunkStrength = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.structure.trunkStrength, 0) / branches.length) : 0
  const avgCanopyBalance = branches.length > 0 ? Math.round(branches.reduce((s, b) => s + b.structure.canopyBalance, 0) / branches.length) : 0

  const allTargets = branches.flatMap(b => b.pruningTargets)
  const deadBranchTargets = allTargets.filter(t => t.type === 'dead-branch').length
  const suckerTargets = allTargets.filter(t => t.type === 'sucker').length
  const thinningTargets = allTargets.filter(t => t.type === 'thinning').length
  const deadwoodTargets = allTargets.filter(t => t.type === 'deadwood').length
  const easyPrunes = allTargets.filter(t => t.effort === 'easy').length
  const difficultPrunes = allTargets.filter(t => t.effort === 'difficult' || t.effort === 'major-refactor').length
  const totalGreenLeaves = branches.reduce((s, b) => s + b.foliage.greenLeaves, 0)
  const masterpieces = masterpieceCount
  const overgrown = overgrownCount
  const deadwood = branches.filter(b => b.condition === 'deadwood').length

  const bestBranch = branches.length > 0
    ? branches.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best, branches[0]).file
    : 'none'
  const worstBranch = branches.length > 0
    ? branches.reduce((worst, b) => b.qualityScore < worst.qualityScore ? b : worst, branches[0]).file
    : 'none'
  const mostPruningNeeded = branches.length > 0
    ? branches.reduce((m, b) => b.pruningOpportunities > m.pruningOpportunities ? b : m, branches[0]).file
    : 'none'
  const mostElegant = branches.length > 0
    ? branches.reduce((m, b) => b.aesthetic.elegance > m.aesthetic.elegance ? b : m, branches[0]).file
    : 'none'

  const stats: BonsaiTrimStats = {
    totalFiles: files.length,
    totalTrees: trees.length,
    avgDensity,
    avgHealth,
    avgAesthetic,
    avgSimplicity,
    avgElegance,
    avgProportion,
    avgHarmony,
    avgTrunkStrength,
    avgCanopyBalance,
    totalPruningTargets,
    deadBranchTargets,
    suckerTargets,
    thinningTargets,
    deadwoodTargets,
    totalDeadLeaves,
    totalGreenLeaves,
    masterpieces,
    overgrown,
    deadwood,
    easyPrunes,
    difficultPrunes,
    overallAesthetic,
    gardenerGrade: classifyGardenerGrade(overallAesthetic),
    bestBranch,
    worstBranch,
    mostPruningNeeded,
    mostElegant,
  }

  const recommendations = generateRecommendations(branches, trees, garden, stats)

  void options

  return { branches, trees, garden, stats, recommendations }
}
