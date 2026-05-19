// ─── Types ────────────────────────────────────────────────────────────────────

export type GeneType = 'structural' | 'naming' | 'control-flow' | 'error-handling' | 'async' | 'import' | 'export' | 'typing'

export interface Gene {
  name: string
  type: GeneType
  pattern: string
  frequency: number
  prevalence: number
  isDominant: boolean
  isMutation: boolean
  files: string[]
}

export interface Genome {
  genes: Gene[]
  dominantTraits: Gene[]
  recessiveTraits: Gene[]
  mutations: Gene[]
  similarity: number
}

export interface SpeciesMatch {
  file: string
  dominantGenes: string[]
  species: string
  similarity: number
}

export interface GenomeStats {
  totalGenes: number
  dominantCount: number
  recessiveCount: number
  mutationCount: number
  genomeSimilarity: number
  mostCommonGene: string
  rarestGene: string
  speciesCount: number
}

export interface GenomeResult {
  genome: Genome
  species: SpeciesMatch[]
  stats: GenomeStats
  recommendations: string[]
}

export interface GenomeOptions {
  verbose?: boolean
}

// ─── Gene Detectors ───────────────────────────────────────────────────────────

/**
 * Detect structural genes — arrow vs function, class vs functional.
 *
 * @example
 * detectStructuralGenes(content, 'a.ts')
 */
export function detectStructuralGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const arrowCount = (content.match(/=>\s*[{(]/g) ?? []).length
  genes.push(makeGene('arrow-function', 'structural', '=> expr', arrowCount, file))

  const funcDeclCount = (content.match(/\bfunction\s+\w+/g) ?? []).length
  genes.push(makeGene('function-declaration', 'structural', 'function name()', funcDeclCount, file))

  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  genes.push(makeGene('class-based', 'structural', 'class Name', classCount, file))

  const exportCount = (content.match(/\bexport\s+(?:default\s+)?/g) ?? []).length
  genes.push(makeGene('multi-export', 'structural', 'export ...', exportCount > 1 ? 1 : 0, file))

  return genes
}

/**
 * Detect naming convention genes.
 *
 * @example
 * detectNamingGenes(content, 'a.ts')
 */
export function detectNamingGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const camelCase = (content.match(/\b[a-z][a-zA-Z0-9]*\b/g) ?? []).filter((m) => m.length > 3 && /[a-z][A-Z]/.test(m)).length
  genes.push(makeGene('camelCase', 'naming', 'camelCaseIdentifiers', camelCase, file))

  const pascalCase = (content.match(/\b[A-Z][a-zA-Z0-9]*\b/g) ?? []).filter((m) => m.length > 2 && !m.includes('_')).length
  genes.push(makeGene('PascalCase', 'naming', 'PascalCaseIdentifiers', pascalCase, file))

  const snakeCase = (content.match(/\b[a-z][a-z0-9_]*_[a-z0-9_]*\b/g) ?? []).length
  genes.push(makeGene('snake_case', 'naming', 'snake_case_identifiers', snakeCase, file))

  const upperSnake = (content.match(/\b[A-Z][A-Z0-9_]{2,}\b/g) ?? []).length
  genes.push(makeGene('UPPER_SNAKE', 'naming', 'UPPER_SNAKE_CASE', upperSnake, file))

  return genes
}

/**
 * Detect control flow genes.
 *
 * @example
 * detectControlFlowGenes(content, 'a.ts')
 */
export function detectControlFlowGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const earlyReturn = (content.match(/if\s*\([^)]+\)\s*\{\s*return/g) ?? []).length
  genes.push(makeGene('early-return', 'control-flow', 'if (x) { return', earlyReturn, file))

  const switchCount = (content.match(/\bswitch\s*\(/g) ?? []).length
  genes.push(makeGene('switch-statement', 'control-flow', 'switch (x)', switchCount, file))

  const ternaryCount = (content.match(/\?\s*[^?]*\s*:/g) ?? []).length
  genes.push(makeGene('ternary-expression', 'control-flow', 'x ? a : b', ternaryCount, file))

  const elseIfCount = (content.match(/\}\s*else\s+if/g) ?? []).length
  genes.push(makeGene('else-if-chain', 'control-flow', '} else if', elseIfCount, file))

  return genes
}

/**
 * Detect error handling genes.
 *
 * @example
 * detectErrorHandlingGenes(content, 'a.ts')
 */
export function detectErrorHandlingGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const tryCatchCount = (content.match(/\btry\s*\{/g) ?? []).length
  genes.push(makeGene('try-catch', 'error-handling', 'try { } catch', tryCatchCount, file))

  const catchMethod = (content.match(/\.catch\s*\(/g) ?? []).length
  genes.push(makeGene('catch-method', 'error-handling', '.catch()', catchMethod, file))

  const customError = (content.match(/\bnew\s+\w*Error\w*\(/g) ?? []).length
  genes.push(makeGene('custom-error', 'error-handling', 'new CustomError()', customError, file))

  const throwCount = (content.match(/\bthrow\s+/g) ?? []).length
  genes.push(makeGene('throw-statement', 'error-handling', 'throw ...', throwCount, file))

  return genes
}

/**
 * Detect async pattern genes.
 *
 * @example
 * detectAsyncGenes(content, 'a.ts')
 */
export function detectAsyncGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const asyncAwait = (content.match(/\bawait\s+/g) ?? []).length
  genes.push(makeGene('async-await', 'async', 'await expr', asyncAwait, file))

  const thenMethod = (content.match(/\.then\s*\(/g) ?? []).length
  genes.push(makeGene('then-chain', 'async', '.then()', thenMethod, file))

  const promiseAll = (content.match(/Promise\.all/g) ?? []).length
  genes.push(makeGene('Promise.all', 'async', 'Promise.all()', promiseAll, file))

  const callback = (content.match(/\bfunction\s*\([^)]*(?:callback|cb|next)\b/g) ?? []).length
  genes.push(makeGene('callback-pattern', 'async', 'function(cb)', callback, file))

  return genes
}

/**
 * Detect import pattern genes.
 *
 * @example
 * detectImportGenes(content, 'a.ts')
 */
export function detectImportGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const namedImport = (content.match(/import\s+\{[^}]+\}\s+from/g) ?? []).length
  genes.push(makeGene('named-import', 'import', 'import { x } from', namedImport, file))

  const defaultImport = (content.match(/import\s+\w+\s+from/g) ?? []).length
  genes.push(makeGene('default-import', 'import', 'import x from', defaultImport, file))

  const typeImport = (content.match(/import\s+type\s+/g) ?? []).length
  genes.push(makeGene('type-only-import', 'import', 'import type { x }', typeImport, file))

  const reExport = (content.match(/export\s+\{[^}]+\}\s+from/g) ?? []).length
  genes.push(makeGene('re-export', 'import', 'export { x } from', reExport, file))

  return genes
}

/**
 * Detect export pattern genes.
 *
 * @example
 * detectExportGenes(content, 'a.ts')
 */
export function detectExportGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const namedExport = (content.match(/export\s+(?:const|function|class|interface|type)\s+\w+/g) ?? []).length
  genes.push(makeGene('named-export', 'export', 'export const/func/class', namedExport, file))

  const defaultExport = (content.match(/export\s+default\s+/g) ?? []).length
  genes.push(makeGene('default-export', 'export', 'export default', defaultExport, file))

  const typeExport = (content.match(/export\s+(?:type|interface)\s+\w+/g) ?? []).length
  genes.push(makeGene('type-export', 'export', 'export type/interface', typeExport, file))

  return genes
}

/**
 * Detect typing pattern genes.
 *
 * @example
 * detectTypingGenes(content, 'a.ts')
 */
export function detectTypingGenes(content: string, file: string): Gene[] {
  const genes: Gene[] = []

  const explicitType = (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/g) ?? []).length
  genes.push(makeGene('explicit-type', 'typing', ': type', explicitType, file))

  const interfaceUsage = (content.match(/\binterface\s+\w+/g) ?? []).length
  genes.push(makeGene('interface', 'typing', 'interface Name', interfaceUsage, file))

  const typeAlias = (content.match(/\btype\s+\w+\s*=/g) ?? []).length
  genes.push(makeGene('type-alias', 'typing', 'type Name =', typeAlias, file))

  const generics = (content.match(/<\w+>/g) ?? []).length
  genes.push(makeGene('generics', 'typing', '<T>', generics, file))

  return genes
}

function makeGene(name: string, type: GeneType, pattern: string, frequency: number, file: string): Gene {
  return {
    name,
    type,
    pattern,
    frequency,
    prevalence: 0,
    isDominant: false,
    isMutation: false,
    files: [file],
  }
}

// ─── Genome Computation ───────────────────────────────────────────────────────

/**
 * Compute genome from per-file gene detections.
 *
 * @example
 * computeGenome(allGenes, totalFiles)
 */
export function computeGenome(allGenes: Gene[], totalFiles: number): Genome {
  const geneMap = new Map<string, Gene>()

  for (const gene of allGenes) {
    const existing = geneMap.get(gene.name)
    if (existing) {
      existing.frequency += gene.frequency
      if (!existing.files.includes(gene.files[0]!)) {
        existing.files.push(gene.files[0]!)
      }
    } else {
      geneMap.set(gene.name, { ...gene })
    }
  }

  const genes = Array.from(geneMap.values())

  for (const gene of genes) {
    gene.prevalence = totalFiles > 0 ? Math.round((gene.files.length / totalFiles) * 100) : 0
    gene.isDominant = gene.prevalence >= 50
    gene.isMutation = gene.prevalence > 0 && gene.prevalence < 5
  }

  const dominantTraits = genes.filter((g) => g.isDominant)
  const recessiveTraits = genes.filter((g) => !g.isDominant && g.prevalence >= 10 && g.prevalence < 50)
  const mutations = genes.filter((g) => g.isMutation)

  const similarity = computeSimilarity(genes)

  return { genes, dominantTraits, recessiveTraits, mutations, similarity }
}

/**
 * Compute genome similarity (0-100).
 *
 * @example
 * computeSimilarity(genes)
 */
export function computeSimilarity(genes: Gene[]): number {
  if (genes.length === 0) return 100

  const activeGenes = genes.filter((g) => g.frequency > 0)
  if (activeGenes.length === 0) return 100

  const avgPrevalence = activeGenes.reduce((s, g) => s + g.prevalence, 0) / activeGenes.length
  return Math.round(avgPrevalence)
}

// ─── Species Classification ───────────────────────────────────────────────────

/**
 * Classify a file into a species.
 *
 * @example
 * classifySpecies('a.ts', fileGenes, genome)
 */
export function classifySpecies(file: string, fileGenes: Gene[], genome: Genome): SpeciesMatch {
  const dominantNames = new Set(genome.dominantTraits.map((g) => g.name))
  const matchingGenes = fileGenes.filter((g) => dominantNames.has(g.name) && g.frequency > 0)
  const dominantGeneNames = matchingGenes.map((g) => g.name)

  const similarity = genome.genes.length > 0
    ? Math.round((matchingGenes.length / Math.max(genome.dominantTraits.length, 1)) * 100)
    : 0

  const species = generateSpeciesName(dominantGeneNames, file)

  return { file, dominantGenes: dominantGeneNames, species, similarity }
}

function generateSpeciesName(genes: string[], file: string): string {
  if (genes.length === 0) return 'Alien Species'

  const prefixes: Record<string, string> = {
    'arrow-function': 'Lambda',
    'function-declaration': 'Funcus',
    'class-based': 'Classis',
    'async-await': 'Asyncus',
    'try-catch': 'Guardius',
    'named-export': 'Exportus',
    'interface': 'Typus',
    'camelCase': 'Camelus',
  }

  const prefix = genes
    .map((g) => prefixes[g] ?? '')
    .filter(Boolean)[0] ?? 'Codex'

  const dir = file.includes('/') ? file.split('/').slice(-2, -1)[0] : 'root'
  return `${prefix} ${dir ?? 'unknown'}icus`
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute genome stats.
 *
 * @example
 * computeGenomeStats(genome, species)
 */
export function computeGenomeStats(genome: Genome, species: SpeciesMatch[]): GenomeStats {
  const { genes, dominantTraits, mutations } = genome

  const mostCommon = genes.length > 0
    ? genes.reduce((a, b) => a.frequency >= b.frequency ? a : b).name
    : ''

  const activeGenes = genes.filter((g) => g.frequency > 0)
  const rarest = activeGenes.length > 0
    ? activeGenes.reduce((a, b) => a.frequency <= b.frequency ? a : b).name
    : ''

  return {
    totalGenes: genes.length,
    dominantCount: dominantTraits.length,
    recessiveCount: genes.filter((g) => !g.isDominant && !g.isMutation).length,
    mutationCount: mutations.length,
    genomeSimilarity: genome.similarity,
    mostCommonGene: mostCommon,
    rarestGene: rarest,
    speciesCount: species.length,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate genome recommendations.
 *
 * @example
 * generateGenomeRecommendations(genome, stats)
 */
export function generateGenomeRecommendations(genome: Genome, stats: GenomeStats): string[] {
  const recs: string[] = []

  if (stats.genomeSimilarity < 50) {
    recs.push(`Low genome similarity (${stats.genomeSimilarity}%) — consider establishing a style guide`)
  }

  if (genome.mutations.length > 0) {
    recs.push(`${genome.mutations.length} mutation(s) detected — evaluate if rare patterns should spread or be removed`)
  }

  const arrowFunc = genome.genes.find((g) => g.name === 'arrow-function')
  const funcDecl = genome.genes.find((g) => g.name === 'function-declaration')
  if (arrowFunc && funcDecl && arrowFunc.frequency > 0 && funcDecl.frequency > 0) {
    const ratio = arrowFunc.frequency / (arrowFunc.frequency + funcDecl.frequency)
    if (ratio > 0.3 && ratio < 0.7) {
      recs.push('Mixed arrow/function declarations — standardize on one style')
    }
  }

  const namedExport = genome.genes.find((g) => g.name === 'named-export')
  const defaultExport = genome.genes.find((g) => g.name === 'default-export')
  if (namedExport && defaultExport && namedExport.frequency > 0 && defaultExport.frequency > 0) {
    recs.push('Mixed named/default exports — prefer named exports for consistency')
  }

  if (stats.dominantCount < 3) {
    recs.push('Few dominant traits — codebase lacks strong conventions')
  }

  if (recs.length === 0) {
    recs.push('Genome is healthy — consistent patterns across the codebase')
  }

  return recs
}

// ─── buildGenomeResult ────────────────────────────────────────────────────────

/**
 * Build the complete genome analysis result.
 *
 * @example
 * buildGenomeResult(['a.ts'], ['const x = 1'])
 */
export function buildGenomeResult(
  files: string[],
  contents: string[],
  _options?: GenomeOptions,
): GenomeResult {
  const allGenes: Gene[] = []
  const fileGenesMap: Map<string, Gene[]> = new Map()

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''

    const fileGenes = [
      ...detectStructuralGenes(content, file),
      ...detectNamingGenes(content, file),
      ...detectControlFlowGenes(content, file),
      ...detectErrorHandlingGenes(content, file),
      ...detectAsyncGenes(content, file),
      ...detectImportGenes(content, file),
      ...detectExportGenes(content, file),
      ...detectTypingGenes(content, file),
    ]

    fileGenesMap.set(file, fileGenes)
    allGenes.push(...fileGenes)
  }

  const genome = computeGenome(allGenes, files.length)

  const species = files.map((file) => {
    const fileGenes = fileGenesMap.get(file) ?? []
    return classifySpecies(file, fileGenes, genome)
  })

  const stats = computeGenomeStats(genome, species)
  const recommendations = generateGenomeRecommendations(genome, stats)

  return { genome, species, stats, recommendations }
}
