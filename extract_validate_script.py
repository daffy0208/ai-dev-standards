
import re

def extract_bash_from_markdown(md_path, output_path):
    with open(md_path, 'r') as f:
        content = f.read()

    # Extract all bash code blocks
    # Looking for ```bash ... ``` blocks
    bash_blocks = re.findall(r'```bash(.*?)```', content, re.DOTALL)

    if not bash_blocks:
        print(f"No bash blocks found in {md_path}")
        return

    full_script = "#!/bin/bash\n\n"
    # Add strict mode for better error handling
    full_script += "set -e\n"
    full_script += "# Auto-generated validation script from .claude/commands/validate.md\n\n"

    for i, block in enumerate(bash_blocks):
        full_script += f"\n# --- Block {i+1} ---\n"
        full_script += block.strip() + "\n"

    with open(output_path, 'w') as f:
        f.write(full_script)
    
    print(f"Extracted {len(bash_blocks)} bash blocks to {output_path}")

if __name__ == "__main__":
    extract_bash_from_markdown('/workspace/.claude/commands/validate.md', '/workspace/scripts/validate-full.sh')
