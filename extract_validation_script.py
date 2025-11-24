import re

def extract_bash_blocks(md_file, output_file):
    with open(md_file, 'r') as f:
        content = f.read()

    # Find all bash code blocks
    # Pattern: ```bash\n(content)\n```
    blocks = re.findall(r'```bash\n(.*?)\n```', content, re.DOTALL)

    with open(output_file, 'w') as f:
        f.write('#!/bin/bash\n\n')
        # Note: We do not use set -e because the script manages error handling manually using $? checks.
        
        for block in blocks:
            if "# Quick code quality check (no tests)" in block:
                continue # Skip the quick validation block
            
            f.write(block)
            f.write('\n\n')

if __name__ == '__main__':
    extract_bash_blocks('/workspace/.claude/commands/validate.md', '/workspace/run_ultimate_validation.sh')
