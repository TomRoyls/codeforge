export type FlowNodeType =
  | 'source'
  | 'sink'
  | 'propagator'
  | 'sanitizer'
  | 'variable'
  | 'parameter'
  | 'return'
  | 'literal'

export interface FlowNode {
  id: string
  type: FlowNodeType
  name: string
  filePath: string
  line: number
  column: number
  dataType?: string
  sanitized?: boolean
  sanitizerName?: string
}

export interface FlowEdge {
  from: string
  to: string
  type: 'assignment' | 'argument' | 'return' | 'property' | 'spread' | 'ternary'
  label?: string
}

export interface DataFlowGraph {
  nodes: Map<string, FlowNode>
  edges: FlowEdge[]
  filePath: string
}

export interface TaintSource {
  name: string
  category: 'user-input' | 'file-system' | 'network' | 'database' | 'environment'
  patterns: string[]
}

export interface TaintSink {
  name: string
  category: 'sql' | 'xss' | 'command' | 'path' | 'eval' | 'deserialize' | 'redirect'
  patterns: string[]
}

export interface TaintPath {
  source: FlowNode
  sink: FlowNode
  nodes: FlowNode[]
  edges: FlowEdge[]
  isSanitized: boolean
  sanitizer?: string
}

export interface SecurityVulnerability {
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  filePath: string
  line: number
  column: number
  message: string
  source: string
  sink: string
  path: TaintPath
  suggestion: string
  cwe?: string
}

export interface DataFlowAnalysisResult {
  vulnerabilities: SecurityVulnerability[]
  graphs: DataFlowGraph[]
  summary: {
    totalSources: number
    totalSinks: number
    totalVulnerabilities: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
  }
}

export const TAINT_SOURCES: TaintSource[] = [
  {
    name: 'process.argv',
    category: 'user-input',
    patterns: ['process.argv'],
  },
  {
    name: 'process.env',
    category: 'environment',
    patterns: ['process.env'],
  },
  {
    name: 'req.params',
    category: 'user-input',
    patterns: ['req.params', 'request.params'],
  },
  {
    name: 'req.query',
    category: 'user-input',
    patterns: ['req.query', 'request.query'],
  },
  {
    name: 'req.body',
    category: 'user-input',
    patterns: ['req.body', 'request.body'],
  },
  {
    name: 'req.headers',
    category: 'user-input',
    patterns: ['req.headers', 'request.headers'],
  },
  {
    name: 'fs.readFileSync',
    category: 'file-system',
    patterns: ['fs.readFileSync', 'fs.readFile'],
  },
  {
    name: 'http.request',
    category: 'network',
    patterns: ['http.request', 'https.request'],
  },
  {
    name: 'fetch',
    category: 'network',
    patterns: ['fetch(', 'axios.get', 'axios.post', 'axios.put', 'axios.delete', 'axios.patch'],
  },
  {
    name: 'window.location',
    category: 'user-input',
    patterns: ['window.location', 'document.URL', 'document.documentURI'],
  },
  {
    name: 'document.cookie',
    category: 'user-input',
    patterns: ['document.cookie'],
  },
  {
    name: 'localStorage',
    category: 'user-input',
    patterns: ['localStorage.getItem', 'sessionStorage.getItem'],
  },
]

export const TAINT_SINKS: TaintSink[] = [
  {
    name: 'mysql.query',
    category: 'sql',
    patterns: [
      'mysql.query',
      'pg.query',
      'sqlite.run',
      'sqlite.all',
      'db.query',
      'db.run',
      'connection.query',
      'pool.query',
    ],
  },
  {
    name: 'innerHTML',
    category: 'xss',
    patterns: ['.innerHTML', '.outerHTML', 'document.write', 'document.writeln'],
  },
  {
    name: 'exec',
    category: 'command',
    patterns: ['child_process.exec', 'child_process.execSync', 'exec(', 'execSync(', 'spawn(', 'execFile('],
  },
  {
    name: 'path.join',
    category: 'path',
    patterns: ['path.join', 'path.resolve', 'path.normalize'],
  },
  {
    name: 'eval',
    category: 'eval',
    patterns: ['eval(', 'new Function(', 'Function('],
  },
  {
    name: 'JSON.parse',
    category: 'deserialize',
    patterns: ['JSON.parse'],
  },
  {
    name: 'res.redirect',
    category: 'redirect',
    patterns: ['res.redirect', 'response.redirect', 'location.href'],
  },
]

export const SANITIZERS: string[] = [
  'escapeHtml',
  'escape',
  'sanitize',
  'encodeURI',
  'encodeURIComponent',
  'DOMPurify.sanitize',
  'xss(',
  'validator.escape',
  'validator.trim',
  'escapeHtml',
  'sqlEscape',
  'mysql.escape',
  'pg.escapeLiteral',
  'parameterized',
  '?',
]
