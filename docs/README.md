# TikToker — automate creation of viral videos

Pipeline 

## Quick Navigation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Install and generate your first video in minutes
- **[Environment Guide](ENV_GUIDE.md)** - Configure API keys and model selection

### Customization
- **[Style Guide](STYLES_GUIDE.md)** - Create and use visual styles
- **Voice Selection** - Choose from 3 preset voices or use custom Voice ID

### Advanced Topics
- **[Performance Guide](PERFORMANCE.md)** - Understand optimization and parallel generation
- **[Retry Guide](RETRY_GUIDE.md)** - Error handling and retry mechanism
- **[API Reference](API_REFERENCE.md)** - Complete API documentation

## Documentation Structure

```
docs/
├── README.md              # This file
├── QUICK_START.md         # Getting started guide
├── ENV_GUIDE.md           # Environment configuration
├── STYLES_GUIDE.md        # Visual style customization
├── PERFORMANCE.md         # Performance optimization
├── RETRY_GUIDE.md         # Error handling
└── API_REFERENCE.md       # Complete API reference
```

## Feature Overview

### Core Features
- ✅ Automated video generation from text descriptions
- ✅ 3 AI-generated story variants to choose from
- ✅ Custom text input for full control
- ✅ Multiple aspect ratios (9:16 for TikTok, 16:9 for YouTube)
- ✅ 20+ visual style presets
- ✅ 3 preset voices + custom Voice ID support
- ✅ Reference image support for consistent style
- ✅ Parallel generation (5-10x faster)
- ✅ Automatic retry on errors
- ✅ Partial success support

### Modes
- **Standard Mode** - Premium models, best quality (~$2.18 per 60s video)
- **Free Mode** - Free/cheap models, good quality (~$0.45 per 60s video)

## Common Tasks

### Generate a Video
```bash
npm run dev
# Follow the interactive prompts
```

### Use Free Mode
```bash
npm run dev -- --free
```

### Configure API Keys
Edit `.env` file:
```env
FAL_API_KEY="your_fal_key"
OPENROUTER_API_KEY="your_openrouter_key"
```

See [Environment Guide](ENV_GUIDE.md) for details.

### Customize Styles
Edit `styles.json` or use in-app style creation.

See [Style Guide](STYLES_GUIDE.md) for details.

### Troubleshoot Errors
Check [Retry Guide](RETRY_GUIDE.md) for error handling details.

## Workflow Diagram

```
┌─────────────────┐
│ Enter Description│
└────────┬────────┘
         │
┌────────▼────────┐
│ Select Duration │
│  (6-60 seconds) │
└────────┬────────┘
         │
┌────────▼────────┐
│Choose Aspect Ratio│
│   (9:16 / 16:9) │
└────────┬────────┘
         │
┌────────▼────────┐
│Generate Variants│
│   (3 options)   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Select Variant  │
│ or Custom Text  │
└────────┬────────┘
         │
┌────────▼────────┐
│Reference Image  │
│   (optional)    │
└────────┬────────┘
         │
┌────────▼────────┐
│ Customize Style │
│ (20+ presets)   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Select Voice    │
│ (3 + custom)    │
└────────┬────────┘
         │
┌────────▼────────┐
│  Generate Video │
│   (3-6 minutes) │
└────────┬────────┘
         │
┌────────▼────────┐
│   Final Video   │
│    Ready! 🎉    │
└─────────────────┘
```

## API Clients

TikToker uses multiple AI services:

| Service | Purpose | Standard Model | Free Model |
|---------|---------|----------------|------------|
| FAL.AI Veo3 | Video Generation | veo3.1/fast | seedance/lite |
| FAL.AI Flux | Image Generation | flux/schnell | flux-lora |
| OpenRouter | Text Generation | chatgpt | grok-4.1-fast:free |
| ElevenLabs | Text-to-Speech | via FAL.AI | via FAL.AI |

See [API Reference](API_REFERENCE.md) for implementation details.

## Performance Metrics

### Generation Time (60-second video)

| Phase | Time | Parallel |
|-------|------|----------|
| Text Generation | 10-20s | ✅ 3 variants |
| Prompt Generation | 5-10s | ❌ Sequential |
| Video Generation | 2-5 min | ✅ All videos |
| Audio Generation | 30-60s | ✅ With videos |
| Merging | 30-60s | ❌ Sequential |

**Total: 3-6 minutes**

### Cost (60-second video)

| Mode | Cost | Quality |
|------|------|---------|
| Standard | ~$2.18 | High |
| Free | ~$0.45 | Medium |

**Savings: 80% in free mode**

## Architecture

```
src/
├── api/                    # API clients
│   ├── elevenlabs-client.ts
│   ├── fal-veo3-client.ts
│   ├── flux-client.ts
│   └── text-generator-client.ts
├── components/             # React/Ink UI
│   ├── App.tsx
│   ├── VoiceSelector.tsx
│   └── StoryVariantSelector.tsx
├── utils/                  # Utilities
│   ├── retry-helper.ts
│   ├── session-manager.ts
│   └── video-merger.ts
└── workflows/              # Orchestration
    └── video-generation-workflow.ts
```

See [API Reference](API_REFERENCE.md) for class documentation.

## Error Handling

TikToker includes robust error handling:

### Automatic Retry
- Up to 3 attempts per API call
- Exponential backoff (3s, 6s, 12s)
- Detailed logging

### Non-Recoverable Errors
- Content policy violations (skips retry)
- Authentication errors (skips retry)
- Invalid parameters (skips retry)

### Partial Success
- Continues with successful videos if some fail
- Shows detailed failure report
- Creates video from available segments

See [Retry Guide](RETRY_GUIDE.md) for details.

## Requirements

### System
- Node.js 18+
- FFmpeg
- 4GB+ RAM
- Stable internet connection

### APIs
- FAL.AI API key (required)
- OpenRouter API key (required)

### Optional
- ElevenLabs Voice IDs (for custom voices)
- Reference images (for consistent style)

## Support

### Documentation
- Read through guides in this directory
- Check [CHANGELOG.md](../CHANGELOG.md) for recent changes
- Review [API Reference](API_REFERENCE.md) for technical details

### Issues
- Report bugs on GitHub (if repository available)
- Check existing documentation first
- Include logs and error messages

### Community
- Share your generated videos!
- Contribute custom styles
- Suggest new features

## Next Steps

1. **New Users:** Start with [Quick Start Guide](QUICK_START.md)
2. **Configuration:** Read [Environment Guide](ENV_GUIDE.md)
3. **Customization:** Explore [Style Guide](STYLES_GUIDE.md)
4. **Optimization:** Review [Performance Guide](PERFORMANCE.md)
5. **Development:** Check [API Reference](API_REFERENCE.md)

## Contributing

Contributions welcome! Areas for improvement:

- Additional style presets
- New voice options
- Performance optimizations
- Bug fixes
- Documentation improvements

## License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Happy video generating! 🎬**
