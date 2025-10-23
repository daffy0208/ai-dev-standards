# Visual Designer - Quick Start

**Version:** 1.0.0
**Category:** UX & Design
**Difficulty:** Intermediate

## What This Skill Does

Helps you create beautiful, consistent visual designs with professional color systems, typography, spacing, and layout principles.

## When to Use

Use this skill when you need to:
- Design UI components
- Create color palettes
- Choose and pair fonts
- Build spacing systems
- Design layouts and compositions
- Ensure visual consistency
- Create design mockups

## Quick Start

**Fastest path to great design:**

1. **Start with color (60-30-10 rule):**
   - Primary color: 60% (dominant)
   - Secondary color: 30% (supporting)
   - Accent color: 10% (CTAs, highlights)

2. **Set up typography:**
   - Choose 2 fonts max (heading + body)
   - Use type scale (1.25 ratio recommended)
   - Set line height: 1.5 for body, 1.2 for headings

3. **Use 8pt grid for spacing:**
   - Base unit: 8px
   - Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

4. **Check accessibility:**
   - Text contrast: 4.5:1 minimum
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

**Time to design:** 2-4 hours for component system

## Success Criteria

You've successfully used this skill when:
- ✅ Color palette is harmonious and accessible
- ✅ Typography is readable and hierarchical
- ✅ Spacing is consistent and follows grid
- ✅ Contrast ratios meet WCAG AA standards
- ✅ Layout is balanced and organized
- ✅ Design feels polished and professional
- ✅ Components are reusable and consistent

## Key Concepts

**60-30-10 Color Rule:**
- 60% dominant (primary) - backgrounds, large areas
- 30% secondary - supporting elements, sections
- 10% accent - CTAs, highlights, important actions

**Type Scale (1.25 Ratio):**
- Base: 16px (1rem)
- Scale up: 20px, 25px, 31px, 39px, 49px
- Scale down: 13px, 10px

**8pt Grid System:**
- All spacing is multiple of 8px
- Consistent rhythm and alignment
- Easier handoff to developers

**Visual Hierarchy:**
- Size: Bigger = more important
- Color: High contrast = more prominent
- Weight: Bold = emphasis
- Position: Top-left = first noticed

## Quick Reference

### Color System Template
```css
/* Primary (60%) */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-900: #1e3a8a;

/* Secondary (30%) */
--color-secondary-500: #8b5cf6;

/* Accent (10%) */
--color-accent-500: #f59e0b;

/* Neutrals */
--color-gray-50: #f9fafb;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
```

### Typography System
```css
/* Font Families */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;

/* Type Scale (1.25) */
--text-xs: 0.64rem;   /* 10px */
--text-sm: 0.8rem;    /* 13px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.25rem;   /* 20px */
--text-xl: 1.563rem;  /* 25px */
--text-2xl: 1.953rem; /* 31px */
--text-3xl: 2.441rem; /* 39px */

/* Line Heights */
--leading-tight: 1.2;  /* Headings */
--leading-normal: 1.5; /* Body */
--leading-relaxed: 1.75; /* Long form */
```

### Spacing Scale (8pt Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Shadow System
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Border Radius Scale
```css
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Pills/circles */
```

## Design Principles Checklist

### Contrast
- [ ] Visual hierarchy is clear
- [ ] Important elements stand out
- [ ] Text meets WCAG contrast ratios

### Alignment
- [ ] Elements align to grid
- [ ] Consistent edge alignment
- [ ] Centered elements truly centered

### Repetition
- [ ] Colors used consistently
- [ ] Spacing follows scale
- [ ] Same patterns repeated

### Proximity
- [ ] Related items grouped together
- [ ] Whitespace separates sections
- [ ] Visual relationships clear

## Tools

**Design Tools:**
- Figma (recommended, collaborative)
- Adobe XD (professional)
- Sketch (Mac only)
- Penpot (open source)

**Color Tools:**
- Coolors.co (palette generator)
- Adobe Color (color wheel)
- Contrast Checker (WCAG compliance)
- Paletton (color schemes)

**Typography Tools:**
- Google Fonts (free fonts)
- Font Pair (pairing suggestions)
- Type Scale (generator)
- Modular Scale (calculator)

**Inspiration:**
- Dribbble (showcase)
- Behance (portfolios)
- Awwwards (web design awards)
- Land-book (landing pages)

## Component Design Patterns

### Button Variants
```
Primary: High contrast, accent color
Secondary: Lower contrast, outlined
Tertiary: Minimal, text-based
Danger: Red, destructive actions
```

### Card Design
```
- 8-16px padding
- Subtle shadow (--shadow-sm)
- 8px border radius
- Hover: Lift (larger shadow)
```

### Form Inputs
```
- 40px minimum height (mobile)
- 12-16px padding
- Clear focus state
- Label above or placeholder
- Error state in red with message
```

## Common Mistakes to Avoid

❌ **Too many colors** - Stick to 3-5 colors max
❌ **Too many fonts** - Use 2 fonts max (1 is often enough)
❌ **Inconsistent spacing** - Use spacing scale
❌ **Poor contrast** - Check WCAG ratios
❌ **Centered text blocks** - Left-align long text
❌ **All caps everywhere** - Use sparingly for emphasis
❌ **Tiny click targets** - Minimum 44x44px

## Design Workflow

1. **Wireframe** (30 min) - Layout and structure
2. **Style Guide** (1 hour) - Colors, typography, spacing
3. **Component Design** (2 hours) - Buttons, inputs, cards
4. **Composition** (1 hour) - Assemble into pages
5. **Polish** (30 min) - Shadows, transitions, micro-interactions

## Version History

- **1.0.0** (2025-10-22): Initial release with comprehensive visual design system

## License

Part of ai-dev-standards repository.
