#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'SKILLS');
const SKILL_REGISTRY_PATH = path.join(__dirname, '..', 'META', 'skill-registry.json');

// Skills to remove (don't exist as folders)
const SKILLS_TO_REMOVE = ['database-architect', 'observability-engineer'];

// Skills to add with metadata extracted from registry.json
const SKILLS_TO_ADD = {
  '3d-visualizer': {
    category: 'design',
    tags: ['3d', 'design', 'visualization'],
    difficulty: 'advanced'
  },
  'animation-designer': {
    category: 'ux-design',
    tags: ['animation', 'design', 'motion'],
    difficulty: 'intermediate'
  },
  'audio-producer': {
    category: 'content',
    tags: ['audio', 'production', 'sound'],
    difficulty: 'intermediate'
  },
  'brand-designer': {
    category: 'ux-design',
    tags: ['brand', 'design', 'identity'],
    difficulty: 'intermediate'
  },
  'copywriter': {
    category: 'content',
    tags: ['writing', 'copy', 'marketing'],
    difficulty: 'beginner'
  },
  'data-engineer': {
    category: 'technical',
    tags: ['data', 'etl', 'pipelines'],
    difficulty: 'advanced'
  },
  'data-visualizer': {
    category: 'ux-design',
    tags: ['visualization', 'charts', 'data'],
    difficulty: 'intermediate'
  },
  'iot-developer': {
    category: 'technical',
    tags: ['iot', 'hardware', 'embedded'],
    difficulty: 'advanced'
  },
  'livestream-engineer': {
    category: 'content',
    tags: ['streaming', 'webrtc', 'video'],
    difficulty: 'advanced'
  },
  'localization-engineer': {
    category: 'technical',
    tags: ['i18n', 'localization', 'translation'],
    difficulty: 'intermediate'
  },
  'mobile-developer': {
    category: 'technical',
    tags: ['mobile', 'react-native', 'app'],
    difficulty: 'intermediate'
  },
  'quality-auditor': {
    category: 'infrastructure',
    tags: ['quality', 'audit', 'testing', 'standards'],
    difficulty: 'intermediate',
    mcp_tools: ['screenshot-testing']
  },
  'spatial-developer': {
    category: 'technical',
    tags: ['ar', 'vr', 'webxr', 'spatial'],
    difficulty: 'advanced'
  },
  'video-producer': {
    category: 'content',
    tags: ['video', 'production', 'streaming'],
    difficulty: 'intermediate'
  },
  'voice-interface-builder': {
    category: 'technical',
    tags: ['voice', 'speech', 'audio'],
    difficulty: 'intermediate'
  }
};

function extractDescriptionFromSkillFile(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    const match = content.match(/^description:\s*(.+)$/m);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    console.warn(`Could not read SKILL.md for ${skillName}`);
  }
  return `Expert in ${skillName.replace(/-/g, ' ')}`;
}

function extractTriggersFromSkillFile(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    // Extract triggers from YAML frontmatter
    const triggerMatch = content.match(/triggers:\s*\n((?:\s*-\s*.+\n)+)/);
    if (triggerMatch) {
      const triggers = triggerMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, ''))
        .filter(Boolean);
      return triggers;
    }
  } catch (error) {
    console.warn(`Could not extract triggers for ${skillName}`);
  }
  return [skillName, skillName.replace(/-/g, ' ')];
}

function main() {
  console.log('🔧 Fixing skill-registry.json...\n');

  // Read current registry
  const registry = JSON.parse(fs.readFileSync(SKILL_REGISTRY_PATH, 'utf-8'));

  console.log(`Current skill count: ${registry.skills.length}`);

  // Remove non-existent skills
  const originalLength = registry.skills.length;
  registry.skills = registry.skills.filter(skill => {
    if (SKILLS_TO_REMOVE.includes(skill.name)) {
      console.log(`❌ Removing: ${skill.name} (doesn't exist as folder)`);
      return false;
    }
    return true;
  });
  console.log(`Removed ${originalLength - registry.skills.length} skills\n`);

  // Add missing skills
  Object.keys(SKILLS_TO_ADD).forEach(skillName => {
    const metadata = SKILLS_TO_ADD[skillName];
    const description = extractDescriptionFromSkillFile(skillName);
    const triggers = extractTriggersFromSkillFile(skillName);

    const newSkill = {
      name: skillName,
      description,
      triggers,
      tags: metadata.tags,
      category: metadata.category,
      difficulty: metadata.difficulty,
      estimated_time: '1-3 hours',
      path: `/SKILLS/${skillName}/`,
      status: 'active',
      prerequisites: [],
      related_skills: [],
      frameworks: ['all'],
      languages: ['all']
    };

    if (metadata.mcp_tools) {
      newSkill.mcp_tools = metadata.mcp_tools;
    }

    registry.skills.push(newSkill);
    console.log(`✅ Added: ${skillName}`);
  });

  // Sort skills alphabetically
  registry.skills.sort((a, b) => a.name.localeCompare(b.name));

  // Update counts in description
  registry.description = registry.description.replace(/\d+ active skills/, `${registry.skills.length} active skills`);
  registry.last_updated = new Date().toISOString().split('T')[0];
  registry.version = '3.2.0'; // Increment version

  // Write back
  fs.writeFileSync(SKILL_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n✨ Fixed! New skill count: ${registry.skills.length}`);
  console.log(`📝 Updated version to ${registry.version}`);
}

main();
