# Accessibility Checker MCP - Integration Test

## Test Status: ✅ Ready for Testing

## Setup

1. Build the MCP server:
```bash
cd MCP-SERVERS/accessibility-checker-mcp
npm install
npm run build
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "accessibility-checker": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-SERVERS/accessibility-checker-mcp/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

## Test Cases

### Test 1: Check HTML for Accessibility Issues

**Tool:** `check_html`

**Input:**
```json
{
  "html": "<img src='logo.png'><button></button><input type='text'>",
  "level": "AA"
}
```

**Expected Output:**
- Should detect missing alt text on image
- Should detect button without accessible text
- Should detect input without label

### Test 2: Check Color Contrast

**Tool:** `check_contrast`

**Input:**
```json
{
  "foreground": "#777777",
  "background": "#888888",
  "fontSize": 16
}
```

**Expected Output:**
- Should calculate low contrast ratio (~1.3:1)
- Should fail WCAG standards
- Should provide recommendation

### Test 3: Validate Semantic HTML

**Tool:** `validate_semantics`

**Input:**
```json
{
  "html": "<div onclick='handleClick()'>Click me</div><h3>Title</h3>"
}
```

**Expected Output:**
- Should warn about div with onclick (should use button)
- Should warn about heading hierarchy skip (h3 without h1)
- Should recommend semantic HTML5 elements

### Test 4: Check Images

**Tool:** `check_images`

**Input:**
```json
{
  "html": "<img src='photo.jpg'><img src='icon.png' alt='Home'><img src='bg.jpg' alt=''>"
}
```

**Expected Output:**
- Image 1: Missing alt attribute
- Image 2: Has descriptive alt text
- Image 3: Properly marked as decorative

### Test 5: Check Forms

**Tool:** `check_forms`

**Input:**
```json
{
  "html": "<form><input type='text' id='name'><label for='name'>Name</label><input type='email' required></form>"
}
```

**Expected Output:**
- Input 1: Has proper label association
- Input 2: Has 'required' but missing 'aria-required'

## Integration Checklist

- [ ] Server starts successfully
- [ ] All 5 tools are listed in Claude Desktop
- [ ] check_html detects accessibility violations
- [ ] check_contrast calculates ratios correctly
- [ ] validate_semantics provides warnings and recommendations
- [ ] check_images validates alt text
- [ ] check_forms validates form accessibility
- [ ] Error handling works for invalid inputs
- [ ] Server logs errors to stderr appropriately

## Known Limitations

- Uses simplified color parsing (supports hex colors only in current implementation)
- Axe-core integration is simulated (real implementation would use actual axe-core)
- HTML parsing is basic (production version would use proper HTML parser)

## Next Steps

1. Enhance color parsing to support rgb(), rgba(), hsl(), named colors
2. Integrate actual axe-core library for comprehensive checking
3. Add support for checking live URLs (not just HTML strings)
4. Add keyboard navigation testing
5. Add screen reader compatibility testing
