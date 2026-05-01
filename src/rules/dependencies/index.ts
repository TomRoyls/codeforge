/**
 * @file Dependency analysis rules for CodeForge
 * Exports all dependency-related rules as a unified module
 * @module rules/dependencies
 */

import type { RuleDefinition } from '../../plugins/types.js'

import { consistentImportsRule } from './consistent-imports.js'
import { noBarrelImportsRule } from './no-barrel-imports.js'
import { noCircularDepsRule } from './no-circular-deps.js'
import { noUnusedExportsRule } from './no-unused-exports.js'
import { noCjsImportsRule } from './no-cjs-imports.js'
import { noDynamicImportRule } from './no-dynamic-import.js'
import { noImplicitDependenciesRule } from './no-implicit-dependencies.js'
import { noGitDependenciesRule } from './no-git-dependencies.js'

export const rules: Record<string, RuleDefinition> = {
  'consistent-imports': consistentImportsRule,
  'no-barrel-imports': noBarrelImportsRule,
  'no-circular-deps': noCircularDepsRule,
  'no-unused-exports': noUnusedExportsRule,
  'no-cjs-imports': noCjsImportsRule,
  'no-dynamic-import': noDynamicImportRule,
  'no-implicit-dependencies': noImplicitDependenciesRule,
  'no-git-dependencies': noGitDependenciesRule,
}


export default rules

export {consistentImportsRule} from './consistent-imports.js'
export {noBarrelImportsRule} from './no-barrel-imports.js'
export {noCircularDepsRule} from './no-circular-deps.js'
export {noUnusedExportsRule} from './no-unused-exports.js'
export {noCjsImportsRule} from './no-cjs-imports.js'
export {noDynamicImportRule} from './no-dynamic-import.js'
export {noImplicitDependenciesRule} from './no-implicit-dependencies.js'
export {noGitDependenciesRule} from './no-git-dependencies.js'