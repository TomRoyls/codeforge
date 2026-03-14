import { noAwaitInLoopRule } from './no-await-in-loop.js'
import { preferOptionalChainRule } from './prefer-optional-chain.js'
import { noSyncInAsyncRule } from './no-sync-in-async.js'
import { preferObjectSpreadRule } from './prefer-object-spread.js'
import { noMisusedPromisesRule } from './no-misused-promises.js'
import { preferMathTruncRule } from './prefer-math-trunc.js'

export {
  noAwaitInLoopRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
  preferMathTruncRule,
}

export const performanceRules = [
  noAwaitInLoopRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
  preferMathTruncRule,
]
