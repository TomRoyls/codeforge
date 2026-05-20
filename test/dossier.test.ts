import { describe, expect, it } from 'vitest'

import {
  assessStrategicValue,
  assessThreatLevel,
  assignClearance,
  buildDossierResult,
  buildNetwork,
  buildThreatMatrix,
  classifyAgentStatus,
  computeCyclomaticComplexity,
  computeNetworkDensity,
  computeOverallThreatLevel,
  computeReliability,
  countExports,
  countImports,
  extractImports,
  generateCodename,
  generateDossierRecommendations,
  resolveImportPath,
  scanVulnerabilities,
  type Agent,
  type DossierOptions,
  type DossierResult,
  type DossierStats,
  type ThreatMatrix,
  type Vulnerability,
} from '../src/commands/dossier-helpers.js'

import {
  formatAgentRoster,
  formatClassifiedHeader,
  formatDossierJson,
  formatDossierRecommendations,
  formatDossierStats,
  formatDossierTable,
  formatThreatMatrix,
  formatVulnCatalog,
} from '../src/commands/dossier-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_FILES = ['src/core/engine.ts', 'src/commands/run.ts', 'src/utils/helpers.ts']
const SIMPLE_CONTENTS = [
  'export class Engine {\n  start() {}\n  stop() {}\n}\n',
  "import { Engine } from '../core/engine'\n\nexport default class Run {\n  async execute() {\n    const e = new Engine()\n    e.start()\n  }\n}\n",
  'export function help() { return true }\nexport function format() { return "" }\n',
]

const CONNECTED_FILES = ['a.ts', 'b.ts', 'c.ts', 'd.ts']
const CONNECTED_CONTENTS = [
  "import { x } from './b'\nimport { y } from './c'\nexport const a = 1\n",
  "import { z } from './d'\nexport const x = 2\n",
  'export const y = 3\n',
  'export const z = 4\n',
]

const COMPLEX_CONTENT = Array.from({ length: 25 }, (_, i) => `if (x${i}) {`).join('\n') + '\n' + Array.from({ length: 25 }, () => '}').join('\n')

const WELL_DOC = `/**
 * Computes the answer.
 * @param n - the number
 * @returns the answer
 * @example
 * answer(42)
 */
export function answer(n: number): number {
  return n
}
`

// ─── generateCodename ──────────────────────────────────────────────────────────

describe('generateCodename', () => {
  it('generates a two-word codename', () => {
    const name = generateCodename('src/commands/run.ts')
    const parts = name.split(' ')
    expect(parts.length).toBe(2)
  })

  it('is deterministic', () => {
    expect(generateCodename('a.ts')).toBe(generateCodename('a.ts'))
  })

  it('differs for different files', () => {
    expect(generateCodename('a.ts')).not.toBe(generateCodename('b.ts'))
  })

  it('uses known adjectives and nouns', () => {
    const adj = ['Shadow', 'Dark', 'Silent', 'Ghost', 'Iron', 'Steel', 'Crimson', 'Phantom', 'Stealth', 'Cipher', 'Venom', 'Frost', 'Raven', 'Storm', 'Viper']
    const nouns = ['Wolf', 'Eagle', 'Hawk', 'Viper', 'Fox', 'Bear', 'Tiger', 'Falcon', 'Cobra', 'Panther', 'Raven', 'Shark', 'Lynx', 'Mantis', 'Owl']
    const name = generateCodename('test.ts')
    const [a, n] = name.split(' ')
    expect(adj).toContain(a)
    expect(nouns).toContain(n)
  })
})

// ─── assignClearance ────────────────────────────────────────────────────────────

describe('assignClearance', () => {
  it('assigns top-secret for high strategic value', () => {
    expect(assignClearance('code', 90)).toBe('top-secret')
  })

  it('assigns secret for medium-high value', () => {
    expect(assignClearance('code', 60)).toBe('secret')
  })

  it('assigns confidential for medium value', () => {
    expect(assignClearance('code', 30)).toBe('confidential')
  })

  it('assigns public for low value', () => {
    expect(assignClearance('code', 10)).toBe('public')
  })
})

// ─── assessThreatLevel ──────────────────────────────────────────────────────────

describe('assessThreatLevel', () => {
  it('returns negligible for simple code', () => {
    expect(assessThreatLevel('const x = 1', 0, 0)).toBe('negligible')
  })

  it('returns low for slightly complex code', () => {
    expect(assessThreatLevel('if (x) { y() }', 1, 0)).toMatch(/^(negligible|low)$/)
  })

  it('returns critical for high complexity and coupling', () => {
    expect(assessThreatLevel(COMPLEX_CONTENT, 12, 8)).toBe('critical')
  })

  it('increases with any types', () => {
    const clean = assessThreatLevel('const x = 1', 0, 0)
    const withAny = assessThreatLevel('const x: any = 1', 0, 0)
    expect(threatScore(withAny)).toBeGreaterThanOrEqual(threatScore(clean))
  })

  it('increases with coupling', () => {
    const low = assessThreatLevel('const x = 1', 2, 1)
    const high = assessThreatLevel('const x = 1', 10, 8)
    expect(threatScore(high)).toBeGreaterThan(threatScore(low))
  })
})

function threatScore(t: string): number {
  switch (t) {
    case 'critical': return 4
    case 'high': return 3
    case 'moderate': return 2
    case 'low': return 1
    case 'negligible': return 0
    default: return -1
  }
}

// ─── assessStrategicValue ───────────────────────────────────────────────────────

describe('assessStrategicValue', () => {
  it('returns 0 for no imports or exports', () => {
    expect(assessStrategicValue(0, 0)).toBe(0)
  })

  it('increases with importedBy', () => {
    const low = assessStrategicValue(1, 0)
    const high = assessStrategicValue(10, 0)
    expect(high).toBeGreaterThan(low)
  })

  it('increases with exports', () => {
    const low = assessStrategicValue(0, 1)
    const high = assessStrategicValue(0, 10)
    expect(high).toBeGreaterThan(low)
  })

  it('caps at 100', () => {
    expect(assessStrategicValue(100, 100)).toBeLessThanOrEqual(100)
  })
})

// ─── classifyAgentStatus ───────────────────────────────────────────────────────

describe('classifyAgentStatus', () => {
  it('returns retired for no imports or exports', () => {
    expect(classifyAgentStatus('const x = 1', '2026-01-01', 0, 0)).toBe('retired')
  })

  it('returns active for files with imports and exports', () => {
    expect(classifyAgentStatus("import { x } from './a'\nexport const y = 1", '2026-01-01', 1, 1)).toBe('active')
  })

  it('returns dormant for files with only exports', () => {
    expect(classifyAgentStatus('export const x = 1', '2026-01-01', 0, 1)).toBe('dormant')
  })

  it('returns compromised for high complexity without docs', () => {
    expect(classifyAgentStatus(COMPLEX_CONTENT, '2026-01-01', 1, 1)).toBe('compromised')
  })

  it('returns compromised for many any types with complexity', () => {
    const content = 'function fn(a: any, b: any, c: any, d: any) {\n  if(a) { if(b) { if(c) { if(d) { if(e) { if(f) { if(g) { if(h) { if(i) { if(j) { if(k) { return 1 } } } } } } } } } } }\n'
    expect(classifyAgentStatus(content, '2026-01-01', 1, 1)).toBe('compromised')
  })
})

// ─── computeReliability ────────────────────────────────────────────────────────

describe('computeReliability', () => {
  it('returns 0 for empty content', () => {
    expect(computeReliability('')).toBe(0)
    expect(computeReliability('   ')).toBe(0)
  })

  it('gives high reliability for well-documented code', () => {
    expect(computeReliability(WELL_DOC)).toBeGreaterThanOrEqual(60)
  })

  it('reduces reliability for complexity', () => {
    const simple = computeReliability('const x = 1\n')
    const complex = computeReliability(COMPLEX_CONTENT)
    expect(simple).toBeGreaterThan(complex)
  })

  it('reduces reliability for any types', () => {
    const clean = computeReliability('function fn(x: number) { return x }\n')
    const withAny = computeReliability('function fn(x: any) { return x }\n')
    expect(clean).toBeGreaterThan(withAny)
  })

  it('reduces reliability for ts-ignore', () => {
    const clean = computeReliability('const x = 1\n')
    const withIgnore = computeReliability('// @ts-ignore\nconst x = 1\n')
    expect(clean).toBeGreaterThan(withIgnore)
  })

  it('caps at 100', () => {
    expect(computeReliability(WELL_DOC)).toBeLessThanOrEqual(100)
  })
})

// ─── computeCyclomaticComplexity ────────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('increases with branches', () => {
    expect(computeCyclomaticComplexity('if (x) {}')).toBe(2)
    expect(computeCyclomaticComplexity('if (x) {} else {}')).toBe(3)
  })

  it('increases with loops', () => {
    expect(computeCyclomaticComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })
})

// ─── extractImports ─────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    expect(extractImports("import { foo } from './bar'")).toEqual(['./bar'])
  })

  it('extracts dynamic imports', () => {
    expect(extractImports("const x = import('./bar')")).toEqual(['./bar'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── countImports / countExports ────────────────────────────────────────────────

describe('countImports', () => {
  it('counts imports', () => {
    expect(countImports("import { a } from './x'\nimport { b } from './y'")).toBe(2)
  })
})

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export const x = 1; export function y() {}')).toBe(2)
  })
})

// ─── resolveImportPath ─────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves with extension', () => {
    expect(resolveImportPath('./a', new Set(['a.ts']))).toBe('a.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', new Set(['a.ts']))).toBeNull()
  })
})

// ─── scanVulnerabilities ───────────────────────────────────────────────────────

describe('scanVulnerabilities', () => {
  it('returns empty for clean code', () => {
    expect(scanVulnerabilities('const x = 1', 'clean.ts')).toEqual([])
  })

  it('detects complexity-bomb', () => {
    const vulns = scanVulnerabilities(COMPLEX_CONTENT, 'complex.ts')
    expect(vulns.some((v) => v.type === 'complexity-bomb')).toBe(true)
  })

  it('detects coupling-risk', () => {
    const manyImports = Array.from({ length: 12 }, (_, i) => `import { a${i} } from './mod${i}'`).join('\n')
    const vulns = scanVulnerabilities(manyImports, 'coupled.ts')
    expect(vulns.some((v) => v.type === 'coupling-risk')).toBe(true)
  })

  it('detects documentation-gap', () => {
    const vulns = scanVulnerabilities('export function foo() {}\nexport function bar() {}\n', 'nodoc.ts')
    expect(vulns.some((v) => v.type === 'documentation-gap')).toBe(true)
  })

  it('detects type-weakness', () => {
    const vulns = scanVulnerabilities('function fn(x: any): any { return x }\n', 'weak.ts')
    expect(vulns.some((v) => v.type === 'type-weakness')).toBe(true)
  })

  it('detects stability-threat for large files', () => {
    const large = Array.from({ length: 350 }, (_, i) => `const line${i} = ${i}`).join('\n') + '\n'
    const vulns = scanVulnerabilities(large, 'large.ts')
    expect(vulns.some((v) => v.type === 'stability-threat')).toBe(true)
  })

  it('does not flag documentation-gap for test files', () => {
    const vulns = scanVulnerabilities('export function test() {}\n', 'foo.test.ts')
    expect(vulns.some((v) => v.type === 'documentation-gap')).toBe(false)
  })

  it('includes description, exploit, and mitigation', () => {
    const vulns = scanVulnerabilities('function fn(x: any) { return x }\n', 'v.ts')
    for (const v of vulns) {
      expect(v.description.length).toBeGreaterThan(0)
      expect(v.exploit.length).toBeGreaterThan(0)
      expect(v.mitigation.length).toBeGreaterThan(0)
    }
  })
})

// ─── buildNetwork ───────────────────────────────────────────────────────────────

describe('buildNetwork', () => {
  it('builds network from imports', () => {
    const network = buildNetwork('a.ts', CONNECTED_FILES, CONNECTED_CONTENTS)
    expect(network).toContain('b.ts')
    expect(network).toContain('c.ts')
  })

  it('builds network from imported-by', () => {
    const network = buildNetwork('d.ts', CONNECTED_FILES, CONNECTED_CONTENTS)
    expect(network).toContain('b.ts')
  })

  it('returns empty for isolated file', () => {
    const network = buildNetwork('lonely.ts', ['lonely.ts'], ['const x = 1'])
    expect(network).toEqual([])
  })
})

// ─── buildThreatMatrix ─────────────────────────────────────────────────────────

describe('buildThreatMatrix', () => {
  const agents: Agent[] = [
    makeAgent('high.ts', 'high value', 90, 'high', 'active', []),
    makeAgent('risk.ts', 'high risk', 30, 'critical', 'compromised', [{ type: 'complexity-bomb', severity: 'high', description: '', exploit: '', mitigation: '' }]),
    makeAgent('blind.ts', 'blind spot', 20, 'low', 'dormant', [{ type: 'documentation-gap', severity: 'medium', description: '', exploit: '', mitigation: '' }]),
    makeAgent('sleeper.ts', 'sleeper', 60, 'moderate', 'dormant', []),
  ]

  it('identifies high-value targets', () => {
    const matrix = buildThreatMatrix(agents)
    expect(matrix.highValue).toContain('high.ts')
  })

  it('identifies high-risk assets', () => {
    const matrix = buildThreatMatrix(agents)
    expect(matrix.highRisk).toContain('risk.ts')
  })

  it('identifies vulnerable files', () => {
    const matrix = buildThreatMatrix(agents)
    expect(matrix.vulnerable).toContain('risk.ts')
    expect(matrix.vulnerable).toContain('blind.ts')
  })

  it('identifies blind spots', () => {
    const matrix = buildThreatMatrix(agents)
    expect(matrix.blindSpots).toContain('blind.ts')
  })

  it('identifies sleeper agents', () => {
    const matrix = buildThreatMatrix(agents)
    expect(matrix.sleeperAgents).toContain('sleeper.ts')
  })

  it('handles empty agents', () => {
    const matrix = buildThreatMatrix([])
    expect(matrix.highValue).toEqual([])
    expect(matrix.highRisk).toEqual([])
  })
})

// ─── computeNetworkDensity ─────────────────────────────────────────────────────

describe('computeNetworkDensity', () => {
  it('returns 0 for 0-1 agents', () => {
    expect(computeNetworkDensity([])).toBe(0)
    expect(computeNetworkDensity([makeAgent('a.ts', 'Agent', 50, 'low', 'active', [])])).toBe(0)
  })

  it('returns higher density for more connections', () => {
    const sparse: Agent[] = [
      makeAgent('a.ts', 'Agent', 50, 'low', 'active', []),
      makeAgent('b.ts', 'Agent', 50, 'low', 'active', []),
    ]
    const dense: Agent[] = [
      makeAgent('a.ts', 'Agent', 50, 'low', 'active', ['b.ts', 'c.ts']),
      makeAgent('b.ts', 'Agent', 50, 'low', 'active', ['a.ts', 'c.ts']),
      makeAgent('c.ts', 'Agent', 50, 'low', 'active', ['a.ts', 'b.ts']),
    ]
    const sparseDensity = computeNetworkDensity(sparse)
    const denseDensity = computeNetworkDensity(dense)
    expect(denseDensity).toBeGreaterThanOrEqual(sparseDensity)
  })
})

// ─── computeOverallThreatLevel ─────────────────────────────────────────────────

describe('computeOverallThreatLevel', () => {
  it('returns low for empty agents', () => {
    expect(computeOverallThreatLevel([], { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] })).toBe('low')
  })

  it('returns critical for critical vulnerabilities', () => {
    const agents: Agent[] = [
      makeAgent('a.ts', 'Agent', 50, 'low', 'active', [{ type: 'complexity-bomb', severity: 'critical', description: '', exploit: '', mitigation: '' }]),
    ]
    expect(computeOverallThreatLevel(agents, buildThreatMatrix(agents))).toBe('critical')
  })

  it('returns high or critical for many high-threat agents', () => {
    const agents: Agent[] = Array.from({ length: 5 }, (_, i) => makeAgent(`${i}.ts`, 'Agent', 50, 'high', 'active', []))
    const level = computeOverallThreatLevel(agents, buildThreatMatrix(agents))
    expect(['high', 'critical']).toContain(level)
  })

  it('returns moderate for some high-threat agents', () => {
    const agents: Agent[] = [
      makeAgent('a.ts', 'Agent', 50, 'high', 'active', []),
      makeAgent('b.ts', 'Agent', 50, 'low', 'active', []),
      makeAgent('c.ts', 'Agent', 50, 'low', 'active', []),
      makeAgent('d.ts', 'Agent', 50, 'low', 'active', []),
    ]
    expect(computeOverallThreatLevel(agents, buildThreatMatrix(agents))).toBe('moderate')
  })
})

// ─── generateDossierRecommendations ────────────────────────────────────────────

describe('generateDossierRecommendations', () => {
  const baseStats: DossierStats = {
    totalAgents: 5, activeCount: 3, dormantCount: 1, compromisedCount: 0,
    topSecretCount: 1, criticalThreatCount: 0, highThreatCount: 0,
    vulnerabilityCount: 0, criticalVulnerabilities: 0,
    avgReliability: 80, avgStrategicValue: 50,
    highestValueTarget: 'a.ts', biggestThreat: 'b.ts',
    overallThreatLevel: 'low', networkDensity: 20,
  }

  it('recommends for critical vulnerabilities', () => {
    const stats = { ...baseStats, criticalVulnerabilities: 3 }
    const recs = generateDossierRecommendations([], { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] }, stats)
    expect(recs.some((r) => r.includes('IMMEDIATE') || r.includes('critical'))).toBe(true)
  })

  it('recommends for compromised agents', () => {
    const stats = { ...baseStats, compromisedCount: 2 }
    const recs = generateDossierRecommendations([], { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] }, stats)
    expect(recs.some((r) => r.includes('compromised'))).toBe(true)
  })

  it('recommends for blind spots', () => {
    const matrix: ThreatMatrix = { highValue: [], highRisk: [], vulnerable: [], blindSpots: ['a.ts', 'b.ts'], sleeperAgents: [] }
    const recs = generateDossierRecommendations([], matrix, baseStats)
    expect(recs.some((r) => r.includes('intelligence gap') || r.includes('documentation'))).toBe(true)
  })

  it('recommends for high-value targets', () => {
    const matrix: ThreatMatrix = { highValue: ['core.ts'], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] }
    const recs = generateDossierRecommendations([], matrix, baseStats)
    expect(recs.some((r) => r.includes('high-value') || r.includes('Protect'))).toBe(true)
  })

  it('recommends for sleeper agents', () => {
    const matrix: ThreatMatrix = { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: ['old.ts'] }
    const recs = generateDossierRecommendations([], matrix, baseStats)
    expect(recs.some((r) => r.includes('sleeper'))).toBe(true)
  })

  it('recommends for low reliability', () => {
    const stats = { ...baseStats, avgReliability: 30 }
    const recs = generateDossierRecommendations([], { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] }, stats)
    expect(recs.some((r) => r.includes('reliability'))).toBe(true)
  })

  it('gives positive feedback for healthy codebase', () => {
    const recs = generateDossierRecommendations([], { highValue: [], highRisk: [], vulnerable: [], blindSpots: [], sleeperAgents: [] }, baseStats)
    expect(recs.some((r) => r.includes('operational') || r.includes('well-maintained'))).toBe(true)
  })
})

// ─── buildDossierResult ────────────────────────────────────────────────────────

describe('buildDossierResult', () => {
  it('builds result with all fields', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.agents).toBeDefined()
    expect(result.threatMatrix).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('creates one agent per file', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.agents.length).toBe(SIMPLE_FILES.length)
  })

  it('assigns codenames', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    for (const agent of result.agents) {
      expect(agent.codename).toBeTruthy()
      expect(agent.codename.split(' ').length).toBe(2)
    }
  })

  it('assigns clearance levels', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const valid = ['public', 'confidential', 'secret', 'top-secret']
    for (const agent of result.agents) {
      expect(valid).toContain(agent.clearance)
    }
  })

  it('assigns threat levels', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const valid = ['negligible', 'low', 'moderate', 'high', 'critical']
    for (const agent of result.agents) {
      expect(valid).toContain(agent.threatLevel)
    }
  })

  it('assigns agent status', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const valid = ['active', 'dormant', 'compromised', 'retired']
    for (const agent of result.agents) {
      expect(valid).toContain(agent.status)
    }
  })

  it('computes networks', () => {
    const result = buildDossierResult(CONNECTED_FILES, CONNECTED_CONTENTS, {})
    expect(result.agents[0].network.length).toBeGreaterThan(0)
  })

  it('builds threat matrix', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.threatMatrix.highValue).toBeDefined()
    expect(result.threatMatrix.highRisk).toBeDefined()
  })

  it('computes stats correctly', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stats.totalAgents).toBe(SIMPLE_FILES.length)
    expect(result.stats.avgReliability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStrategicValue).toBeGreaterThanOrEqual(0)
    expect(result.stats.networkDensity).toBeGreaterThanOrEqual(0)
    expect(result.stats.networkDensity).toBeLessThanOrEqual(100)
  })

  it('handles empty input', () => {
    const result = buildDossierResult([], [], {})
    expect(result.agents).toEqual([])
    expect(result.stats.totalAgents).toBe(0)
    expect(result.stats.overallThreatLevel).toBe('low')
  })

  it('generates recommendations', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects vulnerabilities', () => {
    const result = buildDossierResult(['complex.ts'], [COMPLEX_CONTENT], {})
    expect(result.agents[0].vulnerabilities.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatClassifiedHeader', () => {
  it('includes agent count', () => {
    const output = formatClassifiedHeader('low', 12)
    expect(output).toContain('12')
    expect(output).toContain('CLASSIFIED')
  })
})

describe('formatAgentRoster', () => {
  it('shows agents', () => {
    const agents: Agent[] = [makeAgent('a.ts', 'Shadow Wolf', 50, 'low', 'active', [])]
    const output = formatAgentRoster(agents)
    expect(output).toContain('Shadow Wolf')
  })

  it('shows empty message', () => {
    expect(formatAgentRoster([])).toContain('No agents')
  })

  it('truncates long rosters', () => {
    const agents = Array.from({ length: 25 }, (_, i) => makeAgent(`${i}.ts`, `Agent ${i}`, 50, 'low', 'active', []))
    expect(formatAgentRoster(agents)).toContain('more agents')
  })
})

describe('formatThreatMatrix', () => {
  it('shows threat categories', () => {
    const matrix: ThreatMatrix = { highValue: ['a.ts'], highRisk: ['b.ts'], vulnerable: ['c.ts'], blindSpots: [], sleeperAgents: [] }
    const output = formatThreatMatrix(matrix)
    expect(output).toContain('High-Value')
    expect(output).toContain('High-Risk')
    expect(output).toContain('Vulnerable')
  })
})

describe('formatVulnCatalog', () => {
  it('shows vulnerabilities', () => {
    const agents: Agent[] = [
      makeAgent('a.ts', 'Agent', 50, 'low', 'active', [{ type: 'complexity-bomb', severity: 'high', description: 'Complex', exploit: 'Could break', mitigation: 'Refactor' }]),
    ]
    const output = formatVulnCatalog(agents)
    expect(output).toContain('complexity-bomb')
  })

  it('shows checkmark for no vulnerabilities', () => {
    expect(formatVulnCatalog([])).toContain('No vulnerabilities')
  })
})

describe('formatDossierStats', () => {
  it('shows all stats', () => {
    const stats: DossierStats = {
      totalAgents: 10, activeCount: 7, dormantCount: 2, compromisedCount: 1,
      topSecretCount: 3, criticalThreatCount: 1, highThreatCount: 2,
      vulnerabilityCount: 5, criticalVulnerabilities: 1,
      avgReliability: 75, avgStrategicValue: 55,
      highestValueTarget: 'core.ts', biggestThreat: 'complex.ts',
      overallThreatLevel: 'moderate', networkDensity: 30,
    }
    const output = formatDossierStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('MODERATE')
  })
})

describe('formatDossierRecommendations', () => {
  it('shows recommendations', () => {
    expect(formatDossierRecommendations(['Fix critical vulns'])).toContain('Fix critical vulns')
  })
})

describe('formatDossierJson', () => {
  it('produces valid JSON', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const json = formatDossierJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.agents).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

describe('formatDossierTable', () => {
  it('produces table output', () => {
    const result = buildDossierResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const output = formatDossierTable(result)
    expect(output).toContain('Agent Roster')
    expect(output).toContain('Threat Matrix')
    expect(output).toContain('Intelligence Summary')
  })
})

// ─── Helper ────────────────────────────────────────────────────────────────────

function makeAgent(
  file: string, codename: string, strategicValue: number,
  threatLevel: 'negligible' | 'low' | 'moderate' | 'high' | 'critical',
  status: 'active' | 'dormant' | 'compromised' | 'retired',
  vulnerabilities: Vulnerability[],
): Agent {
  return {
    file, codename,
    clearance: 'public' as const,
    reliability: 75,
    threatLevel,
    network: [],
    strategicValue,
    vulnerabilities,
    lastActivity: '2026-01-01',
    status,
  }
}
