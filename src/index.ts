#!/usr/bin/env node

// Copyright 2026 Richard Baxter
// Licensed under the Apache License, Version 2.0

// CRITICAL: Disable ALL Crawlee logging for MCP stdio compatibility
process.env.CRAWLEE_LOG_LEVEL = 'OFF';

/**
 * Crawlee MCP Server v2
 * 
 * Professional website crawler and SEO analyzer
 * Built with @modelcontextprotocol/sdk and Crawlee
 * 
 * Phase 1: MCP server skeleton with tool registration ✅
 * Phase 2: Full crawling engine implementation ✅
 * Phase 3: SEO analysis layer ✅
 * Phase 4: Fixed RequestQueue persistence bug ✅
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

import { runSeoAudit } from './tools/run-seo-audit.js';
import { analyzeSeo } from './tools/analyze-seo.js';
import { querySeoData } from './tools/query-seo-data.js';
import { listQueries } from './tools/list-queries.js';

const SERVER_NAME = 'crawlee-mcp';
const SERVER_VERSION = '2.0.1'; // Version bump for bug fix

const tools: Tool[] = [
  {
    name: 'run_seo_audit',
    description: 'Crawl a website and extract comprehensive SEO data using Crawlee HttpCrawler. Returns crawl ID and output path.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Starting URL to crawl (must include http:// or https://)'
        },
        maxPages: {
          type: 'number',
          description: 'Maximum number of pages to crawl (1-10000). Default: 1000',
          minimum: 1,
          maximum: 10000
        },
        depth: {
          type: 'number',
          description: 'Maximum crawl depth (1-10). Default: 3',
          minimum: 1,
          maximum: 10
        },
        userAgent: {
          type: 'string',
          enum: ['chrome', 'googlebot'],
          description: 'User agent to identify as: "chrome" (default, Chrome browser) or "googlebot" (Googlebot crawler). Default: chrome'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'analyze_seo',
    description: 'Analyze SEO data from a completed crawl. Runs 25+ SQL queries to detect critical issues, content problems, technical SEO issues, security vulnerabilities, and optimization opportunities. Returns structured report with affected URLs and fix recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        crawlPath: {
          type: 'string',
          description: 'Path to crawl output directory (e.g., C:/seo-audits/example.com_2026-02-01_abc123)'
        },
        includeCategories: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['critical', 'content', 'technical', 'security', 'opportunities']
          },
          description: 'Optional: Filter analysis by categories. Default: all categories'
        },
        maxExamplesPerIssue: {
          type: 'number',
          description: 'Maximum example URLs to return per issue. Default: 10',
          minimum: 1,
          maximum: 100
        },
        format: {
          type: 'string',
          enum: ['detailed', 'summary', 'structured'],
          description: 'Output format: "structured" (organized format, default), "summary" (text overview), "detailed" (full JSON). Default: structured'
        }
      },
      required: ['crawlPath']
    }
  },
  {
    name: 'query_seo_data',
    description: 'Execute a specific SEO analysis query by name. Use list_seo_queries to see available queries. Returns detailed results with affected URLs and context.',
    inputSchema: {
      type: 'object',
      properties: {
        crawlPath: {
          type: 'string',
          description: 'Path to crawl output directory'
        },
        query: {
          type: 'string',
          description: 'Query name (e.g., "missing-titles", "duplicate-h1", "orphan-pages"). Use list_seo_queries to see all available queries.'
        },
        limit: {
          type: 'number',
          description: 'Optional: Maximum number of results to return. Default: 100',
          minimum: 1,
          maximum: 1000
        }
      },
      required: ['crawlPath', 'query']
    }
  },
  {
    name: 'list_seo_queries',
    description: 'List all available SEO analysis queries with descriptions, priorities, and fix recommendations. Optionally filter by category or priority level.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['critical', 'content', 'technical', 'security', 'opportunities'],
          description: 'Optional: Filter by category'
        },
        priority: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'Optional: Filter by priority level'
        }
      }
    }
  }
];

class CrawleeMcpServer {
  private server: Server;
  
  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    this.setupHandlers();
    this.setupErrorHandling();
  }
  
  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools
    }));
    
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        let result: any;
        
        switch (name) {
          case 'run_seo_audit':
            result = await runSeoAudit(args as any);
            break;
            
          case 'analyze_seo':
            result = await analyzeSeo(args as any);
            break;
            
          case 'query_seo_data':
            result = await querySeoData(args as any);
            break;
            
          case 'list_seo_queries':
            result = await listQueries(args as any);
            break;
            
          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`
                }
              ],
              isError: true
            };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: errorMessage,
                tool: name
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }
  
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };
    
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
  
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
    console.error('✅ Phase 1: MCP server active');
    console.error('✅ Phase 2: Crawling engine ready');
    console.error('✅ Phase 3: SEO analysis layer active');
    console.error('✅ Phase 4: RequestQueue bug fixed');
  }
}

const server = new CrawleeMcpServer();
server.run().catch(console.error);