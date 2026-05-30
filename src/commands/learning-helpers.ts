// ─── Interfaces ──────────────────────────────────────────

export interface Layer {
  name: string
  path: string
  description: string
  files: number
  keyFiles: string[]
  imports: string[]
}

export interface ArchitectureGuide {
  layers: Layer[]
  dataFlow: string
  dependencies: string
}

export interface ReadingItem {
  file: string
  reason: string
  complexity: number
  dependencies: number
  dependents: number
  category: 'entry' | 'core' | 'utility' | 'type' | 'test'
}

export interface PatternGuide {
  name: string
  description: string
  exampleFile: string
  frequency: number
}

export interface EntryPoint {
  command: string
  file: string
  description: string
}

export interface GlossaryEntry {
  term: string
  definition: string
  file: string
}

export interface LearningGuide {
  overview: string
  architecture: ArchitectureGuide
  readingOrder: ReadingItem[]
  keyPatterns: PatternGuide[]
  entryPoints: EntryPoint[]
  glossary: GlossaryEntry[]
  estimatedReadTime: number
}

export interface LearningOptions {
  role: 'junior' | 'mid' | 'senior'
  focus: 'architecture' | 'patterns' | 'workflow' | 'all'
}

export type ContentMap = Map<string, string>

// ─── Layer detection ────────────────────────────────────

const LAYER_DEFINITIONS: Array<{ pattern: RegExp; name: string; description: string }> = [
  { description: 'CLI command handlers — each file is a separate CLI command', name: 'Commands', pattern: /\/commands\// },
  { description: 'Core business logic — shared modules used across commands', name: 'Core', pattern: /\/core\// },
  { description: 'Utility functions — low-level helpers and shared tools', name: 'Utilities', pattern: /\/utils\// },
  { description: 'Type definitions — TypeScript interfaces and types', name: 'Types', pattern: /\/types\// },
]

/**
 * Group files into architecture layers by directory path.
 *
 * @example
 * ```ts
 * const layers = detectLayers(['src/commands/count.ts', 'src/core/file-discovery.ts'], contents)
 * layers.length // 2
 * ```
 */
export function detectLayers(filePaths: string[], contents: ContentMap): Layer[] {
  const layerMap = new Map<string, { files: string[]; name: string; path: string; description: string }>()

  for (const fp of filePaths) {
    const match = LAYER_DEFINITIONS.find((l) => l.pattern.test(fp))
    const layerName = match?.name ?? 'Other'
    const layerPath = extractLayerPath(fp, layerName)

    const existing = layerMap.get(layerName)
    if (existing) {
      existing.files.push(fp)
    } else {
      layerMap.set(layerName, {
        description: match?.description ?? 'Miscellaneous files not in a standard layer',
        files: [fp],
        name: layerName,
        path: layerPath,
      })
    }
  }

  const layers: Layer[] = []
  for (const [, data] of layerMap) {
    const keyFiles = findKeyFiles(data.files, contents)
    const imports = findLayerImports(data.files, contents, layerMap)
    layers.push({
      description: data.description,
      files: data.files.length,
      imports,
      keyFiles,
      name: data.name,
      path: data.path,
    })
  }

  return layers
}

function extractLayerPath(filePath: string, layerName: string): string {
  for (const def of LAYER_DEFINITIONS) {
    if (def.name === layerName) {
      const match = def.pattern.exec(filePath)
      if (match && match.index > 0) {
        return filePath.slice(0, match.index + 1) + match[0].replace(/\//g, '')
      }
    }
  }
  return 'src/'
}

function findKeyFiles(files: string[], contents: ContentMap): string[] {
  const scored = files.map((f) => {
    const content = contents.get(f) ?? ''
    const lines = content.split('\n').length
    return { file: f, lines }
  })
  scored.sort((a, b) => b.lines - a.lines)
  return scored.slice(0, 3).map((s) => s.file)
}

function findLayerImports(
  files: string[],
  contents: ContentMap,
  allLayers: Map<string, { name: string }>,
): string[] {
  const importedLayers = new Set<string>()
  const currentLayer = LAYER_DEFINITIONS.find((l) =>
    files.length > 0 && l.pattern.test(files[0] ?? ''),
  )?.name ?? 'Other'

  for (const f of files) {
    const content = contents.get(f) ?? ''
    for (const [layerName] of allLayers) {
      if (layerName === currentLayer) continue
      const pattern = LAYER_DEFINITIONS.find((l) => l.name === layerName)?.pattern
      if (pattern && pattern.test(content)) {
        importedLayers.add(layerName)
      }
    }
  }

  return Array.from(importedLayers)
}

// ─── Reading order ──────────────────────────────────────

/**
 * Compute reading order sorted by learning priority.
 *
 * @example
 * ```ts
 * const order = computeReadingOrder(['src/commands/count.ts'], contents)
 * order[0]?.category // 'entry'
 * ```
 */
export function computeReadingOrder(filePaths: string[], contents: ContentMap): ReadingItem[] {
  const items: ReadingItem[] = filePaths.map((f) => {
    const content = contents.get(f) ?? ''
    const category = categorizeFile(f, content)
    const imports = countImports(content)
    const dependents = countDependents(f, filePaths, contents)
    const complexity = computeComplexity(content, imports)
    const reason = buildReason(category, complexity, f)

    return { category, complexity, dependencies: imports, dependents, file: f, reason }
  })

  const categoryOrder: Record<string, number> = { entry: 0, core: 1, utility: 2, type: 3, test: 4 }
  items.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] ?? 5) - (categoryOrder[b.category] ?? 5)
    if (catDiff !== 0) return catDiff
    return a.dependencies - b.dependencies
  })

  return items
}

function categorizeFile(filePath: string, content: string): ReadingItem['category'] {
  if (/\/test\//.test(filePath) || /\.test\./.test(filePath)) return 'test'
  if (/extends\s+Command/.test(content) || /export\s+default\s+class/.test(content)) return 'entry'
  if (/\/types\//.test(filePath) || /^export\s+(interface|type)\s/.test(content)) return 'type'
  if (/\/core\//.test(filePath)) return 'core'
  return 'utility'
}

function countImports(content: string): number {
  const matches = content.match(/^import\s/gm)
  return matches ? matches.length : 0
}

function countDependents(file: string, allFiles: string[], contents: ContentMap): number {
  const baseName = file.replace(/\.[^.]+$/, '').split('/').pop() ?? ''
  let count = 0
  for (const other of allFiles) {
    if (other === file) continue
    const otherContent = contents.get(other) ?? ''
    if (otherContent.includes(baseName)) count++
  }
  return count
}

function computeComplexity(content: string, imports: number): number {
  const lines = content.split('\n').length
  let score = 0
  if (lines > 50) score++
  if (lines > 150) score++
  if (lines > 300) score++
  if (imports > 3) score++
  if (imports > 8) score++
  return Math.min(score + 1, 5)
}

function buildReason(category: ReadingItem['category'], complexity: number, file: string): string {
  const prefix = file.split('/').pop() ?? file
  switch (category) {
    case 'entry': return `${prefix} — CLI command entry point`
    case 'core': return `${prefix} — core module (complexity ${complexity}/5)`
    case 'utility': return `${prefix} — utility module`
    case 'type': return `${prefix} — type definitions`
    case 'test': return `${prefix} — test suite`
  }
}

// ─── Pattern detection ──────────────────────────────────

/**
 * Identify recurring code patterns across the codebase.
 *
 * @example
 * ```ts
 * const patterns = detectPatterns(files, contents)
 * patterns[0]?.name // 'Command Pattern'
 * ```
 */
export function detectPatterns(filePaths: string[], contents: ContentMap): PatternGuide[] {
  const patterns: PatternGuide[] = []

  const commandFiles = filePaths.filter((f) => /\/commands\//.test(f) && !/-helpers/.test(f) && !/-format-helpers/.test(f))
  let threeFileSplitCount = 0
  let exampleFile = ''
  for (const cmd of commandFiles) {
    const base = cmd.replace(/\.ts$/, '')
    const helpers = base + '-helpers.ts'
    const formatHelpers = base + '-format-helpers.ts'
    if (filePaths.includes(helpers) && filePaths.includes(formatHelpers)) {
      threeFileSplitCount++
      if (!exampleFile) exampleFile = cmd
    }
  }
  if (threeFileSplitCount > 0) {
    patterns.push({
      description: 'Each command is split into 3 files: command (oclif class), helpers (logic), format-helpers (output)',
      exampleFile: exampleFile || 'N/A',
      frequency: threeFileSplitCount,
      name: '3-File Split',
    })
  }

  const commandPatternCount = filePaths.filter((f) => {
    const content = contents.get(f) ?? ''
    return /extends\s+Command/.test(content)
  }).length
  if (commandPatternCount > 0) {
    patterns.push({
      description: 'CLI commands extend the oclif Command base class with static args, flags, and a run() method',
      exampleFile: filePaths.find((f) => (contents.get(f) ?? '').includes('extends Command')) ?? 'N/A',
      frequency: commandPatternCount,
      name: 'Command Pattern',
    })
  }

  const interfaceCount = filePaths.filter((f) => {
    const content = contents.get(f) ?? ''
    return /^export\s+interface\s/gm.test(content)
  }).length
  if (interfaceCount > 0) {
    patterns.push({
      description: 'TypeScript interfaces define data contracts for inputs, outputs, and intermediate structures',
      exampleFile: filePaths.find((f) => (contents.get(f) ?? '').includes('export interface')) ?? 'N/A',
      frequency: interfaceCount,
      name: 'Interface Pattern',
    })
  }

  const namedExportCount = filePaths.filter((f) => {
    const content = contents.get(f) ?? ''
    return /^export\s+(function|const|class|async)/gm.test(content)
  }).length
  if (namedExportCount > 0) {
    patterns.push({
      description: 'Named exports for functions and classes, enabling tree-shaking and explicit imports',
      exampleFile: filePaths.find((f) => (contents.get(f) ?? '').includes('export function')) ?? 'N/A',
      frequency: namedExportCount,
      name: 'Named Export',
    })
  }

  return patterns
}

// ─── Entry point detection ──────────────────────────────

/**
 * Find CLI entry points by detecting Command class extensions.
 *
 * @example
 * ```ts
 * const entries = findEntryPoints(files, contents)
 * entries[0]?.command // 'count'
 * ```
 */
export function findEntryPoints(filePaths: string[], contents: ContentMap): EntryPoint[] {
  const entries: EntryPoint[] = []

  for (const f of filePaths) {
    const content = contents.get(f) ?? ''
    const classMatch = /export\s+default\s+class\s+(\w+)/.exec(content)
    if (!classMatch) continue
    if (!content.includes('extends Command')) continue

    const className = classMatch[1] ?? ''
    const descMatch = /static\s+override\s+description\s+=\s+'([^']+)'/.exec(content)
    const description = descMatch?.[1] ?? `${className} command`

    const command = className.toLowerCase()
    entries.push({ command, description, file: f })
  }

  return entries
}

// ─── Glossary ───────────────────────────────────────────

/**
 * Extract key terms (interfaces, types) used across multiple files.
 *
 * @example
 * ```ts
 * const glossary = buildGlossary(contents)
 * glossary[0]?.term // 'CountResult'
 * ```
 */
export function buildGlossary(contents: ContentMap): GlossaryEntry[] {
  const termFiles = new Map<string, { count: number; definition: string; definingFile: string }>()

  for (const [file, content] of contents) {
    const interfaceMatches = content.matchAll(/export\s+interface\s+(\w+)/g)
    for (const m of interfaceMatches) {
      const term = m[1] ?? ''
      const existing = termFiles.get(term)
      if (existing) {
        existing.count++
      } else {
        termFiles.set(term, { count: 1, definingFile: file, definition: `Interface: ${term}` })
      }
    }

    const typeMatches = content.matchAll(/export\s+type\s+(\w+)/g)
    for (const m of typeMatches) {
      const term = m[1] ?? ''
      const existing = termFiles.get(term)
      if (existing) {
        existing.count++
      } else {
        termFiles.set(term, { count: 1, definingFile: file, definition: `Type alias: ${term}` })
      }
    }
  }

  const entries: GlossaryEntry[] = []
  for (const [term, data] of termFiles) {
    entries.push({
      definition: data.definition,
      file: data.definingFile,
      term,
    })
  }

  entries.sort((a, b) => a.term.localeCompare(b.term))
  return entries
}

// ─── Build learning guide ───────────────────────────────

/**
 * Orchestrate full learning guide generation.
 *
 * @example
 * ```ts
 * const guide = await buildLearningGuide('.', ['src/commands/count.ts'], contents, { role: 'junior', focus: 'all' })
 * guide.estimatedReadTime // number
 * ```
 */
export function buildLearningGuide(
  _cwd: string,
  filePaths: string[],
  contents: ContentMap,
  options: LearningOptions,
): LearningGuide {
  const layers = detectLayers(filePaths, contents)
  const readingOrder = computeReadingOrder(filePaths, contents)
  const keyPatterns = detectPatterns(filePaths, contents)
  const entryPoints = findEntryPoints(filePaths, contents)
  const glossary = buildGlossary(contents)

  const totalLines = Array.from(contents.values()).reduce((sum, c) => sum + c.split('\n').length, 0)
  const wordsPerMinute = options.role === 'junior' ? 100 : options.role === 'senior' ? 200 : 150
  const estimatedReadTime = Math.max(1, Math.round(totalLines / wordsPerMinute))

  const overview = buildOverview(filePaths, layers, options)
  const architecture = buildArchitectureGuide(layers, filePaths, contents)

  return {
    architecture,
    entryPoints,
    estimatedReadTime,
    glossary,
    keyPatterns,
    overview,
    readingOrder,
  }
}

function buildOverview(files: string[], layers: Layer[], options: LearningOptions): string {
  const roleLabel = options.role === 'junior' ? 'beginner' : options.role === 'senior' ? 'expert' : 'intermediate'
  return `This codebase has ${files.length} files across ${layers.length} layers. This guide is tailored for a ${roleLabel} developer.`
}

function buildArchitectureGuide(layers: Layer[], _filePaths: string[], _contents: ContentMap): ArchitectureGuide {
  const dataFlow = layers.length > 0
    ? `Data flows from ${layers.map((l) => l.name).join(' → ')}`
    : 'Single-layer codebase'

  const deps = layers
    .filter((l) => l.imports.length > 0)
    .map((l) => `${l.name} depends on ${l.imports.join(', ')}`)
    .join('; ')

  return {
    dataFlow,
    dependencies: deps || 'No inter-layer dependencies detected',
    layers,
  }
}
