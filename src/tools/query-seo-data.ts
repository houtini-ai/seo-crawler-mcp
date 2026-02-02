import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { QueryLoader } from '../analyzers/QueryLoader.js';

interface QuerySeoDataParams {
  crawlPath: string;
  query: string;
  limit?: number;
}

interface QueryResult {
  query: string;
  description: string;
  rowCount: number;
  results: any[];
  executionTime: number;
}

/**
 * Query SEO data using predefined queries by name
 * Example: "missing-titles", "duplicate-h1", "orphan-pages"
 */
export async function querySeoData(params: QuerySeoDataParams): Promise<QueryResult> {
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
    // Load query by name
    const queryLoader = new QueryLoader();
    const queryMetadata = queryLoader.getQuery(params.query);
    
    if (!queryMetadata) {
      // List available queries if not found
      const available = queryLoader.listQueryNames();
      throw new Error(
        `Query not found: "${params.query}". Available queries:\n${available.join(', ')}`
      );
    }
    
    // Execute query with optional LIMIT override
    let sql = queryMetadata.sql;
    if (params.limit) {
      // Replace existing LIMIT or add one
      sql = sql.replace(/LIMIT\s+\d+/i, `LIMIT ${params.limit}`);
      if (!sql.includes('LIMIT')) {
        sql += ` LIMIT ${params.limit}`;
      }
    }
    
    const results = db.prepare(sql).all();
    const executionTime = Date.now() - startTime;
    
    return {
      query: queryMetadata.name,
      description: queryMetadata.description,
      rowCount: results.length,
      results,
      executionTime
    };
    
  } finally {
    db.close();
  }
}