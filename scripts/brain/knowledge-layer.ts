/**
 * LAYER 1: KNOWLEDGE LAYER
 *
 * Foundation layer that provides complete understanding of repository state.
 * Single source of truth for all resources (skills, MCPs, tools, components, integrations).
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  tags: string[];
  category: string;
  difficulty: string;
  estimated_time: string;
  path: string;
  status: string;
  prerequisites: string[];
  related_skills: string[];
  frameworks: string[];
  languages: string[];
}

export interface MCP {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  path: string;
  port?: number;
  tools?: string[];
  supports_skills?: string[];
}

interface SkillRegistry {
  version: string;
  last_updated: string;
  description: string;
  skills: Skill[];
  categories: any[];
  difficulty_levels: any[];
  usage_notes: any;
}

interface MCPRegistry {
  version: string;
  last_updated: string;
  description: string;
  mcps: MCP[];
  categories: any[];
}

interface RelationshipMapping {
  version: string;
  last_updated: string;
  description: string;
  skills: Record<string, {
    required_mcps: string[];
    required_tools: string[];
    required_components: string[];
    required_integrations: string[];
    supporting_scripts: string[];
  }>;
}

export class KnowledgeLayer {
  private rootPath: string;
  private skillRegistry: SkillRegistry | null = null;
  private mcpRegistry: MCPRegistry | null = null;
  private relationshipMapping: RelationshipMapping | null = null;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  /**
   * Load all registries into memory
   */
  async loadRegistries(): Promise<void> {
    const metaPath = path.join(this.rootPath, 'META');

    // Load skill registry
    const skillRegistryPath = path.join(metaPath, 'skill-registry.json');
    this.skillRegistry = JSON.parse(fs.readFileSync(skillRegistryPath, 'utf-8'));

    // Load MCP registry
    const mcpRegistryPath = path.join(metaPath, 'mcp-registry.json');
    this.mcpRegistry = JSON.parse(fs.readFileSync(mcpRegistryPath, 'utf-8'));

    // Load relationship mapping
    const relationshipPath = path.join(metaPath, 'relationship-mapping.json');
    this.relationshipMapping = JSON.parse(fs.readFileSync(relationshipPath, 'utf-8'));
  }

  // ============================================
  // SKILL QUERIES
  // ============================================

  /**
   * Get total count of skills
   */
  getSkillCount(): number {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.skills.length;
  }

  /**
   * Get specific skill by name
   */
  getSkill(name: string): Skill | null {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.skills.find(s => s.name === name) || null;
  }

  /**
   * Get all skills
   */
  getAllSkills(): Skill[] {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.skills;
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): Skill[] {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.skills.filter(s => s.category === category);
  }

  /**
   * Get skills by tag
   */
  getSkillsByTag(tag: string): Skill[] {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.skills.filter(s => s.tags.includes(tag));
  }

  /**
   * Search skills by keyword
   */
  searchSkills(query: string): Skill[] {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    const lowerQuery = query.toLowerCase();
    return this.skillRegistry.skills.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.triggers.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get related skills for a skill
   */
  getRelatedSkills(skillName: string): string[] {
    const skill = this.getSkill(skillName);
    return skill?.related_skills || [];
  }

  // ============================================
  // MCP QUERIES
  // ============================================

  /**
   * Get total count of MCPs
   */
  getMCPCount(): number {
    if (!this.mcpRegistry) throw new Error('Registries not loaded');
    return this.mcpRegistry.mcps.length;
  }

  /**
   * Get specific MCP by name
   */
  getMCP(id: string): MCP | null {
    if (!this.mcpRegistry) throw new Error('Registries not loaded');
    return this.mcpRegistry.mcps.find(m => m.id === id) || null;
  }

  /**
   * Get all MCPs
   */
  getAllMCPs(): MCP[] {
    if (!this.mcpRegistry) throw new Error('Registries not loaded');
    return this.mcpRegistry.mcps;
  }

  /**
   * Search MCPs by keyword
   */
  searchMCPs(query: string): MCP[] {
    if (!this.mcpRegistry) throw new Error('Registries not loaded');
    const lowerQuery = query.toLowerCase();
    return this.mcpRegistry.mcps.filter(m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery)
    );
  }

  // ============================================
  // RELATIONSHIP QUERIES
  // ============================================

  /**
   * Get MCPs required by a skill
   */
  getMCPsForSkill(skillName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    return this.relationshipMapping.skills[skillName]?.required_mcps || [];
  }

  /**
   * Get tools required by a skill
   */
  getToolsForSkill(skillName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    return this.relationshipMapping.skills[skillName]?.required_tools || [];
  }

  /**
   * Get components required by a skill
   */
  getComponentsForSkill(skillName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    return this.relationshipMapping.skills[skillName]?.required_components || [];
  }

  /**
   * Get integrations required by a skill
   */
  getIntegrationsForSkill(skillName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    return this.relationshipMapping.skills[skillName]?.required_integrations || [];
  }

  /**
   * Get all dependencies for a skill
   */
  getSkillDependencies(skillName: string): {
    mcps: string[];
    tools: string[];
    components: string[];
    integrations: string[];
    scripts: string[];
  } {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    const deps = this.relationshipMapping.skills[skillName];
    if (!deps) {
      return { mcps: [], tools: [], components: [], integrations: [], scripts: [] };
    }
    return {
      mcps: deps.required_mcps || [],
      tools: deps.required_tools || [],
      components: deps.required_components || [],
      integrations: deps.required_integrations || [],
      scripts: deps.supporting_scripts || []
    };
  }

  /**
   * Get skills that use a specific MCP (reverse lookup)
   */
  getSkillsUsingMCP(mcpName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');
    const skills: string[] = [];
    for (const [skillName, deps] of Object.entries(this.relationshipMapping.skills)) {
      if (deps.required_mcps.includes(mcpName)) {
        skills.push(skillName);
      }
    }
    return skills;
  }

  // ============================================
  // METADATA QUERIES
  // ============================================

  /**
   * Get repository state summary
   */
  getRepositoryState(): {
    skills: number;
    mcps: number;
    totalResources: number;
    skillRegistryVersion: string;
    mcpRegistryVersion: string;
    relationshipVersion: string;
    lastUpdated: string;
  } {
    if (!this.skillRegistry || !this.mcpRegistry || !this.relationshipMapping) {
      throw new Error('Registries not loaded');
    }

    return {
      skills: this.getSkillCount(),
      mcps: this.getMCPCount(),
      totalResources: this.getSkillCount() + this.getMCPCount() + 13 + 9 + 6, // + components + tools + integrations
      skillRegistryVersion: this.skillRegistry.version,
      mcpRegistryVersion: this.mcpRegistry.version,
      relationshipVersion: this.relationshipMapping.version,
      lastUpdated: this.skillRegistry.last_updated
    };
  }

  /**
   * Get all categories
   */
  getCategories(): any[] {
    if (!this.skillRegistry) throw new Error('Registries not loaded');
    return this.skillRegistry.categories;
  }

  /**
   * Validate registries are consistent
   */
  validateRegistries(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.skillRegistry || !this.mcpRegistry || !this.relationshipMapping) {
      errors.push('Registries not loaded');
      return { valid: false, errors };
    }

    // Check that all skills in relationship mapping exist in skill registry
    for (const skillName of Object.keys(this.relationshipMapping.skills)) {
      if (!this.getSkill(skillName)) {
        errors.push(`Skill '${skillName}' in relationship mapping not found in skill registry`);
      }
    }

    // Check that all related_skills exist
    for (const skill of this.skillRegistry.skills) {
      for (const relatedSkill of skill.related_skills) {
        if (!this.getSkill(relatedSkill)) {
          errors.push(`Related skill '${relatedSkill}' for '${skill.name}' not found`);
        }
      }
    }

    // Check that all required MCPs exist
    for (const [skillName, deps] of Object.entries(this.relationshipMapping.skills)) {
      for (const mcpName of deps.required_mcps) {
        if (!this.getMCP(mcpName)) {
          errors.push(`Required MCP '${mcpName}' for skill '${skillName}' not found`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
