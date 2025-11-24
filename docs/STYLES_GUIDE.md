# Style Customization Guide

## Overview

TikToker supports visual style customization through the `styles.json` file. Styles are prompt modifiers that add artistic direction to your generated images and videos.

## styles.json Format

```json
[
  {
    "name": "Style Name",
    "prompt": "style instructions for generation"
  }
]
```

## Built-in Styles (20 Presets)

### 1. Photorealistic Cinematic
```
photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k
```
Best for: Documentary-style content, realistic narratives

### 2. Anime Style
```
anime style, vibrant colors, Studio Ghibli aesthetic, cel shaded, detailed illustration
```
Best for: Animated stories, fantasy content

### 3. Cyberpunk
```
cyberpunk aesthetic, neon lights, futuristic cityscape, dark atmosphere, high contrast
```
Best for: Sci-fi, tech content, futuristic themes

### 4. Oil Painting
```
oil painting, impressionist style, soft brushstrokes, artistic, painterly effect
```
Best for: Artistic narratives, classic literature adaptations

### 5. Minimalist
```
minimalist, clean lines, pastel colors, simple composition, modern aesthetic
```
Best for: Educational content, clean product showcases

### 6. Watercolor
```
watercolor painting, soft edges, pastel colors, artistic, dreamy atmosphere
```
Best for: Children's stories, soft narratives

### 7. Film Noir
```
film noir, black and white, dramatic shadows, high contrast, 1940s aesthetic
```
Best for: Mystery, detective stories, dramatic content

### 8. Fantasy Art
```
fantasy art, magical atmosphere, ethereal lighting, mystical, enchanted
```
Best for: Fantasy stories, magical themes

### 9. Pixel Art
```
pixel art, 8-bit style, retro gaming aesthetic, vibrant colors, nostalgic
```
Best for: Gaming content, retro themes

### 10. 3D Render
```
3D render, modern CGI, clean surfaces, professional lighting, high detail
```
Best for: Product showcases, tech demos

### 11-20. Additional Styles
- Vintage Photography
- Sketch/Line Art
- Pop Art
- Surrealism
- Comic Book
- Steampunk
- Gothic
- Vaporwave
- Grunge
- Pastel Aesthetic

## How Styles Work

### During Generation

1. App loads styles from `styles.json`
2. User selects a style via arrow keys (↑↓)
3. Style instructions are appended to **every** image prompt

Example:
```
Original prompt: "A detective standing in a rainy street"
With Cyberpunk style: "A detective standing in a rainy street, cyberpunk aesthetic, neon lights, futuristic cityscape, dark atmosphere, high contrast"
```

### Style Application

Styles affect:
- ✅ Image generation (Flux)
- ✅ Video generation (Veo3/Seedance uses images as input)
- ❌ Text generation (not affected)
- ❌ Audio generation (not affected)

## Creating Custom Styles

### Method 1: In-App Creation

1. Run the app: `npm run dev`
2. When prompted, select **"Create custom style"**
3. Enter your style instructions
4. (Optional) Enter a name to save the style
5. Style is automatically added to `styles.json`

### Method 2: Manual Editing

Edit `styles.json` directly:

```json
[
  {
    "name": "My Awesome Style",
    "prompt": "fantasy art, magical atmosphere, ethereal lighting, mystical glow"
  },
  {
    "name": "Photorealistic Cinematic",
    "prompt": "photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k"
  }
]
```

**Note:** Custom styles are added at the **beginning** of the list.

## Style Writing Tips

### Do Include

✅ **Artistic Style**
```
photorealistic, anime, watercolor, oil painting, 3D render
```

✅ **Lighting**
```
dramatic lighting, soft light, neon glow, golden hour, studio lighting
```

✅ **Color Palette**
```
vibrant colors, pastel tones, monochrome, high contrast, muted colors
```

✅ **Atmosphere/Mood**
```
moody, cheerful, mysterious, ethereal, dramatic, peaceful
```

✅ **Technical Details**
```
4k, high quality, detailed, sharp focus, professional
```

### Don't Include

❌ **Specific Objects**
```
"a car, a building, a person" - These come from the story text
```

❌ **Conflicting Instructions**
```
"photorealistic anime" - Contradictory styles
"dark bright lighting" - Contradictory attributes
```

❌ **Overly Specific Details**
```
"exactly 3 trees in the background" - Too restrictive
```

## Good Style Examples

### Vintage Photography
```json
{
  "name": "Vintage 1970s",
  "prompt": "vintage photography, sepia tones, grainy texture, 1970s aesthetic, film grain, nostalgic"
}
```

### Sci-Fi Neon
```json
{
  "name": "Sci-Fi Neon",
  "prompt": "sci-fi, futuristic, neon colors, high tech, digital art, glowing elements"
}
```

### Dark Fantasy
```json
{
  "name": "Dark Fantasy",
  "prompt": "dark fantasy, dramatic shadows, gothic atmosphere, mysterious, moody lighting"
}
```

### Children's Book
```json
{
  "name": "Children's Book",
  "prompt": "children's book illustration, colorful, whimsical, friendly, soft colors, charming"
}
```

## Style Management

### Limits

- **Maximum:** 20 styles in `styles.json`
- **Auto-cleanup:** Oldest styles removed when limit exceeded
- **Priority:** Custom styles added at the top

### Organizing Styles

Recommended structure:

```json
[
  // Your custom styles (most recent first)
  { "name": "My Style 1", "prompt": "..." },
  { "name": "My Style 2", "prompt": "..." },

  // Built-in presets
  { "name": "Photorealistic Cinematic", "prompt": "..." },
  { "name": "Anime Style", "prompt": "..." }
]
```

## Reference Images + Styles

You can combine reference images with styles:

1. **Reference Image** - Defines characters, objects, overall composition
2. **Style Prompt** - Adds artistic direction, lighting, atmosphere

Example:
- Reference: Photo of a character
- Style: "anime style, vibrant colors"
- Result: Character rendered in anime style

This combination ensures:
- Consistent character appearance (from reference)
- Desired artistic style (from style prompt)

## Testing Styles

### Quick Test Method

1. Use **free mode** to save costs: `npm run dev -- --free`
2. Generate **6-second video** (minimal segments)
3. Compare different styles
4. Refine your custom style
5. Save the best version

### A/B Testing

Create multiple style variants:

```json
[
  { "name": "Cyberpunk v1", "prompt": "cyberpunk, neon, dark" },
  { "name": "Cyberpunk v2", "prompt": "cyberpunk aesthetic, neon lights, high contrast" },
  { "name": "Cyberpunk v3", "prompt": "cyberpunk, neon glow, futuristic, moody" }
]
```

Generate with each, compare results, keep the best.

## Style Categories

### Realistic
- Photorealistic Cinematic
- Vintage Photography
- Film Noir

### Illustrated
- Anime Style
- Comic Book
- Children's Book

### Artistic
- Oil Painting
- Watercolor
- Sketch/Line Art

### Modern/Digital
- 3D Render
- Cyberpunk
- Vaporwave

### Fantasy/Surreal
- Fantasy Art
- Surrealism
- Dark Fantasy

## Advanced Techniques

### Layered Styles

Combine multiple style elements:

```json
{
  "name": "Cinematic Fantasy",
  "prompt": "cinematic lighting, fantasy art, dramatic composition, magical atmosphere, high quality, 4k"
}
```

### Era-Specific Styles

```json
{
  "name": "1980s Synthwave",
  "prompt": "1980s aesthetic, synthwave, neon colors, retro futuristic, vaporwave vibes"
}
```

### Medium-Specific

```json
{
  "name": "Concept Art",
  "prompt": "concept art, matte painting, detailed environment, professional illustration, game art"
}
```

## Common Issues

### Style Not Applied

**Problem:** Generated images don't match expected style

**Solutions:**
1. Check style was selected (not "No style")
2. Verify `styles.json` syntax is valid JSON
3. Ensure style prompt isn't conflicting with story prompts
4. Try more specific style instructions

### Inconsistent Results

**Problem:** Some images match style, others don't

**Solutions:**
1. Use reference image for consistency
2. Make style prompt more specific
3. Check for conflicting terms in style
4. Consider simpler, clearer style instructions

### Styles Disappearing

**Problem:** Custom styles removed from list

**Solutions:**
1. Check you haven't exceeded 20-style limit
2. Verify `styles.json` isn't corrupted
3. Make backup of custom styles
4. Check file permissions

## Style Backup

### Save Your Styles

```bash
# Backup current styles
cp styles.json styles_backup.json

# Restore from backup
cp styles_backup.json styles.json
```

### Version Control

Add to `.gitignore`:
```
# Keep default styles only
/styles.json

# Track backups separately if needed
```

## Examples by Use Case

### TikTok/Reels (Engaging, Dynamic)
```json
{ "name": "TikTok Style", "prompt": "vibrant colors, high contrast, dynamic composition, energetic, modern aesthetic" }
```

### YouTube Explainer (Clean, Professional)
```json
{ "name": "Explainer", "prompt": "clean, minimalist, professional lighting, modern, crisp, high quality" }
```

### Educational Content (Clear, Simple)
```json
{ "name": "Educational", "prompt": "clean illustration, simple composition, clear, educational, friendly colors" }
```

### Storytelling (Cinematic, Emotional)
```json
{ "name": "Story", "prompt": "cinematic, dramatic lighting, emotional atmosphere, film quality, immersive" }
```

## Next Steps

- [Quick Start](QUICK_START.md) - Generate your first video
- [Environment Guide](ENV_GUIDE.md) - Configure models
- [Performance Guide](PERFORMANCE.md) - Optimize generation speed
