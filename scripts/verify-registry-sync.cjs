#!/usr/bin/env node

/**
 * Verifies all rule registries are in sync by running against compiled output.
 *
 * Checks:
 * 1. All rules in allRules have category entries
 * 2. Category counts match across registries
 * 3. No orphaned rules in category registries
 *
 * Usage: npm run verify-registries
 */

const { allRules, getRuleCategory, getRuleIds } = require('../dist/rules/index.js')
const lazyMod = require('../dist/rules/lazy-loader.js')
const moduleRegMod = require('../dist/rules/rule-module-registry.js')
const categoryRegMod = require('../dist/rules/rule-category-registry.js')

const LAZY_ALL_RULE_IDS = lazyMod.ALL_RULE_IDS
const RULE_MODULE_REGISTRY = moduleRegMod.RULE_MODULES
const RULE_CATEGORIES = categoryRegMod.RULE_CATEGORIES

const allRulesEntries = Object.keys(allRules)
const moduleRegistryKeys = Object.keys(RULE_MODULE_REGISTRY)
const categoryRegistryKeys = Object.keys(RULE_CATEGORIES)

const errors = []
const warnings = []

console.log('\n📊 Registry Sync Report')
console.log(`   allRules (index.ts):          ${allRulesEntries.length} rules`)
console.log(`   ALL_RULE_IDS (lazy-loader):   ${LAZY_ALL_RULE_IDS.length} IDs`)
console.log(`   RULE_MODULES (module-reg):    ${moduleRegistryKeys.length} entries`)
console.log(`   RULE_CATEGORIES (category):   ${categoryRegistryKeys.length} categories`)

const allRuleSet = new Set(allRulesEntries)

for (const id of allRuleSet) {
  if (!categoryRegistryKeys.includes(id)) {
    errors.push(`Rule '${id}' in allRules but missing from rule-category-registry.ts`)
  }
}

for (const id of categoryRegistryKeys) {
  if (!allRuleSet.has(id)) {
    errors.push(`Rule '${id}' in rule-category-registry.ts but not in allRules`)
  }
}

for (const id of allRuleSet) {
  const category = getRuleCategory(id)
  if (!category) {
    errors.push(`Rule '${id}' has no category (getRuleCategory returns undefined)`)
  }
}

for (const id of allRuleSet) {
  if (!moduleRegistryKeys.includes(id)) {
    warnings.push(`Rule '${id}' in allRules but missing from rule-module-registry.ts (may be non-lazy)`)
  }
}

for (const id of allRuleSet) {
  if (!LAZY_ALL_RULE_IDS.includes(id)) {
    warnings.push(`Rule '${id}' in allRules but missing from lazy-loader.ts ALL_RULE_IDS`)
  }
}

const categoryCounts = {}
for (const id of allRuleSet) {
  const cat = getRuleCategory(id)
  categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
}
console.log('\n   Categories:')
for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`     ${cat}: ${count}`)
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`)
  for (const w of warnings) {
    console.log(`   ${w}`)
  }
}

if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`)
  for (const e of errors) {
    console.log(`   ${e}`)
  }
  console.log(`\n❌ Registry sync FAILED with ${errors.length} errors`)
  process.exit(1)
}

if (warnings.length > 0) {
  console.log(`\n✅ Registry sync PASSED with ${warnings.length} warnings`)
} else {
  console.log('\n✅ Registry sync PASSED — all registries are in sync!')
}

process.exit(0)
