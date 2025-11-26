// Pricing for different models (as of 2025)
export interface ModelPricing {
  video: {
    perSecond?: number;
    perVideo?: number;
  };
  image: {
    perImage: number;
  };
  audio: {
    perCharacter: number;
  };
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Video models
  'fal-ai/veo3': {
    video: { perSecond: 0.20 }, // $0.20/sec (audio off)
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/veo3/fast': {
    video: { perSecond: 0.25 },
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/veo3.1/fast/image-to-video': {
    video: { perSecond: 0.25 }, // $0.25/sec
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/veo3/fast/image-to-video': {
    video: { perSecond: 0.25 }, // $0.25/sec
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/bytedance/seedance/v1/lite/image-to-video': {
    video: { perVideo: 0.18 }, // $0.18 per 720p 5s video
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/bytedance/seedance/v1/pro/image-to-video': {
    video: { perVideo: 0.74 }, // $0.74 per 1080p 5s video
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/pixverse/v5': {
    video: { perVideo: 0.15 }, // $0.15-0.40 depending on resolution
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/luma-dream-machine/ray-2-flash/image-to-video': {
    video: { perVideo: 0.20 }, // $0.20 per 5s
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/cogvideox-5b/image-to-video': {
    video: { perVideo: 0.20 },
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },
  'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video': {
    video: { perVideo: 0.19 }, // $0.19 per 6s
    image: { perImage: 0 },
    audio: { perCharacter: 0 },
  },

  // Image models (Flux)
  'fal-ai/flux/dev': {
    video: { perVideo: 0 },
    image: { perImage: 0.025 }, // ~$0.025 per image
    audio: { perCharacter: 0 },
  },
  'fal-ai/flux/schnell': {
    video: { perVideo: 0 },
    image: { perImage: 0.003 }, // ~$0.003 per image
    audio: { perCharacter: 0 },
  },
  'fal-ai/flux-pro': {
    video: { perVideo: 0 },
    image: { perImage: 0.05 }, // ~$0.05 per image
    audio: { perCharacter: 0 },
  },

  // Audio models (ElevenLabs)
  'elevenlabs': {
    video: { perVideo: 0 },
    image: { perImage: 0 },
    audio: { perCharacter: 0.00003 }, // ~$0.30 per 1M characters
  },
};

export interface CostBreakdown {
  videoGeneration: number;
  imageGeneration: number;
  audioGeneration: number;
  total: number;
  details: {
    videos: {
      count: number;
      model: string;
      cost: number;
    };
    images: {
      count: number;
      model: string;
      cost: number;
    };
    audio: {
      characters: number;
      model: string;
      cost: number;
    };
  };
}

export class CostCalculator {
  private videoModel: string;
  private imageModel: string;
  private audioModel: string;

  private videoCount: number = 0;
  private imageCount: number = 0;
  private audioCharacters: number = 0;

  constructor(videoModel: string, imageModel: string, audioModel: string = 'elevenlabs') {
    this.videoModel = videoModel;
    this.imageModel = imageModel;
    this.audioModel = audioModel;
  }

  addVideo(count: number = 1) {
    this.videoCount += count;
  }

  addImage(count: number = 1) {
    this.imageCount += count;
  }

  addAudio(characters: number) {
    this.audioCharacters += characters;
  }

  calculateCost(): CostBreakdown {
    const videoPricing = MODEL_PRICING[this.videoModel]?.video || { perVideo: 0 };
    const imagePricing = MODEL_PRICING[this.imageModel]?.image || { perImage: 0 };
    const audioPricing = MODEL_PRICING[this.audioModel]?.audio || { perCharacter: 0 };

    // Calculate video cost
    let videoCost = 0;
    if (videoPricing.perVideo !== undefined) {
      videoCost = this.videoCount * videoPricing.perVideo;
    } else if (videoPricing.perSecond !== undefined) {
      // Assume 4s videos if per-second pricing (default video duration)
      videoCost = this.videoCount * 4 * videoPricing.perSecond;
    }

    // Calculate image cost
    const imageCost = this.imageCount * imagePricing.perImage;

    // Calculate audio cost
    const audioCost = this.audioCharacters * audioPricing.perCharacter;

    const total = videoCost + imageCost + audioCost;

    return {
      videoGeneration: videoCost,
      imageGeneration: imageCost,
      audioGeneration: audioCost,
      total,
      details: {
        videos: {
          count: this.videoCount,
          model: this.videoModel,
          cost: videoCost,
        },
        images: {
          count: this.imageCount,
          model: this.imageModel,
          cost: imageCost,
        },
        audio: {
          characters: this.audioCharacters,
          model: this.audioModel,
          cost: audioCost,
        },
      },
    };
  }

  printCostBreakdown() {
    const breakdown = this.calculateCost();

    console.log('\n' + '='.repeat(60));
    console.log('💰 COST BREAKDOWN');
    console.log('='.repeat(60));

    if (breakdown.details.images.count > 0) {
      console.log(`\n🖼️  Images (${breakdown.details.images.model}):`);
      console.log(`   Count: ${breakdown.details.images.count}`);
      console.log(`   Cost: $${breakdown.imageGeneration.toFixed(4)}`);
    }

    if (breakdown.details.videos.count > 0) {
      console.log(`\n🎬 Videos (${breakdown.details.videos.model}):`);
      console.log(`   Count: ${breakdown.details.videos.count}`);
      console.log(`   Cost: $${breakdown.videoGeneration.toFixed(4)}`);
    }

    if (breakdown.details.audio.characters > 0) {
      console.log(`\n🔊 Audio (${breakdown.details.audio.model}):`);
      console.log(`   Characters: ${breakdown.details.audio.characters}`);
      console.log(`   Cost: $${breakdown.audioGeneration.toFixed(4)}`);
    }

    console.log(`\n💵 TOTAL COST: $${breakdown.total.toFixed(4)}`);
    console.log('='.repeat(60) + '\n');
  }

  reset() {
    this.videoCount = 0;
    this.imageCount = 0;
    this.audioCharacters = 0;
  }
}
