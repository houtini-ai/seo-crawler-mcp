/**
 * Structured SEO Report Formatter
 * 
 * Transforms raw SEO analysis data into structured, actionable reports
 * with clear issue categorization and remediation guidance.
 * 
 * Output Format:
 * - Issue Name | Issue Type | Priority | URLs | % of Total | Description | How To Fix
 */

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

interface StructuredIssue {
  issueName: string;
  issueType: 'Issue' | 'Warning' | 'Opportunity';
  issuePriority: 'Critical' | 'High' | 'Medium' | 'Low';
  urls: number;
  percentOfTotal: number;
  description: string;
  howToFix: string;
  examples: Array<{
    url: string;
    detail?: string;
  }>;
}

interface StructuredReport {
  overview: {
    totalPages: number;
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
  };
  issues: StructuredIssue[];
  executionTime: number;
}

export class StructuredReportFormatter {
  
  /**
   * Convert internal SEO issues to structured format
   */
  static formatReport(
    issues: SEOIssue[],
    totalPages: number,
    executionTime: number
  ): StructuredReport {
    
    const formattedIssues = issues.map(issue => 
      this.formatIssue(issue, totalPages)
    );
    
    // Sort by priority (Critical > High > Medium > Low)
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    formattedIssues.sort((a, b) => 
      priorityOrder[a.issuePriority] - priorityOrder[b.issuePriority]
    );
    
    const overview = {
      totalPages,
      totalIssues: formattedIssues.length,
      criticalIssues: formattedIssues.filter(i => i.issuePriority === 'Critical').length,
      highPriorityIssues: formattedIssues.filter(i => i.issuePriority === 'High').length,
      mediumPriorityIssues: formattedIssues.filter(i => i.issuePriority === 'Medium').length,
      lowPriorityIssues: formattedIssues.filter(i => i.issuePriority === 'Low').length
    };
    
    return {
      overview,
      issues: formattedIssues,
      executionTime
    };
  }
  
  /**
   * Format individual issue to structured style
   */
  private static formatIssue(
    issue: SEOIssue,
    totalPages: number
  ): StructuredIssue {
    
    return {
      issueName: this.formatIssueName(issue),
      issueType: this.getIssueType(issue.category, issue.priority),
      issuePriority: this.normalizePriority(issue.priority),
      urls: issue.affectedCount,
      percentOfTotal: parseFloat(((issue.affectedCount / totalPages) * 100).toFixed(2)),
      description: issue.description,
      howToFix: issue.fix,
      examples: issue.examples
    };
  }
  
  /**
   * Convert query name to user-friendly issue name
   */
  private static formatIssueName(issue: SEOIssue): string {
    const nameMap: Record<string, string> = {
      'missing-titles': 'Page Titles: Missing',
      'broken-internal-links': 'Links: Broken Internal Links',
      'server-errors': 'Response Codes: Internal Server Error (5xx)',
      '404-errors': 'Response Codes: Internal Client Error (4xx)',
      'duplicate-titles': 'Page Titles: Duplicate',
      'duplicate-meta-descriptions': 'Meta Description: Duplicate',
      'missing-meta-descriptions': 'Meta Description: Missing',
      'thin-content': 'Content: Low Content Pages',
      'missing-h1': 'H1: Missing',
      'multiple-h1': 'H1: Multiple',
      'duplicate-h1': 'H1: Duplicate',
      'redirects': 'Response Codes: Internal Redirection (3xx)',
      'orphan-pages': 'Links: Orphan Pages',
      'canonical-issues': 'Canonical: Issues',
      'non-https': 'Security: Non-HTTPS URLs',
      'heading-hierarchy-issues': 'Heading Hierarchy: Issues',
      'missing-hsts': 'Security: Missing HSTS Header',
      'missing-csp': 'Security: Missing Content-Security-Policy Header',
      'missing-x-frame-options': 'Security: Missing X-Frame-Options Header',
      'missing-referrer-policy': 'Security: Missing Secure Referrer-Policy Header',
      'unsafe-external-links': 'Security: Unsafe Cross-Origin Links',
      'protocol-relative-links': 'Security: Protocol-Relative Resource Links',
      'title-length': 'Page Titles: Length Issues',
      'meta-description-length': 'Meta Description: Length Issues',
      'title-equals-h1': 'Page Titles: Same as H1',
      'no-outbound-links': 'Links: Pages With No Outbound Links',
      'high-external-links': 'Links: Pages With High External Outlinks',
      'missing-images': 'Images: Missing On Content Pages'
    };
    
    return nameMap[issue.query] || issue.query;
  }
  
  /**
   * Determine issue type based on category and priority
   */
  private static getIssueType(
    category: string,
    priority: string
  ): 'Issue' | 'Warning' | 'Opportunity' {
    
    // Critical/High priority = Issue
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      return 'Issue';
    }
    
    // Opportunities category = Opportunity
    if (category === 'opportunities') {
      return 'Opportunity';
    }
    
    // Everything else = Warning
    return 'Warning';
  }
  
  /**
   * Normalize priority to title case
   */
  private static normalizePriority(priority: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const normalized = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    return normalized as 'Critical' | 'High' | 'Medium' | 'Low';
  }
  
  /**
   * Generate plain text summary for terminal output
   */
  static generateTextSummary(report: StructuredReport): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('              SEO AUDIT SUMMARY');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Total Pages Crawled:     ${report.overview.totalPages.toLocaleString()}`);
    lines.push(`Total Issues Found:      ${report.overview.totalIssues}`);
    lines.push('');
    lines.push('Issues by Priority:');
    lines.push(`  Critical:              ${report.overview.criticalIssues}`);
    lines.push(`  High:                  ${report.overview.highPriorityIssues}`);
    lines.push(`  Medium:                ${report.overview.mediumPriorityIssues}`);
    lines.push(`  Low:                   ${report.overview.lowPriorityIssues}`);
    lines.push('');
    lines.push(`Analysis Time:           ${report.executionTime}ms`);
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');
    
    // Group by priority
    const critical = report.issues.filter(i => i.issuePriority === 'Critical');
    const high = report.issues.filter(i => i.issuePriority === 'High');
    const medium = report.issues.filter(i => i.issuePriority === 'Medium');
    const low = report.issues.filter(i => i.issuePriority === 'Low');
    
    if (critical.length > 0) {
      lines.push('CRITICAL ISSUES (Fix Immediately)');
      lines.push('───────────────────────────────────────────────────────');
      critical.forEach(issue => {
        lines.push('');
        lines.push(`${issue.issueName}`);
        lines.push(`  URLs Affected:     ${issue.urls} (${issue.percentOfTotal}%)`);
        lines.push(`  Type:              ${issue.issueType}`);
        lines.push(`  Description:       ${issue.description}`);
        lines.push(`  How To Fix:        ${issue.howToFix}`);
      });
      lines.push('');
    }
    
    if (high.length > 0) {
      lines.push('HIGH PRIORITY ISSUES');
      lines.push('───────────────────────────────────────────────────────');
      high.forEach(issue => {
        lines.push('');
        lines.push(`${issue.issueName}`);
        lines.push(`  URLs Affected:     ${issue.urls} (${issue.percentOfTotal}%)`);
        lines.push(`  Type:              ${issue.issueType}`);
        lines.push(`  Description:       ${issue.description}`);
        lines.push(`  How To Fix:        ${issue.howToFix}`);
      });
      lines.push('');
    }
    
    if (medium.length > 0) {
      lines.push('MEDIUM PRIORITY ISSUES');
      lines.push('───────────────────────────────────────────────────────');
      medium.forEach(issue => {
        lines.push(`${issue.issueName} - ${issue.urls} URLs (${issue.percentOfTotal}%)`);
      });
      lines.push('');
    }
    
    if (low.length > 0) {
      lines.push('LOW PRIORITY / OPPORTUNITIES');
      lines.push('───────────────────────────────────────────────────────');
      low.forEach(issue => {
        lines.push(`${issue.issueName} - ${issue.urls} URLs (${issue.percentOfTotal}%)`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
}
