import { noAwaitInLoopRule } from './no-await-in-loop.js';
import { preferOptionalChainRule } from './prefer-optional-chain.js';
import { noSyncInAsyncRule } from './no-sync-in-async.js';
import { preferObjectSpreadRule } from './prefer-object-spread.js';
import { noMisusedPromisesRule } from './no-misused-promises.js';

export {
  noAwaitInLoopRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
};

export const performanceRules = [
  noAwaitInLoopRule,
  preferOptionalChainRule,
  noSyncInAsyncRule,
  preferObjectSpreadRule,
  noMisusedPromisesRule,
];
