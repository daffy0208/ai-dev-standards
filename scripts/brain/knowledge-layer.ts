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

interface Tool {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: any;
}

interface Component {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: any;
}

interface Integration {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: any;
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

interface ToolRegistry {
  version: string;
  last_updated: string;
  description: string;
  tools: Tool[];
  total_tools?: number;
  total_scripts?: number;
}

interface ComponentRegistry {
  version: string;
  last_updated: string;
  description: string;
  components: Component[];
  total_components?: number;
}

interface IntegrationRegistry {
  version: string;
  last_updated: string;
  description: string;
  integrations: Integration[];
  total_integrations?: number;
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
  private toolRegistry: ToolRegistry | null = null;
  private componentRegistry: ComponentRegistry | null = null;
  private integrationRegistry: IntegrationRegistry | null = null;
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

    // Load tool registry
    const toolRegistryPath = path.join(metaPath, 'tool-registry.json');
    this.toolRegistry = JSON.parse(fs.readFileSync(toolRegistryPath, 'utf-8'));

    // Load component registry
    const componentRegistryPath = path.join(metaPath, 'component-registry.json');
    this.componentRegistry = JSON.parse(fs.readFileSync(componentRegistryPath, 'utf-8'));

    // Load integration registry
    const integrationRegistryPath = path.join(metaPath, 'integration-registry.json');
    this.integrationRegistry = JSON.parse(fs.readFileSync(integrationRegistryPath, 'utf-8'));

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
   * Get specific MCP by ID or friendly name
   * Supports both formats:
   * - ID: "3d-asset-manager-mcp"
   * - Friendly name: "3D Asset Manager MCP"
   */
  getMCP(idOrName: string): MCP | null {
    if (!this.mcpRegistry) throw new Error('Registries not loaded');

    // First try exact ID match
    let mcp = this.mcpRegistry.mcps.find(m => m.id === idOrName);

    // If not found, try friendly name match (case-insensitive)
    if (!mcp) {
      const lowerQuery = idOrName.toLowerCase();
      mcp = this.mcpRegistry.mcps.find(m => m.name.toLowerCase() === lowerQuery);
    }

    return mcp || null;
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
  // TOOL QUERIES
  // ============================================

  /**
   * Get total count of tools
   */
  getToolCount(): number {
    if (!this.toolRegistry) throw new Error('Registries not loaded');
    return this.toolRegistry.tools.length;
  }

  /**
   * Get specific tool by ID or name
   */
  getTool(idOrName: string): Tool | null {
    if (!this.toolRegistry) throw new Error('Registries not loaded');
    const lowerQuery = idOrName.toLowerCase();
    return this.toolRegistry.tools.find(tool =>
      tool.id === idOrName || tool.name?.toLowerCase() === lowerQuery
    ) || null;
  }

  // ============================================
  // COMPONENT QUERIES
  // ============================================

  /**
   * Get total count of components
   */
  getComponentCount(): number {
    if (!this.componentRegistry) throw new Error('Registries not loaded');
    return this.componentRegistry.components.length;
  }

  /**
   * Get specific component by ID or name
   */
  getComponent(idOrName: string): Component | null {
    if (!this.componentRegistry) throw new Error('Registries not loaded');
    const lowerQuery = idOrName.toLowerCase();
    return this.componentRegistry.components.find(component =>
      component.id === idOrName || component.name?.toLowerCase() === lowerQuery
    ) || null;
  }

  // ============================================
  // INTEGRATION QUERIES
  // ============================================

  /**
   * Get total count of integrations
   */
  getIntegrationCount(): number {
    if (!this.integrationRegistry) throw new Error('Registries not loaded');
    return this.integrationRegistry.integrations.length;
  }

  /**
   * Get specific integration by ID or name
   */
  getIntegration(idOrName: string): Integration | null {
    if (!this.integrationRegistry) throw new Error('Registries not loaded');
    const lowerQuery = idOrName.toLowerCase();
    return this.integrationRegistry.integrations.find(integration =>
      integration.id === idOrName || integration.name?.toLowerCase() === lowerQuery
    ) || null;
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
   * Supports both ID and friendly name formats
   */
  getSkillsUsingMCP(mcpIdOrName: string): string[] {
    if (!this.relationshipMapping) throw new Error('Registries not loaded');

    // First, resolve to MCP ID if friendly name was provided
    const mcp = this.getMCP(mcpIdOrName);
    if (!mcp) {
      return []; // MCP not found
    }

    const mcpId = mcp.id;
    const skills: string[] = [];

    for (const [skillName, deps] of Object.entries(this.relationshipMapping.skills)) {
      if (deps.required_mcps.includes(mcpId)) {
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
    if (
      !this.skillRegistry ||
      !this.mcpRegistry ||
      !this.toolRegistry ||
      !this.componentRegistry ||
      !this.integrationRegistry ||
      !this.relationshipMapping
    ) {
      throw new Error('Registries not loaded');
    }

    const skillCount = this.getSkillCount();
    const mcpCount = this.getMCPCount();
    const toolCount = this.getToolCount();
    const componentCount = this.getComponentCount();
    const integrationCount = this.getIntegrationCount();

    return {
      skills: skillCount,
      mcps: mcpCount,
      totalResources: skillCount + mcpCount + toolCount + componentCount + integrationCount,
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

    if (!this.skillRegistry) {
      errors.push('Skill registry not loaded');
    }
    if (!this.mcpRegistry) {
      errors.push('MCP registry not loaded');
    }
    if (!this.toolRegistry) {
      errors.push('Tool registry not loaded');
    }
    if (!this.componentRegistry) {
      errors.push('Component registry not loaded');
    }
    if (!this.integrationRegistry) {
      errors.push('Integration registry not loaded');
    }
    if (!this.relationshipMapping) {
      errors.push('Relationship mapping not loaded');
    }

    if (errors.length > 0) {
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
          errors.push(`Required MCP '${mcpName}' for skill '${skillName}' not found in MCP registry`);
        }
      }

      for (const toolName of deps.required_tools) {
        if (!this.getTool(toolName)) {
          errors.push(`Required tool '${toolName}' for skill '${skillName}' not found in tool registry`);
        }
      }

      for (const componentName of deps.required_components) {
        if (!this.getComponent(componentName)) {
          errors.push(`Required component '${componentName}' for skill '${skillName}' not found in component registry`);
        }
      }

      for (const integrationName of deps.required_integrations) {
        if (!this.getIntegration(integrationName)) {
          errors.push(`Required integration '${integrationName}' for skill '${skillName}' not found in integration registry`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
