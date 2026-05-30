// ─── Interfaces ──────────────────────────────────────────

export interface PanelDimensions {
  width: number
  height: number
  depth: number
}

export interface MuralPanel {
  file: string
  panelType: 'masterpiece' | 'detailed' | 'sketched' | 'rough' | 'blank' | 'damaged' | 'restored'
  detailLevel: number
  colorRichness: number
  compositionalWeight: number
  connectionsToAdjacent: number
  thematicRole: 'focal-point' | 'supporting' | 'background' | 'transition' | 'ornamental' | 'structural'
  preservation: number
  dimensions: PanelDimensions
  issues: string[]
}

export interface MuralSection {
  directory: string
  panels: MuralPanel[]
  sectionType: 'gallery' | 'gallery-wall' | 'fresco' | 'graffiti' | 'blank-wall' | 'mosaic' | 'collage'
  coherence: number
  balance: number
  dominantTheme: string
  secondaryThemes: string[]
  avgDetailLevel: number
  totalWeight: number
  gaps: number
  overlaps: number
  health: 'pristine' | 'well-maintained' | 'weathering' | 'deteriorating' | 'crumbling' | 'ruins'
}

export interface OverallComposition {
  totalPanels: number
  totalWalls: number
  avgDetail: number
  avgCoherence: number
  avgBalance: number
  masterpiecePanels: number
  roughPanels: number
  damagedPanels: number
  blankPanels: number
  totalGaps: number
  totalOverlaps: number
  compositionScore: number
  dominantStyle: 'classical' | 'modern' | 'minimalist' | 'baroque' | 'abstract' | 'mixed' | 'chaotic'
  structuralIntegrity: number
  artisticMerit: number
  restorationNeeds: string[]
}

export interface MuralMuralResult {
  panels: MuralPanel[]
  sections: MuralSection[]
  composition: OverallComposition
  stats: {
    totalFiles: number
    totalSections: number
    avgPanelDetail: number
    masterpieceCount: number
    damagedCount: number
    blankCount: number
    totalGaps: number
    totalOverlaps: number
    compositionScore: number
    structuralIntegrity: number
    artisticMerit: number
    dominantStyle: string
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    restorationPriority: string
  }
  recommendations: string[]
}

// ─── Regex Helpers ───────────────────────────────────────

const FUNCTION_RE = /(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\(|=>\s*(?:\{|[^{]*$))/gm
const CLASS_RE = /\bclass\s+\w+/g
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*(?:\{|=)/g
const ENUM_RE = /\benum\s+\w+/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TODO_FIXME_RE = /(?:TODO|FIXME|HACK|XXX)\b/gi
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const ANY_TYPE_RE = /:\s*any\b/
const ASYNC_RE = /\basync\s+/
const GENERIC_RE = /<\w+>/
const DECORATOR_RE = /@\w+/

// ─── countConstructs ─────────────────────────────────────

/**
 * Count distinct code construct types in content
 * @example
 * countConstructTypes('class Foo {}') // Set of construct names
 */
export function countConstructTypes(content: string): Set<string> {
  const types = new Set<string>()
  if (FUNCTION_RE.test(content)) types.add('function')
  FUNCTION_RE.lastIndex = 0
  if (CLASS_RE.test(content)) types.add('class')
  CLASS_RE.lastIndex = 0
  if (INTERFACE_RE.test(content)) types.add('interface')
  INTERFACE_RE.lastIndex = 0
  if (ENUM_RE.test(content)) types.add('enum')
  ENUM_RE.lastIndex = 0
  if (ASYNC_RE.test(content)) types.add('async')
  if (GENERIC_RE.test(content)) types.add('generic')
  if (DECORATOR_RE.test(content)) types.add('decorator')
  return types
}

// ─── analyzePanel ────────────────────────────────────────

/**
 * Analyze a file as a mural panel
 * @example
 * analyzePanel('export function foo() {}', 'foo.ts') // MuralPanel
 */
export function analyzePanel(content: string, filePath: string): MuralPanel {
  const lines = content.split('\n')
  const issues: string[] = []

  // Detail level: variety of constructs and documentation
  const constructTypes = countConstructTypes(content)
  const constructScore = Math.min(40, constructTypes.size * 10)
  const hasDocs = (content.match(JSDOC_RE) ?? []).length
  const docScore = Math.min(30, hasDocs * 10)
  const hasTypes = TYPE_ANNOTATION_RE.test(content) ? 20 : 0
  const hasComments = (content.match(COMMENT_RE) ?? []).length > 0 ? 10 : 0
  const detailLevel = Math.min(100, constructScore + docScore + hasTypes + hasComments)

  // Color richness: variety of syntactic constructs
  const colorRichness = Math.min(100, constructTypes.size * 20)

  // Compositional weight: size + exports + complexity
  EXPORT_RE.lastIndex = 0
  const exportCount = (content.match(EXPORT_RE) ?? []).length
  IMPORT_RE.lastIndex = 0
  const importCount = (content.match(IMPORT_RE) ?? []).length
  const lineCount = lines.length
  const compositionalWeight = Math.min(100, lineCount + exportCount * 10 + importCount * 5)

  // Connections to adjacent
  const connectionsToAdjacent = importCount + exportCount

  // Dimensions
  const width = Math.min(100, lineCount)
  FUNCTION_RE.lastIndex = 0
  const funcCount = (content.match(FUNCTION_RE) ?? []).length
  const height = Math.min(100, funcCount * 20)
  let maxDepth = 0
  for (const line of lines) {
    const indent = line.match(/^(\s*)/)?.[1] ?? ''
    const depth = Math.floor(indent.length / 2)
    if (depth > maxDepth) maxDepth = depth
  }
  const depth = Math.min(100, maxDepth * 15)

  // Preservation
  let preservation = 70
  const todoCount = (content.match(TODO_FIXME_RE) ?? []).length
  preservation -= Math.min(20, todoCount * 5)
  if (ANY_TYPE_RE.test(content)) { preservation -= 10; issues.push('Uses any type') }
  if (lineCount > 500) { preservation -= 10; issues.push('Very long file') }
  if (hasDocs === 0 && funcCount > 0) { preservation -= 10; issues.push('No documentation') }
  preservation = Math.max(0, Math.min(100, preservation))

  // Thematic role
  const thematicRole = classifyThematicRole(compositionalWeight, exportCount, detailLevel, filePath)

  // Panel type
  const panelType = classifyPanelType(detailLevel, preservation, content)

  return {
    colorRichness,
    compositionalWeight,
    connectionsToAdjacent,
    detailLevel,
    dimensions: { depth, height, width },
    file: filePath,
    issues,
    panelType,
    preservation,
    thematicRole,
  }
}

function classifyThematicRole(
  weight: number,
  exports: number,
  detail: number,
  filePath: string,
): MuralPanel['thematicRole'] {
  if (filePath.endsWith('index.ts') || filePath.endsWith('index.js')) return 'structural'
  if (filePath.includes('test') || filePath.includes('spec')) return 'background'
  if (weight >= 80 && exports >= 5) return 'focal-point'
  if (detail >= 70 && weight >= 50) return 'supporting'
  if (weight < 20) return 'ornamental'
  return 'transition'
}

function classifyPanelType(
  detail: number,
  preservation: number,
  content: string,
): MuralPanel['panelType'] {
  if (content.trim().length === 0) return 'blank'
  if (detail >= 80 && preservation >= 80) return 'masterpiece'
  if (detail >= 60 && preservation >= 60) return 'detailed'
  if (detail >= 40) return 'sketched'
  if (preservation < 40) return 'damaged'
  if (detail < 30 && preservation < 50) return 'rough'
  return 'restored'
}

// ─── analyzeSection ──────────────────────────────────────

/**
 * Analyze a directory section as a mural wall
 * @example
 * analyzeSection([panel1, panel2], 'src/utils') // MuralSection
 */
export function analyzeSection(panels: MuralPanel[], dirPath: string): MuralSection {
  if (panels.length === 0) {
    return {
      avgDetailLevel: 0,
      balance: 100,
      coherence: 100,
      dominantTheme: 'empty',
      gaps: 0,
      health: 'pristine',
      overlaps: 0,
      panels: [],
      secondaryThemes: [],
      sectionType: 'blank-wall',
      totalWeight: 0,
      directory: dirPath,
    }
  }

  const avgDetailLevel = Math.round(panels.reduce((s, p) => s + p.detailLevel, 0) / panels.length)
  const totalWeight = panels.reduce((s, p) => s + p.compositionalWeight, 0)

  // Coherence: how consistent are the panels
  const detailStd = computeStdDev(panels.map((p) => p.detailLevel))
  const coherence = Math.max(0, Math.min(100, 100 - detailStd))

  // Balance: even distribution of weight
  const weightStd = computeStdDev(panels.map((p) => p.compositionalWeight))
  const balance = Math.max(0, Math.min(100, 100 - weightStd * 0.5))

  // Themes from thematic roles
  const roleCounts = new Map<string, number>()
  for (const p of panels) {
    roleCounts.set(p.thematicRole, (roleCounts.get(p.thematicRole) ?? 0) + 1)
  }
  const sorted = Array.from(roleCounts.entries()).sort((a, b) => b[1] - a[1])
  const dominantTheme = sorted[0]?.[0] ?? 'mixed'
  const secondaryThemes = sorted.slice(1, 3).map(([k]) => k)

  // Gaps: blank or very low-detail panels
  const gaps = panels.filter((p) => p.panelType === 'blank' || p.panelType === 'rough').length

  // Overlaps: files with very high coupling to same sources
  const overlaps = Math.max(0, panels.filter((p) => p.connectionsToAdjacent > 10).length - 1)

  const sectionType = classifySectionType(avgDetailLevel, coherence, panels)
  const health = classifySectionHealth(panels)

  return {
    avgDetailLevel,
    balance,
    coherence,
    dominantTheme,
    gaps,
    health,
    overlaps,
    panels,
    secondaryThemes,
    sectionType,
    totalWeight,
    directory: dirPath,
  }
}

function computeStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function classifySectionType(
  avgDetail: number,
  coherence: number,
  panels: MuralPanel[],
): MuralSection['sectionType'] {
  if (panels.length === 0) return 'blank-wall'
  if (avgDetail >= 70 && coherence >= 70) return 'gallery'
  if (avgDetail >= 60 && coherence >= 50) return 'gallery-wall'
  if (avgDetail >= 50 && coherence >= 60) return 'fresco'
  if (avgDetail < 30) return 'graffiti'
  if (coherence < 30) return 'collage'
  const types = new Set(panels.map((p) => p.panelType))
  if (types.size >= 4) return 'mosaic'
  return 'collage'
}

function classifySectionHealth(panels: MuralPanel[]): MuralSection['health'] {
  const avgPreservation = panels.reduce((s, p) => s + p.preservation, 0) / panels.length
  const damagedRatio = panels.filter((p) => p.panelType === 'damaged' || p.panelType === 'rough').length / panels.length

  if (avgPreservation >= 80 && damagedRatio < 0.1) return 'pristine'
  if (avgPreservation >= 65 && damagedRatio < 0.2) return 'well-maintained'
  if (avgPreservation >= 50) return 'weathering'
  if (avgPreservation >= 35) return 'deteriorating'
  if (avgPreservation >= 20) return 'crumbling'
  return 'ruins'
}

// ─── classifyDominantStyle ───────────────────────────────

/**
 * Classify dominant style of the codebase mural
 * @example
 * classifyDominantStyle(panels, sections) // 'classical'
 */
export function classifyDominantStyle(
  panels: MuralPanel[],
  sections: MuralSection[],
): OverallComposition['dominantStyle'] {
  if (panels.length === 0) return 'minimalist'

  const avgDetail = panels.reduce((s, p) => s + p.detailLevel, 0) / panels.length
  const avgCoherence = sections.length > 0
    ? sections.reduce((s, sec) => s + sec.coherence, 0) / sections.length
    : 50
  const constructVariety = panels.reduce((s, p) => s + p.colorRichness, 0) / panels.length

  if (avgDetail >= 70 && avgCoherence >= 70 && constructVariety >= 60) return 'classical'
  if (avgDetail >= 60 && constructVariety >= 50) return 'modern'
  if (avgDetail < 30) return 'minimalist'
  if (avgDetail >= 60 && constructVariety >= 80) return 'baroque'
  if (avgCoherence < 30) return 'chaotic'
  if (constructVariety < 30) return 'abstract'
  return 'mixed'
}

// ─── computeStructuralIntegrity ──────────────────────────

/**
 * Compute structural integrity of the mural (0-100)
 * @example
 * computeStructuralIntegrity(sections) // 75
 */
export function computeStructuralIntegrity(sections: MuralSection[]): number {
  if (sections.length === 0) return 100
  const avgCoherence = sections.reduce((s, sec) => s + sec.coherence, 0) / sections.length
  const avgBalance = sections.reduce((s, sec) => s + sec.balance, 0) / sections.length
  const gapRatio = sections.reduce((s, sec) => s + sec.gaps, 0) /
    Math.max(1, sections.reduce((s, sec) => s + sec.panels.length, 0))
  return Math.round(Math.max(0, Math.min(100,
    avgCoherence * 0.4 + avgBalance * 0.4 + (1 - gapRatio) * 20,
  )))
}

// ─── computeArtisticMerit ───────────────────────────────

/**
 * Compute artistic merit score (0-100)
 * @example
 * computeArtisticMerit(panels, sections) // 65
 */
export function computeArtisticMerit(panels: MuralPanel[], sections: MuralSection[]): number {
  if (panels.length === 0) return 0

  const avgDetail = panels.reduce((s, p) => s + p.detailLevel, 0) / panels.length
  const avgRichness = panels.reduce((s, p) => s + p.colorRichness, 0) / panels.length
  const masterpieceRatio = panels.filter((p) => p.panelType === 'masterpiece').length / panels.length

  return Math.round(Math.max(0, Math.min(100,
    avgDetail * 0.3 + avgRichness * 0.3 + masterpieceRatio * 100 * 0.2 + (sections.length > 1 ? 20 : 10),
  )))
}

// ─── identifyRestorationNeeds ────────────────────────────

/**
 * Identify what needs restoration in the mural
 * @example
 * identifyRestorationNeeds(panels, sections) // ['Fix damaged panel: foo.ts']
 */
export function identifyRestorationNeeds(
  panels: MuralPanel[],
  sections: MuralSection[],
): string[] {
  const needs: string[] = []

  const damaged = panels.filter((p) => p.panelType === 'damaged')
  if (damaged.length > 0) {
    needs.push(`Restore ${damaged.length} damaged panel(s): ${damaged.slice(0, 3).map((p) => p.file).join(', ')}`)
  }

  const crumbling = sections.filter((s) => s.health === 'crumbling' || s.health === 'ruins')
  if (crumbling.length > 0) {
    needs.push(`Rebuild crumbling section(s): ${crumbling.map((s) => s.directory).join(', ')}`)
  }

  const gaps = sections.filter((s) => s.gaps > 0)
  if (gaps.length > 0) {
    needs.push(`Fill gaps in ${gaps.length} section(s) with missing implementations`)
  }

  const blank = panels.filter((p) => p.panelType === 'blank')
  if (blank.length > 0) {
    needs.push(`Remove or populate ${blank.length} blank panel(s)`)
  }

  return needs
}

// ─── computeCompositionScore ─────────────────────────────

/**
 * Compute overall composition score (0-100)
 * @example
 * computeCompositionScore(avgDetail, avgCoherence, integrity, merit) // 72
 */
export function computeCompositionScore(
  avgDetail: number,
  avgCoherence: number,
  integrity: number,
  merit: number,
): number {
  return Math.round(avgDetail * 0.25 + avgCoherence * 0.25 + integrity * 0.25 + merit * 0.25)
}

// ─── computeHealthGrade ──────────────────────────────────

/**
 * Compute health grade from composition score
 * @example
 * computeHealthGrade(85) // 'A'
 */
export function computeHealthGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 80) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  if (score >= 35) return 'D'
  return 'F'
}

// ─── generateRecommendations ────────────────────────────

/**
 * Generate recommendations for mural improvement
 * @example
 * generateRecommendations(composition, sections, panels) // ['Add documentation...']
 */
export function generateRecommendations(
  composition: OverallComposition,
  sections: MuralSection[],
  _panels: MuralPanel[],
): string[] {
  const recs: string[] = []

  if (composition.damagedPanels > 0) {
    recs.push(`Repair ${composition.damagedPanels} damaged panel(s) to improve structural integrity`)
  }

  if (composition.totalGaps > 0) {
    recs.push(`Fill ${composition.totalGaps} gap(s) in the mural with proper implementations`)
  }

  if (composition.dominantStyle === 'chaotic') {
    recs.push('Establish consistent coding patterns to bring coherence to the codebase mural')
  }

  const lowDetail = sections.filter((s) => s.avgDetailLevel < 40)
  if (lowDetail.length > 0) {
    recs.push(`Enhance detail in ${lowDetail.length} low-detail section(s): add types, docs, and structure`)
  }

  if (composition.structuralIntegrity < 50) {
    recs.push('Improve structural integrity by balancing file sizes and responsibilities across sections')
  }

  if (composition.artisticMerit < 40) {
    recs.push('Boost artistic merit: add more construct variety, documentation, and clear interfaces')
  }

  return recs
}

// ─── buildMosaicMuralResult ──────────────────────────────

/**
 * Build the full mosaic mural analysis result
 * @example
 * buildMosaicMuralResult(['foo.ts'], ['export function foo(): void {}'], {}) // MuralMuralResult
 */
export function buildMosaicMuralResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MuralMuralResult {
  // Build panels
  const panels: MuralPanel[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    panels.push(analyzePanel(contents[i] ?? '', file))
  }

  // Group panels by directory into sections
  const dirMap = new Map<string, MuralPanel[]>()
  for (const panel of panels) {
    const dir = panel.file.includes('/')
      ? panel.file.substring(0, panel.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(panel)
    else dirMap.set(dir, [panel])
  }

  const sections: MuralSection[] = []
  for (const [dir, dirPanels] of dirMap) {
    sections.push(analyzeSection(dirPanels, dir))
  }

  // Overall composition
  const avgDetail = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.detailLevel, 0) / panels.length)
    : 0
  const avgCoherence = sections.length > 0
    ? Math.round(sections.reduce((s, sec) => s + sec.coherence, 0) / sections.length)
    : 100
  const avgBalance = sections.length > 0
    ? Math.round(sections.reduce((s, sec) => s + sec.balance, 0) / sections.length)
    : 100

  const structuralIntegrity = computeStructuralIntegrity(sections)
  const artisticMerit = computeArtisticMerit(panels, sections)
  const compositionScore = computeCompositionScore(avgDetail, avgCoherence, structuralIntegrity, artisticMerit)
  const dominantStyle = classifyDominantStyle(panels, sections)
  const restorationNeeds = identifyRestorationNeeds(panels, sections)

  const composition: OverallComposition = {
    artisticMerit,
    avgBalance,
    avgCoherence,
    avgDetail,
    blankPanels: panels.filter((p) => p.panelType === 'blank').length,
    compositionScore,
    damagedPanels: panels.filter((p) => p.panelType === 'damaged').length,
    dominantStyle,
    masterpiecePanels: panels.filter((p) => p.panelType === 'masterpiece').length,
    restorationNeeds,
    roughPanels: panels.filter((p) => p.panelType === 'rough').length,
    structuralIntegrity,
    totalGaps: sections.reduce((s, sec) => s + sec.gaps, 0),
    totalOverlaps: sections.reduce((s, sec) => s + sec.overlaps, 0),
    totalPanels: panels.length,
    totalWalls: sections.length,
  }

  const healthGrade = computeHealthGrade(compositionScore)

  // Restoration priority: section with worst health
  const worstSection = sections.length > 0 && sections[0]
    ? sections.reduce((worst, sec) => {
        const healthRank: Record<string, number> = { pristine: 5, 'well-maintained': 4, weathering: 3, deteriorating: 2, crumbling: 1, ruins: 0 }
        return (healthRank[sec.health] ?? 3) < (healthRank[worst.health] ?? 3) ? sec : worst
      }, sections[0])
    : undefined

  const recommendations = generateRecommendations(composition, sections, panels)

  return {
    composition,
    panels,
    recommendations,
    sections,
    stats: {
      artisticMerit,
      avgPanelDetail: avgDetail,
      blankCount: composition.blankPanels,
      compositionScore,
      damagedCount: composition.damagedPanels,
      dominantStyle,
      healthGrade,
      masterpieceCount: composition.masterpiecePanels,
      restorationPriority: worstSection?.directory ?? '',
      structuralIntegrity,
      totalFiles: files.length,
      totalGaps: composition.totalGaps,
      totalOverlaps: composition.totalOverlaps,
      totalSections: sections.length,
    },
  }
}
