import fs from 'fs';
import path from 'path';

export interface SessionPaths {
  root: string;
  images: string;
  videos: string;
  audio: string;
  result: string;
}

export class SessionManager {
  private sessionId: string;
  private paths: SessionPaths;

  constructor(baseDir: string = './output') {
    // Создаём уникальный ID сессии на основе времени
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.sessionId = `session_${timestamp}`;

    // Создаём структуру папок
    const rootPath = path.join(baseDir, this.sessionId);

    this.paths = {
      root: rootPath,
      images: path.join(rootPath, 'images'),
      videos: path.join(rootPath, 'videos'),
      audio: path.join(rootPath, 'audio'),
      result: path.join(rootPath, 'result'),
    };

    // Создаём все папки
    this.createDirectories();

    console.log('\n📁 Создана сессия:', this.sessionId);
    console.log('   📂 Папка:', this.paths.root);
  }

  private createDirectories(): void {
    Object.values(this.paths).forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  getPaths(): SessionPaths {
    return this.paths;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getImagePath(index: number): string {
    return path.join(this.paths.images, `image_${index}.png`);
  }

  getVideoPath(index: number): string {
    return path.join(this.paths.videos, `video_${index}.mp4`);
  }

  getAudioPath(): string {
    return path.join(this.paths.audio, 'narration.mp3');
  }

  getMergedVideoPath(): string {
    return path.join(this.paths.result, 'merged_video.mp4');
  }

  getFinalVideoPath(): string {
    return path.join(this.paths.result, 'final_video.mp4');
  }

  getMetadataPath(): string {
    return path.join(this.paths.root, 'metadata.json');
  }

  saveMetadata(data: Record<string, unknown>): void {
    const metadata = {
      sessionId: this.sessionId,
      createdAt: new Date().toISOString(),
      ...data,
    };

    fs.writeFileSync(
      this.getMetadataPath(),
      JSON.stringify(metadata, null, 2)
    );

    console.log('💾 Метаданные сохранены:', this.getMetadataPath());
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 СВОДКА СЕССИИ');
    console.log('='.repeat(60));
    console.log('🆔 ID сессии:', this.sessionId);
    console.log('📂 Папка:', this.paths.root);
    console.log('\n📁 Структура:');
    console.log('   🖼️  Изображения:', this.paths.images);
    console.log('   🎬 Видео:', this.paths.videos);
    console.log('   🔊 Аудио:', this.paths.audio);
    console.log('   ✨ Результат:', this.paths.result);
    console.log('='.repeat(60) + '\n');
  }
}
