import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export class VideoDownloader {
  async downloadVideo(url: string, outputPath: string, index?: number): Promise<string> {

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`💾 Скачивание видео ${index !== undefined ? `#${index + 1}` : ''}...`);
    console.log(`   URL: ${url.substring(0, 60)}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, videoBuffer);

    console.log(`✅ Видео сохранено: ${outputPath}`);
    console.log(`📊 Размер: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    return outputPath;
  }

  async downloadVideos(urls: string[], outputPaths: string[]): Promise<string[]> {
    console.log(`\n💾 Скачивание ${urls.length} видео...`);

    const paths: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const downloadedPath = await this.downloadVideo(urls[i], outputPaths[i], i);
      paths.push(downloadedPath);
    }

    console.log(`\n✅ Все видео скачаны (${paths.length} файлов)\n`);
    return paths;
  }
}
