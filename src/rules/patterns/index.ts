import { maxFileSizeRule } from './max-file-size.js'
import { noDuplicateCodeRule } from './no-duplicate-code.js'
import { preferConstRule } from './prefer-const.js'

export const patternsRules = {
  'max-file-size': maxFileSizeRule,
  'no-duplicate-code': noDuplicateCodeRule,
  'prefer-const': preferConstRule,
}

export { maxFileSizeRule, noDuplicateCodeRule, preferConstRule }
