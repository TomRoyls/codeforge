import { noAwaitInLoopRule } from './no-await-in-loop.js'
import { noMisusedPromisesRule } from './no-misused-promises.js'
import { noSyncInAsyncRule } from './no-sync-in-async.js'
import { preferMathTruncRule } from './prefer-math-trunc.js'
import { preferObjectSpreadRule } from './prefer-object-spread.js'
import { preferOptionalChainRule } from './prefer-optional-chain.js'



export const performanceRules = [
  noAwaitInLoopRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
  preferMathTruncRule,
]

export {noAwaitInLoopRule} from './no-await-in-loop.js'
export {noMisusedPromisesRule} from './no-misused-promises.js'
export {noSyncInAsyncRule} from './no-sync-in-async.js'
export {preferMathTruncRule} from './prefer-math-trunc.js'
export {preferObjectSpreadRule} from './prefer-object-spread.js'
export {preferOptionalChainRule} from './prefer-optional-chain.js'