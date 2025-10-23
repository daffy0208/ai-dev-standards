# Creative & Frontend Tools Gap Analysis

**Focus:** Design tools, creative skills, and MCPs for visual development
**Date:** 2025-10-21
**Methodology:** Product-strategist + mvp-builder skills

---

## Executive Summary

**Current State:**
- ✅ Have: ux-designer (wireframes/flows), frontend-builder (code), user-researcher
- ❌ Missing: Visual design, design systems, creative tooling, design-to-code workflows

**Critical Gaps:**
- 🎨 No visual design skill (colors, typography, layouts)
- 🧩 No design system skill (component libraries, tokens)
- 🖼️ No creative tools integration (Figma, Adobe, etc.)
- 🤖 No design-focused MCPs (color generation, typography, accessibility)

---

## P0 - Critical Creative/Frontend Gaps

### 1. **visual-designer** Skill 🎨

**Why Critical:**
Frontend developers need design guidance for:
- Color palettes and theming
- Typography scales
- Spacing systems
- Visual hierarchy
- Design principles

**Current Pain Points:**
- "What colors should I use?"
- "How do I choose fonts?"
- "Is this spacing consistent?"
- "Does this design look good?"

**What It Should Cover:**

```markdown
# visual-designer Skill

## Phase 1: Color Systems
- Color theory basics (complementary, analogous, triadic)
- Creating color palettes (60-30-10 rule)
- Accessible color contrast (WCAG AA/AAA)
- Dark mode strategy
- Brand color extraction

Tools:
- Coolors.co integration
- Adobe Color API
- Contrast checker

## Phase 2: Typography
- Font pairing principles
- Type scale generation (modular scale)
- Line height and spacing
- Responsive typography
- Web font optimization

Tools:
- Google Fonts recommendations
- Font pairing tools
- Type scale calculators

## Phase 3: Layout & Composition
- Grid systems (8pt, 12-column)
- Visual hierarchy
- Whitespace principles
- Golden ratio and rule of thirds
- Responsive breakpoints

## Phase 4: Design Systems
- Design tokens (colors, spacing, typography)
- Component variants
- Style guides
- Documentation

## Phase 5: Visual Polish
- Shadows and elevation
- Border radius consistency
- Micro-interactions
- Loading states
- Empty states
```

**Use Cases:**
- "Create a color palette for my SaaS app"
- "Suggest font pairings for this design"
- "Is my spacing system consistent?"
- "Generate design tokens for Tailwind"

**MCP Integrations Needed:**
- Color palette generation MCP
- Typography recommendation MCP
- Design token export MCP
- Accessibility checker MCP

**Estimated Value:** 9/10 (every frontend needs design)
**Estimated Effort:** 2 weeks

---

### 2. **design-system-architect** Skill 🧩

**Why Critical:**
Design systems are essential for:
- Consistent UI across app
- Faster development
- Component reusability
- Brand coherence

**Current Pain Points:**
- "How do I build a design system?"
- "What components should I create first?"
- "How do I organize my component library?"
- "How do I document components?"

**What It Should Cover:**

```markdown
# design-system-architect Skill

## Phase 1: Foundation
- Design tokens (colors, spacing, typography, shadows)
- Token naming conventions
- Token organization (semantic vs primitive)
- Platform-agnostic token structure

## Phase 2: Component Library Structure
- Atomic design methodology (atoms, molecules, organisms)
- Component prioritization (P0: Button, Input → P2: DataTable)
- Variant strategies
- Composition patterns

## Phase 3: Implementation
- CSS-in-JS vs CSS modules vs Tailwind
- Component API design
- Prop naming conventions
- TypeScript types for components

## Phase 4: Documentation
- Storybook setup
- Component playground
- Usage examples
- Accessibility notes

## Phase 5: Maintenance
- Versioning strategy
- Breaking change management
- Migration guides
- Component deprecation
```

**Component Priority Matrix:**

| Priority | Components | Rationale |
|----------|------------|-----------|
| P0 | Button, Input, Select, Checkbox | Form basics |
| P1 | Modal, Toast, Dropdown, Tabs | Common interactions |
| P2 | DataTable, Chart, Calendar | Complex widgets |

**Use Cases:**
- "Design a design system for my startup"
- "What components should I build first?"
- "Create design tokens for my brand"
- "Set up Storybook for component library"

**MCP Integrations Needed:**
- Figma token extractor MCP
- Storybook generator MCP
- Component analyzer MCP

**Estimated Value:** 9/10 (scales development)
**Estimated Effort:** 3 weeks

---

### 3. **Figma-to-Code** Integration 🔗

**Why Critical:**
Design-to-code workflow is a major bottleneck:
- Designers work in Figma
- Developers manually translate to code
- High error rate and time waste

**Current Pain Points:**
- "How do I implement this Figma design?"
- "Extract design tokens from Figma"
- "Get spacing/color values from design"
- "Generate component structure from Figma"

**What It Should Include:**

**A. Figma MCP Server**
```
figma-mcp/
  ├── server.py (MCP server implementation)
  ├── tools/
  │   ├── get-design-tokens.py    # Extract colors, fonts, spacing
  │   ├── get-components.py        # List Figma components
  │   ├── export-assets.py         # Export images/icons
  │   └── get-measurements.py      # Extract spacing, sizes
```

**Capabilities:**
1. **Design Token Extraction**
   - Colors → CSS variables, Tailwind config
   - Typography → font stacks, sizes, weights
   - Spacing → spacing scale
   - Shadows, borders, radii

2. **Component Structure**
   - Component hierarchy
   - Variants and states
   - Auto-generate component skeleton

3. **Asset Export**
   - Icons as SVG
   - Images optimized
   - Logo variations

4. **Measurements**
   - Spacing between elements
   - Component dimensions
   - Layout structure

**Use Cases:**
```
You: "Extract design tokens from Figma file [URL]"
Claude (using Figma MCP):
→ Returns: colors, typography, spacing as JSON
→ Generates: tailwind.config.js with extracted values

You: "Convert this Figma component to React"
Claude (using Figma MCP):
→ Analyzes Figma component structure
→ Generates React component with props
→ Applies design tokens
```

**Technical Stack:**
- Figma REST API
- Python MCP server
- Token transformers (Style Dictionary)

**Estimated Value:** 10/10 (huge time saver)
**Estimated Effort:** 2 weeks

---

### 4. **Creative Assets MCP** 🖼️

**Why Critical:**
Frontend needs images, icons, illustrations, but no tooling:
- Icon generation
- Image optimization
- Stock photo search
- SVG manipulation

**What It Should Include:**

**A. Icon Generation MCP**
```
Capabilities:
- Search icon libraries (Heroicons, Lucide, Font Awesome)
- Generate custom icons (using DALL-E/Midjourney)
- Convert to React components
- Optimize SVG code
```

**B. Image Optimization MCP**
```
Capabilities:
- Resize images for responsive
- Convert formats (WebP, AVIF)
- Compress images
- Generate srcset
- Add blur placeholders (Next.js style)
```

**C. Stock Photo MCP**
```
Capabilities:
- Search Unsplash, Pexels
- Download high-res images
- Attribution handling
- AI image generation (DALL-E integration)
```

**D. SVG Manipulation MCP**
```
Capabilities:
- Optimize SVG code
- Change colors/sizes
- Convert to React/Vue components
- Combine multiple SVGs
```

**Use Cases:**
```
You: "Find icons for home, settings, profile"
Claude (using Icon MCP):
→ Searches Heroicons
→ Returns React components ready to use

You: "Optimize this image for web"
Claude (using Image MCP):
→ Resizes to multiple sizes
→ Converts to WebP
→ Generates Next.js Image component code

You: "Find stock photos of 'team collaboration'"
Claude (using Stock Photo MCP):
→ Searches Unsplash
→ Downloads images
→ Provides attribution text
```

**Estimated Value:** 8/10 (speeds up asset workflow)
**Estimated Effort:** 2 weeks

---

## P1 - Important Creative Gaps

### 5. **brand-designer** Skill 🏢

**Why Important:**
Every product needs brand identity:
- Logo concepts
- Color palette
- Typography
- Voice and tone
- Visual style

**What It Should Cover:**

```markdown
# brand-designer Skill

## Phase 1: Brand Strategy
- Target audience definition
- Brand personality (Sinclair's brand archetypes)
- Competitive analysis
- Positioning statement

## Phase 2: Visual Identity
- Logo design principles
- Color psychology
- Font selection for brand
- Visual style direction (minimalist, bold, playful, etc.)

## Phase 3: Brand Guidelines
- Logo usage rules
- Color palette (primary, secondary, neutral)
- Typography hierarchy
- Imagery style
- Do's and don'ts

## Phase 4: Application
- Website design direction
- Marketing materials
- Social media templates
- Email templates
```

**Use Cases:**
- "Create a brand identity for my startup"
- "Suggest logo concepts for [product]"
- "Define brand colors for [industry]"

**Estimated Value:** 7/10 (one-time need, high impact)
**Estimated Effort:** 2 weeks

---

### 6. **copywriter** Skill ✍️

**Why Important:**
Design isn't just visual - copy matters:
- Headlines and CTAs
- Microcopy (button text, errors)
- Marketing copy
- Voice and tone

**What It Should Cover:**

```markdown
# copywriter Skill

## Phase 1: Microcopy
- Button text ("Get Started" vs "Sign Up")
- Form labels and placeholders
- Error messages (helpful, not blaming)
- Success messages
- Empty states

## Phase 2: Marketing Copy
- Headlines (value prop in 10 words)
- Subheadlines (how it works)
- CTAs (action-oriented)
- Feature descriptions (benefit, not feature)
- Social proof

## Phase 3: Voice & Tone
- Brand voice definition
- Tone adaptation (error vs success)
- Writing principles
- Style guide

## Phase 4: SEO Copy
- Meta titles and descriptions
- Alt text for images
- Header hierarchy (H1, H2, H3)
- Keyword integration
```

**Use Cases:**
- "Write a headline for landing page"
- "Improve this error message"
- "Create CTA text for signup button"
- "Write alt text for these images"

**Estimated Value:** 7/10 (often overlooked, high UX impact)
**Estimated Effort:** 1 week

---

### 7. **animation-designer** Skill 🎬

**Why Important:**
Motion brings UI to life:
- Micro-interactions
- Page transitions
- Loading animations
- Hover effects

**What It Should Cover:**

```markdown
# animation-designer Skill

## Phase 1: Animation Principles
- 12 principles of animation (squash, stretch, timing, etc.)
- Easing functions (ease-in-out, spring, etc.)
- Duration guidelines (fast: 200ms, medium: 300ms, slow: 500ms)
- When to animate vs when not to

## Phase 2: CSS Animations
- Transitions
- Keyframe animations
- Transform and opacity (GPU-accelerated)
- Animation performance

## Phase 3: JavaScript Animations
- Framer Motion (React)
- GSAP
- React Spring
- View Transitions API

## Phase 4: Micro-interactions
- Button feedback
- Form validation animations
- Loading states
- Success/error feedback
- Hover effects
```

**Use Cases:**
- "Add micro-interactions to this button"
- "Create a loading animation"
- "Animate page transitions"
- "Design hover effects"

**Estimated Value:** 6/10 (polish, not essential)
**Estimated Effort:** 1 week

---

## P1 - Frontend Tooling MCPs

### 8. **Accessibility Checker MCP** ♿

**Why Important:**
Accessibility is required but often missed:
- Color contrast checking
- ARIA attributes
- Keyboard navigation
- Screen reader testing

**Capabilities:**
```
Tools:
- analyze-contrast (check WCAG compliance)
- check-aria (validate ARIA attributes)
- test-keyboard-nav (simulate keyboard-only navigation)
- generate-alt-text (AI-powered alt text suggestions)
- audit-page (full accessibility audit)
```

**Use Cases:**
```
You: "Check if these colors meet WCAG AA"
Claude (using A11y MCP):
→ Analyzes contrast ratio
→ Returns pass/fail with recommendations

You: "Audit this page for accessibility"
Claude (using A11y MCP):
→ Checks color contrast, ARIA, headings, alt text
→ Provides prioritized fix list
```

**Estimated Value:** 8/10 (legal requirement, UX improvement)
**Estimated Effort:** 1 week

---

### 9. **Component Generator MCP** 🏗️

**Why Important:**
Generating boilerplate components wastes time:
- Create component files
- Add TypeScript types
- Generate stories
- Add tests

**Capabilities:**
```
Tools:
- create-component (generates component + types + tests + story)
- create-design-system (scaffolds entire design system)
- generate-tailwind-theme (from design tokens)
- create-storybook (sets up Storybook)
```

**Use Cases:**
```
You: "Create a Button component with variants"
Claude (using Component Generator MCP):
→ Generates Button.tsx with TypeScript
→ Generates Button.stories.tsx
→ Generates Button.test.tsx
→ Adds to component library index

You: "Scaffold a design system"
Claude (using Component Generator MCP):
→ Creates directory structure
→ Sets up design tokens
→ Generates base components (Button, Input, etc.)
→ Configures Storybook
```

**Estimated Value:** 7/10 (speeds up development)
**Estimated Effort:** 1 week

---

### 10. **Screenshot Testing MCP** 📸

**Why Important:**
Visual regression testing prevents UI bugs:
- Catch visual changes
- Cross-browser testing
- Responsive testing

**Capabilities:**
```
Tools:
- capture-screenshot (page or component)
- compare-screenshots (visual diff)
- test-responsive (multiple viewports)
- test-browsers (Chrome, Firefox, Safari)
```

**Use Cases:**
```
You: "Capture screenshots of all components"
Claude (using Screenshot MCP):
→ Opens Storybook
→ Captures each component state
→ Saves baseline screenshots

You: "Compare current UI to baseline"
Claude (using Screenshot MCP):
→ Captures new screenshots
→ Compares to baseline
→ Highlights visual differences
```

**Estimated Value:** 6/10 (prevents regressions)
**Estimated Effort:** 1 week

---

## Complete Frontend/Creative Toolkit

### Skills Roadmap

| Priority | Skill | Category | Effort | Value |
|----------|-------|----------|--------|-------|
| P0 | visual-designer | Design | 2 weeks | 9/10 |
| P0 | design-system-architect | Design | 3 weeks | 9/10 |
| P1 | brand-designer | Design | 2 weeks | 7/10 |
| P1 | copywriter | Content | 1 week | 7/10 |
| P1 | animation-designer | Design | 1 week | 6/10 |

---

### MCPs Roadmap

| Priority | MCP | Category | Effort | Value |
|----------|-----|----------|--------|-------|
| P0 | figma-mcp | Integration | 2 weeks | 10/10 |
| P0 | creative-assets-mcp | Assets | 2 weeks | 8/10 |
| P1 | accessibility-checker-mcp | Quality | 1 week | 8/10 |
| P1 | component-generator-mcp | Productivity | 1 week | 7/10 |
| P1 | screenshot-testing-mcp | Testing | 1 week | 6/10 |

---

### Tools & Integrations Needed

**Design Tools:**
- Figma API integration ⭐
- Adobe XD integration
- Sketch integration (lower priority)

**Color Tools:**
- Coolors.co API
- Adobe Color API
- Contrast checker library

**Typography Tools:**
- Google Fonts API
- Font pairing database
- Type scale calculator

**Icon Libraries:**
- Heroicons
- Lucide Icons
- Font Awesome
- Custom icon generator (DALL-E)

**Image Tools:**
- Unsplash API
- Pexels API
- Image optimization (Sharp, ImageMagick)
- DALL-E integration

**Component Tools:**
- Storybook
- Style Dictionary (design tokens)
- Plop.js (component generator)

**Accessibility Tools:**
- axe-core
- WAVE API
- Lighthouse CI

---

## Implementation Priority

### Phase 1: Visual Design Foundation (Weeks 1-2)

**Deliverables:**
1. visual-designer skill
2. Color palette generation tool
3. Typography recommendation system
4. Design token documentation

**Why First:**
- Foundational for all frontend work
- Immediate value for every project
- Enables other design work

---

### Phase 2: Design Systems (Weeks 3-5)

**Deliverables:**
1. design-system-architect skill
2. Component library template
3. Storybook setup guide
4. Design token workflow

**Why Second:**
- Builds on visual design foundation
- Scales frontend development
- Long-term productivity gain

---

### Phase 3: Design-to-Code (Weeks 6-7)

**Deliverables:**
1. Figma MCP server
2. Design token extraction
3. Component generation from Figma
4. Asset export workflow

**Why Third:**
- Requires design foundation
- Biggest time saver
- High user demand

---

### Phase 4: Creative Assets (Weeks 8-9)

**Deliverables:**
1. Creative assets MCP
2. Icon library integration
3. Image optimization workflow
4. Stock photo integration

**Why Fourth:**
- Nice to have vs must have
- Quick wins once MCP framework established

---

### Phase 5: Polish & Quality (Weeks 10-12)

**Deliverables:**
1. Accessibility checker MCP
2. Screenshot testing MCP
3. animation-designer skill
4. copywriter skill

**Why Last:**
- Polish and quality improvements
- Lower priority than foundation

---

## Success Metrics

### After Phase 1 (Visual Design)
- [ ] 70% of projects use visual-designer skill
- [ ] Design consistency scores improve 50%
- [ ] Time to create color palette: 2 hours → 30 minutes

### After Phase 2 (Design Systems)
- [ ] 50% of projects adopt design system approach
- [ ] Component reusability increases 60%
- [ ] New component creation time: 2 hours → 30 minutes

### After Phase 3 (Figma Integration)
- [ ] Design-to-code time reduced 70%
- [ ] Fewer design implementation errors (80% reduction)
- [ ] Designer-developer handoff friction reduced 60%

### After Phase 4 (Creative Assets)
- [ ] Asset sourcing time: 1 hour → 15 minutes
- [ ] Image optimization automated 90%
- [ ] Icon consistency improved 80%

### After Phase 5 (Polish)
- [ ] Accessibility compliance: 40% → 90%
- [ ] Visual regression bugs reduced 70%
- [ ] Animation usage increases 40%

---

## Use Case Validation

### Scenario 1: New SaaS Landing Page

**Without Creative Tools:**
1. Manually choose colors (2 hours trial & error)
2. Find fonts on Google Fonts (1 hour)
3. Build components from scratch (8 hours)
4. Find stock images (1 hour)
5. Manually check contrast (30 min)
**Total: 12.5 hours**

**With Creative Tools:**
1. visual-designer generates palette (5 min)
2. Typography recommendations (5 min)
3. Component library template (30 min)
4. Stock photo MCP finds images (5 min)
5. A11y MCP checks contrast (2 min)
**Total: 47 minutes** ⚡

**Time Saved: 92%**

---

### Scenario 2: Design System for Startup

**Without Tools:**
1. Define design tokens manually (4 hours)
2. Build 15 components (40 hours)
3. Set up Storybook (4 hours)
4. Document components (8 hours)
**Total: 56 hours**

**With Tools:**
1. design-system-architect guides setup (1 hour)
2. Component generator creates skeleton (2 hours)
3. Storybook auto-configured (30 min)
4. Documentation generated (1 hour)
**Total: 4.5 hours**

**Time Saved: 92%**

---

### Scenario 3: Figma to Production

**Without Figma MCP:**
1. Manually extract colors, spacing (1 hour)
2. Estimate measurements (30 min)
3. Recreate layouts by eye (4 hours)
4. Back-and-forth with designer (2 hours)
**Total: 7.5 hours**

**With Figma MCP:**
1. Extract tokens automatically (2 min)
2. Get exact measurements (1 min)
3. Generate component structure (5 min)
4. Designer approves (30 min)
**Total: 38 minutes**

**Time Saved: 92%**

---

## Competitive Analysis

**What other tools offer:**

**v0.dev (Vercel):**
- ✅ AI component generation
- ✅ Design to code
- ❌ No design system building
- ❌ No Figma integration

**Builder.io:**
- ✅ Visual editor
- ✅ Design to code
- ❌ No design tokens
- ❌ Proprietary platform

**Galileo AI:**
- ✅ Figma to code
- ✅ Design generation
- ❌ No design system guidance
- ❌ Expensive

**Our Opportunity:**
- ✅ Design system methodology (not just generation)
- ✅ Figma integration with design tokens
- ✅ Integrated with ai-dev-standards (full stack)
- ✅ Open, composable MCPs
- ✅ Teaching principles, not just generating

---

## Technical Architecture

### Figma MCP Server

```python
# figma-mcp/server.py
from mcp.server import Server, Tool

server = Server("figma-tools")

@server.tool()
def extract_design_tokens(figma_url: str) -> dict:
    """Extract colors, typography, spacing from Figma file"""
    # Connect to Figma API
    # Parse design tokens
    # Return structured data
    return {
        "colors": {...},
        "typography": {...},
        "spacing": {...}
    }

@server.tool()
def get_component_structure(figma_url: str, component_name: str) -> dict:
    """Get component hierarchy and properties"""
    # Parse Figma component
    # Extract variants, props
    # Return component spec
    return {
        "name": component_name,
        "variants": [...],
        "props": [...]
    }
```

---

### Creative Assets MCP Server

```python
# creative-assets-mcp/server.py
from mcp.server import Server, Tool

server = Server("creative-assets")

@server.tool()
def search_icons(query: str, library: str = "heroicons") -> list:
    """Search icon libraries"""
    # Search icon API
    # Return SVG code
    pass

@server.tool()
def optimize_image(image_path: str, sizes: list) -> dict:
    """Optimize image for web"""
    # Resize to multiple sizes
    # Convert to WebP
    # Generate srcset
    pass

@server.tool()
def search_stock_photos(query: str, count: int = 5) -> list:
    """Search Unsplash/Pexels"""
    # Search APIs
    # Return image URLs
    pass
```

---

## Next Steps

**This Week:**
1. Create visual-designer skill
2. Document color system approach
3. Build typography recommendation system

**Next Week:**
4. Create design-system-architect skill
5. Build component library template

**Month 2:**
6. Build Figma MCP server (highest value)
7. Implement design token extraction

**Want me to start building any of these?**
- visual-designer skill
- design-system-architect skill
- Figma MCP server

Which would provide most immediate value for your projects?
