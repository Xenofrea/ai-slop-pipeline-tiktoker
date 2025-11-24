import { FalBaseClient } from './fal-base-client';

export interface FluxInput extends Record<string, unknown> {
  prompt: string;
  image_size?: {
    width: number;
    height: number;
  };
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  image_url?: string;
  strength?: number;
}

export interface FluxOutput {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
}

export class FluxClient extends FalBaseClient {
  constructor(customApiKey?: string, useFreeModel: boolean = false) {
    const model = useFreeModel
      ? (process.env.FAL_IMAGE_MODEL_FREE || 'fal-ai/flux-lora')
      : (process.env.FAL_IMAGE_MODEL || 'fal-ai/flux/schnell');

    super(model, customApiKey);
    console.log(`🖼️  Using image model: ${model}${useFreeModel ? ' (FREE)' : ''}`);
  }

  async generateImage(prompt: string, savePath?: string, aspectRatio: '16:9' | '9:16' = '9:16', referenceImageUrl?: string, stylePrompt?: string): Promise<string> {
    // Add style instructions to prompt
    let finalPrompt = prompt;
    if (stylePrompt && stylePrompt.trim()) {
      finalPrompt = `${prompt}, ${stylePrompt}`;
    }

    // Determine image size based on aspect ratio
    const imageSize = aspectRatio === '16:9'
      ? { width: 1280, height: 720 }    // Horizontal
      : { width: 720, height: 1280 };   // Vertical

    console.log('\n🖼️  Generating image for video...');
    console.log('   Prompt:', finalPrompt.substring(0, 80) + '...');
    console.log('   📐 Format:', aspectRatio, `(${imageSize.width}x${imageSize.height})`);
    if (stylePrompt) {
      console.log('   🎨 Style:', stylePrompt);
    }
    if (referenceImageUrl) {
      console.log('   🖼️  Reference image:', referenceImageUrl);
    }

    const requestPayload: FluxInput = {
      prompt: finalPrompt,
      image_size: imageSize,
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: false,
    };

    // If reference image exists, add it to request
    if (referenceImageUrl) {
      requestPayload.image_url = referenceImageUrl;
      requestPayload.strength = 0.75; // Reference image influence strength (0-1)
    }

    const job = await this.submitJob(requestPayload);
    const result = await this.waitForCompletion(job.jobId) as unknown as FluxOutput;

    if (!result.images?.[0]?.url) {
      throw new Error('No image URL in result');
    }

    const imageUrl = result.images[0].url;
    console.log('   ✅ Image created:', imageUrl);

    // If save path specified, download image
    if (savePath) {
      const fs = await import('fs');
      const fetch = (await import('node-fetch')).default;

      console.log('   💾 Saving image:', savePath);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(savePath, imageBuffer);
      console.log('   ✅ Image saved:', savePath);
    }

    return imageUrl;
  }
}
