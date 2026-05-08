import type { RuleDefinition } from '../../types.js'

import { noEmptyMethodRule } from './no-empty-method.js'
import { noInputRenameRule } from './no-input-rename.js'
import { noServicesInComponentRule } from './no-services-in-component.js'
import { preferOnPushRule } from './prefer-on-push.js'

export const angularRules: Record<string, RuleDefinition> = {
  'angular/no-empty-method': noEmptyMethodRule,
  'angular/no-input-rename': noInputRenameRule,
  'angular/prefer-on-push': preferOnPushRule,
  'angular/no-services-in-component': noServicesInComponentRule,
}

export { noEmptyMethodRule } from './no-empty-method.js'
export { noInputRenameRule } from './no-input-rename.js'
export { preferOnPushRule } from './prefer-on-push.js'
export { noServicesInComponentRule } from './no-services-in-component.js'
