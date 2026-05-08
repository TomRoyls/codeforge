export interface MinifyOptions {
  removeComments: boolean
  removeWhitespace: boolean
  mangleVariables: boolean
  removeDeadCode: boolean
  collapseBooleans: boolean
  minifyStrings: boolean
  preserveLineBreaks: boolean
}

export interface MinifyResult {
  original: string
  minified: string
  originalSize: number
  minifiedSize: number
  savings: number
  rulesApplied: string[]
}

export interface MinifyRule {
  name: string
  apply: (code: string) => string
}

export const DEFAULT_MINIFY_OPTIONS: MinifyOptions = {
  removeComments: true,
  removeWhitespace: true,
  mangleVariables: false,
  removeDeadCode: false,
  collapseBooleans: true,
  minifyStrings: false,
  preserveLineBreaks: false,
}
