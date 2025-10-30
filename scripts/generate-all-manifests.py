#!/usr/bin/env python3
"""
Automated Manifest Generator
Generates manifest.yaml files for skills and MCPs from their SKILL.md/README.md files
"""

import yaml
import json
import re
from pathlib import Path
from typing import Dict, List, Any

def extract_frontmatter(content: str) -> Dict[str, Any]:
    """Extract YAML frontmatter from markdown file"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        return yaml.safe_load(match.group(1))
    return {}

def infer_domains(name: str, description: str, content: str) -> List[str]:
    """Infer domains from skill name, description, and content"""
    domains = []

    # Domain keywords mapping
    domain_keywords = {
        'ai': ['ai', 'llm', 'gpt', 'claude', 'openai', 'anthropic'],
        'rag': ['rag', 'retrieval', 'vector', 'embedding'],
        'api': ['api', 'rest', 'graphql', 'endpoint'],
        'frontend': ['frontend', 'react', 'next.js', 'ui', 'interface'],
        'backend': ['backend', 'server', 'database', 'api'],
        'security': ['security', 'auth', 'authentication', 'authorization', 'owasp'],
        'devops': ['devops', 'ci/cd', 'deployment', 'docker', 'kubernetes'],
        'testing': ['testing', 'test', 'qa', 'quality'],
        'product': ['product', 'strategy', 'mvp', 'roadmap'],
        'design': ['design', 'ux', 'ui', 'wireframe', 'prototype'],
        'data': ['data', 'analytics', 'metrics', 'database'],
        'orchestration': ['orchestration', 'workflow', 'automation'],
    }

    text = f"{name} {description} {content}".lower()

    for domain, keywords in domain_keywords.items():
        if any(keyword in text for keyword in keywords):
            domains.append(domain)

    return domains or ['general']

def infer_effects(description: str, content: str) -> List[str]:
    """Infer effects from description and content"""
    effects = []

    # Effect patterns
    effect_patterns = [
        (r'create[s]?\s+(\w+)', 'creates_{}'),
        (r'add[s]?\s+(\w+)', 'adds_{}'),
        (r'implement[s]?\s+(\w+)', 'implements_{}'),
        (r'configure[s]?\s+(\w+)', 'configures_{}'),
        (r'build[s]?\s+(\w+)', 'builds_{}'),
        (r'deploy[s]?\s+(\w+)', 'deploys_{}'),
        (r'design[s]?\s+(\w+)', 'designs_{}'),
        (r'validate[s]?\s+(\w+)', 'validates_{}'),
    ]

    text = f"{description} {content}".lower()

    for pattern, template in effect_patterns:
        matches = re.findall(pattern, text[:500])  # First 500 chars
        for match in matches[:3]:  # Max 3 per pattern
            effect = template.format(match.replace(' ', '_'))
            if effect not in effects:
                effects.append(effect)

    return effects or ['provides_capability']

def infer_compatibility(name: str, description: str) -> Dict[str, List[str]]:
    """Infer compatibility relationships"""
    compatibility = {
        'requires': [],
        'conflicts_with': [],
        'composes_with': [],
        'enables': []
    }

    # Common composition patterns
    composition_map = {
        'api-designer': ['frontend-builder', 'security-engineer', 'testing-strategist'],
        'frontend-builder': ['api-designer', 'ux-designer', 'deployment-advisor'],
        'security-engineer': ['api-designer', 'deployment-advisor'],
        'rag-implementer': ['knowledge-base-manager', 'api-designer'],
        'testing-strategist': ['api-designer', 'frontend-builder'],
        'deployment-advisor': ['frontend-builder', 'api-designer', 'security-engineer'],
    }

    if name in composition_map:
        compatibility['composes_with'] = composition_map[name]

    return compatibility

def generate_manifest(skill_path: Path, kind: str = 'skill') -> Dict[str, Any]:
    """Generate manifest from skill/MCP directory"""

    # Read SKILL.md or README.md
    skill_file = skill_path / 'SKILL.md'
    if not skill_file.exists():
        skill_file = skill_path / 'README.md'

    if not skill_file.exists():
        return None

    with open(skill_file) as f:
        content = f.read()

    # Extract frontmatter
    frontmatter = extract_frontmatter(content)

    name = skill_path.name
    description = frontmatter.get('description', '')

    # Infer missing fields
    domains = infer_domains(name, description, content)
    effects = infer_effects(description, content)
    compatibility = infer_compatibility(name, description)

    # Build manifest
    manifest = {
        'name': name,
        'kind': kind,
        'description': description,
        'preconditions': [
            {
                'check': 'project_initialized',
                'description': 'Project environment is set up',
                'required': True
            }
        ],
        'effects': effects,
        'domains': domains,
        'cost': 'medium',
        'latency': 'medium',
        'risk_level': 'low',
        'side_effects': ['modifies_files', 'creates_artifacts'],
        'idempotent': False,
        'success_signal': f"{name} capability successfully applied",
        'failure_signals': [
            'Prerequisites not met',
            'Configuration error'
        ],
        'compatibility': compatibility,
        'observability': {
            'logs': [
                f"Applying {name}...",
                f"{name} completed"
            ],
            'metrics': [
                'execution_time_ms',
                'success_rate'
            ]
        },
        'metadata': {
            'version': frontmatter.get('version', '1.0.0'),
            'created_at': '2025-10-30',
            'tags': domains,
            'examples': []
        }
    }

    return manifest

def main():
    """Generate manifests for all skills and MCPs"""

    project_root = Path(__file__).parent.parent

    print("=" * 60)
    print("AUTOMATED MANIFEST GENERATOR")
    print("=" * 60)

    # Generate skill manifests
    skills_dir = project_root / 'SKILLS'
    skills_generated = 0
    skills_skipped = 0

    print("\n📚 Generating SKILL manifests...")
    print("-" * 60)

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir() or skill_dir.name.startswith('_'):
            continue

        manifest_path = skill_dir / 'manifest.yaml'

        # Skip if manifest already exists
        if manifest_path.exists():
            print(f"  ⏭️  {skill_dir.name} (already has manifest)")
            skills_skipped += 1
            continue

        # Generate manifest
        manifest = generate_manifest(skill_dir, 'skill')

        if manifest:
            with open(manifest_path, 'w') as f:
                yaml.dump(manifest, f, default_flow_style=False, sort_keys=False)
            print(f"  ✅ {skill_dir.name}")
            skills_generated += 1
        else:
            print(f"  ❌ {skill_dir.name} (no SKILL.md)")

    # Generate MCP manifests
    mcp_dir = project_root / 'MCP-SERVERS'
    mcps_generated = 0
    mcps_skipped = 0

    if mcp_dir.exists():
        print("\n🔌 Generating MCP manifests...")
        print("-" * 60)

        for mcp_path in sorted(mcp_dir.iterdir()):
            if not mcp_path.is_dir() or mcp_path.name.startswith('.'):
                continue

            manifest_path = mcp_path / 'manifest.yaml'

            # Skip if manifest already exists
            if manifest_path.exists():
                print(f"  ⏭️  {mcp_path.name} (already has manifest)")
                mcps_skipped += 1
                continue

            # Generate manifest
            manifest = generate_manifest(mcp_path, 'mcp')

            if manifest:
                with open(manifest_path, 'w') as f:
                    yaml.dump(manifest, f, default_flow_style=False, sort_keys=False)
                print(f"  ✅ {mcp_path.name}")
                mcps_generated += 1
            else:
                print(f"  ❌ {mcp_path.name} (no README.md)")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\n📚 Skills:")
    print(f"   Generated: {skills_generated}")
    print(f"   Skipped: {skills_skipped}")
    print(f"\n🔌 MCPs:")
    print(f"   Generated: {mcps_generated}")
    print(f"   Skipped: {mcps_skipped}")
    print(f"\n✅ Total: {skills_generated + mcps_generated} new manifests")
    print("\nNext: Run capability graph builder to update the graph")

if __name__ == '__main__':
    main()
