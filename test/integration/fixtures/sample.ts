// Sample TypeScript file with intentional violations for integration testing

// no-var: should use const/let
var x = 1

// prefer-const: should be const
let y = 2

// no-eval: security issue
eval("console.log('test')")

// no-any: type safety
function processData(data: any) {
  return data
}

// prefer-optional-chain: can be simplified
interface Config {
  database?: {
    host?: string
  }
}

function getHost(config: Config) {
  return config && config.database && config.database.host
}

export { x, y, processData, getHost }
