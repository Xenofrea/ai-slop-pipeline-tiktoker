import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export interface VideoMergeResult {
  outputPath: string;
  duration: number;
}

export class VideoMerger {
  async mergeVideos(videoPaths: string[], outputDir: string = './output'): Promise<VideoMergeResult> {
    console.log('\n' + '='.repeat(60));
    console.log('🎬  СКЛЕЙКА ВИДЕО (FFmpeg)');
    console.log('='.repeat(60));
    console.log('📥 Количество видео:', videoPaths.length);

    if (videoPaths.length === 0) {
      throw new Error('No videos to merge');
    }

    // Создаём директорию для вывода, если её нет
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `merged_video_${Date.now()}.mp4`);

    // Создаём временный файл со списком видео для FFmpeg
    const listFilePath = path.join(outputDir, `filelist_${Date.now()}.txt`);
    const fileListContent = videoPaths.map(p => `file '${path.resolve(p)}'`).join('\n');
    fs.writeFileSync(listFilePath, fileListContent);

    console.log('\n📝 Список видео для склейки:');
    videoPaths.forEach((p, i) => {
      console.log(`  ${i + 1}. ${path.basename(p)}`);
    });

    console.log('\n🔄 Запуск FFmpeg...');

    return new Promise((resolve, reject) => {
      let totalDuration = 0;

      ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions([
          '-c', 'copy', // Копируем потоки без перекодирования (быстрее)
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('   FFmpeg команда:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`   Прогресс: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          // Удаляем временный файл списка
          fs.unlinkSync(listFilePath);

          const stats = fs.statSync(outputPath);
          console.log('\n✅ Видео склеено успешно!');
          console.log('📁 Выходной файл:', outputPath);
          console.log('📊 Размер файла:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
          console.log('='.repeat(60) + '\n');

          // Получаем длительность итогового видео
          ffmpeg.ffprobe(outputPath, (err, metadata) => {
            if (err) {
              console.warn('⚠️  Не удалось получить длительность:', err.message);
              totalDuration = videoPaths.length * 8; // Примерная оценка
            } else {
              totalDuration = metadata.format.duration || 0;
              console.log('⏱️  Общая длительность:', totalDuration.toFixed(1), 'секунд');
            }

            resolve({
              outputPath,
              duration: totalDuration,
            });
          });
        })
        .on('error', (err) => {
          // Удаляем временный файл списка в случае ошибки
          if (fs.existsSync(listFilePath)) {
            fs.unlinkSync(listFilePath);
          }

          console.error('❌ Ошибка FFmpeg:', err.message);
          console.log('='.repeat(60) + '\n');
          reject(err);
        })
        .run();
    });
  }

  async addAudioToVideo(videoPath: string, audioPath: string, outputDir: string = './output'): Promise<string> {
    console.log('\n' + '='.repeat(60));
    console.log('🎵  ДОБАВЛЕНИЕ АУДИО К ВИДЕО (FFmpeg)');
    console.log('='.repeat(60));
    console.log('📹 Видео:', path.basename(videoPath));
    console.log('🔊 Аудио:', path.basename(audioPath));

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `final_video_${Date.now()}.mp4`);

    console.log('\n🔄 Запуск FFmpeg...');

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'copy', // Копируем видео без перекодирования
          '-c:a', 'aac', // Конвертируем аудио в AAC
          '-b:a', '192k', // Битрейт аудио
          '-shortest', // Обрезать по самому короткому потоку
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('   FFmpeg команда:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`   Прогресс: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          const stats = fs.statSync(outputPath);
          console.log('\n✅ Аудио добавлено успешно!');
          console.log('📁 Выходной файл:', outputPath);
          console.log('📊 Размер файла:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
          console.log('='.repeat(60) + '\n');

          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ Ошибка FFmpeg:', err.message);
          console.log('='.repeat(60) + '\n');
          reject(err);
        })
        .run();
    });
  }
}
