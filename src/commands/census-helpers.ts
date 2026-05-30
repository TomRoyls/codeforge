// ─── Types ─────────────────────────────────────────────────────────────────────

export type CitizenType = 'function' | 'class' | 'interface' | 'type' | 'constant' | 'enum' | 'import' | 'export'

export type CityClassification = 'metropolis' | 'city' | 'town' | 'village' | 'hamlet' | 'ghost-town'

export interface Citizen {
  name: string
  type: CitizenType
  residence: string
  occupation: string
  age: number
  education: number
  income: number
  dependents: number
}

export interface Demographics {
  totalPopulation: number
  typeDistribution: Record<string, number>
  avgEducation: number
  avgIncome: number
  giniCoefficient: number
  literacyRate: number
  employmentRate: number
  dependencyRatio: number
}

export interface CityProfile {
  name: string
  population: number
  density: number
  demographics: Demographics
  classification: CityClassification
  growthRate: number
}

export interface CensusStats {
  totalPopulation: number
  totalCities: number
  metropolises: number
  ghostTowns: number
  literacyRate: number
  employmentRate: number
  giniCoefficient: number
  avgPopulationDensity: number
  largestCity: string
  smallestCity: string
  fastestGrowing: string
  overallHealth: number
}

export interface CensusResult {
  citizens: Citizen[]
  cities: CityProfile[]
  demographics: Demographics
  stats: CensusStats
  recommendations: string[]
}

// ─── Citizen Counting ──────────────────────────────────────────────────────────

/**
 * Count citizens (code elements) from content.
 *
 * @example
 * countCitizens('function foo() {}')
 */
export function countCitizens(content: string): Citizen[] {
  const citizens: Citizen[] = []

  const funcMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g) || []
  for (const m of funcMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const arrowMatches = content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g) || []
  for (const m of arrowMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const classMatches = content.matchAll(/(?:export\s+)?(?:default\s+)?class\s+(\w+)/g) || []
  for (const m of classMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'class', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const interfaceMatches = content.matchAll(/(?:export\s+)?interface\s+(\w+)/g) || []
  for (const m of interfaceMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'interface', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const typeMatches = content.matchAll(/(?:export\s+)?type\s+(\w+)\s*=/g) || []
  for (const m of typeMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'type', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const constMatches = content.matchAll(/(?:export\s+)?const\s+([A-Z_]\w*)\s*=/g) || []
  for (const m of constMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'constant', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const enumMatches = content.matchAll(/(?:export\s+)?enum\s+(\w+)/g) || []
  for (const m of enumMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'enum', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const importMatches = content.matchAll(/import\s+(?:\{[^}]*\}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g) || []
  for (const m of importMatches) {
    if (m[1]) citizens.push({ name: m[1], type: 'import', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
  }

  const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g) || []
  for (const m of exportMatches) {
    if (m[1]) {
      const existing = citizens.find((c) => c.name === m[1] && c.residence === '')
      if (existing) {
        existing.type = 'export'
      }
    }
  }

  const reExportMatches = content.matchAll(/export\s+\{([^}]+)\}/g) || []
  for (const m of reExportMatches) {
    if (m[1]) {
      const names = m[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean) as string[]
      for (const name of names) {
        citizens.push({ name, type: 'export', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 })
      }
    }
  }

  return citizens
}

// ─── Citizen Classification ────────────────────────────────────────────────────

/**
 * Classify citizen occupation by name and type.
 *
 * @example
 * classifyCitizen('validateInput', 'function', '')
 */
export function classifyCitizen(name: string, type: CitizenType, _content: string): string {
  const lower = name.toLowerCase()

  if (type === 'export') return 'provider'
  if (type === 'import') return 'consumer'
  if (type === 'interface' || type === 'type') return 'contract'
  if (type === 'constant' || type === 'enum') return 'configuration'
  if (/valid|check|assert|verify|ensure|guard/.test(lower)) return 'validator'
  if (/format|render|display|tostring|to_string|stringify|serialize/.test(lower)) return 'formatter'
  if (/handler|\bon\w+|handle|listener|callback/.test(lower)) return 'handler'
  if (/util|helper|tool|common|shared/.test(lower)) return 'utility'
  if (/analyz|pars|extract|comput|calcul|measur|evaluat/.test(lower)) return 'analyzer'
  if (/build|creat|construct|mak|generat|factory/.test(lower)) return 'builder'
  if (/get|fetch|read|load|find|query|search/.test(lower)) return 'retriever'
  if (/set|update|writ|sav|stor|persist/.test(lower)) return 'mutator'
  if (/test|spec|mock|stub/.test(lower)) return 'tester'
  if (/is|has|can|should|will/.test(lower) && type === 'function') return 'predicate'

  return 'worker'
}

// ─── Education & Income ────────────────────────────────────────────────────────

/**
 * Compute education level (documentation) for a citizen.
 *
 * @example
 * computeEducation('function foo() {}', citizen)
 */
export function computeEducation(content: string, citizen: Citizen): number {
  const escapedName = citizen.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const jsdocRegex = new RegExp(`/\\*\\*[\\s\\S]*?${escapedName}`, 'g')
  if (jsdocRegex.test(content)) return 80 + Math.min(20, (content.match(/@param|@returns|@example/g) || []).length * 5)

  const index = content.indexOf(citizen.name)
  if (index >= 0) {
    const before = content.slice(Math.max(0, index - 200), index)
    if (before.includes('//')) return 50
    if (before.includes('/*')) return 60
  }

  return 0
}

/**
 * Compute income level (complexity) for a citizen.
 *
 * @example
 * computeIncome('function foo() { if(x){for(let i=0;i<10;i++){}} }', citizen)
 */
export function computeIncome(content: string, citizen: Citizen): number {
  const escapedName = citizen.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:function\\s+${escapedName}|const\\s+${escapedName}\\s*=)[\\s\\S]*?(?=\\n(?:function|const|export|class|interface|type)|$)`, 'g')
  const match = regex.exec(content)
  if (!match) return 10

  const body = match[0]
  const branches = (body.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\?\s*[^:]*:/g) || []).length

  if (branches <= 3) return Math.min(30, branches * 10)
  if (branches <= 10) return Math.min(70, 30 + (branches - 3) * 6)
  return Math.min(100, 70 + (branches - 10) * 3)
}

// ─── Gini Coefficient ──────────────────────────────────────────────────────────

/**
 * Compute Gini coefficient for complexity inequality.
 *
 * @example
 * computeGiniCoefficient([{ income: 10 }, { income: 90 }])
 */
export function computeGiniCoefficient(citizens: Citizen[]): number {
  if (citizens.length === 0) return 0

  const incomes = citizens.map((c) => c.income).sort((a, b) => a - b)
  const n = incomes.length
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      numerator += Math.abs((incomes[i] ?? 0) - (incomes[j] ?? 0))
    }
    denominator += (incomes[i] ?? 0)
  }

  if (denominator === 0) return 0
  return Math.round((numerator / (2 * n * denominator)) * 100) / 100
}

// ─── Literacy & Employment ─────────────────────────────────────────────────────

/**
 * Compute literacy rate (% with documentation).
 *
 * @example
 * computeLiteracyRate(citizens)
 */
export function computeLiteracyRate(citizens: Citizen[]): number {
  if (citizens.length === 0) return 0
  const literate = citizens.filter((c) => c.education > 0).length
  return Math.round((literate / citizens.length) * 100)
}

/**
 * Compute employment rate (% of exports used).
 *
 * @example
 * computeEmploymentRate(exports, importedBy)
 */
export function computeEmploymentRate(exports: string[], importedBy: Map<string, string[]>): number {
  if (exports.length === 0) return 100
  const employed = exports.filter((name) => {
    for (const importers of importedBy.values()) {
      if (importers.includes(name)) return true
    }
    return false
  }).length
  return Math.round((employed / exports.length) * 100)
}

/**
 * Compute dependency ratio (consumers / providers).
 *
 * @example
 * computeDependencyRatio(citizens)
 */
export function computeDependencyRatio(citizens: Citizen[]): number {
  const consumers = citizens.filter((c) => c.type === 'import').length
  const providers = citizens.filter((c) => c.type === 'export' || c.type === 'function' || c.type === 'class').length
  const total = consumers + providers
  if (total === 0 || providers === 0) return 0
  return Math.round((consumers / total) * 100) / 100
}

// ─── City Classification ───────────────────────────────────────────────────────

/**
 * Classify a city (file) by population and lines.
 *
 * @example
 * classifyCity(50, 400)
 */
export function classifyCity(population: number, lines: number): CityClassification {
  if (population === 0 || lines === 0) return 'ghost-town'
  if (lines > 300 && population > 30) return 'metropolis'
  if (lines >= 100 && population > 15) return 'city'
  if (lines >= 50 && population > 8) return 'town'
  if (lines >= 20 && population > 3) return 'village'
  if (population > 0) return 'hamlet'
  return 'ghost-town'
}

/**
 * Compute growth rate placeholder.
 *
 * @example
 * computeGrowthRate('file.ts', [])
 */
export function computeGrowthRate(_file: string, _gitHistory: string[]): number {
  return 0
}

// ─── Overall Health ────────────────────────────────────────────────────────────

/**
 * Compute overall codebase health.
 *
 * @example
 * computeOverallHealth(demographics, cities)
 */
export function computeOverallHealth(demographics: Demographics, cities: CityProfile[]): number {
  const literacyScore = demographics.literacyRate * 0.25
  const employmentScore = demographics.employmentRate * 0.2
  const equalityScore = (1 - demographics.giniCoefficient) * 100 * 0.2
  const avgEducationScore = demographics.avgEducation * 0.2
  const ghostPenalty = cities.filter((c) => c.classification === 'ghost-town').length * 2
  const cityScore = Math.max(0, 15 - ghostPenalty)

  return Math.round(Math.min(100, literacyScore + employmentScore + equalityScore + avgEducationScore + cityScore))
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate census recommendations.
 *
 * @example
 * generateCensusRecommendations(citizens, cities, demographics, stats)
 */
export function generateCensusRecommendations(
  _citizens: Citizen[],
  cities: CityProfile[],
  demographics: Demographics,
  stats: CensusStats,
): string[] {
  const recs: string[] = []

  if (demographics.literacyRate < 50) {
    recs.push(`Literacy rate is ${demographics.literacyRate}% — add documentation to undocumented code elements`)
  }

  if (demographics.giniCoefficient > 0.5) {
    recs.push(`Gini coefficient ${demographics.giniCoefficient} indicates high complexity inequality — refactor complex functions`)
  }

  if (demographics.employmentRate < 60) {
    recs.push(`Employment rate ${demographics.employmentRate}% — consider removing unused exports`)
  }

  const ghostTowns = cities.filter((c) => c.classification === 'ghost-town')
  if (ghostTowns.length > 0) {
    recs.push(`${ghostTowns.length} ghost town(s) found — remove empty files or add content: ${ghostTowns.slice(0, 3).map((c) => c.name).join(', ')}`)
  }

  const metropolises = cities.filter((c) => c.classification === 'metropolis')
  if (metropolises.length > 0) {
    recs.push(`${metropolises.length} metropolis(es) — consider splitting large files: ${metropolises.slice(0, 3).map((c) => c.name).join(', ')}`)
  }

  if (stats.overallHealth >= 75) {
    recs.push(`Overall health ${stats.overallHealth}% — codebase demographics look good`)
  }

  if (recs.length === 0) {
    recs.push('Census shows a healthy, well-distributed codebase population')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete census result.
 *
 * @example
 * buildCensusResult(['a.ts'], ['code'], {})
 */
export function buildCensusResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): CensusResult {
  if (files.length === 0) {
    const emptyDemo: Demographics = {
      totalPopulation: 0, typeDistribution: {}, avgEducation: 0, avgIncome: 0,
      giniCoefficient: 0, literacyRate: 0, employmentRate: 0, dependencyRatio: 0,
    }
    const emptyStats: CensusStats = {
      totalPopulation: 0, totalCities: 0, metropolises: 0, ghostTowns: 0,
      literacyRate: 0, employmentRate: 0, giniCoefficient: 0, avgPopulationDensity: 0,
      largestCity: 'none', smallestCity: 'none', fastestGrowing: 'none', overallHealth: 0,
    }
    return { citizens: [], cities: [], demographics: emptyDemo, stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const allCitizens: Citizen[] = []
  const cities: CityProfile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''

    const rawCitizens = countCitizens(content)
    const lines = content.split('\n').filter((l) => l.trim().length > 0).length

    const fileCitizens = rawCitizens.map((c) => {
      const citizen = { ...c, residence: file ?? '' }
      citizen.occupation = classifyCitizen(citizen.name, citizen.type, content)
      citizen.education = computeEducation(content, citizen)
      citizen.income = computeIncome(content, citizen)
      citizen.dependents = 0
      return citizen
    })

    allCitizens.push(...fileCitizens)

    const density = lines > 0 ? Math.round((fileCitizens.length / lines) * 100) / 100 : 0
    const classification = classifyCity(fileCitizens.length, lines)

    const typeDist: Record<string, number> = {}
    for (const c of fileCitizens) {
      typeDist[c.type] = (typeDist[c.type] ?? 0) + 1
    }
    const avgEdu = fileCitizens.length > 0 ? Math.round(fileCitizens.reduce((s, c) => s + c.education, 0) / fileCitizens.length) : 0
    const avgInc = fileCitizens.length > 0 ? Math.round(fileCitizens.reduce((s, c) => s + c.income, 0) / fileCitizens.length) : 0

    const cityDemo: Demographics = {
      totalPopulation: fileCitizens.length,
      typeDistribution: typeDist,
      avgEducation: avgEdu,
      avgIncome: avgInc,
      giniCoefficient: computeGiniCoefficient(fileCitizens),
      literacyRate: computeLiteracyRate(fileCitizens),
      employmentRate: 100,
      dependencyRatio: computeDependencyRatio(fileCitizens),
    }

    cities.push({
      name: file ?? '',
      population: fileCitizens.length,
      density,
      demographics: cityDemo,
      classification,
      growthRate: computeGrowthRate(file ?? '', []),
    })
  }

  const typeDistribution: Record<string, number> = {}
  for (const c of allCitizens) {
    typeDistribution[c.type] = (typeDistribution[c.type] ?? 0) + 1
  }

  const avgEducation = allCitizens.length > 0 ? Math.round(allCitizens.reduce((s, c) => s + c.education, 0) / allCitizens.length) : 0
  const avgIncome = allCitizens.length > 0 ? Math.round(allCitizens.reduce((s, c) => s + c.income, 0) / allCitizens.length) : 0
  const giniCoefficient = computeGiniCoefficient(allCitizens)
  const literacyRate = computeLiteracyRate(allCitizens)
  const employmentRate = 100
  const dependencyRatio = computeDependencyRatio(allCitizens)

  const demographics: Demographics = {
    totalPopulation: allCitizens.length,
    typeDistribution,
    avgEducation,
    avgIncome,
    giniCoefficient,
    literacyRate,
    employmentRate,
    dependencyRatio,
  }

  const metropolises = cities.filter((c) => c.classification === 'metropolis').length
  const ghostTowns = cities.filter((c) => c.classification === 'ghost-town').length
  const avgPopulationDensity = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.density, 0) / cities.length * 100) / 100 : 0

  const sortedByPop = [...cities].sort((a, b) => b.population - a.population)
  const largestCity = sortedByPop[0]?.name ?? 'none'
  const smallestCity = sortedByPop[sortedByPop.length - 1]?.name ?? 'none'
  const fastestGrowing = 'none'

  const stats: CensusStats = {
    totalPopulation: allCitizens.length,
    totalCities: cities.length,
    metropolises,
    ghostTowns,
    literacyRate,
    employmentRate,
    giniCoefficient,
    avgPopulationDensity,
    largestCity,
    smallestCity,
    fastestGrowing,
    overallHealth: 0,
  }
  stats.overallHealth = computeOverallHealth(demographics, cities)

  const recommendations = generateCensusRecommendations(allCitizens, cities, demographics, stats)

  return { citizens: allCitizens, cities, demographics, stats, recommendations }
}
