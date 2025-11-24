# Performance Optimization Guide

## Overview

TikToker has been heavily optimized for parallel generation, achieving **5-10x speedup** compared to sequential processing.

## Performance Evolution

### v1.3.1 - Sequential Generation

```
Video 1: 2-5 min
Video 2: 2-5 min
Video 3: 2-5 min
...
Video 10: 2-5 min
Audio: 30-60 sec

Total: 25-60 minutes
```

### v1.5.1 - Parallel Generation (Current)

```
3 Text Variants: 10-20 sec (parallel!)
Prompts: 5-10 sec
All 10 Videos + Audio: 2-5 min (parallel!)
  ↳ Each video saved immediately after generation
Merging: 30-60 sec

Total: 3-6 minutes
```

## Speedup: 5-10x ⚡

## How It Works

### 1. Parallel Video Generation & Saving

```typescript
const videoPromises = prompts.map(async (prompt, i) => {
  // Generate image
  const imageUrl = await generateImage(prompt);

  // Generate video from image
  const video = await generateVideo(imageUrl);

  // Immediately save video after generation
  const videoPath = await downloadVideo(video.url, path);

  return videoPath;
});

// Wait for all videos to complete in parallel
const videoPaths = await Promise.all(videoPromises);
```

**Key:** All videos generate **simultaneously**, not one after another.

### 2. Parallel Audio Generation

```typescript
const [videos, audio] = await Promise.all([
  generateAllVideos(prompts),
  generateAudio(text)
]);
```

**Key:** Audio generates **while videos are being created**.

### 3. Parallel Text Variant Generation

```typescript
const variantPromises = [0, 1, 2].map(async (i) => {
  const response = await generateStoryVariant(description, i);
  return response;
});

const variants = await Promise.all(variantPromises);
```

**Key:** All 3 story variants generate **simultaneously** (saves 2/3 of time).

### 4. Real-Time Progress Tracking

The app displays detailed timing for all stages:

```
✅ Variant 1 generated (232 chars) - 8.2s
✅ Variant 2 generated (195 chars) - 8.5s
✅ Variant 3 generated (218 chars) - 8.7s
⏱️  Total time: 8.7s

✅ Generated prompts: 10 - 12.3s

✅ Completed 3/10 videos - 145.2s
✅ Completed 7/10 videos - 156.8s
✅ All 10 videos generated and saved! - 182.5s

⏱️  Audio generation time: 15.2s
⏱️  Video merging time: 8.3s
⏱️  Audio addition time: 12.1s

⏱️  Total execution time: 218.1s (3.6 min)
```

Benefits:
- See real-time progress
- Identify bottlenecks
- Estimate remaining time

## Performance Benchmarks

### By Video Duration

| Duration | Videos | Sequential | Parallel | Speedup |
|----------|--------|-----------|----------|---------|
| 6 sec    | 1      | 2-5 min   | 2-5 min  | 1x      |
| 12 sec   | 2      | 4-10 min  | 2-5 min  | 2x      |
| 30 sec   | 5      | 10-25 min | 3-6 min  | 3-4x    |
| 45 sec   | 8      | 16-40 min | 4-7 min  | 4-5x    |
| 60 sec   | 10     | 20-50 min | 5-10 min | 4-5x    |

### By Mode

| Mode | Image Gen | Video Gen | Total (60s) |
|------|-----------|-----------|-------------|
| Standard (Veo3.1 Fast) | ~30s | ~2-4 min | ~3-5 min |
| Free (Seedance Lite) | ~30s | ~3-6 min | ~4-7 min |

**Note:** Times are for parallel generation with stable internet.

## Optimization Techniques

### 1. Immediate Video Saving (v1.4.2)

**Before:**
```typescript
// Generate all videos first
const videos = await Promise.all(videoPromises);

// Then download separately
for (const video of videos) {
  await downloadVideo(video.url);
}
```

**After:**
```typescript
const videoPromises = prompts.map(async (prompt, i) => {
  const video = await generateVideo(...);

  // Download immediately after generation
  await downloadVideo(video.url, path);

  return path;
});
```

**Benefits:**
- Videos saved as soon as ready (no waiting for all to complete)
- More resilient to errors (partial progress saved)
- Saves ~1-2 minutes

### 2. Segment Duration Optimization (v1.5.1)

**Before:** 6-second segments
**After:** 4-5 second segments

**Impact:**
- 30s video: 5 segments (was 5) - Same
- 60s video: 12 segments (was 10) - Slightly more, but faster pacing

**Benefits:**
- More dynamic content
- Better engagement for short-form video
- Minimal time increase due to parallel generation

### 3. Partial Success Support (v1.5.1)

**Before:**
```typescript
// If one video fails, entire generation fails
const videos = await Promise.all(videoPromises);
```

**After:**
```typescript
const videoPromises = prompts.map(async (prompt, i) => {
  try {
    return await generateVideo(...);
  } catch (error) {
    console.error(`Video ${i} failed: ${error}`);
    return { success: false, error };
  }
});

const results = await Promise.all(videoPromises);
const successfulVideos = results.filter(r => r.success);
```

**Benefits:**
- Continue with successful videos if some fail
- No wasted generation time
- More reliable pipeline

### 4. Smart Retry with Backoff (v1.4.1)

```typescript
await RetryHelper.retry(
  async () => generateVideo(prompt),
  {
    maxAttempts: 3,
    delayMs: 3000,
    backoffMultiplier: 2,
    // Delays: 3s, 6s, 12s
  }
);
```

**Benefits:**
- Automatically retry failed API calls
- Exponential backoff prevents API overload
- Most temporary errors resolved without user intervention

## API Efficiency

### Concurrent Requests

FAL.AI handles requests asynchronously:

```
Request 1 → FAL Queue → Processing
Request 2 → FAL Queue → Processing
Request 3 → FAL Queue → Processing
...
Request 10 → FAL Queue → Processing
```

All requests process **simultaneously** on FAL's servers.

**No additional load:** Parallel requests don't slow down individual generation.

### Rate Limits

Most APIs support concurrent requests:

- **FAL.AI:** No explicit concurrent limit (queue-based)
- **OpenRouter:** Varies by model (usually 100+ req/min)
- **ElevenLabs:** ~20 concurrent requests

TikToker's parallel generation fits within these limits.

## Performance Tuning

### Reduce Video Count (Faster)

Edit `src/api/text-generator-client.ts`:

```typescript
// Fewer segments = faster generation
private calculateSegmentCount(duration: number): number {
  if (duration <= 12) return 2; // Was 2
  if (duration <= 30) return 3; // Was 5
  if (duration <= 45) return 5; // Was 8
  return 7; // Was 12
}
```

**Trade-off:** Fewer segments may reduce visual variety.

### Increase Retry Attempts (More Resilient)

Edit `src/workflows/video-generation-workflow.ts`:

```typescript
RetryHelper.retry(
  async () => { ... },
  {
    maxAttempts: 5, // Was 3
    delayMs: 2000,  // Shorter initial delay
    backoffMultiplier: 1.5, // Gentler backoff
  }
);
```

**Trade-off:** Slower on persistent errors, but higher success rate.

### Disable Parallel Generation (Debug Only)

For debugging, you can force sequential generation:

```typescript
// In video-generation-workflow.ts
const videoPaths: string[] = [];
for (const prompt of prompts) {
  const video = await generateVideo(prompt);
  videoPaths.push(video);
}
```

**Use only for debugging:** Much slower, but easier to trace errors.

## Monitoring Performance

### Log Analysis

Look for patterns in timing logs:

```
✅ Video 1 complete - 142s
✅ Video 2 complete - 145s
✅ Video 3 complete - 148s
✅ Video 4 complete - 238s  ⚠️ Outlier
✅ Video 5 complete - 151s
```

**Outliers indicate:**
- Network issues
- API slowdowns
- Particular prompts taking longer

### Bottleneck Identification

Check stage timings:

```
Text generation: 10s   ✅ Fast
Prompt generation: 8s  ✅ Fast
Video generation: 180s ⚠️ Bottleneck
Audio generation: 15s  ✅ Fast
Merging: 12s          ✅ Fast
```

**Bottleneck:** Video generation takes longest (expected).

**Cannot optimize further:** FAL.AI generation speed is fixed.

## System Requirements

### Minimum

- **CPU:** 2+ cores
- **RAM:** 4GB
- **Network:** 10 Mbps download, 5 Mbps upload
- **Storage:** 500MB free per session

### Recommended

- **CPU:** 4+ cores (better for FFmpeg merging)
- **RAM:** 8GB+ (comfortable multitasking)
- **Network:** 50+ Mbps download, 10+ Mbps upload
- **Storage:** 2GB+ free (multiple sessions)

### Network Impact

| Stage | Download | Upload | Duration |
|-------|----------|--------|----------|
| Text Gen | ~10KB | ~5KB | 10s |
| Image Gen | ~500KB/img | ~10KB | 30s total |
| Video Gen | ~5MB/video | ~500KB | 3 min total |
| Audio Gen | ~2MB | ~50KB | 30s |

**Total Bandwidth (60s video):**
- Download: ~60MB
- Upload: ~10MB

**Recommendation:** Stable connection more important than raw speed.

## Best Practices

### 1. Use Free Mode for Testing

```bash
npm run dev -- --free
```

Test prompts/styles without burning through quota.

### 2. Start with Short Videos

Generate 6-12 second videos first:
- Faster iteration
- Lower cost
- Easier to refine prompts

### 3. Monitor API Quotas

Check dashboards before large batches:
- [FAL.AI Dashboard](https://fal.ai/dashboard)
- [OpenRouter Activity](https://openrouter.ai/activity)

### 4. Stable Internet Connection

Use wired connection if possible:
- More stable than WiFi
- Reduces timeout errors
- Better for large uploads/downloads

### 5. Close Unnecessary Apps

Free up system resources:
- Better FFmpeg performance
- Smoother progress monitoring
- Reduced memory pressure

## Troubleshooting Slow Performance

### Videos Taking Too Long

**Possible causes:**
1. Slow internet connection
2. FAL.AI API congestion
3. Complex prompts requiring more processing

**Solutions:**
- Check internet speed: [speedtest.net](https://www.speedtest.net/)
- Try simpler prompts
- Use free mode (Seedance may be faster sometimes)
- Generate during off-peak hours

### Some Videos Fast, Others Slow

**Cause:** Certain prompts take longer to generate

**Solutions:**
- Review slow prompts for complexity
- Simplify or rewrite problematic prompts
- Use retry mechanism (automatic)

### Frequent Timeouts

**Cause:** Network instability or API issues

**Solutions:**
1. Check internet connection stability
2. Increase retry attempts (see Performance Tuning)
3. Switch to wired connection
4. Contact FAL.AI support if persistent

### High Memory Usage

**Cause:** Many concurrent operations

**Normal:** Up to 2-3GB RAM usage during generation

**If excessive (>4GB):**
1. Close other applications
2. Restart app between sessions
3. Check for memory leaks (report if found)

## Future Optimizations

Potential improvements being considered:

- **Streaming downloads:** Start downloading while video generates
- **Predictive caching:** Cache common styles/reference images
- **Batch API calls:** Multiple prompts per request (if API supports)
- **GPU acceleration:** Local image processing (if beneficial)

## Comparison with Other Tools

| Feature | TikToker | Manual Creation | Other AI Tools |
|---------|----------|-----------------|----------------|
| Time (60s video) | 3-6 min | 2-4 hours | 10-30 min |
| Automation | Full | Manual | Partial |
| Parallel Gen | Yes | N/A | Varies |
| Retry Logic | Yes | Manual | Rarely |
| Cost (60s) | $0.45-$2.18 | Free | $5-20 |

**TikToker advantage:** Best automation + speed + cost balance.

## Next Steps

- [Quick Start](QUICK_START.md) - Generate your first video
- [Environment Guide](ENV_GUIDE.md) - Optimize model selection
- [API Reference](API_REFERENCE.md) - Deep dive into internals
