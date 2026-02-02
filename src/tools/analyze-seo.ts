import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { QueryLoader } from '../analyzers/QueryLoader.js';
import { StructuredReportFormatter } from '../formatters/structured-report-format.js';

interface AnalyzeSeoParams {
  crawlPath: string;
  includeCategories?: string[];
  maxExamplesPerIssue?: number;
  format?: 'detailed' | 'summary' | 'structured';
}

interface SEOIssue {
  query: string;
  category: string;
  priority: string;
  description: string;
  impact: string;
  fix: string;
  affectedCount: number;
  examples: Array<{
    url: string;
    detail?: string;
  }>;
}

interface SEOAnalysisReport {
  summary: {
    crawlId: string;
    crawlPath: string;
    totalPages: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  issuesByCategory: {
    critical: SEOIssue[];
    content: SEOIssue[];
    technical: SEOIssue[];
    security: SEOIssue[];
    opportunities: SEOIssue[];
  };
  executionTime: number;
  structuredFormat?: any;
  textSummary?: string;
}

export async function analyzeSeo(params: AnalyzeSeoParams): Promise<SEOAnalysisReport> {
  const startTime = Date.now();
  
  // Validate crawl path
  if (!fs.existsSync(params.crawlPath)) {
    throw new Error(`Crawl path does not exist: ${params.crawlPath}`);
  }
  
  const dbPath = path.join(params.crawlPath, 'crawl-data.db');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found at: ${dbPath}`);
  }
  
  // Open database
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // Get crawl metadata
    const metadata = db.prepare('SELECT crawl_id, urls_crawled FROM crawl_metadata LIMIT 1').get() as any;
    const totalPages = metadata?.urls_crawled || 0;
    const crawlId = metadata?.crawl_id || 'unknown';
    
    // Load all queries
    const queryLoader = new QueryLoader();
    let queries = queryLoader.getAllQueries();
    
    // Filter by categories if specified
    if (params.includeCategories && params.includeCategories.length > 0) {
      queries = queries.filter(q => params.includeCategories!.includes(q.category));
    }
    
    const maxExamples = params.maxExamplesPerIssue || 10;
    
    // Execute all queries and categorize results
    const issuesByCategory = {
      critical: [] as SEOIssue[],
      content: [] as SEOIssue[],
      technical: [] as SEOIssue[],
      security: [] as SEOIssue[],
      opportunities: [] as SEOIssue[]
    };
    
    for (const query of queries) {
      const results = db.prepare(query.sql).all();
      
      if (results.length > 0) {
        const issue: SEOIssue = {
          query: query.name,
          category: query.category,
          priority: query.priority,
          description: query.description,
          impact: query.impact,
          fix: query.fix,
          affectedCount: results.length,
          examples: results.slice(0, maxExamples).map((row: any) => {
            // Extract URL and any detail field
            const example: any = { url: row.url || row.source_url || row.target_url };
            
            // Add relevant detail based on available fields (prioritize most relevant)
            if (row.anchor_text) {
              example.detail = `Anchor: ${row.anchor_text}`;
            } else if (row.duplicate_urls) {
              example.detail = `Also on: ${row.duplicate_urls}`;
            } else if (row.word_count !== undefined) {
              example.detail = `Word count: ${row.word_count}`;
            } else if (row.title_length !== undefined) {
              example.detail = `Length: ${row.title_length}`;
            } else if (row.heading_count_h1 !== undefined) {
              example.detail = `H1 count: ${row.heading_count_h1}`;
            } else if (row.count !== undefined) {
              example.detail = `Count: ${row.count}`;
            } else if (row.h1) {
              example.detail = `H1: ${row.h1}`;
            }
            
            return example;
          })
        };
        
        issuesByCategory[query.category].push(issue);
      }
    }
    
    // Calculate summary statistics
    const allIssues = [
      ...issuesByCategory.critical,
      ...issuesByCategory.content,
      ...issuesByCategory.technical,
      ...issuesByCategory.security,
      ...issuesByCategory.opportunities
    ];
    
    const summary = {
      crawlId,
      crawlPath: params.crawlPath,
      totalPages,
      totalIssues: allIssues.length,
      criticalIssues: allIssues.filter(i => i.priority === 'CRITICAL').length,
      highIssues: allIssues.filter(i => i.priority === 'HIGH').length,
      mediumIssues: allIssues.filter(i => i.priority === 'MEDIUM').length,
      lowIssues: allIssues.filter(i => i.priority === 'LOW').length
    };
    
    const executionTime = Date.now() - startTime;
    
    const report: SEOAnalysisReport = {
      summary,
      issuesByCategory,
      executionTime
    };
    
    // Add structured format if requested or by default
    const format = params.format || 'structured';
    
    if (format === 'structured' || format === 'summary') {
      const structReport = StructuredReportFormatter.formatReport(
        allIssues,
        totalPages,
        executionTime
      );
      
      report.structuredFormat = structReport;
      
      if (format === 'summary') {
        report.textSummary = StructuredReportFormatter.generateTextSummary(structReport);
      }
    }
    
    return report;
    
  } finally {
    db.close();
  }
}
