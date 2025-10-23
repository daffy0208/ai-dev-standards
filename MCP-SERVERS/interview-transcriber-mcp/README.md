# Interview Transcriber MCP Server

Transcribe user interviews and extract insights for product research.

## What This MCP Does

- 🎙️ **Audio Transcription** - Convert audio to text with Whisper API
- ⏱️ **Timestamps** - Word and segment-level timing
- 👥 **Speaker Identification** - Diarization and labeling
- 📝 **Summary Generation** - Brief, detailed, or bullet-point summaries
- 💡 **Insight Extraction** - Pain points, desires, behaviors, and quotes
- 📊 **Structured Output** - JSON format for analysis

## Installation

```bash
cd MCP-SERVERS/interview-transcriber-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "interview-transcriber": {
      "command": "node",
      "args": ["/path/to/interview-transcriber-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Providers

### OpenAI Whisper (Recommended)
- **Model:** `whisper-1`
- **Languages:** 99+ languages
- **Max file size:** 25 MB
- **Formats:** mp3, mp4, mpeg, mpga, m4a, wav, webm
- **Cost:** $0.006 / minute

### AssemblyAI (Future)
- Real-time transcription
- Advanced speaker diarization
- Custom vocabulary

### Deepgram (Future)
- Lowest latency
- Live streaming support

## Tools

### 1. `configure`
Set up transcription provider.

```typescript
{
  provider: 'openai' | 'assemblyai' | 'deepgram';
  apiKey: string;
  model?: string; // default: 'whisper-1'
  language?: string; // ISO-639-1, e.g., 'en'
}
```

### 2. `transcribe_audio`
Basic audio transcription.

```typescript
{
  audioPath?: string; // path to file
  audioBase64?: string; // or base64 data
  language?: string;
  prompt?: string; // context to guide transcription
}
```

### 3. `transcribe_with_timestamps`
Transcription with segment timestamps.

```typescript
{
  audioPath?: string;
  audioBase64?: string;
  language?: string;
}
```

### 4. `generate_summary`
Create summary from transcription.

```typescript
{
  transcriptionId?: string; // stored transcription
  text?: string; // or raw text
  format?: 'brief' | 'detailed' | 'bullet-points';
}
```

### 5. `extract_insights`
Extract key insights from interview.

```typescript
{
  transcriptionId?: string;
  text?: string;
  focus?: 'pain-points' | 'desires' | 'behaviors' | 'all';
}
```

Returns:
```json
{
  "insights": {
    "painPoints": ["Too slow", "Confusing UI"],
    "desires": ["Want faster loading", "Need mobile app"],
    "behaviors": ["Uses competitor", "Manual workaround"],
    "quotes": ["It takes forever to load"]
  }
}
```

### 6. `identify_speakers`
Label different speakers.

```typescript
{
  transcriptionId?: string;
  text?: string;
  speakerNames?: string[]; // e.g., ['Interviewer', 'User']
}
```

### 7. `list_transcriptions`
List all stored transcriptions.

## Usage Example

```javascript
// 1. Configure
await transcriber.configure({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  language: 'en',
});

// 2. Transcribe interview
const result = await transcriber.transcribe_with_timestamps({
  audioPath: './interviews/user-001.mp3',
});

// 3. Generate summary
const summary = await transcriber.generate_summary({
  transcriptionId: result.id,
  format: 'bullet-points',
});

// 4. Extract insights
const insights = await transcriber.extract_insights({
  transcriptionId: result.id,
  focus: 'pain-points',
});

// 5. Identify speakers
const labeled = await transcriber.identify_speakers({
  transcriptionId: result.id,
  speakerNames: ['Interviewer', 'Sarah (User)'],
});
```

## Integration with User Research

This MCP is designed for the product-strategist workflow:

```
1. Record user interview → MP3/WAV file
2. transcribe_with_timestamps → Full transcript
3. generate_summary → Quick overview
4. extract_insights → Pain points, desires, behaviors
5. Analyze patterns across multiple interviews
```

## Best Practices

### Before Transcription
- **Consent:** Get permission to record
- **Quality:** Use good microphone
- **Format:** MP3 or WAV recommended
- **Size:** Keep under 25 MB (split larger files)

### For Better Results
- **Language:** Specify if not English
- **Prompt:** Add context (product name, technical terms)
- **Names:** Provide speaker names for better labeling

### Cost Optimization
- Pre-process audio (remove silence, normalize volume)
- Use lower quality for draft transcripts
- Batch multiple short recordings
- Cache transcriptions locally

## Supported Audio Formats

- **MP3** - Most common
- **MP4** - Video files (audio extracted)
- **WAV** - Highest quality
- **M4A** - Apple audio
- **WebM** - Web audio
- **MPEG/MPGA** - Legacy formats

## Limitations

- **File size:** 25 MB max per file (Whisper API limit)
- **Duration:** Split long interviews (>1 hour) into parts
- **Languages:** Works best with English
- **Speaker diarization:** Basic implementation (use AssemblyAI for advanced)
- **Real-time:** Not supported (use Deepgram for live transcription)

## Accuracy Tips

1. **Clear audio:** Reduce background noise
2. **Single speaker:** Better accuracy than multi-speaker
3. **Specified language:** Don't rely on auto-detect
4. **Technical terms:** Use prompt to provide context
5. **Proper names:** Spell out in prompt

## Roadmap

- [ ] AssemblyAI integration (better speaker diarization)
- [ ] Deepgram integration (real-time transcription)
- [ ] Automatic silence removal
- [ ] Audio quality analysis
- [ ] Multi-file batch processing
- [ ] Export to various formats (JSON, SRT, VTT)

## Testing

```bash
npm test
```

## Related

- **Enables:** `product-strategist`, `user-researcher` skills
- **Use case:** User interviews, customer calls, usability tests
- **Output:** Feeds into `user-insight-analyzer-mcp`
