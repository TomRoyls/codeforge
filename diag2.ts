import { SyntaxKind } from 'ts-morph'

// Check which SyntaxKind names are NOT in KIND_NAME_ALIASES
const KIND_NAME_ALIASES_KEYS = [
  'AnyKeyword', 'ArrayDestructuring', 'ArrayLiteralExpression', 'ArrowFunction',
  'AsExpression', 'AwaitExpression', 'BigIntLiteral', 'BinaryExpression', 'Block',
  'BooleanKeyword', 'BreakStatement', 'CallExpression', 'CallSignature',
  'CaseClause', 'CatchClause', 'ClassDeclaration', 'ClassExpression',
  'ConditionalExpression', 'ContinueStatement', 'DebuggerStatement',
  'DefaultClause', 'DefaultKeyword', 'DeleteExpression', 'DoStatement',
  'ElementAccessExpression', 'EnumDeclaration', 'ExportDeclaration',
  'ExportKeyword', 'ExportSpecifier', 'ExpressionStatement',
  'ExternalModuleReference', 'FalseKeyword', 'ForInStatement', 'ForOfStatement',
  'ForStatement', 'FunctionDeclaration', 'FunctionExpression', 'GetAccessor',
  'Identifier', 'IfStatement', 'ImportDeclaration', 'ImportEqualsDeclaration',
  'ImportExpression', 'ImportSpecifier', 'InExpression', 'InstanceOfExpression',
  'InterfaceDeclaration', 'LabeledStatement', 'MethodDeclaration',
  'ModuleDeclaration', 'NewExpression', 'NonNullExpression',
  'NoSubstitutionTemplateLiteral', 'NullKeyword', 'NumberKeyword', 'NumericLiteral',
  'ObjectDestructuring', 'ObjectKeyword', 'ObjectLiteralExpression',
  'PostfixUnaryExpression', 'PrefixUnaryExpression', 'PrivateIdentifier',
  'PropertyAccessExpression', 'PropertyAssignment', 'PropertyDeclaration',
  'RegularExpressionLiteral', 'ReturnStatement', 'SatisfiesExpression',
  'SetAccessor', 'ShorthandPropertyAssignment', 'SpreadAssignment', 'SpreadElement',
  'StaticBlock', 'StringKeyword', 'StringLiteral', 'SuperKeyword',
  'SwitchStatement', 'TaggedTemplateExpression', 'TemplateExpression',
  'ThisKeyword', 'ThrowStatement', 'TrueKeyword', 'TryStatement',
  'TSAnyKeyword', 'TSArrayType', 'TSEnumMember', 'TSInterfaceBody',
  'TSInterfaceDeclaration', 'TSUnionType', 'TypeAliasDeclaration',
  'TypeAnnotation', 'TypeAssertion', 'TypeLiteral', 'TypeOfExpression',
  'TypeReference', 'UnknownKeyword', 'VariableDeclaration',
  'VariableDeclarationList', 'VariableStatement', 'VoidExpression',
  'VoidKeyword', 'WhileStatement', 'YieldExpression',
  'AbstractKeyword', 'AccessorKeyword', 'AsyncKeyword', 'ConstKeyword',
  'DeclareKeyword', 'OverrideKeyword', 'PrivateKeyword', 'ProtectedKeyword',
  'PublicKeyword', 'ReadonlyKeyword', 'StaticKeyword'
]

// Get all SyntaxKind names that are actual node types (not punctuation, not count markers)
const missingKinds: string[] = []
const ALL_KINDS = Object.entries(SyntaxKind).filter(([name, val]) => 
  typeof val === 'number' && 
  !name.startsWith('First') && 
  !name.startsWith('Last') && 
  !name.includes('Token') &&
  !name.includes('Punctuation') &&
  val >= 1
)

// Print key TS-specific kinds that are NOT in aliases
const importantKinds = [
  'IntersectionType', 'ConditionalType', 'InferType', 'MappedType',
  'IndexedAccessType', 'ConstructorType', 'FunctionType', 'ParenthesizedType',
  'RestType', 'OptionalType', 'TupleType', 'UnionType',
  'TypeOperator', 'TypePredicate', 'TypeQuery', 'InferType',
  'ExpressionWithTypeArguments', 'HeritageClause', 'ExpressionWithTypeArguments',
  'PropertySignature', 'MethodSignature', 'CallSignatureDeclaration',
  'ConstructSignatureDeclaration', 'IndexSignature', 'PropertyAccessExpression',
  'QualifiedName', 'BindExpression', 'CommaListExpression',
  'JsxElement', 'JsxSelfClosingElement', 'JsxOpeningElement',
  'JsxClosingElement', 'JsxFragment', 'JsxOpeningFragment',
  'JsxClosingFragment', 'JsxAttribute', 'JsxSpreadAttribute',
  'JsxText', 'JsxExpression',
  'EnumMember', 'Bundle', 'UnparsedSource', 'SourceFile',
  'MissingDeclaration', 'EmptyStatement',
  'ForOfStatement', 'BreakStatement', 'ContinueStatement',
  'LabeledStatement', 'WithStatement',
  'MetaProperty', 'SpreadElement',
  'ArrayBindingPattern', 'ObjectBindingPattern', 'BindingElement',
  'Constructor', 'PropertyAccessExpression'
]

for (const kind of importantKinds) {
  if (!KIND_NAME_ALIASES_KEYS.includes(kind) && kind in SyntaxKind) {
    missingKinds.push(kind)
  }
}

console.log('Missing important kinds:', missingKinds)

// Also check typescript-specific kinds starting with "Type"
for (const [name] of ALL_KINDS) {
  if (name.startsWith('Type') && !KIND_NAME_ALIASES_KEYS.includes(name) && !name.startsWith('TypeScript')) {
    console.log('Missing Type* kind:', name)
  }
}
