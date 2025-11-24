# Environment Configuration Guide

## .env File Structure

```env
# ============================================
# FAL.AI SETTINGS
# ============================================

FAL_API_KEY="your_fal_api_key"

# Image Generation Models
FAL_IMAGE_MODEL="fal-ai/flux/schnell"
FAL_IMAGE_MODEL_FREE="fal-ai/flux-lora"

# Video Generation Models
FAL_VIDEO_MODEL="fal-ai/veo3.1/fast/image-to-video"
FAL_VIDEO_MODEL_FREE="fal-ai/bytedance/seedance/v1/lite/text-to-video"

# ============================================
# OPENROUTER SETTINGS
# ============================================

OPENROUTER_API_KEY="your_openrouter_api_key"

# Text Generation Models
OPENROUTER_MODEL="openai/chatgpt"
OPENROUTER_MODEL_FREE="x-ai/grok-4.1-fast:free"
```

## Environment Variables

### FAL.AI Configuration

#### FAL_API_KEY
- **Required:** Yes
- **Description:** API key for FAL.AI services
- **Get it:** https://fal.ai/dashboard

#### FAL_IMAGE_MODEL
- **Required:** No
- **Default:** `fal-ai/flux/schnell`
- **Description:** Image generation model (standard mode)
- **Options:**
  - `fal-ai/flux/schnell` - Fast, good quality
  - `fal-ai/flux/dev` - Slower, better quality
  - `fal-ai/flux-pro` - Maximum quality (expensive)

#### FAL_IMAGE_MODEL_FREE
- **Required:** No
- **Default:** `fal-ai/flux-lora`
- **Description:** Image generation model (free mode)
- **Options:**
  - `fal-ai/flux-lora` - Free alternative to Flux

#### FAL_VIDEO_MODEL
- **Required:** No
- **Default:** `fal-ai/veo3.1/fast/image-to-video`
- **Description:** Video generation model (standard mode)
- **Options:**
  - `fal-ai/veo3.1/fast/image-to-video` - Fast, good quality (4s segments)
  - `fal-ai/veo3.1/image-to-video` - Slower, better quality

#### FAL_VIDEO_MODEL_FREE
- **Required:** No
- **Default:** `fal-ai/bytedance/seedance/v1/lite/text-to-video`
- **Description:** Video generation model (free mode)
- **Options:**
  - `fal-ai/bytedance/seedance/v1/lite/text-to-video` - Free alternative (5s segments)

### OpenRouter Configuration

#### OPENROUTER_API_KEY
- **Required:** Yes
- **Description:** API key for OpenRouter
- **Get it:** https://openrouter.ai/keys

#### OPENROUTER_MODEL
- **Required:** No
- **Default:** `openai/chatgpt`
- **Description:** Text generation model (standard mode)
- **Options:**
  - `openai/chatgpt` - Fast, good quality
  - `anthropic/claude-3.5-sonnet` - Best text quality
  - `google/gemini-2.0-flash` - Fast and cheap

#### OPENROUTER_MODEL_FREE
- **Required:** No
- **Default:** `x-ai/grok-4.1-fast:free`
- **Description:** Text generation model (free mode)
- **Options:**
  - `x-ai/grok-4.1-fast:free` - Completely free
  - `google/gemini-2.0-flash:free` - Also free

## Switching Between Modes

### Standard Mode
```bash
npm run dev
```
Uses: `FAL_IMAGE_MODEL`, `FAL_VIDEO_MODEL`, `OPENROUTER_MODEL`

### Free Mode
```bash
npm run dev -- --free
```
Uses: `FAL_IMAGE_MODEL_FREE`, `FAL_VIDEO_MODEL_FREE`, `OPENROUTER_MODEL_FREE`

## Cost Comparison

### Standard Mode (60-second video)

| Component | Quantity | Cost |
|-----------|----------|------|
| Text (3 variants) | 3 | $0.02 |
| Prompts | 1 | $0.01 |
| Images | 10 | $0.10 |
| Videos (4s each) | 10 | $2.00 |
| Audio | 1 | $0.05 |

**Total: ~$2.18**

### Free Mode (60-second video)

| Component | Quantity | Cost |
|-----------|----------|------|
| Text (3 variants) | 3 | $0.00 |
| Prompts | 1 | $0.00 |
| Images | 10 | $0.10 |
| Videos (5s each) | 10 | $0.30 |
| Audio | 1 | $0.05 |

**Total: ~$0.45**

**Savings: ~80%** 💰

## Configuration Examples

### Maximum Quality (Expensive)

```env
FAL_IMAGE_MODEL="fal-ai/flux-pro"
FAL_VIDEO_MODEL="fal-ai/veo3.1/image-to-video"
OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"
```

**Pros:**
- Best visual quality
- Best text quality
- Most creative output

**Cons:**
- High cost (~$3-5 per 60s video)
- Slower generation

### Balanced Quality & Price (Recommended)

```env
FAL_IMAGE_MODEL="fal-ai/flux/schnell"
FAL_VIDEO_MODEL="fal-ai/veo3.1/fast/image-to-video"
OPENROUTER_MODEL="openai/chatgpt"
```

**Pros:**
- Good quality
- Reasonable cost (~$2 per 60s video)
- Fast generation

**Cons:**
- Not the absolute best quality

### Maximum Savings

```env
FAL_IMAGE_MODEL_FREE="fal-ai/flux-lora"
FAL_VIDEO_MODEL_FREE="fal-ai/bytedance/seedance/v1/lite/text-to-video"
OPENROUTER_MODEL_FREE="x-ai/grok-4.1-fast:free"
```

**Pros:**
- Very low cost (~$0.45 per 60s video)
- Still decent quality
- Free text generation

**Cons:**
- Lower quality than premium models
- Slightly longer video segments (5s vs 4s)

## Detailed Cost Breakdown

### Image Generation

| Model | Cost per Image | Quality | Speed |
|-------|---------------|---------|-------|
| flux-pro | ~$0.05 | Excellent | Slow |
| flux/schnell | ~$0.01 | Good | Fast |
| flux-lora | ~$0.01 | Medium | Fast |

### Video Generation

| Model | Cost per 4-5s | Quality | Speed |
|-------|---------------|---------|-------|
| veo3.1/fast | ~$0.20 | Excellent | Fast |
| veo3.1 | ~$0.30 | Excellent+ | Slow |
| seedance/lite | ~$0.03 | Medium | Medium |

### Text Generation

| Model | Cost per 1K tokens | Quality | Speed |
|-------|-------------------|---------|-------|
| claude-3.5-sonnet | ~$0.015 | Excellent | Medium |
| chatgpt | ~$0.002 | Good | Fast |
| grok-4.1-fast:free | $0.000 | Good | Fast |

## Model Selection Tips

### For TikTok/Reels (9:16)
- Use **Veo3.1 Fast** or **Seedance** (both optimized for vertical)
- Flux Schnell works great for quick, dynamic images
- Short segments (4-5s) keep viewers engaged

### For YouTube (16:9)
- Use **Veo3.1** for cinematic quality
- Flux Pro if budget allows
- Longer segments (6-8s) acceptable for YouTube

### For Testing/Development
- Always use **Free Mode** when testing
- Save premium models for final production
- Test prompts with Seedance first

### For Production
- Use **Standard Mode** for client work
- Consider Veo3.1 (non-fast) for maximum quality
- Flux Pro for key hero shots

## Environment Variable Validation

The app will log active models on startup:

```
🚀 TIKTOKER - AI VIDEO GENERATOR

📋 CONFIGURATION:
   Mode: FREE
   Image: fal-ai/flux-lora
   Video: fal-ai/bytedance/seedance/v1/lite/text-to-video
   Text: x-ai/grok-4.1-fast:free
```

Verify these match your expectations before generating videos.

## API Quota Management

### FAL.AI
- Check quota: https://fal.ai/dashboard
- Parallel generation uses multiple quota
- 10 videos = 10 concurrent API calls

### OpenRouter
- Check usage: https://openrouter.ai/activity
- Free models have rate limits
- Consider paid models for high volume

## Troubleshooting

### "API key not found"
Check that `.env` file exists and contains:
```env
FAL_API_KEY="sk-..."
OPENROUTER_API_KEY="sk-..."
```

### "Insufficient quota"
- Check your API dashboard
- Add credits to your account
- Try free mode: `npm run dev -- --free`

### "Model not found"
- Verify model ID in `.env` matches FAL.AI/OpenRouter documentation
- Check for typos in model names
- Try default models first

### "Rate limit exceeded"
- Wait a few minutes
- Reduce parallel generation (modify code)
- Upgrade API plan

## Advanced Configuration

### Custom Model Endpoints

You can use any FAL.AI model by updating `.env`:

```env
# Use a custom fine-tuned Flux model
FAL_IMAGE_MODEL="fal-ai/my-custom-flux"

# Use a different video model
FAL_VIDEO_MODEL="fal-ai/some-new-video-model"
```

### Multiple Environment Files

Create separate `.env` files for different scenarios:

```bash
# Development
cp .env .env.dev

# Production
cp .env .env.prod

# Testing
cp .env .env.test
```

Load specific env:
```bash
cp .env.prod .env
npm run dev
```

## Best Practices

1. **Start with Free Mode** - Test prompts before using premium models
2. **Monitor Costs** - Check API dashboards regularly
3. **Use Appropriate Models** - Don't use Flux Pro if Schnell suffices
4. **Test Incrementally** - Generate short videos first (6-12s)
5. **Keep API Keys Secret** - Never commit `.env` to Git

## Security

### Protect Your API Keys

- **Never** share `.env` file
- **Never** commit `.env` to version control
- **Never** paste API keys in public forums
- Use `.env.example` template for sharing

### Rotate Keys

If you suspect a key leak:
1. Revoke old key immediately
2. Generate new key
3. Update `.env` file
4. Test with new key

## Next Steps

- [Quick Start](QUICK_START.md) - Start generating videos
- [Style Guide](STYLES_GUIDE.md) - Customize visual style
- [Performance Guide](PERFORMANCE.md) - Optimize generation speed
