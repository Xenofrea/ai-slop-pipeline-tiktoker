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
    // Create unique session ID based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.sessionId = `session_${timestamp}`;

    // Create folder structure
    const rootPath = path.join(baseDir, this.sessionId);

    this.paths = {
      root: rootPath,
      images: path.join(rootPath, 'images'),
      videos: path.join(rootPath, 'videos'),
      audio: path.join(rootPath, 'audio'),
      result: path.join(rootPath, 'result'),
    };

    // Create all folders
    this.createDirectories();

    console.log('\n📁 Session created:', this.sessionId);
    console.log('   📂 Folder:', this.paths.root);
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

    console.log('💾 Metadata saved:', this.getMetadataPath());
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SESSION SUMMARY');
    console.log('='.repeat(60));
    console.log('🆔 Session ID:', this.sessionId);
    console.log('📂 Folder:', this.paths.root);
    console.log('\n📁 Structure:');
    console.log('   🖼️  Images:', this.paths.images);
    console.log('   🎬 Videos:', this.paths.videos);
    console.log('   🔊 Audio:', this.paths.audio);
    console.log('   ✨ Result:', this.paths.result);
    console.log('='.repeat(60) + '\n');
  }
}
