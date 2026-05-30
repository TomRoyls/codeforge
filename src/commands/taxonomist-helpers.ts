// ─── Types ────────────────────────────────────────────────────────────────────

export type TaxonRank = 'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species'

export interface Taxon {
  rank: TaxonRank
  name: string
  description: string
  children: Taxon[]
  files: string[]
  fileCount: number
  traits: string[]
}

export interface Classification {
  file: string
  taxonomy: Record<TaxonRank, string>
  traits: string[]
  confidence: number
  closestRelative: string
  similarity: number
}

export interface TaxonomyStats {
  totalFiles: number
  totalTaxa: number
  depth: number
  largestGroup: string
  smallestGroup: string
  avgGroupSize: number
  orphanCount: number
  coverageScore: number
}

export interface TaxonomyResult {
  taxonomy: Taxon
  classifications: Classification[]
  stats: TaxonomyStats
  recommendations: string[]
}

export interface TaxonomistOptions {
  verbose?: boolean
}

// ─── Kingdom Classification ───────────────────────────────────────────────────

/**
 * Classify file into kingdom.
 *
 * @example
 * classifyKingdom('src/commands/count.ts')
 */
export function classifyKingdom(file: string): string {
  const lower = file.toLowerCase()

  if (lower.includes('test') || lower.includes('spec') || lower.includes('__test__')) return 'Test'
  if (lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.doc')) return 'Documentation'
  if (lower.includes('config') || lower.includes('.rc') || lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'Config'

  return 'Source'
}

// ─── Phylum Classification ────────────────────────────────────────────────────

/**
 * Classify file into phylum.
 *
 * @example
 * classifyPhylum('src/commands/count.ts', content, 'Source')
 */
export function classifyPhylum(file: string, content: string, kingdom: string): string {
  if (kingdom === 'Test') {
    if (file.includes('fixture') || file.includes('fixture')) return 'Fixture'
    if (file.includes('mock') || file.includes('stub')) return 'Mock'
    if (file.includes('integration') || file.includes('e2e')) return 'Integration'
    return 'Unit'
  }

  if (kingdom === 'Documentation') return 'Markdown'
  if (kingdom === 'Config') return 'Settings'

  // Source kingdom
  if (file.includes('command') || file.includes('commands')) return 'Command'
  if (file.includes('core')) return 'Core'
  if (file.includes('util') || file.includes('helper')) return 'Utility'
  if (content.includes('interface ') || content.includes('type ') && content.includes('export type')) return 'Type'

  // Heuristic: check content
  const hasExportedFunctions = /export\s+(?:async\s+)?function\s/.test(content)
  const hasFlags = /Flags\./.test(content)
  if (hasFlags && hasExportedFunctions) return 'Command'
  if (hasExportedFunctions) return 'Utility'

  return 'Utility'
}

// ─── Class Classification ─────────────────────────────────────────────────────

/**
 * Classify file into class rank.
 *
 * @example
 * classifyClass('src/commands/count.ts', content, 'Command')
 */
export function classifyClass(file: string, content: string, phylum: string): string {
  if (phylum === 'Command') {
    if (file.includes('report') || file.includes('format')) return 'Reporting'
    if (file.includes('config') || file.includes('init')) return 'Config'
    if (file.includes('discover') || file.includes('find')) return 'Discovery'
    return 'Analysis'
  }

  if (phylum === 'Core') {
    if (content.includes('export ') && content.includes('class ')) return 'Engine'
    return 'Foundation'
  }

  if (phylum === 'Unit') return 'Assertion'
  if (phylum === 'Integration') return 'Workflow'

  return 'General'
}

// ─── Order Classification ─────────────────────────────────────────────────────

/**
 * Classify file into order.
 *
 * @example
 * classifyOrder('src/commands/count.ts', content, 'Analysis')
 */
export function classifyOrder(_file: string, content: string, classRank: string): string {
  if (classRank === 'Analysis') {
    if (content.includes('regex') || content.includes('match') || content.includes('pattern')) return 'Pattern'
    if (content.includes('score') || content.includes('metric') || content.includes('count')) return 'Metric'
    if (content.includes('parse') || content.includes('transform')) return 'Dynamic'
    return 'Static'
  }

  if (classRank === 'Reporting') return 'Output'
  if (classRank === 'Discovery') return 'Scan'

  return 'Standard'
}

// ─── Family Classification ────────────────────────────────────────────────────

/**
 * Classify file into family based on size.
 *
 * @example
 * classifyFamily(content)
 */
export function classifyFamily(content: string): string {
  const lines = content.split('\n').length

  if (lines <= 50) return 'Compact'
  if (lines <= 150) return 'Medium'
  if (lines <= 400) return 'Large'
  return 'Massive'
}

// ─── Genus Classification ─────────────────────────────────────────────────────

/**
 * Classify file into genus based on structure.
 *
 * @example
 * classifyGenus(content)
 */
export function classifyGenus(content: string): string {
  const exports = content.match(/^export\s+(?:default\s+)?(?:function|const|class|interface|type|enum)/gm)
  const exportCount = exports ? exports.length : 0

  const imports = content.match(/^import\s/gm)
  const importCount = imports ? imports.length : 0

  if (exportCount === 0 && importCount === 0) return 'Standalone'
  if (exportCount >= 5) return 'MultiExport'
  if (exportCount === 1 && importCount > 3) return 'Aggregator'
  if (importCount === 0 && exportCount > 0) return 'SelfContained'
  if (importCount > 5) return 'Connected'
  return 'Simple'
}

// ─── Trait Detection ──────────────────────────────────────────────────────────

/**
 * Detect traits of a file.
 *
 * @example
 * detectTraits(file, content)
 */
export function detectTraits(_file: string, content: string): string[] {
  const traits: string[] = []

  if (/export\s+default\s/.test(content)) traits.push('has-default-export')
  if (/export\s+(?:async\s+)?function\s/.test(content)) traits.push('exports-functions')
  if (/export\s+interface\s/.test(content)) traits.push('exports-interfaces')
  if (/export\s+type\s/.test(content)) traits.push('exports-types')
  if (/export\s+const\s/.test(content)) traits.push('exports-constants')
  if (/export\s+class\s/.test(content)) traits.push('exports-classes')
  if (/import\s/.test(content)) traits.push('has-imports')
  if (/async\s+/.test(content)) traits.push('uses-async')
  if (/class\s+\w+/.test(content)) traits.push('uses-classes')
  if (/interface\s+\w+/.test(content)) traits.push('uses-interfaces')
  if (/try\s*\{/.test(content)) traits.push('error-handling')
  if (/\/\*\*/.test(content)) traits.push('has-jsdoc')
  if (content.includes('chalk')) traits.push('terminal-output')
  if (content.includes('ora')) traits.push('progress-indicator')
  if (content.includes('vitest') || content.includes('jest') || content.includes('describe(')) traits.push('test-suite')

  const lines = content.split('\n').length
  if (lines > 200) traits.push('large-file')
  else if (lines < 30) traits.push('small-file')

  return traits
}

// ─── Full Classification ──────────────────────────────────────────────────────

/**
 * Classify a file into the full taxonomy.
 *
 * @example
 * classifyFile('src/commands/count.ts', content)
 */
export function classifyFile(file: string, content: string): Classification {
  const kingdom = classifyKingdom(file)
  const phylum = classifyPhylum(file, content, kingdom)
  const classRank = classifyClass(file, content, phylum)
  const order = classifyOrder(file, content, classRank)
  const family = classifyFamily(content)
  const genus = classifyGenus(content)

  const taxonomy: Record<TaxonRank, string> = {
    kingdom,
    phylum,
    class: classRank,
    order,
    family,
    genus,
    species: file,
  }

  const traits = detectTraits(file, content)
  const confidence = computeClassificationConfidence(taxonomy, traits)

  return {
    file,
    taxonomy,
    traits,
    confidence,
    closestRelative: '',
    similarity: 0,
  }
}

/**
 * Compute confidence score for a classification.
 *
 * @example
 * computeClassificationConfidence(taxonomy, traits)
 */
export function computeClassificationConfidence(
  taxonomy: Record<TaxonRank, string>,
  traits: string[],
): number {
  let confidence = 50

  // More traits = more confident
  confidence += Math.min(20, traits.length * 3)

  // General classifications reduce confidence
  if (taxonomy.genus === 'Simple') confidence -= 5
  if (taxonomy.order === 'Standard') confidence -= 5

  // Specific classifications increase confidence
  if (taxonomy.phylum !== 'Utility') confidence += 10

  return Math.max(0, Math.min(100, confidence))
}

// ─── Similarity ───────────────────────────────────────────────────────────────

/**
 * Compute similarity between two classifications.
 *
 * @example
 * computeSimilarity(class1, class2)
 */
export function computeSimilarity(class1: Classification, class2: Classification): number {
  const ranks: TaxonRank[] = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']
  let matches = 0

  for (const rank of ranks) {
    if (class1.taxonomy[rank] === class2.taxonomy[rank]) matches++
  }

  const taxonSimilarity = (matches / ranks.length) * 70

  const set1 = new Set(class1.traits)
  const set2 = new Set(class2.traits)
  const intersection = [...set1].filter((t) => set2.has(t)).length
  const union = new Set([...set1, ...set2]).size
  const traitSimilarity = union > 0 ? (intersection / union) * 30 : 0

  return Math.round(taxonSimilarity + traitSimilarity)
}

/**
 * Find closest relative for a file.
 *
 * @example
 * findClosestRelative(classification, allClassifications)
 */
export function findClosestRelative(
  classification: Classification,
  allClassifications: Classification[],
): { file: string; similarity: number } {
  let bestFile = ''
  let bestSimilarity = 0

  for (const other of allClassifications) {
    if (other.file === classification.file) continue
    const sim = computeSimilarity(classification, other)
    if (sim > bestSimilarity) {
      bestSimilarity = sim
      bestFile = other.file
    }
  }

  return { file: bestFile, similarity: bestSimilarity }
}

// ─── Taxonomy Tree ────────────────────────────────────────────────────────────

/**
 * Build the taxonomy tree from classifications.
 *
 * @example
 * buildTaxonomyTree(classifications)
 */
export function buildTaxonomyTree(classifications: Classification[]): Taxon {
  const root: Taxon = {
    rank: 'kingdom',
    name: 'Codebase',
    description: 'Root of the codebase taxonomy',
    children: [],
    files: classifications.map((c) => c.file),
    fileCount: classifications.length,
    traits: [],
  }

  // Group by kingdom
  const kingdomGroups = groupBy(classifications, (c) => c.taxonomy.kingdom)

  for (const [kingdomName, kingdomClasses] of kingdomGroups) {
    const kingdom: Taxon = {
      rank: 'kingdom',
      name: kingdomName,
      description: `${kingdomName} files`,
      children: [],
      files: kingdomClasses.map((c) => c.file),
      fileCount: kingdomClasses.length,
      traits: extractGroupTraits(kingdomClasses),
    }

    // Group by phylum
    const phylumGroups = groupBy(kingdomClasses, (c) => c.taxonomy.phylum)
    for (const [phylumName, phylumClasses] of phylumGroups) {
      const phylum: Taxon = {
        rank: 'phylum',
        name: phylumName,
        description: `${phylumName} within ${kingdomName}`,
        children: [],
        files: phylumClasses.map((c) => c.file),
        fileCount: phylumClasses.length,
        traits: extractGroupTraits(phylumClasses),
      }

      // Group by class
      const classGroups = groupBy(phylumClasses, (c) => c.taxonomy.class)
      for (const [className, classClasses] of classGroups) {
        const classTaxon: Taxon = {
          rank: 'class',
          name: className,
          description: `${className} within ${phylumName}`,
          children: [],
          files: classClasses.map((c) => c.file),
          fileCount: classClasses.length,
          traits: extractGroupTraits(classClasses),
        }

        // Group by order
        const orderGroups = groupBy(classClasses, (c) => c.taxonomy.order)
        for (const [orderName, orderClasses] of orderGroups) {
          const order: Taxon = {
            rank: 'order',
            name: orderName,
            description: `${orderName} within ${className}`,
            children: [],
            files: orderClasses.map((c) => c.file),
            fileCount: orderClasses.length,
            traits: extractGroupTraits(orderClasses),
          }

          // Group by family
          const familyGroups = groupBy(orderClasses, (c) => c.taxonomy.family)
          for (const [familyName, familyClasses] of familyGroups) {
            const family: Taxon = {
              rank: 'family',
              name: familyName,
              description: `${familyName} files`,
              children: [],
              files: familyClasses.map((c) => c.file),
              fileCount: familyClasses.length,
              traits: extractGroupTraits(familyClasses),
            }

            // Group by genus
            const genusGroups = groupBy(familyClasses, (c) => c.taxonomy.genus)
            for (const [genusName, genusClasses] of genusGroups) {
              const genus: Taxon = {
                rank: 'genus',
                name: genusName,
                description: `${genusName} pattern`,
                children: [],
                files: genusClasses.map((c) => c.file),
                fileCount: genusClasses.length,
                traits: extractGroupTraits(genusClasses),
              }

              family.children.push(genus)
            }

            order.children.push(family)
          }

          classTaxon.children.push(order)
        }

        phylum.children.push(classTaxon)
      }

      kingdom.children.push(phylum)
    }

    root.children.push(kingdom)
  }

  return root
}

/**
 * Group classifications by a key extractor.
 *
 * @example
 * groupBy(items, (c) => c.taxonomy.kingdom)
 */
export function groupBy<T>(items: T[], keyExtractor: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyExtractor(item)
    const group = groups.get(key)
    if (group) {
      group.push(item)
    } else {
      groups.set(key, [item])
    }
  }
  return groups
}

/**
 * Extract common traits from a group of classifications.
 *
 * @example
 * extractGroupTraits(classifications)
 */
export function extractGroupTraits(classifications: Classification[]): string[] {
  const traitCounts = new Map<string, number>()
  for (const c of classifications) {
    for (const trait of c.traits) {
      traitCounts.set(trait, (traitCounts.get(trait) ?? 0) + 1)
    }
  }

  const threshold = Math.max(1, Math.floor(classifications.length * 0.5))
  return [...traitCounts.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([trait]) => trait)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute taxonomy statistics.
 *
 * @example
 * computeTaxonomyStats(tree, classifications)
 */
export function computeTaxonomyStats(
  tree: Taxon,
  classifications: Classification[],
): TaxonomyStats {
  const totalFiles = classifications.length
  const totalTaxa = countTaxa(tree)
  const depth = computeTreeDepth(tree)

  const groups = collectLeafGroups(tree)
  const groupSizes = groups.map((g) => g.fileCount)
  const largest = groupSizes.length > 0 ? groups.reduce((a, b) => a.fileCount > b.fileCount ? a : b) : null
  const smallest = groupSizes.length > 0 ? groups.reduce((a, b) => a.fileCount < b.fileCount ? a : b) : null
  const avgGroupSize = groupSizes.length > 0
    ? Math.round(groupSizes.reduce((s, n) => s + n, 0) / groupSizes.length * 10) / 10
    : 0

  const orphans = classifications.filter((c) => c.confidence < 50)
  const coverageScore = totalFiles > 0
    ? Math.round(((totalFiles - orphans.length) / totalFiles) * 100)
    : 100

  return {
    totalFiles,
    totalTaxa,
    depth,
    largestGroup: largest ? `${largest.name} (${largest.fileCount})` : 'N/A',
    smallestGroup: smallest ? `${smallest.name} (${smallest.fileCount})` : 'N/A',
    avgGroupSize,
    orphanCount: orphans.length,
    coverageScore,
  }
}

/**
 * Count total taxa in tree.
 *
 * @example
 * countTaxa(tree)
 */
export function countTaxa(taxon: Taxon): number {
  let count = 1
  for (const child of taxon.children) {
    count += countTaxa(child)
  }
  return count
}

/**
 * Compute tree depth.
 *
 * @example
 * computeTreeDepth(tree)
 */
export function computeTreeDepth(taxon: Taxon): number {
  if (taxon.children.length === 0) return 1
  return 1 + Math.max(...taxon.children.map(computeTreeDepth))
}

/**
 * Collect leaf groups from tree.
 *
 * @example
 * collectLeafGroups(tree)
 */
export function collectLeafGroups(taxon: Taxon): Taxon[] {
  if (taxon.children.length === 0) return [taxon]
  const leaves: Taxon[] = []
  for (const child of taxon.children) {
    leaves.push(...collectLeafGroups(child))
  }
  return leaves
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate taxonomy recommendations.
 *
 * @example
 * generateTaxonomyRecommendations(tree, classifications, stats)
 */
export function generateTaxonomyRecommendations(
  tree: Taxon,
  classifications: Classification[],
  stats: TaxonomyStats,
): string[] {
  const recs: string[] = []

  if (stats.orphanCount > 0) {
    recs.push(`${stats.orphanCount} file(s) have low classification confidence — review their placement`)
  }

  // Find large groups that might need splitting
  const leaves = collectLeafGroups(tree)
  const largeLeaves = leaves.filter((l) => l.fileCount > 10)
  if (largeLeaves.length > 0) {
    recs.push(`${largeLeaves.length} group(s) have 10+ files — consider finer-grained classification`)
  }

  // Check for misplaced files (source files in test kingdom, etc.)
  const misplaced = classifications.filter((c) => {
    if (c.taxonomy.kingdom === 'Test' && !c.file.includes('test') && !c.file.includes('spec')) return true
    return false
  })
  if (misplaced.length > 0) {
    recs.push(`${misplaced.length} file(s) may be misclassified — verify kingdom assignment`)
  }

  if (stats.coverageScore < 70) {
    recs.push(`Low classification coverage (${stats.coverageScore}%) — improve classification rules`)
  }

  if (stats.depth < 3) {
    recs.push('Shallow taxonomy — consider more granular classification levels')
  }

  if (recs.length === 0) {
    recs.push('Taxonomy is well-structured — codebase classification looks comprehensive')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete taxonomist result.
 *
 * @example
 * buildTaxonomistResult(files, contents)
 */
export function buildTaxonomistResult(
  files: string[],
  contents: string[],
  _options?: TaxonomistOptions,
): TaxonomyResult {
  // Classify all files
  const classifications = files.map((file, i) => classifyFile(file, contents[i] ?? ''))

  // Find closest relatives
  for (const cls of classifications) {
    const relative = findClosestRelative(cls, classifications)
    cls.closestRelative = relative.file
    cls.similarity = relative.similarity
  }

  // Build taxonomy tree
  const taxonomy = buildTaxonomyTree(classifications)

  // Compute stats
  const stats = computeTaxonomyStats(taxonomy, classifications)

  // Generate recommendations
  const recommendations = generateTaxonomyRecommendations(taxonomy, classifications, stats)

  return { taxonomy, classifications, stats, recommendations }
}
