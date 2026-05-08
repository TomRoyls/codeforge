import type { Transform, TransformResult, TransformRecipe, TransformConfig, TextChange, TransformReport } from './types.js'
import { DEFAULT_TRANSFORM_CONFIG } from './types.js'

export class TransformEngine {
  private config: TransformConfig

  constructor(config?: Partial<TransformConfig>) {
    this.config = { ...DEFAULT_TRANSFORM_CONFIG, ...config }
  }

  applyTransform(source: string, filePath: string, transform: Transform): TransformResult {
    if (source.length > this.config.maxFileSize) {
      return {
        source,
        changes: [],
        applied: false,
        errors: [`File exceeds max size: ${source.length} > ${this.config.maxFileSize}`],
      }
    }

    try {
      const result = transform.apply(source, filePath)
      if (this.config.dryRun) {
        return {
          ...result,
          source,
        }
      }
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        source,
        changes: [],
        applied: false,
        errors: [message],
      }
    }
  }

  applyTransforms(source: string, filePath: string, transforms: Transform[]): TransformResult[] {
    let current = source
    const results: TransformResult[] = []

    for (const transform of transforms) {
      const result = this.applyTransform(current, filePath, transform)
      results.push(result)
      if (result.applied && !this.config.dryRun) {
        current = result.source
      }
    }

    return results
  }

  applyRecipe(
    source: string,
    filePath: string,
    recipe: TransformRecipe,
    registry: Map<string, Transform>
  ): TransformResult[] {
    const transforms: Transform[] = []
    for (const id of recipe.transforms) {
      const transform = registry.get(id)
      if (transform) {
        transforms.push(transform)
      }
    }
    return this.applyTransforms(source, filePath, transforms)
  }

  createDiff(original: string, modified: string): string {
    const origLines = original.split('\n')
    const modLines = modified.split('\n')
    const lines: string[] = []

    const maxLen = Math.max(origLines.length, modLines.length)
    let hasChanges = false

    for (let i = 0; i < maxLen; i++) {
      const origLine = origLines[i] ?? ''
      const modLine = modLines[i] ?? ''

      if (origLine !== modLine) {
        hasChanges = true
        lines.push(`- ${origLine}`)
        lines.push(`+ ${modLine}`)
      }
    }

    if (!hasChanges) return ''

    const unified: string[] = []
    unified.push('--- original')
    unified.push('+++ modified')
    const changeLines: string[] = []
    let changeStart = -1
    let inChange = false

    for (let i = 0; i < maxLen; i++) {
      const origLine = origLines[i] ?? null
      const modLine = modLines[i] ?? null

      if (origLine !== modLine) {
        if (!inChange) {
          changeStart = i + 1
          inChange = true
        }
        if (origLine !== null) changeLines.push(`-${origLine}`)
        if (modLine !== null) changeLines.push(`+${modLine}`)
      } else {
        if (inChange) {
          changeLines.push(` ${origLine}`)
        }
        inChange = false
      }
    }

    unified.push(`@@ -${changeStart},${origLines.length} +${changeStart},${modLines.length} @@`)
    unified.push(...changeLines)

    return unified.join('\n')
  }

  applyTextChanges(source: string, changes: TextChange[]): string {
    const sorted = [...changes].sort((a, b) => b.endLine - a.endLine || b.startLine - a.startLine)
    const lines = source.split('\n')

    for (const change of sorted) {
      const startIdx = Math.max(0, change.startLine - 1)
      const endIdx = Math.min(lines.length, change.endLine)
      const replacementLines = change.replacement.split('\n')
      lines.splice(startIdx, endIdx - startIdx, ...replacementLines)
    }

    return lines.join('\n')
  }

  validateChanges(original: string, changes: TextChange[]): boolean {
    const sorted = [...changes].sort((a, b) => a.startLine - b.startLine)

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]!
      if (current.startLine < 1 || current.endLine < current.startLine) return false
    }

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!
      const curr = sorted[i]!
      if (curr.startLine <= prev.endLine) return false
    }

    const lines = original.split('\n')
    for (const change of changes) {
      if (change.startLine > lines.length + 1) return false
    }

    return true
  }

  generateReport(results: Map<string, TransformResult[]>): TransformReport {
    let transformsApplied = 0
    let filesModified = 0
    let totalChanges = 0

    for (const [, fileResults] of results) {
      let fileModified = false
      for (const result of fileResults) {
        if (result.applied) {
          transformsApplied++
          fileModified = true
          totalChanges += result.changes.length
        }
      }
      if (fileModified) filesModified++
    }

    return {
      transformsApplied,
      filesModified,
      totalChanges,
      results,
    }
  }
}
