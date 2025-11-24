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
    // Оборачиваем в retry для устойчивости к ошибкам
    return await RetryHelper.retry(
      async () => {
        return await this.textGenerator.generateVideoPrompts(storyText, duration);
      },
      {
        maxAttempts: 3,
        delayMs: 2000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          console.log(`⚠️  Генерация промптов: попытка ${attempt}/3 не удалась`);
          console.log(`   Ошибка: ${error.message}`);
          console.log(`   🔄 Повторная попытка через ${2000 * Math.pow(2, attempt - 1)}мс...`);
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

    // Используем короткие сегменты для более динамичного видео
    // Veo3: 4s (самый короткий), Seedance: 5s (самый короткий)
    const segmentDuration = 4;
    const videoDuration = '4s';  // Будет автоматически адаптировано для Seedance в клиенте

    console.log(`\n⏱️  Длительность каждого видео: ${videoDuration}`);
    console.log(`🚀 ПАРАЛЛЕЛЬНАЯ генерация ${prompts.length} видео`);
    if (stylePrompt) {
      console.log(`🎨 Стиль изображений: ${stylePrompt}`);
    }

    // Если указан reference image, загружаем его один раз
    if (referenceImagePath) {
      try {
        this.referenceImageUrl = await ImageUploader.uploadImage(referenceImagePath);
        console.log('✅ Reference изображение готово к использованию');
      } catch (error) {
        console.error('❌ Ошибка загрузки reference изображения:', error);
        console.log('⚠️  Продолжаем без reference изображения');
        this.referenceImageUrl = null;
      }
    }

    // Счётчик завершённых видео для прогресса
    let completed = 0;

    // Создаём промисы для параллельной генерации всех видео
    const videoPromises: Promise<VideoGenerationResult>[] = prompts.map(async (prompt, i) => {
      const videoStartTime = Date.now();
      console.log(`\n🎬 Запуск генерации видео ${i + 1}/${prompts.length}...`);
      console.log(`📝 Промпт: ${prompt.substring(0, 80)}...`);

      // Оборачиваем в retry для устойчивости к ошибкам
      try {
        return await RetryHelper.retry(
          async () => {
            // Сначала генерируем изображение из промпта и сохраняем его
            const imagePath = this.session.getImagePath(i + 1);
            const imageUrl = await this.fluxClient.generateImage(
              prompt,
              imagePath,
              aspectRatio,
              this.referenceImageUrl || undefined,
              stylePrompt || undefined
            );

            // Затем генерируем видео из изображения
            const result = await this.veo3Client.generateVideo(
              prompt,
              imageUrl,
              videoDuration,
              aspectRatio
            );

            console.log(`✅ Видео ${i + 1} сгенерировано: ${result.videoUrl}`);

            // Сразу скачиваем видео после генерации
            const videoPath = this.session.getVideoPath(i + 1);
            await this.videoDownloader.downloadVideo(result.videoUrl, videoPath);
            console.log(`💾 Видео ${i + 1} сохранено: ${videoPath}`);

            // Обновляем прогресс
            completed++;
            if (onProgress) {
              onProgress(completed, prompts.length);
            }

            const videoTime = ((Date.now() - videoStartTime) / 1000).toFixed(1);
            console.log(`✅ Завершено ${completed}/${prompts.length} видео - ${videoTime}s`);

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
              console.log(`⚠️  Видео ${i + 1}: попытка ${attempt}/3 не удалась`);
              console.log(`   Ошибка: ${error.message}`);
              console.log(`   🔄 Повторная попытка через ${3000 * Math.pow(2, attempt - 1)}мс...`);
            },
          }
        );
      } catch (error) {
        // Логируем ошибку и возвращаем failed результат
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Видео ${i + 1} НЕ УДАЛОСЬ сгенерировать после всех попыток`);
        console.error(`   Ошибка: ${errorMessage}`);
        console.error(`   Промпт: ${prompt}`);
        console.log(`⚠️  Продолжаем с остальными видео...\n`);

        return {
          index: i,
          path: null,
          success: false,
          error: errorMessage,
          prompt,
        } as VideoGenerationResult;
      }
    });

    // Ждём завершения всех видео параллельно (даже если некоторые упали)
    console.log('\n⏳ Ожидание завершения всех видео...');
    const results = await Promise.all(videoPromises);

    // Сортируем по индексу чтобы сохранить порядок
    results.sort((a, b) => a.index - b.index);

    // Разделяем успешные и неудачные результаты
    const successfulResults = results.filter(r => r.success && r.path);
    const failedResults = results.filter(r => !r.success);

    const videoPaths = successfulResults.map(r => r.path!);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Отчёт о результатах
    console.log('\n' + '='.repeat(60));
    console.log('📊 РЕЗУЛЬТАТЫ ГЕНЕРАЦИИ ВИДЕО');
    console.log('='.repeat(60));
    console.log(`✅ Успешно: ${successfulResults.length}/${prompts.length} видео`);
    if (failedResults.length > 0) {
      console.log(`❌ Ошибки: ${failedResults.length}/${prompts.length} видео\n`);
      console.log('Проблемные промпты:');
      failedResults.forEach(f => {
        console.log(`  ${f.index + 1}. ${f.prompt?.substring(0, 60)}...`);
        console.log(`     Ошибка: ${f.error}\n`);
      });
    }
    console.log(`⏱️  Общее время: ${totalTime}s`);
    console.log('='.repeat(60) + '\n');

    // Если НИ ОДНО видео не сгенерировалось - пробрасываем ошибку
    if (videoPaths.length === 0) {
      throw new Error('Не удалось сгенерировать ни одного видео. Проверьте промпты и настройки API.');
    }

    // Если хотя бы одно видео есть - продолжаем
    if (failedResults.length > 0) {
      console.log(`⚠️  Продолжаем работу с ${videoPaths.length} успешными видео\n`);
    }

    return videoPaths;
  }

  async generateAudio(text: string, voiceId?: string): Promise<string> {
    const startTime = Date.now();

    // Устанавливаем голос если передан
    if (voiceId) {
      this.ttsClient.setVoiceId(voiceId);
    }

    // Оборачиваем в retry для устойчивости к ошибкам
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
          console.log(`⚠️  Генерация аудио: попытка ${attempt}/3 не удалась`);
          console.log(`   Ошибка: ${error.message}`);
          console.log(`   🔄 Повторная попытка через ${3000 * Math.pow(2, attempt - 1)}мс...`);
        },
      }
    );

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Время генерации аудио: ${totalTime}s`);

    // Возвращаем реальный путь к аудио файлу
    return result.audioPath;
  }


  async mergeVideos(videoPaths: string[]): Promise<string> {
    const startTime = Date.now();
    const result = await this.videoMerger.mergeVideos(videoPaths, this.session.getPaths().result);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Время склейки видео: ${totalTime}s`);
    // Возвращаем реальный путь к созданному файлу
    return result.outputPath;
  }

  async addAudioToVideo(videoPath: string, audioPath: string): Promise<string> {
    const startTime = Date.now();
    const finalPath = await this.videoMerger.addAudioToVideo(videoPath, audioPath, this.session.getPaths().result);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Время добавления аудио: ${totalTime}s`);
    // Возвращаем реальный путь к созданному файлу
    return finalPath;
  }

  async runComplete(storyText: string, description: string): Promise<string> {
    const workflowStartTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('🚀 ЗАПУСК ПОЛНОГО WORKFLOW');
    console.log('='.repeat(60));

    // 1. Генерация промптов для видео
    console.log('\n📝 Шаг 1: Генерация промптов для видео...');
    const prompts = await this.generateVideoPrompts(storyText);
    console.log(`✅ Создано ${prompts.length} промптов\n`);

    // 2. Генерация видео (с изображениями) - видео скачиваются автоматически
    console.log('\n🎬 Шаг 2: Генерация изображений и видео...');
    const videoPaths = await this.generateVideos(prompts);
    console.log(`✅ Сгенерировано и сохранено ${videoPaths.length} видео\n`);

    // 3. Генерация аудио
    console.log('\n🔊 Шаг 3: Генерация озвучки...');
    const audioPath = await this.generateAudio(storyText);
    console.log(`✅ Озвучка создана: ${audioPath}\n`);

    // 4. Склейка видео
    console.log('\n🎞️ Шаг 4: Склейка видео...');
    const mergedVideoPath = await this.mergeVideos(videoPaths);
    console.log(`✅ Видео склеено: ${mergedVideoPath}\n`);

    // 5. Добавление аудио
    console.log('\n🎵 Шаг 5: Добавление озвучки...');
    const finalVideoPath = await this.addAudioToVideo(mergedVideoPath, audioPath);
    console.log(`✅ Финальное видео: ${finalVideoPath}\n`);

    // 6. Сохранение метаданных
    this.session.saveMetadata({
      description,
      storyText,
      prompts,
      videoCount: videoPaths.length,
      finalVideo: finalVideoPath,
    });

    const totalWorkflowTime = ((Date.now() - workflowStartTime) / 1000).toFixed(1);

    console.log('='.repeat(60));
    console.log('🎉 WORKFLOW ЗАВЕРШЁН!');
    console.log('📁 Папка сессии:', this.session.getPaths().root);
    console.log('📁 Итоговое видео:', finalVideoPath);
    console.log(`⏱️  Общее время выполнения: ${totalWorkflowTime}s (${(parseFloat(totalWorkflowTime) / 60).toFixed(1)} мин)`);
    console.log('='.repeat(60) + '\n');

    return finalVideoPath;
  }

  getSession(): SessionManager {
    return this.session;
  }
}
