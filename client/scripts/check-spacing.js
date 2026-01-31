#!/usr/bin/env node

/**
 * Design Token Checker
 * Scans CSS files for hardcoded values that should use design tokens
 */

const fs = require('fs');
const path = require('path');

// Valid 8px grid values
const validSpacing = [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96];

// Design token patterns
const tokenPatterns = {
  spacing: /var\(--space-\d+\)/g,
  fontSize: /var\(--font-size-\w+\)/g,
  radius: /var\(--radius-\w+\)/g,
  shadow: /var\(--shadow-\w+\)/g,
  transition: /var\(--transition-\w+\)/g,
};

// Hardcoded value patterns
const hardcodedPatterns = {
  spacing: /(padding|margin|gap|top|right|bottom|left|width|height):\s*(\d+)px/g,
  fontSize: /font-size:\s*(\d+)px/g,
  borderRadius: /border-radius:\s*(\d+)px/g,
  boxShadow: /box-shadow:\s*[^;]+rgba/g,
  transition: /transition:\s*all\s+(\d+\.?\d*)s/g,
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const stats = {
    totalLines: content.split('\n').length,
    hardcodedValues: 0,
    tokenUsage: 0,
    nonGridValues: 0,
  };

  // Count token usage
  Object.values(tokenPatterns).forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      stats.tokenUsage += matches.length;
    }
  });

  // Check for hardcoded spacing
  let match;
  const spacingRegex = new RegExp(hardcodedPatterns.spacing);
  while ((match = spacingRegex.exec(content)) !== null) {
    const value = parseInt(match[2]);
    const property = match[1];
    const line = content.substring(0, match.index).split('\n').length;

    stats.hardcodedValues++;

    if (!validSpacing.includes(value)) {
      stats.nonGridValues++;
      const suggestion = findNearestGridValue(value);
      issues.push({
        line,
        property,
        value: `${value}px`,
        suggestion: `var(--space-${suggestion.token})`,
        message: `Non-grid value: ${value}px → ${suggestion.value}px (${suggestion.token})`,
      });
    } else {
      const token = getSpacingToken(value);
      issues.push({
        line,
        property,
        value: `${value}px`,
        suggestion: `var(--space-${token})`,
        message: `Use design token: ${value}px → var(--space-${token})`,
      });
    }
  }

  // Check for hardcoded font sizes
  const fontSizeRegex = new RegExp(hardcodedPatterns.fontSize);
  while ((match = fontSizeRegex.exec(content)) !== null) {
    const value = parseInt(match[1]);
    const line = content.substring(0, match.index).split('\n').length;
    const token = getFontSizeToken(value);

    if (token) {
      stats.hardcodedValues++;
      issues.push({
        line,
        property: 'font-size',
        value: `${value}px`,
        suggestion: `var(--font-size-${token})`,
        message: `Use design token: ${value}px → var(--font-size-${token})`,
      });
    }
  }

  // Check for hardcoded border radius
  const radiusRegex = new RegExp(hardcodedPatterns.borderRadius);
  while ((match = radiusRegex.exec(content)) !== null) {
    const value = parseInt(match[1]);
    const line = content.substring(0, match.index).split('\n').length;
    const token = getRadiusToken(value);

    if (token) {
      stats.hardcodedValues++;
      issues.push({
        line,
        property: 'border-radius',
        value: `${value}px`,
        suggestion: `var(--radius-${token})`,
        message: `Use design token: ${value}px → var(--radius-${token})`,
      });
    }
  }

  return { issues, stats };
}

function findNearestGridValue(value) {
  let nearest = validSpacing[0];
  let minDiff = Math.abs(value - nearest);

  for (const gridValue of validSpacing) {
    const diff = Math.abs(value - gridValue);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = gridValue;
    }
  }

  return {
    value: nearest,
    token: getSpacingToken(nearest),
  };
}

function getSpacingToken(value) {
  const tokens = {
    0: '0',
    4: '1',
    8: '2',
    12: '3',
    16: '4',
    20: '5',
    24: '6',
    28: '7',
    32: '8',
    40: '10',
    48: '12',
    64: '16',
    80: '20',
    96: '24',
  };
  return tokens[value] || null;
}

function getFontSizeToken(value) {
  const tokens = {
    11: 'xs',
    13: 'sm',
    14: 'base',
    16: 'md',
    18: 'lg',
    20: 'xl',
    24: '2xl',
    30: '3xl',
    36: '4xl',
    48: '5xl',
  };
  return tokens[value] || null;
}

function getRadiusToken(value) {
  const tokens = {
    4: 'sm',
    6: 'base',
    8: 'md',
    12: 'lg',
    16: 'xl',
    20: '2xl',
    24: '3xl',
  };
  return tokens[value] || null;
}

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        scanDirectory(filePath, results);
      }
    } else if (file.endsWith('.css')) {
      const result = scanFile(filePath);
      if (result.issues.length > 0 || result.stats.hardcodedValues > 0) {
        results.push({
          file: filePath,
          ...result,
        });
      }
    }
  }

  return results;
}

function generateReport(results) {
  console.log('\n📊 Design Token Analysis Report\n');
  console.log('='.repeat(80));

  let totalIssues = 0;
  let totalHardcoded = 0;
  let totalTokens = 0;
  let totalNonGrid = 0;

  results.forEach(result => {
    totalIssues += result.issues.length;
    totalHardcoded += result.stats.hardcodedValues;
    totalTokens += result.stats.tokenUsage;
    totalNonGrid += result.stats.nonGridValues;
  });

  console.log(`\n📁 Files scanned: ${results.length}`);
  console.log(`✅ Design tokens used: ${totalTokens}`);
  console.log(`⚠️  Hardcoded values found: ${totalHardcoded}`);
  console.log(`❌ Non-grid values: ${totalNonGrid}`);
  console.log(`\n${'='.repeat(80)}\n`);

  if (totalIssues === 0) {
    console.log('✨ Great! All files are using design tokens correctly.\n');
    return;
  }

  results.forEach(result => {
    if (result.issues.length > 0) {
      console.log(`\n📄 ${result.file}`);
      console.log(`   Lines: ${result.stats.totalLines} | Tokens: ${result.stats.tokenUsage} | Issues: ${result.issues.length}`);
      console.log('   ' + '-'.repeat(76));

      result.issues.slice(0, 10).forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.property}: ${issue.value}`);
        console.log(`   → ${issue.suggestion}`);
      });

      if (result.issues.length > 10) {
        console.log(`   ... and ${result.issues.length - 10} more issues`);
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Tips:');
  console.log('   1. Replace hardcoded values with design tokens');
  console.log('   2. Round non-grid values to nearest 8px multiple');
  console.log('   3. See DESIGN_TOKENS_MIGRATION.md for guidance');
  console.log('   4. Visit /design-system for visual reference\n');
}

// Main execution
const stylesDir = path.join(__dirname, '..', 'src', 'styles');
const results = scanDirectory(stylesDir);
generateReport(results);

// Exit with error code if issues found
if (results.some(r => r.stats.nonGridValues > 0)) {
  process.exit(1);
}
