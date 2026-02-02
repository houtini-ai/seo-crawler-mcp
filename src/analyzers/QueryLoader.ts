import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QueryMetadata {
  name: string;
  category: 'critical' | 'content' | 'technical' | 'security' | 'opportunities';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  impact: string;
  fix: string;
  sql: string;
}

function findQueriesPath(): string {
  // Try multiple possible locations
  const candidates = [
    // When running from compiled build/analyzers/QueryLoader.js
    path.join(__dirname, 'queries'),
    // When running from src/analyzers/QueryLoader.ts
    path.join(__dirname, '..', '..', 'src', 'analyzers', 'queries'),
    // When running from project root
    path.join(process.cwd(), 'src', 'analyzers', 'queries'),
    // When running tests from project root
    path.join(process.cwd(), 'build', 'analyzers', 'queries'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find queries directory. Tried: ${candidates.join(', ')}`);
}

export class QueryLoader {
  private queriesPath: string;
  private queries: Map<string, QueryMetadata>;

  constructor() {
    this.queriesPath = findQueriesPath();
    this.queries = new Map();
    this.loadAllQueries();
  }

  private loadAllQueries(): void {
    const categories = ['critical', 'content', 'technical', 'security', 'opportunities'];

    for (const category of categories) {
      const categoryPath = path.join(this.queriesPath, category);
      
      if (!fs.existsSync(categoryPath)) {
        continue;
      }

      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.sql'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const queryName = file.replace('.sql', '');
        const metadata = this.parseQueryFile(filePath, queryName, category as any);
        
        this.queries.set(queryName, metadata);
      }
    }
  }

  private parseQueryFile(
    filePath: string, 
    name: string, 
    category: QueryMetadata['category']
  ): QueryMetadata {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let description = '';
    let priority: QueryMetadata['priority'] = 'MEDIUM';
    let impact = '';
    let fix = '';
    const sqlLines: string[] = [];
    let inSQL = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('--')) {
        const comment = trimmed.substring(2).trim();
        
        if (comment.startsWith('Priority:')) {
          priority = comment.replace('Priority:', '').trim() as QueryMetadata['priority'];
        } else if (comment.startsWith('Impact:')) {
          impact = comment.replace('Impact:', '').trim();
        } else if (comment.startsWith('Fix:')) {
          fix = comment.replace('Fix:', '').trim();
        } else if (comment && !comment.startsWith('Category:')) {
          if (!description) {
            description = comment;
          }
        }
      } else if (trimmed.startsWith('SELECT')) {
        inSQL = true;
      }

      if (inSQL) {
        sqlLines.push(line);
      }
    }

    return {
      name,
      category,
      priority,
      description,
      impact,
      fix,
      sql: sqlLines.join('\n').trim()
    };
  }

  getQuery(name: string): QueryMetadata | undefined {
    return this.queries.get(name);
  }

  getAllQueries(): QueryMetadata[] {
    return Array.from(this.queries.values());
  }

  getQueriesByCategory(category: QueryMetadata['category']): QueryMetadata[] {
    return this.getAllQueries().filter(q => q.category === category);
  }

  getQueriesByPriority(priority: QueryMetadata['priority']): QueryMetadata[] {
    return this.getAllQueries().filter(q => q.priority === priority);
  }

  getCriticalQueries(): QueryMetadata[] {
    return this.getQueriesByPriority('CRITICAL');
  }

  getHighPriorityQueries(): QueryMetadata[] {
    return this.getQueriesByPriority('HIGH');
  }

  listQueryNames(): string[] {
    return Array.from(this.queries.keys()).sort();
  }

  getQueryStats(): {
    total: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const queries = this.getAllQueries();
    
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const query of queries) {
      byCategory[query.category] = (byCategory[query.category] || 0) + 1;
      byPriority[query.priority] = (byPriority[query.priority] || 0) + 1;
    }

    return {
      total: queries.length,
      byCategory,
      byPriority
    };
  }
}

export const queryLoader = new QueryLoader();
