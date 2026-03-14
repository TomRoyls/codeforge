const fs = require('fs');

// Read the file
let content = fs.readFileSync('$file', 'utf8');
const lines = content.split('\n');

// Describe blocks that typically contain tests using await reporter.report
const describeBlocksWithAwait = [
  "describe('report', ()",
  "describe('format', ()",
  "describe('report to console', ()",
  "describe('report to file', ()",
  "describe('testcase generation', ()",
  "describe('transformResults', ()",
  "describe('includeSource option', ()",
  "describe('violations with suggestions', ()",
  "describe('footer', ()",
  "describe('summary output', ()",
  "describe('color output', ()",
  "describe('time formatting', ()",
  "describe('edge cases', ()",
  "describe('fingerprint generation', ()",
  "describe('XML escaping', ()",
  "describe('multiple files and violations', ()",
  "describe('format with source', ()",
  "describe('format with suggestion', ()",
  "describe('controls section', ()",
  "describe('file sections', ()",
  "describe('HTML structure', ()",
  "describe('violation rendering', ()",
  "describe('controls section', ()"
];

let inTargetBlock = false;
let result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're entering a target describe block
  if (describeBlocksWithAwait.some(block => line.includes(block))) {
    inTargetBlock = true;
    result.push(line);
    continue;
  }
  
  // Check if we're leaving a describe block (starts with })
  if (line.trim().startsWith('}')) {
    inTargetBlock = false;
    result.push(line);
    continue;
  }
  
  // If in target block, add async to test functions
  if (inTargetBlock && line.match(/^\s+test\(/)) {
    result.push(line.replace('() => {', 'async () => {'));
  } else {
    result.push(line);
  }
}

// Write back
fs.writeFileSync('$file', result.join('\n'));
console.log('Fixed $file');
