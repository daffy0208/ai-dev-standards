#!/usr/bin/env python3
"""
Extract bash code blocks from .claude/commands/validate.md and create validate-full.sh
"""

import re

# Read the markdown file
with open('.claude/commands/validate.md', 'r') as f:
    content = f.read()

# Extract all bash code blocks
bash_blocks = re.findall(r'```bash\n(.*?)\n```', content, re.DOTALL)

# Combine them
script_content = ['#!/usr/bin/env bash']
script_content.append('set +e  # Allow commands to fail without exiting')
script_content.append('')

for block in bash_blocks:
    script_content.append(block)
    script_content.append('')

# Write to validate-full.sh
output = '\n'.join(script_content)
with open('scripts/validate-full.sh', 'w') as f:
    f.write(output)

print('✅ Created scripts/validate-full.sh')
print(f'   Extracted {len(bash_blocks)} bash blocks')
