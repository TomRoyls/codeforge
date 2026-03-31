import { describe, it, expect } from "vitest"
import { Project } from "ts-morph"
import {
  analyzePreferDefaultExport,
  preferDefaultExportRule,
} from "../../../../src/rules/best-practices/prefer-default-export.js"

import type { VisitorContext } from "../../../../src/ast/visitor.js"

describe("prefer-default-export rule", () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile("test.ts", code)
  }

  describe("analyzePreferDefaultExport", () => {
    it("should flag single named export without default", () => {
      const sourceFile = createSourceFile("export const config = { mode: 'dev' };")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain("default export")
    })

    it("should not flag single default export", () => {
      const sourceFile = createSourceFile("const config = { mode: 'dev' }; export default config;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should not flag multiple named exports", () => {
      const sourceFile = createSourceFile("export const a = 1; export const b = 2;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should not flag module with no exports", () => {
      const sourceFile = createSourceFile("const internal = 'private';")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should flag single exported function", () => {
      const sourceFile = createSourceFile("export function greet() { return 'hello'; }")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should flag single exported class", () => {
      const sourceFile = createSourceFile("export class MyClass {}")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should flag single exported interface", () => {
      const sourceFile = createSourceFile("export interface MyProps { name: string; }")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should flag single exported type alias", () => {
      const sourceFile = createSourceFile("export type MyType = string | number;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should flag single exported enum", () => {
      const sourceFile = createSourceFile("export enum Status { Active, Inactive }")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should not flag interface when ignoreExportedTypes is true", () => {
      const sourceFile = createSourceFile("export interface MyProps { name: string; }")
      const violations = analyzePreferDefaultExport(sourceFile, { ignoreExportedTypes: true })
      expect(violations).toHaveLength(0)
    })

    it("should not flag type alias when ignoreExportedTypes is true", () => {
      const sourceFile = createSourceFile("export type MyType = string | number;")
      const violations = analyzePreferDefaultExport(sourceFile, { ignoreExportedTypes: true })
      expect(violations).toHaveLength(0)
    })

    it("should not flag enum when ignoreExportedTypes is true", () => {
      const sourceFile = createSourceFile("export enum Status { Active, Inactive }")
      const violations = analyzePreferDefaultExport(sourceFile, { ignoreExportedTypes: true })
      expect(violations).toHaveLength(0)
    })

    it("should not flag function with default export", () => {
      const sourceFile = createSourceFile("export default function greet() { return 'hello'; }")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should not flag class with default export", () => {
      const sourceFile = createSourceFile("export default class MyClass {}")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should not flag when there are both named and default exports", () => {
      const sourceFile = createSourceFile("export const a = 1; export default function() {}")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should flag single re-exported item", () => {
      const sourceFile = createSourceFile("export { foo } from './other';")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should flag single re-export declaration", () => {
      const sourceFile = createSourceFile("export { foo, bar } from './other';")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should not flag namespace export", () => {
      const sourceFile = createSourceFile("export * from './other';")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should handle mixed exports correctly", () => {
      const sourceFile = createSourceFile("export const a = 1; export interface B {}")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it("should flag single variable declaration in export", () => {
      const sourceFile = createSourceFile("export const singleVar = 42;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should not flag multiple declarations in variable statement", () => {
      const sourceFile = createSourceFile("export const a = 1, b = 2;")
      const violations = analyzePreferDefaultExport(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe("rule definition", () => {
    it("should have correct meta properties", () => {
      expect(preferDefaultExportRule.meta.name).toBe("prefer-default-export")
      expect(preferDefaultExportRule.meta.category).toBe("style")
      expect(preferDefaultExportRule.meta.recommended).toBe(false)
    })

    it("should have default options", () => {
      expect(preferDefaultExportRule.defaultOptions).toBeDefined()
      expect(preferDefaultExportRule.defaultOptions.target).toBe("single")
      expect(preferDefaultExportRule.defaultOptions.ignoreExportedTypes).toBe(false)
    })

    it("should create visitor", () => {
      const result = preferDefaultExportRule.create(preferDefaultExportRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it("should merge custom options with defaults", () => {
      const result = preferDefaultExportRule.create({ ignoreExportedTypes: true })
      expect(result.visitor).toBeDefined()
    })

    it("should use visitor to detect violations", () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sourceFile = project.createSourceFile("test.ts", "export const single = 1;")
      const ruleInstance = preferDefaultExportRule.create({})
      const context = { filePath: "test.ts", sourceFile } as VisitorContext
      ruleInstance.visitor.visitSourceFile(sourceFile, context)
      const violations = ruleInstance.onComplete()
      expect(violations.length).toBeGreaterThan(0)
    })

    it("should return empty violations from visitor when no issue", () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sourceFile = project.createSourceFile("test.ts", "export const a = 1; export const b = 2;")
      const ruleInstance = preferDefaultExportRule.create({})
      const context = { filePath: "test.ts", sourceFile } as VisitorContext
      ruleInstance.visitor.visitSourceFile(sourceFile, context)
      const violations = ruleInstance.onComplete()
      expect(violations).toHaveLength(0)
    })

    it("should respect ignoreExportedTypes option in visitor", () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sourceFile = project.createSourceFile("test.ts", "export interface MyProps { name: string; }")
      const ruleInstance = preferDefaultExportRule.create({ ignoreExportedTypes: true })
      const context = { filePath: "test.ts", sourceFile } as VisitorContext
      ruleInstance.visitor.visitSourceFile(sourceFile, context)
      const violations = ruleInstance.onComplete()
      expect(violations).toHaveLength(0)
    })
  })
})
