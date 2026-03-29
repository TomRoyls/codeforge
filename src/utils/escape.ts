/**
 * Escapes special characters for XML output.
 * Replaces &, <, >, ", and ' with their XML entity equivalents.
 */
export function escapeXml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/**
 * Escapes special characters for HTML output.
 * Replaces &, <, >, ", and ' with their HTML entity equivalents.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '"': '&quot;',
    '&': '&amp;',
    "'": '&#039;',
    '<': '&lt;',
    '>': '&gt;',
  }
  return text.replaceAll(/[&<>"']/g, (char: string) => map[char]!)
}

/**
 * Escapes special characters for Markdown output.
 * Escapes characters that have special meaning in Markdown: <, >, &, `, *, _, #, [, ], |
 */
export function escapeMarkdown(text: string): string {
  return text.replaceAll(/[<>&`*_#[\]|]/g, String.raw`\$&`)
}
