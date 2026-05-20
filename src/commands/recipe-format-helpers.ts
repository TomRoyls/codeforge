import chalk from 'chalk'

import type {
  Recipe,
  RecipeBook,
  RecipeResult,
  RecipeStats,
} from './recipe-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function difficultyBadge(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return chalk.rgb(76, 175, 80)('★☆☆☆')
    case 'intermediate': return chalk.rgb(255, 193, 7)('★★☆☆')
    case 'advanced': return chalk.rgb(255, 87, 34)('★★★☆')
    case 'expert': return chalk.rgb(244, 67, 54)('★★★★')
    default: return '★★☆☆'
  }
}

function ratingStars(rating: number): string {
  const full = Math.round(rating / 20)
  const empty = 5 - full
  return chalk.rgb(255, 193, 7)('★'.repeat(full)) + chalk.gray('☆'.repeat(empty))
}

function balanceBar(balance: number): string {
  const filled = Math.round(balance / 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  return balance >= 70 ? chalk.rgb(76, 175, 80)(bar) : balance >= 40 ? chalk.rgb(255, 193, 7)(bar) : chalk.rgb(244, 67, 54)(bar)
}

// ─── Recipe Card ───────────────────────────────────────────────────────────────

/**
 * Format a single recipe card.
 *
 * @example
 * formatRecipeCard(recipe)
 */
export function formatRecipeCard(recipe: Recipe): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)(`\n  📖 ${recipe.name}`))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`  ${difficultyBadge(recipe.difficulty)} ${recipe.difficulty.padEnd(12)} ${ratingStars(recipe.overallRating)} ${recipe.overallRating}%`)
  lines.push(`  Balance: ${balanceBar(recipe.balance)} ${recipe.balance}%`)
  lines.push(`  Prep time: ${recipe.preparationTime} min  Servings: ${recipe.servingSize}`)

  if (recipe.ingredients.length > 0) {
    lines.push(chalk.gray('  Ingredients:'))
    for (const ing of recipe.ingredients.slice(0, 8)) {
      const quality = ing.quality >= 70 ? chalk.rgb(76, 175, 80)(`${ing.quality}%`) : chalk.rgb(255, 193, 7)(`${ing.quality}%`)
      lines.push(`    • ${ing.name.padEnd(25)} ${ing.type.padEnd(10)} quality: ${quality}`)
    }
  }

  if (recipe.steps.length > 0) {
    lines.push(chalk.gray('  Steps:'))
    for (const step of recipe.steps.slice(0, 8)) {
      lines.push(`    ${step.complexity === 'masterful' ? chalk.rgb(244, 67, 54)(step.complexity.padEnd(10)) : step.complexity.padEnd(10)} ${step.name}`)
    }
  }

  if (recipe.dishes.length > 0) {
    lines.push(chalk.gray('  Dishes served:'))
    for (const dish of recipe.dishes.slice(0, 6)) {
      lines.push(`    🍽  ${dish.name.padEnd(20)} ${dish.type.padEnd(15)} presentation: ${dish.presentation}%`)
    }
  }

  return lines.join('\n')
}

// ─── Recipe Book ───────────────────────────────────────────────────────────────

/**
 * Format a recipe book overview.
 *
 * @example
 * formatRecipeBookOverview(books)
 */
export function formatRecipeBookOverview(books: RecipeBook[]): string {
  if (books.length === 0) return chalk.gray('  No recipe books found')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recipe Books'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const book of books) {
    const rating = ratingStars(book.avgRating)
    lines.push(`  ${chalk.bold(book.name.padEnd(25))} ${rating} ${book.avgRating}%`)
    lines.push(`    ${chalk.gray('Cuisine:')} ${book.cuisine}  ${chalk.gray('Recipes:')} ${book.recipes.length}  ${chalk.gray('Specialty:')} ${book.specialty}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format recipe stats.
 *
 * @example
 * formatRecipeStats(stats)
 */
export function formatRecipeStats(stats: RecipeStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recipe Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Recipes:       ${stats.totalRecipes}`)
  lines.push(`  Average Rating:      ${stats.avgRating}%`)
  lines.push(`  Beginner Recipes:    ${stats.beginnerCount}`)
  lines.push(`  Expert Recipes:      ${stats.expertCount}`)
  lines.push(`  Most Popular:        ${stats.mostPopular}`)
  lines.push(`  Best Rated:          ${stats.bestRated}`)
  lines.push(`  Worst Rated:         ${stats.worstRated}`)
  lines.push(`  Avg Ingredients:     ${stats.avgIngredients}`)
  lines.push(`  Avg Steps:           ${stats.avgSteps}`)
  lines.push(`  Expired Ingredients: ${stats.expiredIngredients}`)
  lines.push(`  Avg Balance:         ${stats.avgBalance}%`)
  lines.push(`  Cuisine Count:       ${stats.cuisineCount}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Add docs'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full recipe result as table.
 *
 * @example
 * formatRecipeTable(result)
 */
export function formatRecipeTable(result: RecipeResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Recipe Analysis'))
  parts.push(chalk.gray(' ═'.repeat(50)))

  for (const recipe of result.recipes.slice(0, 15)) {
    parts.push(formatRecipeCard(recipe))
  }
  if (result.recipes.length > 15) {
    parts.push(chalk.gray(`\n  ... and ${result.recipes.length - 15} more recipes`))
  }

  parts.push(formatRecipeBookOverview(result.books))
  parts.push(formatRecipeStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format full recipe result as JSON.
 *
 * @example
 * formatRecipeJSON(result)
 */
export function formatRecipeJSON(result: RecipeResult): string {
  return JSON.stringify(result, null, 2)
}
