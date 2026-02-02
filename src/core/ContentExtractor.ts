/**
 * ContentExtractor - Extract all SEO data from HTML
 * 
 * Responsibilities:
 * - Extract basic SEO (title, headings, meta description)
 * - Extract meta tags and social tags (OG, Twitter)
 * - Extract structured data (JSON-LD, Schema.org microdata)
 * - Detect analytics tracking (GA4, GTM, Facebook Pixel, etc.)
 * - Extract images with metadata
 * - Count internal/external links
 * - Extract hreflang links
 */

import type { CheerioAPI } from 'cheerio';
import type { PageData, SchemaItem, ImageData, HreflangLink } from '../types/index.js';
import { PageDataSchema } from '../schema/index.js';

export class ContentExtractor {
  extract(
    url: string,
    html: string,
    $: CheerioAPI,
    context: {
      crawlId: string;
      depth: number;
      statusCode: number;
      contentType: string;
      responseTime: number;
      size: number;
      isInternal: boolean;
      linkedFrom: string[];
      redirects: any[];
    },
    response?: any
  ): PageData {
    const basicSeo = this.extractBasicSeo($);
    const metaTags = this.extractMetaTags($);
    const structuredData = this.extractStructuredData($);
    const socialTags = this.extractSocialTags($);
    const linkCounts = this.countLinks($, url);
    const headingStructure = this.extractHeadingStructure($);
    const linkMetrics = this.extractLinkSecurityMetrics($, url);
    const securityHeaders = response ? this.extractSecurityHeaders(response) : {
      contentSecurityPolicy: null,
      strictTransportSecurity: null,
      xFrameOptions: null,
      referrerPolicy: null,
    };
    
    let actualResponseTime = context.responseTime;
    if (response?.timings?.phases?.total) {
      actualResponseTime = Math.round(response.timings.phases.total);
    }
    
    const data: PageData = {
      url,
      crawlId: context.crawlId,
      statusCode: context.statusCode,
      contentType: context.contentType,
      responseTime: actualResponseTime,
      size: context.size,
      redirects: context.redirects,
      depth: context.depth,
      isInternal: context.isInternal,
      linkedFrom: context.linkedFrom,
      
      title: basicSeo.title,
      metaDescription: basicSeo.metaDescription,
      h1: basicSeo.h1,
      h2: basicSeo.h2,
      h3: basicSeo.h3,
      wordCount: basicSeo.wordCount,
      lang: basicSeo.lang,
      charset: basicSeo.charset,
      
      metaTags: metaTags.metaTags,
      viewport: metaTags.viewport,
      robots: metaTags.robots,
      author: metaTags.author,
      keywords: metaTags.keywords,
      generator: metaTags.generator,
      themeColor: metaTags.themeColor,
      canonicalUrl: metaTags.canonicalUrl,
      
      jsonLd: structuredData.jsonLd,
      schemaOrg: structuredData.schemaOrg,
      
      ogTags: socialTags.ogTags,
      twitterTags: socialTags.twitterTags,
      
      securityHeaders: securityHeaders,
      
      headingCounts: headingStructure.counts,
      headingHierarchy: headingStructure.hierarchy,
      headingSequentialErrors: headingStructure.errors,
      
      linkMetrics: linkMetrics,
      
      analytics: this.extractAnalytics(html),
      images: this.extractImages($, url),
      
      internalLinks: linkCounts.internalLinks,
      externalLinks: linkCounts.externalLinks,
      
      hreflang: this.extractHreflang($),
      
      crawledAt: new Date().toISOString(),
      error: null
    };
    
    return PageDataSchema.parse(data);
  }

  private extractBasicSeo($: CheerioAPI): {
    title: string;
    metaDescription: string;
    h1: string;
    h2: string[];
    h3: string[];
    wordCount: number;
    lang: string;
    charset: string;
  } {
    return {
      title: $('title').text().trim(),
      metaDescription: $('meta[name="description"]').attr('content')?.trim() ?? '',
      h1: $('h1').first().text().trim(),
      h2: $('h2').slice(0, 10).map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').slice(0, 10).map((_, el) => $(el).text().trim()).get(),
      wordCount: this.countWords($('body').text()),
      lang: $('html').attr('lang') ?? '',
      charset: this.extractCharset($)
    };
  }

  private extractCharset($: CheerioAPI): string {
    const charsetMeta = $('meta[charset]').attr('charset');
    if (charsetMeta) return charsetMeta;
    
    const contentType = $('meta[http-equiv="Content-Type"]').attr('content');
    if (contentType) {
      const match = contentType.match(/charset=([^;]+)/i);
      if (match) return match[1];
    }
    
    return '';
  }

  private countWords(text: string): number {
    const words = text.match(/\b\w+\b/g);
    return words ? words.length : 0;
  }

  private extractMetaTags($: CheerioAPI): {
    metaTags: Record<string, string>;
    viewport: string;
    robots: string;
    author: string;
    keywords: string;
    generator: string;
    themeColor: string;
    canonicalUrl: string;
  } {
    const metaTags: Record<string, string> = {};
    let viewport = '';
    let robots = '';
    let author = '';
    let keywords = '';
    let generator = '';
    let themeColor = '';
    
    $('meta[name]').each((_, el) => {
      const name = $(el).attr('name')?.toLowerCase();
      const content = $(el).attr('content');
      
      if (name && content) {
        metaTags[name] = content;
        
        if (name === 'viewport') viewport = content;
        else if (name === 'robots') robots = content;
        else if (name === 'author') author = content;
        else if (name === 'keywords') keywords = content;
        else if (name === 'generator') generator = content;
        else if (name === 'theme-color') themeColor = content;
      }
    });
    
    const canonical = $('link[rel="canonical"]').attr('href') ?? '';
    
    return {
      metaTags,
      viewport,
      robots,
      author,
      keywords,
      generator,
      themeColor,
      canonicalUrl: canonical
    };
  }

  private extractStructuredData($: CheerioAPI): {
    jsonLd: any[];
    schemaOrg: SchemaItem[];
  } {
    const jsonLd: any[] = [];
    const schemaOrg: SchemaItem[] = [];
    
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() ?? '');
        jsonLd.push(data);
      } catch {}
    });
    
    $('[itemtype]').each((_, el) => {
      const type = $(el).attr('itemtype') ?? '';
      if (type) {
        const properties = this.extractMicrodataProperties($, $(el));
        if (Object.keys(properties).length > 0) {
          schemaOrg.push({ type, properties });
        }
      }
    });
    
    return { jsonLd, schemaOrg };
  }

  private extractMicrodataProperties($: CheerioAPI, $el: any): Record<string, string> {
    const properties: Record<string, string> = {};
    
    $el.find('[itemprop]').each((_: any, prop: any) => {
      const $prop = $(prop);
      const propName = $prop.attr('itemprop');
      if (!propName) return;
      
      let content = '';
      const tagName = $prop.prop('tagName')?.toLowerCase();
      
      if (tagName === 'meta') {
        content = $prop.attr('content') ?? '';
      } else if (tagName === 'img') {
        content = $prop.attr('src') ?? '';
      } else if (tagName === 'a') {
        content = $prop.attr('href') ?? '';
      } else {
        content = $prop.text().trim();
      }
      
      if (content) {
        properties[propName] = content;
      }
    });
    
    return properties;
  }

  private extractSocialTags($: CheerioAPI): {
    ogTags: Record<string, string>;
    twitterTags: Record<string, string>;
  } {
    const ogTags: Record<string, string> = {};
    const twitterTags: Record<string, string> = {};
    
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property') ?? '';
      const content = $(el).attr('content') ?? '';
      if (property && content) {
        const key = property.replace('og:', '');
        ogTags[key] = content;
      }
    });
    
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name') ?? '';
      const content = $(el).attr('content') ?? '';
      if (name && content) {
        const key = name.replace('twitter:', '');
        twitterTags[key] = content;
      }
    });
    
    return { ogTags, twitterTags };
  }

  private extractAnalytics(html: string): PageData['analytics'] {
    const ga4Match = html.match(/G-[A-Z0-9]{10}/);
    const gtmMatch = html.match(/GTM-[A-Z0-9]+/);
    
    const gaPatterns = [
      /gtag\(/i,
      /ga\(/i,
      /GoogleAnalyticsObject/i,
      /google-analytics\.com/i,
      /googletagmanager\.com/i
    ];
    
    const hasGoogleAnalytics = gaPatterns.some(pattern => pattern.test(html));
    
    return {
      googleAnalytics: hasGoogleAnalytics,
      gtag: /gtag\(/i.test(html),
      ga4Id: ga4Match?.[0] ?? '',
      gtmId: gtmMatch?.[0] ?? '',
      facebookPixel: /fbq\(|facebook\.com\/tr/i.test(html),
      hotjar: /hotjar\.com|hj\(/i.test(html),
      mixpanel: /mixpanel\.com|mixpanel\.track/i.test(html)
    };
  }

  private extractImages($: CheerioAPI, baseUrl: string): ImageData[] {
    const images: ImageData[] = [];
    
    $('img').slice(0, 20).each((_, el) => {
      let src = $(el).attr('src') ?? '';
      if (!src) return;
      
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        const base = new URL(baseUrl);
        src = `${base.protocol}//${base.hostname}${src}`;
      } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
        try {
          src = new URL(src, baseUrl).toString();
        } catch {}
      }
      
      const widthAttr = $(el).attr('width');
      const heightAttr = $(el).attr('height');
      
      images.push({
        src,
        alt: $(el).attr('alt') ?? '',
        width: widthAttr ? parseInt(widthAttr, 10) : null,
        height: heightAttr ? parseInt(heightAttr, 10) : null
      });
    });
    
    return images;
  }

  private countLinks($: CheerioAPI, baseUrl: string): {
    internalLinks: number;
    externalLinks: number;
  } {
    const baseDomain = new URL(baseUrl).hostname.replace(/^www\./, '');
    let internalLinks = 0;
    let externalLinks = 0;
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }
      
      try {
        const absolute = new URL(href, baseUrl);
        const linkDomain = absolute.hostname.replace(/^www\./, '');
        
        if (linkDomain === baseDomain) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch {}
    });
    
    return { internalLinks, externalLinks };
  }

  private extractHreflang($: CheerioAPI): HreflangLink[] {
    const hreflang: HreflangLink[] = [];
    
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const lang = $(el).attr('hreflang');
      const url = $(el).attr('href');
      
      if (lang && url) {
        hreflang.push({ lang, url });
      }
    });
    
    return hreflang;
  }

  private extractSecurityHeaders(response: any): PageData['securityHeaders'] {
    const headers = response?.headers || {};
    
    return {
      contentSecurityPolicy: headers['content-security-policy'] || null,
      strictTransportSecurity: headers['strict-transport-security'] || null,
      xFrameOptions: headers['x-frame-options'] || null,
      referrerPolicy: headers['referrer-policy'] || null,
    };
  }

  private extractHeadingStructure($: CheerioAPI): {
    counts: PageData['headingCounts'];
    hierarchy: string[];
    errors: string[];
  } {
    const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    const hierarchy: string[] = [];
    const errors: string[] = [];
    
    let lastLevel = 0;
    
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const tagName = $(el).prop('tagName')?.toLowerCase() as keyof typeof counts;
      if (!tagName) return;
      
      const level = parseInt(tagName.substring(1), 10);
      
      hierarchy.push(tagName);
      counts[tagName]++;
      
      if (lastLevel > 0 && level > lastLevel + 1) {
        errors.push(`${tagName} after h${lastLevel} (skipped levels)`);
      }
      
      lastLevel = level;
    });
    
    return { counts, hierarchy, errors };
  }

  private extractLinkSecurityMetrics($: CheerioAPI, baseUrl: string): PageData['linkMetrics'] {
    const baseDomain = new URL(baseUrl).hostname.replace(/^www\./, '');
    let externalTargetBlankCount = 0;
    let externalTargetBlankNoRelCount = 0;
    let protocolRelativeCount = 0;

    $('a[href]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      let isInternal = false;
      try {
        const absolute = new URL(href, baseUrl);
        const linkDomain = absolute.hostname.replace(/^www\./, '');
        isInternal = linkDomain === baseDomain;
      } catch {}

      if (!isInternal && $a.attr('target') === '_blank') {
        externalTargetBlankCount++;
        
        const rel = $a.attr('rel');
        if (!rel || (!rel.includes('noopener') && !rel.includes('noreferrer'))) {
          externalTargetBlankNoRelCount++;
        }
      }

      if (href.startsWith('//')) {
        protocolRelativeCount++;
      }
    });

    $('link[href], script[src], img[src]').each((_, el) => {
      const $el = $(el);
      const attrName = $el.is('script') || $el.is('img') ? 'src' : 'href';
      const resourceUrl = $el.attr(attrName);
      
      if (resourceUrl && resourceUrl.startsWith('//')) {
        protocolRelativeCount++;
      }
    });

    return {
      externalTargetBlankCount,
      externalTargetBlankNoRelCount,
      protocolRelativeLinksCount: protocolRelativeCount,
    };
  }
}
