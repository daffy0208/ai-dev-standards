# Audio Producer Skill

Expert in web audio, audio processing, and interactive sound design.

## Quick Start

```bash
# Activate skill
claude-code --skill audio-producer
```

## What This Skill Does

- 🎵 Builds custom audio players with controls
- 🎙️ Implements voice recording
- 📊 Creates waveform visualizations
- 🎛️ Applies audio effects (filters, reverb)
- 🎧 Implements spatial/3D audio
- 🎼 Manages playlists and episodes

## Common Tasks

### Build Audio Player

```
"Create a custom audio player with play, pause, seek, and volume controls"
```

### Add Voice Recording

```
"Implement voice recording with download functionality"
```

### Create Waveform

```
"Add a waveform visualization to this audio player"
```

### Apply Audio Effects

```
"Add low-pass and high-pass filter controls to the audio player"
```

## Technologies

- **Web Audio API** - Audio processing
- **MediaRecorder API** - Recording
- **Canvas API** - Waveform visualization
- **React** - UI components

## Example Output

```typescript
// Custom audio player with controls
<AudioPlayer
  src="/podcast.mp3"
  title="Episode 1"
  artist="Podcast Name"
/>
```

## Related Skills

- `video-producer` - Video playback
- `livestream-engineer` - Live audio
- `voice-interface-builder` - Voice features

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive audio patterns.
