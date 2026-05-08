import type {
  ASTNode,
  QuerySelector,
  AttributeSelector,
  PseudoSelector,
  CombinatorSelector,
  QueryMatch,
  QueryResult,
} from './types.js'
import { QueryParser } from './query-parser.js'
import { ASTTraverser } from './ast-traverser.js'

export class QueryEngine {
  private parser = new QueryParser()
  private traverser = new ASTTraverser()

  query(ast: ASTNode, queryString: string): QueryResult {
    const start = performance.now()
    const selector = this.parser.parse(queryString)
    const matches = this.collectMatches(ast, selector)
    const executionTime = performance.now() - start
    return { matches, query: queryString, executionTime }
  }

  queryAll(
    asts: Map<string, ASTNode>,
    queryString: string,
  ): Map<string, QueryResult> {
    const results = new Map<string, QueryResult>()
    for (const [key, ast] of asts) {
      results.set(key, this.query(ast, queryString))
    }
    return results
  }

  private collectMatches(ast: ASTNode, selector: QuerySelector): QueryMatch[] {
    const matches: QueryMatch[] = []
    const allNodes = this.traverser.flatten(ast)

    for (const node of allNodes) {
      const ancestors = this.traverser.getAncestors(node)
      if (this.matches(node, selector, ancestors)) {
        matches.push({
          node,
          ancestors,
          score: this.computeScore(node, selector),
        })
      }
    }

    return matches
  }

  matches(
    node: ASTNode,
    selector: QuerySelector,
    ancestors: ASTNode[],
  ): boolean {
    if (!this.matchType(node, selector.nodeType)) {
      return false
    }

    for (const attr of selector.attributes) {
      if (!this.matchAttribute(node, attr)) {
        return false
      }
    }

    for (const pseudo of selector.pseudoClasses) {
      if (!this.matchPseudo(node, pseudo, ancestors)) {
        return false
      }
    }

    if (selector.combinator && selector.child) {
      if (!this.matchCombinator(node, selector.combinator, selector.child, ancestors)) {
        return false
      }
    }

    return true
  }

  private matchType(node: ASTNode, nodeType: string): boolean {
    if (nodeType === '*') return true
    return node.type === nodeType
  }

  matchAttribute(node: ASTNode, attr: AttributeSelector): boolean {
    if (attr.operator === 'exists') {
      return attr.name in node.properties || (attr.name === 'value' && node.value !== undefined)
    }

    let nodeValue: unknown
    if (attr.name === 'value') {
      nodeValue = node.value
    } else if (attr.name === 'type') {
      nodeValue = node.type
    } else {
      nodeValue = node.properties[attr.name]
    }

    if (nodeValue === undefined) return false

    const attrValue = attr.value ?? ''
    const strNodeValue = String(nodeValue)
    const numAttrValue = Number(attrValue)
    const numNodeValue = Number(nodeValue)

    switch (attr.operator) {
      case '=': {
        if (attrValue.startsWith('>') || attrValue.startsWith('<')) {
          const numVal = Number(attrValue.slice(1))
          if (attrValue.startsWith('>')) return numNodeValue > numVal
          if (attrValue.startsWith('<')) return numNodeValue < numVal
        }
        if (!isNaN(numAttrValue) && !isNaN(numNodeValue)) {
          return numNodeValue === numAttrValue
        }
        return strNodeValue === attrValue
      }
      case '!=':
        return strNodeValue !== attrValue
      case '~=':
        return strNodeValue
          .split(/[\s,]+/)
          .some((w) => w === attrValue)
      case '^=':
        return strNodeValue.startsWith(attrValue)
      case '$=':
        return strNodeValue.endsWith(attrValue)
      case '*=':
        return strNodeValue.includes(attrValue)
      default:
        return false
    }
  }

  matchPseudo(
    node: ASTNode,
    pseudo: PseudoSelector,
    ancestors: ASTNode[],
  ): boolean {
    switch (pseudo.name) {
      case 'first-child': {
        const parent = node.parent
        if (!parent) return true
        return parent.children[0] === node
      }
      case 'last-child': {
        const parent = node.parent
        if (!parent) return true
        return parent.children[parent.children.length - 1] === node
      }
      case 'nth-child': {
        const parent = node.parent
        if (!parent) return false
        const idx = typeof pseudo.argument === 'number' ? pseudo.argument : Number(pseudo.argument)
        if (isNaN(idx)) return false
        return parent.children[idx - 1] === node
      }
      case 'has': {
        if (typeof pseudo.argument !== 'string') return false
        const childSelector = this.parser.parse(pseudo.argument)
        const allChildren = this.traverser.flatten(node)
        return allChildren.some((child) => {
          if (child === node) return false
          const childAncestors = this.traverser.getAncestors(child)
          return this.matches(child, childSelector, childAncestors)
        })
      }
      case 'not': {
        if (typeof pseudo.argument !== 'string') return false
        const notSelector = this.parser.parse(pseudo.argument)
        return !this.matches(node, notSelector, ancestors)
      }
      case 'empty':
        return node.children.length === 0
      case 'root':
        return !node.parent
      case 'leaf':
        return this.traverser.isLeaf(node)
      default:
        return false
    }
  }

  matchCombinator(
    node: ASTNode,
    combinator: CombinatorSelector,
    childSelector: QuerySelector,
    _ancestors: ASTNode[],
  ): boolean {
    switch (combinator.type) {
      case 'descendant': {
        return node.children.some((child) => {
          const childAnc = this.traverser.getAncestors(child)
          if (this.matches(child, childSelector, childAnc)) return true
          return this.matchCombinator(child, combinator, childSelector, childAnc)
        })
      }
      case 'child': {
        return node.children.some((child) => {
          const childAnc = this.traverser.getAncestors(child)
          return this.matches(child, childSelector, childAnc)
        })
      }
      case 'adjacent': {
        const next = this.traverser.getNextSibling(node)
        if (!next) return false
        const nextAnc = this.traverser.getAncestors(next)
        return this.matches(next, childSelector, nextAnc)
      }
      case 'sibling': {
        if (!node.parent) return false
        const idx = node.parent.children.indexOf(node)
        return node.parent.children.slice(idx + 1).some((sibling) => {
          const sibAnc = this.traverser.getAncestors(sibling)
          return this.matches(sibling, childSelector, sibAnc)
        })
      }
      default:
        return false
    }
  }

  private computeScore(node: ASTNode, selector: QuerySelector): number {
    let score = 0
    if (selector.nodeType !== '*') score += 10
    score += selector.attributes.length * 5
    score += selector.pseudoClasses.length * 3
    score += this.traverser.getNodeDepth(node)
    return score
  }

  buildASTFromSource(source: string): ASTNode {
    const lines = source.split('\n')
    const root: ASTNode = {
      type: 'Program',
      children: [],
      properties: {},
      location: {
        startLine: 1,
        startCol: 0,
        endLine: lines.length,
        endCol: (lines[lines.length - 1] ?? '').length,
      },
    }

    const patterns: {
      regex: RegExp
      type: string
      props: (m: RegExpMatchArray) => Record<string, unknown>
    }[] = [
      {
        regex: /import\s+.*?['"].*?['"]/g,
        type: 'ImportDeclaration',
        props: (m) => ({ source: m[0] }),
      },
      {
        regex: /export\s+default\s+/g,
        type: 'ExportDefault',
        props: (m) => ({ raw: m[0] }),
      },
      {
        regex: /export\s+(?:const|let|var|function|class|interface|type|enum)\s+/g,
        type: 'ExportDeclaration',
        props: (m) => ({ raw: m[0] }),
      },
      {
        regex: /(?:async\s+)?function\s+(\w+)/g,
        type: 'FunctionDeclaration',
        props: (m) => ({ name: m[1], async: m[0].includes('async') }),
      },
      {
        regex: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g,
        type: 'VariableDeclaration',
        props: (m) => ({ name: m[1], kind: 'function' }),
      },
      {
        regex: /(?:const|let|var)\s+(\w+)\s*=/g,
        type: 'VariableDeclaration',
        props: (m) => ({ name: m[1] }),
      },
      {
        regex: /class\s+(\w+)/g,
        type: 'ClassDeclaration',
        props: (m) => ({ name: m[1] }),
      },
      {
        regex: /if\s*\(/g,
        type: 'IfStatement',
        props: () => ({}),
      },
      {
        regex: /for\s*\(/g,
        type: 'ForStatement',
        props: () => ({}),
      },
      {
        regex: /while\s*\(/g,
        type: 'WhileStatement',
        props: () => ({}),
      },
      {
        regex: /return\s+/g,
        type: 'ReturnStatement',
        props: () => ({}),
      },
      {
        regex: /throw\s+/g,
        type: 'ThrowStatement',
        props: () => ({}),
      },
      {
        regex: /try\s*\{/g,
        type: 'TryStatement',
        props: () => ({}),
      },
      {
        regex: /\w+\(/g,
        type: 'CallExpression',
        props: (m) => ({ callee: m[0].replace('(', '') }),
      },
    ]

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx]!
      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0
        let match: RegExpMatchArray | null
        while ((match = pattern.regex.exec(line)) !== null) {
          const node: ASTNode = {
            type: pattern.type,
            children: [],
            properties: pattern.props(match),
            location: {
              startLine: lineIdx + 1,
              startCol: match.index ?? 0,
              endLine: lineIdx + 1,
              endCol: (match.index ?? 0) + (match[0]?.length ?? 0),
            },
            parent: root,
          }
          root.children.push(node)
        }
      }
    }

    return root
  }

  highlightMatches(source: string, matches: QueryMatch[]): string {
    const lines = source.split('\n')
    const matchLines = new Set<number>()

    for (const match of matches) {
      for (
        let i = match.node.location.startLine - 1;
        i < match.node.location.endLine;
        i++
      ) {
        matchLines.add(i)
      }
    }

    const result: string[] = []
    for (let i = 0; i < lines.length; i++) {
      if (matchLines.has(i)) {
        result.push(`>>> ${lines[i]} >>>`)
      } else {
        result.push(lines[i]!)
      }
    }

    return result.join('\n')
  }
}
