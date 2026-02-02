/**
 * UrlManager - URL normalization, deduplication, and tracking
 * 
 * Responsibilities:
 * - Normalize URLs (www-agnostic, no fragments, no trailing slashes)
 * - Track discovered vs visited URLs
 * - Determine if URL is internal
 * - Track source pages ("linked from" feature)
 * - Track depth of each URL
 */

export class UrlManager {
  private baseDomain: string;
  private discovered: Map<string, number> = new Map();
  private visited: Set<string> = new Set();
  private sourcePagesMap: Map<string, Set<string>> = new Map();

  constructor(baseDomain: string) {
    this.baseDomain = this.normalizeDomain(baseDomain);
  }

  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      
      let clean = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
      
      if (parsed.search) {
        clean += parsed.search;
      }
      
      if (clean.endsWith('/') && clean.length > clean.indexOf('://') + 4) {
        clean = clean.slice(0, -1);
      }
      
      return clean;
    } catch {
      return url;
    }
  }

  private normalizeDomain(domain: string): string {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return domain.replace(/^www\./, '');
    }
  }

  isInternal(url: string): boolean {
    try {
      const urlDomain = new URL(url).hostname.replace(/^www\./, '');
      return urlDomain === this.baseDomain;
    } catch {
      return false;
    }
  }

  addDiscovered(url: string, depth: number, sourceUrl?: string): void {
    const normalized = this.normalizeUrl(url);
    
    if (!this.discovered.has(normalized)) {
      this.discovered.set(normalized, depth);
    }
    
    if (sourceUrl) {
      const normalizedSource = this.normalizeUrl(sourceUrl);
      if (!this.sourcePagesMap.has(normalized)) {
        this.sourcePagesMap.set(normalized, new Set());
      }
      this.sourcePagesMap.get(normalized)!.add(normalizedSource);
    }
  }

  markVisited(url: string): void {
    const normalized = this.normalizeUrl(url);
    this.visited.add(normalized);
  }

  isVisited(url: string): boolean {
    return this.visited.has(this.normalizeUrl(url));
  }

  isDiscovered(url: string): boolean {
    return this.discovered.has(this.normalizeUrl(url));
  }

  getSourcePages(url: string): string[] {
    const normalized = this.normalizeUrl(url);
    const sources = this.sourcePagesMap.get(normalized);
    return sources ? Array.from(sources) : [];
  }

  getDepth(url: string): number {
    return this.discovered.get(this.normalizeUrl(url)) ?? 0;
  }

  getTotalDiscovered(): number {
    return this.discovered.size;
  }

  getTotalVisited(): number {
    return this.visited.size;
  }

  getMaxDepth(): number {
    return Math.max(0, ...Array.from(this.discovered.values()));
  }

  getUnvisitedUrls(): string[] {
    return Array.from(this.discovered.keys()).filter(url => !this.visited.has(url));
  }
}
