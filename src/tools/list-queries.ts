import { QueryLoader } from '../analyzers/QueryLoader.js';

interface ListQueriesParams {
  category?: 'critical' | 'content' | 'technical' | 'security' | 'opportunities';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface QueryInfo {
  name: string;
  category: string;
  priority: string;
  description: string;
  impact: string;
  fix: string;
}

interface ListQueriesResult {
  totalQueries: number;
  filters: {
    category?: string;
    priority?: string;
  };
  queries: QueryInfo[];
  statistics: {
    total: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

/**
 * List all available SEO analysis queries
 * Optionally filter by category or priority
 */
export async function listQueries(params: ListQueriesParams = {}): Promise<ListQueriesResult> {
  const queryLoader = new QueryLoader();
  let queries = queryLoader.getAllQueries();
  
  // Apply filters
  if (params.category) {
    queries = queries.filter(q => q.category === params.category);
  }
  
  if (params.priority) {
    queries = queries.filter(q => q.priority === params.priority);
  }
  
  // Get statistics
  const stats = queryLoader.getQueryStats();
  
  // Format results
  const queryInfo: QueryInfo[] = queries.map(q => ({
    name: q.name,
    category: q.category,
    priority: q.priority,
    description: q.description,
    impact: q.impact,
    fix: q.fix
  }));
  
  return {
    totalQueries: queryInfo.length,
    filters: {
      category: params.category,
      priority: params.priority
    },
    queries: queryInfo,
    statistics: stats
  };
}