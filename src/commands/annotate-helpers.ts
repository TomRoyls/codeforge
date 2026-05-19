// ─── Interfaces ──────────────────────────────────────────

export interface Annotation {
  type: string
  text: string
  file: string
  line: number
  column: number
  context: string
  severity: 'critical' | 'info' | 'warning'
}

export interface AnnotationTypeMetadata {
  color: string
  severity: 'critical' | 'info' | 'warning'
  type: string
}

export interface AnnotationTypeStats {
  color: string
  count: number
  percentage: number
  severity: string
  type: string
}

export interface FileAnnotations {
  annotations: Annotation[]
  count: number
  file: string
}

export interface AnnotationStats {
  byDirectory: Record<string, number>
  byFile: FileAnnotations[]
  bySeverity: { critical: number; info: number; warning: number }
  byType: AnnotationTypeStats[]
  density: number
  total: number
}

export interface AnnotateResult {
  annotations: Annotation[]
  files: string[]
  stats: AnnotationStats
}

export interface AnnotateOptions {
  type?: string
}

// ─── Annotation type definitions ─────────────────────────

const ANNOTATION_TYPES: AnnotationTypeMetadata[] = [
  { type: 'TODO', severity: 'info', color: 'blue' },
  { type: 'FIXME', severity: 'warning', color: 'yellow' },
  { type: 'HACK', severity: 'warning', color: 'magenta' },
  { type: 'XXX', severity: 'critical', color: 'red' },
  { type: 'NOTE', severity: 'info', color: 'green' },
  { type: 'OPTIMIZE', severity: 'warning', color: 'cyan' },
  { type: 'BUG', severity: 'critical', color: 'red' },
  { type: 'CHANGED', severity: 'info', color: 'blue' },
  { type: 'IDEA', severity: 'info', color: 'green' },
  { type: 'REVIEW', severity: 'warning', color: 'yellow' },
]

// ─── getAnnotationTypes ──────────────────────────────────

/**
 * Returns all supported annotation types with their metadata.
 *
 * @example
 * const types = getAnnotationTypes()
 * // [{ type: 'TODO', severity: 'info', color: 'blue' }, ...]
 */
export function getAnnotationTypes(): AnnotationTypeMetadata[] {
  return [...ANNOTATION_TYPES]
}

// ─── extractAnnotations ──────────────────────────────────

/**
 * Extracts all code annotations from file content.
 *
 * Matches patterns like `// TODO:`, `/* FIXME:`, `# NOTE:`, etc.
 * Case insensitive.
 *
 * @example
 * const annotations = extractAnnotations('// TODO: fix this later', 'file.ts')
 * // [{ type: 'TODO', text: 'fix this later', file: 'file.ts', ... }]
 */
export function extractAnnotations(content: string, filePath: string): Annotation[] {
  const annotations: Annotation[] = []
  const lines = content.split('\n')

  const typeMap = new Map<string, AnnotationTypeMetadata>()
  for (const t of ANNOTATION_TYPES) {
    typeMap.set(t.type.toUpperCase(), t)
  }

  // Build a regex that matches any annotation type
  const typeNames = ANNOTATION_TYPES.map((t) => t.type).join('|')
  const regex = new RegExp(`(?://|/\\*|#|<!--)\\s*\\b(${typeNames})\\b:?\\s*(.*)`, 'gi')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null

    regex.lastIndex = 0

    while ((match = regex.exec(line)) !== null) {
      const matchedType = match[1]!.toUpperCase()
      const matchedText = match[2]!.trim()
      const metadata = typeMap.get(matchedType)

      if (metadata) {
        annotations.push({
          column: match.index + 1,
          context: getContext(lines, i, 2),
          file: filePath,
          line: i + 1,
          severity: metadata.severity,
          text: matchedText,
          type: matchedType,
        })
      }
    }
  }

  return annotations
}

// ─── getContext ──────────────────────────────────────────

/**
 * Returns surrounding lines for context around a target line.
 *
 * @example
 * const ctx = getContext(lines, 5, 2)
 * // Returns 2 lines before and after line 5
 */
export function getContext(lines: string[], targetLine: number, padding: number): string {
  const start = Math.max(0, targetLine - padding)
  const end = Math.min(lines.length - 1, targetLine + padding)

  const contextLines: string[] = []
  for (let i = start; i <= end; i++) {
    contextLines.push(lines[i])
  }

  return contextLines.join('\n')
}

// ─── computeAnnotationStats ──────────────────────────────

/**
 * Computes aggregate statistics from annotations.
 *
 * @example
 * const stats = computeAnnotationStats(annotations, 500)
 * // { total: 10, byType: [...], byFile: [...], density: 20 }
 */
export function computeAnnotationStats(annotations: Annotation[], totalLines: number): AnnotationStats {
  const total = annotations.length

  // By type
  const typeCountMap = new Map<string, { color: string; count: number; severity: string }>()
  for (const ann of annotations) {
    const existing = typeCountMap.get(ann.type)
    if (existing) {
      existing.count++
    } else {
      const metadata = ANNOTATION_TYPES.find((t) => t.type === ann.type)
      typeCountMap.set(ann.type, {
        color: metadata?.color ?? 'white',
        count: 1,
        severity: ann.severity,
      })
    }
  }

  const byType: AnnotationTypeStats[] = Array.from(typeCountMap.entries()).map(([type, data]) => ({
    color: data.color,
    count: data.count,
    percentage: total > 0 ? Math.round((data.count / total) * 10000) / 100 : 0,
    severity: data.severity,
    type,
  }))

  // By file
  const fileMap = new Map<string, Annotation[]>()
  for (const ann of annotations) {
    const existing = fileMap.get(ann.file)
    if (existing) {
      existing.push(ann)
    } else {
      fileMap.set(ann.file, [ann])
    }
  }

  const byFile: FileAnnotations[] = Array.from(fileMap.entries()).map(([file, anns]) => ({
    annotations: anns,
    count: anns.length,
    file,
  }))

  // By severity
  const bySeverity = { critical: 0, info: 0, warning: 0 }
  for (const ann of annotations) {
    bySeverity[ann.severity]++
  }

  // By directory
  const dirMap = new Map<string, number>()
  for (const ann of annotations) {
    const lastSlash = ann.file.lastIndexOf('/')
    const dir = lastSlash !== -1 ? ann.file.substring(0, lastSlash) : '.'
    dirMap.set(dir, (dirMap.get(dir) ?? 0) + 1)
  }

  const byDirectory: Record<string, number> = {}
  for (const [dir, count] of dirMap) {
    byDirectory[dir] = count
  }

  // Density
  const density = totalLines > 0 ? Math.round((total / totalLines) * 1000 * 100) / 100 : 0

  return { byDirectory, byFile, bySeverity, byType, density, total }
}

// ─── filterByType ────────────────────────────────────────

/**
 * Filters annotations to a specific type.
 *
 * @example
 * const todos = filterByType(annotations, 'todo')
 */
export function filterByType(annotations: Annotation[], type: string): Annotation[] {
  const upperType = type.toUpperCase()
  return annotations.filter((ann) => ann.type === upperType)
}

// ─── sortAnnotations ─────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 }

/**
 * Sorts annotations by the given metric.
 *
 * @example
 * const sorted = sortAnnotations(annotations, 'severity')
 */
export function sortAnnotations(
  annotations: Annotation[],
  sortBy: 'count' | 'file' | 'severity' | 'type',
): Annotation[] {
  const sorted = [...annotations]

  switch (sortBy) {
    case 'type':
      sorted.sort((a, b) => a.type.localeCompare(b.type))
      break
    case 'severity':
      sorted.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))
      break
    case 'file':
      sorted.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
      break
    case 'count':
    default:
      // For individual annotations, count-based sort groups by file
      sorted.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
      break
  }

  return sorted
}

// ─── buildAnnotateResult ─────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

/**
 * Orchestrates annotation extraction across multiple files.
 *
 * @example
 * const result = await buildAnnotateResult(files, reader, { type: 'todo' })
 */
export function buildAnnotateResult(
  files: string[],
  contentReader: ContentReader,
  options: AnnotateOptions,
): Promise<AnnotateResult> {
  return (async () => {
    const allAnnotations: Annotation[] = []
    let totalLines = 0

    for (const file of files) {
      try {
        const content = await contentReader(file)
        const lines = content.split('\n')
        totalLines += lines.length

        let annotations = extractAnnotations(content, file)

        if (options.type) {
          annotations = filterByType(annotations, options.type)
        }

        allAnnotations.push(...annotations)
      } catch {
        // Skip files that can't be read
      }
    }

    const stats = computeAnnotationStats(allAnnotations, totalLines)

    return { annotations: allAnnotations, files, stats }
  })()
}
