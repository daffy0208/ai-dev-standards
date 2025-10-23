# Screenshot Testing MCP - Integration Test

## Test Status: ✅ Ready for Testing

## Setup

1. Build the MCP server:
```bash
cd MCP-SERVERS/screenshot-testing-mcp
npm install
npm run build
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "screenshot-testing": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-SERVERS/screenshot-testing-mcp/dist/index.js"],
      "env": {
        "BASELINE_DIR": "./.screenshots/baseline",
        "CURRENT_DIR": "./.screenshots/current",
        "DIFF_DIR": "./.screenshots/diff",
        "THRESHOLD": "0.1"
      }
    }
  }
}
```

4. Restart Claude Desktop

## Prerequisites

- A running web application to test (e.g., `http://localhost:3000`)
- Or use public URLs for testing (e.g., `https://example.com`)

## Test Cases

### Test 1: Capture Screenshot

**Tool:** `capture_screenshot`

**Input:**
```json
{
  "url": "http://localhost:3000",
  "name": "homepage",
  "viewport": {
    "width": 1280,
    "height": 720
  }
}
```

**Expected Output:**
- Screenshot saved to `.screenshots/current/homepage.png`
- Success message with file path

### Test 2: Compare Screenshots (First Time)

**Tool:** `compare_screenshots`

**Input:**
```json
{
  "name": "homepage",
  "threshold": 0.1
}
```

**Expected Output:**
- Creates baseline from current screenshot (first run)
- Message: "Baseline created for homepage"

### Test 3: Compare Screenshots (Regression)

**Prerequisites:** Modify the page slightly, capture new screenshot

**Input:**
```json
{
  "name": "homepage",
  "threshold": 0.1
}
```

**Expected Output:**
- Pixel difference count
- Percentage difference
- Pass/fail status based on threshold
- Diff image saved to `.screenshots/diff/homepage-diff.png`

### Test 4: Capture Responsive Layouts

**Tool:** `capture_responsive`

**Input:**
```json
{
  "url": "http://localhost:3000/components/Button",
  "name": "button",
  "viewports": [
    { "width": 375, "height": 667, "name": "mobile" },
    { "width": 768, "height": 1024, "name": "tablet" },
    { "width": 1920, "height": 1080, "name": "desktop" }
  ]
}
```

**Expected Output:**
- Three screenshots created:
  - `button-mobile.png`
  - `button-tablet.png`
  - `button-desktop.png`

### Test 5: Capture Theme Variations

**Tool:** `capture_themes`

**Input:**
```json
{
  "url": "http://localhost:3000/components/Card",
  "name": "card",
  "themes": ["light", "dark"]
}
```

**Expected Output:**
- Two screenshots created:
  - `card-light.png`
  - `card-dark.png`
- Dark theme applied with color scheme emulation

### Test 6: Run Visual Regression Suite

**Tool:** `run_visual_tests`

**Input:**
```json
{
  "pattern": "button"
}
```

**Expected Output:**
- Summary of all tests
- Count of passed/failed tests
- List of each test with difference percentage
- Visual indicators (✅/❌)

### Test 7: Update Baseline

**Tool:** `update_baseline`

**Input:**
```json
{
  "name": "homepage"
}
```

**Expected Output:**
- Baseline updated from current screenshot
- Success message

## Integration Checklist

- [ ] Server starts successfully
- [ ] Playwright browser launches
- [ ] All 6 tools are listed in Claude Desktop
- [ ] capture_screenshot creates PNG files
- [ ] Screenshots have correct dimensions
- [ ] Dark theme emulation works
- [ ] Element selector works (partial screenshots)
- [ ] compare_screenshots creates baseline on first run
- [ ] Pixel difference calculation works
- [ ] Diff images are generated
- [ ] Threshold comparison works correctly
- [ ] capture_responsive creates multiple screenshots
- [ ] capture_themes applies color scheme correctly
- [ ] run_visual_tests processes all baselines
- [ ] Pattern filtering works
- [ ] update_baseline copies files correctly
- [ ] Error handling for missing files
- [ ] Error handling for dimension mismatch
- [ ] Browser cleanup on exit

## Known Limitations

- Requires Playwright browsers to be installed
- Screenshots may vary slightly across different OS/hardware
- Font rendering can cause minor pixel differences
- No support for Percy or Chromatic (yet)
- No CI/CD integration helpers (yet)

## Next Steps

1. Add support for element state capture (hover, focus, active)
2. Add support for animations/video capture
3. Add Percy/Chromatic integration
4. Add parallel test execution
5. Add screenshot compression options
6. Add support for multiple browsers (Firefox, Safari)
7. Add CI/CD helper commands
8. Add screenshot history/versioning
9. Add interactive approval workflow
10. Add support for visual test suites (JSON config files)

## Troubleshooting

**Browser launch fails:**
```bash
npx playwright install --with-deps
```

**Permission errors:**
```bash
mkdir -p .screenshots/baseline .screenshots/current .screenshots/diff
chmod -R 755 .screenshots
```

**Screenshots too different due to fonts:**
- Adjust threshold higher (e.g., 0.5 instead of 0.1)
- Use pixel count instead of percentage for small components
