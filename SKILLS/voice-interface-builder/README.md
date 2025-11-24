# Voice Interface Builder Skill

Expert in building voice interfaces, speech recognition, and text-to-speech systems.

## Quick Start

```bash
# Activate skill
claude-code --skill voice-interface-builder
```

## What This Skill Does

- 🎤 Implements speech recognition (Web Speech API)
- 🔊 Adds text-to-speech capabilities
- 🗣️ Builds voice command systems
- 🔍 Creates voice search
- 🌍 Supports multilingual voices
- ♿ Enhances accessibility with voice features

## Common Tasks

### Add Speech Recognition

```
"Add voice input to this search field using the Web Speech API"
```

### Implement Text-to-Speech

```
"Add a 'read aloud' button that speaks the article content"
```

### Create Voice Commands

```
"Implement voice navigation commands like 'go home' and 'open menu'"
```

### Build Voice Search

```
"Create a voice-enabled search component with visual feedback"
```

## Technologies

- **Web Speech API** - Browser speech recognition/synthesis
- **React** - UI components
- **TypeScript** - Type safety
- **Custom Hooks** - Reusable voice logic

## Example Output

```typescript
// Voice-enabled search
const { isListening, transcript, start } = useSpeechRecognition()

<button onClick={start}>
  {isListening ? '🔴 Listening...' : '🎤 Speak'}
</button>
```

## Related Skills

- `accessibility-auditor` - Accessible voice UI
- `ui-designer` - Voice interaction design
- `mobile-developer` - Mobile voice features

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive voice interface patterns.
