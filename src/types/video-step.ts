export interface VideoStep {
  index: number;
  prompt: string;
  imagePath: string | null;
  imageUrl: string | null;
  duration: number; // in seconds
  isGenerating: boolean;
  error: string | null;
}

export interface StepsReviewData {
  steps: VideoStep[];
  referenceImage: string | null;
  stylePrompt: string;
  aspectRatio: '16:9' | '9:16';
}
