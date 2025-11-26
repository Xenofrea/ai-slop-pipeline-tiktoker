import { FalBaseClient } from './fal-base-client';

export interface Veo3Input {
  prompt: string;
  image_url: string;
  duration?: string;
  resolution?: string;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  generate_audio?: boolean;
}

export interface Veo3Output {
  video: {
    url: string;
  };
}

export interface Veo3Result {
  videoUrl: string;
  duration: string;
  debugData?: {
    requestPayload: any;
  };
}

export class Veo3Client extends FalBaseClient {
  private isSeedanceModel: boolean;
  private isHailuoModel: boolean;

  constructor(customApiKey?: string, useFreeModel: boolean = false) {
    const modelId = useFreeModel
      ? (process.env.FAL_VIDEO_MODEL_FREE || 'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video')
      : (process.env.FAL_VIDEO_MODEL || 'fal-ai/veo3.1/fast/image-to-video');

    super(modelId, customApiKey);
    this.isSeedanceModel = modelId.includes('seedance');
    this.isHailuoModel = modelId.includes('hailuo') || modelId.includes('minimax');
    console.log(`🎬 Using video model: ${modelId}${useFreeModel ? ' (FREE)' : ''}`);
  }


  async generateVideo(prompt: string, imageUrl: string, videoDuration?: '4s' | '5s' | '6s' | '8s', aspectRatio?: '16:9' | '9:16', userPrompt?: string): Promise<Veo3Result> {
    // Use the provided image URL directly

    // Default to 4s if not specified
    let duration: string = videoDuration || "4s";

    // Seedance model supports only 5s, 6s, 7s, 8s (minimum 5s)
    // Veo3 supports 4s, 6s, 8s (minimum 4s)
    // Hailuo supports only 6s, 10s
    if (this.isSeedanceModel) {
      // If 4s - use 5s (minimum for Seedance)
      if (duration === '4s') {
        duration = '5';
      } else {
        // Remove "s" for Seedance (e.g. "6s" -> "6")
        duration = duration.replace('s', '');
      }
    } else if (this.isHailuoModel) {
      // Hailuo supports only 6s or 10s
      if (duration === '8s') {
        duration = '10';
      } else {
        // Map everything else to 6s
        duration = '6';
      }
    }

    // Use userPrompt if provided, otherwise use the vision-generated prompt
    const finalPrompt = userPrompt || prompt;

    const requestPayload: any = {
      prompt: finalPrompt,
      image_url: imageUrl,
      duration,
    };

    // Add model-specific parameters
    if (!this.isSeedanceModel && !this.isHailuoModel) {
      // Veo3-specific parameters
      requestPayload.resolution = '720p';
      requestPayload.generate_audio = false;
      if (aspectRatio) {
        requestPayload.aspect_ratio = aspectRatio;
      }
    } else if (this.isHailuoModel) {
      // Hailuo supports aspect_ratio
      if (aspectRatio) {
        requestPayload.aspect_ratio = aspectRatio;
      }
    } else {
      // Seedance also supports aspect_ratio
      if (aspectRatio) {
        requestPayload.aspect_ratio = aspectRatio;
      }
    }

    // 🎬 VIDEO GENERATION REQUEST
    console.log('\n' + '='.repeat(60));
    console.log('🎬  VEO3 VIDEO GENERATION API CALL');
    console.log('='.repeat(60));
    console.log('📥 INPUT:');
    if (userPrompt) {
      console.log('   📝 User Prompt (USED):', userPrompt);
      console.log('   📝 Vision Prompt (IGNORED):', prompt?.substring(0, 100) + '...');
    } else {
      console.log('   📝 Vision Prompt (USED):', prompt);
    }
    console.log('   📝 Final Prompt Length:', finalPrompt?.length || 0, 'characters');
    console.log('   🖼️  Image URL:', imageUrl);
    console.log('   ⏱️  Duration:', duration);
    if (requestPayload.resolution) {
      console.log('   🎥 Resolution:', requestPayload.resolution);
    }
    if (requestPayload.generate_audio !== undefined) {
      console.log('   🔊 Generate Audio:', requestPayload.generate_audio);
    }
    const modelName = this.isHailuoModel ? 'Hailuo 2.3 (FREE)' :
                      this.isSeedanceModel ? 'Seedance (FREE)' :
                      'Veo 3.1';
    console.log('   🤖 Model:', modelName);
    console.log('   🔧 FULL REQUEST PAYLOAD:');
    console.log(JSON.stringify(requestPayload, null, 2));

    const job = await this.submitJob(requestPayload);

    const result = await this.waitForCompletion(job.jobId) as unknown as Veo3Output;

    // 📤 VIDEO GENERATION OUTPUT
    console.log('\n📤 OUTPUT:');
    console.log('   🎥 Video URL:', result.video?.url || 'N/A');
    console.log('   ⏱️  Generated Duration:', duration);
    console.log('   ✅ Success:', result.video?.url ? 'Yes' : 'No');
    console.log('   🔄 RAW API RESPONSE:');
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60) + '\n');

    if (!result.video?.url) {
      throw new Error('No video URL in result');
    }

    return {
      videoUrl: result.video.url,
      duration,
      debugData: {
        requestPayload: requestPayload
      }
    };
  }
}
