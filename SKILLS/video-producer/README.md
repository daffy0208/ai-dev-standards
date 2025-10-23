# Video Producer Skill

Expert in video playback, streaming, and video player customization.

## Quick Start

```bash
# Activate skill
claude-code --skill video-producer
```

## What This Skill Does

- 🎥 Builds custom video players with controls
- 📺 Implements HLS/adaptive streaming
- 📝 Adds subtitles and captions
- ⚙️ Supports quality selection
- ⏩ Implements playback speed control
- 🖼️ Adds picture-in-picture mode

## Common Tasks

### Build Video Player
```
"Create a custom video player with play, pause, seek, and fullscreen controls"
```

### Add HLS Streaming
```
"Implement adaptive bitrate streaming using HLS.js"
```

### Add Subtitles
```
"Add multi-language subtitle support to this video player"
```

### Quality Selector
```
"Add quality selection (1080p, 720p, 480p) to the video player"
```

## Technologies

- **HTML5 Video** - Native video playback
- **HLS.js** - Adaptive streaming
- **WebVTT** - Subtitles format
- **React** - UI components

## Example Output

```typescript
// Custom video player with streaming
<HLSPlayer src="/video.m3u8" />
<VideoWithSubtitles src="/video.mp4" />
```

## Related Skills

- `audio-producer` - Audio playback
- `livestream-engineer` - Live streaming
- `animation-designer` - Video UI animations

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive video patterns.
