import chalk from 'chalk'

import type { ApiDocsResult } from './api-docs-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Format API documentation as a console table with chalk colors.
 *
 * @example
 * ```ts
 * const output = formatApiDocsTable(result, false)
 * output // contains module sections
 * ```
 */
export function formatApiDocsTable(result: ApiDocsResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📖 API Documentation'), '']

  for (const mod of result.modules) {
    const hasContent = mod.functions.length > 0 || mod.classes.length > 0 || mod.interfaces.length > 0 || mod.types.length > 0 || mod.constants.length > 0
    if (!hasContent && !verbose) continue

    lines.push(chalk.bold.cyan(mod.file))
    if (mod.description) {
      lines.push(chalk.dim(`  ${mod.description}`))
    }

    for (const fn of mod.functions) {
      const badge = fn.deprecated ? chalk.red('[deprecated]') : ''
      lines.push(`  ${chalk.green('function')} ${fn.name}${badge ? ' ' + badge : ''}`)
      lines.push(chalk.dim(`    ${fn.signature}`))
      if (fn.description) lines.push(`    ${fn.description}`)
      if (verbose && fn.parameters.length > 0) {
        for (const p of fn.parameters) {
          const opt = p.optional ? '?' : ''
          lines.push(chalk.dim(`      @param ${p.name}${opt}: ${p.type}`))
        }
      }
      if (fn.returnType && fn.returnType !== 'void') {
        lines.push(chalk.dim(`    returns: ${fn.returnType}`))
      }
    }

    for (const cls of mod.classes) {
      lines.push(`  ${chalk.yellow('class')} ${cls.name}${cls.extends ? chalk.dim(` extends ${cls.extends}`) : ''}`)
      if (cls.description) lines.push(`    ${cls.description}`)
      for (const method of cls.methods) {
        lines.push(chalk.dim(`    ${method.name}(${method.parameters.map((p) => p.name).join(', ')}): ${method.returnType}`))
      }
    }

    for (const iface of mod.interfaces) {
      lines.push(`  ${chalk.magenta('interface')} ${iface.name}`)
      if (iface.description) lines.push(`    ${iface.description}`)
      for (const prop of iface.properties) {
        const ro = prop.readonly ? 'readonly ' : ''
        lines.push(chalk.dim(`    ${ro}${prop.name}: ${prop.type}`))
      }
    }

    for (const tp of mod.types) {
      lines.push(`  ${chalk.blue('type')} ${tp.name} = ${tp.definition}`)
    }

    for (const c of mod.constants) {
      lines.push(`  ${chalk.cyan('const')} ${c.name}: ${c.type} = ${c.value}`)
    }

    lines.push('')
  }

  const { stats } = result
  lines.push(chalk.bold('Stats'))
  lines.push(`  Modules:     ${stats.totalModules}`)
  lines.push(`  Functions:   ${stats.totalFunctions}`)
  lines.push(`  Classes:     ${stats.totalClasses}`)
  lines.push(`  Interfaces:  ${stats.totalInterfaces}`)
  lines.push(`  Types:       ${stats.totalTypes}`)
  lines.push(`  Constants:   ${stats.totalConstants}`)
  lines.push(`  Coverage:    ${formatCoverage(stats.documentationCoverage)}`)

  return lines.join('\n')
}

function formatCoverage(pct: number): string {
  if (pct >= 80) return chalk.green(`${pct}%`)
  if (pct >= 50) return chalk.yellow(`${pct}%`)
  return chalk.red(`${pct}%`)
}

/**
 * Format API documentation as Markdown.
 *
 * @example
 * ```ts
 * const md = formatApiDocsMarkdown(result)
 * md // contains ## Module sections
 * ```
 */
export function formatApiDocsMarkdown(result: ApiDocsResult): string {
  const lines: string[] = ['# API Documentation', '']

  for (const mod of result.modules) {
    const hasContent = mod.functions.length > 0 || mod.classes.length > 0 || mod.interfaces.length > 0 || mod.types.length > 0 || mod.constants.length > 0
    if (!hasContent) continue

    lines.push(`## ${mod.file}`, '')
    if (mod.description) {
      lines.push(`> ${mod.description}`, '')
    }

    for (const fn of mod.functions) {
      lines.push(`### \`${fn.name}\``, '')
      if (fn.deprecated) lines.push('> ⚠️ **Deprecated**', '')
      if (fn.description) lines.push(fn.description, '')
      lines.push('```typescript')
      lines.push(fn.signature)
      lines.push('```', '')
      if (fn.parameters.length > 0) {
        lines.push('| Parameter | Type | Optional | Description |')
        lines.push('|-----------|------|----------|-------------|')
        for (const p of fn.parameters) {
          lines.push(`| ${p.name} | ${p.type} | ${p.optional ? 'Yes' : 'No'} | ${p.description} |`)
        }
        lines.push('')
      }
      if (fn.returnType && fn.returnType !== 'void') {
        lines.push(`**Returns:** \`${fn.returnType}\``, '')
      }
      if (fn.examples.length > 0) {
        lines.push('**Examples:**', '')
        for (const ex of fn.examples) {
          lines.push('```typescript', ex, '```', '')
        }
      }
    }

    for (const cls of mod.classes) {
      lines.push(`### class \`${cls.name}\``, '')
      if (cls.description) lines.push(cls.description, '')
      if (cls.extends) lines.push(`**Extends:** \`${cls.extends}\``, '')
      if (cls.methods.length > 0) {
        lines.push('**Methods:**', '')
        for (const m of cls.methods) {
          lines.push(`- \`${m.signature}\``)
        }
        lines.push('')
      }
    }

    for (const iface of mod.interfaces) {
      lines.push(`### interface \`${iface.name}\``, '')
      if (iface.description) lines.push(iface.description, '')
      if (iface.properties.length > 0) {
        lines.push('| Property | Type | Readonly |')
        lines.push('|----------|------|----------|')
        for (const p of iface.properties) {
          lines.push(`| ${p.name} | ${p.type} | ${p.readonly ? 'Yes' : 'No'} |`)
        }
        lines.push('')
      }
    }

    for (const tp of mod.types) {
      lines.push(`### type \`${tp.name}\``, '')
      if (tp.description) lines.push(tp.description, '')
      lines.push('```typescript', `type ${tp.name} = ${tp.definition}`, '```', '')
    }

    for (const c of mod.constants) {
      lines.push(`### const \`${c.name}\``, '')
      if (c.description) lines.push(c.description, '')
      lines.push('```typescript', `const ${c.name}: ${c.type} = ${c.value}`, '```', '')
    }
  }

  lines.push('---', '')
  lines.push('## Stats', '')
  lines.push(`- **Modules:** ${result.stats.totalModules}`)
  lines.push(`- **Functions:** ${result.stats.totalFunctions}`)
  lines.push(`- **Classes:** ${result.stats.totalClasses}`)
  lines.push(`- **Interfaces:** ${result.stats.totalInterfaces}`)
  lines.push(`- **Types:** ${result.stats.totalTypes}`)
  lines.push(`- **Constants:** ${result.stats.totalConstants}`)
  lines.push(`- **Documentation Coverage:** ${result.stats.documentationCoverage}%`)

  return lines.join('\n')
}

/**
 * Format API documentation as JSON.
 *
 * @example
 * ```ts
 * const json = formatApiDocsJson(result)
 * JSON.parse(json) // valid
 * ```
 */
export function formatApiDocsJson(result: ApiDocsResult): string {
  return JSON.stringify(result, null, 2)
}

/**
 * Format API documentation as simple HTML.
 *
 * @example
 * ```ts
 * const html = formatApiDocsHtml(result)
 * html // contains <html> structure
 * ```
 */
export function formatApiDocsHtml(result: ApiDocsResult): string {
  let body = ''

  for (const mod of result.modules) {
    body += `<h2>${escapeHtml(mod.file)}</h2>\n`
    if (mod.description) body += `<p>${escapeHtml(mod.description)}</p>\n`

    for (const fn of mod.functions) {
      body += `<h3>function ${escapeHtml(fn.name)}</h3>\n`
      if (fn.description) body += `<p>${escapeHtml(fn.description)}</p>\n`
      body += `<pre><code>${escapeHtml(fn.signature)}</code></pre>\n`
    }

    for (const cls of mod.classes) {
      body += `<h3>class ${escapeHtml(cls.name)}</h3>\n`
      if (cls.description) body += `<p>${escapeHtml(cls.description)}</p>\n`
    }

    for (const iface of mod.interfaces) {
      body += `<h3>interface ${escapeHtml(iface.name)}</h3>\n`
      if (iface.description) body += `<p>${escapeHtml(iface.description)}</p>\n`
    }
  }

  body += `<hr><p>Documentation Coverage: ${result.stats.documentationCoverage}%</p>\n`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>API Documentation</title>
<style>
body { font-family: sans-serif; max-width: 900px; margin: 2em auto; padding: 0 1em; }
pre { background: #f5f5f5; padding: 1em; overflow-x: auto; border-radius: 4px; }
code { font-family: monospace; }
h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
h3 { color: #555; }
</style>
</head>
<body>
<h1>API Documentation</h1>
${body}
</body>
</html>`
}
