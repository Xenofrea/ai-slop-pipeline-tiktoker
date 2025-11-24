import { TextGeneratorClient } from '../api/text-generator-client';
import { Veo3Client } from '../api/fal-veo3-client';
import { ElevenLabsTTSClient } from '../api/elevenlabs-client';
import { FluxClient } from '../api/flux-client';
import { VideoMerger } from '../utils/video-merger';
import { VideoDownloader } from '../utils/video-downloader';
import { SessionManager } from '../utils/session-manager';
import { ImageUploader } from '../utils/image-uploader';
import { RetryHelper } from '../utils/retry-helper';

interface VideoGenerationResult {
  index: number;
  path: string | null;
  success: boolean;
  error?: string;
  prompt?: string;
}

export class VideoGenerationWorkflow {
  private textGenerator: TextGeneratorClient;
  private veo3Client: Veo3Client;
  private ttsClient: ElevenLabsTTSClient;
  private fluxClient: FluxClient;
  private videoMerger: VideoMerger;
  private videoDownloader: VideoDownloader;
  private session: SessionManager;
  private referenceImageUrl: string | null = null;

  constructor(useFreeModels: boolean = false) {
    this.textGenerator = new TextGeneratorClient(useFreeModels);
    this.veo3Client = new Veo3Client(undefined, useFreeModels);
    this.ttsClient = new ElevenLabsTTSClient();
    this.fluxClient = new FluxClient(undefined, useFreeModels);
    this.videoMerger = new VideoMerger();
    this.videoDownloader = new VideoDownloader();
    this.session = new SessionManager();
    this.session.printSummary();
  }

  async generateVideoPrompts(storyText: string, duration: number = 60): Promise<string[]> {
    // Wrap in retry for error resilience
    return await RetryHelper.retry(
      async () => {
        return await this.textGenerator.generateVideoPrompts(storyText, duration);
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          console.log(`⚠️  Prompt generation: attempt ${attempt}/3 failed`);
          console.log(`   Error: ${error.message}`);
          console.log(`   🔄 Retrying in ${2000 * Math.pow(2, attempt - 1)}ms...`);
        },
      }
    );
  }

  async generateVideos(
    prompts: string[],
    duration: number = 60,
    aspectRatio: '16:9' | '9:16' = '9:16',
    referenceImagePath: string | null = null,
    stylePrompt: string = '',
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const startTime = Date.now();

    // Use short segments for more dynamic video
    // Veo3: 4s (shortest), Seedance: 5s (shortest)
    const segmentDuration = 4;
    const videoDuration = '4s';  // Will be automatically adapted for Seedance in client

    console.log(`\n⏱️  Video duration: ${videoDuration}`);
    console.log(`🚀 PARALLEL generation of ${prompts.length} videos`);
    if (stylePrompt) {
      console.log(`🎨 Image style: ${stylePrompt}`);
    }

    // If reference image specified, upload it once
    if (referenceImagePath) {
      try {
        this.referenceImageUrl = await ImageUploader.uploadImage(referenceImagePath);
        console.log('✅ Reference image ready to use');
      } catch (error) {
        console.error('❌ Reference image upload error:', error);
        console.log('⚠️  Continuing without reference image');
        this.referenceImageUrl = null;
      }
    }

    // Counter for completed videos (progress tracking)
    let completed = 0;

    // Create promises for parallel generation of all videos
    const videoPromises: Promise<VideoGenerationResult>[] = prompts.map(async (prompt, i) => {
      const videoStartTime = Date.now();
      console.log(`\n🎬 Starting video ${i + 1}/${prompts.length} generation...`);
      console.log(`📝 Prompt: ${prompt.substring(0, 80)}...`);

      // Wrap in retry for error resilience
      try {
        return await RetryHelper.retry(
          async () => {
            // First generate image from prompt and save it
            const imagePath = this.session.getImagePath(i + 1);
            const imageUrl = await this.fluxClient.generateImage(
              prompt,
              imagePath,
              aspectRatio,
              this.referenceImageUrl || undefined,
              stylePrompt || undefined
            );

            // Then generate video from image
            const result = await this.veo3Client.generateVideo(
              prompt,
              imageUrl,
              videoDuration,
              aspectRatio
            );

            console.log(`✅ Video ${i + 1} generated: ${result.videoUrl}`);

            // Download video immediately after generation
            const videoPath = this.session.getVideoPath(i + 1);
            await this.videoDownloader.downloadVideo(result.videoUrl, videoPath);
            console.log(`💾 Video ${i + 1} saved: ${videoPath}`);

            // Update progress
            completed++;
            if (onProgress) {
              onProgress(completed, prompts.length);
            }

            const videoTime = ((Date.now() - videoStartTime) / 1000).toFixed(1);
            console.log(`✅ Completed ${completed}/${prompts.length} videos - ${videoTime}s`);

            return {
              index: i,
              path: videoPath,
              success: true,
            } as VideoGenerationResult;
          },
          {
            maxAttempts: 3,
            delayMs: 3000,
            backoffMultiplier: 2,
            onRetry: (attempt, error) => {
              console.log(`⚠️  Video ${i + 1}: attempt ${attempt}/3 failed`);
              console.log(`   Error: ${error.message}`);
              console.log(`   🔄 Retrying in ${3000 * Math.pow(2, attempt - 1)}ms...`);
            },
          }
        );
      } catch (error) {
        // Log error and return failed result
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Video ${i + 1} FAILED to generate after all attempts`);
        console.error(`   Error: ${errorMessage}`);
        console.error(`   Prompt: ${prompt}`);
        console.log(`⚠️  Continuing with remaining videos...\n`);

        return {
          index: i,
          path: null,
          success: false,
          error: errorMessage,
          prompt,
        } as VideoGenerationResult;
      }
    });

    // Wait for all videos to complete in parallel (even if some fail)
    console.log('\n⏳ Waiting for all videos to complete...');
    const results = await Promise.all(videoPromises);

    // Sort by index to preserve order
    results.sort((a, b) => a.index - b.index);

    // Separate successful and failed results
    const successfulResults = results.filter(r => r.success && r.path);
    const failedResults = results.filter(r => !r.success);

    const videoPaths = successfulResults.map(r => r.path!);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Results report
    console.log('\n' + '='.repeat(60));
    console.log('📊 VIDEO GENERATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successfulResults.length}/${prompts.length} videos`);
    if (failedResults.length > 0) {
      console.log(`❌ Errors: ${failedResults.length}/${prompts.length} videos\n`);
      console.log('Problematic prompts:');
      failedResults.forEach(f => {
        console.log(`  ${f.index + 1}. ${f.prompt?.substring(0, 60)}...`);
        console.log(`     Error: ${f.error}\n`);
      });
    }
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log('='.repeat(60) + '\n');

    // If NO videos were generated - throw error
    if (videoPaths.length === 0) {
      throw new Error('Failed to generate any videos. Check prompts and API settings.');
    }

    // If at least one video exists - continue
    if (failedResults.length > 0) {
      console.log(`⚠️  Continuing with ${videoPaths.length} successful videos\n`);
    }

    return videoPaths;
  }

  async generateAudio(text: string, voiceId?: string): Promise<string> {
    const startTime = Date.now();

    // Set voice if provided
    if (voiceId) {
      this.ttsClient.setVoiceId(voiceId);
    }

    // Wrap in retry for error resilience
    const result = await RetryHelper.retry(
      async () => {
        const result = await this.ttsClient.generateSpeech(text, this.session.getPaths().audio);
        return result;
      },
      {
        maxAttempts: 3,
        delayMs: 3000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          console.log(`⚠️  Audio generation: attempt ${attempt}/3 failed`);
          console.log(`   Error: ${error.message}`);
          console.log(`   🔄 Retrying in ${3000 * Math.pow(2, attempt - 1)}ms...`);
        },
      }
    );

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Audio generation time: ${totalTime}s`);

    // Return actual audio file path
    return result.audioPath;
  }


  async mergeVideos(videoPaths: string[]): Promise<string> {
    const startTime = Date.now();
    const result = await this.videoMerger.mergeVideos(videoPaths, this.session.getPaths().result);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Video merging time: ${totalTime}s`);
    // Return actual created file path
    return result.outputPath;
  }

  async addAudioToVideo(videoPath: string, audioPath: string): Promise<string> {
    const startTime = Date.now();
    const finalPath = await this.videoMerger.addAudioToVideo(videoPath, audioPath, this.session.getPaths().result);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Audio addition time: ${totalTime}s`);
    // Return actual created file path
    return finalPath;
  }

  async runComplete(storyText: string, description: string): Promise<string> {
    const workflowStartTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('🚀 FULL WORKFLOW START');
    console.log('='.repeat(60));

    // 1. Generate video prompts
    console.log('\n📝 Step 1: Generating video prompts...');
    const prompts = await this.generateVideoPrompts(storyText);
    console.log(`✅ Created ${prompts.length} prompts\n`);

    // 2. Generate videos (with images) - videos downloaded automatically
    console.log('\n🎬 Step 2: Generating images and videos...');
    const videoPaths = await this.generateVideos(prompts);
    console.log(`✅ Generated and saved ${videoPaths.length} videos\n`);

    // 3. Generate audio
    console.log('\n🔊 Step 3: Generating narration...');
    const audioPath = await this.generateAudio(storyText);
    console.log(`✅ Narration created: ${audioPath}\n`);

    // 4. Merge videos
    console.log('\n🎞️ Step 4: Merging videos...');
    const mergedVideoPath = await this.mergeVideos(videoPaths);
    console.log(`✅ Videos merged: ${mergedVideoPath}\n`);

    // 5. Add audio
    console.log('\n🎵 Step 5: Adding narration...');
    const finalVideoPath = await this.addAudioToVideo(mergedVideoPath, audioPath);
    console.log(`✅ Final video: ${finalVideoPath}\n`);

    // 6. Save metadata
    this.session.saveMetadata({
      description,
      storyText,
      prompts,
      videoCount: videoPaths.length,
      finalVideo: finalVideoPath,
    });

    const totalWorkflowTime = ((Date.now() - workflowStartTime) / 1000).toFixed(1);

    console.log('='.repeat(60));
    console.log('🎉 WORKFLOW COMPLETE!');
    console.log('📁 Session folder:', this.session.getPaths().root);
    console.log('📁 Final video:', finalVideoPath);
    console.log(`⏱️  Total execution time: ${totalWorkflowTime}s (${(parseFloat(totalWorkflowTime) / 60).toFixed(1)} min)`);
    console.log('='.repeat(60) + '\n');

    return finalVideoPath;
  }

  getSession(): SessionManager {
    return this.session;
  }
}
