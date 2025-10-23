# Livestream Engineer Skill

Expert in live streaming, WebRTC, and real-time video/audio.

## Quick Start

```bash
# Activate skill
claude-code --skill livestream-engineer
```

## What This Skill Does

- 🎥 Implements WebRTC peer-to-peer video
- 📹 Builds video call features
- 🖥️ Adds screen sharing
- 💬 Integrates real-time chat
- 👥 Creates multi-party video conferences
- 🔴 Builds broadcasting tools

## Common Tasks

### Video Call
```
"Create a WebRTC peer-to-peer video call component"
```

### Screen Sharing
```
"Add screen sharing functionality with start/stop controls"
```

### Live Streaming
```
"Build a live streaming platform with chat"
```

### Video Conference
```
"Create a multi-party video conference (up to 4 participants)"
```

## Technologies

- **WebRTC** - Real-time communication
- **Socket.io** - Real-time messaging
- **MediaStream API** - Camera/screen access
- **React** - UI components

## Example Output

```typescript
// WebRTC video call
const connection = new WebRTCConnection()
await connection.startLocalStream()
```

## Related Skills

- `video-producer` - Video playback
- `audio-producer` - Audio features
- `chat-builder` - Real-time messaging

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive streaming patterns.
