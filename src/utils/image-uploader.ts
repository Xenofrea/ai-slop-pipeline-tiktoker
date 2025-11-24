import fs from 'fs';
import path from 'path';
import { fal } from '@fal-ai/client';

export class ImageUploader {
  /**
   * Загружает локальное изображение в FAL storage
   */
  static async uploadLocalImage(imagePath: string): Promise<string> {
    console.log('\n📤 Загрузка reference изображения...');
    console.log('   Файл:', imagePath);

    // Проверяем существование файла
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Файл не найден: ${imagePath}`);
    }

    // Проверяем расширение файла
    const ext = path.extname(imagePath).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Неподдерживаемый формат: ${ext}. Используйте: ${allowedExtensions.join(', ')}`);
    }

    // Читаем файл
    const imageBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([imageBuffer], { type: `image/${ext.slice(1)}` });
    const file = new File([blob], path.basename(imagePath), { type: blob.type });

    // Загружаем в FAL storage
    console.log('   Загрузка в FAL storage...');
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      throw new Error('FAL_API_KEY not configured');
    }

    fal.config({ credentials: apiKey });
    const url = await fal.storage.upload(file);

    console.log('   ✅ Изображение загружено:', url);
    console.log('   📊 Размер файла:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    return url;
  }

  /**
   * Проверяет, является ли строка URL
   */
  static isUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Загружает изображение (локальное или URL)
   */
  static async uploadImage(imagePathOrUrl: string): Promise<string> {
    if (this.isUrl(imagePathOrUrl)) {
      console.log('   🌐 Используется URL изображения:', imagePathOrUrl);
      return imagePathOrUrl;
    } else {
      // Разрешаем относительные пути
      const resolvedPath = path.resolve(imagePathOrUrl);
      return await this.uploadLocalImage(resolvedPath);
    }
  }
}
