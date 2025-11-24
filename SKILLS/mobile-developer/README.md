# Mobile Developer Skill

Expert in React Native, Expo, and cross-platform mobile development.

## Quick Start

```bash
# Activate skill
claude-code --skill mobile-developer
```

## What This Skill Does

- 📱 Builds React Native / Expo apps (iOS + Android)
- 🧭 Implements navigation with Expo Router
- 📸 Integrates native features (camera, location, notifications)
- ⚡ Optimizes performance (lazy loading, image optimization)
- 🚀 Handles app store submission
- 💾 Implements state management

## Common Tasks

### Create New App

```
"Create a new Expo app with tab navigation and authentication"
```

### Add Native Features

```
"Add camera integration with permission handling"
```

### Implement Navigation

```
"Set up tab navigation with Home, Profile, and Settings tabs"
```

### Optimize Performance

```
"Optimize this list for 10,000 items using FlashList"
```

## Technologies

- **Expo** - React Native framework
- **Expo Router** - File-based routing
- **Zustand** - State management
- **FlashList** - Performant lists
- **Expo Image** - Optimized images
- **EAS** - Build and deploy

## Example Output

```typescript
// Tab navigation with native features
export default function App() {
  return (
    <Tabs>
      <Tab name="home" icon="home" />
      <Tab name="camera" icon="camera" />
      <Tab name="profile" icon="person" />
    </Tabs>
  )
}
```

## Related Skills

- `ui-designer` - Mobile UI design
- `api-integrator` - Backend integration
- `performance-optimizer` - App optimization

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive React Native patterns.
