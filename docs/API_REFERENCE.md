# API Reference

## Overview

TikToker is built with a modular architecture separating API clients, workflows, utilities, and UI components.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React/Ink UI                        │
│                  (src/components/)                      │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Workflows                              │
│            (src/workflows/)                             │
│   - VideoGenerationWorkflow                            │
└─────────┬───────────────────────────────────┬──────────┘
          │                                   │
┌─────────▼──────────┐              ┌────────▼─────────┐
│    API Clients     │              │    Utilities     │
│   (src/api/)       │              │   (src/utils/)   │
│ - ElevenLabsTTS    │              │ - RetryHelper    │
│ - Veo3Client       │              │ - VideoMerger    │
│ - FluxClient       │              │ - SessionManager │
│ - TextGenerator    │              │ - ImageUploader  │
└────────────────────┘              └──────────────────┘
```

## Core Classes

### VideoGenerationWorkflow

Main orchestrator for video generation pipeline.

**Location:** `src/workflows/video-generation-workflow.ts`

#### Constructor

```typescript
constructor(useFreeModels: boolean = false)
```

**Parameters:**
- `useFreeModels` - Use free models (Seedance, Flux LoRA, Grok)

**Example:**
```typescript
const workflow = new VideoGenerationWorkflow(true); // Free mode
```

#### Methods

##### generateVideoPrompts()

```typescript
async generateVideoPrompts(
  storyText: string,
  duration: number = 60
): Promise<string[]>
```

Generates video segment prompts from story text.

**Parameters:**
- `storyText` - Story to convert to prompts
- `duration` - Target video duration in seconds

**Returns:** Array of prompts (one per video segment)

**Example:**
```typescript
const prompts = await workflow.generateVideoPrompts(
  "A detective solves a mystery in a cyberpunk city",
  30
);
// Returns: [
//   "A detective in a cyberpunk city, neon lights, rain",
//   "Close-up of detective examining clues, holographic display",
//   ...
// ]
```

##### generateVideos()

```typescript
async generateVideos(
  prompts: string[],
  duration: number = 60,
  aspectRatio: '16:9' | '9:16' = '9:16',
  referenceImagePath: string | null = null,
  stylePrompt: string = '',
  onProgress?: (current: number, total: number) => void
): Promise<string[]>
```

Generates videos from prompts with images.

**Parameters:**
- `prompts` - Array of video prompts
- `duration` - Target duration (not used, kept for compatibility)
- `aspectRatio` - Video format
- `referenceImagePath` - Optional reference image for consistency
- `stylePrompt` - Style instructions (appended to each prompt)
- `onProgress` - Progress callback

**Returns:** Array of video file paths

**Example:**
```typescript
const videoPaths = await workflow.generateVideos(
  prompts,
  30,
  '9:16',
  '/path/to/reference.png',
  'anime style, vibrant colors',
  (current, total) => console.log(`${current}/${total} complete`)
);
```

**Behavior:**
- Generates images first using Flux
- Creates videos from images using Veo3/Seedance
- Downloads and saves videos immediately
- Retries up to 3 times on failures
- Continues with successful videos if some fail

##### generateAudio()

```typescript
async generateAudio(
  text: string,
  voiceId?: string
): Promise<string>
```

Generates narration audio using ElevenLabs TTS.

**Parameters:**
- `text` - Story text to narrate
- `voiceId` - Optional ElevenLabs Voice ID

**Returns:** Path to generated audio file

**Example:**
```typescript
const audioPath = await workflow.generateAudio(
  "A detective solves a mystery...",
  "JBFqnCBsd6RMkjVDRZzb" // Josh voice
);
```

##### mergeVideos()

```typescript
async mergeVideos(videoPaths: string[]): Promise<string>
```

Concatenates video segments into one.

**Parameters:**
- `videoPaths` - Array of video file paths

**Returns:** Path to merged video file

**Example:**
```typescript
const mergedPath = await workflow.mergeVideos([
  'video_1.mp4',
  'video_2.mp4',
  'video_3.mp4'
]);
```

##### addAudioToVideo()

```typescript
async addAudioToVideo(
  videoPath: string,
  audioPath: string
): Promise<string>
```

Adds audio track to video.

**Parameters:**
- `videoPath` - Path to video file
- `audioPath` - Path to audio file

**Returns:** Path to final video with audio

**Example:**
```typescript
const finalPath = await workflow.addAudioToVideo(
  mergedVideoPath,
  audioPath
);
```

---

## API Clients

### ElevenLabsTTSClient

Text-to-speech using ElevenLabs via FAL.AI.

**Location:** `src/api/elevenlabs-client.ts`

#### Constructor

```typescript
constructor(customApiKey?: string)
```

#### Methods

##### generateSpeech()

```typescript
async generateSpeech(
  text: string,
  outputDir: string = './output'
): Promise<TextToSpeechResult>
```

**Returns:**
```typescript
interface TextToSpeechResult {
  audioPath: string;    // Path to saved MP3
  audioUrl: string;     // FAL.AI URL
  duration: number;     // Estimated duration (seconds)
}
```

##### setVoiceId()

```typescript
setVoiceId(voiceId: string): void
```

Sets the voice for TTS.

**Preset Voices:**
- `JBFqnCBsd6RMkjVDRZzb` - Josh (Deep male)
- `TUQNWEvVPBLzMBSVDPUA` - Rachel (Calm female)
- `Aa6nEBJJMKJwJkCx8VU2` - Clyde (Medium male)

---

### Veo3Client

Video generation using Veo 3.1 or Seedance.

**Location:** `src/api/fal-veo3-client.ts`

#### Constructor

```typescript
constructor(
  customApiKey?: string,
  useFreeModel: boolean = false
)
```

**Models:**
- Standard: `fal-ai/veo3.1/fast/image-to-video`
- Free: `fal-ai/bytedance/seedance/v1/lite/text-to-video`

#### Methods

##### generateVideo()

```typescript
async generateVideo(
  prompt: string,
  imageUrl: string,
  videoDuration?: '4s' | '5s' | '6s' | '8s',
  aspectRatio?: '16:9' | '9:16',
  userPrompt?: string
): Promise<Veo3Result>
```

**Returns:**
```typescript
interface Veo3Result {
  videoUrl: string;
  duration: number;
}
```

**Notes:**
- Veo3 supports: 4s, 6s, 8s
- Seedance supports: 5s, 6s, 7s, 8s
- Auto-converts 4s → 5s for Seedance

---

### FluxClient

Image generation using Flux models.

**Location:** `src/api/flux-client.ts`

#### Constructor

```typescript
constructor(
  customApiKey?: string,
  useFreeModel: boolean = false
)
```

**Models:**
- Standard: `fal-ai/flux/schnell`
- Free: `fal-ai/flux-lora`

#### Methods

##### generateImage()

```typescript
async generateImage(
  prompt: string,
  outputPath: string,
  aspectRatio: '16:9' | '9:16' = '9:16',
  referenceImageUrl?: string,
  stylePrompt?: string
): Promise<string>
```

**Parameters:**
- `prompt` - Image description
- `outputPath` - Where to save image
- `aspectRatio` - Image dimensions
- `referenceImageUrl` - Optional reference for consistency
- `stylePrompt` - Style instructions (appended to prompt)

**Returns:** FAL.AI image URL

**Image Sizes:**
- 9:16 → 720×1280
- 16:9 → 1280×720

---

### TextGeneratorClient

Text generation via OpenRouter.

**Location:** `src/api/text-generator-client.ts`

#### Constructor

```typescript
constructor(useFreeModel: boolean = false)
```

**Models:**
- Standard: `openai/chatgpt`
- Free: `x-ai/grok-4.1-fast:free`

#### Methods

##### generateStoryVariants()

```typescript
async generateStoryVariants(
  description: string,
  duration: number = 60
): Promise<TextGenerationResult[]>
```

Generates 3 story variants in parallel.

**Returns:**
```typescript
interface TextGenerationResult {
  text: string;
  variant: number; // 0, 1, or 2
}
```

##### generateVideoPrompts()

```typescript
async generateVideoPrompts(
  storyText: string,
  duration: number = 60
): Promise<string[]>
```

Converts story into video segment prompts.

**Segment Calculation:**
- 30s → 5 segments (6s each)
- 60s → 12 segments (5s each)

---

## Utilities

### RetryHelper

Automatic retry with exponential backoff.

**Location:** `src/utils/retry-helper.ts`

#### Methods

##### retry()

```typescript
static async retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>
```

**Options:**
```typescript
interface RetryOptions {
  maxAttempts?: number;          // Default: 3
  delayMs?: number;              // Default: 1000
  backoffMultiplier?: number;    // Default: 2
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}
```

**Example:**
```typescript
const result = await RetryHelper.retry(
  async () => await apiCall(),
  {
    maxAttempts: 5,
    delayMs: 2000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}: ${error.message}`);
    }
  }
);
```

##### isNonRecoverableError()

```typescript
static isNonRecoverableError(error: Error): boolean
```

Detects errors that shouldn't be retried:
- Content policy violations
- Authentication errors
- Validation errors

---

### SessionManager

Manages output folders and file paths.

**Location:** `src/utils/session-manager.ts`

#### Methods

##### getPaths()

```typescript
getPaths(): SessionPaths
```

**Returns:**
```typescript
interface SessionPaths {
  root: string;           // Session root folder
  images: string;         // Images folder
  videos: string;         // Videos folder
  audio: string;          // Audio folder
  result: string;         // Result folder
}
```

##### getImagePath()

```typescript
getImagePath(index: number): string
```

Returns path for image N: `images/image_N.png`

##### getVideoPath()

```typescript
getVideoPath(index: number): string
```

Returns path for video N: `videos/video_N.mp4`

##### saveMetadata()

```typescript
saveMetadata(data: any): void
```

Saves session metadata to `metadata.json`.

---

### VideoMerger

FFmpeg wrapper for video operations.

**Location:** `src/utils/video-merger.ts`

#### Methods

##### mergeVideos()

```typescript
async mergeVideos(
  videoPaths: string[],
  outputDir: string
): Promise<MergeResult>
```

**Returns:**
```typescript
interface MergeResult {
  outputPath: string;
  duration: number;
}
```

##### addAudioToVideo()

```typescript
async addAudioToVideo(
  videoPath: string,
  audioPath: string,
  outputDir: string
): Promise<string>
```

Returns path to final video with audio.

---

### ImageUploader

Uploads local images to FAL.AI storage.

**Location:** `src/utils/image-uploader.ts`

#### Methods

##### uploadImage()

```typescript
static async uploadImage(
  imagePath: string
): Promise<string>
```

**Parameters:**
- `imagePath` - Local file path or HTTP(S) URL

**Returns:** FAL.AI storage URL

**Example:**
```typescript
const url = await ImageUploader.uploadImage('/path/to/image.png');
// Returns: "https://fal.media/files/..."
```

---

## React Components

### App

Main application component.

**Location:** `src/components/App.tsx`

**State Machine:**
```
input → selecting-duration → selecting-aspect → selecting-variant
  → selecting-reference → customizing-style → selecting-voice
  → generating-videos → done
```

### VoiceSelector

Voice selection UI.

**Location:** `src/components/VoiceSelector.tsx`

**Props:**
```typescript
interface VoiceSelectorProps {
  onSelect: (voiceId: string) => void;
}
```

### StoryVariantSelector

Story variant selection with custom text input.

**Location:** `src/components/StoryVariantSelector.tsx`

**Props:**
```typescript
interface StoryVariantSelectorProps {
  description: string;
  duration: number;
  useFreeModels?: boolean;
  onVariantsGenerated: (variants: TextGenerationResult[]) => void;
  onSelect: (variant: TextGenerationResult) => void;
}
```

### StyleCustomization

Style selection/creation UI.

**Location:** `src/components/StyleCustomization.tsx`

**Props:**
```typescript
interface StyleCustomizationProps {
  onComplete: (stylePrompt: string) => void;
}
```

---

## Configuration Files

### .env

Environment variables for API keys and model selection.

See [Environment Guide](ENV_GUIDE.md) for details.

### styles.json

Visual style presets.

```json
[
  {
    "name": "Style Name",
    "prompt": "style instructions"
  }
]
```

See [Style Guide](STYLES_GUIDE.md) for details.

---

## Error Handling

### Retry Mechanism

All API calls wrapped in `RetryHelper.retry()` with:
- 3 retry attempts
- Exponential backoff (3s, 6s, 12s)
- Non-recoverable error detection

### Partial Success

Video generation continues even if some videos fail:

```typescript
const results = await Promise.all(videoPromises);
const successful = results.filter(r => r.success);
// Continue with successful videos
```

### Error Types

**Recoverable (retry):**
- Network timeouts
- Temporary API errors
- Rate limiting

**Non-recoverable (skip):**
- Content policy violations
- Authentication errors
- Invalid parameters

---

## Extension Points

### Adding New Models

1. Update `.env` with new model ID
2. No code changes needed (uses env variables)

### Custom Styles

Add to `styles.json`:
```json
{
  "name": "My Style",
  "prompt": "my style instructions"
}
```

### Custom Workflows

Extend `VideoGenerationWorkflow`:

```typescript
class CustomWorkflow extends VideoGenerationWorkflow {
  async generateCustom() {
    // Your custom logic
    const prompts = await this.generateVideoPrompts(...);
    const videos = await this.generateVideos(...);
    // ...
  }
}
```

---

## Best Practices

1. **Always use retry for network calls**
2. **Handle partial success gracefully**
3. **Validate inputs before API calls**
4. **Log important operations for debugging**
5. **Use session manager for file organization**
6. **Leverage parallel generation when possible**

---

## Next Steps

- [Quick Start](QUICK_START.md) - Get started quickly
- [Environment Guide](ENV_GUIDE.md) - Configure models
- [Performance Guide](PERFORMANCE.md) - Optimization tips
- [Retry Guide](RETRY_GUIDE.md) - Error handling details
