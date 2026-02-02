/**
 * LinkExtractor - Extract links with placement detection
 * 
 * Responsibilities:
 * - Extract all links from HTML
 * - Detect placement (navigation, footer, body)
 * - Classify internal vs external
 * - Extract anchor text
 * - Resolve relative URLs to absolute
 */

import type { CheerioAPI } from 'cheerio';
import type { LinkData } from '../types/index.js';
import { LinkDataSchema } from '../schema/index.js';

export class LinkExtractor {
  private baseDomain: string;

  constructor(baseDomain: string) {
    this.baseDomain = this.normalizeDomain(baseDomain);
  }

  extract($: CheerioAPI, sourceUrl: string, crawlId: string): LinkData[] {
    const links: LinkData[] = [];
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      if (!href || this.shouldSkipLink(href)) {
        return;
      }
      
      try {
        const absolute = new URL(href, sourceUrl);
        const targetUrl = this.cleanUrl(absolute);
        
        const linkData: LinkData = {
          crawlId,
          sourceUrl,
          targetUrl,
          anchorText: this.extractAnchorText($(el)),
          isInternal: this.isInternal(targetUrl),
          targetDomain: absolute.hostname,
          targetStatus: null,
          placement: this.detectPlacement($(el)),
          discoveredAt: new Date().toISOString()
        };
        
        links.push(LinkDataSchema.parse(linkData));
      } catch {}
    });
    
    return links;
  }

  private shouldSkipLink(href: string): boolean {
    const skipPrefixes = ['#', 'mailto:', 'tel:', 'javascript:'];
    return skipPrefixes.some(prefix => href.startsWith(prefix));
  }

  private extractAnchorText($el: any): string {
    const text = $el.text().trim();
    return text.slice(0, 100) || '(no text)';
  }

  private cleanUrl(url: URL): string {
    let clean = `${url.protocol}//${url.hostname}${url.pathname}`;
    
    if (url.search) {
      clean += url.search;
    }
    
    return clean;
  }

  private normalizeDomain(domain: string): string {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return domain.replace(/^www\./, '');
    }
  }

  private isInternal(url: string): boolean {
    try {
      const urlDomain = new URL(url).hostname.replace(/^www\./, '');
      return urlDomain === this.baseDomain;
    } catch {
      return false;
    }
  }

  private detectPlacement($el: any): 'navigation' | 'footer' | 'body' {
    let current = $el.parent();
    
    while (current && current.length > 0) {
      const tagName = current.prop('tagName')?.toLowerCase();
      const classes = current.attr('class')?.toLowerCase() ?? '';
      const id = current.attr('id')?.toLowerCase() ?? '';
      
      if (tagName === 'footer' || classes.includes('footer') || id.includes('footer')) {
        return 'footer';
      }
      
      if (tagName === 'nav' || tagName === 'header') {
        return 'navigation';
      }
      
      const navKeywords = ['nav', 'menu', 'header'];
      if (navKeywords.some(keyword => classes.includes(keyword) || id.includes(keyword))) {
        return 'navigation';
      }
      
      current = current.parent();
    }
    
    return 'body';
  }
}
