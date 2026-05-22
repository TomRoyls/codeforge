import { analyzeMesaLayer, classifyRegionType } from './src/commands/mesa-plateau-helpers.js'
const EMPTY = `// minimal file with nothing much\nvar x = 1\n`
const e1 = analyzeMesaLayer(EMPTY, 'src/e1.ts')
const e2 = analyzeMesaLayer(EMPTY, 'src/e2.ts')
console.log("e1 quality:", e1.qualityScore, "condition:", e1.condition)
console.log("regionType([e1,e2]):", classifyRegionType([e1, e2]))
