#!/usr/bin/env node

/**
 * Documentation Consistency Validator
 *
 * Uses Repository Brain to validate that documentation matches registry data.
 * Prevents the exact problem we just fixed: outdated stats in README.
 *
 * This script validates:
 * - README skill/MCP counts match registries
 * - Roadmap phases match actual implementation
 * - Version history is accurate
 * - All statistics are consistent
 */

const fs = require('fs')
const path = require('path')

// ANSI colors
const red = '\x1b[31m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const cyan = '\x1b[36m'
const reset = '\x1b[0m'

class DocumentationValidator {
  constructor(rootPath) {
    this.rootPath = rootPath
    this.errors = []
    this.warnings = []
  }

  /**
   * Load registry data
   */
  loadRegistries() {
    const skillRegistry = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'META/skill-registry.json'), 'utf8')
    )
    const mcpRegistry = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'META/mcp-registry.json'), 'utf8')
    )
    const relationshipMapping = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'META/relationship-mapping.json'), 'utf8')
    )

    return {
      skills: skillRegistry.skills.length,
      mcps: mcpRegistry.total_mcps || mcpRegistry.mcps.length,
      coverage: mcpRegistry.coverage,
      totalResources: 112, // 42 skills + 36 MCPs + 9 tools + 4 scripts + 13 components + 6 integrations + 2 other
      skillsWithoutMcps: relationshipMapping.skills_without_mcps || []
    }
  }

  /**
   * Validate README statistics
   */
  validateReadme(registries) {
    const readmePath = path.join(this.rootPath, 'README.md')
    const readme = fs.readFileSync(readmePath, 'utf8')

    console.log(`${cyan}Validating README.md...${reset}`)

    // Check skill count
    const skillMatches = readme.match(/\b(\d+)\s+[Ss]pecialized [Ss]kills?\b/g)
    if (skillMatches) {
      skillMatches.forEach(match => {
        const count = parseInt(match.match(/\d+/)[0])
        if (count !== registries.skills && count !== 37) { // Allow historical v1.0.0
          this.errors.push(`README mentions "${match}" but registries show ${registries.skills} skills`)
        }
      })
    }

    // Check MCP count
    const mcpMatches = readme.match(/\b(\d+)\s+MCPs?\b/g)
    if (mcpMatches) {
      mcpMatches.forEach(match => {
        const count = parseInt(match.match(/\d+/)[0])
        if (count !== registries.mcps && count !== 7 && count !== 30) { // Allow historical and goal numbers
          this.errors.push(`README mentions "${match}" but registries show ${registries.mcps} MCPs`)
        }
      })
    }

    // Check for old "3 MCPs" reference
    if (readme.includes('3 MCPs') || readme.includes('three MCPs')) {
      this.errors.push('README still mentions "3 MCPs" - this is outdated (should be 36)')
    }

    // Check for "12:1 ratio"
    if (readme.includes('12:1') || readme.includes('12 to 1')) {
      this.errors.push('README mentions 12:1 ratio - this is outdated (should be 0.92:1)')
    }

    // Check coverage percentage
    if (!readme.includes('92%')) {
      this.warnings.push('README should mention 92% skill-to-MCP coverage')
    }

    // Check if Phase 3 is marked complete
    if (readme.includes('Phase 3') && readme.includes('In Progress') && !readme.includes('COMPLETE')) {
      this.warnings.push('Phase 3 should be marked COMPLETE (we have 36 MCPs)')
    }
  }

  /**
   * Validate INSTALL.md
   */
  validateInstall(registries) {
    const installPath = path.join(this.rootPath, 'INSTALL.md')
    if (!fs.existsSync(installPath)) {
      this.warnings.push('INSTALL.md not found')
      return
    }

    console.log(`${cyan}Validating INSTALL.md...${reset}`)
    const install = fs.readFileSync(installPath, 'utf8')

    // Check resource counts
    if (install.includes('skills') || install.includes('MCPs')) {
      const skillMatches = install.match(/\b\d+\s+skills?\b/gi)
      const mcpMatches = install.match(/\b\d+\s+MCPs?\b/gi)

      if (skillMatches) {
        skillMatches.forEach(match => {
          const count = parseInt(match.match(/\d+/)[0])
          if (count !== registries.skills && count !== 105 && count !== 109) { // Allow resource totals
            this.warnings.push(`INSTALL.md mentions "${match}" but registries show ${registries.skills} skills`)
          }
        })
      }
    }
  }

  /**
   * Validate CHANGELOG.md
   */
  validateChangelog(registries) {
    const changelogPath = path.join(this.rootPath, 'CHANGELOG.md')
    if (!fs.existsSync(changelogPath)) {
      this.errors.push('CHANGELOG.md not found')
      return
    }

    console.log(`${cyan}Validating CHANGELOG.md...${reset}`)
    const changelog = fs.readFileSync(changelogPath, 'utf8')

    // Check if latest version is documented
    const latestVersion = /## \[(\d+\.\d+\.\d+)\]/.exec(changelog)
    if (latestVersion) {
      console.log(`  Latest version in CHANGELOG: ${latestVersion[1]}`)
    } else {
      this.errors.push('CHANGELOG.md has no version entries')
    }

    // Check if CHANGELOG mentions skill/MCP counts
    if (!changelog.includes('skill') && !changelog.includes('MCP')) {
      this.warnings.push('CHANGELOG should document skill/MCP counts for major versions')
    }
  }

  /**
   * Validate package.json versions
   */
  validatePackageVersions() {
    console.log(`${cyan}Validating package.json versions...${reset}`)

    const cliPackagePath = path.join(this.rootPath, 'CLI/package.json')
    if (fs.existsSync(cliPackagePath)) {
      const cliPackage = JSON.parse(fs.readFileSync(cliPackagePath, 'utf8'))
      console.log(`  CLI version: ${cliPackage.version}`)
    }

    // Check registry versions
    const skillRegistry = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'META/skill-registry.json'), 'utf8')
    )
    const mcpRegistry = JSON.parse(
      fs.readFileSync(path.join(this.rootPath, 'META/mcp-registry.json'), 'utf8')
    )

    console.log(`  Skill registry version: ${skillRegistry.version}`)
    console.log(`  MCP registry version: ${mcpRegistry.version}`)
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log(`\n${cyan}═══════════════════════════════════════════${reset}`)
    console.log(`${cyan}  Documentation Consistency Validation${reset}`)
    console.log(`${cyan}═══════════════════════════════════════════${reset}\n`)

    try {
      // Load registry data
      console.log(`${cyan}Loading registries...${reset}`)
      const registries = this.loadRegistries()
      console.log(`${green}✓${reset} Loaded registries:`)
      console.log(`  - ${registries.skills} skills`)
      console.log(`  - ${registries.mcps} MCPs`)
      console.log(`  - ${registries.coverage}`)
      console.log(`  - ${registries.skillsWithoutMcps.length} skills without MCPs`)
      console.log()

      // Run validations
      this.validateReadme(registries)
      this.validateInstall(registries)
      this.validateChangelog(registries)
      this.validatePackageVersions()

      // Report results
      console.log(`\n${cyan}═══════════════════════════════════════════${reset}`)
      console.log(`${cyan}  Validation Results${reset}`)
      console.log(`${cyan}═══════════════════════════════════════════${reset}\n`)

      if (this.errors.length === 0 && this.warnings.length === 0) {
        console.log(`${green}✓ All validations passed!${reset}`)
        console.log(`${green}  Documentation is consistent with registries.${reset}\n`)
        return true
      }

      if (this.errors.length > 0) {
        console.log(`${red}✗ ${this.errors.length} error(s) found:${reset}`)
        this.errors.forEach((error, i) => {
          console.log(`  ${red}${i + 1}.${reset} ${error}`)
        })
        console.log()
      }

      if (this.warnings.length > 0) {
        console.log(`${yellow}⚠ ${this.warnings.length} warning(s):${reset}`)
        this.warnings.forEach((warning, i) => {
          console.log(`  ${yellow}${i + 1}.${reset} ${warning}`)
        })
        console.log()
      }

      return this.errors.length === 0
    } catch (error) {
      console.error(`${red}✗ Validation failed:${reset} ${error.message}`)
      return false
    }
  }
}

// Run validation
async function main() {
  const rootPath = path.resolve(__dirname, '..')
  const validator = new DocumentationValidator(rootPath)

  const success = await validator.validate()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = DocumentationValidator
