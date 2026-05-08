import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoUnusedImportsOptions extends RuleOptions {}

export function analyzeNoUnusedImports(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  const importRegex = /import\s+"([^"]+)"/g
  const importAliasRegex = /import\s+(\w+)\s+"([^"]+)"/g

  const importedPackages: { line: number; column: number; pkg: string; alias?: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    importRegex.lastIndex = 0
    importAliasRegex.lastIndex = 0

    let match: RegExpExecArray | null

    while ((match = importAliasRegex.exec(line)) !== null) {
      importedPackages.push({
        alias: match[1],
        column: match.index,
        line: i + 1,
        pkg: match[2]!,
      })
    }

    while ((match = importRegex.exec(line)) !== null) {
      const alreadyAlias = importedPackages.some(
        (p) => p.line === i + 1 && p.column === match!.index,
      )
      if (!alreadyAlias) {
        const pkg = match[1]!
        const pkgName = pkg.split('/').pop()!
        importedPackages.push({
          column: match.index,
          line: i + 1,
          pkg,
        })

        const restOfCode = lines.slice(i + 1).join('\n')
        if (!restOfCode.includes(pkgName)) {
          violations.push(
            createViolation(
              filePath,
              `Imported package '${pkg}' is never used.`,
              { column: match.index, line: i + 1 },
              'go/no-unused-imports',
              'warning',
              `Remove the unused import '${pkg}'.`,
            ),
          )
        }
      }
    }
  }

  for (const imp of importedPackages) {
    if (imp.alias) {
      const restOfCodeLines = lines.slice(imp.line)
      const restOfCode = restOfCodeLines.join('\n')
      const usagePattern = new RegExp(`\\b${imp.alias}\\b`, 'g')
      const usages = restOfCode.match(usagePattern)
      if (!usages || usages.length <= 0) {
        violations.push(
          createViolation(
            filePath,
            `Imported package '${imp.pkg}' (as ${imp.alias}) is never used.`,
            { column: imp.column, line: imp.line },
            'go/no-unused-imports',
            'warning',
            `Remove the unused import '${imp.pkg}'.`,
          ),
        )
      }
    }
  }

  return violations
}

export const noUnusedImportsRule: RuleDefinition<NoUnusedImportsOptions> = {
  create(_options: NoUnusedImportsOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects unused imports in Go files',
    name: 'go/no-unused-imports',
    recommended: true,
    severity: 'warning',
  },
}

export default noUnusedImportsRule
