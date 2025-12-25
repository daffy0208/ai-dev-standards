# Animation Designer Skill

Expert in web animations, transitions, and motion design using Framer Motion and CSS.

## Quick Start

```bash
# Activate skill
claude-code --skill animation-designer
```

## What This Skill Does

- ✨ Creates page transitions
- 🎯 Builds micro-interactions
- 📜 Implements scroll animations
- ⏳ Designs loading states
- 🎨 Adds hover effects
- 🎪 Builds complex animations (drag, gestures)

## Common Tasks

### Add Page Transition

```
"Add a smooth page transition using Framer Motion"
```

### Create Loading Animation

```
"Create a skeleton loader animation for this card component"
```

### Build Scroll Effect

```
"Add a parallax scroll effect to the hero section"
```

### Animate Modal

```
"Animate this modal to fade in with a scale effect"
```

## Technologies

- **Framer Motion** - React animations
- **CSS Animations** - Keyframes
- **Tailwind** - Utility-based animations
- **GSAP** - Advanced timeline animations

## Example Output

```typescript
// Smooth modal animation
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ type: 'spring', damping: 25 }}
>
  {children}
</motion.div>
```

## Related Skills

- `ui-designer` - Interface design
- `performance-optimizer` - Animation performance
- `accessibility-auditor` - Reduce motion

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive animation patterns.
