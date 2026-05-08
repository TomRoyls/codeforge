export { noUnwrapRule, analyzeNoUnwrap } from './no-unwrap.js'
export { noExpectWithoutMsgRule, analyzeNoExpectWithoutMsg } from './no-expect-without-msg.js'
export { noCloneOnLargeTypeRule, analyzeNoCloneOnLargeType } from './no-clone-on-large-type.js'

import { noUnwrapRule } from './no-unwrap.js'
import { noExpectWithoutMsgRule } from './no-expect-without-msg.js'
import { noCloneOnLargeTypeRule } from './no-clone-on-large-type.js'

import type { RuleDefinition } from '../../types.js'

export const rustRules: RuleDefinition[] = [
  noUnwrapRule,
  noExpectWithoutMsgRule,
  noCloneOnLargeTypeRule,
]
