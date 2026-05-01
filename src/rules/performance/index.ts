import { noAwaitInLoopRule } from './no-await-in-loop.js'
import { noInefficientArrayMethodsRule } from './no-inefficient-array-methods.js'
import { noMisusedPromisesRule } from './no-misused-promises.js'
import { noSyncInAsyncRule } from './no-sync-in-async.js'
import { preferMathTruncRule } from './prefer-math-trunc.js'
import { preferObjectSpreadRule } from './prefer-object-spread.js'
import { preferOptionalChainRule } from './prefer-optional-chain.js'
import { noPrimitiveWrapperMapsRule } from './no-primitive-wrapper-maps.js'
import { noArrayReduceRule } from './no-array-reduce.js'
import { noInefficientStringConcatRule } from './no-inefficient-string-concat.js'
import { noConstantResponseRule } from './no-constant-response.js'
import { noUnnecessaryAsyncRule } from './no-unnecessary-async.js'
import { noMisusedPromiseReturnRule } from './no-misused-promise-return.js'



export const performanceRules = [
  noAwaitInLoopRule,
  noInefficientArrayMethodsRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
  preferMathTruncRule,
  noPrimitiveWrapperMapsRule,
  noArrayReduceRule,
  noInefficientStringConcatRule,
  noConstantResponseRule,
  noUnnecessaryAsyncRule,
  noMisusedPromiseReturnRule,
]

export {noAwaitInLoopRule} from './no-await-in-loop.js'
export {noInefficientArrayMethodsRule} from './no-inefficient-array-methods.js'
export {noMisusedPromisesRule} from './no-misused-promises.js'
export {noSyncInAsyncRule} from './no-sync-in-async.js'
export {preferMathTruncRule} from './prefer-math-trunc.js'
export {preferObjectSpreadRule} from './prefer-object-spread.js'
export {preferOptionalChainRule} from './prefer-optional-chain.js'
export {noPrimitiveWrapperMapsRule} from './no-primitive-wrapper-maps.js'
export {noArrayReduceRule} from './no-array-reduce.js'
export {noInefficientStringConcatRule} from './no-inefficient-string-concat.js'
export {noConstantResponseRule} from './no-constant-response.js'
export {noUnnecessaryAsyncRule} from './no-unnecessary-async.js'
export {noMisusedPromiseReturnRule} from './no-misused-promise-return.js'
