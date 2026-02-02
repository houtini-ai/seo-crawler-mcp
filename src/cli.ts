#!/usr/bin/env node

/**
 * Crawlee MCP - CLI Mode
 * 
 * Run crawls directly from terminal, then analyze with Claude via MCP
 * 
 * Usage:
 *   npx @houtini/crawlee-mcp crawl https://example.com --max-pages=100 --depth=3
 *   
 * Then in Claude:
 *   "Analyze the crawl at C:/seo-audits/example.com_2026-02-02_abc123"
 */

import { runSeoAudit } from './tools/run-seo-audit.js';
import { analyzeSeo } from './tools/analyze-seo.js';
import { listQueries } from './tools/list-queries.js';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Crawlee MCP - CLI Mode

USAGE:
  crawlee-mcp crawl <url> [options]        Run a crawl
  crawlee-mcp analyze <path> [options]     Analyze a crawl
  crawlee-mcp queries [options]            List available queries

CRAWL OPTIONS:
  --max-pages=<number>      Maximum pages to crawl (default: 1000)
  --depth=<number>          Maximum crawl depth (default: 3)
  --user-agent=<chrome|googlebot>  User agent (default: chrome)

ANALYZE OPTIONS:
  --format=<structured|summary|detailed>  Output format (default: structured)
  --category=<category>     Filter by category (critical, content, technical, security, opportunities)
  --max-examples=<number>   Max example URLs per issue (default: 10)

EXAMPLES:
  # Run a crawl
  crawlee-mcp crawl https://example.com --max-pages=500 --depth=5
  
  # Analyze a crawl
  crawlee-mcp analyze C:/seo-audits/example.com_2026-02-01_abc123
  
  # List all queries
  crawlee-mcp queries
  
  # List security queries
  crawlee-mcp queries --category=security

WORKFLOW:
  1. Run crawl from terminal (for large sites or background processing)
  2. Get the output path from crawl results
  3. In Claude Desktop: "Analyze the crawl at <output-path>"
  4. Claude uses MCP tools to query the SQLite database
  `);
  process.exit(0);
}

const command = args[0];

function parseArgs(args: string[]): Record<string, any> {
  const parsed: Record<string, any> = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (value === undefined) {
        parsed[camelKey] = true;
      } else if (!isNaN(Number(value))) {
        parsed[camelKey] = Number(value);
      } else {
        parsed[camelKey] = value;
      }
    } else if (!parsed.url && !parsed.crawlPath) {
      if (command === 'crawl') {
        parsed.url = arg;
      } else if (command === 'analyze') {
        parsed.crawlPath = arg;
      }
    }
  }
  
  return parsed;
}

async function main() {
  try {
    switch (command) {
      case 'crawl': {
        const params = parseArgs(args.slice(1));
        
        if (!params.url) {
          console.error('Error: URL is required');
          console.error('Usage: crawlee-mcp crawl <url> [options]');
          process.exit(1);
        }
        
        console.log('Starting crawl...');
        console.log(`URL: ${params.url}`);
        console.log(`Max Pages: ${params.maxPages || 1000}`);
        console.log(`Depth: ${params.depth || 3}`);
        console.log(`User Agent: ${params.userAgent || 'chrome'}`);
        console.log('');
        
        const result = await runSeoAudit({
          url: params.url,
          maxPages: params.maxPages,
          depth: params.depth,
          userAgent: params.userAgent
        });
        
        console.log('✅ Crawl completed!');
        console.log('');
        console.log('RESULTS:');
        console.log(`  Crawl ID: ${result.crawlId}`);
        console.log(`  Output Path: ${result.outputPath}`);
        console.log(`  Status: ${result.status}`);
        console.log(`  Discovered: ${result.stats.discovered} URLs`);
        console.log(`  Crawled: ${result.stats.crawled} pages`);
        console.log(`  Failed: ${result.stats.failed} errors`);
        console.log(`  Skipped: ${result.stats.skipped} pages`);
        console.log(`  Max Depth: ${result.stats.depth}`);
        console.log(`  Speed: ${result.stats.speed.toFixed(2)} pages/sec`);
        console.log('');
        console.log('NEXT STEPS:');
        console.log('  In Claude Desktop, say:');
        console.log(`  "Analyze the crawl at ${result.outputPath}"`);
        console.log('');
        console.log('  Or use CLI:');
        console.log(`  crawlee-mcp analyze ${result.outputPath}`);
        
        break;
      }
      
      case 'analyze': {
        const params = parseArgs(args.slice(1));
        
        if (!params.crawlPath) {
          console.error('Error: Crawl path is required');
          console.error('Usage: crawlee-mcp analyze <path> [options]');
          process.exit(1);
        }
        
        console.log('Analyzing crawl...');
        console.log(`Path: ${params.crawlPath}`);
        console.log('');
        
        const result = await analyzeSeo({
          crawlPath: params.crawlPath,
          format: params.format,
          includeCategories: params.category ? [params.category] : undefined,
          maxExamplesPerIssue: params.maxExamples
        });
        
        console.log('✅ Analysis completed!');
        console.log('');
        console.log('SUMMARY:');
        console.log(`  Total Pages: ${result.summary.totalPages}`);
        console.log(`  Total Issues: ${result.summary.totalIssues}`);
        console.log(`  Critical: ${result.summary.criticalIssues}`);
        console.log(`  High: ${result.summary.highIssues}`);
        console.log(`  Medium: ${result.summary.mediumIssues}`);
        console.log(`  Low: ${result.summary.lowIssues}`);
        console.log('');
        
        if (params.format === 'summary' || params.format === 'detailed') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('For detailed analysis, use Claude Desktop:');
          console.log(`  "Show me the critical issues in ${params.crawlPath}"`);
        }
        
        break;
      }
      
      case 'queries': {
        const params = parseArgs(args.slice(1));
        const result = await listQueries({
          category: params.category,
          priority: params.priority
        });
        
        console.log('Available SEO Queries:');
        console.log('');
        
        for (const query of result.queries) {
          console.log(`  ${query.name}`);
          console.log(`    Category: ${query.category}`);
          console.log(`    Priority: ${query.priority}`);
          console.log(`    Description: ${query.description}`);
          console.log('');
        }
        
        console.log(`Total: ${result.statistics.total} queries`);
        console.log('');
        console.log('Run specific query in Claude:');
        console.log('  "Run the missing-titles query on <crawl-path>"');
        
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "crawlee-mcp --help" for usage');
        process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
