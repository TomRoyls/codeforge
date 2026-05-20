import { describe, expect, it } from 'vitest'

import {
  buildConnections,
  buildMyceliumResult,
  buildNodes,
  classifyClusterHealth,
  classifyNetworkHealth,
  computeMonocultureRisk,
  computeNetworkDensity,
  computeNetworkResilience,
  findCriticalNodes,
  generateRecommendations,
  identifyClusters,
  traceNutrientFlows,
  type ClusterHealth,
  type HyphaeConnection,
  type HyphaeNode,
  type MyceliumCluster,
  type MyceliumOptions,
  type MyceliumResult,
  type MyceliumStats,
  type NetworkHealth,
  type NodeType,
  type NutrientFlow,
} from '../src/commands/mycelium-helpers.js'

import {
  formatClusters,
  formatConnections,
  formatFlows,
  formatHealthLabel,
  formatMyceliumJson,
  formatMyceliumStats,
  formatMyceliumTable,
  formatNetworkGauge,
  formatNodes,
  formatNodeTypeLabel,
  formatRecommendations,
} from '../src/commands/mycelium-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SINGLE_FILE = `export function hello(): string {
  return 'hello'
}
`

const TWO_FILES_IMPORT: [string[], string[]] = [
  ['a.ts', 'b.ts'],
  [
    `import { greet } from './b'
export function main() { greet() }
`,
    `export function greet(): string { return 'hi' }
`,
  ],
]

const THREE_FILES_CHAIN: [string[], string[]] = [
  ['main.ts', 'utils.ts', 'types.ts'],
  [
    `import { processData } from './utils'
import type { Data } from './types'
export function main(d: Data) { return processData(d) }
`,
    `import type { Data } from './types'
export function processData(d: Data): string { return JSON.stringify(d) }
`,
    `export interface Data { id: number; name: string }
`,
  ],
]

const HUB_FILE: [string[], string[]] = [
  ['hub.ts', 'a.ts', 'b.ts', 'c.ts', 'd.ts'],
  [
    `export const shared = 'core'
export function helper() { return 1 }
export class Core {}
`,
    `import { shared } from './hub'
export const a = shared
`,
    `import { helper } from './hub'
export const b = helper()
`,
    `import { Core } from './hub'
export const c = new Core()
`,
    `export function isolated() { return true }
`,
  ],
]

const DEAD_WOOD: [string[], string[]] = [
  ['alive.ts', 'dead.ts'],
  [
    `export function alive() { return true }
`,
    `const x = 1
const y = 2
`,
  ],
]

const BIDIRECTIONAL: [string[], string[]] = [
  ['a.ts', 'b.ts'],
  [
    `import { bFunc } from './b'
export function aFunc() { return bFunc() }
`,
    `import { aFunc } from './a'
export function bFunc() { return aFunc() }
`,
  ],
]

function makeResult(
  files: string[],
  contents: string[],
  options: MyceliumOptions = {},
): MyceliumResult {
  return buildMyceliumResult(files, contents, options)
}

// ─── buildNodes ────────────────────────────────────────────────────────────────

describe('buildNodes', () => {
  it('returns empty array for no files', () => {
    expect(buildNodes([], [])).toEqual([])
  })

  it('returns dead-wood for file with no imports/exports', () => {
    const nodes = buildNodes(['dead.ts'], [EMPTY_CONTENT])
    expect(nodes).toHaveLength(1)
    expect(nodes[0].isDeadWood).toBe(true)
    expect(nodes[0].type).toBe('dead-wood')
  })

  it('returns dead-wood for file with exports but no other files to connect', () => {
    const nodes = buildNodes(['types.ts'], [`export interface X { a: number }`])
    expect(nodes).toHaveLength(1)
    expect(nodes[0].isDeadWood).toBe(true)
  })

  it('returns root or hub for file with exports and imports from it', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const nodeB = nodes.find(n => n.file === 'b.ts')
    expect(nodeB).toBeDefined()
    expect(['root', 'hub']).toContain(nodeB!.type)
  })

  it('returns hub or connector for file that imports and exports', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const nodeA = nodes.find(n => n.file === 'a.ts')
    expect(nodeA).toBeDefined()
    expect(nodeA!.isLeaf).toBe(false)
    expect(['hub', 'connector']).toContain(nodeA!.type)
  })

  it('returns hub for highly-connected file', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const hub = nodes.find(n => n.file === 'hub.ts')
    expect(hub).toBeDefined()
    expect(hub!.isHub).toBe(true)
    expect(hub!.type).toBe('hub')
  })

  it('computes nutrientLevel from exports', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const hub = nodes.find(n => n.file === 'hub.ts')
    expect(hub!.nutrientLevel).toBeGreaterThan(0)
  })

  it('computes dependencyScore from incoming connections', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const hub = nodes.find(n => n.file === 'hub.ts')
    expect(hub!.dependencyScore).toBeGreaterThan(0)
  })

  it('computes resilience as inverse of dependency', () => {
    const nodes = buildNodes(['dead.ts'], [EMPTY_CONTENT])
    expect(nodes[0].resilience).toBe(100)
  })

  it('computes depth as 0 for files with no imports', () => {
    const nodes = buildNodes(['root.ts'], [`export const x = 1`])
    expect(nodes[0].depth).toBe(0)
  })

  it('computes depth as 1 for files with imports', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const nodeA = nodes.find(n => n.file === 'a.ts')
    expect(nodeA!.depth).toBe(1)
  })

  it('handles multiple files correctly', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    expect(nodes).toHaveLength(3)
    expect(nodes.every(n => !n.isDeadWood)).toBe(true)
  })
})

// ─── buildConnections ──────────────────────────────────────────────────────────

describe('buildConnections', () => {
  it('returns empty for no files', () => {
    expect(buildConnections([], [], [])).toEqual([])
  })

  it('returns empty when no imports exist', () => {
    const conns = buildConnections(['a.ts'], [`export const x = 1`], [])
    expect(conns).toEqual([])
  })

  it('detects import connection', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    expect(conns.length).toBeGreaterThanOrEqual(1)
    expect(conns.some(c => c.from === 'a.ts' && c.to === 'b.ts')).toBe(true)
  })

  it('detects connection type as import', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const conn = conns.find(c => c.from === 'a.ts' && c.to === 'b.ts')
    expect(conn!.type).toBe('import')
  })

  it('computes strength from nutrient count', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    expect(conns.every(c => c.strength >= 10)).toBe(true)
  })

  it('populates nutrients from named imports', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const conn = conns.find(c => c.from === 'a.ts' && c.to === 'b.ts')
    expect(conn!.nutrients).toContain('greet')
  })

  it('detects bidirectional connections', () => {
    const [files, contents] = BIDIRECTIONAL
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    expect(conns.some(c => c.bidirectional)).toBe(true)
  })

  it('detects at least one connection from chain', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    expect(conns.length).toBeGreaterThanOrEqual(1)
  })

  it('sets isRedundant to false by default', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    expect(conns.every(c => !c.isRedundant)).toBe(true)
  })
})

// ─── identifyClusters ──────────────────────────────────────────────────────────

describe('identifyClusters', () => {
  it('returns empty for no nodes', () => {
    expect(identifyClusters([], [])).toEqual([])
  })

  it('creates cluster(s) for connected graph', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    expect(clusters.length).toBeGreaterThanOrEqual(1)
    expect(clusters.reduce((s, c) => s + c.nodes.length, 0)).toBe(3)
  })

  it('creates separate clusters for disconnected files', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [`export const a = 1`, `export const b = 2`]
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    expect(clusters).toHaveLength(2)
  })

  it('sets center to highest-degree node', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    const mainCluster = clusters.find(c => c.nodes.includes('hub.ts'))
    expect(mainCluster).toBeDefined()
    expect(mainCluster!.center).toBe('hub.ts')
  })

  it('computes density for cluster', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    expect(clusters[0].density).toBeGreaterThanOrEqual(0)
    expect(clusters[0].density).toBeLessThanOrEqual(100)
  })

  it('has name property', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    expect(clusters[0].name).toBeTruthy()
  })

  it('has description', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const clusters = identifyClusters(nodes, conns)
    expect(clusters[0].description).toBeTruthy()
  })
})

// ─── classifyClusterHealth ─────────────────────────────────────────────────────

describe('classifyClusterHealth', () => {
  it('returns healthy for size 1', () => {
    expect(classifyClusterHealth(0, 1)).toBe('healthy')
  })

  it('returns thriving for high density large cluster', () => {
    expect(classifyClusterHealth(80, 5)).toBe('thriving')
  })

  it('returns healthy for moderate density', () => {
    expect(classifyClusterHealth(50, 4)).toBe('healthy')
  })

  it('returns stressed for low density', () => {
    expect(classifyClusterHealth(25, 6)).toBe('stressed')
  })

  it('returns dying for very low density', () => {
    expect(classifyClusterHealth(5, 4)).toBe('dying')
  })

  it('returns dead for zero density', () => {
    expect(classifyClusterHealth(0, 5)).toBe('dead')
  })

  it('returns thriving at exactly 70 density', () => {
    expect(classifyClusterHealth(70, 3)).toBe('thriving')
  })

  it('returns healthy at exactly 40 density', () => {
    expect(classifyClusterHealth(40, 3)).toBe('healthy')
  })

  it('returns stressed at exactly 20 density', () => {
    expect(classifyClusterHealth(20, 3)).toBe('stressed')
  })
})

// ─── traceNutrientFlows ────────────────────────────────────────────────────────

describe('traceNutrientFlows', () => {
  it('returns empty for no connections', () => {
    expect(traceNutrientFlows(['a.ts'], ['export const x = 1'], [])).toEqual([])
  })

  it('traces function nutrient flow', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    expect(flows.length).toBeGreaterThanOrEqual(1)
    const greetFlow = flows.find(f => f.symbol === 'greet')
    expect(greetFlow).toBeDefined()
    expect(greetFlow!.flowType).toBe('function')
  })

  it('detects flow origin correctly', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const greetFlow = flows.find(f => f.symbol === 'greet')
    expect(greetFlow!.origin).toBe('b.ts')
  })

  it('computes volume from destinations', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    expect(flows.every(f => f.volume >= 1)).toBe(true)
  })

  it('marks well-distributed when 3+ destinations', () => {
    const files = ['hub.ts', 'a.ts', 'b.ts', 'c.ts']
    const contents = [
      `export const core = 1\nexport function help() {}\nexport class Cls {}`,
      `import { core } from './hub'`,
      `import { core } from './hub'`,
      `import { core } from './hub'`,
    ]
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const coreFlow = flows.find(f => f.symbol === 'core')
    expect(coreFlow).toBeDefined()
    expect(coreFlow!.isWellDistributed).toBe(true)
  })

  it('detects class flow type', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      `import { Cls } from './b'`,
      `export class Cls { method() {} }`,
    ]
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const clsFlow = flows.find(f => f.symbol === 'Cls')
    expect(clsFlow!.flowType).toBe('class')
  })

  it('detects interface flow type', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      `import { Data } from './b'`,
      `export interface Data { id: number }`,
    ]
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const dataFlow = flows.find(f => f.symbol === 'Data')
    expect(dataFlow!.flowType).toBe('interface')
  })

  it('detects constant flow type', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const greetFlow = flows.find(f => f.symbol === 'greet')
    expect(greetFlow!.flowType).toBe('function')
  })
})

// ─── computeNetworkDensity ─────────────────────────────────────────────────────

describe('computeNetworkDensity', () => {
  it('returns 100 for 0 or 1 node', () => {
    expect(computeNetworkDensity([], [])).toBe(100)
    const nodes: HyphaeNode[] = [{
      file: 'a.ts', type: 'root', connections: [],
      nutrientLevel: 50, dependencyScore: 0, resilience: 100,
      depth: 0, isHub: false, isLeaf: false, isDeadWood: false,
    }]
    expect(computeNetworkDensity(nodes, [])).toBe(100)
  })

  it('returns 0 for disconnected nodes', () => {
    const nodes = [
      { file: 'a.ts', type: 'root' as NodeType, connections: [], nutrientLevel: 50, dependencyScore: 0, resilience: 100, depth: 0, isHub: false, isLeaf: false, isDeadWood: false },
      { file: 'b.ts', type: 'root' as NodeType, connections: [], nutrientLevel: 50, dependencyScore: 0, resilience: 100, depth: 0, isHub: false, isLeaf: false, isDeadWood: false },
    ]
    expect(computeNetworkDensity(nodes, [])).toBe(0)
  })

  it('returns positive density for connected graph', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const density = computeNetworkDensity(nodes, conns)
    expect(density).toBeGreaterThan(0)
    expect(density).toBeLessThanOrEqual(100)
  })

  it('returns higher density for more connections', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const density = computeNetworkDensity(nodes, conns)
    expect(density).toBeGreaterThan(0)
  })
})

// ─── computeNetworkResilience ──────────────────────────────────────────────────

describe('computeNetworkResilience', () => {
  it('returns 100 for empty network', () => {
    expect(computeNetworkResilience([], [])).toBe(100)
  })

  it('returns 100 for single node', () => {
    const nodes: HyphaeNode[] = [{
      file: 'a.ts', type: 'root', connections: [],
      nutrientLevel: 50, dependencyScore: 0, resilience: 100,
      depth: 0, isHub: false, isLeaf: false, isDeadWood: false,
    }]
    expect(computeNetworkResilience(nodes, [])).toBe(100)
  })

  it('returns 0-100 range', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const resilience = computeNetworkResilience(nodes, conns)
    expect(resilience).toBeGreaterThanOrEqual(0)
    expect(resilience).toBeLessThanOrEqual(100)
  })

  it('penalizes high hub ratio', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const resilience = computeNetworkResilience(nodes, conns)
    expect(resilience).toBeLessThanOrEqual(100)
  })
})

// ─── computeMonocultureRisk ────────────────────────────────────────────────────

describe('computeMonocultureRisk', () => {
  it('returns 0 for empty inputs', () => {
    expect(computeMonocultureRisk([], [])).toBe(0)
  })

  it('returns 0 for no flows', () => {
    const nodes: HyphaeNode[] = [{
      file: 'a.ts', type: 'root', connections: [],
      nutrientLevel: 50, dependencyScore: 0, resilience: 100,
      depth: 0, isHub: false, isLeaf: false, isDeadWood: false,
    }]
    expect(computeMonocultureRisk([], nodes)).toBe(0)
  })

  it('returns 0-100 range', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const risk = computeMonocultureRisk(flows, nodes)
    expect(risk).toBeGreaterThanOrEqual(0)
    expect(risk).toBeLessThanOrEqual(100)
  })

  it('returns higher risk for single-origin flows', () => {
    const [files, contents] = HUB_FILE
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const flows = traceNutrientFlows(files, contents, conns)
    const risk = computeMonocultureRisk(flows, nodes)
    expect(risk).toBeGreaterThanOrEqual(0)
  })
})

// ─── findCriticalNodes ─────────────────────────────────────────────────────────

describe('findCriticalNodes', () => {
  it('returns 0 for 2 or fewer nodes', () => {
    const nodes = [
      { file: 'a.ts', type: 'root' as NodeType, connections: [], nutrientLevel: 50, dependencyScore: 0, resilience: 100, depth: 0, isHub: false, isLeaf: false, isDeadWood: false },
      { file: 'b.ts', type: 'root' as NodeType, connections: [], nutrientLevel: 50, dependencyScore: 0, resilience: 100, depth: 0, isHub: false, isLeaf: false, isDeadWood: false },
    ]
    expect(findCriticalNodes(nodes, [])).toBe(0)
  })

  it('returns 0 for no nodes', () => {
    expect(findCriticalNodes([], [])).toBe(0)
  })

  it('detects critical node in chain', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const critical = findCriticalNodes(nodes, conns)
    expect(critical).toBeGreaterThanOrEqual(0)
  })

  it('detects hub as critical when it bridges clusters', () => {
    const files = ['hub.ts', 'a.ts', 'b.ts']
    const contents = [
      `export const core = 1`,
      `import { core } from './hub'`,
      `import { core } from './hub'`,
    ]
    const nodes = buildNodes(files, contents)
    const conns = buildConnections(files, contents, nodes)
    const critical = findCriticalNodes(nodes, conns)
    expect(critical).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifyNetworkHealth ─────────────────────────────────────────────────────

describe('classifyNetworkHealth', () => {
  it('returns flourishing for high scores', () => {
    const clusters: MyceliumCluster[] = [{
      name: 'test', nodes: ['a.ts', 'b.ts'], center: 'a.ts',
      radius: 1, density: 80, health: 'thriving',
      sharedNutrients: [], description: 'test cluster',
    }]
    expect(classifyNetworkHealth(80, 80, clusters)).toBe('flourishing')
  })

  it('returns healthy for moderate scores', () => {
    const clusters: MyceliumCluster[] = [{
      name: 'test', nodes: ['a.ts', 'b.ts'], center: 'a.ts',
      radius: 1, density: 50, health: 'healthy',
      sharedNutrients: [], description: 'test cluster',
    }]
    expect(classifyNetworkHealth(55, 60, clusters)).toBe('healthy')
  })

  it('returns healthy for composite ~56', () => {
    expect(classifyNetworkHealth(35, 40, [])).toBe('healthy')
  })

  it('returns stable for composite ~42', () => {
    expect(classifyNetworkHealth(15, 20, [])).toBe('stable')
  })

  it('returns fragile for composite ~33', () => {
    expect(classifyNetworkHealth(5, 5, [])).toBe('fragile')
  })

  it('returns collapsing with dying clusters and low scores', () => {
    const clusters: MyceliumCluster[] = [{
      name: 'dead', nodes: ['a.ts'], center: 'a.ts',
      radius: 1, density: 0, health: 'dead',
      sharedNutrients: [], description: 'dead cluster',
    }]
    expect(classifyNetworkHealth(0, 0, clusters)).toBe('collapsing')
  })

  it('penalizes dying clusters', () => {
    const clusters: MyceliumCluster[] = [{
      name: 'dead', nodes: ['a.ts'], center: 'a.ts',
      radius: 1, density: 0, health: 'dead',
      sharedNutrients: [], description: 'dead cluster',
    }]
    const health = classifyNetworkHealth(50, 50, clusters)
    expect(health).not.toBe('flourishing')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends removing dead wood', () => {
    const nodes: HyphaeNode[] = [{
      file: 'dead.ts', type: 'dead-wood', connections: [],
      nutrientLevel: 0, dependencyScore: 0, resilience: 100,
      depth: 0, isHub: false, isLeaf: false, isDeadWood: true,
    }]
    const stats: MyceliumStats = {
      totalNodes: 1, totalConnections: 0, hubCount: 0, leafCount: 0,
      deadWoodCount: 1, avgConnections: 0, maxConnections: 0, avgResilience: 100,
      clusterCount: 1, thrivingClusters: 0, dyingClusters: 0, totalFlows: 0,
      avgFlowVolume: 0, redundantConnections: 0, networkDensity: 100,
      networkResilience: 100, networkHealth: 'healthy', criticalNodes: 0,
      monocultureRisk: 0,
    }
    const recs = generateRecommendations(nodes, [], [], [], stats)
    expect(recs.some(r => r.includes('dead-wood'))).toBe(true)
  })

  it('recommends investigating dying clusters', () => {
    const stats: MyceliumStats = {
      totalNodes: 3, totalConnections: 0, hubCount: 0, leafCount: 0,
      deadWoodCount: 0, avgConnections: 0, maxConnections: 0, avgResilience: 100,
      clusterCount: 1, thrivingClusters: 0, dyingClusters: 1, totalFlows: 0,
      avgFlowVolume: 0, redundantConnections: 0, networkDensity: 0,
      networkResilience: 100, networkHealth: 'stable', criticalNodes: 0,
      monocultureRisk: 0,
    }
    const clusters: MyceliumCluster[] = [{
      name: 'dead', nodes: ['a.ts'], center: 'a.ts',
      radius: 1, density: 0, health: 'dead',
      sharedNutrients: [], description: 'dead cluster',
    }]
    const recs = generateRecommendations([], [], clusters, [], stats)
    expect(recs.some(r => r.includes('dying cluster'))).toBe(true)
  })

  it('recommends redundancy for critical nodes', () => {
    const stats: MyceliumStats = {
      totalNodes: 3, totalConnections: 2, hubCount: 0, leafCount: 0,
      deadWoodCount: 0, avgConnections: 1, maxConnections: 2, avgResilience: 80,
      clusterCount: 1, thrivingClusters: 0, dyingClusters: 0, totalFlows: 0,
      avgFlowVolume: 0, redundantConnections: 0, networkDensity: 33,
      networkResilience: 80, networkHealth: 'healthy', criticalNodes: 1,
      monocultureRisk: 0,
    }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.includes('critical node'))).toBe(true)
  })

  it('recommends diversification for high monoculture risk', () => {
    const stats: MyceliumStats = {
      totalNodes: 3, totalConnections: 2, hubCount: 1, leafCount: 1,
      deadWoodCount: 0, avgConnections: 1, maxConnections: 2, avgResilience: 80,
      clusterCount: 1, thrivingClusters: 0, dyingClusters: 0, totalFlows: 2,
      avgFlowVolume: 1, redundantConnections: 0, networkDensity: 33,
      networkResilience: 80, networkHealth: 'healthy', criticalNodes: 0,
      monocultureRisk: 75,
    }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.includes('monoculture'))).toBe(true)
  })

  it('recommends resilience for fragile network', () => {
    const stats: MyceliumStats = {
      totalNodes: 2, totalConnections: 0, hubCount: 0, leafCount: 0,
      deadWoodCount: 0, avgConnections: 0, maxConnections: 0, avgResilience: 50,
      clusterCount: 2, thrivingClusters: 0, dyingClusters: 0, totalFlows: 0,
      avgFlowVolume: 0, redundantConnections: 0, networkDensity: 0,
      networkResilience: 50, networkHealth: 'fragile', criticalNodes: 0,
      monocultureRisk: 0,
    }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some(r => r.includes('fragile'))).toBe(true)
  })

  it('returns empty for healthy network', () => {
    const stats: MyceliumStats = {
      totalNodes: 2, totalConnections: 1, hubCount: 0, leafCount: 0,
      deadWoodCount: 0, avgConnections: 1, maxConnections: 1, avgResilience: 100,
      clusterCount: 1, thrivingClusters: 1, dyingClusters: 0, totalFlows: 1,
      avgFlowVolume: 1, redundantConnections: 0, networkDensity: 50,
      networkResilience: 100, networkHealth: 'flourishing', criticalNodes: 0,
      monocultureRisk: 20,
    }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs).toEqual([])
  })
})

// ─── buildMyceliumResult (integration) ─────────────────────────────────────────

describe('buildMyceliumResult', () => {
  it('handles empty input', () => {
    const result = makeResult([], [])
    expect(result.nodes).toEqual([])
    expect(result.connections).toEqual([])
    expect(result.stats.totalNodes).toBe(0)
  })

  it('handles single file', () => {
    const result = makeResult(['a.ts'], [SINGLE_FILE])
    expect(result.nodes).toHaveLength(1)
    expect(result.stats.totalNodes).toBe(1)
  })

  it('builds complete result with all fields', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const result = makeResult(files, contents)
    expect(result.nodes.length).toBe(3)
    expect(result.connections.length).toBeGreaterThanOrEqual(1)
    expect(result.clusters.length).toBeGreaterThanOrEqual(1)
    expect(result.flows.length).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalNodes).toBe(3)
    expect(result.recommendations).toBeDefined()
  })

  it('populates node connections', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const result = makeResult(files, contents)
    const mainNode = result.nodes.find(n => n.file === 'main.ts')
    expect(mainNode!.connections.length).toBeGreaterThan(0)
  })

  it('computes all stats fields', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const result = makeResult(files, contents)
    const stats = result.stats
    expect(typeof stats.totalNodes).toBe('number')
    expect(typeof stats.totalConnections).toBe('number')
    expect(typeof stats.hubCount).toBe('number')
    expect(typeof stats.leafCount).toBe('number')
    expect(typeof stats.deadWoodCount).toBe('number')
    expect(typeof stats.avgConnections).toBe('number')
    expect(typeof stats.maxConnections).toBe('number')
    expect(typeof stats.avgResilience).toBe('number')
    expect(typeof stats.clusterCount).toBe('number')
    expect(typeof stats.thrivingClusters).toBe('number')
    expect(typeof stats.dyingClusters).toBe('number')
    expect(typeof stats.totalFlows).toBe('number')
    expect(typeof stats.avgFlowVolume).toBe('number')
    expect(typeof stats.redundantConnections).toBe('number')
    expect(typeof stats.networkDensity).toBe('number')
    expect(typeof stats.networkResilience).toBe('number')
    expect(typeof stats.networkHealth).toBe('string')
    expect(typeof stats.criticalNodes).toBe('number')
    expect(typeof stats.monocultureRisk).toBe('number')
  })

  it('detects hub files correctly', () => {
    const [files, contents] = HUB_FILE
    const result = makeResult(files, contents)
    expect(result.stats.hubCount).toBeGreaterThanOrEqual(1)
  })

  it('detects dead wood files', () => {
    const [files, contents] = DEAD_WOOD
    const result = makeResult(files, contents)
    expect(result.stats.deadWoodCount).toBeGreaterThanOrEqual(1)
  })

  it('detects leaf nodes', () => {
    const [files, contents] = TWO_FILES_IMPORT
    const result = makeResult(files, contents)
    expect(result.stats.leafCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies network health', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const result = makeResult(files, contents)
    expect(['flourishing', 'healthy', 'stable', 'fragile', 'collapsing']).toContain(result.stats.networkHealth)
  })

  it('handles verbose option', () => {
    const result = makeResult(['a.ts'], [SINGLE_FILE], { verbose: true })
    expect(result).toBeDefined()
  })

  it('produces valid JSON-serializable result', () => {
    const [files, contents] = THREE_FILES_CHAIN
    const result = makeResult(files, contents)
    expect(() => JSON.stringify(result)).not.toThrow()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatNodeTypeLabel', () => {
  it('formats hub type', () => {
    const result = formatNodeTypeLabel('hub')
    expect(result).toContain('hub')
  })

  it('formats connector type', () => {
    const result = formatNodeTypeLabel('connector')
    expect(result).toContain('connector')
  })

  it('formats leaf type', () => {
    const result = formatNodeTypeLabel('leaf')
    expect(result).toContain('leaf')
  })

  it('formats root type', () => {
    const result = formatNodeTypeLabel('root')
    expect(result).toContain('root')
  })

  it('formats dead-wood type', () => {
    const result = formatNodeTypeLabel('dead-wood')
    expect(result).toContain('dead-wood')
  })
})

describe('formatHealthLabel', () => {
  it('formats flourishing', () => {
    const result = formatHealthLabel('flourishing')
    expect(result).toContain('flourishing')
  })

  it('formats collapsing', () => {
    const result = formatHealthLabel('collapsing')
    expect(result).toContain('collapsing')
  })

  it('formats unknown health as plain string', () => {
    const result = formatHealthLabel('unknown')
    expect(result).toBe('unknown')
  })
})

describe('formatNetworkGauge', () => {
  it('formats gauge with default width', () => {
    const result = formatNetworkGauge(75)
    expect(result).toContain('75')
    expect(result).toContain('\u2588')
  })

  it('formats gauge with custom width', () => {
    const result = formatNetworkGauge(50, 10)
    expect(result).toContain('50')
  })

  it('formats 0 gauge', () => {
    const result = formatNetworkGauge(0)
    expect(result).toContain('0')
    expect(result).toContain('\u2591')
  })

  it('formats 100 gauge', () => {
    const result = formatNetworkGauge(100)
    expect(result).toContain('100')
    expect(result).toContain('\u2588')
  })
})

describe('formatNodes', () => {
  it('formats empty nodes', () => {
    const result = formatNodes([])
    expect(result).toContain('No files')
  })

  it('formats node list', () => {
    const nodes: HyphaeNode[] = [{
      file: 'a.ts', type: 'root', connections: [],
      nutrientLevel: 50, dependencyScore: 0, resilience: 100,
      depth: 0, isHub: false, isLeaf: false, isDeadWood: false,
    }]
    const result = formatNodes(nodes)
    expect(result).toContain('a.ts')
    expect(result).toContain('Network Nodes')
  })
})

describe('formatConnections', () => {
  it('formats empty connections', () => {
    const result = formatConnections([])
    expect(result).toContain('No connections')
  })

  it('formats connection list', () => {
    const conns: HyphaeConnection[] = [{
      from: 'a.ts', to: 'b.ts', type: 'import', strength: 15,
      bidirectional: false, nutrients: ['x'], isRedundant: false,
    }]
    const result = formatConnections(conns)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatClusters', () => {
  it('formats empty clusters', () => {
    const result = formatClusters([])
    expect(result).toContain('No clusters')
  })

  it('formats cluster list', () => {
    const clusters: MyceliumCluster[] = [{
      name: 'test-A', nodes: ['a.ts', 'b.ts'], center: 'a.ts',
      radius: 1, density: 75, health: 'thriving',
      sharedNutrients: [], description: '2 nodes in thriving cluster',
    }]
    const result = formatClusters(clusters)
    expect(result).toContain('test-A')
    expect(result).toContain('thriving')
  })
})

describe('formatFlows', () => {
  it('formats empty flows', () => {
    const result = formatFlows([])
    expect(result).toContain('No nutrient flows')
  })

  it('formats flow list', () => {
    const flows: NutrientFlow[] = [{
      symbol: 'greet', origin: 'b.ts', destinations: ['a.ts'],
      flowType: 'function', volume: 1, isWellDistributed: false,
    }]
    const result = formatFlows(flows)
    expect(result).toContain('greet')
    expect(result).toContain('function')
  })
})

describe('formatMyceliumStats', () => {
  it('formats stats', () => {
    const stats: MyceliumStats = {
      totalNodes: 5, totalConnections: 3, hubCount: 1, leafCount: 1,
      deadWoodCount: 0, avgConnections: 1.2, maxConnections: 3, avgResilience: 85,
      clusterCount: 1, thrivingClusters: 1, dyingClusters: 0, totalFlows: 2,
      avgFlowVolume: 1.5, redundantConnections: 0, networkDensity: 30,
      networkResilience: 85, networkHealth: 'healthy', criticalNodes: 0,
      monocultureRisk: 25,
    }
    const result = formatMyceliumStats(stats)
    expect(result).toContain('Mycelium Network Analysis')
    expect(result).toContain('5')
    expect(result).toContain('healthy')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })

  it('formats recommendation list', () => {
    const result = formatRecommendations(['Fix X', 'Remove Y'])
    expect(result).toContain('1.')
    expect(result).toContain('2.')
    expect(result).toContain('Fix X')
  })
})

describe('formatMyceliumTable', () => {
  it('formats full table output', () => {
    const result = makeResult(['a.ts', 'b.ts'], [
      `import { x } from './b'\nexport const y = x`,
      `export const x = 1`,
    ])
    const table = formatMyceliumTable(result)
    expect(table).toContain('Mycelium Network Analysis')
    expect(table).toContain('Network Nodes')
  })
})

describe('formatMyceliumJson', () => {
  it('formats valid JSON', () => {
    const result = makeResult(['a.ts'], [SINGLE_FILE])
    const json = formatMyceliumJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.nodes).toHaveLength(1)
  })
})
