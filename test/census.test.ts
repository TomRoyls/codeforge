import { describe, expect, it } from 'vitest'

import {
  buildCensusResult,
  classifyCitizen,
  classifyCity,
  computeDependencyRatio,
  computeEducation,
  computeEmploymentRate,
  computeGiniCoefficient,
  computeIncome,
  computeLiteracyRate,
  computeOverallHealth,
  countCitizens,
  generateCensusRecommendations,
} from '../src/commands/census-helpers.js'

import {
  formatCensusJSON,
  formatCensusStats,
  formatCensusTable,
  formatCityDirectory,
  formatDemographics,
  formatRecommendations,
  formatTypeDistribution,
} from '../src/commands/census-format-helpers.js'

import type {
  Citizen,
  CityProfile,
  Demographics,
  CensusResult,
  CensusStats,
} from '../src/commands/census-helpers.js'

// ─── countCitizens ─────────────────────────────────────────────────────────────

describe('countCitizens', () => {
  it('counts function declarations', () => {
    const citizens = countCitizens('function add(a, b) { return a + b }')
    expect(citizens.some((c) => c.name === 'add' && c.type === 'function')).toBe(true)
  })

  it('counts async functions', () => {
    const citizens = countCitizens('async function fetch() {}')
    expect(citizens.some((c) => c.name === 'fetch')).toBe(true)
  })

  it('counts arrow functions', () => {
    const citizens = countCitizens('const compute = (x) => x * 2')
    expect(citizens.some((c) => c.name === 'compute' && c.type === 'function')).toBe(true)
  })

  it('counts classes', () => {
    const citizens = countCitizens('class Handler {}')
    expect(citizens.some((c) => c.name === 'Handler' && c.type === 'class')).toBe(true)
  })

  it('counts interfaces', () => {
    const citizens = countCitizens('interface Config {}')
    expect(citizens.some((c) => c.name === 'Config' && c.type === 'interface')).toBe(true)
  })

  it('counts type aliases', () => {
    const citizens = countCitizens('type Result = string | number')
    expect(citizens.some((c) => c.name === 'Result' && c.type === 'type')).toBe(true)
  })

  it('counts UPPER_CASE constants', () => {
    const citizens = countCitizens('const MAX_SIZE = 100')
    expect(citizens.some((c) => c.name === 'MAX_SIZE' && c.type === 'constant')).toBe(true)
  })

  it('counts enums', () => {
    const citizens = countCitizens('enum Color { Red }')
    expect(citizens.some((c) => c.name === 'Color' && c.type === 'enum')).toBe(true)
  })

  it('counts imports', () => {
    const citizens = countCitizens('import { x } from "y"')
    expect(citizens.some((c) => c.name === 'y' && c.type === 'import')).toBe(true)
  })

  it('returns empty for plain code', () => {
    expect(countCitizens('const x = 1 + 2')).toEqual([])
  })

  it('handles empty content', () => {
    expect(countCitizens('')).toEqual([])
  })

  it('counts multiple elements', () => {
    const content = 'function a() {}\nclass B {}\ninterface C {}'
    const citizens = countCitizens(content)
    expect(citizens.length).toBeGreaterThanOrEqual(3)
  })

  it('counts export re-exports', () => {
    const citizens = countCitizens('export { foo, bar }')
    expect(citizens.some((c) => c.name === 'foo' && c.type === 'export')).toBe(true)
    expect(citizens.some((c) => c.name === 'bar' && c.type === 'export')).toBe(true)
  })
})

// ─── classifyCitizen ───────────────────────────────────────────────────────────

describe('classifyCitizen', () => {
  it('classifies validators', () => {
    expect(classifyCitizen('validateInput', 'function', '')).toBe('validator')
    expect(classifyCitizen('checkAccess', 'function', '')).toBe('validator')
    expect(classifyCitizen('assertEqual', 'function', '')).toBe('validator')
  })

  it('classifies formatters', () => {
    expect(classifyCitizen('formatDate', 'function', '')).toBe('formatter')
    expect(classifyCitizen('renderList', 'function', '')).toBe('formatter')
  })

  it('classifies handlers', () => {
    expect(classifyCitizen('onClick', 'function', '')).toBe('handler')
    expect(classifyCitizen('handleError', 'function', '')).toBe('handler')
  })

  it('classifies utilities', () => {
    expect(classifyCitizen('stringUtil', 'function', '')).toBe('utility')
    expect(classifyCitizen('dataHelper', 'function', '')).toBe('utility')
  })

  it('classifies analyzers', () => {
    expect(classifyCitizen('parseData', 'function', '')).toBe('analyzer')
    expect(classifyCitizen('computeTotal', 'function', '')).toBe('analyzer')
    expect(classifyCitizen('extractFields', 'function', '')).toBe('analyzer')
  })

  it('classifies builders', () => {
    expect(classifyCitizen('buildResult', 'function', '')).toBe('builder')
    expect(classifyCitizen('createUser', 'function', '')).toBe('builder')
  })

  it('classifies retrievers', () => {
    expect(classifyCitizen('getData', 'function', '')).toBe('retriever')
    expect(classifyCitizen('fetchItems', 'function', '')).toBe('retriever')
    expect(classifyCitizen('loadConfig', 'function', '')).toBe('retriever')
  })

  it('classifies mutators', () => {
    expect(classifyCitizen('setData', 'function', '')).toBe('mutator')
    expect(classifyCitizen('updateRecord', 'function', '')).toBe('mutator')
  })

  it('classifies predicates', () => {
    expect(classifyCitizen('isActive', 'function', '')).toBe('predicate')
    expect(classifyCitizen('hasPermission', 'function', '')).toBe('predicate')
  })

  it('classifies exports as providers', () => {
    expect(classifyCitizen('myExport', 'export', '')).toBe('provider')
  })

  it('classifies imports as consumers', () => {
    expect(classifyCitizen('./utils', 'import', '')).toBe('consumer')
  })

  it('classifies types as contracts', () => {
    expect(classifyCitizen('Config', 'interface', '')).toBe('contract')
    expect(classifyCitizen('Result', 'type', '')).toBe('contract')
  })

  it('classifies constants as configuration', () => {
    expect(classifyCitizen('MAX', 'constant', '')).toBe('configuration')
  })

  it('defaults to worker', () => {
    expect(classifyCitizen('process', 'function', '')).toBe('worker')
  })
})

// ─── computeEducation ──────────────────────────────────────────────────────────

describe('computeEducation', () => {
  it('returns 80+ for JSDoc documented code', () => {
    const content = '/**\n * Adds numbers\n * @param a\n * @returns sum\n */\nfunction add(a, b) { return a + b }'
    const citizen: Citizen = { name: 'add', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    const result = computeEducation(content, citizen)
    expect(result).toBeGreaterThanOrEqual(80)
  })

  it('returns 50 for inline comment', () => {
    const content = '// helper function\nfunction add(a, b) { return a + b }'
    const citizen: Citizen = { name: 'add', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    const result = computeEducation(content, citizen)
    expect(result).toBeGreaterThanOrEqual(50)
  })

  it('returns 0 for no documentation', () => {
    const content = 'function add(a, b) { return a + b }'
    const citizen: Citizen = { name: 'add', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    expect(computeEducation(content, citizen)).toBe(0)
  })

  it('returns 60 for block comment', () => {
    const content = '/* Block comment */\nfunction add(a, b) { return a + b }'
    const citizen: Citizen = { name: 'add', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    expect(computeEducation(content, citizen)).toBeGreaterThanOrEqual(50)
  })
})

// ─── computeIncome ─────────────────────────────────────────────────────────────

describe('computeIncome', () => {
  it('returns low income for simple code', () => {
    const content = 'function add(a, b) { return a + b }'
    const citizen: Citizen = { name: 'add', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    const result = computeIncome(content, citizen)
    expect(result).toBeLessThanOrEqual(30)
  })

  it('returns higher income for complex code', () => {
    const content = 'function process(x) { if (a) { for (let i = 0; i < 10; i++) { if (b) { switch(c) { case 1: break; case 2: break; } } } } }'
    const citizen: Citizen = { name: 'process', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    const result = computeIncome(content, citizen)
    expect(result).toBeGreaterThan(30)
  })

  it('returns base for unfound citizen', () => {
    const content = 'function other() {}'
    const citizen: Citizen = { name: 'missing', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    expect(computeIncome(content, citizen)).toBe(10)
  })

  it('caps at 100', () => {
    let content = 'function complex(x) { '
    for (let i = 0; i < 50; i++) content += `if (a${i}) { for (let j = 0; j < 10; j++) {} } `
    content += '}'
    const citizen: Citizen = { name: 'complex', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 }
    expect(computeIncome(content, citizen)).toBeLessThanOrEqual(100)
  })
})

// ─── computeGiniCoefficient ────────────────────────────────────────────────────

describe('computeGiniCoefficient', () => {
  it('returns 0 for equal incomes', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 50, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 50, dependents: 0 },
    ]
    expect(computeGiniCoefficient(citizens)).toBe(0)
  })

  it('returns higher for unequal incomes', () => {
    const equal: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 50, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 50, dependents: 0 },
    ]
    const unequal: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 10, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 90, dependents: 0 },
    ]
    expect(computeGiniCoefficient(unequal)).toBeGreaterThan(computeGiniCoefficient(equal))
  })

  it('returns 0 for empty', () => {
    expect(computeGiniCoefficient([])).toBe(0)
  })

  it('returns 0 for all zero incomes', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
    ]
    expect(computeGiniCoefficient(citizens)).toBe(0)
  })
})

// ─── computeLiteracyRate ───────────────────────────────────────────────────────

describe('computeLiteracyRate', () => {
  it('returns 100 for all documented', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 80, income: 0, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 50, income: 0, dependents: 0 },
    ]
    expect(computeLiteracyRate(citizens)).toBe(100)
  })

  it('returns 0 for no documentation', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
    ]
    expect(computeLiteracyRate(citizens)).toBe(0)
  })

  it('returns 50 for half documented', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'function', residence: '', occupation: '', age: 0, education: 80, income: 0, dependents: 0 },
      { name: 'b', type: 'function', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
    ]
    expect(computeLiteracyRate(citizens)).toBe(50)
  })

  it('returns 0 for empty', () => {
    expect(computeLiteracyRate([])).toBe(0)
  })
})

// ─── computeEmploymentRate ─────────────────────────────────────────────────────

describe('computeEmploymentRate', () => {
  it('returns 100 for all employed', () => {
    const importedBy = new Map([['a.ts', ['foo', 'bar']]])
    expect(computeEmploymentRate(['foo', 'bar'], importedBy)).toBe(100)
  })

  it('returns 0 for unused exports', () => {
    const importedBy = new Map<string, string[]>()
    expect(computeEmploymentRate(['foo'], importedBy)).toBe(0)
  })

  it('returns 100 for no exports', () => {
    expect(computeEmploymentRate([], new Map())).toBe(100)
  })

  it('returns 50 for partially employed', () => {
    const importedBy = new Map([['a.ts', ['foo']]])
    expect(computeEmploymentRate(['foo', 'bar'], importedBy)).toBe(50)
  })
})

// ─── computeDependencyRatio ────────────────────────────────────────────────────

describe('computeDependencyRatio', () => {
  it('computes consumers/providers', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'import', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
      { name: 'b', type: 'import', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
      { name: 'c', type: 'export', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
    ]
    const ratio = computeDependencyRatio(citizens)
    expect(ratio).toBe(0.67)
  })

  it('returns 0 for no providers', () => {
    const citizens: Citizen[] = [
      { name: 'a', type: 'import', residence: '', occupation: '', age: 0, education: 0, income: 0, dependents: 0 },
    ]
    expect(computeDependencyRatio(citizens)).toBe(0)
  })

  it('returns 0 for empty', () => {
    expect(computeDependencyRatio([])).toBe(0)
  })
})

// ─── classifyCity ──────────────────────────────────────────────────────────────

describe('classifyCity', () => {
  it('classifies metropolis', () => {
    expect(classifyCity(35, 400)).toBe('metropolis')
  })

  it('classifies city', () => {
    expect(classifyCity(20, 200)).toBe('city')
  })

  it('classifies town', () => {
    expect(classifyCity(10, 70)).toBe('town')
  })

  it('classifies village', () => {
    expect(classifyCity(5, 30)).toBe('village')
  })

  it('classifies hamlet', () => {
    expect(classifyCity(2, 15)).toBe('hamlet')
  })

  it('classifies ghost-town for zero population', () => {
    expect(classifyCity(0, 10)).toBe('ghost-town')
  })

  it('classifies ghost-town for zero lines', () => {
    expect(classifyCity(5, 0)).toBe('ghost-town')
  })
})

// ─── computeOverallHealth ──────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  const goodDemo: Demographics = {
    totalPopulation: 10, typeDistribution: {}, avgEducation: 70, avgIncome: 40,
    giniCoefficient: 0.2, literacyRate: 80, employmentRate: 90, dependencyRatio: 1,
  }

  it('returns high score for healthy codebase', () => {
    const result = computeOverallHealth(goodDemo, [])
    expect(result).toBeGreaterThan(50)
  })

  it('penalizes ghost towns', () => {
    const cities: CityProfile[] = [
      { name: 'empty.ts', population: 0, density: 0, demographics: goodDemo, classification: 'ghost-town', growthRate: 0 },
    ]
    const result = computeOverallHealth(goodDemo, cities)
    expect(result).toBeLessThan(computeOverallHealth(goodDemo, []))
  })

  it('penalizes high gini', () => {
    const unequal: Demographics = { ...goodDemo, giniCoefficient: 0.9 }
    const equal: Demographics = { ...goodDemo, giniCoefficient: 0.1 }
    expect(computeOverallHealth(equal, [])).toBeGreaterThan(computeOverallHealth(unequal, []))
  })
})

// ─── generateCensusRecommendations ─────────────────────────────────────────────

describe('generateCensusRecommendations', () => {
  const baseStats: CensusStats = {
    totalPopulation: 10, totalCities: 2, metropolises: 0, ghostTowns: 0,
    literacyRate: 70, employmentRate: 80, giniCoefficient: 0.3,
    avgPopulationDensity: 1.5, largestCity: 'a.ts', smallestCity: 'b.ts',
    fastestGrowing: 'none', overallHealth: 65,
  }
  const baseDemo: Demographics = {
    totalPopulation: 10, typeDistribution: {}, avgEducation: 50, avgIncome: 30,
    giniCoefficient: 0.3, literacyRate: 70, employmentRate: 80, dependencyRatio: 1,
  }

  it('recommends documentation for low literacy', () => {
    const demo = { ...baseDemo, literacyRate: 30 }
    const recs = generateCensusRecommendations([], [], demo, baseStats)
    expect(recs.some((r) => r.includes('Literacy'))).toBe(true)
  })

  it('recommends refactoring for high gini', () => {
    const demo = { ...baseDemo, giniCoefficient: 0.7 }
    const recs = generateCensusRecommendations([], [], demo, baseStats)
    expect(recs.some((r) => r.includes('Gini'))).toBe(true)
  })

  it('recommends removing unused exports', () => {
    const demo = { ...baseDemo, employmentRate: 40 }
    const recs = generateCensusRecommendations([], [], demo, baseStats)
    expect(recs.some((r) => r.includes('Employment'))).toBe(true)
  })

  it('recommends about ghost towns', () => {
    const cities: CityProfile[] = [
      { name: 'empty.ts', population: 0, density: 0, demographics: baseDemo, classification: 'ghost-town', growthRate: 0 },
    ]
    const recs = generateCensusRecommendations([], cities, baseDemo, baseStats)
    expect(recs.some((r) => r.includes('ghost'))).toBe(true)
  })

  it('recommends splitting metropolises', () => {
    const cities: CityProfile[] = [
      { name: 'big.ts', population: 50, density: 2, demographics: baseDemo, classification: 'metropolis', growthRate: 0 },
    ]
    const recs = generateCensusRecommendations([], cities, baseDemo, baseStats)
    expect(recs.some((r) => r.includes('metropolis'))).toBe(true)
  })

  it('praises good health', () => {
    const stats = { ...baseStats, overallHealth: 80 }
    const recs = generateCensusRecommendations([], [], baseDemo, stats)
    expect(recs.some((r) => r.includes('health'))).toBe(true)
  })

  it('gives all-clear for healthy codebase', () => {
    const goodDemo = { ...baseDemo, literacyRate: 90, giniCoefficient: 0.1, employmentRate: 95 }
    const stats = { ...baseStats, overallHealth: 40 }
    const recs = generateCensusRecommendations([], [], goodDemo, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildCensusResult ─────────────────────────────────────────────────────────

describe('buildCensusResult', () => {
  it('returns empty for no files', () => {
    const result = buildCensusResult([], [], {})
    expect(result.citizens).toEqual([])
    expect(result.cities).toEqual([])
    expect(result.stats.totalPopulation).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('counts citizens in simple file', () => {
    const files = ['utils.ts']
    const contents = ['function add(a, b) { return a + b }\nconst MAX = 100']
    const result = buildCensusResult(files, contents, {})
    expect(result.citizens.length).toBeGreaterThan(0)
    expect(result.stats.totalPopulation).toBeGreaterThan(0)
  })

  it('classifies cities', () => {
    const result = buildCensusResult(['a.ts'], ['function x() {}'], {})
    expect(result.cities).toHaveLength(1)
    expect(result.cities[0].classification).toBeTruthy()
  })

  it('computes demographics', () => {
    const result = buildCensusResult(['a.ts'], ['function add() {}\nclass Handler {}'], {})
    expect(result.demographics.totalPopulation).toBeGreaterThan(0)
    expect(result.demographics.typeDistribution).toBeDefined()
  })

  it('computes type distribution', () => {
    const result = buildCensusResult(['a.ts'], ['function foo() {}\nclass Bar {}'], {})
    expect(result.demographics.typeDistribution.function).toBeGreaterThanOrEqual(1)
  })

  it('computes literacy rate', () => {
    const result = buildCensusResult(['a.ts'], ['function foo() {}'], {})
    expect(result.stats.literacyRate).toBeGreaterThanOrEqual(0)
  })

  it('computes gini coefficient', () => {
    const result = buildCensusResult(['a.ts'], ['function foo() {}'], {})
    expect(result.stats.giniCoefficient).toBeGreaterThanOrEqual(0)
  })

  it('computes overall health', () => {
    const result = buildCensusResult(['a.ts'], ['function foo() {}'], {})
    expect(result.stats.overallHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHealth).toBeLessThanOrEqual(100)
  })

  it('finds largest and smallest cities', () => {
    const files = ['big.ts', 'small.ts']
    const contents = [
      Array(50).fill('function fn() {}').join('\n'),
      'const X = 1',
    ]
    const result = buildCensusResult(files, contents, {})
    expect(result.stats.largestCity).toBeTruthy()
    expect(result.stats.smallestCity).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildCensusResult(['a.ts'], ['function foo() {}'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles multi-file project', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      'import { x } from "b"\nfunction run() {}',
      'export function x() {}',
      'interface Config {}',
    ]
    const result = buildCensusResult(files, contents, {})
    expect(result.cities).toHaveLength(3)
    expect(result.stats.totalCities).toBe(3)
  })

  it('classifies occupations', () => {
    const result = buildCensusResult(['a.ts'], ['function getData() {}\nfunction validateInput() {}'], {})
    const occupations = result.citizens.map((c) => c.occupation)
    expect(occupations).toContain('retriever')
    expect(occupations).toContain('validator')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatCityDirectory', () => {
  it('handles empty', () => {
    expect(formatCityDirectory([])).toContain('No cities')
  })

  it('formats cities', () => {
    const cities: CityProfile[] = [
      { name: 'app.ts', population: 20, density: 1.5, demographics: {} as Demographics, classification: 'city', growthRate: 0 },
    ]
    const result = formatCityDirectory(cities)
    expect(result).toContain('app.ts')
    expect(result).toContain('20')
  })
})

describe('formatTypeDistribution', () => {
  it('handles empty', () => {
    expect(formatTypeDistribution({})).toContain('No population')
  })

  it('formats distribution', () => {
    const result = formatTypeDistribution({ function: 10, class: 5 })
    expect(result).toContain('function')
    expect(result).toContain('10')
  })
})

describe('formatDemographics', () => {
  it('formats demographics', () => {
    const demo: Demographics = {
      totalPopulation: 50, typeDistribution: {}, avgEducation: 65, avgIncome: 35,
      giniCoefficient: 0.3, literacyRate: 80, employmentRate: 90, dependencyRatio: 1.2,
    }
    const result = formatDemographics(demo)
    expect(result).toContain('50')
    expect(result).toContain('65%')
    expect(result).toContain('0.3')
  })
})

describe('formatCensusStats', () => {
  it('formats stats', () => {
    const stats: CensusStats = {
      totalPopulation: 100, totalCities: 10, metropolises: 2, ghostTowns: 1,
      literacyRate: 75, employmentRate: 85, giniCoefficient: 0.25,
      avgPopulationDensity: 2.3, largestCity: 'app.ts', smallestCity: 'util.ts',
      fastestGrowing: 'none', overallHealth: 72,
    }
    const result = formatCensusStats(stats)
    expect(result).toContain('100')
    expect(result).toContain('app.ts')
  })
})

describe('formatRecommendations', () => {
  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Add docs', 'Refactor'])).toContain('Add docs')
  })
})

describe('formatCensusTable', () => {
  it('formats full result', () => {
    const result: CensusResult = {
      citizens: [], cities: [],
      demographics: {
        totalPopulation: 0, typeDistribution: {}, avgEducation: 0, avgIncome: 0,
        giniCoefficient: 0, literacyRate: 0, employmentRate: 0, dependencyRatio: 0,
      },
      stats: {
        totalPopulation: 0, totalCities: 0, metropolises: 0, ghostTowns: 0,
        literacyRate: 0, employmentRate: 0, giniCoefficient: 0, avgPopulationDensity: 0,
        largestCity: 'none', smallestCity: 'none', fastestGrowing: 'none', overallHealth: 0,
      },
      recommendations: [],
    }
    const output = formatCensusTable(result)
    expect(output).toContain('Census')
  })
})

describe('formatCensusJSON', () => {
  it('outputs valid JSON', () => {
    const result: CensusResult = {
      citizens: [], cities: [],
      demographics: {
        totalPopulation: 0, typeDistribution: {}, avgEducation: 0, avgIncome: 0,
        giniCoefficient: 0, literacyRate: 0, employmentRate: 0, dependencyRatio: 0,
      },
      stats: {
        totalPopulation: 0, totalCities: 0, metropolises: 0, ghostTowns: 0,
        literacyRate: 0, employmentRate: 0, giniCoefficient: 0, avgPopulationDensity: 0,
        largestCity: 'none', smallestCity: 'none', fastestGrowing: 'none', overallHealth: 0,
      },
      recommendations: [],
    }
    const output = formatCensusJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalPopulation).toBe(0)
  })
})
