#!/usr/bin/env node

/**
 * Update Registry Script
 *
 * Automatically scans SKILLS directory and updates META/registry.json
 * with all available skills, ensuring 100% discoverability.
 *
 * Usage: node scripts/update-registry.js
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function updateRegistry() {
  console.log('🔄 Scanning SKILLS directory...\n')

  const rootDir = path.join(__dirname, '..')
  const skillsDir = path.join(rootDir, 'SKILLS')
  const registryPath = path.join(rootDir, 'META', 'registry.json')

  // Load existing registry
  const registryContent = await fs.readFile(registryPath, 'utf8')
  const registry = JSON.parse(registryContent)
  const skills = []

  // Scan SKILLS directory
  const dirEntries = await fs.readdir(skillsDir, { withFileTypes: true })
  const dirs = dirEntries.filter(d => d.isDirectory()).map(d => d.name)

  for (const dir of dirs) {
    if (dir === '_TEMPLATE') continue

    const skillPath = path.join(skillsDir, dir, 'SKILL.md')

    try {
      await fs.access(skillPath)
      const content = await fs.readFile(skillPath, 'utf8')
      const frontmatter = extractFrontmatter(content)

      if (frontmatter && frontmatter.name) {
        const skill = {
          name: dir,
          version: frontmatter.version || '1.0.0',
          description: frontmatter.description || `${frontmatter.name} skill`,
          path: `SKILLS/${dir}/SKILL.md`,
          tags: extractTags(frontmatter.description) || [],
          category: determineCategory(dir, frontmatter.description)
        }

        skills.push(skill)
        console.log(`✅ ${dir}`)
      } else {
        console.log(`⚠️  ${dir} - No frontmatter found`)
      }
    } catch (err) {
      // File doesn't exist, skip
    }
  }

  // Sort skills alphabetically
  skills.sort((a, b) => a.name.localeCompare(b.name))

  // Update registry
  const oldCount = registry.skills.length
  registry.skills = skills
  registry.lastUpdated = new Date().toISOString()

  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n')

  console.log(`\n✅ Registry updated!`)
  console.log(`   Before: ${oldCount} skills`)
  console.log(`   After: ${skills.length} skills`)
  console.log(`   Added: ${skills.length - oldCount} skills`)
  console.log(`\n📊 Skills by Category:`)

  const categories = {}
  skills.forEach(skill => {
    categories[skill.category] = (categories[skill.category] || 0) + 1
  })

  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`)
    })
}

/**
 * Extract YAML frontmatter from markdown
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/)
  if (!match) return null

  try {
    const lines = match[1].split('\n')
    const data = {}

    for (const line of lines) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        data[key] = value
      }
    }

    return data
  } catch (err) {
    return null
  }
}

/**
 * Extract tags from description
 */
function extractTags(description) {
  if (!description) return []

  const tags = []
  const lower = description.toLowerCase()

  // Product & Strategy
  if (lower.includes('mvp') || lower.includes('minimum viable')) tags.push('mvp')
  if (lower.includes('product') || lower.includes('market fit')) tags.push('product')
  if (lower.includes('strategy') || lower.includes('strategic')) tags.push('strategy')

  // AI & ML
  if (lower.includes('rag') || lower.includes('retrieval')) tags.push('rag')
  if (lower.includes('ai') || lower.includes('llm')) tags.push('ai')
  if (lower.includes('agent') || lower.includes('multi-agent')) tags.push('agents')

  // Development
  if (lower.includes('api')) tags.push('api')
  if (lower.includes('frontend') || lower.includes('react')) tags.push('frontend')
  if (lower.includes('deployment') || lower.includes('devops')) tags.push('deployment')

  // Design & UX
  if (lower.includes('ux') || lower.includes('user experience')) tags.push('ux')
  if (lower.includes('design') || lower.includes('visual')) tags.push('design')
  if (lower.includes('accessibility') || lower.includes('a11y')) tags.push('accessibility')

  // Specialties
  if (lower.includes('security')) tags.push('security')
  if (lower.includes('performance') || lower.includes('optimization')) tags.push('performance')
  if (lower.includes('testing') || lower.includes('quality')) tags.push('testing')

  return [...new Set(tags)]
}

/**
 * Determine category from name and description
 */
function determineCategory(name, description) {
  const lower = (name + ' ' + (description || '')).toLowerCase()

  // Product
  if (lower.includes('mvp') || lower.includes('product') || lower.includes('market')) {
    return 'product'
  }

  // AI
  if (lower.includes('rag') || lower.includes('agent') || lower.includes('llm')) {
    return 'ai'
  }

  // Design
  if (lower.includes('design') || lower.includes('ux') || lower.includes('visual') || lower.includes('brand') || lower.includes('animation')) {
    return 'design'
  }

  // Frontend
  if (lower.includes('frontend') || lower.includes('react') || lower.includes('mobile')) {
    return 'frontend'
  }

  // Backend
  if (lower.includes('api') || lower.includes('backend') || lower.includes('database')) {
    return 'backend'
  }

  // DevOps
  if (lower.includes('deploy') || lower.includes('infrastructure') || lower.includes('devops')) {
    return 'devops'
  }

  // Data
  if (lower.includes('data') || lower.includes('visualiz')) {
    return 'data'
  }

  // Content
  if (lower.includes('writer') || lower.includes('copy') || lower.includes('content') || lower.includes('audio') || lower.includes('video')) {
    return 'content'
  }

  // Engineering
  if (lower.includes('security') || lower.includes('performance') || lower.includes('testing') || lower.includes('engineer')) {
    return 'engineering'
  }

  // Specialized
  if (lower.includes('iot') || lower.includes('spatial') || lower.includes('3d') || lower.includes('ar') || lower.includes('vr')) {
    return 'specialized'
  }

  // Productivity
  if (lower.includes('adhd') || lower.includes('focus') || lower.includes('task') || lower.includes('context')) {
    return 'productivity'
  }

  return 'general'
}

// Run the update
updateRegistry().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
