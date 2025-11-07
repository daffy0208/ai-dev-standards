/**
 * Framework Index
 *
 * Maintains an index of all available frameworks for searching and metadata
 */

import * as fs from "fs/promises";
import * as path from "path";

export interface FrameworkMetadata {
  id: string;
  name: string;
  category: "security" | "build";
  description?: string;
  filePath: string;
  size: number;
  lastModified: Date;
  phases?: number;
  validationGates?: number;
}

export class FrameworkIndex {
  private frameworkRoot: string;
  private index: FrameworkMetadata[] | null = null;

  constructor(frameworkRoot: string) {
    this.frameworkRoot = path.resolve(frameworkRoot);
  }

  /**
   * Get all frameworks
   */
  async getAllFrameworks(): Promise<FrameworkMetadata[]> {
    if (this.index) {
      return this.index;
    }

    const frameworks: FrameworkMetadata[] = [];

    // Scan security frameworks
    const securityFrameworks = await this.scanDirectory(
      path.join(this.frameworkRoot, "00 - AI Operational Security Frameworks"),
      "security"
    );
    frameworks.push(...securityFrameworks);

    // Scan build frameworks
    const buildFrameworks = await this.scanDirectory(
      path.join(this.frameworkRoot, "01 - AI Agent, APP & Workflow Frameworks"),
      "build"
    );
    frameworks.push(...buildFrameworks);

    this.index = frameworks;
    return frameworks;
  }

  /**
   * Search frameworks
   */
  async search(
    query: string,
    category: string = "all",
    limit: number = 10
  ): Promise<FrameworkMetadata[]> {
    const frameworks = await this.getAllFrameworks();
    const lowerQuery = query.toLowerCase();

    const filtered = frameworks.filter((fw) => {
      // Category filter
      if (category !== "all" && fw.category !== category) {
        return false;
      }

      // Search in name, ID, and description
      return (
        fw.name.toLowerCase().includes(lowerQuery) ||
        fw.id.toLowerCase().includes(lowerQuery) ||
        fw.description?.toLowerCase().includes(lowerQuery)
      );
    });

    return filtered.slice(0, limit);
  }

  /**
   * Get metadata for a specific framework
   */
  async getMetadata(frameworkId: string): Promise<FrameworkMetadata | null> {
    const frameworks = await this.getAllFrameworks();
    return (
      frameworks.find(
        (fw) =>
          fw.id === frameworkId ||
          fw.id.toLowerCase() === frameworkId.toLowerCase()
      ) || null
    );
  }

  /**
   * Scan a directory for framework files
   */
  private async scanDirectory(
    directory: string,
    category: "security" | "build"
  ): Promise<FrameworkMetadata[]> {
    const frameworks: FrameworkMetadata[] = [];

    try {
      const files = await fs.readdir(directory);

      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        if (file === "README.md") continue;

        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (!stats.isFile()) continue;

        // Extract metadata
        const id = file.replace(/\.md$/, "");
        const name = this.formatName(id);

        // Try to extract description from file
        let description: string | undefined;
        let phases = 0;
        let validationGates = 0;

        try {
          const content = await fs.readFile(filePath, "utf-8");
          description = this.extractDescription(content);
          phases = this.countPhases(content);
          validationGates = this.countValidationGates(content);
        } catch {
          // Ignore read errors for metadata extraction
        }

        frameworks.push({
          id,
          name,
          category,
          description,
          filePath,
          size: stats.size,
          lastModified: stats.mtime,
          phases,
          validationGates,
        });
      }
    } catch (error) {
      console.error(`Error scanning directory ${directory}:`, error);
    }

    return frameworks;
  }

  /**
   * Format framework ID into display name
   */
  private formatName(id: string): string {
    return id
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/Framework$/, "Framework");
  }

  /**
   * Extract description from framework content
   */
  private extractDescription(content: string): string | undefined {
    // Look for first paragraph after first heading
    const match = content.match(/^#[^\n]+\n+([^\n]+)/m);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Count phases in framework
   */
  private countPhases(content: string): number {
    const phaseMatches = content.match(/###\s+Phase\s+\d+/gi);
    return phaseMatches ? phaseMatches.length : 0;
  }

  /**
   * Count validation gates
   */
  private countValidationGates(content: string): number {
    const gateMatches = content.match(/\[\s*\]\s+/g);
    return gateMatches ? gateMatches.length : 0;
  }

  /**
   * Refresh the index
   */
  async refresh(): Promise<void> {
    this.index = null;
    await this.getAllFrameworks();
  }
}
