# Accessibility Engineer - Quick Start

**Version:** 1.0.0
**Category:** UX & Design
**Difficulty:** Intermediate

## What This Skill Does

Helps you build accessible applications that work for everyone, including users with disabilities. Ensures WCAG 2.1 AA compliance.

## When to Use

Use this skill when you need to:
- Build accessible UIs
- Conduct accessibility audits
- Fix WCAG violations
- Test with screen readers
- Implement keyboard navigation
- Ensure proper color contrast
- Add ARIA attributes correctly

## Quick Start

**Fastest path to accessible app:**

1. **Use semantic HTML** - button, nav, main, header
2. **Ensure keyboard access** - Tab through everything
3. **Add labels** - All inputs need labels
4. **Check contrast** - 4.5:1 for text, 3:1 for UI
5. **Test with tools** - Lighthouse, axe DevTools
6. **Screen reader test** - NVDA (Windows) or VoiceOver (Mac)

**Time to audit:** 1-2 hours for small app

## Success Criteria

You've successfully used this skill when:
- ✅ WCAG 2.1 AA compliant
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader announces content correctly
- ✅ Color contrast meets requirements
- ✅ All images have alt text
- ✅ Forms have proper labels and error messages
- ✅ Automated tests pass (axe, Lighthouse)

## Key Concepts

**WCAG Levels:**
- A: Minimum (legal requirement)
- AA: Industry standard (aim for this)
- AAA: Gold standard (difficult)

**Four Principles (POUR):**
- **Perceivable:** Content can be seen/heard
- **Operable:** Can be used with keyboard
- **Understandable:** Clear and predictable
- **Robust:** Works with assistive technology

**Common Issues:**
- Missing alt text
- Poor color contrast
- No keyboard access
- Missing form labels
- Incorrect ARIA

## Quick Reference

### Semantic HTML
```jsx
// ✅ Use proper elements
<button>Click</button>
<nav>Menu</nav>
<main>Content</main>

// ❌ Don't use divs
<div onclick="...">Click</div>
```

### Keyboard Navigation
```jsx
// All interactive elements need keyboard access
- Tab: Navigate forward
- Shift+Tab: Navigate backward
- Enter/Space: Activate buttons
- Esc: Close modals
```

### ARIA Basics
```jsx
// Only use ARIA when semantic HTML isn't enough
aria-label // Accessible name
aria-labelledby // References another element
aria-describedby // Additional description
aria-live // Announce dynamic changes
aria-hidden // Hide from screen readers
```

### Testing Tools
- Lighthouse (Chrome DevTools)
- axe DevTools (browser extension)
- WAVE (online tool)
- NVDA (Windows screen reader)
- VoiceOver (Mac screen reader)

## Version History

- **1.0.0** (2025-10-22): Initial release, WCAG 2.1 AA coverage

## License

Part of ai-dev-standards repository.
