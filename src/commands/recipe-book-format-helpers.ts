import chalk from 'chalk'

import type {
  AbstractionOpportunity,
  Difficulty,
  OverallComplexity,
  Recipe,
  RecipeBookResult,
  RecipeBookStats,
  RecipeCategory,
  RecipeMatch,
} from './recipe-book-helpers.js'

// ─── Difficulty Colors ───────────────────────────────────

const DIFFICULTY_COLOR: Record<Difficulty, (s: string) => string> = {
  trivial: chalk.rgb(72, 199, 142),
  easy: chalk.rgb(120, 200, 120),
  moderate: chalk.rgb(200, 180, 80),
  complex: chalk.rgb(220, 150, 80),
  expert: chalk.rgb(220, 80, 80),
}

const COMPLEXITY_COLOR: Record<OverallComplexity, (s: string) => string> = {
  simple: chalk.rgb(72, 199, 142),
  moderate: chalk.rgb(200, 180, 80),
  complex: chalk.rgb(220, 150, 80),
  gourmet: chalk.rgb(220, 80, 80),
}

const CATEGORY_SYMBOL: Record<RecipeCategory, string> = {
  boilerplate: '📋',
  idiom: '💡',
  pattern: '🏗️',
  algorithm: '🔢',
  utility: '🔧',
  'error-handling': '🛡️',
  validation: '✅',
  io: '📡',
  configuration: '⚙️',
  testing: '🧪',
}

/**
 * Format category badge.
 *
 * @example
 * formatCategoryBadge('utility') // => '🔧 utility'
 */
export function formatCategoryBadge(category: RecipeCategory): string {
  return `${CATEGORY_SYMBOL[category]} ${category}`
}

/**
 * Format difficulty label.
 *
 * @example
 * formatDifficultyLabel('easy') // => colored 'easy'
 */
export function formatDifficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_COLOR[difficulty](difficulty)
}

/**
 * Format complexity label.
 *
 * @example
 * formatComplexityLabel('gourmet') // => colored 'gourmet'
 */
export function formatComplexityLabel(complexity: OverallComplexity): string {
  return COMPLEXITY_COLOR[complexity](complexity)
}

/**
 * Format reusability bar.
 *
 * @example
 * formatReusabilityBar(75) // => '▓▓▓▓▓▓▓░░░ 75'
 */
export function formatReusabilityBar(score: number): string {
  const width = 10
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 70 ? chalk.rgb(72, 199, 142) : score >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${score}`)
}

// ─── Recipe Cards ────────────────────────────────────────

/**
 * Format a single recipe card.
 *
 * @example
 * formatRecipeCard(recipe) // => formatted card
 */
export function formatRecipeCard(recipe: Recipe): string {
  const lines: string[] = []
  const badge = formatCategoryBadge(recipe.category)
  const diff = formatDifficultyLabel(recipe.difficulty)
  const reusability = formatReusabilityBar(recipe.reusability)

  lines.push(chalk.bold(`📖 ${recipe.name}`))
  lines.push(`  Category: ${badge} | Difficulty: ${diff} | Servings: ${recipe.servings}`)
  lines.push(`  Reusability: ${reusability} | Prep time: ${recipe.prepTime}`)
  lines.push(`  Files: ${recipe.files.length} | ${recipe.isSignature ? '⭐ Signature' : ''}${recipe.isFusion ? '🔀 Fusion' : ''}`)

  if (recipe.ingredients.length > 0) {
    const ingList = recipe.ingredients.slice(0, 5).map(i => `${i.type}:${i.value}`).join(', ')
    lines.push(`  Ingredients: ${ingList}`)
  }

  return lines.join('\n')
}

// ─── Recipe Table ────────────────────────────────────────

/**
 * Format recipe table.
 *
 * @example
 * formatRecipeTable(recipes) // => table of recipes
 */
export function formatRecipeTable(recipes: Recipe[]): string {
  if (recipes.length === 0) return 'No recipes detected.'

  const header = chalk.bold('Recipe                          Category        Difficulty  Servings  Reusability')
  const separator = '─'.repeat(90)
  const rows = recipes.map(r => {
    const name = r.name.substring(0, 28).padEnd(28)
    const cat = r.category.padEnd(14)
    const diff = formatDifficultyLabel(r.difficulty).padEnd(10)
    const servings = String(r.servings).padStart(8)
    const reuse = formatReusabilityBar(r.reusability)
    return `${name} ${cat} ${diff} ${servings}  ${reuse}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Match Table ─────────────────────────────────────────

/**
 * Format recipe match table.
 *
 * @example
 * formatMatchTable(matches) // => table of matches
 */
export function formatMatchTable(matches: RecipeMatch[]): string {
  if (matches.length === 0) return 'No recipe matches.'

  const header = chalk.bold('File                    Recipe ID       Confidence  Lines')
  const separator = '─'.repeat(65)
  const rows = matches.slice(0, 20).map(m => {
    const file = m.file.substring(0, 22).padEnd(22)
    const id = m.recipeId.padEnd(14)
    const conf = String(m.confidence).padStart(10)
    const lines = `${m.lineStart}-${m.lineEnd}`
    return `${file} ${id} ${conf}%  ${lines}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Opportunities ───────────────────────────────────────

/**
 * Format abstraction opportunities.
 *
 * @example
 * formatOpportunities(opps) // => formatted list
 */
export function formatOpportunities(opportunities: AbstractionOpportunity[]): string {
  if (opportunities.length === 0) return 'No abstraction opportunities found.'

  const lines: string[] = [chalk.bold('Abstraction Opportunities:')]
  for (const opp of opportunities) {
    const diff = DIFFICULTY_COLOR[opp.difficulty as Difficulty](opp.difficulty)
    lines.push(`  ${chalk.bold(opp.pattern)} (${diff})`)
    lines.push(`    Files: ${opp.files.length} | Saving: ~${opp.estimatedSaving} lines`)
    lines.push(`    ${chalk.rgb(200, 200, 200)(opp.suggestedApproach)}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Stats Summary ───────────────────────────────────────

/**
 * Format recipe book stats.
 *
 * @example
 * formatRecipeBookStats(stats) // => stats summary
 */
export function formatRecipeBookStats(stats: RecipeBookStats): string {
  const lines = [
    chalk.bold('Recipe Book Statistics:'),
    `  Total recipes: ${stats.totalRecipes} | Total matches: ${stats.totalMatches}`,
    `  Avg reusability: ${stats.avgReusability} | Completeness: ${stats.cookbookCompleteness}%`,
    `  Signature: ${stats.signatureCount} | Fusion: ${stats.fusionCount}`,
    `  Most used: ${stats.mostUsedRecipe || 'N/A'}`,
    `  Least used: ${stats.leastUsedRecipe || 'N/A'}`,
    `  Boilerplate coverage: ${stats.boilerplateCoverage}% | Idiom coverage: ${stats.idiomCoverage}%`,
    `  Abstraction opportunities: ${stats.abstractionOpportunities}`,
    `  Overall complexity: ${formatComplexityLabel(stats.overallComplexity)}`,
  ]

  const catEntries = Object.entries(stats.categoryDistribution)
  if (catEntries.length > 0) {
    const dist = catEntries.map(([k, v]) => `${k}:${v}`).join(', ')
    lines.push(`  Categories: ${dist}`)
  }

  return lines.join('\n')
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecipeBookRecommendations(['Extract utilities']) // => bullet list
 */
export function formatRecipeBookRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Recipe book is well-organized — no concerns')
  const lines = [chalk.bold('📖 Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Output ─────────────────────────────────────────

/**
 * Format full recipe book result as table.
 *
 * @example
 * formatRecipeBookTable(result, false) // => full output
 */
export function formatRecipeBookTable(result: RecipeBookResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nRecipe Book — Code Pattern Cookbook\n'))
  sections.push(formatRecipeBookStats(result.stats))
  sections.push('')

  if (result.recipes.length > 0) {
    sections.push(chalk.bold('Recipes:'))
    if (verbose) {
      for (const recipe of result.recipes) {
        sections.push(formatRecipeCard(recipe))
        sections.push('')
      }
    } else {
      sections.push(formatRecipeTable(result.recipes))
      sections.push('')
    }
  }

  if (result.matches.length > 0 && verbose) {
    sections.push(chalk.bold('Recipe Matches:'))
    sections.push(formatMatchTable(result.matches))
    sections.push('')
  }

  if (result.opportunities.length > 0) {
    sections.push(formatOpportunities(result.opportunities))
  }

  sections.push(formatRecipeBookRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format recipe book result as JSON.
 *
 * @example
 * formatRecipeBookJson(result) // => JSON string
 */
export function formatRecipeBookJson(result: RecipeBookResult): string {
  return JSON.stringify(result, null, 2)
}
