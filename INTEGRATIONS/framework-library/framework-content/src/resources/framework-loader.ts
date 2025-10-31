/**
 * Framework Loader
 *
 * Loads framework markdown files from the filesystem
 */

import * as fs from "fs/promises";
import * as path from "path";

export class FrameworkLoader {
  private frameworkRoot: string;
  private cache: Map<string, string> = new Map();

  constructor(frameworkRoot: string) {
    this.frameworkRoot = path.resolve(frameworkRoot);
  }

  /**
   * Load a framework file by category and ID
   */
  async loadFramework(category: string, id: string): Promise<string> {
    const cacheKey = `${category}/${id}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Determine directory path
    const categoryPath = this.getCategoryPath(category);
    const frameworkPath = await this.findFrameworkFile(categoryPath, id);

    if (!frameworkPath) {
      throw new Error(`Framework not found: ${category}/${id}`);
    }

    // Read file
    const content = await fs.readFile(frameworkPath, "utf-8");

    // Cache it
    this.cache.set(cacheKey, content);

    return content;
  }

  /**
   * Get the directory path for a framework category
   */
  private getCategoryPath(category: string): string {
    switch (category) {
      case "security":
        return path.join(this.frameworkRoot, "00 - AI Operational Security Frameworks");
      case "build":
        return path.join(this.frameworkRoot, "01 - AI Agent, APP & Workflow Frameworks");
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }

  /**
   * Find the framework file matching the ID
   */
  private async findFrameworkFile(
    directory: string,
    id: string
  ): Promise<string | null> {
    try {
      const files = await fs.readdir(directory);

      // Try exact match first
      const exactMatch = files.find(
        (f) => f === `${id}.md` || f === id
      );
      if (exactMatch) {
        return path.join(directory, exactMatch);
      }

      // Try partial match (case-insensitive)
      const partialMatch = files.find((f) =>
        f.toLowerCase().includes(id.toLowerCase()) && f.endsWith(".md")
      );
      if (partialMatch) {
        return path.join(directory, partialMatch);
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to search directory ${directory}: ${error}`);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
