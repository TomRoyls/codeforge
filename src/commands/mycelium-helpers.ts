// ─── Types ─────────────────────────────────────────────────────────────────────

export type NodeType = 'hub' | 'connector' | 'leaf' | 'root' | 'dead-wood'
export type ConnectionType = 'import' | 'type-reference' | 'function-call' | 'constant-use' | 'inheritance' | 'composition'
export type ClusterHealth = 'thriving' | 'healthy' | 'stressed' | 'dying' | 'dead'
export type NetworkHealth = 'flourishing' | 'healthy' | 'stable' | 'fragile' | 'collapsing'
export type FlowType = 'type' | 'function' | 'constant' | 'class' | 'interface'

export interface HyphaeNode {
  file: string
  type: NodeType
  connections: HyphaeConnection[]
  nutrientLevel: number
  dependencyScore: number
  resilience: number
  depth: number
  isHub: boolean
  isLeaf: boolean
  isDeadWood: boolean
}

export interface HyphaeConnection {
  from: string
  to: string
  type: ConnectionType
  strength: number
  bidirectional: boolean
  nutrients: string[]
  isRedundant: boolean
}

export interface MyceliumCluster {
  name: string
  nodes: string[]
  center: string
  radius: number
  density: number
  health: ClusterHealth
  sharedNutrients: string[]
  description: string
}

export interface NutrientFlow {
  symbol: string
  origin: string
  destinations: string[]
  flowType: FlowType
  volume: number
  isWellDistributed: boolean
}

export interface MyceliumStats {
  totalNodes: number
  totalConnections: number
  hubCount: number
  leafCount: number
  deadWoodCount: number
  avgConnections: number
  maxConnections: number
  avgResilience: number
  clusterCount: number
  thrivingClusters: number
  dyingClusters: number
  totalFlows: number
  avgFlowVolume: number
  redundantConnections: number
  networkDensity: number
  networkResilience: number
  networkHealth: NetworkHealth
  criticalNodes: number
  monocultureRisk: number
}

export interface MyceliumResult {
  nodes: HyphaeNode[]
  connections: HyphaeConnection[]
  clusters: MyceliumCluster[]
  flows: NutrientFlow[]
  stats: MyceliumStats
  recommendations: string[]
}

export interface MyceliumOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Node Building ─────────────────────────────────────────────────────────────

/**
 * Build network nodes from files and contents.
 *
 * @example
 * buildNodes(['a.ts'], ['import { x } from "./b"']) // => HyphaeNode[]
 */
export function buildNodes(files: string[], contents: string[]): HyphaeNode[] {
  if (files.length === 0) return []

  const connectionCounts = new Map<string, { incoming: number; outgoing: number; exports: string[]; imports: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const exports = extractExports(content)
    const imports = extractImports(content, files)
    connectionCounts.set(files[i], { incoming: 0, outgoing: imports.length, exports, imports })
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const imports = extractImports(content, files)
    for (const imp of imports) {
      const target = connectionCounts.get(imp)
      if (target) {
        target.incoming++
      }
    }
  }

  const maxConn = Math.max(1, ...[...connectionCounts.values()].map(c => c.incoming + c.outgoing))
  const hubThreshold = maxConn * 0.7

  const nodes: HyphaeNode[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const data = connectionCounts.get(file)!
    const total = data.incoming + data.outgoing
    const nutrientLevel = Math.min(100, Math.round((data.exports.length / Math.max(1, maxConn)) * 100))
    const dependencyScore = Math.min(100, Math.round((data.incoming / Math.max(1, maxConn)) * 100))
    const resilience = Math.max(0, 100 - dependencyScore)
    const depth = computeNodeDepth(file, files, contents)
    const isHub = total >= hubThreshold && total > 0
    const isLeaf = data.outgoing === 0 && data.incoming >= 0 && total > 0
    const isDeadWood = total === 0

    let type: NodeType = 'connector'
    if (isDeadWood) type = 'dead-wood'
    else if (isHub) type = 'hub'
    else if (isLeaf) type = 'leaf'
    else if (depth === 0 && data.exports.length > 0) type = 'root'

    nodes.push({
      file,
      type,
      connections: [],
      nutrientLevel,
      dependencyScore,
      resilience,
      depth,
      isHub,
      isLeaf,
      isDeadWood,
    })
  }

  return nodes
}

function extractExports(content: string): string[] {
  const exports: string[] = []
  const namedExport = content.matchAll(/export\s+(?:const|let|var|function|class|type|interface|enum)\s+(\w+)/g)
  for (const m of namedExport) exports.push(m[1])
  const reExports = content.matchAll(/export\s+\{([^}]+)\}/g)
  for (const m of reExports) {
    const names = m[1].split(',').map(n => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean) as string[]
    exports.push(...names)
  }
  return [...new Set(exports)]
}

function extractImports(content: string, allFiles: string[]): string[] {
  const imports: string[] = []
  const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
  for (const m of importMatches) {
    const source = m[1]
    if (source.startsWith('.')) {
      const cleanSource = source.replace(/^\.\//, '').replace(/\.\w+$/, '')
      for (const f of allFiles) {
        const cleanFile = f.replace(/\.\w+$/, '').replace(/^.*\//, '')
        if (cleanFile === cleanSource || f.includes(cleanSource)) {
          imports.push(f)
          break
        }
      }
    }
  }
  return [...new Set(imports)]
}

function computeNodeDepth(file: string, files: string[], contents: string[]): number {
  const idx = files.indexOf(file)
  if (idx === -1) return 0
  const content = contents[idx] ?? ''
  const imports = extractImports(content, files)
  if (imports.length === 0) return 0
  return 1
}

// ─── Connection Building ───────────────────────────────────────────────────────

/**
 * Build all connections between nodes.
 *
 * @example
 * buildConnections(files, contents, nodes) // => HyphaeConnection[]
 */
export function buildConnections(files: string[], contents: string[], _nodes: HyphaeNode[]): HyphaeConnection[] {
  const connections: HyphaeConnection[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const importMatches = content.matchAll(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g)
    for (const m of importMatches) {
      const named = m[1]
      const source = m[4]
      if (!source.startsWith('.')) continue

      const nutrients: string[] = []
      if (named) {
        nutrients.push(...named.split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean))
      }

      const targetFile = findTargetFile(source, files)
      if (targetFile) {
        const existing = connections.find(c => c.from === files[i] && c.to === targetFile)
        if (existing) {
          existing.nutrients.push(...nutrients)
          existing.strength = Math.min(100, existing.nutrients.length * 15)
        } else {
          connections.push({
            from: files[i],
            to: targetFile,
            type: 'import',
            strength: Math.min(100, Math.max(10, nutrients.length * 15)),
            bidirectional: false,
            nutrients,
            isRedundant: false,
          })
        }
      }
    }
  }

  const edgeCount = new Map<string, number>()
  for (const c of connections) {
    const key1 = `${c.from}->${c.to}`
    edgeCount.set(key1, (edgeCount.get(key1) ?? 0) + 1)
  }

  for (const c of connections) {
    const reverse = connections.find(r => r.from === c.to && r.to === c.from)
    c.bidirectional = reverse !== undefined
  }

  return connections
}

function findTargetFile(source: string, files: string[]): string | undefined {
  const cleanSource = source.replace(/^\.\//, '').replace(/\.\w+$/, '')
  for (const f of files) {
    const cleanFile = f.replace(/\.\w+$/, '')
    if (cleanFile === cleanSource || cleanFile.endsWith('/' + cleanSource)) return f
  }
  for (const f of files) {
    if (f.includes(cleanSource)) return f
  }
  return undefined
}

// ─── Clusters ──────────────────────────────────────────────────────────────────

/**
 * Identify clusters in the network.
 *
 * @example
 * identifyClusters(nodes, connections) // => MyceliumCluster[]
 */
export function identifyClusters(nodes: HyphaeNode[], connections: HyphaeConnection[]): MyceliumCluster[] {
  if (nodes.length === 0) return []

  const adjacency = new Map<string, Set<string>>()
  for (const n of nodes) adjacency.set(n.file, new Set())
  for (const c of connections) {
    const fromSet = adjacency.get(c.from)
    if (fromSet) fromSet.add(c.to)
    const toSet = adjacency.get(c.to)
    if (toSet) toSet.add(c.from)
  }

  const visited = new Set<string>()
  const clusters: MyceliumCluster[] = []
  let clusterIdx = 0

  for (const node of nodes) {
    if (visited.has(node.file)) continue
    const component: string[] = []
    const queue = [node.file]
    while (queue.length > 0) {
      const current = queue.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      component.push(current)
      const neighbors = adjacency.get(current) ?? new Set()
      for (const n of neighbors) {
        if (!visited.has(n)) queue.push(n)
      }
    }

    if (component.length === 0) continue

    const center = component.reduce((a, b) => {
      const aDeg = (adjacency.get(a)?.size ?? 0)
      const bDeg = (adjacency.get(b)?.size ?? 0)
      return aDeg >= bDeg ? a : b
    })

    const intraEdges = connections.filter(c => component.includes(c.from) && component.includes(c.to)).length
    const maxEdges = component.length * (component.length - 1)
    const density = maxEdges > 0 ? Math.round((intraEdges / maxEdges) * 100) : component.length === 1 ? 100 : 0

    const health = classifyClusterHealth(density, component.length)

    const nodeNames = ['spore', 'mycel', 'hypha', 'fruit', 'rhizo', 'root', 'cap', 'stem', 'gill', 'veil']
    const name = `${nodeNames[clusterIdx % nodeNames.length]}-${String.fromCharCode(65 + (clusterIdx % 26))}`

    clusters.push({
      name,
      nodes: component,
      center,
      radius: 1,
      density,
      health,
      sharedNutrients: [],
      description: `${component.length} node${component.length > 1 ? 's' : ''} in ${health} cluster`,
    })
    clusterIdx++
  }

  return clusters
}

/**
 * Classify cluster health.
 *
 * @example
 * classifyClusterHealth(80, 5) // => 'thriving'
 */
export function classifyClusterHealth(density: number, size: number): ClusterHealth {
  if (size === 1) return 'healthy'
  if (density >= 70) return 'thriving'
  if (density >= 40) return 'healthy'
  if (density >= 20) return 'stressed'
  if (density > 0) return 'dying'
  return 'dead'
}

// ─── Nutrient Flows ────────────────────────────────────────────────────────────

/**
 * Trace nutrient flows through the network.
 *
 * @example
 * traceNutrientFlows(nodes, connections) // => NutrientFlow[]
 */
export function traceNutrientFlows(files: string[], contents: string[], connections: HyphaeConnection[]): NutrientFlow[] {
  const flows: NutrientFlow[] = []
  const exportMap = new Map<string, { symbol: string; type: FlowType }[]>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const exports: { symbol: string; type: FlowType }[] = []
    for (const m of content.matchAll(/export\s+function\s+(\w+)/g)) exports.push({ symbol: m[1], type: 'function' })
    for (const m of content.matchAll(/export\s+const\s+(\w+)/g)) exports.push({ symbol: m[1], type: 'constant' })
    for (const m of content.matchAll(/export\s+class\s+(\w+)/g)) exports.push({ symbol: m[1], type: 'class' })
    for (const m of content.matchAll(/export\s+interface\s+(\w+)/g)) exports.push({ symbol: m[1], type: 'interface' })
    for (const m of content.matchAll(/export\s+type\s+(\w+)/g)) exports.push({ symbol: m[1], type: 'type' })
    exportMap.set(files[i], exports)
  }

  const flowMap = new Map<string, NutrientFlow>()
  for (const conn of connections) {
    for (const nutrient of conn.nutrients) {
      const key = `${conn.to}::${nutrient}`
      const existing = flowMap.get(key)
      if (existing) {
        if (!existing.destinations.includes(conn.from)) {
          existing.destinations.push(conn.from)
          existing.volume = existing.destinations.length
        }
      } else {
        let flowType: FlowType = 'constant'
        const exports = exportMap.get(conn.to) ?? []
        const found = exports.find(e => e.symbol === nutrient)
        if (found) flowType = found.type

        flowMap.set(key, {
          symbol: nutrient,
          origin: conn.to,
          destinations: [conn.from],
          flowType,
          volume: 1,
          isWellDistributed: false,
        })
      }
    }
  }

  for (const flow of flowMap.values()) {
    flow.isWellDistributed = flow.destinations.length >= 3
    flows.push(flow)
  }

  return flows
}

// ─── Network Metrics ───────────────────────────────────────────────────────────

/**
 * Compute network density 0-100.
 *
 * @example
 * computeNetworkDensity(nodes, connections) // => 45
 */
export function computeNetworkDensity(nodes: HyphaeNode[], connections: HyphaeConnection[]): number {
  const n = nodes.length
  if (n <= 1) return 100
  const maxEdges = n * (n - 1)
  const actualEdges = connections.length
  return Math.max(0, Math.min(100, Math.round((actualEdges / maxEdges) * 100)))
}

/**
 * Compute network resilience 0-100.
 *
 * @example
 * computeNetworkResilience(nodes, connections) // => 70
 */
export function computeNetworkResilience(nodes: HyphaeNode[], connections: HyphaeConnection[]): number {
  if (nodes.length === 0) return 100
  if (nodes.length === 1) return 100

  const adjacency = new Map<string, Set<string>>()
  for (const n of nodes) adjacency.set(n.file, new Set())
  for (const c of connections) {
    adjacency.get(c.from)?.add(c.to)
    adjacency.get(c.to)?.add(c.from)
  }

  const avgResilience = nodes.reduce((s, n) => s + n.resilience, 0) / nodes.length
  const hubRatio = nodes.filter(n => n.isHub).length / nodes.length
  const hubPenalty = hubRatio > 0.3 ? 15 : 0

  return Math.max(0, Math.min(100, Math.round(avgResilience - hubPenalty)))
}

/**
 * Compute monoculture risk 0-100.
 *
 * @example
 * computeMonocultureRisk(flows, nodes) // => 30
 */
export function computeMonocultureRisk(flows: NutrientFlow[], nodes: HyphaeNode[]): number {
  if (nodes.length === 0 || flows.length === 0) return 0

  const originCounts = new Map<string, number>()
  for (const f of flows) {
    originCounts.set(f.origin, (originCounts.get(f.origin) ?? 0) + f.volume)
  }

  const maxOriginVolume = Math.max(...originCounts.values())
  const totalVolume = flows.reduce((s, f) => s + f.volume, 0)

  if (totalVolume === 0) return 0
  const concentration = maxOriginVolume / totalVolume
  return Math.max(0, Math.min(100, Math.round(concentration * 100)))
}

/**
 * Find critical nodes whose removal fragments network.
 *
 * @example
 * findCriticalNodes(nodes, connections) // => 2
 */
export function findCriticalNodes(nodes: HyphaeNode[], connections: HyphaeConnection[]): number {
  if (nodes.length <= 2) return 0

  const adjacency = new Map<string, Set<string>>()
  for (const n of nodes) adjacency.set(n.file, new Set())
  for (const c of connections) {
    adjacency.get(c.from)?.add(c.to)
    adjacency.get(c.to)?.add(c.from)
  }

  const baseComponents = countComponents(nodes.map(n => n.file), adjacency)
  let critical = 0

  for (const node of nodes) {
    const remaining = nodes.filter(n => n.file !== node.file).map(n => n.file)
    if (remaining.length === 0) continue
    const components = countComponents(remaining, adjacency)
    if (components > baseComponents) critical++
  }

  return critical
}

function countComponents(files: string[], adjacency: Map<string, Set<string>>): number {
  const visited = new Set<string>()
  let components = 0

  for (const file of files) {
    if (visited.has(file)) continue
    components++
    const queue = [file]
    while (queue.length > 0) {
      const current = queue.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      const neighbors = adjacency.get(current) ?? new Set()
      for (const n of neighbors) {
        if (files.includes(n) && !visited.has(n)) queue.push(n)
      }
    }
  }

  return components
}

// ─── Network Health ────────────────────────────────────────────────────────────

/**
 * Classify overall network health.
 *
 * @example
 * classifyNetworkHealth(80, 75, clusters) // => 'flourishing'
 */
export function classifyNetworkHealth(density: number, resilience: number, clusters: MyceliumCluster[]): NetworkHealth {
  const dyingRatio = clusters.length > 0
    ? clusters.filter(c => c.health === 'dying' || c.health === 'dead').length / clusters.length : 0

  const composite = (density * 0.3) + (resilience * 0.4) + ((1 - dyingRatio) * 100 * 0.3)

  if (composite >= 75) return 'flourishing'
  if (composite >= 55) return 'healthy'
  if (composite >= 35) return 'stable'
  if (composite >= 15) return 'fragile'
  return 'collapsing'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate mycelium network recommendations.
 *
 * @example
 * generateRecommendations(nodes, conns, clusters, flows, stats) // => ['Remove...']
 */
export function generateRecommendations(
  nodes: HyphaeNode[],
  _connections: HyphaeConnection[],
  clusters: MyceliumCluster[],
  _flows: NutrientFlow[],
  stats: MyceliumStats,
): string[] {
  const recs: string[] = []

  const deadWood = nodes.filter(n => n.isDeadWood)
  if (deadWood.length > 0) {
    recs.push(`Remove or connect ${deadWood.length} dead-wood file${deadWood.length > 1 ? 's' : ''} not integrated into the network`)
  }

  const dying = clusters.filter(c => c.health === 'dying' || c.health === 'dead')
  if (dying.length > 0) {
    recs.push(`Investigate ${dying.length} dying cluster${dying.length > 1 ? 's' : ''} — poor connectivity or isolation`)
  }

  if (stats.criticalNodes > 0) {
    recs.push(`Add redundancy for ${stats.criticalNodes} critical node${stats.criticalNodes > 1 ? 's' : ''} whose removal would fragment the network`)
  }

  if (stats.monocultureRisk > 60) {
    recs.push('High monoculture risk — diversify dependencies to reduce single-point reliance')
  }

  const redundant = _connections.filter(c => c.isRedundant)
  if (redundant.length > 0) {
    recs.push(`Simplify ${redundant.length} redundant connection${redundant.length > 1 ? 's' : ''}`)
  }

  if (stats.networkHealth === 'fragile' || stats.networkHealth === 'collapsing') {
    recs.push('Network is fragile — consider adding more module connections to improve resilience')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete mycelium analysis result.
 *
 * @example
 * buildMyceliumResult(['a.ts'], ['code'], {}) // => MyceliumResult
 */
export function buildMyceliumResult(files: string[], contents: string[], options: MyceliumOptions): MyceliumResult {
  const nodes = buildNodes(files, contents)
  const connections = buildConnections(files, contents, nodes)

  for (const node of nodes) {
    node.connections = connections.filter(c => c.from === node.file || c.to === node.file)
  }

  const clusters = identifyClusters(nodes, connections)
  const flows = traceNutrientFlows(files, contents, connections)

  const networkDensity = computeNetworkDensity(nodes, connections)
  const networkResilience = computeNetworkResilience(nodes, connections)
  const monocultureRisk = computeMonocultureRisk(flows, nodes)
  const criticalNodes = findCriticalNodes(nodes, connections)
  const networkHealth = classifyNetworkHealth(networkDensity, networkResilience, clusters)

  const hubCount = nodes.filter(n => n.isHub).length
  const leafCount = nodes.filter(n => n.isLeaf).length
  const deadWoodCount = nodes.filter(n => n.isDeadWood).length
  const connCounts = nodes.map(n => n.connections.length)
  const avgConnections = nodes.length > 0 ? Math.round(connCounts.reduce((s, c) => s + c, 0) / nodes.length * 10) / 10 : 0
  const maxConnections = connCounts.length > 0 ? Math.max(...connCounts) : 0
  const avgResilience = nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.resilience, 0) / nodes.length) : 100
  const thrivingClusters = clusters.filter(c => c.health === 'thriving').length
  const dyingClusters = clusters.filter(c => c.health === 'dying' || c.health === 'dead').length
  const avgFlowVolume = flows.length > 0 ? Math.round(flows.reduce((s, f) => s + f.volume, 0) / flows.length * 10) / 10 : 0
  const redundantConnections = connections.filter(c => c.isRedundant).length

  if (options.verbose) {
    // Verbose includes additional detail
  }

  const stats: MyceliumStats = {
    totalNodes: nodes.length,
    totalConnections: connections.length,
    hubCount,
    leafCount,
    deadWoodCount,
    avgConnections,
    maxConnections,
    avgResilience,
    clusterCount: clusters.length,
    thrivingClusters,
    dyingClusters,
    totalFlows: flows.length,
    avgFlowVolume,
    redundantConnections,
    networkDensity,
    networkResilience,
    networkHealth,
    criticalNodes,
    monocultureRisk,
  }

  const recommendations = generateRecommendations(nodes, connections, clusters, flows, stats)

  return { nodes, connections, clusters, flows, stats, recommendations }
}
