/**
 * Web Scraper Tool
 *
 * AI tool for scraping web pages with Playwright.
 *
 * Features:
 * - Full page scraping (HTML, text, markdown)
 * - Element extraction (by selector)
 * - Screenshot capture
 * - PDF generation
 * - JavaScript execution
 * - Cookie and auth support
 * - Rate limiting
 * - Error handling
 *
 * Setup:
 * ```bash
 * npm install playwright
 * npx playwright install chromium
 * ```
 *
 * Usage:
 * ```typescript
 * import { WebScraperTool } from './web-scraper-tool'
 *
 * const scraper = new WebScraperTool()
 *
 * // Scrape page content
 * const result = await scraper.scrape({
 *   url: 'https://example.com',
 *   format: 'markdown'
 * })
 *
 * // Extract specific elements
 * const data = await scraper.extract({
 *   url: 'https://example.com/products',
 *   selectors: {
 *     title: 'h1',
 *     price: '.price',
 *     description: '.description'
 *   }
 * })
 * ```
 */

import { chromium, Browser, Page } from 'playwright'
import { marked } from 'marked'
import TurndownService from 'turndown'

export interface ScrapeOptions {
  url: string
  format?: 'html' | 'text' | 'markdown'
  waitForSelector?: string
  timeout?: number
  screenshot?: boolean
  pdf?: boolean
  cookies?: Array<{
    name: string
    value: string
    domain?: string
    path?: string
  }>
  headers?: Record<string, string>
  userAgent?: string
}

export interface ExtractOptions {
  url: string
  selectors: Record<string, string>
  multiple?: boolean
  waitForSelector?: string
  timeout?: number
}

export interface ScrapeResult {
  url: string
  content: string
  title?: string
  screenshot?: Buffer
  pdf?: Buffer
  timestamp: Date
}

export interface ExtractResult {
  url: string
  data: Record<string, string | string[]>
  timestamp: Date
}

export class WebScraperTool {
  private browser: Browser | null = null
  private turndownService: TurndownService

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    })
  }

  /**
   * Initialize browser
   */
  private async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true
      })
    }
    return this.browser
  }

  /**
   * Create new page with options
   */
  private async createPage(options: {
    cookies?: ScrapeOptions['cookies']
    headers?: Record<string, string>
    userAgent?: string
  }): Promise<Page> {
    const browser = await this.ensureBrowser()
    const context = await browser.newContext({
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      extraHTTPHeaders: options.headers || {}
    })

    if (options.cookies) {
      await context.addCookies(options.cookies)
    }

    return context.newPage()
  }

  /**
   * Scrape web page
   */
  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const page = await this.createPage({
      cookies: options.cookies,
      headers: options.headers,
      userAgent: options.userAgent
    })

    try {
      // Navigate to URL
      await page.goto(options.url, {
        timeout: options.timeout || 30000,
        waitUntil: 'networkidle'
      })

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000
        })
      }

      // Get title
      const title = await page.title()

      // Get content in requested format
      let content: string

      if (options.format === 'text') {
        content = await page.innerText('body')
      } else if (options.format === 'markdown') {
        const html = await page.content()
        content = this.turndownService.turndown(html)
      } else {
        content = await page.content()
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined
      if (options.screenshot) {
        screenshot = await page.screenshot({
          fullPage: true,
          type: 'png'
        })
      }

      // Generate PDF if requested
      let pdf: Buffer | undefined
      if (options.pdf) {
        pdf = await page.pdf({
          format: 'A4',
          printBackground: true
        })
      }

      return {
        url: options.url,
        content,
        title,
        screenshot,
        pdf,
        timestamp: new Date()
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Extract specific elements from page
   */
  async extract(options: ExtractOptions): Promise<ExtractResult> {
    const page = await this.createPage({})

    try {
      // Navigate to URL
      await page.goto(options.url, {
        timeout: options.timeout || 30000,
        waitUntil: 'networkidle'
      })

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000
        })
      }

      // Extract data using selectors
      const data: Record<string, string | string[]> = {}

      for (const [key, selector] of Object.entries(options.selectors)) {
        if (options.multiple) {
          // Extract multiple elements
          const elements = await page.$$(selector)
          const values = await Promise.all(
            elements.map(el => el.textContent())
          )
          data[key] = values.filter(Boolean) as string[]
        } else {
          // Extract single element
          const element = await page.$(selector)
          if (element) {
            const value = await element.textContent()
            if (value) {
              data[key] = value.trim()
            }
          }
        }
      }

      return {
        url: options.url,
        data,
        timestamp: new Date()
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Execute JavaScript on page and return result
   */
  async evaluate<T = any>(
    url: string,
    script: string | ((page: Page) => Promise<T>),
    options?: {
      waitForSelector?: string
      timeout?: number
    }
  ): Promise<T> {
    const page = await this.createPage({})

    try {
      await page.goto(url, {
        timeout: options?.timeout || 30000,
        waitUntil: 'networkidle'
      })

      if (options?.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000
        })
      }

      if (typeof script === 'string') {
        return await page.evaluate(script)
      } else {
        return await script(page)
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Scrape multiple pages (with rate limiting)
   */
  async scrapeMultiple(
    urls: string[],
    options: Omit<ScrapeOptions, 'url'> & {
      concurrency?: number
      delayMs?: number
    }
  ): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = []
    const concurrency = options.concurrency || 3
    const delayMs = options.delayMs || 1000

    // Process in batches
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency)

      const batchResults = await Promise.all(
        batch.map(url =>
          this.scrape({ ...options, url }).catch(err => {
            console.error(`Failed to scrape ${url}:`, err)
            return null
          })
        )
      )

      results.push(...batchResults.filter(Boolean) as ScrapeResult[])

      // Rate limiting delay
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    return results
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

/**
 * Tool definition for AI frameworks
 */
export const webScraperToolDefinition = {
  name: 'web_scraper',
  description: 'Scrape web pages and extract content. Can retrieve HTML, text, or markdown format. Can also take screenshots and extract specific elements.',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['scrape', 'extract', 'evaluate'],
        description: 'The action to perform'
      },
      url: {
        type: 'string',
        description: 'The URL to scrape'
      },
      format: {
        type: 'string',
        enum: ['html', 'text', 'markdown'],
        description: 'Content format for scrape action'
      },
      selectors: {
        type: 'object',
        description: 'CSS selectors to extract (for extract action)',
        additionalProperties: { type: 'string' }
      },
      script: {
        type: 'string',
        description: 'JavaScript to execute (for evaluate action)'
      },
      waitForSelector: {
        type: 'string',
        description: 'Wait for this CSS selector before scraping'
      },
      screenshot: {
        type: 'boolean',
        description: 'Take a screenshot'
      }
    },
    required: ['action', 'url']
  }
}

/**
 * Execute tool (for AI frameworks)
 */
export async function executeWebScraperTool(args: any): Promise<any> {
  const scraper = new WebScraperTool()

  try {
    switch (args.action) {
      case 'scrape':
        return await scraper.scrape({
          url: args.url,
          format: args.format || 'markdown',
          waitForSelector: args.waitForSelector,
          screenshot: args.screenshot
        })

      case 'extract':
        return await scraper.extract({
          url: args.url,
          selectors: args.selectors || {},
          waitForSelector: args.waitForSelector
        })

      case 'evaluate':
        return await scraper.evaluate(
          args.url,
          args.script,
          {
            waitForSelector: args.waitForSelector
          }
        )

      default:
        throw new Error(`Unknown action: ${args.action}`)
    }
  } finally {
    await scraper.close()
  }
}

/**
 * Example usage
 */
export async function examples() {
  const scraper = new WebScraperTool()

  try {
    // Example 1: Scrape page as markdown
    const page = await scraper.scrape({
      url: 'https://example.com',
      format: 'markdown'
    })
    console.log('Page content:', page.content)

    // Example 2: Extract specific elements
    const products = await scraper.extract({
      url: 'https://example.com/products',
      selectors: {
        title: 'h1.product-title',
        price: '.product-price',
        description: '.product-description'
      },
      multiple: true
    })
    console.log('Products:', products.data)

    // Example 3: Execute JavaScript
    const data = await scraper.evaluate(
      'https://example.com',
      () => {
        return {
          title: document.title,
          links: Array.from(document.querySelectorAll('a')).map(a => a.href)
        }
      }
    )
    console.log('Custom data:', data)

    // Example 4: Scrape multiple pages with rate limiting
    const results = await scraper.scrapeMultiple(
      [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3'
      ],
      {
        format: 'markdown',
        concurrency: 2,
        delayMs: 1000
      }
    )
    console.log(`Scraped ${results.length} pages`)
  } finally {
    await scraper.close()
  }
}
