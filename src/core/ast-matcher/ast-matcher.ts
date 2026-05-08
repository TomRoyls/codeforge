import type { ASTNode, MatchPattern, MatchResult, MatchConfig } from './types.js'
import { DEFAULT_CONFIG } from './types.js'
import { PatternCompiler } from './pattern-compiler.js'

export class ASTMatcher {
  private config: MatchConfig
  private compiler: PatternCompiler

  constructor(config?: Partial<MatchConfig>) {
    this.config = {
      maxDepth: config?.maxDepth ?? DEFAULT_CONFIG.maxDepth,
      caseSensitive: config?.caseSensitive ?? DEFAULT_CONFIG.caseSensitive,
    }
    this.compiler = new PatternCompiler()
  }

  match(node: ASTNode, pattern: MatchPattern): boolean {
    const compiled = this.compiler.compile(pattern)
    return this.matchNode(node, compiled)
  }

  findAll(root: ASTNode, pattern: MatchPattern): MatchResult[] {
    const compiled = this.compiler.compile(pattern)
    const results: MatchResult[] = []
    this.searchAll(root, compiled, results, 0)
    return results
  }

  findFirst(root: ASTNode, pattern: MatchPattern): MatchResult | undefined {
    const compiled = this.compiler.compile(pattern)
    return this.searchFirst(root, compiled, 0)
  }

  capture(root: ASTNode, pattern: MatchPattern): MatchResult[] {
    const compiled = this.compiler.compile(pattern)
    const results: MatchResult[] = []
    this.searchAll(root, compiled, results, 0)
    for (const result of results) {
      this.collectCaptures(result.node, compiled, result.captures)
    }
    return results
  }

  count(root: ASTNode, pattern: MatchPattern): number {
    return this.findAll(root, pattern).length
  }

  getPath(root: ASTNode, pattern: MatchPattern): ASTNode[][] {
    const compiled = this.compiler.compile(pattern)
    const results: ASTNode[][] = []
    this.searchPath(root, compiled, [], results, 0)
    return results
  }

  getConfig(): MatchConfig {
    return { ...this.config }
  }

  private matchNode(node: ASTNode, pattern: MatchPattern): boolean {
    if (!this.matchType(node.type, pattern.type)) {
      return false
    }

    if (pattern.value !== undefined) {
      if (!this.matchValue(node.value, pattern.value)) {
        return false
      }
    }

    if (pattern.properties) {
      for (const [key, val] of Object.entries(pattern.properties)) {
        const nodeVal = node.properties[key]
        if (nodeVal === undefined || !this.matchStringValue(nodeVal, val)) {
          return false
        }
      }
    }

    if (pattern.children && pattern.children.length > 0) {
      const nodeChildren = node.children ?? []
      for (const childPattern of pattern.children) {
        const found = nodeChildren.some((child) => this.matchNode(child, childPattern))
        if (!found) {
          return false
        }
      }
    }

    return true
  }

  private matchType(nodeType: string, patternType: string): boolean {
    if (patternType === '*') return true
    if (this.config.caseSensitive) {
      return nodeType === patternType
    }
    return nodeType.toLowerCase() === patternType.toLowerCase()
  }

  private matchValue(nodeValue: string | undefined, patternValue: string): boolean {
    if (nodeValue === undefined) return false
    if (this.config.caseSensitive) {
      return nodeValue === patternValue
    }
    return nodeValue.toLowerCase() === patternValue.toLowerCase()
  }

  private matchStringValue(nodeVal: string, patternVal: string): boolean {
    if (this.config.caseSensitive) {
      return nodeVal === patternVal
    }
    return nodeVal.toLowerCase() === patternVal.toLowerCase()
  }

  private searchAll(
    node: ASTNode,
    pattern: MatchPattern,
    results: MatchResult[],
    depth: number,
  ): void {
    if (depth > this.config.maxDepth) return

    if (this.matchNode(node, pattern)) {
      results.push({
        node,
        captures: new Map<string, ASTNode[]>(),
        depth,
      })
    }

    const children = node.children
    if (children) {
      for (const child of children) {
        this.searchAll(child, pattern, results, depth + 1)
      }
    }
  }

  private searchFirst(
    node: ASTNode,
    pattern: MatchPattern,
    depth: number,
  ): MatchResult | undefined {
    if (depth > this.config.maxDepth) return undefined

    if (this.matchNode(node, pattern)) {
      return {
        node,
        captures: new Map<string, ASTNode[]>(),
        depth,
      }
    }

    const children = node.children
    if (children) {
      for (const child of children) {
        const result = this.searchFirst(child, pattern, depth + 1)
        if (result) return result
      }
    }

    return undefined
  }

  private collectCaptures(
    node: ASTNode,
    pattern: MatchPattern,
    captures: Map<string, ASTNode[]>,
  ): void {
    if (pattern.captureName) {
      const existing = captures.get(pattern.captureName) ?? []
      existing.push(node)
      captures.set(pattern.captureName, existing)
    }

    if (pattern.children && pattern.children.length > 0) {
      const nodeChildren = node.children ?? []
      for (const childPattern of pattern.children) {
        for (const child of nodeChildren) {
          if (this.matchNode(child, childPattern)) {
            this.collectCaptures(child, childPattern, captures)
          }
        }
      }
    }
  }

  private searchPath(
    node: ASTNode,
    pattern: MatchPattern,
    currentPath: ASTNode[],
    results: ASTNode[][],
    depth: number,
  ): void {
    if (depth > this.config.maxDepth) return

    const path = [...currentPath, node]

    if (this.matchNode(node, pattern)) {
      results.push(path)
    }

    const children = node.children
    if (children) {
      for (const child of children) {
        this.searchPath(child, pattern, path, results, depth + 1)
      }
    }
  }
}
