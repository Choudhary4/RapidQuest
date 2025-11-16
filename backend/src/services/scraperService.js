const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const config = require('../config');
const { retry, extractDomain } = require('../utils/helpers');

class ScraperService {
  constructor() {
    this.userAgent = config.userAgent;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Fetch HTML content from URL
   */
  async fetchContent(url) {
    try {
      const response = await retry(async () => {
        return await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: this.timeout,
          maxRedirects: 5
        });
      }, 3, 2000);

      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch ${url}: ${error.message}`);
      throw new Error(`Failed to fetch content from ${url}`);
    }
  }

  /**
   * Extract data from pricing page
   */
  async scrapePricing(url, selector = null) {
    try {
      const html = await this.fetchContent(url);
      const $ = cheerio.load(html);

      const pricingData = [];

      // If custom selector provided, use it
      if (selector) {
        $(selector).each((i, element) => {
          const $elem = $(element);
          pricingData.push({
            title: $elem.find('h1, h2, h3, .title, .name').first().text().trim(),
            price: $elem.find('.price, [class*="price"]').first().text().trim(),
            description: $elem.find('p, .description').first().text().trim(),
            features: $elem.find('li, .feature').map((i, el) => $(el).text().trim()).get()
          });
        });
      } else {
        // Generic pricing extraction
        const priceElements = $('.price, [class*="price"], [class*="pricing"]').slice(0, 10);

        priceElements.each((i, element) => {
          const $elem = $(element);
          const $parent = $elem.closest('div, section, article');

          pricingData.push({
            title: $parent.find('h1, h2, h3, h4').first().text().trim(),
            price: $elem.text().trim(),
            description: $parent.find('p').first().text().trim(),
            url: url
          });
        });
      }

      return pricingData.filter(item => item.title || item.price);
    } catch (error) {
      logger.error(`Pricing scrape failed for ${url}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract articles/news from page
   */
  async scrapeNews(url, selector = null) {
    try {
      const html = await this.fetchContent(url);
      const $ = cheerio.load(html);

      const articles = [];

      if (selector) {
        $(selector).each((i, element) => {
          const $elem = $(element);
          articles.push(this.extractArticle($, $elem, url));
        });
      } else {
        // Try common article selectors
        const selectors = [
          'article',
          '.post',
          '.article',
          '[class*="article"]',
          '.news-item',
          '.blog-post'
        ];

        for (const sel of selectors) {
          const elements = $(sel).slice(0, 20);
          if (elements.length > 0) {
            elements.each((i, element) => {
              articles.push(this.extractArticle($, $(element), url));
            });
            break;
          }
        }
      }

      return articles.filter(article => article.title && article.url);
    } catch (error) {
      logger.error(`News scrape failed for ${url}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract article data from element
   */
  extractArticle($, $elem, baseUrl) {
    try {
      const title = $elem.find('h1, h2, h3, h4, .title, [class*="title"]').first().text().trim();
      const summary = $elem.find('p, .excerpt, .summary, [class*="summary"]').first().text().trim();
      const linkElem = $elem.find('a').first();
      let articleUrl = linkElem.attr('href') || '';

      // Make URL absolute
      if (articleUrl && !articleUrl.startsWith('http')) {
        const base = new URL(baseUrl);
        articleUrl = new URL(articleUrl, base.origin).href;
      }

      // Extract date
      let date = null;
      const dateText = $elem.find('time, .date, [class*="date"]').first().text().trim();
      if (dateText) {
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate)) {
          date = parsedDate;
        }
      }

      // Extract image
      const image = $elem.find('img').first().attr('src') || null;

      return {
        title,
        summary: summary.substring(0, 500),
        url: articleUrl || baseUrl,
        date,
        imageUrl: image
      };
    } catch (error) {
      logger.error(`Error extracting article: ${error.message}`);
      return {};
    }
  }

  /**
   * Generic content extractor
   */
  async scrapeGeneric(url) {
    try {
      const html = await this.fetchContent(url);
      const $ = cheerio.load(html);

      // Remove scripts, styles, and navigation
      $('script, style, nav, header, footer').remove();

      const title = $('h1').first().text().trim() || $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';

      // Get main content
      const mainContent = $('main, article, .content, .main, [role="main"]').first();
      const content = mainContent.length > 0
        ? mainContent.text().trim()
        : $('body').text().trim();

      return {
        title,
        summary: metaDescription || content.substring(0, 500),
        content: content.substring(0, 5000),
        url
      };
    } catch (error) {
      logger.error(`Generic scrape failed for ${url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape based on target type
   */
  async scrapeTarget(target, baseUrl) {
    const url = target.url.startsWith('http') ? target.url : `${baseUrl}${target.url}`;

    logger.info(`Scraping ${target.type} from ${url}`);

    switch (target.type) {
      case 'pricing':
        return await this.scrapePricing(url, target.selector);

      case 'news':
      case 'press':
      case 'blog':
        return await this.scrapeNews(url, target.selector);

      default:
        return await this.scrapeGeneric(url);
    }
  }
}

module.exports = new ScraperService();
