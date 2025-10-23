# Spatial Developer Skill

Expert in AR/VR, WebXR, and spatial computing for Vision Pro and web.

## Quick Start

```bash
# Activate skill
claude-code --skill spatial-developer
```

## What This Skill Does

- 🥽 Builds VR experiences (WebXR)
- 📱 Creates AR applications
- 👋 Implements hand tracking
- 🎧 Adds spatial audio
- 🌐 Develops WebXR scenes
- 🍎 Builds Vision Pro apps (visionOS)

## Common Tasks

### Build VR Scene
```
"Create a WebXR VR scene with hand tracking and controllers"
```

### AR Experience
```
"Build an AR app that places 3D objects in the real world"
```

### Vision Pro App
```
"Create a visionOS app with spatial UI and SharePlay"
```

### Spatial Audio
```
"Add positional audio to this 3D scene"
```

## Technologies

- **WebXR** - Browser AR/VR
- **React Three Fiber** - React + Three.js
- **@react-three/xr** - XR components
- **visionOS** - Apple Vision Pro
- **RealityKit** - Apple 3D framework

## Example Output

```typescript
// WebXR VR scene
<VRButton />
<Canvas>
  <XR>
    <Box position={[0, 1, -2]} />
    <Controllers />
    <Hands />
  </XR>
</Canvas>
```

## Related Skills

- `3d-visualizer` - 3D graphics
- `animation-designer` - 3D animations
- `game-developer` - Game mechanics

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive spatial computing patterns.
