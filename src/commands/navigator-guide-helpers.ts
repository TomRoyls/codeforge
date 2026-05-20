// ─── Types ────────────────────────────────────────────────────────────────────

export interface GuideSection {
  title: string
  description: string
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
  readingTime: string
  files: string[]
  isRequired: boolean
  prerequisites: string[]
}

export interface Attraction {
  name: string
  file: string
  type: 'must-see' | 'recommended' | 'optional' | 'skip' | 'under-construction'
  category: 'architecture' | 'core-logic' | 'utilities' | 'data-models' | 'configuration' | 'testing' | 'output'
  significance: number
  description: string
  visitDuration: string
  highlights: string[]
  warnings: string[]
}

export interface TourStop {
  order: number
  attraction: string
  file: string
  action: 'read' | 'study' | 'skim' | 'reference'
  notes: string
  timeToSpend: string
}

export interface TourRoute {
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  stops: TourStop[]
  isSelfGuided: boolean
  rating: number
}

export interface ConstructionZone {
  area: string
  type: 'active-refactor' | 'tech-debt' | 'incomplete-feature' | 'deprecated'
  severity: 'minor' | 'moderate' | 'major'
  description: string
  affectedRoutes: string[]
  alternative: string
}

export interface OnboardingScore {
  overall: number
  documentation: number
  structure: number
  naming: number
  complexity: number
  entryClarity: number
  grade: 'exceptional' | 'excellent' | 'good' | 'fair' | 'poor' | 'hostile'
}

export interface NavigatorGuideStats {
  totalSections: number
  totalAttractions: number
  mustSeeCount: number
  underConstructionCount: number
  totalRoutes: number
  beginnerRoutes: number
  constructionZones: number
  majorConstructionZones: number
  estimatedOnboardingTime: string
  onboardingGrade: string
  guideCompleteness: number
  overallAccessibility: number
  recommendedTour: string
  guideRating: 'five-stars' | 'four-stars' | 'three-stars' | 'two-stars' | 'one-star'
}

export interface NavigatorGuideResult {
  sections: GuideSection[]
  attractions: Attraction[]
  routes: TourRoute[]
  constructionZones: ConstructionZone[]
  onboarding: OnboardingScore
  stats: NavigatorGuideStats
  recommendations: string[]
}

// ─── Guide Section Organization ────────────────────────────────────────────────

/**
 * Organize files into logical guide sections
 * @example
 * organizeGuideSections(['src/core/a.ts'], ['code']) // GuideSection[]
 */
export function organizeGuideSections(files: string[], contents: string[]): GuideSection[] {
  const sections: GuideSection[] = []
  const byDir = new Map<string, Array<{ file: string; content: string }>>()

  for (let i = 0; i < files.length; i++) {
    const dir = files[i].split('/').slice(0, -1).join('/') || 'root'
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir)!.push({ file: files[i], content: contents[i] })
  }

  for (const [dir, dirFiles] of byDir) {
    const totalLines = dirFiles.reduce((s, f) => s + f.content.split('\n').length, 0)
    const hasDocs = dirFiles.some(f => /\/\*\*|\/\//.test(f.content))
    const hasExports = dirFiles.some(f => /export\s+/.test(f.content))
    const hasTypes = dirFiles.some(f => /interface|type\s+\w+\s*=/.test(f.content))
    const hasTests = dirFiles.some(f => /test\(|describe\(|it\(/.test(f.content))

    let difficulty: GuideSection['difficulty'] = 'easy'
    if (totalLines > 200 || dirFiles.length > 5) difficulty = 'moderate'
    if (totalLines > 500) difficulty = 'challenging'
    if (totalLines > 1000) difficulty = 'expert'

    const minutes = Math.max(1, Math.round(totalLines / 30))

    const title = dir === 'root' ? 'Root Files' : dir.split('/').pop() || dir
    let description = `Files in ${dir}`
    if (hasExports && hasTypes) description = `Core module with types and exports`
    else if (hasTests) description = `Test suite directory`
    else if (hasDocs) description = `Well-documented module`

    const isRequired = hasExports && !hasTests

    sections.push({
      title,
      description,
      difficulty,
      readingTime: `${minutes} min`,
      files: dirFiles.map(f => f.file),
      isRequired,
      prerequisites: [],
    })
  }

  sections.sort((a, b) => {
    const diffOrder = { easy: 0, moderate: 1, challenging: 2, expert: 3 }
    if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1
    return diffOrder[a.difficulty] - diffOrder[b.difficulty]
  })

  for (let i = 1; i < sections.length; i++) {
    if (sections[i].difficulty !== 'easy') {
      sections[i].prerequisites.push(sections[0].title)
    }
  }

  return sections
}

// ─── Attraction Identification ─────────────────────────────────────────────────

/**
 * Identify key attractions in the codebase
 * @example
 * identifyAttractions(['index.ts'], ['export main() {}']) // Attraction[]
 */
export function identifyAttractions(files: string[], contents: string[]): Attraction[] {
  const attractions: Attraction[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const content = contents[i]
    const name = filePath.split('/').pop() || filePath
    const lines = content.split('\n').length
    const exports = (content.match(/export\s+/g) || []).length
    const hasDocs = /\/\*\*/.test(content)
    const hasTodos = /TODO|FIXME|HACK|XXX/i.test(content)
    const hasTests = /describe\(|test\(|it\(/.test(content)
    const hasTypes = /interface\s+\w+|type\s+\w+\s*=/.test(content)

    let type: Attraction['type'] = 'optional'
    let category: Attraction['category'] = 'utilities'
    let significance = 30
    const highlights: string[] = []
    const warnings: string[] = []

    if (/index\.(ts|js)$/.test(name) || /main\.(ts|js)$/.test(name) || /app\.(ts|js)$/.test(name)) {
      type = 'must-see'
      category = 'architecture'
      significance = 95
      highlights.push('Entry point for the application')
    } else if (exports >= 5) {
      type = 'must-see'
      category = 'core-logic'
      significance = 85
      highlights.push(`${exports} exported symbols`)
    } else if (exports >= 2) {
      type = 'recommended'
      category = 'core-logic'
      significance = 65
      highlights.push(`${exports} exports`)
    }

    if (hasTypes && category === 'utilities') {
      category = 'data-models'
      highlights.push('Contains type definitions')
    }

    if (hasTests) {
      category = 'testing'
      if (type === 'optional') {
        type = 'recommended'
        significance = 55
      }
      highlights.push('Contains test cases')
    }

    if (/config|settings|constants/i.test(name)) {
      category = 'configuration'
      type = type === 'optional' ? 'recommended' : type
      significance = Math.max(significance, 50)
      highlights.push('Configuration file')
    }

    if (/format|render|display|output|print/i.test(name)) {
      category = 'output'
      highlights.push('Output/formatting logic')
    }

    if (hasTodos) {
      type = 'under-construction'
      warnings.push('Contains TODO/FIXME markers')
    }

    if (hasDocs) highlights.push('Well documented')
    if (lines > 300) warnings.push('Large file — consider skimming first')

    const minutes = Math.max(1, Math.round(lines / 40))

    attractions.push({
      name,
      file: filePath,
      type,
      category,
      significance,
      description: `${category} file: ${filePath} (${lines} lines, ${exports} exports)`,
      visitDuration: `${minutes} min`,
      highlights,
      warnings,
    })
  }

  return attractions.sort((a, b) => b.significance - a.significance)
}

// ─── Tour Route Generation ────────────────────────────────────────────────────

/**
 * Generate tour routes for navigating the codebase
 * @example
 * generateTourRoutes(sections, attractions) // TourRoute[]
 */
export function generateTourRoutes(sections: GuideSection[], attractions: Attraction[]): TourRoute[] {
  const routes: TourRoute[] = []

  const mustSee = attractions.filter(a => a.type === 'must-see')
  const recommended = attractions.filter(a => a.type === 'recommended')
  const entryPoints = attractions.filter(a => a.category === 'architecture')
  const dataModels = attractions.filter(a => a.category === 'data-models')
  const testFiles = attractions.filter(a => a.category === 'testing')

  if (mustSee.length > 0) {
    const stops: TourStop[] = mustSee.map((a, idx) => ({
      order: idx + 1,
      attraction: a.name,
      file: a.file,
      action: 'study' as const,
      notes: a.highlights.join('; ') || 'Key file to understand',
      timeToSpend: a.visitDuration,
    }))
    const totalMin = mustSee.reduce((s, a) => s + parseInt(a.visitDuration) || 2, 0)
    routes.push({
      name: 'New Developer Tour',
      description: 'Essential files every developer should understand first',
      difficulty: 'beginner',
      estimatedTime: `${totalMin} min`,
      stops,
      isSelfGuided: mustSee.every(a => a.highlights.length > 0),
      rating: mustSee.every(a => a.warnings.length === 0) ? 90 : 70,
    })
  }

  if (entryPoints.length > 0 || recommended.length > 0) {
    const stops: TourStop[] = [
      ...entryPoints.map((a, idx) => ({
        order: idx + 1, attraction: a.name, file: a.file,
        action: 'study' as const, notes: 'Start here to understand the flow', timeToSpend: a.visitDuration,
      })),
      ...recommended.slice(0, 5).map((a, idx) => ({
        order: entryPoints.length + idx + 1, attraction: a.name, file: a.file,
        action: 'read' as const, notes: a.highlights.join('; ') || 'Important module', timeToSpend: a.visitDuration,
      })),
    ]
    routes.push({
      name: 'Codebase Deep Dive',
      description: 'Comprehensive tour through architecture and core logic',
      difficulty: 'intermediate',
      estimatedTime: `${stops.reduce((s, st) => s + parseInt(st.timeToSpend) || 2, 0)} min`,
      stops,
      isSelfGuided: true,
      rating: 75,
    })
  }

  if (dataModels.length > 0) {
    const stops: TourStop[] = dataModels.map((a, idx) => ({
      order: idx + 1, attraction: a.name, file: a.file,
      action: 'reference' as const, notes: 'Type definitions and data structures', timeToSpend: a.visitDuration,
    }))
    routes.push({
      name: 'API and Data Tour',
      description: 'Explore public interfaces and data models',
      difficulty: 'beginner',
      estimatedTime: `${stops.reduce((s, st) => s + parseInt(st.timeToSpend) || 1, 0)} min`,
      stops,
      isSelfGuided: true,
      rating: 80,
    })
  }

  if (testFiles.length > 0) {
    const stops: TourStop[] = testFiles.slice(0, 5).map((a, idx) => ({
      order: idx + 1, attraction: a.name, file: a.file,
      action: 'skim' as const, notes: 'Understand expected behavior', timeToSpend: '2 min',
    }))
    routes.push({
      name: 'Testing Patterns Tour',
      description: 'Learn the testing conventions and patterns',
      difficulty: 'advanced',
      estimatedTime: `${stops.length * 2} min`,
      stops,
      isSelfGuided: true,
      rating: 65,
    })
  }

  return routes
}

// ─── Construction Zone Detection ────────────────────────────────────────────────

/**
 * Detect construction zones (active/problem areas)
 * @example
 * detectConstructionZones(['a.ts'], ['// TODO: fix']) // ConstructionZone[]
 */
export function detectConstructionZones(files: string[], contents: string[]): ConstructionZone[] {
  const zones: ConstructionZone[] = []
  const byDir = new Map<string, Array<{ file: string; content: string }>>()

  for (let i = 0; i < files.length; i++) {
    const dir = files[i].split('/').slice(0, -1).join('/') || 'root'
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir)!.push({ file: files[i], content: contents[i] })
  }

  for (const [dir, dirFiles] of byDir) {
    const combined = dirFiles.map(f => f.content).join('\n')

    const todoCount = (combined.match(/TODO/gi) || []).length
    const fixmeCount = (combined.match(/FIXME/gi) || []).length
    const hackCount = (combined.match(/HACK|XXX/gi) || []).length
    const deprecated = (combined.match(/@deprecated|DEPRECATED/gi) || []).length

    if (todoCount + fixmeCount >= 3) {
      zones.push({
        area: dir,
        type: 'tech-debt',
        severity: fixmeCount >= 2 ? 'major' : 'moderate',
        description: `${dir} has ${todoCount} TODOs and ${fixmeCount} FIXMEs`,
        affectedRoutes: [],
        alternative: 'Focus on documented, stable areas first',
      })
    }

    if (hackCount >= 2) {
      zones.push({
        area: dir,
        type: 'active-refactor',
        severity: 'moderate',
        description: `${dir} has ${hackCount} HACK/XXX markers indicating workarounds`,
        affectedRoutes: [],
        alternative: 'Be aware these patterns may change',
      })
    }

    if (deprecated >= 1) {
      zones.push({
        area: dir,
        type: 'deprecated',
        severity: 'minor',
        description: `${dir} contains deprecated code`,
        affectedRoutes: [],
        alternative: 'Look for newer equivalents in other areas',
      })
    }

    const incomplete = dirFiles.filter(f => /\/\//.test(f.content) && f.content.split('\n').length < 5)
    if (incomplete.length >= 2) {
      zones.push({
        area: dir,
        type: 'incomplete-feature',
        severity: 'minor',
        description: `${dir} has ${incomplete.length} minimal or stub files`,
        affectedRoutes: [],
        alternative: 'Skip these files during initial onboarding',
      })
    }
  }

  return zones
}

// ─── Score Computation ─────────────────────────────────────────────────────────

/**
 * Compute onboarding score (0-100)
 * @example
 * computeOnboardingScore(files, contents, sections, attractions) // OnboardingScore
 */
export function computeOnboardingScore(
  files: string[],
  contents: string[],
  sections: GuideSection[],
  attractions: Attraction[],
): OnboardingScore {
  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)
  const docLines = contents.reduce((s, c) => s + c.split('\n').filter(l => /\/\//.test(l.trim())).length, 0)
  const documentation = totalLines > 0 ? Math.min(100, Math.round((docLines / totalLines) * 200)) : 100

  const dirCount = Array.from(new Set(files.map(f => f.split('/').slice(0, -1).join('/') || 'root'))).length
  const structure = files.length > 0 ? Math.min(100, Math.round(80 - (dirCount > 10 ? 20 : 0) + (sections.length > 0 ? 20 : 0))) : 100

  const goodNames = files.filter(f => /^[a-z][a-z0-9-]*\.\w+$/.test(f.split('/').pop() || '')).length
  const naming = files.length > 0 ? Math.round((goodNames / files.length) * 100) : 100

  const avgLines = totalLines / Math.max(1, files.length)
  const complexity = Math.max(0, Math.min(100, Math.round(100 - (avgLines > 200 ? 30 : 0) - (avgLines > 400 ? 30 : 0))))

  const hasEntry = attractions.some(a => a.category === 'architecture')
  const entryClarity = hasEntry ? 80 : 30

  const overall = Math.round(documentation * 0.25 + structure * 0.2 + naming * 0.15 + complexity * 0.2 + entryClarity * 0.2)

  let grade: OnboardingScore['grade'] = 'fair'
  if (overall >= 85) grade = 'exceptional'
  else if (overall >= 70) grade = 'excellent'
  else if (overall >= 55) grade = 'good'
  else if (overall >= 40) grade = 'fair'
  else if (overall >= 25) grade = 'poor'
  else grade = 'hostile'

  return { overall, documentation, structure, naming, complexity, entryClarity, grade }
}

/**
 * Compute guide completeness (0-100)
 * @example
 * computeGuideCompleteness(sections, attractions, routes) // 75
 */
export function computeGuideCompleteness(sections: GuideSection[], attractions: Attraction[], routes: TourRoute[]): number {
  let score = 30
  if (sections.length > 0) score += 20
  if (sections.some(s => s.isRequired)) score += 15
  if (attractions.some(a => a.type === 'must-see')) score += 15
  if (routes.some(r => r.difficulty === 'beginner')) score += 10
  if (routes.length >= 2) score += 10
  return Math.min(100, score)
}

/**
 * Compute overall accessibility (0-100)
 * @example
 * computeAccessibility(70, 60) // 66
 */
export function computeAccessibility(onboarding: number, guideCompleteness: number): number {
  return Math.round(onboarding * 0.6 + guideCompleteness * 0.4)
}

/**
 * Classify guide rating
 * @example
 * classifyGuideRating(90) // 'five-stars'
 */
export function classifyGuideRating(accessibility: number): NavigatorGuideStats['guideRating'] {
  if (accessibility >= 80) return 'five-stars'
  if (accessibility >= 65) return 'four-stars'
  if (accessibility >= 50) return 'three-stars'
  if (accessibility >= 35) return 'two-stars'
  return 'one-star'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate navigation guide recommendations
 * @example
 * generateGuideRecommendations(sections, attractions, routes, zones, stats) // string[]
 */
export function generateGuideRecommendations(
  sections: GuideSection[],
  attractions: Attraction[],
  routes: TourRoute[],
  zones: ConstructionZone[],
  stats: NavigatorGuideStats,
): string[] {
  const recs: string[] = []

  const mustSee = attractions.filter(a => a.type === 'must-see')
  if (mustSee.length === 0) {
    recs.push('No must-see attractions identified — document key entry points and core modules')
  }

  const underConstruction = attractions.filter(a => a.type === 'under-construction')
  if (underConstruction.length > 2) {
    recs.push(`${underConstruction.length} files under construction — resolve TODOs or document expected changes`)
  }

  const majorZones = zones.filter(z => z.severity === 'major')
  if (majorZones.length > 0) {
    recs.push(`Address ${majorZones.length} major construction zone(s): ${majorZones.map(z => z.area).join(', ')}`)
  }

  const beginnerRoutes = routes.filter(r => r.difficulty === 'beginner')
  if (beginnerRoutes.length === 0) {
    recs.push('Create a beginner tour route — new developers need a guided onboarding path')
  }

  if (stats.guideCompleteness < 50) {
    recs.push('Guide is incomplete — add more sections and attractions for comprehensive coverage')
  }

  if (stats.overallAccessibility < 40) {
    recs.push('Low accessibility score — improve documentation and structure for better onboarding')
  }

  const expertSections = sections.filter(s => s.difficulty === 'expert')
  if (expertSections.length > 2) {
    recs.push(`${expertSections.length} expert-level sections — consider adding intermediate stepping stones`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete navigator guide result
 * @example
 * buildNavigatorGuideResult(['src/a.ts'], ['export function foo() {}'], {}) // NavigatorGuideResult
 */
export function buildNavigatorGuideResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): NavigatorGuideResult {
  const sections = organizeGuideSections(files, contents)
  const attractions = identifyAttractions(files, contents)
  const routes = generateTourRoutes(sections, attractions)
  const constructionZones = detectConstructionZones(files, contents)
  const onboarding = computeOnboardingScore(files, contents, sections, attractions)

  const guideCompleteness = computeGuideCompleteness(sections, attractions, routes)
  const overallAccessibility = computeAccessibility(onboarding.overall, guideCompleteness)
  const guideRating = classifyGuideRating(overallAccessibility)

  const beginnerRoute = routes.find(r => r.difficulty === 'beginner')
  const totalMin = attractions.reduce((s, a) => s + parseInt(a.visitDuration) || 0, 0)

  const stats: NavigatorGuideStats = {
    totalSections: sections.length,
    totalAttractions: attractions.length,
    mustSeeCount: attractions.filter(a => a.type === 'must-see').length,
    underConstructionCount: attractions.filter(a => a.type === 'under-construction').length,
    totalRoutes: routes.length,
    beginnerRoutes: routes.filter(r => r.difficulty === 'beginner').length,
    constructionZones: constructionZones.length,
    majorConstructionZones: constructionZones.filter(z => z.severity === 'major').length,
    estimatedOnboardingTime: `${Math.max(5, Math.round(totalMin * 0.3))} min`,
    onboardingGrade: onboarding.grade,
    guideCompleteness,
    overallAccessibility,
    recommendedTour: beginnerRoute?.name || 'No beginner tour available',
    guideRating,
  }

  const recommendations = generateGuideRecommendations(sections, attractions, routes, constructionZones, stats)

  return { sections, attractions, routes, constructionZones, onboarding, stats, recommendations }
}
