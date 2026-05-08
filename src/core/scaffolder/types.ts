export interface TemplateVariable {
  name: string
  description: string
  defaultValue?: string
  required: boolean
}

export interface FileTemplate {
  path: string
  content: string
  executable: boolean
}

export interface ScaffoldTemplate {
  name: string
  description: string
  variables: TemplateVariable[]
  files: FileTemplate[]
}

export interface ScaffoldResult {
  filesCreated: string[]
  filesSkipped: string[]
  variables: Record<string, string>
}

export interface ScaffoldConfig {
  outputDir: string
  overwrite: boolean
  variables: Record<string, string>
}

export const DEFAULT_SCAFFOLD_CONFIG: ScaffoldConfig = {
  outputDir: '.',
  overwrite: false,
  variables: {},
}
