export interface RefactoringContext {
  filePath: string
  source: string
  selection?: { startLine: number; startColumn: number; endLine: number; endColumn: number }
  cursor?: { line: number; column: number }
}

export interface TextEdit {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
  newText: string
}

export interface RefactoringAction {
  type: 'rename' | 'extract-function' | 'extract-variable' | 'inline' | 'move' | 'simplify'
  description: string
  filePath: string
  edits: TextEdit[]
  cursorPosition?: { line: number; column: number }
}

export interface RenameResult {
  success: boolean
  oldName: string
  newName: string
  occurrences: number
  edits: Map<string, TextEdit[]>
}

export interface ExtractResult {
  success: boolean
  extractedName: string
  sourceEdits: TextEdit[]
  newDeclaration: string
  declarationLocation: { line: number; column: number }
}

export interface RefactorSuggestion {
  type: RefactoringAction['type']
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  location: { filePath: string; line: number }
}
