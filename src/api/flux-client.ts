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
    console.log(`🖼️  Используется модель изображений: ${model}${useFreeModel ? ' (FREE)' : ''}`);
  }

  async generateImage(prompt: string, savePath?: string, aspectRatio: '16:9' | '9:16' = '9:16', referenceImageUrl?: string, stylePrompt?: string): Promise<string> {
    // Добавляем стилевые инструкции к промпту
    let finalPrompt = prompt;
    if (stylePrompt && stylePrompt.trim()) {
      finalPrompt = `${prompt}, ${stylePrompt}`;
    }

    // Определяем размеры изображения в зависимости от aspect ratio
    const imageSize = aspectRatio === '16:9'
      ? { width: 1280, height: 720 }    // Горизонтальное
      : { width: 720, height: 1280 };   // Вертикальное

    console.log('\n🖼️  Генерация изображения для видео...');
    console.log('   Промпт:', finalPrompt.substring(0, 80) + '...');
    console.log('   📐 Формат:', aspectRatio, `(${imageSize.width}x${imageSize.height})`);
    if (stylePrompt) {
      console.log('   🎨 Стиль:', stylePrompt);
    }
    if (referenceImageUrl) {
      console.log('   🖼️  Reference изображение:', referenceImageUrl);
    }

    const requestPayload: FluxInput = {
      prompt: finalPrompt,
      image_size: imageSize,
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: false,
    };

    // Если есть reference изображение, добавляем его в запрос
    if (referenceImageUrl) {
      requestPayload.image_url = referenceImageUrl;
      requestPayload.strength = 0.75; // Сила влияния reference изображения (0-1)
    }

    const job = await this.submitJob(requestPayload);
    const result = await this.waitForCompletion(job.jobId) as unknown as FluxOutput;

    if (!result.images?.[0]?.url) {
      throw new Error('No image URL in result');
    }

    const imageUrl = result.images[0].url;
    console.log('   ✅ Изображение создано:', imageUrl);

    // Если указан путь для сохранения, скачиваем изображение
    if (savePath) {
      const fs = await import('fs');
      const fetch = (await import('node-fetch')).default;

      console.log('   💾 Сохранение изображения:', savePath);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(savePath, imageBuffer);
      console.log('   ✅ Изображение сохранено:', savePath);
    }

    return imageUrl;
  }
}
