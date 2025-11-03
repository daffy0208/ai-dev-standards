#!/bin/bash

# Configure MCP Server Paths
# Automatically updates .claude/mcp-settings.json and .codex/mcp-servers.json
# with correct absolute paths for the current system

set -e

# Get the absolute path of the repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔧 Configuring MCP Server Paths"
echo "Repository root: $REPO_ROOT"
echo ""

# Function to update .claude/mcp-settings.json
update_claude_config() {
    local config_file="$REPO_ROOT/.claude/mcp-settings.json"
    
    if [ ! -f "$config_file" ]; then
        echo "⚠️  Warning: .claude/mcp-settings.json not found"
        return
    fi
    
    echo "📝 Updating .claude/mcp-settings.json..."
    
    # Backup original
    cp "$config_file" "$config_file.backup"
    
    # Update brain-mcp path using sed
    if command -v jq &> /dev/null; then
        # Use jq if available (more robust)
        jq --arg repo_root "$REPO_ROOT" \
           '.mcpServers."brain-mcp".args[0] = ($repo_root + "/MCP-SERVERS/brain-mcp/dist/index.js") | 
            .mcpServers."brain-mcp".env.AI_DEV_STANDARDS_ROOT = $repo_root' \
           "$config_file.backup" > "$config_file"
        echo "  ✅ Updated brain-mcp configuration using jq"
    else
        # Fallback to sed
        sed -i.bak \
            -e "s|\"args\": \[\"[^\"]*MCP-SERVERS/brain-mcp/dist/index.js\"|\"args\": [\"$REPO_ROOT/MCP-SERVERS/brain-mcp/dist/index.js\"|g" \
            -e "s|\"AI_DEV_STANDARDS_ROOT\": \"[^\"]*\"|\"AI_DEV_STANDARDS_ROOT\": \"$REPO_ROOT\"|g" \
            "$config_file"
        echo "  ✅ Updated brain-mcp configuration using sed"
    fi
}

# Function to update .codex/mcp-servers.json
update_codex_config() {
    local config_file="$REPO_ROOT/.codex/mcp-servers.json"
    
    if [ ! -f "$config_file" ]; then
        echo "⚠️  Warning: .codex/mcp-servers.json not found"
        return
    fi
    
    echo "📝 Updating .codex/mcp-servers.json..."
    
    # Backup original
    cp "$config_file" "$config_file.backup"
    
    # Update brain-mcp path
    if command -v jq &> /dev/null; then
        jq --arg repo_root "$REPO_ROOT" \
           '.mcpServers."brain-mcp".args[0] = ($repo_root + "/MCP-SERVERS/brain-mcp/dist/index.js") | 
            .mcpServers."brain-mcp".env.AI_DEV_STANDARDS_ROOT = $repo_root' \
           "$config_file.backup" > "$config_file"
        echo "  ✅ Updated brain-mcp configuration using jq"
    else
        sed -i.bak \
            -e "s|\"args\": \[\"[^\"]*MCP-SERVERS/brain-mcp/dist/index.js\"|\"args\": [\"$REPO_ROOT/MCP-SERVERS/brain-mcp/dist/index.js\"|g" \
            -e "s|\"AI_DEV_STANDARDS_ROOT\": \"[^\"]*\"|\"AI_DEV_STANDARDS_ROOT\": \"$REPO_ROOT\"|g" \
            "$config_file"
        echo "  ✅ Updated brain-mcp configuration using sed"
    fi
}

# Function to create claude config from template if it doesn't exist
create_claude_config_if_missing() {
    local config_file="$REPO_ROOT/.claude/mcp-settings.json"
    
    if [ -f "$config_file" ]; then
        return
    fi
    
    echo "📝 Creating .claude/mcp-settings.json from template..."
    
    mkdir -p "$REPO_ROOT/.claude"
    
    cat > "$config_file" << EOF
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "$REPO_ROOT/MCP-SERVERS/brain-mcp/dist/index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "$REPO_ROOT"
      },
      "description": "Brain MCP for querying skills, MCPs, and capabilities in ai-dev-standards",
      "timeout": 30000
    }
  }
}
EOF
    
    echo "  ✅ Created .claude/mcp-settings.json"
}

# Function to create codex config from template if it doesn't exist
create_codex_config_if_missing() {
    local config_file="$REPO_ROOT/.codex/mcp-servers.json"
    
    if [ -f "$config_file" ]; then
        return
    fi
    
    echo "📝 Creating .codex/mcp-servers.json from template..."
    
    mkdir -p "$REPO_ROOT/.codex"
    
    cat > "$config_file" << EOF
{
  "mcpServers": {
    "brain-mcp": {
      "command": "node",
      "args": [
        "$REPO_ROOT/MCP-SERVERS/brain-mcp/dist/index.js"
      ],
      "env": {
        "AI_DEV_STANDARDS_ROOT": "$REPO_ROOT"
      },
      "description": "Brain MCP for querying skills, MCPs, and capabilities in ai-dev-standards",
      "timeout": 30000
    }
  }
}
EOF
    
    echo "  ✅ Created .codex/mcp-servers.json"
}

# Main execution
echo "🏗️  Building brain-mcp server..."
cd "$REPO_ROOT/MCP-SERVERS/brain-mcp"
npm install --silent 2>&1 | grep -v "npm WARN" || true
npm run build 2>&1 | grep -v "npm WARN" || true
echo "  ✅ Brain MCP built successfully"
echo ""

echo "🏗️  Building brain CLI..."
cd "$REPO_ROOT/scripts/brain"
npm install --silent 2>&1 | grep -v "npm WARN" || true
npm run build 2>&1 | grep -v "npm WARN" || true
echo "  ✅ Brain CLI built successfully"
echo ""

# Create configs if missing
create_claude_config_if_missing
create_codex_config_if_missing

# Update existing configs
update_claude_config
update_codex_config

echo ""
echo "✅ MCP Server configuration complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Restart your Claude Code or Codex CLI"
echo "  2. Test with: brain_search query:'authentication'"
echo "  3. Or use: brain_select_skills taskDescription:'build RAG system'"
echo ""
echo "📚 For more info, see MCP-SERVERS/brain-mcp/README.md"
